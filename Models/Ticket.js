const { Model } = require("objection");
const Producto = require("./Productos");
const DetalleTicket = require("./DetalleTicket");

class Ticket extends Model {
  static get tableName() {
    return "tickets";
  }

  static relationMappings() {
    const Paciente = require("./Paciente");
    return {
      paciente: {
        relation: Model.BelongsToOneRelation,
        modelClass: Paciente,
        join: {
          from: "tickets.id_paciente",
          to: "pacientes.id",
        },
      },
      productos_ticket: {
        relation: Model.ManyToManyRelation,
        modelClass: Producto,
        join: {
          from: "tickets.id",
          through: {
            modelClass: DetalleTicket,
            from: "detalle_ticket.id_ticket",
            to: "detalle_ticket.id_producto",
          },
          to: "productos.id",
        },
      },
    };
  }
}

module.exports = Ticket;
