import React, { useState } from 'react';
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
  HelpCircle,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hasPending = stats.totalPendingReview > 0;
  
  // Calculate initials for avatar
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 text-slate-100 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Brand & Integrated Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-900/50 ring-1 ring-indigo-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-sans leading-none">COTEJO</h1>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30">
                  Auditor
                </span>
              </div>
            </div>
          </div>

          {/* Integrated Status Dots */}
          <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-white/10">
            <div className="group relative flex items-center justify-center cursor-help" title="Verde = Cuadra">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            </div>
            <div className="group relative flex items-center justify-center cursor-help" title="Amarillo = Revisar en 5s">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"></div>
            </div>
            <div className="group relative flex items-center justify-center cursor-help" title="Rojo = No cierra">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
            </div>
            
            <div className="ml-3 text-[11px] font-medium text-slate-400 flex gap-3">
              <span>Lote: <span className="text-slate-200 font-mono">{stats.totalProcessed}</span> docs</span>
              <span className="text-emerald-400/90">✓ {stats.totalApproved} aud</span>
            </div>
          </div>
        </div>

        {/* Center Section: Main Nav (Desktop) */}
        <nav className="hidden md:flex items-center h-full space-x-1">
          <button
            onClick={() => handleTabClick('auditoria')}
            className={`relative h-full px-4 flex items-center gap-2 text-sm font-medium transition-colors ${
              activeTab === 'auditoria' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>Comprobantes</span>
            {hasPending && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/20 px-1 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/30">
                {stats.totalPendingReview}
              </span>
            )}
            {activeTab === 'auditoria' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.6)]" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('libro_diario')}
            className={`relative h-full px-4 flex items-center gap-2 text-sm font-medium transition-colors ${
              activeTab === 'libro_diario' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Libro Diario</span>
            {activeTab === 'libro_diario' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.6)]" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('corpus_benchmark')}
            className={`relative h-full px-4 flex items-center gap-2 text-sm font-medium transition-colors ${
              activeTab === 'corpus_benchmark' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Benchmark</span>
            {activeTab === 'corpus_benchmark' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.6)]" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('documento_tecnico')}
            className={`relative h-full px-4 flex items-center gap-2 text-sm font-medium transition-colors ${
              activeTab === 'documento_tecnico' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documentación</span>
            {activeTab === 'documento_tecnico' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.6)]" />
            )}
          </button>
        </nav>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Visual Group for Actions */}
          <div className="hidden sm:flex items-center p-1 bg-slate-900/50 rounded-xl ring-1 ring-white/5">
            {onToggleGuide && (
              <button
                onClick={onToggleGuide}
                className={`p-2 rounded-lg text-xs transition-colors ${
                  showGuideBanner
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Mostrar/Ocultar Guía (Ctrl+H)"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onExportCsv}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Descargar Reporte (Ctrl+E)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenUpload}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium ring-1 ring-white/10 transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Subir</span>
            <kbd className="hidden lg:inline-block ml-1 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-1.5 rounded">⌘U</kbd>
          </button>

          <button
            onClick={onRunBatchAudit}
            disabled={isRunningBatch}
            className={`flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all ${
              hasPending && !isRunningBatch ? 'animate-[pulse_2s_ease-in-out_infinite] ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-slate-950' : ''
            }`}
          >
            <Play className={`w-4 h-4 ${isRunningBatch ? 'animate-spin' : ''}`} />
            <span>{isRunningBatch ? 'Auditando...' : 'Auditar Lote'}</span>
            <kbd className="hidden lg:inline-block ml-1 text-[10px] font-mono text-indigo-200/70 bg-indigo-900/50 px-1.5 rounded">⌘↵</kbd>
          </button>

          {/* Profile & Mobile Menu Toggle */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-200 max-w-[100px] truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-inner ring-1 ring-white/10">
                {initials}
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="hidden sm:block p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-white/10 p-4 space-y-4">
          <nav className="flex flex-col space-y-2">
            {[
              { id: 'auditoria', icon: FileSearch, label: 'Comprobantes' },
              { id: 'libro_diario', icon: BookOpen, label: 'Libro Diario' },
              { id: 'corpus_benchmark', icon: BarChart3, label: 'Benchmark' },
              { id: 'documento_tecnico', icon: FileText, label: 'Documentación' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as typeof activeTab)}
                className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </div>
                {tab.id === 'auditoria' && hasPending && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[11px] font-bold text-amber-400 ring-1 ring-amber-500/30">
                    {stats.totalPendingReview}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
            <button
              onClick={onOpenUpload}
              className="flex items-center justify-center gap-2 p-2 bg-slate-900 rounded-lg text-sm text-slate-300"
            >
              <Upload className="w-4 h-4 text-indigo-400" /> Subir
            </button>
            <button
              onClick={onExportCsv}
              className="flex items-center justify-center gap-2 p-2 bg-slate-900 rounded-lg text-sm text-slate-300"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 p-2 col-span-2 mt-2 text-rose-400 bg-rose-500/10 rounded-lg text-sm"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
