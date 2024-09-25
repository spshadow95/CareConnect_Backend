import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
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
    message:{
        type: String,
        required: true,
        minLength:[5,"Message must contain atleast 5 characters"],
    },
    
});

export const Message = mongoose.model("Message",messageSchema);