import mongoose, { Schema } from "mongoose";

const productoSchema = new Schema({
  nombre: String,
  categoria: String,
  precio: Number,
  stock: Number,
  Descripcion: String,
  urlImg: String

})

export default mongoose.model('accesorios', productoSchema);