let jogos = [];
let jogosFiltrados = [];
let paginaAtual = 1;
const itensPorPagina = 6;

// Elementos
const cardsContainer = document.getElementById("cardsContainer");
const filtroGenero = document.getElementById("filtroGenero");
const filtroPlataforma = document.getElementById("filtroPlataforma");
const filtroAno = document.getElementById("filtroAno");
const ordenacao = document.getElementById("ordenarPor");
const inputBusca = document.getElementById("busca");

// 1) Carregar JSON e inicializar catálogo

async function inicializarCatalogo() {
    try {
        const resposta = await fetch("catalogo.json");
        jogos = await resposta.json();
        jogosFiltrados = [...jogos];

        preencherFiltros();
        mostrarGrid();
    } catch (erro) {
        cardsContainer.innerHTML =
            `<p class="text-center text-red-600 p-4">Erro ao carregar catálogo.</p>`;
    }
}

// 2) Preencher selects de filtros dinamicamente

function preencherFiltros() {
    const generos = [...new Set(jogos.map(j => j.genero))];
    const plataformas = [...new Set(jogos.map(j => j.plataforma))];
    const anos = [...new Set(jogos.map(j => j.ano))].sort((a, b) => b - a);

    generos.forEach(g => filtroGenero.innerHTML += `<option value="${g}">${g}</option>`);
    plataformas.forEach(p => filtroPlataforma.innerHTML += `<option value="${p}">${p}</option>`);
    anos.forEach(a => filtroAno.innerHTML += `<option value="${a}">${a}</option>`);
}

// 3) Aplicar filtros, busca e ordenação juntos

function aplicarFiltros() {
    let textoBusca = inputBusca.value.toLowerCase().trim();
    let genero = filtroGenero.value;
    let plataforma = filtroPlataforma.value;
    let ano = filtroAno.value;
    let ordem = ordenacao.value;

    jogosFiltrados = jogos.filter(jogo => {
        let condBusca =
            jogo.titulo.toLowerCase().includes(textoBusca) ||
            jogo.descricao.toLowerCase().includes(textoBusca) ||
            jogo.desenvolvedora.toLowerCase().includes(textoBusca) ||
            jogo.tags.join(" ").toLowerCase().includes(textoBusca);

        let condGenero = genero === "" || jogo.genero === genero;
        let condPlataforma = plataforma === "" || jogo.plataforma === plataforma;
        let condAno = ano === "" || jogo.ano == ano;

        return condBusca && condGenero && condPlataforma && condAno;
    });

    ordenarJogos(ordem);
    paginaAtual = 1;
    mostrarGrid();
}

// 4) Ordenação

function ordenarJogos(tipo) {
    if (tipo === "titulo_asc") {
        jogosFiltrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (tipo === "titulo_desc") {
        jogosFiltrados.sort((a, b) => b.titulo.localeCompare(a.titulo));
    } else if (tipo === "ano_desc") {
        jogosFiltrados.sort((a, b) => b.ano - a.ano);
    } else if (tipo === "ano_asc") {
        jogosFiltrados.sort((a, b) => a.ano - b.ano);
    }
}

// 5) Exibir cards + paginação

function mostrarGrid() {
    cardsContainer.innerHTML = "";

    if (jogosFiltrados.length === 0) {
        cardsContainer.innerHTML =
            `<p class="col-span-full text-center text-slate-500 py-6">
                Nenhum jogo encontrado.
             </p>`;
        document.getElementById("paginacao").innerHTML = "";
        return;
    }

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const pagina = jogosFiltrados.slice(inicio, fim);

    pagina.forEach(jogo => criarCard(jogo));
    criarPaginacao();
}

// 6) Criar card usando o template do index.html

function criarCard(jogo) {
    const template = document.getElementById("cardTemplate");
    const card = template.content.cloneNode(true);

    const img = card.querySelector("img");
    const titulo = card.querySelector("h3");
    const desc = card.querySelector("p");
    const info = card.querySelector("div.text-xs");
    const btn = card.querySelector(".openBtn");

    img.src = jogo.capa;
    img.alt = jogo.titulo;

    titulo.textContent = jogo.titulo;
    desc.textContent = jogo.descricao.substring(0, 100) + "...";
    info.textContent = `${jogo.genero} • ${jogo.ano}`;

    btn.addEventListener("click", () => abrirModal(jogo));

    cardsContainer.appendChild(card);
}

// 7) Paginação

function criarPaginacao() {
    const totalPaginas = Math.ceil(jogosFiltrados.length / itensPorPagina);
    const container = document.getElementById("paginacao");
    container.innerHTML = "";

    for (let i = 1; i <= totalPaginas; i++) {
        const botao = document.createElement("button");
        botao.textContent = i;
        botao.className = 
            (i === paginaAtual) 
            ? "px-3 py-1 bg-cyan-600 text-white rounded" 
            : "px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300";

        botao.addEventListener("click", () => {
            paginaAtual = i;
            mostrarGrid();
        });

        container.appendChild(botao);
    }
}

// 8) Modal de detalhes

function abrirModal(jogo) {
    const modal = document.createElement("div");
    modal.className = 
        "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50";

    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6 max-w-lg w-full relative">
            <button class="absolute top-2 right-2 text-slate-500 hover:text-red-500 text-xl" id="fecharModal">×</button>
            
            <h2 class="text-xl font-bold mb-3">${jogo.titulo}</h2>
            <img src="${jogo.capa}" class="w-full rounded mb-4"/>

            <p class="text-slate-700 mb-3"><strong>Gênero:</strong> ${jogo.genero}</p>
            <p class="text-slate-700 mb-3"><strong>Plataforma:</strong> ${jogo.plataforma}</p>
            <p class="text-slate-700 mb-3"><strong>Ano:</strong> ${jogo.ano}</p>
            <p class="text-slate-700 mb-3"><strong>Desenvolvedora:</strong> ${jogo.desenvolvedora}</p>

            <p class="text-slate-700 mb-4">${jogo.descricao}</p>

            <p class="text-sm text-slate-600">Tags: ${jogo.tags.join(", ")}</p>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("fecharModal").onclick = () => modal.remove();
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
}

// 9) Resetar filtros

function resetFiltros() {
    inputBusca.value = "";
    filtroGenero.value = "";
    filtroPlataforma.value = "";
    filtroAno.value = "";
    ordenacao.value = "titulo_asc";

    aplicarFiltros();
}

// 10) Formulário de contato (feedback simples

const formContato = document.getElementById("formContato");
if (formContato) {
    formContato.addEventListener("submit", (e) => {
        e.preventDefault();

        document.getElementById("mensagemSucesso").classList.remove("hidden");
        formContato.reset();

        setTimeout(() => {
            document.getElementById("mensagemSucesso").classList.add("hidden");
        }, 3000);
    });
}
