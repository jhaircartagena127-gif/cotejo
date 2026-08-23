import { ExtractedDocument, LedgerRecord, ArithmeticValidation, ReconciliationResult } from '../types';

/**
 * Pure Deterministic Arithmetic Engine
 * Models must NEVER do additions or subtractions in accounting.
 * This runs with strict floating-point epsilon precision.
 */

const EPSILON = 0.01;

export function verifyArithmetic(doc: ExtractedDocument): ArithmeticValidation {
  const notes: string[] = [];
  
  const subtotalVal = typeof doc.subtotal.value === 'number' ? doc.subtotal.value : Number(doc.subtotal.value || 0);
  const taxVal = typeof doc.impuestos.value === 'number' ? doc.impuestos.value : Number(doc.impuestos.value || 0);
  const totalVal = typeof doc.total.value === 'number' ? doc.total.value : Number(doc.total.value || 0);

  // 1. Verify item sums
  let itemsSum = 0;
  let hasItems = false;
  if (doc.items && doc.items.length > 0) {
    hasItems = true;
    itemsSum = doc.items.reduce((acc, it) => acc + (Number(it.total_linea) || 0), 0);
  }

  const itemsSumExpected = subtotalVal > 0 ? subtotalVal : totalVal;
  const itemsSumValid = !hasItems || Math.abs(itemsSum - itemsSumExpected) <= 0.05;

  if (hasItems && !itemsSumValid) {
    notes.push(
      `Suma de líneas ($${itemsSum.toFixed(2)}) discrepa del subtotal/total declarado ($${itemsSumExpected.toFixed(2)}) por $${Math.abs(itemsSum - itemsSumExpected).toFixed(2)}.`
    );
  }

  // 2. Verify subtotal + taxes == total
  const calculatedTotal = subtotalVal + taxVal;
  let taxSumValid = true;
  let discrepancyAmount = 0;

  if (subtotalVal > 0 && taxVal > 0) {
    if (Math.abs(calculatedTotal - totalVal) > 0.05) {
      taxSumValid = false;
      discrepancyAmount = Math.abs(calculatedTotal - totalVal);
      notes.push(
        `Subtotal ($${subtotalVal.toFixed(2)}) + Impuestos ($${taxVal.toFixed(2)}) = $${calculatedTotal.toFixed(2)}, pero el total impreso es $${totalVal.toFixed(2)} (Diferencia: $${discrepancyAmount.toFixed(2)}).`
      );
    }
  }

  const isClean = itemsSumValid && taxSumValid && notes.length === 0;

  return {
    itemsSumValid,
    itemsSumExpected,
    itemsSumActual: Number(itemsSum.toFixed(2)),
    taxSumValid,
    taxExpected: Number(calculatedTotal.toFixed(2)),
    taxActual: Number(totalVal.toFixed(2)),
    discrepancyAmount: Number(discrepancyAmount.toFixed(2)),
    isClean,
    notes,
  };
}

/**
 * Fuzzy invoice number normalization
 * Removes leading zeroes, dashes, prefixes (e.g. 'FC-', 'A0001-', etc.)
 */
export function normalizeInvoiceNumber(inv: string): string {
  if (!inv) return '';
  return inv
    .toUpperCase()
    .replace(/[^\w]/g, '')
    .replace(/^0+/, '')
    .replace(/^(FACTURA|FAC|FC|TICKET|TKT|RECIBO|REC)/, '')
    .replace(/^0+/, '');
}

/**
 * Levenshtein distance for fuzzy string comparison
 */
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Reconciles an extracted document against the company ledger records
 */
