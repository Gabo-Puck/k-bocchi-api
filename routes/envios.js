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
  getVinculacionStatus,
  obtenerVendedores,
} = require("../Controllers/Paypal");
const { webhook, crearEnvio, verificarDomicilio: verifyAddress } = require("../Controllers/Envios");
var router = express.Router();

/**
 * @swagger
 * /envios/webhook:
 *  post:
 *    summary: Ruta que permite probar los webhooks de easypost
 *    tags: [Envios]
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

 */
router.post("/webhook", webhook);
/**
 * @swagger
 * /envios/create-shipment:
 *  post:
 *    summary: Ruta que permite crear un envio
 *    tags: [Envios]
 *    responses:
 *      200:
 *        description: Devuelve el envio creado
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

 */
router.post("/create-shipment", crearEnvio);
/**
 * @swagger
 * /envios/calculate-cost:
 *  post:
 *    summary: Ruta que calcular los costos de envio
 *    tags: [Envios]
 *    responses:
 *      200:
 *        description: Devuelve un arreglo con los costos
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

 */
router.post("/calculate-cost", crearEnvio);
/**
 * @swagger
 * /envios/verify-address:
 *  post:
 *    summary: Ruta que validar un domicilio
 *    tags: [Envios]
 *    responses:
 *      200:
 *        description: Devuelve un arreglo con las validaciones
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

 */
router.post("/verify-address", verifyAddress);
module.exports = router;
