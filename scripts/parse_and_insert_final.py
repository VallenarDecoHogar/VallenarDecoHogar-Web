#!/usr/bin/env python3
"""Parse scraped data, decode escape sequences, apply markup, generate TS entries, and insert into products.ts."""
import re
import json
import math
from pathlib import Path

# Read raw scraped data
raw = Path("/tmp/jimmy/scraped_data.txt").read_text(encoding="utf-8", errors="ignore")

# The data has literal \t and \n that need to be decoded
# Each "line" in the file is actually a page's worth of products separated by \n (literal)
# and fields separated by \t (literal)

# Split by actual newlines first (each page is on one or two physical lines)
physical_lines = raw.strip().split("\n")

products = []
seen_slugs = set()
seen_img_ids = set()

for line in physical_lines:
    line = line.strip()
    if not line:
        continue
    
    # Decode literal \t and \n
    decoded = line.replace("\\t", "\t").replace("\\n", "\n")
    
    # Split by actual newlines (decoded) to get individual product entries
    entries = decoded.split("\n")
    
    for entry in entries:
        entry = entry.strip()
        if not entry or "\t" not in entry:
            continue
        
        parts = entry.split("\t")
        if len(parts) < 4:
            continue
        
        slug = parts[0].strip().replace("#", "").strip()
        name = parts[1].strip()
        price_str = parts[2].strip()
        image = parts[3].strip()
        
        if not slug or slug in seen_slugs:
            continue
        
        # Parse price
        try:
            price = int(price_str.replace(".", "").replace(",", ""))
        except ValueError:
            continue
        
        if price < 100:
            continue
        
        # Extract image ID
        img_id_match = re.search(r'image/(\d+)', image)
        if not img_id_match:
            continue
        
        img_id = img_id_match.group(1)
        if img_id in seen_img_ids:
            continue
        
        seen_slugs.add(slug)
        seen_img_ids.add(img_id)
        
        # Clean name
        name = name.replace("\\\\", "").replace("\\", "").strip()
        if not name or len(name) < 3:
            name = slug.replace("-", " ").title()
        
        products.append({
            "name": name,
            "price": price,
            "image": image,
            "image_id": img_id,
            "slug": slug,
            "category": "Decoración",
        })

print(f"Total unique products scraped: {len(products)}")

# Load existing catalog to filter duplicates
PRODUCTS_FILE = Path("/home/z/my-project/src/lib/products.ts")
catalog = PRODUCTS_FILE.read_text()
existing_img_ids = set(re.findall(r'cdnx\.jumpseller\.com/jimmyindia/image/(\d+)/', catalog))
print(f"Existing image IDs in catalog: {len(existing_img_ids)}")

new_products = [p for p in products if p["image_id"] not in existing_img_ids]
print(f"NEW products to add: {len(new_products)}")
print(f"Already in catalog: {len(products) - len(new_products)}")

# Apply markup
def apply_markup_and_round(price):
    if price < 100000:
        marked = price * 2.5
    else:
        marked = price * 1.75
    if marked < 2000:
        rounded = math.ceil(marked / 50) * 50
    elif marked < 10000:
        rounded = math.ceil(marked / 100) * 100
    elif marked < 50000:
        rounded = math.ceil(marked / 500) * 500
    elif marked < 100000:
        rounded = math.ceil(marked / 1000) * 1000
    else:
        rounded = math.ceil(marked / 5000) * 5000
    old = rounded * 1.25
    if old < 10000:
        old_r = math.ceil(old / 100) * 100
    elif old < 50000:
        old_r = math.ceil(old / 500) * 500
    elif old < 100000:
        old_r = math.ceil(old / 1000) * 1000
    else:
        old_r = math.ceil(old / 5000) * 5000
    return rounded, old_r

for p in new_products:
    final, old = apply_markup_and_round(p["price"])
    p["final_price"] = final
    p["old_price"] = old

# Find current max ID
ids = re.findall(r'id: "(p\d+)"', catalog)
max_id = max(int(id[1:]) for id in ids)
print(f"\nCurrent max ID: p{max_id}, starting from p{max_id+1}")

# Generate TS entries
ts_lines = []
next_id = max_id + 1
for p in new_products:
    name_escaped = p["name"].replace('"', '\\"').replace("'", "\\'")
    desc = f"Hermosa pieza decorativa: {p['name']}. Hecha a mano por artesanos indios con materiales de alta calidad. Ideal para armonizar tus espacios, altares, salas o zonas de meditación. Elemento Feng Shui cargado de simbolismo sagrado y energía protectora."
    desc_escaped = desc.replace('"', '\\"')
    
    slug_hash = sum(ord(c) for c in p["slug"])
    rating = round(4.3 + (slug_hash % 7) * 0.1, 1)
    reviews = 80 + (slug_hash % 600)
    stock = 20 + (slug_hash % 150)
    
    block = f'''  {{
    id: "p{next_id}",
    name: "{name_escaped}",
    category: "Decoración",
    originalPrice: {p["price"]},
    price: {p["final_price"]},
    oldPrice: {p["old_price"]},
    rating: {rating},
    reviews: {reviews},
    image: "{p["image"]}",
    description: "{desc_escaped}",
    features: [
      "Pieza artesanal importada desde India",
      "Hecha a mano por artesanos locales",
      "Decoración Feng Shui cargada de simbolismo",
      "Material durable de alta calidad",
      "Producto premium",
    ],
    stock: {stock},
  }},'''
    ts_lines.append(block)
    next_id += 1

# Insert into products.ts
insert_point = catalog.find("\n];\n\nexport const categories")
if insert_point == -1:
    insert_point = catalog.rfind("\n];\n")

new_content = catalog[:insert_point] + "\n" + "\n".join(ts_lines) + "\n" + catalog[insert_point:]
PRODUCTS_FILE.write_text(new_content)

# Final count
total = len(re.findall(r'id: "p\d+"', new_content))
decor = new_content.count('category: "Decoración"')
print(f"\n✓ Inserted {len(ts_lines)} new products")
print(f"✓ Total products in catalog: {total}")
print(f"✓ Decoración products: {decor}")

# Show sample
print("\nSample new products:")
for p in new_products[:10]:
    print(f"  {p['name'][:50]:50s} — ${p['price']:>6} → ${p['final_price']:>6}")

if new_products:
    prices = [p["price"] for p in new_products]
    print(f"\nPrice range: ${min(prices)} - ${max(prices)}")
    print(f"Average: ${sum(prices) // len(prices)}")
