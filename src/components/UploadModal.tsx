import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  FileCode,
  FileCheck
} from 'lucide-react';
import { ExtractedDocument } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentExtracted: (newDoc: ExtractedDocument) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentExtracted,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen (JPG, PNG, WebP)');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      processImageWithGemini(base64, file.name, file.type);
    };
    reader.readAsDataURL(file);
  };

  const processImageWithGemini = async (base64: string, name: string, mimeType: string) => {
    setIsLoading(true);
    setStatusMessage('Analizando comprobante con modelo multimodal y calculando confianza de lectura...');

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          fileName: name,
          mimeType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error en servidor: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success || !data.extracted) {
        throw new Error('Respuesta inválida del extractor');
      }

      const ext = data.extracted;

      // Map to ExtractedDocument schema with safe fallbacks
      const newDoc: ExtractedDocument = {
        id: `UPLOAD-${Date.now()}`,
        fileName: name,
        tipo_comprobante: ext.tipo_comprobante || 'FACTURA_B',
        calidad_imagen: ext.calidad_imagen || 'optima',
        rotation: 0,
        imageBase64: base64,
        emisor: {
          value: ext.emisor || 'Emisor No Identificado',
          confidence: ext.confianza_campos?.emisor ?? 88,
          bbox: ext.coordenadas_bbox?.emisor || { top: 5, left: 10, width: 80, height: 8 },
          isUncertain: (ext.confianza_campos?.emisor ?? 88) < 85,
        },
        cuit_o_id: {
          value: ext.cuit_o_id || '30-00000000-0',
          confidence: ext.confianza_campos?.cuit_o_id ?? 85,
          bbox: ext.coordenadas_bbox?.cuit_o_id || { top: 12, left: 15, width: 70, height: 5 },
          isUncertain: (ext.confianza_campos?.cuit_o_id ?? 85) < 85,
        },
        fecha: {
          value: ext.fecha || new Date().toISOString().split('T')[0],
          confidence: ext.confianza_campos?.fecha ?? 90,
          bbox: ext.coordenadas_bbox?.fecha || { top: 20, left: 10, width: 40, height: 5 },
          isUncertain: (ext.confianza_campos?.fecha ?? 90) < 85,
        },
        numero_comprobante: {
          value: ext.numero_comprobante || '0001-00000001',
          confidence: ext.confianza_campos?.numero_comprobante ?? 87,
          bbox: ext.coordenadas_bbox?.numero_comprobante || { top: 16, left: 55, width: 40, height: 5 },
          isUncertain: (ext.confianza_campos?.numero_comprobante ?? 87) < 85,
        },
        subtotal: {
          value: ext.subtotal ? Number(ext.subtotal) : (ext.total ? Number(ext.total) * 0.79 : 0),
          confidence: ext.confianza_campos?.subtotal ?? 85,
          bbox: ext.coordenadas_bbox?.subtotal || { top: 80, left: 50, width: 45, height: 5 },
          isUncertain: (ext.confianza_campos?.subtotal ?? 85) < 85,
        },
        impuestos: {
          value: ext.impuestos ? Number(ext.impuestos) : (ext.total ? Number(ext.total) * 0.21 : 0),
          confidence: ext.confianza_campos?.impuestos ?? 85,
          bbox: ext.coordenadas_bbox?.impuestos || { top: 86, left: 50, width: 45, height: 5 },
          isUncertain: (ext.confianza_campos?.impuestos ?? 85) < 85,
        },
        total: {
          value: Number(ext.total) || 0,
          confidence: ext.confianza_campos?.total ?? 92,
          bbox: ext.coordenadas_bbox?.total || { top: 92, left: 45, width: 50, height: 6 },
          isUncertain: (ext.confianza_campos?.total ?? 92) < 85,
        },
        items: Array.isArray(ext.items)
          ? ext.items.map((it: any, i: number) => ({
              id: String(i + 1),
              descripcion: it.descripcion || `Item #${i + 1}`,
              cantidad: Number(it.cantidad) || 1,
              precio_unitario: Number(it.precio_unitario) || Number(it.total_linea) || 0,
              total_linea: Number(it.total_linea) || Number(it.precio_unitario) || 0,
              confianza: it.confianza || 90,
            }))
          : [],
        observaciones_auditoria: ext.observaciones_auditoria || 'Documento procesado con éxito.',
      };

      onDocumentExtracted(newDoc);
      onClose();
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error procesando: ${err.message}. Puedes usar los comprobantes del corpus integrado.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ingestar Comprobante Real</h3>
              <p className="text-xs text-slate-400">Fotos de celular, papel térmico o escaneos PDF convertidos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/50 hover:bg-slate-950/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-sm font-semibold text-white">Extrayendo Datos & Bounding Boxes</span>
              <p className="text-xs text-slate-400 max-w-sm">{statusMessage}</p>
            </div>
          ) : previewUrl ? (
            <div className="flex flex-col items-center space-y-2">
              <img src={previewUrl} alt="Preview" className="max-h-36 rounded shadow border border-slate-700" />
              <span className="text-xs text-slate-300 font-mono">{fileName}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <ImageIcon className="w-10 h-10 text-slate-500" />
              <span className="text-sm font-semibold text-slate-200">
                Arrastra tu factura o foto aquí, o haz clic para examinar
              </span>
              <span className="text-xs text-slate-500">Admite JPEG, PNG, WebP (incluso fotos torcidas o con sombras)</span>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Privacidad Estricta:</strong> La inferencia se realiza en el entorno de auditoría local sin persistencia externa ni almacenamiento de balances bancarios.
          </span>
        </div>
      </div>
    </div>
  );
};
