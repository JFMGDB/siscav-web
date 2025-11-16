---
name: Template de Pull Request
about: Template padrão para a abertura de Pull Requests neste projeto.
title: "feat: Descreva a nova funcionalidade"
labels: "enhancement"
assignees: ""
---

## 📝 Descrição

<!-- Descreva suas alterações de forma clara e concisa. Qual problema está sendo resolvido? Qual é o objetivo deste PR? -->

---

## 🎯 Tipo de Mudança

<!-- Marque com 'x' o tipo de mudança que este PR introduz. -->

- [ ] 🐛 Correção de Bug (bug fix)
- [ ] ✨ Nova Funcionalidade (new feature)
- [ ] 💥 Mudança Que Quebra (breaking change)
- [ ] 📚 Atualização de Documentação (documentation)
- [ ] 🎨 Refatoração de Código (refactoring)
- [ ] ⚡ Melhoria de Performance (performance improvement)
- [ ] ✅ Adição ou Melhoria de Testes (tests)
- [ ] 🔧 Configuração ou CI/CD (chore)

---

## 🔗 Tarefa Relacionada

<!-- Se aplicável, referencie a tarefa do backlog. Ex: FND-08 -->

- **Tarefa:**

---

## 📋 Checklist de Verificação

<!-- Passe por todos os pontos a seguir e marque as caixas que se aplicam. -->

### Antes de Abrir o PR

- [ ] Eu li o `GUIA_CI.md` e o `GUIA_TESTES_LOCAIS.md`.
- [ ] Meu código segue o estilo e as convenções deste projeto.
- [ ] Eu executei a verificação completa do CI localmente e todos os checks passaram.
  - `npm run lint`
  - `npm test`
  - `npm run build`
- [ ] Todos os testes novos e existentes passaram. ✅

### Código e Documentação

- [ ] Eu adicionei testes que provam que minha correção é eficaz ou que minha funcionalidade funciona.
- [ ] A documentação relevante (como `README.md` ou outros guias) foi atualizada para refletir minhas mudanças.
- [ ] Meu código não gera novos warnings no console ou no terminal.
- [ ] Meus commits seguem o padrão de [Commits Convencionais](https://www.conventionalcommits.org/).

---

## 🧪 Como Testar Manualmente

<!-- Forneça instruções passo a passo para que um revisor possa testar suas alterações. -->

1. Faça o checkout desta branch (`git fetch origin && git checkout <nome-da-branch>`).
2. Instale as dependências (`npm install`).
3. Inicie a aplicação (`npm run dev`).
4. Navegue para a página `X` e verifique que o componente `Y` agora se comporta de maneira `Z`.

---

## 📸 Screenshots (Se aplicável)

<!-- Se o seu PR inclui mudanças na UI, adicione screenshots ou um GIF para demonstrar as alterações. -->

---

## 📝 Notas Adicionais

<!-- Qualquer outra informação que você acredite ser relevante para o revisor (ex: bibliotecas adicionadas, decisões de arquitetura, etc.). -->

---

### ✅ Revisão Final

- [ ] Eu revisei meu próprio código linha por linha.
- [ ] Eu verifiquei que não há código comentado ou logs de debug desnecessários.
