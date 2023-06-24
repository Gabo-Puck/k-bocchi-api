const { Model } = require("objection");

class Paciente extends Model {
  static get tableName() {
    return "pacientes";
  }

  static relationMappings() {
    const Cita = require("./Cita");
    const Usuario = require("./Usuario");
    const Resena = require("./Resenas");
    const Terapeuta = require("./Terapeuta");
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
      citas: {
        relation: Model.HasManyRelation,
        modelClass: Cita,
        join: {
          from: "pacientes.id",
          to: "citas.id_paciente",
        },
      },
      terapeutas: {
        relation: Model.ManyToManyRelation,
        modelClass: Terapeuta,
        join: {
          from: "pacientes.id",
          through: {
            modelClass: Cita,
            from: "citas.id_paciente",
            to: "citas.id_terapeuta",
          },
          to: "terapeutas.id",
        },
      },
    };
  }
}

module.exports = Paciente;
