const Cita = require("../Models/Cita");
const date = require("date-and-time");
const es = require("date-and-time/locale/es");
date.locale(es);
const {
  obtenerFechaActualMexico,
  patternFecha,
  obtenerFechaComponent,
  patternFechaCompleta,
  patternHora,
  patternFechaDisplay,
} = require("../utils/fechas");
const { twilioClient, TWILIO_NUMBER } = require("../setup/twilio");
const { generarNotificacion } = require("../utils/notificaciones");
const {
  checkDentroHorario,
  checkFechaPosterior,
  checkCitasDisponibles,
  obtenerHorariosDisponibles,
} = require("./AlgoritmoCitas");
const Horario = require("../Models/Horario");

// const patternFecha2 = date.compile("YYYY-MM-DD HH:mm:ss"); //Formateador que permite convertir un objeto Date a un string con el formato indicado de fecha

exports.crearCita = async (req, res, next) => {
  try {
    let cita = req.body;
    let citaCreada = await Cita.query().insertAndFetch(cita);
    return res.status(200).json(citaCreada);
  } catch (err) {
    console.log(err);
    res.status(500).json("Algo ha salido mal");
  }
};
//Emergencia
exports.obtenerCitasPorFecha = async (req, res, next) => {
  try {
    let { fecha } = req.query;
    let { count, resultados } = res;
    // console.log({ count, resultados, fecha });
    if (
      !date.isValid(fecha, patternFechaCompleta) ||
      !/\d{4}-\d{2}-\d{2}/g.test(fecha)
    ) {
      return res.status(400).json("La fecha esta en un formato incorrecto");
    }
    let fechaSolicitada = date.format(new Date(fecha), patternFecha);
    let horaSolicitada = date.format(new Date(fecha), patternHora);
    let [terapeuta] = resultados;
    try {
      console.log({ terapeuta });
      let horario = await Horario.query().where(
        "id_terapeuta",
        "=",
        terapeuta.terapeuta.id
      );
      let horario_seleccionado = await checkDentroHorario(
        horario,
        fechaSolicitada
      );
      await checkFechaPosterior(fecha);
      let citas = await Cita.query()
        .withGraphJoined("paciente_datos.[usuario]")
        .where("id_terapeuta", "=", terapeuta.terapeuta.id)
        .modify((builder) => {
          let fechaInicio = date.parse(fechaSolicitada, patternFecha);
          let fechaLimite = date.addDays(fechaInicio, 1);
          let fecha1 = date.format(fechaInicio, patternFecha);
          let fecha2 = date.format(fechaLimite, patternFecha);
          builder
            .andWhere("fecha", ">=", fecha1)
            .andWhere("fecha", "<", fecha2);
        })
        .modifyGraph("paciente_datos.usuario", (builder) => {
          builder.select("nombre", "foto_perfil");
        })
        .orderBy("fecha", "DESC");
      await checkCitasDisponibles(horario_seleccionado, citas);
      let horarios_disponibles = obtenerHorariosDisponibles(
        horario_seleccionado,
        citas,
        fechaSolicitada
      );
      let fechaParseada = date.parse(fecha,patternFechaCompleta);
      console.log({ x: date.parse(fecha, patternFechaCompleta) });
      let f = horarios_disponibles.find(
        ({ fecha: fecha_dia }) =>
          date.format(fecha_dia,patternFechaCompleta) == date.format(fechaParseada, patternFechaCompleta)
      );
      return res.status(200).json({ found: f || null, horarios_disponibles });
    } catch (err) {
      // if (err.razon) {
      //   let diasDisponibles = await buscarFechasDisponibles(
      //     id_terapeuta,
      //     horario,
      //     fecha
      //   );
      //   return res.status(420).json(diasDisponibles);
      // }
      console.log(err);
    }
    return res.status(200).json(null);
  } catch (err) {
    console.log(err);
    res.status(500).json("Algo ha salido mal");
  }
};

