const { Model } = require("objection");
const Terapeuta = require("./Terapeuta");
class Cita extends Model {
  static get tableName() {
    return "citas";
  }
  $parseDatabaseJson(json) {
    // Remember to call the super class's implementation.
    
    json = super.$parseDatabaseJson(json);
    let date = new Date(json.fecha)
    console.log(date);
    // Do your conversion here.
    return json;
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
