import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'password_vault'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the MySQL database');
  }
});

app.get('/api/passwords', (req, res) => {
  const sql = 'SELECT * FROM passwords';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/api/passwords', (req, res) => {
  const { site, password } = req.body;
  const sql = 'INSERT INTO passwords (site, password) VALUES (?, ?)';
  db.query(sql, [site, password], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId, site, password });
  });
});

app.delete('/api/passwords/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM passwords WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
