const express = require("express");
const { Cita } = require("../Models/Cita");
const { patternFecha } = require("../utils/fechas");
const date = require("date-and-time");
const router = express.Router();
/**
 * @swagger
 * /usuarios/pacientes/{id}/citas:
 *  get:
 *    summary: Permite obtener las citas de un paciente
 *    tags: [Paciente]
 *    responses:
 *      404:
 *        description: Devuelve un mensaje de error indicando que el paciente no existe
 *        content:
 *        application/json:
 *          schema:
 *            type: string
 *      200:
 *        description: Devuelve un array de citas
 *        content:
 *        application/json:
 *            schema:
 *              type: array
 *              items:
 *                  type: object
 *                  $ref: '#/components/schemas/Cita'
 *    parameters:
 *      - name: id
 *        description: Es la id el paciente
 *        in: path
 *        required: true
 *      - name: fecha
 *        description: Es la fecha a partir de la cual se mostrarán las citas
 *        in: query
 *
 */
router.get("/:id/citas", async (req, res, next) => {
  let { id } = req.params;
  let { fecha } = req.query;

  try {
    let citas = await Cita.query()
      .withGraphJoined("terapeuta_datos.[usuario]")
      .where("id_paciente", "=", id)
      .modify((builder) => {
        if (fecha) {
          let fechaInicio = date.parse(fecha, patternFecha);
          if (fecha && !isNaN(fechaInicio)) {
            let fechaInicioFormateada = date.format(fechaInicio, patternFecha);
            builder.andWhere("fecha", ">=", fechaInicioFormateada);
          }
        }
      })
      .orderBy("fecha", "DESC");
    res.status(200).json(citas);
  } catch (err) {
    console.log(err);
    res.status(500).json("Algo ha salido mal");
  }
});

module.exports = router;
