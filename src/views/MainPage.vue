<template>
  <div class="main-page">
      <header class="header">
<img src="../assets/logo-ar-transportes.png" alt="AR Transportes" class="logo" />
<span class="title">Gestor de Expedição</span>
<span v-if="user">{{ user.email }}</span>
<button @click="signout" class="btn btn-danger">Sign Out</button>
<button @click="requestLogin" class="btn btn-info gestor-btn">Gestor</button>

</header>

    <section class="time-section">
      <span>Horário: {{ currentTime }}</span>
    </section>

    <section class="select-period">
      <h1>Selecione o Período:</h1>
      <div class="buttons">
        <button @click="selectPeriod('Manhã')" class="btn btn-primary">Manhã</button>
        <button @click="selectPeriod('Tarde')" class="btn btn-primary">Tarde</button>
        <button @click="selectPeriod('Noite')" class="btn btn-primary">Noite</button>
      </div>
    </section>

    <section class="select-date" v-if="selectedPeriod">
      <h2>Data:</h2>
      <input type="date" v-model="selectedDate" @change="loadFolders" class="form-control" />
    </section>

    <div v-if="selectedPeriod" class="folders-container">
      <h2>Período: {{ selectedPeriod }} </h2>



      
      <!-- Mostrar pastas -->
      <div v-for="folder in folders" :key="folder.id" 
     class="folder" 
     :class="{ 'completed': folder.completed, 'late-folder': folder.isLate }">
          
        <div class="folder-header" @click="toggleFolder(folder.id)">
          <h3 class="folder-name">
      {{ folder.name }} 
      <span v-if="folder.isLate">- Atrasado</span>
    </h3>
          <div class="folder-actions">
            <button v-if="isFolderOwner(folder)" @click.stop="deleteFolder(folder.id)" class="btn btn-danger btn-sm">
              <i class="bi bi-x"></i>
            </button>
            <button v-if="isFolderOwner(folder)" @click.stop="openEditFolderDialog(folder.id)" class="btn btn-warning btn-sm">
              <i class="bi bi-pencil"></i>
            </button>
            <button @click.stop="toggleAnnotations(folder.id)" class="btn btn-info1 btn-sm">
              <i class="bi bi-journal-text"></i>
              <span v-if="hasNewAnnotations(folder)" class="notification-dot"></span>
            </button>
          </div>
        </div>
        
        <ul v-if="folder.showItems">
          <li v-for="item in folder.items" :key="item.name" class="item">
            <input type="checkbox" class="large-checkbox" v-model="item.checked" @change="updateItem(folder.id)" :disabled="!isFolderOwner(folder)" />
            <span :class="{ 'item-checked': item.checked }">{{ item.name }} - {{ item.quantity }}</span>
            <div class="item-actions">
              <button v-if="isFolderOwner(folder)" @click="editItem(folder.id, item)" class="btn btn-warning btn-sm">
                <i class="bi bi-pencil"></i>
              </button>
              <button v-if="isFolderOwner(folder)" @click="deleteItem(folder.id, item)" class="btn btn-danger btn-sm">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </li>
        </ul>

        <button v-if="isFolderOwner(folder)" @click="addItem(folder.id)" class="btn btn-primary">Adicionar Item</button>
        <button v-if="isFolderOwner(folder) && !folder.completed" @click="markAsLate(folder.id)" class="btn btn-warning1">
  Atraso
</button>
<button v-if="isFolderOwner(folder) && folder.isLate" @click="cancelLate(folder.id)" class="btn btn-secondary">
  Cancelar Atraso
</button>


<button v-if="isFolderOwner(folder)" @click="completeFolder(folder.id)" class="btn btn-success">
  Enviar
