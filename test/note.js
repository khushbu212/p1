import test from 'ava';
import request from 'supertest';
import app from '../app';

test('Get list of notes', async (t) => {
  const noteToCreate = { title: 'Title', body: 'Body' }; // same as axios.post....

  const creation = await request(app) // same as axios.post.... supertest lib syntax
    .post('/note')
    .send(noteToCreate);

  const res = await request(app) // get the list of notes - get the results to test - check the db
    .get('/note');

  t.is(res.status, 200); // check if this test is successfull
  t.true(Array.isArray(res.body), 'Body should be an array');
  t.true(res.body.length > 0); // there should be at least 1 note
});

test('Create new note', async (t) => {
  const noteToCreate = { title: 'Title1', body: 'Body1' };

  const res = await request(app) // calls the backend api -
  // creates a record in mongodb then api returns the created note
    .post('/note')
    .send(noteToCreate);

  t.is(res.status, 200);
  t.is(res.body.title, noteToCreate.title); // check the fields -
  // is title matching w/ the note that I create
  t.is(res.body.body, noteToCreate.body);
});

test('Get details of a note', async (t) => {
  t.plan(2);

  const note = (await request(app)
    .post('/note')
    .send({ title: 'Title2', body: 'Body2' }))
    .body;

  const show = await request(app)
    .get(`/note/${note.id}/json`);

  t.is(show.status, 200);
  t.deepEqual(show.body, note); // body of the response(note)
  // should exactly match the note that I created before
});

test('Delete a note', async (t) => {
  t.plan(3); // 3 assertions to complete the test. very useful for async operations

  const note = (await request(app)
    .post('/note')
    .send({ title: 'Title3', body: 'Body3' }))
    .body;

  const del = await request(app)
    .delete(`/note/${note.id}`);

  t.is(del.status, 200);
  t.is(del.text, 'Note Deleted!');

  const show = await request(app)
    .get(`/note/${note.id}/json`); // try to find again, if note is not there, code should work

  t.is(show.status, 404);
});

test('Add to-do List', async (t) => {
  const note = (await request(app)
    .post('/note')
    .send({ title: 'Title4', body: 'Body4' }))
    .body;

  const toDoList = (await request(app)
    .post('/note')
    .send({ title: 'Title5', body: 'Body5' }))
    .body;

  const addToDoList = (await request(app)
    .post(`/note/${note.id}/todo`)
    .send({ todoId: toDoList.id }));

  const updatedNote = (await request(app)
    .get(`/note/${note.id}/json`))
    .body;

  t.deepEqual(updatedNote.todo[0], toDoList);
});

test('Show notes', async (t) => {
  const note = (await request(app)
    .post('/note/notes')
    .send({ title: 'Title9', body: 'Body9' }));

  const show = await request(app)
    .get('/note/notes');

  t.is(show.status, 200);
});

test('Show detail', async (t) => {
  const note = (await request(app)
    .post('/note')
    .send({ title: 'Title10', body: 'Body10' }))
    .body;

  const show = await request(app)
    .get(`/note/${note.id}`);

  t.is(show.status, 200);
});

test('Index', async (t) => {
  const show = await request(app)
    .get('/');

  t.is(show.status, 200);
});
app.get('/', (req, res, next) => {
  res.render('index');
});
