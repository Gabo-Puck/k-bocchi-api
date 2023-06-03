const { Model } = require("objection");
class Terapeuta extends Model {
  static get tableName() {
    return "terapeutas";
  }

  static relationMappings() {
    const Usuario = require("./Usuario");
    const Resena = require("./Resenas");
    const Comentario = require("./Comentario");
    return {
      usuario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: "terapeutas.id_usuario",
          to: "usuarios.id",
        },
      },
      resenas: {
        relation: Model.HasManyRelation,
        modelClass: Resena,
        join: {
          from: "terapeutas.id",
          to: "resenas.id_terapeuta",
        },
      },
      comentarios: {
        relation: Model.HasManyRelation,
        modelClass: Comentario,
        join: {
          from: "terapeutas.id",
          to: "comentarios.id_terapeuta",
        },
      },
    };
  }
}
module.exports = Terapeuta;
