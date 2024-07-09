import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const filePath = path.join(__dirname, 'data', 'write.json');

// body parser set
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine set
app.set('view engine', 'html');

// nunjucks
nunjucks.configure('views', {
  watch: true,
  express: app,
});

// mongoose connect
mongoose
  .connect('mongodb://127.0.0.1:27017')
  .then(() => console.log('DB 연결 성공'))
  .catch((e) => console.error(e));

// mongoose set
const { Schema } = mongoose;
const writingSchema = new Schema({
  title: String,
  contents: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Writing = mongoose.model('writing', writingSchema);

// main page GET
app.get('/', async (req, res) => {
  try {
    const writings = await Writing.find({});
    res.render('main', { list: writings });
  } catch (e) {
    console.error(e);
    res.status(500).send('서버 오류');
  }
});

app.get('/write', (req, res) => {
  res.render('write', { detail: {} });
});

app.post('/write', async (req, res) => {
  const { title, contents } = req.body;

  const writing = new Writing({ title, contents });

  try {
    const result = await writing.save();
    console.log('Success');
    res.redirect(`/detail/${result._id}`);
  } catch (e) {
    console.error(e);
    res.render('write', { detail: {} });
  }
});

app.get('/detail/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const writing = await Writing.findById(id);
    if (writing) {
      res.render('detail', {
        detail: writing,
      });
    } else {
      res.send('해당 글을 찾을 수 없습니다.');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('서버 오류');
  }
});

app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const writing = await Writing.findById(id);
    if (writing) {
      res.render('edit', { edit: writing });
    } else {
      res.send('해당 글을 찾을 수 없습니다.');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('서버 오류');
  }
});

app.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const { title, contents } = req.body;

  try {
    const writing = await Writing.findByIdAndUpdate(
      id,
      { title, contents },
      { new: true }
    );
    if (writing) {
      res.redirect(`/detail/${writing._id}`);
    } else {
      res.send('해당 글을 찾을 수 없습니다.');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('서버 오류');
  }
});

app.post('/delete/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await Writing.findByIdAndDelete(id);
    if (result) {
      res.redirect('/');
      console.log('success delete');
    } else {
      res.send('해당 글을 찾을 수 없습니다.');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('서버 오류');
  }
});

app.listen(3000, () => {
  console.log('Server is running');
});
