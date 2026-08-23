import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Search,
  Sliders,
  HelpCircle,
  Keyboard
} from 'lucide-react';
import { ExtractedDocument, BoundingBox } from '../types';
import { generateReceiptSvg } from '../data/corpus';

interface DocumentViewerProps {
  document: ExtractedDocument;
  highlightField?: string | null;
  onSelectField?: (fieldKey: string) => void;
  confidenceThreshold?: number;
  onQuickSelectDocument?: (docId: string) => void;
  allDocs?: ExtractedDocument[];
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  highlightField,
  onSelectField,
  confidenceThreshold = 85,
  onQuickSelectDocument,
  allDocs = [],
}) => {
  const [rotation, setRotation] = useState<number>(document.rotation || 0);
  const [zoom, setZoom] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [isMagnifying, setIsMagnifying] = useState<boolean>(false);
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync rotation if document changes
  useEffect(() => {
    setRotation(document.rotation || 0);
    setZoom(1);
  }, [document.id, document.rotation]);

  // Keyboard shortcut listener for power users / auditor speed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'r' || e.key === 'R') {
        setRotation((prev) => (prev + 90) % 360);
      } else if (e.key === '+' || e.key === '=') {
        setZoom((prev) => Math.min(prev + 0.2, 2.5));
      } else if (e.key === '-' || e.key === '_') {
        setZoom((prev) => Math.max(prev - 0.2, 0.7));
      } else if (e.key === '0') {
        setZoom(1);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMagnifying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isMagnifying) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // Fields to overlay on document
  const boxFields: { key: string; label: string; bbox?: BoundingBox; confidence: number; value: any }[] = [
    { key: 'emisor', label: 'Emisor', bbox: document.emisor?.bbox, confidence: document.emisor?.confidence ?? 90, value: document.emisor?.value },
    { key: 'cuit_o_id', label: 'CUIT', bbox: document.cuit_o_id?.bbox, confidence: document.cuit_o_id?.confidence ?? 90, value: document.cuit_o_id?.value },
    { key: 'fecha', label: 'Fecha', bbox: document.fecha?.bbox, confidence: document.fecha?.confidence ?? 90, value: document.fecha?.value },
    { key: 'numero_comprobante', label: 'Nº Comprobante', bbox: document.numero_comprobante?.bbox, confidence: document.numero_comprobante?.confidence ?? 90, value: document.numero_comprobante?.value },
    { key: 'subtotal', label: 'Subtotal', bbox: document.subtotal?.bbox, confidence: document.subtotal?.confidence ?? 90, value: document.subtotal?.value },
    { key: 'impuestos', label: 'IVA', bbox: document.impuestos?.bbox, confidence: document.impuestos?.confidence ?? 90, value: document.impuestos?.value },
    { key: 'total', label: 'TOTAL', bbox: document.total?.bbox, confidence: document.total?.confidence ?? 90, value: document.total?.value },
  ];

  // SVG representation for mock corpus or image preview
  const svgContent = React.useMemo(() => {
    if (document.imageBase64) return null;
    return generateReceiptSvg(
      document.tipo_comprobante,
      String(document.emisor?.value || 'Emisor Desconocido'),
      String(document.cuit_o_id?.value || '00-00000000-0'),
      String(document.numero_comprobante?.value || '0000-00000000'),
      String(document.fecha?.value || '2026-08-22'),
      (document.items || []).map((it) => ({ desc: it.descripcion, cant: it.cantidad, precio: it.precio_unitario })),
      Number(document.total?.value || 0),
      document.calidad_imagen
    );
  }, [document]);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white max-w-[180px] sm:max-w-xs truncate">{document.fileName}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            document.calidad_imagen === 'optima' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            document.calidad_imagen === 'termico_desvanecido' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            document.calidad_imagen === 'torcida' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
            'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {document.calidad_imagen.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <button
            id="btn-rotate"
            onClick={handleRotate}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-white"
            title="Girar 90º (Atajo: R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          
          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          <button
            id="btn-zoom-out"
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-white"
            title="Reducir zoom (Atajo: -)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono text-[11px] px-1 text-slate-400 font-bold">{Math.round(zoom * 100)}%</span>

          <button
            id="btn-zoom-in"
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-white"
            title="Aumentar zoom (Atajo: +)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            id="btn-reset-zoom"
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-white text-[11px]"
            title="Ajustar tamaño 100% (Atajo: 0)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          <button
            id="btn-toggle-boxes"
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition ${
              showBoxes ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
            }`}
            title="Mostrar u ocultar cajas delimitadoras (Bounding Boxes)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Recortes</span>
          </button>

          <button
            id="btn-toggle-magnifier"
            onClick={() => setIsMagnifying(!isMagnifying)}
            className={`p-1.5 rounded-lg transition ${
              isMagnifying ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Lupa de inspección para texto dudoso (Atajo: M)"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-6 min-h-[440px] select-none"
      >
        <div 
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
            transition: 'transform 0.2s ease-out',
            transformOrigin: 'center center',
          }}
          className="relative max-w-[480px] w-full shadow-2xl rounded-xl bg-white overflow-hidden border border-slate-700"
        >
          {document.imageBase64 ? (
            <img 
              src={document.imageBase64} 
              alt={document.fileName}
              className="w-full h-auto object-contain block"
              referrerPolicy="no-referrer"
            />
          ) : svgContent ? (
            <div 
              className="w-full h-auto"
              dangerouslySetInnerHTML={{ __html: svgContent }} 
            />
          ) : null}

          {/* Bounding Box Overlays */}
          {showBoxes && boxFields.map((field) => {
            if (!field.bbox) return null;
            const isSelected = highlightField === field.key;
            const isLowConf = field.confidence < confidenceThreshold;
            const isHovered = hoveredField === field.key;

            return (
              <div
                key={field.key}
                id={`bbox-${field.key}`}
                onMouseEnter={() => setHoveredField(field.key)}
                onMouseLeave={() => setHoveredField(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectField?.(field.key);
                }}
                style={{
                  position: 'absolute',
                  top: `${field.bbox.top}%`,
                  left: `${field.bbox.left}%`,
                  width: `${field.bbox.width}%`,
                  height: `${field.bbox.height}%`,
                }}
                className={`cursor-pointer rounded-lg transition-all group z-10 ${
                  isSelected
                    ? 'ring-2 ring-indigo-400 bg-indigo-500/30 shadow-lg shadow-indigo-500/20'
                    : isLowConf
                    ? 'border-2 border-dashed border-amber-400 bg-amber-500/20 hover:bg-amber-500/30 ring-1 ring-amber-400/50'
                    : 'border border-emerald-500/80 bg-emerald-500/10 hover:bg-emerald-500/25'
                }`}
              >
                {/* Micro Tag Badge */}
                <div className={`absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-tight shadow flex items-center gap-1 ${
                  isLowConf
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {isLowConf ? <AlertCircle className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                  <span>{field.label}: {field.confidence}%</span>
                </div>

                {/* Floating Preview Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] shadow-2xl z-40 whitespace-nowrap pointer-events-none font-sans">
                    <p className="font-bold text-indigo-300">{field.label}</p>
                    <p className="text-slate-200 font-mono">{String(field.value ?? '—')}</p>
                    <p className={`text-[10px] font-bold ${isLowConf ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isLowConf ? '⚠️ Certeza dudosa (<85%)' : '✓ Alta certeza'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Magnifying Loupe Window */}
        {isMagnifying && (
          <div 
            style={{
              position: 'absolute',
              top: `${lensPos.y}%`,
              left: `${lensPos.x}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
            className="w-40 h-40 rounded-full border-4 border-amber-400 shadow-2xl overflow-hidden bg-slate-900/95 z-30 flex items-center justify-center"
          >
            <div className="text-center p-3 text-white">
              <span className="text-[10px] text-amber-300 uppercase font-extrabold tracking-wider block">Lupa 3.5x</span>
              <span className="text-xs font-mono font-bold text-white">X: {lensPos.x.toFixed(0)}% · Y: {lensPos.y.toFixed(0)}%</span>
              <span className="text-[10px] text-slate-300 block mt-1">Inspección de trazo de tinta</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Hacé clic en cualquier recuadro para auditarlo en 5 segundos.</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Certeza Alta (&gt;85%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-amber-400 font-bold">Dudoso (Pedir 5s)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-500 pl-2 border-l border-slate-800">
            <Keyboard className="w-3 h-3 text-slate-400" />
            <span>Atajos: R, +, -, M</span>
          </div>
        </div>
      </div>
    </div>
  );
};
