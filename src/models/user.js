import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

import { TemporaryToken } from "../helpers/token.helpers";

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
      ref: "accesorios",
    },
  ],
  carrito: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accesorios",
    },
  ],
  TemporaryToken: {
    token: String,
    expirationToken: Date
  },
  recoveryCodes: [
    {
      code: String,
      expiresAt: Date,
    },
  ],
  pedido: [
    {
      mail: String,
      fecha: {
        type: Date,
        default: Date.now()
      },
      nombre: {
        nombres: String,
        apellidos: String,
      },
      direccion: {
        departamento: String,
        calle: String,
        numero: String,
        localidad: String,
        provincia: String,
      },
      producto: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "accesorios",
        },
      ],
      estado: {
        type: String,
        enum: ["sin realizar", "preparando", "realizado"],
        default: "sin realizar",
      },
      virtual_delete: {
        type: Boolean,
        default: false
      }
    },
  ],
});

//  Agrega un método para generar un token temporal
userScheme.methods.generateTemporaryPaswordResetToken = function () {
  const token = TemporaryToken(this._id);
  return token;
}

// Sobrescribe el json que devuelve mongosse, y le pido que no devuelva estas propiedades
userScheme.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.passwordHash;
    delete ret._id;
    delete ret.favoritos;
    delete ret.__v;
    delete ret.bloqueado;
  },
});

// Genero el token de acceso (mi secreto)
userScheme.methods.generateAccesToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET);
  return token;
};

export default mongoose.model("User", userScheme);
