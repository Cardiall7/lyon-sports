// ===================================================
// LYON SPORTS - PAINEL ADMIN
// ===================================================


// ===================================================
// VARIÁVEIS
// ===================================================

let produtos = [];

let variantes = [];


// ===================================================
// VERIFICAR LOGIN
// ===================================================

async function verificarLogin() {

    try {

        const resposta = await fetch("/api/admin/verificar" + id);


        if (!resposta.ok) {

            window.location.href =
                "login.html";

            return;

        }


        carregarProdutos();

    }

    catch (erro) {

        console.log(
            "Erro ao verificar login:",
            erro
        );

    }

}


verificarLogin();


// ===================================================
// CARREGAR PRODUTOS
// ===================================================

async function carregarProdutos() {

    try {

        const resposta = await fetch(
            "/api/admin/produtos"
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar produtos"
            );

        }


        produtos =
            await resposta.json();


        mostrarProdutos();

    }

    catch (erro) {

        console.log(
            "Erro:",
            erro
        );

    }

}


// ===================================================
// ADICIONAR NOVA VARIANTE
// ===================================================

function adicionarVariante(
    dados = null
) {

    variantes.push({

        id:
            dados?.id || null,

        nome:
            dados?.nome || "",

        cor:
            dados?.cor || "#ffffff",

        preco:
            dados?.preco || "",

        tamanhos:
            dados?.tamanhos || [],

        imagens:
            dados?.imagens || [],

        novosArquivos:
            []

    });


    mostrarVariantes();

}


// ===================================================
// MOSTRAR VARIANTES
// ===================================================

function mostrarVariantes() {

    const area = document.getElementById(
        "variantes"
    );


    if (!area) {

        return;

    }


    area.innerHTML = "";


    variantes.forEach(

        (variante, indice) => {


            const bloco = document.createElement(
                "div"
            );


            bloco.className =
                "variante-admin";


            bloco.innerHTML = `

                <div class="variante-topo">

                    <h3>
                        Modelo ${indice + 1}
                    </h3>

                    <button
                        type="button"
                        onclick="removerVariante(${indice})"
                    >
                        Excluir
                    </button>

                </div>


                <label>
                    Nome da cor / modelo
                </label>

                <input
                    type="text"
                    value="${variante.nome}"
                    placeholder="Ex: Amarela"
                    oninput="variantes[${indice}].nome = this.value"
                >


                <label>
                    Cor
                </label>

                <input
                    type="color"
                    value="${variante.cor}"
                    onchange="variantes[${indice}].cor = this.value"
                >


                <label>
                    Preço desta versão
                </label>

                <input
                    type="number"
                    step="0.01"
                    value="${variante.preco}"
                    placeholder="159.90"
                    oninput="variantes[${indice}].preco = this.value"
                >


                <label>
                    Tamanhos disponíveis
                </label>

                <div class="tamanhos">

                    ${criarTamanhos(
                        variante,
                        indice
                    )}

                </div>


                <label>
                    Fotos da camiseta
                </label>

                <p class="ajuda">
                    Você pode adicionar frente, costas, laterais e detalhes.
                </p>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onchange="selecionarImagens(${indice}, this.files)"
                >


                <div class="fotos-variante">

                    ${criarFotos(
                        variante,
                        indice
                    )}

                </div>

            `;


            area.appendChild(
                bloco
            );

        }

    );

}


// ===================================================
// CRIAR TAMANHOS
// ===================================================

function criarTamanhos(
    variante,
    indice
) {

    const tamanhos = [

        "P",
        "M",
        "G",
        "GG",
        "XG"

    ];


    return tamanhos
        .map(

            tamanho => `

                <label>

                    <input
                        type="checkbox"

                        ${
                            variante.tamanhos.includes(
                                tamanho
                            )
                                ? "checked"
                                : ""
                        }

                        onchange="
                            alternarTamanho(
                                ${indice},
                                '${tamanho}',
                                this.checked
                            )
                        "
                    >

                    ${tamanho}

                </label>

            `

        )
        .join("");

}


// ===================================================
// ALTERAR TAMANHO
// ===================================================

function alternarTamanho(
    indice,
    tamanho,
    marcado
) {

    if (!variantes[indice]) {

        return;

    }


    if (marcado) {

        if (

            !variantes[indice]
                .tamanhos
                .includes(
                    tamanho
                )

        ) {

            variantes[indice]
                .tamanhos
                .push(
                    tamanho
                );

        }

    }

    else {

        variantes[indice].tamanhos =

            variantes[indice]
                .tamanhos
                .filter(

                    item =>
                        item !== tamanho

                );

    }

}


// ===================================================
// SELECIONAR NOVAS IMAGENS
// ===================================================

function selecionarImagens(
    indice,
    arquivos
) {

    if (!variantes[indice]) {

        return;

    }


    variantes[indice].novosArquivos = [

        ...arquivos

    ];

}


