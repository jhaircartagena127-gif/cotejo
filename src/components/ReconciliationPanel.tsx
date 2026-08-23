import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calculator, 
  Building2, 
  Edit3, 
  Check, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Percent,
  FileSpreadsheet
} from 'lucide-react';
import { ExtractedDocument, ReconciliationResult, LedgerRecord } from '../types';
import { formatCurrency } from '../utils/arithmetic';

interface ReconciliationPanelProps {
  document: ExtractedDocument;
  reconciliation: ReconciliationResult;
  onApprove: (docId: string, overrides?: Record<string, any>) => void;
  onUpdateField: (fieldKey: string, newValue: any) => void;
  selectedFieldKey: string | null;
  onSelectField: (fieldKey: string) => void;
  confidenceThreshold?: number;
}

export const ReconciliationPanel: React.FC<ReconciliationPanelProps> = ({
  document,
  reconciliation,
  onApprove,
  onUpdateField,
  selectedFieldKey,
  onSelectField,
  confidenceThreshold = 85,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleStartEdit = (fieldKey: string, currentValue: any) => {
    setEditingField(fieldKey);
    setTempValue(String(currentValue ?? ''));
  };

  const handleSaveEdit = (fieldKey: string) => {
    let parsed: any = tempValue;
    if (['total', 'subtotal', 'impuestos'].includes(fieldKey)) {
      parsed = parseFloat(tempValue) || 0;
    }
    onUpdateField(fieldKey, parsed);
    setEditingField(null);
  };

  const fieldsList: { key: keyof ExtractedDocument; label: string; isNumeric?: boolean }[] = [
    { key: 'emisor', label: 'Emisor / Razón Social' },
    { key: 'cuit_o_id', label: 'CUIT / Identificación' },
    { key: 'fecha', label: 'Fecha Emisión' },
    { key: 'numero_comprobante', label: 'Nº Comprobante' },
    { key: 'subtotal', label: 'Subtotal Neto', isNumeric: true },
    { key: 'impuestos', label: 'Impuestos / IVA', isNumeric: true },
    { key: 'total', label: 'Total Final', isNumeric: true },
  ];

  const statusBadge = () => {
    switch (reconciliation.status) {
      case 'AUDITADO_OK':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Auditado OK (Sin Discrepancias)</span>
          </span>
        );
      case 'REVISION_REQUERIDA':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Revisión Requerida (Incertidumbre)</span>
          </span>
        );
      case 'DISCREPANCIA_CONTABLE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
            <XCircle className="w-4 h-4" />
            <span>Discrepancia Contable / Aritmética</span>
          </span>
        );
      case 'DUPLICADO_DETECTADO':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-semibold">
            <RotateCcw className="w-4 h-4" />
            <span>Posible Factura Duplicada</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 text-slate-100 overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            Bandeja de Auditoría de 5 Segundos
          </span>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{document.emisor.value || 'Comprobante sin identificar'}</span>
          </h2>
        </div>
        {statusBadge()}
      </div>

      {/* Scrollable Audit Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Core Findings & Low Confidence Alerts */}
        {reconciliation.findings.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Hallazgos y Puntos de Incertidumbre
            </span>
            {reconciliation.findings.map((finding, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs transition ${
                  finding.type === 'error'
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                    : finding.type === 'warning'
                    ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {finding.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                  {finding.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  {finding.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <span className="font-semibold block">{finding.title}</span>
                    <p className="mt-0.5 opacity-90">{finding.description}</p>
                    {finding.actionNeeded && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        <ArrowRight className="w-3 h-3 text-indigo-400" />
                        <span>{finding.actionNeeded}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Deterministic Arithmetic Engine Box */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Verificación Aritmética Determinista</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              reconciliation.arithmetic.isClean
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/20 text-rose-300'
            }`}>
              {reconciliation.arithmetic.isClean ? 'CÁLCULO EXACTO' : 'DESCUADRE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Suma de Ítems</span>
              <span className="font-mono font-bold text-slate-200">
                {formatCurrency(reconciliation.arithmetic.itemsSumActual)}
              </span>
              <span className="text-[10px] text-slate-500 block">
                vs Esperado: {formatCurrency(reconciliation.arithmetic.itemsSumExpected)}
              </span>
            </div>

            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Subtotal + Impuestos</span>
              <span className="font-mono font-bold text-slate-200">
                {formatCurrency(reconciliation.arithmetic.taxExpected)}
              </span>
              <span className="text-[10px] text-slate-500 block">
                vs Impreso: {formatCurrency(reconciliation.arithmetic.taxActual)}
              </span>
            </div>
          </div>
        </div>

        {/* Company Ledger Match Status */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Cruce con Libro Diario Contable</span>
            </span>
            {reconciliation.matchedLedgerRecord ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                Asiento #{reconciliation.matchedLedgerRecord.id}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                Sin Contrapartida
              </span>
            )}
          </div>

          {reconciliation.matchedLedgerRecord ? (
            <div className="text-xs space-y-1 bg-slate-900 p-2 rounded border border-slate-800 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Proveedor registrado:</span>
                <span className="font-medium text-white">{reconciliation.matchedLedgerRecord.proveedor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monto en Libro Diario:</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(reconciliation.matchedLedgerRecord.monto)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Factura declarada:</span>
                <span className="font-mono">{reconciliation.matchedLedgerRecord.numero_factura}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Este comprobante no tiene una orden de compra ni asiento previo registrado en el sistema de la empresa.
            </p>
          )}
        </div>

        {/* Extracted Fields Table with Confidence Scores */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Campos Extraídos y Confianza de Lectura
          </span>
          <div className="space-y-1.5">
            {fieldsList.map(({ key, label, isNumeric }) => {
              const fieldData = document[key] as any;
              const isSelected = selectedFieldKey === key;
              const isLowConf = fieldData?.confidence < confidenceThreshold;
              const isEditing = editingField === key;

              return (
                <div
                  key={key}
                  id={`field-row-${key}`}
                  onClick={() => onSelectField(key)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : isLowConf
                      ? 'bg-amber-950/20 border-amber-800/80 hover:bg-amber-950/30'
                      : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{label}</span>
                      {isLowConf && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          DUDOSO
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type={isNumeric ? 'number' : 'text'}
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white w-full outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(key)}
                          className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-100 block truncate mt-0.5">
                        {isNumeric && typeof fieldData?.value === 'number'
                          ? formatCurrency(fieldData.value)
                          : String(fieldData?.value ?? '—')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Confidence Score Pill */}
                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                        isLowConf
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                      title={fieldData?.uncertaintyReason || `Nivel de certeza: ${fieldData?.confidence}%`}
                    >
                      <span>{fieldData?.confidence ?? 0}%</span>
                    </div>

                    {/* Edit button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(key, fieldData?.value);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                      title="Editar manualmente este campo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Fast 5-Second Action Bar */}
      <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between gap-3">
        <button
          id="btn-re-scan"
          onClick={() => alert(`Documento '${document.fileName}' marcado para re-solicitud de escaneo o fotografía nítida.`)}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
        >
          Pedir Re-escaneo
        </button>

        <button
          id="btn-approve-audit"
          onClick={() => onApprove(document.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Aprobar Comprobante (Auditado)</span>
        </button>
      </div>
    </div>
  );
};
