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
  Check
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

export default function App() {
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

  // Selected document object
  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || documents[0];
  }, [documents, selectedDocId]);

  // Reconciliation results for all documents
  const reconciliationsMap = useMemo(() => {
    const map = new Map<string, ReconciliationResult>();
    documents.forEach((doc) => {
      map.set(doc.id, reconcileDocument(doc, ledger, documents, confidenceThreshold));
    });
    return map;
  }, [documents, ledger, confidenceThreshold]);

  const activeReconciliation = useMemo(() => {
    if (!activeDoc) return null;
    return reconciliationsMap.get(activeDoc.id) || reconcileDocument(activeDoc, ledger, documents, confidenceThreshold);
  }, [activeDoc, reconciliationsMap, ledger, documents, confidenceThreshold]);

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
      if (rec) {
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
  }, [documents, reconciliationsMap]);

  // Filtered documents list for sidebar
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const rec = reconciliationsMap.get(doc.id);
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(doc.emisor.value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(doc.numero_comprobante.value || '').includes(searchTerm);

      if (!matchesSearch) return false;

      if (docFilter === 'uncertain') {
        return rec?.status === 'REVISION_REQUERIDA' || (rec?.uncertainFields && rec.uncertainFields.length > 0);
      }
      if (docFilter === 'discrepancy') {
        return rec?.status === 'DISCREPANCIA_CONTABLE' || rec?.status === 'DUPLICADO_DETECTADO';
      }
      if (docFilter === 'clean') {
        return rec?.status === 'AUDITADO_OK';
      }

      return true;
    });
  }, [documents, reconciliationsMap, searchTerm, docFilter]);

  // Handlers
  const handleApproveDocument = (docId: string) => {
    // Update state to mark verified
    alert(`Comprobante ${docId} aprobado y validado en el libro diario contable.`);
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
            uncertaintyReason: 'Valor verificado y corregido manualmente por el auditor humano.',
          },
        };
      })
    );
  };

  const handleAddDocument = (newDoc: ExtractedDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocId(newDoc.id);
    setActiveTab('auditoria');
  };

  const handleRunBatchAudit = () => {
    setIsRunningBatch(true);
    setTimeout(() => {
      setIsRunningBatch(false);
      alert(`Auditoría de lote completada sobre ${documents.length} documentos.`);
    }, 1200);
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
        `"${doc.emisor.value || ''}"`,
        doc.cuit_o_id.value || '',
        doc.fecha.value || '',
        doc.numero_comprobante.value || '',
        doc.subtotal.value || 0,
        doc.impuestos.value || 0,
        doc.total.value || 0,
        rec?.status || 'PENDIENTE',
        `"${(rec?.uncertainFields || []).join(', ')}"`,
        rec?.matchedLedgerRecord?.id || 'SIN_ASIENTO',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cotejo_auditoria_conciliacion_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Universal Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onRunBatchAudit={handleRunBatchAudit}
        onExportCsv={handleExportCsv}
        stats={stats}
        isRunningBatch={isRunningBatch}
      />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'auditoria' && (
          <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* COLUMN 1 (3 cols): Document Batch Browser */}
            <div className="lg:col-span-3 flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden min-h-[600px] max-h-[calc(100vh-140px)]">
              
              {/* Batch Sidebar Header */}
              <div className="p-3.5 border-b border-slate-800 bg-slate-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Lote de Comprobantes ({filteredDocuments.length})
                  </span>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="p-1 hover:bg-slate-800 rounded text-indigo-400 hover:text-indigo-300 transition"
                    title="Agregar comprobante al lote"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre, emisor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Quick Status Filter Pills */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <button
                    onClick={() => setDocFilter('all')}
                    className={`px-2 py-1 rounded-md font-medium transition ${
                      docFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Todos ({documents.length})
                  </button>
                  <button
                    onClick={() => setDocFilter('uncertain')}
                    className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                      docFilter === 'uncertain'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Dudosos ({stats.totalPendingReview})</span>
                  </button>
                  <button
                    onClick={() => setDocFilter('discrepancy')}
                    className={`px-2 py-1 rounded-md font-medium transition ${
                      docFilter === 'discrepancy'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                    }`}
                  >
                    Discrepancias ({stats.totalDiscrepancies})
                  </button>
                </div>
              </div>

              {/* Document List Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-1.5 space-y-1">
                {filteredDocuments.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  const rec = reconciliationsMap.get(doc.id);
                  const isUncertain = rec?.status === 'REVISION_REQUERIDA';
                  const isDiscrepancy = rec?.status === 'DISCREPANCIA_CONTABLE' || rec?.status === 'DUPLICADO_DETECTADO';

                  return (
                    <div
                      key={doc.id}
                      id={`doc-card-${doc.id}`}
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setSelectedFieldKey(null);
                      }}
                      className={`p-3 rounded-xl cursor-pointer transition flex items-start justify-between gap-2 text-xs ${
                        isSelected
                          ? 'bg-indigo-600/20 border border-indigo-500/80 shadow-md shadow-indigo-600/10'
                          : 'hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{doc.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                            doc.calidad_imagen === 'optima' ? 'bg-emerald-500/20 text-emerald-300' :
                            doc.calidad_imagen === 'termico_desvanecido' ? 'bg-amber-500/20 text-amber-300' :
                            doc.calidad_imagen === 'torcida' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-rose-500/20 text-rose-300'
                          }`}>
                            {doc.calidad_imagen.replace('_', ' ')}
                          </span>
                        </div>

                        <span className="font-bold text-white block truncate">
                          {doc.emisor.value || 'Emisor Desconocido'}
                        </span>
                        
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{doc.fecha.value || 'Sin fecha'}</span>
                          <span className="font-mono font-bold text-slate-200">
                            {formatCurrency(Number(doc.total.value || 0))}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator icon */}
                      <div className="shrink-0 mt-1">
                        {isDiscrepancy ? (
                          <div className="w-3 h-3 rounded-full bg-rose-500" title="Discrepancia contable detectada" />
                        ) : isUncertain ? (
                          <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" title="Incertidumbre - requiere revisión humana" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-emerald-500" title="Auditado y verificado" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Footer Threshold Slider */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
                    <span>Umbral de Certeza:</span>
                  </span>
                  <span className="font-mono font-bold text-white">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Campos &lt; {confidenceThreshold}% exigen recorte visual obligatorio.
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
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 p-8 text-slate-500">
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
                />
              ) : null}
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
            onAddLedgerRecord={(rec) => setLedger((prev) => [rec, ...prev])}
          />
        )}

        {/* View 3: Benchmark Corpus 50 Docs & Evidence Dashboard */}
        {activeTab === 'corpus_benchmark' && <CorpusBenchmarkView />}

        {/* View 4: Working Document, Demo Script & Thesis */}
        {activeTab === 'documento_tecnico' && <TechnicalDocView />}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentExtracted={handleAddDocument}
      />
    </div>
  );
}
