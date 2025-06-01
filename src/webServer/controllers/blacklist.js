const { created, serverError, badRequest, noContent, notFound } = require("../utils/httpResponses");
const net = require("net");

/**
 * This function handles the addition of a URL to the blacklist.
 * @param req the request object containing the URL to be blacklisted
 * @param res the response object used to send the response back to the client
 */
exports.addToBlacklist = (req, res) => {
    console.log('Received request to add URL to blacklist:', req.body);
    // check if the request has the required parameters
    if (!req.body || !req.body.url) {
        console.error('Missing fields in request body:', req.body);
        return badRequest(res, 'Missing fields: url');
    }

    const url = req.body.url;

    // create a TCP client to connect to the server
    const client = net.createConnection({ port: 12345 }, () => {
        console.log('Connected to server');
        // send the request to add the URL to the blacklist
        client.write(`POST ${url}\n`);

        console.log(`Request sent to add URL: ${url}`);
    });

    // handle the response from the server
    client.on('data', (data) => {
        console.log('Received data from server:', data.toString());

        // check if the response indicates success
        if (data.toString() === '201 Created') {
            console.log('Successfully added to blacklist');
            return created(res);
        }

        // otherwise, return an error
        return serverError(res, 'unexpected response from server');
    });

    // return a server error if the connection ends unexpectedly
    client.on('end', () => {
        console.error('disconnected from server');
        return serverError(res, 'disconnected from server');
    });

    // return a server error if there is an error connecting to the server
    client.on('error', (error) => {
        console.error('error connecting to server:', error);
        return serverError(res, 'error connecting to server');
    });
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

    // create a TCP client to connect to the server
    const client = net.createConnection({ port: 12345 }, () => {
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
            return noContent(res);
        }

        // check if the response indicates that the URL was not found
        if (data.toString() === '404 Not Found') {
            console.log('URL not found in blacklist');
            return notFound(res, 'URL not found in blacklist');
        }

        // otherwise, return an error
        return serverError(res, 'unexpected response from server');
    });

    // return a server error if the connection ends unexpectedly
    client.on('end', () => {
        console.error('disconnected from server');
        return serverError(res, 'disconnected from server');
    });

    // return a server error if there is an error connecting to the server
    client.on('error', (error) => {
        console.error('error connecting to server:', error);
        return serverError(res, 'error connecting to server');
    });

}