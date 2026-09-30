'use client';

import { useState } from 'react';

/**
 * Imagen de producto con respaldo accesible. Cuando la dirección de la imagen
 * falla —varias del catálogo apuntan a sitios externos— se muestra un aviso
 * legible en lugar del icono roto del navegador, y se anuncia a los lectores de
 * pantalla en vez de dejar un hueco mudo.
 */
export function ImagenProducto({
  src,
  alt,
  className,
  prioritaria = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  prioritaria?: boolean;
}) {
  const [fallo, setFallo] = useState(false);

  if (!src || fallo) {
    return (
      <div
        role="img"
        aria-label={`Imagen no disponible de ${alt}`}
        className="flex h-full w-full items-center justify-center bg-slate-100 px-3 text-center text-xs text-slate-400"
      >
        Imagen no disponible
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={prioritaria ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      onError={() => setFallo(true)}
    />
  );
}
