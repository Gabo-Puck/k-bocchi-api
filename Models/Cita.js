const { Model } = require("objection");
const Terapeuta = require("./Terapeuta");
class Cita extends Model {
  static get tableName() {
    return "citas";
  }

  static relationMappings() {
    const Usuario = require("./Usuario");
    const Resena = require("./Resenas");
    const Comentario = require("./Comentario");
    return {
      terapeuta_horario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Terapeuta,
        join: {
          from: "horarios.id_terapeuta",
          to: "terapeutas.id",
        },
      },
    };
  }
}
module.exports = {
  Cita,
};
