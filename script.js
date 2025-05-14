const baseURL = 'https://cardosoborracharia-a8854-default-rtdb.firebaseio.com/motoristas';
let cpfAtual = '';

function formatarCPF(input) {
  input.value = input.value.replace(/\D/g, '').slice(0, 11);
}

function buscarMotorista() {
  const cpf = document.getElementById('cpf').value;
  if (cpf.length !== 11) return alert('CPF inválido');

  fetch(`${baseURL}/${cpf}.json`)
    .then(res => res.json())
    .then(data => {
      if (data) {
        cpfAtual = cpf;
        document.getElementById('cpf').style.display = 'none';
        document.querySelector('.buscar').style.display = 'none';
        document.getElementById('loginCPF').style.display = 'none';
        document.getElementById('painel').style.display = 'block';
        document.getElementById('nome').value = data.nome;
        document.getElementById('placa').value = data.placa;
        document.getElementById('modelo').value = data.modelo;
        document.getElementById('bairroPai').value = data.bairroPai;
        document.getElementById('telefone').value = data.telefone;
        document.getElementById('senha').value = data.senha;
        document.getElementById('creditos').value = data.creditos;
      } else {
        alert('Motorista não encontrado.');
      }
    });
}

function atualizarDados(tipo) {
  const nome = document.getElementById('nome').value;
  const placa = document.getElementById('placa').value;
  const modelo = document.getElementById('modelo').value;
  const bairro = document.getElementById('bairro').value;
  const telefone = document.getElementById('telefone').value;
  const senha = document.getElementById('senha').value;
  let creditos = parseInt(document.getElementById('creditos').value);

  if (tipo === 'add') {
    const add = parseInt(document.getElementById('adicionarCreditos').value);
    if (isNaN(add) || add < 0) return alert('Valor inválido');
    creditos += add;
    fecharPopup('popupAdicionarCreditos');
  } else if (tipo === 'remove') {
    const remove = parseInt(document.getElementById('removerCreditos').value);
    if (isNaN(remove) || remove < 0 || remove > creditos) return alert('Valor inválido');
    creditos -= remove;
    fecharPopup('popupRemoverCreditos');
  }

  const dados = {
    nome, placa, modelo,
    bairroPai: bairro,
    telefone, senha, creditos
  };

  fetch(`${baseURL}/${cpfAtual}.json`, {
    method: 'PUT',
    body: JSON.stringify(dados)
  })
    .then(() => alert('Dados atualizados'));
}

function abrirPopup(id) {
  document.getElementById(id).style.display = 'flex';
}

function fecharPopup(id) {
  document.getElementById(id).style.display = 'none';
}

function voltarLogin() {
  location.reload();
}

function alterarCPF() {
  const novoCPF = document.getElementById('novoCPF').value;
  if (novoCPF.length !== 11) return alert('CPF inválido');

  fetch(`${baseURL}/${cpfAtual}.json`)
    .then(res => res.json())
    .then(data => {
      return fetch(`${baseURL}/${novoCPF}.json`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    })
    .then(() => fetch(`${baseURL}/${cpfAtual}.json`, { method: 'DELETE' }))
    .then(() => {
      alert('CPF alterado com sucesso');
      fecharPopup('popupAlterarCPF');
      voltarLogin();
    });
}

function excluirCadastro() {
  if (!confirm('Tem certeza que deseja excluir este cadastro?')) return;

  fetch(`${baseURL}/${cpfAtual}.json`, { method: 'DELETE' })
    .then(() => {
      alert('Cadastro excluído');
      voltarLogin();
    });
}

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
  // ... (adicione os outros bairros)
};

const bairroPaiSelect = document.getElementById("bairroPai");
Object.keys(bairros).forEach(bairroPai => {
  const option = document.createElement("option");
  option.value = bairroPai;
  option.textContent = bairroPai;
  bairroPaiSelect.appendChild(option);
});