exports.borrarCita = async (req, res, next) => {
  try {
    let { id } = req.params;
    //obtenemos la cita con todo y los datos del paciente y terapeuta
    let cita = await Cita.query()
      .withGraphFetched("[terapeuta_datos.usuario,paciente_datos.usuario]")
      .findById(id);
    //Si no existe retornamos un 404
    if (!cita) return res.status(404).json("No se encontro la cita");
    //Destructuramos las propiedades nombre e id de los objetos usuario de terapeuta_datos y paciente_datos respectivamente
    let {
      terapeuta_datos: {
        usuario: { nombre: nombre_terapeuta, id: id_usuario_terapeuta },
      },
      paciente_datos: {
        usuario: { nombre: nombre_paciente, id: id_usuario_paciente },
      },
      fecha,
    } = cita;
    //Creamos el string que representa la fecha de la cita en un formato más "amigable"
    let fechaCitaDisplayNotificacion = date.format(
      new Date(fecha),
      patternFechaDisplay
    );
    //Creamos el string que representa la hora de la cita
    let horaCitaDisplayNotificacion = date.format(new Date(fecha), patternHora);

    //Borramos la cita
    await cita.$query().delete();
    //Mediante la funcion de generarNotificacion generamos la notificación para cada usuario
    //terapeuta
    await generarNotificacion({
      id_usuario: id_usuario_terapeuta,
      contexto_web: "/app/terapeuta/agenda",
      contexto_movil: "",
      titulo: "Cita cancelada",
      descripcion: `Tu cita del día ${fechaCitaDisplayNotificacion} a las ${horaCitaDisplayNotificacion} con ${nombre_paciente} ha sido cancelada`,
    });
    //paciente
    await generarNotificacion({
      id_usuario: id_usuario_paciente,
      contexto_web: "/app/paciente/chatbot",
      contexto_movil: "",
      titulo: "Cita cancelada",
      descripcion: `Tu cita del día ${fechaCitaDisplayNotificacion} a las ${horaCitaDisplayNotificacion} con ${nombre_terapeuta} ha sido cancelada. ¡Agenda otra!`,
    });
    return res.status(200).json(cita);
  } catch (err) {
    console.log(err);
    res.status(500).json("Algo ha salido mal");
  }
};

exports.modificarCita = async (req, res, next) => {
  try {
    let cita = req.body;
    let citaEncontrada = await Cita.query().findById(cita.id);
    if (!citaEncontrada) return res.status(404).json("No se encontro la cita");
    let citaModificada = await citaEncontrada.$query().patchAndFetch(cita);
    return res.status(200).json(citaModificada);
  } catch (err) {
    console.log(err);
    res.status(500).json("Algo ha salido mal");
  }
};

