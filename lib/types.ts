// lib/types.ts
export interface Incendie {
  id: string;
  
  // Catégorie
  category?: string;
  
  // Localisation
  city: string;
  incident_street?: string;
  department?: string;
  lat: number;
  lng: number;
  
  // Informations temporelles
  publication_date: string;
  incident_date?: string;
  incident_time?: string;
  
  // Détails de l'incident
  title: string;
  summary?: string;
  building_type: string;
  severity_index?: number;
  resources_deployed?: string;
  
  // Informations supplémentaires
  identity?: string;
  
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


export interface CatastropheNaturelle {
  id: string;

  // Catégorie
  category?: string;

  // Localisation
  city: string;
  incident_street?: string;
  department?: string;
  lat: number;
  lng: number;

  // Informations temporelles
  publication_date: string;
  incident_date?: string;
  incident_time?: string;

  // Détails de l'incident
  title: string;
  summary?: string;
  building_type: string;
  severity_index?: number;
  resources_deployed?: string;

  // Informations supplémentaires
  identity?: string;

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

export interface Inondation {
  id: string;

  // Catégorie
  category?: string;

  // Localisation
  city: string;
  incident_street?: string;
  department?: string;
  lat: number;
  lng: number;

  // Informations temporelles
  publication_date: string;
  incident_date?: string;
  incident_time?: string;

  // Détails de l'incident
  title: string;
  summary?: string;
  building_type: string;
  severity_index?: number;
  resources_deployed?: string;

  // Informations supplémentaires
  identity?: string;

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

export interface DegatDesEaux {
  id: string;

  category?: string;
  city: string;
  incident_street?: string;
  department?: string;
  lat: number;
  lng: number;

  publication_date: string;
  incident_date?: string;
  incident_time?: string;

  title: string;
  summary?: string;
  building_type: string;
  severity_index?: number;
  resources_deployed?: string;
  identity?: string;
  source_url?: string;
  source_name?: string;

  created_at?: string;
  updated_at?: string;

  ville?: string;
  type?: string;
  gravite?: number;
  resume?: string;
  date?: string;
  sources?: string;
  ressources?: string;
}
