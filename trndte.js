const mysql = require('mysql2/promise');
const dayjs = require('dayjs');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'salesdb'
  });

  console.log('Connected to MariaDB.\n');

  const [rows] = await conn.execute(`
    SELECT recid, cremon, creyer, datetyp
    FROM salesfile1
    ORDER BY recid
  `);

  const resultTable = [];

  for (const row of rows) {
    const { recid, cremon, creyer, datetyp } = row;

    let trndte = null;

    if (datetyp === 'F') {
      trndte = dayjs(`${creyer}-${cremon}-01`).format('YYYY-MM-DD');
    } else if (datetyp === 'L') {
      trndte = dayjs(`${creyer}-${cremon}-01`).endOf('month').format('YYYY-MM-DD');
    }

    if (trndte) {
      await conn.execute(`
        UPDATE salesfile1
        SET trndte = ?
        WHERE recid = ?
      `, [trndte, recid]);
    }

    resultTable.push({
      recid,
      trndte: trndte ?? 'null',
      cremon,
      creyer,
      datetyp: datetyp ?? 'null'
    });
  }

  console.log('recid | trndte     | cremon | creyer | datetyp');
  console.log('------|------------|--------|--------|---------');
  resultTable.forEach(row => {
    const line = `${row.recid.toString().padEnd(5)} | ${row.trndte.padEnd(10)} | ${row.cremon.toString().padEnd(6)} | ${row.creyer.toString().padEnd(6)} | ${row.datetyp}`;
    console.log(line);
  });

  console.log('Done updating and displaying salesfile1.');
  await conn.end();
})();
