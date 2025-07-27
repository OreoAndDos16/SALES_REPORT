const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '123',  
    database: 'salesdb2'
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MariaDB.\n");

    const query = `
        SELECT 
            cf.tercde AS territory,
            cf.cuscde AS customer,
            SUM(sf.trntot) AS total
        FROM salesfile2 sf
        JOIN customerfile cf ON sf.cuscde = cf.cuscde
        GROUP BY cf.tercde, cf.cuscde
        ORDER BY cf.tercde, cf.cuscde;
`;

    db.query(query, (err, results) => {
        if (err) throw err;

        let currentTerritory = null;
        let territorySubtotal = 0;
        let grandTotal = 0;

        results.forEach((row, index) => {
            const { territory, customer, total } = row;

            if (territory !== currentTerritory) {
                if (currentTerritory !== null) {
                    // Print subtotal for previous territory
                    console.log(`SUBTOTAL\t\t\t${territorySubtotal.toFixed(2)}\n`);
                    territorySubtotal = 0;
                }

                currentTerritory = territory;
                console.log(`${territory}`);
            }

            console.log(`\t${customer}\t\t${parseFloat(total).toFixed(2)}`);
            territorySubtotal += parseFloat(total);
            grandTotal += parseFloat(total);
        });

        // Final territory subtotal
        if (currentTerritory !== null) {
            console.log(`SUBTOTAL\t\t\t${territorySubtotal.toFixed(2)}\n`);
        }

        // Grand total
        console.log(`GRAND TOTAL\t\t\t${grandTotal.toFixed(2)}`);

        db.end();
    });
});
