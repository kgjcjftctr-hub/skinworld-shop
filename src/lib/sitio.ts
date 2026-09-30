/**
 * Dirección canónica del sitio. La producción se sirve en el dominio con `www`
 * —el dominio sin `www` responde 308 y redirige—, así que todo lo que se
 * publique hacia afuera (URLs de retorno de pago, imágenes que ve Stripe,
 * enlaces canónicos, sitemap) debe construirse desde aquí y nunca desde la
 * cabecera Host, que la manda quien hace la petición.
 */
export const URL_SITIO = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.skinworld.shop').replace(
  /\/+$/,
  ''
);

const ORIGEN_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Origen con el que se arman las URLs de una petición. Sólo se respeta el
 * origen recibido cuando es una dirección local de desarrollo; en cualquier
 * otro caso se usa el dominio canónico, de modo que una cabecera Host falsa no
 * puede desviar al cliente ni colar imágenes ajenas en la página de pago.
 */
export function origenSeguro(request: Request): string {
  const origen = request.headers.get('origin') ?? '';
  if (ORIGEN_LOCAL.test(origen)) return origen;
  return URL_SITIO;
}
