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
  WifiOff, 
  Cpu, 
  AlertTriangle 
} from 'lucide-react';
import { AuditStats } from '../types';

interface HeaderProps {
  activeTab: 'auditoria' | 'libro_diario' | 'corpus_benchmark' | 'documento_tecnico';
  setActiveTab: (tab: 'auditoria' | 'libro_diario' | 'corpus_benchmark' | 'documento_tecnico') => void;
  onOpenUpload: () => void;
  onRunBatchAudit: () => void;
  onExportCsv: () => void;
  stats: AuditStats;
  isRunningBatch: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onRunBatchAudit,
  onExportCsv,
  stats,
  isRunningBatch,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      {/* Top Banner with Hackathon Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            <span>100% Inferencia Local Offline</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Cpu className="w-3.5 h-3.5" />
            <span>Aritmética Determinista en Código</span>
          </div>
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            <span className="font-mono">QVAC Track — Aleph 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Lote auditado:</span>
            <span className="font-semibold text-white">{stats.totalProcessed} docs</span>
          </div>
          {stats.totalPendingReview > 0 && (
            <div className="flex items-center gap-1 text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{stats.totalPendingReview} por revisar</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">COTEJO</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Auditor
              </span>
            </div>
            <p className="text-xs text-slate-400">El auditor que te dice en qué no confiar</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            id="tab-auditoria"
            onClick={() => setActiveTab('auditoria')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'auditoria'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>Auditoría & Recortes</span>
          </button>

          <button
            id="tab-libro-diario"
            onClick={() => setActiveTab('libro_diario')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'libro_diario'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Libro Diario</span>
          </button>

          <button
            id="tab-corpus"
            onClick={() => setActiveTab('corpus_benchmark')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'corpus_benchmark'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Evidencia 50 Docs</span>
          </button>

          <button
            id="tab-documento"
            onClick={() => setActiveTab('documento_tecnico')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'documento_tecnico'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Guion & Tesis</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-upload-receipt"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ingestar Foto / PDF</span>
          </button>

          <button
            id="btn-run-batch"
            onClick={onRunBatchAudit}
            disabled={isRunningBatch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium shadow-md shadow-indigo-600/20 transition"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningBatch ? 'animate-spin' : ''}`} />
            <span>{isRunningBatch ? 'Auditando Lote...' : 'Auditar Lote Completo'}</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={onExportCsv}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700 transition"
            title="Exportar Reporte Tabular CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
