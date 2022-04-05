const e = require('express');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const validator = require('validator');

// Creating connection with sqlite3 database
const db = new sqlite3.Database(
  './database/sqlite3.db',
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) return console.log(err.message);

    console.log('Connection successfull');
  }
);

app.use('/static', express.static('assets'));
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));

// home page rendering
app.get('/', (req, res) => {
  res.render('home', { success: true });
});
app.get('/home', (req, res) => {
  res.redirect('/');
});

// students view page
app.get('/students', (req, res) => {
  let sql = 'select * from students';

  db.all(sql, [], (err, data) => {
    if (err) throw err;
    res.render('students', { title: 'Student List', userData: data });
  });
});

// add page
app.get('/add', (req, res) => {
  res.render('add');
});

// getting form data
app.post('/add', (req, res) => {
  let formData = req.body;
  if (
    formData.name.length === 0 ||
    formData.studentId.length === 0 ||
    formData.phoneNumber.length === 0
  ) {
    res.render('add', { error: true });
  } else {
    res.render('add', { success: true });
    let sqlInsert =
      'insert into students(name, student_id, phone_number, email) values (?, ?, ?, ?)';
    db.run(
      sqlInsert,
      [
        `${formData.name}`,
        `${formData.studentId}`,
        `${formData.phoneNumber}`,
        `${formData.email}`,
      ],
      (err) => {
        if (err) throw err;

        console.log('A new student record has been created'); // need to remove this line
      }
    );
  }
});

// deleting a record
app.get('/students/:id/delete', (req, res) => {
  const StudentId = req.params.id;

  db.run('DELETE FROM students where id=?', StudentId, (err) => {
    if (err) throw err;

    db.all('SELECT * FROM students', [], (err, rows) => {
      res.render('students', { userData: rows });
    });
  });
});

app.get('/students/:id/edit', (req, res) => {
  const id = req.params.id;
  db.get('select * from students where id=?', id, (err, row) => {
    res.render('edit', { userData: row, id: id });
  });
});

app.post('/students/:id/edit', (req, res) => {
  const formData = req.body;
  const id = req.params.id;

  if (formData.name.length === 0) {
    db.get('select * from students where id=?', id, (err, row) => {
      if (err) throw err;

      res.render('edit', { userData: row, id: id, error: true });
    });
  } else {
    let update =
      'update students set name = ?, student_id = ?, phone_number = ?, email = ? where id = ?';

    db.run(
      update,
      [
        formData.name,
        formData.studentId,
        formData.phoneNumber,
        formData.email,
        id,
      ],
      (err) => {
        if (err) throw err;
      }
    );
    res.redirect('/students');
  }
});

app.listen(3000)
