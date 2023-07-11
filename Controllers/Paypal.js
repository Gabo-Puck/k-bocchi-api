const { default: axios } = require("axios");
const { PAYPAL_URL, PAYPAL_CLIENT_ID, PAYPAL_SECRET } = require("../config");
const { param } = require("../routes");
const Carrito = require("../Models/Carrito");

//Permite crear una orden a partir del carrito de un pacinete
exports.crearOrden = async (req, res, next) => {
  let { access_token } = res;
  let { id_paciente } = req.params;

  let carrito = await Carrito.query()
    .withGraphFetched("producto.terapeuta")
    .where("id_paciente", "=", id_paciente);

  if (carrito.length === 0)
    return res.status(404).json("No hay items en el carrito");

  let purchase_units = carrito.forEach(
    ({ producto: { terapeuta, ...producto }, ...itemCarrito }) => ({
      amount: {
        currency_code: "MXN",
        value: itemCarrito.cantidad * producto.precio,
      },
    })
  );
  console.log(purchase_units);
  //   const order = {
  //     intent: "CAPTURE",
  //     purchase_units: [
  //       {
  //         amount: {
  //           currency_code: "MXN",
  //           value: "100.00",
  //         },
  //       },
  //     ],
  //     application_context: {
  //       brand_name: "Kbocchi",
  //       landing_page: "NO_PREFERENCE",
  //       user_action: "PAY_NOW",
  //       return_url: `http://localhost:4000/capture-order`,
  //       cancel_url: `http://localhost:4000/cancel-payment`,
  //     },
  //   };
  //   const response = await axios.post(`${PAYPAL_URL}/v2/checkout/orders`, order, {
  //     headers: {
  //       Authorization: `Bearer ${access_token}`,
  //     },
  //   });
  return res.json(carrito);
};
//Esta funcion de middleware permite obtener el token de autenticación de paypal
//y lo anexa en res.access_token
exports.getToken = async (req, res, next) => {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    let {
      data: { access_token },
    } = await axios.post(`${PAYPAL_URL}/v1/oauth2/token`, params, {
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_SECRET,
      },
    });
    res.access_token = access_token;
    console.log(res.access_token);
    // return res.json("tokenizado");
    next();
  } catch (err) {
    console.log(object);
    err;
    return res.status(500).json("Algo ha salido mal obteniendo el token");
  }
};

exports.capturarOrden = async (req, res, next) => {
  return;
};
exports.cancelarOrden = async (req, res, next) => {
  return;
};
