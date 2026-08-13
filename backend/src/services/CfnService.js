const axios = require("axios");

async function vereficarCRN(nome){
    try{
        const response = await axios.post("https://crn.cfn.org.br/application/front-resource/get",
            {
                comando: "get-nutricionista",
                options:{
                    nome,
                    geral: true
                }
            },
            {
                headers:{
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    }catch(erro){
        console.error(erro.message);

        throw new Error("Erro na consulta do CFN");
    }
}

module.exports = {
    vereficarCRN
};