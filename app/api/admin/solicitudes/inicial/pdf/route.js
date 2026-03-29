import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import SolicitudLevantamientoProcuraPDF from '../../../../../components/SolicitudLevantamientoProcuraPDF';
import { solicitudLevantamientoProcuraSchema } from '../../../../../lib/schemas/solicitud-levantamiento-procura';

export async function POST(request) {
  try {
    const data = await request.json();

    const validatedData = solicitudLevantamientoProcuraSchema.parse(data);

    const empresa = validatedData.empresaCliente
      ? validatedData.empresaCliente
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-_]/g, '')
      : Date.now();

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
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.errors.map((err) => ({
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