const date = require("date-and-time");
const patternFecha = date.compile("YYYY-MM-DD"); //Formateador que permite convertir un objeto Date a un string con el formato indicado de fecha
const patternFechaCompleta = date.compile("YYYY-MM-DD HH:mm:ss"); //Formateador que permite convertir un objeto Date a un string con el formato indicado de horas
const patternHora = date.compile("HH:mm:ss"); //Formateador que permite convertir un objeto Date a un string con el formato indicado de fecha
/**
 *  Función que permite obtener la fecha actual en America/Mexico_City
 * @returns {Date} Fecha actual en GMT-6 (Huso horario en America/Mexico_City)
 */

const obtenerFechaActualMexico = () => {
  return date.addHours(new Date(), -6, true);
};

/**
 * Función que permite obtener un string representando la fecha. Si no se provee una fecha
 * se devuelve la fecha actual en GMT-6
 * @param {Date} fecha Objeto Date del cual queremos obtener únicamente su fecha
 * @returns
 */
const obtenerFechaComponent = (fecha = obtenerFechaActualMexico()) => {
  return fecha.toISOString().split("T")[0];
};
module.exports = {
  obtenerFechaActualMexico,
  patternFecha,
  patternFechaCompleta,
  patternHora,
  obtenerFechaComponent,
};
