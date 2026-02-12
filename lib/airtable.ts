// Retourne tous les incendies, même sans coordonnées GPS
export async function getIncendiesRaw(): Promise<Incendie[]> {
  const records = await base(process.env.AIRTABLE_TABLE_NAME!).select({
    sort: [{ field: 'Date', direction: 'desc' }],
  }).all();
  return records.map((record) => ({
    id: record.id,
    ville: String(record.get('Ville') || 'Inconnue'),
    type: String(record.get('Type') || 'Non spécifié'),
    gravite: Number(record.get('Gravité') || 0),
    resume: String(record.get('Résumé') || 'Aucun détail'),
    lat: Number(record.get('Latitude')),
    lng: Number(record.get('Longitude')),
    date: String(record.get('Date') || new Date().toISOString()),
    sources: String(record.get('Sources') || ''),
    ressources: String(record.get('Ressources déployé') || ''),
  }));
}
// lib/airtable.ts
import Airtable from 'airtable';
import { Incendie } from './types';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

export async function getIncendies(): Promise<Incendie[]> {
  const records = await base(process.env.AIRTABLE_TABLE_NAME!).select({
    sort: [{ field: 'Date', direction: 'desc' }], // Les plus récents en premier
  }).all();

  // On nettoie les données pour n'avoir que ce qui nous intéresse
  return records.map((record) => ({
    id: record.id,
    ville: String(record.get('Ville') || 'Inconnue'),
    type: String(record.get('Type') || 'Non spécifié'),
    gravite: Number(record.get('Gravité') || 0),
    resume: String(record.get('Résumé') || 'Aucun détail'),
    lat: Number(record.get('Latitude')),
    lng: Number(record.get('Longitude')),
    date: String(record.get('Date') || new Date().toISOString()),
    sources: String(record.get('Sources') || ''),
    ressources: String(record.get('Ressources déployé') || ''),
  })).filter(item => item.lat && item.lng); // On garde seulement ceux qui ont un GPS
}