const express = require("express");
const Usuario = require("../Models/Usuario");
const { desencriptar } = require("../utils/encryption");
const { ROLES } = require("../roles");
const { Model, raw } = require("objection");
const Terapeuta = require("../Models/Terapeuta");
const knex = require("../setup/knexfile");
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

/**
 * @swagger
 * /usuarios/fisioterapeutas/buscar:
 *  get:
 *    summary: Permite obtener los fisioterapeutas de la base de datos usando un criterio de busqueda (Nombre) y filtros
 *    tags: [Fisioterapeuta]
 *    responses:
 *      "200":
 *        description: Devuelve los datos completos del usuario con el correo y contraseña asociados
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                count:
 *                  type: number
 *                resultados:
 *                  type: Array
 *                  $ref: '#/components/schemas/Usuario'
 *      "404":
 *        description: Devuelve un mensaje indicando que no se encontraron fisioterapeutas con esas caracteristicas
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Usuario'
 *    parameters:
 *        - in: query
 *          name: nombre
 *          schema:
 *            type: string
 *            description: Filtro para nombre
 *        - in: query
 *          name: servicio_domicilio
 *          schema:
 *            type: boolean
 *            description: Filtro para terapeutas con servicio a domicilio
 *        - in: query
 *          name: pago_minimo
 *          schema:
 *            type: number
 *            description: Filtro para terapeutas a partir de un pago minimo
 *        - in: query
 *          name: pago_maximo
 *          schema:
 *            type: number
 *            description: Filtro para terapeutas a partir de un pago maximo
 *        - in: query
 *          name: estrellas
 *          schema:
 *            type: number
 *            description: Filtro para terapeutas a partir de una cierta cantidad de promedio de estrellas
 *        - in: query
 *          name: lat
 *          schema:
 *            type: number
 *            description: Filtro para la ubicacion, indica la latitud (son necesarios ambos para la distancia, lat y lng)
 *        - in: query
 *          name: lng
 *          schema:
 *            type: number
 *            description: Filtro para la ubicacion, indica la longitud (son necesarios ambos para la distancia, lat y lng)
 *        - in: query
 *          name: con_consultorio
 *          schema:
 *            type: boolean
 *            description: filtro para terapeutas con consultorio
 *  
 *            
 *    
 */
router.get("/buscar", async (req, res, next) => {
  let {
    nombre,
    servicio_domicilio,
    pago_minimo,
    pago_maximo,
    estrellas,
    lng,
    lat,
    con_consultorio
  } = req.query;
  console.log(nombre);
  let usuarios = await Usuario.query()
    .where("rol", "=", ROLES.FISIOTERAPEUTA)
    .withGraphJoined("terapeuta.[resenas]")
    .modify((builder) => {
      if (lng && lat) {
        builder.select(
          raw(
            `FN_DIST_HAVERSINE(terapeuta.lat, terapeuta.lng, ${lat}, ${lng}) as dist`
          )
        );
      }
    })
    .modify((q) => {
      if (nombre) {
        q.whereRaw(
          `(usuarios.nombre like "%${nombre}%" OR terapeuta.nombre_del_consultorio like "%${nombre}%")`
        );
      }
      if (servicio_domicilio) {
        q.andWhere(
          "terapeuta.servicio_domicilio",
          "=",
          servicio_domicilio === "true" ? 1 : 0
        );
      }
      if(con_consultorio==="false"){
        q.andWhere("terapeuta.nombre_del_consultorio","=","")
      }
      if(con_consultorio==="true"){
        q.andWhere("terapeuta.nombre_del_consultorio","is null")
      }
      //t 550 - 700
      //p 5 - 500
      q.andWhere(
        "terapeuta.pago_minimo",
        "<=",
        Number(pago_maximo || Number.MAX_SAFE_INTEGER)
      ).andWhere(
        "terapeuta.pago_maximo",
        ">=",
        Number(pago_minimo || Number.MIN_SAFE_INTEGER)
      );
    })
    .modifyGraph("terapeuta.resenas", (builder) => {
      builder.avg("estrellas as promedio");
      builder.groupBy("id_terapeuta");
      // builder.where("promedio",">=",5)
    })
    .modify((q) => {
      q.orderBy("terapeuta:resenas.promedio", "DESC");
      if (estrellas) q.where("terapeuta:resenas.promedio", ">=", estrellas);
    })

    // .avg("terapeuta:resenas.id_terapeuta")
    .debug();

  return res.json({
    count: usuarios.length,
    resultados: usuarios,
  });
});

module.exports = router;
