# Histórico de Alterações (Changelog)

## [0.4.0] - 2025-12-06

### Integração Completa Frontend-Backend

#### Adicionado (Added)

- **Integração Real com Backend**
  - Removidos todos os mocks temporários do `api-client.ts`
  - Implementadas chamadas reais para todos os endpoints do backend
  - Suporte completo a paginação para whitelist e logs
  - Implementação de OAuth2 para autenticação (form-data)

- **Tipos TypeScript Atualizados**
  - Tipos sincronizados com schemas Pydantic do backend
  - `AccessStatus` atualizado para usar valores `Authorized`/`Denied` (não mais `AUTHORIZED`/`DENIED`)
  - Adicionado suporte a `PaginatedResponse<T>` para listagens
  - Tipos de `AuthorizedPlate` atualizados com campos `created_at`, `updated_at`, `normalized_plate`
  - Tipos de `AccessLog` atualizados com campos `plate_string_detected`, `image_storage_key`, `authorized_plate_id`

- **Documentação Técnica Atualizada**
  - Documentação de API atualizada com endpoints corretos
  - Seção de integração frontend-backend adicionada
  - Documentação de formatos de requisição/resposta

#### Modificado (Changed)

- **Endpoints Corrigidos em `constants/index.ts`**
  - Auth: `/api/v1/auth/login/access-token` (antes: `/api/v1/auth/login`)
  - Logs: `/api/v1/access_logs` (antes: `/api/v1/logs`)
  - Gate: `/api/v1/gate/trigger` (antes: `/api/v1/gate/open`)
  - Adicionado endpoint de refresh token

- **`api-client.ts` Completamente Refatorado**
  - Removidos todos os mocks temporários
  - Implementado método `login()` com OAuth2PasswordRequestForm (form-data)
  - Implementado `getWhitelist()` com suporte a paginação
  - Implementado `getLogs()` com suporte a filtros e paginação
  - Implementados métodos CRUD completos para whitelist
  - Implementado `openGate()` usando endpoint correto
  - Implementado `getLastCapture()` usando endpoint de logs (obtém log mais recente)
  - Tratamento de erros melhorado com mensagens descritivas

- **Componentes Atualizados**
  - `use-auth.tsx`: Atualizado para usar `access_token` em vez de `token`
  - `Whitelist-Table.tsx`: Atualizado para usar paginação e novos campos
  - `Logs-Table.tsx`: Atualizado para usar filtros do backend e novos campos
  - `utils.tsx`: Removido status `UNKNOWN`, mantidos apenas `Authorized`/`Denied`
  - `PlateRecognitionDisplay.tsx`: Atualizado para usar novos valores de status e integração real com backend

- **Documentação**
  - `docs/technical-api-siscav.md`: Atualizado com endpoints corretos e seção de integração

#### Decisões Técnicas

- **OAuth2 com Form-Data**: O backend utiliza OAuth2PasswordRequestForm que requer form-data, não JSON. Isso foi implementado corretamente no frontend.

- **Paginação no Backend**: Filtros e paginação são aplicados no backend para melhor performance, não no frontend.

- **Sincronização de Tipos**: Tipos TypeScript foram sincronizados exatamente com os schemas Pydantic do backend para garantir type-safety.

- **Remoção de Mocks**: Todos os mocks foram removidos para garantir que o frontend sempre use os endpoints reais do backend.

- **Monitoramento em Tempo Real**: O método `getLastCapture()` foi implementado usando o endpoint de logs de acesso, obtendo o log mais recente (limit=1) que já está ordenado por timestamp descendente. Isso permite monitoramento em tempo real sem necessidade de endpoint específico.

## [0.3.0] - 2025-01-XX

### Reorganização Arquitetural e Melhorias de Estrutura

#### Adicionado (Added)

- **Estrutura de Tipos Centralizada (`src/types/`)**
  - Criado módulo `types/auth.ts` com tipos de autenticação (User, AuthResponse, AuthContextType)
  - Criado módulo `types/whitelist.ts` com tipos de whitelist (AuthorizedPlate)
  - Criado módulo `types/logs.ts` com tipos de logs (AccessLog)
  - Criado módulo `types/monitor.ts` com tipos de monitoramento (Capture)
  - Criado módulo `types/training.ts` com tipos de treinamento (TrainingData)
  - Criado módulo `types/bluetooth.ts` com tipos de dispositivos Bluetooth (BluetoothDevice, ConnectionStatus)
  - Criado módulo `types/common.ts` com tipos compartilhados (AccessStatus, MessageType, Message)
  - Criado `types/index.ts` como barrel export para facilitar imports
  - Decisão: Organização por domínio facilita manutenção e segue princípio de Single Responsibility (SOLID)

