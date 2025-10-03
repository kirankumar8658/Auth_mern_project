
import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    verifyOtp:{
        type:String,
        default:''
    },
    verifyOtpExpiredAt:{
        type:Number,
        default:0
    },
    isAccountVerified:{
        type:Boolean,
        default:false
    },
    resetOtp:{
        type:String,
        default:''
    },
        resetOtpExpiredAt:{
        type:Number,
        default:0
    }
});

const User=mongoose.models.user || mongoose.model("user",userSchema);
export default User;