const mongoose = require('mongoose');
const slugify  = require('slugify');
const User = require('./userModel')
const tourSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'A tour Must have a Name'],
        unique : true,
        trim : true,
        select : true,
        maxlength : [40, 'A Tour name must contain only 40 or below characters'],
        minlength : [10, 'A Tour name must contain minimum 10 characters']
    },
    slug : String,
    duration : {
        type : Number,
        required : [true, 'A Tour must have a duration time']
    },
    maxGroupSize : {
        type : Number,
        required : [true, 'A Tour must have groupsize']
    },
    difficulty:{
        type : String,
        required: [true, 'A Tour must have difficulty'],
        select : true,
        enum :{
            values :  ['easy', 'medium', 'difficult'] ,
            message : 'Difficulty is either easy or hard, difficult'
        }
    },
    ratingsAverage : {
        type : Number,
        default: 4.5,
        select : true,
        min : [1, 'minimum rating should be 1'],
        max : [5, 'maximum rating should be 5'],
    },
    ratingQuantity :{
        type : Number,
        default : 0
    },
    price : {
        type : Number,
        required : [true, 'A tour must have a price'],
        select : true
    },
    
    PriceDiscount :{ 
        type : Number,
        validate :  {
            validator : function(val) {
            return val < this.price
        }
     },
     message : 'PriceDiscount({VALUE}) should be less than price'
    },
    summary : {
        type : String,
        trim : true,
        required : [true, 'A tour must have a summary'],
        select : true
    },
    description : {
        type : String,
        trim : true
    },
    imagecover : {
        type : String
    },
    images : [String],
    createdAt: {
        type : Date,
        default : Date.now()
    },
    startDates : [Date],
    secretTour : {
        type : Boolean,
        default : false
    },
    startLocation : {
        type : {
            type : String,
            default : 'Point',
            enum : ['Point']
        },
        coordinates : [Number],
        address : String,
        description : String
    },
    location : [
        {
            type : {
                type : String,
                default:'Point',
                enum : ['Point']
            },
            coordinates : [Number],
            address : String,
            description : String,
            day : Number
        }
    ],
    guides : [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ]
}, {
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
});

// tourSchema.index({price: 1 })
tourSchema.index({price: 1 , ratingsAverage : -1 })
tourSchema.index({slug : 1})
tourSchema.index({startLocation : '2dsphere'})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7 ;
})
//virtualPopulate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField : "tour",
    localField : '_id'
})
//document Middleware : runs on save() and  create();
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower : true})
    next();
})

//embedding tour and guide(user)
// tourSchema.pre('save', async function(next) { 
//     const guidePromise = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidePromise);

//     next();
// })
// tourSchema.pre('save', function(next) {
//     console.log('wiil save the document');
//     next();
// })
//queryMiddleware runs on starts with find query
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour : { $ne : true}})
    next();
})
tourSchema.pre(/^find/, function(next) {
    this.populate({path : 'guides',select : '-__v -passwordChangedAt -passwordResetExpire -passwordResetToken'});
    next()
})
// tourSchema.pre('find', function(next) {
//     this.find({ secretTour : { $ne : true}})
//     next();
// })
//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({$match : { secretTour: { $ne : true } } })
//     next();
// })
const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;