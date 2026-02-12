// lib/types.ts
export interface Incendie {
  id: string;
  
  // Localisation
  city: string;
  rue_sinistre?: string;
  department?: string;
  lat: number;
  lng: number;
  
  // Informations temporelles
  date_event: string;
  date_sinistre?: string;
  heure_sinistre?: string;
  
  // Détails de l'incident
  title: string;
  summary?: string;
  type_sinistre: string;
  severity_index?: number;
  resources_deployed?: string;
  
  // Informations supplémentaires
  identite?: string;
  reason_of_rejection?: string;
  
  // Sources
  source_url?: string;
  source_name?: string;
  
  // Métadonnées
  created_at?: string;
  updated_at?: string;
  
  // Champs de compatibilité (pour la transition)
  ville?: string;
  type?: string;
  gravite?: number;
  resume?: string;
  date?: string;
  sources?: string;
  ressources?: string;
}
