// app/(auth)/welcome.tsx
import { useRouter } from 'expo-router';
import OnboardingTour from '@/screens/onboarding/OnboardingTour';

export default function WelcomeRoute() {
  const router = useRouter();
  return (
    <OnboardingTour onFinish={() => router.replace('/(auth)/login')} />
  );
}
