import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import {v4 as uuidv4} from 'uuid';


const app = express();
dotenv.config();
app.use(bodyParser.json());

const clients = {}
const users = {}

app.get("/",(req,res) =>{
    res.send("Server is running")
})

function generateLetterOnlySecret(length = 24) {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

app.post("/evaluation-service/register",async(req,res)=>{
    try {
        const user = req.body;

        if(!user || !user.email || !user.name || !user.mobileNo || !user.githubUsername || !user.rollNo || !user.accessCode) return res.status(400).json({error : "An error occured"});

        const client_id = uuidv4();
        
        
        const client_secret = generateLetterOnlySecret(10);
        clients[client_id] = {
            ...user,
            client_id,
            client_secret,
        };
        
        console.log(clients);
        
        return res.status(200).json({
            ...user,
            client_id,
            client_secret
        })
    } catch (error) {
        return res.status(500).json(error);
    }
})

app.post('/token', (req, res) => {
  const { client_id, client_secret } = req.body;

  const client = clients[client_id];
  if (!client || client.client_secret !== client_secret) {
    return res.status(401).json({ error: 'Invalid client' });
  }

  const payload = { client_id, username: client.username };
  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '5h' });

  res.json({ token_type: 'Bearer', access_token: token, expires_in: 18000 });
});



app.post('/login' ,(req, res) => {
  const { username, password,client_id, client_secret} = req.body;
    const userDB = clients[client_id];
    if(userDB.client_secret !== client_secret) return res.status(400).json("An error occured");
    
    if (username === userDB.username && password === userDB.password) {
        const payload = { username };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

        res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});






const port = process.env.PORT;
app.listen(port,()=>{
    console.log(`Server running on http://localhost:${port}`);
    
})