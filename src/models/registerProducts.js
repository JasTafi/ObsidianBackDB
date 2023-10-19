import mongoose, { Schema } from "mongoose";

const registerSchema = new Schema({
  usuario: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  direccion: {
    calle: String,
    numero: Number,
    provincia: String,
    localidad: String
  }
  ,
  producto: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accesorios",
    },
  ],
  fechaDeCompra: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("register", registerSchema);