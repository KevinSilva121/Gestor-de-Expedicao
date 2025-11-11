<template>
  <div class="gestor-page">
    <header class="header">
      <img src="../assets/logo-ar-transportes.png" alt="AR Transportes" class="logo" />
      <span class="title">Relatório Diário do Gestor</span>
      <button @click="goBack" class="btn btn-secondary">Voltar</button>
    </header>

    <section class="report-section">
      <h1>Relatórios Diários</h1>

      <div class="tab-selector">
        <button @click="selectedTab = 'expedicao'" :class="{ active: selectedTab === 'expedicao' }">Expedição</button>
        <button @click="selectedTab = 'recebimento'" :class="{ active: selectedTab === 'recebimento' }">Recebimento</button>
      </div>

     

      
      <div v-if="selectedTab === 'expedicao'">
        <div class="date-selector">
        <label for="dateInput">Selecionar Data:</label>
        <input type="date" id="dateInput" v-model="selectedDate" @change="refreshReports" />
      </div>
      <div v-if="filteredReports.length === 0">Nenhum relatório encontrado para a data selecionada.</div>

      <div class="toggle-delay-lack">
        <button @click="isViewingDelays = !isViewingDelays" class="btn btn-primary">
          {{ isViewingDelays ? 'Ver Faltas' : 'Ver Atrasos' }}
        </button>
      </div>

      <div v-if="isViewingDelays">
          <!-- Exibe Atrasos -->
          <div class="summary">
            <h2>Total de Atrasos do Dia: {{ totalDelayToday }} minutos</h2>
            
            <h2>Total de Atrasos do Mês: {{  totalDelayMonthFormatted }} </h2>
          </div>
        </div>

        <div v-else>
          <!-- Exibe Faltas -->
          <div class="summary">
            <h2>Total de Itens Faltantes do Dia: {{ totalMissingToday }}</h2>
           
            <h2>Total de Itens Faltantes do Mês: {{ totalMissingMonth }}</h2>
          </div>
        </div>


        <div v-for="(report) in sortedReports" :key="report.id" class="report-date">
          <h2>Data: {{ formatDate(report.date) }} - Período: {{ report.period }}</h2>
          <button @click="toggleFolder(report)" class="btn btn-primary">
            {{ report.open ? 'Fechar' : 'Abrir' }} Relatório
          </button>

          <div v-if="report.open">
            <div v-for="(folder) in sortFolders(report.folders)" :key="folder.id" class="folder-container">
              <h3 class="folder-title">{{ folder.name }}
                <span v-if="folder.isCompleted" class="completed-time">Concluída em: {{ formatCompletedDate(folder.completedAt) }}</span>
                <span v-else class="not-completed"> - Não Concluída</span>
              </h3>
              <span v-if="folder.isLate" class="late">Atraso: {{ folder.delayInMinutes }} minutos</span>
              <span v-else class="on-time">Atraso: {{ folder.delayInMinutes }} minutos</span>

              <div v-if="folder.incompleteItems && folder.incompleteItems.length > 0" class="missing-items-folder">
                <h4>Itens faltantes:</h4>
                <ul>
                  <li v-for="(item, itemIndex) in folder.incompleteItems" :key="itemIndex">{{ item.name }} - Quantidade: {{ item.quantity }}</li>
                </ul>
              </div>

              <div v-else-if="!folder.isCompleted" class="missing-items-folder">
                <h4>Não está faltando nenhum item.</h4>
              </div>
            </div>
          </div>

          <h3>Total de Atrasos no Dia: {{ calculateTotalDelay(report.folders) }} minutos</h3>
          <button @click="deleteReport(report.id)" class="btn btn-danger">Excluir Relatório</button>
        </div>
      </div>

      <div v-if="selectedTab === 'recebimento'">
  
   <!-- Seletor de Data -->
   <div class="date-selector">
        <label for="dateInput">Selecionar Data:</label>
        <input type="date" id="dateInput" v-model="selectedDate" @change="filterByDate" />
      </div>
  <div v-if="filteredReceivingFolders.length === 0">Nenhuma pasta encontrada para a data selecionada.</div>
  <div class="select-period">
          <label for="periodSelector">Selecione um período:</label>
          <select v-model="selectedPeriod" @change="filterByDate">
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
        </div>


        <div class="summary">
  <h2>Total de Recebimentos com Apontamento Hoje: {{ totalReceivingWithRemarkToday }}</h2>
  <h2>Total de Recebimentos com Apontamento no Mês: {{ totalReceivingWithRemarkMonth }}</h2>
