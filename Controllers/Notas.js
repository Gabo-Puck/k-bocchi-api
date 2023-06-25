const Nota = require("../Models/Nota");
const Terapeuta = require("../Models/Terapeuta");
const { obtenerFechaComponent } = require("../utils/fechas");

exports.verNotas = async (req, res, next) => {
  try {
    let notas = await Nota.query();
    return res.status(200).json(notas);
  } catch (err) {
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.crearNota = async (req, res, next) => {
  let { nota: notaContent, id_terapeuta } = req.body;
  try {
    let { id_cita } = notaContent;
    let nota = await Nota.query()
      .where("id_cita", "=", id_cita)
      .limit(1)
      .first();
    if (nota) {
      return res
        .status(403)
        .json(
          "No puedes crear una nota, pues la cita asociada ya cuenta con una nota creada"
        );
    }
    let paciente = await Terapeuta.query()
      .withGraphJoined("pacientes.[citas]")
      .where("pacientes:citas.id", "=", id_cita)
      .andWhere("pacientes:citas.id_terapeuta", "=", id_terapeuta)
      .limit(1)
      .first()
      .debug();
    console.log({ paciente });
    if (!paciente) {
      return res
        .status(401)
        .json("Este paciente no tiene relación alguna con el terapeuta");
    }

    let notaCreada = await Nota.query().insertAndFetch(notaContent);
    return res.status(201).json(notaCreada);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.validarAutoridad = async (req, res, next) => {
  let { id_terapeuta, id } = req.body;
  try {
    let nota = await Nota.query().findById(id);

    if (!nota)
      return res.status(404).json("No se encontro la nota que deseas eliminar");
    let cita = await nota.$relatedQuery("cita_nota");

    if (cita.id_terapeuta !== Number(id_terapeuta))
      return res.status(403).json("No tienes acceso para manipular esta nota");
    res.nota = nota;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.eliminarNota = async (req, res, next) => {
  let { nota } = res;
  try {
    if (!nota) {
      throw new Error("Falta property 'nota' en 'res'");
    }
    let resultado = await nota.$query().delete();
    return res.status(200).json(resultado);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.modificarNota = async (req, res, next) => {
  let { nota: partialNota } = req.body;
  let { nota } = res;
  try {
    if (!nota) {
      throw new Error("Falta property 'nota' en 'res'");
    }
    if (partialNota.id_cita !== nota.id_cita)
      return res.status(400).json("No se puede modificar la cita de una nota");
    await nota.$query().patchAndFetch(partialNota);
    let modificado = await nota
      .$query()
      .withGraphJoined("[cita_nota as cita.[terapeuta_datos.usuario]]")
      .modifyGraph("cita", (builder) => {
        builder.select("id", "id_terapeuta", "fecha", "id_paciente");
      })
      .modifyGraph("cita.terapeuta_datos", (builder) => {
        builder.select("id", "id_usuario");
      })
      .modifyGraph("cita.terapeuta_datos.usuario", (builder) => {
        builder.select("id", "rol", "nombre", "foto_perfil");
      });
    return res.status(200).json(modificado);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.verNotasTerapeuta = async (req, res, next) => {
  let { id_terapeuta } = req.params;
  let { id_paciente } = req.query;
  try {
    let notas = await Nota.query()
      .withGraphJoined("[cita_nota as cita.[terapeuta_datos.usuario]]")
      .where((builder) => {
        builder
          .where("cita.id_terapeuta", "=", id_terapeuta)
          .orWhereIn(
            "notas.id",
            Nota.query()
              .joinRelated("terapeuta_compartida as terapeuta")
              .where("terapeuta.id", "=", id_terapeuta)
              .select("notas.id")
          );
      })
      .modify((builder) => {
        if (id_paciente) {
          console.log({ id_paciente });
          builder.andWhere("cita.id_paciente", "=", id_paciente);
        }
      })
      .modifyGraph("cita", (builder) => {
        builder.select("id", "id_terapeuta", "fecha", "id_paciente");
      })
      .modifyGraph("cita.terapeuta_datos", (builder) => {
        builder.select("id", "id_usuario");
      })
      .modifyGraph("cita.terapeuta_datos.usuario", (builder) => {
        builder.select("id", "rol", "nombre", "foto_perfil");
      })
      .orderBy("fecha_edicion", "DESC");
    notas = agruparPorFechas(notas);
    return res.status(200).json(notas);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

function agruparPorFechas(notas) {
  let fechas = {};
  notas.forEach((nota) => {
    let fecha = obtenerFechaComponent(nota.fecha_edicion);
    if (!fechas[fecha]) {
      fechas[fecha] = [];
    }
    fechas[fecha].push(nota);
  });
  return fechas;
}
