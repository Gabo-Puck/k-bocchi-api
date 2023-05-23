const express = require("express");
const Usuario = require("../Models/Usuario");
const { desencriptar } = require("../utils/encryption");
const router = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    Fisioterapeuta:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        nombre:
 *          type: string
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        apellidos:
 *          type: string
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        especialidad:
 *          type: string
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        nombre_del_consultorio:
 *          type: string
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        telefono:
 *          type: string
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        pago_minimo:
 *          type: number
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        pago_max:
 *          type: number
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        servicioDomicilio:
 *          type: boolean
 *          description: Es un identificador unico generado ya sea por firebase (uid) o por nosotros
 *        domicilio:
 *          type: object
 *          $ref: '#/components/schemas/Domicilio'
 *      example:
 *          id: 1bcac0e9-5682-4fe2-a92f-55b0c552551f
 *          nombre: bidenBlast@gmail.com
 *          apellidos: contrasenaS
 *          especialidad: paciente
 *          nombre_del_consultorio: deportiva
 *          telefono: 3310428909
 *          pago_minimo: 0
 *          pago_max: 0
 *          servicioDomicilio: true
 *
 */

//Ruta para validación de terapeutas

/**
 * @swagger
 * /usuarios/fisioterapeutas/login:
 *  post:
 *    summary: Permite validar las credenciales de un usuario y que además sea del tipo fisioterapeuta
 *    tags: [Fisioterapeuta]
 *    responses:
 *      "404":
 *        description: Devuelve un mensaje indicando que el usuario no se encontro en la base de datos. (No esta registrado el email)
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      "401":
 *        description: Devuelve un mensaje indicando ya sea que el usuario no es tipo fisioterapeuta o tiene contraseña incorrecta
 *        content:
 *         application/json:
 *           schema:
 *             type: string
 *      "451":
 *        description: Devuelve un mensaje para indicar que un usuario esta registrado con google (En la bd el usuario existe pero no esta registrada su contraseña)
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      "200":
 *        description: Devuelve los datos completos del usuario con el correo y contraseña asociados
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Usuario'
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
router.post("/login", async (req, res, next) => {
  console.log(req.body);
  let usuarioFisio = await Usuario.query().findOne({ email: req.body.email });
  if (!usuarioFisio) {
    return res
      .status(404)
      .json("Usuario no encontrado en nuestra base de datos");
  }
  if (usuarioFisio.rol == "paciente") {
    return res.status(401).json("Usuario no es de tipo fisioterapeuta");
  }
  if (usuarioFisio.email && !usuarioFisio.contrasena) {
    return res.status(451).json("Usuario registrado con google");
  }
  let contrasena = desencriptar(usuarioFisio.contrasena);
  if (usuarioFisio.email && contrasena != req.body.contrasena)
    return res.status(401).json("Contraseña incorrecta");
  return res.json(usuarioFisio);
});

module.exports = router;
