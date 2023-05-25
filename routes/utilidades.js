var express = require("express");
var router = express.Router();
var { Usuario } = require("../Models/Usuario");
const { encriptar, desencriptar } = require("../utils/encryption");
const { getAuth } = require("firebase-admin/auth");
const { scrapCedula } = require("../webScapping");
const { validarCedulaOCR } = require("../testVision/cloudVision");

/**
 * @swagger
 * /utilidades/encriptar:
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
router.post("/encriptar", (req, res, next) => {
  let { data } = req.body;
  let enc = encriptar(data);
  res.json(enc);
});
/**
 * @swagger
 * /utilidades/desencriptar:
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
router.post("/desencriptar", (req, res, next) => {
  let { data } = req.body;
  try {
    let desencriptado = desencriptar(data);
    res.status(200).json(desencriptado);
  } catch (error) {
    res.status(400).json("Error: Dato no encriptado");
  }
});

/**
 * @swagger
 * /utilidades/validarCedula:
 *  post:
 *    summary: Ruta que permite validar una cedula y obtener su información asociada
 *    tags: [Utilidades]
 *    responses:
 *      200:
 *        description: Devuelve la información asociada a la cedula
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                numero_cedula:
 *                  type: string
 *                nombre:
 *                  type: string
 *                apellido_paterno:
 *                  type: string
 *                apellido_materno:
 *                  type: string
 *                tipo:
 *                  type: string
 *      404:
 *        description: Devuelve un mensaje de error indicando que dicha cedula no existe
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      400:
 *        description: Devuelve un mensaje indicando que la cédula esta en formato incorrecto
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      500:
 *        description: Devuelve un mensaje indicando que algo ha fallado en el servidor (Como no poder conectarse a https://www.cedulaprofesional.sep.gob.mx/cedula/presidencia/indexAvanzada.action)
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              cedula:
 *                type: string
 */
router.post("/validarCedula", async (req, res, next) => {
  let { cedula } = req.body;
  console.log(cedula);
  if (!cedula) return res.status(400).json("La cedula no puede estar vacía");
  if (!/^\d+$/.test(cedula))
    return res.status(400).json("La cedula solo debe de contener numeros");
  if (cedula.length < 7 || cedula.length > 8)
    return res
      .status(400)
      .json("La cedula tiene que tener entre 7 u 8 caracteres");
  let scrapResult = await scrapCedula(cedula);
  if (scrapResult.error) return res.status(500).json(scrapResult.error);
  if (scrapResult.mensaje) {
    return res.status(404).json(scrapResult.mensaje);
  }
  return res.status(200).json(scrapResult);
});

/**
 * @swagger
 * /utilidades/validarCedulaOCR:
 *  post:
 *    summary: Ruta que permite validar una fotografía de una cedula
 *    consumes:
 *      - multipart/form-data
 *    requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              nombre:
 *                type: string
 *              numeroCedula:
 *                type: string
 *              imagenCedula:
 *                type: string
 *                format: binary
 *    tags: [Utilidades]
 *    responses:
 *      200:
 *        description: Devuelve un mensaje de cedula valida
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      400:
 *        description: Devuelve un mensaje indicando que alguno de los campos no se encuentra en la petición/request
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      500:
 *        description: Devuelve un mensaje de error del servidor
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      422:
 *        description: Devuelve un mensaje de error indicando que alguno de los datos no coincide con los obtenidos de la fotografía
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 */
router.post("/validarCedulaOCR", async (req, res, next) => {
  let imagenCedula;
  console.log(req.body);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No se subió ninguna imagen");
  }
  if (!req.body.nombre)
    return res.status(400).json("El nombre completo es obligatorio");
  if (!req.body.numeroCedula)
    return res.status(400).json("El numero de la cedula es obligatorio");
  let nombre = req.body.nombre;
  let cedula = req.body.numeroCedula;
  let buffer = req.files.imagenCedula;
  try {
    let result = await validarCedulaOCR(nombre, cedula, buffer.data);
    if (result.isValida)
      return res
        .status(200)
        .json("La información provista concuerda con la cedula de la imagen");
    return res.status(422).json(result.mensaje);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal, intenta más tarde");
  }
});

module.exports = router;
