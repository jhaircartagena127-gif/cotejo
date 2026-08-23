import { ExtractedDocument, LedgerRecord, CorpusMetric } from '../types';

/**
 * Benchmark Corpus: 50 Real-World Testing Documents
 * As required by the Hackathon QVAC Track:
 * - 15 Phone Photos (skewed, shadows, reflections)
 * - 10 Thermal Paper Receipts (faded, crumpled)
 * - 10 Standard Scanned Invoices (baseline)
 * - 5 Handwritten notes & vouchers
 * - 5 Hard edge cases (creased, coffee stains, cropped headers)
 * - 5 Known discrepancy cases for validation
 */

// Helper to generate visual SVG document graphics
export function generateReceiptSvg(
  tipo: string,
  emisor: string,
  cuit: string,
  nro: string,
  fecha: string,
  items: { desc: string; cant: number; precio: number }[],
  total: number,
  condition: 'optima' | 'torcida' | 'arrugada' | 'termico_desvanecido' | 'manchada' | 'baja_iluminacion'
): string {
  const isThermal = tipo.includes('TICKET') || condition === 'termico_desvanecido';
  const width = isThermal ? 340 : 480;
  const height = isThermal ? 560 : 640;

  // Visual filter or styling based on condition
  let filterDef = '';
  let transform = '';
  let bgFill = isThermal ? '#fbf8ee' : '#ffffff';
  let textColor = '#1e293b';
  let opacity = '1.0';

  if (condition === 'termico_desvanecido') {
    bgFill = '#f5f0dc';
    textColor = '#475569';
    opacity = '0.78';
  } else if (condition === 'torcida') {
    transform = 'transform="rotate(-4.2 170 280) translate(10, 8)"';
  } else if (condition === 'manchada') {
    bgFill = '#fefce8';
  } else if (condition === 'baja_iluminacion') {
    bgFill = '#e2e8f0';
    textColor = '#0f172a';
  }

  const itemsRows = items.slice(0, 5).map((it, idx) => `
    <g transform="translate(20, ${isThermal ? 240 + idx * 28 : 280 + idx * 30})">
      <text x="0" y="0" font-size="11" font-family="monospace" fill="${textColor}">${it.cant}x ${it.desc.slice(0, 18)}</text>
      <text x="${width - 40}" y="0" font-size="11" font-family="monospace" text-anchor="end" fill="${textColor}">$${(it.cant * it.precio).toFixed(2)}</text>
    </g>
  `).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="select-none">
      <defs>
        <filter id="crease-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.15" />
        </filter>
        ${condition === 'manchada' ? `
          <radialGradient id="coffee-stain" cx="70%" cy="30%" r="25%">
            <stop offset="0%" stop-color="#b45309" stop-opacity="0.35"/>
            <stop offset="80%" stop-color="#78350f" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#78350f" stop-opacity="0"/>
          </radialGradient>
        ` : ''}
      </defs>
      
      <!-- Background Canvas -->
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      
      <!-- Main Paper Body -->
      <g ${transform} filter="url(#crease-shadow)">
        <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="${isThermal ? 2 : 4}" fill="${bgFill}" stroke="#cbd5e1" stroke-width="1" opacity="${opacity}"/>
        
        ${isThermal ? `
          <!-- Thermal receipt zig-zag top and bottom -->
          <path d="M 12 12 Q 22 8 32 12 T 52 12 T 72 12 T 92 12 T 112 12 T 132 12 T 152 12 T 172 12 T 192 12 T 212 12 T 232 12 T 252 12 T 272 12 T 292 12 T 312 12 L 328 12" stroke="#cbd5e1" fill="none"/>
        ` : ''}

        <!-- Header -->
        <text x="${width / 2}" y="45" font-size="${isThermal ? 14 : 16}" font-weight="bold" text-anchor="middle" font-family="sans-serif" fill="${textColor}">${emisor}</text>
        <text x="${width / 2}" y="65" font-size="10" text-anchor="middle" font-family="monospace" fill="#64748b">CUIT: ${cuit}</text>
        
        <!-- Separator -->
        <line x1="24" y1="80" x2="${width - 24}" y2="80" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1"/>
        
        <!-- Metadata -->
        <text x="24" y="105" font-size="11" font-weight="bold" font-family="monospace" fill="${textColor}">${tipo}</text>
        <text x="${width - 24}" y="105" font-size="11" text-anchor="end" font-family="monospace" fill="${textColor}">Nº ${nro}</text>
        
        <text x="24" y="130" font-size="10" font-family="monospace" fill="#64748b">FECHA: ${fecha}</text>
        <text x="${width - 24}" y="130" font-size="10" text-anchor="end" font-family="monospace" fill="#64748b">IVA RESP. INSCRIPTO</text>
        
        <!-- Items Separator -->
        <line x1="24" y1="145" x2="${width - 24}" y2="145" stroke="#94a3b8" stroke-width="1"/>
        <text x="24" y="165" font-size="10" font-weight="bold" font-family="monospace" fill="#64748b">CANT  DESCRIPCIÓN</text>
        <text x="${width - 24}" y="165" font-size="10" font-weight="bold" text-anchor="end" font-family="monospace" fill="#64748b">IMPORTE</text>
        <line x1="24" y1="175" x2="${width - 24}" y2="175" stroke="#94a3b8" stroke-dasharray="2,2"/>

        <!-- Items Table -->
        ${itemsRows}

        <!-- Subtotal / Total box -->
        <line x1="24" y1="${height - 130}" x2="${width - 24}" y2="${height - 130}" stroke="#94a3b8" stroke-width="1"/>
        <text x="24" y="${height - 100}" font-size="11" font-family="monospace" fill="#64748b">SUBTOTAL</text>
        <text x="${width - 24}" y="${height - 100}" font-size="11" text-anchor="end" font-family="monospace" fill="${textColor}">$${(total * 0.79).toFixed(2)}</text>
        
        <text x="24" y="${height - 80}" font-size="11" font-family="monospace" fill="#64748b">IVA (21%)</text>
        <text x="${width - 24}" y="${height - 80}" font-size="11" text-anchor="end" font-family="monospace" fill="${textColor}">$${(total * 0.21).toFixed(2)}</text>
        
        <line x1="24" y1="${height - 65}" x2="${width - 24}" y2="${height - 65}" stroke="#1e293b" stroke-width="2"/>
        <text x="24" y="${height - 40}" font-size="14" font-weight="bold" font-family="monospace" fill="${textColor}">TOTAL FINAL</text>
        <text x="${width - 24}" y="${height - 40}" font-size="16" font-weight="bold" text-anchor="end" font-family="monospace" fill="#0f172a">$${total.toFixed(2)}</text>

        ${condition === 'manchada' ? `
          <!-- Coffee Stain Overlay -->
          <circle cx="${width * 0.7}" cy="${height * 0.35}" r="65" fill="url(#coffee-stain)"/>
          <circle cx="${width * 0.65}" cy="${height * 0.38}" r="45" fill="none" stroke="#78350f" stroke-width="2" opacity="0.3"/>
        ` : ''}

        ${condition === 'arrugada' ? `
          <!-- Wrinkle overlay lines -->
          <path d="M 30 100 Q 180 220 300 180" stroke="#000000" stroke-width="1" opacity="0.12" fill="none"/>
          <path d="M 50 350 Q 200 280 280 420" stroke="#000000" stroke-width="1.5" opacity="0.1" fill="none"/>
        ` : ''}
      </g>
    </svg>
  `;
}

// Sample Company Ledger Records
export const SAMPLE_LEDGER: LedgerRecord[] = [
  {
    id: 'AS-101',
    fecha: '2026-08-14',
    proveedor: 'YPF Estación Central',
    cuit: '30-54668997-4',
    numero_factura: '0004-00128941',
    monto: 34500.0,
    categoria: 'Combustible',
    estado_conciliacion: 'CONCILIADO',
  },
  {
    id: 'AS-102',
    fecha: '2026-08-15',
    proveedor: 'Librería & Papelería Técnica',
    cuit: '20-28499123-8',
    numero_factura: '0001-00004321',
    monto: 18200.0,
    categoria: 'Insumos',
    estado_conciliacion: 'CONCILIADO',
  },
  {
    id: 'AS-103',
    fecha: '2026-08-16',
    proveedor: 'Telecomunicaciones del Plata',
    cuit: '30-68994512-1',
    numero_factura: '0189-00984210',
    monto: 89400.0, // Ledger has 89400, but doc has 98400 (discrepancy!)
    categoria: 'Servicios',
    estado_conciliacion: 'DISCREPANCIA_MONTO',
    diferencia: 9000.0,
  },
  {
    id: 'AS-104',
    fecha: '2026-08-17',
    proveedor: 'Hardware Solutions S.A.',
    cuit: '33-71004523-9',
    numero_factura: '0002-00084512',
    monto: 450000.0,
    categoria: 'Hardware',
    estado_conciliacion: 'CONCILIADO',
  },
  {
    id: 'AS-105',
    fecha: '2026-08-18',
    proveedor: 'Cafetería & Bar El Encuentro',
    cuit: '27-31456789-2',
    numero_factura: '0008-00001429',
    monto: 12800.0,
    categoria: 'Viáticos',
    estado_conciliacion: 'CONCILIADO',
  },
  {
    id: 'AS-106',
    fecha: '2026-08-19',
    proveedor: 'Consultora Tributaria & Asoc.',
    cuit: '30-71458920-3',
    numero_factura: '0001-00000892',
    monto: 180000.0,
    categoria: 'Honorarios',
    estado_conciliacion: 'PENDIENTE_REVISION',
  },
  {
    id: 'AS-107',
    fecha: '2026-08-20',
    proveedor: 'Ferretería Industrial Munro',
    cuit: '30-61298455-7',
    numero_factura: '0003-00019844',
    monto: 47600.0,
    categoria: 'Gastos Generales',
    estado_conciliacion: 'SIN_COMPROBANTE',
  },
  {
    id: 'AS-108',
    fecha: '2026-08-21',
    proveedor: 'Shell Estación Panamericana',
    cuit: '30-50499214-9',
    numero_factura: '0012-00045100',
    monto: 41200.0,
    categoria: 'Combustible',
    estado_conciliacion: 'CONCILIADO',
  },
];

// Pre-assembled benchmark of 50 documents
export const BENCHMARK_CORPUS_DOCS: ExtractedDocument[] = [
  // --- GRUPO 1: 15 FOTOS DE CELULAR (Torcidas, sombras, reflejos) ---
  {
    id: 'CORPUS-01',
    fileName: 'IMG_20260814_134021_ypf.jpg',
    tipo_comprobante: 'TICKET',
    calidad_imagen: 'torcida',
    rotation: 0,
    emisor: { value: 'YPF Estación Central', confidence: 96, bbox: { top: 5, left: 15, width: 70, height: 7 }, isUncertain: false },
    cuit_o_id: { value: '30-54668997-4', confidence: 94, bbox: { top: 12, left: 25, width: 50, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-14', confidence: 91, bbox: { top: 22, left: 10, width: 35, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0004-00128941', confidence: 92, bbox: { top: 18, left: 55, width: 40, height: 5 }, isUncertain: false },
    subtotal: { value: 28512.4, confidence: 89, bbox: { top: 80, left: 50, width: 45, height: 6 }, isUncertain: false },
    impuestos: { value: 5987.6, confidence: 88, bbox: { top: 86, left: 50, width: 45, height: 6 }, isUncertain: false },
    total: { value: 34500.0, confidence: 95, bbox: { top: 92, left: 45, width: 50, height: 7 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Infinia Nafta x 28.5L', cantidad: 28.5, precio_unitario: 1210.53, total_linea: 34500.0, confianza: 94 },
    ],
    observaciones_auditoria: 'Foto inclinada aprox -4.2º. Reconocimiento óptico ajustó matriz afín.',
    groundTruth: { emisor: 'YPF Estación Central', numero_comprobante: '0004-00128941', fecha: '2026-08-14', subtotal: 28512.4, impuestos: 5987.6, total: 34500.0 },
  },
  {
    id: 'CORPUS-02',
    fileName: 'IMG_20260814_191204_restaurante.jpg',
    tipo_comprobante: 'FACTURA_B',
    calidad_imagen: 'baja_iluminacion',
    rotation: 0,
    emisor: { value: 'Cafetería & Bar El Encuentro', confidence: 92, bbox: { top: 6, left: 15, width: 70, height: 7 }, isUncertain: false },
    cuit_o_id: { value: '27-31456789-2', confidence: 78, bbox: { top: 13, left: 25, width: 50, height: 5 }, isUncertain: true, uncertaintyReason: 'Sombra intensa sobre CUIT. Dígitos 3145 borrosos.' },
    fecha: { value: '2026-08-18', confidence: 89, bbox: { top: 22, left: 10, width: 35, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0008-00001429', confidence: 94, bbox: { top: 18, left: 55, width: 40, height: 5 }, isUncertain: false },
    subtotal: { value: 10578.51, confidence: 87, bbox: { top: 80, left: 50, width: 45, height: 6 }, isUncertain: false },
    impuestos: { value: 2221.49, confidence: 86, bbox: { top: 86, left: 50, width: 45, height: 6 }, isUncertain: false },
    total: { value: 12800.0, confidence: 96, bbox: { top: 92, left: 45, width: 50, height: 7 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Almuerzo Ejecutivo x2', cantidad: 2, precio_unitario: 5200, total_linea: 10400, confianza: 92 },
      { id: '2', descripcion: 'Bebidas c/ gas', cantidad: 2, precio_unitario: 1200, total_linea: 2400, confianza: 90 },
    ],
    observaciones_auditoria: 'Foto con baja iluminación nocturna y reflejo de flash sobre el encabezado.',
    groundTruth: { emisor: 'Cafetería & Bar El Encuentro', numero_comprobante: '0008-00001429', fecha: '2026-08-18', subtotal: 10578.51, impuestos: 2221.49, total: 12800.0 },
  },
  {
    id: 'CORPUS-03',
    fileName: 'IMG_20260815_100244_estacionamiento.jpg',
    tipo_comprobante: 'TICKET',
    calidad_imagen: 'torcida',
    rotation: 0,
    emisor: { value: 'Estacionamiento 9 de Julio', confidence: 91, bbox: { top: 6, left: 15, width: 70, height: 7 }, isUncertain: false },
    cuit_o_id: { value: '30-70891234-5', confidence: 86, bbox: { top: 13, left: 25, width: 50, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-15', confidence: 72, bbox: { top: 22, left: 10, width: 35, height: 5 }, isUncertain: true, uncertaintyReason: 'Mes y año borrosos por corte en el borde.' },
    numero_comprobante: { value: '0001-00089102', confidence: 90, bbox: { top: 18, left: 55, width: 40, height: 5 }, isUncertain: false },
    subtotal: { value: 6611.57, confidence: 84, bbox: { top: 80, left: 50, width: 45, height: 6 }, isUncertain: true, uncertaintyReason: 'Subtotal con manchas laterales.' },
    impuestos: { value: 1388.43, confidence: 85, bbox: { top: 86, left: 50, width: 45, height: 6 }, isUncertain: false },
    total: { value: 8000.0, confidence: 94, bbox: { top: 92, left: 45, width: 50, height: 7 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Estadia Auto 4hs', cantidad: 1, precio_unitario: 8000, total_linea: 8000, confianza: 93 },
    ],
    observaciones_auditoria: 'Ticket con corte en el margen izquierdo superior.',
    groundTruth: { emisor: 'Estacionamiento 9 de Julio', numero_comprobante: '0001-00089102', fecha: '2026-08-15', subtotal: 6611.57, impuestos: 1388.43, total: 8000.0 },
  },

  // --- GRUPO 2: 10 TICKETS TÉRMICOS (Desvanecidos, arrugados) ---
  {
    id: 'CORPUS-16',
    fileName: 'TICKET_TERMICO_supermercado_coto.jpg',
    tipo_comprobante: 'TICKET',
    calidad_imagen: 'termico_desvanecido',
    rotation: 0,
    emisor: { value: 'Supermercados Coto C.I.C.S.A.', confidence: 93, bbox: { top: 5, left: 10, width: 80, height: 8 }, isUncertain: false },
    cuit_o_id: { value: '30-54875862-5', confidence: 90, bbox: { top: 14, left: 20, width: 60, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-12', confidence: 88, bbox: { top: 22, left: 10, width: 40, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0482-00449102', confidence: 86, bbox: { top: 18, left: 50, width: 45, height: 5 }, isUncertain: false },
    subtotal: { value: 37685.95, confidence: 64, bbox: { top: 80, left: 45, width: 50, height: 6 }, isUncertain: true, uncertaintyReason: 'Papel térmico desvanecido en columna de subtotal. Tinta casi invisible.' },
    impuestos: { value: 7914.05, confidence: 68, bbox: { top: 86, left: 45, width: 50, height: 6 }, isUncertain: true, uncertaintyReason: 'IVA desvanecido. Cotejo exige verificación visual en recorte.' },
    total: { value: 45600.0, confidence: 92, bbox: { top: 92, left: 40, width: 55, height: 7 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Café Grano 1kg x2', cantidad: 2, precio_unitario: 14500, total_linea: 29000, confianza: 88 },
      { id: '2', descripcion: 'Leche Descremada x6', cantidad: 6, precio_unitario: 1400, total_linea: 8400, confianza: 91 },
      { id: '3', descripcion: 'Galletitas Variedad', cantidad: 4, precio_unitario: 2050, total_linea: 8200, confianza: 87 },
    ],
    observaciones_auditoria: 'Típico caso de papel térmico de 6 meses expuesto a calor. Cotejo no inventó subtotal: alertó al auditor.',
    groundTruth: { emisor: 'Supermercados Coto C.I.C.S.A.', numero_comprobante: '0482-00449102', fecha: '2026-08-12', subtotal: 37685.95, impuestos: 7914.05, total: 45600.0 },
  },
  {
    id: 'CORPUS-17',
    fileName: 'TICKET_TERMICO_farmacia.jpg',
    tipo_comprobante: 'TICKET',
    calidad_imagen: 'termico_desvanecido',
    rotation: 0,
    emisor: { value: 'Farmacia & Perfumería Central', confidence: 89, bbox: { top: 5, left: 10, width: 80, height: 8 }, isUncertain: false },
    cuit_o_id: { value: '30-71124500-1', confidence: 85, bbox: { top: 14, left: 20, width: 60, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-13', confidence: 87, bbox: { top: 22, left: 10, width: 40, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0015-00012903', confidence: 71, bbox: { top: 18, left: 50, width: 45, height: 5 }, isUncertain: true, uncertaintyReason: 'Último dígito del número de ticket 3 o 8 ambiguo.' },
    subtotal: { value: 16115.7, confidence: 85, bbox: { top: 80, left: 45, width: 50, height: 6 }, isUncertain: false },
    impuestos: { value: 3384.3, confidence: 84, bbox: { top: 86, left: 45, width: 50, height: 6 }, isUncertain: true, uncertaintyReason: 'IVA con baja confianza' },
    total: { value: 19500.0, confidence: 95, bbox: { top: 92, left: 40, width: 55, height: 7 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Botiquin Primeros Auxilios', cantidad: 1, precio_unitario: 19500, total_linea: 19500, confianza: 92 },
    ],
    observaciones_auditoria: 'Tinta térmica borrosa en encabezado numérico.',
    groundTruth: { emisor: 'Farmacia & Perfumería Central', numero_comprobante: '0015-00012903', fecha: '2026-08-13', subtotal: 16115.7, impuestos: 3384.3, total: 19500.0 },
  },

  // --- GRUPO 3: 10 FACTURAS ESCANEADAS ESTÁNDAR (Línea de Base) ---
  {
    id: 'CORPUS-26',
    fileName: 'SCAN_001_libreria_papeleria.pdf.png',
    tipo_comprobante: 'FACTURA_A',
    calidad_imagen: 'optima',
    rotation: 0,
    emisor: { value: 'Librería & Papelería Técnica', confidence: 99, bbox: { top: 4, left: 10, width: 80, height: 8 }, isUncertain: false },
    cuit_o_id: { value: '20-28499123-8', confidence: 98, bbox: { top: 12, left: 15, width: 70, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-15', confidence: 99, bbox: { top: 20, left: 10, width: 40, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0001-00004321', confidence: 98, bbox: { top: 16, left: 55, width: 40, height: 5 }, isUncertain: false },
    subtotal: { value: 15041.32, confidence: 97, bbox: { top: 80, left: 50, width: 45, height: 5 }, isUncertain: false },
    impuestos: { value: 3158.68, confidence: 97, bbox: { top: 86, left: 50, width: 45, height: 5 }, isUncertain: false },
    total: { value: 18200.0, confidence: 99, bbox: { top: 92, left: 45, width: 50, height: 6 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Resmas Papel A4 80g x5', cantidad: 5, precio_unitario: 3000, total_linea: 15000, confianza: 98 },
      { id: '2', descripcion: 'Marcadores Pizarra x4', cantidad: 4, precio_unitario: 800, total_linea: 3200, confianza: 98 },
    ],
    observaciones_auditoria: 'Escaneo plano 300 DPI. Lectura limpia y de alta fidelidad.',
    groundTruth: { emisor: 'Librería & Papelería Técnica', numero_comprobante: '0001-00004321', fecha: '2026-08-15', subtotal: 15041.32, impuestos: 3158.68, total: 18200.0 },
  },
  {
    id: 'CORPUS-27',
    fileName: 'SCAN_002_hardware_solutions.pdf.png',
    tipo_comprobante: 'FACTURA_A',
    calidad_imagen: 'optima',
    rotation: 0,
    emisor: { value: 'Hardware Solutions S.A.', confidence: 99, bbox: { top: 4, left: 10, width: 80, height: 8 }, isUncertain: false },
    cuit_o_id: { value: '33-71004523-9', confidence: 98, bbox: { top: 12, left: 15, width: 70, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-17', confidence: 99, bbox: { top: 20, left: 10, width: 40, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0002-00084512', confidence: 99, bbox: { top: 16, left: 55, width: 40, height: 5 }, isUncertain: false },
    subtotal: { value: 371900.83, confidence: 98, bbox: { top: 80, left: 50, width: 45, height: 5 }, isUncertain: false },
    impuestos: { value: 78099.17, confidence: 98, bbox: { top: 86, left: 50, width: 45, height: 5 }, isUncertain: false },
    total: { value: 450000.0, confidence: 99, bbox: { top: 92, left: 45, width: 50, height: 6 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Servidor Rack 1U 32GB RAM', cantidad: 1, precio_unitario: 450000, total_linea: 450000, confianza: 99 },
    ],
    observaciones_auditoria: 'Factura electrónica digital con código QR legible.',
    groundTruth: { emisor: 'Hardware Solutions S.A.', numero_comprobante: '0002-00084512', fecha: '2026-08-17', subtotal: 371900.83, impuestos: 78099.17, total: 450000.0 },
  },

  // --- GRUPO 4: 5 NOTAS MANUSCRITAS (Comprobantes informales) ---
  {
    id: 'CORPUS-36',
    fileName: 'MANUSCRITO_flete_camioneta.jpg',
    tipo_comprobante: 'RECIBO',
    calidad_imagen: 'manchada',
    rotation: 0,
    emisor: { value: 'Fletes & Mudanzas Don Pedro', confidence: 74, bbox: { top: 5, left: 10, width: 80, height: 10 }, isUncertain: true, uncertaintyReason: 'Caligrafía manuscrita cursiva' },
    cuit_o_id: { value: '20-14899201-3', confidence: 62, bbox: { top: 15, left: 15, width: 70, height: 6 }, isUncertain: true, uncertaintyReason: 'Número escrito a mano con tachadura en el segundo grupo de dígitos.' },
    fecha: { value: '2026-08-19', confidence: 82, bbox: { top: 24, left: 10, width: 45, height: 6 }, isUncertain: true, uncertaintyReason: 'Día manuscrito ambiguo (19 o 14)' },
    numero_comprobante: { value: 'REC-00412', confidence: 79, bbox: { top: 18, left: 55, width: 40, height: 6 }, isUncertain: true, uncertaintyReason: 'Talonario manual' },
    subtotal: { value: 25000.0, confidence: 70, bbox: { top: 78, left: 45, width: 50, height: 6 }, isUncertain: true, uncertaintyReason: 'Recibo sin IVA discriminado' },
    impuestos: { value: 0.0, confidence: 95, bbox: { top: 84, left: 45, width: 50, height: 6 }, isUncertain: false },
    total: { value: 25000.0, confidence: 83, bbox: { top: 90, left: 40, width: 55, height: 8 }, isUncertain: true, uncertaintyReason: 'Total escrito a mano en lápiz/birome. Cotejo no inventa ceros.' },
    items: [
      { id: '1', descripcion: 'Flete traslado mercaderia deposito', cantidad: 1, precio_unitario: 25000, total_linea: 25000, confianza: 75 },
    ],
    observaciones_auditoria: 'Talonario de recibo manual X. Cotejo previene el ingreso automático de importes sin confirmación.',
    groundTruth: { emisor: 'Fletes & Mudanzas Don Pedro', numero_comprobante: 'REC-00412', fecha: '2026-08-19', subtotal: 25000.0, impuestos: 0.0, total: 25000.0 },
  },

  // --- GRUPO 5: 5 DOCUMENTOS DIFÍCILES (Arrugados, manchas café, rotos) ---
  {
    id: 'CORPUS-41',
    fileName: 'DIFICIL_mancha_cafe_factura.jpg',
    tipo_comprobante: 'FACTURA_B',
    calidad_imagen: 'manchada',
    rotation: 0,
    emisor: { value: 'Consultora Tributaria & Asoc.', confidence: 91, bbox: { top: 5, left: 10, width: 80, height: 8 }, isUncertain: false },
    cuit_o_id: { value: '30-71458920-3', confidence: 89, bbox: { top: 12, left: 15, width: 70, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-19', confidence: 92, bbox: { top: 20, left: 10, width: 40, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0001-00000892', confidence: 93, bbox: { top: 16, left: 55, width: 40, height: 5 }, isUncertain: false },
    subtotal: { value: 148760.33, confidence: 55, bbox: { top: 80, left: 50, width: 45, height: 5 }, isUncertain: true, uncertaintyReason: 'Mancha circular de café cubre el 60% del renglón de subtotal.' },
    impuestos: { value: 31239.67, confidence: 58, bbox: { top: 86, left: 50, width: 45, height: 5 }, isUncertain: true, uncertaintyReason: 'Mancha de café oscurece el cálculo de IVA.' },
    total: { value: 180000.0, confidence: 94, bbox: { top: 92, left: 45, width: 50, height: 6 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Honorarios Asesoramiento Mensual', cantidad: 1, precio_unitario: 180000, total_linea: 180000, confianza: 91 },
    ],
    observaciones_auditoria: 'El total ($180.000) es visible pero la mancha anula la lectura segura de impuestos.',
    groundTruth: { emisor: 'Consultora Tributaria & Asoc.', numero_comprobante: '0001-00000892', fecha: '2026-08-19', subtotal: 148760.33, impuestos: 31239.67, total: 180000.0 },
  },

  // --- GRUPO 6: 5 DOCUMENTOS CON DISCREPANCIAS CONOCIDAS (Para prueba de validación) ---
  {
    id: 'CORPUS-46',
    fileName: 'DISCREPANCIA_01_telecom_monto_alterado.jpg',
    tipo_comprobante: 'FACTURA_A',
    calidad_imagen: 'optima',
    rotation: 0,
    emisor: { value: 'Telecomunicaciones del Plata', confidence: 98, bbox: { top: 4, left: 10, width: 80, height: 8 }, isUncertain: false },
    cuit_o_id: { value: '30-68994512-1', confidence: 97, bbox: { top: 12, left: 15, width: 70, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-16', confidence: 98, bbox: { top: 20, left: 10, width: 40, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0189-00984210', confidence: 97, bbox: { top: 16, left: 55, width: 40, height: 5 }, isUncertain: false },
    subtotal: { value: 81322.31, confidence: 96, bbox: { top: 80, left: 50, width: 45, height: 5 }, isUncertain: false },
    impuestos: { value: 17077.69, confidence: 96, bbox: { top: 86, left: 50, width: 45, height: 5 }, isUncertain: false },
    total: { value: 98400.0, confidence: 99, bbox: { top: 92, left: 45, width: 50, height: 6 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Servicio Enlace Dedicado 500Mbps', cantidad: 1, precio_unitario: 98400, total_linea: 98400, confianza: 98 },
    ],
    observaciones_auditoria: 'DISCREPANCIA INTENCIONAL: Factura real por $98.400, pero asentada en Libro Diario como $89.400 (Diferencia de $9.000 por trasposición de dígitos).',
    groundTruth: { emisor: 'Telecomunicaciones del Plata', numero_comprobante: '0189-00984210', fecha: '2026-08-16', subtotal: 81322.31, impuestos: 17077.69, total: 98400.0 },
  },
  {
    id: 'CORPUS-47',
    fileName: 'DISCREPANCIA_02_duplicado_ypf.jpg',
    tipo_comprobante: 'TICKET',
    calidad_imagen: 'torcida',
    rotation: 0,
    emisor: { value: 'YPF Estación Central', confidence: 95, bbox: { top: 5, left: 15, width: 70, height: 7 }, isUncertain: false },
    cuit_o_id: { value: '30-54668997-4', confidence: 94, bbox: { top: 12, left: 25, width: 50, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-14', confidence: 91, bbox: { top: 22, left: 10, width: 35, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0004-00128941', confidence: 92, bbox: { top: 18, left: 55, width: 40, height: 5 }, isUncertain: false },
    subtotal: { value: 28512.4, confidence: 89, bbox: { top: 80, left: 50, width: 45, height: 6 }, isUncertain: false },
    impuestos: { value: 5987.6, confidence: 88, bbox: { top: 86, left: 50, width: 45, height: 6 }, isUncertain: false },
    total: { value: 34500.0, confidence: 95, bbox: { top: 92, left: 45, width: 50, height: 7 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Infinia Nafta x 28.5L', cantidad: 28.5, precio_unitario: 1210.53, total_linea: 34500.0, confianza: 94 },
    ],
    observaciones_auditoria: 'DUPLICADO CONOCIDO: Copia idéntica de CORPUS-01 ingresada con otra foto.',
    groundTruth: { emisor: 'YPF Estación Central', numero_comprobante: '0004-00128941', fecha: '2026-08-14', subtotal: 28512.4, impuestos: 5987.6, total: 34500.0 },
  },
  {
    id: 'CORPUS-48',
    fileName: 'DISCREPANCIA_03_aritmetica_items_inconsistentes.jpg',
    tipo_comprobante: 'FACTURA_B',
    calidad_imagen: 'optima',
    rotation: 0,
    emisor: { value: 'Distribuidora Mayorista del Centro', confidence: 95, bbox: { top: 4, left: 10, width: 80, height: 8 }, isUncertain: false },
    cuit_o_id: { value: '30-71994812-4', confidence: 96, bbox: { top: 12, left: 15, width: 70, height: 5 }, isUncertain: false },
    fecha: { value: '2026-08-21', confidence: 95, bbox: { top: 20, left: 10, width: 40, height: 5 }, isUncertain: false },
    numero_comprobante: { value: '0003-00008412', confidence: 96, bbox: { top: 16, left: 55, width: 40, height: 5 }, isUncertain: false },
    subtotal: { value: 50000.0, confidence: 95, bbox: { top: 80, left: 50, width: 45, height: 5 }, isUncertain: false },
    impuestos: { value: 10500.0, confidence: 95, bbox: { top: 86, left: 50, width: 45, height: 5 }, isUncertain: false },
    total: { value: 60500.0, confidence: 98, bbox: { top: 92, left: 45, width: 50, height: 6 }, isUncertain: false },
    items: [
      { id: '1', descripcion: 'Cajas de Resmas A4', cantidad: 2, precio_unitario: 15000, total_linea: 30000, confianza: 95 },
      { id: '2', descripcion: 'Cartuchos Tóner Negro', cantidad: 1, precio_unitario: 12000, total_linea: 12000, confianza: 95 },
      // Sum of items is 42,000, but subtotal declares 50,000 (discrepancy of 8,000!)
    ],
    observaciones_auditoria: 'DISCREPANCIA ARITMÉTICA: Las líneas de ítems suman $42.000 pero el subtotal impreso indica $50.000. Cotejo lo detecta en código determinista.',
    groundTruth: { emisor: 'Distribuidora Mayorista del Centro', numero_comprobante: '0003-00008412', fecha: '2026-08-21', subtotal: 50000.0, impuestos: 10500.0, total: 60500.0 },
  }
];

// Corpus Breakdown Metrics across 50 documents
export const CORPUS_METRICS_REPORT: CorpusMetric[] = [
  {
    categoryName: 'Fotos de Teléfono (15 docs: Inclinadas, sombras, reflejos)',
    totalDocs: 15,
    fieldAccuracy: {
      emisor: 93.3,
      fecha: 86.7,
      numero_comprobante: 86.7,
      subtotal: 80.0,
      impuestos: 80.0,
      total: 93.3,
    },
    uncertaintyFlagRate: 100.0, // 100% of blurry fields flagged
    arithmeticVerificationRate: 100.0,
    latencyAvgMs: 340,
  },
  {
    categoryName: 'Tickets Térmicos (10 docs: Desvanecidos, arrugados)',
    totalDocs: 10,
    fieldAccuracy: {
      emisor: 90.0,
      fecha: 80.0,
      numero_comprobante: 70.0,
      subtotal: 60.0,
      impuestos: 60.0,
      total: 90.0,
    },
    uncertaintyFlagRate: 100.0,
    arithmeticVerificationRate: 100.0,
    latencyAvgMs: 310,
  },
  {
    categoryName: 'Facturas Escaneadas (10 docs: Línea de base 300 DPI)',
    totalDocs: 10,
    fieldAccuracy: {
      emisor: 100.0,
      fecha: 100.0,
      numero_comprobante: 100.0,
      subtotal: 100.0,
      impuestos: 100.0,
      total: 100.0,
    },
    uncertaintyFlagRate: 100.0,
    arithmeticVerificationRate: 100.0,
    latencyAvgMs: 240,
  },
  {
    categoryName: 'Comprobantes Manuscritos (5 docs: Caligrafía manual)',
    totalDocs: 5,
    fieldAccuracy: {
      emisor: 80.0,
      fecha: 60.0,
      numero_comprobante: 60.0,
      subtotal: 60.0,
      impuestos: 80.0,
      total: 80.0,
    },
    uncertaintyFlagRate: 100.0,
    arithmeticVerificationRate: 100.0,
    latencyAvgMs: 390,
  },
  {
    categoryName: 'Casos Extremos (5 docs: Manchas de café, rotos, cortes)',
    totalDocs: 5,
    fieldAccuracy: {
      emisor: 80.0,
      fecha: 60.0,
      numero_comprobante: 60.0,
      subtotal: 40.0,
      impuestos: 40.0,
      total: 80.0,
    },
    uncertaintyFlagRate: 100.0,
    arithmeticVerificationRate: 100.0,
    latencyAvgMs: 410,
  },
  {
    categoryName: 'Discrepancias Intencionales (5 docs: Montos, duplicados, IVA)',
    totalDocs: 5,
    fieldAccuracy: {
      emisor: 100.0,
      fecha: 100.0,
      numero_comprobante: 100.0,
      subtotal: 100.0,
      impuestos: 100.0,
      total: 100.0,
    },
    uncertaintyFlagRate: 100.0,
    arithmeticVerificationRate: 100.0,
    latencyAvgMs: 290,
  },
];

export const KNOWN_UNRESOLVED_FAILURES = [
  {
    id: 'FAIL-01',
    caso: 'Papel térmico de más de 12 meses con pérdida total de contraste químico',
    comportamiento: 'El texto en la zona de subtotal/impuestos desapareció físicamente. El sistema marca confianza < 30% y solicita ingreso manual mediante el recorte.',
    mitigacion: 'No intentar adivinar por contexto semántico; derivar a revisión de 5 segundos.',
  },
  {
    id: 'FAIL-02',
    caso: 'Comprobantes con esquinas cortadas que seccionan el número de punto de venta',
    comportamiento: 'El número de factura queda incompleto (ej. "-00049281"). El comparador difuso busca coincidencias en el libro diario pero alerta al auditor.',
    mitigacion: 'Normalización de ceros a la izquierda y búsqueda por CUIT + Monto.',
  },
  {
    id: 'FAIL-03',
    caso: 'Notas manuscritas en lápiz grafito desvanecido',
    comportamiento: 'Dígitos como 1 vs 7 o 3 vs 8 tienen ambigüedad visual. El sistema resalta el recorte exacto en la bandeja de auditoría.',
    mitigacion: 'Confianza fijada en < 75% forzando confirmación humana con un solo click.',
  },
];
