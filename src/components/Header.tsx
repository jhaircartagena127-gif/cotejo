import React from 'react';
import { 
  ShieldCheck, 
  FileSearch, 
  BookOpen, 
  BarChart3, 
  FileText, 
  Upload, 
  Play, 
  Download, 
  LogOut, 
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { AuditStats } from '../types';
import { DemoUser } from '../lib/session';

interface HeaderProps {
  activeTab: 'auditoria' | 'libro_diario' | 'corpus_benchmark' | 'documento_tecnico';
  setActiveTab: (tab: 'auditoria' | 'libro_diario' | 'corpus_benchmark' | 'documento_tecnico') => void;
  onOpenUpload: () => void;
  onRunBatchAudit: () => void;
  onExportCsv: () => void;
  stats: AuditStats;
  isRunningBatch: boolean;
  user: DemoUser;
  onLogout: () => void;
  showGuideBanner?: boolean;
  onToggleGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onRunBatchAudit,
  onExportCsv,
  stats,
  isRunningBatch,
  user,
  onLogout,
  showGuideBanner = false,
  onToggleGuide,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Quick Status Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verde = Cuadra
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Amarillo = Revisar en 5s
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-rose-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Rojo = No cierra
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <span>
            <span className="text-slate-400">Lote:</span>{' '}
            <span className="font-mono font-bold text-white">{stats.totalProcessed} docs</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">
            ✓ {stats.totalApproved} auditados
          </span>
          {stats.totalPendingReview > 0 && (
            <div className="flex items-center gap-1 text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>{stats.totalPendingReview} a revisar</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">COTEJO</h1>
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Auditor
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Te dice en qué comprobantes no confiar</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            id="tab-auditoria"
            onClick={() => setActiveTab('auditoria')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'auditoria'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>Comprobantes</span>
          </button>

          <button
            id="tab-libro-diario"
            onClick={() => setActiveTab('libro_diario')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'libro_diario'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Libro Diario</span>
          </button>

          <button
            id="tab-corpus"
            onClick={() => setActiveTab('corpus_benchmark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'corpus_benchmark'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Benchmark 50 Docs</span>
          </button>

          <button
            id="tab-documento"
            onClick={() => setActiveTab('documento_tecnico')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'documento_tecnico'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Cómo funciona</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onToggleGuide && (
            <button
              onClick={onToggleGuide}
              className={`p-2 rounded-xl text-xs border transition ${
                showGuideBanner
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
              }`}
              title="Mostrar u ocultar Guía Rápida de 20s"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          <button
            id="btn-upload-receipt"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Subir foto</span>
          </button>

          <button
            id="btn-run-batch"
            onClick={onRunBatchAudit}
            disabled={isRunningBatch}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningBatch ? 'animate-spin' : ''}`} />
            <span>{isRunningBatch ? 'Auditando...' : 'Auditar Lote'}</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={onExportCsv}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs border border-slate-700 transition"
            title="Descargar Reporte CSV / Excel"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* User Profile Pill & Logout */}
          <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-slate-800">
            <div className="text-right">
              <p className="text-xs font-bold text-white max-w-[130px] truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700 text-slate-400 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
