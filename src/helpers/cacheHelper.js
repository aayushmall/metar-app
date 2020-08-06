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

const setTtl = (key, ttl) => {
  if (!client) return;

  const expireAsync = promisify(client.expire).bind(client);
  return expireAsync(key, ttl);
};

const set = (key, value) => {
  if (!client) return;

  const setAsync = promisify(client.set).bind(client);
  return setAsync(key, value);
};

const get = (key) => {
  if (!client) return;

  const getAsync = promisify(client.get).bind(client);
  return getAsync(key);
};

module.exports = {
  set,
  setTtl,
  get
};

