const date = require("date-and-time");
const patternFecha = date.compile("YYYY-MM-DD"); //Formateador que permite convertir un objeto Date a un string con el formato indicado de fecha
/**
 *  Función que permite obtener la fecha actual en America/Mexico_City
 * @returns {Date} Fecha actual en GTM-6 (Huso horario en America/Mexico_City)
 */
const obtenerFechaActualMexico = () => {
  return date.addHours(new Date(), -6, true);
};
module.exports = {
  obtenerFechaActualMexico,
  patternFecha
};
