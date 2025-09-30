const expressApp = require("./app");
const mongoose = require("mongoose");
const config = require("./utils/config");

(async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("[db] Mongo connected");

    const port = config.PORT;
    expressApp.listen(port, () =>
      console.log(`Server running on port ${port}`),
    );
  } catch (err) {
    console.error("[db] connection error:", err);
    process.exit(1);
  }
})();
