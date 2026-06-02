import AuthPage from "@/components/features/auth/AuthPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar conta - Mantis",
  description:
    "Crie sua conta no Mantis para gerenciar o controle de acesso veicular",
};

export default function RegisterPage() {
  return <AuthPage />;
}
