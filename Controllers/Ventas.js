const { raw } = require("objection");
const Paquete = require("../Models/Paquete");
const Ticket = require("../Models/Ticket");

exports.verComprasPaciente = async (req, res, next) => {
  let { id_paciente } = req.params;
  try {
    let compras = await Ticket.query()
      .where("id_paciente", "=", id_paciente)
      .orderBy("fecha", "DESC");
    return res.status(200).json(compras);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.verTicket = async (req, res, next) => {
  let { id_ticket } = req.params;
  let { id_terapeuta } = req.query;
  try {
    let ticket = await Ticket.query()
      .withGraphJoined("[detalles.terapeuta.usuario,paciente.usuario]")
      .modifyGraph("detalles", (builder) => {
        builder.select(["*", raw("FN_SELEC_IMAGEN(id_producto)").as("imagen")]);
        if (id_terapeuta) {
          builder.where("id_terapeuta", "=", id_terapeuta);
        }
      })
      .modifyGraph("detalles.terapeuta", (builder) => {
        builder.select(["id", "id_usuario"]);
      })
      .modifyGraph("detalles.terapeuta.usuario", (builder) => {
        builder.select(["id", "nombre", "foto_perfil"]);
      })
      .modifyGraph("paciente", (builder) => {
        builder.select(["id", "id_usuario"]);
      })
      .modifyGraph("paciente.usuario", (builder) => {
        builder.select(["id", "nombre", "foto_perfil"]);
      })

      .findById(id_ticket);
    if (!ticket) return res.status(404).json("No se enontro el ticket");
    return res.status(200).json(ticket);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.verVentasTerapeuta = async (req, res, next) => {
  let { id_terapeuta } = req.params;
  try {
    let ventas = await Ticket.query()
      .select(["tickets.id", "fecha", "id_paciente"])
      .joinRelated("detalles")
      .where("detalles.id_terapeuta", "=", id_terapeuta)
      .orderBy("fecha", "DESC");
    return res.status(200).json(ventas);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
