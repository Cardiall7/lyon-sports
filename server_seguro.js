const express = require("express");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});

console.log("ADMIN1_USER carregado:", !!process.env.ADMIN1_USER);
console.log("ADMIN1_PASS carregado:", !!process.env.ADMIN1_PASS);
console.log("ADMIN2_USER carregado:", !!process.env.ADMIN2_USER);
console.log("ADMIN2_PASS carregado:", !!process.env.ADMIN2_PASS);

const app = express();

const PORT = process.env.PORT || 3000;


// =====================================================
// PASTAS
// =====================================================

const pastaDados = path.join(__dirname, "dados");

const arquivoProdutos = path.join(
    pastaDados,
    "produtos.json"
);

const pastaUploads = path.join(
    __dirname,
    "uploads"
);


if (!fs.existsSync(pastaDados)) {

    fs.mkdirSync(
        pastaDados,
        {
            recursive: true
        }
    );

}


if (!fs.existsSync(pastaUploads)) {

    fs.mkdirSync(
        pastaUploads,
        {
            recursive: true
        }
    );

}


if (!fs.existsSync(arquivoProdutos)) {

    fs.writeFileSync(
        arquivoProdutos,
        "[]"
    );

}


// =====================================================
// EXPRESS
// =====================================================

app.set("trust proxy", 1);

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


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

            httpOnly:
                true,

            secure:
                process.env.NODE_ENV ===
                "production",

            sameSite:
                "lax",

            maxAge:
                1000 *
                60 *
                60 *
                2

        }

    })
);


// =====================================================
// PROTEÇÃO DA PASTA ADMIN
// =====================================================

app.use(
    "/admin",

    (req, res, next) => {

        const arquivosPublicos = [
            "/login.html",
            "/login.css",
            "/login.js"
        ];

        if (
            arquivosPublicos.includes(
                req.path
            )
        ) {
            return next();
        }

        if (
            !req.session.admin
        ) {
            return res.redirect(
                "/admin/login.html"
            );
        }

        next();
    }
);


// =====================================================
// ARQUIVOS PÚBLICOS
// =====================================================

app.use(

    express.static(

        path.join(
            __dirname,
            "public"
        )

    )

);


app.use(

    "/uploads",

    express.static(
        pastaUploads
    )

);


// =====================================================
// UPLOAD
// =====================================================

const storage = multer.diskStorage({

    destination: function (
        req,
        file,
        cb
    ) {

        cb(
            null,
            pastaUploads
        );

    },


    filename: function (
        req,
        file,
        cb
    ) {

        const nome =

            Date.now() +
            "-" +
            Math.round(
                Math.random() *
                1000000
            ) +
            path.extname(
                file.originalname
            );


        cb(
            null,
            nome
        );

    }

});


const upload = multer({

    storage: storage

});


// =====================================================
// PRODUTOS
// =====================================================

function lerProdutos() {

    const dados =

        fs.readFileSync(
            arquivoProdutos,
            "utf8"
        );


    return JSON.parse(
        dados
    );

}


function salvarProdutos(produtos) {

    fs.writeFileSync(

        arquivoProdutos,

        JSON.stringify(
            produtos,
            null,
            4
        )

    );

}


// =====================================================
// LIMITE DE TENTATIVAS DE LOGIN
// =====================================================

const limiteLogin = rateLimit({

    windowMs:
        15 * 60 * 1000,

    max:
        5,

    standardHeaders:
        true,

    legacyHeaders:
        false,

    message: {
        ok: false,
        mensagem:
            "Muitas tentativas. Aguarde 15 minutos."
    }

});


// =====================================================
// LOGIN
// =====================================================

