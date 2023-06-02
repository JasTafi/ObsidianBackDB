import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const userScheme = new Schema({
  email: String,
  passwordHash: String,
  photoUrl: String,
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  bloqueado: {
    default: false,
    type: Boolean,
  },
  allowsLocaStorage: {
    default: false,
    type: Boolean,
  },
  administrador: {
    default: false,
    type: Boolean,
  },
  favoritos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'accesorios',
    }
  ],
});

// Genero el token de acceso (mi secreto)
userScheme.methods.generateAccesToken = function () {
  const  token = jwt.sign({ _id: this._id }, 'mi secreto');
  return token;
};

export default mongoose.model("User", userScheme);