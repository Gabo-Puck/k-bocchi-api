const Terapeuta = require("../Models/Terapeuta");
const Usuario = require("../Models/Usuario");
const { ROLES } = require("../roles");
const { desencriptar } = require("../utils/encryption");

exports.verTerapeutaDetalles = async (req, res, next) => {
  try {
    let { id_terapeuta } = req.params;
    // console.log(id_terapeuta);
    let terapeuta = await Terapeuta.query()
      .findOne({
        "terapeutas.id": id_terapeuta,
      })
      .withGraphJoined(
        "[comentarios.[comentario_paciente.[resenas,usuario]],resenas,usuario]"
      )
      .modifyGraph("comentarios.[comentario_paciente.resenas]", (builder) => {
        builder.where("id_terapeuta", "=", id_terapeuta);
      })
      .modifyGraph("resenas", (builder) => {
        builder.avg("estrellas as promedio");
        builder.groupBy("id_terapeuta");
      });
    if (!terapeuta) return res.status(404).json("No existe ese terapeuta");

    return res.status(200).json(terapeuta);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Ha ocurrido un error");
  }
};

exports.buscarTerapeutas = async (req, res, next) => {
  let {
    nombre,
    servicio_domicilio,
    pago_minimo,
    pago_maximo,
    estrellas,
    lng,
    lat,
    con_consultorio,
    distancia,
  } = req.query;
  console.log(nombre);
  let usuarios = await Usuario.query()
    .where("rol", "=", ROLES.FISIOTERAPEUTA)
    .withGraphJoined("terapeuta.[resenas]")
    .modify((builder) => {
      if (lng && lat) {
        builder
          .select(
            raw(
              `FN_DIST_HAVERSINE(terapeuta.lat, terapeuta.lng, ${lat}, ${lng}) as dist`
            )
          )
          .andWhereRaw(
            `FN_DIST_HAVERSINE(terapeuta.lat, terapeuta.lng, ${lat}, ${lng}) <= ${
              distancia || 15
            }`
          ); //default 15km
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
      if (con_consultorio === "false") {
        q.andWhere("terapeuta.nombre_del_consultorio", "=", "");
      }
      if (con_consultorio === "true") {
        q.andWhere("terapeuta.nombre_del_consultorio", "<>", "");
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
};

exports.loginTerapeuta = async (req, res, next) => {
  console.log(req.body);
  let usuarioFisio = await Usuario.query().withGraphJoined("[terapeuta]").findOne({ email: req.body.email });
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
};

exports.existeTerapeuta = async (req,res,next)=>{
    let {id_terapeuta} = req.params;
    let terapeuta = await Terapeuta.query().findById(id_terapeuta);
    if(!terapeuta)
        return res.status(404).json("No se encontro el terapeuta");
    next();
}