app.post(
    "/api/login",

    limiteLogin,

    (req, res) => {

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

            return req.session.regenerate(
                (erro) => {

                    if (erro) {

                        return res
                            .status(500)
                            .json({
                                ok: false,
                                mensagem:
                                    "Erro ao iniciar sessão."
                            });

                    }

                    req.session.admin =
                        true;

                    req.session.usuario =
                        usuario;

                    req.session.save(
                        () => {

                            res.json({
                                ok: true
                            });

                        }
                    );

                }
            );

        }


        res.status(401).json({

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

    (req, res) => {

        req.session.destroy(
            () => {

                res.clearCookie(
                    "connect.sid"
                );

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

    (req, res) => {

        if (
            req.session.admin
        ) {

            return res.json({

                logado: true,

                usuario:
                    req.session.usuario

            });

        }


        res.status(401).json({

            logado: false

        });

    }

);


// =====================================================
// PROTEÇÃO
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
                    "Não autorizado"

            });

    }


    next();

}


// =====================================================
// PRODUTOS SITE
// =====================================================

app.get(
    "/api/produtos",

    (req, res) => {

        const produtos =

            lerProdutos()
                .filter(

                    produto =>
                        produto.ativo !==
                        false

                );


        res.json(
            produtos
        );

    }

);


// =====================================================
// PRODUTOS ADMIN
// =====================================================

app.get(
    "/api/admin/produtos",

    somenteAdmin,

    (req, res) => {

        res.json(
            lerProdutos()
        );

    }

);


// =====================================================
// NOVO PRODUTO
// =====================================================

app.post(
    "/api/admin/produtos",

    somenteAdmin,

    upload.any(),

    (req, res) => {

        const produtos =
            lerProdutos();


        let variantes = [];

        try {

            variantes =
                JSON.parse(
                    req.body.variantes
                );

        }

        catch {

            variantes = [];

        }


        variantes.forEach(
            (variante, indice) => {

                const arquivos =

                    req.files.filter(

                        arquivo =>
                            arquivo.fieldname ===
                            `variante_${indice}`

                    );


                variante.id =

                    Date.now() +
                    indice;


                variante.imagens =

                    arquivos.map(

                        arquivo =>
                            "/uploads/" +
                            arquivo.filename

                    );

            }
        );


        const produto = {

            id:
                Date.now(),

            nome:
                req.body.nome,

            descricao:
                req.body.descricao ||
                "",

            categoria:
                req.body.categoria,

            selo:
                req.body.selo ||
                "",

            ativo:
                req.body.ativo !==
                "false",

            variantes:
                variantes

        };


        produtos.push(
            produto
        );


        salvarProdutos(
            produtos
        );


        res.json(
            produto
        );

    }

);


// =====================================================
// EDITAR PRODUTO
// =====================================================

app.put(
    "/api/admin/produtos/:id",

    somenteAdmin,

    upload.any(),

    (req, res) => {

        const produtos =
            lerProdutos();


        const produto =

            produtos.find(

                p =>
                    p.id ==
                    req.params.id

            );


        if (!produto) {

            return res
                .status(404)
                .json({

                    erro:
                        "Produto não encontrado"

                });

        }


        let variantes = [];

        try {

            variantes =
                JSON.parse(
                    req.body.variantes
                );

        }

        catch {

            variantes = [];

        }


        variantes.forEach(

            (variante, indice) => {


                const novas =

                    req.files
                        .filter(

                            arquivo =>
                                arquivo.fieldname ===
                                `variante_${indice}`

                        )
                        .map(

                            arquivo =>
                                "/uploads/" +
                                arquivo.filename

                        );


                variante.id =

                    variante.id ||

                    (
                        Date.now() +
                        indice
                    );


                variante.imagens = [

                    ...(variante.imagens || []),

                    ...novas

                ];

            }

        );


        produto.nome =
            req.body.nome;


        produto.descricao =
            req.body.descricao ||
            "";


        produto.categoria =
            req.body.categoria;


        produto.selo =
            req.body.selo ||
            "";


        produto.ativo =
            req.body.ativo !==
            "false";


        produto.variantes =
            variantes;


        salvarProdutos(
            produtos
        );


        res.json(
            produto
        );

    }

);


// =====================================================
// EXCLUIR
// =====================================================

app.delete(
    "/api/admin/produtos/:id",

    somenteAdmin,

    (req, res) => {

        let produtos =
            lerProdutos();


        produtos =

            produtos.filter(

                produto =>
                    produto.id !=
                    req.params.id

            );


        salvarProdutos(
            produtos
        );


        res.json({

            ok: true

        });

    }

);


// =====================================================
// SERVIDOR
// =====================================================

app.listen(PORT, () => {

    console.log("Lyon Sports:");
    console.log("http://localhost:3000");

    console.log("Login Admin:");
    console.log("http://localhost:3000/admin/login.html");

    console.log("Painel Admin:");
    console.log("http://localhost:3000/admin/");

});