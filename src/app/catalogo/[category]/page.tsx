import { notFound } from "next/navigation";
import type { Metadata } from "next";

const CATEGORY_META: Record<
  string,
  { label: string; emoji: string; accent: string; subtitle: string; description: string }
> = {
  aromaterapia: {
    label: "Aromaterapia",
    emoji: "🌿",
    accent: "var(--vn-sage)",
    subtitle: "Aceites esenciales Krishna para cuerpo, mente y espíritu",
    description:
      "Descubre nuestra colección de aceites aromáticos Krishna, ideales para difusores, baños energéticos, meditación y unción de velas. Cada aroma tiene una propiedad única: relajar, energizar, proteger o atraer abundancia. Importados directamente desde India con garantía de calidad.",
  },
  decoracion: {
    label: "Decoración",
    emoji: "🪷",
    accent: "var(--vn-tan)",
    subtitle: "Piezas artesanales para armonizar tus espacios",
    description:
      "Colgantes, campanas de viento y elementos Feng Shui traídos directamente desde India. Cada pieza es tallada a mano por artesanos locales y cargada con simbolismo sagrado: Ganesh para remover obstáculos, Om para la conexión universal, elefantes para la sabiduría.",
  },
  esoterismo: {
    label: "Esoterismo",
    emoji: "🕯️",
    accent: "var(--vn-coral)",
    subtitle: "Velas rituales para tus prácticas espirituales",
    description:
      "Velas ritualísticas en formas simbólicas para trabajar intenciones específicas: gallina negra para protección, Buda para paz interior, espiga para abundancia, ataúd para cortar energías. Cada vela está elaborada con cera premium y cargada con propósito.",
  },
  incienso: {
    label: "Incienso",
    emoji: "🪔",
    accent: "var(--vn-brown-med)",
    subtitle: "Inciensos Satya originales desde India",
    description:
      "El aclamado incienso Satya Nag Champa y otras fragancias sagradas: Palo Santo para limpieza, Lavanda para relajación, Sándalo para meditación. Cada caja trae 15 gr de varillas premium de combustión lenta.",
  },
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_META).map((slug) => ({ category: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_META[category];
  if (!cat) return {};
  return {
    title: `${cat.label} — ${cat.subtitle}`,
    description: cat.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = CATEGORY_META[category];
  if (!cat) notFound();

  // Lazy import to keep this server component slim
  const { CategoryView } = await import("@/components/site/category-view");
  return <CategoryView category={category} meta={cat} />;
}
