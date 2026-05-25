# Styleguide Front-end - SISCAV Web

## Visão Geral

Este documento define os padrões, convenções e diretrizes para desenvolvimento front-end no projeto SISCAV (Sistema de Controle de Acesso Veicular). O styleguide garante consistência, manutenibilidade e qualidade do código, seguindo os princípios SOLID, DRY e arquitetura MVC.

## Índice

1. [Arquitetura e Organização](#arquitetura-e-organização)
2. [Design System](#design-system)
3. [Convenções de Código](#convenções-de-código)
4. [Componentes](#componentes)
5. [Estilização](#estilização)
6. [Tipos e Interfaces](#tipos-e-interfaces)
7. [Hooks Customizados](#hooks-customizados)
8. [Tratamento de Erros](#tratamento-de-erros)
9. [Testes](#testes)
10. [Boas Práticas](#boas-práticas)

---

## Arquitetura e Organização

### Estrutura de Diretórios

O projeto segue uma arquitetura baseada em Feature-Sliced Design (FSD) com separação clara de responsabilidades:

```
src/
├── app/                    # Next.js App Router (rotas e layouts)
│   ├── (auth)/            # Rotas protegidas (requerem autenticação)
│   ├── (public)/          # Rotas públicas
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
│
├── components/
│   ├── features/          # Componentes com lógica de negócio
│   │   ├── auth/         # Componentes de autenticação
│   │   ├── gate/         # Controle de portão
│   │   ├── logs/         # Visualização de logs
│   │   ├── monitor/      # Monitoramento em tempo real
│   │   ├── settings/     # Configurações
│   │   ├── training/     # Treinamento de IA
│   │   └── whitelist/    # Gerenciamento de whitelist
│   ├── ui/               # Componentes de UI genéricos e reutilizáveis
│   └── providers.tsx     # Providers React (Context API)
│
├── hooks/                 # Hooks React customizados
├── lib/                   # Bibliotecas e utilitários
│   ├── api-client.ts     # Cliente HTTP centralizado
│   └── utils.tsx         # Funções utilitárias gerais
│
├── types/                 # Definições de tipos TypeScript
├── constants/             # Constantes da aplicação
├── styles/                # Estilos globais
│   └── globals.css
└── theme/                 # Configuração do tema Material-UI
    └── index.ts
```

### Princípios Arquiteturais

#### SOLID

1. **Single Responsibility Principle (SRP)**
   - Cada componente, função ou módulo tem uma única responsabilidade
   - Componentes UI são puros (apenas renderização)
   - Componentes de feature contêm lógica de negócio específica

2. **Open/Closed Principle (OCP)**
   - Componentes são extensíveis via props sem modificação
   - Tema permite customização sem alterar código base
   - Utilitários são composáveis

3. **Liskov Substitution Principle (LSP)**
   - Componentes base podem ser substituídos por versões especializadas
   - Interfaces TypeScript garantem contratos consistentes

4. **Interface Segregation Principle (ISP)**
   - Props interfaces são específicas e focadas
   - Evitar props opcionais excessivas

5. **Dependency Inversion Principle (DIP)**
   - Componentes dependem de abstrações (props/interfaces)
   - Lógica de negócio não conhece detalhes de implementação de UI

#### DRY (Don't Repeat Yourself)

- Componentes reutilizáveis em `components/ui/`
- Lógica comum em hooks customizados
- Constantes centralizadas em `constants/index.ts`
- Utilitários compartilhados em `lib/utils.tsx`
- Tipos compartilhados em `types/`

#### MVC (Model-View-Controller)

- **Model**: Tipos TypeScript em `types/`, dados em `lib/api-client.ts`
- **View**: Componentes em `components/` e páginas em `app/`
- **Controller**: Hooks customizados em `hooks/` e lógica em `components/features/`

---

## Design System

### Paleta de Cores

O sistema utiliza uma paleta moderna e profissional:

#### Cores Principais

```typescript
primary: {
  main: '#2563eb',    // Azul moderno e vibrante
  light: '#3b82f6',
  dark: '#1e40af',
}

secondary: {
  main: '#10b981',    // Verde para ações positivas
  light: '#34d399',
  dark: '#059669',
}

accent: {
  main: '#8b5cf6',    // Roxo para elementos de destaque
  light: '#a78bfa',
  dark: '#7c3aed',
}
```

#### Cores Semânticas

```typescript
success: "#10b981"; // Ações bem-sucedidas
error: "#ef4444"; // Erros e ações destrutivas
warning: "#f59e0b"; // Avisos
info: "#3b82f6"; // Informações
```

#### Cores Neutras

```typescript
background: {
  default: '#f8fafc',  // Fundo principal
  paper: '#ffffff',     // Fundo de cards/papers
}

text: {
  primary: '#1f2937',   // Texto principal
  secondary: '#6b7280', // Texto secundário
}
```

### Tipografia

O sistema utiliza fontes nativas do sistema operacional para melhor performance:

```typescript
fontFamily: [
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  "sans-serif",
].join(",");
```

#### Hierarquia Tipográfica

- **H1**: 2.5rem, peso 700, line-height 1.2
- **H2**: 2rem, peso 700, line-height 1.3
- **H3**: 1.75rem, peso 600, line-height 1.4
- **H4**: 1.5rem, peso 600, line-height 1.4
- **H5**: 1.25rem, peso 600, line-height 1.5
- **H6**: 1.125rem, peso 600, line-height 1.5
- **Body1**: 1rem, line-height 1.6
- **Body2**: 0.875rem, line-height 1.5
- **Button**: Sem text-transform, peso 600

### Espaçamento

Sistema de grid baseado em 8px:

- **Espaçamento base**: 8px (1 unidade)
- **Espaçamentos comuns**: 8px, 16px, 24px, 32px
- **Padding de cards**: 24px (3 unidades)
- **Gaps entre elementos**: 12px, 16px, 24px

### Bordas e Sombras

- **Border radius padrão**: 12px
- **Border radius de cards**: 16px
- **Border radius de botões**: 10px
- **Sombras**: Suaves e modernas, seguindo elevação Material-UI customizada

### Microinterações

- **Transições**: 0.2s ease-in-out
- **Hover effects**: translateY(-2px) em cards, translateY(-1px) em botões
- **Estados de loading**: CircularProgress com tamanho consistente
- **Feedback visual**: Imediato em todas as ações

---

## Convenções de Código

### Nomenclatura

#### Arquivos e Diretórios

- **Componentes** (shared UI and features): PascalCase matching the exported name (ex: `LoginForm.tsx`, `LogsFilter.tsx`, `StatCard.tsx`). See [ADR 0006](../adr/0006-component-file-naming.md).
- **Hooks**: kebab-case under `src/hooks/` (ex: `use-auth.ts`)
- **Utilitários**: camelCase (ex: `utils.tsx`, `api-client.ts`)
- **Tipos**: camelCase (ex: `auth.ts`, `whitelist.ts`)
- **Constantes**: UPPER_SNAKE_CASE dentro de arquivos

#### Componentes React

```typescript
// Componente funcional com TypeScript
export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // ...
}

// Componente com interface de props
export interface ComponentProps {
  prop1: string;
  prop2?: number;
}
```

#### Variáveis e Funções

- **Variáveis**: camelCase (ex: `userName`, `isLoading`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_BASE_URL`)
- **Funções**: camelCase (ex: `handleSubmit`, `formatDate`)
- **Hooks customizados**: camelCase com prefixo `use` (ex: `useAuth`, `useSnackbar`)

#### Tipos TypeScript

- **Interfaces**: PascalCase (ex: `User`, `AuthResponse`)
- **Types**: PascalCase (ex: `AccessStatus`, `MessageType`)
- **Props interfaces**: `ComponentNameProps` (ex: `ButtonProps`, `CardProps`)

### Estrutura de Componentes

Seguir esta ordem dentro de componentes:

1. Imports (React, bibliotecas externas, componentes internos, tipos, utilitários)
2. Interfaces/Types
3. Componente principal
4. Componentes auxiliares (se necessário)
5. Exports

Exemplo:

```typescript
'use client';

/**
 * Descrição do componente
 *
 * Decisões de design e implementação
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Card } from '@/components/ui/Card';
import { ComponentProps } from '@/types';

export interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export default function MyComponent({ title, children }: MyComponentProps) {
  return (
    <Card>
      <Typography variant="h6">{title}</Typography>
      {children}
    </Card>
  );
}
```

### Comentários e Documentação

- Usar JSDoc para componentes e funções complexas
- Explicar decisões de design em comentários
- Documentar props obrigatórias e opcionais
- Incluir exemplos de uso quando necessário

---

## Componentes

### Componentes UI (components/ui/)

Componentes genéricos e reutilizáveis sem lógica de negócio.

#### Card

Componente genérico para containers:

```typescript
import { Card } from '@/components/ui/Card';

<Card title="Título" subtitle="Subtítulo" hover>
  Conteúdo do card
</Card>
```

**Props:**

- `title?: string` - Título do card
- `subtitle?: string` - Subtítulo do card
- `children: React.ReactNode` - Conteúdo
- `hover?: boolean` - Ativa efeito hover (padrão: true)
- Todas as props de `Paper` do Material-UI

#### StatCard

Card especializado para métricas:

```typescript
import { StatCard } from '@/components/ui/StatCard';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

<StatCard
  title="Total de Acessos"
  value={150}
  icon={<CheckCircleIcon />}
  color="primary"
  trend={{ value: 12, label: 'vs mês anterior', positive: true }}
/>
```

**Props:**

- `title: string` - Título da métrica
- `value: string | number` - Valor da métrica
- `icon?: React.ReactNode` - Ícone opcional
- `color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'`
- `trend?: { value: number; label: string; positive?: boolean }` - Tendência

#### DataTable

Tabela de dados reutilizável:

```typescript
import { DataTable } from '@/components/ui/DataTable';

const columns = [
  { id: 'name', label: 'Nome', minWidth: 170 },
  { id: 'plate', label: 'Placa', format: (value) => formatPlate(value) },
];

<DataTable
  columns={columns}
  rows={data}
  loading={isLoading}
  emptyMessage="Nenhum registro encontrado"
  onRowClick={(row) => handleRowClick(row)}
/>
```

**Props:**

- `columns: Column<T>[]` - Definição das colunas
- `rows: T[]` - Dados da tabela
- `loading?: boolean` - Estado de carregamento
- `emptyMessage?: string` - Mensagem quando vazio
- `onRowClick?: (row: T) => void` - Callback ao clicar em linha

#### Button

Wrapper para Button do MUI:

```typescript
import { Button } from '@/components/ui/Button';

<Button variant="contained" color="primary" size="large">
  Clique aqui
</Button>
```

Aceita todas as props de `Button` do Material-UI.

### Componentes de Feature (components/features/)

Componentes com lógica de negócio específica, organizados por domínio.

#### Estrutura

```
components/features/
├── auth/
│   └── LoginForm.tsx
├── gate/
│   └── GateControl.tsx
├── logs/
│   ├── LogsFilter.tsx
│   └── LogsTable.tsx
└── ...
```

#### Padrão de Implementação

```typescript
'use client';

/**
 * Descrição do componente de feature
 *
 * Responsabilidades:
 * - Lógica de negócio específica
 * - Chamadas de API
 * - Gerenciamento de estado local
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSnackbar } from '@/hooks/use-snackbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api-client';

export default function FeatureComponent() {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await apiClient.someEndpoint();
      showSnackbar('Sucesso!', 'success');
    } catch (error) {
      showSnackbar('Erro ao executar ação', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      {/* UI do componente */}
    </Card>
  );
}
```

---

## Estilização

### Material-UI Theme

O tema está configurado em `src/theme/index.ts`. Sempre usar o tema ao invés de valores hardcoded:

```typescript
// ✅ Correto
<Box sx={{ color: 'primary.main', p: 2 }}>
  Conteúdo
</Box>

// ❌ Incorreto
<Box sx={{ color: '#2563eb', padding: '16px' }}>
  Conteúdo
</Box>
```

### Sistema de Espaçamento

Usar o sistema de espaçamento do Material-UI (múltiplos de 8px):

```typescript
// ✅ Correto
<Box sx={{ p: 3, mb: 2, gap: 2 }}>
  Conteúdo
</Box>

// ❌ Incorreto
<Box sx={{ padding: '20px', marginBottom: '15px' }}>
  Conteúdo
</Box>
```

### Responsividade

Usar breakpoints do Material-UI:

```typescript
<Box
  sx={{
    width: { xs: '100%', sm: '50%', md: '33%' },
    p: { xs: 2, sm: 3 },
  }}
>
  Conteúdo responsivo
</Box>
```

### Customização de Componentes MUI

Para customizações globais, editar `src/theme/index.ts`. Para customizações locais, usar `sx` prop:

```typescript
// Customização local
<Button
  sx={{
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
  }}
>
  Botão customizado
</Button>
```

---

## Tipos e Interfaces

### Organização

Tipos organizados por domínio em `src/types/`:

- `auth.ts` - Tipos de autenticação
- `whitelist.ts` - Tipos de whitelist
- `logs.ts` - Tipos de logs
- `monitor.ts` - Tipos de monitoramento
- `common.ts` - Tipos comuns compartilhados

### Barrel Export

Todos os tipos são re-exportados em `types/index.ts`:

```typescript
// ✅ Correto
import { User, AuthResponse } from "@/types";

// ❌ Incorreto
import { User } from "@/types/auth";
import { AuthResponse } from "@/types/auth";
```

### Definição de Tipos

```typescript
// Interfaces para objetos
export interface User {
  id: string;
  email: string;
  name: string;
}

// Types para uniões e tipos mais complexos
export type AccessStatus = "granted" | "denied" | "pending";

// Props interfaces
export interface ComponentProps {
  required: string;
  optional?: number;
  children: React.ReactNode;
}
```

---

## Hooks Customizados

### Estrutura

Hooks em `src/hooks/` seguem o padrão:

```typescript
import { useState, useEffect, useContext, createContext } from 'react';

// Context (se necessário)
const MyContext = createContext<MyContextType | undefined>(undefined);

// Hook principal
export function useMyHook() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyHook must be used within MyProvider');
  }
  return context;
}

// Provider (se necessário)
export function MyProvider({ children }: { children: React.ReactNode }) {
  // Lógica do provider
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}
```

### Hooks Disponíveis

#### useAuth

Gerencia autenticação do usuário:

```typescript
import { useAuth } from "@/hooks/use-auth";

const { user, login, logout, isAuthenticated } = useAuth();
```

#### useSnackbar

Gerencia mensagens do sistema:

```typescript
import { useSnackbar } from "@/hooks/use-snackbar";

const { showSnackbar } = useSnackbar();

showSnackbar("Mensagem de sucesso", "success");
showSnackbar("Mensagem de erro", "error");
```

---

## Tratamento de Erros

### Padrão de Tratamento

Sempre tratar erros em operações assíncronas:

```typescript
const handleAction = async () => {
  setLoading(true);
  setError("");

  try {
    await apiClient.someEndpoint();
    showSnackbar("Operação realizada com sucesso", "success");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    setError(message);
    showSnackbar(message, "error");
  } finally {
    setLoading(false);
  }
};
```

### Mensagens de Erro

Usar constantes centralizadas quando possível:

```typescript
import { MESSAGES } from "@/constants";

showSnackbar(MESSAGES.WHITELIST.ADD_ERROR, "error");
```

---

## Testes

### Estrutura de Testes

Testes em `src/__tests__/` seguem a estrutura do código:

```
__tests__/
├── hooks/
│   └── use-snackbar.test.tsx
├── lib/
│   └── utils.test.ts
└── smoke.test.ts
```

### Padrão de Teste

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/ui/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

---

## Boas Práticas

### Performance

1. **Lazy Loading**: Usar `next/dynamic` para componentes pesados
2. **Memoização**: Usar `React.memo` e `useMemo` quando apropriado
3. **Code Splitting**: Aproveitar code splitting automático do Next.js

### Acessibilidade

1. **Semântica HTML**: Usar elementos semânticos apropriados
2. **ARIA labels**: Adicionar quando necessário
3. **Navegação por teclado**: Garantir que todos os elementos interativos sejam acessíveis
4. **Contraste**: Seguir WCAG AA (contraste mínimo 4.5:1)

### Segurança

1. **Validação**: Validar dados do usuário antes de enviar
2. **Sanitização**: Sanitizar dados exibidos
3. **Tokens**: Nunca expor tokens em código cliente
4. **HTTPS**: Sempre usar HTTPS em produção

### Código Limpo

1. **Funções pequenas**: Máximo 50 linhas por função
2. **Componentes focados**: Uma responsabilidade por componente
3. **Nomes descritivos**: Código auto-documentado
4. **Evitar comentários desnecessários**: Código deve ser claro

### Versionamento

1. **Commits semânticos**: Usar convenção de commits
2. **Branch naming**: `feature/`, `fix/`, `refactor/`
3. **Pull Requests**: Descrever mudanças claramente

---

## Checklist de Desenvolvimento

Antes de finalizar uma feature, verificar:

- [ ] Código segue convenções de nomenclatura
- [ ] Componentes são reutilizáveis quando apropriado (DRY)
- [ ] Tipos TypeScript estão definidos
- [ ] Erros são tratados adequadamente
- [ ] Loading states estão implementados
- [ ] Feedback visual (snackbar) para ações do usuário
- [ ] Responsividade testada em diferentes tamanhos de tela
- [ ] Acessibilidade básica verificada
- [ ] Código formatado com Prettier
- [ ] Linter sem erros
- [ ] Testes passando (se aplicável)

---

## Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

## Changelog do Styleguide

Este styleguide é um documento vivo e será atualizado conforme o projeto evolui. Mudanças significativas devem ser documentadas aqui.

**Versão 1.0** (Data atual)

- Criação inicial do styleguide
- Documentação do design system atual
- Definição de convenções de código
- Padrões de componentes e arquitetura
