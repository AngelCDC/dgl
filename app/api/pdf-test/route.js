// RUTA TEMPORAL de prueba para el fix de CJK wrapping en ContratoPDF.
// Se elimina después de verificar el renderizado.
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { ContratoPDF } from '../../../components/ContratoPDF'

const data = {
  fecha: '2026-08-31',
  numero: 'CJKTEST-001',
  buyerLegalName: 'Global Trading Partners Ltd.',
  buyerTradeName: 'GTP',
  buyerCountry: 'Mexico',
  buyerAddress: 'Av. Reforma 1000, Ciudad de México',
  buyerTaxId: 'RFC-123456',
  buyerRepresentative: 'Ana Martinez',
  buyerPosition: 'Procurement Director',
  supplierLegalName: '深圳市恒通电子科技有限公司',
  supplierTradeName: '恒通电子',
  supplierUscc: '91440300MA5XXXX00X',
  supplierAddress: '广东省深圳市宝安区西乡街道工业园三路18号',
  supplierLegalRepresentative: '王建国',
  supplierPosition: '总经理',
  partidas: [
    { producto: '智能温控器恒温开关', especificacion: '型号HT-200，电压220V，白色外壳，含中英文说明书', cantidad: '5,000', precioUnitario: '$12.50', total: '$62,500.00', esFlete: true },
    { producto: '工业传感器探头', especificacion: '规格：不锈钢材质，测量范围0-300°C，输出4-20mA', cantidad: '2,000', precioUnitario: '$8.00', total: '$16,000.00', esFlete: false },
  ],
  pagos: [
    { concepto: '订金（预付款）', porcentaje: '30', monto: '$23,550.00' },
    { concepto: '出货前尾款', porcentaje: '70', monto: '$54,950.00' },
  ],
  paymentMethod: 'T/T',
  incoterm: 'FOB',
  namedPlace: '深圳港',
  currency: 'USD',
  totalContractValue: '$78,500.00',
  fletePago: 'final',
  productionDays: '45',
  productionStart: 'DATE',
  productionStartDate: '2026-09-10',
  estimatedReadyToShipDate: '2026-10-25',
  warrantyMonths: '24',
  warrantyStart: '装运日期',
  warrantyResponseDays: '5',
  warrantyCorrectiveDays: '15',
  delayPercent: '0.5',
  delayPeriod: '周',
  delayCapPercent: '5',
  delayTerminationDays: '60',
  ncDurationYears: '2',
  ncTerritory: '墨西哥合众国',
  governingLaw: '中华人民共和国法律',
  negotiationDays: '30',
  arbitrationInstitution: '深圳国际仲裁院',
  arbitrationSeat: '深圳',
  arbitrationLanguage: 'OTHER',
  arbitrationLanguageOther: '中文与英文',
  executedIn: '深圳市',
  controllingLanguage: '英文与中文',
  buyerNoticeName: 'Ana Martinez',
  buyerNoticeEmail: 'ana.martinez@gtp.example',
  buyerNoticeAddress: 'Av. Reforma 1000, Ciudad de México',
  supplierNoticeName: '王建国',
  supplierNoticeEmail: 'wang@hengton.example.cn',
  supplierNoticeAddress: '广东省深圳市宝安区西乡街道工业园三路18号',
  buyerSigner: 'Ana Martinez',
  buyerSignerPosition: 'Procurement Director',
  buyerSignDate: '2026-08-31',
  supplierSigner: '王建国',
  supplierSignerPosition: '总经理',
  supplierSignDate: '2026-08-31',
  inspectionCompany: '通标标准技术服务有限公司深圳分公司',
  inspectionLocation: '广东省深圳市宝安区西乡街道工业园三路18号',
  inspectionDate: '2026-10-20',
  inspectionChecklist: ['数量核对', '外观检查', '功能测试', '包装检查'],
  inspectionStandard: 'OTHER',
  inspectionStandardOther: 'GB/T 2828.1-2012 抽样检验标准',
  annexDDocs: ['Commercial Invoice', 'Packing List', 'Bill of Lading/Sea Waybill', 'Certificate of Origin', 'Test Report', 'Warranty Certificate'],
  annexDOther: '产品中文标签备案文件',
}

export async function GET() {
  try {
    const buffer = await renderToBuffer(createElement(ContratoPDF, { data }))
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="pdf-test.pdf"',
      },
    })
  } catch (error) {
    console.error('Error generando PDF de prueba:', error)
    return NextResponse.json({ error: String(error && error.message) }, { status: 500 })
  }
}
