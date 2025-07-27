const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123',
  database: 'salesdb'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }

  console.log('Connected to the database.\n');

  connection.query('SELECT * FROM duplicates ORDER BY recid', (err, rowsBefore) => {
    if (err) {
      console.error('Error fetching records before deletion:', err.message);
      return connection.end();
    }

    console.log('📋 Records BEFORE deletion:');
    console.table(rowsBefore);

    const deleteQuery = `
      DELETE FROM duplicates
      WHERE recid NOT IN (
        SELECT * FROM (
          SELECT MIN(recid)
          FROM duplicates
          GROUP BY field1, field2, field3
        ) AS keep_ids
      );
    `;

    connection.query(deleteQuery, (err, result) => {
      if (err) {
        console.error('Error executing DELETE query:', err.message);
        return connection.end();
      }

      console.log(`Deleted ${result.affectedRows} duplicate record(s).\n`);

      connection.query('SELECT * FROM duplicates ORDER BY recid', (err, rowsAfter) => {
        if (err) {
          console.error('Error fetching records after deletion:', err.message);
        } else {
          console.log('Records AFTER deletion:');
          console.table(rowsAfter);
        }

        connection.end();
      });
    });
  });
});
