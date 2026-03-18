// app/(auth)/login.tsx
import { useRouter } from 'expo-router';
import LoginScreen from '@/screens/onboarding/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();
  return (
    <LoginScreen
      onLogin={() => router.replace('/(tabs)')}
      onGoToRegister={() => router.push('/(auth)/register')}
    />
  );
}
