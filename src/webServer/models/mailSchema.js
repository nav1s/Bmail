/**
 * Schema for mail input fields.
 * - Contains only fields the user must provide
 * - `normalize: true` indicates value should be wrapped in an array
 *
 * Internal fields like `id` and `timestamp` are handled separately
 * in the buildMail() function and are not part of this schema.
 */
const mailInputSchema = {
  from:   { public: true },
  to:     { public: true, normalize: true },
  title:  { public: true },
  body:   { public: true }
};

/**
 * Validates input fields against the schema.
 * - Ensures all required fields are present
 * - Rejects any unknown fields not defined in the schema
 *
 * @param {object} input - Raw user input (e.g. from req.body)
 * @returns {{ success: true } | { success: false, error: string }}
 */
function validateMailInput(input) {
  // Extract required fields from schema
  const requiredFields = Object.keys(mailInputSchema);

  // Extract actual fields provided by user
  const inputFields = Object.keys(input);

  // Identify missing and unexpected fields
  const missing = requiredFields.filter(field => !(field in input));
  const unknown = inputFields.filter(field => !requiredFields.includes(field));

  // Reject if any required fields are missing
  if (missing.length > 0) {
    return { success: false, error: `Missing fields: ${missing.join(', ')}` };
  }

  // Reject if any unexpected fields are included
  if (unknown.length > 0) {
    return { success: false, error: `Unknown fields: ${unknown.join(', ')}` };
  }

  /* need to implement bloom filter checks
  // Reject if mail contains blacklisted URLs in title or body
  const combinedText = [input.title, input.body].join(' ');
  if (!validateBodyAndTitle(combinedText)) {
    return { success: false, error: 'Includes blacklisted URLs' };
  } */

  // Input is valid
  return { success: true };
}

/**
 * Constructs a validated mail object using the schema.
 * - Validates input against the config
 * - Injects internal fields like `id` and `timestamp`
 * - Normalizes specific fields (e.g. wraps `to` in an array)
 *
 * @param {object} input - Raw mail input from client
 * @param {number} id - Generated mail ID to assign
 * @returns {{ success: true, mail: object } | { success: false, error: string }}
 */
function buildMail(input, id) {
  // Validate fields before attempting to build mail
  const validation = validateMailInput(input);
  if (!validation.success) {
    return validation; // Forward validation error
  }

  // Construct mail object with internal fields
  const mail = {
    // Internal fields
    id,
    timestamp: new Date().toISOString()
  };

  const inputFields = Object.keys(input);

  // Parse validated input into mail object
  for (const field of inputFields) {
    const cfg = mailInputSchema[field];

    // Apply normalization if required (e.g. convert `to` into array) and add to mail fields
    if (cfg && cfg.normalize) {
      mail[field] = Array.isArray(input[field])
        ? input[field]
        : [input[field]];
    } else {
      mail[field] = input[field];
    }
  }

  return { success: true, mail };
}

/**
 * Filters a mail object to expose only public fields in the API response.
 * Includes internal public fields like id and timestamp.
 *
 * @param {object} mail - Full mail object
 * @returns {object} - Public-facing mail object
 */
function filterMailForOutput(mail) {
  const output = {};

  // Include all public fields from schema
  for (const field in mailInputSchema) {
    if (mailInputSchema[field].public && mail[field] !== undefined) {
      output[field] = mail[field];
    }
  }

  // Add internal public fields manually, can be deleted if this fields shouldnt be public
  if ('id' in mail) output.id = mail.id;
  //if ('timestamp' in mail) output.timestamp = mail.timestamp;

  return output;
}

module.exports = {
  mailInputSchema,
  validateMailInput,
  buildMail,
  filterMailForOutput
};
