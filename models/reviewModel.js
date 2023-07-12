const mongoose = require('mongoose');
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review should be present'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user should be provided while reviewing about tour'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A Review should be about Tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({user : 1, tour : 1}, {unique: true})

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//calculating no of rating and ratings average using aggregation pipeline 
reviewSchema.statics.calcNoOfReviewsAverageRatings = async function(tourId){
  const stats = await Review.aggregate([
    {
      $match: {tour : tourId}
    },
    {
      $group : {
        _id : '$tour',
        noOfRating : {$sum : 1 },
        avgRating : { $avg : '$rating'}
      }
    }
  ])
  // console.log(stats)
  await Tour.findByIdAndUpdate(stats , {
    ratingQuantity : stats[0].noOfRating,
    ratingsAverage : stats[0].avgRating
  })
}

reviewSchema.post('save', function () {
  this.constructor.calcNoOfReviewsAverageRatings(this.tour)
})


reviewSchema.post(/^findOneAnd/, async function(doc) {
  await doc.constructor.calcNoOfReviewsAverageRatings(doc.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
