const { Model } = require("objection");
const Usuario = require("./Usuario")
class Terapeuta extends Model{
    static get tableName(){
        return "terapeutas";
    }

    static relationMappings = {
        usuario:{
            relation: Model.BelongsToOneRelation,
            modelClass:Usuario,
            join:{
                from:"terapeuta.id_usuario",
                to:"usuario.id"
            }
        }
    }
    
}
module.exports = Terapeuta;