- **Constantes Centralizadas (`src/constants/`)**
  - Criado arquivo `constants/index.ts` com todas as constantes da aplicação
  - Agrupamento por categoria: API_CONFIG, AUTH_CONFIG, UI_CONFIG, ROUTES, MESSAGES
  - Decisão: Centralização elimina valores mágicos e facilita manutenção (DRY)
  - Benefícios: Mudanças de configuração em um único local, type-safety com `as const`

- **Documentação Arquitetural**
  - Criado `docs/ARCHITECTURE.md` com documentação completa da arquitetura
  - Documenta princípios SOLID, DRY e Componentização aplicados
  - Explica estrutura de diretórios e decisões de design
  - Inclui diagramas de fluxo de dados e convenções de nomenclatura

#### Modificado (Changed)

- **Refatoração do `api-client.ts`**
  - Removidas definições de tipos duplicadas (movidas para `src/types/`)
  - Imports atualizados para usar tipos centralizados
  - Endpoints hardcoded substituídos por constantes de `API_CONFIG`
  - Base URL agora usa `API_CONFIG.BASE_URL`
  - Decisão: Separação de responsabilidades - api-client foca apenas em comunicação HTTP

- **Refatoração do `use-auth.tsx`**
  - Imports atualizados para usar tipos de `@/types`
  - Chaves de localStorage substituídas por `AUTH_CONFIG` constants
  - Rotas hardcoded substituídas por `ROUTES` constants
  - Decisão: Consistência e facilidade de manutenção

- **Refatoração do `use-snackbar.tsx`**
  - Tipos movidos para `@/types/common`
  - Configurações de UI (duração, posição) agora usam `UI_CONFIG.SNACKBAR`
  - Decisão: Centralização de configurações de UI

- **Refatoração do `Sidebar.tsx`**
  - Largura do drawer agora usa `UI_CONFIG.DRAWER.WIDTH`
  - Rotas do menu agora usam `ROUTES.AUTH.*`
  - Decisão: Consistência visual e facilidade de ajustes

- **Refatoração do `PlateRecognitionDisplay.tsx`**
  - Import de tipos atualizado para `@/types`
  - Intervalo de polling agora usa `UI_CONFIG.POLLING.CAPTURE_INTERVAL`
  - Decisão: Configuração centralizada facilita ajustes de performance

- **Refatoração do `utils.tsx`**
  - Tipo `AccessStatus` movido para `@/types/common`
  - Mantida interface `StatusConfig` local (específica do utilitário)
  - Decisão: Tipos compartilhados centralizados, tipos específicos mantidos localmente

#### Decisões Arquiteturais Documentadas

1. **Organização de Tipos por Domínio**
   - **Razão**: Facilita localização e manutenção de tipos relacionados
   - **Benefício**: Reduz acoplamento, melhora legibilidade
   - **Padrão**: Um arquivo por domínio de negócio

2. **Barrel Exports (`index.ts`)**
   - **Razão**: Simplifica imports (`import { User } from '@/types'` ao invés de `@/types/auth'`)
   - **Benefício**: Melhor DX (Developer Experience), imports mais limpos
   - **Trade-off**: Pode aumentar bundle size se não usado corretamente (Next.js otimiza automaticamente)

3. **Constantes Centralizadas**
   - **Razão**: Elimina valores mágicos, facilita manutenção e testes
   - **Benefício**: Mudanças em um único local, type-safety com TypeScript
   - **Padrão**: Agrupamento por categoria (API, UI, Auth, etc.)

