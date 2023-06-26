const { fn } = require("objection");
const Cita = require("../Models/Cita");
const Terapeuta = require("../Models/Terapeuta");
const { patternFecha } = require("../utils/fechas");
const date = require("date-and-time");
exports.verCitasPaciente = async (req, res, next) => {
  let { id } = req.params;
  let { fecha } = req.query;

  try {
    let citas = await Cita.query()
      .withGraphJoined("terapeuta_datos.[usuario]")
      .where("id_paciente", "=", id)
      .modify((builder) => {
        if (fecha) {
          let fechaInicio = date.parse(fecha, patternFecha);
          if (fecha && !isNaN(fechaInicio)) {
            let fechaInicioFormateada = date.format(fechaInicio, patternFecha);
            builder.andWhere("fecha", ">=", fechaInicioFormateada);
          }
        }
      })
      .orderBy("fecha", "DESC");
    res.status(200).json(citas);
  } catch (err) {
    console.log(err);
    res.status(500).json("Algo ha salido mal");
  }
};

exports.verTerapeutasPaciente = async (req, res, next) => {
  let { id } = req.params;
  let { busqueda } = req.query;
  try {
    let terapeutas = await Terapeuta.query()
      .withGraphJoined("usuario")
      .joinRelated("pacientes as p")
      .where("p.id", "=", id)
      .modifyGraph("usuario", (builder) => {
        builder.select("id", "rol", "nombre", "telefono", "foto_perfil");
      })
      .modify((builder) => {
        if (busqueda) {
          builder.whereRaw(
            `(usuario.nombre like "%${busqueda}%" OR terapeutas.nombre_del_consultorio like "%${busqueda}%" OR terapeutas.numero_cedula like "${busqueda}%")`
          );
        }
        builder.select(
          "terapeutas.id",
          "terapeutas.id_usuario",
          "nombre_del_consultorio",
          "numero_cedula"
        );
      });
    return res.status(200).json(terapeutas);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
