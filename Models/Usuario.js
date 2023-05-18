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
        from: "usuario.id",
        to: "paciente.id_usuario",
      },
    },
    terapeuta: {
      relation: Model.HasOneRelation,
      modelClass: Terapeuta,
      join: {
        from: "usuario.id",
        to: "terapeuta.id_usuario",
      },
    },
  };
  crearUsuario = async (usuario) => {
    let newUsuario = await Usuario.query().insertGraphAndFetch(usuario);
    return newUsuario;
  };
}

module.exports = Usuario;
