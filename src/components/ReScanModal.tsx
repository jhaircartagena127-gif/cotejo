import React, { useState } from 'react';
import { RefreshCw, Camera, AlertTriangle, Send, X, CheckCircle2 } from 'lucide-react';
import { ExtractedDocument } from '../types';

interface ReScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ExtractedDocument | null;
  onSubmitReScan: (docId: string, reason: string, note: string) => void;
}

export const ReScanModal: React.FC<ReScanModalProps> = ({
  isOpen,
  onClose,
  document,
  onSubmitReScan,
}) => {
  const [reason, setReason] = useState<string>('termico_borroso');
  const [customNote, setCustomNote] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen || !document) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReScan(document.id, reason, customNote);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setCustomNote('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Solicitar Re-escaneo / Foto Nítida</h3>
              <p className="text-xs text-slate-400 font-mono">{document.fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-base font-bold text-white">¡Solicitud generada con éxito!</p>
            <p className="text-xs text-slate-400">
              Se ha marcado el comprobante como "Re-escaneo Solicitado" y se adjuntó el motivo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-200">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Criterio del Auditor:
              </p>
              <p className="opacity-90 leading-relaxed">
                Si un ticket térmico se desvaneció o la foto tiene sombras intensas que impiden leer el CUIT o el total con certeza, solicitamos al emisor o empleado una nueva toma.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">Motivo principal:</label>
              <div className="space-y-1.5">
                {[
                  { id: 'termico_borroso', label: 'Papel térmico desvanecido o tinta borrosa en montos' },
                  { id: 'foto_inclinada_sombra', label: 'Foto inclinada o con sombra que tapa los datos del emisor/CUIT' },
                  { id: 'comprobante_arrugado_cortado', label: 'Comprobante arrugado, roto o encabezado cortado' },
                  { id: 'mancha_de_liquido', label: 'Mancha sobre el total o la fecha de emisión' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      reason === opt.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reScanReason"
                      value={opt.id}
                      checked={reason === opt.id}
                      onChange={(e) => setReason(e.target.value)}
                      className="accent-indigo-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Instrucción adicional para el usuario / emisor (opcional):
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ej: Por favor tomar la foto en una superficie plana con luz natural, sin flash..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Solicitud</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
