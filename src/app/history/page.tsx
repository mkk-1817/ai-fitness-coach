import { WorkoutHistoryView } from '@/components/history/WorkoutHistoryView';

export const metadata = {
  title: 'Workout History | AuraFit Coach',
  description: 'Chronological history of completed workouts, volume, and RPE scores.',
};

export default function HistoryPage() {
  return <WorkoutHistoryView />;
}
