const bairros = {
  "Parque Continental": ["Continental I", "Continental II", "Continental III"],
  "Cabuçu": ["Vila Cambara", "Jardim Dorali"],
  // Adicione outros bairros aqui
};

const baseURL = 'https://cardosoborracharia-a8854-default-rtdb.firebaseio.com/motoristas';

// Variável para armazenar o CPF do motorista atualmente em foco
let currentMotoristaCPF = '';

// Função para formatar o CPF (adiciona pontos e traço)
function formatarCPF(input) {
  let texto = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
  texto = texto.slice(0, 11); // Limita o tamanho para 11 caracteres

  texto = texto.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  input.value = texto;
}

// Função para buscar o motorista no Firebase pelo CPF
function buscarMotorista() {
  const cpf = document.getElementById('cpf').value.replace(/\D/g, ''); // Obtém o CPF e remove formatação
  if (!cpf) {
    alert('Por favor, digite o CPF.');
    return;
  }

  // Limpa os campos do painel antes de buscar um novo motorista
  limparCampos();

  fetch(`${baseURL}/${cpf}.json`) // Busca no nó 'motoristas' com o CPF como chave
    .then(response => response.json())
    .then(data => {
      if (data) {
        // Se encontrar o motorista, preenche os campos do painel
        currentMotoristaCPF = cpf; // Armazena o CPF do motorista encontrado
        preencherCampos(data);
        document.getElementById('loginCPF').style.display = 'none';
        document.getElementById('painel').style.display = 'block';
      } else {
        alert('Motorista não encontrado.');
      }
    })
    .catch(error => {
      console.error('Erro ao buscar motorista:', error);
      alert('Erro ao buscar motorista.');
    });
}

// Função para preencher os campos do painel com os dados do motorista
function preencherCampos(data) {
  document.getElementById('nome').value = data.nome || '';
  document.getElementById('placa').value = data.placa || '';
  document.getElementById('modelo').value = data.modelo || '';
  document.getElementById('telefone').value = data.telefone || '';
  document.getElementById('senha').value = data.senha || '';
  document.getElementById('creditos').value = data.creditos || 0;

  // Preenche o select de bairros
  const selectBairro = document.getElementById('bairroPai');
  selectBairro.innerHTML = '<option value="">Escolha um Bairro</option>'; // Limpa o select

  for (const bairroPai in bairros) {
    if (bairros.hasOwnProperty(bairroPai)) {
      const option = document.createElement('option');
      option.value = bairroPai;
      option.textContent = bairroPai;
      selectBairro.appendChild(option);
    }
  }

  selectBairro.value = data.bairroPai || ''; // Seleciona o bairro do motorista
}

// Função para limpar os campos do painel
function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById('placa').value = '';
    document.getElementById('modelo').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('creditos').value = '';
    document.getElementById('bairroPai').value = '';
}

// Função para voltar à tela de login
function voltarLogin() {
  document.getElementById('loginCPF').style.display = 'block';
  document.getElementById('painel').style.display = 'none';
  document.getElementById('cpf').value = ''; // Limpa o CPF
  limparCampos();
  currentMotoristaCPF = ''; // Limpa o CPF do motorista atual
}

// Função para abrir os popups
function abrirPopup(popupId) {
  document.getElementById(popupId).style.display = 'flex';
}

// Função para fechar os popups
function fecharPopup(popupId) {
  document.getElementById(popupId).style.display = 'none';
}

