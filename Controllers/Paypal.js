const { default: axios } = require("axios");
const { PAYPAL_URL, PAYPAL_CLIENT_ID, PAYPAL_SECRET } = require("../config");
const { param } = require("../routes");
const Carrito = require("../Models/Carrito");
const Usuario = require("../Models/Usuario");

//Permite crear una orden a partir del carrito de un pacinete
exports.crearOrden = async (req, res, next) => {
  let { access_token } = res;
  let { id_paciente } = req.params;

  let carrito = await Carrito.query()
    .withGraphFetched("producto.terapeuta.usuario")
    .where("id_paciente", "=", id_paciente);

  if (carrito.length === 0)
    return res.status(404).json("No hay items en el carrito");
  let purchase_units = [];

  carrito.forEach(
    ({
      producto: {
        terapeuta: { usuario, ...itemTerapeuta },
        ...itemProducto
      },
      ...itemCarrito
    }) => {
      let index = purchase_units.findIndex(
        ({ payee: { email_address } }) => email_address === usuario.email
      );
      let item = {
        name: itemProducto.nombre,
        quantity: itemCarrito.cantidad,
        unit_amount: {
          currency_code: "MXN",
          value: itemProducto.precio,
        },
      };
      let amount = {
        currency_code: "MXN",
        value: itemProducto.precio * itemCarrito.cantidad,
        breakdown: {
          item_total: {
            currency_code: "MXN",
            value: itemProducto.precio * itemCarrito.cantidad,
          },
        },
      };
      if (index != -1) {
        purchase_units[index].items.push(item);
        let amountFound = purchase_units[index].amount;
        purchase_units[index].amount = {
          ...amountFound,
          value: amountFound.value + itemProducto.precio * itemCarrito.cantidad,
          breakdown: {
            item_total: {
              currency_code: "MXN",
              value:
                amountFound.value + itemProducto.precio * itemCarrito.cantidad,
            },
          },
        };
      } else {
        let payee = {
          email_address: usuario.email,
        };
        purchase_units.push({
          reference_id: itemTerapeuta.id,
          payee,
          amount,
          items: [item],
        });
      }
    }
  );
  console.log(purchase_units);
  const order = {
    intent: "CAPTURE",
    purchase_units,
    application_context: {
      brand_name: "Kbocchi",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `http://localhost:4000/capture-order`,
      cancel_url: `http://localhost:4000/cancel-payment`,
    },
  };
  try {
    const response = await axios.post(
      `${PAYPAL_URL}/v2/checkout/orders`,
      order,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return res.json(response.data);
  } catch (err) {
    console.error(err);
    return res.json("Algo ha salido mal generando la orden");
  }
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

exports.crearVinculacionLink = async (req, res, next) => {
  let { id_terapeuta } = req.params;
  try {
    let usuario = await Usuario.query()
      .withGraphJoined("terapeuta")
      .findOne({ "terapeuta.id": id_terapeuta });
    if (!usuario) return res.status(404).json("No se encontro el vendedor");
    let onboardBody = {
      tracking_id: `${id_terapeuta}`,
      operations: [
        {
          operation: "API_INTEGRATION",
          api_integration_preference: {
            rest_api_integration: {
              integration_method: "PAYPAL",
              integration_type: "THIRD_PARTY",
              third_party_details: {
                features: ["PAYMENT", "REFUND"],
              },
            },
          },
        },
      ],
      partner_config_override: {
        return_url: `${process.env.FRONT_END_HOST}/app/perfil`,
      },
      products: ["EXPRESS_CHECKOUT"],
      legal_consents: [{ type: "SHARE_DATA_CONSENT", granted: true }],
    };
    let onboardResponse = await axios.post(
      `${PAYPAL_URL}/v2/customer/partner-referrals`,
      onboardBody,
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_SECRET,
        },
      }
    );
    return res.status(200).json(onboardResponse.data);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal generando el onboarding");
  }
};
exports.getVinculacionStatus = async (req, res, next) => {
  let { id_terapeuta } = req.params;
  try {
    let usuario = await Usuario.query()
      .withGraphJoined("terapeuta")
      .findOne({ "terapeuta.id": id_terapeuta });
    if (!usuario) return res.status(404).json("No se encontro el vendedor");
    let onboardBody = {
      tracking_id: `${id_terapeuta}`,
      operations: [
        {
          operation: "API_INTEGRATION",
          api_integration_preference: {
            rest_api_integration: {
              integration_method: "PAYPAL",
              integration_type: "THIRD_PARTY",
              third_party_details: {
                features: ["PAYMENT", "REFUND"],
              },
            },
          },
        },
      ],
      products: ["EXPRESS_CHECKOUT"],
      legal_consents: [{ type: "SHARE_DATA_CONSENT", granted: true }],
    };
    let onboardResponse = await axios.post(
      `${PAYPAL_URL}/v2/customer/partner-referrals`,
      onboardBody,
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_SECRET,
        },
      }
    );
    return res.status(200).json(onboardResponse.data);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal generando el onboarding");
  }
};
exports.agregarMerchantId = async (req, res, next) => {
  console.log({ body: req.body });
  return res.status(200).json(req.body);
};
