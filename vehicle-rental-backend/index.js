// index.js
const express = require('express');
const app = express();
const pool = require('./db'); // Imports your database connection

app.use(express.json()); // Allows your app to read JSON data

// A test route to check the time from the database
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database is connected!', 
      time: result.rows[0].now 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});