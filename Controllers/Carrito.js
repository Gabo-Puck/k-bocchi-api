const Carrito = require("../Models/Carrito");
const Producto = require("../Models/Productos");
const { actualizar } = require("./Productos");

exports.addProducto = async (req, res, next) => {
  //Obtenemos el producto encontrado
  let { producto } = res;
  //Obtenemos el item de carrito que queremos agregar
  let { cantidad, id_producto, id_paciente } = req.body;
  try {
    //Si el producto encontrado ya no tiene stock devolvemos mensajes apropiados
    if (producto.hasStock === 0) {
      res.status(420).json("No tiene stock");
      return;
    }
    //Si el producto encontrado no tiene stock suficiente para satisfacer la cantidad requerida por el cliente devolvemos mensaje apropiado
    if (producto.stock < cantidad) {
      res.status(421).json("No hay stock suficiente");
      return;
    }
    //Obtenemos la cantidad de stock actualizada, restando la cantidad requerida por el cliente
    let newStock = producto.stock - cantidad;
    //Actualizamos el stock del producto
    let actualizado;
    try {
      console.log("FASE DE ACTUALIZACION DE STOCK");
      actualizado = await actualizar({ id: id_producto, stock: newStock });
    } catch (err) {
      throw err;
    }
    //Buscamos si el producto ya esta en el carrito del usuario
    let carritoEncontrado;
    let carrito;
    try {
      carritoEncontrado = await verCarritoItem({ id_producto, id_paciente });
      //Si ya esta entonces
      if (carritoEncontrado) {
        //actualizamos la cantidad
        let newCantidad = carritoEncontrado.cantidad + cantidad;
        carrito = await modifyProductoCarrito({
          id_producto,
          id_paciente,
          cantidad: newCantidad,
        });
        //Si no esta entonces
      } else {
        //insertamos el producto y la cantidad al carrito del usuario
        carrito = await addProductoCarrito({
          id_producto,
          id_paciente,
          cantidad,
        });
      }
    } catch (err) {
      throw err;
    }
    return res.status(200).json(carrito);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.deleteProducto = async (req, res, next) => {
  //Obtenemos el producto encontrado
  let { producto } = res;
  //Obtenemos el item de carrito que queremos agregar
  let { id_paciente, id_producto } = req.params;
  let { cantidad } = req.query;
  if (!cantidad) cantidad = 1;
  //Parseamos a Number porque props en req.query siempre son string
  cantidad = Number.parseInt(cantidad);
  try {
    //Obtenemos el producto en el carrito
    let carritoItem = await verCarritoItem({ id_paciente, id_producto });
    //Si no existe, se lo hacemos saber al cliente
    if (!carritoItem)
      return res
        .status(404)
        .json("Este producto no esta en el carrito del paciente");
    //Si la cantidad del producto en el carrito es menor a la que se quiere eliminar
    //hacemos que cantidad sea igual a la cantidad de producto en el carrito
    if (carritoItem.cantidad < cantidad) cantidad = carritoItem.cantidad;
    //Obtenemos el stock actualizado
    let newStock = producto.stock + cantidad;
    //Actualizamos el stock del producto
    let actualizado;
    try {
      console.log("FASE DE ACTUALIZACION DE STOCK");
      actualizado = await actualizar({ id: id_producto, stock: newStock });
    } catch (err) {
      throw err;
    }
    //Actualizamos la canitdad en el carrito el usuario
    let carrito;
    try {
      //Obtenemos la nueva cantidad
      let newCantidad = carritoItem.cantidad - cantidad;
      //Si la nueva cantidad es igual a 0, eliminamos el producto del carrito
      if (newCantidad === 0) {
        carrito = await deleteCarritoItem({ id_paciente, id_producto });
      } else {
        //Si no es igual, actualizamos la cantidad de producto en el carrito
        carrito = await modifyProductoCarrito({
          id_producto,
          id_paciente,
          cantidad: newCantidad,
        });
      }
    } catch (err) {
      throw err;
    }
    return res.status(200).json(carrito);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo ha salido mal");
  }
};
exports.verCarrito = async (req, res, next) => {
  let { id_paciente } = req.params;
  try {
    let carrito = await Producto.query()
      .joinRelated("carritos")
      .where("carritos.id", "=", id_paciente);
    return res.status(200).json(carrito);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};

const addProductoCarrito = async (carrito) => {
  try {
    let carritoCreado = await Carrito.query().insertAndFetch(carrito);
    return carritoCreado;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const modifyProductoCarrito = async (carrito) => {
  try {
    let carritoModificado = await Carrito.query().patchAndFetchById(
      [carrito.id_paciente, carrito.id_producto],
      { cantidad: carrito.cantidad }
    );
    return carritoModificado;
  } catch (err) {
    throw err;
  }
};

const deleteCarritoItem = async (carrito) => {
  try {
    let eliminado = await Carrito.query().deleteById([
      carrito.id_paciente,
      carrito.id_producto,
    ]);
    return eliminado;
  } catch (err) {
    throw err;
  }
};
const verCarritoItem = async (carrito) => {
  try {
    let carritoCreado = await Carrito.query().findById([
      carrito.id_paciente,
      carrito.id_producto,
    ]);
    return carritoCreado;
  } catch (err) {
    throw err;
  }
};
