import nodemailer from "nodemailer";

import { Encrypt, Compare } from "../helpers/password.helper";
import { GenerateToken } from "../helpers/token.helpers";
import productoSchema from "../models/producto";
import userScheme from "../models/user";
//import { SendEmail } from "../helpers/nodemailer_service";

const Login_Error_Message = "El usuario o la contraseña no coincide";
const base_error_objet = {
  ok: false,
  message: "Credenciales inválidas",
};

// Agrega un usuario a la base de dato
async function AddUser(req, res) {
  try {
    const { email, password, photoUrl } = req.body;

    const passwordHash = await Encrypt(password);
    const newUser = await userScheme.create({
      email,
      photoUrl,
      passwordHash,
      favoritos: [],
    });

    return res.json({
      ok: true,
      data_added: newUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      ok: false,
      message: err,
    });
  }
}

// Mudificar un usuario por id
async function UpdateUser(req, res) {
  const { id } = req.params;
  try {
    const updatedUser = await userScheme.findByIdAndUpdate(id, req.body);
    return res.status(201).json({
      ok: true,
      update_user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error,
    });
  }
}

// Comprueva el mail y password del usuario que se esta logeando
async function Login(req, res) {
  try {
    const { email, password } = req.body;
    const userLogged = await userScheme.findOne({ email });

    if (!userLogged) return res.status(400).json(base_error_objet);

    const passwordCheck = await Compare(password, userLogged.passwordHash);

    if (!passwordCheck) return res.status(400).json(base_error_objet);

    const token = userLogged.generateAccesToken();

    return res.status(200).json({
      ok: true,
      user: userLogged,
      token: token,
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      message: err,
    });
  }
}

// Verificación de email para recuperar contraseña
async function EmailVerification(req, res) {
  try {
    const { email } = req.body;
    const userLogged = await userScheme.findOne({ email });
    let tempToken;

    if (
      (!userLogged.TemporaryToken &&
        !userLogged.TemporaryToken.token &&
        userLogged.TemporaryToken.expirationToken) ||
      userLogged.TemporaryToken.expirationToken < Date.now() || 
      userLogged.TemporaryToken.token === undefined
    ) {
      //Generar un token temporal y lo envia al usuario
      tempToken = GenerateToken(userLogged._id);

      // Asigna el token al campo TemporaryToken del usuario
      userLogged.TemporaryToken = {
        token: tempToken.token,
        expirationToken: tempToken.expirationToken,
      };

      // Guarda los cambios en la base de datos
      await userLogged.save();

      userLogged.TemporaryToken = tempToken;
      console.log("peticion de verificación de correo exitosa");
      
      // Configuración del transporte SMTP de Nodemailer
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      
      // Configuración del mensaje
      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: userLogged.email,
        subject: "Recuperación de contraseña",
        text: `Utilice este codigo para recuperar su contrseña: ${tempToken.token}`,
      };
      
      //Enviar el correo electrónico
      await transporter.sendMail(mailOptions);
      
      console.log("Correo electrónico enviado:");
    } else {
      //console.log(userLogged);
      console.log("Ya se ha enviado un Token Temporal previamente");
      return res.status(200).json({
        ok: true,
        message: "Ya se ha enviado un token temporal previamente.",
      });
    }

    return res.status(200).json({
      tempToken,
      ok: true,
      message: "Solicitud de verificación de correo exitosa",
    });
  } catch (err) {
    console.error("Error en la petición de verificación de correo:", err);
    return res.status(400).json({
      ok: false,
      message: "Error en la petición de verificación de correo",
      error: err.message,
    });
  }
}

// Verificación de tokenes temporarios
async function ModifyPassword(req, res) {
  try {
    const { email, password } = req.body;

    // Consultar la base de datos para obtener el token almacenado en el usuario
    const userLogged = await userScheme.findOne({ email });

    if (!userLogged) {
      console.error("Usuario no encontrado en la base de datos");
      return res.status(400).json({
        ok: false,
        message: "Usuario no encontrado en la base de datos",
      });
    }
    const newPasswordHash = await Encrypt(password);

    // Actualizo la contrasea del usuario en la base de datos
    userLogged.passwordHash = newPasswordHash;
    await userLogged.save();

    console.log("Contraseña cambiada exitosamente");

    return res.status(200).json({
      ok: true,
      message: "Contraseña cambiada exitosamente",
    });
  } catch (err) {
    console.error("Error al cambiar la contraseña:", err);
    return res.status(400).json({
      ok: false,
      message: "Error al cambiar la contraseña",
      error: err.message,
    });
  }
}

// Agrega un producto a la lista de favoritos de cada usuario
async function AddFavoriteProduct(req, res) {
  try {
    const { userId, productId } = req.body;

    // Verifica si el usuario existe
    const user = await userScheme.findById(userId);
    const Product = await productoSchema.findById(productId);

    // Verificar si el usuario o el producto existe
    if (!user || !Product) {
      return res.status(404).json({
        ok: false,
        error_msg: "Usuario o producto no encontrado",
      });
    }

    // Verifica si el producto ya esta en la lista de favorito
    if (user.favoritos.includes(productId)) {
      return res.status(400).json({
        ok: false,
        error_msg: "El producto ya está en la lista de favoritos",
      });
    }
    // Agregar el producto a la lista de favoritos del usuario
    user.favoritos.push(Product);
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Producto agregado a favoritos",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al agregar el producto a favoritos",
      error: error.message,
    });
  }
}

