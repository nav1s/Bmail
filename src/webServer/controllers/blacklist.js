const { serverError, badRequest } = require("../utils/httpResponses");
const net = require("net");

const BLOOM_FILTER_HOST = process.env.BLOOM_FILTER_HOST || "bloom-filter";
const BLOOM_FILTER_PORT = Number(process.env.BLOOM_FILTER_PORT || 12345);

/**
 * Add multiple URLs to the blacklist service over a TCP socket.
 * Sends one `POST <url>` per item and resolves when all are processed.
 *
 * @param {string[]} urls - List of URL strings to add.
 * @returns {Promise<boolean>} Resolves true when all URLs were added (201 for each).
 * @throws {Error} If input is missing/invalid, socket errors occur, or server replies unexpectedly.
 */
exports.addUrlsToBlacklist = async (urls) => {
  return new Promise((resolve, reject) => {
    if (!urls) {
      console.error("No URLs provided to add to blacklist");
      return reject(new Error("No URLs provided"));
    }

    if (!Array.isArray(urls)) {
      console.error("Invalid URL list provided to add to blacklist:", urls);
      return reject(new Error("Invalid URL list provided"));
    }
    if (urls.length === 0) {
      console.error("Empty URL list provided to add to blacklist");
      return resolve(true); // nothing to add, resolve as success
    }

    let urlIndex = 0;

    console.log("Received request to add URLs to blacklist:", urls);

    const client = net.createConnection(
      { host: BLOOM_FILTER_HOST, port: BLOOM_FILTER_PORT },
      () => {
        console.log("Connected to server");
        client.write(`POST ${urls[urlIndex]}\n`);
        urlIndex++;
      },
    );

    // handle the response from the server
    client.on("data", (data) => {
      console.log("Received data from server:", data.toString());

      // check if the response indicates success
      if (data.toString() !== "201 Created") {
        console.error("Unexpected response from server:", data.toString());
        client.destroy();
        return serverError(res, "unexpected response from server");
      }

      if (urlIndex >= urls.length) {
        // if all URLs have been added, end the connection
        console.log("Successfully added all URLs to blacklist");
        client.destroy();
        return resolve(true);
      }

      // if there are more URLs to add, send the next one
      client.write(`POST ${urls[urlIndex]}\n`);
      urlIndex++;
    });

    // return a server error if there is an error connecting to the server
    client.on("error", (error) => {
      console.error("error connecting to server:", error);
      return reject(error);
    });
  });
};

/**
 * Express handler to add a single URL to the blacklist.
 * Expects `{ url: string }` in the request body.
 *
 * @param {import('express').Request} req - Body must contain `url`.
 * @param {import('express').Response} res - JSON 201 on success.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for bad input; 500 on internal/server errors.
 */
exports.addToBlacklist = async (req, res) => {
  console.log("Received request to add URL to blacklist:", req.body);
  // check if the request has the required parameters
  if (!req.body || !req.body.url) {
    console.error("Missing fields in request body:", req.body);
    return badRequest(res, "Missing fields: url");
  }

  try {
    await exports.addUrlsToBlacklist([req.body.url]);
    return res
      .status(201)
      .json({ message: "Successfully added URL to blacklist" });
  } catch (error) {
    return serverError(res, error.message);
  }
};

/**
 * Remove multiple URLs from the blacklist service.
 * Sends one `DELETE <url>` per item; returns false if any were not found.
 *
 * @param {string[]} urls - List of URL strings to remove.
 * @returns {Promise<boolean>} True if all deletes returned 204, false if any 404 occurred.
 * @throws {Error} If input is missing/invalid, socket errors occur, or a reply is not recognized.
 */
exports.removeUrlsFromBlacklist = async (urls) => {
  return new Promise((resolve, reject) => {
    if (!urls) {
      console.error("No URLs provided to add to blacklist");
      return reject(new Error("No URLs provided"));
    }

    if (!Array.isArray(urls)) {
      console.error("Invalid URL list provided to add to blacklist:", urls);
      return reject(new Error("Invalid URL list provided"));
    }
    if (urls.length === 0) {
      console.error("Empty URL list provided to add to blacklist");
      return resolve(true); // nothing to add, resolve as success
    }

    let urlIndex = 0;
    let success = true;

    // log the received URLs
    console.log("Received request to remove URLs from blacklist:", urls);

    const client = net.createConnection(
      { host: BLOOM_FILTER_HOST, port: BLOOM_FILTER_PORT },
      () => {
        console.log("Connected to server");
        client.write(`DELETE ${urls[urlIndex]}\n`);
        urlIndex++;
      },
    );

    // handle the response from the server
    client.on("data", (data) => {
      console.log("Received data from server:", data.toString());

      if (data.toString() === "204 No Content") {
        console.log("Successfully removed from blacklist");
      } // check if the response indicates that the URL was not found
      else if (data.toString() === "404 Not Found") {
        console.log("URL not found in blacklist");
        success = false;
      } else {
        return reject(new Error("unexpected response from server"));
      }

      // check if all URLs have been processed
      if (urlIndex >= urls.length) {
        client.destroy();
        return resolve(success);
      }

      // write the next URL to the server
      client.write(`DELETE ${urls[urlIndex]}\n`);
      urlIndex++;
    });

    // return a server error if there is an error connecting to the server
    client.on("error", (error) => {
      console.error("error connecting to server:", error);
      return reject(error);
    });
  });
};

/**
 * Express handler to remove a single URL identified in the route.
 * Responds with 204 on success or 404 if the URL wasn’t present.
 *
 * @param {import('express').Request} req - Must include `params.id` (the URL).
 * @param {import('express').Response} res - Sends 204/404 JSON responses.
 * @returns {Promise<void>} Sends the HTTP response.
 * @throws Sends 400 for missing id; 500 for unexpected server errors.
 */
exports.removeFromBlacklist = async (req, res) => {
  if (!req.params || !req.params.id) {
    return badRequest(res, "Missing fields: id");
  }

  // save the URL to a variable
  const url = req.params.id;

  try {
    const success = await exports.removeUrlsFromBlacklist([url]);
    if (success === true) {
      return res
        .status(204)
        .json({ message: "Successfully added URL to blacklist" });
    }
    return res.status(404).json({ error: "URL not found in blacklist" });
  } catch (error) {
    console.error("Error removing URL from blacklist:", error);
    return serverError(res, error.message);
  }
};
