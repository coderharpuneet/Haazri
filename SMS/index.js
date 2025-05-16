const express = require("express")
const session = require("express-session")
const fs = require("fs")
const path = require("path")
const cors = require("cors")
const mongoose = require('mongoose');
const app = express()

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({ secret: "your_secret_key", resave: false, saveUninitialized: true }))
app.use(cors())

const PORT = 3001

const usersFile = path.join(__dirname, "users.json")
app.use(express.static(path.join(__dirname, "public")))

const readUsers = () => {
  if (!fs.existsSync(usersFile)) return []
  const data = fs.readFileSync(usersFile, "utf8")
  return JSON.parse(data)
}

const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8")
}


function requireLogin(req, res, next) {
  if (!req.session.user) {
    const err = new Error("You must be logged in to access this page");
    err.status = 401;
    return next(err);
  }

  if (req.query.username && req.query.username !== req.session.user.username) {
    const err = new Error("Unauthorized access to another user's data");
    err.status = 403;
    return next(err);
  }

  next(); 
}


app.get("/", (req, res) => {
  res.render("landing")
})

app.get("/login", (req, res) => {
  res.render("login")
})



app.get("/attendance", requireLogin, (req, res) => {
  const sessionUsername = req.session.user.username;
  const urlUsername = req.query.username;

  if (!urlUsername || urlUsername !== sessionUsername) {
    const err = new Error("Unauthorized access to another user's data");
    err.status = 403;
    return res.status(403).render("403", { errorMessage: err.message });
  }

  res.render("attendance", { username: urlUsername });
});



app.post("/login", (req, res) => {
  const { username, password } = req.body
  const users = readUsers()

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" })
  }

  const user = users.find((u) => u.username === username)

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Incorrect password" })
  }

  req.session.user = { username: user.username, email: user.email }
  res.json({ message: "Login successful", redirectUrl: `/attendance?username=${username}` })

})

app.post("/signup", (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const users = readUsers()
  const existingUser = users.find((u) => u.username === username || u.email === email)

  if (existingUser) {
    return res.status(409).json({ message: "Username or email already exists" })
  }

  users.push({ username, email, password })
  writeUsers(users)

  return res.json({ message: "User registered successfully" })
})

app.post("/saveAttendance", (req, res) => {
  const { username, courses } = req.body

  if (!username || !courses) {
    return res.status(400).json({ message: "Username and courses are required" })
  }

  let attendance = {}
  if (fs.existsSync(attendanceFile)) {
    const data = fs.readFileSync(attendanceFile, "utf8")
    attendance = JSON.parse(data)
  }

  attendance[username] = courses

  fs.writeFileSync(attendanceFile, JSON.stringify(attendance, null, 2), "utf8")

  res.json({ message: "Attendance saved successfully" })
})

app.get("/loadAttendance", (req, res) => {
  const { username } = req.query

  if (!username) {
    return res.status(400).json({ message: "Username is required" })
  }

  let attendance = {}
  if (fs.existsSync(attendanceFile)) {
    const data = fs.readFileSync(attendanceFile, "utf8")
    attendance = JSON.parse(data)
  }

  const userAttendance = attendance[username] || []

  res.json({ username, courses: userAttendance })
})

const attendanceFile = path.join(__dirname, "userAttendance.json")
const initializeAttendanceFile = () => {
  if (!fs.existsSync(attendanceFile)) {
    fs.writeFileSync(attendanceFile, JSON.stringify({}, null, 2), "utf8")
  }
}

initializeAttendanceFile()




app.use((req, res, next) => {
  const err = new Error("Page not found");
  err.status = 404;
  next(err);
});


app.use((err, req, res, next) => {
  const status = err.status || 500;

  if (status === 401 || status === 403) {
    return res.status(status).render("403", {
      errorMessage: err.message
    });
  }

  if (status === 404) {
    return res.status(404).render("404", {
      errorMessage: "We couldn't find that page 😕"
    });
  }

  res.status(status).render("500", { error: err.message });
});



const dbConnection=async()=>{
    try{
        await mongoose.connect("mongodb+srv://HaazriLagao:HaazriLagao@haazri1.dshgjci.mongodb.net/?retryWrites=true&w=majority&appName=Haazri1");
        console.log("Database connected successfully");
        app.listen(PORT,()=>{
            console.log(`Server is running on port ${PORT}`);
        })
    }
    catch(err){
        console.log(err);
    }
}
dbConnection();
