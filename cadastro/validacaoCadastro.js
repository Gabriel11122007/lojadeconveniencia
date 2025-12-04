// validacaoCadastro.js

// Função para validar CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0, resto;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

// Máscara de CPF
function aplicarMascaraCPF(e) {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  e.target.value = v;
}

// Máscara de telefone
function aplicarMascaraTelefone(e) {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);

  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (v.length > 5) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d+)/, '($1) $2');
  }
  e.target.value = v;
}

// Inicializa validações
function initCadastro() {
  const cadastroForm = document.getElementById('cadastroForm');
  const cpfInput = document.getElementById('cpf');
  const telefoneInput = document.getElementById('telefone');

  cpfInput.addEventListener('input', aplicarMascaraCPF);
  telefoneInput.addEventListener('input', aplicarMascaraTelefone);

  cadastroForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const telefone = telefoneInput.value.replace(/\D/g, '');
    const cpf = cpfInput.value.replace(/\D/g, '');
    const senha = document.getElementById('senha-cadastro').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    // Verificação de checkboxes
    const termosCheck = document.getElementById('termos');
    const privacidadeCheck = document.getElementById('privacidade');
    if (!termosCheck.checked || !privacidadeCheck.checked) {
      alert('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }

    // Validação de telefone
    if (!/^\d{10,11}$/.test(telefone)) {
      alert('Digite um telefone válido com DDD.');
      return;
    }

    // Validação de CPF
    if (!validarCPF(cpf)) {
      alert('CPF inválido.');
      return;
    }

    // Validação de senha
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    // Cria a mensagem de sucesso
    const mensagem = document.createElement('div');
    mensagem.className = `
      fixed inset-0 flex items-center justify-center
      bg-black bg-opacity-40 z-50
      opacity-0 transition-opacity duration-300
      backdrop-blur-sm
    `;
    mensagem.innerHTML = `
      <div class="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center relative scale-90 transition-transform duration-300">
        <!-- Círculo animado -->
        <svg class="w-28 h-28 mb-4" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="28" fill="none" stroke="#D1FAE5" stroke-width="4"/>
          <circle id="fillCircle" cx="30" cy="30" r="28" fill="none" stroke="#34D399" stroke-width="4" stroke-dasharray="175" stroke-dashoffset="175" stroke-linecap="round"/>
          <path id="checkPath" fill="none" stroke="#34D399" stroke-width="4" d="M18 30l7 7 18-18" stroke-dasharray="45" stroke-dashoffset="45" stroke-linecap="round"/>
        </svg>
        <p class="text-gray-800 font-semibold text-lg text-center">Cadastro realizado com sucesso!</p>
      </div>
    `;
    document.body.appendChild(mensagem);

    // Fade-in e efeito de “pop”
    setTimeout(() => {
      mensagem.style.opacity = 1;
      mensagem.firstElementChild.classList.add('scale-100');
    }, 50);

    // Animação do círculo preenchendo
    setTimeout(() => {
      const fill = document.getElementById('fillCircle');
      let dash = 157;
      const intervalFill = setInterval(() => {
        dash -= 4;
        if (dash <= 0) {
          dash = 0;
          clearInterval(intervalFill);
          animateCheck();
        }
        fill.setAttribute('stroke-dashoffset', dash);
      }, 15);

      function animateCheck() {
        const path = document.getElementById('checkPath');
        let dashoffset = 40;
        const interval = setInterval(() => {
          dashoffset -= 2;
          if (dashoffset <= 0) {
            dashoffset = 0;
            clearInterval(interval);
          }
          path.setAttribute('stroke-dashoffset', dashoffset);
        }, 20);
      }
    }, 150);

    // Fecha a mensagem e volta para login
    setTimeout(() => {
      mensagem.style.opacity = 0;
      setTimeout(() => mensagem.remove(), 300);

      const loginForm = document.getElementById('loginForm');
      cadastroForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      document.getElementById('formTitle').textContent = 'Login';
      document.getElementById('toggleBtn').textContent = 'Não tem conta? Cadastre-se';
    }, 2500);

  });
}

// Inicializa quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', initCadastro);
