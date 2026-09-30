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
    // Si la imagen era decorativa (alt vacío, el nombre ya está al lado),
    // el aviso también lo es; si no, se anuncia con el nombre del producto.
    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt ? `Imagen no disponible de ${alt}` : undefined}
        aria-hidden={alt ? undefined : true}
        className="flex h-full w-full items-center justify-center bg-sw-surface px-3 text-center text-sw-xs text-sw-muted"
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
