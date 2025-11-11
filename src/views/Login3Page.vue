<template>
    <div class="segunda">
      <div class="logo-container">
        <img src="@/assets/logo-ar-transportes.png" alt="Logo">
      </div>
      <form v-if="!showResetPasswordForm" @submit.prevent="submit" class="form">
        <h1>{{ mode === 'login' ? 'Entrar Colaborador' : 'Cadastrar Colaborador' }}</h1>
  
        <label>
          <input type="email" v-model="data.email" name="email" placeholder="Email">
        </label>
  
        <label>
          <input type="password" v-model="data.password" name="password" placeholder="Senha">
        </label>
  
        <button class="submit" type="submit">
          {{ mode === 'login' ? 'Login' : 'Register' }}
        </button>
  
        <div @click="toggleMode(mode === 'login' ? 'register' : 'login')" class="toggle-mode">
          {{ mode === 'login' ? 'Não é colaborador? Cadastrar' : 'Já é colaborador? Login' }}
        </div>
  
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
  
        <div v-if="mode === 'login'" class="forgot-password">
          <a @click.prevent="showResetPasswordForm = true">Esqueceu sua senha?</a>
        </div>
      </form>
  
      <!-- Formulário de redefinição de senha -->
      <div v-if="showResetPasswordForm" class="reset-password-form">
        <h1>Redefinir Senha</h1>
        <input v-model="resetEmail" type="email" placeholder="Email">
        <button @click="handlePasswordReset">Enviar Link de Redefinição</button>
        <div v-if="resetMessage" class="error-message">
          {{ resetMessage }}
        </div>
        <div @click="showResetPasswordForm = false" class="toggle-mode">
          Voltar para {{ mode === 'login' ? 'Login' : 'Cadastro' }}
        </div>
      </div>
      <button @click="goToLoginPrincipal" class="back-to-main-login">
      Voltar para Login Principal
    </button>
    </div>
  </template>
  
  <script>
  import { auth, db } from '../firebase/firebase.js'
  import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut,  sendPasswordResetEmail } from 'firebase/auth'
  import { doc, setDoc, getDoc } from 'firebase/firestore'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  export default {
    setup() {
      const router = useRouter();
      const data = ref({
        email: '',
        password: ''
      });
      const mode = ref('login');
      const errorMessage = ref('');
      const resetEmail = ref('');
      const resetMessage = ref('');
      const showResetPasswordForm = ref(false);
  
      async function register(email, password) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
  
          // Atribuir a role 'colaborador' no Firestore
          await setDoc(doc(db, 'users', user.uid), {
            email: email,
            role: 'colaborador'
          });
  
          // Enviar o e-mail de verificação
          await sendEmailVerification(user);
  
          errorMessage.value = 'Cadastro realizado com sucesso! Por favor, verifique seu e-mail.';
  
          // Limpar campos
          data.value.email = '';
          data.value.password = '';
  
        } catch (err) {
          if (err.code === 'auth/email-already-in-use') {
            errorMessage.value = 'O e-mail já está em uso.';
          } else {
            errorMessage.value = 'Erro ao tentar cadastrar. Tente novamente.';
          }
        }
      }
  
      async function login(email, password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
  
          // Verificar se o e-mail foi confirmado
          if (!user.emailVerified) {
            errorMessage.value = 'Por favor, confirme seu e-mail antes de fazer login.';
            await signOut(auth);
            return;
          }
  
          // Verificar a role do usuário no Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'colaborador') {
              router.push('/Main2Page'); // Redireciona para a página específica
            } else {
              errorMessage.value = 'Acesso negado. Usuário não autorizado.';
            }
          } else {
            errorMessage.value = 'Usuário não encontrado.';
          }
        } catch (err) {
          if (err.code === 'auth/user-not-found') {
            errorMessage.value = 'Usuário inexistente.';
          } else if (err.code === 'auth/wrong-password') {
            errorMessage.value = 'Senha incorreta.';
          } else {
            errorMessage.value = 'Erro ao tentar logar. Tente novamente.';
          }
        }
      }
  
      function submit() {
        const email = data.value.email;
        const password = data.value.password;
  
        if (!email || !password) {
          errorMessage.value = 'Preencha todos os campos.';
          return;
        }
  
        if (mode.value === 'login') {
          login(email, password);
        } else {
          register(email, password);
        }
      }
  
      async function handlePasswordReset() {
        try {
          await sendPasswordResetEmail(auth, resetEmail.value);
          resetMessage.value = 'Link de redefinição enviado para o e-mail fornecido.';
          resetEmail.value = ''; // Limpar campo de e-mail
        } catch (err) {
          resetMessage.value = 'Erro ao enviar o link de redefinição. Tente novamente.';
        }
      }
  
      function toggleMode(val) {
        mode.value = val;
        errorMessage.value = ''; // Limpar a mensagem de erro ao mudar o modo
        showResetPasswordForm.value = false; // Fechar o formulário de redefinição de senha ao mudar o modo
      }

      function goToLoginPrincipal() {
      router.push('/login'); // Redireciona para a rota da página de login principal
    }

  
      return {
        data,
        mode,
        errorMessage,
        submit,
        toggleMode,
        handlePasswordReset,
        resetEmail,
        resetMessage,
        showResetPasswordForm,
        goToLoginPrincipal
      };
    }
  }
  </script>
  
  <style scoped>
  /* Estilo igual ao da primeira página de login, adaptado conforme necessário */
  .segunda {
    background: #9d9595;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
  }
  
  .logo-container {
    margin-bottom: 20px;
    text-align: center;
  }
  
  .logo-container img {
    max-width: 200px;
    width: 100%;
  }
  
  input, button {
    border: none;
    outline: none;
    background: none;
  }
  
  input::placeholder {
    color: #888;
  }
  
  input {
    display: block;
    width: 100%;
    margin-top: 5px;
    font-size: 16px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid rgba(109, 93, 93, 0.4);
    text-align: center;
  }
  
  button {
    display: block;
    margin: 20px auto;
    width: 100%;
    height: 36px;
    border-radius: 30px;
    background-color: rgb(35, 35, 56);
    font-size: 15px;
    cursor: pointer;
    color: aliceblue;
  }
  
  button:hover {
    background-color: rgb(58, 66, 122);
  }
  
  h1 {
    color: rgb(0, 0, 0);
    padding-top: 10px;
    font-size: 30px;
    text-align: center;
  }
  
  .form {
    padding: 50px 30px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 25px;
    width: 100%;
    max-width: 500px;
  }
  
  .error-message {
    color: red;
    font-weight: bold;
    text-align: center;
    margin-top: 15px;
  }

  .back-to-main-login {
  display: block;
  margin: 20px auto;
  width: 100%;
  height: 36px;
  border-radius: 30px;
  background-color: rgb(35, 35, 56);
  font-size: 15px;
  cursor: pointer;
  color: aliceblue;
}

.back-to-main-login:hover {
  background-color: rgb(58, 66, 122);
}

  </style>
  