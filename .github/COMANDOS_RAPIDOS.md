# 🎯 Comandos Rápidos - Frontend Workflow

Referência rápida dos comandos mais usados no dia a dia para o desenvolvimento do `siscav-web`.

---

## 🔍 Verificação Local (Antes de Abrir PR)

```bash
# Comando completo que simula o pipeline de CI
npm run lint && npm test && npm run build
```

---

## 🧹 Linting e Formatação

```bash
# Verificar problemas de linting
npm run lint

# Corrigir automaticamente problemas de linting
npm run lint:fix

# Formatar todo o código com Prettier
npm run format
```

---

## 🧪 Testes (Jest)

```bash
# Executar todos os testes
npm test

# Executar testes em modo "watch" (re-executa ao salvar)
npm test -- --watch

# Gerar relatório de cobertura de testes
npm test -- --coverage

# Testar um arquivo específico
npm test -- src/path/to/file.test.ts
```

---

## 📦 Dependências (npm)

```bash
# Instalar todas as dependências do package.json
npm install

# Adicionar uma nova dependência de produção
npm install <nome-do-pacote>

# Adicionar uma nova dependência de desenvolvimento
npm install <nome-do-pacote> --save-dev

# Atualizar todas as dependências para as versões mais recentes
npm update

# Listar dependências instaladas
npm list --depth=0
```

---

## 🌿 Git Workflow

```bash
# Atualizar a branch develop local
git checkout develop
git pull origin develop

# Criar uma nova branch de feature
git checkout -b feature/nome-da-feature

# Ver o status dos arquivos
git status

# Adicionar todos os arquivos modificados para o próximo commit
git add .

# Fazer o commit seguindo o padrão de Commits Convencionais
git commit -m "feat: descrição da nova feature"

# Enviar a branch para o repositório remoto
git push origin feature/nome-da-feature
```

---

## 🔄 Sincronizar Branch com a `develop`

```bash
# 1. Garanta que sua branch develop local está atualizada
git checkout develop
git pull origin develop

# 2. Volte para a sua branch e mescle as atualizações
git checkout feature/sua-feature
git merge develop
```

---

## 📝 Commits Convencionais

Use os seguintes prefixos para seus commits:

- **feat:** Adição de uma nova funcionalidade.
- **fix:** Correção de um bug.
- **docs:** Alterações na documentação.
- **test:** Adição ou modificação de testes.
- **refactor:** Refatoração de código que não altera a funcionalidade.
- **style:** Alterações de formatação (espaçamento, etc.).
- **chore:** Tarefas de manutenção (atualizar dependências, etc.).
- **ci:** Alterações nos arquivos de CI/CD.

**Exemplo:** `git commit -m "docs: atualizar guia de comandos rápidos"`
