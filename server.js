const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const { Pool } = require("pg");
const { v2: cloudinary } = require("cloudinary");

require("dotenv").config();

const app = express();

const PORT =
    process.env.PORT || 3000;


// =====================================================
// RENDER / PROXY
// =====================================================

app.set(
    "trust proxy",
    1
);


// =====================================================
// BANCO POSTGRESQL
// =====================================================

const usandoRenderExterno =
    process.env.DATABASE_URL &&
    process.env.DATABASE_URL.includes("render.com");

const pool = new Pool({

    connectionString:
        process.env.DATABASE_URL,

    ssl: usandoRenderExterno
        ? {
            rejectUnauthorized: false
        }
        : false

});


// =====================================================
// CLOUDINARY
// =====================================================

cloudinary.config({

    cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,

    api_key:
        process.env.CLOUDINARY_API_KEY,

    api_secret:
        process.env.CLOUDINARY_API_SECRET

});


// =====================================================
// EXPRESS
// =====================================================

app.use(
    express.json()
);


app.use(

    express.urlencoded({

        extended: true

    })

);


// =====================================================
// SESSÃO ADMIN
// =====================================================

app.use(

    session({

        secret:
            process.env.SESSION_SECRET ||
            "lyon-sports",

        resave:
            false,

        saveUninitialized:
            false,

        cookie: {

            maxAge:
                1000 *
                60 *
                60 *
                8,

            httpOnly:
                true,

            sameSite:
                "lax",

            secure:
                process.env.NODE_ENV ===
                "production"

        }

    })

);


// =====================================================
// SITE PÚBLICO
// =====================================================

app.use(

    express.static(

        path.join(
            __dirname,
            "public"
        )

    )

);


// =====================================================
// MULTER
// =====================================================

// Agora as fotos ficam temporariamente
// na memória e depois vão para o Cloudinary.

const upload = multer({

    storage:
        multer.memoryStorage(),

    limits: {

        fileSize:
            10 * 1024 * 1024

    },

    fileFilter: function (
        req,
        file,
        cb
    ) {

        if (
            file.mimetype.startsWith(
                "image/"
            )
        ) {

            cb(
                null,
                true
            );

        }

        else {

            cb(
                new Error(
                    "Envie somente imagens."
                ),
                false
            );

        }

    }

});


// =====================================================
// CRIAR TABELA AUTOMATICAMENTE
// =====================================================

async function criarTabela() {

    await pool.query(`

        CREATE TABLE IF NOT EXISTS produtos (

            id BIGSERIAL PRIMARY KEY,

            nome TEXT NOT NULL,

            descricao TEXT DEFAULT '',

            categoria TEXT NOT NULL,

            selo TEXT DEFAULT '',

            ativo BOOLEAN NOT NULL DEFAULT TRUE,

            variantes JSONB NOT NULL DEFAULT '[]'::jsonb,

            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

            atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()

        );

    `);

}


// =====================================================
// ENVIAR FOTO PARA CLOUDINARY
// =====================================================

function enviarImagemCloudinary(
    arquivo
) {

    return new Promise(

        (
            resolve,
            reject
        ) => {


            const stream =

                cloudinary
                    .uploader
                    .upload_stream(

                        {

                            folder:
                                "lyon-sports/produtos",

                            resource_type:
                                "image"

                        },

                        (
                            erro,
                            resultado
                        ) => {


                            if (erro) {

                                reject(
                                    erro
                                );

                                return;

                            }


                            resolve(
                                resultado.secure_url
                            );

                        }

                    );


            stream.end(
                arquivo.buffer
            );

        }

    );

}


// =====================================================
// LOGIN ADMIN
// =====================================================

app.post(

    "/api/login",

    (
        req,
        res
    ) => {


        const {

            usuario,
            senha

        } = req.body;


        const admin1 =

            usuario ===
                process.env.ADMIN1_USER

            &&

            senha ===
                process.env.ADMIN1_PASS;


        const admin2 =

            usuario ===
                process.env.ADMIN2_USER

            &&

            senha ===
                process.env.ADMIN2_PASS;


        if (
            admin1 ||
            admin2
        ) {


            req.session.admin =
                true;


            req.session.usuario =
                usuario;


            return res.json({

                ok: true

            });

        }


        res
            .status(401)
            .json({

                ok: false,

                mensagem:
                    "Usuário ou senha incorretos."

            });

    }

);


