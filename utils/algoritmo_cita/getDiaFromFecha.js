let days = {
  0: "domingo",
  1: "lunes",
  2: "martes",
  3: "miercoles",
  4: "jueves",
  5: "viernes",
  6: "sabado",
};
exports.getDiaFromFecha = (f) => {
  let fecha = new Date(f);
  let dia = fecha.getUTCDay();
  // console.log(`${dia}-${days[dia]}`)
  return days[dia];
};
