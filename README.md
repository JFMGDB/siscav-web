# siscav-web: Frontend do Sistema de Controle de Acesso de Veículos

[![CI Pipeline](https://github.com/seu-usuario/siscav-web/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/siscav-web/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Code style: Prettier](https://img.shields.io/badge/code%20style-Prettier-ff69b4.svg)](https://prettier.io/)
[![License: Academic](https://img.shields.io/badge/license-Academic-green.svg)](https://unicap.br)

Este é o repositório frontend para o "Sistema de Controle de Acesso de Veículos".

> **⚠️ Status do Projeto:** Este projeto está em **desenvolvimento inicial**. Para um registro detalhado das alterações, consulte o nosso [Histórico de Alterações (Changelog)](docs/CHANGELOG.md).

## Visão Geral

A arquitetura geral do projeto é dividida em dois repositórios distintos: `siscav-api` (backend) e `siscav-web` (este).

Este repositório (`siscav-web`) contém toda a lógica do lado do cliente e a interface do usuário, construída como um painel de administração com **Next.js**. Ele é responsável por:

- Fornecer uma interface de login para administradores.
- Permitir o gerenciamento (CRUD) da lista de veículos autorizados.
- Exibir o histórico de logs de acesso.
- Oferecer a funcionalidade de acionamento remoto do portão.

## Principais Funcionalidades (Planejadas)

- **Página de Login e Controle de Acesso:** Interface segura para autenticação de administradores, que consome o endpoint JWT do backend.
- **Painel de Gerenciamento da Whitelist:** Uma interface CRUD completa para adicionar, visualizar, editar e remover placas de veículos autorizados.
- **Painel de Visualização de Logs:** Tabela de dados com o histórico de todas as tentativas de acesso, com funcionalidades de busca, paginação e filtros.
- **Visualização de Imagens:** Modal para exibir a imagem capturada associada a um log de acesso específico.
- **Acionamento Remoto:** Botão na interface para que um administrador possa abrir o portão remotamente.

### Funcionalidades Implementadas

- ✅ Estrutura do projeto Next.js com App Router.
- ✅ Configuração de TypeScript, ESLint e Prettier para qualidade de código.
- ✅ Ambiente de testes configurado com Jest e React Testing Library.
- ✅ Pipeline de CI/CD com GitHub Actions (lint, build, testes).
- ⏳ UI da Página de Login (em desenvolvimento).
- ⏳ UI do Painel da Whitelist (em desenvolvimento).
- ⏳ UI do Painel de Logs de Acesso (em desenvolvimento).

## Stack Tecnológica

- **Framework:** Next.js (React)
- **Linguagem:** TypeScript
- **Estilização:** CSS Modules (com planos para Material-UI)
- **Testes:** Jest, React Testing Library
- **Qualidade de Código:** ESLint, Prettier
- **DevOps:** GitHub Actions

## Estrutura do Projeto

A estrutura de diretórios segue as melhores práticas para o App Router do Next.js, priorizando a organização e a escalabilidade.

```bash
siscav-web/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline de CI (lint, build, testes)
├── public/                     # Ativos estáticos
├── src/
│   ├── app/
│   │   ├── (auth)/             # Rotas protegidas (ex: /dashboard)
│   │   ├── (public)/           # Rotas públicas (ex: /login)
│   │   ├── layout.tsx          # Layout raiz da aplicação
│   │   └── page.tsx            # Página inicial
│   ├── components/
│   │   ├── features/           # Componentes "inteligentes" com lógica de negócio
│   │   └── ui/                 # Componentes de UI genéricos e reutilizáveis
│   ├── hooks/                  # Hooks React customizados
│   └── lib/                    # Funções utilitárias, cliente de API, etc.
├── .gitignore
├── eslint.config.mjs           # Configuração do ESLint (formato "flat")
├── jest.config.mjs             # Configuração do Jest
├── next.config.mjs             # Configuração do Next.js
├── package.json                # Dependências e scripts do projeto
└── tsconfig.json               # Configuração do TypeScript
```

## Guia de Instalação (Getting Started)

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20.x ou superior)
- [npm](https://www.npmjs.com/) (geralmente instalado com o Node.js)

### Instalação

Para configurar o ambiente de desenvolvimento, clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/siscav-web.git
cd siscav-web
npm install
```

_Substitua `seu-usuario` pelo nome de usuário ou organização correta do GitHub._

## Scripts Disponíveis

No diretório do projeto, você pode executar os seguintes scripts:

### `npm run dev`

Inicia a aplicação em modo de desenvolvimento.
Abra [http://localhost:3000](http://localhost:3000) para visualizá-la no seu navegador. A página será recarregada automaticamente após as edições.

### `npm test`

Executa a suíte de testes unitários e de componentes utilizando o Jest. É ideal para ser executado antes de enviar alterações para o repositório.

### `npm run lint`

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

Se qualquer uma dessas etapas falhar, a mesclagem do pull request será bloqueada.
