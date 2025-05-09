// ===== index.js (somente login e funções genéricas) =====

// Validação de login
$("#loginForm").validate({
  rules: {
    login: { required: true },
    senha: { required: true }
  },
  messages: {
    login: { required: "Campo Obrigatório" },
    senha: { required: "Campo Obrigatório" }
  }
});

// Função de autenticação
async function autenticar() {
  if ($("#loginForm").valid()) {
    let login = $("#login").val();
    let senha = $("#senha").val();

    try {
      let resposta = await fetch(`https://api-odinline.odiloncorrea.com/usuario/${login}/${senha}/autenticar`);
      let usuario = await resposta.json();

      if (usuario.id > 0) {
        localStorage.setItem('usuarioAutenticado', JSON.stringify(usuario));
        localStorage.setItem('chave', usuario.chave);
        window.location.href = "menu.html";
      } else {
        alert("Usuário ou senha inválidos.");
      }
    } catch (error) {
      alert("Erro ao tentar autenticar.");
    }
  }
}

function getUsuario() {
  return JSON.parse(localStorage.getItem('usuarioAutenticado'));
}

function logout() {
  localStorage.removeItem('usuarioAutenticado');
  localStorage.removeItem('chave');
  window.location.href = "index.html"; 
}