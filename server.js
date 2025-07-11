const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const mongoURI = 'mongodb://localhost:27017/'; // Actual connection string

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- API Endpoints ---
app.use('/api/leads', require('./routes/leads'));


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
