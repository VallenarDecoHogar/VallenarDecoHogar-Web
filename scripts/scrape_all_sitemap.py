#!/usr/bin/env python3
"""Scrape ALL 455 products from Jimmy India sitemap.

For each product:
1. Fetch the HTML with curl (parallel batches)
2. Extract: name, price, image, category (from breadcrumb/meta)
3. Skip products already in our catalog (by image ID)
4. Apply markup 150%/75% + round up
5. Categorize: aromaterapia, decoracion, esoterismo, incienso, or "otros"

Output: /tmp/jimmy/all_products_final.json
"""
import subprocess
import re
import json
import os
import time
import math
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

OUTPUT_DIR = Path("/tmp/jimmy")
OUTPUT_DIR.mkdir(exist_ok=True)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# Load existing image IDs to skip duplicates
with open('/home/z/my-project/src/lib/products.ts') as f:
    existing_content = f.read()
existing_image_ids = set(re.findall(r'cdnx\.jumpseller\.com/jimmyindia/image/(\d+)/', existing_content))
print(f"Existing image IDs to skip: {len(existing_image_ids)}")

# Load all sitemap URLs
with open('/tmp/jimmy/all_sitemap_urls.txt') as f:
    all_urls = [line.strip() for line in f if line.strip()]
print(f"Total URLs to process: {len(all_urls)}")


def fetch_product(url):
    """Fetch a single product page and extract data."""
    slug = url.split('/product-page/')[-1]
    out = OUTPUT_DIR / f"all_{slug}.html"

    if not out.exists():
        try:
            subprocess.run(
                ["curl", "-s", "-A", USER_AGENT, url, "-o", str(out)],
                capture_output=True, timeout=15
            )
        except Exception:
            return None

    if not out.exists() or out.stat().st_size < 500:
        return None

    html = out.read_text(encoding="utf-8", errors="ignore")

    # Skip if product unavailable
    if "Producto no disponible" in html or "404" in html[:500]:
        return None

    # Name
    title_match = re.search(r'<title>([^<]+)</title>', html)
    name = title_match.group(1).strip() if title_match else slug
    name = re.split(r'\s*[\|]\s*', name)[0]
    name = re.split(r'\s+-\s+Jimmyindia', name, flags=re.IGNORECASE)[0]
    name = name.strip(' -|')

    # Price
    price = None
    price_match = re.search(r'<meta\s+property="product:price:amount"\s+content="([^"]+)"', html)
    if price_match:
        try:
            price = int(float(price_match.group(1).replace(",", ".")))
        except ValueError:
            pass
    if price is None:
        price_patterns = re.findall(r'\$\s*([0-9]{1,3}(?:\.[0-9]{3})+)', html)
        if price_patterns:
            try:
                price = int(price_patterns[0].replace(".", ""))
            except ValueError:
                pass

    # Image
    img_pattern = re.compile(r'https://cdnx\.jumpseller\.com/jimmyindia/image/\d+/[^\s"\\<>\']+\.(?:jpg|jpeg|png|webp)')
    img_matches = list(dict.fromkeys(img_pattern.findall(html)))
    image = img_matches[0] if img_matches else None

    # Category detection from breadcrumb or URL
    category = "otros"
    html_lower = html.lower()
    slug_lower = slug.lower()

    # Check by breadcrumb
    if 'aromaterapia' in html_lower or 'aceite' in slug_lower or 'aromat' in slug_lower:
        category = "aromaterapia"
    elif 'decoracion' in html_lower or 'deco' in slug_lower:
        category = "decoracion"
    elif 'esoterismo' in html_lower or 'vela' in slug_lower or 'ritual' in slug_lower:
        category = "esoterismo"
    elif 'incienso' in html_lower or 'satya' in slug_lower or 'nag-champa' in slug_lower or 'krishna' in slug_lower and 'tubo' in slug_lower:
        category = "incienso"

    # More specific: check breadcrumb links
    breadcrumb_match = re.findall(r'href="(/[a-z-]+)"[^>]*>([^<]+)</a>', html)
    for href, text in breadcrumb_match:
        if 'aromaterapia' in href:
            category = "aromaterapia"
            break
        elif 'decoracion' in href:
            category = "decoracion"
            break
        elif 'esoterismo' in href:
            category = "esoterismo"
            break
        elif 'incienso' in href:
            category = "incienso"
            break

    # Check image ID to skip existing
    img_id_match = re.search(r'jimmyindia/image/(\d+)/', image or '')
    if img_id_match and img_id_match.group(1) in existing_image_ids:
        return None  # Skip, already in catalog

    if price and image:
        return {
            "name": name,
            "price": price,
            "image": image,
            "url": url,
            "slug": slug,
            "category": category,
        }
    return None


# Process in parallel batches
results = []
processed = 0
skipped = 0

print("\nFetching products in parallel (10 at a time)...")
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(fetch_product, url): url for url in all_urls}
    for future in as_completed(futures):
        processed += 1
        result = future.result()
        if result:
            results.append(result)
            print(f"  [{processed}/{len(all_urls)}] NEW: {result['name'][:50]} — ${result['price']} ({result['category']})")
        else:
            skipped += 1
            if processed % 50 == 0:
                print(f"  [{processed}/{len(all_urls)}] Processed... (skipped so far: {skipped})")

# Save results
output_file = OUTPUT_DIR / "all_products_final.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

# Summary by category
from collections import Counter
cat_counts = Counter(r["category"] for r in results)
print(f"\n{'='*60}")
print(f"TOTAL new products: {len(results)}")
print(f"Skipped (already in catalog or no data): {skipped}")
print(f"\nBy category:")
for cat, count in cat_counts.most_common():
    print(f"  {cat}: {count}")
print(f"\nSaved to: {output_file}")
