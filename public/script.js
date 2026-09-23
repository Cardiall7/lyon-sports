const numeroWhatsApp =
    "5519999234600";


let produtos = [];

let carrinho =

    JSON.parse(

        localStorage.getItem(
            "carrinhoLyonSports"
        )

    ) || [];


let produtoSelecionado = null;

let varianteSelecionada = null;

let tamanhoSelecionado = null;

let imagemAtual = 0;


// ===================================================
// PRODUTOS
// ===================================================

async function carregarProdutos() {

    const resposta =

        await fetch(
            "/api/produtos"
        );


    produtos =
        await resposta.json();


    mostrarProdutos();

}


function formatarDinheiro(valor) {

    return Number(valor)
        .toLocaleString(

            "pt-BR",

            {

                style:
                    "currency",

                currency:
                    "BRL"

            }

        );

}


// ===================================================
// MOSTRAR PRODUTOS
// ===================================================

function mostrarProdutos(
    categoria = "todos"
) {

    const lista =

        document.getElementById(
            "listaProdutos"
        );


    lista.innerHTML = "";


    const filtrados =

        categoria === "todos"

            ?

            produtos

            :

            produtos.filter(

                produto =>
                    produto.categoria ===
                    categoria

            );


    filtrados.forEach(

        produto => {


            const variante =

                produto.variantes?.[0];


            if (!variante) {

                return;

            }


            const imagem =

                variante.imagens?.[0]

                ||

                "logo-lion-2.jpeg";


            const card =

                document.createElement(
                    "div"
                );


            card.className =
                "produto";


            card.innerHTML = `

                <div
                    class="produto-imagem"

                    onclick="
                        abrirProduto(
                            ${produto.id}
                        )
                    "

                    onmousemove="
                        moverImagemCard(
                            event,
                            ${produto.id},
                            this
                        )
                    "

                    onmouseleave="
                        resetarImagemCard(
                            ${produto.id},
                            this
                        )
                    "

                    ontouchmove="
                        moverImagemCardTouch(
                            event,
                            ${produto.id},
                            this
                        )
                    "
                >

                    ${
                        produto.selo
                        ?
                        `

                        <span class="selo">

                            ${produto.selo}

                        </span>

                        `
                        :
                        ""
                    }


                    <img
                        src="${imagem}"
                        alt="${produto.nome}"
                    >

                </div>


                <div class="produto-info">

                    <small>
                        Lyon Sports
                    </small>


                    <h3>
                        ${produto.nome}
                    </h3>


                    <div class="produto-final">

                        <span class="preco">

                            ${formatarDinheiro(
                                variante.preco
                            )}

                        </span>


                        <button
                            class="adicionar"

                            onclick="
                                event.stopPropagation();
                                abrirProduto(
                                    ${produto.id}
                                )
                            "
                        >

                            Ver produto

                        </button>

                    </div>

                </div>

            `;


            lista.appendChild(
                card
            );

        }

    );

}


// ===================================================
// MOUSE EM CIMA DA CAMISA
// ===================================================

function moverImagemCard(
    event,
    produtoId,
    area
) {

    const produto =

        produtos.find(

            p =>
                p.id ==
                produtoId

        );


    const imagens =

        produto
            ?.variantes?.[0]
            ?.imagens;


    if (
        !imagens ||
        imagens.length < 2
    ) {

        return;

    }


    const posicao =

        event.offsetX /
        area.offsetWidth;


    let indice =

        Math.floor(

            posicao *
            imagens.length

        );


    if (
        indice >=
        imagens.length
    ) {

        indice =
            imagens.length -
            1;

    }


    area
        .querySelector(
            "img"
        )
        .src =
        imagens[indice];

}


// ===================================================
// DEDO NO CELULAR
// ===================================================

function moverImagemCardTouch(
    event,
    produtoId,
    area
) {

    const produto =

        produtos.find(

            p =>
                p.id ==
                produtoId

        );


    const imagens =

        produto
            ?.variantes?.[0]
            ?.imagens;


    if (
        !imagens ||
        imagens.length < 2
    ) {

        return;

    }


    const toque =

        event.touches[0];


    const rect =

        area.getBoundingClientRect();


    const x =

        toque.clientX -
        rect.left;


    const posicao =

        x /
        rect.width;


    let indice =

        Math.floor(

            posicao *
            imagens.length

        );


    indice =

        Math.max(

            0,

            Math.min(
                indice,
                imagens.length - 1
            )

        );


    area
        .querySelector(
            "img"
        )
        .src =
        imagens[indice];

}


// ===================================================
// RESET CARD
// ===================================================

