import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from '../config/nodemailer.js';
import {EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE} from '../config/emailTemplates.js'
// register new user
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const existingUser  = await userModel.findOne({ email });
    if (existingUser ) {
      return res.json({ success: false, message: "User  already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

     const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite:"none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //SENDING WELCOME EMAIL
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to my application',
      text: `Welcome to my application. Your account has been created with id: ${email}`
    };
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "User  registered", data: user });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite:"none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, message: "User  logged in", data: user });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite:"none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, message: "User  logged out" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const {userId} = req; // get from auth middleware

    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      // text: `Your OTP is ${otp}. Verify your account using this OTP.`,
      html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    };
    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: "Verification OTP sent on Email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const VerifyEmail=async(req,res)=>{
   const userId = req.userId; // from auth middleware
const { otp } = req.body;
  if(!userId || !otp){
    return res.json({success:false,message:'Missing Details'});
  }
  try{
    const user =await userModel.findById(userId);

    if(!user){
          return res.json({success:false,message:'User not found'});

    }
    if(user.verifyOtp==='' || user.verifyOtp !==otp){
          return res.json({success:false,message:'Invalid OTP'});

    }
    if(user.verifyOtpExpiredAt<Date.now()){
          return res.json({success:false,message:'OTP Expired'});

    }
    user.isAccountVerified=true;
    user.verifyOtp='';
    user.verifyOtpExpiredAt=0;
    await user.save();
    return res.json({success:true,message:'Email verified successfully'});


  }catch(error){
    return res.json({success:false,message:error.message});
  }

}

export const isAuthenticated=async(req,res)=>{
  try{
    return res.json({success:true});

  }catch(error){
    res.json({success:false,message:error.message});
  }
}


//send password reset otp

export const sendResetOtp=async(req,res)=>{
  const {email}=req.body;
  if(!email){
    return res.json({success:false,message:'Email is required'});
  }
  try {
    const user=await userModel.findOne({email});
    if(!user){
          return res.json({success:false,message:'User not found'});

    }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpiredAt = Date.now() + 15 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      // text: `Your OTP for resetting your password is ${otp}.Use this OTP to proceed resetting your password.`,
      html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    };
    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: "OTP sent to your Email" });

    
  } catch (error) {
        return res.json({success:false,message:error.message});

  }
}

//REset user password

export const resetpassword=async(req,res)=>{
  const {email,otp,newPassword}=req.body;
  if(!email || !otp || !newPassword){
    return res.json({success:false,message:'Email,otp and new password is required'});
  }
  try {
    const user=await userModel.findOne({email});
    if(!user){
          return res.json({success:false,message:'User not found'});
          
        }
        if(user.resetOtp==="" || user.resetOtp !==otp){
          
          return res.json({success:false,message:'Invalid OTP'});
        }
        if(user.resetOtpExpiredAt<Date.now()){
          
          return res.json({success:false,message:'OTP Expired'});
     }
     const hashedPassword=await bcrypt.hash(newPassword,10)
      user.password=hashedPassword;
      user.resetOtp='';
      user.resetOtpExpiredAt=0;
      await user.save()
      return res.json({ success: true, message: "Password has been reset successfully" });
     

    
  } catch (error) {
        return res.json({success:false,message:error.message});

  }
}

