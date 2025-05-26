/**
 * Builds a label object after validating input.
 *
 * @param {object} input - The input payload, expected to have a `name` string.
 * @param {number} id - The unique label ID for this user.
 * @returns {{ success: true, label: object } | { success: false, error: string }}
 */
function buildLabel(input, id) {
    // Checks label exists
  if (!input.name) {
    return { success: false, error: 'Label name is required' };
  }

  // Creates label
  const label = {
    id,
    name: input.name
  };

  return { success: true, label };
}

module.exports = { buildLabel };
