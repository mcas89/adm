const firebaseConfig = {
  apiKey: "AIzaSyCyW0QRfGeZozRFt_-PvzVmXBSX4CBnTww", // SUBSTITUA PELA SUA CHAVE REAL
  authDomain: "cardosoborracharia-a8854.firebaseapp.com",
  databaseURL: "https://cardosoborracharia-a8854-default-rtdb.firebaseio.com",
  projectId: "cardosoborracharia-a8854",
  storageBucket: "cardosoborracharia-a8854.firebasestorage.app",
  messagingSenderId: "729706042586",
  appId: "1:729706042586:web:b27ba98b94b9f4ad0f41e3"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const baseURL = firebaseConfig.databaseURL; // Definido a partir do firebaseConfig

// Os mesmos bairros do seu script.js
const bairros = {
  "Parque Continental": [
      "Continental I", "Continental II", "Continental III", "Continental IV", "Continental V",
      "Jardim Renzo (Gleba I)", "Jardim Betel (Antigo Parque Continental Gleba B)",
      "Jardim Gracinda (Gleba II)", "Jardim Cambará (Gleba III)", "Jardim Valéria (Gleba IV)",
      "Jardim Itapoã (Gleba IV)", "Jardim Adriana I (Gleba V)", "Jardim Adriana II (Gleba V)"
  ],
  "Cabuçu": [
      "Vila Cambara", "Jardim Dorali", "Jardim Palmira", "Jardim Rosana", "Jardim Renzo",
      "Recreio São Jorge", "Novo Recreio", "Chácaras Cabuçu", "Jardim Monte Alto"
  ],
  "São João": [
      "Vila Rica", "Vila São João", "Jardim São Geraldo", "Jardim Vida Nova", "Jardim São João",
      "Vila São Carlos", "Jardim Lenize", "Jardim Bondança", "Jardim Jade", "Jardim Cristina",
      "Vila Girassol", "Jardim Santa Terezinha", "Jardim Aeródromo", "Cidade Soberana",
      "Jardim Santo Expedito", "Cidade Seródio", "Jardim Novo Portugal", "Jardim Regina",
      "Conjunto Residencial Haroldo Veloso"
  ],
  "Taboão": [
      "Vila Mesquita", "Jardim Nova Taboão", "Jardim Santa Emília", "Jardim Imperial",
      "Jardim Silvia", "Jardim Paraíso", "Jardim Acácio", "Parque Mikail", "Parque Mikail II",
      "Jardim Araújo", "Vila Araújo", "Jardim Beirute", "Vila do Eden", "Jardim Odete",
      "Jardim Taboão", "Jardim Santa Inês", "Jardim Santa Rita", "Jardim Belvedere",
      "Jardim São Domingos", "Jardim Santa Lídia", "Jardim Dona Meri", "Jardim Marilena",
      "Jardim Seviolli II", "Jardim Santa Vicência", "Jardim Sueli", "Jardim São José",
      "Jardim Capri", "Jardim das Acácias", "Jardim Pereira", "Jardim Santo Eduardo",
      "Jardim Tamassia", "Parque Santo Agostinho", "Parque Industrial do Jardim São Geraldo"
  ],
  "Fortaleza": [
      "Jardim Fortaleza", "Rocinha"
  ]
};

let motoristasData = {}; // Para armazenar os dados dos motoristas localmente
let motoristaSelecionadoCPF = null;
let callbackConfirmacaoGlobal = null;

window.onload = () => {
  carregarMotoristas();
};

function carregarMotoristas() {
  const listaMotoristasEl = document.getElementById('listaMotoristas');
  listaMotoristasEl.innerHTML = '<p class="placeholder-lista"><i class="fas fa-spinner fa-spin"></i> Carregando motoristas...</p>';

  database.ref('motoristas').once('value', (snapshot) => {
    motoristasData = snapshot.val();
    if (motoristasData) {
      renderizarListaMotoristas(motoristasData);
    } else {
      listaMotoristasEl.innerHTML = '<p class="placeholder-lista">Nenhum motorista cadastrado.</p>';
    }
  }).catch(error => {
    console.error("Erro ao carregar motoristas:", error);
    listaMotoristasEl.innerHTML = '<p class="placeholder-lista" style="color: #e74c3c;">Erro ao carregar motoristas. Verifique o console.</p>';
  });
}

function renderizarListaMotoristas(data) {
  const listaMotoristasEl = document.getElementById('listaMotoristas');
  listaMotoristasEl.innerHTML = ''; // Limpa a lista

  const motoristasArray = Object.keys(data).map(cpf => ({ cpf, ...data[cpf] }));
  // Ordenar por nome para facilitar a busca
  motoristasArray.sort((a, b) => a.nome.localeCompare(b.nome));


  if (motoristasArray.length === 0) {
    listaMotoristasEl.innerHTML = '<p class="placeholder-lista">Nenhum motorista encontrado.</p>';
    return;
  }

  motoristasArray.forEach(motorista => {
    const item = document.createElement('div');
    item.classList.add('motorista-item');
    item.dataset.cpf = motorista.cpf;
    item.innerHTML = `
      <div>
        <strong>${motorista.nome || 'Nome não informado'}</strong>
        <small style="display: block; color: #bdc3c7;">CPF: ${motorista.cpf}</small>
      </div>
      <span class="creditos"><i class="fas fa-coins"></i> ${motorista.creditos || 0}</span>
    `;
    item.onclick = () => selecionarMotorista(motorista.cpf);
    listaMotoristasEl.appendChild(item);
  });
}

function filtrarMotoristas() {
  const buscaInput = document.getElementById('buscaMotorista').value.toLowerCase();
  const motoristasFiltrados = {};

  for (const cpf in motoristasData) {
    const motorista = motoristasData[cpf];
    if (
      (motorista.nome && motorista.nome.toLowerCase().includes(buscaInput)) ||
      (cpf && cpf.toLowerCase().includes(buscaInput))
    ) {
      motoristasFiltrados[cpf] = motorista;
    }
  }
  renderizarListaMotoristas(motoristasFiltrados);
}

function selecionarMotorista(cpf) {
  motoristaSelecionadoCPF = cpf;
  const motorista = motoristasData[cpf];
  const editorContainer = document.getElementById('editorMotorista');
  const dadosMotoristaEl = document.getElementById('dadosMotoristaSelecionado');

  // Destacar item selecionado na lista
  document.querySelectorAll('.motorista-item').forEach(item => {
    item.classList.remove('selecionado');
    if (item.dataset.cpf === cpf) {
      item.classList.add('selecionado');
    }
  });

  if (!motorista) {
    dadosMotoristaEl.innerHTML = '<p class="placeholder-editor" style="color: #e74c3c;">Erro: Motorista não encontrado.</p>';
    editorContainer.classList.remove('hidden');
    return;
  }

  let bairrosOptions = '<option value="">Selecione o Bairro Principal</option>';
  for (const bairroPaiKey in bairros) {
    bairrosOptions += `<option value="${bairroPaiKey}" ${motorista.bairroPai === bairroPaiKey ? 'selected' : ''}>${bairroPaiKey}</option>`;
  }

  dadosMotoristaEl.innerHTML = `
    <h3>${motorista.nome} (CPF: ${cpf})</h3>
    <form id="formEditarMotorista">
      <h4>Dados Pessoais</h4>
      <div class="form-grupo">
        <label for="editNome">Nome Completo:</label>
        <input type="text" id="editNome" value="${motorista.nome || ''}" required>
      </div>
      <div class="form-grupo">
        <label for="editSenha">Senha:</label>
        <input type="password" id="editSenha" placeholder="Deixe em branco para não alterar">
      </div>
      <div class="form-grupo">
        <label for="editNascimento">Data de Nascimento:</label>
        <input type="date" id="editNascimento" value="${motorista.nascimento || ''}">
      </div>
      <div class="form-grupo">
        <label for="editTelefone">Telefone:</label>
        <input type="text" id="editTelefone" value="${motorista.telefone || ''}" maxlength="11" pattern="\\d{10,11}" title="Apenas números, 10 ou 11 dígitos">
      </div>

      <h4>Dados do Veículo</h4>
      <div class="form-grupo">
        <label for="editMarca">Marca do Veículo:</label>
        <input type="text" id="editMarca" value="${motorista.marca || ''}">
      </div>
      <div class="form-grupo">
        <label for="editModelo">Modelo do Veículo:</label>
        <input type="text" id="editModelo" value="${motorista.modelo || ''}">
      </div>
      <div class="form-grupo">
        <label for="editAno">Ano do Veículo:</label>
        <input type="text" id="editAno" value="${motorista.ano || ''}" maxlength="4" pattern="\\d{4}" title="Formato AAAA">
      </div>
      <div class="form-grupo">
        <label for="editCor">Cor do Veículo:</label>
        <input type="text" id="editCor" value="${motorista.cor || ''}">
      </div>
      <div class="form-grupo">
        <label for="editPlaca">Placa do Veículo:</label>
        <input type="text" id="editPlaca" value="${motorista.placa || ''}" maxlength="8" pattern="[A-Za-z0-9-]{7,8}" title="Ex: ABC1D23 ou ABC-1234">
      </div>
      <div class="form-grupo">
        <label for="editBairroPai">Bairro Principal de Atuação:</label>
        <select id="editBairroPai">${bairrosOptions}</select>
      </div>

      <div class="botoes-acao">
        <button type="button" class="btn-salvar" onclick="salvarAlteracoesMotorista()">
          <i class="fas fa-save"></i> Salvar Alterações
        </button>
      </div>
    </form>

    <div class="creditos-gerenciamento">
      <h4><i class="fas fa-coins"></i> Gerenciar Créditos</h4>
      <p>Créditos Atuais: <strong id="creditosAtuaisDisplay">${motorista.creditos || 0}</strong></p>
      <div class="creditos-input-grupo">
        <input type="number" id="valorCredito" placeholder="Valor" min="1">
        <button type="button" class="btn-add-creditos" onclick="confirmarModificarCreditos('adicionar')">
          <i class="fas fa-plus-circle"></i> Adicionar
        </button>
        <button type="button" class="btn-remove-creditos" onclick="confirmarModificarCreditos('remover')">
          <i class="fas fa-minus-circle"></i> Remover
        </button>
      </div>
    </div>
  `;
  editorContainer.classList.remove('hidden');
  window.scrollTo({ top: editorContainer.offsetTop - 20, behavior: 'smooth' }); // Rola para o editor
}

function salvarAlteracoesMotorista() {
  if (!motoristaSelecionadoCPF) return;

  const nome = document.getElementById('editNome').value.trim();
  const senha = document.getElementById('editSenha').value; // Não trim() para permitir senhas com espaço, se desejado
  const nascimento = document.getElementById('editNascimento').value;
  const telefone = document.getElementById('editTelefone').value.trim();
  const marca = document.getElementById('editMarca').value.trim();
  const modelo = document.getElementById('editModelo').value.trim();
  const ano = document.getElementById('editAno').value.trim();
  const cor = document.getElementById('editCor').value.trim();
  const placa = document.getElementById('editPlaca').value.trim().toUpperCase();
  const bairroPai = document.getElementById('editBairroPai').value;

  if (!nome) {
    alert('O nome do motorista é obrigatório.');
    return;
  }

  const updates = {
    nome,
    nascimento,
    telefone,
    marca,
    modelo,
    ano,
    cor,
    placa,
    bairroPai
  };

  if (senha) { // Só atualiza a senha se algo for digitado
    updates.senha = senha;
  }

  abrirConfirmacaoModal(
    `Tem certeza que deseja salvar as alterações para ${motoristasData[motoristaSelecionadoCPF].nome}?`,
    () => {
      database.ref(`motoristas/${motoristaSelecionadoCPF}`).update(updates)
        .then(() => {
          alert('Dados do motorista atualizados com sucesso!');
          // Atualizar dados locais e recarregar lista para refletir mudanças (ex: nome)
          carregarMotoristas(); // Recarrega todos, mais simples
          // Para não perder a seleção, podemos atualizar localmente e o form
          motoristasData[motoristaSelecionadoCPF] = { ...motoristasData[motoristaSelecionadoCPF], ...updates };
          if (senha) motoristasData[motoristaSelecionadoCPF].senha = senha; // Atualiza senha localmente se alterada
          selecionarMotorista(motoristaSelecionadoCPF); // Re-renderiza o form com os dados atualizados
        })
        .catch(error => {
          console.error("Erro ao atualizar motorista:", error);
          alert(`Erro ao atualizar dados: ${error.message}`);
        });
    }
  );
}

function confirmarModificarCreditos(acao) {
  if (!motoristaSelecionadoCPF) return;

  const valorCreditoEl = document.getElementById('valorCredito');
  const valor = parseInt(valorCreditoEl.value);

  if (isNaN(valor) || valor <= 0) {
    alert('Por favor, insira um valor de crédito válido e positivo.');
    return;
  }

  const motorista = motoristasData[motoristaSelecionadoCPF];
  const creditosAtuais = parseInt(motorista.creditos || 0);
  let novosCreditos;
  let mensagemAcao;

  if (acao === 'adicionar') {
    novosCreditos = creditosAtuais + valor;
    mensagemAcao = `adicionar ${valor} créditos`;
  } else if (acao === 'remover') {
    if (valor > creditosAtuais) {
      alert('Não é possível remover mais créditos do que o motorista possui.');
      return;
    }
    novosCreditos = creditosAtuais - valor;
    mensagemAcao = `remover ${valor} créditos`;
  } else {
    return;
  }

  abrirConfirmacaoModal(
    `Tem certeza que deseja ${mensagemAcao} para ${motorista.nome}? Saldo final: ${novosCreditos}.`,
    () => {
      database.ref(`motoristas/${motoristaSelecionadoCPF}/creditos`).set(novosCreditos)
        .then(() => {
          alert(`Créditos atualizados com sucesso! Novo saldo: ${novosCreditos}`);
          motoristasData[motoristaSelecionadoCPF].creditos = novosCreditos; // Atualiza localmente
          document.getElementById('creditosAtuaisDisplay').textContent = novosCreditos;
          valorCreditoEl.value = ''; // Limpa o input
          // Atualizar a lista para refletir os novos créditos
          const itemLista = document.querySelector(`.motorista-item[data-cpf="${motoristaSelecionadoCPF}"] .creditos`);
          if (itemLista) {
            itemLista.innerHTML = `<i class="fas fa-coins"></i> ${novosCreditos}`;
          }
        })
        .catch(error => {
          console.error("Erro ao atualizar créditos:", error);
          alert(`Erro ao atualizar créditos: ${error.message}`);
        });
    }
  );
}


// Funções do Modal de Confirmação
function abrirConfirmacaoModal(mensagem, callbackConfirmacao) {
  document.getElementById('mensagemConfirmacao').textContent = mensagem;
  callbackConfirmacaoGlobal = callbackConfirmacao;
  document.getElementById('confirmacaoModal').classList.remove('hidden');
  document.getElementById('btnConfirmarAcao').onclick = () => {
    if (callbackConfirmacaoGlobal) {
      callbackConfirmacaoGlobal();
    }
    fecharConfirmacaoModal();
  };
}

function fecharConfirmacaoModal() {
  document.getElementById('confirmacaoModal').classList.add('hidden');
  callbackConfirmacaoGlobal = null;
}