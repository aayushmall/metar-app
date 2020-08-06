const redis = require("redis");
const { promisify } = require("util");
const config = require("../../config");

let client;

if (config.REDIS_HOST) {
  client = redis.createClient({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT
  });

  client.on("connect", () => {
    // eslint-disable-next-line no-console
    console.log("Redis connected on default port 6379!");
  });

  client.on("error", (error) => {
    // eslint-disable-next-line no-console
    console.log(error);
  });
}
