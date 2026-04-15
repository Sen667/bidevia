'use client';

import dynamic from 'next/dynamic';
import { Incendie, CatastropheNaturelle, Inondation, DegatDesEaux } from '@/lib/types';

// Import dynamique de la carte pour éviter les erreurs "window not defined"
const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">Chargement de la carte...</div>
});

interface MapClientProps {
  data: Incendie[];
  catastrophes?: CatastropheNaturelle[];
  inondations?: Inondation[];
  degats?: DegatDesEaux[];
}

export default function MapClient({ data, catastrophes = [], inondations = [], degats = [] }: MapClientProps) {
  return <MapWithNoSSR data={data} catastrophes={catastrophes} inondations={inondations} degats={degats} />;
}
