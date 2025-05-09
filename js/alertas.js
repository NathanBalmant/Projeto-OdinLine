// ===== alertas.js (tudo relacionado às funcionalidades de alertas) =====

function normalizarTexto(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }
  
  function getChaveAlertas() {
    const usuario = getUsuario();
    return `alertas_${usuario?.id}`;
  }
  
  function preencherSelectProdutos() {
    const chaveUsuario = localStorage.getItem('chave');
    if (!chaveUsuario) return;
  
    fetch(`https://api-odinline.odiloncorrea.com/produto/${chaveUsuario}/usuario`)
      .then(res => res.json())
      .then(produtos => {
        const $select = $('#idProduto');
        $select.empty();
        $select.append('<option value="" disabled selected>Selecione um produto</option>');
        produtos.forEach(p => {
          $select.append(`<option value="${p.descricao}">${p.descricao}</option>`);
        });
      })
      .catch(err => console.error("Erro ao carregar produtos:", err));
  }
  
  function cadastrarAlerta() {
    const chaveUsuario = localStorage.getItem('chave');
    const usuario = getUsuario();
    const descricao = $('#idProduto').val();
    const valorDesejado = $('#valor').val().trim();
    const acao = $('input[name="acao"]:checked').val();
    const chaveAlertas = getChaveAlertas();
  
    if (!descricao || !valorDesejado || !acao) {
      exibirMensagem('Preencha todos os campos corretamente.', 'warning');
      return;
    }
  
    fetch(`https://api-odinline.odiloncorrea.com/produto/${chaveUsuario}/usuario`)
      .then(res => res.json())
      .then(produtos => {
        const produto = produtos.find(p =>
          normalizarTexto(p.descricao).includes(normalizarTexto(descricao))
        );
  
        if (!produto) {
          exibirMensagem('Produto não encontrado com essa descrição.', 'danger');
          return;
        }
  
        let alertas = JSON.parse(localStorage.getItem(chaveAlertas)) || [];
        const existe = alertas.find(a => a.idProduto === produto.id);
  
        if (existe) {
          exibirMensagem('Já existe um alerta para esse produto.', 'danger');
          return;
        }
  
        const alerta = {
          idProduto: produto.id,
          descricao: produto.descricao,
          valorDesejado,
          acao,
          status: 'Aguardando'
        };
  
        alertas.push(alerta);
        localStorage.setItem(chaveAlertas, JSON.stringify(alertas));
        exibirMensagem('Alerta cadastrado com sucesso!', 'success');
        atualizarTabela();
      })
      .catch(err => {
        console.error(err);
        exibirMensagem('Erro ao buscar produto.', 'danger');
      });
  }
  
  function atualizarTabela() {
    const chaveAlertas = getChaveAlertas();
    const alertas = JSON.parse(localStorage.getItem(chaveAlertas)) || [];
    const $tabela = $('#tabelaAlertas');
    $tabela.empty();
  
    alertas.forEach(alerta => {
      const linha = `
        <tr>
          <td>${alerta.descricao}</td>
          <td>R$ ${parseFloat(alerta.valorDesejado).toFixed(2)}</td>
          <td>${alerta.acao}</td>
          <td>${alerta.status}</td>
        </tr>
      `;
      $tabela.append(linha);
    });
  }
  
  function exibirMensagem(mensagem, tipo = 'info') {
    const $mensagem = $('#mensagemAlerta');
    $mensagem.removeClass().addClass(`alert alert-${tipo} mt-3`).text(mensagem).removeClass('d-none');
  }
  
  function registrarCompra(compra) {
    const usuario = getUsuario();
    const chaveCompras = `compras_${usuario?.id}`;
    const compras = JSON.parse(localStorage.getItem(chaveCompras)) || [];
  
    compras.push({
      ...compra,
      data: new Date().toLocaleString()
    });
  
    localStorage.setItem(chaveCompras, JSON.stringify(compras));
  }
  
  function verificarAlertasAtivos() {
    const chaveAlertas = getChaveAlertas();
    let alertas = JSON.parse(localStorage.getItem(chaveAlertas)) || [];
  
    alertas.forEach(async (alerta, index) => {
      try {
        const response = await fetch(`https://api-odinline.odiloncorrea.com/produto/${alerta.idProduto}`);
        const produto = await response.json();
  
        const precoAtual = parseFloat(produto.valor);
        const valorDesejado = parseFloat(alerta.valorDesejado);
  
        if (precoAtual <= valorDesejado) {
          if (alerta.acao === 'notificar') {
            exibirMensagem(`🔔 Produto "${produto.descricao}" atingiu o valor desejado! Valor atual: R$ ${precoAtual}`, 'success');
          }
  
          if (alerta.acao === 'comprar') {
            registrarCompra({
              idProduto: alerta.idProduto,
              descricao: produto.descricao,
              valor: precoAtual
            });
  
            exibirMensagem(` Produto "${produto.descricao}" comprado por R$ ${precoAtual}`, 'success');
          }
  
          alertas.splice(index, 1);
          localStorage.setItem(chaveAlertas, JSON.stringify(alertas));
          atualizarTabela();
        }
      } catch (error) {
        console.error("Erro ao consultar produto:", error);
      }
    });
  }
  
  $(document).ready(function () {
    const usuario = getUsuario();
    const chave = localStorage.getItem('chave');
  
    if (!usuario || !chave) {
      alert("Você precisa estar logado para acessar esta página.");
      window.location.href = "login.html";
      return;
    }
  
    preencherSelectProdutos();
    atualizarTabela();
    setInterval(verificarAlertasAtivos, 15000);
  });
  