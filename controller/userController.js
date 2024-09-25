import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import {User} from "../models/userSchema.js"
import { generateToken } from "../utils/jwtTokens.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(
    async (req,res,next)=>{
        const {firstName, lastName, email, phone, password, gender, dob, role} = req.body;
        if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !role){
            return next(new ErrorHandler("Please fill full form!", 400));
        }
        let user = await User.findOne({ email });
        if(user){
            return next(new ErrorHandler("User Already Registered!", 400));
        }
        user = await User.create({firstName, lastName, email, phone, password, gender, dob, role});
        generateToken(user,"user Registerd!",200,res);
    }
);

export const login = catchAsyncErrors(async (req,res,next) =>{
    const {email, password,role} =req.body;
    if(!email || !password || !role){
        return next(new ErrorHandler("Please provide all details!", 400))
    }
    const user = await User.findOne({ email }).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Password or Email!", 400))
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Password or Email!", 400))
    }
    if(role !== user.role){
        return next(new ErrorHandler("User with this role does not exist!", 400))
    }
    generateToken(user,"User logged in successfully!",200,res);
})

export const addNewAdmin = catchAsyncErrors(async (req,res,next)=>{
    const {firstName, lastName, email, phone, password, gender, dob} = req.body;
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob){
        return next(new ErrorHandler("Please fill full form!", 400));
    }
    const isRegistered= await User.findOne({ email });
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} with this Email Already Exists!`,400));
    }
    const admin= await User.create({
        firstName, lastName, email, phone, password, gender, dob, role:"Admin",
    });
    res.status(200).json({
        success: true,
        message:"New Admin Registered",
        admin
    })
})

export const getAllDoctors = catchAsyncErrors(async (req,res,next) =>{
    const doctors = await User.find({role:"Doctor"});
    res.status(200).json({
        success: true,
        doctors
    })
});

export const getUserDetails = catchAsyncErrors(async (req,res,next) => {
    const user =req.user;
    res.status(200).json({
        success: true,
        user
    })
});

export const logoutAdmin = catchAsyncErrors( async (req,res,next) => {
    res
    .status(200)
    .cookie("Admintoken","",{
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now())
    })
    .json({
        success: true,
        message: "Admin logged out successfully",
    });

});
export const logoutPatient = catchAsyncErrors( async (req,res,next) => {
    res
    .status(200)
    .cookie("Patienttoken","",{
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now())
    })
    .json({
        success: true,
        message: "Patient logged out successfully",
    });

});

export const addNewDoctor= catchAsyncErrors(async (req,res,next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Doctor Avatar Required!", 400));
    }

    const {docAvatar} = req.files;
    const allowedFormats = ["image/png","image/jpeg","image/webp"];
    if(!allowedFormats.includes(docAvatar.mimetype)){
        return next(new ErrorHandler("File fromat not supported!",400));
    }

    const {firstName, lastName, email, phone, password, gender, dob, doctorDepartment } = req.body;
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !doctorDepartment){
        return next(new ErrorHandler("Please fill full form!", 400));
    }
    const isRegistered = await User.findOne({email}); 
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} with this Email Already Exists!`,400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload( docAvatar.tempFilePath);
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("Cloudinary Error:", cloudinaryResponse.error || "unkown Clodinary Erroe");
    }
    const doctor= await User.create({
        firstName, lastName, email, phone, password, gender, dob,doctorDepartment, role:"Doctor",
        docAvatar:{
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.secure_url,
        }
    });
    res.status(200).json({
        success: true,
        message:"New Doctor Registered",
        doctor
    })

});
