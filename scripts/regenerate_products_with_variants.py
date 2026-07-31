#!/usr/bin/env python3
"""Regenerate products.ts adding:
- originalPrice: precio real de Jimmy India (sin markup)
- variants: variantes por producto (tamaño, pack, etc.)
- price/oldPrice se siguen calculando con markup 150%/75% como defaults
"""
import json
import math
import re

# Load current scraped data
with open("/tmp/jimmy/all_products_raw.json") as f:
    products = json.load(f)


def clean_name(name: str) -> str:
    """Remove ' | Jimmyindia' and similar suffixes from product name."""
    name = re.split(r'\s*[\|]\s*', name)[0]
    name = re.split(r'\s+-\s+Jimmyindia', name, flags=re.IGNORECASE)[0]
    name = re.split(r'\s+\|\s+Santiago', name, flags=re.IGNORECASE)[0]
    name = re.split(r'\s+\|\s+Chile', name, flags=re.IGNORECASE)[0]
    name = re.split(r'\s+\|\s+Feng', name, flags=re.IGNORECASE)[0]
    name = re.split(r'\s+\|\s+Deco', name, flags=re.IGNORECASE)[0]
    name = re.split(r'\s+\|\s+Aromaterapia', name, flags=re.IGNORECASE)[0]
    name = re.split(r'\s+\|\s+Krishna', name, flags=re.IGNORECASE)[0]
    name = name.strip(' -|')
    return name.strip()


def apply_markup_and_round(price: int, low_markup_pct: int = 150, high_markup_pct: int = 75, threshold: int = 100000) -> tuple[int, int]:
    """Apply markup and round up to nice values.
    Returns (final_price, old_price_for_strikethrough).
    """
    if price < threshold:
        marked = price * (1 + low_markup_pct / 100)
    else:
        marked = price * (1 + high_markup_pct / 100)

    # Round UP
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

    # Old price (display only, +25% extra for the strikethrough badge)
    old = rounded * 1.25
    if old < 10000:
        old_rounded = math.ceil(old / 100) * 100
    elif old < 50000:
        old_rounded = math.ceil(old / 500) * 500
    elif old < 100000:
        old_rounded = math.ceil(old / 1000) * 1000
    else:
        old_rounded = math.ceil(old / 5000) * 5000

    return rounded, old_rounded


# Variant templates per category
def get_variants(category: str, slug: str) -> list:
    """Return list of variants {name, price_multiplier}."""
    if category == "aromaterapia":
        # Aceites: 15ml default, 30ml x1.8, 50ml x2.8
        return [
            {"name": "15 ml", "priceMultiplier": 1.0},
            {"name": "30 ml", "priceMultiplier": 1.8},
            {"name": "50 ml", "priceMultiplier": 2.8},
        ]
    if category == "esoterismo":
        # Velas: unidad, pack 6, pack 12
        return [
            {"name": "Unidad", "priceMultiplier": 1.0},
            {"name": "Pack 6 unidades", "priceMultiplier": 5.0},
            {"name": "Pack 12 unidades", "priceMultiplier": 9.5},
        ]
    if category == "incienso":
        # Inciensos: caja 15gr, caja 50gr, granel 100gr
        return [
            {"name": "Caja 15 gr", "priceMultiplier": 1.0},
            {"name": "Caja 50 gr", "priceMultiplier": 3.0},
            {"name": "Granel 100 gr", "priceMultiplier": 5.5},
        ]
    # Decoración: la mayoría sin variantes (return null para indicar "único")
    return []


def get_aroma_from_name(name: str, slug: str = "") -> str:
    name = clean_name(name)
    name = re.sub(r'^aceites?\s+arom[aá]tic[oa]s?\s+', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^aceite\s+esencial\s+', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^aceite\s+', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+krishna\s*', ' ', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+\d+\s*ml\.?\s*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+para\s+difusor\s*$', '', name, flags=re.IGNORECASE)
    name = name.strip(' |-')
    if name:
        name = name[0].upper() + name[1:]
    return name.strip()