// Muestra la lista de productos favoritos por usuario
async function GetFavoriteProduct(req, res) {
  try {
    const { userId } = req.params;

    const user = await userScheme.findById(userId).populate("favoritos");

    //Verifico si existe el usuario
    if (!user) {
      return res.status(404).json({
        ok: false,
        favorite_producs: user.favoritos,
      });
    }
    return res.status(200).json({
      ok: true,
      favorite_producs: user.favoritos,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error,
    });
  }
}

// Borrar un producto de la lista de favoritos po id
async function DeleteFavoriteById(req, res) {
  try {
    const { userId } = req.params;
    const { productId } = req.body;
    //Verifico si el usuario y el producto existe
    const user = await userScheme.findById(userId);
    if (!user || !user.favoritos.includes(productId)) {
      return res.status(404).json({
        ok: false,
        error_msg: "Usuario o producto no encontrado",
      });
    }

    // Elimina el producto de la lista de favoritos del usuario
    user.favoritos = user.favoritos.filter(
      (favorite) => favorite.toString() !== productId
    );
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Producto eliminado de favoritos",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar el producto de favoritos",
      rerror: error.message,
    });
  }
}

//Agregar un producto al carrito de compras
async function AddCarProduct(req, res) {
  try {
    const { userId, productId } = req.body;

    // Verifica si el usuario existe
    const user = await userScheme.findById(userId);
    const Product = await productoSchema.findById(productId);

    // Verificar si el usuario o el producto existe
    if (!user || !Product) {
      return res.status(404).json({
        ok: false,
        error_msg: "Usuario o producto no encontrado",
      });
    }
    // Verifica si el producto ya esta en la lista de favorito
    if (user.carrito.includes(productId)) {
      return res.status(400).json({
        ok: false,
        error_msg: "El producto ya está en la lista del carrito",
      });
    }
    // Agregar el producto a la lista de favoritos del usuario
    user.carrito.push(Product);
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Producto agregado al carrito",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al agregar el producto al carrito",
      error: error.message,
    });
  }
}

//Muestra lista de productos agregados al carrito
async function GetAllCarProduct(req, res) {
  try {
    const { userId } = req.params;

    const user = await userScheme.findById(userId).populate("carrito");

    //Verifico si existe el usuario
    if (!user) {
      return res.status(404).json({
        ok: false,
        car_products: user.carrito,
      });
    }
    return res.status(200).json({
      ok: true,
      car_products: user.carrito,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error,
    });
  }
}

// Elimina un producto de la lista de carrito
async function DeleteCarProductById(req, res) {
  try {
    const { userId } = req.params;
    const { productId } = req.body;
    //Verifico si el usuario y el producto existe
    const user = await userScheme.findById(userId);
    if (!user || !user.carrito.includes(productId)) {
      return res.status(404).json({
        ok: false,
        error_msg: "Usuario o producto no encontrado",
      });
    }

    // Elimina el producto de la lista de favoritos del usuario
    user.carrito = user.carrito.filter(
      (carProduct) => carProduct.toString() !== productId
    );
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Producto eliminado del carrito",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar el producto del carrito",
      rerror: error.message,
    });
  }
}

//para crear pedido de producto
async function AddPedido(req, res) {
  try {
    const { userId, productId, nombre: {nombres, apellidos}, direccion: {departamento, calle, numero, localidad, provincia}  } = req.body;
   
    // Verifica si el usuario existe
    const user = await userScheme.findById(userId);
    const Product = await productoSchema.findById(productId);
  
    // Verificar si el usuario o el producto existe
    if (!user || !Product) {
      return res.status(404).json({
        ok: false,
        error_msg: "Usuario o producto no encontrado",
      });
    }
    // Agregar el producto a la lista de favoritos del usuario
    user.pedido.push({
      nombre: {
        nombres,
        apellidos,
      },
      direccion: {
        departamento,
        calle,
        numero,
        localidad,
        provincia,
      },
      producto: [Product],
    });
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Producto agregado al pedido",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al agregar el producto al pedido 2",
      error: error.message,
    });
  }
}

async function GetAllPedidos(req, res) {
  try {
    const productos = await userScheme.find();
    return res.status(200).json({
      ok: true,
      data: productos,
    });
  } catch (ex) {
    //500 ->Internal Server Error
    return res.status(500).json({
      ok: false,
      error: ex,
    });
  }
}

//Leer usuario por mail
async function GetUserByMail(req, res) {
  console.log(req);
  const { email } = req.params;

  try {
    const user = await userScheme.findOne({ email });
    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }
    res.json(user);
    console.log(res);
  } catch (error) {
    console.error("Error al obtener el usuario", error),
      res.status(500).json({
        ok: false,
        message: "Error al obtener el usuario, email no encontrado",
      });
  }
}

export {
  AddUser,
  UpdateUser,
  Login,
  AddFavoriteProduct,
  GetFavoriteProduct,
  DeleteFavoriteById,
  EmailVerification,
  ModifyPassword,
  AddCarProduct,
  GetAllCarProduct,
  DeleteCarProductById,
  AddPedido,
  GetAllPedidos,
  GetUserByMail,
};
