const form =
    document.getElementById(
        "formLogin"
    );


form.addEventListener(

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

                            usuario,
                            senha

                        })

                }

            );


        if (
            resposta.ok
        ) {

            window.location.href =
                "index.html";

        }

        else {

            document.getElementById(
                "erro"
            ).innerText =

                "Usuário ou senha incorretos.";

        }

    }

);