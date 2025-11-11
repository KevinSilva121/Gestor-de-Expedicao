<template>
    <div class="main-page">
      <header class="header">
        <img src="../assets/logo-ar-transportes.png" alt="AR Transportes" class="logo" />
        <h1 class="title">Área do Colaborador</h1>
        <button class="btn-primary" @click="signOut">Sign Out</button>
      </header>
  
      <div class="select-controls">
        <div class="select-date">
          <label for="dateSelector">Selecione uma data:</label>
          <input type="date" v-model="selectedDate" @change="loadFolders" />
        </div>
        <div class="select-period">
          <label for="periodSelector">Selecione um período:</label>
          <select v-model="selectedPeriod" @change="loadFolders">
            <option value="manha">Manhã</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
          </select>
        </div>
      </div>
  
      <!-- Input de filtro de nome de pasta -->
      <div class="folder-filter">
        <label for="folderNameFilter">Filtrar pelo nome da pasta:</label>
        <input type="text" v-model="folderNameFilter" placeholder="Digite o nome da pasta" 
               @focus="promptForCompanyChange" 
               :readonly="!isAdmin"
               @input="saveFolderNameFilter" />
      </div>
  
      <div v-if="loading">Carregando pastas...</div>
  
      <div class="folders-container" v-if="!loading">
        <div v-if="folders.length">
          <select v-model="selectedFolderId" @change="loadFolderContent(selectedFolderId)">
            <option value="">Selecione uma pasta</option>
            <option v-for="folder in filteredFolders" :key="folder.id" :value="folder.id">{{ folder.name }}</option>
          </select>
        </div>
  
        <div v-if="selectedFolder" class="folder">
          <h2 class="folder-title">Conteúdo da Pasta: {{ selectedFolder.name }}</h2>
          <p class="folder-details">Concluída em: {{ selectedFolder.completedAt || 'Não concluído' }}</p>
          <p class="folder-details">Atraso: {{ selectedFolder.delayInMinutes }} minutos</p>
          <p class="folder-details">Itens:</p>
          <ul>
  <li v-for="item in selectedFolder.items" :key="item.name" class="item">
    <input type="checkbox" disabled v-model="item.checked" />
    <span class="item-text">{{ item.name }} (Quantidade: {{ item.quantity }})</span>
    <div class="user-checklist">
      <span>Meu Checklist:</span>
      <input type="checkbox" v-model="userChecklist[item.name]" @change="updateUserChecklist(item.name)" />
    </div>
  </li>
