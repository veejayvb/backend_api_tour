const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSantize = require('express-mongo-sanitize')
const xss = require('xss-clean');
const hpp = require('hpp');
const pug = require('pug')
const path = require('path')
const AppError = require('./AppError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(`${__dirname}/public`));

//GLOBAL  MIDDLEWARES
app.use(helmet());

//act as a body-parser
app.use(express.json());

//sanitize from NoSql query injection
app.use(mongoSantize());

//sanitize from xss (html code)
app.use(xss())

app.use(hpp())
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max : 100,
  windowMs : 60 * 60 * 1000,
  message: 'too many requests has done ! please try again later'
})
// const loginLimiter = rateLimit({
//   max : 3,
//   windowMs : 5 * 60 * 1000,
//   message : 'too many attempts please try again later'
// })
app.use('/api', limiter)
// app.use('/api/v1/users/login', loginLimiter)



app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers)
  next();
});

//routes
app.get('/', (req,res)=> {
  res.status(200).render('base', {
    tour :'the park camper',
    user : 'Vj'
  })
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter)

//HANDLING UNHANDLED ROUTE'S
app.all('*', (req, res, next) => {
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail',
  // err.statusCode = 404

  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;

