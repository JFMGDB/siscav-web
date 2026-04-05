# Sistema de Controle de Entrada de Automática de Veículos (SISCAV-WEB) - Frontend

[![CI Pipeline](https://github.com/JFMGDB/siscav-web/actions/workflows/ci.yml/badge.svg)](https://github.com/JFMGDB/siscav-web/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Code style: Prettier](https://img.shields.io/badge/code%20style-Prettier-ff69b4.svg)](https://prettier.io/)
[![License: Academic](https://img.shields.io/badge/license-Academic-green.svg)](https://unicap.br)

## Visão Geral

O projeto é dividido em dois repositórios: `siscav-api` (para o backend) e `siscav-web` (para o frontend).

Este repositório (`siscav-web`) contém toda a lógica do lado do cliente e a interface do usuário, construída como um painel de administração. Ele é responsável por:

- Fornecer uma interface de login para administradores.
- Permitir o gerenciamento (CRUD) da lista de veículos autorizados.
- Exibir o histórico de logs de acesso.
- Oferecer a funcionalidade de acionamento remoto do portão.

## Principais Funcionalidades

- **Página de Login e Controle de Acesso**
- **Painel de Gerenciamento da Whitelist**
- **Painel de Visualização de Logs**
- **Visualização de Imagens**
- **Acionamento Remoto Manual**

## Pilha Tecnológica

- **Framework:** Next.js (React)
- **Linguagem:** TypeScript
- **Estilização:** CSS Modules
- **Testes:** Jest, React Testing Library
- **Qualidade de Código:** ESLint, Prettier
- **DevOps:** GitHub Actions

## Estrutura do Projeto

```bash
siscav-web/
├── .github/
│   └── workflows/
│       └── ci.yml # Pipeline de CI (lint, build, testes)
├── public/ # Ativos estáticos
├── src/
│   ├── app/
│   │   ├── (auth)/ # Rotas protegidas (ex: /dashboard)
│   │   ├── (public)/ # Rotas públicas (ex: /login)
│   │   ├── layout.tsx # Layout raiz da aplicação
│   │   └── page.tsx # Página inicial
│   ├── components/
│   │   ├── features/ # Componentes "inteligentes" com lógica de negócio
│   │   └── ui/ # Componentes de UI genéricos e reutilizáveis
│   ├── hooks/ # Hooks React customizados
│   └── lib/ # Funções utilitárias, cliente de API, etc.
├── .gitignore
├── eslint.config.mjs # Configuração do ESLint (formato "flat")
├── jest.config.mjs # Configuração do Jest
├── next.config.mjs # Configuração do Next.js
├── package.json # Dependências e scripts do projeto
└── tsconfig.json # Configuração do TypeScript
```

### Planeamento

A pasta `.planning/` contém artefactos GSD (roadmap, requisitos, estado do projeto) para quem mantém o repositório; não é obrigatório para uma alteração pontual, mas reflete o escopo acordado para evoluções planeadas.

## Guia de Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20.x ou superior)
- [npm](https://www.npmjs.com/) (geralmente instalado com o Node.js)

### Instalação

```bash
git clone https://github.com/JFMGDB/siscav-web.git
cd siscav-web
npm install
```

### Configuração local da API

O frontend comunica com o backend no repositório **siscav-api** via REST. A variável de ambiente **`NEXT_PUBLIC_API_URL`** define a URL base dessa API. O valor típico em desenvolvimento é **`http://localhost:8000`**, alinhado ao fallback em `src/constants/index.ts` quando a variável não está definida.

Copie o ficheiro de exemplo e ajuste se necessário:

```bash
cp .env.example .env.local
```

No Windows (PowerShell): `Copy-Item .env.example .env.local`

## Scripts

### `npm run dev`

Inicia a aplicação em modo de desenvolvimento.

Abra [http://localhost:3000](http://localhost:3000) para visualizá-la no seu navegador. A página será recarregada automaticamente após as edições.

### `npm test`

Executa a suíte de testes unitários e de componentes utilizando o Jest. É ideal para ser executado antes de enviar alterações para o repositório.

### `npm run lint` (Deprecated)

Executa o ESLint para analisar estaticamente o código em busca de problemas de qualidade e estilo.

### `npm run format`

Formata automaticamente todo o código do projeto utilizando o Prettier para garantir um estilo consistente.

### `npm run build`

Compila a aplicação para um ambiente de produção. Este comando valida se o projeto está livre de erros de compilação e de tipos do TypeScript.

## Integração Contínua (CI)

Este projeto utiliza **GitHub Actions** para automação de CI. O workflow definido em `.github/workflows/ci.yml` é acionado a cada pull request para a branch `develop` e executa as seguintes verificações:

1. **Linting:** Garante que o código segue as convenções.
2. **Build:** Garante que a aplicação compila sem erros.
3. **Testes:** Garante que a lógica existente não foi quebrada.

Se qualquer uma dessas etapas falhar, a mesclagem do pullrequest será bloqueada.