</ul>
<!-- Botões de recebimento -->
<div class="buttons">
        <button class="btn-success" @click="submitReceived">Recebido</button>
        <button class="btn-warning" @click="openIssueForm">Recebido com Apontamento</button>
      </div>

      <!-- Formulário de apontamento (aparece ao clicar em "Recebido com Apontamento") -->
      <div v-if="showIssueForm" class="issue-form">
        <textarea v-model="issueDescription" placeholder="Descreva o problema encontrado"></textarea>
        <div class="photo-section">
          <button @click="capturePhoto">Tirar Foto</button>
          <input type="file" accept="image/*" capture="environment" @change="handlePhotoChange" />
          <div v-if="capturedPhoto">
            <img :src="capturedPhoto" alt="Foto capturada" />
          </div>
        </div>
        <button @click="submitWithIssue">Enviar com Apontamento</button>
      </div>


        </div>
  
        <div v-else-if="error">{{ error }}</div>
        <div v-else>Não há pastas disponíveis para esta data e período.</div>
      </div>
    </div>
  </template>
  
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import { auth, db } from '../firebase/firebase.js';
  import { onAuthStateChanged } from 'firebase/auth';
  import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
  import { useRouter } from 'vue-router';
  import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { storage } from '../firebase/firebase.js';
  
  export default {
    
    setup() {
      const user = ref(null);
      const selectedDate = ref(new Date().toISOString().split('T')[0]);
      const selectedPeriod = ref('manha');
      const selectedFolderId = ref('');
      const folders = ref([]);
      const loading = ref(false);
      const error = ref('');
      const selectedFolder = ref(null);
      const userChecklist = ref({});
      const folderNameFilter = ref('');
      const isAdmin = ref(false); // Controle de permissão
      const router = useRouter();
      const promptShown = ref(false); // Flag para controlar o prompt
      
    
    const showIssueForm = ref(false);
    const issueDescription = ref('');
    const capturedPhoto = ref(null);
      


      onMounted(() => {
        onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            user.value = currentUser;
            await loadFolderNameFilter();
            loadFolders();
          } else {
            router.push('/login');
          }
        });
      });
  
      const loadFolders = async () => {
        loading.value = true;
        error.value = '';
  
        try {
          const foldersQuery = query(
            collection(db, 'folders'),
            where('date', '==', selectedDate.value),
            where('period', '==', selectedPeriod.value === 'manha' ? 'Manhã' : selectedPeriod.value === 'tarde' ? 'Tarde' : 'Noite')
          );
  
          const snapshot = await getDocs(foldersQuery);
  
          if (snapshot.size > 0) {
            folders.value = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  
            if (selectedFolder.value) {
              const folderWithSameName = folders.value.find(folder => folder.name === selectedFolder.value.name);
              if (folderWithSameName) {
                selectedFolderId.value = folderWithSameName.id;
                selectedFolder.value = folderWithSameName;
                await loadFolderContent(folderWithSameName.id);
              } else {
                selectedFolder.value = null;
              }
            }
          } else {
            error.value = 'Não há pastas disponíveis para esta data e período.';
          }
        } catch (err) {
          error.value = 'Erro ao carregar pastas';
        } finally {
          loading.value = false;
        }
      };
      const handlePhotoChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    // Cria um FileReader para ler a imagem
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      capturedPhoto.value = e.target.result; // Armazena a imagem em base64

      // Fazer o upload da imagem para o Firebase Storage
      const photoURL = await uploadImageToStorage(capturedPhoto.value);
      if (photoURL) {
        console.log('Imagem carregada com sucesso:', photoURL);
      }
    };
    
    reader.readAsDataURL(file); // Lê a imagem como Data URL
  }
};


      const submitReceived = async () => {
      if (selectedFolder.value) {
        const folderRef = doc(db, 'folders', selectedFolder.value.id);
        await updateDoc(folderRef, {
          received: true,
          receivedBy: 'user-id',  // Substitua pelo ID do usuário
          receivedAt: new Date()
        });
        alert('Recebido com sucesso!');
      }
    };

    const openIssueForm = () => {
      showIssueForm.value = true;
    };

    const capturePhoto = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoElement = document.createElement('video');
    videoElement.srcObject = mediaStream;

    // Aguardar o vídeo começar a reproduzir antes de capturar a imagem
    await videoElement.play();

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    capturedPhoto.value = canvas.toDataURL('image/png');  // Converte para base64
    
    // Parar a captura de vídeo
    mediaStream.getTracks().forEach(track => track.stop());
    
  } catch (error) {
    console.error('Erro ao acessar a câmera', error);
  }
};


