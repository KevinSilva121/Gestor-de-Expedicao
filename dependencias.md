# Dependências do projeto

Este arquivo lista as dependências (runtime) e devDependencies (ferramentas de desenvolvimento) presentes no `package.json`, com uma breve descrição e versão.

## Dependências (runtime)

- bootstrap ^5.3.3 — Framework CSS usado para layout e componentes visuais.
  - Site: https://getbootstrap.com/

- bootstrap-icons ^1.11.3 — Ícones usados junto ao Bootstrap.
  - Site: https://icons.getbootstrap.com/

- core-js ^3.8.3 — Polyfills para compatibilidade com features de JS modernas.
  - Site: https://github.com/zloirock/core-js

- firebase ^10.13.2 — SDK do Firebase (Auth, Firestore e Storage usados no projeto).
  - Site: https://firebase.google.com/

- vue ^3.2.13 — Framework JavaScript (versão 3) — base da aplicação.
  - Site: https://vuejs.org/

- vue-router ^4.0.3 — Gerenciador de rotas para Vue 3.
  - Site: https://router.vuejs.org/

- vuedraggable ^2.24.3 — Biblioteca para drag-and-drop (baseada em SortableJS).
  - Repo: https://github.com/SortableJS/Vue.Draggable

- vuex ^4.0.0 — Gerenciamento de estado para Vue 3 (usado de forma básica neste projeto).
  - Site: https://vuex.vuejs.org/

## DevDependencies (ferramentas de desenvolvimento)

- @babel/core ^7.12.16 — Babel core para transpilar JS moderno.
- @babel/eslint-parser ^7.12.16 — Parser do Babel para ESLint.
- @vue/cli-plugin-babel ~5.0.0 — Plugin do Vue CLI para Babel.
- @vue/cli-plugin-eslint ~5.0.0 — Plugin do Vue CLI para ESLint.
- @vue/cli-plugin-router ~5.0.0 — Plugin do Vue CLI para scaffolding de router.
- @vue/cli-plugin-vuex ~5.0.0 — Plugin do Vue CLI para scaffolding de Vuex.
- @vue/cli-service ~5.0.0 — Serviço do Vue CLI (scripts `serve`, `build`).
- eslint ^7.32.0 — Linter para JavaScript.
- eslint-plugin-vue ^8.0.3 — Regras ESLint específicas para Vue.

## Instalação rápida

```powershell
cd c:\Users\Kevin\exp
npm install
```

Se precisar instalar apenas uma dependência específica (exemplo):

```powershell
npm install firebase@^10.13.2
```

## Observações

- Verifique a versão do Node.js recomendada para o Vue CLI (Node 12+ / 14+ / 16+). Compatibilidades de versão podem variar; se houver problemas, atualize o Node ou ajuste as versões no `package.json`.
- Algumas dependências (ex.: Firebase) possuem breaking changes entre grandes versões — confira a documentação ao atualizar.
