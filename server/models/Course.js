const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: { type: Number, default: 200 },
  chapters: [{
    title: String, 
    topics: [{     
      title: String,
      content: String, // This is your main text area
      video: String,   // We keep this in DB just in case, but won't show it
      
      // --- NEW FIELD: Suggested Links ---
      suggestedLinks: [{
        title: String,
        url: String
      }],

      // --- EXAM DATA ---
      quizzes: [{  
        question: String,
        options: [String],
        correctAnswer: Number // Index of the correct option (0, 1, 2, or 3)
      }]
    }]
  }]
});

module.exports = mongoose.model('Course', courseSchema);