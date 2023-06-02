import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

function connet() {
  mongoose
  .connect(
    'mongodb+srv://rodrigoar:sssvsAuPhPaZstwn@cluster0.fsuibbq.mongodb.net/test'
)
.then((res) => console.log('Se conectó correctamente a la base de datos'))
.catch((err) => console.log(err));
}

export default connet;