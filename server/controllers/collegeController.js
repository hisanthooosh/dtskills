const College = require('../models/College');
const bcrypt = require('bcryptjs');

// --- HELPER FUNCTION: Generate Roll Numbers ---
const generateRollNumbers = (start, end) => {
  const rollList = [];
  
  // Extract numeric part from end (e.g., "24102d020001" -> prefix: "24102d02", number: "0001")
  const matchStart = start.match(/(\D*)(\d+)$/);
  const matchEnd = end.match(/(\D*)(\d+)$/);

  if (!matchStart || !matchEnd || matchStart[1] !== matchEnd[1]) {
    throw new Error("Start and End roll numbers must have the same prefix format.");
  }

  const prefix = matchStart[1];
  const startNum = parseInt(matchStart[2], 10);
  const endNum = parseInt(matchEnd[2], 10);
  const padding = matchStart[2].length; // Preserve leading zeros (e.g., 001 vs 1)

  for (let i = startNum; i <= endNum; i++) {
    const paddedNum = i.toString().padStart(padding, '0');
    rollList.push({ number: `${prefix}${paddedNum}`, isRegistered: false });
  }

  return rollList;
};

// --- CONTROLLER FUNCTIONS ---

// 1. Add a New College (Just the name)
exports.addCollege = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "College Name is required" });

    // Check if duplicate
    const existing = await College.findOne({ name });
    if(existing) return res.status(400).json({ error: "College already exists" });

    const newCollege = new College({ name });
    await newCollege.save();
    
    res.status(201).json(newCollege);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Add Department (Course) + Generate Rolls + Add HOD Credentials
exports.addCourseToCollege = async (req, res) => {
  try {
    const { collegeId, courseName, startRoll, endRoll, hodEmail, hodPassword } = req.body;

    // A. Validation
    if (!courseName || !startRoll || !endRoll || !hodEmail || !hodPassword) {
      return res.status(400).json({ error: "All fields (Name, Rolls, HOD Email/Pass) are required." });
    }

    const college = await College.findById(collegeId);
    if (!college) return res.status(404).json({ error: "College not found" });

    // B. Generate Roll Numbers
    let generatedRolls = [];
    try {
      generatedRolls = generateRollNumbers(startRoll, endRoll);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    // C. Hash Password for HOD
    const hashedPassword = await bcrypt.hash(hodPassword, 10);

    // D. Push Data
    college.courses.push({
      courseName,
      startRoll,
      endRoll,
      rollNumbers: generatedRolls,
      hodEmail,                // 👈 Stored in Department
      hodPassword: hashedPassword // 👈 Stored in Department
    });

    await college.save();
    
    res.status(200).json({ 
      message: `Added ${courseName} with ${generatedRolls.length} seats. HOD Assigned: ${hodEmail}`, 
      college 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get All Colleges (Public/Admin)
exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.find({});
    res.status(200).json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Update College Name
exports.updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await College.findByIdAndUpdate(id, { name });
    res.status(200).json({ message: "College updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Update Course/Department Name
exports.updateCourse = async (req, res) => {
  try {
    const { collegeId, courseId, newName } = req.body;
    
    const result = await College.updateOne(
      { "_id": collegeId, "courses._id": courseId },
      { $set: { "courses.$.courseName": newName } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Course not found." });
    }

    res.status(200).json({ message: "Department updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. 👔 HOD Login (Finds College -> Matches specific Department HOD)
exports.loginHod = async (req, res) => {
  try {
    const { email, password } = req.body;

    // A. Find the college containing this HOD email in ANY of its courses
    const college = await College.findOne({ "courses.hodEmail": email });
    
    if (!college) {
      return res.status(404).json({ message: "HOD Email not found in any college." });
    }

    // B. Extract the specific department that matches the email
    const department = college.courses.find(course => course.hodEmail === email);

    if (!department) {
      return res.status(404).json({ message: "Department mismatch error." });
    }

    // C. Verify Password
    const isMatch = await bcrypt.compare(password, department.hodPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // D. Return success with Dept Info
    res.status(200).json({ 
      message: "Login successful", 
      collegeId: college._id, 
      collegeName: college.name,
      deptName: department.courseName, // 👈 Important: Return Dept Name
      deptId: department._id
    });

  } catch (err) {
    console.error("HOD Login Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 7. Get Single College Details (with populated students)
exports.getCollegeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Populate student details inside the deeply nested array
    const college = await College.findById(id).populate({
      path: 'courses.rollNumbers.studentId', 
      model: 'User',
      select: 'username email enrolledCourses faceDescriptor' // Only get needed fields
    });
    
    if (!college) return res.status(404).json({ error: "College not found" });
    
    res.status(200).json(college);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. 🔐 HOD — Reset Student Password (Simple & Trusted)
exports.resetStudentPassword = async (req, res) => {
  try {
    const { studentId, newPassword, collegeId, dept } = req.body;

    if (!studentId || !newPassword || !collegeId || !dept) {
      return res.status(400).json({
        message: 'studentId, newPassword, collegeId and dept are required'
      });
    }

    // 1️⃣ Find student
    const student = await require('../models/User').findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2️⃣ Check student belongs to same college
    if (student.collegeId.toString() !== collegeId) {
      return res.status(403).json({
        message: 'Student does not belong to your college'
      });
    }

    // 3️⃣ Verify student belongs to HOD department
    const college = await require('../models/College').findById(collegeId);
    const department = college.courses.find(c => c.courseName === dept);

    if (!department) {
      return res.status(403).json({
        message: 'Department not found'
      });
    }

    const rollEntry = department.rollNumbers.find(
      r => r.studentId?.toString() === studentId
    );

    if (!rollEntry) {
      return res.status(403).json({
        message: 'Student does not belong to your department'
      });
    }

    // 4️⃣ Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5️⃣ Update password
    student.password = hashedPassword;
    await student.save();

    res.status(200).json({
      message: 'Password updated successfully'
    });

  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({
      message: 'Failed to reset password'
    });
  }
};