export function reconcileDocument(
  doc: ExtractedDocument,
  ledger: LedgerRecord[],
  allDocs: ExtractedDocument[],
  confidenceThreshold = 85
): ReconciliationResult {
  const arithmetic = verifyArithmetic(doc);
  const findings: ReconciliationResult['findings'] = [];
  const uncertainFields: string[] = [];

  // 1. Audit confidence per field (Under threshold = require human review with visual crop)
  const fieldsToCheck: (keyof ExtractedDocument)[] = [
    'emisor',
    'cuit_o_id',
    'fecha',
    'numero_comprobante',
    'subtotal',
    'impuestos',
    'total',
  ];

  fieldsToCheck.forEach((fieldKey) => {
    const fieldObj = doc[fieldKey] as any;
    if (fieldObj && typeof fieldObj.confidence === 'number') {
      if (fieldObj.confidence < confidenceThreshold) {
        uncertainFields.push(fieldKey);
        findings.push({
          type: 'warning',
          field: fieldKey,
          title: `Confianza baja en ${fieldKey.toUpperCase()} (${fieldObj.confidence}%)`,
          description: fieldObj.uncertaintyReason || `Lectura dudosa por calidad visual. Requiere confirmación humana mediante recorte.`,
          cropBbox: fieldObj.bbox,
          actionNeeded: `Verificar recorte visual y confirmar valor`,
        });
      }
    }
  });

  // 2. Arithmetic findings
  if (!arithmetic.isClean) {
    arithmetic.notes.forEach((note) => {
      findings.push({
        type: 'error',
        title: 'Discrepancia Aritmética Interna',
        description: note,
        actionNeeded: 'Revisar si hay un ítem no leído o tasa de impuesto especial.',
      });
    });
  }

  // 3. Duplicate detection across ingested batch
  const normalizedCurrentNumber = normalizeInvoiceNumber(String(doc.numero_comprobante.value || ''));
  const currentTotal = Number(doc.total.value || 0);

  const duplicateDoc = allDocs.find((d) => {
    if (d.id === doc.id) return false;
    const norm = normalizeInvoiceNumber(String(d.numero_comprobante.value || ''));
    const sameTotal = Math.abs(Number(d.total.value || 0) - currentTotal) < EPSILON;
    const dist = levenshtein(norm, normalizedCurrentNumber);
    return (norm && normalizedCurrentNumber && (norm === normalizedCurrentNumber || (dist <= 1 && sameTotal)));
  });

  if (duplicateDoc) {
    findings.push({
      type: 'error',
      title: 'Posible Comprobante Duplicado',
      description: `Coincide con el comprobante '${duplicateDoc.fileName}' (N° ${duplicateDoc.numero_comprobante.value}, Total $${duplicateDoc.total.value}).`,
      actionNeeded: 'Verificar si se cargó dos veces la misma factura o una copia fotográfica.',
    });
  }

  // 4. Match against Company Ledger
  let matchedLedgerRecord: LedgerRecord | undefined = undefined;

  // Try matching by exact or fuzzy invoice number + CUIT/Provider
  const docCUIT = String(doc.cuit_o_id.value || '').replace(/\D/g, '');
  const docIssuer = String(doc.emisor.value || '').toLowerCase();

  matchedLedgerRecord = ledger.find((record) => {
    const recordNormInv = normalizeInvoiceNumber(record.numero_factura);
    const recordCUIT = record.cuit.replace(/\D/g, '');
    
    // Check if CUIT or Provider Name aligns
    const cuitMatch = docCUIT && recordCUIT && (docCUIT === recordCUIT || recordCUIT.includes(docCUIT));
    const issuerMatch = record.proveedor.toLowerCase().includes(docIssuer) || docIssuer.includes(record.proveedor.toLowerCase());
    
    // Check invoice number match
    const invMatch = recordNormInv && normalizedCurrentNumber && (
      recordNormInv === normalizedCurrentNumber ||
      levenshtein(recordNormInv, normalizedCurrentNumber) <= 1
    );

    return invMatch || (cuitMatch && Math.abs(record.monto - currentTotal) < 1.0);
  });

  // Check ledger amount discrepancy
  if (matchedLedgerRecord) {
    const amountDiff = Math.abs(matchedLedgerRecord.monto - currentTotal);
    if (amountDiff > 0.05) {
      findings.push({
        type: 'error',
        title: 'Discrepancia con Registro Contable',
        description: `El comprobante indica $${currentTotal.toFixed(2)}, pero el libro diario registra $${matchedLedgerRecord.monto.toFixed(2)} (Diferencia de $${amountDiff.toFixed(2)}).`,
        cropBbox: doc.total.bbox,
        actionNeeded: 'Ajustar asiento contable o solicitar nota de crédito/débito.',
      });
    } else {
      findings.push({
        type: 'success',
        title: 'Conciliado con Libro Diario',
        description: `Coincide perfectamente con el asiento contable #${matchedLedgerRecord.id} (${matchedLedgerRecord.proveedor} - $${matchedLedgerRecord.monto.toFixed(2)}).`,
      });
    }
  } else {
    findings.push({
      type: 'warning',
      title: 'Comprobante sin Contrapartida Contable',
      description: `No se encontró ningún asiento contable pendiente en el libro diario para ${doc.emisor.value || 'este proveedor'} por $${currentTotal.toFixed(2)}.`,
      actionNeeded: 'Ingresar nuevo asiento contable o verificar período fiscal.',
    });
  }

  // 5. Determine overall audit status
  let status: ReconciliationResult['status'] = 'AUDITADO_OK';
  if (duplicateDoc) {
    status = 'DUPLICADO_DETECTADO';
  } else if (!arithmetic.isClean || (matchedLedgerRecord && Math.abs(matchedLedgerRecord.monto - currentTotal) > 0.05)) {
    status = 'DISCREPANCIA_CONTABLE';
  } else if (uncertainFields.length > 0 || !matchedLedgerRecord) {
    status = 'REVISION_REQUERIDA';
  }

  return {
    docId: doc.id,
    status,
    matchedLedgerRecord,
    arithmetic,
    uncertainFields,
    findings,
    reviewedByUser: false,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}
