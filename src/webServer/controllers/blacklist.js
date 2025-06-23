const { serverError, badRequest } = require("../utils/httpResponses");
const net = require("net");

/**
 * @brief This function adds a list of URLs to the blacklist.
 * @param {*} urls the urls to be added to the blacklist
 * @returns promise that resolves to true if the URLs were successfully added, false otherwise
 */
exports.addUrlsToBlacklist = async (urls) => {
    return new Promise((resolve, reject) => {
        let urlIndex = 0;

        console.log('Received request to add URLs to blacklist:', urls);

        const client = net.createConnection({ host: 'bloom-filter', port: 12345 }, () => {
            console.log('Connected to server');
            client.write(`POST ${urls[urlIndex]}\n`);
            urlIndex++;
        });

        // handle the response from the server
        client.on('data', (data) => {
            console.log('Received data from server:', data.toString());

            // check if the response indicates success
            if (data.toString() !== '201 Created') {
                console.error('Unexpected response from server:', data.toString());
                client.destroy();
                return serverError(res, 'unexpected response from server');
            }

            if (urlIndex >= urls.length) {
                // if all URLs have been added, end the connection
                console.log('Successfully added all URLs to blacklist');
                client.destroy();
                return resolve(true);
            }


            // if there are more URLs to add, send the next one
            client.write(`POST ${urls[urlIndex]}\n`);
            urlIndex++;
        });

        // return a server error if there is an error connecting to the server
        client.on('error', (error) => {
            console.error('error connecting to server:', error);
            return reject(error);
        });
    });
}

/**
 * This function handles the addition of a URL to the blacklist.
 * @param req the request object containing the URL to be blacklisted
 * @param res the response object used to send the response back to the client
 */
exports.addToBlacklist = async (req, res) => {
    console.log('Received request to add URL to blacklist:', req.body);
    // check if the request has the required parameters
    if (!req.body || !req.body.url) {
        console.error('Missing fields in request body:', req.body);
        return badRequest(res, 'Missing fields: url');
    }

    try {
        await exports.addUrlsToBlacklist([req.body.url]);
        return res.status(201).json({ message: 'Successfully added URL to blacklist' });
    } catch (error) {
        return serverError(res, error.message);
    }
}

/**
 * @brief This function adds a list of URLs to the blacklist.
 * @param {*} urls the urls to be added to the blacklist
 * @returns promise that resolves to true if the URLs were successfully added, false otherwise
 */
exports.removeUrlsToBlacklist = async (urls) => {
    return new Promise((resolve, reject) => {
        let urlIndex = 0;
        let success = true;

        const client = net.createConnection({ host: 'bloom-filter', port: 12345 }, () => {
            console.log('Connected to server');
            client.write(`DELETE ${urls[urlIndex]}\n`);
            urlIndex++;
        });

        // handle the response from the server
        client.on('data', (data) => {
            console.log('Received data from server:', data.toString());

            if (data.toString() === '204 No Content') {
                console.log('Successfully removed from blacklist');
            } // check if the response indicates that the URL was not found
            else if (data.toString() === '404 Not Found') {
                console.log('URL not found in blacklist');
                success = false;
            }
            else {
                return reject(new Error('unexpected response from server'));
            }

            if (urlIndex >= urls.length) {
                client.destroy();
                return resolve(success);
            }


            // if there are more URLs to add, send the next one
            client.write(`DELETE ${urls[urlIndex]}\n`);
            urlIndex++;
        });

        // return a server error if there is an error connecting to the server
        client.on('error', (error) => {
            console.error('error connecting to server:', error);
            return reject(error);
        });
    });
}

/**
 * This function handles the removal of a URL from the blacklist.
 * @param req the request object containing the URL to be removed
 * @param res the response object used to send the response back to the client
 */
exports.removeFromBlacklist = async (req, res) => {
    // check if the request has the required parameters
    if (!req.params || !req.params.id) {
        return badRequest(res, 'Missing fields: id');
    }

    // save the URL to a variable
    const url = req.params.id;

    try {
        const success = await exports.removeUrlsToBlacklist([url]);
        if (success === true) {
            return res.status(204).json({ message: 'Successfully added URL to blacklist' });
        }
        return res.status(404).json({ error: 'URL not found in blacklist' });
    } catch (error) {
        return serverError(res, error.message);
    }
}