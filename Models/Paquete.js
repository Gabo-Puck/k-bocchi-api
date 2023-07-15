const { Model } = require("objection");
const DetalleTicket = require("./DetalleTicket");
const { obtenerFechaActualMexico } = require("../utils/fechas");

class Paquete extends Model {
  static get tableName() {
    return "paquetes";
  }
  $beforeInsert() {
    this.fecha_creacion = obtenerFechaActualMexico().toISOString();
  }
  static relationMappings() {
    return {
      contenido: {
        relation: Model.HasManyRelation,
        modelClass: DetalleTicket,
        join: {
          from: "paquetes.id",
          to: "detalle_ticket.id_paquete",
        },
      },
    };
  }
}

module.exports = Paquete;
