# Configuração de Integração Contínua (CI) - SISCAV Web (Frontend)

## 📋 Visão Geral

Este repositório utiliza **GitHub Actions** para Integração Contínua (CI), conforme especificado no requisito **FND-08** da documentação do projeto.

## 🎯 Objetivo

O pipeline de CI garante que:

- ✅ Todo código novo atende aos padrões de qualidade e estilo.
- ✅ Nenhum código com erros de compilação ou de tipos seja mesclado na branch `develop`.
- ✅ Os testes unitários e de componentes sejam executados automaticamente.

## 🚀 Como Funciona

### Trigger (Acionamento)

O pipeline é **automaticamente acionado** quando:

- Um **Pull Request** é aberto para a branch `develop`.
- Um **Pull Request** existente para `develop` recebe novos commits.

### Etapas do Pipeline

O workflow `.github/workflows/ci.yml` executa as seguintes etapas em um ambiente Node.js 20.x:

1. **Checkout do Código**
   - Clona o repositório para o ambiente de execução.

2. **Setup Node.js**
   - Configura o ambiente Node.js com cache de dependências `npm` para acelerar o processo.

3. **Instalação de Dependências**
   - Instala as dependências do projeto de forma consistente.
   - Comando: `npm ci`

4. **Linting com ESLint**
   - Verifica se o código segue as convenções e padrões de qualidade definidos.
   - Comando: `npm run lint`
   - **Falha se houver erros de linting.**

5. **Testes com Jest** 🧪
   - Executa a suíte de testes unitários e de componentes.
   - Comando: `npm test`
   - **Falha se qualquer teste falhar.**

6. **Build de Produção**
   - Compila a aplicação Next.js, verificando erros de compilação e de tipos do TypeScript.
   - Comando: `npm run build`
   - **Falha se o build não for bem-sucedido.**

## Bloqueio de Merge

**IMPORTANTE:** O pipeline está configurado para **BLOQUEAR** a mesclagem de um Pull Request se qualquer uma das etapas críticas (Linting, Testes ou Build) falhar.

## 🛠️ Testando Localmente

É crucial testar seu código localmente **antes de abrir um Pull Request** para evitar falhas no pipeline.

**Guia detalhado**: Veja o documento `.github/GUIA_TESTES_LOCAIS.md` para um passo a passo completo.

## 📊 Status do Pipeline

Você pode visualizar o status do pipeline:

- Na aba **Actions** do repositório no GitHub.
- Diretamente na página do Pull Request (um check verde ✅ ou vermelho ❌).
- Através dos badges de status no `README.md`.

## 🔧 Configuração

- **Workflow Principal**: `.github/workflows/ci.yml`
- **Configuração do ESLint**: `eslint.config.mjs`
- **Configuração do Jest**: `jest.config.mjs`
- **Dependências de Desenvolvimento**: `devDependencies` no `package.json`

## 📈 Melhorias Futuras

- [ ] Integração com Codecov para visualização da cobertura de testes.
- [ ] Implementação de testes End-to-End (E2E) com Playwright ou Cypress.
- [ ] Análise de segurança de dependências (ex: `npm audit`).

## 🤝 Contribuindo

1. Crie uma branch a partir de `develop`.
2. Faça suas alterações e commits seguindo os [Commits Convencionais](https://www.conventionalcommits.org/).
3. **Teste localmente** (consulte o guia).
4. Abra um Pull Request para `develop`.
5. Aguarde o pipeline de CI passar ✅.
6. Solicite a revisão do seu código.

---

**Projeto:** SISCAV - Sistema de Controle de Acesso Veicular  
**Instituição:** UNICAP
