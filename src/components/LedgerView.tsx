import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Plus, 
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { LedgerRecord, ExtractedDocument } from '../types';
import { formatCurrency } from '../utils/arithmetic';

interface LedgerViewProps {
  ledger: LedgerRecord[];
  documents: ExtractedDocument[];
  onSelectDocument: (docId: string) => void;
  onAddLedgerRecord: (record: LedgerRecord) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  ledger,
  documents,
  onSelectDocument,
  onAddLedgerRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New record form state
  const [newProv, setNewProv] = useState('');
  const [newCuit, setNewCuit] = useState('');
  const [newInv, setNewInv] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<LedgerRecord['categoria']>('Gastos Generales');

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProv || !newAmount) return;

    const newRec: LedgerRecord = {
      id: `AS-${100 + ledger.length + 1}`,
      fecha: new Date().toISOString().split('T')[0],
      proveedor: newProv,
      cuit: newCuit || '30-00000000-0',
      numero_factura: newInv || '0001-00000001',
      monto: parseFloat(newAmount) || 0,
      categoria: newCategory,
      estado_conciliacion: 'SIN_COMPROBANTE',
    };

    onAddLedgerRecord(newRec);
    setShowAddModal(false);
    setNewProv('');
    setNewCuit('');
    setNewInv('');
    setNewAmount('');
  };

  const filteredRecords = ledger.filter((record) => {
    const matchesSearch =
      record.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.numero_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cuit.includes(searchTerm) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'all' || record.categoria === selectedCategory;
    const matchesStat = selectedStatus === 'all' || record.estado_conciliacion === selectedStatus;

    return matchesSearch && matchesCat && matchesStat;
  });

  const getStatusBadge = (status: LedgerRecord['estado_conciliacion'], diff?: number) => {
    switch (status) {
      case 'CONCILIADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Conciliado</span>
          </span>
        );
      case 'DISCREPANCIA_MONTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>Diferencia {diff ? formatCurrency(diff) : ''}</span>
          </span>
        );
      case 'SIN_COMPROBANTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sin Comprobante</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendiente</span>
          </span>
        );
    }
  };

  const handleExportLedgerCsv = () => {
    const headers = ['Asiento', 'Fecha', 'Proveedor', 'CUIT', 'Nro Factura', 'Categoria', 'Monto Contable', 'Estado'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.fecha,
      `"${r.proveedor}"`,
      r.cuit,
      r.numero_factura,
      r.categoria,
      r.monto,
      r.estado_conciliacion,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `libro_diario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Libro Diario Contable de la Empresa</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Acá residen las órdenes de compra y asientos contables. Cotejo compara cada comprobante físico contra esta tabla para verificar montos, proveedores y duplicaciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLedgerCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Asiento Contable</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por proveedor, CUIT, factura o asiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-indigo-500"
          >
            <option value="all">Todas las Categorías</option>
            <option value="Combustible">Combustible</option>
            <option value="Servicios">Servicios</option>
            <option value="Insumos">Insumos</option>
            <option value="Hardware">Hardware</option>
            <option value="Viáticos">Viáticos</option>
            <option value="Honorarios">Honorarios</option>
            <option value="Gastos Generales">Gastos Generales</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-indigo-500"
          >
            <option value="all">Todos los Estados ({ledger.length})</option>
            <option value="CONCILIADO">Conciliados</option>
            <option value="DISCREPANCIA_MONTO">Con Discrepancia</option>
            <option value="SIN_COMPROBANTE">Sin Comprobante</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
                <th className="py-4 px-4">Asiento</th>
                <th className="py-4 px-4">Fecha</th>
                <th className="py-4 px-4">Proveedor / Razón Social</th>
                <th className="py-4 px-4">CUIT</th>
                <th className="py-4 px-4">Nº Factura Esperada</th>
                <th className="py-4 px-4">Categoría</th>
                <th className="py-4 px-4 text-right">Monto Contable</th>
                <th className="py-4 px-4 text-center">Estado Conciliación</th>
                <th className="py-4 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200 font-sans">
              {filteredRecords.map((record) => {
                const matchedDoc = documents.find((d) => {
                  const docInv = String(d.numero_comprobante?.value || '').replace(/\D/g, '');
                  const recInv = record.numero_factura.replace(/\D/g, '');
                  return docInv && recInv && (docInv === recInv || docInv.includes(recInv));
                });

                return (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono font-bold text-indigo-300">{record.id}</td>
                    <td className="py-4 px-4 font-mono text-slate-400">{record.fecha}</td>
                    <td className="py-4 px-4 font-bold text-white">{record.proveedor}</td>
                    <td className="py-4 px-4 font-mono text-slate-400">{record.cuit}</td>
                    <td className="py-4 px-4 font-mono text-slate-300">{record.numero_factura}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                        {record.categoria}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white text-sm">
                      {formatCurrency(record.monto)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(record.estado_conciliacion, record.diferencia)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {matchedDoc ? (
                        <button
                          onClick={() => onSelectDocument(matchedDoc.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition"
                        >
                          <span>Ver Doc</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Sin vincular</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white">Agregar Asiento Contable</h3>
            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Proveedor / Comercio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: YPF Estación Central"
                  value={newProv}
                  onChange={(e) => setNewProv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">CUIT</label>
                  <input
                    type="text"
                    placeholder="30-12345678-9"
                    value={newCuit}
                    onChange={(e) => setNewCuit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nº Factura Esperada</label>
                  <input
                    type="text"
                    placeholder="0001-00012345"
                    value={newInv}
                    onChange={(e) => setNewInv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Monto ($ ARS)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="15000.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Combustible">Combustible</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Insumos">Insumos</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Viáticos">Viáticos</option>
                    <option value="Honorarios">Honorarios</option>
                    <option value="Gastos Generales">Gastos Generales</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                >
                  Guardar Asiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
