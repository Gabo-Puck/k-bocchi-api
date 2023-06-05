const { Server } = require("socket.io");
const connectedUsers = new Set();
function initServer(httpServer) {
  console.log(httpServer);
  const io = new Server(httpServer, {
    cors: {
      origin: "*"
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
      connectedUsers.add(`${socket.data.id}|${socket.data.nombre}`);
      console.log(
        `CONECTADO:\n\rSOCKET_ID: ${socket.id}\n\rSOCKET_UID(ID_USUARIO):${socket.data.id}`
      );
      console.log("\n\rUSUARIOS CONECTADOS: \n\r", connectedUsers.values());
      socket.join(id);
    });

    socket.on("mensajes:enviar", async ({ to, contenido }) => {
      //hacer algo para guardar mensaje
      //enviarlo al destinatario
      let fecha = new Date(Date.now()).toISOString().slice(0, 19).replace("T", " ");
      io.to(to).emit("mensajes:recibido", {
        nombre: socket.data.nombre,
        from: socket.data.id,
        contenido,
        fecha
      });
    });

    socket.on("disconnecting", async () => {
      let sockets = await io.in("room").fetchSockets();
      connectedUsers.forEach((user) => {
        if (user.id === socket.data.id) connectedUsers.delete(user);
      });
      console.log("\n\rUSUARIOS CONECTADOS: \n\r", connectedUsers.values());
      console.log(sockets);
    });
  });
}

module.exports = {
  initServer,
};
