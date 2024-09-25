import mongoose from "mongoose";

export const dbConnection = () => {
    mongoose.connect(process.env.MONGO_URI,{
        dbName: "HOSPITAL_MANAGEMENT"
    }).then(() =>{
        console.log("MongoDB Connected")
    }).catch((err) => {
        console.log(`MongoDB connectivity ERROR: ${err}`);
    })
};