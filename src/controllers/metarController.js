const util = require('../helpers/util');

module.exports = class MetarController {

  async ping(req, res, next) {
    try {
      res.locals.data = 'Pong';
      next();
    } catch (error) {
      next(error);
    }
  }

  async getWeatherInfo(req, res, next) {
    try {
      let stationCode = req.query.scode;
      if (!(stationCode && stationCode.length >= 4)) {
        throw 'Invalid Station Code';
      }
      stationCode = stationCode.toUpperCase();

      const rawInfo = await util.getStationInfo(stationCode);

      res.locals.data = util.parseStationInfo(rawInfo, stationCode);
      next();
    } catch (error) {
      next(error);
    }
  }
};
