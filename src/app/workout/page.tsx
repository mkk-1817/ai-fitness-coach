import { WorkoutPlanView } from '@/components/workout/WorkoutPlanView';

export const metadata = {
  title: 'AI Workout Plan | AuraFit Coach',
  description: 'View your personalized AI-generated weekly training split and exercise routines.',
};

export default function WorkoutPage() {
  return <WorkoutPlanView />;
}
