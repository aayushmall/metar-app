const fetch = require('node-fetch');
const config = require('../../config');
const cacheHelper = require('./cacheHelper');

const util = {

  getStationInfo: async (stationCode, noCache) => {
    let result;
    stationCode = `${stationCode.toUpperCase()}`;

    if (noCache !== 1) {
      result = await cacheHelper.get(stationCode);
      result = JSON.parse(result);
    }

    if (!result) {
      result = util.getLiveStationInfo(stationCode);
    }

    return result;
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

    const result = util.parseStationInfo(rawInfo, stationCode);
    await cacheHelper.set(stationCode, JSON.stringify(result));
    await cacheHelper.setTtl(stationCode, 300);

    return result;
  },

  parseStationInfo: (rawInfo, station) => {
    station = station.toUpperCase();
    const data = { station };

    const infoArr = rawInfo.split('\n');
    data.last_observation_at = util.getUtcDateString(infoArr[0]);
    data.wind = util.getWindDirectionAndSpeed(infoArr[1]);

    return data;
  },

  getWindDirectionAndSpeed: (rawInfo) => {
    const raw = rawInfo.split(' ');
    const directionAndSpeed = rawInfo.indexOf('AUTO') > 0 ? raw[3] : raw[2];

    const direction = util.getDirection(directionAndSpeed.substring(0, 3));
    const { speed, gust } = util.getSpeed(directionAndSpeed.substring(3));

    return { direction, speed, gust };
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

  getUtcDateString: (rawDate) => {
    rawDate = rawDate.split(' ');
    const dateOnly = rawDate[0].split('/');
    const timeOnly = rawDate[1].split(':');
    return new Date(Date.UTC(dateOnly[0], dateOnly[1], dateOnly[2], timeOnly[0], timeOnly[1]));
  },

  knotsToMiles: (speedInKnots) => {
    return (parseInt(speedInKnots) * 1.15078).toFixed(4);
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
