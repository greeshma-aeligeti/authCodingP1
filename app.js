const express=require('express');
const path=require('path');
const bcrypt=require('bcrypt')
const {open}= require('sqlite')
const sqlite3=require('sqlite3')

const app=express()
app.use(express.json());

const dbPath=path.join(__dirname,'userData.db');
let db=null;

const initializeDb= async ()=>{
    try{
        db= await open({
            filename:dbPath,
            driver: sqlite3.Database
        })
        app.listen(3000,()=>{
            console.log("Server Started")
        })
    }
    catch(e){
        console.log(e.message);
        process.exit(1);
    }
}

initializeDb();

app.post('/register',async (request,response)=>{
        const {username,name,password,gender,location}=request.body;
        const userCheck=`select * from user where username='${username}';`;
        const dbUser=await db.get(userCheck);
        const hashedPass=await bcrypt.hash(password,13);
        if(dbUser===undefined){
            if(password.length<5){
                response.status(400);
                response.send("Password is too short");
            }
            else{
                const insertQuery=`
        insert into user(username,name,password,gender,location) values(
            '${username}','${name}','${hashedPass}','${gender}','${location}'
        );
        `;
       
      await db.run(insertQuery);
        response.send("User created successfully");
            }
        }else{
           
            response.status(400);
             response.send("User already exists");
        }
})

app.post('/login', async (request,response)=>{
    try{
    const {username,password}=request.body;
    const selectQuery=`select * from user where username='${username}';`;
    const dbUser=await db.get(selectQuery)
    if(dbUser===undefined){
        response.status(400);
        response.send("Invalid user")
    }
    else{
        const isPmatch= await bcrypt.compare(password,dbUser.password);
        if(isPmatch===true){
            response.send("Login success!");
        }
        else{
            response.status(400)
            response.send("Invalid password")
        }
    }}
    catch(e)
    {
        console.log(e.message)
    }
})

app.put('/change-password', async (request,response)=>{
    try{
    const {username,oldPassword,newPassword}=request.body;
    const selectQuery=`select *from user where username='${username}';`;
    const dbUser=await db.get(selectQuery);
    const isEqual=await bcrypt.compare(oldPassword,dbUser.password);
    if(isEqual===false){
         response.status(400);
        response.send("Invalid current password");
       
    }
    else{
        if(newPassword.length<5){
            response.status(400)
            response.send("Password is too short");
            
        }
        else{
            const hashedPass= await bcrypt.hash(newPassword,13);
            const updateQuery=`
            update user
            set password='${newPassword}'
            where username='${username}';
            `;
           await db.run(updateQuery);
            response.send("Password updated");
        }
    }}
    catch(e){
        console.log(e);
    }
})

module.exports=app;