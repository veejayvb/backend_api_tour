const mongoose = require('mongoose');
const dotenv = require('dotenv');
// process.on('uncaughtException', (err)=>{
//     console.log('UNCAUGHT EXECPTION');
//     console.log(err.name, err.message);
//     process.exit(1);

// })
dotenv.config({path : './.env'});
// const ndb = require('ndb')

const app = require('./app');

// console.log(app.get('env'));
// console.log(process.env);

const DB = process.env.MONGO_URI;
mongoose.connect(DB).then(()=>console.log('DB is connected'));

const port = process.env.PORT ||3000;
const server = app.listen(port, ()=>{
    console.log(`app running on port ${port}`);
});
// console.log(x);

//UNHANDLED  REJECTION
// process.on('unhandledRejection', (err) => {
//     console.log(err.name, err.message);
//     console.log('Unhandled rejections caught');
//     server.close(()=> {
//         process.exit(1);
//     })
// })