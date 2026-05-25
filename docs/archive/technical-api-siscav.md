# Documentação Técnica da API SISCAV

**Versão:** 1.1.0
**Data:** 06/12/2025
**Autor:** José Felipe Morais Guerra de Barros; Anderson Marcone da Silva Marinho;
**Última Atualização:** Integração completa frontend-backend realizada

---

## 1. Introdução

Este documento descreve a API do Sistema de Controle de Acesso Veicular (SISCAV). A API serve como o backend central que orquestra a comunicação entre os dispositivos IoT (câmeras/endpoints) e o banco de dados, além de fornecer interfaces de gerenciamento para administradores.

A documentação interativa completa dos endpoints, incluindo esquemas de requisição e resposta, está disponível via **Swagger UI** integrado à aplicação.

## 2. Acesso à Documentação Interativa (Swagger)

A API utiliza o padrão OpenAPI (anteriormente Swagger) para especificação automática.

### Como Acessar

1.  Inicie o servidor de desenvolvimento:
    ```bash
    uvicorn apps.api.src.main:app --reload
    ```
2.  Acesse o navegador no endereço:
    *   **Swagger UI:** `http://127.0.0.1:8000/docs`
    *   **ReDoc:** `http://127.0.0.1:8000/redoc`

O Swagger UI permite testar as requisições diretamente pelo navegador.

## 3. Visão Geral da Arquitetura

O sistema segue uma arquitetura cliente-servidor RESTful.

*   **Backend:** Python com FastAPI.
*   **Banco de Dados:** PostgreSQL (gerenciado via SQLAlchemy e Alembic).
*   **Autenticação:** OAuth2 com JWT (JSON Web Tokens).
*   **IoT Integration:** Endpoints específicos para recebimento de imagens e metadados dos dispositivos de borda.

### Diagrama de Fluxo Simplificado

1.  **IoT Device** captura imagem -> OCR local (opcional) -> Envia para API (`POST /access_logs/`).
2.  **API** recebe dados -> Normaliza Placa -> Consulta Whitelist (Banco de Dados).
3.  **API** decide acesso (Authorized/Denied) -> Salva Log -> Retorna decisão.
4.  **IoT Device** recebe decisão -> Aciona Relé (se autorizado).

## 4. Decisões Técnicas

### 4.1. Framework: FastAPI
Optamos pelo **FastAPI** devido a:
*   **Performance:** Alta performance com suporte nativo a assincronismo (`async/await`), crucial para lidar com múltiplas requisições de dispositivos IoT simultaneamente.
*   **Documentação Automática:** Geração nativa de OpenAPI/Swagger, garantindo que a documentação esteja sempre sincronizada com o código.
*   **Validação de Dados:** Integração forte com **Pydantic**, garantindo integridade dos dados recebidos (ex: formatos de placa, imagens).

