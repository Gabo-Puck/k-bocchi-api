const express = require("express");
var Usuario = require("../Models/Usuario");
const { v4: uuidv4, v4 } = require("uuid");
const { encriptar, desencriptar } = require("../utils/encryption");
var router = express.Router();
var terapeutas = require("./terapeuta");

/**
 * @swagger
 * components:
 *  schemas:
 *    Usuario:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        correo:
 *          type: string
 *          description: Es el correo del usuario en cuestion
 *        contrasena:
 *          type: string
 *          description: Es la contraseña del usuario, en la base de datos esta encriptada, sin embargo las peticiones tienen que ser con la contraseña sin encriptar
 *        rol:
 *          type: string
 *          description: El rol del usuario, tiene que ser "fisioterapeuta" o "paciente"
 *        terapeuta:
 *          type: object
 *          $ref: '#/components/schemas/Fisioterapeuta'
 *      example:
 *          id: 1bcac0e9-5682-4fe2-a92f-55b0c552551f  
 *          correo: bidenBlast@gmail.com
 *          contrasena: contrasenaS
 *          rol: paciente
 *          
 */


/**
 * @swagger
 * /usuarios/datos/{uid}:
 *  get:
 *    summary: Permite obtener un usuario mediante su id
 *    tags: [Usuario]
 *    responses:
 *      "200":
 *        description: Devuelve el usuario con la id asociada
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Usuario'
 *      "404":
 *         description: Devuelve un mensaje para indicar que el usuario no existe
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *    parameters:
 *      - name: uid
 *        in: path
 *        required: true
 */
router.get("/datos/:uid", async (req, res, next) => {
  console.log(req.body);
  let usuario = await Usuario.query().findById(req.params.uid);
  if (!usuario) {
    return res
      .status(404)
      .json("Usuario no encontrado en nuestra base de datos");
  }
  return res.json(usuario);
});

/**
 * @swagger
 * /usuarios/datos/log:
 *  post:
 *    summary: Permite validar las credenciales de un usuario
 *    tags: [Usuario]
 *    responses:
 *      "200":
 *        description: Devuelve los datos completos del usuario con el correo y contraseña asociados
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Usuario'
 *      "404":
 *        description: Devuelve un mensaje indicando que el usuario no se encontro en la base de datos. (No esta registrado el email)
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      "451":
 *        description: Devuelve un mensaje para indicar que un usuario esta registrado con google (En la bd el usuario existe pero no esta registrada su contraseña)
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      "401":
 *        description: Devuelve un mensaje para indicar que la contraseña del usuario esta incorrecta
 *        content:
 *         application/json:
 *           schema:
 *             type: string
 *    requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                contrasena:
 *                  type: string
 */
router.post("/datos/log", async (req, res, next) => {
  console.log(req.body);
  let usuario = await Usuario.query().findOne({ email: req.body.email });
  if (!usuario) {
    return res
      .status(404)
      .json("Usuario no encontrado en nuestra base de datos");
  }
  if (usuario.email && !usuario.contrasena) {
    return res.status(451).json("Usuario registrado con google");
  }
  let contrasena = desencriptar(usuario.contrasena);
  if (usuario.email && contrasena != req.body.contrasena)
    return res.status(401).json("Contraseña incorrecta");
  return res.status(200).json(usuario);
});

/**
 * @swagger 
 * /usuarios/datos/email:
 *  post:
 *    summary: Permite saber si un correo ya esta registrado 
 *    tags: [Usuario]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *    responses:
 *      400:
 *        description: Devuelve un mensaje para indicar que el correo ya esta registrado
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      200:
 *        description: Devuelve un mensaje de 'ok'
 *        content:
 *        application/json:
 *          schema:
 *            type: string
 */
router.post("/datos/email", async (req, res, next) => {
  console.log(req.body);
  let usuario = await Usuario.query().findOne({ email: req.body.email });
  if (usuario)
    return res.status(400).json("Este correo ya se encuentra registrado");
  return res.status(200).json("ok");
});


/**
 * @swagger
 * /usuarios/registrar:
 *  post:
 *    summary: Permite crear un usuario 
 *    tags: [Usuario]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Usuario'
 */
router.post("/registrar", async (req, res, next) => {
  console.log(req.body);
  try {
    if (!req.body.id) req.body.id = uuidv4();
    if (req.body.contrasena)
      req.body.contrasena = encriptar(req.body.contrasena);
    await Usuario.crearUsuarioBaseDatos(req.body);
    return res.status(200).json("ok");
  } catch (error) {
    return res
      .status(500)
      .send(`<p>Ha ocurrido un error:</p> \n <code>${error}</code>`);
  }
});

router.use("/fisioterapeutas", terapeutas);

module.exports = router;
