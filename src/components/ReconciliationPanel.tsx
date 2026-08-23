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
  Plus, 
  Camera, 
  Layers, 
  ZoomIn,
  CheckCheck,
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
  onRequestReScan?: (doc: ExtractedDocument) => void;
  onCreateLedgerRecord?: (doc: ExtractedDocument) => void;
  isApproved?: boolean;
}

export const ReconciliationPanel: React.FC<ReconciliationPanelProps> = ({
  document,
  reconciliation,
  onApprove,
  onUpdateField,
  selectedFieldKey,
  onSelectField,
  confidenceThreshold = 85,
  onRequestReScan,
  onCreateLedgerRecord,
  isApproved = false,
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

  const selectedFieldData = selectedFieldKey ? (document[selectedFieldKey as keyof ExtractedDocument] as any) : null;
  const isSelectedFieldLowConf = selectedFieldData && (selectedFieldData.confidence < confidenceThreshold);

  return (
    <div className="flex flex-col h-full bg-slate-900/95 rounded-3xl border border-slate-800 text-slate-100 overflow-hidden shadow-2xl">
      
      {/* Panel Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">
            Bandeja de Auditoría en 5 Segundos
          </span>
          <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
            <span className="truncate max-w-[200px] sm:max-w-xs">{document.emisor?.value || 'Comprobante sin identificar'}</span>
          </h2>
        </div>

        {/* Status Badge */}
        {isApproved ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-sm">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>✓ Auditado y Aprobado</span>
          </span>
        ) : reconciliation.status === 'AUDITADO_OK' ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Auditado OK (Cuadra)</span>
          </span>
        ) : reconciliation.status === 'REVISION_REQUERIDA' ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/40 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Revisión en 5s Requerida</span>
          </span>
        ) : reconciliation.status === 'DUPLICADO_DETECTADO' ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/40 text-xs font-bold">
            <RotateCcw className="w-4 h-4" />
            <span>Factura Duplicada</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 text-xs font-bold">
            <XCircle className="w-4 h-4" />
            <span>Discrepancia Contable</span>
          </span>
        )}
      </div>

      {/* Scrollable Audit Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Visual Crop Focused Card (When a field is selected or low-conf) */}
        {selectedFieldKey && selectedFieldData && (
          <div className={`p-4 rounded-2xl border transition-all ${
            isSelectedFieldLowConf 
              ? 'bg-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-950/30' 
              : 'bg-slate-950/80 border-indigo-500/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ZoomIn className={`w-4 h-4 ${isSelectedFieldLowConf ? 'text-amber-400' : 'text-indigo-400'}`} />
                <span>Recorte Enfocado: <strong className="text-indigo-300 uppercase">{selectedFieldKey}</strong></span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isSelectedFieldLowConf ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Certeza: {selectedFieldData.confidence}%
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Valor leído en el comprobante:</span>
                <span className="font-mono text-sm font-bold text-white block mt-0.5">
                  {typeof selectedFieldData.value === 'number'
                    ? formatCurrency(selectedFieldData.value)
                    : String(selectedFieldData.value || 'No legible')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEdit(selectedFieldKey, selectedFieldData.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Corregir</span>
                </button>
                <button
                  onClick={() => onUpdateField(selectedFieldKey, selectedFieldData.value)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirmar</span>
                </button>
              </div>
            </div>
            {selectedFieldData.uncertaintyReason && (
              <p className="text-[11px] text-amber-300/90 mt-2.5 italic leading-relaxed">
                💡 Motivo de duda: {selectedFieldData.uncertaintyReason}
              </p>
            )}
          </div>
        )}

        {/* Core Findings & Low Confidence Alerts */}
        {reconciliation.findings.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Hallazgos y Puntos de Incertidumbre
            </span>
            {reconciliation.findings.map((finding, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs transition ${
                  finding.type === 'error'
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                    : finding.type === 'warning'
                    ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {finding.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                  {finding.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  {finding.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <span className="font-bold block text-white">{finding.title}</span>
                    <p className="mt-0.5 opacity-90 leading-relaxed">{finding.description}</p>
                    {finding.actionNeeded && (
                      <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-200 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-700">
                        <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
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
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Verificación Aritmética Determinista</span>
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
              reconciliation.arithmetic.isClean
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {reconciliation.arithmetic.isClean ? 'CÁLCULO EXACTO' : 'DESCUADRE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Suma de Ítems</span>
              <span className="font-mono font-bold text-slate-200 block text-sm mt-0.5">
                {formatCurrency(reconciliation.arithmetic.itemsSumActual)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Esperado: {formatCurrency(reconciliation.arithmetic.itemsSumExpected)}
              </span>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Subtotal + Impuestos</span>
              <span className="font-mono font-bold text-slate-200 block text-sm mt-0.5">
                {formatCurrency(reconciliation.arithmetic.taxExpected)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Impreso: {formatCurrency(reconciliation.arithmetic.taxActual)}
              </span>
            </div>
          </div>
        </div>

        {/* Company Ledger Match Status & 1-Click Action */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Cruce con Libro Diario Contable</span>
            </span>
            {reconciliation.matchedLedgerRecord ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
                Asiento #{reconciliation.matchedLedgerRecord.id}
              </span>
            ) : (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                Sin Asiento Previo
              </span>
            )}
          </div>

          {reconciliation.matchedLedgerRecord ? (
            <div className="text-xs space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Proveedor registrado:</span>
                <span className="font-bold text-white">{reconciliation.matchedLedgerRecord.proveedor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monto en Libro:</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(reconciliation.matchedLedgerRecord.monto)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Factura declarada:</span>
                <span className="font-mono text-slate-300">{reconciliation.matchedLedgerRecord.numero_factura}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">
                No existe un asiento contable para este comprobante en el libro de la empresa.
              </p>
              {onCreateLedgerRecord && (
                <button
                  type="button"
                  onClick={() => onCreateLedgerRecord(document)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Asiento Contable Automático</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Extracted Fields Table with Confidence Scores */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Campos Extraídos y Certeza de Lectura
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
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40'
                      : isLowConf
                      ? 'bg-amber-950/25 border-amber-700/80 hover:bg-amber-950/40'
                      : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-semibold">{label}</span>
                      {isLowConf && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-extrabold">
                          DUDOSO
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type={isNumeric ? 'number' : 'text'}
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="bg-slate-900 border border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white w-full outline-none font-mono"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(key)}
                          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-100 block truncate mt-0.5 font-mono">
                        {isNumeric && typeof fieldData?.value === 'number'
                          ? formatCurrency(fieldData.value)
                          : String(fieldData?.value ?? '—')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Confidence Score Pill */}
                    <div
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 ${
                        isLowConf
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
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
                      className="p-1.5 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
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
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
        <button
          id="btn-re-scan"
          onClick={() => {
            if (onRequestReScan) {
              onRequestReScan(document);
            }
          }}
          className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition"
          title="Pedir foto nítida al emisor si está ilegible"
        >
          <Camera className="w-4 h-4" />
          <span>Pedir Re-escaneo</span>
        </button>

        <button
          id="btn-approve-audit"
          onClick={() => onApprove(document.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold shadow-xl transition ${
            isApproved
              ? 'bg-emerald-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isApproved ? '✓ Comprobante Aprobado' : 'Aprobar Comprobante (5s)'}</span>
        </button>
      </div>

    </div>
  );
};
