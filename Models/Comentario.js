const { Model } = require("objection");
const Paciente = require("./Paciente");
const Terapeuta = require("./Terapeuta");
class Comentario extends Model {
  static get tableName() {
    return "comentarios";
  }

  static relationMappings = {
    comentario_paciente: {
      relation: Model.HasOneRelation,
      modelClass: Paciente,
      join: {
        from: "paciente.id",
        to: "comentarios.id_paciente",
      },
    },
    comentario_terapeuta: {
      relation: Model.HasOneRelation,
      modelClass: Terapeuta,
      join: {
        to: "terapeutas.id",
        from: "comentarios.id_terapeuta",
      },
    },
  };
}
module.exports = Comentario;
