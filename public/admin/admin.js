let produtos = [];

let variantes = [];


// ===================================================
// LOGIN
// ===================================================

async function verificarLogin() {

    const resposta =

        await fetch(
            "/api/admin/verificar"
        );


    if (!resposta.ok) {

        window.location.href =
            "login.html";

        return;

    }


    carregarProdutos();

}


verificarLogin();


// ===================================================
// PRODUTOS
// ===================================================

async function carregarProdutos() {

    const resposta =

        await fetch(
            "/api/admin/produtos"
        );


    produtos =
        await resposta.json();


    mostrarProdutos();

}


// ===================================================
// NOVA VARIANTE
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

    const area =

        document.getElementById(
            "variantes"
        );


    area.innerHTML = "";


    variantes.forEach(

        (variante, indice) => {


            const bloco =

                document.createElement(
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
                        onclick="
                            removerVariante(
                                ${indice}
                            )
                        "
                    >
                        Excluir
                    </button>

                </div>


                <label>
                    Nome da cor/modelo
                </label>

                <input
                    type="text"
                    value="${variante.nome}"
                    placeholder="Ex: Amarela"
                    oninput="
                        variantes[${indice}].nome =
                        this.value
                    "
                >


                <label>
                    Cor
                </label>

                <input
                    type="color"
                    value="${variante.cor}"
                    onchange="
                        variantes[${indice}].cor =
                        this.value
                    "
                >


                <label>
                    Preço desta versão
                </label>

                <input
                    type="number"
                    step="0.01"
                    value="${variante.preco}"
                    placeholder="159.90"
                    oninput="
                        variantes[${indice}].preco =
                        this.value
                    "
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
                    Fotos
                </label>


                <p class="ajuda">
                    Adicione frente, costas, laterais e detalhes.
                </p>


                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onchange="
                        selecionarImagens(
                            ${indice},
                            this.files
                        )
                    "
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
// TAMANHOS
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
                            variante.tamanhos
                                .includes(
                                    tamanho
                                )
                                ?
                                "checked"
                                :
                                ""
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

        variantes[indice]
            .tamanhos =

            variantes[indice]
                .tamanhos
                .filter(

                    t =>
                        t !==
                        tamanho

                );

    }

}


// ===================================================
// FOTOS
// ===================================================

function selecionarImagens(
    indice,
    arquivos
) {

    variantes[indice]
        .novosArquivos = [

            ...arquivos

        ];

}


// ===================================================
// FOTOS EXISTENTES
// ===================================================

function criarFotos(
    variante,
    indice
) {

    return (
        variante.imagens ||
        []
    )
        .map(

            (imagem, fotoIndice) => `

                <div class="foto-admin">

                    <img
                        src="${imagem}"
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

    variantes[
        varianteIndice
    ]
        .imagens
        .splice(
            fotoIndice,
            1
        );


    mostrarVariantes();

}


// ===================================================
// REMOVER VARIANTE
// ===================================================

function removerVariante(indice) {

    variantes.splice(
        indice,
        1
    );


    mostrarVariantes();

}


// ===================================================
// SALVAR
// ===================================================

document
    .getElementById(
        "formProduto"
    )
    .addEventListener(

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
                    !variante.nome ||
                    !variante.preco
                ) {

                    alert(
                        "Preencha nome e preço de todas as versões."
                    );

                    return;

                }


                if (
                    variante.tamanhos
                        .length === 0
                ) {

                    alert(
                        "Escolha pelo menos um tamanho."
                    );

                    return;

                }

            }


            const id =

                document.getElementById(
                    "produtoId"
                ).value;


            const form =

                new FormData();


            form.append(

                "nome",

                document.getElementById(
                    "nome"
                ).value

            );


            form.append(

                "descricao",

                document.getElementById(
                    "descricao"
                ).value

            );


            form.append(

                "categoria",

                document.getElementById(
                    "categoria"
                ).value

            );


            form.append(

                "selo",

                document.getElementById(
                    "selo"
                ).value

            );


            form.append(

                "ativo",

                document.getElementById(
                    "ativo"
                ).checked

            );


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


            if (id) {

                resposta =

                    await fetch(

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

            else {

                resposta =

                    await fetch(

                        "/api/admin/produtos",

                        {

                            method:
                                "POST",

                            body:
                                form

                        }

                    );

            }


            if (resposta.ok) {

                alert(
                    "Produto salvo com sucesso!"
                );


                limparFormulario();

                carregarProdutos();

            }

            else {

                alert(
                    "Erro ao salvar."
                );

            }

        }

    );


// ===================================================
// LISTA ADMIN
// ===================================================

function mostrarProdutos() {

    const area =

        document.getElementById(
            "listaProdutos"
        );


    area.innerHTML = "";


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


            const div =

                document.createElement(
                    "div"
                );


            div.className =
                "produto-admin";


            div.innerHTML = `

                <img
                    src="${imagem}"
                >


                <div>

                    <h3>

                        ${produto.nome}

                    </h3>


                    <p>

                        A partir de
                        R$
                        ${Number(
                            preco
                        ).toFixed(2)}

                    </p>


                    <p>

                        ${
                            produto.variantes
                                ?.length || 0
                        }

                        cor(es)/modelo(s)

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
// EDITAR
// ===================================================

function editarProduto(id) {

    const produto =

        produtos.find(

            p =>
                p.id == id

        );


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


    variantes =

        produto.variantes
            .map(

                variante => ({

                    ...variante,

                    novosArquivos:
                        []

                })

            );


    mostrarVariantes();


    document.getElementById(
        "tituloFormulario"
    ).innerText =
        "Editar camisa";


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}


// ===================================================
// EXCLUIR
// ===================================================

async function excluirProduto(id) {

    if (
        !confirm(
            "Excluir este produto?"
        )
    ) {

        return;

    }


    await fetch(

        "/api/admin/produtos/" +
        id,

        {

            method:
                "DELETE"

        }

    );


    carregarProdutos();

}


// ===================================================
// LIMPAR
// ===================================================

function limparFormulario() {

    document
        .getElementById(
            "formProduto"
        )
        .reset();


    document.getElementById(
        "produtoId"
    ).value = "";


    document.getElementById(
        "ativo"
    ).checked = true;


    variantes = [];


    mostrarVariantes();


    document.getElementById(
        "tituloFormulario"
    ).innerText =
        "Adicionar camisa";

}


// ===================================================
// SAIR
// ===================================================

async function sair() {

    await fetch(

        "/api/logout",

        {

            method:
                "POST"

        }

    );


    window.location.href =
        "login.html";

}