// Função para atualizar os dados do motorista (inclui adicionar/remover créditos)
function atualizarDados(operacaoCredito = null) {
  if (!currentMotoristaCPF) {
    alert('Nenhum motorista selecionado.');
    return;
  }

  const dadosAtualizados = {
    nome: document.getElementById('nome').value,
    placa: document.getElementById('placa').value,
    modelo: document.getElementById('modelo').value,
    telefone: document.getElementById('telefone').value,
    senha: document.getElementById('senha').value,
    bairroPai: document.getElementById('bairroPai').value
  };

  if (operacaoCredito) {
    let valorCredito = parseInt(document.getElementById(operacaoCredito === 'add' ? 'adicionarCreditos' : 'removerCreditos').value) || 0;
    let creditosAtuais = parseInt(document.getElementById('creditos').value) || 0;

    if (operacaoCredito === 'add') {
      dadosAtualizados.creditos = creditosAtuais + valorCredito;
    } else if (operacaoCredito === 'remove') {
      if (valorCredito > creditosAtuais) {
          alert('Valor a remover é maior que o saldo atual.');
          return;
      }
      dadosAtualizados.creditos = creditosAtuais - valorCredito;
    }
  } else {
    dadosAtualizados.creditos = parseInt(document.getElementById('creditos').value) || 0;
  }

  fetch(`${baseURL}/${currentMotoristaCPF}.json`, {
    method: 'PUT', // Use PUT para atualizar todos os campos
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosAtualizados)
  })
  .then(response => response.json())
  .then(data => {
    alert('Dados atualizados com sucesso!');
    if (operacaoCredito) {
      buscarMotorista(); // Recarrega os dados para atualizar os créditos na tela
      fecharPopup(operacaoCredito === 'add' ? 'popupAdicionarCreditos' : 'popupRemoverCreditos');
    }
  })
  .catch(error => {
    console.error('Erro ao atualizar dados:', error);
    alert('Erro ao atualizar dados.');
  });
}

// Função para alterar o CPF do motorista
function alterarCPF() {
  const novoCPF = document.getElementById('novoCPF').value.replace(/\D/g, '');
  if (!novoCPF) {
    alert('Por favor, digite o novo CPF.');
    return;
  }

  if (novoCPF.length !== 11) {
    alert('CPF inválido.');
    return;
  }

  // Primeiro, buscar os dados do motorista atual
  fetch(`${baseURL}/${currentMotoristaCPF}.json`)
    .then(response => response.json())
    .then(data => {
      if (data) {
        const dadosMotorista = data;

        // Excluir o motorista com o CPF antigo
        fetch(`${baseURL}/${currentMotoristaCPF}.json`, {
          method: 'DELETE',
        })
        .then(() => {
          // Criar o motorista com o novo CPF
          fetch(`${baseURL}/${novoCPF}.json`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosMotorista),
          })
          .then(() => {
            alert('CPF alterado com sucesso!');
            currentMotoristaCPF = novoCPF;
            buscarMotorista(); // Atualiza a tela com o novo CPF
            fecharPopup('popupAlterarCPF');
          })
          .catch(error => {
            console.error('Erro ao criar motorista com novo CPF:', error);
            alert('Erro ao alterar CPF.');
          });
        })
        .catch(error => {
          console.error('Erro ao excluir motorista com CPF antigo:', error);
          alert('Erro ao alterar CPF.');
        });
      } else {
        alert('Motorista não encontrado.');
      }
    })
    .catch(error => {
      console.error('Erro ao buscar motorista para alterar CPF:', error);
      alert('Erro ao alterar CPF.');
    });
}

// Função para excluir o cadastro do motorista
function excluirCadastro() {
  if (!currentMotoristaCPF) {
    alert('Nenhum motorista selecionado.');
    return;
  }

  if (confirm('Tem certeza que deseja excluir este cadastro?')) {
    fetch(`${baseURL}/${currentMotoristaCPF}.json`, {
      method: 'DELETE',
    })
    .then(() => {
      alert('Cadastro excluído com sucesso!');
      voltarLogin();
    })
    .catch(error => {
      console.error('Erro ao excluir cadastro:', error);
      alert('Erro ao excluir cadastro.');
    });
  }
}

// Preenche o select de bairros ao carregar a página
window.onload = function() {
  const selectBairro = document.getElementById('bairroPai');
  for (const bairroPai in bairros) {
    if (bairros.hasOwnProperty(bairroPai)) {
      const option = document.createElement('option');
      option.value = bairroPai;
      option.textContent = bairroPai;
      selectBairro.appendChild(option);
    }
  }
};