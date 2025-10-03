import mongoose from "mongoose";


const connectDB=async()=>{

    // mongoose.connection.on('connect',()=>console.log("database connected"))
    await mongoose.connect(process.env.MONGO_URL);
}
export default connectDB;