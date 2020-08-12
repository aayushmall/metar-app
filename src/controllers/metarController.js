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

  /**
    Type: {Get}
    Path: /metar/info
    Description: Returns the station Metar Weather info

    Param {String} scode Four character Station Code Ex(KSGS, KHUL, FMIR, DAMH)
    Param {Integer} nocache Value should be 1 if need live data

    Example {json} Request:
      {
        "scode": "FMIR",
        "nocache": 1
      }

    Success Response: {json}
      HTTP 200 OK
      {
        "data": {
          "station": "KSGS",
          "last_observation_at": "2020-09-12T18:15:00.000Z",
          "wind": {
            "direction": "South-East",
            "speed": "13.8094 mph (12 knots)",
            "gust": "24.1664 mph (21 knots)"
          },
          "temperature": "19° C (66.20)",
          "dew_point": "18° C (64.40)"
        }
      }

    Error Example: {json}
      HTTP 400 Error
      {
        "error": "Invalid Station Code"
      }
  */

  async getWeatherInfo(req, res, next) {
    try {
      let stationCode = req.query.scode;
      if (!(stationCode && stationCode.length >= 4)) {
        throw 'Invalid Station Code';
      }
      stationCode = stationCode.toUpperCase();

      // Storing response data locally to be used by next middleware for sending response
      res.locals.data = await util.getStationInfo(stationCode, parseInt(req.query.nocache));
      next();
    } catch (error) {
      next(error);
    }
  }
};
