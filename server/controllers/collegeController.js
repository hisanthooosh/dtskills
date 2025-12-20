const College = require('../models/College');

// Helper to generate range
const generateRollNumbers = (start, end) => {
  const rollList = [];
  
  // Extract the numeric part from the end of the string
  // Assumption: The prefix is the same, only the last digits change.
  // Example: 24102d020001 -> Prefix: 24102d02, Suffix: 0001
  
  const matchStart = start.match(/(\D*)(\d+)$/);
  const matchEnd = end.match(/(\D*)(\d+)$/);

  if (!matchStart || !matchEnd || matchStart[1] !== matchEnd[1]) {
    throw new Error("Start and End roll numbers must have the same prefix format.");
  }

  const prefix = matchStart[1];
  const startNum = parseInt(matchStart[2], 10);
  const endNum = parseInt(matchEnd[2], 10);
  const padding = matchStart[2].length; // Keep leading zeros length

  for (let i = startNum; i <= endNum; i++) {
    // Pad the number with zeros (e.g., 1 becomes 0001)
    const paddedNum = i.toString().padStart(padding, '0');
    rollList.push({ number: `${prefix}${paddedNum}`, isRegistered: false });
  }

  return rollList;
};

// 1. Add a new College
exports.addCollege = async (req, res) => {
  try {
    const { name } = req.body;
    const newCollege = new College({ name });
    await newCollege.save();
    res.status(201).json(newCollege);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Add Course & Generate Roll Numbers
exports.addCourseToCollege = async (req, res) => {
  try {
    const { collegeId, courseName, startRoll, endRoll } = req.body;
    
    // Generate the specific roll numbers
    const generatedRolls = generateRollNumbers(startRoll, endRoll);

    const college = await College.findById(collegeId);
    if (!college) return res.status(404).json({ error: "College not found" });

    college.courses.push({
      courseName,
      startRoll,
      endRoll,
      rollNumbers: generatedRolls
    });

    await college.save();
    res.status(200).json({ message: `Generated ${generatedRolls.length} roll numbers for ${courseName}`, college });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get All Colleges (Fixed: Fetches ALL data so IDs are never missing)
exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.find({}); // <--- Removed the text string here
    res.status(200).json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ... existing code ...

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
      return res.status(404).json({ error: "Course not found. ID might be invalid." });
    }

    res.status(200).json({ message: "Department updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};