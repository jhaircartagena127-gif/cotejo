import React, { useEffect, useState } from 'react';
import { Play, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Download, X, Layers, Sparkles } from 'lucide-react';
import { AuditStats, ExtractedDocument, ReconciliationResult } from '../types';

interface BatchAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: ExtractedDocument[];
  reconciliationsMap: Map<string, ReconciliationResult>;
  stats: AuditStats;
  onExportCsv: () => void;
}

export const BatchAuditModal: React.FC<BatchAuditModalProps> = ({
  isOpen,
  onClose,
  documents,
  reconciliationsMap,
  stats,
  onExportCsv,
}) => {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [currentScanningIndex, setCurrentScanningIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsScanning(true);
      setCurrentScanningIndex(0);
      return;
    }

    setIsScanning(true);
    setProgress(0);
    const total = documents.length || 1;
    let curr = 0;

    const interval = setInterval(() => {
      curr++;
      setCurrentScanningIndex(Math.min(curr, total - 1));
      const nextProgress = Math.min(100, Math.round((curr / total) * 100));
      setProgress(nextProgress);

      if (curr >= total) {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
        }, 300);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [isOpen, documents.length]);

  if (!isOpen) return null;

  const currentDoc = documents[currentScanningIndex];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Auditoría Aritmética y de Lote en Ejecución</h3>
              <p className="text-xs text-slate-400">Verificando {documents.length} comprobantes contra el libro diario</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isScanning ? (
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Auditando: {currentDoc?.fileName || 'Comprobante...'}
                </span>
                <span className="font-mono text-white">{progress}%</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-1">
              <p className="text-slate-300">
                &gt; Chequeando integridad aritmética en comprobante: {currentDoc?.id}
              </p>
              <p className="text-slate-400">
                &gt; Confianza de lectura campo total: {currentDoc?.total.confidence}% | Calidad: {currentDoc?.calidad_imagen}
              </p>
              <p className="text-emerald-400">
                &gt; Cruce con Libro Diario en proceso sin conexión a servidores externos...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 text-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">¡Lote Auditado al 100%!</h4>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  Se analizaron los {documents.length} comprobantes. Cotejo identificó los que cuadran y aisló los casos que requieren 5 segundos de atención humana.
                </p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-medium block">Total Analizado</span>
                <span className="text-2xl font-mono font-bold text-white mt-1 block">{stats.totalProcessed}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-900/40 text-center">
                <span className="text-[11px] text-emerald-400 font-medium block">Auditados OK</span>
                <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">{stats.totalApproved}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-900/40 text-center">
                <span className="text-[11px] text-amber-400 font-medium block">A Revisar (&lt;85%)</span>
                <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">{stats.totalPendingReview}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-rose-900/40 text-center">
                <span className="text-[11px] text-rose-400 font-medium block">No Cierran / Duplicados</span>
                <span className="text-2xl font-mono font-bold text-rose-400 mt-1 block">{stats.totalDiscrepancies + stats.totalDuplicates}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={onExportCsv}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Exportar Reporte Excel / CSV</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
              >
                Ver Comprobantes en el Auditor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
