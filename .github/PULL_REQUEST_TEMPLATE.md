---
name: Pull Request Template
about: Standard template for opening pull requests in this project.
title: "feat: Describe the new feature"
labels: "enhancement"
assignees: ""
---

## Description

<!-- Describe your changes clearly and concisely. What problem does this solve? What is the goal of this PR? -->

---

## Type of Change

<!-- Mark with 'x' the type of change this PR introduces. -->

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] Tests added or improved
- [ ] Configuration or CI/CD (chore)

---

## Related Task

<!-- If applicable, reference the backlog task. Ex: FND-08 -->

- **Task:**

---

## Checklist

<!-- Go through each item and mark the boxes that apply. -->

### Before Opening the PR

- [ ] I read the [Continuous Integration](https://github.com/JFMGDB/siscav-web/blob/develop/README.md#continuous-integration) and [Scripts](https://github.com/JFMGDB/siscav-web/blob/develop/README.md#scripts) sections in `README.md`.
- [ ] My code follows this project's style and conventions.
- [ ] I ran the full local CI checks and all passed:
  - `npm run lint`
  - `npm test`
  - `npm run build`
- [ ] All new and existing tests passed.

### Code and Documentation

- [ ] I added tests that prove my fix is effective or my feature works.
- [ ] Relevant documentation (`README.md`, `docs/`, or ADRs) was updated to reflect my changes.
- [ ] My code does not introduce new console or terminal warnings.
- [ ] My commits follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## Manual Testing

<!-- Step-by-step instructions for reviewers to test your changes. -->

1. Check out this branch (`git fetch origin && git checkout <branch-name>`).
2. Install dependencies (`npm install`).
3. Start the app (`npm run dev`).
4. Navigate to page `X` and verify component `Y` behaves as `Z`.

---

## Screenshots (if applicable)

<!-- If this PR includes UI changes, add screenshots or a GIF. -->

---

## Additional Notes

<!-- Any other information relevant to the reviewer (libraries added, architecture decisions, etc.). -->

---

### Final Review

- [ ] I reviewed my own code line by line.
- [ ] I verified there is no commented-out code or unnecessary debug logs.
