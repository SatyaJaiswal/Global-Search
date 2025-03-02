var express = require('express');
var router = express.Router();
const db = require('../db'); // Ensure this is correctly set up

// Global Search Route
router.get('/global-search', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${query}%`;

    const searchQuery = `
        (SELECT 'user' AS type, id, name AS title, email AS description FROM users WHERE name LIKE ? OR email LIKE ?)
        UNION
        (SELECT 'product' AS type, id, name AS title, description FROM products WHERE name LIKE ? OR description LIKE ?)
        UNION
        (SELECT 'order' AS type, orders.id, users.name AS title, status AS description FROM orders 
         JOIN users ON orders.user_id = users.id 
         WHERE status LIKE ?);
    `;

    db.query(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

module.exports = router;
