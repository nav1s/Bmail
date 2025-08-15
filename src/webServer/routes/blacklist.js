const express = require("express");
const router = express.Router();
const blacklistController = require("../controllers/blacklist");
const { requireAuth } = require("../middleware/auth");

// POST /api/blacklist → adds a list of urls to the blacklist
router.post("/", requireAuth, blacklistController.addToBlacklist);

// DELETE /api/blacklist/:id → removes a list of urls from the blacklist
router.delete("/:id", requireAuth, blacklistController.removeFromBlacklist);

module.exports = router;
