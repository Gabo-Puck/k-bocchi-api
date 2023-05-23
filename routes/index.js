var express = require("express");
var router = express.Router();
var { Usuario } = require("../Models/Usuario");
const {encriptar,desencriptar} = require("../utils/encryption")
const { getAuth } = require("firebase-admin/auth");



/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});


/**
 * @swagger
 * /encriptar:
 *  post:
 *    summary: Ruta que permite encriptar un dato
 *    tags: [Utilidades]
 *    responses:
 *      200:
 *        description: Devuelve el mensaje en cuestion encriptado
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              data: 
 *                type: string
 */
router.post("/encriptar",(req,res,next)=>{
  let {data} = req.body;
  let enc = encriptar(data);
  res.json(enc);
})
/**
 * @swagger
 * /desencriptar:
 *  post:
 *    summary: Ruta que permite encriptar un dato
 *    tags: [Utilidades]
 *    responses:
 *      200:
 *        description: Devuelve el mensaje en cuestion desencriptado
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      400:
 *        description: Devuelve un mensaje de error indicando que no esta encriptado "data"
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              data:
 *                type: string
 */
router.post("/desencriptar",(req,res,next)=>{
  let {data} = req.body;
  try{
    let desencriptado = desencriptar(data);
    res.status(200).json(desencriptado);
  }catch(error){
    res.status(400).json("Error: Dato no encriptado")
  }
  
})

module.exports = router;
