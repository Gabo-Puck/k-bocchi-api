const Paciente = require("../Models/Paciente");
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
  try {
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
  } catch (err) {
    res.status(500).json("Algo ha salido mal");
  }
};

exports.loginTerapeuta = async (req, res, next) => {
  console.log(req.body);
  try {
    let usuarioFisio = await Usuario.query()
      .withGraphJoined("[terapeuta]")
      .findOne({ email: req.body.email });
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
  } catch (err) {
    console.log(err);
    return res.status(500).json("Ha habido un error");
  }
};

exports.existeTerapeuta = async (req, res, next) => {
  try {
    let { id_terapeuta } = req.params;
    let terapeuta = await Terapeuta.query().findById(id_terapeuta);
    if (!terapeuta) return res.status(404).json("No se encontro el terapeuta");
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.verEstrellas = async (req, res, next) => {
  let { id_terapeuta } = req.params;
  try {
    let estrellas = await Terapeuta.query()
      .findById(id_terapeuta)
      .withGraphJoined("resenas")
      .modifyGraph("resenas", (builder) => {
        builder.avg("estrellas as promedio");
        builder.groupBy("id_terapeuta");
        // builder.where("promedio",">=",5)
      })
      .select("promedio")
      // .avg("terapeuta:resenas.id_terapeuta")
      .debug();
    let { promedio } = estrellas;
    return res.json({
      promedio,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
// [
//   {
//     "apellidos": "Esquivies Torres",
//     "id": 77,
//     "id_usuario": "d7072869-8c24-4c00-b059-44190edf96b2",
//     "nombre": "Lizeth Esquivies Torres",
//     "telefono": "",
//     "foto_perfil": "d7072869-8c24-4c00-b059-44190edf96b2.jpeg"
//   },
//   {
//     "apellidos": "Altamirano",
//     "id": 36,
//     "id_usuario": "raBh6LK6t3cHGxDjxdouQlnq7713",
//     "nombre": "Werner Ziegler",
//     "telefono": "3302930231",
//     "foto_perfil": null
//   },
//   {
//     "apellidos": "Orozco Ortiz",
//     "id": 85,
//     "id_usuario": "5d6cfd49-adeb-429c-90a2-b7a1171c3895",
//     "nombre": "Paulo Orozco Ortiz",
//     "telefono": "",
//     "foto_perfil": "5d6cfd49-adeb-429c-90a2-b7a1171c3895.jfif"
//   }
// ]
exports.verPacientes = async (req, res, next) => {
  let { id_terapeuta } = req.params;
  try {
    let pacientes = await Paciente.query()
      .withGraphFetched("usuario")
      .modifyGraph("usuario", (builder) => {
        builder.select("email", "nombre", "telefono", "foto_perfil");
      })
      .whereExists(
        Paciente.relatedQuery("terapeutas").where(
          "terapeutas.id",
          "=",
          id_terapeuta
        )
      )
      .select("id", "id_usuario");
    pacientes = pacientes.map((p) => {
      let usuario = p.usuario
      delete p.usuario;
      return { ...p, ...usuario };
    });
    return res.status(200).json(pacientes);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.verPacientesBitacora = async (req, res, next) => {
  let { id_terapeuta } = req.params;
  try {
    let pacientes = await Usuario.query()
      .withGraphFetched("paciente.citas")
      .modifyGraph("paciente", (builder) => {
        builder.select("id");
      })
      .whereIn(
        Paciente.relatedQuery("citas").where("id_terapeuta", "=", id_terapeuta)
      );

    return res.status(200).json(pacientes);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.insertarHorarios = async (req, res, next) => {
  const days = {
    domingo: 0,
    lunes: 0,
    martes: 0,
    miercoles: 0,
    jueves: 0,
    viernes: 0,
    sabado: 0,
  };
  console.log(req.body);
  let { id_terapeuta, horario: grafo } = req.body;
  try {
    if (grafo.length <= 0 || grafo.length > 7)
      throw "Horario no cumple con las validaciones: Cantidad imposible de días";
    grafo.forEach((g) => {
      if (days[g.dia] >= 1) {
        throw "Horario no cumple con las validaciones: Día repetido";
      }
      days[g.dia]++;
    });
    let { horario } = await Terapeuta.query().upsertGraphAndFetch({
      id: id_terapeuta,
      horario: grafo,
    });
    return res.status(201).json({ horario });
  } catch (error) {
    console.log(error);
    if (typeof error === "string") return res.status(500).json(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
