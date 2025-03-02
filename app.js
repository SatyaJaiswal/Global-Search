const express = require('express');
const cors = require('cors');
const indexRoutes = require('./routes/index'); // Renamed variable for clarity
const db = require('./db'); // Ensure database connection is imported

const app = express();
app.use(cors());
app.use(express.json());

// Use '/api' as the prefix for API routes
app.use('/api', indexRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Open Search API is running...');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
