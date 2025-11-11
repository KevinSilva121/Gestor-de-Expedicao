## Gestor de Expedição — Projeto "exp"

Este repositório é uma aplicação web front-end construída com Vue 3 para gerenciar expedições (criação de pastas, itens, anotações, controle de atrasos e relatórios). O backend usado é Firebase (Authentication, Firestore e Storage).

## Sumário

- Visão geral
- Tecnologias
- Estrutura do projeto
- Como rodar localmente
- Fluxos principais (auth, roles, firestore)
- Coleções do Firestore usadas
- TODOs e melhorias sugeridas
- Segurança e notas importantes

## Visão geral

Funcionalidades principais:

- Autenticação por e-mail (verificação por e-mail)
- Controle de roles: `admin` e `colaborador`
- Criar/editar/excluir pastas de expedição
- Adição/edição/remoção de itens nas pastas
- Marcar pastas como atrasadas, conclusão e cancelamento
- Anotações por pasta
- Gerar relatórios agregados em coleção `reports`
- Recebimento com apontamento (upload de foto para Storage)

## Tecnologias

- Vue 3 (Composition API)
- Vue Router 4
- Vuex 4 (store básica, pouco usada atualmente)
- Firebase (v10) — Auth, Firestore, Storage
- Bootstrap 5 + bootstrap-icons
- vuedraggable (presente nas dependências)

Versões chave (ver `package.json`):

- vue: ^3.2.13
- firebase: ^10.13.2
- bootstrap: ^5.3.3

Detalhes de dependências completos em `dependencias.md` (arquivo criado).

## Estrutura do projeto (principais arquivos)

- `src/main.js` — cria a app Vue, injetando `store` e `router`.
- `src/App.vue` — root component com `<router-view/>`.
- `src/router/index.js` — rotas principais e guard (verificação de auth e roles).
- `src/store/index.js` — Vuex store (setups comentados; pouca lógica centralizada).
- `src/firebase/firebase.js` — inicializa Firebase (Auth, Firestore, Storage). Atualmente a configuração está embutida no arquivo.
- `src/views/` — principais páginas: `HomeView.vue`, `MainPage.vue` (admin), `Main2Page.vue` (colaborador), `GestorPage.vue` (relatórios), `LoginPage.vue`, `Login3Page.vue`, `AboutView.vue`.
- `src/components/HelloWorld.vue` — componente exemplo.

## Como rodar (desenvolvimento)

Pré-requisitos: Node.js (12+/14+/16+) e npm

1) Instalar dependências:

```powershell
cd c:\Users\Kevin\exp
npm install
```

2) Rodar em modo development (hot-reload):

```powershell
npm run serve
```

3) Build para produção:

```powershell
npm run build
```

4) Lint (se configurado):

```powershell
npm run lint
```

## Configurar Firebase / Variáveis de ambiente

Atualmente a configuração do Firebase está em `src/firebase/firebase.js` com a chave (`firebaseConfig`) hard-coded. Recomendo mover essas chaves para variáveis de ambiente e não comitar credenciais em repositórios públicos.

Sugestão: criar arquivo `.env.local` (não comitar) e usar `process.env.VUE_APP_...` para prover os valores no build.

## Fluxos principais

- Autenticação: sign up / sign in usando Firebase Auth (e-mail/senha). O projeto envia verificação por e-mail e obriga verificação antes do login em algumas telas.
- Roles: ao registrar, os usuários recebem `role` salvo em `users/{uid}` no Firestore (`admin` ou `colaborador`). O `router.beforeEach` usa o documento do usuário para permitir/negá-los em rotas com `meta.roles`.
- Pastas: coleção `folders` contém documentos com campos como `userId`, `name`, `items` (array), `annotations`, `completed`, `completedAt`, `period`, `date`, `isLate`, `delayInMinutes`, `order`, etc.
- Relatórios: quando um relatório é gerado, um documento é criado em `reports` e subcoleção `reports/{reportId}/folders` armazena snapshots das pastas naquele relatório.
- Default folder configs: coleção `defaultFolderConfigs` com doc `globalDefaultFolderConfigs` para guardar configurações reutilizáveis de pastas padrão.

## Coleções Firestore usadas (resumo)

- `users` — documentos por usuário (email, role, folderNameFilter, etc.)
- `folders` — pastas de expedição (itens, anotações, status, período, data)
- `reports` — relatórios gerados (subcoleção `folders` com snapshot)
- `defaultFolderConfigs` — configurações padrão de pastas

## Rotas principais

- `/` — Home / tela de login
- `/about` — documentação / sobre
- `/login` — login principal
- `/Login3Page` — login/cadastro de colaboradores
- `/Main2Page` — área do colaborador (role `colaborador`)
- `/main` — área principal/gestão (role `admin`)
- `/gestor-page` — relatórios do gestor (role `admin`)

## Observações de implementação

- A store Vuex está presente mas muitas ações foram implementadas diretamente nos componentes. Pode valer a pena centralizar autenticação/usuario no store.
- O roteamento espera o documento `users/{uid}` existir para roles. Se não existir, algumas rotas enviam à `home` ou `main`.
- Algumas funcionalidades implementadas diretamente no front (prompt de senha `admin` em `MainPage.vue`) — revisar para produção.

## TODOs (identificados automaticamente a partir do código)

1) Segurança / Config: mover `firebaseConfig` para variáveis de ambiente e remover do repositório.
2) Centralizar autenticação no Vuex (atualmente usada via onAuthStateChanged em vários componentes).
3) Validar e sanitizar entradas (nomes de pastas, anotações) e tratar erros do Firestore uniformemente.
4) Adicionar testes unitários e end-to-end (jest / cypress).
5) Implementar controle de permissões mais robusto no backend (ex.: Cloud Functions para regras sensíveis) e regras Firestore mais estritas.
6) Melhorar UI/UX para mobile e acessibilidade (alto contraste, aria attributes).
7) Implementar paginação/filtragem server-side quando coleção `folders` crescer muito.
8) Tratar edge cases de fusão de pastas copiadas/coladas (checagem de duplicatas) e performance ao colar muitas pastas.

## Notas finais / recomendações

- Backup: habilitar exportações regulares do Firestore.
- Segurança: revisar regras de Firestore (`firestore.rules`) antes de deploy.
- CI: adicionar lint e testes no pipeline (ex.: GitHub Actions).

Arquivo criado com documentação de dependências: `dependencias.md`.

----

