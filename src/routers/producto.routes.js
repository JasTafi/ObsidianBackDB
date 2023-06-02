import express from "express";
import { GetAllProductos, AddProductos, UpdateProducto, DeleteProducto } from "../controllers/producto.controller";
import { Authenticate } from "../helpers/token.helpers";

const router = express.Router();

  //traernos todos los productos almacenados en la base de datos
router.get('/accesorio', GetAllProductos);

  //creamos un producto nuevo
router.post('/accesorio', Authenticate, AddProductos)

  //modificar un producto por id
router.put('/accesorio/:id', Authenticate, UpdateProducto);

  //borrar una tarea or id
router.delete('/accesorio/:id',Authenticate, DeleteProducto);

export default router