import Link from "next/link";

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="font-medium mb-3 text-sm text-[var(--vn-warm-bg)]">{title}</p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-[var(--vn-cream)]/70 hover:text-[var(--vn-coral-light)] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PaymentBadge({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="inline-flex flex-col items-center justify-center rounded-md border border-[var(--vn-cream)]/30 bg-[var(--vn-warm-bg)]/10 backdrop-blur px-3 py-1.5">
      <span className="font-semibold leading-tight text-[var(--vn-warm-bg)] text-xs">{label}</span>
      {sub && (
        <span className="text-[9px] leading-tight text-[var(--vn-cream)]/60 uppercase tracking-wider">
          {sub}
        </span>
      )}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[var(--vn-brown)] mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/logo-vallenar.png"
                alt="Vallenar DecoHogar"
                className="h-9 w-9 rounded-full object-cover ring-1 ring-[var(--vn-coral)]/40"
              />
              <span className="text-lg font-semibold text-[var(--vn-warm-bg)]">Vallenar DecoHogar</span>
            </div>
            <p className="text-sm text-[var(--vn-cream)]/70 max-w-xs">
              Aromaterapia, esoterismo, inciensos y decoración sagrada importada desde India para tu hogar en Chile.
            </p>
          </div>
          <FooterCol
            title="Catálogo"
            links={[
              { label: "Aromaterapia", href: "/catalogo/aromaterapia" },
              { label: "Decoración", href: "/catalogo/decoracion" },
              { label: "Esoterismo", href: "/catalogo/esoterismo" },
              { label: "Incienso", href: "/catalogo/incienso" },
            ]}
          />
          <FooterCol
            title="Soporte"
            links={[
              { label: "Centro de ayuda", href: "/contacto" },
              { label: "Envíos", href: "/contacto" },
              { label: "Devoluciones", href: "/contacto" },
              { label: "Garantía", href: "/contacto" },
            ]}
          />
          <FooterCol
            title="Empresa"
            links={[
              { label: "Sobre nosotros", href: "/" },
              { label: "Contacto", href: "/contacto" },
              { label: "Términos", href: "/" },
              { label: "Privacidad", href: "/" },
            ]}
          />
        </div>

        <div className="mb-6 flex flex-col gap-3 border-t border-[var(--vn-cream)]/20 pt-6">
          <p className="text-xs uppercase tracking-wider text-[var(--vn-cream)]/50 font-medium">
            Métodos de pago
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <PaymentBadge label="Webpay" sub="Transbank" />
            <PaymentBadge label="Mercado Pago" sub="Chile" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--vn-cream)]/70">
          <p>© 2026 Vallenar DecoHogar. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-[var(--vn-coral-light)]">Política de privacidad</Link>
            <Link href="/" className="hover:text-[var(--vn-coral-light)]">Cookies</Link>
            <Link href="/" className="hover:text-[var(--vn-coral-light)]">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
