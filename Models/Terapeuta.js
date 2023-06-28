const { Model } = require("objection");
const NotaCompartida = require("./NotaCompartida");
class Terapeuta extends Model {
  static get tableName() {
    return "terapeutas";
  }

  static relationMappings() {
    const Nota = require("./Nota");
    const Horario = require("./Horario");
    const Cita = require("./Cita");
    const Paciente = require("./Paciente");
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
      horario: {
        relation: Model.HasManyRelation,
        modelClass: Horario,
        join: {
          from: "terapeutas.id",
          to: "horarios.id_terapeuta",
        },
      },
      pacientes: {
        relation: Model.ManyToManyRelation,
        modelClass: Paciente,
        join: {
          from: "terapeutas.id",
          through: {
            modelClass: Cita,
            from: "citas.id_terapeuta",
            to: "citas.id_paciente",
          },
          to: "pacientes.id",
        },
      },
      notas_compartidas: {
        relation: Model.ManyToManyRelation,
        modelClass: Nota,
        join: {
          from: "terapeutas.id",
          through: {
            modelClass: NotaCompartida,
            from: "nota_compartida.id_terapeuta",
            to: "nota_compartida.id_nota",
          },
          to: "notas.id",
        },
      },
      paciente_resenado: {
        relation: Model.ManyToManyRelation,
        modelClass: Paciente,
        join: {
          from: "terapeutas.id",
          through: {
            modelClass: Resena,
            from: "resena.id_terapeuta",
            to: "resena.id_paciente",
          },
          to: "pacientes.id",
        },
      },
    };
  }
}
module.exports = Terapeuta;