</div>

  <div v-if="filteredReceivingFolders.length > 0">
  <h2>Pastas de Recebimento</h2>
  <div v-for="(folder) in sortReceivingFolders(filteredReceivingFolders)" :key="folder.id" class="folder-container">
    <h3 class="folder-title" @click="toggleFolder1(folder)">
      {{ folder.name }}
      
    </h3>

    <!-- Exibir completedAt acima da imagem -->
    <div v-if="folder.completedAt">
      <span v-if="folder.received" class="received-time">Recebida em: {{ formatCompletedDate1(folder.receivedAt) }}</span>
      <span v-else class="not-received">Não recebida</span>
      <p>Concluída em: {{ formatCompletedDate(folder.completedAt) }}</p>
      <p class="received-with-remark" v-if="folder.issuePhoto || folder.issueDescription" style="color: orange;">
          Recebido com apontamento
        </p>
    </div>

    <!-- Detalhes da pasta -->
    <div v-if="folder.open">
      <div v-if="folder.issueDescription && folder.issuePhoto" class="folder-content">
        <div v-if="folder.issuePhoto" class="issue-photo" @click="openImageModal(folder.issuePhoto)">
  <img :src="folder.issuePhoto" alt="Foto do Problema" class="issue-photo-img" />
</div>
        <div class="issue-description">
          <p><strong>Apontamento:</strong> {{ folder.issueDescription }}</p>
        </div>
        <!-- Condição para mostrar 'Recebido com Apontamento' -->
        
      </div>

      <!-- Caso não tenha descrição e nem imagem -->
      <div v-else>
        <p>{{ folder.received ? 'Recebido' : 'Não recebido' }}</p>
      </div>

      
    </div>
  </div>
</div>
</div>
    </section>
    <div v-if="isImageModalOpen" class="modal" @click="closeImageModal">
  <div class="modal-content" @click.stop>
    <span class="close" @click="closeImageModal">&times;</span>
    <img :src="currentImage" alt="Imagem em Grande" class="modal-image" />
  </div>
</div>
  </div>
</template>

<script>
import { db } from '../firebase/firebase.js';
import { doc, deleteDoc } from 'firebase/firestore';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