const uploadImageToStorage = async (fileDataURL) => {
      try {
        const photoBlob = await (await fetch(fileDataURL)).blob();
        const storageReference = storageRef(storage, `issues/${Date.now()}-photo.png`);
        await uploadBytes(storageReference, photoBlob);
        const downloadURL = await getDownloadURL(storageReference);
        return downloadURL;
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        return null;
      }
    };

    const submitWithIssue = async () => {
  if (selectedFolder.value) {
    const folderRef = doc(db, 'folders', selectedFolder.value.id);
    let photoURL = null;

    // Verifica se uma foto foi capturada ou se a foto foi carregada
    if (capturedPhoto.value) {
      photoURL = await uploadImageToStorage(capturedPhoto.value); // Faz o upload da foto para o Firebase Storage
    }

    await updateDoc(folderRef, {
      received: true,
      receivedBy: user.value.uid, // Substitua pelo ID do usuário
      receivedAt: new Date(),
      issueDescription: issueDescription.value,
      issuePhoto: photoURL // URL da foto salva no Firebase Storage
    });
    alert('Recebido com apontamento enviado!');
  }
};


      const filteredFolders = computed(() => {
        if (!folderNameFilter.value) return folders.value;
        return folders.value.filter(folder => folder.name.toLowerCase().includes(folderNameFilter.value.toLowerCase()));
      });
  
      const loadFolderContent = async (folderId) => {
        if (!folderId) {
          selectedFolder.value = null;
          userChecklist.value = {};
          return;
        }
  
        const selectedFolderDoc = folders.value.find(folder => folder.id === folderId);
        if (selectedFolderDoc) {
          selectedFolder.value = selectedFolderDoc;
          await loadUserChecklist(selectedFolder.value.id);
        }
      };
  
      const loadUserChecklist = async (folderId) => {
        const folderRef = doc(db, 'folders', folderId);
        const folderSnapshot = await getDoc(folderRef);
        if (folderSnapshot.exists()) {
          const data = folderSnapshot.data();
          if (data.userChecklists && data.userChecklists[user.value.uid]) {
            userChecklist.value = data.userChecklists[user.value.uid];
          } else {
            userChecklist.value = {};
          }
        }
      };
  
      const updateUserChecklist = async (itemName) => {
        if (selectedFolder.value) {
          const folderRef = doc(db, 'folders', selectedFolder.value.id);
          const userId = user.value.uid;
          try {
            await updateDoc(folderRef, {
              [`userChecklists.${userId}.${itemName}`]: userChecklist.value[itemName]
            });
          } catch (err) {
            console.error('Erro ao atualizar checklist do usuário:', err);
          }
        }
      };
  
      const saveFolderNameFilter = async () => {
        if (user.value && folderNameFilter.value) {
          const userRef = doc(db, 'users', user.value.uid);
          try {
            await updateDoc(userRef, {
              folderNameFilter: folderNameFilter.value
            });
          } catch (err) {
            console.error('Erro ao salvar o nome da pasta:', err);
          }
        }
      };
  
      const loadFolderNameFilter = async () => {
        if (user.value) {
          const userRef = doc(db, 'users', user.value.uid);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            folderNameFilter.value = data.folderNameFilter || '';
          }
        }
      };
  
      const promptForCompanyChange = () => {
        // Verifica se o prompt já foi exibido
        if (!promptShown.value) {
          const changeCompany = confirm("Deseja mudar a empresa?");
          
          if (changeCompany) {
            const inputPassword = prompt("Digite a senha para continuar:");
  
            if (inputPassword === 'admin123') {
              isAdmin.value = true;  // Permissão concedida
            } else {
              alert("Senha incorreta.");
              isAdmin.value = false;
            }
          } else {
            isAdmin.value = false;
          }
          
          promptShown.value = true; // Marcar o prompt como exibido
        }
      };
  
      const signOut = async () => {
        await auth.signOut();
        router.push('/login');
      };
  
      return {
        user,
        selectedDate,
        selectedPeriod,
        selectedFolderId,
        folders,
        loading,
        error,
        selectedFolder,
        userChecklist,
        folderNameFilter,
        isAdmin,
        filteredFolders,
        loadFolders,
        loadFolderContent,
        updateUserChecklist,
        saveFolderNameFilter,
        loadFolderNameFilter,
        promptForCompanyChange,
        signOut,
        showIssueForm,
      issueDescription,
      capturedPhoto,
      submitReceived,
      openIssueForm,
      capturePhoto,
      handlePhotoChange,
      submitWithIssue,
      uploadImageToStorage,
      };
    }
  };
  </script>
  
  <style scoped>
  .main-page {
    padding: 20px;
    background: linear-gradient(135deg, #555759, #2c4d6f);
    color: #ffffff;
    min-height: 100vh;
  }
  
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    text-align: center;
    gap: 10px;
  }
  
  .title {
    color: #ffffff;
    font-size: 2em;
    margin-left: 10px;
    flex-grow: 1;
    text-align: left;
  }
  
  .user-email {
    color: #ffffff;
    font-size: 1.2em;
    margin-left: 10px;
    text-align: left;
  }
  
  .select-controls {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  
  .select-date,
  .select-period {
    width: 48%;
    font-size: 1.2em;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    z-index: 1001;
    text-align: center;
  }
  
  .folders-container {
    margin-top: 20px;
    width: 60%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .folder {
    border: 2px solid #ccc;
    border-radius: 10px;
    padding: 15px;
    background: #1c4b6f;
    margin-bottom: 20px;
  }
  
  .folder-title {
    font-size: 1.5em;
    margin-bottom: 10px;
  }
  
  .folder-details {
    font-size: 1.1em;
    margin: 5px 0;
  }
  
  .item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 1.2em;
  }
  
  .photo-section {
  margin-top: 10px;
}

.photo-section img {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}


  .item-checked {
    text-decoration: line-through;
  }
  
  .item-text {
    margin-left: 10px;
  }
  
  .user-checklist {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
  .issue-form textarea {
  width: 100%; /* Aumenta a largura para ocupar toda a área disponível */
  height: 150px; /* Aumenta a altura da caixa de texto */
  padding: 10px; /* Adiciona espaçamento interno */
  font-size: 1.1em; /* Ajusta o tamanho da fonte para uma melhor leitura */
  border: 1px solid #ccc; /* Estiliza a borda */
  border-radius: 5px; /* Bordas arredondadas */
  resize: vertical; /* Permite redimensionar verticalmente */
}
  
  .user-checklist span {
    margin-right: 5px;
  }
  .folder-filter input {
    width: 50%; /* Reduzindo a largura do input */
    padding: 8px 12px; /* Adicionando um pouco de padding */
    border: 1px solid #ccc; /* Borda suave */
    border-radius: 5px; /* Bordas arredondadas */
    transition: all 0.3s ease; /* Transição suave para os efeitos de foco */
    font-size: 1em; /* Tamanho da fonte */
}

.folder-filter input:focus {
    border-color: #2e72a4; /* Cor da borda ao focar */
    box-shadow: 0 0 5px rgba(46, 114, 164, 0.5); /* Sombra ao focar */
    outline: none; /* Remove a borda padrão do foco */
}

.folder-filter button {
    padding: 8px 12px;
    background-color: #2e72a4;
    color: white;
    border: none;
    border-radius: 5px; /* Bordas arredondadas para o botão */
    cursor: pointer;
    transition: background-color 0.3s; /* Transição suave para a cor de fundo */
}

.folder-filter button:hover {
    background-color: #3b87c3; /* Cor ao passar o mouse */
}

  
  .btn-primary {
    background-color: #2e72a4;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1em;
  }
  .logo {
height: 60px;
margin-bottom: 10px; /* Espaço abaixo do logo quando empilhado */
}
  
  /* Aumentar o tamanho das checkboxes */
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    transform: scale(1.5); /* Ajusta o valor para o tamanho desejado */
    margin-right: 10px; /* Espaço entre a checkbox e o texto */
  }
  
  /* Tornar a página responsiva para mobile */
  @media only screen and (max-width: 768px) {
    .main-page {
      padding: 10px;
    }
  
    .issue-form textarea {
    height: 200px; /* Aumenta a altura no mobile para mais conforto */
    font-size: 1em; /* Ajusta o tamanho da fonte no mobile */
  }
    .header {
      flex-direction: column;
      text-align: center;
    }
  
    .title {
      font-size: 1.5em;
      text-align: center;
    }
  
    .user-email {
      font-size: 1em;
      text-align: center;
      margin-bottom: 10px;
    }
  
    .select-controls {
      flex-direction: column;
      align-items: center;
    }
  
    .select-date,
    .select-period {
      width: 100%;
      font-size: 1em;
      margin-bottom: 15px;
    }
  
    .folders-container {
      width: 100%;
      margin: 0 auto;
    }
  
    .folder-filter input {
      width: 100%;
    }
  }
  </style>