function resetarImagemCard(
    produtoId,
    area
) {

    const produto =

        produtos.find(

            p =>
                p.id ==
                produtoId

        );


    const imagem =

        produto
            ?.variantes?.[0]
            ?.imagens?.[0];


    if (imagem) {

        area
            .querySelector(
                "img"
            )
            .src =
            imagem;

    }

}


// ===================================================
// ABRIR PRODUTO
// ===================================================

function abrirProduto(id) {

    produtoSelecionado =

        produtos.find(

            produto =>
                produto.id ==
                id

        );


    if (
        !produtoSelecionado
    ) {

        return;

    }


    varianteSelecionada =

        produtoSelecionado
            .variantes?.[0];


    tamanhoSelecionado =
        null;


    document.getElementById(
        "modalNome"
    ).innerText =
        produtoSelecionado.nome;


    document.getElementById(
        "modalDescricao"
    ).innerText =

        produtoSelecionado
            .descricao

        ||

        "Camisa esportiva Lyon Sports.";


    document.getElementById(
        "modalSelo"
    ).innerText =

        produtoSelecionado
            .selo || "";


    atualizarVarianteModal();


    document.getElementById(
        "produtoModalFundo"
    )
        .classList
        .add(
            "ativo"
        );


    document.body.style.overflow =
        "hidden";

}


// ===================================================
// CORES / VARIANTES
// ===================================================

function mostrarCores() {

    const area =

        document.getElementById(
            "coresProduto"
        );


    area.innerHTML = "";


    produtoSelecionado
        .variantes
        .forEach(

            variante => {


                const botao =

                    document.createElement(
                        "button"
                    );


                botao.className =
                    "cor-produto";


                if (
                    variante.id ===
                    varianteSelecionada.id
                ) {

                    botao.classList.add(
                        "ativa"
                    );

                }


                botao.innerHTML = `

                    <span
                        class="bolinha-cor"
                        style="
                            background:
                            ${variante.cor}
                        "
                    >
                    </span>

                    ${variante.nome}

                `;


                botao.onclick =

                    function() {

                        varianteSelecionada =
                            variante;


                        tamanhoSelecionado =
                            null;


                        atualizarVarianteModal();

                    };


                area.appendChild(
                    botao
                );

            }

        );

}


// ===================================================
// ATUALIZAR VARIANTE
// ===================================================

function atualizarVarianteModal() {

    document.getElementById(
        "modalPreco"
    ).innerText =

        formatarDinheiro(
            varianteSelecionada.preco
        );


    mostrarCores();

    mostrarTamanhos();

    mostrarGaleria();

}


// ===================================================
// TAMANHOS
// ===================================================

function mostrarTamanhos() {

    const area =

        document.getElementById(
            "tamanhosProduto"
        );


    area.innerHTML = "";


    varianteSelecionada
        .tamanhos
        .forEach(

            tamanho => {


                const botao =

                    document.createElement(
                        "button"
                    );


                botao.className =
                    "tamanho-produto";


                botao.innerText =
                    tamanho;


                if (
                    tamanho ===
                    tamanhoSelecionado
                ) {

                    botao
                        .classList
                        .add(
                            "ativo"
                        );

                }


                botao.onclick =

                    function() {

                        tamanhoSelecionado =
                            tamanho;


                        mostrarTamanhos();

                    };


                area.appendChild(
                    botao
                );

            }

        );

}


// ===================================================
// GALERIA
// ===================================================

function mostrarGaleria() {

    const imagens =

        varianteSelecionada
            .imagens || [];


    imagemAtual = 0;


    const principal =

        document.getElementById(
            "imagemProdutoPrincipal"
        );


    principal.src =

        imagens[0]

        ||

        "logo-lion-2.jpeg";


    const miniaturas =

        document.getElementById(
            "miniaturasProduto"
        );


    miniaturas.innerHTML = "";


    imagens.forEach(

        (imagem, indice) => {


            const miniatura =

                document.createElement(
                    "img"
                );


            miniatura.src =
                imagem;


            if (
                indice === 0
            ) {

                miniatura
                    .classList
                    .add(
                        "ativa"
                    );

            }


            miniatura.onclick =

                function() {

                    mudarImagemProduto(
                        indice
                    );

                };


            miniaturas
                .appendChild(
                    miniatura
                );

        }

    );

}


// ===================================================
// MUDAR IMAGEM
// ===================================================

