<template>
  <div class="primeira">
    <div class="logo-container">
      <img src="@/assets/logo-ar-transportes.png" alt="Logo">
    </div>
    <form v-if="!showResetPasswordForm" @submit.prevent="submit" class="form">
      
      <h1>{{ mode === 'login' ? 'Entrar' : 'Cadastrar' }}</h1>

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
        {{ mode === 'login' ? 'Não é usuário? Cadastrar' : 'Já é usuário? Login' }}
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="mode === 'login'" class="forgot-password">
        <a @click.prevent="showResetPasswordForm = true">Esqueceu sua senha?</a>
      </div>

      <div class="about-system">
      <router-link to="/about">Sobre o Sistema</router-link>
      
      </div>


    </form>
    <button @click="goToRestrictedLogin" class="go-restricted-login">
        Área do Colaborador
      </button>

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
  </div>
</template>

<script>
import { auth } from '../firebase/firebase.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth'
import { ref, onMounted } from 'vue'
import { getDoc, doc, setDoc } from 'firebase/firestore' // Certifique-se de importar de 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter();
    const data = ref({
      email: '',
      password: ''
    });
    const mode = ref('login');
    const user = ref(null);
    const errorMessage = ref('');
    const resetEmail = ref('');
    const resetMessage = ref('');
    const showResetPasswordForm = ref(false);



    function goToRestrictedLogin() {
      router.push('/Login3Page');
    }
    

    function toggleMode(val) {
      mode.value = val;
      errorMessage.value = ''; // Limpar a mensagem de erro ao mudar o modo
      showResetPasswordForm.value = false; // Fechar o formulário de redefinição de senha ao mudar o modo
    }

    function validatePassword(password) {
      const hasNumber = /\d/;
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
      if (password.length < 6 || !hasNumber.test(password) || !hasSpecialChar.test(password)) {
        return false;
      }
      return true;
    }

    async function login(email, password) {
  try {
    // Autenticação com pop-up
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verificar se o e-mail foi confirmado
    if (!user.emailVerified) {
      errorMessage.value = 'Por favor, confirme seu e-mail antes de fazer login.';
      await signOut(auth); // Opcional: deslogue o usuário se o e-mail não estiver confirmado
      return;
    }

    // Verificar a role do usuário no Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // Se o documento existir, verifica a role
    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Verificar se o usuário é colaborador
      if (userData.role === 'colaborador') {
        router.push('/Main2Page'); // Redireciona os colaboradores para uma página especial
      } else if(userData.role === 'admin') {
        router.push('/main'); // Usuários não colaboradores acessam a página principal normal
      }
    } else {
      // Se não existir documento no Firestore, permite o acesso à página principal
      router.push('/main'); // Redireciona para a página principal, já que não é colaborador
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

    async function register(email, password) {
      if (!validatePassword(password)) {
        errorMessage.value = 'A senha deve ter pelo menos 6 caracteres, incluindo um número e um caractere especial.';
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Enviar o e-mail de verificação
        await sendEmailVerification(user);

        await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: 'admin' // Define a role como admin
    });

        // Informar o usuário para verificar o e-mail
        errorMessage.value = 'Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar a conta.';

        // Limpar os campos do formulário
        data.value.email = '';
        data.value.password = '';

        // Redirecionar para outra página ou manter na página atual
        // router.push('/main'); // Remova ou ajuste conforme necessário
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          errorMessage.value = 'O e-mail já está em uso.';
        } else {
          errorMessage.value = 'Erro ao tentar cadastrar. Tente novamente.';
        }
      }
    }

    async function handlePasswordReset() {
      try {
        await sendPasswordResetEmail(auth, resetEmail.value);
        resetMessage.value = 'Link de redefinição enviado para o e-mail fornecido.';
        resetEmail.value = ''; // Clear the email field after sending
      } catch (err) {
        resetMessage.value = 'Erro ao enviar o link de redefinição. Tente novamente.';
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

    async function signout() {
      try {
        await signOut(auth);
      } catch (err) {
        console.error(err);
      }
    }

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
      });
    });

    return {
      data,
      mode,
      user,
      errorMessage,
      submit,
      toggleMode,
      signout,
      handlePasswordReset,
      resetEmail,
      resetMessage,
      showResetPasswordForm,
      goToRestrictedLogin
    };
  }
}
</script>

<style scoped>
.primeira {
  background: #9d9595; /* Adjust if needed */
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
  text-align: center; /* Center the logo container */
}

.logo-container img {
  max-width: 200px; /* Adjust size if needed */
  width: 100%; /* Ensure logo scales responsively */
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


.go-restricted-login {
  margin-top: 15px;
  width: 100%;
  height: 36px;
  border-radius: 30px;
  background-color: rgb(58, 122, 66); /* Cor diferente para indicar o login restrito */
  font-size: 15px;
  cursor: pointer;
  color: aliceblue;
}

.go-restricted-login:hover {
  background-color: rgb(75, 142, 85);
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
  background: rgba(255, 255, 255, 0.8); /* Slightly white background to highlight the form */
  border-radius: 25px;
  width: 100%;
  max-width: 500px;
}

label {
  display: block;
  width: 100%;
  margin: 25px auto 0;
  text-align: center;
}

button.submit {
  background-color: rgb(35, 35, 56);
  color: aliceblue;
}

button.submit:hover {
  background-color: rgb(58, 66, 122);
}

.toggle-mode {
  color: blue;
  cursor: pointer;
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.toggle-mode:hover {
  text-decoration: underline;
}

.error-message {
  color: red;
  font-weight: bold;
  text-align: center;
  margin-top: 15px;
}

.forgot-password {
  text-align: center;
  margin-top: 15px;
}

.forgot-password a {
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}

.forgot-password a:hover {
  text-decoration: none;
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.reset-password-form input {
  margin-bottom: 10px;
  background: white; /* White background for the input */
  border: 1px solid rgba(109, 93, 93, 0.4); /* Same border style as other inputs */
}

.reset-password-form button {
  margin: 5px;
  width: auto;
  height: 36px;
  border-radius: 30px;
  background-color: rgb(35, 35, 56);
  font-size: 15px;
  cursor: pointer;
  color: aliceblue;
}

.reset-password-form button:hover {
  background-color: rgb(58, 66, 122);
}
</style>