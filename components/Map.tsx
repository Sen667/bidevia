'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import getCustomMarkerIcon from './CustomMarker';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Incendie, CatastropheNaturelle, Inondation, DegatDesEaux } from '@/lib/types';

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  data: Incendie[];
  catastrophes?: CatastropheNaturelle[];
  inondations?: Inondation[];
  degats?: DegatDesEaux[];
}

// Couleurs par type de sinistre
const SINISTRE_COLORS = {
  incendie:     { color: '#ef4444', label: '🔥 Incendies',            bg: 'bg-red-500' },
  catastrophe:  { color: '#f97316', label: '⛈️ Catastrophes nat.',    bg: 'bg-orange-500' },
  inondation:   { color: '#3b82f6', label: '💧 Inondations',          bg: 'bg-blue-500' },
  degat:        { color: '#06b6d4', label: '🚿 Dégâts des eaux',      bg: 'bg-cyan-500' },
};

function renderMarkers(items: any[], colorKey: keyof typeof SINISTRE_COLORS) {
  const { color } = SINISTRE_COLORS[colorKey];
  return items
    .filter(item => item.lat && item.lng && item.lat !== 0 && item.lng !== 0)
    .map(item => (
      <Marker
        key={`${colorKey}-${item.id}`}
        position={[item.lat, item.lng]}
        icon={getCustomMarkerIcon({ color, size: 10 })}
      >
        <Popup className="custom-popup">
          <div className="p-2 min-w-[220px]">
            {/* Badge type */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[9px] font-black uppercase py-0.5 px-2 rounded-full border"
                style={{ backgroundColor: color + '20', color, borderColor: color + '60' }}
              >
                {SINISTRE_COLORS[colorKey].label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {item.incident_time || (item.incident_date
                  ? new Date(item.incident_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : (item.date ? new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'))}
              </span>
            </div>
            <h3 className="font-bold text-[15px] text-[#1C1C1E] mb-1">
              {item.city || item.ville || 'Ville inconnue'}
            </h3>
            <p className="text-[11px] text-slate-500 mb-1 font-medium">
              {item.building_type || item.type || ''}
            </p>
            <p className="text-sm text-slate-700 leading-snug mb-2 font-light">
              {item.summary || item.resume || 'Pas de description'}
            </p>
            {(item.source_url || item.sources) && (
              <a
                href={item.source_url || item.sources}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline"
              >
                Source externe ↗
              </a>
            )}
          </div>
        </Popup>
      </Marker>
    ));
}

export default function Map({ data, catastrophes = [], inondations = [], degats = [] }: MapProps) {
  const center: [number, number] = [50.62925, 3.057256];
  const bounds: [[number, number], [number, number]] = [
    [49.8, 1.4],
    [51.1, 4.3],
  ];

  const countWithGPS = (arr: any[]) => arr.filter(i => i.lat && i.lng && i.lat !== 0 && i.lng !== 0).length;

  console.log('🗺️ Map - Incendies GPS:', countWithGPS(data));
  console.log('🗺️ Map - Catastrophes GPS:', countWithGPS(catastrophes));
  console.log('🗺️ Map - Inondations GPS:', countWithGPS(inondations));
  console.log('🗺️ Map - Dégâts eaux GPS:', countWithGPS(degats));

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={9}
        scrollWheelZoom={true}
        className="h-full w-full z-0 block"
        style={{ height: '100%', width: '100%' }}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {renderMarkers(data, 'incendie')}
        {renderMarkers(catastrophes, 'catastrophe')}
        {renderMarkers(inondations, 'inondation')}
        {renderMarkers(degats, 'degat')}
      </MapContainer>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#1C1C1E]/85 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-white/10">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Légende</p>
        <div className="space-y-1.5">
          {(Object.keys(SINISTRE_COLORS) as (keyof typeof SINISTRE_COLORS)[]).map(key => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: SINISTRE_COLORS[key].color, boxShadow: `0 0 6px ${SINISTRE_COLORS[key].color}80` }}
              />
              <span className="text-[11px] text-white/80 font-medium">{SINISTRE_COLORS[key].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
