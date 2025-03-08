const express = require("express");
const session = require('express-session');
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(cors());

const PORT = 3001;

const usersFile = path.join(__dirname, "users.json");

const readUsers = () => {
    if (!fs.existsSync(usersFile)) return [];
    const data = fs.readFileSync(usersFile, "utf8");
    return JSON.parse(data);
};

const writeUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
};

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = users.find((u) => u.username === username);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    req.session.user = { username: user.username, email: user.email };
    res.json({ message: "Login successful", redirectUrl: `../public/attendance.html?username=${username}` });
});

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const users = readUsers();
    const existingUser = users.find((u) => u.username === username || u.email === email);

    if (existingUser) {
        return res.status(409).json({ message: "Username or email already exists" });
    }

    users.push({ username, email, password });
    writeUsers(users);

    return res.json({ message: "User registered successfully" });
});

// Endpoint to save attendance data
app.post("/saveAttendance", (req, res) => {
    const { username, courses } = req.body;

    if (!username || !courses) {
        return res.status(400).json({ message: "Username and courses are required" });
    }

    // Read the existing attendance data
    let attendance = {};
    if (fs.existsSync(attendanceFile)) {
        const data = fs.readFileSync(attendanceFile, "utf8");
        attendance = JSON.parse(data);
    }

    // Update the attendance data for the user
    attendance[username] = courses;

    // Write the updated data back to the file
    fs.writeFileSync(attendanceFile, JSON.stringify(attendance, null, 2), "utf8");

    res.json({ message: "Attendance saved successfully" });
});

// Endpoint to load attendance data
app.get("/loadAttendance", (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    // Read the existing attendance data
    let attendance = {};
    if (fs.existsSync(attendanceFile)) {
        const data = fs.readFileSync(attendanceFile, "utf8");
        attendance = JSON.parse(data);
    }

    // Get the attendance data for the user
    const userAttendance = attendance[username] || [];

    res.json({ username, courses: userAttendance });
});

// Serve static files from the SMS directory
app.use(express.static(path.join(__dirname)));

const attendanceFile = path.join(__dirname, "userAttendance.json");
const initializeAttendanceFile = () => {
    if (!fs.existsSync(attendanceFile)) {
        fs.writeFileSync(attendanceFile, JSON.stringify({}, null, 2), "utf8");
    }
};

// Call the function to initialize the file
initializeAttendanceFile();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});