// app/(auth)/register.tsx
import { useRouter } from 'expo-router';
import RegisterScreen from '@/screens/onboarding/RegisterScreen';

export default function RegisterRoute() {
  const router = useRouter();
  return (
    <RegisterScreen onComplete={() => router.replace('/(tabs)')} />
  );
}
