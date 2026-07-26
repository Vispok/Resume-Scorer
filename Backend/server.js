import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT;
const upload = multer({dest :"uploads/"})
const form = new FormData();

app.use(morgan("combined"));

form.append(
    "resume",
    fs.createReadStream(req.file.path)
);

const response = await axios.post(
    "http://localhost:5000/extract-skills",
    form,
    {
        headers: form.getHeaders()
    }
);

app.use(cors({
    origin: "http://localhost:3000"
}))

app.post("/upload",upload.single("resume"),async(req,res)=>{
    console.log(req.file)
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
