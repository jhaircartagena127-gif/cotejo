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
  Keyboard,
  FileType,
  Image as ImageIcon,
  Zap,
  Info,
  Sun,
  Moon,
  MousePointer2,
  Map as MapIcon,
  Crosshair,
  ShieldAlert
} from 'lucide-react';
import { ExtractedDocument, BoundingBox } from '../types';
import { generateReceiptSvg } from '../data/corpus';

interface DocumentViewerProps {
  document: ExtractedDocument;
  highlightField?: string | null;
  onSelectField?: (fieldKey: string) => void;
  confidenceThreshold?: number;
  allDocs?: ExtractedDocument[];
  onSelectDocument?: (docId: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  highlightField,
  onSelectField,
  confidenceThreshold = 85,
  allDocs = [],
  onSelectDocument,
}) => {
  const [rotation, setRotation] = useState<number>(document.rotation || 0);
  const [zoom, setZoom] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [isMagnifying, setIsMagnifying] = useState<boolean>(false);
  const [docTheme, setDocTheme] = useState<'light' | 'dark'>('light');
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [scrollStats, setScrollStats] = useState({ top: 0, left: 0, w: 100, h: 100 });
  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);

  // Sync state when document changes
  useEffect(() => {
    setRotation(document.rotation || 0);
    setZoom(1);
    setIsMagnifying(false);
  }, [document.id, document.rotation]);

  // Keyboard shortcut listener for fast auditor workflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'r' || e.key === 'R') {
        setRotation((prev) => (prev + 90) % 360);
      } else if (e.key === '+' || e.key === '=') {
        setZoom((prev) => Math.min(prev + 0.25, 3.0));
      } else if (e.key === '-' || e.key === '_') {
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
      } else if (e.key === '0') {
        setZoom(1);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMagnifying((prev) => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        setShowBoxes((prev) => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        setDocTheme((prev) => prev === 'light' ? 'dark' : 'light');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!docRef.current || !isMagnifying) return;
    const rect = docRef.current.getBoundingClientRect();
    // Calculate relative position within the document element
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = containerRef.current;
    setScrollStats({
      top: scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0,
      left: scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0,
      h: scrollHeight > 0 ? (clientHeight / scrollHeight) * 100 : 100,
      w: scrollWidth > 0 ? (clientWidth / scrollWidth) * 100 : 100,
    });
  };

  useEffect(() => {
    handleScroll();
  }, [zoom, rotation]);

  // Fields to overlay on document
  const boxFields: { key: string; label: string; bbox?: BoundingBox; confidence: number; value: any }[] = [
    { key: 'emisor', label: 'Emisor', bbox: document.emisor?.bbox, confidence: document.emisor?.confidence ?? 90, value: document.emisor?.value },
    { key: 'cuit_o_id', label: 'CUIT', bbox: document.cuit_o_id?.bbox, confidence: document.cuit_o_id?.confidence ?? 90, value: document.cuit_o_id?.value },
    { key: 'fecha', label: 'Fecha', bbox: document.fecha?.bbox, confidence: document.fecha?.confidence ?? 90, value: document.fecha?.value },
    { key: 'numero_comprobante', label: 'Nº Comprobante', bbox: document.numero_comprobante?.bbox, confidence: document.numero_comprobante?.confidence ?? 90, value: document.numero_comprobante?.value },
    { key: 'subtotal', label: 'Subtotal', bbox: document.subtotal?.bbox, confidence: document.subtotal?.confidence ?? 90, value: document.subtotal?.value },
    { key: 'impuestos', label: 'IVA', bbox: document.impuestos?.bbox, confidence: document.impuestos?.confidence ?? 90, value: document.impuestos?.value },
    { key: 'total', label: 'TOTAL', bbox: document.total?.bbox, confidence: document.total?.confidence ?? 90, value: document.total?.value },
  ].filter(f => f.bbox);

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

  const docQualityLabel = document.calidad_imagen.replace('_', ' ').toUpperCase();
  const isOptimal = document.calidad_imagen === 'optima';

  return (
    <div className="flex flex-col h-full bg-slate-900/95 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
      
      {/* 1) Top Header Strip with Document Identity */}
      <div className="p-4 bg-slate-900 border-b border-slate-800/80 shadow-sm z-20 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0 shadow-inner">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
                  Visor de Documento
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[9px] text-slate-300 font-bold border border-slate-700">
                  #{document.id}
                </span>
              </div>
              <h3 className="font-bold text-white text-base truncate mt-0.5">{document.fileName}</h3>
            </div>
          </div>

          {/* Badges / Document Quality */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800/80 text-indigo-300 border border-slate-700 shadow-sm flex items-center gap-1.5">
              <FileType className="w-3.5 h-3.5" />
              {document.tipo_comprobante}
            </span>
            <div className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 shadow-sm border ${
              isOptimal ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              document.calidad_imagen === 'termico_desvanecido' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              document.calidad_imagen === 'torcida' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {isOptimal ? <Zap className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              {docQualityLabel}
            </div>
          </div>
        </div>

        {/* 2) Toolbar Controls - Better Grouped */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/50">
          
          {/* Preset difficulty switcher */}
          {onSelectDocument && allDocs.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide text-xs">
              <span className="text-slate-500 font-semibold pr-1 hidden sm:block">Casos:</span>
              {allDocs.slice(0, 4).map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelectDocument(d.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap border ${
                    d.id === document.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-105'
                      : 'bg-slate-800/50 text-slate-400 border-transparent hover:text-white hover:bg-slate-700 hover:border-slate-600'
                  }`}
                >
                  {d.calidad_imagen === 'termico_desvanecido' ? '🟡 Térmico' :
                   d.calidad_imagen === 'torcida' ? '🔵 Inclinado' :
                   d.calidad_imagen === 'manchada' ? '☕ Manchado' : '🟢 Óptimo'}
                </button>
              ))}
            </div>
          )}

          {/* Tools */}
          <div className="flex items-center gap-2 text-slate-300 ml-auto bg-slate-950/50 p-1 rounded-2xl border border-slate-800/80">
            {/* Theme Toggle */}
            <button
              onClick={() => setDocTheme(t => t === 'light' ? 'dark' : 'light')}
              className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
              title="Alternar fondo (Atajo: D)"
            >
              {docTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div className="w-px h-5 bg-slate-800 mx-1" />

            {/* Transform Tools */}
            <div className="flex items-center gap-1">
              <button onClick={handleRotate} className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white" title="Girar 90º (R)">
                <RotateCw className="w-4 h-4" />
              </button>
              <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white" title="Reducir zoom (-)">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs w-10 text-center text-slate-300 font-bold select-none">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white" title="Aumentar zoom (+)">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={handleResetZoom} className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white" title="Restablecer tamaño (0)">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-5 bg-slate-800 mx-1" />

            {/* Overlay Tools */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowBoxes(!showBoxes)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  showBoxes ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 shadow-inner' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800'
                }`}
                title="Cajas delimitadoras (B)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Recortes</span>
              </button>
              <button
                onClick={() => setIsMagnifying(!isMagnifying)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isMagnifying ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-inner' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800'
                }`}
                title="Lupa (M)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lupa</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3) Main Interactive Stage */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-8 min-h-[440px] select-none"
      >
        <div 
          ref={docRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isMagnifying && setLensPos({ x: 50, y: 50 })}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transformOrigin: 'center center',
          }}
          className={`relative max-w-[480px] w-full shadow-2xl rounded-2xl overflow-hidden border transition-colors duration-300 ${
            docTheme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
          }`}
        >
          {/* Document Content */}
          <div className={`transition-opacity duration-300 ${docTheme === 'dark' && document.imageBase64 ? 'opacity-80' : 'opacity-100'}`}>
            {document.imageBase64 ? (
              <img 
                src={document.imageBase64} 
                alt={document.fileName}
                className="w-full h-auto object-contain block pointer-events-none"
                referrerPolicy="no-referrer"
              />
            ) : svgContent ? (
              <div 
                className={`w-full h-auto pointer-events-none ${docTheme === 'dark' ? 'invert hue-rotate-180' : ''}`}
                dangerouslySetInnerHTML={{ __html: svgContent }} 
              />
            ) : null}
          </div>

          {/* Bounding Box Overlays */}
          {showBoxes && boxFields.map((field) => {
            const isSelected = highlightField === field.key;
            const isLowConf = field.confidence < confidenceThreshold;
            const isHovered = hoveredField === field.key;

            return (
              <div
                key={field.key}
                onMouseEnter={() => setHoveredField(field.key)}
                onMouseLeave={() => setHoveredField(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectField?.(field.key);
                }}
                style={{
                  position: 'absolute',
                  top: `${field.bbox!.top}%`,
                  left: `${field.bbox!.left}%`,
                  width: `${field.bbox!.width}%`,
                  height: `${field.bbox!.height}%`,
                }}
                className={`cursor-pointer rounded-xl transition-all duration-200 group z-10 ${
                  isSelected
                    ? 'ring-4 ring-indigo-400 bg-indigo-500/20 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                    : isLowConf
                    ? 'border-[3px] border-dashed border-amber-400/80 bg-amber-500/10 hover:bg-amber-500/20 hover:scale-[1.02]'
                    : 'border-2 border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 hover:scale-[1.02]'
                }`}
              >
                {/* Minimal Indicator (always visible) */}
                <div className={`absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform ${isHovered || isSelected ? 'scale-110' : 'scale-100'} ${
                  isLowConf ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  {isLowConf ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>

                {/* 4) Rich Hover Tooltip */}
                {(isHovered || isSelected) && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white border border-slate-700 p-3 rounded-2xl text-xs shadow-2xl z-40 w-48 font-sans cursor-default pointer-events-auto transform animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-extrabold text-indigo-300">{field.label}</span>
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${isLowConf ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {field.confidence}%
                      </span>
                    </div>
                    
                    {/* Confidence Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isLowConf ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${field.confidence}%` }}
                      />
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl mb-2 border border-slate-800/80 overflow-hidden">
                      <p className="text-white font-mono font-bold truncate" title={String(field.value)}>{String(field.value ?? '—')}</p>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); onSelectField?.(field.key); }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-wide transition-colors"
                    >
                      <MousePointer2 className="w-3 h-3" />
                      Auditar Campo
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 8) Magnifying Loupe Window (Shows true document content scaled up) */}
        {isMagnifying && (
          <div 
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 50,
            }}
            className="w-56 h-56 rounded-full border-[6px] border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.3)] bg-slate-900 overflow-hidden flex items-center justify-center"
          >
            {/* The zoomed content inside loupe */}
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-white">
              <div 
                style={{
                  width: '480px', // Original width of doc container
                  transformOrigin: '0 0',
                  transform: `scale(2.5) translate(calc(-${lensPos.x}% + 45px), calc(-${lensPos.y}% + 45px))`, // Approximate center alignment
                }}
              >
                {document.imageBase64 ? (
                  <img src={document.imageBase64} alt="" className="w-full h-auto block" />
                ) : svgContent ? (
                  <div className="w-full h-auto" dangerouslySetInnerHTML={{ __html: svgContent }} />
                ) : null}
              </div>
            </div>
            
            {/* Crosshair & Info Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Crosshair className="w-8 h-8 text-amber-500/50" />
            </div>
            <div className="absolute bottom-2 bg-slate-900/90 text-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/50 backdrop-blur-sm">
              LUPA 2.5x
            </div>
          </div>
        )}

        {/* 1) Mini-map Thumbnail */}
        {zoom > 1 && (
          <div className="absolute bottom-6 right-6 w-24 h-32 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-2xl p-2 z-30 flex flex-col pointer-events-none">
            <div className="flex items-center justify-between mb-1">
              <MapIcon className="w-3 h-3 text-slate-400" />
              <span className="text-[9px] font-mono text-slate-400 font-bold">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
              {/* Fake doc preview */}
              <div className="w-16 h-20 bg-slate-800 rounded-sm relative">
                {/* Viewport Indicator */}
                <div 
                  className="absolute bg-indigo-500/30 border border-indigo-400 rounded-sm transition-all"
                  style={{
                    top: `${scrollStats.top}%`,
                    left: `${scrollStats.left}%`,
                    width: `${scrollStats.w}%`,
                    height: `${scrollStats.h}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7) Field Navigation Strip (Interactive chips) */}
      {boxFields.length > 0 && (
        <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex items-center gap-3 overflow-x-auto scrollbar-hide z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
          <div className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            Campos:
          </div>
          {boxFields.map(f => (
            <button
              key={f.key}
              onClick={() => onSelectField?.(f.key)}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                highlightField === f.key 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md scale-105'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-80">{f.label}</span>
              <span className="w-px h-3 bg-slate-700" />
              <span className="text-xs font-mono font-bold truncate max-w-[100px]">{String(f.value || '')}</span>
              <div className={`w-2 h-2 rounded-full ${f.confidence < confidenceThreshold ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </button>
          ))}
        </div>
      )}

      {/* 6) Footer Info Strip with Hover Legend */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 group relative z-30">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Hacé clic en cualquier recuadro o píldora para auditar el recorte visual.</span>
        </div>
        
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
            <span className="text-emerald-400 font-bold">&gt;85% Certeza</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>
            <span className="text-amber-400 font-bold">Revisión Requerida</span>
          </div>
          
          {/* Expandable Keyboard Shortcuts */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 pl-2 border-l border-slate-800 relative cursor-help">
            <Keyboard className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            <span className="font-semibold">Atajos</span>
            
            {/* Popover Legend */}
            <div className="absolute bottom-full right-0 mb-3 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-3 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
              <div className="text-xs font-extrabold text-white mb-2 pb-2 border-b border-slate-800">Atajos de Teclado</div>
              <div className="space-y-2">
                {[
                  { k: 'R', l: 'Girar 90º' },
                  { k: '+ / -', l: 'Zoom In / Out' },
                  { k: '0', l: 'Restablecer Zoom' },
                  { k: 'M', l: 'Activar Lupa' },
                  { k: 'B', l: 'Mostrar Recortes' },
                  { k: 'D', l: 'Tema Claro/Oscuro' }
                ].map(s => (
                  <div key={s.k} className="flex items-center justify-between">
                    <span className="text-slate-400">{s.l}</span>
                    <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-slate-700 shadow-sm">{s.k}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
