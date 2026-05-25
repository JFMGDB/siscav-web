# Arquitetura do Projeto SISCAV Web

> **Archived:** This document is kept for historical context only. For current decisions, see [docs/adr/](../adr/) (especially [ADR 0003: Cookie-based authentication](../adr/0003-cookie-based-authentication.md), which supersedes JWT storage in `localStorage` described below).

## Visão Geral

Este documento descreve a arquitetura e organização do projeto SISCAV Web, um sistema de controle de acesso veicular automatizado construído com Next.js 16 e TypeScript.

## Princípios Arquiteturais

O projeto segue os seguintes princípios de design de software:

### SOLID

- **Single Responsibility Principle (SRP)**: Cada módulo, classe e função tem uma única responsabilidade
- **Open/Closed Principle (OCP)**: Entidades são abertas para extensão, fechadas para modificação
- **Liskov Substitution Principle (LSP)**: Subtipos devem ser substituíveis por seus tipos base
- **Interface Segregation Principle (ISP)**: Múltiplas interfaces específicas são melhores que uma interface geral
- **Dependency Inversion Principle (DIP)**: Dependências devem ser de abstrações, não de implementações concretas

### DRY (Don't Repeat Yourself)

- Lógica comum é centralizada em utilitários e hooks reutilizáveis
- Tipos e interfaces são definidos uma única vez e reutilizados
- Constantes são centralizadas para evitar valores mágicos

### Componentização

- Componentes são organizados por responsabilidade (features vs UI)
- Lógica de negócio é separada da apresentação
- Hooks customizados encapsulam lógica reutilizável

## Estrutura de Diretórios

```
src/
├── app/                    # Next.js App Router (rotas e layouts)
│   ├── (auth)/            # Rotas protegidas (requerem autenticação)
│   │   ├── dashboard/
│   │   ├── monitor/
│   │   ├── whitelist/
│   │   ├── logs/
│   │   ├── training/
│   │   └── settings/
│   ├── (public)/          # Rotas públicas
│   │   └── login/
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
│
├── components/            # Componentes React
│   ├── features/         # Componentes específicos de funcionalidades
│   │   ├── auth/        # Componentes de autenticação
│   │   ├── gate/        # Controle de portão
│   │   ├── logs/        # Visualização de logs
│   │   ├── monitor/     # Monitoramento em tempo real
│   │   ├── settings/    # Configurações
│   │   ├── training/    # Treinamento de IA
│   │   └── whitelist/   # Gerenciamento de whitelist
│   ├── ui/              # Componentes de UI genéricos e reutilizáveis
│   │   └── Sidebar.tsx
│   └── providers.tsx    # Providers React (Context API)
│
├── hooks/                # Hooks React customizados
│   ├── use-auth.tsx     # Gerenciamento de autenticação
│   └── use-snackbar.tsx # Gerenciamento de mensagens (Snackbar)
│
├── lib/                 # Bibliotecas e utilitários
│   ├── api-client.ts    # Cliente HTTP para comunicação com backend
│   └── utils.tsx        # Funções utilitárias gerais
│
├── types/               # Definições de tipos TypeScript
│   ├── auth.ts          # Tipos de autenticação
│   ├── whitelist.ts     # Tipos de whitelist
│   ├── logs.ts          # Tipos de logs
│   ├── monitor.ts       # Tipos de monitoramento
│   ├── training.ts      # Tipos de treinamento
│   ├── bluetooth.ts     # Tipos de dispositivos Bluetooth
│   ├── common.ts        # Tipos comuns compartilhados
│   └── index.ts         # Barrel export (re-exporta todos os tipos)
│
├── constants/           # Constantes da aplicação
│   └── index.ts         # Todas as constantes centralizadas
│
├── styles/              # Estilos globais
│   └── globals.css
│
└── __tests__/          # Testes unitários e de integração
    ├── hooks/
    └── lib/
```

## Organização por Camadas

### Camada de Apresentação (`app/` e `components/`)

**Responsabilidade**: Renderização de UI e navegação

- **`app/`**: Define rotas e layouts usando Next.js App Router
  - Rotas agrupadas por acesso: `(auth)` para rotas protegidas, `(public)` para rotas públicas
  - Cada rota pode ter seu próprio layout específico

- **`components/features/`**: Componentes "inteligentes" com lógica de negócio
  - Organizados por domínio (auth, gate, logs, etc.)
  - Podem fazer chamadas de API, gerenciar estado local
  - Usam componentes de UI genéricos

- **`components/ui/`**: Componentes de UI genéricos e reutilizáveis
  - Não contêm lógica de negócio
  - Altamente reutilizáveis
  - Baseados em Material-UI

### Camada de Lógica de Negócio (`hooks/` e `lib/`)

**Responsabilidade**: Encapsular lógica reutilizável e comunicação com backend

- **`hooks/`**: Hooks React customizados
  - `use-auth.tsx`: Gerencia estado de autenticação (Context API)
  - `use-snackbar.tsx`: Gerencia mensagens do sistema (DRY)

