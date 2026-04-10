import Airtable from 'airtable';
import { Incendie } from './types';

export const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(
  process.env.AIRTABLE_BASE_ID as string
);

export const getIncendies = async (): Promise<Incendie[]> => {
  const records = await base('Incendies').select({
    sort: [{ field: 'Date', direction: 'desc' }],
  }).all();
  return records.map((record) => ({
    id: record.id,
    city: String(record.get('Ville') || 'Inconnue'),
    building_type: String(record.get('Type') || 'Non spécifié'),
    severity_index: Number(record.get('Gravité')) || 1,
    summary: String(record.get('Résumé') || 'Aucun détail disponible'),
    lat: Number(record.get('Latitude')),
    lng: Number(record.get('Longitude')),
    incident_date: String(record.get('Date') || ''),
    publication_date: String(record.get('Date') || ''),
    source_url: String(record.get('Sources') || ''),
    resources_deployed: String(record.get('Ressources') || ''),
    title: String(record.get('Titre') || 'Incident'),
    // Compatibilité
    ville: String(record.get('Ville') || 'Inconnue'),
    type: String(record.get('Type') || 'Non spécifié'),
    gravite: Number(record.get('Gravité')) || 1,
    resume: String(record.get('Résumé') || 'Aucun détail disponible'),
    date: String(record.get('Date') || ''),
    sources: String(record.get('Sources') || ''),
    ressources: String(record.get('Ressources') || '')
  })) as Incendie[];
};