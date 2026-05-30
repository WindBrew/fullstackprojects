require("dotenv").config()
const express = require("express");
const pg = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");
const auth = require("jsonwebtoken");

const app = express()
app.use(cors({origin: 'http://localhost:3000'}))
const protect = (req,res,next) =>{
    try{
    const token = req.headers["authorization"]
    const decode = auth.verify(token,process.env.authkey)
   req.user = decode
   next();
    }
    catch(err){
      return  res.status(401).json({message: "No token found or invalid token"})
    }

}
app.use(express.json())

const database = new pg.Pool({
    connectionString: process.env.databasekey
})
app.post("/signup", async (req,res)=>{

    
    const {email,password} = req.body // to extract email and pass well and store for efficient usage
    //we must name the req.body exactly what we named our variable parameters 
    if(!email || !password){
        res.json({
            message:"Missing username or password"
        })
    }
    else{
    const cryptPass = bcrypt.hashSync(password,12);
    const existingUser  = ((await database.query("select email from users where email = $1",[email])).rows).length !== 0
    if(existingUser){
        res.json({
            message: "User already exists try signing in?"
        })
          console.log("user already exists")
    }
    else{
       const userID = (await database.query("insert into users (email,password) values ($1,$2) returning id",[email,cryptPass] )).rows[0].id
        res.json({
            message:"Welcome new user",
            token:  auth.sign({email:email, id : userID },process.env.authkey,{expiresIn: "1d"})
        })
        console.log("reached signup")
       

    }
}

})
// tommorows mission is to add a login and in the login
// use bcrypt.compareSync to compare the password and password stored in db
app.post("/login",async (req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        res.json({
            message: "Email or Password missing"
        })
    }
    else{
    const existingUser = (await database.query("select * from users where email = $1",[email])).rows[0]
    const userID = existingUser?.id
    if(!existingUser){
        res.json({
            message: "The email does not exist try signing up?"
        })
          console.log("User does not exist try signing up")
    }
    else if(bcrypt.compareSync(password,existingUser.password)){
        
        
        res.json({
            message: "Login successful",
            token: auth.sign({email: existingUser.email,id : userID},process.env.authkey,{expiresIn: "1d"})
        })
          console.log("reached login and succeeded")
    }
        else{
            res.json({
                message: "Invalid password try again"
            })
        }
    }
})

app.use(protect);

//patch is used for updating a selected field and put is used when updating all fields
//patch and put are rules sql doesnt care if u update one or all but
//they are used so the client doesnt accidentally only pass a single value for updating in a 
//query that updates all , which will make all the other columns null for that user
//for frontend only devs to understand efficiently what is used for what
//and not accidentally break a users data
//
// app.get("/",(req,res)=>{
//     res.json({
//         user: req.user,
//         UID: req.user.id
//     })
// })
//only use for testing auth
//
app.patch("/Plans/user",async (req,res)=>{
    const updates = req.body
    const fields = Object.keys(updates).filter(field=> field !== 'email')
    const updateValues = fields.map(field=>updates[field])
    const updateFields =  fields.map((field,i)=>`${field} = $${i+1}`).join(",")
    await database.query(`update users set ${updateFields} where id = $${fields.length + 1}`,[...updateValues,req.user.id])
    //it says theres also some error in the above query mind checking it tomorrow ?
    const data = (await database.query("select email , plans from users where email = $1",[req.user.email])).rows[0]
    
    if(data.plans && data.plans !== "none"){
    await database.query("update users set expiry = NOW() + $1::interval where id = $2",[data.plans === "Base" ? '30 seconds' : data.plans === "Pro" ? '60 seconds' : '120 seconds',req.user.id])
    }
    else{
        console.log("No plans found in data",data)
    }
    res.json({
        message: "update success",
        plan: data.plans
    })

})
app.get("/news",(req,res)=>{
    res.json({
        message:"Welcome to all the news this world has to offer",
        user: req.user
    })
})
app.listen(5001,(req,res)=>{
    console.log("listening to port :5001")
})