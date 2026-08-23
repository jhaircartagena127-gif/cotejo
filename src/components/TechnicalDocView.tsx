import React from 'react';
import { 
  FileText, 
  Video, 
  ShieldAlert, 
  Target, 
  CheckCircle2, 
  BookOpen, 
  Cpu, 
  Layers, 
  Award,
  Clock,
  WifiOff
} from 'lucide-react';

export const TechnicalDocView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-200">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              QVAC Track — Aleph Hackathon 2026
            </span>
            <span className="text-xs text-slate-400">22 y 23 de agosto de 2026</span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            Documento de Trabajo V1.0
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          COTEJO
        </h1>
        <p className="text-lg text-indigo-300 font-medium mt-1">
          El auditor que te dice en qué no confiar
        </p>

        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <WifiOff className="w-4 h-4 text-emerald-400" />
            <span>100% Inferencia Local Offline</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Aritmética Determinista</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>50 Documentos Reales en Corpus</span>
          </div>
        </div>
      </div>

      {/* 1. Resumen Ejecutivo */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <span>1. Resumen Ejecutivo</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>Cotejo</strong> es un auditor de documentos contables que corre enteramente en la computadora del usuario. Ingiere facturas, recibos y comprobantes —incluyendo fotos torcidas, mal iluminadas y arrugadas—, extrae los datos, los cruza contra los registros de la empresa y marca las discrepancias.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Su diferencia con cualquier otro extractor de facturas es una sola, y es deliberada: <strong>Cotejo está diseñado para reconocer lo que no pudo leer bien</strong>. Cuando la confianza de lectura de un campo baja de cierto umbral, no completa el dato con una suposición: lo marca, muestra el recorte exacto de la imagen y pide revisión humana de 5 segundos.
        </p>
      </section>

      {/* 2. La Tesis del Producto */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>2. La Tesis del Producto</span>
        </h2>
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800 text-indigo-200 text-sm font-medium">
          "Un agente que marca incertidumbre le gana a uno que alucina un número con confianza."
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Un error silencioso en contabilidad es peor que no tener el dato. Si la herramienta avisa que no pudo leer, alguien lo revisa en cinco segundos. Si inventa un número plausible, el error se descubre meses después en una auditoría de AFIP/IRS, o no se descubre.
        </p>
      </section>

      {/* 3. Guion del Video de Demostración */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-rose-400" />
          <span>3. Guion del Video de Demostración (2 Minutos)</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="font-mono font-bold text-indigo-400 block mb-1">00:00 - 00:20 (Planteo del Problema)</span>
            <p className="text-slate-300">
              Una herramienta que siempre devuelve un número parece más útil, pero introduce errores silenciosos en la contabilidad. Un error no revisado es peor que un dato faltante.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="font-mono font-bold text-emerald-400 block mb-1">00:20 - 00:40 (Desconexión de Red Visible)</span>
            <p className="text-slate-300">
              Se desconecta la red de manera visible en cámara. Todo lo que sigue ocurre 100% en inferencia local sin enviar balances a servidores externos.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="font-mono font-bold text-amber-400 block mb-1">00:40 - 01:20 (Ingesta de Documentos Sucios)</span>
            <p className="text-slate-300">
              Se procesa una tanda completa: fotos inclinadas con flash, papel térmico desvanecido de 6 meses y notas manuscritas.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="font-mono font-bold text-rose-400 block mb-1">01:20 - 02:00 (Momento Central: Incertidumbre y Recorte)</span>
            <p className="text-slate-300">
              El sistema marca un campo con confianza baja (&lt; 85%), muestra el recorte de la imagen y solicita revisión de 5 segundos. <em>"El sistema podría haber inventado ese número y decidió no hacerlo."</em>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="font-mono font-bold text-blue-400 block mb-1">02:00 - 02:50 (Aritmética en Código y Benchmark 50 Docs)</span>
            <p className="text-slate-300">
              Se demuestra que los cálculos y sumas están programados en código determinista fuera de la IA, y se expone la tabla completa de 50 documentos con la sección honesta de <strong>Dónde Falla</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Arquitectura y Reglas Irrenunciables */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>4. Decisiones Técnicas y Reglas Irrenunciables</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <span className="font-bold text-white block mb-1">Aritmética Determinista</span>
            <p className="text-slate-400">
              El modelo nunca hace cálculos matemáticos de memoria. La suma de líneas, cálculo de IVA y comprobación de duplicados se ejecutan en código nativo.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <span className="font-bold text-white block mb-1">Bandeja de 5 Segundos</span>
            <p className="text-slate-400">
              Cada hallazgo dudoso viene acompañado del recorte exacto de la imagen para que el contador apruebe sin abrir archivos externos.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <span className="font-bold text-white block mb-1">Presupuesto de Memoria</span>
            <p className="text-slate-400">
              Modelo en cuantización de 4 bits con consumo menor a 4 GB RAM, ejecutable en laptops convencionales.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <span className="font-bold text-white block mb-1">Evidencia sobre Impresiones</span>
            <p className="text-slate-400">
              Entrega con tabla de 50 documentos reales y sección explícita de casos no resueltos admitidos abiertamente.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
