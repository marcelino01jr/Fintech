const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://SltnAccel:s7W7wPeAfpbiN-71N1aGvA@fintech-25884.j77.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full',
});

client.connect()
  .then(() => {
    console.log('Connected successfully!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Query result:', res.rows);
    client.end();
  })
  .catch(err => {
    console.error('Connection error:', err.stack);
    client.end();
  });
