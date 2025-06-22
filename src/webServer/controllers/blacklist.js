const { serverError, badRequest, noContent, notFound } = require("../utils/httpResponses");
const net = require("net");

exports.addUrlsToBlacklist = async (urls) => {
    return new Promise((resolve, reject) => {
        let urlIndex = 0;

        console.log('Received request to add URLs to blacklist:', urls);
        // check if the request has the required parameters
        if (!urls) {
            console.error('Missing or invalid fields in request body:', urls);
            return resolve(false);
        }
        if (!Array.isArray(urls)) {
            console.error('Missing or invalid fields in request body:', urls);
            return resolve(false);
        }

        if (urls.length === 0) {
            console.error('No URLs provided in request body:', urls);
            return resolve(false);
        }

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
 * This function handles the removal of a URL from the blacklist.
 * @param req the request object containing the URL to be removed
 * @param res the response object used to send the response back to the client
 */
exports.removeFromBlacklist = (req, res) => {
    // check if the request has the required parameters
    if (!req.params || !req.params.id) {
        return badRequest(res, 'Missing fields: id');
    }

    // save the URL to a variable
    const url = req.params.id;

    const client = net.createConnection({ host: 'bloom-filter', port: 12345 }, () => {
        console.log('Connected to server');
        // send the request to delete the URL from the blacklist
        client.write(`DELETE ${url}\n`);

        console.log(`Request sent to delete URL: ${url}`);
    });

    // handle the response from the server
    client.on('data', (data) => {
        console.log('Received data from server:', data.toString());

        // check if the response indicates success
        if (data.toString() === '204 No Content') {
            console.log('Successfully removed from blacklist');
            noContent(res);
        } // check if the response indicates that the URL was not found
        else if (data.toString() === '404 Not Found') {
            console.log('URL not found in blacklist');
            notFound(res, 'URL not found in blacklist');
        }  // otherwise, return an error
        else {
            return serverError(res, 'unexpected response from server');
        }

        client.destroy();
    });

    // return a server error if there is an error connecting to the server
    client.on('error', (error) => {
        console.error('error connecting to server:', error);
        serverError(res, 'error connecting to server');
    });

}