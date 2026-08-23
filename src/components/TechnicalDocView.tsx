import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Play,
  Github,
  FileCode2,
  ChevronRight,
  Database,
  TerminalSquare
} from 'lucide-react';

export const TechnicalDocView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('resumen');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.5, rootMargin: '-10% 0px -40% 0px' });

    document.querySelectorAll('section[id]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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

  const navItems = [
    { id: 'resumen', title: 'Resumen Ejecutivo', icon: Target },
    { id: 'principios', title: 'Principios Fundamentales', icon: ShieldAlert },
    { id: 'demo', title: 'Demo de 2 Minutos', icon: Video },
    { id: 'arquitectura', title: 'Arquitectura', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col lg:flex-row selection:bg-indigo-500/30">
      <style>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .animate-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Floating TOC Sidebar */}
      <aside className="hidden lg:flex w-72 p-8 sticky top-0 h-screen flex-col border-r border-slate-800/50 bg-slate-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">COTEJO</span>
        </div>
        
        <nav className="flex flex-col gap-2 relative">
          <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-800 -z-10" />
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-slate-900/80 shadow-lg border border-slate-700/50 text-white translate-x-2' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                }`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : 'bg-slate-900 text-slate-500'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">{item.title}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sticky Nav */}
      <div className="lg:hidden sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60 p-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeSection === item.id 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.title}
            </a>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-12 space-y-24 pt-8 lg:pt-12">
        
        {/* Header / Pitch Summary */}
        <div className="animate-on-scroll relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-900/30 via-slate-900 to-slate-950 border border-indigo-500/20 shadow-2xl p-8 sm:p-12 group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
          
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10">
            <button
              onClick={handleCopyPitch}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/50 hover:bg-slate-900 backdrop-blur-md text-slate-200 text-sm font-bold border border-slate-700/50 hover:border-indigo-500/40 transition-all shadow-xl"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar Pitch'}</span>
            </button>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/40 border border-slate-800 mb-6 backdrop-blur-sm">
              <TerminalSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Auditor Contable Multimodal</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
              El auditor que te dice en qué <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">no confiar</span>.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed mb-8">
              "Un agente que marca incertidumbre le gana a uno que alucina un número con confianza."
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/60 pt-8 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <WifiOff className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Inferencia<br/>Local</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Matemática<br/>Determinista</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-slate-300">50 Documentos<br/>Reales</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Resumen Ejecutivo */}
        <section id="resumen" className="animate-on-scroll scroll-mt-32 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Qué es Cotejo</h2>
          </div>
          
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-6 sm:p-10 text-slate-300 text-sm sm:text-base leading-relaxed space-y-6 shadow-xl backdrop-blur-sm">
            <p>
              <strong className="text-white text-lg font-bold">Cotejo</strong> es un auditor de documentos contables que corre enteramente en la computadora del usuario. Ingiere facturas, recibos y comprobantes —incluyendo fotos torcidas, mal iluminadas y arrugadas—, extrae los datos, los cruza contra los registros de la empresa y marca las discrepancias.
            </p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent my-6"></div>
            <p>
              Su diferencia con cualquier otro extractor de facturas es una sola, y es deliberada: <strong className="text-indigo-300 font-bold">Cotejo está diseñado para reconocer lo que no pudo leer bien</strong>. Cuando la confianza de lectura de un campo baja de cierto umbral, no completa el dato con una suposición: lo marca, muestra el recorte exacto de la imagen y pide revisión humana de 5 segundos.
            </p>
          </div>
        </section>

        {/* 2. Principios Fundamentales */}
        <section id="principios" className="animate-on-scroll scroll-mt-32 space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Principios Fundamentales</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8 rounded-[2rem] shadow-xl hover:bg-slate-900/60 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Aritmética Determinista</h3>
              <p className="text-sm text-slate-400 leading-relaxed">El modelo nunca hace cálculos matemáticos de memoria. La suma de líneas, cálculo de IVA y comprobación se ejecutan en código nativo TypeScript.</p>
            </div>
            
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8 rounded-[2rem] shadow-xl hover:bg-slate-900/60 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Inferencia Local</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Todo el procesamiento ocurre de manera local. Las facturas y balances de clientes no se envían a servidores de terceros garantizando total privacidad.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8 rounded-[2rem] shadow-xl hover:bg-slate-900/60 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Incertidumbre Honesta</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Un error silencioso es peor que no tener el dato. Cada hallazgo dudoso viene con el recorte exacto para revisión visual de 5 segundos.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8 rounded-[2rem] shadow-xl hover:bg-slate-900/60 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Presupuesto de RAM</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Modelo en cuantización de 4 bits optimizado con un consumo menor a 4 GB RAM, diseñado para ejecutarse ágilmente en laptops convencionales.</p>
            </div>
          </div>
        </section>

        {/* 3. Demo de 2 Minutos */}
        <section id="demo" className="animate-on-scroll scroll-mt-32 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
                <Video className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Demo del Producto</h2>
                <span className="text-sm text-slate-400 font-medium mt-1 block">Estructura del guion de presentación</span>
              </div>
            </div>
          </div>

          <div className="aspect-video bg-slate-900/80 border border-slate-800/80 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/60 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-rose-500/5"></div>
            <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:bg-rose-400 transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] z-10">
              <Play className="w-8 h-8 ml-1 fill-white" />
            </div>
            <span className="text-white font-bold text-lg z-10">Reproducir Demo de 2 Minutos</span>
          </div>

          <div className="pt-8">
            <div className="relative pl-6 sm:pl-8 space-y-12">
              <div className="absolute left-[11px] sm:left-[15px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
              
              <div className="relative">
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-slate-950 border-4 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]"></div>
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg ml-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold font-mono mb-3">
                    <Clock className="w-3.5 h-3.5" /> 00:00 - 00:20
                  </span>
                  <h4 className="text-white font-bold mb-2">Planteo del Problema</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Una herramienta OCR que siempre devuelve un número parece más útil, pero introduce errores silenciosos en la contabilidad. Un error no revisado es peor que un dato faltante.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-slate-950 border-4 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg ml-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono mb-3">
                    <Clock className="w-3.5 h-3.5" /> 00:20 - 00:40
                  </span>
                  <h4 className="text-white font-bold mb-2">Inferencia Local y Privacidad</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Todo el procesamiento ocurre de manera local. Las facturas y balances de clientes no se envían a servidores de terceros.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-slate-950 border-4 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg ml-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold font-mono mb-3">
                    <Clock className="w-3.5 h-3.5" /> 00:40 - 01:20
                  </span>
                  <h4 className="text-white font-bold mb-2">Ingesta de Comprobantes Sucios</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Se procesa una tanda completa: fotos inclinadas de celular, papel térmico desvanecido de 6 meses y notas manuscritas de caja chica.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-slate-950 border-4 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"></div>
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg ml-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-bold font-mono mb-3">
                    <Clock className="w-3.5 h-3.5" /> 01:20 - 02:00
                  </span>
                  <h4 className="text-white font-bold mb-2">Momento Central: Incertidumbre y Recorte</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">El sistema marca un campo con confianza baja (&lt; 85%), muestra el recorte de la imagen y solicita revisión de 5 segundos. <em className="text-rose-300">"El sistema podría haber inventado ese número y decidió no hacerlo."</em></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Arquitectura y Reglas */}
        <section id="arquitectura" className="animate-on-scroll scroll-mt-32 space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Arquitectura y Reglas</h2>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2rem] shadow-xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-sm uppercase tracking-wider text-slate-400">
                    <th className="p-5 sm:p-6 font-bold">Característica</th>
                    <th className="p-5 sm:p-6 font-bold">OCR Tradicional</th>
                    <th className="p-5 sm:p-6 font-bold text-indigo-400">COTEJO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-5 sm:p-6 font-medium text-white flex items-center gap-2"><FileCode2 className="w-4 h-4 text-slate-500"/> Cálculos Matemáticos</td>
                    <td className="p-5 sm:p-6 text-slate-400">Alucinados por el LLM</td>
                    <td className="p-5 sm:p-6 text-indigo-300 font-bold bg-indigo-500/5">Deterministas (TypeScript)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-5 sm:p-6 font-medium text-white flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-500"/> Revisión de Errores</td>
                    <td className="p-5 sm:p-6 text-slate-400">Silenciosa (Dato incorrecto)</td>
                    <td className="p-5 sm:p-6 text-indigo-300 font-bold bg-indigo-500/5">Bandeja Visual (5 Segundos)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-5 sm:p-6 font-medium text-white flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-slate-500"/> Privacidad de Datos</td>
                    <td className="p-5 sm:p-6 text-slate-400">Nube (API a terceros)</td>
                    <td className="p-5 sm:p-6 text-indigo-300 font-bold bg-indigo-500/5">Local (Sin conexión)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-5 sm:p-6 font-medium text-white flex items-center gap-2"><Cpu className="w-4 h-4 text-slate-500"/> Hardware Requerido</td>
                    <td className="p-5 sm:p-6 text-slate-400">GPUs en la nube</td>
                    <td className="p-5 sm:p-6 text-indigo-300 font-bold bg-indigo-500/5">Laptop (Presupuesto &lt;4GB RAM)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="animate-on-scroll pt-12 mt-20 border-t border-slate-800/60 flex flex-col sm:flex-row gap-4">
          <a href="#" className="flex-1 flex items-center justify-between p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center">
                <Github className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h4 className="text-white font-bold">Repositorio</h4>
                <span className="text-sm text-slate-400">Código fuente</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </a>
          
          <a href="#" className="flex-1 flex items-center justify-between p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h4 className="text-white font-bold">Documentación</h4>
                <span className="text-sm text-slate-400">API y guías</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </a>
        </footer>
      </main>
    </div>
  );
};
