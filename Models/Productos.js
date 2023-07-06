const { Model } = require("objection");
const DetalleTicket = require("./DetalleTicket");

class Producto extends Model {
  static get tableName() {
    return "productos";
  }

  static relationMappings() {
    const Ticket = require("./Ticket");
    const Terapeuta = require("./Terapeuta");
    return {
      terapeuta: {
        relation: Model.BelongsToOneRelation,
        modelClass: Terapeuta,
        join: {
          from: "productos.id_terapeuta",
          to: "terapeuta.id",
        },
      },
      ticket_producto: {
        relation: Model.ManyToManyRelation,
        modelClass: Ticket,
        join: {
          from: "productos.id",
          through: {
            modelClass: DetalleTicket,
            from: "detalle_ticket.id_producto",
            to: "detalle_ticket.id_ticket",
          },
          to: "tickets.id",
        },
      },
    };
  }
}

module.exports = Producto;
