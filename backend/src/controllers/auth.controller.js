import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js"

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
    });
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const {email, password } = req.body
  try{ 
    const user = await User.findOne({email})

    if(!user){
      return res.status(400).json({message:"Invalid credentials"});
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect){
      return res.status(400).json({message:"invalid credentials"});
    }
    
     generateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    })

  }catch (error){
    console.log("Error in login controller:", error.message);
    res.status(500).json({ message: " internal Server error" });
  }

};

export const logout = (req, res) => {
  try{ 
    res.cookie("jwt", "", {maxAge:0});
    res.status(200).json({message:"logged out succesfully"});

  } catch (error){
     console.log("Error in logout controller:", error.message);
    res.status(500).json({ message: " internal Server error" });
  }
 
};

  export const updateProfile = async (req, res) =>{
    try {
    const {profilePic} = req.body;
    const userId = req.user._id;

    if(!profilePic){
      return res.status(400).json({message:"profile pic is required"});
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new:true})
     res.status(200).json(updatedUser)
    } catch (error){
      console.log("error in updated profile:", error);
      res.status(500).json({message:"internal server error"})
    }
  }

export const checkAuth = (req, res) =>{
  try{
    res.status(200).json(req.user);

  } catch(error){
    console.log("error is checkAuth controller", error.message);
        res.status(500).json({message:"internal message error"});

  }
}