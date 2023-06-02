import Productoschema from '../models/producto';

const maxElements = 4;
//Segmento la responsabilidad de conexion a la base de datos de mi index

//Trae todos los productos de la base de dato 
async function GetAllProductos(req, res) {
  const {page} = req.query
  try {
    const productos = await Productoschema.find()
      .skip(maxElements * (page - 1))
      .limit(maxElements);
    return res.status(200).json({
      ok: true,
      data: productos,
    })
  } catch (ex) {
    //500 ->Internal Server Error
    return res.status(500).json({
      ok: false,
      error: ex,
    });
  }
}

// Guardar un nuevo producto en la base de dato
async function AddProductos(req, res) {
  try {

    if (!req.body.nombre || !req.body.categoria || !req.body.precio || !req.body.stock || !req.body.descripcion === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'Todos los campos deben estar llenos',
      });
    }
    const AddedProducto = await Productoschema.create(req.body);
    return res.status(201).json({
      ok: true,
      added_producto: AddedProducto,
    });
  } catch (error) {
    //500 ->Internal Server Error
    return res.status(500).json({
      ok: false,
      error: error,
    });
  }
}

// Modificar un producto por id
async function UpdateProducto(req, res) {
  const { id } = req.params;
  try {
    const updatedProducto = await Productoschema.findByIdAndUpdate(id, req.body);
    return res.status(201).json({
      ok: true,
      update_producto: updatedProducto,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error,
    })
  }
}

// Borrar un producto de la base
async function DeleteProducto(req, res) {
  try {
    const { id } = req.params;
    const deletedProducto = await Productoschema.findByIdAndDelete(id);
    return res.status(201).json({
      ok: true,
      deleted_producto: deletedProducto,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error,
    })
  }
}


export {GetAllProductos, AddProductos, UpdateProducto, DeleteProducto};