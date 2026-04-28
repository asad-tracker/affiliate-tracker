require('dotenv').config();
const app = require('./app');
const db  = require('./models/db');
const { startCsvExportJob } = require('./jobs/csvExportJob');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await db.query('SELECT 1');
    console.log('DB connected');

    if (process.env.NODE_ENV !== 'test') {
      startCsvExportJob();
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to connect to DB:', err.message);
    process.exit(1);
  }
}

start();