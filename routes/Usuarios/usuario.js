const express = require("express");
const Usuario = require("../../Models/Usuario");
const { v4: uuidv4, v4 } = require("uuid");
const { encriptar, desencriptar } = require("../../utils/encryption");
var router = express.Router();

router.get("/datos/:uid", async (req, res, next) => {
  let usuario = await Usuario.query().findById(req.params.uid);
  if (!usuario) {
    return res
      .status(404)
      .json("Usuario no encontrado en nuestra base de datos");
  }
  return res.json(usuario);
});
router.post("/datos/log", async (req, res, next) => {
  console.log(req.body);
  let usuario = await Usuario.query().findOne({ email: req.body.email });
  if (!usuario) {
    return res
      .status(404)
      .json("Usuario no encontrado en nuestra base de datos");
  }
  if (usuario.email && !usuario.contrasena) {
    return res.status(500).json("Usuario registrado con google");
  }
  let contrasena = desencriptar(usuario.contrasena);
  if (usuario.email && contrasena != req.body.contrasena)
    return res.status(500).json("Contraseña incorrecta");
  return res.json(usuario);
});

router.post("/datos/email", async (req, res, next) => {
  console.log(req.body);
  let usuario = await Usuario.query().findOne({ email: req.body.email });
  if (usuario)
    return res.status(400).json("Este correo ya se encuentra registrado");
  return res.status(200).json("ok");
});

router.post("/registrar", async (req, res, next) => {
  console.log(req.body);
  try {
    if(!req.body.id)
      req.body.id = uuidv4();
    if(req.body.contrasena)
      req.body.contrasena = encriptar(req.body.contrasena)
    await Usuario.crearUsuarioBaseDatos(req.body);
    return res.status(200).json("ok");
  } catch (error) {
    return res
      .status(500)
      .send(`<p>Ha ocurrido un error:</p> \n <code>${error}</code>`);
  }
});

module.exports = router;
