const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const config = require("../utils/config");
const User = require("../models/usersModel");
const Mail = require("../models/mailsModel");
const { Label } = require("../models/labelsModel");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

before(async () => {
  await mongoose.connect(config.MONGODB_URI);
  await User.deleteMany({});
  await Mail.deleteMany({});
  await Label.deleteMany({});
});

test("full flow: user signup → login → send mail → update → delete → create label", async () => {
  // Sign up
  await api
    .post("/api/users")
    .send({
      firstName: "Alice",
      lastName: "Jordan",
      username: "aliceX",
      password: "Pass123!",
    })
    .expect(201);

  // Login
  const loginRes = await api
    .post("/api/tokens")
    .send({ username: "aliceX", password: "Pass123!" })
    .expect(201);
  const token = loginRes.body.token;

  // Create recipient user
  await api
    .post("/api/users")
    .send({
      firstName: "Bob",
      lastName: "Test",
      username: "bobX",
      password: "Pass456.",
    })
    .expect(201);

  // Send mail
  const mailRes = await api
    .post("/api/mails")
    .set("Authorization", "bearer " + token)
    .send({
      to: ["bobX@bmail.com"],
      title: "Hello Bob",
      body: "Let's meet",
    })
    .expect(201)
    .catch((err) => {
      console.error("Mail send failed:", err.response?.body || err);
      throw err;
    });

  const mailId = mailRes.body.id;

  // Delete mail
  await api
    .delete(`/api/mails/${mailId}`)
    .set("Authorization", "bearer " + token)
    .expect(204);

  // Create label
  const labelRes = await api
    .post("/api/labels")
    .set("Authorization", "bearer " + token)
    .send({ name: "Work" })
    .expect(201);

  // Delete label
  await api
    .delete(`/api/labels/${labelRes.body.id}`)
    .set("Authorization", "bearer " + token)
    .expect(204);
});

after(async () => {
  await mongoose.connection.close();
});
