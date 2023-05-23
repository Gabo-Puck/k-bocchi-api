const express = require("express");
const Usuario = require("../../../Models/Usuario");
const { desencriptar } = require("../../../utils/encryption");
const router = express.Router();

//Ruta para validación de terapeutas
router.post("/login", async (req, res, next) => {
  console.log(req.body);
  let usuarioFisio = await Usuario.query().findOne({ email: req.body.email });
  if (!usuarioFisio) {
      return res
      .status(404)
      .json("Usuario no encontrado en nuestra base de datos");
    }
    if(usuarioFisio.rol=="paciente"){
        return res.status(401).json("Usuario no es de tipo fisioterapeuta");
    }
    if (usuarioFisio.email && !usuarioFisio.contrasena) {
        return res.status(451).json("Usuario registrado con google");
    }
  let contrasena = desencriptar(usuarioFisio.contrasena);
  if (usuarioFisio.email && contrasena != req.body.contrasena)
    return res.status(452).json("Contraseña incorrecta");
  return res.json(usuarioFisio);
});

module.exports = router;
