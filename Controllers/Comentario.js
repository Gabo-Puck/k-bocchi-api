const Comentario = require("../Models/Comentario");
const Paciente = require("../Models/Paciente");
const Terapeuta = require("../Models/Terapeuta");

exports.validarComentario = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.crearComentario = async (req, res, next) => {
  let comentario = req.body;
  try {
    let comentarioCreado = await Comentario.query().insertAndFetch(comentario);
    return res.status(200).json(comentarioCreado);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.editarComentario = async (req, res, next) => {
  let { id, comentario } = req.body;
  try {
    let comentarioEncontrado = await Comentario.query().findById(id);
    if (!comentarioEncontrado)
      return res.status(404).json("No se encontro el comentario a editar");
    if (comentario.id || comentario.id_paciente || comentario.id_terapeuta)
      return res.status(400).json("No se puede modificar las id");
    let comentarioEditado = await comentarioEncontrado
      .$query()
      .patchAndFetch(comentario);
    return res.status(200).json(comentarioEditado);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.eliminarComentario = async (req, res, next) => {
  let { id } = req.body;
  try {
    let comentarioEncontrado = await Comentario.query().findById(id);
    if (!comentarioEncontrado)
      return res.status(404).json("No se encontro el comentario a eliminar");
    return res.status(200).json(await comentarioEncontrado.$query().delete());
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.verComentarios = async (req, res, next) => {
  try {
    return res.status(200).json(await Comentario.query());
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.verComentario = async (req, res, next) => {
  let { id } = req.params;
  try {
    let comentario = await Comentario.query().findById(id);
    if (!comentario)
      return res.status(404).json("No se encontro el comentario");
    return res.status(200).json(comentario);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.verComentariosPaciente = async (req, res, next) => {
  let { id_paciente } = req.params;
  try {
    let paciente = await Paciente.query().findById(id_paciente);
    if (!paciente) return res.status(404).json("No se encontro el paciente");
    return res
      .status(200)
      .json(await Comentario.query().where("id_paciente", "=", id_paciente));
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.verComentariosTerapeuta = async (req, res, next) => {
  let { id_terapeuta } = req.params;
  try {
    let terapeuta = await Terapeuta.query().findById(id_terapeuta);
    if (!terapeuta) return res.status(404).json("No se encontro el terapeuta");
    return res
      .status(200)
      .json(await Comentario.query().where("id_terapeuta", "=", id_terapeuta));
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
