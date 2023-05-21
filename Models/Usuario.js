const { Model } = require("objection");
const Terapeuta = require("./Terapeuta");
const Paciente = require("./Paciente");

class Usuario extends Model {
  static get tableName() {
    return "usuarios";
  }

  static relationMappings = {
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
  };
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