// =====================================================
// LOGOUT
// =====================================================

app.post(

    "/api/logout",

    (
        req,
        res
    ) => {


        req.session.destroy(

            () => {


                res.json({

                    ok: true

                });

            }

        );

    }

);


// =====================================================
// VERIFICAR LOGIN
// =====================================================

app.get(

    "/api/admin/verificar",

    (
        req,
        res
    ) => {


        if (
            req.session.admin
        ) {


            return res.json({

                logado: true,

                usuario:
                    req.session.usuario

            });

        }


        res
            .status(401)
            .json({

                logado: false

            });

    }

);


// =====================================================
// PROTEGER ROTAS ADMIN
// =====================================================

function somenteAdmin(
    req,
    res,
    next
) {


    if (
        !req.session.admin
    ) {


        return res
            .status(401)
            .json({

                erro:
                    "Não autorizado."

            });

    }


    next();

}


// =====================================================
// PRODUTOS DO SITE
// =====================================================

app.get(

    "/api/produtos",

    async (
        req,
        res
    ) => {


        try {


            const resultado =

                await pool.query(`

                    SELECT
                        id,
                        nome,
                        descricao,
                        categoria,
                        selo,
                        ativo,
                        variantes

                    FROM produtos

                    WHERE ativo = TRUE

                    ORDER BY id DESC

                `);


            res.json(
                resultado.rows
            );

        }

        catch (erro) {


            console.error(
                "Erro ao carregar produtos:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Erro ao carregar produtos."

                });

        }

    }

);


// =====================================================
// PRODUTOS ADMIN
// =====================================================

app.get(

    "/api/admin/produtos",

    somenteAdmin,

    async (
        req,
        res
    ) => {


        try {


            const resultado =

                await pool.query(`

                    SELECT
                        id,
                        nome,
                        descricao,
                        categoria,
                        selo,
                        ativo,
                        variantes

                    FROM produtos

                    ORDER BY id DESC

                `);


            res.json(
                resultado.rows
            );

        }

        catch (erro) {


            console.error(
                "Erro ao carregar produtos Admin:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Erro ao carregar produtos."

                });

        }

    }

);


// =====================================================
// CADASTRAR PRODUTO
// =====================================================

app.post(

    "/api/admin/produtos",

    somenteAdmin,

    upload.any(),

    async (
        req,
        res
    ) => {


        try {


            let variantes = [];


            try {


                variantes =
                    JSON.parse(
                        req.body.variantes ||
                        "[]"
                    );

            }

            catch {


                return res
                    .status(400)
                    .json({

                        erro:
                            "Dados das variantes inválidos."

                    });

            }


            // =============================================
            // ENVIAR FOTOS DE CADA COR/MODELO
            // =============================================

            for (
                let indice = 0;
                indice < variantes.length;
                indice++
            ) {


                const arquivos =

                    req.files.filter(

                        arquivo =>

                            arquivo.fieldname ===
                            `variante_${indice}`

                    );


                const imagens =
                    [];


                for (
                    const arquivo
                    of arquivos
                ) {


                    const url =

                        await enviarImagemCloudinary(
                            arquivo
                        );


                    imagens.push(
                        url
                    );

                }


                variantes[indice].id =

                    Date.now() +
                    indice;


                variantes[indice].imagens =
                    imagens;

            }


            const resultado =

                await pool.query(

                    `

                    INSERT INTO produtos (

                        nome,
                        descricao,
                        categoria,
                        selo,
                        ativo,
                        variantes

                    )

                    VALUES (

                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6::jsonb

                    )

                    RETURNING *

                    `,

                    [

                        req.body.nome,

                        req.body.descricao ||
                        "",

                        req.body.categoria,

                        req.body.selo ||
                        "",

                        req.body.ativo !==
                        "false",

                        JSON.stringify(
                            variantes
                        )

                    ]

                );


            res.json(
                resultado.rows[0]
            );

        }

        catch (erro) {


            console.error(
                "Erro ao cadastrar produto:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Erro ao cadastrar produto."

                });

        }

    }

);


