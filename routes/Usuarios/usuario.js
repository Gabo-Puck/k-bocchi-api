const express = require("express");
const Usuario = require("../../Models/Usuario");
var router = express.Router();

router.get("/datos/:uid",async (req,res,next)=>{
    let usuario = await Usuario.query().findById(req.params.uid);
    if(!usuario){
        return res.status(404).json("Usuario no encontrado en nuestra base de datos");
    }
    return res.json(usuario);
})
router.post("/datos/log",async (req,res,next)=>{
    console.log(req.body)
    let usuario = await Usuario.query().findOne({email:req.body.email});
    if(!usuario){
        return res.status(404).json("Usuario no encontrado en nuestra base de datos");
    }
    if(usuario.email && !usuario.contrasena){
        return res.status(500).json("Usuario registrado con google")
    }
    if(usuario.email && usuario.contrasena!=req.body.contrasena)
        return res.status(500).json("Contraseña incorrecta");
    return res.json(usuario);
})


module.exports = router;