
require("dotenv").config();

const app = require("./src/index");

const PORT = process.env.PORT || 3000;

const logger = require('./src/config/logger');
logger.info({ event: 'server.start', message: `Server running on port ${PORT}` });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});