import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import bodyParser from 'body-parser';
import fs from 'fs';
import mongoose from 'mongoose';

import { fileURLToPath } from 'url';
import { type } from 'os';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const filePath = path.join(__dirname, 'data', 'write.json');

// body parser set
app.use(bodyParser.urlencoded({ extended: false })); // express 기본 모듈 사용
app.use(bodyParser.json());

// view engine set
app.set('view engine', 'html'); // main.html -> main(.html)

// nunjucks
nunjucks.configure('views', {
  watch: true, // html 파일이 수정될 경우, 다시 반영 후 렌더링
  express: app,
});

//mongoose connect
mongoose
  .connect('mongodb://127.0.0.1:27017')
  .then(() => console.log('DB 연결 성공'))
  .catch(() => console.error(e));

//mongoose set
const { Schema } = mongoose;
const writingSchema = new Schema({
  title: String,
  contents: String,
  date: {
    type: Date,
    default: Date.now(),
  },
});

const Writing = mongoose.model('writing', writingSchema);

// middleware
// main page GET
app.get('/', async (req, res) => {
  let writings = await Writing.find({});
  //변수에 값이 추가되어야 하기 때문에 const 가 아닌 let
  res.render('main', { list: writings });
});

app.get('/write', (req, res) => {
  res.render('write');
});

app.post('/write', async (req, res) => {
  const { title, contents } = req.body;

  const writing = new Writing({ title, contents });

  try {
    const result = await writing.save();
    console.log('Success');
    res.redirect(`/detail/${result._id}`); // 저장된 글의 ID를 사용하여 상세 페이지로 리디렉션
  } catch (e) {
    console.error(e);
    res.render('write');
  }
});

app.get('/detail/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const writing = await Writing.findById(id);
    if (writing) {
      res.render('detail', {
        title: writing.title,
        contents: writing.contents,
      });
    } else {
      res.send('해당 글을 찾을 수 없습니다.');
    }
  } catch (e) {
    console.error(e);
    res.send('오류가 발생했습니다.');
  }
});

app.listen(3000, () => {
  console.log('Server is running');
});
