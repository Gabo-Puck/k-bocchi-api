const { Model } = require("objection");
class Comentario extends Model {
  static get tableName() {
    return "comentarios";
  }

  static relationMappings() {
    const Paciente = require("./Paciente");
    const Terapeuta = require("./Terapeuta");
    return {
      comentario_paciente: {
        relation: Model.HasOneRelation,
        modelClass: Paciente,
        join: {
          to: "pacientes.id",
          from: "comentarios.id_paciente",
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
}
module.exports = Comentario;
