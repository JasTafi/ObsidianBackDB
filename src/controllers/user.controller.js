import { Encrypt, Compare } from "../helpers/password.helper";
import productoSchema from "../models/producto";
import userScheme from "../models/user";

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
    console.log(passwordHash);
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

    if (!userLogged) {
      console.error("Usuario no encontrado en la base de datos");
      return res.status(400).json({
        ok: false,
        message: "Usuario no encontrado en la base de datos",
      });
    }

    console.log("peticion de verificación de correo exitosa");

    return res.status(200).json({
      ok: true,
      user: userLogged,
    });
  } catch (err) {
    console.error("Error en la petición de verificacion de corre:", err);
    return res.status(400).json({
      ok: false,
      message: "Error en la petición de verificación de correo",
      error: err.message,
    });
  }
}

// Modificar contraseña por email
async function ModifyPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        ok: false,
        error: "El email y la nueva contraseña son obligatorias",
      });
    }

    const newPasswordHash = await Encrypt(newPassword);
    const updateUser = await userScheme.findOneAndUpdate(
      { email },
      { passwordHash: newPasswordHash },
      { new: true }
    );

    if (!updateUser) {
      return res.status(404).json({
        ok: false,
        error: "Usuario no encontrado",
      });
    }

    return res.status(201).json({
      ok: true,
      update_user: updateUser,
    });
  } catch (error) {
    console.error("Error en la función ModifyPassword", error);

    return res.status(500).json({
      ok: false,
      error: "Se produjo un error en el servidor",
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
        error_msg: "El producto ya está en la lista de favoritos",
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
};
