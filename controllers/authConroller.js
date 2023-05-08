import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import User from "../models/userModel.js";
import JWT from "jsonwebtoken";

export const signUp = async (req, res) => {
  //get data from the user
  const { name, email, password, phone, address } = req.body;
  //validation
  if (!name || !email || !password || !phone || !address) {
    throw new Error("Required field");
  }
  try {
    //check if the user already exists
    const existingUser = await User.findOne({ email });
    //if user already exist thow an error
    if (existingUser) {
      return res.status(200).send({
        success: true,
        message: "Already signed Up, Please login",
      });
    }
    // signUp user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await User.create({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
    }).save();
    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in signUp",
      error,
    });
  }
};

// login || method:post
/*
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validate
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }
    //compare password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid password",
      });
    }
    // token
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};
*/

export const login = async (req, res) => {
  try {
    // get user details
    const { email, password } = req.body;
    //validation
    if (!password || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Please sign up",
      });
    }

    // if user exists compare password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        adddress: user.address,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in login",
      error,
    });
  }
};
