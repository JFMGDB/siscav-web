# SISCAV-API DOCUMENTATION

**Versão:** 1.0.0  
**Base URL:** `http://localhost:8000/api/v1`  
**Formato:** REST API com JSON

## Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Autenticação](#endpoints-de-autenticação)
   - [Whitelist (Placas Autorizadas)](#whitelist-placas-autorizadas)
   - [Logs de Acesso](#logs-de-acesso)
   - [Controle de Portão](#controle-de-portão)
   - [Dispositivos IoT](#dispositivos-iot)
4. [Modelos de Dados](#modelos-de-dados)
5. [Códigos de Status HTTP](#códigos-de-status-http)
6. [Rate Limiting](#rate-limiting)
7. [Exemplos de Uso](#exemplos-de-uso)

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Endpoint Raiz

```
GET /
```

**Resposta:**

```json
{
  "message": "SISCAV API OK!"
}
```

## Autenticação

Para acessar endpoints protegidos, inclua o access token no header `Authorization`:

```
Authorization: Bearer {access_token}
```

### Limites

- **Access Token Expiração**: 15 minutos
- **Refresh Token Expiração**: 30 dias
- **Rate Limiting Login**: 5 tentativas por minuto por IP
- **Rate Limiting Registro**: 3 tentativas por minuto por IP

## Endpoints

### Health Check

#### Verificar Status da API

```
GET /api/v1/health
```

- **Descrição:** Verifica se a API está operacional.
- **Autenticação:** Não requerida
- **Resposta de Sucesso (200):**

```json
{
  "status": "ok"
}
```

### Endpoints de Autenticação

#### 1. Registrar Novo Usuário

```
POST /api/v1/register
```

- **Descrição:** Cria uma nova conta de usuário no sistema.
- **Autenticação:** Não requerida
- **Rate Limiting:** 3 tentativas por minuto por IP
- **Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "email": "usuario@example.com",
  "password": "senha123456"
}
```

**Validações:**

- Email deve ser válido (formato email)
- Senha deve ter no mínimo 8 caracteres
- Email deve ser único no sistema

**Resposta de Sucesso (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@example.com",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Respostas de Erro:**

- **400 Bad Request**: E-mail inválido ou senha com menos de 8 caracteres
- **409 Conflict**: E-mail já está registrado
- **429 Too Many Requests**: Rate limit excedido

#### 2. Login - Obter Tokens

```
POST /api/v1/login/access-token
```

- **Descrição:** Autentica o usuário e retorna um par de tokens (access e refresh).
- **Autenticação:** Não requerida
- **Rate Limiting:** 5 tentativas por minuto por IP
- **Headers:**

```
Content-Type: application/x-www-form-urlencoded
```

**Body (form-data):**

```
username: string (email do usuário)
password: string (senha do usuário)
```

**Resposta de Sucesso (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Respostas de Erro:**

- **400 Bad Request**: Email ou senha vazios
- **401 Unauthorized**: Credenciais inválidas
- **429 Too Many Requests**: Rate limit excedido

#### 3. Renovar Tokens

```
POST /api/v1/login/refresh-token
```

- **Descrição:** Renova os tokens usando um refresh token válido.
- **Autenticação:** Não requerida
- **Headers:**

```
Content-Type: application/x-www-form-urlencoded
```

**Body (form-data):**

```
refresh_token: string (refresh token obtido no login)
```

**Resposta de Sucesso (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Respostas de Erro:**

- **400 Bad Request**: Refresh token vazio
- **403 Forbidden**: Refresh token inválido, expirado ou tipo incorreto
- **404 Not Found**: Usuário não encontrado

### Whitelist (Placas Autorizadas)

Todos os endpoints de whitelist requerem autenticação.

#### 1. Listar Placas Autorizadas

```
GET /api/v1/whitelist
```

**Descrição:** Retorna uma lista paginada de placas cadastradas na whitelist.

**Autenticação:** Requerida

**Query Parameters:**

- `skip` (opcional, padrão: 0): Número de registros a pular (mínimo: 0)
- `limit` (opcional, padrão: 100): Número máximo de registros (mínimo: 1, máximo: 100)

**Exemplo:**

```
GET /api/v1/whitelist?skip=0&limit=10
```

**Resposta de Sucesso (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "plate": "ABC-1234",
    "normalized_plate": "ABC1234",
    "description": "Carro do Diretor",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]
```

#### 2. Cadastrar Nova Placa

```
POST /api/v1/whitelist
```

- **Descrição:** Adiciona uma nova placa à whitelist. A placa será normalizada automaticamente.
- **Autenticação:** Requerida
- **Headers:**

```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body (JSON):**

```json
{
  "plate": "ABC-1234",
  "description": "Carro do Diretor"
}
```

**Validações:**

- Placa deve estar em formato brasileiro válido (antigo ou Mercosul)
- Descrição é opcional

**Resposta de Sucesso (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "plate": "ABC-1234",
  "normalized_plate": "ABC1234",
  "description": "Carro do Diretor",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Respostas de Erro:**

- **400 Bad Request**: Formato de placa inválido
- **401 Unauthorized**: Token inválido ou expirado

#### 3. Obter Placa por ID

```
GET /api/v1/whitelist/{id}
```

- **Descrição:** Retorna os detalhes de uma placa específica.
- **Autenticação:** Requerida
- **Path Parameters:**

- `id` (UUID): ID da placa autorizada

- **Exemplo:**

```
GET /api/v1/whitelist/550e8400-e29b-41d4-a716-446655440000
```

**Resposta de Sucesso (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "plate": "ABC-1234",
  "normalized_plate": "ABC1234",
  "description": "Carro do Diretor",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Respostas de Erro:**

- **401 Unauthorized**: Token inválido ou expirado
- **404 Not Found**: Placa não encontrada

#### 4. Atualizar Placa

```
PUT /api/v1/whitelist/{id}
```

**Descrição:** Atualiza os dados de uma placa existente.

**Autenticação:** Requerida

**Path Parameters:**

- `id` (UUID): ID da placa autorizada

**Headers:**

```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body (JSON):**

```json
{
  "plate": "XYZ-5678",
  "description": "Nova descrição"
}
```

**Resposta de Sucesso (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "plate": "XYZ-5678",
  "normalized_plate": "XYZ5678",
  "description": "Nova descrição",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

**Respostas de Erro:**

- **400 Bad Request**: Formato de placa inválido
- **401 Unauthorized**: Token inválido ou expirado
- **404 Not Found**: Placa não encontrada

---

#### 5. Remover Placa

```
DELETE /api/v1/whitelist/{id}
```

**Descrição:** Remove uma placa da whitelist.

**Autenticação:** Requerida

**Path Parameters:**

- `id` (UUID): ID da placa autorizada

**Exemplo:**

```
DELETE /api/v1/whitelist/550e8400-e29b-41d4-a716-446655440000
```

**Resposta de Sucesso (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "plate": "ABC-1234",
  "normalized_plate": "ABC1234",
  "description": "Carro do Diretor",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Respostas de Erro:**

- **401 Unauthorized**: Token inválido ou expirado
- **404 Not Found**: Placa não encontrada

---

### Logs de Acesso

Todos os endpoints de logs de acesso requerem autenticação, exceto o endpoint de criação (usado por dispositivos IoT).

#### 1. Registrar Acesso Veicular

```
POST /api/v1/access_logs
```

**Descrição:** Recebe a imagem e a placa detectada pelo dispositivo IoT. Valida o arquivo, normaliza a placa, verifica se está na whitelist, armazena a imagem e cria um registro de log.

**Autenticação:** Não requerida (endpoint público para dispositivos IoT)

**Headers:**

```
Content-Type: multipart/form-data
```

**Body (form-data):**

- `file` (arquivo): Arquivo de imagem do veículo (JPG, JPEG, PNG, WEBP)
- `plate` (string): String da placa detectada pelo OCR

**Validações:**

- Arquivo deve ser uma imagem válida
- Tamanho máximo do arquivo: configurável (padrão: 10MB)

**Resposta de Sucesso (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-01-15T10:30:00Z",
  "plate_string_detected": "ABC1234",
  "status": "Authorized",
  "image_storage_key": "uploads/94c65e77-3337-472b-b8fc-3cb24c127964.jpg",
  "authorized_plate_id": "660e8400-e29b-41d4-a716-446655440000"
}
```

**Status Possíveis:**

- `Authorized`: Placa encontrada na whitelist
- `Denied`: Placa não encontrada na whitelist

**Respostas de Erro:**

- **400 Bad Request**: Arquivo inválido ou muito grande
- **422 Unprocessable Entity**: Dados inválidos

---

#### 2. Listar Logs de Acesso

```
GET /api/v1/access_logs
```

**Descrição:** Lista registros de acesso veicular com filtros opcionais.

**Autenticação:** Requerida

**Query Parameters:**

- `skip` (opcional, padrão: 0): Número de registros a pular (mínimo: 0)
- `limit` (opcional, padrão: 100): Número máximo de registros (mínimo: 1, máximo: 100)
- `plate` (opcional): Filtrar por placa (busca parcial, case-insensitive)
- `status` (opcional): Filtrar por status (`Authorized` ou `Denied`)
- `start_date` (opcional): Data inicial (formato ISO 8601)
- `end_date` (opcional): Data final (formato ISO 8601)

**Exemplos:**

```
GET /api/v1/access_logs?limit=10&status=Authorized
GET /api/v1/access_logs?plate=ABC1234
GET /api/v1/access_logs?start_date=2025-01-01T00:00:00Z&end_date=2025-01-31T23:59:59Z
```

**Resposta de Sucesso (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-01-15T10:30:00Z",
    "plate_string_detected": "ABC1234",
    "status": "Authorized",
    "image_storage_key": "uploads/94c65e77-3337-472b-b8fc-3cb24c127964.jpg",
    "authorized_plate_id": "660e8400-e29b-41d4-a716-446655440000"
  }
]
```

**Respostas de Erro:**

- **401 Unauthorized**: Token inválido ou expirado

---

#### 3. Obter Imagem de Acesso

```
GET /api/v1/access_logs/images/{image_filename}
```

**Descrição:** Serve as imagens capturadas pelos dispositivos IoT. O acesso é restrito apenas para administradores autenticados.

**Autenticação:** Requerida

**Path Parameters:**

- `image_filename` (string): Nome do arquivo de imagem

**Exemplo:**

```
GET /api/v1/access_logs/images/94c65e77-3337-472b-b8fc-3cb24c127964.jpg
```

**Resposta de Sucesso (200):**

- Content-Type: `image/jpeg`, `image/png`, `image/webp` ou `application/octet-stream`
- Body: Arquivo binário da imagem

**Respostas de Erro:**

- **401 Unauthorized**: Token inválido ou expirado
- **404 Not Found**: Imagem não encontrada

---

### Controle de Portão

Todos os endpoints de controle de portão requerem autenticação.

#### 1. Acionar Portão

```
POST /api/v1/gate_control/trigger
```

**Descrição:** Permite que um administrador autenticado acione a abertura do portão através do módulo relé.

**Autenticação:** Requerida

**Nota:** Em produção, este endpoint deve se comunicar com o dispositivo IoT para acionar o módulo relé físico.

**Resposta de Sucesso (200):**

```json
{
  "status": "success",
  "message": "Portão acionado com sucesso"
}
```

**Respostas de Erro:**

- **401 Unauthorized**: Token inválido ou expirado
- **500 Internal Server Error**: Erro no acionamento do portão

---

### Dispositivos IoT

Todos os endpoints de dispositivos requerem autenticação.

#### 1. Escanear Dispositivos Bluetooth

```
GET /api/v1/devices/scan
```

**Descrição:** Retorna uma lista de dispositivos Bluetooth visíveis que podem ser usados como câmera. Esta é uma simulação para fins de apresentação - em produção, seria integrado com a API Web Bluetooth do navegador.

**Autenticação:** Requerida

**Nota:** Esta funcionalidade requer que o frontend use a Web Bluetooth API diretamente no navegador, pois APIs de Bluetooth não podem ser acessadas diretamente via HTTP por questões de segurança.

**Resposta de Sucesso (200):**

```json
[
  {
    "id": "device-001",
    "name": "Camera Bluetooth",
    "type": "camera",
    "signal_strength": -45
  }
]
```

**Respostas de Erro:**

- **401 Unauthorized**: Token inválido ou expirado

---

#### 2. Conectar Dispositivo Bluetooth

```
POST /api/v1/devices/connect
```

**Descrição:** Estabelece conexão com a câmera Bluetooth selecionada.

**Autenticação:** Requerida

**Headers:**

```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body (JSON):**

```json
{
  "device_id": "device-001"
}
```

**Resposta de Sucesso (200):**

```json
{
  "status": "connected",
  "device_id": "device-001",
  "message": "Dispositivo conectado com sucesso",
  "camera_index": 0
}
```

**Respostas de Erro:**

- **400 Bad Request**: device_id é obrigatório
- **401 Unauthorized**: Token inválido ou expirado

---

#### 3. Verificar Status da Conexão

```
GET /api/v1/devices/status
```

**Descrição:** Retorna informações sobre o dispositivo atualmente conectado.

**Autenticação:** Requerida

**Resposta de Sucesso (200):**

```json
{
  "connected": true,
  "device_id": "device-001",
  "device_name": "Camera Bluetooth",
  "message": "Dispositivo conectado"
}
```

**Resposta quando desconectado (200):**

```json
{
  "connected": false,
  "device_id": null,
  "device_name": null,
  "message": "Nenhum dispositivo conectado"
}
```

**Respostas de Erro:**

- **401 Unauthorized**: Token inválido ou expirado

---

#### 4. Desconectar Dispositivo Bluetooth

```
POST /api/v1/devices/disconnect
```

**Descrição:** Encerra a conexão com a câmera Bluetooth atual.

**Autenticação:** Requerida

**Resposta de Sucesso (200):**

```json
{
  "status": "disconnected",
  "message": "Dispositivo desconectado com sucesso"
}
```

**Respostas de Erro:**

- **401 Unauthorized**: Token inválido ou expirado

---

## Modelos de Dados

### Token

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer"
}
```

### User

**UserCreate:**

```json
{
  "email": "string (email válido)",
  "password": "string (mínimo 8 caracteres)"
}
```

**UserRead:**

```json
{
  "id": "uuid",
  "email": "string",
  "created_at": "datetime (ISO 8601)",
  "updated_at": "datetime (ISO 8601)"
}
```

### AuthorizedPlate

**AuthorizedPlateCreate:**

```json
{
  "plate": "string (formato brasileiro válido)",
  "description": "string (opcional)"
}
```

**AuthorizedPlateRead:**

```json
{
  "id": "uuid",
  "plate": "string",
  "normalized_plate": "string",
  "description": "string | null",
  "created_at": "datetime (ISO 8601)",
  "updated_at": "datetime (ISO 8601)"
}
```

### AccessLog

**AccessLogRead:**

```json
{
  "id": "uuid",
  "timestamp": "datetime (ISO 8601)",
  "plate_string_detected": "string",
  "status": "Authorized | Denied",
  "image_storage_key": "string",
  "authorized_plate_id": "uuid | null"
}
```

### Device

**BluetoothDevice:**

```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "signal_strength": "integer"
}
```

**ConnectionRequest:**

```json
{
  "device_id": "string"
}
```

**ConnectionResponse:**

```json
{
  "status": "string",
  "device_id": "string",
  "message": "string",
  "camera_index": "integer"
}
```

**ConnectionStatus:**

```json
{
  "connected": "boolean",
  "device_id": "string | null",
  "device_name": "string | null",
  "message": "string"
}
```

**DisconnectResponse:**

```json
{
  "status": "string",
  "message": "string"
}
```

---

## Códigos de Status HTTP

| Código | Significado           | Descrição                            |
| ------ | --------------------- | ------------------------------------ |
| 200    | OK                    | Requisição bem-sucedida              |
| 201    | Created               | Recurso criado com sucesso           |
| 400    | Bad Request           | Dados inválidos na requisição        |
| 401    | Unauthorized          | Token inválido, expirado ou ausente  |
| 403    | Forbidden             | Acesso negado (token tipo incorreto) |
| 404    | Not Found             | Recurso não encontrado               |
| 409    | Conflict              | Conflito (ex: email já registrado)   |
| 422    | Unprocessable Entity  | Dados válidos mas não processáveis   |
| 429    | Too Many Requests     | Rate limit excedido                  |
| 500    | Internal Server Error | Erro interno do servidor             |

---

## Rate Limiting

A API implementa rate limiting para proteger contra abuso:

- **Login:** 5 tentativas por minuto por IP
- **Registro:** 3 tentativas por minuto por IP

Quando o rate limit é excedido, a API retorna:

- **Status Code:** 429 Too Many Requests
- **Mensagem:** "Rate limit exceeded"

---

## Exemplos de Uso

### Fluxo Completo de Autenticação

```bash
# 1. Registrar novo usuário
curl -X POST "http://localhost:8000/api/v1/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123456"
  }'

# 2. Fazer login
curl -X POST "http://localhost:8000/api/v1/login/access-token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=usuario@example.com&password=senha123456"

# 3. Usar access_token em requisições protegidas
curl -X GET "http://localhost:8000/api/v1/whitelist" \
  -H "Authorization: Bearer {access_token}"
```

### Gerenciar Whitelist

```bash
# Criar placa autorizada
curl -X POST "http://localhost:8000/api/v1/whitelist" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "plate": "ABC-1234",
    "description": "Carro do Diretor"
  }'

# Listar placas
curl -X GET "http://localhost:8000/api/v1/whitelist?skip=0&limit=10" \
  -H "Authorization: Bearer {access_token}"

# Atualizar placa
curl -X PUT "http://localhost:8000/api/v1/whitelist/{id}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "plate": "XYZ-5678",
    "description": "Nova descrição"
  }'

# Remover placa
curl -X DELETE "http://localhost:8000/api/v1/whitelist/{id}" \
  -H "Authorization: Bearer {access_token}"
```

### Registrar Acesso Veicular (Dispositivo IoT)

```bash
curl -X POST "http://localhost:8000/api/v1/access_logs" \
  -F "file=@/path/to/image.jpg" \
  -F "plate=ABC1234"
```

### Listar Logs com Filtros

```bash
# Filtrar por status
curl -X GET "http://localhost:8000/api/v1/access_logs?status=Authorized&limit=10" \
  -H "Authorization: Bearer {access_token}"

# Filtrar por placa
curl -X GET "http://localhost:8000/api/v1/access_logs?plate=ABC1234" \
  -H "Authorization: Bearer {access_token}"

# Filtrar por data
curl -X GET "http://localhost:8000/api/v1/access_logs?start_date=2025-01-01T00:00:00Z&end_date=2025-01-31T23:59:59Z" \
  -H "Authorization: Bearer {access_token}"
```

### Renovar Token

```bash
curl -X POST "http://localhost:8000/api/v1/login/refresh-token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "refresh_token={refresh_token}"
```

### Acionar Portão

```bash
curl -X POST "http://localhost:8000/api/v1/gate_control/trigger" \
  -H "Authorization: Bearer {access_token}"
```