// ===================================================
// MOSTRAR FOTOS EXISTENTES
// ===================================================

function criarFotos(
    variante,
    indice
) {

    if (
        !variante.imagens ||
        variante.imagens.length === 0
    ) {

        return "";

    }


    return variante.imagens
        .map(

            (imagem, fotoIndice) => `

                <div class="foto-admin">

                    <img
                        src="${imagem}"
                        alt="Foto do produto"
                    >

                    <button
                        type="button"
                        onclick="
                            removerFoto(
                                ${indice},
                                ${fotoIndice}
                            )
                        "
                    >
                        ×
                    </button>

                </div>

            `

        )
        .join("");

}


// ===================================================
// REMOVER FOTO
// ===================================================

function removerFoto(
    varianteIndice,
    fotoIndice
) {

    if (
        !variantes[varianteIndice]
    ) {

        return;

    }


    variantes[
        varianteIndice
    ].imagens.splice(

        fotoIndice,
        1

    );


    mostrarVariantes();

}


// ===================================================
// REMOVER VARIANTE
// ===================================================

function removerVariante(
    indice
) {

    const confirmar = confirm(
        "Deseja remover esta cor/modelo?"
    );


    if (!confirmar) {

        return;

    }


    variantes.splice(
        indice,
        1
    );


    mostrarVariantes();

}


// ===================================================
// SALVAR PRODUTO
// ===================================================

const formProduto =
    document.getElementById(
        "formProduto"
    );


if (formProduto) {

    formProduto.addEventListener(

        "submit",

        async function(event) {

            event.preventDefault();


            if (
                variantes.length === 0
            ) {

                alert(
                    "Adicione pelo menos uma cor/modelo."
                );

                return;

            }


            for (
                const variante
                of variantes
            ) {

                if (
                    !variante.nome
                ) {

                    alert(
                        "Digite o nome de todas as cores/modelos."
                    );

                    return;

                }


                if (
                    !variante.preco
                ) {

                    alert(
                        "Digite o preço de todas as versões."
                    );

                    return;

                }


                if (
                    variante.tamanhos.length === 0
                ) {

                    alert(
                        "Escolha pelo menos um tamanho para cada versão."
                    );

                    return;

                }

            }


            const id = document.getElementById(
                "produtoId"
            ).value;


            const form = new FormData();


            // NOME

            form.append(

                "nome",

                document.getElementById(
                    "nome"
                ).value

            );


            // DESCRIÇÃO

            form.append(

                "descricao",

                document.getElementById(
                    "descricao"
                ).value

            );


            // CATEGORIA

            form.append(

                "categoria",

                document.getElementById(
                    "categoria"
                ).value

            );


            // SELO

            form.append(

                "selo",

                document.getElementById(
                    "selo"
                ).value

            );


            // ATIVO

            form.append(

                "ativo",

                document.getElementById(
                    "ativo"
                ).checked

            );


            // ===================================================
            // DADOS DAS VARIANTES
            // ===================================================

            const dadosVariantes =

                variantes.map(

                    variante => ({

                        id:
                            variante.id,

                        nome:
                            variante.nome,

                        cor:
                            variante.cor,

                        preco:
                            Number(
                                variante.preco
                            ),

                        tamanhos:
                            variante.tamanhos,

                        imagens:
                            variante.imagens

                    })

                );


            form.append(

                "variantes",

                JSON.stringify(
                    dadosVariantes
                )

            );


            // ===================================================
            // NOVAS FOTOS
            // ===================================================

            variantes.forEach(

                (variante, indice) => {


                    variante
                        .novosArquivos
                        .forEach(

                            arquivo => {


                                form.append(

                                    `variante_${indice}`,

                                    arquivo

                                );

                            }

                        );

                }

            );


            let resposta;


            // ===================================================
            // EDITAR
            // ===================================================

            if (id) {

                resposta = await fetch(

                    "/api/admin/produtos/" +
                    id,

                    {

                        method:
                            "PUT",

                        body:
                            form

                    }

                );

            }


            // ===================================================
            // CRIAR
            // ===================================================

            else {

                resposta = await fetch(

                    "/api/admin/produtos",

                    {

                        method:
                            "POST",

                        body:
                            form

                    }

                );

            }


            if (
                resposta.ok
            ) {

                alert(
                    "Produto salvo com sucesso!"
                );


                limparFormulario();


                carregarProdutos();

            }

            else {

                const erro =
                    await resposta.text();


                console.log(
                    erro
                );


                alert(
                    "Erro ao salvar o produto."
                );

            }

        }

    );

}


// ===================================================
// MOSTRAR PRODUTOS CADASTRADOS
// ===================================================

