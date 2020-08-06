const Metar = require('../src/controllers/metarController');

const metar = new Metar();

module.exports = (app) => {
  app.get('/metar/ping', (req, res, next) => metar.ping(req, res, next));
  app.get('/metar/info', (req, res, next) => metar.getWeatherInfo(req, res, next));
};
