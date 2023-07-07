const Producto = require("../Models/Productos");
const saltedMd5 = require("salted-md5");
const path = require("path");
const { generarNumeroAleatorio } = require("../utils/aleatorios");
const { raw, ref } = require("objection");
const { obtenerFechaComponent } = require("../utils/fechas");
exports.verProductos = async (req, res, next) => {
  let { palabra, categoria, rango_inferior, rango_superior, nuevo } = req.query;
  try {
    let fechaActual = obtenerFechaComponent();
    console.log({ nuevo });
    let productos = await Producto.query()
      .select([
        "productos.*",
        raw(
          `FN_PRODUCTO_NUEVO(productos.fecha_publicacion,"${fechaActual}")`
        ).as("isNuevo"),
        raw(`FN_HAS_STOCK(productos.stock)`).as("hasStock"),
      ])
      // .withGraphJoined("terapeuta.usuario")
      .modify((builder) => {
        if (palabra) {
          builder.where((b) => {
            b.where("productos.nombre", "like", `%${palabra}%`).orWhere(
              "productos.caracteristicas",
              "like",
              `%${palabra}%`
            );
          });
        }
        if (categoria) {
          builder.where((b) => {
            b.where("productos.categoria", "=", categoria);
          });
        }
        if (!rango_inferior) rango_inferior = 0;
        if (!rango_superior) rango_superior = Number.MAX_SAFE_INTEGER;
        builder.where((b) => {
          b.where("productos.precio", ">=", rango_inferior).andWhere(
            "productos.precio",
            "<=",
            rango_superior
          );
        });
      })
      .modify((builder) => {
        if (nuevo == 1) {
          builder.where((b) => {
            b.whereRaw(
              `FN_PRODUCTO_NUEVO(productos.fecha_publicacion,"${fechaActual}") = 1`
            );
          });
        }
      })
      .orderBy("productos.fecha_publicacion", "DESC")
      .debug();
    return res.status(200).json(productos);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Hay un error");
  }
};
exports.verProductosTerapeuta = async (req, res, next) => {
  let { id_terapeuta } = req.params;
  try {
    let productos = await verProductosTerapeuta(id_terapeuta);
    return res.status(200).json(productos);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Hay un error");
  }
};
async function crearArchivo(imagen, bucket) {
  const name = saltedMd5(
    `${imagen.name}${generarNumeroAleatorio(0, Number.MAX_SAFE_INTEGER)}`,
    "SUPER-S@LT!"
  );
  const fileName = `productos/${name}${path.extname(imagen.name)}`;
  const file = bucket.file(fileName);
  await file.save(imagen.data);
  return fileName;
}
async function eliminarArchivo(imagen, bucket) {
  await bucket.file(imagen).delete();
  return true;
}
exports.crearProducto = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No se subió ninguna imagen");
    }
    let { imagen } = req.files;
    let { producto } = req.body;
    producto = JSON.parse(producto);
    producto.imagen = await crearArchivo(imagen, req.app.locals.bucket);
    console.log({ producto });
    let productoCreado;
    try {
      productoCreado = await crear(producto);
    } catch (err) {
      console.log(err);
      await eliminarArchivo(producto.imagen, req.app.locals.bucket);
      return res.status(501).json("No se pudo crear el producto");
    }
    return res.status(200).json(productoCreado);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Hay un error");
  }
};
exports.editarProducto = async (req, res, next) => {
  let unableEdit = false;
  let editImagen = true;
  let bucket = req.app.locals.bucket;
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      editImagen = false;
    }
    let imagen;
    if (editImagen) {
      imagen = req.files.imagen;
    }
    let { producto } = req.body;
    producto = JSON.parse(producto);
    let productoEncontrado = await ver(producto.id);
    if (!productoEncontrado)
      return res.status(404).json("No se encontro producto");
    if (editImagen) {
      producto.imagen = await crearArchivo(imagen, bucket);
    }
    console.log({ producto });
    let { imagen: imagenPrevia } = productoEncontrado;
    let productoEditado;
    try {
      productoEditado = await actualizar(producto);
    } catch (err) {
      unableEdit = true;
      console.log(err);
    }
    if (unableEdit) {
      if (editImagen) await eliminarArchivo(producto.imagen, bucket);
    } else {
      if (editImagen) await eliminarArchivo(imagenPrevia, bucket);
    }
    return res.status(200).json(productoEditado);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Hay un error");
  }
};
exports.eliminarProducto = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { imagen } = await ver(id);
    let productos = await eliminar(id);
    await req.app.locals.bucket.file(imagen).delete();
    return res.status(200).json(productos);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Hay un error");
  }
};
exports.verProducto = async (req, res, next) => {
  try {
    let {id} = req.params
    let producto = await Producto.query().findById(id);
    if (!producto) return res.status(404).json("No se encontro el producto");
    res.producto = producto;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json("Algo ha salido mal");
  }
};
const crear = async (productoInsert) => {
  try {
    let producto = await Producto.query().insertAndFetch(productoInsert);
    return producto;
  } catch (error) {
    console.log(error);
    throw new Error("Algo ha salido mal");
  }
};
const eliminar = async (id) => {
  try {
    let productoEliminado = await Producto.query().deleteById(id);
    return productoEliminado;
  } catch (error) {
    console.log(error);
    throw new Error("Algo ha salido mal");
  }
};
const ver = async (id) => {
  try {
    let productoEncontrado = await Producto.query().findById(id);
    return productoEncontrado;
  } catch (error) {
    console.log(error);
    throw new Error("Algo ha salido mal");
  }
};
const verProductosTerapeuta = async (id_terapeuta) => {
  try {
    let producto = await Producto.query()
      .where("id_terapeuta", "=", id_terapeuta)
      .orderBy("fecha_publicacion", "DESC");
    return producto;
  } catch (error) {
    console.log(error);
    throw new Error("Algo ha salido mal");
  }
};
const actualizar = async (producto) => {
  try {
    let productoEncontrado = await ver(producto.id);
    let productoActualizado = await productoEncontrado
      .$query()
      .patchAndFetch(producto);
    return productoActualizado;
  } catch (error) {
    console.log(error);
    throw new Error("Algo ha salido mal");
  }
};
exports.crear = crear;
exports.eliminar = eliminar;
// exports.eliminarVarios = eliminarVarios;
exports.ver = ver;
exports.actualizar = actualizar;