def generate_description(name: str, category: str, slug: str = "") -> str:
    name_clean = clean_name(name)

    if category == "aromaterapia":
        aroma = get_aroma_from_name(name, slug)
        if not aroma or len(aroma) < 3:
            aroma = slug.replace("aceite-esencial-krishna-", "").replace("-15ml", "").replace("-", " ").title()
            if not aroma:
                aroma = "este aceite"
        return f"Aceite aromático Krishna de {aroma}, frasco de 15 ml con gotero dosificador. Aroma concentrado y duradero, ideal para difusores, baños energéticos, meditación y unción de velas. Cada aroma tiene propiedades únicas: relajar, energizar, proteger o atraer abundancia. Importado directamente desde India con la garantía de calidad de Jimmy India."

    if category == "decoracion":
        return f"Hermosa pieza decorativa: {name_clean}. Hecha a mano por artesanos indios con materiales de alta calidad. Ideal para armonizar tus espacios, altares, salas o zonas de meditación. Elemento Feng Shui cargado de simbolismo sagrado y energía protectora. Marca Jimmy India, importadora con años de trayectoria en el mercado chileno."

    if category == "esoterismo":
        return f"Vela ritualística {name_clean.lower()}, elaborada con cera premium de alta combustión. Diseñada para trabajos espirituales, rituales e intenciones específicas según su forma simbólica. Enciéndela con propósito claro y visualiza tu deseo mientras arde. Importada y distribuida por Jimmy India en Chile, con garantía de calidad."

    if category == "incienso":
        return f"Incienso {name_clean.lower()}, caja de 15 gramos con varillas premium de combustión lenta. Aroma sagrado ideal para meditación, yoga, limpieza energética del hogar y crear ambiente espiritual. Marca original Satya o Krishna, importada directamente desde India. Combustión uniforme y fragrance persistente."

    return name_clean


# Manual name corrections (from previous iteration)
name_overrides = {
    "aceite-esencial-krishna-limon-15ml": "Aceites aromáticos Limón 15 ml",
    "aceite-esencial-krishna-reina-de-la-noche": "Aceite aromático Reina de la Noche",
    "nag-champa": "Incienso Nag Champa Satya 15 gr",
}

# Manual description corrections
desc_overrides = {
    "aceite-esencial-krishna-limon-15ml": "Aceite aromático Krishna de Limón, frasco de 15 ml con gotero dosificador. Aroma concentrado y duradero, ideal para difusores, baños energéticos, meditación y unción de velas. Cada aroma tiene propiedades únicas: relajar, energizar, proteger o atraer abundancia. Importado directamente desde India con la garantía de calidad de Jimmy India.",
    "aceite-esencial-krishna-reina-de-la-noche": "Aceite aromático Krishna de Reina de la Noche, frasco de 15 ml con gotero dosificador. Aroma concentrado y duradero, ideal para difusores, baños energéticos, meditación y unción de velas. Cada aroma tiene propiedades únicas: relajar, energizar, proteger o atraer abundancia. Importado directamente desde India con la garantía de calidad de Jimmy India.",
}

category_label_map = {
    "aromaterapia": "Aromaterapia",
    "decoracion": "Decoración",
    "esoterismo": "Esoterismo",
    "incienso": "Incienso",
}

featured_slugs = {
    "aromaterapia": "aceite-esencial-krishna-ruda-15ml",
    "decoracion": "colgante-de-ganesh-c-flor-de-loto-45cm",
    "esoterismo": "vela-gallina-negra",
    "incienso": "nag-champa",
}


lines = []
lines.append('export type ProductVariant = {')
lines.append('  name: string;')
lines.append('  priceMultiplier: number;')
lines.append('};')
lines.append('')
lines.append('export type Product = {')
lines.append('  id: string;')
lines.append('  name: string;')
lines.append('  category: "Aromaterapia" | "Decoración" | "Esoterismo" | "Incienso";')
lines.append('  originalPrice: number;  // Precio real de Jimmy India (CLP)')
lines.append('  price: number;          // Precio con markup por defecto (150% si < $100k, 75% si >= $100k)')
lines.append('  oldPrice?: number;      // Precio anterior para mostrar tachado')
lines.append('  rating: number;')
lines.append('  reviews: number;')
lines.append('  image: string;')
lines.append('  description: string;')
lines.append('  features: string[];')
lines.append('  supplierUrl: string;')
lines.append('  stock: number;')
lines.append('  featured?: boolean;')
lines.append('  variants?: ProductVariant[];  // Si no se define, el producto es "único"')
lines.append('};')
lines.append('')
lines.append('// Productos reales de Jimmy India (https://www.jimmyindia.net/)')
lines.append('// Precios en CLP. originalPrice = precio real del proveedor.')
lines.append('// price = originalPrice + markup (150% si < $100.000, 75% si >= $100.000), redondeado hacia arriba.')
lines.append('// El admin panel permite cambiar los markups dinámicamente (se recalcula en vivo).')
lines.append('export const products: Product[] = [')

