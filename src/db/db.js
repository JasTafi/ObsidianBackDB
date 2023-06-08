import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

function connet() {
  mongoose
  .connect(
    process.env.DB_CONNECTION // Direccion de data base guardada en archivo env 
)
.then((res) => console.log('Se conectó correctamente a la base de datos'))
.catch((err) => console.log(err));
}

export default connet;