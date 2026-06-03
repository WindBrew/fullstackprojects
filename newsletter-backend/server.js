require("dotenv").config()
const express = require("express");
const pg = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");
const auth = require("jsonwebtoken");
const {Server} = require("socket.io")
const http = require("http")
const {createClient} = require('redis');
const redis = createClient()
const app = express()
const database = new pg.Pool({
    connectionString: process.env.databasekey
})
app.use(cors({origin: 'http://localhost:3000'}))
async function startServer(){
    await redis.connect()
}
const userSockets = new Map()
 const deauthToken = (token) =>{
  console.log("hitting deAuth")
    
        try{
            const decoded = auth.verify(token,process.env.authkey)
            console.log("in deauth try : ",decoded)
            return decoded
        }
        catch(err){
            console.log(err, token,"from deauth token")
        return null
            
        }
    }
                                                                         
const server = http.createServer(app)
const io = new Server(server ,{
    cors: {
        origin: 'http://localhost:3000'
    }
})
io.on("connection",(socket)=>{
    const token = socket.handshake.auth.token
    console.log("from socket connection , token is ",token)
    const user = deauthToken(token)
    console.log("from socket connection user is ",user)

    if(!user){
        console.log("invalid token")
    
    }
    else{
    userSockets.set(user.id, socket)
    }
   io.on("disconnect",(socket)=>{
    const token = socket.handshake.auth.token
    const user = deauthToken(token)
        if(userSockets.get(user.id)){
        userSockets.delete(user.id)
        }
        else{
            console.log("User does not exist")
        }
    })
})
//the bug is likely arising from the condition where interval is set when the user is detected in cache but user isnt in cache yet

 


const protect = async (req,res,next) =>{
    console.log("reaching middleware")
//     const token = req.headers["authorization"]
//     const decoded = auth.verify(token,process.env.authkey)
//    req.user = decoded
    const decoded = deauthToken(req.headers["authorization"])
    
    console.log(decoded)
    
    if(!decoded){
       return res.status(401).json({message: "Invalid token provided"})
    }
    else{
        req.user = decoded
        if(await redis.get(String(decoded.id))){
    console.log("this is redis cache memory for current user :",await redis.get(String(decoded.id)))
    }
    else{
        console.log("redis doesnt have the following user data yet")
    }
    
 next();
}
  
    
    

}
app.use(express.json())


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
app.get("/",(req,res)=>{
    res.json({
        message:"Valid user"
    })
})
app.get("/Plans/user",(req,res)=>{
    res.json({
        message: "valid user"
    })
})
app.patch("/Plans/user",async (req,res)=>{
    const updates = req.body
    const fields = Object.keys(updates).filter(field=> field !== 'email')
    const updateValues = fields.map(field=>updates[field])
    const updateFields =  fields.map((field,i)=>`${field} = $${i+1}`).join(",")
    if(req.body.plans !== null){
    await database.query(`update users set ${updateFields} where id = $${fields.length + 1}`,[...updateValues,req.user.id])
    //it says theres also some error in the above query mind checking it tomorrow ?
    }
    else{
        console.log("Null plans not appended")
    }
    const data = (await database.query("select email , plans from users where email = $1",[req.user.email])).rows[0]
    
    if(data.plans && data.plans !== null){
     if(await redis.get(String(req.user.id))){
         await database.query("update users set expiry = expiry +  $1::interval where id = $2",[data.plans === "Base" ? '30 seconds' : data.plans === "Pro" ? '60 seconds' : '120 seconds',req.user.id])     
     }
     else{
    await database.query("update users set expiry = NOW() + $1::interval where id = $2",[data.plans === "Base" ? '30 seconds' : data.plans === "Pro" ? '60 seconds' : '120 seconds',req.user.id])
     }
    await redis.set(String(req.user.id) , String(((await database.query("select expiry from users where id = $1",[req.user.id])).rows[0].expiry).getTime()))
    console.log(typeof (String(((await database.query("select expiry from users where id = $1",[req.user.id])).rows[0].expiry).getTime())),String(((await database.query("select expiry from users where id = $1",[req.user.id])).rows[0].expiry).getTime()))
        // console.log((((await database.query("select expiry from users where id = $1",[req.user.id])).rows[0].expiry))instanceof Date)
        if(await redis.get(String(req.user.id))){
    const userExpiry = setInterval(async ()=>{
        console.log("Listening interval")
        if(Number( await redis.get(String(req.user.id))) < Date.now()){
            await database.query("update users set (plans,expiry) = ($1,$2) where id = $3",[null,null,req.user.id])
     
            console.log(userSockets.get(req.user.id))
           
            const socket = userSockets.get(req.user.id)//returns the stored socket obj not just a contact a whole socket obj
            if(socket){
                console.log("Its reachingh socket from top")
                console.log("this is userID : ",req.user.id, "This is socket : ",socket)
            socket.emit("planExpired")
            console.log("Is reaching if socket")
            }
            redis.del(String(req.user.id))
                   clearInterval(userExpiry)
                   return;
        }
        else{
            console.log("plan still valid", Date.now())
            console.log("redis at patch is ",await redis.get(String(req.user.id)))
        }
    
    },5000)
}


    }
    else if(data.plans === null){
        console.log(data,"hit null plan")
        await database.query("update users set expiry = null where plans is null")
        
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
server.listen(5001)
startServer()