export interface BoundingBox {
  top: number; // percentage 0-100
  left: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
}

export interface FieldConfidence {
  value: any;
  confidence: number; // 0 to 100
  bbox?: BoundingBox;
  isUncertain: boolean; // confidence < threshold
  uncertaintyReason?: string;
}

export interface DocumentItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  total_linea: number;
  confianza: number;
}

export interface ExtractedDocument {
  id: string;
  fileName: string;
  tipo_comprobante: 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C' | 'TICKET' | 'RECIBO' | 'NOTA_MANUSCRITA';
  calidad_imagen: 'optima' | 'torcida' | 'arrugada' | 'termico_desvanecido' | 'manchada' | 'baja_iluminacion';
  rotation: number; // 0, 90, 180, 270
  
  // Extracted fields with confidence & bbox
  emisor: FieldConfidence;
  cuit_o_id: FieldConfidence;
  fecha: FieldConfidence;
  numero_comprobante: FieldConfidence;
  subtotal: FieldConfidence;
  impuestos: FieldConfidence;
  total: FieldConfidence;
  
  items: DocumentItem[];
  observaciones_auditoria?: string;
  imageUrl?: string;
  imageBase64?: string;
  
  // Ground truth for benchmark evaluation
  groundTruth?: {
    emisor: string;
    numero_comprobante: string;
    fecha: string;
    total: number;
    subtotal: number;
    impuestos: number;
  };
}

export interface LedgerRecord {
  id: string;
  fecha: string;
  proveedor: string;
  cuit: string;
  numero_factura: string;
  monto: number;
  categoria: 'Combustible' | 'Servicios' | 'Insumos' | 'Honorarios' | 'Hardware' | 'Viáticos' | 'Gastos Generales';
  estado_conciliacion: 'CONCILIADO' | 'DISCREPANCIA_MONTO' | 'SIN_COMPROBANTE' | 'DUPLICADO' | 'PENDIENTE_REVISION';
  comprobante_asociado_id?: string;
  diferencia?: number;
}

export interface ArithmeticValidation {
  itemsSumValid: boolean;
  itemsSumExpected: number;
  itemsSumActual: number;
  taxSumValid: boolean;
  taxExpected: number;
  taxActual: number;
  discrepancyAmount: number;
  isClean: boolean;
  notes: string[];
}

export interface ReconciliationResult {
  docId: string;
  status: 'AUDITADO_OK' | 'REVISION_REQUERIDA' | 'DISCREPANCIA_CONTABLE' | 'DUPLICADO_DETECTADO' | 'ANOMALIA_CATEGORIA';
  matchedLedgerRecord?: LedgerRecord;
  arithmetic: ArithmeticValidation;
  uncertainFields: string[];
  findings: {
    type: 'warning' | 'error' | 'success' | 'info';
    field?: string;
    title: string;
    description: string;
    cropBbox?: BoundingBox;
    actionNeeded?: string;
  }[];
  reviewedByUser: boolean;
  userApprovedAt?: string;
  userOverrides?: Record<string, any>;
}

export interface CorpusMetric {
  categoryName: string;
  totalDocs: number;
  fieldAccuracy: {
    emisor: number; // percentage
    fecha: number;
    numero_comprobante: number;
    subtotal: number;
    impuestos: number;
    total: number;
  };
  uncertaintyFlagRate: number; // % of uncertain cases flagged correctly
  arithmeticVerificationRate: number;
  latencyAvgMs: number;
}

export interface AuditStats {
  totalProcessed: number;
  totalApproved: number;
  totalPendingReview: number;
  totalDiscrepancies: number;
  totalDuplicates: number;
  overallConfidenceAvg: number;
}
