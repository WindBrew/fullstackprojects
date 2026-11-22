require("dotenv").config()
const express = require("express");
const pg = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");
const auth = require("jsonwebtoken");
const {Server} = require("socket.io")
const http = require("http")
// const {createClient} = require('redis');

const cookieParser = require("cookie-parser")
const cookie = require("cookie")
const app = express()
const userSockets = new Map()

const database = new pg.Pool({
    connectionString: process.env.databasekey
})
app.use(cors({origin: process.env.REACT_APP_FRONTEND_URL, credentials: true}))
app.set("trust proxy", 1)
app.use(cookieParser())
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 72 * 60 * 60 * 1000 // 3 day in milliseconds
  };    


 const deauthToken = (token) =>{
  console.log("hitting deAuth")
    
        try{
            const decoded = auth.verify(token,process.env.authkey)
            //console.log("in deauth try : ",decoded)
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
        origin: process.env.REACT_APP_FRONTEND_URL,
        credentials: true
    }
})
io.on("connection",(socket)=>{

    const raw = socket.handshake.headers.cookie
    const parsed = cookie.parse(raw || "")
    console.log("from socket connection , cookie is ",parsed)
    const token = parsed.token
    console.log("from socket connection , token is ",token)
    const user = deauthToken(token)
    console.log("from socket connection user is ",user)

    if(!user){
        console.log("invalid token")
    
    }
    else{
    userSockets.set(user.id, socket)
    }


   socket.on("disconnect",(socket)=>{

    
        if(user && userSockets.get(user.id) === socket){
        userSockets.delete(user.id)
        console.log("socket deleted successfully")
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
    const decoded = deauthToken(req.cookies.token)
    
   // console.log(decoded)
    
    if(!decoded){
       return res.status(401).json({message: "Invalid token provided"})
    }
    else{
        req.user = decoded
//         if(await redis.get(String(decoded.id))){
//   //  console.log("this is redis cache memory for current user :",await redis.get(String(decoded.id)))
//     }
//     else{
//         console.log("redis doesnt have the following user data yet")
//     }
    
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
         res.cookie("token",auth.sign({email: email, id : userID},process.env.authkey,{expiresIn: "1d"}),cookieOptions) 
       res.json({
            message:"Welcome new user",
         
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
        const planCheck = (await database.query("select (plans) from users where id = $1",[userID])).rows[0].plans
        res.cookie("token",auth.sign({email: existingUser.email, id : userID},process.env.authkey,{expiresIn: "1d"}),cookieOptions)
        res.json({
            message: "Login successful",
            plan: planCheck ? true : false ,
            
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
app.post("/logout",(req,res)=>{
    
    socket = userSockets.get(req.user.id)
    if(socket){
        socket.emit("logout")
        console.log("socket logout emitted")
    }
    else{
        console.log("socket not found for user")
    }
    res.clearCookie("token",cookieOptions)
    res.json({
        message: "Logout successful"
    })
})
app.get("/",async (req,res)=>{
      const planCheck = ((await database.query("select (plans) from users where id = $1",[req.user.id])).rows[0].plans)
    console.log("this is a plan check : ",planCheck)
    if(!planCheck){
        res.json({
            plan: false,
         message: "user doesn't have any active plan"
            

        })
    }
    else{
    res.json({
        plan: true,
          message: "User has a pre-existing plan redirect to newspage",
    })
}
})

app.get("/Plans/user", async (req,res)=>{
//     const planCheck = (await database.query("select (plans) from users where id = $1",[req.user.id])).rows[0].plans
//     if(planCheck){
//         res.json({
//             plan: true,
//             message: "User has a pre-existing plan redirect to newspage",
            

//         })
//     }
//     else{
//     res.json({
//         message: "valid user but doesn't have a pre-existing plan let the user pick one"
//     })
// }
res.json({
    message: "Valid user token"
})
})
app.patch("/Plans/user",async (req,res)=>{
    const updates = req.body
    const fields = Object.keys(updates).filter(field=> field !== 'email' && field !== "password")
    const updateValues = fields.map(field=>updates[field])
    const updateFields =  fields.map((field,i)=>`${field} = $${i+1}`).join(",")
    if(req.body.plans !== null){
    await database.query(`update users set ${updateFields} where id = $${fields.length + 1}`,[...updateValues,req.user.id])
    //it says theres also some error in the above query mind checking it tomorrow ?
    }
    else{
        console.log("Null plans not appended")
    }
    const data = (await database.query("select plans,expiry from users where id = $1",[req.user.id])).rows[0]
    
    if(data.plans && data.plans !== null){
        if(data.expiry){
            console.log("updated expiry")
         await database.query("update users set expiry = expiry +  $1::interval where id = $2",[data.plans === "Base" ? '2 minutes' : data.plans === "Pro" ? '4 minutes' : '12 minutes',req.user.id])     
        }
        else{
        console.log("updated expiry")
    await database.query("update users set expiry = NOW() + $1::interval where id = $2",[data.plans === "Base" ? '2 minutes' : data.plans === "Pro" ? '4 minutes' : '12 minutes',req.user.id])     
        }
    //  const userTime = ((await database.query("select expiry from users where id = $1",[req.user.id])).rows[0].expiry?.getTime()) - Date.now()
    //  if(userTime > 0){
    //  redis.set(req.user.id,userTime,{
    //     PX: userTime
    //  })
    }
    // await redis.set(String(req.user.id) , String(((await database.query("select expiry from users where id = $1",[req.user.id])).rows[0].expiry).getTime()))
  //  console.log(typeof (String(((await database.query("select expiry from users where id = $1",[req.user.id])).rows[0].expiry).getTime())),String(((await database.query("select expiry from users where id = $1",[req.user.id])).rows[0].expiry).getTime()))
        // console.log((((await database.query("select expiry from users where id = $1",[req.user.id])).rows[0].expiry))instanceof Date)


    
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
app.get("/Newspage",async (req,res)=>{
  const planCheck = ((await database.query("select (plans) from users where id = $1",[req.user.id])).rows[0].plans)
    console.log("this is a plan check : ",planCheck)
    if(!planCheck){
        res.json({
            plan: false,
         message: "user doesn't have any active plan"
            

        })
    }
    else{
    res.json({
        plan: true,
          message: "User has a pre-existing plan redirect to newspage",
    })
}
})
server.listen(5001,()=>{
     const userExpiry = setInterval(async ()=>{
      

        // console.log("Listening interval")
          const expiredUsers =  (await database.query("select id from users where expiry < NOW()")).rows
        expiredUsers.forEach(user=>userSockets.get(user.id)?.emit("planExpired"))
            await database.query("update users set (plans,expiry) = ($1,$2) where expiry < NOW()",[null,null])
            console.log("Interval is active")
     
          
           
         
    },5000)
})
