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
                from:"pacientes.id_usuario",
                to:"usuarios.id"
            }
        }
    }
}

module.exports= Paciente;