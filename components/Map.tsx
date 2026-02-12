'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import getCustomMarkerIcon from './CustomMarker';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Incendie } from '@/lib/types';

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
}

export default function Map({ data }: MapProps) {
  // Center on Hauts-de-France
  const center: [number, number] = [50.62925, 3.057256];
  // Bounds for Hauts-de-France (approximate)
  const bounds: [[number, number], [number, number]] = [
    [49.8, 1.4],   // Southwest (lat, lng)
    [51.1, 4.3],   // Northeast (lat, lng)
  ];

  console.log('🗺️ Map - Nombre d\'incendies reçus:', data.length);
  console.log('🗺️ Map - Premier incendie:', data[0]);

  return (
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
      {data.map((incendie) => (
        <Marker 
          key={incendie.id} 
          position={[incendie.lat, incendie.lng]}
          icon={getCustomMarkerIcon()}
        >
          <Popup className="custom-popup">
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-red-600 text-lg mb-1">
                {incendie.city || incendie.ville || 'Ville inconnue'}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-red-100 text-red-600 rounded-full border border-red-200">
                  {incendie.type_sinistre || incendie.type || 'Incident'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {incendie.heure_sinistre || (incendie.date_event ? new Date(incendie.date_event).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (incendie.date ? new Date(incendie.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'))}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-snug mb-2 font-light">
                {incendie.summary || incendie.resume || 'Pas de description'}
              </p>
              {(incendie.source_url || incendie.sources) && (
                <a 
                  href={incendie.source_url || incendie.sources} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  Source externe
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
