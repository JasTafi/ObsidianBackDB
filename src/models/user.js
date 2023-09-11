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
  carrito: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'productos'
    }
  ],
  recoveryCodes: [
    {
      code: String,
      expiresAt: Date,
    }
  ],
});

// Sobrescribe el json que devuelve mongosse, y le pido que no devuelva estas propiedades
userScheme.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.passwordHash;
    delete ret._id;
    delete ret.favoritos;
    delete ret.__v;
    delete ret.bloqueado;
    delete ret.administrador;
  }
})

// Genero el token de acceso (mi secreto)
userScheme.methods.generateAccesToken = function () {
  const  token = jwt.sign({ _id: this._id }, process.env.SECRET);
  return token;
};

export default mongoose.model("User", userScheme);