const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'salesdb'
  });

  console.log(' Connected to MariaDB.');

  const fixCuscdeQuery = `
    UPDATE salesfile1 AS s
    JOIN customerfile AS c ON s.cuscde = c.cusdsc
    SET s.cuscde = c.cuscde
  `;

  const clearCusdscQuery = `
    UPDATE salesfile1 SET cusdsc = NULL
  `;

  const updateCusdscQuery = `
    UPDATE salesfile1 AS s
    JOIN customerfile AS c ON s.cuscde = c.cuscde
    SET s.cusdsc = c.cusdsc
  `;

  const selectQuery = `
    SELECT recid, docnum, DATE_FORMAT(trndte, '%Y-%m-%d') AS trndte, cuscde, cusdsc
    FROM salesfile1
    ORDER BY recid
  `;

  try {
    const [result1] = await connection.query(fixCuscdeQuery);
    console.log(`Fixed ${result1.affectedRows} rows in salesfile1.cuscde`);

    const [result2] = await connection.query(clearCusdscQuery);
    console.log(`Cleared ${result2.affectedRows} rows in salesfile1.cusdsc`);

    const [result3] = await connection.query(updateCusdscQuery);
    console.log(`Updated ${result3.affectedRows} rows with correct customer descriptions`);

    const [rows] = await connection.query(selectQuery);

    console.log('Final salesfile1 Data:');
    console.log('RECID\tDOCNUM\tTRNDTE\t\tCUSCDE\tCUSDESC');
    console.log('--------------------------------------------------------');
    rows.forEach(row => {
      console.log(`${row.recid}\t${row.docnum}\t${row.trndte}\t${row.cuscde}\t${row.cusdsc ?? 'NULL'}`);
    });

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await connection.end();
    console.log('Connection closed.');
  }
}

main();
