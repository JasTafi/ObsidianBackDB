import Productoschema from '../models/producto';

const maxElements = 20;
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
      error: "Error al obtener el producto:" + ex.message,
    });
  }
}

// Traer producto por ID
async function GetProductById(req, res) {
  console.log(req);
  const { id } = req.params;

  try {
    const producto = await Productoschema.findById(id);
    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener el producto 1:', error);
    res.status(500).json({
      ok: false,
      message: 'Error al obener el producto 2'
    });
  }
}  

// Guardar un nuevo producto en la base de dato
async function AddProductos(req, res) {
  try {
    console.log('Recibiendo solicitud para agregar producto:', req.body);

    if (!req.body.nombre || !req.body.categoria || !req.body.precio || !req.body.stock || !req.body.descripcion === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'Todos los campos deben estar llenos',
      });
    }
    const AddedProducto = await Productoschema.create(req.body);
    console.log('Producto agregado con éxito:', AddedProducto);

    return res.status(201).json({
      ok: true,
      added_producto: AddedProducto,
    });
  } catch (error) {
    console.error('Error al agregar el producto:', error);
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
    const idProduct = await Productoschema.findById(id);

    if(!idProduct) {
      console.error('Producto no encontrado');
      return res.status(404).json({
        ok: false,
        error: 'Producto no encontrado'
      });
    }
    
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


export {GetAllProductos, GetProductById, AddProductos, UpdateProducto, DeleteProducto};