import User from "../models/userModels.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES;
const createToken=(userId)=>
jwt.sign({id:userId}, JWT_SECRET, {expiresIn: TOKEN_EXPIRES});

// register a user
export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    if(!name || !email || !password) {
        return res.status(400).json({success: false, message: "Please fill all the fields" });
    }
    if(!validator.isEmail(email)) {
        return res.status(400).json({success: false, message: "Please enter a valid email" });
}
if(password.length < 6) {
    return res.status(400).json({success: false, message: "Password must be at least 6 characters long" });
}

try {
   if(await User.findOne({email})) {
    return res.status(400).json({success: false, message: "Email already exists" });
   }

  const hashedPassword = await bcrypt.hash(password, 10);
   const user = await User.create({
    name,email,password: hashedPassword
   }) 
   const token=createToken(user._id);
   res.status(201).json({success:true,
    token,
    user:{id:user._id,name:user.name,email:user.email}
   })
} catch (error) {
    console.error(error); // ✅ correct
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}
}

// to login a user

export async function loginUser(req, res) {

     console.log("JWT_SECRET:", process.env.JWT_SECRET); // 👈 yaha add karo
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({success: false, message: "Please fill all the fields" });
    }

    try{
       const user=await User.findOne({email});
       if(!user){
        return res.status(401).json({
            success:false,
            message:"invalid email or password"
        })
       } 

       const match=await bcrypt.compare(password,user.password);
       if(!match){
        return res.status(401).json({
            success:false,
            message:"invalid email or password"
        })
       }
       const token = createToken(user._id);
       res.json({
        success:true,
        token,
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        }
       });
    }catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message:"Server Error"
        });
    }
}

// to get login user details
export async function getCurrentUser(req,res){
    try {
        const user=await User.findById(req.user.id).select("name email");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }
        res.json({success:true,user});
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success:false,
            message:"Server Error"
        });
    }

}   

    // to upadate a user profile
    export async function updateProfile(req,res){
        const{name,email} = req.body;

        if(!name || !email || !validator.isEmail(email)){
            return res.status(400).json({
                success:false,
                message:"Valid email and name are required."
            });
        }
           try {
        const exist= await User.findOne({email,_id:{$ne:req.user.id}});
        if(exist){
            return res.status(409).json({
                success:false,
                message:"Email already in use"
            })
        }
        const user=await User.findByIdAndUpdate(
            req.user.id,
            {name,email},
            {new:true,runValidators:true,select:"name email"}
        )
        res.json({
            success:true,
            user
        })
    } catch (error) {
       console.error(error);
       res.status(500).json({
        success:false,
        message:"Server Error"
       });
    }
    }


// to change user password
export async function updatePassword(req,res){
const {currentPassword, newPassword}=req.body;
if(!currentPassword || !newPassword || newPassword.length<8){
    return res.status(400).json({
        success:false,
        message:"Password invalid or too short"
    });

} 
try {
    const user=await User.findById(req.user.id).select("password");
    if(!user){
        return res.status(400).json({
            success:false,
            message:"User not found"
        })
    }
    const match=await bcrypt.compare(currentPassword, user.password);
    if(!match){
        return res.status(401).json({
            success:false,
            message:"Current Password is incorrect"
        })
    }
        user.password=await bcrypt.hash(newPassword,10);
        await user.save();
        res.json({
            success:true,
            message:"Password Changed"
        })
    
} catch (error) {
   console.error(error);
   res.status(500).json({
    success:false,
    message:"Server Error"
   }) 
}
}

