import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AuraFit AI Coach',
    short_name: 'AuraFit',
    description:
      'AI-powered personal fitness coach — personalized workouts, nutrition, and progress tracking.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#020617', // slate-950
    theme_color: '#10b981',      // emerald-500
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      {
        src: '/icon-192.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: '/icon-512.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any maskable',
      },
    ],
    screenshots: [],
  };
}
