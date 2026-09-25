import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export const metadata = {
  title: 'Personal Fitness Assessment | AuraFit Coach',
  description: 'Multi-step biometric, goal, equipment, and dietary onboarding.',
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
