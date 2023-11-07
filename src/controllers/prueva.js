// Modificar contraseña por email
async function ModifyPassword(req, res) {
  try {
    const { email, provisionalToken, newPassword } = req.body;
    
    // Consultar la base de datos para obtener el token almacenado en el usuario
    const userLogged = await userScheme.findOne({ email });
    
    if(!userLogged) {
      console.error("Usuario no encontrado en la base de datos");
      return res.status(400).json({
        ok: false,
        message: "Usuario no encontrado en la base de datos",
      });
    }

    // Verifico si el token es valido y coincide con el almacenado en el usuario
    if(provisionalToken !== userLogged.TemporaryToken) {
      console.error("Token inválido o expirado");
      return res.status(400).json({
        ok: false,
        message: "Token inválido o expirado",
      });
    }

    //Genero el hash de la nueva contraseña
    const newPasswordHash = await Encrypt(newPassword);

    // Acyualizo la contrasea del usuario en la base de datos
    userLogged.passwordHash = newPasswordHash;
    await userLogged.save();

    console.log("Contraseña cambiada exitosamente");

    return res.status(200).jason({
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