# Default markup settings (these will be editable via admin panel)
DEFAULT_LOW_MARKUP = 150
DEFAULT_HIGH_MARKUP = 75
DEFAULT_THRESHOLD = 100000

counter = 1
for p in products:
    slug = p["slug"]
    cat_label = category_label_map[p["category"]]
    name = name_overrides.get(slug, clean_name(p["name"]))
    original_price = p["price_real"]
    final_price, old_price = apply_markup_and_round(
        original_price,
        low_markup_pct=DEFAULT_LOW_MARKUP,
        high_markup_pct=DEFAULT_HIGH_MARKUP,
        threshold=DEFAULT_THRESHOLD,
    )
    image = p["image"]
    supplier_url = p["supplier_url"]
    description = desc_overrides.get(slug, generate_description(p["name"], p["category"], slug))

    # Features per category
    if p["category"] == "aromaterapia":
        features = [
            "Aceite aromático Krishna de 15 ml",
            "Gotero dosificador preciso",
            "Para difusores, baños y velas",
            "Aroma concentrado y duradero",
            "Importado desde India",
        ]
    elif p["category"] == "decoracion":
        features = [
            "Pieza artesanal importada desde India",
            "Hecha a mano por artesanos locales",
            "Decoración Feng Shui cargada de simbolismo",
            "Material durable de alta calidad",
            "Marca Jimmy India",
        ]
    elif p["category"] == "esoterismo":
        features = [
            "Vela ritual con figura simbólica",
            "Cera premium de alta combustión",
            "Para trabajos espirituales e intenciones",
            "Tamaño artesanal",
            "Hecha en Chile por Jimmy India",
        ]
    else:  # incienso
        features = [
            "Incienso original Satya / Krishna",
            "Caja de 15 gr (12 varillas aprox)",
            "Combustión lenta y uniforme",
            "Para meditación, yoga y limpieza",
            "Marca original importada desde India",
        ]

    is_featured = slug in featured_slugs.get(p["category"], "")
    slug_hash = sum(ord(c) for c in slug)
    rating = round(4.3 + (slug_hash % 7) * 0.1, 1)
    reviews = 80 + (slug_hash % 600)
    stock = 20 + (slug_hash % 150)

    # Variants
    variants = get_variants(p["category"], slug)

    lines.append('  {')
    lines.append(f'    id: "p{counter}",')
    name_escaped = name.replace('"', '\\"')
    lines.append(f'    name: "{name_escaped}",')
    lines.append(f'    category: "{cat_label}",')
    lines.append(f'    originalPrice: {original_price},')
    lines.append(f'    price: {final_price},')
    lines.append(f'    oldPrice: {old_price},')
    lines.append(f'    rating: {rating},')
    lines.append(f'    reviews: {reviews},')
    lines.append(f'    image: "{image}",')
    desc_escaped = description.replace('"', '\\"').replace('\n', ' ').strip()
    lines.append(f'    description: "{desc_escaped}",')
    lines.append('    features: [')
    for f in features:
        f_escaped = f.replace('"', '\\"')
        lines.append(f'      "{f_escaped}",')
    lines.append('    ],')
    lines.append(f'    supplierUrl: "{supplier_url}",')
    lines.append(f'    stock: {stock},')
    if is_featured:
        lines.append(f'    featured: true,')
    if variants:
        lines.append('    variants: [')
        for v in variants:
            v_name = v["name"].replace('"', '\\"')
            lines.append(f'      {{ name: "{v_name}", priceMultiplier: {v["priceMultiplier"]} }},')
        lines.append('    ],')
    lines.append('  },')
    counter += 1