</button>

        <button v-if="isFolderOwner(folder) && folder.completed" @click="cancelCompletion(folder.id)" class="btn btn-danger1">Cancelar Envio</button>

        
        <div v-if="folder.completed" class="completed-info">
          Concluído em: {{ folder.completedAt }}
          <p v-if="folder.delayInMinutes">Houve atraso de: {{ folder.delayInMinutes }} minutos</p>
        </div>

        <div v-if="folder.isLate" class="late-info">
    Atrasado em: {{ calculateDelay(folder.lateAt) }} minutos.
  </div>

        <!-- Seção de Anotações -->
        <div v-if="folder.showAnnotations" class="annotations-section">
          <h4>Anotações</h4>
          <div class="annotations-list">
            <div v-for="annotation in folder.annotations" :key="annotation.id" class="annotation">
              <p>{{ annotation.text }} <strong>{{ annotation.userName }}</strong></p>
              <button v-if="isFolderOwner(folder)" @click="deleteAnnotation(folder.id, annotation.id)" class="btn btn-danger btn-sm">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
          <textarea v-model="newAnnotation" placeholder="Digite sua anotação..." class="form-control"></textarea>
          <button @click="addAnnotation(folder.id)" class="btn btn-secondary">Adicionar Anotação</button>
        </div>
      </div>

      <button @click="createFolder" class="btn btn-success">Criar Pasta</button>
    <button @click="copyFolders" class="btn btn-info">Copiar Pastas</button>
    <button @click="pasteFolders" class="btn btn-info">Colar Pastas</button>
      
  

      
      <button @click="openConfigModal" class="btn btn-info">Configurar Pasta Padrão</button>
      <button @click="createFolderFromDefault" class="btn btn-info">Criar Pasta com Configuração Padrão</button>
      <button @click="generateReport" class="btn btn-primary">Gerar Relatório</button>
    </div>

    <!-- Modal de Configuração da Pasta Padrão -->
    <div v-if="showConfigModal" class="modal">
      <div class="modal-content">
        <h2>Configurar Pasta Padrão</h2>
        <select v-model="selectedDefaultFolderConfig" class="form-control" @change="loadSelectedDefaultFolder">
          <option v-for="(config, index) in defaultFolderConfigs" :key="index" :value="config">
            {{ config.name }}
          </option>
        </select>

        <div class="default-folder-config">
          <input v-model="defaultFolderName" placeholder="Nome da Pasta" class="form-control" />
          <button @click="removeDefaultFolder" class="btn btn-danger btn-sm remove-btn">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <div v-for="(item, index) in defaultItems" :key="index" class="default-item">
          <input v-model="item.name" placeholder="Nome do Item" class="form-control" />
          <input v-model="item.quantity" placeholder="Quantidade" class="form-control" />
          <button @click="removeItem(index)" class="btn btn-danger btn-sm">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <button @click="addDefaultItem" class="btn btn-primary">Adicionar Item</button>
        <button @click="saveDefaultFolder" class="btn btn-success">Salvar Configuração</button>
        <button @click="showConfigModal = false" class="btn btn-secondary">Fechar</button>
      </div>
  

  
    </div>
    
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { auth, db } from '../firebase/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';


