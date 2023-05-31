const { Model } = require("objection");
const Terapeuta = require("./Terapeuta");
const Paciente = require("./Paciente");

class Resena extends Model {
  static get tableName() {
    return "resenas";
  }


  static relationMappings = {
    resenas_paciente: {
      relation: Model.HasOneRelation,
      modelClass: Paciente,
      join: {
        from: "pacientes.id",
        to: "resenas.id_paciente",
      },
    },
    resena_terapeuta: {
      relation: Model.BelongsToOneRelation,
      modelClass: Terapeuta,
      join: {
        from: "terapeutas.id",
        to: "resenas.id_terapeuta",
      },
    },
  };
}

module.exports = Resena;
