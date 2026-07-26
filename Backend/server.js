import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(morgan("combined"));

app.use(cors({
    origin: "http://localhost:3000"
}))

app.post("/submit",(req,res)=>{
    
})

app.get("/",(req,res)=>{
    res.json({
        success: true,
        message: "Resume Scorer API is running"
    });
})

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.listen(port,()=>{
    console.log(`Server is Running on http://localhost:${port}`);
})
