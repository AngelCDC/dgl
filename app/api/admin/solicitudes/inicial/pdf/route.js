import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import SolicitudLevantamientoProcuraPDF from '../../../../../components/SolicitudLevantamientoProcuraPDF';
import { solicitudProcuraSimpleSchema } from '../../../../../lib/schemas/solicitud-levantamiento-procura';

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const data = await request.json();
    const validatedData = solicitudProcuraSimpleSchema.parse(data);

    const empresaBase = validatedData.cliente?.razonSocial || String(Date.now());

    const empresa = empresaBase
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');

    const buffer = await renderToBuffer(
      createElement(SolicitudLevantamientoProcuraPDF, { data: validatedData })
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="levantamiento-procura-${empresa}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generando PDF inicial:', error);

    if (error.name === 'ZodError') {
      const issues = error.issues ?? error.errors ?? [];
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al generar el PDF inicial' },
      { status: 500 }
    );
  }
}