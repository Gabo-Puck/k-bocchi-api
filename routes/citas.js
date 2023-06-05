const {
  crearCita,
  borrarCita,
  modificarCita,
  verCita,
  verTodasCitas,
} = require("../Controllers/Citas");
const express = require("express");
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
 *      example:
 *          id: 10
 *          lng: -103.4574
 *          lat: 20.456545334
 *          id_paciente: 3
 *          id_terapeuta: 10
 *          fecha: '1985-04-12T23:20:50.52Z'
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

module.exports = router;
