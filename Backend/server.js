import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { findPackageJSON } from "module";

dotenv.config();

const app = express();
const port = process.env.PORT;
const upload = multer({dest :"uploads/"})

app.use(morgan("combined"));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

//To talk with Frontend

app.use(cors({
    origin: "http://localhost:3000"
}))

//Get the Resume PDF

app.post("/upload",upload.single("resume"),async(req,res)=>{
    try {
        if(!req.file){
            return res.status(400).json({ success: false, message: "No file uploaded" });
        
        }
        console.log(req.file);
        const form = new FormData();

        //Putting Data from the Form 

        form.append(
            "resume",
            fs.createReadStream(req.file.path)
        );

        //Sending the PDF to Python Server

        const response = await axios.post(
            "http://localhost:5000/extract-skills",
            form,
            {
                headers: form.getHeaders()
            }
        );

        //Sends the Response From the Python Server To the Frontend

        res.json(response.data);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to process resume" });
    }
    finally{
        if(req.file){
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Failed to delete temp file:", err);
            });
        }
    }
})

app.get("/",(req,res)=>{
    res.json({
        success: true,
        message: "Resume Scorer API is running"
    });
})

app.listen(port,()=>{
    console.log(`Server is Running on http://localhost:${port}`);
})