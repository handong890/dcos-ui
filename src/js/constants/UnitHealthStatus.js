/**
 * Values for health rate defined in the server
 */
const SERVER_HEALTHY = 0;
const SERVER_UNHEALTHY = 1;
const SERVER_WARN = 2;
const SERVER_NA = 3;

const UnitHealthStatus = {
  [SERVER_HEALTHY]: {
    title: 'Healthy',
    key: 'HEALTHY',
    classNames: 'text-success',
    sortingValue: 3,
    value: 0
  },
  [SERVER_UNHEALTHY]: {
    title: 'Unhealthy',
    key: 'UNHEALTHY',
    classNames: 'text-danger',
    sortingValue: 0,
    value: 1
  },
  [SERVER_WARN]: {
    title: 'Warning',
    key: 'WAR',
    classNames: 'text-warning',
    sortingValue: 2,
    value: 2
  },
  [SERVER_NA]: {
    title: 'N/A',
    key: 'NA',
    classNames: 'text-mute',
    sortingValue: 1,
    value: 3
  },
  NA: {
    title: 'N/A',
    key: 'NA',
    classNames: 'text-mute',
    sortingValue: 1,
    value: 3
  }
};

module.exports = UnitHealthStatus;
