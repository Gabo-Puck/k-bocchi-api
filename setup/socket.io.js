const { Server } = require("socket.io");
const {
  obtenerFechaActualMexico,
  obtenerFechaComponent,
  obtenerFechaHoraComponent,
} = require("../utils/fechas");
const Mensaje = require("../Models/Mensaje");
const Usuario = require("../Models/Usuario");
let connectedUsers = [];
const addUsuarioConectado = (usuario) => {
  let x = connectedUsers.find((u) => usuario.id == u.id);
  if (!x) connectedUsers.push(usuario);
};
const removeUsuario = (usuario) => {
  let u = connectedUsers.filter((u) => usuario.id != u.id);
  connectedUsers = [...u];
};
function initServer(httpServer) {
  // console.log(httpServer);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
  io.of("/").adapter.on("create-room", (room) => {
    console.log(`\n\rLa sala ${room} fue creada\n\r`);
  });
  io.of("/").adapter.on("delete-room", (room) => {
    console.log(`\n\rLa sala: ${room} fue borrada\n\r`);
  });
  io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`\n\rSocket con ${id} ha entrado a la sala ${room}\n\r`);
  });
  io.of("/").adapter.on("leave-room", (room, id) => {
    console.log(`\n\rSocket con ${id} ha salido de la sala ${room}\n\r`);
  });
  io.on("connection", (socket) => {
    //Cuando la conexión del usuario al server de websockets es correcta, se emite un evento para indicarle que puede mandar sus datos
    socket.emit("connected", "ok");
    //El server escucha por un evento "send_data" que contenga los datos id y nombre del usuario.
    socket.on("send_data", ({ id, nombre }) => {
      socket.data = {
        ...socket.data,
        id,
        nombre,
      };
      // connectedUsers.add(`${socket.data.id}|${socket.data.nombre}`);
      addUsuarioConectado({ ...socket.data });

      console.log(
        `CONECTADO:\n\rSOCKET_ID: ${socket.id}\n\rSOCKET_UID(ID_USUARIO):${socket.data.id}`
      );
      socket.broadcast.emit("usuario:conectado", { ...socket.data });
      console.log("\n\rUSUARIOS CONECTADOS: \n\r", connectedUsers);
      socket.join(id);
    });
    socket.on("chat:entrar", async () => {
      socket.emit("usuario:lista", [...connectedUsers]);
    });
    socket.on("mensajes:enviar", async ({ to, contenido }) => {
      //hacer algo para guardar mensaje
      //enviarlo al destinatario
      console.log({ to, contenido });
      let mensaje = {
        id_from: socket.data.id,
        id_to: to,
        contenido: contenido,
      };
      
      let { id, fecha,id_to } = await Mensaje.query().insertAndFetch(mensaje);
      let { foto_perfil } = await Usuario.query().findById(socket.data.id);

      io.to([to, socket.data.id]).emit("mensajes:recibido", {
        id,
        id_from: socket.data.id,
        id_to: id_to,
        nombre: socket.data.nombre,
        contenido,
        fecha,
        foto_perfil,
        // from: socket.data.id,
      });
    });

    socket.on("disconnecting", async () => {
      let sockets = await io.in("room").fetchSockets();
      // connectedUsers.forEach((user) => {
      //   if (user.id === socket.data.id) connectedUsers.delete(user);
      // });
      removeUsuario({ ...socket.data });
      socket.broadcast.emit("usuario:desconectado", { ...socket.data });
      console.log("\n\rUSUARIOS CONECTADOS: \n\r", connectedUsers);
      console.log(sockets);
    });
  });
}

module.exports = {
  initServer,
};
