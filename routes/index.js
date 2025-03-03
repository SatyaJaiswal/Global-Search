var express = require("express");
var router = express.Router();
const db = require("../db"); 
const natural = require("natural");

const tokenizer = new natural.WordTokenizer();

// Stopwords List
const stopwords = ["suggest", "me", "i", "need", "with", "range", "please", "show", "find", "a", "for", "under", "price", "looking"];

//Price Extract Karne Ka Regex
const priceRegex = /\b\d{2,7}\b/g;  // Detects 4 to 6 digit numbers (e.g., 45000, 30000, 99999)

// 🌟 Global Search Route
router.get("/global-search", (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Search query is required" });
    }

    //Tokenize Sentence (Words Extract)
    let words = tokenizer.tokenize(query.toLowerCase());

    //Price Extract Karna
    let priceMatch = query.match(priceRegex);
    let price = priceMatch ? parseInt(priceMatch[0]) : null;

    //  Stopwords Remove Karna
    let keywords = words.filter(word => !stopwords.includes(word) && !word.match(priceRegex));

    // If no valid keywords found, return empty
    if (keywords.length === 0 && !price) {
        return res.json([]);
    }

    //Product Search Condition (AND Condition for Keywords)
    let productConditions = keywords.map(word => `(name LIKE '%${word}%' OR description LIKE '%${word}%')`).join(' AND ');

    // Price Condition
    let priceCondition = price ? `price BETWEEN ${price - 5000} AND ${price + 5000}` : '';

    // Final Query Conditions
    let conditions = [];
    if (productConditions) conditions.push(productConditions);
    if (priceCondition) conditions.push(priceCondition);
    let finalCondition = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Final SQL Query
    const searchQuery = `
        SELECT 'product' AS type, id, name AS title, description, price 
        FROM products 
        ${finalCondition};
    `;

    // Execute SQL Query
    db.query(searchQuery, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

module.exports = router;
