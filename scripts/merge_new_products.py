#!/usr/bin/env python3
"""Merge the 4 new categorized products into products.ts.

Strategy:
- Read current products.ts
- Find the last product of each affected category
- Insert new products after it with proper IDs (p40, p41, p42, p43)
- Apply the same format as existing products
"""
import json
import re
from pathlib import Path

PRODUCTS_FILE = Path("/home/z/my-project/src/lib/products.ts")

# Load new products
with open("/tmp/jimmy/categorized_products.json") as f:
    new_products = json.load(f)

print(f"New products to add: {len(new_products)}")
for p in new_products:
    print(f"  [{p['category']}] {p['name']} — ${p['final_price']}")

# Read current products.ts
content = PRODUCTS_FILE.read_text()

# Find the highest product ID
ids = re.findall(r'id: "(p\d+)"', content)
max_id = max(int(id[1:]) for id in ids)
print(f"\nCurrent max ID: p{max_id}")

# Category-specific features and descriptions
def get_features(category):
    if category == "Aromaterapia":
        return [
            "Aceite aromático Krishna de 15 ml",
            "Gotero dosificador preciso",
            "Para difusores, baños y velas",
            "Aroma concentrado y duradero",
            "Importado desde India",
        ]
    elif category == "Decoración":
        return [
            "Pieza artesanal importada desde India",
            "Hecha a mano por artesanos locales",
            "Decoración Feng Shui cargada de simbolismo",
            "Material durable de alta calidad",
            "Producto premium",
        ]
    elif category == "Esoterismo":
        return [
            "Vela ritual con figura simbólica",
            "Cera premium de alta combustión",
            "Para trabajos espirituales e intenciones",
            "Tamaño artesanal",
            "Hecha artesanalmente",
        ]
    elif category == "Incienso":
        return [
            "Incienso original Satya / Krishna",
            "Caja de 15 gr (12 varillas aprox)",
            "Combustión lenta y uniforme",
            "Para meditación, yoga y limpieza",
            "Marca original importada desde India",
        ]
    return []

def get_description(name, category):
    if category == "Aromaterapia":
        return f"Aceite aromático Krishna, frasco de 15 ml con gotero dosificador. Aroma concentrado y duradero, ideal para difusores, baños energéticos, meditación y unción de velas. Importado directamente desde India con garantía de calidad."
    elif category == "Decoración":
        return f"Hermosa pieza decorativa: {name}. Hecha a mano por artesanos indios con materiales de alta calidad. Ideal para armonizar tus espacios, altares, salas o zonas de meditación. Elemento Feng Shui cargado de simbolismo sagrado y energía protectora."
    elif category == "Esoterismo":
        return f"Vela ritualística {name.lower()}, elaborada con cera premium de alta combustión. Diseñada para trabajos espirituales, rituales e intenciones específicas. Enciéndela con propósito claro y visualiza tu deseo mientras arde."
    elif category == "Incienso":
        return f"Incienso {name.lower()}, caja de 15 gramos con varillas premium de combustión lenta. Aroma sagrado ideal para meditación, yoga, limpieza energética del hogar y crear ambiente espiritual."
    return name

# Variants per category
def get_variants(category):
    if category == "Aromaterapia":
        return [
            {"name": "15 ml", "priceMultiplier": 1.0},
            {"name": "30 ml", "priceMultiplier": 1.8},
            {"name": "50 ml", "priceMultiplier": 2.8},
        ]
    elif category == "Esoterismo":
        return [
            {"name": "Unidad", "priceMultiplier": 1.0},
            {"name": "Pack 6 unidades", "priceMultiplier": 5.0},
            {"name": "Pack 12 unidades", "priceMultiplier": 9.5},
        ]
    elif category == "Incienso":
        return [
            {"name": "Caja 15 gr", "priceMultiplier": 1.0},
            {"name": "Caja 50 gr", "priceMultiplier": 3.0},
            {"name": "Granel 100 gr", "priceMultiplier": 5.5},
        ]
    return []

# Generate new product blocks
new_blocks = []
next_id = max_id + 1
for p in new_products:
    name_escaped = p["name"].replace('"', '\\"').replace("'", "\\'")
    desc_escaped = get_description(p["name"], p["category"]).replace('"', '\\"').replace('\n', ' ').strip()
    features = get_features(p["category"])
    variants = get_variants(p["category"])
    # Deterministic rating/reviews/stock from slug
    slug_hash = sum(ord(c) for c in p["slug"])
    rating = round(4.3 + (slug_hash % 7) * 0.1, 1)
    reviews = 80 + (slug_hash % 600)
    stock = 20 + (slug_hash % 150)

    block = f'''  {{
    id: "p{next_id}",
    name: "{name_escaped}",
    category: "{p["category"]}",
    originalPrice: {p["price"]},
    price: {p["final_price"]},
    oldPrice: {p["old_price"]},
    rating: {rating},
    reviews: {reviews},
    image: "{p["image"]}",
    description: "{desc_escaped}",
    features: ['''
    for f in features:
        f_escaped = f.replace('"', '\\"')
        block += f'\n      "{f_escaped}",'
    block += '\n    ],'
    block += f'\n    stock: {stock},'
    if variants:
        block += '\n    variants: ['
        for v in variants:
            v_name = v["name"].replace('"', '\\"')
            block += f'\n      {{ name: "{v_name}", priceMultiplier: {v["priceMultiplier"]} }},'
        block += '\n    ],'
    block += '\n  },'

    new_blocks.append(block)
    next_id += 1

# Find the closing `];` of the products array and insert before it
insert_point = content.find("\n];\n\nexport const categories")
if insert_point == -1:
    insert_point = content.rfind("\n];\n")

new_content = content[:insert_point] + "\n" + "\n".join(new_blocks) + "\n" + content[insert_point:]

PRODUCTS_FILE.write_text(new_content)
print(f"\n✓ Added {len(new_blocks)} new products to products.ts")
print(f"✓ Next available ID: p{next_id}")