// =====================================================
// EDITAR PRODUTO
// =====================================================

app.put(

    "/api/admin/produtos/:id",

    somenteAdmin,

    upload.any(),

    async (
        req,
        res
    ) => {


        try {


            let variantes = [];


            try {


                variantes =
                    JSON.parse(
                        req.body.variantes ||
                        "[]"
                    );

            }

            catch {


                return res
                    .status(400)
                    .json({

                        erro:
                            "Dados das variantes inválidos."

                    });

            }


            // =============================================
            // NOVAS IMAGENS
            // =============================================

            for (
                let indice = 0;
                indice < variantes.length;
                indice++
            ) {


                const arquivos =

                    req.files.filter(

                        arquivo =>

                            arquivo.fieldname ===
                            `variante_${indice}`

                    );


                const novasImagens =
                    [];


                for (
                    const arquivo
                    of arquivos
                ) {


                    const url =

                        await enviarImagemCloudinary(
                            arquivo
                        );


                    novasImagens.push(
                        url
                    );

                }


                variantes[indice].id =

                    variantes[indice].id ||

                    (
                        Date.now() +
                        indice
                    );


                variantes[indice].imagens = [

                    ...(
                        variantes[indice]
                            .imagens ||
                        []
                    ),

                    ...novasImagens

                ];

            }


            const resultado =

                await pool.query(

                    `

                    UPDATE produtos

                    SET
                        nome = $1,
                        descricao = $2,
                        categoria = $3,
                        selo = $4,
                        ativo = $5,
                        variantes = $6::jsonb,
                        atualizado_em = NOW()

                    WHERE id = $7

                    RETURNING *

                    `,

                    [

                        req.body.nome,

                        req.body.descricao ||
                        "",

                        req.body.categoria,

                        req.body.selo ||
                        "",

                        req.body.ativo !==
                        "false",

                        JSON.stringify(
                            variantes
                        ),

                        req.params.id

                    ]

                );


            if (
                resultado.rows.length ===
                0
            ) {


                return res
                    .status(404)
                    .json({

                        erro:
                            "Produto não encontrado."

                    });

            }


            res.json(
                resultado.rows[0]
            );

        }

        catch (erro) {


            console.error(
                "Erro ao editar produto:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Erro ao editar produto."

                });

        }

    }

);


// =====================================================
// EXCLUIR PRODUTO
// =====================================================

app.delete(

    "/api/admin/produtos/:id",

    somenteAdmin,

    async (
        req,
        res
    ) => {


        try {


            const resultado =

                await pool.query(

                    `

                    DELETE FROM produtos

                    WHERE id = $1

                    RETURNING id

                    `,

                    [
                        req.params.id
                    ]

                );


            if (
                resultado.rows.length ===
                0
            ) {


                return res
                    .status(404)
                    .json({

                        erro:
                            "Produto não encontrado."

                    });

            }


            res.json({

                ok: true

            });

        }

        catch (erro) {


            console.error(
                "Erro ao excluir produto:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Erro ao excluir produto."

                });

        }

    }

);


// =====================================================
// ERRO DE UPLOAD
// =====================================================

app.use(

    (
        erro,
        req,
        res,
        next
    ) => {


        console.error(
            erro
        );


        if (
            erro instanceof
            multer.MulterError
        ) {


            return res
                .status(400)
                .json({

                    erro:
                        "Erro no upload da imagem."

                });

        }


        res
            .status(500)
            .json({

                erro:
                    erro.message ||
                    "Erro interno do servidor."

            });

    }

);


// =====================================================
// INICIAR
// =====================================================

async function iniciarServidor() {


    try {


        await criarTabela();


        console.log(
            "Banco PostgreSQL conectado."
        );


        console.log(
            "Tabela de produtos pronta."
        );


        app.listen(

            PORT,

            () => {


                console.log(
                    `Lyon Sports: http://localhost:${PORT}`
                );


                console.log(
                    `Admin: http://localhost:${PORT}/login.html`
                );

            }

        );

    }

    catch (erro) {


        console.error(
            "Erro ao iniciar o servidor:",
            erro
        );


        process.exit(
            1
        );

    }

}


iniciarServidor();