function mudarImagemProduto(indice) {

    const imagens =

        varianteSelecionada
            .imagens;


    imagemAtual =
        indice;


    document.getElementById(
        "imagemProdutoPrincipal"
    ).src =
        imagens[indice];


    document
        .querySelectorAll(
            ".miniaturas-produto img"
        )
        .forEach(

            (
                imagem,
                i
            ) => {

                imagem
                    .classList
                    .toggle(

                        "ativa",

                        i === indice

                    );

            }

        );

}


// ===================================================
// PASSAR MOUSE NA IMAGEM GRANDE
// ===================================================

const areaImagem =

    document.getElementById(
        "imagemPrincipalArea"
    );


areaImagem.addEventListener(

    "mousemove",

    function(event) {

        if (
            !varianteSelecionada
        ) {

            return;

        }


        const imagens =

            varianteSelecionada
                .imagens;


        if (
            imagens.length <
            2
        ) {

            return;

        }


        const rect =

            areaImagem
                .getBoundingClientRect();


        const percentual =

            (
                event.clientX -
                rect.left
            )

            /

            rect.width;


        let indice =

            Math.floor(

                percentual *
                imagens.length

            );


        indice =

            Math.max(

                0,

                Math.min(

                    indice,

                    imagens.length -
                    1

                )

            );


        mudarImagemProduto(
            indice
        );

    }

);


// ===================================================
// PASSAR DEDO
// ===================================================

areaImagem.addEventListener(

    "touchmove",

    function(event) {

        if (
            !varianteSelecionada
        ) {

            return;

        }


        const imagens =

            varianteSelecionada
                .imagens;


        if (
            imagens.length <
            2
        ) {

            return;

        }


        const toque =

            event.touches[0];


        const rect =

            areaImagem
                .getBoundingClientRect();


        const percentual =

            (
                toque.clientX -
                rect.left
            )

            /

            rect.width;


        let indice =

            Math.floor(

                percentual *
                imagens.length

            );


        indice =

            Math.max(

                0,

                Math.min(

                    indice,

                    imagens.length -
                    1

                )

            );


        mudarImagemProduto(
            indice
        );

    },

    {
        passive: true
    }

);


// ===================================================
// ADICIONAR PRODUTO SELECIONADO
// ===================================================

function adicionarProdutoSelecionado() {

    if (
        !tamanhoSelecionado
    ) {

        alert(
            "Escolha o tamanho."
        );

        return;

    }


    const existente =

        carrinho.find(

            item =>

                item.produtoId ===
                    produtoSelecionado.id

                &&

                item.varianteId ===
                    varianteSelecionada.id

                &&

                item.tamanho ===
                    tamanhoSelecionado

        );


    if (existente) {

        existente.quantidade++;

    }

    else {

        carrinho.push({

            produtoId:
                produtoSelecionado.id,

            varianteId:
                varianteSelecionada.id,

            nome:
                produtoSelecionado.nome,

            cor:
                varianteSelecionada.nome,

            preco:
                varianteSelecionada.preco,

            tamanho:
                tamanhoSelecionado,

            imagem:
                varianteSelecionada
                    .imagens?.[0]

                ||

                "logo-lion-2.jpeg",

            quantidade:
                1

        });

    }


    salvarCarrinho();

    mostrarMensagem();

    fecharProduto();

}


// ===================================================
// FECHAR PRODUTO
// ===================================================

function fecharProduto(event) {

    if (
        event &&
        event.target.id !==
        "produtoModalFundo"
    ) {

        return;

    }


    document.getElementById(
        "produtoModalFundo"
    )
        .classList
        .remove(
            "ativo"
        );


    document.body.style.overflow =
        "";

}


// ===================================================
// FILTROS
// ===================================================

function filtrarProdutos(
    categoria,
    botao
) {

    mostrarProdutos(
        categoria
    );


    document
        .querySelectorAll(
            ".filtro"
        )
        .forEach(

            item =>
                item.classList
                    .remove(
                        "ativo"
                    )

        );


    if (botao) {

        botao
            .classList
            .add(
                "ativo"
            );

    }

}


// ===================================================
// CARRINHO
// ===================================================

function salvarCarrinho() {

    localStorage.setItem(

        "carrinhoLyonSports",

        JSON.stringify(
            carrinho
        )

    );


    atualizarCarrinho();

}


