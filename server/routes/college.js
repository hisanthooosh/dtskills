const express = require('express');
const router = express.Router();
const { resetStudentPassword } = require('../controllers/collegeController');

const { addCollege, addCourseToCollege, getColleges, updateCollege, updateCourse ,
    loginHod,          // 👈 Import this
  getCollegeDetails  // 👈 Import this
} = require('../controllers/collegeController');

router.post('/add', addCollege);
router.post('/add-course', addCourseToCollege);
router.get('/all', getColleges);
router.put('/update/:id', updateCollege);
router.put('/update-course', updateCourse);
// 👔 HOD Routes
router.post('/login', loginHod);       // 👈 NEW
router.get('/:id', getCollegeDetails); // 👈 NEW
router.post('/reset-student-password', resetStudentPassword);


module.exports = router;