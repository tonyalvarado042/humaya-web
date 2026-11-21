/**
 * Lo que se ve en el dominio compartido del huésped cuando la dirección no
 * dice de qué hotel es.
 *
 * ── POR QUÉ EXISTE ESTA PANTALLA ────────────────────────────────────────
 * `guestexp.liderax10.com` sirve a TODOS los hoteles: ahí el hotel lo dice la
 * ruta (`/humaya/app`). Quien entre al dominio pelado, o con un código que no
 * existe, no puede ver el Home de otro hotel — sería mostrarle la marca y los
 * datos de alguien más.
 *
 * Y tampoco puede quedar en una pantalla en blanco. Un camino que termina sin
 * salida es un error aunque no muestre ningún error: se ve perfecto en la
 * consola y la persona igual se queda parada.
 */
export function FaltaElHotel({ codigo }: { codigo?: string | null }) {
  return (
    <main
      data-theme="guest"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 py-10 text-center text-text"
    >
      <span className="text-eyebrow text-gold">Hotel Experience</span>
      <h1 className="m-0 max-w-xl font-display text-3xl leading-tight font-medium">
        {codigo ? 'No encontramos ese hotel' : 'Falta el hotel en la dirección'}
      </h1>
      <p className="m-0 max-w-md text-base leading-relaxed text-muted">
        {codigo
          ? 'Revisá el enlace que te mandaron: puede estar incompleto o ser de otra temporada.'
          : 'Este enlace está a medias. Buscá el que te mandó tu hotel, por correo o en el código QR de la villa.'}
      </p>
      <p className="m-0 max-w-md text-sm leading-relaxed text-muted-soft">
        Si lo copiaste de un correo, probá tocarlo en vez de escribirlo a mano.
      </p>
    </main>
  );
}
