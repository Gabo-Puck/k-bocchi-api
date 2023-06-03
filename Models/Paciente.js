const { Model } = require("objection");

class Paciente extends Model {
  static get tableName() {
    return "pacientes";
  }

  static relationMappings() {
    const Usuario = require("./Usuario");
    const Resena = require("./Resenas");
    return {
      usuario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: "pacientes.id_usuario",
          to: "usuarios.id",
        },
      },
      resenas: {
        relation: Model.HasManyRelation,
        modelClass: Resena,
        join: {
          from: "pacientes.id",
          to: "resenas.id_paciente",
        },
      },
    };
  }
}

module.exports = Paciente;
