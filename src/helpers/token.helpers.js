import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

function GenerateToken(userId) {
  
  // Generar un uuid
  const token = uuidv4();
  const expirationToken = Date.now() + 3 * 60 * 60 * 1000; // 3 horas de expiración
  return { token, expirationToken };
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

export { Authenticate, GenerateToken };