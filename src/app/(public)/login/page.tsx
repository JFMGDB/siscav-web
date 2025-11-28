import LoginForm from '@/components/features/auth/Login-Form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - SISCAV',
  description: 'Login to Vehicle Access Control System',
};

export default function LoginPage() {
  return <LoginForm />;
}
