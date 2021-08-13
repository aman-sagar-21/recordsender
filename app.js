  if (process.env.NODE_ENV !== "production") {
      require('dotenv').config();
  }
  const express = require('express');
  const app = express();
  const ejsMate = require('ejs-mate');
  const path = require('path');
  const methodOverride = require('method-override');
  const mongoose = require('mongoose');
  const Record = require('./models/records');
  const nodemailer = require('nodemailer');


  app.engine('ejs', ejsMate);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));
  app.use(express.static(path.join(__dirname, 'public')));

  const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/recorddb';

  mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
      console.log("Database connected");
  });

  app.get('/', async(req, res) => {
      const records = await Record.find({});
      res.render('index', { records });
  });

  app.post('/', async(req, res) => {

      const record = new Record(req.body.record);
      await record.save();
      res.redirect('/');

  });

  app.get('/update/:id', async(req, res) => {
      const record = await Record.findById(req.params.id);
      res.render('update', { record });
  })

  app.put('/update/:id', async(req, res) => {
      const record = await Record.findByIdAndUpdate(req.params.id, {...req.body.record });
      await record.save();
      res.redirect('/');
  })


  app.delete('/:id', async(req, res) => {
      await Record.findByIdAndDelete(req.params.id);
      res.redirect('/');
  })

  app.post('/sendmail', async(req, res) => {
      const obj = req.body;
      const arr = Object.values(obj);
      let htmltosend = `<style>
                th{
                    border: 1px solid blue;
                    padding: 2px;
                }
                td{
                    border: 1px solid blue;
                    padding: 2px;
                }
                </style>
                <h1>Records</h1>
                <table style=>
                <thead>
                        <tr>
                            
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Hobbies</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                `;
      for (let id of arr) {
          const record = await Record.findById(id);
          let constring = `<tr>
            <td>${record._id}</td>
            <td>${record.name}</td>
            <td>${record.phone}</td>
            <td>${record.email}</td>
            <td>${record.hobbies}</td>
            </tr>`;
          htmltosend = htmltosend.concat(constring);
      }
      htmltosend = htmltosend.concat('</tbody></table>');
      // res.send(html);
      var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: 'amansagarprasad2001@gmail.com',
              pass: process.env.password
          }
      });

      var mailOptions = {
          from: 'amansagarprasad2001@gmail.com',
          to: 'info@redpositive.in',
          subject: 'Sending Email using Node.js',
          html: htmltosend
      };

      transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
              console.log(error);
          } else {
              console.log('Email sent: ' + info.response);
          }
      });
      res.redirect('/');
  })


  const port = process.env.PORT || 3000;
  app.listen(port, () => {
      console.log('Listening on 3000');
  });