const { v4: uuidv4, v4 } = require("uuid");
var express = require("express");
var router = express.Router();
var Usuario = require("../Models/Usuario");
const { encriptar, desencriptar } = require("../utils/encryption");
const { getAuth } = require("firebase-admin/auth");
const { scrapCedula } = require("../webScapping");
const { validarCedulaOCR } = require("../testVision/cloudVision");
const nombres = require("../dummyData/nombres.json");
const consultorio = require("../dummyData/consultorio.json");
const { ROLES } = require("../roles");
const { raw } = require("mysql");
const Terapeuta = require("../Models/Terapeuta");
const Paciente = require("../Models/Paciente");
const Comentario = require("../Models/Comentario");
const Resena = require("../Models/Resenas");
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

/**
 * @swagger
 * /utilidades/createDummyTerapeutas:
 *  post:
 *    summary: Ruta que permite crear terapeutas al azar
 *    tags: [Utilidades]
 *    responses:
 *      200:
 *        description: Devuelve un mensaje con los terapeutas creados
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *    requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                cantidad:
 *                  type: number
 */
router.post("/createDummyTerapeutas", async (req, res, next) => {
  let { cantidad } = req.body;
  try {
    let usuarios = generarTerapeutas(cantidad);
    let response = await Usuario.query().insertGraphAndFetch(usuarios);
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo salio mal generando mock data");
  }
});

/**
 * @swagger
 * /utilidades/createDummyPacientes:
 *  post:
 *    summary: Ruta que permite crear pacientes al azar
 *    tags: [Utilidades]
 *    responses:
 *      200:
 *        description: Devuelve un mensaje con los pacientes creados
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *    requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                cantidad:
 *                  type: number
 */
router.post("/createDummyPacientes", async (req, res, next) => {
  let { cantidad } = req.body;
  try {
    let usuarios = generarPacientes(cantidad);
    let response = await Usuario.query().insertGraphAndFetch(usuarios);
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo salio mal generando mock data");
  }
});

/**
 * @swagger
 * /utilidades/createDummyResenasComentarios:
 *  post:
 *    summary: Ruta que permite crear reseñas y comentarios al azar
 *    tags: [Utilidades]
 *    responses:
 *      200:
 *        description: Devuelve un mensaje con las reseñas y comentarios creados
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *    requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                cantidad:
 *                  type: number
 */
router.post("/createDummyResenasComentarios", async (req, res, next) => {
  let { cantidad } = req.body;
  try {
    let terapeutas = await Terapeuta.query().where(
      "id_usuario",
      "like",
      "%mock"
    );
    let pacientes = await Paciente.query().where("id_usuario", "like", "%mock");
    let mockup_data = generarComentariosResenas(
      cantidad,
      terapeutas,
      pacientes
    );
    let comentarios = await Comentario.query().insertGraphAndFetch(mockup_data.comentarios);
    let resenas = await Resena.query().insertGraphAndFetch(mockup_data.resenas);
    return res.status(200).json({comentarios,resenas});
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo salio mal generando mock data");
  }
});

/**
 * @swagger
 * /utilidades/deleteDummyTerapeutas:
 *  delete:
 *    summary: Ruta que permite eliminar los terapeutas creados al azar
 *    tags: [Utilidades]
 *    responses:
 *      200:
 *        description: Devuelve un mensaje indicando cuantos se eliminaron
 *        content:
 *          application/json:
 *            schema:
 *              type: number
 */
router.delete("/deleteDummyTerapeutas", async (req, res, next) => {
  try {
    let number = await Usuario.query().delete().where("id", "like", "%mock");
    return res.status(200).json(number);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo salio mal generando mock data");
  }
});

function generarPacientes(cantidad, rol) {
  let usuarios = generarUsuarios(cantidad, ROLES.PACIENTE);
  return usuarios.map((usuario) => {
    return { ...usuario, paciente: {} };
  });
}

function generarComentariosResenas(cantidad, terapeutas, pacientes) {
  let comentarios = [];
  let resenas = [];
  for (let index = 0; index <= cantidad; index++) {
    let indexTer = Math.round(
      generarNumerosAleatorios(0, terapeutas.length - 1)
    );
    let indexPac = Math.round(
      generarNumerosAleatorios(0, pacientes.length - 1)
    );
    let resena = {
      id_paciente: pacientes[indexPac].id,
      id_terapeuta: terapeutas[indexTer].id,
      estrellas: Math.round(generarNumerosAleatorios(1, 10)),
    };
    resenas.push(resena);
    let fecha = Math.round(
      generarNumerosAleatorios(Date.now(), Date.now() + 3.15e10)
    );
    let comentario = {
      id_paciente: pacientes[indexPac].id,
      id_terapeuta: terapeutas[indexTer].id,
      contenido: "Comentario de prueba",
      fecha: new Date(fecha).toISOString().slice(0,19).replace("T"," "),
    };
    comentarios.push(comentario);
  }
  return {
    comentarios,
    resenas,
  };
}

function generarUsuarios(cantidad, rol) {
  let usuarios = [];
  for (let index = 0; index < cantidad; index++) {
    const randomIndex = Math.round(
      generarNumerosAleatorios(0, nombres.length - 1)
    );
    let element = nombres[randomIndex];
    let usuario = {
      id: uuidv4() + "mock",
      email: `${element.replaceAll(" ", "")}${index}@gmail.com`,
      contrasena: `YjFkNzUzOGJlNDVhYTYyNTRjZTk2ZmMzNjJlMTQyYTM=`,
      nombre: element,
      rol: rol,
      telefono: "3304304323",
    };
    usuarios.push(usuario);
  }
  return usuarios;
}
function generarNumerosAleatorios(min, max) {
  return Math.random() * (max - min) + min;
}
function generarTerapeutas(cantidad) {
  let usuarios = generarUsuarios(cantidad, ROLES.FISIOTERAPEUTA);
  usuarios = usuarios.map((usuario) => {
    let pago_minimo = generarNumerosAleatorios(50, 10000);
    let pago_maximo = generarNumerosAleatorios(pago_minimo, 15000);
    let servicio_domicilio = Math.round(generarNumerosAleatorios(0, 1));
    let lng = -103.35 + generarNumerosAleatorios(0, 0.08);
    let lat = 20.68 + generarNumerosAleatorios(0, 0.05);
    let numero_cedula = Math.round(generarNumerosAleatorios(999999, 9999999));
    let conConsultorio = Math.round(generarNumerosAleatorios(0, 1));
    let nombre_del_consultorio = null;
    if (conConsultorio) {
      let index = Math.round(
        generarNumerosAleatorios(0, consultorio.length - 1)
      );
      nombre_del_consultorio = consultorio[index];
    }
    return {
      ...usuario,
      terapeuta: {
        pago_minimo,
        pago_maximo,
        servicio_domicilio,
        lng,
        lat,
        numero_cedula,
        nombre_del_consultorio,
      },
    };
  });
  return usuarios;
}
module.exports = router;
