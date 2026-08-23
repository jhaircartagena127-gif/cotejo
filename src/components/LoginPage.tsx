import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft, Sparkles, UserCheck, Briefcase, FileCheck2, Lock, Check } from 'lucide-react';
import { DEMO_ACCOUNT, DemoUser } from '../lib/session';

interface LoginPageProps {
  onBack: () => void;
  onLogin: (user: DemoUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'auditor' | 'contador' | 'revisor'>('auditor');
  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_ACCOUNT.password);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'quick' | 'manual'>('quick');

  const demoRoles = {
    auditor: {
      name: 'Auditor Principal (Senior)',
      email: 'auditor@cotejo.app',
      desc: 'Control total de lote, conciliación bancaria y aprobación de comprobantes.',
      badge: 'Acceso Completo',
    },
    contador: {
      name: 'Lic. Valentina Ruiz (Contadora)',
      email: 'valentina.ruiz@estudiocontable.com',
      desc: 'Revisión de Libro Diario, asientos contables y cálculo determinista de IVA.',
      badge: 'Vista Contable',
    },
    revisor: {
      name: 'Carlos Méndez (Revisor Administrativo)',
      email: 'carlos.mendez@empresa.com',
      desc: 'Ingesta de fotos, escaneo y verificación de recortes visuales.',
      badge: 'Carga & Verificación',
    },
  };

  const handleQuickEnter = (roleKey = selectedRole) => {
    const role = demoRoles[roleKey];
    onLogin({ name: role.name, email: role.email });
  };

  const handleFillDemo = (roleKey: 'auditor' | 'contador' | 'revisor') => {
    setSelectedRole(roleKey);
    setEmail(demoRoles[roleKey].email);
    setPassword('demo');
    setError('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mail = email.trim();
    if (!mail) {
      setError('Por favor ingresá un correo o usá el acceso demo de 1 clic.');
      return;
    }
    const roleInfo = demoRoles[selectedRole];
    onLogin({
      name: mail === roleInfo.email ? roleInfo.name : mail.split('@')[0],
      email: mail,
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F0E8] flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full px-5 py-5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950 bg-white/80 border border-slate-200 px-3 py-1.5 rounded-full transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la portada</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500 font-medium">Entorno Demo Activo</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Header Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Acceso a Cotejo</h1>
              <p className="text-xs text-slate-500 font-medium">Demostración interactiva para presentación</p>
            </div>
          </div>

          {/* Tab Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setMode('quick')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === 'quick' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Acceso Rápido (1 Clic)</span>
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === 'manual' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Credenciales Manuales</span>
            </button>
          </div>

          {mode === 'quick' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Elegí un perfil de demostración:
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'auditor' as const, icon: UserCheck, ...demoRoles.auditor },
                    { id: 'contador' as const, icon: Briefcase, ...demoRoles.contador },
                    { id: 'revisor' as const, icon: FileCheck2, ...demoRoles.revisor },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedRole(item.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                        selectedRole === item.id
                          ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl mt-0.5 ${
                            selectedRole === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs text-slate-900">{item.name}</p>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>

                      {selectedRole === item.id && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Big 1-Click Action Button */}
              <button
                type="button"
                onClick={() => handleQuickEnter(selectedRole)}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Entrar como {demoRoles[selectedRole].name.split(' ')[0]}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] text-slate-400">
                ⚡ Acceso instantáneo sin contraseña con lote de 50 comprobantes precargado
              </p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-indigo-900">Credenciales Demo</p>
                  <p className="text-slate-600 text-[11px]">demo@cotejo.app / clave: demo</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillDemo('auditor')}
                  className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition"
                >
                  Autocompletar
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition"
                  placeholder="tu@empresa.com"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="text-rose-600 font-semibold">{error}</p>}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg transition"
              >
                Ingresar al Dashboard
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
