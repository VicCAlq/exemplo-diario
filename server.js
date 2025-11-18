const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./diarios.db', (err) => {

  if (err) {
    console.error('Erro ao abrir o banco de dados "diarios.db":', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite3 "diario.db"');
    
    db.run(`CREATE TABLE IF NOT EXISTS diario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      texto TEXT NOT NULL,
      data TEXT
    )`, (err) => {
      if (err) {
        console.error('Erro ao criar a tabela "diario"', err.message);
      } else {
        console.log('Tabela "diario" pronta!');
      }
    });
  }
});


app.get('/api/diario', (req, res) => {
  const sql = 'SELECT * FROM diario';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

app.get('/api/diario/:id', (req, res) => {
  const sql = 'SELECT * FROM diario WHERE id = ?';
  const params = [req.params.id];
  
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

app.post('/api/diario', (req, res) => {
  const { texto } = req.body;
  const cd = new Date()
  const data = `${cd.getDate()}/${cd.getMonth()}/${cd.getFullYear()} as ${cd.getHours()}:${cd.getMinutes()}`

  if (!texto) {
    return res.status(400).json({ error: 'O texto é obrigatório' });
  }
  
  const sql = `INSERT INTO diario (texto, data) 
         VALUES (?, ?)`;
  const params = [texto, data];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Game created successfully',
      data: { id: this.lastID },
      id: this.lastID
    });
  });
});

app.put('/api/diario/:id', (req, res) => {
  const { texto } = req.body;
  const cd = new Date()
  const data = `${cd.getDate()}/${cd.getMonth()}/${cd.getFullYear()} as ${cd.getHours()}:${cd.getMinutes()}`
  
  const sql = `UPDATE diario 
         SET texto = ?, data = ?
         WHERE id = ?`;
  const params = [texto, data];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Diário não encontrado' });
      return;
    }
    res.json({
      message: 'Diário atualizado',
      data: { id: req.params.id },
      changes: this.changes
    });
  });
});

app.delete('/api/diario/:id', (req, res) => {
  const sql = 'DELETE FROM diario WHERE id = ?';
  const params = [req.params.id];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Diário não encontrado' });
      return;
    }
    res.json({
      message: 'Diário apagado com sucesso',
      changes: this.changes
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro em alguma das ferramentas de middleware' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conexão com o banco de dados encerrada com sucesso.');
    process.exit(0);
  });
});

