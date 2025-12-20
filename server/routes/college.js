const express = require('express');
const router = express.Router();

const { addCollege, addCourseToCollege, getColleges, updateCollege, updateCourse } = require('../controllers/collegeController');

router.post('/add', addCollege);
router.post('/add-course', addCourseToCollege);
router.get('/all', getColleges);
router.put('/update/:id', updateCollege);
router.put('/update-course', updateCourse);

module.exports = router;