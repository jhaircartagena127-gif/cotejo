import React, { useState } from 'react';
import {
  ShieldCheck,
  Camera,
  ScanSearch,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  WifiOff,
  Clock,
  EyeOff,
  Sparkles,
  ChevronRight,
  Layers,
  Cpu,
  Calculator,
  Lock,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStart: () => void;
  onDirectDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onDirectDemo }) => {
  const [activeSimCase, setActiveSimCase] = useState<'clean' | 'thermal' | 'duplicate'>('thermal');

  const simCases = {
    clean: {
      title: 'Factura A de Proveedor',
      subtitle: 'Comprobante nítido · Sin arrugas ni sombras',
      tag: 'Alta Certeza (98%)',
      tagColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
      issuer: 'DISTRIBUIDORA CENTRAL S.A.',
      cuit: '30-71234567-8',
      date: '2026-08-20',
      total: '$145.200,00',
      status: 'ok',
      statusTitle: 'Auditado OK · Sin discrepancias',
      statusDesc: 'Coincide 100% con el Asiento Contable #AS-101 y la suma de líneas e IVA es exacta.',
      action: 'Aprobado automáticamente en 0.2s',
      boxes: [
        { label: 'Emisor', conf: '99%', ok: true, top: '15%', left: '15%', w: '70%', h: '10%' },
        { label: 'Fecha', conf: '97%', ok: true, top: '30%', left: '15%', w: '35%', h: '8%' },
        { label: 'Total', conf: '98%', ok: true, top: '75%', left: '45%', w: '40%', h: '12%' },
      ],
    },
    thermal: {
      title: 'Ticket Térmico Desvanecido (YPF)',
      subtitle: 'Papel térmico de 6 meses · Tinta degradada en el total',
      tag: 'Incertidumbre Detectada (68%)',
      tagColor: 'bg-amber-500/20 text-amber-800 border-amber-500/40',
      issuer: 'YPF ESTACIÓN 42',
      cuit: '30-54668997-4',
      date: '2026-08-14',
      total: '$34.500,00 (?)',
      status: 'warn',
      statusTitle: 'Revisión Requerida · Total Dudoso (68%)',
      statusDesc: 'El dígito "4" del total tiene tinta desvanecida. Cotejo aísla el recorte y no adivina el monto.',
      action: 'Requiere 5 segundos del auditor humano para confirmar recorte visual',
      boxes: [
        { label: 'Emisor', conf: '94%', ok: true, top: '15%', left: '15%', w: '70%', h: '10%' },
        { label: 'Fecha', conf: '88%', ok: true, top: '30%', left: '15%', w: '35%', h: '8%' },
        { label: 'Total Dudoso', conf: '68%', ok: false, top: '75%', left: '45%', w: '40%', h: '12%' },
      ],
    },
    duplicate: {
      title: 'Factura Duplicada en Lote',
      subtitle: 'Mismo número y proveedor cargado dos veces',
      tag: 'Alerta de Fraude / Error',
      tagColor: 'bg-rose-500/20 text-rose-700 border-rose-500/30',
      issuer: 'PAPELERÍA & SERVICIOS',
      cuit: '20-28499123-8',
      date: '2026-08-15',
      total: '$18.400,00',
      status: 'bad',
      statusTitle: 'Discrepancia · Comprobante Duplicado',
      statusDesc: 'Ya existe una factura registrada con Nº 0001-00049281 por $18.400,00 en este ejercicio.',
      action: 'Bloqueado para evitar duplicación de pago contable',
      boxes: [
        { label: 'Nº Factura', conf: '95%', ok: true, top: '25%', left: '50%', w: '40%', h: '10%' },
        { label: 'Total', conf: '96%', ok: true, top: '75%', left: '45%', w: '40%', h: '12%' },
      ],
    },
  };

  const currentCase = simCases[activeSimCase];

  const handleEnterDemo = () => {
    if (onDirectDemo) {
      onDirectDemo();
    } else {
      onStart();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 text-center">
        <span className="font-semibold text-white">✨ Auditor Contable Multimodal</span> · Inferencia 100% privada en tu equipo · Sin alucinaciones aritméticas
      </div>

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-950">COTEJO</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Auditor
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Te dice en qué comprobantes no confiar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#simulador"
            className="hidden md:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition"
          >
            Simulador en vivo
          </a>
          <a
            href="#como-funciona"
            className="hidden md:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition"
          >
            Cómo funciona
          </a>
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition"
          >
            Ingresar
          </button>
          <button
            onClick={handleEnterDemo}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Entrar a la Demo (1 Clic)</span>
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pt-14 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 text-indigo-800 text-xs font-bold tracking-wide border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              Auditoría Contable de Próxima Generación
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
              Subís una factura.{' '}
              <span className="text-indigo-600 block mt-1">Cotejo te dice si podés confiar.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Lee comprobantes arrugados, torcidos o con tinta térmica desvanecida. Cruza los datos contra el libro diario de la empresa y <strong>marca en amarillo lo que no leyó bien</strong>. No inventa números con cara de seguro.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={handleEnterDemo}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
              >
                <span>Probar Demo Instantánea</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#simulador"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm hover:border-slate-400 hover:bg-slate-50 transition"
              >
                <Play className="w-4 h-4 text-indigo-600" />
                <span>Ver Simulador Interactivo</span>
              </a>
            </div>

            {/* Micro Benefits Grid */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2 bg-white/70 p-3 rounded-2xl border border-slate-200/80 shadow-sm">
                <WifiOff className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sin enviar balances a la nube</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 p-3 rounded-2xl border border-slate-200/80 shadow-sm">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Auditoría humana en 5 segundos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 p-3 rounded-2xl border border-slate-200/80 shadow-sm">
                <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
                <span>0 Alucinaciones contables</span>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Fast Visual Comparison Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  La diferencia radical de Cotejo
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Principio Cardinal
                </span>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                {/* Traditional OCR Card */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                  <div className="flex items-center justify-between text-rose-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Extractor Tradicional / LLM Típico
                    </span>
                    <span className="font-mono text-[11px] text-rose-600">Alucinación silenciosa</span>
                  </div>
                  <p className="text-slate-600">
                    Si el ticket está borroso, <strong>adivina un número plausible</strong> y lo guarda como verídico. El error se descubre meses después en una inspección de AFIP.
                  </p>
                </div>

                {/* Cotejo Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Motor de Auditoría Cotejo
                    </span>
                    <span className="font-mono text-[11px] text-emerald-700">Incertidumbre honesta</span>
                  </div>
                  <p className="text-slate-700">
                    Si la confianza baja de 85%, <strong>marca en amarillo, muestra el recorte exacto</strong> y solicita 5 segundos de revisión al contador.
                  </p>
                </div>

                {/* Quote highlight */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 italic text-[11px] leading-relaxed">
                  "Un agente que marca incertidumbre le gana a uno que alucina un número con confianza."
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* INTERACTIVE SIMULATOR SANDBOX */}
      <section id="simulador" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Probalo acá mismo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Simulador Interactivo de Auditoría
            </h2>
            <p className="text-sm text-slate-600">
              Elegí un comprobante de prueba para ver cómo Cotejo asigna recortes (Bounding Boxes) y decide qué es seguro y qué requiere confirmación humana.
            </p>

            {/* Switcher Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setActiveSimCase('thermal')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeSimCase === 'thermal'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>1. Ticket Térmico Borroso (Incertidumbre)</span>
              </button>

              <button
                onClick={() => setActiveSimCase('clean')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeSimCase === 'clean'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>2. Factura A Impecable (Cuadra OK)</span>
              </button>

              <button
                onClick={() => setActiveSimCase('duplicate')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeSimCase === 'duplicate'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>3. Factura Duplicada (Alerta Contable)</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Stage */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-6 lg:p-8 text-white grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Simulator: Document Visual Area (Left 6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="w-full max-w-sm bg-[#faf6ea] text-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-300 font-mono text-xs relative select-none">
                {/* SVG Ticket Simulation */}
                <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
                  <p className="font-bold text-sm tracking-tight">{currentCase.issuer}</p>
                  <p className="text-[10px] text-slate-600">CUIT: {currentCase.cuit}</p>
                  <p className="text-[10px] text-slate-600">FECHA: {currentCase.date}</p>
                </div>

                <div className="space-y-1.5 py-2 border-b border-dashed border-slate-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>1x Nafta Infinia Ultra</span>
                    <span>$28.500,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Lubricante Sintético</span>
                    <span>$6.000,00</span>
                  </div>
                </div>

                <div className="pt-3 space-y-1 text-right">
                  <p className="text-[10px] text-slate-500">SUBTOTAL: $28.512,40</p>
                  <p className="text-[10px] text-slate-500">IVA 21%: $5.987,60</p>
                  <p className="text-base font-extrabold text-slate-950 mt-1">
                    TOTAL: {currentCase.total}
                  </p>
                </div>

                {/* Overlaid Bounding Box Simulations */}
                {currentCase.boxes.map((b, i) => (
                  <div
                    key={i}
                    style={{ top: b.top, left: b.left, width: b.w, height: b.h }}
                    className={`absolute rounded transition-all flex items-start justify-end p-1 ${
                      b.ok
                        ? 'border-2 border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                        : 'border-2 border-dashed border-amber-500 bg-amber-500/25 ring-2 ring-amber-500/40 animate-pulse'
                    }`}
                  >
                    <span
                      className={`text-[8px] font-bold px-1 rounded uppercase tracking-wider ${
                        b.ok ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {b.label} ({b.conf})
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3 text-center">
                Vista previa con detección de cajas delimitadoras y cálculo de certeza por campo
              </p>
            </div>

            {/* Simulator: Auditor Decision Panel (Right 6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                    Bandeja de Auditoría en 5 Segundos
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{currentCase.title}</h3>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${currentCase.tagColor}`}>
                  {currentCase.tag}
                </span>
              </div>

              {/* Status Box */}
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  currentCase.status === 'ok'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                    : currentCase.status === 'warn'
                    ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                    : 'bg-rose-950/40 border-rose-800 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {currentCase.status === 'ok' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {currentCase.status === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                  {currentCase.status === 'bad' && <XCircle className="w-5 h-5 text-rose-400" />}
                  <span>{currentCase.statusTitle}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{currentCase.statusDesc}</p>
                <div className="p-2.5 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/60 font-mono text-[11px]">
                  💡 Acción recomendada: {currentCase.action}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Motor Aritmético</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm mt-0.5 block">100% Determinista</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Cruce Contable</span>
                  <span className="text-white font-bold font-mono text-sm mt-0.5 block">Libro Diario Sincronizado</span>
                </div>
              </div>

              <button
                onClick={handleEnterDemo}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
              >
                <span>Auditar este comprobante en la aplicación real</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS IN 3 SIMPLE STEPS */}
      <section id="como-funciona" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
            Flujo de Trabajo
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Cómo funciona en 3 pasos
          </h2>
          <p className="text-sm text-slate-600">
            Pensado para que cualquier miembro del equipo contable entienda el resultado en 20 segundos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              icon: Camera,
              title: 'Cargás la foto o PDF',
              desc: 'Subí imágenes de celular, tickets doblados, escaneos torcidos o fotos con sombra. Ingesta por lote o individual.',
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              step: '2',
              icon: ScanSearch,
              title: 'Lee y marca la certeza',
              desc: 'Extrae emisor, CUIT, fecha y montos. Si un dato está borroso, asigna certeza < 85% y genera el recorte visual.',
              color: 'text-amber-600 bg-amber-50',
            },
            {
              step: '3',
              icon: BookOpen,
              title: 'Cruza con el Libro Diario',
              desc: 'Compara contra los asientos y órdenes de compra: detecta facturas duplicadas, discrepancias de centavos y aprueba en 1 clic.',
              color: 'text-emerald-600 bg-emerald-50',
            },
          ].map((card) => (
            <div
              key={card.step}
              className="bg-white rounded-3xl border border-slate-200 p-7 space-y-4 hover:shadow-xl transition relative"
            >
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center">
                  {card.step}
                </span>
                <div className={`p-2.5 rounded-2xl ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-950">{card.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE 3 COLORS GUIDE */}
      <section className="py-14 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Los 3 colores del semáforo Cotejo
            </h2>
            <p className="text-xs text-slate-400">
              Un estándar visual unificado para que no haya ambigüedades en la auditoría
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Verde · Auditado OK</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                El comprobante cuadra exactamente con el libro contable y las sumas matemáticas son 100% precisas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Amarillo · Revisión en 5s</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Cotejo no está seguro por tinta borrosa o corte de imagen. Muestra el recorte visual para confirmación humana rápida.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Rojo · Descuadre / Duplicado</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                El monto difiere del asiento contable, los ítems no suman el total, o la factura ya fue ingresada previamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Entrá a la demo y probalo con datos reales
            </h2>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Incluye un lote precargado con 50 comprobantes difíciles: tickets de combustible, facturas comerciales y casos de prueba para validar en vivo.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleEnterDemo}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-extrabold text-sm shadow-xl transition transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Ingresar a la Demo Ahora (1 Clic)</span>
            </button>
          </div>

          <p className="text-[11px] text-indigo-300/70">
            No requiere tarjeta ni instalación. Funciona directamente en tu navegador.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-8 bg-[#F2EFE8] text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>COTEJO — Auditor Contable</span>
          </div>
          <p>© 2026 Cotejo Auditor. Principio rector: "Un agente que marca incertidumbre le gana a uno que alucina con confianza".</p>
          <div className="flex items-center gap-4">
            <button onClick={onStart} className="hover:text-slate-900 underline">Ingresar</button>
            <button onClick={handleEnterDemo} className="hover:text-slate-900 font-semibold text-indigo-700">Demo Instantánea</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
