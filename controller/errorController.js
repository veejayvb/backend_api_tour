const AppError = require('./../AppError');

const handleCastErrorDB = (err) => {
  
  return  new AppError(`Invalid ${err.path}: ${err.value}.`, 400) ;
};
const handleDuplicateFieldDB = err =>{
  const message = `Duplicate field have been entered , choose other field names`
  return new AppError(message, 400) ;
}
const handleValidationErrorDB =err =>{
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `invalid input data, ${errors.join('. ')}`
  return new AppError(message, 400) ;
}

const handleJsonWebTokenError =err =>{
  return new AppError(`Invalid Token please log in again`, 401)
}

const handleTokenExpiredError = () =>{
  return new AppError(`Your session is over please log in again`, 401)
}

const sendErrordev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  //OPERATIONAL ERROR
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // console.log('Error', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.log(err.name);
    sendErrordev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    console.log(err.name);
    if (err.name === 'CastError')  err = handleCastErrorDB(err);
    if (err.name === 11000)  err = handleDuplicateFieldDB(err);
    if (err.name === 'CastError')  err = handleValidationErrorDB(err);
    if(err.name === 'JsonWebTokenError') err => handleJsonWebTokenError(err)
    if(err.name === 'TokenExpiredError') err => handleTokenExpiredError(err)
    sendErrorProd(err, res);
  }
};
