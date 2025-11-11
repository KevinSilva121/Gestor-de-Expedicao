import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Login from '../views/LoginPage.vue';
import MainPage from '../views/MainPage.vue';
import Gestor from '../views/GestorPage.vue';
import Main2Page from '@/views/Main2Page.vue';
import Login3Page from '@/views/Login3Page.vue';
import { auth, db } from '../firebase/firebase.js'; // Importando auth e Firestore
import { getDoc, doc } from 'firebase/firestore'; // Para buscar a role do usuário
import { onAuthStateChanged } from 'firebase/auth';


// Função auxiliar para buscar a role do usuário
async function getUserRole(user) {
  if (!user) return null;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  return null;
}

let isAuthChecked = false; // Flag para verificar se a autenticação foi verificada

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
    },
    {
      path: '/gestor-page',
      name: 'gestor-page',
      component: Gestor,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/Login3Page',
      name: 'Login3Page',
      component: Login3Page
    },
    {
      path: '/Main2Page',
      name: 'Main2Page',
      component: Main2Page,
      meta: { requiresAuth: true, roles: ['colaborador'] }
    },
    {
      path: '/main',
      name: 'MainPage',
      component: MainPage,
      meta: { requiresAuth: true, roles: ['admin'] }
    }
  ]
});

// Verificação de autenticação e roles
router.beforeEach((to, from, next) => {
  // Se já verificamos a autenticação, seguimos diretamente
  if (isAuthChecked) {
    next();
    return;
  }

  // Usar onAuthStateChanged para garantir que a verificação do usuário esteja pronta antes de continuar
  onAuthStateChanged(auth, async (user) => {
    isAuthChecked = true;

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // Se a rota requer autenticação
    if (requiresAuth) {
      if (!user) {
        next({ name: 'Login' }); // Redireciona para login se não estiver autenticado
        return;
      }

      // Busca a role do usuário no Firestore
      const userRole = await getUserRole(user);

      // Verifica se a rota tem restrições de role
      if (to.meta.roles && !to.meta.roles.includes(userRole)) {
        next({ name: 'home' }); // Redireciona para a home se não tiver permissão
        return;
      }
    }

    // Se não requer autenticação ou está tudo certo, continua
    next();
  });
});

export default router;