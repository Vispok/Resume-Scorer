const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;


// ================================
// PATHS
// ================================

const DATA_FOLDER = path.join(__dirname, "data");

const USERS_FILE = path.join(DATA_FOLDER, "users.json");

const JOBS_FILE = path.join(DATA_FOLDER, "jobs.json");

const UPLOAD_FOLDER = path.join(__dirname, "uploads");


// ================================
// CREATE FOLDERS IF NOT AVAILABLE
// ================================

if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
}

if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER);
}


// Create users.json

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]");
}


// Create jobs.json

if (!fs.existsSync(JOBS_FILE)) {
    fs.writeFileSync(JOBS_FILE, "[]");
}


// ================================
// MIDDLEWARE
// ================================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// Session

app.use(session({

    secret: "job-portal-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
        maxAge: 1000 * 60 * 60
    }

}));


// Serve frontend files

app.use(express.static(
    path.join(__dirname, "public")
));


// ================================
// JSON FUNCTIONS
// ================================

function readJSON(file) {

    try {

        return JSON.parse(
            fs.readFileSync(file, "utf8")
        );

    } catch (error) {

        return [];

    }

}


function writeJSON(file, data) {

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2)
    );

}


// ================================
// LOGIN CHECK
// ================================

function requireLogin(req, res, next) {

    if (!req.session.userId) {

        return res.status(401).json({
            message: "Please login first."
        });

    }

    next();

}


// ================================
// GET CURRENT USER
// ================================

function getCurrentUser(req) {

    const users = readJSON(USERS_FILE);

    return users.find(
        user => user.id === req.session.userId
    );

}


// ========================================
// REGISTER
// ========================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            username,
            role,
            password,
            confirmPassword
        } = req.body;


        if (
            !username ||
            !role ||
            !password ||
            !confirmPassword
        ) {

            return res.status(400).json({
                message: "Please fill all fields."
            });

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const phonePattern =
            /^[6-9]\d{9}$/;

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;


        // Email / Phone validation

        if (
            !emailPattern.test(username) &&
            !phonePattern.test(username)
        ) {

            return res.status(400).json({
                message: "Enter valid Email or Phone Number."
            });

        }


        // Role validation

        if (
            role !== "candidate" &&
            role !== "recruiter"
        ) {

            return res.status(400).json({
                message: "Select valid user type."
            });

        }


        // Password validation

        if (!passwordPattern.test(password)) {

            return res.status(400).json({

                message:
                    "Password must contain uppercase, lowercase, number, special character and minimum 8 characters."

            });

        }


        if (password !== confirmPassword) {

            return res.status(400).json({
                message: "Passwords do not match."
            });

        }


        const users = readJSON(USERS_FILE);


        const normalizedUsername =
            username.includes("@")
                ? username.toLowerCase()
                : username;


        // Check existing account

        const existingUser = users.find(
            user =>
                user.username === normalizedUsername
        );


        if (existingUser) {

            return res.status(409).json({
                message: "User already registered."
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 12);


        const newUser = {

            id: Date.now().toString(),

            username: normalizedUsername,

            role: role,

            passwordHash: hashedPassword,

            profile: null,

            resume: null,

            createdAt:
                new Date().toISOString()

        };


        users.push(newUser);


        writeJSON(
            USERS_FILE,
            users
        );


        res.status(201).json({

            message:
                "Registration Successful!"

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error."
        });

    }

});


// ========================================
// LOGIN
// ========================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res.status(400).json({

                message:
                    "Please fill all fields."

            });

        }


        const users =
            readJSON(USERS_FILE);


        const normalizedUsername =
            username.includes("@")
                ? username.toLowerCase()
                : username;


        const user =
            users.find(
                user =>
                    user.username ===
                    normalizedUsername
            );


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid Email/Phone or Password."

            });

        }


        // Compare entered password
        // with hashed password

        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!passwordCorrect) {

            return res.status(401).json({

                message:
                    "Invalid Email/Phone or Password."

            });

        }


        // Store logged-in user ID
        // inside session

        req.session.userId = user.id;


        res.json({

            message:
                "Login Successful!",

            role:
                user.role

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error."
        });

    }

});


// ========================================
// SAVE USER DATA
// ========================================

