function getUsuario() {
    return JSON.parse(localStorage.getItem('usuarioAutenticado'));
  }
  
  function getChaveCompras() {
    const usuario = getUsuario();
    return `compras_${usuario?.id}`;
  }
  
  function carregarCompras() {
    const chave = getChaveCompras();
    const compras = JSON.parse(localStorage.getItem(chave)) || [];
    const $tabela = $('#tabelaCompras');
    $tabela.empty();
  
    if (compras.length === 0) {
      $tabela.append(`<tr><td colspan="3" class="text-center">Nenhuma compra registrada.</td></tr>`);
      return;
    }
  
    compras.forEach(compra => {
      const linha = `
        <tr>
          <td>${compra.descricao}</td>
          <td>R$ ${parseFloat(compra.valor).toFixed(2)}</td>
          <td>${compra.data}</td>
        </tr>
      `;
      $tabela.append(linha);
    });
  }
  
  $(document).ready(function () {
    const usuario = getUsuario();
    if (!usuario) {
      alert("Você precisa estar logado para acessar esta página.");
      window.location.href = "login.html";
      return;
    }
  
    carregarCompras();
  });
  