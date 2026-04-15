"use client";

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

type SortOption = 'date-desc' | 'date-asc' | 'severity-desc' | 'severity-asc';
type FilterOption = 'all' | 'incendies' | 'catastrophes' | 'inondations' | 'degats';

export default function TableIncendiesStyleApple({ data, catastrophes = [], inondations = [], degats = [] }: { data: any[], catastrophes?: any[], inondations?: any[], degats?: any[] }) {
  const [selected, setSelected] = useState<any | null>(null);
  const [activeSort, setActiveSort] = useState<SortOption>('date-desc');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug: Afficher les données reçues
  console.log('🔍 TableIncendies - Données reçues:', data.length, 'incendies');
  console.log('🔍 Inondations reçues:', inondations.length);
  console.log('🔍 Dégâts des eaux reçus:', degats.length);
  console.log('🔍 Premier élément:', data[0]);

  // Tri et filtrage des données
  const sortedData = useMemo(() => {
    let result = [];
    
    // Application du filtre
    if (activeFilter === 'all') {
      result = [...data, ...catastrophes, ...inondations, ...degats];
    } else if (activeFilter === 'incendies') {
      result = [...data];
    } else if (activeFilter === 'catastrophes') {
      result = [...catastrophes];
    } else if (activeFilter === 'inondations') {
      result = [...inondations];
    } else if (activeFilter === 'degats') {
      result = [...degats];
    }
    
    switch (activeSort) {
      case 'date-desc':
        // Plus récent au plus ancien
        result.sort((a, b) => {
          const dateA = a.incident_date || a.created_at || a.date;
          const dateB = b.incident_date || b.created_at || b.date;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        break;
      
      case 'date-asc':
        // Plus ancien au plus récent
        result.sort((a, b) => {
          const dateA = a.incident_date || a.created_at || a.date;
          const dateB = b.incident_date || b.created_at || b.date;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
        break;
      
      case 'severity-desc':
        // Plus grave au moins grave
        result.sort((a, b) => {
          const sevA = a.severity_index || a.gravite || 0;
          const sevB = b.severity_index || b.gravite || 0;
          return sevB - sevA;
        });
        break;
      
      case 'severity-asc':
        // Moins grave au plus grave
        result.sort((a, b) => {
          const sevA = a.severity_index || a.gravite || 0;
          const sevB = b.severity_index || b.gravite || 0;
          return sevA - sevB;
        });
        break;
    }
    
    return result;
  }, [data, activeSort, activeFilter, catastrophes, inondations, degats]);

  console.log('🔍 Données triées:', sortedData.length, 'incendies');

  return (
    <div className="w-full font-sans antialiased space-y-6">
      
      {/* Barre de Tri - Style Apple Music/Store */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto">
          <span className="text-sm font-bold text-slate-600 shrink-0">Filtrer :</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-[calc(100vw-4rem)] md:w-full no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeFilter === 'all'
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              🔄 Tout
            </button>
            <button
              onClick={() => setActiveFilter('incendies')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeFilter === 'incendies'
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              🔥 Incendies
            </button>
            <button
              onClick={() => setActiveFilter('catastrophes')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeFilter === 'catastrophes'
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              🌪️ Catastrophes Nat.
            </button>
            <button
              onClick={() => setActiveFilter('inondations')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeFilter === 'inondations'
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              🌊 Inondations
            </button>
            <button
              onClick={() => setActiveFilter('degats')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeFilter === 'degats'
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              💧 Dégâts des eaux
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto">
          <span className="text-sm font-bold text-slate-600 shrink-0">Trier :</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-[calc(100vw-4rem)] md:w-full no-scrollbar">
            <button
              onClick={() => setActiveSort('date-desc')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeSort === 'date-desc'
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              📅 Date ↓ (récent)
            </button>
            <button
              onClick={() => setActiveSort('date-asc')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeSort === 'date-asc'
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              📅 Date ↑ (ancien)
            </button>
            <button
              onClick={() => setActiveSort('severity-desc')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeSort === 'severity-desc'
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              🔥 Sévérité ↓ (élevée)
            </button>
            <button
              onClick={() => setActiveSort('severity-asc')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeSort === 'severity-asc'
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              🔥 Sévérité ↑ (faible)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden w-[calc(100vw-3rem)] sm:w-full">
        <div className="overflow-x-auto w-full no-scrollbar">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-gray-50/50">
                <th className="px-6 py-5 text-left">Ville</th>
                <th className="px-6 py-5 text-left">Type</th>
                <th className="px-6 py-5 text-center">Gravité</th>
                <th className="px-6 py-5 text-left">Incident</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            
            <motion.tbody 
              layout 
              className="divide-y divide-gray-50"
            >
              <AnimatePresence mode="popLayout">
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-slate-500 font-semibold">Aucun événement enregistré</p>
                        <p className="text-xs text-slate-400">Les données apparaîtront ici dès qu'elles seront disponibles</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedData.map((inc, index) => (
                    <motion.tr 
                      key={`${inc.category || 'event'}-${inc.id}-${index}`}
                      layout // Magie Framer Motion : gère la position
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 33 }}
                      className="group cursor-default bg-white/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1C1C1E] text-[15px]">{inc.city || inc.ville || 'N/A'}</span>
                          <span className="text-[12px] text-slate-400 font-medium">{inc.department || 'France'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100/80 text-gray-600 border border-gray-200/50 whitespace-nowrap truncate max-w-[120px] md:max-w-full">
                          {inc.building_type || inc.type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <SeverityBadge level={inc.severity_index || inc.gravite || 0} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700 line-clamp-1 max-w-[150px] sm:max-w-[250px] lg:max-w-[400px]">
                          {inc.title || inc.resume || 'Incident sans titre'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            // S'assurer que le body ne scroll plus quand le modal s'ouvre
                            document.body.style.overflow = 'hidden';
                            setSelected(inc);
                          }} 
                          className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#1C1C1E] hover:text-white text-[12px] md:text-[13px] font-bold transition-all whitespace-nowrap"
                        >
                          Détails
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Détail de l'incident (Modal) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selected && (
            <ModalDetail selected={selected} onClose={() => {
              document.body.style.overflow = 'unset';
              setSelected(null);
            }} />
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// --- Composants Internes ---

function SeverityBadge({ level }: { level: number }) {
  const styles = level >= 4 ? "bg-[#FF3B30] text-white" : level >= 2 ? "bg-[#FF9500] text-white" : "bg-[#FFCC00] text-[#1C1C1E]";
  return (
    <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-[12px] font-black shadow-sm ${styles}`}>
      {level}
    </span>
  );
}

function ModalDetail({ selected, onClose }: { selected: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#1C1C1E]/60 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative z-[101]"
      >
        {/* En-tête */}
        <div className="flex justify-between items-start mb-8 sticky top-0 bg-white z-10 pb-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2 block">Détails de l'alerte</span>
            <h3 className="text-3xl font-black text-[#1C1C1E] leading-tight tracking-tight">
              {selected.title || selected.city || 'Incident'}
            </h3>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Ville" value={selected.city || selected.ville || 'N/A'} />
            <InfoCard label="Département" value={selected.department || 'N/A'} />
          </div>

          {/* Adresse */}
          {selected.rue_sinistre && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">📍 Adresse</p>
              <p className="font-bold text-slate-800">{selected.rue_sinistre}</p>
            </div>
          )}

          {/* Coordonnées GPS */}
          {(selected.latitude || selected.lat) && (selected.longitude || selected.lng) && (
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Latitude" value={Number(selected.latitude || selected.lat).toFixed(6) || 'N/A'} />
              <InfoCard label="Longitude" value={Number(selected.longitude || selected.lng).toFixed(6) || 'N/A'} />
            </div>
          )}

          {/* Date et heure */}
          <div className="grid grid-cols-3 gap-4">
            <InfoCard label="Date événement" value={selected.date_event || selected.date || 'N/A'} />
            <InfoCard label="Date sinistre" value={selected.date_sinistre || 'N/A'} />
            <InfoCard label="Heure" value={selected.heure_sinistre || 'N/A'} />
          </div>

          {/* Type et gravité */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Type de sinistre</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-gray-200 text-gray-700">
                {selected.type_sinistre || selected.type || 'N/A'}
              </span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sévérité</p>
              <div className="flex items-center gap-2">
                <SeverityBadge level={selected.severity_index || selected.gravite || 0} />
                <span className="font-bold text-slate-800">Niveau {selected.severity_index || selected.gravite || 0}</span>
              </div>
            </div>
          </div>

          {/* Résumé */}
          {(selected.summary || selected.resume) && (
            <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
              <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">📝 Résumé</p>
              <p className="text-blue-900 font-medium leading-relaxed">
                {selected.summary || selected.resume}
              </p>
            </div>
          )}

          {/* Ressources déployées */}
          {selected.resources_deployed && (
            <div className="p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100/50">
              <p className="text-[10px] font-bold text-orange-400 uppercase mb-2">🚒 Ressources déployées</p>
              <p className="text-orange-900 font-medium leading-relaxed">
                {selected.resources_deployed}
              </p>
            </div>
          )}

          {/* Identité */}
          {selected.identite && (
            <InfoCard label="Identité" value={selected.identite} fullWidth />
          )}

          {/* Raison de rejet */}
          {selected.reason_of_rejection && (
            <div className="p-6 bg-red-50/50 rounded-[2rem] border border-red-100/50">
              <p className="text-[10px] font-bold text-red-400 uppercase mb-2">⚠️ Raison de rejet</p>
              <p className="text-red-900 font-medium leading-relaxed">
                {selected.reason_of_rejection}
              </p>
            </div>
          )}

          {/* Sources */}
          <div className="grid grid-cols-1 gap-4">
            {selected.source_name && (
              <InfoCard label="Source" value={selected.source_name} />
            )}
            {selected.source_url && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">🔗 URL Source</p>
                <a 
                  href={selected.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm underline break-all"
                >
                  {selected.source_url}
                </a>
              </div>
            )}
          </div>

          {/* Métadonnées */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {selected.created_at && (
              <InfoCard label="Créé le" value={new Date(selected.created_at).toLocaleString('fr-FR')} />
            )}
            {selected.updated_at && (
              <InfoCard label="Mis à jour le" value={new Date(selected.updated_at).toLocaleString('fr-FR')} />
            )}
          </div>

          {/* ID de l'enregistrement */}
          <div className="p-3 bg-gray-100 rounded-xl">
            <p className="text-[9px] font-mono text-slate-400 text-center">ID: {selected.id}</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 bg-[#1C1C1E] text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Fermer
        </button>
      </motion.div>
    </div>
  );
}

// Composant réutilisable pour afficher une information
function InfoCard({ label, value, fullWidth = false }: { label: string, value: string, fullWidth?: boolean }) {
  return (
    <div className={`p-4 bg-gray-50 rounded-2xl border border-gray-100 ${fullWidth ? 'col-span-2' : ''}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
      <p className="font-bold text-slate-800">{value}</p>
    </div>
  );
}