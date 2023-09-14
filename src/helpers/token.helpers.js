import jwt from "jsonwebtoken";

//Generar un token temporal para recuperación de contraseña
function TemporaryToken(userId) {
  const token = jwt.sign({ userId }, process.env.SECRET, { expiresIn: '1h' });
  return token;
}

//autentifica al usuario recibiendo el token enviado
function Authenticate(req, res, next){
  const authHeader = req.headers['authorization'];
// Si token existe, recuperarlo, sacarle los espacios y comienza de la primera posición
  const token = authHeader && authHeader.split(" ")[1];

  if(!token) 
    return res.status(404).json({
      ok: false,
      error_msg: 'Usuario no autorizado: sin token'
    });

// Si el token existe, lo verifico
    jwt.verify(token, process.env.SECRET, (error) => {
      if(error){
        return res.status(404).json({
          ok: false,
          error_msg: 'Usuario no autorizado: token inválido'
        });
      }

      next();
    });
} 

export { Authenticate, TemporaryToken };