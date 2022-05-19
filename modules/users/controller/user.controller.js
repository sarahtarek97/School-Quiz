/****Imports****/
//require the User model I created to use
const User = require('../model/user.model');

//require the Status code to use based on the res
const {StatusCodes,getReasonPhrase} = require('http-status-codes');

//use bcrypt here to compare the password stored in DB with the one I use to sign in
const bcrybt = require('bcrypt');

//use JWT to generate a token
const jwt = require('jsonwebtoken');
const sendEmail = require('../../../common/email/email');

//use .env to get the secret key that I have
require('dotenv').config()
const secretKey = process.env.SECRET_KEY;

/***request handler***/
//get all users with no password
const getAllUsers = async (req,res)=>{
    const users = await User.find({}).select('-password')
    res.json({message:'all users',data: users})
}

//get the use with id passed on the params
const getSingleUser = async (req,res)=>{
    let {id} = req.params;
    try {
        const user = await User.findOne({_id:id}).select('-password');
        res.json({message:'fount the user success',user});
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:'error while finding the user',error});
        
    }
}

//sign up or add new user but check at first if already exist before
const signUp = async(req,res)=>{
    let {name,email,password,confirmPassword,role} = req.body;
    try {
    const user = await User.findOne({email});
    if(user){
        res.status(StatusCodes.BAD_REQUEST).json({
            message:'email already exsist'
        })
    }else{
        if(password == confirmPassword)
        {
            let newUser = new User({name,email,password,role});
            const user = await newUser.save();

            const message = `
                        Welcome to eduFun family.
                        
                        Kindly verify your email by pressing the below link
                        
                        Best.
                        `;

                        //change the localhost 3000 in the future with your url
        const verificationURL = `http//localhost/3000/verification/home`;
console.log(user,"____________")
        await sendEmail({
            email: user.email,
            subject: 'eduFun.com email verification',
            message: { message, url: verificationURL, linkType: 'Verification link' },
        });
            res.json({message:'sign up success',user});
        }else{
            res.json({message:'different password'});
        }
    }
    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:'error while adding user',...error})
    }

}

const verifyEmail = async(req,res)=>{
    const {email} = req.params;
    const user = await User.findOne({email});
    if(!user){
        res.status(StatusCodes.BAD_REQUEST).json({
            message:'email not registered please signup'
        })
    }
    await User.findOneAndUpdate({email},{verified:true})
    res.json({message:'verified'});
}

//sign in with email and password will check first if email in the DB then check if the password match what we have or not
const signIn = async(req,res)=>{
    let {email,password} = req.body;
    try {
       const user = await User.findOne({email});
       if(!user){
        res.status(StatusCodes.BAD_REQUEST).json({message:'email not found sign up please'})
       }else{
        const match = await bcrybt.compare(password,user.password);
        if(match && verified==true){
            const token = jwt.sign({_id:user.id,email,role:user.role},`${secretKey}`,{expiresIn:'7d'})
            
            res.cookie('token',token,{
                httpOnly: true,
            });
            
            return res.status(StatusCodes.OK).json({message:'sign in success', token, user:{
            id:user._id,
            name:user.name,
            email:user.email,
           }});

        }else{
        res.status(StatusCodes.BAD_REQUEST).json({message:'password incorrect'})
        }
       }
    } catch (error) {
        res.json({message:'sign in error',...error})
    }
}

//log the user out from the system
const logOut = (req,res)=>{
  res.clearCookie('token');
  return res.status(StatusCodes.OK).json({message:'logged out success'}); 
}

//delete specific user from the DB based on the id will pass on the params
const deleteUser = async (req,res)=>{
    let {id} = req.params;
    try {
        const user = await User.deleteOne({_id:id});
        res.json({message:'user deleted success',user});
    
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:'error while deleting the user',error});
    }
    
}

//update user name
const updateSingleUser =  async (req,res)=>{
    let {id} = req.params;
    let my_id = req.user._id;
    let {name} = req.body;
    try {
        if(id == my_id){
        const user = await User.updateOne({_id:id},{name});
        res.json({message:"user updated success",user});
        }else{
        res.status(StatusCodes.BAD_REQUEST).json({message:"this is not your profile to update"});
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:"error while updating the user",error});
    }
}

//export all these request handlers to use it routes file ti handle the api
module.exports = {
    getAllUsers,
    getSingleUser,
    signUp,
    signIn,
    logOut,
    deleteUser,
    updateSingleUser,
    verifyEmail
}