lines.append('];')
lines.append('')
lines.append('export const categories = [')
lines.append('  "Todos",')
lines.append('  "Aromaterapia",')
lines.append('  "Decoración",')
lines.append('  "Esoterismo",')
lines.append('  "Incienso",')
lines.append('] as const;')
lines.append('')
lines.append('// Configuración por defecto de markups (editable desde el panel de administración)')
lines.append('export const DEFAULT_MARKUP_SETTINGS = {')
lines.append(f'  lowMarkup: {DEFAULT_LOW_MARKUP},      // % aplicado a productos con precio < threshold')
lines.append(f'  highMarkup: {DEFAULT_HIGH_MARKUP},    // % aplicado a productos con precio >= threshold')
lines.append(f'  threshold: {DEFAULT_THRESHOLD},     // Umbral en CLP')
lines.append('} as const;')
lines.append('')
lines.append('// Helper para formatear precios en CLP (pesos chilenos, sin decimales)')
lines.append('export function formatCLP(value: number): string {')
lines.append('  return new Intl.NumberFormat("es-CL", {')
lines.append('    style: "currency",')
lines.append('    currency: "CLP",')
lines.append('    maximumFractionDigits: 0,')
lines.append('  }).format(value);')
lines.append('}')
lines.append('')
lines.append('// Helper para aplicar markup dinámicamente y redondear hacia arriba')
lines.append('// Usado por el admin panel para recalcular precios cuando cambian los markups')
lines.append('export function applyMarkup(')
lines.append('  originalPrice: number,')
lines.append('  settings: { lowMarkup: number; highMarkup: number; threshold: number },')
lines.append('): { price: number; oldPrice: number } {')
lines.append('  const markup = originalPrice < settings.threshold ? settings.lowMarkup : settings.highMarkup;')
lines.append('  const marked = originalPrice * (1 + markup / 100);')
lines.append('  // Redondeo hacia arriba a múltiplos limpios según magnitud')
lines.append('  let rounded: number;')
lines.append('  if (marked < 2000) rounded = Math.ceil(marked / 50) * 50;')
lines.append('  else if (marked < 10000) rounded = Math.ceil(marked / 100) * 100;')
lines.append('  else if (marked < 50000) rounded = Math.ceil(marked / 500) * 500;')
lines.append('  else if (marked < 100000) rounded = Math.ceil(marked / 1000) * 1000;')
lines.append('  else rounded = Math.ceil(marked / 5000) * 5000;')
lines.append('  // Old price para mostrar tachado (+25% extra)')
lines.append('  const old = rounded * 1.25;')
lines.append('  let oldRounded: number;')
lines.append('  if (old < 10000) oldRounded = Math.ceil(old / 100) * 100;')
lines.append('  else if (old < 50000) oldRounded = Math.ceil(old / 500) * 500;')
lines.append('  else if (old < 100000) oldRounded = Math.ceil(old / 1000) * 1000;')
lines.append('  else oldRounded = Math.ceil(old / 5000) * 5000;')
lines.append('  return { price: rounded, oldPrice: oldRounded };')
lines.append('}')
lines.append('')

with open('/home/z/my-project/src/lib/products.ts', 'w') as f:
    f.write('\n'.join(lines))

# Generate the same data as a list for the Excel generator
excel_data = []
counter = 1
for p in products:
    slug = p["slug"]
    name = name_overrides.get(slug, clean_name(p["name"]))
    original_price = p["price_real"]
    final_price, old_price = apply_markup_and_round(original_price)
    is_featured = slug in featured_slugs.get(p["category"], "")
    markup_pct = 150 if original_price < 100000 else 75
    marked_raw = original_price * (1 + markup_pct / 100)

    excel_data.append({
        "id": f"p{counter}",
        "category": category_label_map[p["category"]],
        "name": name,
        "original_price": original_price,
        "markup_pct": markup_pct,
        "marked_raw": round(marked_raw),
        "final_price": final_price,
        "old_price": old_price,
        "profit_per_unit": final_price - original_price,
        "stock": 20 + (sum(ord(c) for c in slug) % 150),
        "featured": "Sí" if is_featured else "No",
        "supplier_url": p["supplier_url"],
        "image": p["image"],
    })
    counter += 1

# Save data for Excel generation
with open("/tmp/jimmy/excel_data.json", "w") as f:
    json.dump(excel_data, f, indent=2, ensure_ascii=False)

print(f"=== Generated products.ts with {counter-1} products ===")
print(f"  - originalPrice added")
print(f"  - variants added per category (aromaterapia, esoterismo, incienso)")
print(f"  - applyMarkup() helper exported for dynamic recalculation")
print(f"  - DEFAULT_MARKUP_SETTINGS exported")
print()
print(f"=== Excel data saved to /tmp/jimmy/excel_data.json ===")
print(f"  - {len(excel_data)} products ready for Excel generation")
