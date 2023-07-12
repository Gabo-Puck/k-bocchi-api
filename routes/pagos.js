const express = require("express");
const {
  crearProducto,
  eliminarProducto,
  verProductosTerapeuta,
  verProductos,
  actualizar,
  editarProducto,
  verProducto,
} = require("../Controllers/Productos");
const {
  crearOrden,
  getToken,
  crearVinculacionLink,
  agregarMerchantId,
} = require("../Controllers/Paypal");
var router = express.Router();

/**
 * @swagger
 * /pagos/create-order/{id_paciente}:
 *  post:
 *    summary: Ruta que permite crear una orden de paypal
 *    tags: [pagos]
 *    responses:
 *      200:
 *        description: Devuelve la orden creada
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      404:
 *        description: Devuelve un mensaje de error indicando que no existen productos en el carrito
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
 *      - name: id_paciente
 *        in: path
 *        required: true
 */
router.post("/create-order/:id_paciente", getToken, crearOrden);

/**
 * @swagger
 * /pagos/create-onboard-seller/{id_terapeuta}:
 *  get:
 *    summary: Permite crear un link para vincular un correo a una cuenta
 *    tags: [pagos]
 *    responses:
 *      "200":
 *        description: Devuelve un link para vinculación
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
 *        - in: path
 *          description: id del venddor
 *          name: id_terapeuta
 *          schema:
 *            type: number
 */
router.get("/create-onboard-seller/:id_terapeuta", getToken, crearVinculacionLink);
/**
 * @swagger
 * /pagos/onboard-completed/webhook:
 *  post:
 *    summary: Permite terminar la vinculación de paypal. Se llama mediante los webhooks de paypal
 *    tags: [pagos]
 *    responses:
 *      "200":
 *        description: Devuelve un link para vinculación
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
 *        - in: path
 *          description: id del venddor
 *          name: id_terapeuta
 *          schema:
 *            type: number
 */
router.post("/onboard-completed/webhook", agregarMerchantId);
module.exports = router;