export default {



  setup() {
    const user = ref(null);
    const selectedPeriod = ref(null);
    const selectedDate = ref(new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-'));
    const copiedFolders = ref([]); // Para armazenar pastas copiadas
    const folders = ref([]);
    const currentTime = ref(new Date().toLocaleTimeString('pt-BR'));
    const router = useRouter();
    const showConfigModal = ref(false);
    const defaultFolderName = ref('');
    const defaultItems = ref([{ name: 'Item 1', quantity: '1' }, { name: 'Item 2', quantity: '2' }]);
    const selectedDefaultFolderConfig = ref(null);
    const defaultFolderConfigs = ref([]);
    const newAnnotation = ref('');
    // Intervalo para calcular o atraso em tempo real




    

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          user.value = currentUser;
          loadFolders();
          loadDefaultFolderConfigs();
        } else {
          router.push('/login');
        }
      });

      setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString('pt-BR');
      }, 1000);
    });

    function requestLogin() {
      const username = prompt("Digite o username:");
      const password = prompt("Digite a senha:");

      if (username === 'admin' && password === 'admin') {
        this.goToGestor();
      } else {
        alert("Credenciais inválidas. Tente novamente.");
      }
    }

    function goToGestor() {
      router.push('/gestor-page');
    }
    
    async function generateReport() {
  const reportData = {
    date: selectedDate.value,
    period: selectedPeriod.value,
    createdAt: new Date(),
    status: 'open',
    folders: []
  };

  try {
    const reportRef = await addDoc(collection(db, 'reports'), reportData);
    console.log('Relatório gerado com sucesso:', reportRef.id);

    const folderPromises = folders.value.map(async (folder) => {
      const incompleteItems = folder.items.filter(item => !item.checked);

      const folderData = {
        name: folder.name,
        completedAt: folder.completedAt || null,
        delayInMinutes: folder.delayInMinutes || 0,
        isLate: folder.isLate || false,
        isCompleted: folder.completedAt ? true : false,
        createdAt: new Date(),
        status: 'open',
        incompleteItems: incompleteItems.map(item => ({ name: item.name, quantity: item.quantity }))
      };

      await addDoc(collection(db, 'reports', reportRef.id, 'folders'), folderData);
    });

    await Promise.all(folderPromises);
    alert('Relatório e pastas gerados com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
  }
}


    

    function selectPeriod(period) {
      selectedPeriod.value = period;
      loadFolders();
    }


    function cancelCompletion(folderId) {
  const confirmation = confirm("Tem certeza de que deseja cancelar a conclusão?");

  if (confirmation) {
    const folderRef = doc(db, 'folders', folderId);
    const folder = folders.value.find(f => f.id === folderId);

    folder.completed = false;
    folder.completedAt = null;

    updateDoc(folderRef, { completed: folder.completed, completedAt: folder.completedAt });
    alert("A conclusão foi cancelada.");
  } else {
    alert("Ação cancelada.");
  }
}
function completeFolder(folderId) {
   const folderRef = doc(db, 'folders', folderId);
   const folder = folders.value.find(f => f.id === folderId);

   if (folder.completed) return;

   clearInterval(folder.delayInterval); // Para o cálculo do atraso da pasta específica
   folder.isLateActive = false;

   folder.completed = true;
   folder.completedAt = new Date().toLocaleString('pt-BR');
   folder.completedTime = new Date();

   // Aqui mantém o valor final de delayInMinutes ao marcar como concluído
   folder.delayInMinutes = folder.delayInMinutes || 0;

   updateDoc(folderRef, {
      completed: folder.completed,
      completedAt: folder.completedAt,
      completedTime: folder.completedTime,
      delayInMinutes: folder.delayInMinutes
   }).then(() => {
      console.log('Pasta concluída:', folder.name);
   });
}


  


  function createFolder() {
      
const folderName = prompt('Nome da pasta:');
if (!folderName || !user.value) return;

addDoc(collection(db, 'folders'), {
  userId: user.value.uid,
  name: folderName,
  items: [],
  annotations: [],
  completed: false,
  completedAt: null,
  createdAt: new Date(),
  period: selectedPeriod.value,
  date: selectedDate.value,
  showItems: false,
  showAnnotations: false
});

}

    function createDefaultFolder() {
      if (!user.value) return;
      addDoc(collection(db, 'folders'), {
        userId: user.value.uid,
        name: defaultFolderName.value,
        items: defaultItems.value,
        annotations: [],
        completed: false,
        completedAt: null,
        createdAt: new Date(),
        period: selectedPeriod.value,
        date: selectedDate.value,
        showItems: false,
        showAnnotations: false
      });
    }

    function isFolderOwner(folder) {
      return folder.userId === user.value.uid;
    }

    function addItem(folderId) {
const itemName = prompt('Nome do item:');
if (!itemName) return;

const itemQuantity = prompt('Quantidade do item:');
if (itemQuantity === null) return; // Permite cancelamento

const folderRef = doc(db, 'folders', folderId);
const folder = folders.value.find(f => f.id === folderId);

folder.items.push({ name: itemName, quantity: itemQuantity, checked: false });
updateDoc(folderRef, { items: folder.items });
}


function updateItem(folderId) {
const folderRef = doc(db, 'folders', folderId);
const folder = folders.value.find(f => f.id === folderId);

// Verificar se todos os itens estão selecionados
const allChecked = folder.items.every(item => item.checked);

if (allChecked && !folder.completed) {
  // Se todos os itens estão selecionados e a pasta não está completa, concluir a pasta
  //folder.completed1 = true;
  //folder.completedAt = new Date().toLocaleString('pt-BR');
} else if (!allChecked && folder.completed) {
  // Se nem todos os itens estão selecionados e a pasta está completa, marcar como não completa
  folder.completed = false;
  folder.completedAt = null;
}



updateDoc(folderRef, { items: folder.items, completed: folder.completed, completedAt: folder.completedAt });
}



    function editItem(folderId, item) {
      const itemName = prompt('Novo nome do item:', item.name);
      const quantity = prompt('Nova quantidade:', item.quantity);

      if (itemName && quantity) {
        item.name = itemName;
        item.quantity = quantity;
        updateItem(folderId);
      }
    }

    function deleteItem(folderId, item) {
      const folderRef = doc(db, 'folders', folderId);
      const folder = folders.value.find(f => f.id === folderId);

      folder.items = folder.items.filter(i => i !== item);
      updateDoc(folderRef, { items: folder.items });
    }

    function toggleFolder(folderId) {
      const folderRef = doc(db, 'folders', folderId);
      const folder = folders.value.find(f => f.id === folderId);

      updateDoc(folderRef, { showItems: !folder.showItems });
    }

    function toggleAnnotations(folderId) {
      const folderRef = doc(db, 'folders', folderId);
      const folder = folders.value.find(f => f.id === folderId);

      updateDoc(folderRef, { showAnnotations: !folder.showAnnotations });
    }

    function deleteFolder(folderId) {
      deleteDoc(doc(db, 'folders', folderId));
    }

    function loadFolders() {
  if (!user.value) return;

  const foldersQuery = collection(db, 'folders');
  onSnapshot(foldersQuery, (snapshot) => {
    folders.value = snapshot.docs
      .filter(doc => doc.data().period === selectedPeriod.value &&
                     doc.data().date === selectedDate.value)
      .map(doc => ({
        ...doc.data(),
        id: doc.id,
        isLate: doc.data().isLate || false, // Verifica se a pasta já está marcada como atrasada
        delayInMinutes: doc.data().delayInMinutes || 0, // Valor inicial do atraso
        delayInterval: null // Armazenar o intervalo de atraso de cada pasta
      }))
      .sort((a, b) => {
        const nameA = a.name.replace(/Rota\s*(\d+)(?:\.(\d+))?/, (_, numA, subNumA) => {
          return `${parseInt(numA)}.${subNumA ? parseInt(subNumA) : 0}`;
        });
        const nameB = b.name.replace(/Rota\s*(\d+)(?:\.(\d+))?/, (_, numB, subNumB) => {
          return `${parseInt(numB)}.${subNumB ? parseInt(subNumB) : 0}`;
        });

        return nameA.localeCompare(nameB, undefined, { numeric: true });
      });

    // Iniciar cálculo de atraso para pastas que já estão atrasadas
    folders.value.forEach(folder => {
      if (folder.isLate && !folder.completed) {
        const [lateHour, lateMinute] = folder.lateAt.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(lateHour, lateMinute, 0);

        folder.delayInterval = setInterval(() => {
          const now = new Date();
          const delayMs = now - scheduledTime;
          folder.delayInMinutes = Math.floor(delayMs / (1000 * 60)); // Calcula o atraso em minutos
        }, 1000); // Atualiza a cada segundo
      }
    });
  });
}

    function saveFolderOrder() {
    // Salvando a nova ordem das pastas
    folders.value.forEach((folder, index) => {
      const folderRef = doc(db, 'folders', folder.id);
      updateDoc(folderRef, { order: index });
    });
  }

  function markAsLate(folderId) {
  const folderRef = doc(db, 'folders', folderId);
  const folder = folders.value.find(f => f.id === folderId);

  if (!folder.completed) {
    const lateAt = prompt('Digite o horário de saída (HH:MM):');
    if (lateAt) {
      folder.isLate = true;
      folder.lateAt = lateAt;
      folder.isLateActive = true; // Para controle de tempo real

      const [lateHour, lateMinute] = lateAt.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(lateHour, lateMinute, 0);

      // Limpa qualquer cálculo de atraso pré-existente
      clearInterval(folder.delayInterval);

      // Calcula o atraso em tempo real para esta pasta
      folder.delayInterval = setInterval(() => {
        const now = new Date();
        const delayMs = now - scheduledTime;
        folder.delayInMinutes = Math.floor(delayMs / (1000 * 60)); // Calcula o atraso em minutos
      }, 1000); // Atualiza a cada segundo

      updateDoc(folderRef, { isLate: true, lateAt, delayInMinutes: folder.delayInMinutes });
    }
  }
}

function cancelLate(folderId) {
   const folderRef = doc(db, 'folders', folderId);
   const folder = folders.value.find(f => f.id === folderId);

   folder.isLate = false;
   folder.lateAt = null;
   clearInterval(folder.delayInterval); // Para o cálculo em tempo real

   // Manter o valor de delayInMinutes atual
   updateDoc(folderRef, { isLate: false, lateAt: null, delayInMinutes: folder.delayInMinutes });
}



function calculateDelay(lateAt) {
    if (!lateAt) return '0';
    const [lateHour, lateMinute] = lateAt.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(lateHour, lateMinute, 0);

    const delayMs = now - scheduledTime;
    const delayMinutes = Math.floor(delayMs / (1000 * 60));
    return delayMinutes;
}





function copyFolders() {
  // Verifica se todas as pastas têm a propriedade 'order'
  folders.value.forEach((folder, index) => {
    if (typeof folder.order === 'undefined') {
      folder.order = index; // Atribui a ordem com base no índice se estiver indefinida
    }
  });

  // Copiar pastas mantendo a ordem
  copiedFolders.value = JSON.parse(JSON.stringify(folders.value)).map(folder => {
    // Redefinir o estado da pasta
    folder.completed = false;
    folder.completedAt = null;
    folder.isLate = false;
    folder.lateAt = null;
    folder.delayInMinutes = 0;

    // Redefinir o estado dos itens (remover 'checked')
    folder.items = folder.items.map(item => ({
      ...item,
      checked: false // Redefine o status de 'checked' para falso
    }));

    folder.annotations = [];

    // Remover as propriedades que não devem ser copiadas
    delete folder.received;
    delete folder.receivedAt;
    delete folder.receivedBy;
    delete folder.issueDescription;
    delete folder.issuePhoto;

    return folder;
  });

  // Ordena as pastas copiadas pela ordem para manter a sequência correta
  copiedFolders.value.sort((a, b) => a.order - b.order);

  alert('Pastas copiadas com sucesso!');
}



async function pasteFolders() {
  if (!copiedFolders.value.length) {
    alert('Nenhuma pasta copiada!');
    return;
  }

  // Ordena as pastas copiadas antes de colar pela ordem
  copiedFolders.value.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

  // Colar as pastas uma por vez em ordem
  for (const folder of copiedFolders.value) {
    try {
      await addDoc(collection(db, 'folders'), {
        ...folder,
        userId: user.value.uid, // Define o novo usuário como o "criador" das pastas coladas
        date: selectedDate.value, // Atualiza a data para a nova data selecionada
        createdAt: new Date(),     // Define uma nova data de criação
        order: folder.order        // Mantém a ordem copiada
      });
    } catch (error) {
      console.error('Erro ao colar a pasta:', folder.name, error);
    }
  }

  alert('Pastas coladas com sucesso!');
}




    function openConfigModal() {
      showConfigModal.value = true;
    }

    function saveDefaultFolder() {
  const configName = prompt('Nome da Configuração:');
  if (!configName) return;

  // Adiciona a nova configuração à lista de configurações padrão
  defaultFolderConfigs.value.push({
    name: configName,
    folderName: defaultFolderName.value,
    items: JSON.parse(JSON.stringify(defaultItems.value))
  });

  // Salva a configuração no Firestore em um documento global
  setDoc(doc(db, 'defaultFolderConfigs', 'globalDefaultFolderConfigs'), {
    configs: defaultFolderConfigs.value
  }, { merge: true }); // Usamos merge para não sobrescrever configurações existentes
}

    function openEditFolderDialog(folderId) {
    const newName = prompt('Novo nome da pasta:', folders.value.find(f => f.id === folderId).name);
    if (newName) {
      updateDoc(doc(db, 'folders', folderId), {
        name: newName
      });
    }
  }


  function loadDefaultFolderConfigs() {
  // Não há necessidade de verificar o usuário aqui, já que estamos carregando configs globais
  getDoc(doc(db, 'defaultFolderConfigs', 'globalDefaultFolderConfigs')).then((doc) => {
    if (doc.exists()) {
      defaultFolderConfigs.value = doc.data().configs;
    }
  });
}



    function loadSelectedDefaultFolder() {
      if (!selectedDefaultFolderConfig.value) return;
      defaultFolderName.value = selectedDefaultFolderConfig.value.folderName;
      defaultItems.value = JSON.parse(JSON.stringify(selectedDefaultFolderConfig.value.items));
    }

    function createFolderFromDefault() {
      if (!selectedDefaultFolderConfig.value) {
        alert('Por favor, selecione uma configuração padrão.');
        return;
      }

      addDoc(collection(db, 'folders'), {
        userId: user.value.uid,
        name: selectedDefaultFolderConfig.value.folderName,
        items: selectedDefaultFolderConfig.value.items,
        annotations: [],
        completed: false,
        completedAt: null,
        createdAt: new Date(),
        period: selectedPeriod.value,
        date: selectedDate.value,
        showItems: false, // Manter o estado de visibilidade
        showAnnotations: false,
        order: folders.value.length // Define 'order' com base no número de pastas
      });
    }

    function addDefaultItem() {
      defaultItems.value.push({ name: '', quantity: '' });
    }

    function removeItem(index) {
      defaultItems.value.splice(index, 1);
    }

    function removeDefaultFolder() {
  // Verifica se há uma configuração selecionada
  if (!selectedDefaultFolderConfig.value) return;

  // Encontra o índice da configuração selecionada
  const configIndex = defaultFolderConfigs.value.findIndex(
    (config) => config.name === selectedDefaultFolderConfig.value.name
  );

  if (configIndex !== -1) {
    // Remove a configuração da lista
    defaultFolderConfigs.value.splice(configIndex, 1);

    // Atualiza o documento global no Firestore com a nova lista de configurações
    setDoc(doc(db, 'defaultFolderConfigs', 'globalDefaultFolderConfigs'), {
      configs: defaultFolderConfigs.value
    }, { merge: true }) // Merge para garantir que o restante do documento não seja sobrescrito
    .then(() => {
      // Limpa a configuração selecionada após a remoção
      selectedDefaultFolderConfig.value = null;
      defaultFolderName.value = '';
      defaultItems.value = [];
      alert('Configuração removida com sucesso.');
    })
    .catch((error) => {
      console.error('Erro ao remover a configuração:', error);
      alert('Falha ao remover a configuração.');
    });
  }
}


    function addAnnotation(folderId) {
  if (!newAnnotation.value) return;

  const folderRef = doc(db, 'folders', folderId);
  const folder = folders.value.find(f => f.id === folderId);
  
  if (!folder.annotations) folder.annotations = [];

  folder.annotations.push({
      id: Date.now(),
      userId: user.value.uid,
      text: newAnnotation.value,
      userName: user.value.email // Adiciona o nome do usuário
  });

  updateDoc(folderRef, { annotations: folder.annotations });
  newAnnotation.value = '';
}




    function deleteAnnotation(folderId, annotationId) {
      const folderRef = doc(db, 'folders', folderId);
      const folder = folders.value.find(f => f.id === folderId);

      folder.annotations = folder.annotations.filter(a => a.id !== annotationId);
      updateDoc(folderRef, { annotations: folder.annotations });
    }

    function hasNewAnnotations(folder) {
      return folder.annotations && folder.annotations.some(a => !a.seen);
    }

    function signout() {
      signOut(auth).then(() => {
        router.push('/login');
      });
    }

    return {
      user,
      selectedPeriod,
      selectedDate,
      folders,
      currentTime,
      showConfigModal,
      defaultFolderName,
      defaultItems,
      selectedDefaultFolderConfig,
      defaultFolderConfigs,
      newAnnotation,
      selectPeriod,
      createFolder,
      createDefaultFolder,
      addItem,
      updateItem,
      editItem,
      deleteItem,
      toggleFolder,
      toggleAnnotations,
      deleteFolder,
      loadFolders,
      openConfigModal,
      saveDefaultFolder,
      loadDefaultFolderConfigs,
      loadSelectedDefaultFolder,
      createFolderFromDefault,
      addDefaultItem,
      removeItem,
      removeDefaultFolder,
      addAnnotation,
      deleteAnnotation,
      hasNewAnnotations,
      isFolderOwner,
      openEditFolderDialog,
      completeFolder,
      cancelCompletion,
      saveFolderOrder,
      copyFolders,
      pasteFolders,
      markAsLate,
      cancelLate,
      calculateDelay,
      signout,
      goToGestor,
      generateReport,
      requestLogin
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
flex-wrap: wrap; /* Permite que os itens se reposicionem em tela menor */
text-align: center; /* Centraliza o conteúdo quando empilhado */
gap: 10px; /* Espaçamento entre os itens */
}

.logo {
height: 60px;
margin-bottom: 10px; /* Espaço abaixo do logo quando empilhado */
}

.title {
color: #ffffff; /* Define a cor do texto como branco */
font-size: 1.5em; /* Ajusta o tamanho do texto conforme necessário */
margin-left: 10px; /* Espaço entre o ícone e o título */
flex-grow: 1; /* Permite que o título ocupe o espaço disponível */
text-align: left; /* Alinha o texto à esquerda */
}


.time-section {
  margin-top: 20px;
  font-size: 1.5em;
}

.select-period,
.select-date {
  margin-top: 20px;
  text-align: center;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
}

.folders-container {
  margin-top: 20px;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
}

.folder {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: #1c4b6f;
}

.late-folder {
  background-color: rgb(255, 166, 0); /* Altere a cor conforme necessário */
}

.late-info {
  color: red;
}

.folder.completed {
  background-color: #1d901d;
}

.folder.completed1 {
  background-color: #FFA500; /* Laranja claro */
}

.folder.green {
background-color: #32CD32; /* Verde claro */
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.folder-actions {
  display: flex;
  gap: 5px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-text {
  flex-grow: 1;
  margin-left: 10px;
  font-size: 18px; /* Ajuste o tamanho da fonte conforme necessário */
  overflow-wrap: break-word; /* Permite que palavras longas quebrem */
  word-break: break-all; /* Quebra palavras longas */
  white-space: normal; /* Permite quebras de linha normais */
  max-width: 100%; /* Garante que o texto não exceda a largura do contêiner */
}



.item-actions {
  display: flex;
  gap: 5px;
}

.annotations-section {
  margin-top: 10px;
  background: #294c73;
  border-radius: 10px;
  padding: 10px;
}

.annotation {
background: #3a5d84;
padding: 5px;
border-radius: 5px;
margin-bottom: 5px;
max-height: 100px; /* Define a altura máxima para o contêiner */
overflow-y: auto; /* Adiciona uma barra de rolagem vertical se o texto exceder a altura */
word-wrap: break-word; /* Permite que palavras longas quebrem para a próxima linha */
box-sizing: border-box; /* Inclui padding e bordas nas dimensões totais do contêiner */
}

.annotation p {
font-size: 14px; /* Ajuste o tamanho da fonte conforme necessário */
margin: 0; /* Remove margens adicionais que podem afetar o layout */
}


.btn-primary {
  background-color: #2e72a4;
  border: none;
  margin-left: 3px;  /* Espaço à esquerda */
  margin-right: 3px;

}

.gestor-btn {
  background-color: #4c6278;
  border: none;
  margin-left: 10px;
  margin-bottom: 15px;
}

.btn-secondary {
  background-color: #5a738e;
  border: none;
}

.btn-info {
  background-color: #4c6278;
  border: none;
  margin-left: 3px;  /* Espaço à esquerda */
  margin-right: 3px;
  margin-top: 4px;
  margin-right: 4px;
}

.btn-info1 {
  background-color: #4c6278;
  border: none;
  margin-bottom: 9px;
  padding: 10px 12px;
  font-size: 15px;
  
}

.btn-info1:hover {
  background-color: #4c6278; /* Mantenha a mesma cor no hover */
  opacity: 1; /* Evita a transparência */
}

.btn-danger {
  background-color: #e57373;
  border: none;
  margin-bottom: 8px;
  padding: 8px 12px;
  font-size: 14px;
}



.btn-danger1:hover {
  background-color: #e57373; /* Mantenha a mesma cor no hover */
  opacity: 1; /* Evita a transparência */
}

.btn-danger1 {
  background-color: #e57373;
  border: none;
  margin-left: 3px;
  margin-right: 3px;
  
}

.btn-warning {
  background-color: #ffb74d;
  border: none;
  margin-bottom: 8px;
  padding: 8px 12px;
  font-size: 14px;
}

.btn-warning1 {
  background-color: #ffb74d;
  border: none;
  margin-left: 6px;  /* Espaço à esquerda */
  margin-right: 6px;
  
}

.completed-info {
  font-style: italic;
  font-size: 0.9em;
  color: #ffeb3b;
}

.btn-success {
background-color: #4caf50; /* Verde para "Enviar" */
border: none;
margin-left: 3px;  /* Espaço à esquerda */
margin-right: 3px;

}



.btn-success:disabled {
background-color: #a5d6a7;
 /* Verde claro quando desativado */
}



.btn-danger:disabled {
background-color: #ef9a9a; /* Vermelho claro quando desativado */
}

.btn-danger1:disabled {
background-color: #ef9a9a; /* Vermelho claro quando desativado */
}


.notification-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: red;
  margin-left: 5px;
}

/* Estilo para aumentar o tamanho do checkbox */
input[type="checkbox"] {
transform: scale(1.8); /* Ajuste o valor para aumentar ou diminuir o tamanho */
margin-right: 10px; /* Ajuste o espaço entre o checkbox e o texto, se necessário */
}


/* Estilo para checkboxes maiores */
.large-checkbox {
transform: scale(2.0); /* Ajuste conforme necessário */
margin-right: 10px; /* Ajuste o espaço entre o checkbox e o texto */
}


.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
}

.default-item,
.default-folder-config {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Adiciona estilo de texto riscado quando o checkbox está marcado */
.item-checked {
text-decoration: line-through;
}


.remove-btn {
  margin-top: 10px;
}

@media (max-width: 768px) {
.header {
  flex-direction: row; /* Manter o logo e o e-mail/sign-out alinhados horizontalmente */
  justify-content: center; /* Centraliza o conteúdo horizontalmente */
  /* Alinha o texto à esquerda */
  padding: 10px; /* Adiciona algum padding */
  gap: 10px;
  text-align: center;
}

.logo {
  height: 60px; /* Reduz o tamanho do logo */
}

.header span {
  font-size: 0.9em; /* Diminui o tamanho do e-mail */
  margin-right: 10px; /* Adiciona espaço entre o e-mail e o botão de sign-out */
}

.header .btn-danger {
  font-size: 0.8em; /* Diminui o tamanho do botão de sign-out */
}

.time-section {
  font-size: 1em; /* Diminui o tamanho do horário */
  margin-top: 10px; /* Reduz o espaçamento superior */
}

.select-period,
.select-date {
  width: 90%; /* Reduz a largura para ajustar melhor na tela */
  margin-left: auto;
  margin-right: auto;
}

.select-period h1,
.select-date h2 {
  font-size: 1.2em; /* Diminui o tamanho dos títulos */
}

.buttons button {
  font-size: 0.8em; /* Diminui o tamanho dos botões */
  padding: 8px 12px; /* Ajusta o padding dos botões */
}

.folders-container {
  width: 90%; /* Reduz a largura para ajustar melhor na tela */
  margin-left: auto;
  margin-right: auto;
}
}

</style>
