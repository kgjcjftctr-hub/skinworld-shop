import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { avisarEtapaAlCliente, avisarGuiaAlCliente } from '@/lib/pedidos';
import { LISTA_DE_ESTADOS, transicionPermitida, type Estado } from '@/lib/estados-pedido';
import { ErrorDePedido, actualizarGuia, cambiarEstado, registrarCorreo } from '@/lib/pedidos-db';

const estado = z.enum(LISTA_DE_ESTADOS as [Estado, ...Estado[]]);
const texto = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

/**
 * `de` es la etapa que el panel estaba mostrando: si el pedido ya cambió (otra
 * pestaña, doble clic), la base rechaza el cambio en vez de repetirlo.
 */
const CambioDeEtapa = z.object({
  de: estado,
  a: estado,
  nota: texto(500),
  guia: texto(100),
});

const CambioDeGuia = z.object({ guia: z.string().trim().min(1).max(100) });

const ID_DE_PEDIDO = z.string().uuid();

/** Cambia la etapa de un pedido, lo deja en el historial y avisa al cliente. */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const cambio = CambioDeEtapa.safeParse(body);

  if (!ID_DE_PEDIDO.safeParse(id).success || !cambio.success) {
    return NextResponse.json({ error: 'Datos del cambio incompletos o no válidos' }, { status: 400 });
  }
  const { de, a, nota, guia } = cambio.data;
  if (!transicionPermitida(de, a)) {
    return NextResponse.json({ error: 'Ese cambio de etapa no está permitido' }, { status: 409 });
  }

  try {
    const pedido = await cambiarEstado({
      pedido: id,
      de,
      a,
      actor: 'tienda',
      nota,
      guia,
      guiaUrl: guia ? enlaceDeRastreo(guia) : null,
    });

    // El aviso al cliente no debe impedir que la etapa quede guardada.
    const aviso = await avisarEtapaAlCliente(pedido, a);
    if (aviso.motivo !== 'esta etapa no manda correo') {
      if (!aviso.enviado) console.warn('Aviso de etapa no enviado:', aviso.motivo);
      await registrarCorreo(pedido.id, a, aviso);
    }

    return NextResponse.json({ estado: a, avisoEnviado: aviso.enviado });
  } catch (err) {
    return respuestaDeError(err);
  }
}

/** Captura o corrige el número de guía sin cambiar la etapa. */
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  const cambio = CambioDeGuia.safeParse(await request.json().catch(() => null));
  if (!ID_DE_PEDIDO.safeParse(id).success || !cambio.success) {
    return NextResponse.json({ error: 'Escribe el número de guía' }, { status: 400 });
  }

  try {
    const guia = cambio.data.guia;
    const pedido = await actualizarGuia(id, guia, enlaceDeRastreo(guia), 'tienda');
    // Si el paquete ya salió, el cliente necesita la guía nueva.
    let avisoEnviado = false;
    if (pedido.status === 'shipped') {
      const aviso = await avisarGuiaAlCliente(pedido);
      await registrarCorreo(pedido.id, 'guia', aviso);
      avisoEnviado = aviso.enviado;
    }
    return NextResponse.json({ guia: pedido.tracking, avisoEnviado });
  } catch (err) {
    return respuestaDeError(err);
  }
}

function respuestaDeError(err: unknown) {
  if (err instanceof ErrorDePedido) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error('No se pudo cambiar el pedido:', err);
  return NextResponse.json({ error: 'No se pudo guardar el cambio' }, { status: 500 });
}

/**
 * Página de rastreo, deducida del formato de la guía. Sólo se arma cuando el
 * formato es reconocible; si no, el correo muestra el número sin enlace, que es
 * preferible a mandar al cliente a una página equivocada.
 */
function enlaceDeRastreo(guia: string): string | null {
  const limpia = guia.replace(/\s|-/g, '');
  if (/^\d{12}$/.test(limpia)) return `https://www.fedex.com/fedextrack/?trknbr=${limpia}`;
  if (/^1Z[0-9A-Z]{16}$/i.test(limpia)) return `https://www.ups.com/track?tracknum=${limpia}`;
  if (/^\d{10}$/.test(limpia)) return `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${limpia}`;
  return null;
}
