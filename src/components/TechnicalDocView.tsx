import React, { useState } from 'react';
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
  WifiOff,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

export const TechnicalDocView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const pitchSummary = `COTEJO — Auditor Contable Multimodal
Principio: "Un agente que marca incertidumbre le gana a uno que alucina un número con confianza."
1. Ingesta documentos difíciles (fotos torcidas, térmicos desvanecidos, manchas).
2. Extrae datos con cálculo de certeza por campo (si < 85%, marca recorte visual).
3. Motor aritmético 100% determinista en código (TypeScript).
4. Cruza contra el Libro Diario contable de la empresa para detectar duplicados y discrepancias.
5. Inferencia local y privada sin enviar balances a la nube.`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitchSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-200">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Guion de Presentación y Documento Técnico
            </span>
            <span className="text-xs text-slate-400">Para explicar Cotejo en 2 minutos</span>
          </div>
          
          <button
            onClick={handleCopyPitch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copied ? 'Copiado al portapapeles' : 'Copiar Resumen de Pitch'}</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          COTEJO
        </h1>
        <p className="text-lg text-indigo-300 font-bold mt-1">
          El auditor contable que te dice en qué no confiar
        </p>

        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 text-slate-300">
            <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Inferencia local en tu equipo</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Matemática determinista verificada</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>50 Documentos Reales en Corpus</span>
          </div>
        </div>
      </div>

      {/* 1. Resumen Ejecutivo */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <span>1. Qué es Cotejo y qué problema resuelve</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>Cotejo</strong> es un auditor de documentos contables que corre enteramente en la computadora del usuario. Ingiere facturas, recibos y comprobantes —incluyendo fotos torcidas, mal iluminadas y arrugadas—, extrae los datos, los cruza contra los registros de la empresa y marca las discrepancias.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Su diferencia con cualquier otro extractor de facturas es una sola, y es deliberada: <strong>Cotejo está diseñado para reconocer lo que no pudo leer bien</strong>. Cuando la confianza de lectura de un campo baja de cierto umbral, no completa el dato con una suposición: lo marca, muestra el recorte exacto de la imagen y pide revisión humana de 5 segundos.
        </p>
      </section>

      {/* 2. La Tesis del Producto */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>2. La Tesis Central del Producto</span>
        </h2>
        <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 text-indigo-200 text-sm font-bold shadow-inner">
          "Un agente que marca incertidumbre le gana a uno que alucina un número con confianza."
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Un error silencioso en contabilidad es peor que no tener el dato. Si la herramienta avisa que no pudo leer, alguien lo revisa en cinco segundos. Si inventa un número plausible, el error se descubre meses después en una auditoría de AFIP/IRS, o no se descubre jamás provocando diferencias de balance.
        </p>
      </section>

      {/* 3. Guion del Video de Demostración */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-rose-400" />
          <span>3. Guion de Demostración (Estructura de 2 Minutos)</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-mono font-bold text-indigo-400 block mb-1">00:00 - 00:20 (Planteo del Problema)</span>
            <p className="text-slate-300 leading-relaxed">
              Una herramienta OCR que siempre devuelve un número parece más útil, pero introduce errores silenciosos en la contabilidad. Un error no revisado es peor que un dato faltante.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-mono font-bold text-emerald-400 block mb-1">00:20 - 00:40 (Inferencia Local y Privacidad)</span>
            <p className="text-slate-300 leading-relaxed">
              Todo el procesamiento ocurre de manera local. Las facturas y balances de clientes no se envían a servidores de terceros.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-mono font-bold text-amber-400 block mb-1">00:40 - 01:20 (Ingesta de Comprobantes Sucios)</span>
            <p className="text-slate-300 leading-relaxed">
              Se procesa una tanda completa: fotos inclinadas de celular, papel térmico desvanecido de 6 meses y notas manuscritas de caja chica.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-mono font-bold text-rose-400 block mb-1">01:20 - 02:00 (Momento Central: Incertidumbre y Recorte)</span>
            <p className="text-slate-300 leading-relaxed">
              El sistema marca un campo con confianza baja (&lt; 85%), muestra el recorte de la imagen y solicita revisión de 5 segundos. <em>"El sistema podría haber inventado ese número y decidió no hacerlo."</em>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Arquitectura y Reglas Irrenunciables */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>4. Decisiones Técnicas y Reglas Irrenunciables</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white block">Aritmética Determinista</span>
            <p className="text-slate-400 leading-relaxed">
              El modelo nunca hace cálculos matemáticos de memoria. La suma de líneas, cálculo de IVA y comprobación de duplicados se ejecutan en código nativo TypeScript.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white block">Bandeja de 5 Segundos</span>
            <p className="text-slate-400 leading-relaxed">
              Cada hallazgo dudoso viene acompañado del recorte exacto de la imagen para que el contador apruebe sin abrir archivos externos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white block">Presupuesto de Memoria</span>
            <p className="text-slate-400 leading-relaxed">
              Modelo en cuantización de 4 bits con consumo menor a 4 GB RAM, ejecutable en laptops convencionales.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white block">Evidencia sobre Impresiones</span>
            <p className="text-slate-400 leading-relaxed">
              Entrega con tabla de 50 documentos reales y sección explícita de casos no resueltos admitidos abiertamente.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
