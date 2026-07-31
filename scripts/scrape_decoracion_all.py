#!/usr/bin/env python3
"""Scrape ALL products from Jimmy India decoracion pages 2-15.

For each product page, extract:
- name (from <title>)
- price (from meta product:price:amount)
- image (from cdnx.jumpseller.com)

Output: /tmp/jimmy/decoracion_new_products.json
"""
import subprocess
import re
import json
import os
import time
from pathlib import Path

OUTPUT_DIR = Path("/tmp/jimmy")
OUTPUT_DIR.mkdir(exist_ok=True)

BASE_URL = "https://www.jimmyindia.net/decoracion"
PAGES = list(range(2, 16))  # pages 2-15

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

all_products = []
seen_urls = set()

for page_num in PAGES:
    url = f"{BASE_URL}?page={page_num}"
    print(f"\n=== Page {page_num}: {url} ===")

    out = OUTPUT_DIR / f"decoracion_page_{page_num}.html"
    result = subprocess.run(
        ["curl", "-s", "-A", USER_AGENT, url, "-o", str(out)],
        capture_output=True, text=True
    )
    time.sleep(0.8)  # be polite

    if not out.exists() or out.stat().st_size < 1000:
        print(f"  [!] Failed to fetch page {page_num}")
        continue

    html = out.read_text(encoding="utf-8", errors="ignore")

    # Find all product URLs on this page
    # Pattern: /product-page/slug
    product_paths = re.findall(r'href="(/product-page/[^"]+)"', html)
    # Deduplicate preserving order
    unique_paths = []
    for p in product_paths:
        if p not in seen_urls:
            seen_urls.add(p)
            unique_paths.append(p)

    print(f"  Found {len(unique_paths)} new product URLs on this page")

    # For each product URL, fetch the product page and extract data
    for i, path in enumerate(unique_paths):
        full_url = f"https://www.jimmyindia.net{path}"
        slug = path.replace("/product-page/", "")
        product_out = OUTPUT_DIR / f"decoracion_p{page_num}_{i+1:02d}_{slug}.html"

        if not product_out.exists():
            subprocess.run(
                ["curl", "-s", "-A", USER_AGENT, full_url, "-o", str(product_out)],
                capture_output=True, text=True
            )
            time.sleep(0.5)

        if not product_out.exists() or product_out.stat().st_size < 500:
            continue

        phtml = product_out.read_text(encoding="utf-8", errors="ignore")

        # Extract name from <title>
        title_match = re.search(r'<title>([^<]+)</title>', phtml)
        name = title_match.group(1).strip() if title_match else slug
        # Clean name
        name = re.split(r'\s*[\|]\s*', name)[0]
        name = re.split(r'\s+-\s+Jimmyindia', name, flags=re.IGNORECASE)[0]
        name = name.strip(' -|')

        # Extract price from meta tag
        price = None
        price_match = re.search(r'<meta\s+property="product:price:amount"\s+content="([^"]+)"', phtml)
        if price_match:
            try:
                price = int(float(price_match.group(1).replace(",", ".")))
            except ValueError:
                pass

        # Fallback: look for $X.XXX patterns
        if price is None:
            price_patterns = re.findall(r'\$\s*([0-9]{1,3}(?:\.[0-9]{3})+)', phtml)
            if price_patterns:
                try:
                    price = int(price_patterns[0].replace(".", ""))
                except ValueError:
                    pass

        # Extract image
        img_pattern = re.compile(r'https://cdnx\.jumpseller\.com/jimmyindia/image/\d+/[^\s"\\<>\']+\.(?:jpg|jpeg|png|webp)')
        img_matches = list(dict.fromkeys(img_pattern.findall(phtml)))
        image = img_matches[0] if img_matches else None

        if price and image:
            all_products.append({
                "name": name,
                "price": price,
                "image": image,
                "url": full_url,
                "slug": slug,
                "category": "decoracion",
            })
            print(f"  [{i+1:02d}] {name[:50]} — ${price}")
        else:
            print(f"  [{i+1:02d}] SKIP (no price or image): {name[:40]}")

# Save results
output_file = OUTPUT_DIR / "decoracion_new_products.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(all_products, f, indent=2, ensure_ascii=False)

print(f"\n{'='*60}")
print(f"TOTAL new products scraped: {len(all_products)}")
print(f"Saved to: {output_file}")
