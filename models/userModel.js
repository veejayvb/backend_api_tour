const mongoose = require('mongoose')
const crypto = require('crypto')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new  mongoose.Schema({
    name : {
        type : String,
        required : [true, 'A user must have name']
    },
    email : {
        type : String,
        required : [true, 'A user must use email'],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail, 'Please provide valid email']
    },
    photo : String,
    role : {
        type : String,
        enum : ['user', 'guide','lead-guide','admin'],
        default : 'user'
    },
    password : {
        type : String,
        required : [true, 'A User must hold passsword'],
        minlength : 8,
        select : false
    },
    passwordConfirm : {
        type: String,
        required : true,
        validate : {
            validator : function(el) {
                return el === this.password;
            },
        message: "passwords are not same"
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpire : Date,
    active : {
        type : Boolean,
        default  : true,
        select : false 
    }
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew ) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})
userSchema.pre(/^find/, function(next) {
    this.find({active: { $ne : false }})
    next();
})
userSchema.methods.correctPassword = async function(candidatepassword, userpassword){
    return await bcrypt.compare(candidatepassword, userpassword);
}

userSchema.methods.passwordChangedAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    
    console.log(changedTimeStamp, JWTTimestamp)
    return JWTTimestamp < changedTimeStamp
    }
    return false
}

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

    // console.log( {resetToken},this.passwordResetToken);

    return resetToken;
}
const User = mongoose.model('User', userSchema)

module.exports = User