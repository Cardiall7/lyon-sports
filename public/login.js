// ==========================================
// LYON SPORTS
// LOGIN ADMIN
// ==========================================


const formLogin =
    document.getElementById(
        "formLogin"
    );


if (formLogin) {

    formLogin.addEventListener(

        "submit",

        async function(event) {

            event.preventDefault();


            const usuario =

                document.getElementById(
                    "usuario"
                ).value;


            const senha =

                document.getElementById(
                    "senha"
                ).value;


            const erro =

                document.getElementById(
                    "erro"
                );


            try {


                const resposta =

                    await fetch(

                        "/api/login",

                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    usuario:
                                        usuario,

                                    senha:
                                        senha

                                })

                        }

                    );


                if (resposta.ok) {

                    window.location.href =
                        "admin.html";

                    return;

                }


                const dados =
                    await resposta.json();


                erro.innerText =

                    dados.mensagem ||

                    "Usuário ou senha incorretos.";


            }

            catch (problema) {


                console.log(
                    problema
                );


                erro.innerText =

                    "Erro ao conectar com o servidor.";


            }

        }

    );

}