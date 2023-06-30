const { Model } = require("objection");
const Mensaje = require("./Mensaje");

class Usuario extends Model {
  static get tableName() {
    return "usuarios";
  }

  static relationMappings() {
    const Terapeuta = require("./Terapeuta");
    const Paciente = require("./Paciente");
    return {
      paciente: {
        relation: Model.HasOneRelation,
        modelClass: Paciente,
        join: {
          from: "usuarios.id",
          to: "pacientes.id_usuario",
        },
      },
      terapeuta: {
        relation: Model.HasOneRelation,
        modelClass: Terapeuta,
        join: {
          from: "usuarios.id",
          to: "terapeutas.id_usuario",
        },
      },
      mensajes_enviados: {
        relation: Model.HasManyRelation,
        modelClass: Mensaje,
        join: {
          from: "usuarios.id",
          to: "mensajes.id_from",
        },
      },
      mensajes_recibidos: {
        relation: Model.HasManyRelation,
        modelClass: Mensaje,
        join: {
          from: "usuarios.id",
          to: "mensajes.id_to",
        },
      },
      chats: {
        relation: Model.ManyToManyRelation,
        modelClass: Usuario,
        join: {
          from: "usuarios.id",
          through:{
            modelClass: Mensaje,
            from:"mensajes.id_from",
            to:"mensajes.id_to"
          },
          to: "usuarios.id",
        },
      },
    };
  }
  static crearUsuarioBaseDatos = async (usuario) => {
    let newUsuario = await Usuario.query().insertGraphAndFetch(usuario);
    return newUsuario;
  };
  static crearUsuarioFirebase = async (usuario) => {
    let newUsuario = await Usuario.query().insertGraphAndFetch(usuario);

    return newUsuario;
  };
}

module.exports = Usuario;
