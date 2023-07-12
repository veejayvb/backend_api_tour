const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../AppError');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.singUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(`email and password are wrong`, 401));
  }

  const user = await User.findOne({ email }).select('+password');
  // console.log(user)
  const passwordVerified = await user.correctPassword(password, user.password);

  if (!user || !passwordVerified) {
    return next(new AppError(`incorrect email or password`, 401));
  }
  createSendToken(user, 200, res);

});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError(`you are not logged in, please log in to get access`, 401)
    );
  }
  //decoding token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      AppError(`the user belonging to this token does not exist`, 401)
    );
  }
  //4) check if user changed password after token was issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      AppError(`the user has changed his password after token was issued`, 401)
    );
  }
  req.user = currentUser;
  next();
});

exports.authorizedPerson = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`you are not authorized to access this route`, 403));
    }
    next();
  };
};

//passwordresetfunctionality
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user  Found in this given email', 404));
  }
  //2.
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // console.log(`token : ${resetToken}`);

  //3.
  const resetURl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `forget your password ? click this link ${resetURl} and change your password.\n
     ignore this email if you didn't forget your email`;
  console.log(message);

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset link only valid for 10 minutes',
      message: `${message}`,
      // ContentType: html
    });
    res.status(200).json({
      status: 'success',
      message: 'Link sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    return next(new AppError('internal server error', 505));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.get token and hash it
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  // console.log(hashedToken);

  //2.compare hashed token and db
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  // console.log(user);
  if (!user) {
    return next(new AppError('Token is invalid', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.name = req.body.name;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  //3.update changedPasswordAt

  //4.create token and send response
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('no user is found in given Id', 404));
  }

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password does not match '), 401);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 204, res);
});
