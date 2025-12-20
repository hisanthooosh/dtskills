const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const College = require('../models/College');

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, rollNumber, collegeId, courseId } = req.body;

    console.log("Register Request:", req.body); 

    // A. Basic Validation
    if (!username || !email || !password || !rollNumber || !collegeId || !courseId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // B. Check if User exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // C. Validate College & Roll Number
    if (!mongoose.Types.ObjectId.isValid(collegeId) || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "Invalid College or Course ID" });
    }

    const college = await College.findOne({
      "_id": collegeId,
      "courses._id": courseId,
      "courses.rollNumbers.number": rollNumber
    });

    if (!college) {
      return res.status(404).json({ message: "College, Course, or Roll Number not found." });
    }

    // Check if roll number is already registered
    const course = college.courses.id(courseId);
    const rollEntry = course.rollNumbers.find(r => r.number === rollNumber);

    if (rollEntry.isRegistered) {
      return res.status(400).json({ message: "This Roll Number is already registered!" });
    }

    // D. Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
      role: 'student',
      
      // --- MAPPED FIELDS ---
      name: username,             // Saves username as name
      rollNumber: rollNumber,     
      collegeName: college.name,  // Saves the college name string
      collegeId: college._id,     
      courseId: courseId          
    });

    const savedUser = await newUser.save();

    // E. Mark Roll Number as Registered
    await College.updateOne(
      { "_id": collegeId, "courses._id": courseId, "courses.rollNumbers.number": rollNumber },
      { 
        $set: { 
          "courses.$[c].rollNumbers.$[r].isRegistered": true,
          "courses.$[c].rollNumbers.$[r].studentId": savedUser._id
        } 
      },
      {
        arrayFilters: [
          { "c._id": courseId },
          { "r.number": rollNumber }
        ]
      }
    );

    res.status(201).json({ message: "Registration successful!" });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const { password: _, ...userInfo } = user._doc;
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;