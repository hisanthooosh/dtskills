const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number,
});

const topicSchema = new mongoose.Schema({
  title: String,
  textContent: String, // Main learning material (Article/Text)
  youtubeLinks: [{       // Suggested videos from Admin
    title: String,
    url: String
  }],
  quiz: [quizSchema], 
});

const moduleSchema = new mongoose.Schema({
  title: String,
  topics: [topicSchema],
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  price: Number,
  isPublished: { type: Boolean, default: false },
  modules: [moduleSchema],
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);