import React, { useState, useMemo, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Filter, 
  Search, 
  RotateCw, 
  ShieldAlert, 
  ChevronRight,
  Upload,
  Plus,
  SlidersHorizontal,
  Flame,
  Check,
  HelpCircle,
  X,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ExtractedDocument, LedgerRecord, ReconciliationResult, AuditStats } from './types';
import { BENCHMARK_CORPUS_DOCS, SAMPLE_LEDGER } from './data/corpus';
import { reconcileDocument, formatCurrency } from './utils/arithmetic';
import { Header } from './components/Header';
import { DocumentViewer } from './components/DocumentViewer';
import { ReconciliationPanel } from './components/ReconciliationPanel';
import { LedgerView } from './components/LedgerView';
import { CorpusBenchmarkView } from './components/CorpusBenchmarkView';
import { TechnicalDocView } from './components/TechnicalDocView';
import { UploadModal } from './components/UploadModal';
import { ReScanModal } from './components/ReScanModal';
import { BatchAuditModal } from './components/BatchAuditModal';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { ToastContainer, ToastMessage } from './components/Toast';
import { clearSession, DemoUser, getSession, saveSession, DEMO_ACCOUNT } from './lib/session';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'app'>(() => (getSession() ? 'app' : 'landing'));
  const [user, setUser] = useState<DemoUser | null>(() => getSession());
  const [activeTab, setActiveTab] = useState<'auditoria' | 'libro_diario' | 'corpus_benchmark' | 'documento_tecnico'>('auditoria');
  const [documents, setDocuments] = useState<ExtractedDocument[]>(BENCHMARK_CORPUS_DOCS);
  const [ledger, setLedger] = useState<LedgerRecord[]>(SAMPLE_LEDGER);
  const [selectedDocId, setSelectedDocId] = useState<string>(BENCHMARK_CORPUS_DOCS[0].id);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85);
  const [docFilter, setDocFilter] = useState<'all' | 'uncertain' | 'discrepancy' | 'clean'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isRunningBatch, setIsRunningBatch] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [reScanDoc, setReScanDoc] = useState<ExtractedDocument | null>(null);
  const [approvedDocIds, setApprovedDocIds] = useState<Set<string>>(new Set());
  const [showGuideBanner, setShowGuideBanner] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Selected document object
  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || documents[0];
  }, [documents, selectedDocId]);

  // Reconciliation results for all documents
  const reconciliationsMap = useMemo(() => {
    const map = new Map<string, ReconciliationResult>();
    documents.forEach((doc) => {
      const rec = reconcileDocument(doc, ledger, documents, confidenceThreshold);
      if (approvedDocIds.has(doc.id)) {
        rec.status = 'AUDITADO_OK';
        rec.reviewedByUser = true;
      }
      map.set(doc.id, rec);
    });
    return map;
  }, [documents, ledger, confidenceThreshold, approvedDocIds]);

  const activeReconciliation = useMemo(() => {
    if (!activeDoc) return null;
    const base = reconciliationsMap.get(activeDoc.id) || reconcileDocument(activeDoc, ledger, documents, confidenceThreshold);
    if (approvedDocIds.has(activeDoc.id)) {
      return {
        ...base,
        status: 'AUDITADO_OK',
        reviewedByUser: true,
      };
    }
    return base;
  }, [activeDoc, reconciliationsMap, ledger, documents, confidenceThreshold, approvedDocIds]);

  // Global Audit Statistics
  const stats: AuditStats = useMemo(() => {
    let totalApproved = 0;
    let totalPendingReview = 0;
    let totalDiscrepancies = 0;
    let totalDuplicates = 0;
    let totalConf = 0;
    let count = 0;

    documents.forEach((doc) => {
      const rec = reconciliationsMap.get(doc.id);
      if (approvedDocIds.has(doc.id)) {
        totalApproved++;
      } else if (rec) {
        if (rec.status === 'AUDITADO_OK') totalApproved++;
        if (rec.status === 'REVISION_REQUERIDA') totalPendingReview++;
        if (rec.status === 'DISCREPANCIA_CONTABLE') totalDiscrepancies++;
        if (rec.status === 'DUPLICADO_DETECTADO') totalDuplicates++;
      }
      const fields = [doc.emisor, doc.fecha, doc.numero_comprobante, doc.subtotal, doc.impuestos, doc.total];
      fields.forEach((f) => {
        if (f && typeof f.confidence === 'number') {
          totalConf += f.confidence;
          count++;
        }
      });
    });

    return {
      totalProcessed: documents.length,
      totalApproved,
      totalPendingReview,
      totalDiscrepancies,
      totalDuplicates,
      overallConfidenceAvg: count > 0 ? Math.round(totalConf / count) : 90,
    };
  }, [documents, reconciliationsMap, approvedDocIds]);

  // Filtered documents list for sidebar
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const isApproved = approvedDocIds.has(doc.id);
      const rec = reconciliationsMap.get(doc.id);
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(doc.emisor?.value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(doc.numero_comprobante?.value || '').includes(searchTerm);

      if (!matchesSearch) return false;

      if (docFilter === 'uncertain') {
        if (isApproved) return false;
        return rec?.status === 'REVISION_REQUERIDA' || (rec?.uncertainFields && rec.uncertainFields.length > 0);
      }
      if (docFilter === 'discrepancy') {
        if (isApproved) return false;
        return rec?.status === 'DISCREPANCIA_CONTABLE' || rec?.status === 'DUPLICADO_DETECTADO';
      }
      if (docFilter === 'clean') {
        return isApproved || rec?.status === 'AUDITADO_OK';
      }

      return true;
    });
  }, [documents, reconciliationsMap, searchTerm, docFilter, approvedDocIds]);

  // Handlers
  const handleApproveDocument = (docId: string) => {
    setApprovedDocIds((prev) => new Set([...prev, docId]));
    const targetDoc = documents.find((d) => d.id === docId);
    addToast(
      'success',
      '¡Comprobante Aprobado y Validado!',
      `${targetDoc?.emisor?.value || docId} fue marcado como verificado por el auditor.`
    );
  };

  const handleUpdateField = (fieldKey: string, newValue: any) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== selectedDocId) return doc;
        const currentField = (doc as any)[fieldKey] || {};
        return {
          ...doc,
          [fieldKey]: {
            ...currentField,
            value: newValue,
            confidence: 100, // manual override = 100% human certainty
            isUncertain: false,
            uncertaintyReason: 'Valor verificado y corregido manualmente por el auditor.',
          },
        };
      })
    );
    addToast(
      'info',
      'Campo Actualizado',
      `Se modificó ${fieldKey.toUpperCase()} a "${String(newValue)}" con 100% certeza de auditor.`
    );
  };

  const handleCreateLedgerRecordForDoc = (doc: ExtractedDocument) => {
    const newRecord: LedgerRecord = {
      id: `AS-${100 + ledger.length + 1}`,
      fecha: String(doc.fecha?.value || new Date().toISOString().split('T')[0]),
      proveedor: String(doc.emisor?.value || 'Proveedor'),
      cuit: String(doc.cuit_o_id?.value || '30-00000000-0'),
      numero_factura: String(doc.numero_comprobante?.value || '0001-00000001'),
      monto: Number(doc.total?.value || 0),
      categoria: 'Gastos Generales',
      estado_conciliacion: 'CONCILIADO',
      comprobante_asociado_id: doc.id,
    };

    setLedger((prev) => [newRecord, ...prev]);
    addToast(
      'success',
      'Asiento Contable Creado',
      `Se generó el asiento #${newRecord.id} para ${newRecord.proveedor} por ${formatCurrency(newRecord.monto)}.`
    );
  };

  const handleAddDocument = (newDoc: ExtractedDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocId(newDoc.id);
    setActiveTab('auditoria');
    addToast(
      'success',
      'Comprobante Ingestado',
      `Se procesó "${newDoc.fileName}" con ${newDoc.items?.length || 0} ítems detectados.`
    );
  };

  const handleRunBatchAudit = () => {
    setIsRunningBatch(true);
    setIsBatchModalOpen(true);
    setTimeout(() => {
      setIsRunningBatch(false);
    }, 1500);
  };

  const handleReScanSubmit = (docId: string, reason: string, note: string) => {
    addToast(
      'warning',
      'Re-escaneo Solicitado',
      `Se notificó la solicitud para ${docId} (Motivo: ${reason}).`
    );
  };

  const handleLogin = (nextUser: DemoUser) => {
    saveSession(nextUser);
    setUser(nextUser);
    setScreen('app');
    addToast('success', `¡Bienvenido/a ${nextUser.name.split(' ')[0]}!`, 'Sesión de demostración iniciada.');
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setScreen('landing');
  };

  const handleExportCsv = () => {
    const headers = [
      'ID Documento',
      'Archivo',
      'Tipo Comprobante',
      'Calidad Imagen',
      'Emisor',
      'CUIT',
      'Fecha',
      'Nro Comprobante',
      'Subtotal',
      'Impuestos',
      'Total',
      'Estado Conciliacion',
      'Campos Dudosos',
      'Asiento Contable Match',
    ];

    const rows = documents.map((doc) => {
      const rec = reconciliationsMap.get(doc.id);
      return [
        doc.id,
        `"${doc.fileName}"`,
        doc.tipo_comprobante,
        doc.calidad_imagen,
        `"${doc.emisor?.value || ''}"`,
        doc.cuit_o_id?.value || '',
        doc.fecha?.value || '',
        doc.numero_comprobante?.value || '',
        doc.subtotal?.value || 0,
        doc.impuestos?.value || 0,
        doc.total?.value || 0,
        approvedDocIds.has(doc.id) ? 'AUDITADO_OK' : (rec?.status || 'PENDIENTE'),
        `"${(rec?.uncertainFields || []).join(', ')}"`,
        rec?.matchedLedgerRecord?.id || 'SIN_ASIENTO',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cotejo_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('info', 'Reporte CSV Descargado', 'Se descargó la planilla con el estado completo del lote.');
  };

  if (screen === 'landing') {
    return (
      <LandingPage
        onStart={() => setScreen('login')}
        onDirectDemo={() => handleLogin(DEMO_ACCOUNT)}
      />
    );
  }

  if (screen === 'login' || !user) {
    return <LoginPage onBack={() => setScreen('landing')} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onRunBatchAudit={handleRunBatchAudit}
        onExportCsv={handleExportCsv}
        stats={stats}
        isRunningBatch={isRunningBatch}
        user={user}
        onLogout={handleLogout}
        showGuideBanner={showGuideBanner}
        onToggleGuide={() => setShowGuideBanner((prev) => !prev)}
      />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'auditoria' && (
          <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-4">
            
            {/* Interactive Guided Tour / Quick Pitch Banner (Dismissible) */}
            {showGuideBanner && (
              <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-indigo-950/70 p-4 sm:p-5 text-indigo-100 shadow-2xl relative animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/40 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                        <span>Cómo auditar este lote en 20 segundos</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                          Guía Rápida
                        </span>
                      </p>
                      <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs text-indigo-200/90">
                        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-indigo-500/20">
                          <span className="font-bold text-white block">1. Elegí a la izquierda</span>
                          <span>Hacé clic en cualquier comprobante (verde, amarillo o rojo).</span>
                        </div>
                        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-indigo-500/20">
                          <span className="font-bold text-white block">2. Mirá el visor central</span>
                          <span>Las cajas delimitadoras muestran la certeza calculada por campo.</span>
                        </div>
                        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-indigo-500/20">
                          <span className="font-bold text-white block">3. Decidí a la derecha en 5s</span>
                          <span>Si dudó por tinta borrosa, confirmás el recorte y aprobás con 1 clic.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowGuideBanner(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-indigo-300 hover:text-white transition shrink-0"
                    title="Cerrar guía"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* COLUMN 1 (3 cols): Document Batch Browser */}
              <div className="lg:col-span-3 flex flex-col bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden min-h-[600px] max-h-[calc(100vh-140px)]">
                
                {/* Batch Sidebar Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Lote de Comprobantes</span>
                      <span className="font-mono text-indigo-400">({filteredDocuments.length})</span>
                    </span>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="p-1.5 hover:bg-slate-800 rounded-xl text-indigo-400 hover:text-indigo-300 border border-slate-800 transition"
                      title="Agregar comprobante al lote"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar proveedor o número..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* Quick Status Filter Pills */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <button
                      onClick={() => setDocFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        docFilter === 'all'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Todos ({documents.length})
                    </button>
                    <button
                      onClick={() => setDocFilter('uncertain')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                        docFilter === 'uncertain'
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                          : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                      }`}
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>A revisar ({stats.totalPendingReview})</span>
                    </button>
                    <button
                      onClick={() => setDocFilter('discrepancy')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        docFilter === 'discrepancy'
                          ? 'bg-rose-500 text-white font-extrabold shadow-md'
                          : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                      }`}
                    >
                      No cierran ({stats.totalDiscrepancies})
                    </button>
                  </div>
                </div>

                {/* Document List Items */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2 space-y-1.5">
                  {filteredDocuments.map((doc) => {
                    const isSelected = doc.id === selectedDocId;
                    const isApproved = approvedDocIds.has(doc.id);
                    const rec = reconciliationsMap.get(doc.id);
                    const isUncertain = !isApproved && rec?.status === 'REVISION_REQUERIDA';
                    const isDiscrepancy = !isApproved && (rec?.status === 'DISCREPANCIA_CONTABLE' || rec?.status === 'DUPLICADO_DETECTADO');

                    return (
                      <div
                        key={doc.id}
                        id={`doc-card-${doc.id}`}
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setSelectedFieldKey(null);
                        }}
                        className={`p-3 rounded-2xl cursor-pointer transition flex items-start justify-between gap-2 text-xs ${
                          isSelected
                            ? 'bg-indigo-600/20 border border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-600/10'
                            : 'hover:bg-slate-800/60 border border-slate-800/50 bg-slate-950/40'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">{doc.id}</span>
                            <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                              doc.calidad_imagen === 'optima' ? 'bg-emerald-500/20 text-emerald-300' :
                              doc.calidad_imagen === 'termico_desvanecido' ? 'bg-amber-500/20 text-amber-300' :
                              doc.calidad_imagen === 'torcida' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-rose-500/20 text-rose-300'
                            }`}>
                              {doc.calidad_imagen.replace('_', ' ')}
                            </span>
                          </div>

                          <span className="font-bold text-white block truncate">
                            {doc.emisor?.value || 'Emisor Desconocido'}
                          </span>
                          
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                            <span>{doc.fecha?.value || 'Sin fecha'}</span>
                            <span className="font-mono font-bold text-slate-200">
                              {formatCurrency(Number(doc.total?.value || 0))}
                            </span>
                          </div>
                        </div>

                        {/* Status indicator icon */}
                        <div className="shrink-0 mt-1">
                          {isApproved ? (
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 flex items-center justify-center text-slate-950 shadow" title="Auditado y aprobado por auditor">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : isDiscrepancy ? (
                            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow" title="Discrepancia contable detectada" />
                          ) : isUncertain ? (
                            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse shadow" title="Incertidumbre - requiere revisión de 5 segundos" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow" title="Auditado OK" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sidebar Footer Threshold Slider */}
                <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Umbral de Incertidumbre:</span>
                    </span>
                    <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{confidenceThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1.5 leading-tight">
                    Si un campo tiene certeza &lt; {confidenceThreshold}%, Cotejo no adivina: lo marca en amarillo.
                  </span>
                </div>
              </div>

              {/* COLUMN 2 (5 cols): Interactive Document Viewer */}
              <div className="lg:col-span-5 flex flex-col min-h-[600px]">
                {activeDoc ? (
                  <DocumentViewer
                    document={activeDoc}
                    highlightField={selectedFieldKey}
                    onSelectField={(field) => setSelectedFieldKey(field)}
                    confidenceThreshold={confidenceThreshold}
                    allDocs={documents}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-slate-900 rounded-3xl border border-slate-800 p-8 text-slate-500">
                    Selecciona un comprobante para auditar
                  </div>
                )}
              </div>

              {/* COLUMN 3 (4 cols): 5-Second Auditor & Reconciliation Panel */}
              <div className="lg:col-span-4 flex flex-col min-h-[600px]">
                {activeDoc && activeReconciliation ? (
                  <ReconciliationPanel
                    document={activeDoc}
                    reconciliation={activeReconciliation}
                    onApprove={handleApproveDocument}
                    onUpdateField={handleUpdateField}
                    selectedFieldKey={selectedFieldKey}
                    onSelectField={(field) => setSelectedFieldKey(field)}
                    confidenceThreshold={confidenceThreshold}
                    onRequestReScan={(doc) => setReScanDoc(doc)}
                    onCreateLedgerRecord={handleCreateLedgerRecordForDoc}
                    isApproved={approvedDocIds.has(activeDoc.id)}
                  />
                ) : null}
              </div>

            </div>
          </div>
        )}

        {/* View 2: Company Ledger Reconciliation */}
        {activeTab === 'libro_diario' && (
          <LedgerView
            ledger={ledger}
            documents={documents}
            onSelectDocument={(docId) => {
              setSelectedDocId(docId);
              setActiveTab('auditoria');
            }}
            onAddLedgerRecord={(rec) => {
              setLedger((prev) => [rec, ...prev]);
              addToast('success', 'Asiento Creado', `Se agregó el asiento #${rec.id} exitosamente.`);
            }}
          />
        )}

        {/* View 3: Benchmark Corpus 50 Docs & Evidence Dashboard */}
        {activeTab === 'corpus_benchmark' && (
          <CorpusBenchmarkView
            onInspectDocument={(docId) => {
              setSelectedDocId(docId);
              setActiveTab('auditoria');
            }}
          />
        )}

        {/* View 4: Working Document, Demo Script & Thesis */}
        {activeTab === 'documento_tecnico' && <TechnicalDocView />}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentExtracted={handleAddDocument}
      />

      {/* Re-Scan Modal */}
      <ReScanModal
        isOpen={Boolean(reScanDoc)}
        onClose={() => setReScanDoc(null)}
        document={reScanDoc}
        onSubmitReScan={handleReScanSubmit}
      />

      {/* Batch Audit Modal */}
      <BatchAuditModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        documents={documents}
        reconciliationsMap={reconciliationsMap}
        stats={stats}
        onExportCsv={handleExportCsv}
      />

      {/* Live Toasts Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
