const fetch = require('node-fetch');
const config = require('../../config');
const cacheHelper = require('./cacheHelper');

const util = {

  getStationInfo: async (stationCode, noCache) => {
    let rawInfo;
    stationCode = `${stationCode.toUpperCase()}`;

    // Checking cache for the data
    if (noCache !== 1) {
      rawInfo = await cacheHelper.get(stationCode);
    }

    // Fetching live data for the station
    if (!rawInfo) {
      rawInfo = await util.getLiveStationInfo(stationCode);
    }

    // Processor function to process the raw station data
    return util.parseStationInfo(rawInfo, stationCode);
  },

  getLiveStationInfo: async (stationCode) => {
    stationCode = `${stationCode.toUpperCase()}`;
    let rawInfo = '';
    const response = await util.sendRequest(`${config.METAR_INFO_URL}${stationCode}.TXT`, 'GET');

    if (response.status === 404) {
      throw 'Invalid Station Code';
    } else if (response.status === 200) {
      rawInfo = await response.text();
    }

    // Updating the cache layer redis with the live data and setting its expiry for 300 seconds
    await cacheHelper.set(stationCode, rawInfo);
    await cacheHelper.setTtl(stationCode, 300);

    return rawInfo;
  },

  parseStationInfo: (rawInfo, station) => {
    station = station.toUpperCase();
    let data = { station };

    if (typeof rawInfo !== 'string') {
      throw 'Invalid Station Data';
    }

    const infoArr = rawInfo.split('\n');
    data.last_observation_at = util.getUtcDateString(infoArr[0]);
    data.wind = util.getWindDirectionAndSpeed(infoArr[1]);
    data = { ...data, ...util.getTemperatureAndDewPoint(infoArr[1]) };

    return data;
  },

  getWindDirectionAndSpeed: (rawInfo) => {
    const raw = rawInfo.split(' ');
    const directionAndSpeed = rawInfo.indexOf('AUTO') > 0 ? raw[3] : raw[2];

    const direction = util.getDirection(directionAndSpeed.substring(0, 3));
    const { speed, gust } = util.getSpeed(directionAndSpeed.substring(3));

    return { direction, speed, gust };
  },

  getUtcDateString: (rawDate) => {
    rawDate = rawDate.split(' ');
    const dateOnly = rawDate[0].split('/');
    const timeOnly = rawDate[1].split(':');
    return new Date(Date.UTC(dateOnly[0], dateOnly[1], dateOnly[2], timeOnly[0], timeOnly[1]));
  },

  getTemperatureAndDewPoint: (rawInfo) => {
    const raw = rawInfo.split(' ');
    const data = { temperature: '', dew_point: {} };

    for (const element of raw) {
      const matches = element.match(/^(M?\d+)\/(M?\d+)$/);
      if (matches) {
        data.temperature = matches[1].replace('M', '-');
        data.dew_point = matches[2].replace('M', '-');

        data.temperature = `${data.temperature}\u00B0 C (${util.convertCelsiusToFahrenheit(data.temperature)})`;
        data.dew_point = `${data.dew_point}\u00B0 C (${util.convertCelsiusToFahrenheit(data.dew_point)})`;
        break;
      }
    }

    return data;
  },

  getSpeed: (rawSpeed) => {
    const data = {};
    if (!rawSpeed) return '';

    const speedInKnots = rawSpeed.substring(0, 2);

    data.speed = `${util.knotsToMiles(speedInKnots)} mph (${speedInKnots} knots)`;

    if (rawSpeed.indexOf('G') > 0) {
      const gustInKnots = rawSpeed.substring(rawSpeed.indexOf('G') + 1, rawSpeed.indexOf('K'));
      data.gust = `${util.knotsToMiles(gustInKnots)} mph (${gustInKnots} knots)`;
    }

    return data;
  },

  getDirection: (degree) => {
    degree = -parseInt(degree);
    if (isNaN(degree)) return '';

    const directions = ['North', 'North-West', 'West', 'South-West', 'South', 'South-East', 'East', 'North-East'];
    return directions[Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8];
  },

  knotsToMiles: (speedInKnots) => {
    return (parseInt(speedInKnots) * 1.15078).toFixed(4);
  },

  convertCelsiusToFahrenheit: (celsius) => {
    return (Number(celsius) * 1.8 + 32).toFixed(2);
  },

  sendRequest: async (endPoint, methodType, params) => {
    const requestTypes = ['GET', 'POST', 'PUT'], options = {};

    if (requestTypes.includes(methodType)) {
      options.method = methodType;

      options.headers = { "Content-Type": "application/json" };

      if (methodType === 'GET' && params) {
        endPoint = `${endPoint}?${new URLSearchParams(params)}`;
      } else if (['POST', 'PUT'].includes(methodType) && params) {
        options.body = JSON.stringify(params);
      }

      return fetch(endPoint, options);
    }
  },
};

module.exports = util;
