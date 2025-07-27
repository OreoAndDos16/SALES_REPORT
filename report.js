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
        SELECT cuscde, docnum, trndte, trntot
        FROM salesfile2
        ORDER BY cuscde, trndte
    `;

    db.query(query, (err, results) => {
        if (err) throw err;

        let currentCustomer = null;
        let subtotal = 0;
        let grandTotal = 0;

        results.forEach((row, index) => {
            const { cuscde, docnum, trndte, trntot } = row;

            if (cuscde !== currentCustomer) {
                if (currentCustomer !== null) {
                    console.log(`Subtotal\t\t\t${subtotal.toFixed(2)}\n`);
                    subtotal = 0;
                }

                console.log(`${cuscde}`);
                console.log(`Date\t\tDoc No.\t\tAmount`);
                currentCustomer = cuscde;
            }

            console.log(`${trndte}\t\t${docnum}\t\t${parseFloat(trntot).toFixed(2)}`);
            subtotal += parseFloat(trntot);
            grandTotal += parseFloat(trntot);
        });

        if (currentCustomer !== null) {
            console.log(`Subtotal\t\t\t${subtotal.toFixed(2)}\n`);
        }

        console.log(`GRAND TOTAL\t\t\t${grandTotal.toFixed(2)}`);

        db.end();
    });
});