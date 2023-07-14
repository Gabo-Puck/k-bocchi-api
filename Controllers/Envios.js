const EasyPost = require("@easypost/api");
const { Address } = require("@easypost/api");
const Terapeuta = require("../Models/Terapeuta");
const { getCarritoPaciente } = require("./Carrito");
const {
  calculateBoxSizeForTerapeuta,
  obtenerTamanoCajas,
} = require("../utils/algoritmoCalcularCaja");
const { obtenerComponentesDireccion } = require("../utils/direcciones");
const { generarNumeroAleatorio } = require("../utils/aleatorios");

exports.webhook = (req, res, next) => {
  console.log({ body: res.body });
  res.status(200).json("Ok");
};
exports.crearEnvio = async (req, res, next) => {
  const client = new EasyPost(process.env.EASYPOST_API_KEY);
  const shipment = await client.Shipment.create({
    from_address: {
      street1: "417 MONTGOMERY ST",
      street2: "FLOOR 5",
      city: "SAN FRANCISCO",
      state: "CA",
      zip: "94104",
      country: "US",
      company: "EasyPost",
      phone: "415-123-4567",
    },
    to_address: {
      name: "Dr. Steve Brule",
      street1: "179 N Harbor Dr",
      city: "Redondo Beach",
      state: "CA",
      zip: "90277",
      country: "US",
      phone: "4155559999",
    },
    parcel: {
      length: 8,
      width: 5,
      height: 5,
      weight: 5,
    },
  });
  // shipment.save();
  shipment.rates.forEach((rate) => {
    console.log(rate.carrier);
    console.log(rate.service);
    console.log(rate.rate);
    console.log(rate.id);
  });

  // const boughtShipment = await Shipment.buy(
  //   shipment.id,
  //   shipment.lowestRate()
  // );

  console.log({ shipment });
  res.status(200).json("Ok");
};

exports.calcularEnvio = async (req, res, next) => {
  try {
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal obteniendo los costos");
  }
};
exports.verificarDomicilio = async (req, res, next) => {
  try {
    const client = new EasyPost(process.env.EASYPOST_API_KEY);
    // console.log({ body: req.body });
    let { direccion, id_paciente } = req.body;
    const fromAddress = await client.Address.create({
      verify: true,
      ...direccion,
    });
    let { verifications } = fromAddress;
    if (verifications.zip4.success === false)
      return res.status(400).json(verifications);
    if (verifications.delivery.success === false)
      return res.status(401).json(verifications);

    let precio = await calcularPrecioEnvio(fromAddress, id_paciente);
    console.log({precio});
    return res.status(200).json({ fromAddress, precio });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal obteniendo los costos");
  }
};

async function calcularPrecioEnvio(address, id_paciente) {
  let carrito = await getCarritoPaciente(id_paciente);

  let cajas = obtenerTamanoCajas(carrito);
  console.log(cajas);
  let shipments = [];
  for (let index = 0; index < cajas.length; index++) {
    const caja = cajas[index];
    let direccion = obtenerComponentesDireccion(caja.terapeuta.domicilio);
    let { nombre, telefono } = caja.terapeuta.usuario;
    const client = new EasyPost(process.env.EASYPOST_API_KEY);
    const shipment = await client.Shipment.create({
      from_address: address,
      to_address: {
        name: nombre,
        street1: direccion.calle,
        city: direccion.ciudad,
        state: direccion.estado,
        zip: direccion.codigoPostal,
        country: "MX",
        phone: telefono,
      },
      parcel: {
        length: caja.largoTotal,
        width: caja.anchoTotal,
        height: caja.alturaTotal,
        weight: caja.pesoTotal,
      },
    });
    shipments.push(shipment);
  }
  cajas = cajas.map((caja) => ({
    ...caja,
    pago_envio: generarNumeroAleatorio(50, 120),
  }));
  cajas = {
    ...cajas,
    pago_total: cajas.reduce((acc, { pago_envio }) => acc + pago_envio, 0),
  };
  return { cajas, shipments };
}
