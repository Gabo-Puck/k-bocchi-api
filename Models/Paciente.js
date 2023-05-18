const { Model } = require("objection");
const Usuario = require("./Usuario");

class Paciente extends Model{
    static get tableName(){
        return "pacientes";
    }

    static relationMappings = {
        usuario:{
            relation: Model.BelongsToOneRelation,
            modelClass:Usuario,
            join:{
                from:"paciente.id_usuario",
                to:"usuario.id"
            }
        }
    }
}

module.exports= Paciente;