const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const config = require("../utils/config");
const User = require("../models/usersModel");
const Mail = require("../models/mailsModel");
const { Label } = require("../models/labelsModel");
const supertest = require("supertest");
const app = require("../app");
const assert = require("node:assert/strict");

const api = supertest(app);

before (async () => {
  console.log("Setting up test database...");
  await mongoose.connect(config.MONGODB_URI);
  await User.deleteMany({});
  await Mail.deleteMany({});
  await Label.deleteMany({});
  console.log("Test database setup complete.");
});

test("Set up users", async () => {
  let res = await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "Securep12!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)
  let location = res.header.location;

  let response = await api
    .get(location)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body.firstName, "Alice");
  assert.deepStrictEqual(response.body.lastName, "Test");
  assert.deepStrictEqual(response.body.username, "alice123");

  // Get the token for the user
  let loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'alice123', password: 'Securep12!' })
    .expect(201)

  aliceToken = loginResponse.body.token;

  res = await api
    .post('/api/users')
    .send({
      firstName: "bob",
      lastName: "smith",
      username: "bob",
      password: "Imthebobyboten12!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)

  location = res.header.location;

  response = await api
    .get(location)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  assert.deepStrictEqual(response.body.firstName, "bob");
  assert.deepStrictEqual(response.body.lastName, "smith");
  assert.deepStrictEqual(response.body.username, "bob");

  loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'bob', password: 'Imthebobyboten12!' })
    .expect(201)
  bobToken = loginResponse.body.token;

  res = await api
    .post('/api/users')
    .send({
      firstName: "Carlo",
      lastName: "Ancelotti",
      username: "carlo123",
      password: "WeWinChampions12!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)

  location = res.header.location;

  response = await api
    .get(location)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body.firstName, "Carlo");
  assert.deepStrictEqual(response.body.lastName, "Ancelotti");
  assert.deepStrictEqual(response.body.username, "carlo123");

  loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'carlo123', password: 'WeWinChampions12!' })
    .expect(201)
  carloToken = loginResponse.body.token;
  console.log("tokens:", { aliceToken, bobToken, carloToken });

});

after(async () => {
  await mongoose.connection.close();
});