app.post(
    "/api/userdata",
    requireLogin,
    (req, res) => {

        const {
            name,
            email,
            phone,
            gender,
            dob
        } = req.body;


        if (
            !name ||
            !email ||
            !phone ||
            !gender ||
            !dob
        ) {

            return res.status(400).json({

                message:
                    "All fields are required."

            });

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        const phonePattern =
            /^[6-9]\d{9}$/;


        if (!emailPattern.test(email)) {

            return res.status(400).json({

                message:
                    "Enter valid Email."

            });

        }


        if (!phonePattern.test(phone)) {

            return res.status(400).json({

                message:
                    "Enter valid Phone Number."

            });

        }


        const users =
            readJSON(USERS_FILE);


        const index =
            users.findIndex(
                user =>
                    user.id ===
                    req.session.userId
            );


        if (index === -1) {

            return res.status(404).json({

                message:
                    "User not found."

            });

        }


        users[index].profile = {

            name,

            email,

            phone,

            gender,

            dob

        };


        writeJSON(
            USERS_FILE,
            users
        );


        // Decide next page

        let redirectPage;


        if (
            users[index].role ===
            "recruiter"
        ) {

            redirectPage =
                "/recruiter.html";

        } else {

            redirectPage =
                "/profile.html";

        }


        res.json({

            message:
                "User information saved.",

            redirect:
                redirectPage

        });

    }
);


// ========================================
// GET PROFILE
// ========================================

app.get(
    "/api/profile",
    requireLogin,
    (req, res) => {

        const user =
            getCurrentUser(req);


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found."

            });

        }


        res.json({

            username:
                user.username,

            role:
                user.role,

            profile:
                user.profile,

            resume:
                user.resume

        });

    }
);


// ========================================
// PDF STORAGE
// ========================================

const storage =
    multer.diskStorage({

        destination:
            function (req, file, cb) {

                cb(
                    null,
                    UPLOAD_FOLDER
                );

            },

        filename:
            function (req, file, cb) {

                const filename =
                    Date.now() +
                    "-" +
                    file.originalname;

                cb(
                    null,
                    filename
                );

            }

    });


// ========================================
// MAXIMUM FILE SIZE = 5 MB
// ========================================

const upload =
    multer({

        storage: storage,

        limits: {

            fileSize:
                5 * 1024 * 1024

        },

        fileFilter:
            function (
                req,
                file,
                cb
            ) {

                if (
                    file.mimetype ===
                    "application/pdf"
                ) {

                    cb(
                        null,
                        true
                    );

                } else {

                    cb(
                        new Error(
                            "Only PDF files allowed."
                        )
                    );

                }

            }

    });


// ========================================
// PROFILE PDF UPLOAD
// ========================================

app.post(
    "/api/profile/upload",
    requireLogin,
    (req, res) => {

        upload.single("resume")(
            req,
            res,
            function (error) {

                if (error) {

                    if (
                        error.code ===
                        "LIMIT_FILE_SIZE"
                    ) {

                        return res.status(400).json({

                            message:
                                "PDF cannot exceed 5 MB."

                        });

                    }


                    return res.status(400).json({

                        message:
                            error.message

                    });

                }


                if (!req.file) {

                    return res.status(400).json({

                        message:
                            "Please select PDF."

                    });

                }


                const users =
                    readJSON(USERS_FILE);


                const index =
                    users.findIndex(
                        user =>
                            user.id ===
                            req.session.userId
                    );


                if (index === -1) {

                    return res.status(404).json({

                        message:
                            "User not found."

                    });

                }


                users[index].resume = {

                    originalName:
                        req.file.originalname,

                    storedName:
                        req.file.filename,

                    size:
                        req.file.size,

                    uploadedAt:
                        new Date().toISOString()

                };


                writeJSON(
                    USERS_FILE,
                    users
                );


                res.json({

                    message:
                        "PDF Uploaded Successfully!",

                    fileName:
                        req.file.originalname

                });

            }
        );

    }
);


// ========================================
// RECRUITER JOB POST
// ========================================

app.post(
    "/api/jobs",
    requireLogin,
    (req, res) => {

        const user =
            getCurrentUser(req);


        if (
            !user ||
            user.role !== "recruiter"
        ) {

            return res.status(403).json({

                message:
                    "Only recruiters can post jobs."

            });

        }


        upload.single("offerPdf")(
            req,
            res,
            function (error) {

                if (error) {

                    if (
                        error.code ===
                        "LIMIT_FILE_SIZE"
                    ) {

                        return res.status(400).json({

                            message:
                                "PDF cannot exceed 5 MB."

                        });

                    }


                    return res.status(400).json({

                        message:
                            error.message

                    });

                }


                const {

                    jobType,

                    competencies,

                    aboutJob,

                    duration,

                    workType,

                    workingHours,

                    salary

                } = req.body;


                if (
                    !jobType ||
                    !competencies ||
                    !aboutJob ||
                    !duration ||
                    !workType ||
                    !workingHours ||
                    !salary
                ) {

                    return res.status(400).json({

                        message:
                            "Please fill all fields."

                    });

                }


                const jobs =
                    readJSON(JOBS_FILE);


                const job = {

                    id:
                        Date.now().toString(),

                    recruiterId:
                        user.id,

                    jobType,

                    competencies,

                    aboutJob,

                    duration,

                    workType,

                    workingHours,

                    salary,

                    offerPdf:
                        req.file
                            ? {

                                originalName:
                                    req.file.originalname,

                                storedName:
                                    req.file.filename

                            }
                            : null,

                    createdAt:
                        new Date().toISOString()

                };


                jobs.push(job);


                writeJSON(
                    JOBS_FILE,
                    jobs
                );


                res.status(201).json({

                    message:
                        "Job Posted Successfully!"

                });

            }
        );

    }
);


// ========================================
// START SERVER
// ========================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);