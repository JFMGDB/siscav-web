# Histórico de Alterações (Changelog)

## [0.1.0] - 2025-11-16

### Épico 1: Fundação do Projeto & DevOps

#### Adicionado (Added)

- **FND-04: Estrutura da Aplicação Frontend**
  - Inicializada a estrutura do projeto com Next.js 14, TypeScript e App Router.
  - Adicionadas as dependências principais, incluindo a biblioteca de UI Material-UI (`@mui/material`).
  - Configuradas e integradas as ferramentas de qualidade de código: ESLint para linting e Prettier para formatação.

- **FND-07: Página de Placeholder**
  - Implementada a página inicial (`/`) com um conteúdo de placeholder, servindo como ponto de entrada da aplicação.
  - Removidos todos os ativos e estilos padrão do template `create-next-app` para limpar a base de código.

- **FND-08: Pipeline de CI para o Frontend**
  - Criado o workflow de Integração Contínua com GitHub Actions (`.github/workflows/ci.yml`).
  - O pipeline automatiza a execução de lint, testes (`npm test`) и build (`npm run build`) a cada pull request para a branch `develop`, garantindo a integridade do código.

- **Configuração do Ambiente de Testes**
  - Instalado e configurado o framework de testes Jest com React Testing Library.
  - Adicionado o script `npm test` para a execução da suíte de testes.

- **Documentação do Desenvolvedor**
  - Criado um `README.md` completo com guias de instalação, scripts e uma visão geral da arquitetura.
  - Adicionados guias detalhados na pasta `.github/` para o fluxo de trabalho de CI (`GUIA_CI.md`), testes locais (`GUIA_TESTES_LOCAIS.md`) e uma referência de comandos (`COMANDOS_RAPIDOS.md`).
  - Implementado um template padrão para Pull Requests (`PULL_REQUEST_TEMPLATE.md`) para padronizar as contribuições.
