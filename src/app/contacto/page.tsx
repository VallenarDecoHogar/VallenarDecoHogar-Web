"use client";

export default function ContactoPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-b from-[var(--vn-cream)]/40 to-[var(--vn-warm-bg)]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 text-center">
          <p className="text-sm text-[var(--vn-brown-med)] mb-1">Estamos para ayudarte</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--vn-brown)]">
            Contacto
          </h1>
          <p className="text-[var(--vn-brown-med)] mt-3 max-w-2xl mx-auto">
            ¿Tienes dudas sobre un producto, tu pedido o necesitas una recomendación? Escríbenos y te responderemos a la brevedad.
          </p>
        </div>
      </section>

      {/* Contact methods + form */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--vn-brown)] mb-4">
                  Información de contacto
                </h2>
                <p className="text-sm text-[var(--vn-brown-med)] leading-relaxed">
                  Vallenar DecoHogar es una tienda online chilena dedicada a la importación y venta de productos de aromaterapia, esoterismo, inciensos y decoración sagrada desde India. Atendemos a todo Chile con envíos rápidos y seguros.
                </p>
              </div>

              <div className="space-y-3">
                <ContactItem
                  emoji="📧"
                  label="Email"
                  value="contacto@vallenardecohogar.cl"
                  href="mailto:contacto@vallenardecohogar.cl"
                />
                <ContactItem
                  emoji="💬"
                  label="WhatsApp"
                  value="+56 9 1234 5678"
                  href="https://wa.me/56912345678"
                />
                <ContactItem
                  emoji="📍"
                  label="Ubicación"
                  value="Vallenar, Región de Atacama, Chile"
                />
                <ContactItem
                  emoji="🕒"
                  label="Horario de atención"
                  value="Lunes a Viernes: 9:00 - 18:00 · Sábado: 10:00 - 14:00"
                />
              </div>

              <div className="bg-[var(--vn-cream)] rounded-lg p-5 border border-[var(--vn-cream)]">
                <h3 className="font-semibold text-[var(--vn-brown)] mb-2 flex items-center gap-2">
                  🚚 Información de envíos
                </h3>
                <ul className="text-sm text-[var(--vn-brown-med)] space-y-1.5 list-disc list-inside">
                  <li>Envío gratis en pedidos sobre <strong className="text-[var(--vn-brown)]">$50.000</strong></li>
                  <li>Despacho en 24-48 horas hábiles en Región Metropolitana</li>
                  <li>3-5 días hábiles para regiones</li>
                  <li>Devoluciones aceptadas hasta 7 días por defecto de fábrica</li>
                </ul>
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--vn-brown)] mb-4">
                Envíanos un mensaje
              </h2>
              <p className="text-sm text-[var(--vn-brown-med)] mb-6">
                Completa el formulario y te responderemos en menos de 24 horas hábiles.
              </p>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  alert("¡Mensaje enviado! Te contactaremos pronto.");
                  form.reset();
                }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--vn-brown)] mb-1">
                      Nombre *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full h-10 rounded-md border border-[var(--vn-brown-med)]/40 bg-[var(--vn-warm-bg)] px-3 text-sm focus:outline-none focus:border-[var(--vn-coral)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--vn-brown)] mb-1">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full h-10 rounded-md border border-[var(--vn-brown-med)]/40 bg-[var(--vn-warm-bg)] px-3 text-sm focus:outline-none focus:border-[var(--vn-coral)]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[var(--vn-brown)] mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full h-10 rounded-md border border-[var(--vn-brown-med)]/40 bg-[var(--vn-warm-bg)] px-3 text-sm focus:outline-none focus:border-[var(--vn-coral)]"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[var(--vn-brown)] mb-1">
                    Asunto *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full h-10 rounded-md border border-[var(--vn-brown-med)]/40 bg-[var(--vn-warm-bg)] px-3 text-sm focus:outline-none focus:border-[var(--vn-coral)]"
                  >
                    <option value="">Selecciona...</option>
                    <option value="consulta">Consulta sobre un producto</option>
                    <option value="pedido">Estado de mi pedido</option>
                    <option value="envio">Información de envío</option>
                    <option value="devolucion">Devolución o cambio</option>
                    <option value="mayorista">Compra mayorista</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[var(--vn-brown)] mb-1">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    className="w-full rounded-md border border-[var(--vn-brown-med)]/40 bg-[var(--vn-warm-bg)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--vn-coral)] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-md bg-[var(--vn-coral)] text-[var(--vn-warm-bg)] font-medium hover:bg-[var(--vn-coral-light)] transition-colors"
                >
                  Enviar mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-[var(--vn-cream)]/30 py-12 sm:py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--vn-brown)] text-center mb-8">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <FaqItem
              q="¿Cuánto demora el envío?"
              a="En Región Metropolitana el despacho es en 24-48 horas hábiles. Para regiones, entre 3 y 5 días hábiles. Los pedidos sobre $50.000 tienen envío gratis."
            />
            <FaqItem
              q="¿Los productos son originales?"
              a="Sí, todos nuestros productos son importados directamente desde India, garantizando autenticidad de marcas como Satya y Krishna."
            />
            <FaqItem
              q="¿Qué métodos de pago aceptan?"
              a="Aceptamos Webpay (Transbank) y Mercado Pago Chile. Ambas pasarelas procesan tarjetas de crédito y débito de forma segura."
            />
            <FaqItem
              q="¿Puedo devolver un producto?"
              a="Aceptamos devoluciones dentro de los primeros 7 días por defectos de fábrica. El producto debe estar en su estado original. Contáctanos para coordinar."
            />
            <FaqItem
              q="¿Hacen envíos a todo Chile?"
              a="Sí, enviamos a todo el territorio nacional, incluyendo zonas extremas. El costo de envío se calcula automáticamente en el checkout."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function ContactItem({
  emoji,
  label,
  value,
  href,
}: {
  emoji: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--vn-cream)]/50 transition-colors">
      <span className="text-2xl" aria-hidden>
        {emoji}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--vn-brown-med)] font-medium">
          {label}
        </p>
        <p className="text-sm font-medium text-[var(--vn-brown)]">{value}</p>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }
  return content;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group bg-card rounded-lg border border-border p-4">
      <summary className="cursor-pointer font-medium text-[var(--vn-brown)] list-none flex items-center justify-between">
        {q}
        <span className="text-[var(--vn-coral)] group-open:rotate-45 transition-transform text-xl">+</span>
      </summary>
      <p className="mt-3 text-sm text-[var(--vn-brown-med)] leading-relaxed">{a}</p>
    </details>
  );
}
