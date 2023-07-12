const AppError = require("../AppError");
const catchAsync = require("../utils/catchAsync");
const Factory = require('./handlerFactory')

const Review = require('./../models/reviewModel');


exports.getAllReviews = Factory.getAll(Review)

exports.providingUserAndTourIds = (req,res,next) =>{
    if(!req.body.tour) req.body.tour = req.params.tourId
    if(!req.body.user) req.body.user = req.user.id
    next();
}
exports.createReview = Factory.createOne(Review);
exports.readReview  = Factory.readOne(Review)
exports.updateReview = Factory.updateOne(Review);
exports.deleteReview = Factory.deleteOne(Review);