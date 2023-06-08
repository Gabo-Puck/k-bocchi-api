const {
  crearCita,
  borrarCita,
  modificarCita,
  verCita,
  verTodasCitas,
  verCitasTerapeuta,
} = require("../Controllers/Citas");
const express = require("express");
const { verHorario } = require("../Controllers/Horario");
const { existeTerapeuta } = require("../Controllers/Terapeuta");
var router = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    Cita:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: Es un identificador unico generado en la base de datos
 *        lng:
 *          type: string
 *          description: Es la longitud (ubicacion) de la cita
 *        lat:
 *          type: string
 *          description: Es la latitud (ubicacion) de la cita
 *        id_paciente:
 *          type: integer
 *          description: El id del paciente al que pertenece la cita
 *        id_terapeuta:
 *          type: integer
 *          description: El id del terapeuta al que pertenece la cita
 *        fecha:
 *          type: string
 *          description: La fecha de la cita
 *          format: date-time
 *        modalidad:
 *          type: string
 *          enum: [domicilio,consultorio]
 *          description: La modalidad de la cita (domicilio o consultorio)
 *          format: date-time
 *        domicilio:
 *          type: string
 *          description: El domicilio donde se llevará a cabo la cita
 *      example:
 *          id: 10
 *          lng: -103.4574
 *          lat: 20.456545334
 *          id_paciente: 3
 *          id_terapeuta: 10
 *          fecha: '1985-04-12T23:20:50.52Z'
 *          modalidad: "domicilio"
 *          domicilio: "Una calle, un numero, una colonia"
 *
 */

/**
 * @swagger
 * /citas:
 *  post:
 *    summary: Permite crear una cita
 *    tags: [Citas]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Cita'
 *    responses:
 *      "200":
 *        description: Devuelve la cita creada
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Cita'
 *      "500":
 *         description: Devuelve un mensaje indicando que algo salió mal
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.post("/", crearCita);

/**
 * @swagger
 * /citas:
 *  delete:
 *    summary: Permite borrar una cita
 *    tags: [Citas]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                 type: number
 *    responses:
 *      "200":
 *        description: Devuelve la cita borrada
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Cita'
 *      "404":
 *        description: Devuelve un mensaje que la cita no fue encontrada
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      "500":
 *         description: Devuelve un mensaje indicando que algo salió mal
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.delete("/", borrarCita);

/**
 * @swagger
 * /citas:
 *  put:
 *    summary: Permite editar una cita
 *    tags: [Citas]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Cita'
 *    responses:
 *      "200":
 *        description: Devuelve la cita modificada
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Cita'
 *      "404":
 *        description: Devuelve un mensaje indicando que la cita no fue encontrada
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      "500":
 *         description: Devuelve un mensaje indicando que algo salió mal
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.put("/", modificarCita);

/**
 * @swagger
 * /citas/{id}:
 *  get:
 *    summary: Permite obtener una cita
 *    tags: [Citas]
 *    responses:
 *      "200":
 *        description: Devuelve la cita encontrada
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Cita'
 *      "404":
 *        description: Devuelve un mensaje indicando que no se encontro la cita
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      "500":
 *         description: Devuelve un mensaje indicando que algo salió mal
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 */
router.get("/:id", verCita);

/**
 * @swagger
 * /citas:
 *  get:
 *    summary: Permite obtener todas las citas de la base de datos
 *    tags: [Citas]
 *    responses:
 *      "200":
 *        description: Devuelve todas las citas de la base de datos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                  type: object
 *                  $ref: '#/components/schemas/Cita'
 *      "500":
 *         description: Devuelve un mensaje indicando que algo salió mal
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.get("/", verTodasCitas);

/**
 * @swagger
 * /citas/validarFecha/{id_terapeuta}/{fecha}:
 *  get:
 *    summary: Permite validar si la fecha ingresada esta disponible
 *    tags: [Citas]
 *    responses:
 *      "200":
 *        description: Devuelve las horas disponibles para agendar cita
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                  type: string
 *                  example: "20:00:00"
 *      "400":
 *        description: Devuelve fechas cercanas para agendar una cita
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                  type: string
 *                  format: date
 *      "404":
 *        description: Devuelve un mensaje indicando que no existe el terapeuta
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      "500":
 *         description: Devuelve un mensaje indicando que algo salió mal
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *    parameters:
 *      - in: path
 *        name: fecha
 *        required: true
 *        schema:
 *          type: string
 *          format: date
 *      - in: path
 *        name: id_terapeuta
 *        required: true
 *        schema:
 *          type: integer
 *
 */
router.get(
  "/validarFecha/:id_terapeuta/:fecha",
  existeTerapeuta,
  verHorario,
  async (req, res, next) => {}
);

/**
 * @swagger
 * /citas/obtenerCitas/{id_terapeuta}:
 *  get:
 *    summary: Permite obtener las citas de un terapeuta
 *    tags: [Citas]
 *    responses:
 *      "200":
 *        description: Devuelve las citas de un terapeuta
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                  type: object
 *                  $ref: '#/components/schemas/Cita'
 *      "404":
 *        description: Devuelve un mensaje indicando que no existe el terapeuta
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      "500":
 *         description: Devuelve un mensaje indicando que algo salió mal
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *    parameters:
 *      - in: path
 *        name: id_terapeuta
 *        required: true
 *        schema:
 *          type: integer
 *      - in: query
 *        name: fecha
 *        required: false
 *        schema:
 *          type: string
 *          format: date
 *
 */
router.get(
  "/obtenerCitas/:id_terapeuta",
  // existeTerapeuta,
  // verHorario,
  verCitasTerapeuta,
  (req, res, next) => {
    console.log(res.body);
    res.status(200).json(res.body);
  }
);

module.exports = router;
