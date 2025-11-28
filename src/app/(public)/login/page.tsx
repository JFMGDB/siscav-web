import LoginForm from '@/components/features/auth/Login-Form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - SISCAV',
  description: 'Entrar no Sistema de Controle de Acesso de Veículos',
};

export default function LoginPage() {
  return <LoginForm />;
}