function mostrarProdutos() {

    const area = document.getElementById(
        "listaProdutos"
    );


    if (!area) {

        return;

    }


    area.innerHTML = "";


    if (
        produtos.length === 0
    ) {

        area.innerHTML = `

            <p>
                Nenhum produto cadastrado.
            </p>

        `;

        return;

    }


    produtos.forEach(

        produto => {


            const variante =
                produto.variantes?.[0];


            const imagem =

                variante?.imagens?.[0]

                ||

                "logo-lion-2.jpeg";


            const preco =

                variante?.preco ||
                0;


            const quantidadeVariantes =

                produto.variantes?.length
                ||
                0;


            const div =

                document.createElement(
                    "div"
                );


            div.className =
                "produto-admin";


            div.innerHTML = `

                <img
                    src="${imagem}"
                    alt="${produto.nome}"
                >


                <div>

                    <h3>
                        ${produto.nome}
                    </h3>


                    <p>

                        A partir de:

                        ${formatarDinheiro(
                            preco
                        )}

                    </p>


                    <p>

                        ${quantidadeVariantes}

                        cor(es) / modelo(s)

                    </p>


                    <p>

                        ${
                            produto.ativo !== false

                            ?

                            "Visível no site"

                            :

                            "Oculto no site"
                        }

                    </p>

                </div>


                <div class="acoes">

                    <button
                        class="editar"
                        onclick="
                            editarProduto(
                                ${produto.id}
                            )
                        "
                    >

                        Editar

                    </button>


                    <button
                        class="excluir"
                        onclick="
                            excluirProduto(
                                ${produto.id}
                            )
                        "
                    >

                        Excluir

                    </button>

                </div>

            `;


            area.appendChild(
                div
            );

        }

    );

}


// ===================================================
// FORMATAR DINHEIRO
// ===================================================

function formatarDinheiro(
    valor
) {

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
// EDITAR PRODUTO
// ===================================================

function editarProduto(
    id
) {

    const produto =

        produtos.find(

            item =>
                item.id == id

        );


    if (!produto) {

        return;

    }


    document.getElementById(
        "produtoId"
    ).value =
        produto.id;


    document.getElementById(
        "nome"
    ).value =
        produto.nome;


    document.getElementById(
        "descricao"
    ).value =
        produto.descricao || "";


    document.getElementById(
        "categoria"
    ).value =
        produto.categoria;


    document.getElementById(
        "selo"
    ).value =
        produto.selo || "";


    document.getElementById(
        "ativo"
    ).checked =
        produto.ativo !== false;


    // COPIA AS VARIANTES

    variantes =

        (produto.variantes || [])
            .map(

                variante => ({

                    id:
                        variante.id,

                    nome:
                        variante.nome,

                    cor:
                        variante.cor ||
                        "#ffffff",

                    preco:
                        variante.preco,

                    tamanhos:

                        [
                            ...(
                                variante.tamanhos ||
                                []
                            )
                        ],

                    imagens:

                        [
                            ...(
                                variante.imagens ||
                                []
                            )
                        ],

                    novosArquivos:
                        []

                })

            );


    mostrarVariantes();


    const titulo =

        document.getElementById(
            "tituloFormulario"
        );


    if (titulo) {

        titulo.innerText =
            "Editar camisa";

    }


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}


// ===================================================
// EXCLUIR PRODUTO
// ===================================================

async function excluirProduto(
    id
) {

    const confirmar = confirm(
        "Deseja realmente excluir este produto?"
    );


    if (!confirmar) {

        return;

    }


    try {

        const resposta = await fetch(

            "/api/admin/produtos/" +
            id,

            {

                method:
                    "DELETE"

            }

        );


        if (
            resposta.ok
        ) {

            alert(
                "Produto excluído."
            );


            carregarProdutos();

        }

        else {

            alert(
                "Erro ao excluir."
            );

        }

    }

    catch (erro) {

        console.log(
            erro
        );

    }

}


// ===================================================
// LIMPAR FORMULÁRIO
// ===================================================

function limparFormulario() {

    const formulario =

        document.getElementById(
            "formProduto"
        );


    if (formulario) {

        formulario.reset();

    }


    const produtoId =

        document.getElementById(
            "produtoId"
        );


    if (produtoId) {

        produtoId.value = "";

    }


    const ativo =

        document.getElementById(
            "ativo"
        );


    if (ativo) {

        ativo.checked =
            true;

    }


    variantes = [];


    mostrarVariantes();


    const titulo =

        document.getElementById(
            "tituloFormulario"
        );


    if (titulo) {

        titulo.innerText =
            "Adicionar camisa";

    }

}


// ===================================================
// SAIR DO ADMIN
// ===================================================

async function sair() {

    try {

        await fetch(

            "/api/logout",

            {

                method:
                    "POST"

            }

        );

    }

    catch (erro) {

        console.log(
            erro
        );

    }


    window.location.href =
        "login.html";

}