export default {
  data() {
    return {
      receivingFolders: [],
      reports: [], // Armazena os relatórios carregados
      filteredReceivingFolders: [],
      selectedDate: new Date().toISOString().split('T')[0], // Data selecionada, padrão é hoje
      selectedTab: 'expedicao', // Aba selecionada, padrão é Expedição
      selectedPeriod: 'manha', // Período selecionado, padrão é Manhã
      isImageModalOpen: false, // Para controlar a exibição do modal
      currentImage: '', // Para armazenar a URL da imagem atual
      reportFoldersOpenState: {}, // Para armazenar o estado de cada relatório
      receivingFoldersOpenState: {},
      isViewingDelays: true, // Para armazenar o estado de cada pasta de recebimento
    };
  },
  computed: {
    
  // Contador diário de recebimentos com apontamento
  totalReceivingWithRemarkToday() {
    return this.filteredReceivingFolders.reduce((total, folder) => {
      return folder.issueDescription || folder.issuePhoto ? total + 1 : total;
    }, 0);
  },
  
  // Contador mensal de pastas com apontamento
  totalReceivingWithRemarkMonth() {
    const selectedDate = new Date(this.selectedDate);
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1); // Início do mês
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0); // Fim do mês

    return this.receivingFolders.reduce((total, folder) => {
      const folderDate = new Date(folder.date);
      if (
        folderDate >= monthStart &&
        folderDate <= monthEnd &&
        (folder.issueDescription || folder.issuePhoto)
      ) {
        return total + 1;
      }
      return total;
    }, 0);
  
  },
    filteredReports() {
      return this.reports.filter(report => report.date === this.selectedDate);
    },
    sortedReports() {
      return [...this.filteredReports].sort((a, b) => {
        return new Date(b.date) - new Date(a.date); // Ordena por data, mais recentes primeiro
      });
    },
    totalDelayToday() {
    return this.filteredReports.reduce((total, report) => {
      return total + this.calculateTotalDelay(report.folders);
    }, 0);
  },

  // Total de Atraso da Semana (Corrigido)
  /*totalDelayWeek() {
  const { startOfWeek, endOfWeek } = this.getWeekStartEnd(this.selectedDate);

  // Refiltra os relatórios da semana
  const weeklyReports = this.reports.filter(report => {
    const reportDate = new Date(report.date);
    return reportDate >= startOfWeek && reportDate <= endOfWeek;
  });

  // Agora calcula o total de atraso da semana
  return weeklyReports.reduce((total, report) => {
    return total + this.calculateTotalDelay(report.folders);
  }, 0);
},*/



    
    totalDelayWeekFormatted() {
      const totalMinutes = this.totalDelayWeek;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return hours > 0 ? `${hours} horas e ${minutes} minutos` : `${totalMinutes} minutos`;
    },
    totalDelayMonth() {
    const selectedDate = new Date(this.selectedDate);
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1); // Início do mês

    return this.reports.reduce((total, report) => {
      const reportDate = new Date(report.date);
      if (reportDate >= monthStart && reportDate.getMonth() === selectedDate.getMonth()) {
        return total + this.calculateTotalDelay(report.folders);
      }
      return total;
    }, 0);
  },
    // Cálculo de Faltas
    totalMissingToday() {
      return this.filteredReports.reduce((total, report) => {
        return total + report.folders.reduce((sum, folder) => sum + (folder.incompleteItems ? folder.incompleteItems.length : 0), 0);
      }, 0);
    },
    /*totalMissingWeek() {
  const { startOfWeek, endOfWeek } = this.getWeekStartEnd(this.selectedDate);

  // Calcula o total de itens faltantes da semana
  const weeklyMissingItems = this.reports.reduce((total, report) => {
    const reportDate = new Date(report.date);
    if (reportDate >= startOfWeek && reportDate <= endOfWeek) {
      return total + report.folders.reduce((sum, folder) => {
        return sum + (folder.incompleteItems ? folder.incompleteItems.length : 0);
      }, 0);
    }
    return total;
  }, 0);

  return weeklyMissingItems;
},*/
  totalDelayMonthFormatted() {
  const totalMinutes = this.totalDelayMonth;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} horas e ${minutes} minutos` : `${totalMinutes} minutos`;
},

totalMissingMonth() {
  const selectedDate = new Date(this.selectedDate);
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1); // Início do mês
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0); // Último dia do mês

  return this.reports.reduce((total, report) => {
    const reportDate = new Date(report.date);
    if (reportDate >= monthStart && reportDate <= monthEnd) {
      return total + report.folders.reduce((sum, folder) => {
        return sum + (folder.incompleteItems ? folder.incompleteItems.length : 0);
      }, 0);
    }
    return total;
  }, 0);
},

  },

 

  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      // Ajusta a data para garantir que ela não tenha um dia a menos
      date.setHours(date.getHours() + date.getTimezoneOffset() / 60);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam do 0
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    
    formatCompletedDate1(timestamp) {
  if (!timestamp) return ''; // Caso a data seja inválida

  let date;

  // Verifica se o timestamp é um número ou objeto timestamp do Firebase
  if (typeof timestamp === 'number') {
    // Se for um timestamp UNIX (milissegundos ou segundos)
    date = new Date(timestamp * 1000); // Multiplicando para converter em milissegundos se necessário
  } else if (timestamp.seconds) {
    // Se o timestamp for um objeto do Firebase (contendo "seconds")
    date = new Date(timestamp.seconds * 1000); // Converte de segundos para milissegundos
  } else {
    return 'Data inválida'; // Se não for nenhum dos casos válidos
  }

  // Verifica se a data é válida
  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }

  // Retorna a data formatada
  return date.toLocaleString(); // Formata para 'DD/MM/YYYY, HH:mm:ss'
}
,
openImageModal(imageUrl) {
  this.currentImage = imageUrl;
  this.isImageModalOpen = true;
},

closeImageModal() {
  this.isImageModalOpen = false;
  this.currentImage = '';
},

getWeekStartEnd(date) {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = domingo, 1 = segunda-feira, etc.
    const distanceToMonday = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Ajuste para começar na segunda
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - distanceToMonday); // Vai para a segunda-feira

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Vai para o domingo

    return { startOfWeek, endOfWeek };
  },

    formatCompletedDate(date) {
    if (!date) return ''; // Se a data for indefinida, retorna vazio

    // Verifica se a data já está em formato 'DD/MM/YYYY, HH:mm:ss'
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4}),\s(\d{2}):(\d{2}):(\d{2})$/;
    const match = date.match(dateRegex);

    let formattedDate;
    if (match) {
      // Extrai os componentes da data
      const day = match[1];
      const month = match[2] - 1; // O mês em JavaScript começa do 0
      const year = match[3];
      const hours = match[4];
      const minutes = match[5];
      const seconds = match[6];

      // Cria a data manualmente usando os componentes
      formattedDate = new Date(year, month, day, hours, minutes, seconds);
    } else {
      // Tenta converter para um objeto Date diretamente se não for no formato 'DD/MM/YYYY, HH:mm:ss'
      formattedDate = new Date(date);
    }

    // Verifica se a data é válida
    if (isNaN(formattedDate.getTime())) {
      console.error(`Formato de data inválido para completedAt: ${date}`); // Log para ajudar na depuração
      return 'Data inválida';
    }

    // Retorna a data formatada corretamente
    return formattedDate.toLocaleString();
  },


  sortReceivingFolders(folders) {
    return folders.sort((a, b) => {
      const aMatch = a.name.match(/(\d+)\.(\d+)/);
      const bMatch = b.name.match(/(\d+)\.(\d+)/);

      if (aMatch && bMatch) {
        const aMajor = parseInt(aMatch[1]);
        const aMinor = parseInt(aMatch[2]);
        const bMajor = parseInt(bMatch[1]);
        const bMinor = parseInt(bMatch[2]);

        if (aMajor === bMajor) {
          return aMinor - bMinor; // Ordena pelo número menor
        }
        return aMajor - bMajor; // Ordena pelo número maior
      }
      return 0; // Se não encontrar, não altera a ordem
    });
  },

  async loadReceivingFolders() {
  try {
    const unsubscribe = onSnapshot(collection(db, 'folders'), (querySnapshot) => {
      this.receivingFolders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        open: this.receivingFoldersOpenState[doc.id] !== undefined ? this.receivingFoldersOpenState[doc.id] : false,
        ...doc.data(),
      }));
      this.filterByDate();
    });

    this.unsubscribeReceivingFolders = unsubscribe;
  } catch (error) {
    console.error('Erro ao carregar pastas de recebimento:', error);
  }
},



filterByDate() {
  // Filtrar pastas de acordo com a data selecionada
  this.filteredReceivingFolders = this.receivingFolders.filter(folder => {
    const isSameDate = folder.date === this.selectedDate;
    const isSamePeriod = folder.period === this.selectedPeriod; // Verifica se o período bate com o selecionado
    return isSameDate && isSamePeriod;
  });
},
beforeDestroy() {
  if (this.unsubscribeReceivingFolders) {
    this.unsubscribeReceivingFolders();
  }
}
,



    sortFolders(folders) {
      return folders.sort((a, b) => {
        const aMatch = a.name.match(/(\d+)\.(\d+)/);
        const bMatch = b.name.match(/(\d+)\.(\d+)/);

        if (aMatch && bMatch) {
          const aMajor = parseInt(aMatch[1]);
          const aMinor = parseInt(aMatch[2]);
          const bMajor = parseInt(bMatch[1]);
          const bMinor = parseInt(bMatch[2]);

          if (aMajor === bMajor) {
            return aMinor - bMinor; // Ordena pelo número menor
          }
          return aMajor - bMajor; // Ordena pelo número maior
        }
        return 0; // Se não encontrar, não altera a ordem
      });
    },
    toggleFolder1(folder) {
  folder.open = !folder.open; // Alterna a visibilidade da pasta
  this.receivingFoldersOpenState[folder.id] = folder.open; // Atualiza o estado diretamente
},

    calculateTotalDelay(folders) {
      return folders.reduce((total, folder) => total + (folder.delayInMinutes || 0), 0);
    },
    goBack() {
      this.$router.push('/main');
    },
    toggleFolder(report) {
  report.open = !report.open; // Alterna a visibilidade da pasta
  this.reportFoldersOpenState[report.id] = report.open; // Atualiza o estado diretamente
},

    async deleteReport(reportId) {
      try {
        const reportRef = doc(db, 'reports', reportId);
        await deleteDoc(reportRef); // Deleta o documento do relatório
        this.reports = this.reports.filter(report => report.id !== reportId);
        alert('Relatório excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir relatório:', error);
      }
    },
    async loadReports() {
  try {
    const querySnapshot = await getDocs(collection(db, 'reports'));
    const reports = await Promise.all(querySnapshot.docs.map(async doc => {
      const report = { id: doc.id, ...doc.data() };
      const foldersSnapshot = await getDocs(collection(db, 'reports', doc.id, 'folders'));
      report.folders = foldersSnapshot.docs.map(folderDoc => ({ id: folderDoc.id, ...folderDoc.data() }));

      // Preserva o estado da pasta
      if (this.reportFoldersOpenState[report.id] !== undefined) {
        report.open = this.reportFoldersOpenState[report.id]; // Mantenha o estado de aberto/fechado
      } else {
        report.open = false; // Inicializa como fechado se não houver estado anterior
      }
      
      return report;
    }));

    this.reports = reports;
  } catch (error) {
    console.error('Erro ao carregar relatórios:', error);
  }
},

    resetWeeklyDelay() {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = domingo, 1 = segunda-feira, etc.

      // Se for domingo e já passou da meia-noite
      if (dayOfWeek === 0 && now.getHours() === 0 && now.getMinutes() === 0) {
        this.totalDelayWeek = 0; // Resetar o atraso da semana
      }
    },
    async refreshReports() {
      await this.loadReports();
    },
  },
  mounted() {
    this.loadReports(); // Carrega os relatórios ao montar o componente
    this.loadReceivingFolders();
    
  },
};
</script>

<style scoped>
.gestor-page {
  padding: 20px;
  background: linear-gradient(135deg, #555759, #2c4d6f);
  color: #ffffff;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap; /* Permite que os itens se movam para a próxima linha em telas pequenas */
}

.logo {
  height: 60px;
}

.title {
  color: #ffffff;
  font-size: 1.5em;
}

.report-section {
  margin-top: 20px;
}

.summary {
  margin-bottom: 20px;
  background-color: #1e3c72;
  padding: 15px;
  border-radius: 8px;
}

.summary h2 {
  color: #ffeb3b;
}

.date-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  background-color: #1e3c72;
  padding: 10px;
  border-radius: 8px;
  flex-wrap: wrap; /* Permite que os itens se movam para a próxima linha em telas pequenas */
}
.tab-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.tab-selector button {
  background-color: #f0f0f0; /* Cor de fundo */
  border: 1px solid #ccc; /* Borda */
  border-radius: 4px; /* Bordas arredondadas */
  padding: 5px 10px; /* Espaçamento interno */
  font-size: 14px; /* Tamanho da fonte */
  cursor: pointer; /* Cursor de ponteiro */
  transition: background-color 0.3s; /* Transição suave */
  margin: 0 5px; /* Espaçamento entre os botões */
}

.tab-selector button.active {
  background-color: #007bff; /* Cor de fundo quando ativo */
  color: white; /* Cor do texto quando ativo */
  border: 1px solid #007bff; /* Borda do botão ativo */
}

.tab-selector button:hover {
  background-color: #e0e0e0; /* Cor de fundo ao passar o mouse */
}


.date-selector label {
  color: #ffeb3b;
  margin-right: 10px;
}

.issue-photo-img {
  max-width: 100%; /* Mantém a imagem dentro do contêiner */
  height: auto; /* Mantém a proporção da imagem */
  max-height: 400px; /* Limita a altura máxima da imagem */
  object-fit: contain; /* Garante que a imagem se ajuste ao espaço disponível sem ser cortada */
}


.folder-content {
  margin-top: 20px; /* Aumenta o espaço acima do conteúdo da pasta */
  background-color: #9b9a9a; /* Fundo branco para a descrição */
  padding: 10px; /* Adiciona padding */
  border-radius: 8px; /* Bordas arredondadas */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* Sombra suave */
}

.issue-description {
  font-size: 1.2em; /* Aumenta a fonte da descrição */
  color: #333333; /* Cor do texto */
  margin-top: 15px; /* Espaço maior entre a imagem e a descrição */
}

.date-selector input {
  padding: 5px;
  border-radius: 5px;
  border: none;
}

.report-date {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 10px;
  background-color: #294c73;
}

.missing-items-folder {
  margin-top: 10px;
  background-color: #4a6e9d;
  padding: 10px;
  border-radius: 8px;
  font-size: 1.2em; /* Aumenta a fonte da seção */
}

.missing-items-folder h4 {
  color: #ffeb3b;
  font-size: 1.4em; /* Aumenta a fonte do título */
}

.missing-items-folder ul {
  list-style-type: none;
  padding-left: 0;
}

.missing-items-folder li {
  color: #000000;
  font-size: 1.1em; /* Aumenta a fonte dos itens */
}
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Fundo semi-transparente */
}

.modal-content {
  position: relative;
  max-width: 90%; /* Limita a largura do modal */
  max-height: 90%; /* Limita a altura do modal */
  overflow: hidden; /* Impede que a imagem extrapole o modal */
}

.close {
  position: absolute;
  top: 10px;
  right: 20px;
  color: rgb(0, 0, 0);
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.modal-image {
  max-width: 100%; /* Mantém a largura máxima da imagem em 100% do modal */
  max-height: 80vh; /* Limita a altura da imagem para 80% da altura da viewport */
  object-fit: contain; /* Faz a imagem se ajustar dentro do contêiner sem cortar */
}



.missing-items-folder div {
  color: #8bc34a;
  font-size: 1.1em; /* Aumenta a fonte das mensagens de 'não faltando' */
}

.folder-container {
  margin: 10px 0;
  padding: 10px;
  background-color: #4a6e9d;
  border-radius: 8px;
}

.folder-title {
  font-size: 1.4em; /* Aumenta a fonte dos itens das pastas */
  color: #ffeb3b;
}

.late {
  color: #e84615;
  font-size: 1.4em;
}

.on-time {
  color: #af4c4c;
  font-size: 1.4em;
}

.completed-time {
  color: #8bc34a;
}

.not-completed {
  color: #f44336;
}

button {
  margin-top: 10px;
}

/* Estilos Responsivos */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .title {
    font-size: 1.2em; /* Reduz o tamanho da fonte para telas menores */
  }

  .date-selector {
    flex-direction: column;
    align-items: flex-start;
    width: 100%; /* Torna o seletor de data responsivo */
  }

  .date-selector label {
    margin-bottom: 5px; /* Adiciona espaço abaixo do rótulo */
  }

  .report-date {
    padding: 8px; /* Reduz o padding */
    margin-bottom: 15px; /* Reduz a margem inferior */
  }

  .folder-title {
    font-size: 1.2em; /* Reduz o tamanho da fonte das pastas */
  }

  .summary {
    padding: 10px; /* Reduz o padding da seção de resumo */
  }

  .summary h2 {
    font-size: 1em; /* Reduz o tamanho da fonte dos títulos no resumo */
  }

  .folder-content {
    padding: 15px; /* Aumenta o padding para dispositivos móveis */
  }

  .issue-description {
    font-size: 1em; /* Reduz o tamanho da fonte da descrição para telas menores */
  }
}
</style>
