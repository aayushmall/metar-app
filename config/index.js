/**
 * Config variable for the app
 * REDIS_HOST - Hostname for the redis server
 * REDIS_PORT - Port Number for the redis server
 * METAR_INFO_URL - METAR URL to get the live data from
 */

module.exports = {
  PORT: 3000,
  REDIS_HOST: '127.0.0.1',
  REDIS_PORT: 6379,
  METAR_INFO_URL: "https://tgftp.nws.noaa.gov/data/observations/metar/stations/"
};
