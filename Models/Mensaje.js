const { Model } = require("objection");
class Mensaje extends Model {
  static get tableName() {
    return "mensajes";
  }
  static get relationMappings() {
    const Usuario = require("./Usuario");
    return {
      usuario_from: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: "mensajes.id_from",
          to: "usuarios.id",
        },
      },
      usuario_to: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: "mensajes.id_to",
          to: "usuarios.id",
        },
      },
    };
  }
}

module.exports = Mensaje;
