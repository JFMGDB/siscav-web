import LoginForm from "@/components/features/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - SISCAV",
  description: "Entrar no Sistema de Controle de Acesso de Veículos",
};

export default function LoginPage() {
  return <LoginForm />;
}
