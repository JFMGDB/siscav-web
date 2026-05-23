// Layout principal para as rotas autenticadas da aplicação.
// Envolve as páginas que só podem ser acessadas por usuários logados.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
