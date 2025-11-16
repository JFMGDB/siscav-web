# Guia: Como Testar o Pipeline de CI Localmente (Frontend)

Este guia explica como simular o pipeline de CI em sua máquina local antes de abrir um Pull Request. Isso ajuda a garantir que seu código passará nas verificações automáticas.

## 1. Instalar Dependências

Se você acabou de clonar o projeto ou se o `package.json` foi atualizado, instale as dependências:

```bash
npm install
```

## 2. Executar Linting (ESLint)

O linter verifica a qualidade e o estilo do código.

```bash
# Verificar se há problemas de linting
npm run lint

# Tentar corrigir automaticamente os problemas
npm run lint:fix
```

## 3. Executar Testes (Jest)

Execute a suíte de testes para garantir que nenhuma funcionalidade existente foi quebrada.

```bash
# Executar todos os testes
npm test

# Executar testes e ver o relatório de cobertura no terminal
npm test -- --coverage

# Executar testes de um arquivo específico
npm test -- src/components/features/auth/Login-Form.test.tsx
```

## 4. Executar o Build de Produção

O build verifica se a aplicação compila sem erros de código ou de tipos do TypeScript.

```bash
npm run build
```

## 5. Verificação Completa (Simula o CI)

Para simular o pipeline de CI completo, execute todos os comandos em sequência. Se nenhum deles falhar, seu código está pronto!

```bash
npm run lint && npm test && npm run build
```

Se todos os comandos passarem sem erro, seu código está pronto para o Pull Request! ✅

## 6. Criar Pull Request

1. Certifique-se de estar em uma branch de feature:

    ```bash
    git checkout -b feature/minha-feature
    ```

2. Commit suas alterações:

    ```bash
    git add .
    git commit -m "feat: descrição da funcionalidade"
    ```

3. Envie para o repositório remoto:

    ```bash
    git push origin feature/minha-feature
    ```

4. Abra um Pull Request no GitHub, direcionado para a branch `develop`. O pipeline de CI será executado automaticamente.

## Solução de Problemas Comuns

### Erros de Linting

Se o comando `npm run lint` falhar, tente a correção automática:

```bash
npm run lint:fix
```

Se os erros persistirem, eles precisam ser corrigidos manualmente no código.

### Testes Falhando

Analise a saída do comando `npm test` para identificar qual teste falhou e por quê. A falha pode indicar uma regressão na lógica de negócio ou que o teste precisa ser atualizado para refletir as novas mudanças.

### Build Falhando

Geralmente, falhas no `npm run build` são causadas por erros de TypeScript (tipagem incorreta) ou erros de sintaxe do React/JSX. Verifique o output do terminal para localizar o arquivo e a linha do erro.
