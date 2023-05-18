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


module.exports = router;