- **`lib/api-client.ts`**: Cliente HTTP centralizado
  - Encapsula todas as chamadas à API
  - Gerencia autenticação (tokens JWT)
  - Tipado com TypeScript para type-safety

- **`lib/utils.tsx`**: Funções utilitárias puras
  - Funções sem efeitos colaterais
  - Reutilizáveis em qualquer contexto
  - Exemplo: mapeamento de status para configurações visuais

### Camada de Dados (`types/` e `constants/`)

**Responsabilidade**: Definir contratos de dados e configurações

- **`types/`**: Definições TypeScript
  - Organizados por domínio (auth, whitelist, logs, etc.)
  - Barrel export em `index.ts` para imports simplificados
  - Garante type-safety em toda a aplicação

- **`constants/`**: Constantes centralizadas
  - URLs de API, endpoints
  - Configurações de UI (dimensões, durações)
  - Mensagens do sistema
  - Rotas da aplicação
  - Evita valores mágicos espalhados pelo código

## Padrões de Design Aplicados

### 1. Feature-Sliced Design (FSD)

Componentes organizados por features/domínios, facilitando:

- Manutenção: código relacionado está junto
- Escalabilidade: fácil adicionar novas features
- Colaboração: equipes podem trabalhar em features diferentes

### 2. Container/Presentational Pattern

- **Container Components** (`components/features/`): Gerenciam estado e lógica
- **Presentational Components** (`components/ui/`): Apenas renderizam UI

### 3. Custom Hooks Pattern

Lógica reutilizável encapsulada em hooks:

- `use-auth`: Estado global de autenticação
- `use-snackbar`: Mensagens do sistema

### 4. Service Layer Pattern

`api-client.ts` atua como camada de serviço:

- Centraliza comunicação HTTP
- Abstrai detalhes de implementação
- Facilita testes e manutenção

## Fluxo de Dados

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Next.js App    │
│  (app router)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│   Components    │──────▶│    Hooks     │
│   (features)    │      │  (use-auth,  │
└──────┬──────────┘      │  use-snackbar)│
       │                  └──────┬───────┘
       │                         │
       ▼                         ▼
┌─────────────────┐      ┌──────────────┐
│  api-client.ts   │──────▶│   Backend    │
│  (Service Layer) │      │   (FastAPI)   │
└─────────────────┘      └──────────────┘
```

## Convenções de Nomenclatura

### Arquivos e Diretórios

- **Componentes**: PascalCase (ex: `LoginForm.tsx`)
- **Hooks**: camelCase com prefixo `use-` (ex: `use-auth.tsx`)
- **Utilitários**: camelCase (ex: `utils.tsx`)
- **Tipos**: camelCase (ex: `auth.ts`)
- **Constantes**: UPPER_SNAKE_CASE dentro de arquivos

### Componentes React

- Componentes de feature: `FeatureName-ComponentName.tsx` (ex: `Login-Form.tsx`)
- Componentes de UI: `ComponentName.tsx` (ex: `Sidebar.tsx`)

### Tipos TypeScript

- Interfaces: PascalCase (ex: `User`, `AuthResponse`)
- Types: PascalCase (ex: `AccessStatus`, `MessageType`)

## Gerenciamento de Estado

### Estado Local

- `useState` para estado de componente
- `useRef` para valores que não devem disparar re-renders

### Estado Global

- **Context API** para autenticação (`use-auth`)
- Evita over-engineering: não usa Redux/Zustand (não necessário para este escopo)

### Estado do Servidor

- Chamadas diretas via `api-client`
- Futuro: considerar React Query/SWR para cache e sincronização

## Tratamento de Erros

1. **Nível de API**: `api-client.ts` captura erros HTTP e lança exceções tipadas
2. **Nível de Componente**: Try/catch em handlers, exibição via `useSnackbar`
3. **Nível Global**: Error boundaries (a implementar)

## Segurança

1. **Autenticação**: JWT armazenado em `localStorage` (considerar httpOnly cookies em produção)
2. **Autorização**: Layouts protegidos verificam autenticação antes de renderizar
3. **Validação**: TypeScript garante type-safety, validação de formulários (a implementar)

## Testes

Estrutura de testes:

- **Unitários**: Funções utilitárias (`lib/utils.test.ts`)
- **Componentes**: React Testing Library (`hooks/use-snackbar.test.tsx`)
- **Smoke Tests**: Verificação básica de build (`smoke.test.ts`)

## Próximos Passos Arquiteturais

1. **Error Boundaries**: Capturar erros de renderização
2. **React Query/SWR**: Cache e sincronização de dados do servidor
3. **Validação de Formulários**: Biblioteca como React Hook Form + Zod
4. **i18n**: Internacionalização (se necessário)
5. **Testes E2E**: Playwright ou Cypress
6. **Storybook**: Documentação de componentes

## Referências

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Feature-Sliced Design](https://feature-sliced.design/)
