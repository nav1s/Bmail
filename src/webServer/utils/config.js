require("dotenv").config({ path: ".env.prod" });

const PORT = process.env.PORT;

const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

const BLOOM_FILTER_HOST = process.env.BLOOM_FILTER_HOST;
const BLOOM_FILTER_PORT = process.env.BLOOM_FILTER_PORT;

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  MONGODB_URI,
  PORT,
  BLOOM_FILTER_HOST,
  BLOOM_FILTER_PORT,
  JWT_SECRET,
};
