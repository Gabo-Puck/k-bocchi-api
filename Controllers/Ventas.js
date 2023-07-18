const { raw } = require("objection");
const Paquete = require("../Models/Paquete");
const Ticket = require("../Models/Ticket");
const date = require("date-and-time");
const {
  patternFecha,
  obtenerFechaActualMexico,
  patternFechaCompleta,
} = require("../utils/fechas");
const DetalleTicket = require("../Models/DetalleTicket");

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
  let { mes } = req.query;
  let anioActual = obtenerFechaActualMexico().getFullYear();
  let f1 = date.parse(`${mes} ${anioActual}`, "M YYYY"); //fecha de inicio del mes actual / fecha final del mes pasado
  let f2 = date.addMonths(f1, 1); //fecha final del mes actual
  let f3 = date.addMonths(f1, -1); //fecha de inicio del mes pasado
  console.log({ f1, f2, f3 });
  try {
    //las ventas del mes actual
    let ventas_actual = await DetalleTicket.query()
      .joinRelated("ticket")
      .select(["id_producto", "nombre", "id_ticket"])
      .sum("cantidad as cantidad_vendida")
      .where("id_terapeuta", "=", id_terapeuta)
      .groupBy("id_producto")
      .where((builder) => {
        builder
          .where("ticket.fecha", ">=", date.format(f1, patternFechaCompleta))
          .andWhere("ticket.fecha", "<", date.format(f2, patternFechaCompleta));
      })
      .debug()
      .orderBy("cantidad_vendida", "DESC");
    //las ventas del mes actual
    let ventas_anterior;
    if (mes > 1)
      ventas_anterior = await DetalleTicket.query()
        .joinRelated("ticket")
        .select(["id_producto", "nombre", "id_ticket"])
        .sum("cantidad as cantidad_vendida")
        .where("id_terapeuta", "=", id_terapeuta)
        .groupBy("id_producto")
        .where((builder) => {
          builder
            .where("ticket.fecha", ">=", date.format(f3, patternFechaCompleta))
            .andWhere(
              "ticket.fecha",
              "<",
              date.format(f1, patternFechaCompleta)
            );
        })
        .debug()
        .orderBy("cantidad_vendida", "DESC");
    // .orderBy("fecha", "DESC");
    return res.status(200).json({ ventas_anterior, ventas_actual });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
