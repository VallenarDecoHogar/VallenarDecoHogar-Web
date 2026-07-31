#!/usr/bin/env python3
"""Scrape every product page from Jimmy India and extract:
- name (from <title> or <h1>)
- price (CLP, integer)
- image URL (cdnx.jumpseller.com)
"""
import subprocess
import re
import json
import os
import time
import math

with open("/tmp/jimmy/all_urls.json") as f:
    all_urls = json.load(f)

products_data = []

for cat, urls in all_urls.items():
    print(f"\n=== {cat.upper()} ({len(urls)} productos) ===")
    for i, path in enumerate(urls):
        url = f"https://www.jimmyindia.net{path}"
        slug = path.replace("/product-page/", "")
        out = f"/tmp/jimmy/prod_{cat}_{i+1:02d}_{slug}.html"

        if not os.path.exists(out):
            subprocess.run([
                "curl", "-s", "-A",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                url, "-o", out
            ], check=True)
            time.sleep(0.6)  # be polite

        with open(out) as f:
            html = f.read()

        # 1. NAME — from <title> tag, extract the product name
        title_match = re.search(r'<title>([^<]+)</title>', html)
        name = title_match.group(1).strip() if title_match else slug
        # Clean common suffixes
        name = re.sub(r'\s*\|\s*Jimmy India.*$', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s*-\s*Jimmy India.*$', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s*-?\s*Importadora.*$', '', name, flags=re.IGNORECASE)
        name = name.strip()

        # 2. PRICE — Jumpseller uses meta tag or product price in HTML
        # Pattern: <meta property="product:price:amount" content="990">
        price_match = re.search(r'<meta\s+property="product:price:amount"\s+content="([^"]+)"', html)
        price = None
        if price_match:
            try:
                price = int(float(price_match.group(1).replace(",", ".")))
            except ValueError:
                pass

        # Fallback: look for $X.XXX or $XXXXX patterns
        if price is None:
            # Try product:price:amount without quotes
            price_match = re.search(r'product:price:amount["\s:=]+([0-9.,]+)', html)
            if price_match:
                try:
                    price = int(float(price_match.group(1).replace(",", ".")))
                except ValueError:
                    pass

        # Last fallback: look for typical CLP price patterns ($990, $1.990, $19.990, etc)
        if price is None:
            price_patterns = re.findall(r'\$\s*([0-9]{1,3}(?:\.[0-9]{3})+)', html)
            if price_patterns:
                try:
                    price = int(price_patterns[0].replace(".", ""))
                except ValueError:
                    pass

        # 3. IMAGE — cdnx.jumpseller.com URL
        img_pattern = re.compile(r'https://cdnx\.jumpseller\.com/jimmyindia/image/\d+/[^\s"\\<>\']+\.(?:jpg|jpeg|png|webp)')
        img_matches = list(dict.fromkeys(img_pattern.findall(html)))
        image = img_matches[0] if img_matches else None

        # 4. DESCRIPTION — meta description
        desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', html)
        description = desc_match.group(1).strip() if desc_match else ""
        description = re.sub(r'\s*-?\s*Importadora.*$', '', description, flags=re.IGNORECASE)
        description = re.sub(r'\s*Jimmy India.*$', '', description, flags=re.IGNORECASE)

        print(f"  [{i+1:02d}] {name}")
        print(f"      URL: {url}")
        print(f"      Precio: {price}")
        print(f"      Imagen: {image}")

        products_data.append({
            "category": cat,
            "name": name,
            "price_real": price,
            "image": image,
            "description": description,
            "supplier_url": url,
            "slug": slug,
        })

with open("/tmp/jimmy/all_products_raw.json", "w") as f:
    json.dump(products_data, f, indent=2, ensure_ascii=False)

print(f"\n\n=== SUMMARY: {len(products_data)} productos scrapeados ===")
without_price = [p for p in products_data if p["price_real"] is None]
without_image = [p for p in products_data if p["image"] is None]
print(f"Sin precio: {len(without_price)}")
for p in without_price:
    print(f"  - {p['name']} ({p['supplier_url']})")
print(f"Sin imagen: {len(without_image)}")
for p in without_image:
    print(f"  - {p['name']} ({p['supplier_url']})")