exports.verCita = async (req, res, next) => {
  try {
    let { id } = req.params;
    let citaEncontrada = await Cita.query().findById(id);
    if (!citaEncontrada) return res.status(404).json("No se encontro la cita");
    return res.status(200).json(citaEncontrada);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.verTodasCitas = async (req, res, next) => {
  try {
    let citas = await Cita.query();
    return res.status(200).json(citas);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

exports.obtenerCitasFechasExcluyente = async (id_terapeuta, fecha) => {
  try {
    let citas = await Cita.query()
      .where("id_terapeuta", "=", id_terapeuta)
      .modify((builder) => {
        let fechaInicio = date.parse(fecha, patternFecha);
        if (fecha && !isNaN(fechaInicio)) {
          let fechaLimite = date.addDays(fechaInicio, 1);
          let fechaInicioFormateada = date.format(fechaInicio, patternFecha);
          let FechaFinalFormateada = date.format(fechaLimite, patternFecha);
          let fechaActual = date.addDays(obtenerFechaActualMexico(), 1);
          let fechaActualFormateada = date.format(
            fechaActual,
            patternFecha,
            true
          );
          // console.log(new Date(Date.now()).toLocaleString());
          builder
            .andWhere("fecha", ">=", fechaActualFormateada)
            .andWhere("fecha", "<", fechaInicioFormateada)
            .orWhere("fecha", ">=", FechaFinalFormateada);
        }
      })
      .orderBy("fecha", "DESC")
      .debug();
    return citas;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

exports.verCitasTerapeuta = async (req, res, next) => {
  try {
    let { id_terapeuta } = req.params;
    let { fecha } = req.query;
    let citas = await Cita.query()
      .withGraphJoined("paciente_datos.[usuario]")
      .where("id_terapeuta", "=", id_terapeuta)
      .modify((builder) => {
        let fechaInicio = date.parse(fecha || "", patternFecha);
        if (fecha && !isNaN(fechaInicio)) {
          let fechaLimite = date.addDays(fechaInicio, 1);
          let fecha1 = date.format(fechaInicio, patternFecha);
          let fecha2 = date.format(fechaLimite, patternFecha);
          builder
            .andWhere("fecha", ">=", fecha1)
            .andWhere("fecha", "<", fecha2);
        }
      })
      .modifyGraph("paciente_datos.usuario", (builder) => {
        builder.select("nombre", "foto_perfil");
      })
      .orderBy("fecha", "DESC");
    citas = citas.map((m) => {
      let x = { ...m.paciente_datos.usuario };
      delete m.paciente_datos;
      return { ...m, ...x };
    });
    // .debug();
    res.body = { ...res.body, citas };
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.verAgenda = async (req, res, next) => {
  try {
    let { id_terapeuta } = req.params;
    let fecha = obtenerFechaActualMexico();
    let citas = await Cita.query()
      .withGraphJoined("paciente_datos.[usuario]")
      .where("id_terapeuta", "=", id_terapeuta)
      .modify((builder) => {
        let fecha1 = date.format(fecha, patternFechaCompleta);
        builder.andWhere("fecha", ">=", fecha1);
      })
      .modifyGraph("paciente_datos.usuario", (builder) => {
        builder.select("nombre", "foto_perfil", "id as id_usuario");
      })
      .orderBy("fecha", "ASC");
    citas = citas.map((m) => {
      let x = { ...m.paciente_datos.usuario };
      delete m.paciente_datos;
      return { ...m, ...x };
    });
    let x = agruparPorFechas(citas);
    res.body = { ...res.body, citas: x };
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};

//Esta funcion permite notificar a los terapeutas de su proxima cita
//Avisa con 10 minutos de antelación (aprox)
//Se ejecuta mediante cronjobs en firebase
exports.notificarCita = async (req, res, next) => {
  try {
    //Obtener la fecha actual de ejecución
    let fechaActual = obtenerFechaActualMexico();
    //Agregamos 10 min a la fecha actual para poder definir un limite de cuales citas tenemos que notificar
    let fechaInicioCita = date.addMinutes(fechaActual, 10);
    let citasProximas = await Cita.query()
      .withGraphFetched("[terapeuta_datos.usuario,paciente_datos.usuario]")
      .where((builder) => {
        builder
          .where("fecha", ">", fechaActual)
          .andWhere("fecha", "<=", fechaInicioCita);
      })
      .andWhere("notificado", "=", 0)
      .debug();
    let messages = citasProximas
      .map(
        ({
          id,
          terapeuta_datos: {
            usuario: { nombre: nombre_terapeuta, telefono },
          },
          paciente_datos: {
            usuario: { nombre: nombre_paciente },
          },
          fecha,
          domicilio,
        }) => ({
          nombre_terapeuta: nombre_terapeuta.split(" ")[0],
          nombre_paciente,
          telefono,
          hora: date.format(new Date(fecha), patternHora),
          domicilio,
          id,
        })
      )
      .map(
        ({
          domicilio,
          hora,
          nombre_paciente,
          nombre_terapeuta,
          telefono,
          id,
        }) => ({
          to: `+52${telefono}`,
          from: TWILIO_NUMBER,
          body: `\nHola ${nombre_terapeuta}, tienes una cita con ${nombre_paciente} hoy proximamente\nHora: ${hora}`,
          id,
        })
      );
    let responses = [];
    await Promise.all(
      messages.map(async ({ id, ...message }) => {
        let response = await twilioClient.messages.create(message);
        await Cita.query().findById(id).patch({ notificado: 1 });
        responses.push(response);
      })
    );
    return res.json(responses);
    // let response = await twilioClient.messages.create({
    //   to: "+523323821711",
    //   from: TWILIO_NUMBER,
    //   body: "Hola\nGabo",
    // });
    // return res.json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Not ok");
  }
};
function agruparPorFechas(citas) {
  let fechas = {};
  citas.forEach((cita) => {
    let fecha = obtenerFechaComponent(cita.fecha);
    if (!fechas[fecha]) {
      fechas[fecha] = [];
    }
    fechas[fecha].push(cita);
  });
  fechas = Object.keys(fechas).map((f) => ({ header: f, citas: fechas[f] }));
  return fechas;
}

// {
//   "id_paciente": 78,
//   "domicilio": "Valle de la Barca 1731, Parque Real, Zapopan, Jalisco, México",
//   "fecha": "2023-06-15T18:00:00.000Z",
//   "id": 259,
//   "id_terapeuta": 210,
//   "lat": 20.7429421,
//   "lng": -103.4433085,
//   "modalidad": "domicilio"
// }
