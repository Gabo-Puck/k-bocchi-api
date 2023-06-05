const { Cita } = require("../Models/Cita");

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
