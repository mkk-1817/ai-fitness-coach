import { WorkoutPlayer } from '@/components/workout/WorkoutPlayer';

export const metadata = {
  title: 'Active Workout Player | AuraFit Coach',
  description: 'Interactive execution, sets counter, rest countdown timer, and live telemetry.',
};

export default function WorkoutPlayerPage() {
  return <WorkoutPlayer />;
}
