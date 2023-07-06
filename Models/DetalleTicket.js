const { Model } = require("objection");

class DetalleTicket extends Model {
  static get tableName() {
    return "detalle_ticket";
  }

  static relationMappings() {
    const Producto = require("./Productos");
    const Ticket = require("./Ticket");
    return {
      producto: {
        relation: Model.BelongsToOneRelation,
        modelClass: Producto,
        join: {
          from: "detalle_ticket.id_producto",
          to: "productos.id",
        },
      },
      ticket: {
        relation: Model.BelongsToOneRelation,
        modelClass: Ticket,
        join: {
          from: "detalle_ticket.id_ticket",
          to: "tickets.id",
        },
      },
    };
  }
}

module.exports = DetalleTicket;
