import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minLength:[3,"First Name must contain at least 3 characters "]
    },
    lastName:{
        type: String,
        required: true,
        minLength:[3,"last Name must contain at least 3 characters!"]
    },
    email:{
        type: String,
        required: true,
        validate:[validator.isEmail,"Please provide a valid Email!"]
    },
    phone:{
        type: String,
        required: true,
        minLength:[11,"Phone number must contain exact 11 digits"],
        maxLength:[11,"Phone number must contain exact 11 digits"],
    },
    dob:{
        type: Date,
        required: [true, "DOB is required"],
    },
    gender:{
        type:String,
        required: true,
        enum:["Male","Female","Other"],
    },
    password:{
        type:String,
        required: true,
        minLength:[5,"Password Name must contain at least 5 characters!"],
        select:false
    },
    role:{
        type:String,
        required: true,
        enum:["Admin","Patient", "Doctor"],
    },
    doctorDepartment:{
        type:String
    },
    docAvatar:{
        public_id:String,
        url:String
    }
});

userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        next();
    }
    this.password= await  bcrypt.hash(this.password,10);
});

userSchema.methods.comparePassword = async function (enterdPassword){
    return await bcrypt.compare(enterdPassword,this.password);
};

userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRES
    });
};


export const User = mongoose.model("User",userSchema);