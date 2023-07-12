const AppError = require("../AppError");
const catchAsync = require("../utils/catchAsync");
const User = require('./../models/userModel')
const Factory = require('./handlerFactory')


const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj;
}



exports.updateMyOwnProfile = catchAsync(async (req,res,next) => {
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError(`please use update my password for this action`,400))
  }

  const filteredBody = filterObject(req.body, 'name','email')

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new : true,
    runValidators: true
  })
  res.status(200).json({
    status: 'success',
    data : {
      user : updatedUser
    }
  })
})


exports.deleteMyOwnProfile = catchAsync(async (req,res,next) => {
  await User.findByIdAndUpdate(req.user.id, {active : false})

  res.status(204).json({
    status: 'success',
    message: 'account deleted successfully',
    // data : null
  })
})
// exports.addNewUser = (req,res) =>{
//     res.status(200).json({status : "Success", message : "Useradded"})
// };

exports.aboutMe = (req,res,next) => {
  req.params.id = req.user.id
  next();
}
exports.getAllUsers =  Factory.getAll(User)
exports.getUserById = Factory.readOne(User)
//DO NOT use this to change password USE updatemypassword
exports.updateUserById = Factory.updateOne(User)
exports.deleteUser =  Factory.deleteOne(User)




