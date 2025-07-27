const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'FRONT_END')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'FRONT_END', 'index.html'));
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'salesdb'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MariaDB.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.get('/api/fill-cusdsc', (req, res) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123',
        database: 'salesdb2'
    });

    const updateQuery = `
        UPDATE salesfile2 s
        JOIN customerfile c ON s.cuscde = c.cuscde
        SET s.cusdsc = c.cusdsc;
    `;

    // First, perform the update
    connection.query(updateQuery, (updateErr) => {
        if (updateErr) {
            console.error("Update error:", updateErr);
            res.status(500).json({ error: 'Failed to update cusdsc' });
            connection.end();
            return;
        }

        // Then, select and return the updated table
        const selectQuery = `
            SELECT s.trndte, s.docnum, s.trntot, s.cuscde, s.cusdsc
            FROM salesfile2 s
            ORDER BY s.cuscde, s.trndte;
        `;

        connection.query(selectQuery, (selectErr, results) => {
            if (selectErr) {
                console.error("Select error:", selectErr);
                res.status(500).json({ error: 'Failed to fetch updated salesfile2' });
            } else {
                res.json(results);
            }
            connection.end();
        });
    });
});


app.get('/api/fix-dates', (req, res) => {
    // Generate trndte based on datetyp, cremon, creyer
    const fetchQuery = `
        SELECT 
            recid,
            CASE 
                WHEN datetyp = 'F' THEN DATE_FORMAT(CONCAT(creyer, '-', cremon, '-01'), '%Y-%m-%d')
                WHEN datetyp = 'L' THEN LAST_DAY(CONCAT(creyer, '-', cremon, '-01'))
                ELSE NULL
            END AS trndte,
            cremon,
            creyer,
            datetyp
        FROM salesfile1
        ORDER BY recid;
    `;

    db.query(fetchQuery, (err, results) => {
        if (err) {
            console.error("Fetch error:", err);
            return res.status(500).json({ error: 'Fetch failed' });
        }
        res.json(results);
    });
});

app.get('/api/remove-duplicates', (req, res) => {
    const deleteQuery = `
        DELETE d1 FROM duplicates d1
        JOIN duplicates d2 
        ON d1.field1 = d2.field1 
        AND d1.field3 = d2.field3 
        AND d1.recid > d2.recid;
    `;

    db.query(deleteQuery, (err) => {
        if (err) {
            console.error("Duplicate removal error:", err);
            return res.status(500).json({ error: 'Duplicate removal failed' });
        }

        const fetchQuery = `
            SELECT * FROM duplicates ORDER BY recid
        `;

        db.query(fetchQuery, (err2, results) => {
            if (err2) {
                console.error("Fetch error:", err2);
                return res.status(500).json({ error: 'Fetch failed' });
            }
            res.json(results);
        });
    });
});



app.get('/api/territory-report', (req, res) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123',
        database: 'salesdb2'
    });

    connection.query(`
        SELECT 
            cf.tercde AS tercde,
            cf.cuscde AS cuscde,
            SUM(sf.trntot) AS total
        FROM salesfile2 sf
        JOIN customerfile cf ON sf.cuscde = cf.cuscde
        GROUP BY cf.tercde, cf.cuscde
        ORDER BY cf.tercde, cf.cuscde;
    `, (err, results) => {
        if (err) {
            console.error('Error executing territory report:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json(results); // Send data to frontend
        }

        connection.end();
    });
});

app.get('/api/customer-report', (req, res) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123',
        database: 'salesdb2'
    });

    const query = `
        SELECT s.trndte, s.docnum, s.trntot, c.cuscde
        FROM salesfile2 s
        JOIN customerfile c ON s.cuscde = c.cuscde
        ORDER BY c.cuscde, s.trndte;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Query error:", err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }

        res.json(results);
        connection.end();
    });
});



