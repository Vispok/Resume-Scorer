import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT;


app.use(cors({
    origin: "http://localhost:3000"
}))

app.get("/",(req,res)=>{
    res.json({
        success: true,
        message: "Resume Scorer API is running"
    });
})

app.listen(port,()=>{
    console.log(`Server is Running on http://localhost:${port}`);
})
