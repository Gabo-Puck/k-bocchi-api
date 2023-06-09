const { Cita } = require("../Models/Cita");
const date = require("date-and-time");
const { obtenerFechaActualMexico, patternFecha } = require("../utils/fechas");
// const patternFecha2 = date.compile("YYYY-MM-DD HH:mm:ss"); //Formateador que permite convertir un objeto Date a un string con el formato indicado de fecha

exports.crearCita = async (req, res, next) => {
  try {
    let cita = req.body;
    let citaCreada = await Cita.query().insertAndFetch(cita);
    return res.status(200).json(citaCreada);
  } catch (err) {
    console.log(err);
    res.status(500).json("Algo ha salido mal");
  }
};

exports.borrarCita = async (req, res, next) => {
  try {
    let { id } = req.body;
    let cita = await Cita.query().findById(id);
    if (!cita) return res.status(404).json("No se encontro la cita");
    await cita.$query().delete();
    return res.status(200).json(cita);
  } catch (err) {
    console.log(err);
    res.status(500).json("Algo ha salido mal");
  }
};

exports.modificarCita = async (req, res, next) => {
  try {
    let cita = req.body;
    let citaEncontrada = await Cita.query().findById(cita.id);
    if (!citaEncontrada) return res.status(404).json("No se encontro la cita");
    let citaModificada = await citaEncontrada.$query().patchAndFetch(cita);
    return res.status(200).json(citaModificada);
  } catch (err) {
    console.log(err);
    res.status(500).json("Algo ha salido mal");
  }
};

exports.verCita = async (req, res, next) => {
  try {
    let { id } = req.params;
    let citaEncontrada = await Cita.query().findById(id);
    if (!citaEncontrada) return res.status(404).json("No se encontro la cita");
    return res.status(200).json(citaEncontrada);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.verTodasCitas = async (req, res, next) => {
  try {
    let citas = await Cita.query();
    return res.status(200).json(citas);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.obtenerCitasFechasExcluyente = async (id_terapeuta, fecha) => {
  try {
    let citas = await Cita.query()
      .where("id_terapeuta", "=", id_terapeuta)
      .modify((builder) => {
        let fechaInicio = date.parse(fecha, patternFecha);
        if (fecha && !isNaN(fechaInicio)) {
          let fechaLimite = date.addDays(fechaInicio, 1);
          let fechaInicioFormateada = date.format(fechaInicio, patternFecha);
          let FechaFinalFormateada = date.format(fechaLimite, patternFecha);
          let fechaActual = date.addDays(obtenerFechaActualMexico(), 1);
          let fechaActualFormateada = date.format(
            fechaActual,
            patternFecha,
            true
          );
          // console.log(new Date(Date.now()).toLocaleString());
          builder
            .andWhere("fecha", ">=", fechaActualFormateada)
            .andWhere("fecha", "<", fechaInicioFormateada)
            .orWhere("fecha", ">=", FechaFinalFormateada);
        }
      })
      .orderBy("fecha", "DESC")
      .debug();
    return citas;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

exports.verCitasTerapeuta = async (req, res, next) => {
  try {
    let { id_terapeuta } = req.params;
    let { fecha } = req.query;
    let citas = await Cita.query()
      .where("id_terapeuta", "=", id_terapeuta)
      .modify((builder) => {
        let fechaInicio = date.parse(fecha || "", patternFecha);
        if (fecha && !isNaN(fechaInicio)) {
          let fechaLimite = date.addDays(fechaInicio, 1);
          let fecha1 = date.format(fechaInicio, patternFecha);
          let fecha2 = date.format(fechaLimite, patternFecha);
          builder
            .andWhere("fecha", ">=", fecha1)
            .andWhere("fecha", "<", fecha2);
        }
      })
      .orderBy("fecha", "DESC");
    // .debug();
    res.body = { ...res.body, citas };
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};