4. **Separação de Responsabilidades**
   - **api-client.ts**: Apenas comunicação HTTP
   - **types/**: Apenas definições de tipos
   - **constants/**: Apenas valores constantes
   - **Decisão**: Segue princípio SOLID (Single Responsibility)

5. **Feature-Sliced Design para Componentes**
   - **Estrutura**: `components/features/{domain}/` para componentes de domínio
   - **Estrutura**: `components/ui/` para componentes genéricos
   - **Benefício**: Código relacionado agrupado, fácil escalabilidade

#### Princípios Aplicados

- **SOLID**
  - Single Responsibility: Cada módulo tem uma única responsabilidade clara
  - Open/Closed: Estrutura extensível sem modificar código existente
  - Dependency Inversion: Componentes dependem de abstrações (tipos, constantes)

- **DRY (Don't Repeat Yourself)**
  - Tipos definidos uma única vez em `src/types/`
  - Constantes centralizadas em `src/constants/`
  - Lógica de status centralizada em `lib/utils.tsx`

- **Componentização**
  - Separação clara entre componentes de feature e UI
  - Hooks customizados para lógica reutilizável
  - Service layer pattern com `api-client.ts`

#### Impacto e Benefícios

- **Manutenibilidade**: Código mais organizado e fácil de navegar
- **Type Safety**: Tipos centralizados garantem consistência
- **Escalabilidade**: Estrutura facilita adição de novas features
- **Testabilidade**: Constantes e tipos facilitam criação de mocks
- **DX (Developer Experience)**: Imports mais limpos, autocomplete melhorado

#### Correções (Fixed)

- **Imports de Tipos Atualizados**
  - `Logs-Table.tsx`: Import de `AccessLog` atualizado para `@/types`
  - `Whitelist-Table.tsx`: Import de `AuthorizedPlate` atualizado para `@/types`
  - `Training-List.tsx`: Import de `TrainingData` atualizado para `@/types`
  - `utils.tsx`: Removido import incorreto de `StatusConfig` de `@/types` (mantido local)

- **Build Verificado**
  - Todos os erros de TypeScript corrigidos
  - Build de produção compila com sucesso
  - Todas as rotas geradas corretamente

#### Breaking Changes

Nenhum breaking change para usuários finais. Mudanças são internas à estrutura do código.

#### Migração para Desenvolvedores

- Imports de tipos: Usar `@/types` ao invés de `@/lib/api-client` para tipos
- Constantes: Usar `@/constants` para valores que antes estavam hardcoded
- Exemplo:
  ```typescript
  // Antes
  import { User } from '@/lib/api-client';
  const token = localStorage.getItem('token');
  
  // Depois
  import { User } from '@/types';
  import { AUTH_CONFIG } from '@/constants';
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  ```

---

## [0.2.0] - 2025-11-28

### Integração com Backend - Gerenciamento de Dispositivos Bluetooth

#### Adicionado (Added)

- **Interface de Gerenciamento de Dispositivos Bluetooth**
  - Implementado novo componente `BluetoothDeviceManager.tsx` substituindo o antigo `CameraConfigurationForm`
  - Funcionalidade de escaneamento de dispositivos Bluetooth próximos
  - Interface de conexão/pareamento com dispositivos
  - Tabela de dispositivos com informações detalhadas (nome, MAC address, sinal RSSI, status)
  - Indicadores visuais de força de sinal (Excelente, Bom, Razoável, Fraco)
  - Status de conexão em tempo real
  - Ações de conectar/desconectar dispositivos

- **Integração com API Real**
  - Implementados métodos reais no `api-client.ts` para endpoints de dispositivos:
    - `GET /devices/scan` - Escanear dispositivos Bluetooth
    - `POST /devices/connect` - Conectar a dispositivo
    - `GET /devices/status` - Obter status de conexão
    - `POST /devices/disconnect` - Desconectar dispositivo
  - Melhor tratamento de erros de API com parse de mensagens de erro JSON
  - Suporte a respostas vazias (HTTP 204)
  - Logging consistente de chamadas de API

- **Tipos TypeScript**
  - Interface `BluetoothDevice` com campos: id, name, address, rssi, paired, connected
  - Interface `ConnectionStatus` para gerenciamento de estado de conexão
  - Remoção da interface obsoleta `CameraConfig` (modelo RTSP/HTTP)

#### Modificado (Changed)

- **api-client.ts**
  - Refatorado método `request()` para fazer chamadas reais ao backend
  - Mocks mantidos temporariamente apenas para endpoints não relacionados a dispositivos
  - Melhor tratamento de erros HTTP com parse de detalhes da resposta
  - Comentários atualizados indicando endpoints mockados vs reais

- **Página de Configurações (`/settings`)**
  - Atualizada para usar `BluetoothDeviceManager` ao invés de `CameraConfigurationForm`
  - Descrição ajustada para refletir gerenciamento Bluetooth

#### Removido (Removed)

- Métodos obsoletos `getCameraConfig()` e `updateCameraConfig()` do `api-client.ts`
- Interface `CameraConfig` (substituída por `BluetoothDevice`)

#### Decisões Técnicas Documentadas

- **Modelo de Conexão**: Alinhado com documentação oficial da API (`technical-api-siscav.md`)
- **Arquitetura**: Mantida separação entre componentes de UI e lógica de negócio
- **Compatibilidade**: Implementação segue especificação da API FastAPI do backend
- **UX**: Feedback visual claro de estados (escaneando, conectando, conectado)

---

## [0.1.0] - 2025-11-16

### Épico 1: Fundação do Projeto & DevOps

#### Adicionado (Added)

- **FND-04: Estrutura da Aplicação Frontend**
  - Inicializada a estrutura do projeto com Next.js 16, TypeScript e App Router.
  - Adicionadas as dependências principais, incluindo a biblioteca de UI Material-UI (`@mui/material`).
  - Configuradas e integradas as ferramentas de qualidade de código: ESLint para linting e Prettier para formatação.

- **FND-07: Página de Placeholder**
  - Implementada a página inicial (`/`) com um conteúdo de placeholder, servindo como ponto de entrada da aplicação.
  - Removidos ativos padrão do template `create-next-app`; metadados do layout e estilos globais foram simplificados em limpeza posterior.

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