function atualizarCarrinho() {

    const area =

        document.getElementById(
            "itensCarrinho"
        );


    const vazio =

        document.getElementById(
            "carrinhoVazio"
        );


    area.innerHTML = "";


    let quantidadeTotal = 0;

    let total = 0;


    carrinho.forEach(

        (item, indice) => {


            quantidadeTotal +=
                item.quantidade;


            total +=

                item.preco *
                item.quantidade;


            const elemento =

                document.createElement(
                    "div"
                );


            elemento.className =
                "item-carrinho";


            elemento.innerHTML = `

                <img
                    src="${item.imagem}"
                >


                <div class="item-dados">

                    <h4>

                        ${item.nome}

                    </h4>


                    <small>

                        ${item.cor}

                        •

                        Tamanho
                        ${item.tamanho}

                    </small>


                    <p>

                        ${formatarDinheiro(
                            item.preco
                        )}

                    </p>


                    <div class="controle">

                        <button
                            onclick="
                                mudarQuantidade(
                                    ${indice},
                                    -1
                                )
                            "
                        >
                            -
                        </button>


                        <span>

                            ${item.quantidade}

                        </span>


                        <button
                            onclick="
                                mudarQuantidade(
                                    ${indice},
                                    1
                                )
                            "
                        >
                            +
                        </button>


                        <button
                            class="remover"

                            onclick="
                                removerProduto(
                                    ${indice}
                                )
                            "
                        >

                            Remover

                        </button>

                    </div>

                </div>

            `;


            area.appendChild(
                elemento
            );

        }

    );


    document.getElementById(
        "quantidadeCarrinho"
    ).innerText =
        quantidadeTotal;


    document.getElementById(
        "totalCarrinho"
    ).innerText =

        formatarDinheiro(
            total
        );


    vazio.style.display =

        carrinho.length

            ?

            "none"

            :

            "block";

}


// ===================================================
// QUANTIDADE
// ===================================================

function mudarQuantidade(
    indice,
    quantidade
) {

    carrinho[indice]
        .quantidade +=
        quantidade;


    if (
        carrinho[indice]
            .quantidade <=
        0
    ) {

        carrinho.splice(
            indice,
            1
        );

    }


    salvarCarrinho();

}


function removerProduto(indice) {

    carrinho.splice(
        indice,
        1
    );


    salvarCarrinho();

}


// ===================================================
// ABRIR CARRINHO
// ===================================================

function abrirCarrinho() {

    document.getElementById(
        "carrinho"
    )
        .classList
        .add(
            "ativo"
        );


    document.getElementById(
        "fundoCarrinho"
    )
        .classList
        .add(
            "ativo"
        );

}


function fecharCarrinho() {

    document.getElementById(
        "carrinho"
    )
        .classList
        .remove(
            "ativo"
        );


    document.getElementById(
        "fundoCarrinho"
    )
        .classList
        .remove(
            "ativo"
        );

}


// ===================================================
// WHATSAPP
// ===================================================

function finalizarPedido() {

    if (
        carrinho.length === 0
    ) {

        alert(
            "Seu carrinho está vazio."
        );

        return;

    }


    let total = 0;


    let mensagem =

`Olá! Quero fazer um pedido na Lyon Sports.

MEU PEDIDO:

`;


    carrinho.forEach(

        item => {


            const subtotal =

                item.preco *
                item.quantidade;


            total += subtotal;


            mensagem +=

`${item.nome}

Cor/Modelo: ${item.cor}

Tamanho: ${item.tamanho}

Quantidade: ${item.quantidade}

Subtotal: ${formatarDinheiro(subtotal)}

----------------------------

`;

        }

    );


    mensagem +=

`TOTAL: ${formatarDinheiro(total)}

Gostaria de finalizar o pedido.`;


    window.open(

        "https://wa.me/" +

        numeroWhatsApp +

        "?text=" +

        encodeURIComponent(
            mensagem
        ),

        "_blank"

    );

}


function abrirSuporte() {

    const mensagem =

        "Olá! Vim pelo site da Lyon Sports e gostaria de atendimento.";


    window.open(

        "https://wa.me/" +

        numeroWhatsApp +

        "?text=" +

        encodeURIComponent(
            mensagem
        ),

        "_blank"

    );

}


// ===================================================
// MENSAGEM
// ===================================================

function mostrarMensagem() {

    const mensagem =

        document.getElementById(
            "mensagem"
        );


    mensagem
        .classList
        .add(
            "ativo"
        );


    setTimeout(

        function() {

            mensagem
                .classList
                .remove(
                    "ativo"
                );

        },

        1800

    );

}


// ===================================================
// LOADING
// ===================================================

window.addEventListener(

    "load",

    function() {

        setTimeout(

            function() {

                const loading =

                    document.getElementById(
                        "loading"
                    );


                if (loading) {

                    loading
                        .classList
                        .add(
                            "sumir"
                        );

                }

            },

            2300

        );

    }

);


// ===================================================
// INICIAR
// ===================================================

carregarProdutos();

atualizarCarrinho();