import { ExerciseLibraryView } from '@/components/library/ExerciseLibraryView';

export const metadata = {
  title: 'Exercise Library & Video Demonstrations | AuraFit Coach',
  description: 'Searchable database of exercises with video demonstrations and form tips.',
};

export default function LibraryPage() {
  return <ExerciseLibraryView />;
}
