const Notificacion = require("../Models/Notificacion");

exports.generarNotificacion = async ({
  id_usuario,
  descripcion,
  contexto,
  titulo,
}) => {
  let notificacion = await Notificacion.query().insertAndFetch({
    id_usuario,
    descripcion,
    contexto,
    titulo
  });
  //aquí va fcm
  return notificacion;
};
