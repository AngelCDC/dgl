// api/admin/solicitudes/pdf/route.js
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import SolicitudPDF from '../../../../components/SolicitudPDF';
import {solicitudSchema}  from '../../../../lib/schemas/solicitud';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validar datos con Zod
    const validatedData = solicitudSchema.parse(data);

    const buffer = await renderToBuffer(
      createElement(SolicitudPDF, { data: validatedData })
    );

    // Generar nombre con folio o timestamp
    const folio = validatedData.tipoDocumento || Date.now();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="solicitud-${folio}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generando PDF:', error);
    
    // Manejar errores de validación de Zod
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}