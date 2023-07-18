const express = require("express");
const {
  verComprasPaciente,
  verTicket,
  verVentasTerapeuta,
} = require("../Controllers/Ventas");

var router = express.Router();

/**
 * @swagger
 * /ventas/{id_ticket}:
 *  get:
 *    summary: Ruta que permite obtener los paquetes por terapeuta
 *    tags: [Ventas]
 *    responses:
 *      200:
 *        description: Devuelve el paquete encontrado
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      404:
 *        description: Devuelve un mensaje indicando que no existe el paquete
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      500:
 *        description: Devuelve un mensaje de error del servidor
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *    parameters:
 *          - in: path
 *            name: id_ticket
 *            required: true
 *            schema:
 *              type: string
 *          - in: query
 *            name: id_terapeuta
 *            schema:
 *              type: string
 */
router.get("/:id_ticket", verTicket);
/**
 * @swagger
 * /ventas/paciente/{id_paciente}:
 *  get:
 *    summary: Ruta que permite obtener las compras del paciente
 *    tags: [Ventas]
 *    responses:
 *      200:
 *        description: Devuelve un arreglo de compras
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      404:
 *        description: Devuelve un mensaje de error indicando que no existe el paciente
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      500:
 *        description: Devuelve un mensaje de error del servidor
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *  parameters:
 *      - in: path
 *        name: id_paciente
 *        required: true
 *        schema:
 *          type: string
 */
router.get("/paciente/:id_paciente", verComprasPaciente);
/**
 * @swagger
 * /ventas/terapeuta/{id_terapeuta}:
 *  get:
 *    summary: Ruta que permite obtener las ventas del terapeuta
 *    tags: [Ventas]
 *    responses:
 *      200:
 *        description: Devuelve un arreglo con las ventas
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      404:
 *        description: Devuelve un mensaje indicando que no existe el terapeuta
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      500:
 *        description: Devuelve un mensaje de error del servidor
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *    parameters:
 *          - in: path
 *            name: id_terapeuta
 *            required: true
 *            schema:
 *              type: string
 *          - in: query
 *            name: fecha_inicio
 *            required: true
 *            schema:
 *              type: string
 *          - in: query
 *            name: fecha_fin
 *            required: true
 *            schema:
 *              type: string
 */
router.get("/terapeuta/:id_terapeuta", verVentasTerapeuta);
/**
 * @swagger
 * /ventas/terapeuta/reporte/{id_terapeuta}:
 *  get:
 *    summary: Ruta que permite obtener las ventas del terapeuta
 *    tags: [Ventas]
 *    responses:
 *      200:
 *        description: Devuelve un arreglo con las ventas
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      404:
 *        description: Devuelve un mensaje indicando que no existe el terapeuta
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      500:
 *        description: Devuelve un mensaje de error del servidor
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *    parameters:
 *          - in: path
 *            name: id_terapeuta
 *            required: true
 *            schema:
 *              type: string
 *          - in: query
 *            name: mes
 *            required: true
 *            schema:
 *              type: number
 */
router.get("/terapeuta/reporte/:id_terapeuta", verVentasTerapeuta);

module.exports = router;
