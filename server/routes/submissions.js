const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// 1. Get all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Approve Submission
router.put('/:id/approve', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.status = 'Approved';
    await submission.save();

    console.log(`Certificate generated for ${submission.studentName}`);

    res.json({ message: 'Approved and certificate generation triggered', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Reject Submission
router.put('/:id/reject', async (req, res) => {
  const { feedback } = req.body;
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.status = 'Rejected';
    submission.feedback = feedback;
    await submission.save();

    console.log(`Rejection email sent to student with feedback: ${feedback}`);

    res.json({ message: 'Submission rejected and feedback recorded', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;