### 4.2. Padrões de Projeto
*   **SOLID:** O código é estruturado em camadas (Routers, Controllers/Endpoints, CRUD, Schemas, Models), facilitando manutenção e testes.
*   **DRY (Don't Repeat Yourself):** Reutilização de esquemas Pydantic e funções utilitárias de banco de dados.
*   **Componentização:** A estrutura de pastas separa claramente as responsabilidades (`api/v1/endpoints`, `core`, `db`, `schemas`).

### 4.3. Segurança
*   **JWT:** Utilizado para autenticação stateless, ideal para APIs REST.
*   **Hashing de Senhas:** Utilização de algoritmos robustos (Argon2/Bcrypt) via `passlib`.

### 4.4. Integração IoT (Câmera)
*   **Dispositivo de Captura:** O sistema utiliza uma câmera conectada via **Bluetooth** (ex: smartphone).
*   **Gerenciamento via Frontend:** A conexão e o pareamento com a câmera são realizados diretamente pela interface web. O usuário pode buscar dispositivos próximos e conectar-se sem necessidade de configuração manual no sistema operacional/terminal.
*   **Processamento:** O endpoint IoT recebe o stream de vídeo após a conexão estabelecida.

## 5. Recursos da API

### Autenticação (`/api/v1/auth`)
*   **POST /login/access-token**: Endpoint para troca de credenciais (email/senha) por token JWT usando OAuth2PasswordRequestForm (form-data).
    - **Request**: `FormData` com `username` (email) e `password`
    - **Response**: `{ access_token: string, token_type: "bearer", refresh_token?: string }`
*   **POST /login/refresh-token**: Renova o token de acesso usando um refresh token válido.

### Gestão de Dispositivos (`/api/v1/devices`)
Endpoints para gerenciamento da conexão Bluetooth (funcionalidade de apresentação).
*   **GET /scan**: Listar dispositivos Bluetooth visíveis (requer autenticação).
*   **POST /connect**: Conectar à câmera selecionada (requer autenticação).
    - **Request**: `{ device_id: string }`
*   **GET /status**: Verificar status da conexão Bluetooth atual (requer autenticação).
*   **POST /disconnect**: Desconectar dispositivo Bluetooth (requer autenticação).
*   **POST /video-frame**: Enviar frame de vídeo capturado (requer autenticação).

### Whitelist (`/api/v1/whitelist`)
Gerenciamento de placas autorizadas. Acesso restrito a administradores autenticados.
*   **GET /**: Listar placas com paginação (requer autenticação).
    - **Query Params**: `skip` (default: 0), `limit` (default: 100, max: 1000)
    - **Response**: `PaginatedResponse<AuthorizedPlate>`
*   **POST /**: Adicionar nova placa (requer autenticação).
    - **Request**: `{ plate: string, description?: string }`
*   **GET /{id}**: Obter detalhes de uma placa específica (requer autenticação).
*   **PUT /{id}**: Atualizar dados de uma placa (requer autenticação).
    - **Request**: `{ plate: string, description?: string }`
*   **DELETE /{id}**: Remover placa da whitelist (requer autenticação).

### Logs de Acesso (`/api/v1/access_logs`)
*   **POST /**: Endpoint principal utilizado pelos dispositivos IoT. Recebe a imagem e a leitura da placa, processa a regra de negócio e retorna a autorização.
    - **Request**: `FormData` com `file` (imagem) e `plate` (string)
    - **Response**: `AccessLogRead` com status `Authorized` ou `Denied`
*   **GET /**: Listar logs de acesso com paginação e filtros (requer autenticação).
    - **Query Params**: `skip`, `limit`, `status` (Authorized/Denied), `plate` (busca parcial)
    - **Response**: `PaginatedResponse<AccessLogRead>`
    - **Nota**: Os logs são retornados ordenados por timestamp descendente (mais recentes primeiro)

### Monitoramento (`/api/v1/access_logs`)
*   O frontend usa o endpoint de logs para obter a última captura:
    - **GET /?skip=0&limit=1**: Retorna o log mais recente para exibição em tempo real no monitor
    - A conversão de `AccessLog` para `Capture` é feita no frontend

### Controle de Portão (`/api/v1/gate`)
*   **POST /trigger**: Acionar portão remotamente (requer autenticação).
    - **Response**: `{ status: string, message?: string }`

## 6. Modelagem de Dados (Resumo)

*   **User**: Usuários do sistema (administradores).
    - Campos: `id` (UUID), `email`, `hashed_password`, `created_at`, `updated_at`
*   **AuthorizedPlate**: Placas permitidas (Whitelist).
    - Campos: `id` (UUID), `plate` (original), `normalized_plate` (busca, único), `description`, `created_at`, `updated_at`
*   **AccessLog**: Histórico de tentativas de acesso.
    - Campos: `id` (UUID), `timestamp`, `plate_string_detected`, `status` (enum: `Authorized` ou `Denied`), `image_storage_key`, `authorized_plate_id` (FK opcional)

## 7. Integração Frontend-Backend

### 7.1. Cliente API (`api-client.ts`)

O frontend utiliza uma classe `ApiClient` centralizada que:
- Gerencia tokens JWT automaticamente
- Implementa todos os endpoints documentados
- Trata erros de forma consistente
- Suporta paginação para listagens

### 7.2. Formato de Autenticação

O login utiliza OAuth2PasswordRequestForm, enviando dados como `FormData`:
- `username`: email do usuário
- `password`: senha do usuário

A resposta inclui `access_token` e opcionalmente `refresh_token`.

### 7.3. Paginação

Endpoints de listagem retornam objetos `PaginatedResponse<T>`:
```typescript
{
  items: T[],
  total: number,
  skip: number,
  limit: number,
  has_next: boolean,
  has_prev: boolean
}
```

### 7.4. Status de Acesso

O enum `AccessStatus` utiliza valores `Authorized` e `Denied` (não `AUTHORIZED`/`DENIED`), correspondendo exatamente ao enum do backend.

### 7.5. Endpoints Implementados

Todos os endpoints principais foram integrados:
- ✅ Autenticação (login com OAuth2, refresh token)
- ✅ Whitelist (CRUD completo com paginação)
- ✅ Logs de acesso (listagem com filtros e paginação)
- ✅ Monitoramento em tempo real (usa endpoint de logs para obter última captura)
- ✅ Controle de portão (trigger)
- ✅ Gerenciamento de dispositivos (scan, connect, status, disconnect)

### 7.6. Monitoramento em Tempo Real

O componente de monitoramento (`PlateRecognitionDisplay`) utiliza o endpoint de logs de acesso para obter a última captura:
- Faz polling periódico (a cada 3 segundos por padrão)
- Busca o log mais recente usando `GET /api/v1/access_logs?skip=0&limit=1`
- Converte `AccessLog` para `Capture` no frontend
- Exibe informações da placa, status e timestamp em tempo real

---