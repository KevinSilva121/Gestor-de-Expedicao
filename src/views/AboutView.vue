<template>
  <div class="about" >
      <img src="@/assets/logo-ar-transportes.png" alt="Logo" >
    </div>
    <router-link to="/">Voltar para Login</router-link>
  <div class="about">
    <h1>Sobre o Gestor de Expedição</h1>
    <p>
      O <strong>Gestor de Expedição</strong> é um sistema desenvolvido para facilitar o gerenciamento de expedições, permitindo a criação e organização de pastas, a adição de itens e a realização de anotações sobre as expedições em andamento.
    </p>
    
    <h2>Como Usar o Aplicativo</h2>
    <p>
      Este guia passo a passo vai te ajudar a entender como usar as principais funcionalidades do aplicativo.
    </p>
    
    <h3>1. Criar uma Nova Pasta de Expedição</h3>
    <p>
      Ao entrar na página inicial do sistema, você verá um botão <strong>"Nova Pasta"</strong>. Clique nele para criar uma nova pasta de expedição.
      Na janela que se abrir, insira um nome para a pasta, que pode representar o número da expedição ou o destino, e clique em <strong>"Salvar"</strong>.
    </p>
    
    <h3>2. Adicionar Itens à Pasta</h3>
    <p>
      Depois de criar uma pasta, clique sobre ela para abrir. Dentro da pasta, você verá a opção de <strong>"Adicionar Item"</strong>.
      Ao clicar, você poderá preencher informações como nome do item, quantidade, e observações específicas sobre aquele item. Após preencher os dados, clique em <strong>"Salvar"</strong> para adicionar o item à pasta.
    </p>

    <h3>3. Fazer Anotações</h3>
    <p>
      Dentro de cada pasta, há um campo de <strong>"Anotações"</strong> onde você pode registrar informações importantes sobre a expedição, como status, problemas encontrados, ou notas para o próximo responsável.
      Essas anotações são salvas automaticamente e podem ser consultadas ou editadas a qualquer momento.
    </p>

    <h3>4. Gerenciar o Status das Expedições</h3>
    <p>
      Cada pasta de expedição possui um indicador de status, que pode ser ajustado conforme o andamento da expedição (ex: "Em Progresso", "Concluída", "Cancelada"). Para mudar o status, basta clicar no ícone de status dentro da pasta e selecionar a nova condição.
    </p>

    <h3>5. Excluir ou Editar Pastas e Itens</h3>
    <p>
      Caso precise alterar ou remover uma pasta ou item, basta clicar no ícone de <strong>"Editar"</strong> ou <strong>"Excluir"</strong> que aparece ao lado de cada pasta ou item listado.
      Isso permite que você mantenha suas expedições sempre atualizadas e organizadas.
    </p>

    <h2>Funcionalidades Principais</h2>
    <ul>
      <li>Criação e gerenciamento de pastas de expedição</li>
      <li>Adição e edição de itens e suas respectivas observações</li>
      <li>Fazer anotações específicas para cada expedição</li>
      <li>Controle e atualização do status de cada expedição</li>
    </ul>

    <h2>Dicas de Uso</h2>
    <p>
      - Organize suas pastas de acordo com a data da expedição ou destino, facilitando a busca futura.<br>
      - Utilize as anotações para registrar problemas ou questões a serem resolvidas posteriormente.<br>
      - Atualize o status das expedições regularmente para manter a equipe sempre informada sobre o andamento.
    </p>
    
    <h2>Desenvolvedores</h2>
    <p>
      Este projeto foi desenvolvido por Kevin Silva, com o objetivo de simplificar a gestão de expedições para empresas de logística e transporte.
    </p>

    <h2>Contato: (12)99107-7249</h2>
    <p>
      Caso tenha dúvidas ou sugestões, entre em contato através do e-mail: <a href="mailto:kevinramon121@gmail.com">kevinramon121@gmail.com</a>
    </p>
    
  </div>
  <router-link to="/">Voltar para Login</router-link>
</template>

<script>
export default {
  name: 'AboutSystem',
};
</script>

<style scoped>
.about {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #333;
}
.about h1, .about h2 {
  color: #444;
}
.about p {
  line-height: 1.6;
}
.about ul {
  margin-left: 20px;
}
.about ul li {
  margin-bottom: 10px;
}
</style>
