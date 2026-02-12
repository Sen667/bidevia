import { getIncendies, getIncendiesRaw } from '@/lib/postgres';
import MapClient from '@/components/MapClient';
import TableIncendies from '@/components/TableIncendies';
import { motion } from 'framer-motion'; // À utiliser si tu transformes une partie en client, sinon utilise des classes transition

export default async function Home() {
  // Pour la carte : uniquement les incendies avec GPS
  const incendies = await getIncendies();
  
  // Pour le tableau : TOUS les incendies (même sans GPS)
  const allIncendies = await getIncendiesRaw();
  
  // Debug: Afficher les données récupérées
  console.log('📊 Nombre d\'incendies avec GPS:', incendies.length);
  console.log('📊 Nombre TOTAL d\'incendies:', allIncendies.length);
  if (allIncendies.length > 0) {
    console.log('📋 Premier incendie:', allIncendies[0]);
  }
  
  // Statistiques calculées
  const totalIncendies = allIncendies.length;
  const highSeverity = allIncendies.filter(i => (i.severity_index || i.gravite) >= 4).length;

  const now = new Date();
  const today = allIncendies.filter(inc => {
    const incDate = inc.date_event || inc.date;
    return incDate && new Date(incDate).toDateString() === now.toDateString();
  });
  const yesterday = allIncendies.filter(inc => {
    const y = new Date();
    y.setDate(now.getDate() - 1);
    const incDate = inc.date_event || inc.date;
    return incDate && new Date(incDate).toDateString() === y.toDateString();
  });

  return (
    <main className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] font-sans selection:bg-blue-500/20">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-blue-200/30 to-purple-200/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-orange-100/40 to-white/0 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-6 py-10 space-y-8">
        
        {/* Header - Profilé et Aérien */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1C1C1E] rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
              <h1 className="text-4xl font-black tracking-tight italic">
                JDE<span className="text-slate-400 not-italic font-light">WATCH</span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">Surveillance temps réel • Hauts-de-France</p>
          </div>

          {/* Quick Stats Row */}
          <div className="flex gap-4">
            <StatCard label="Total" value={totalIncendies} color="text-slate-900" />
            <StatCard label="Critiques" value={highSeverity} color="text-red-500" isAlert />
            <div className="hidden sm:flex px-6 py-4 bg-white/50 backdrop-blur-md rounded-[1.5rem] border border-white/50 shadow-sm items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut Système</p>
                <p className="text-sm font-bold text-green-600 flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Opérationnel
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid: Sidebar + Map */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-auto xl:h-[780px]">
          
          {/* Sidebar - Liste style iOS */}
          <div className="xl:col-span-3 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
            <div className="p-7 border-b border-gray-100/50 flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-[0.15em] text-slate-400">Flux Live</h2>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">LIVE</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
              <SectionIncendie title="Aujourd'hui" data={today} />
              <SectionIncendie title="Hier" data={yesterday} />
              {/* Ajoute d'autres sections si besoin */}
            </div>
          </div>

          {/* Map Container */}
          <div className="xl:col-span-9 group relative bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <MapClient data={incendies} />
            
            {/* Map UI Overlays */}
            <div className="absolute top-6 left-6 pointer-events-none">
              <div className="bg-[#1C1C1E]/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                <p className="text-white text-[11px] font-bold tracking-wide uppercase">Vue Satellite Active</p>
              </div>
            </div>
          </div>
        </section>

        {/* Full Table Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight">Archives complètes</h2>
            <div className="h-px flex-1 mx-8 bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/40 p-2 shadow-sm">
             <TableIncendies data={allIncendies} />
          </div>
        </section>

      </div>
    </main>
  );
}

// --- Sous-composants pour la propreté du code ---

function StatCard({ label, value, color, isAlert = false }: any) {
  return (
    <div className="px-8 py-5 bg-white/80 backdrop-blur-md rounded-[1.5rem] border border-white shadow-sm hover:shadow-md transition-all group">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 group-hover:text-slate-600 transition-colors">{label}</p>
      <p className={`text-3xl font-black ${color} tabular-nums`}>{value}</p>
    </div>
  );
}

function SectionIncendie({ title, data }: { title: string, data: any[] }) {
  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">{title}</h3>
      <div className="space-y-3">
        {data.map((inc) => (
          <div key={inc.id} className="group p-5 rounded-[1.8rem] bg-white border border-gray-100/50 hover:border-blue-200 shadow-sm hover:shadow-[0_10px_25px_rgba(0,0,0,0.03)] transition-all duration-500 cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[16px] text-[#1C1C1E] group-hover:text-blue-600 transition-colors">
                {inc.city || inc.ville || 'Ville inconnue'}
              </h4>
              <span className="text-[10px] font-bold text-slate-300 tabular-nums">
                {inc.heure_sinistre || (inc.date_event ? new Date(inc.date_event).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (inc.date ? new Date(inc.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'))}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 font-medium mb-3">
              {inc.summary || inc.resume || "Aucune description disponible pour cet événement."}
            </p>
            <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                  (inc.severity_index || inc.gravite) >= 4 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {inc.type_sinistre || inc.type || 'Incident'}
                </span>
                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}