import mongoose from 'mongoose';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
    },
    fullName :{
        type : String,
        required : true,
        trim : true,
        index : true
    },
    avatar :{
        type : String, //cloudinary_url
        required : true,
    },
    coverImage :{
        type : String,
    },
    password :{
        type : String,
        required : [true,"password is required"],
        minlength : 8
    },
    watchHistory:[
        {type : mongoose.Schema.Types.ObjectId, ref : 'Video'}
    ],
    refreshTokens :{
        type : String
    } 
    
},{timestamps : true})

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();
  
    try {
      const hash = await bcrypt.hash(this.password, 10);
      this.password = hash;
      next();
    } catch (err) {
        console.log("Failed to encrypt/decrypt password", err);
        next(err);
    }
  });

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User',userSchema);