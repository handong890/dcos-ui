import _ from 'underscore';

import HealthSorting from '../constants/HealthSorting';
import UnitHealthStatus from '../constants/UnitHealthStatus';
import Util from '../utils/Util';

const UnitHealthUtil = {

  // Gets the HealthSorting weight of a Node or HealthUnit
  getHealthSorting(item) {
    return HealthSorting[item.getHealth().title.toUpperCase()];
  },

  /**
   * Get UnitHealthStatus object representing the health of an Item
   * @param {Number} health - The health integer from Component Health API.
   * @return {Object}       - UnitHealthStatus object.
   */
  getHealth(health) {
    let healthKey = Util.find(Object.keys(UnitHealthStatus), function (key) {
      return (UnitHealthStatus[key].value === health);
    });

    return UnitHealthStatus[healthKey] || UnitHealthStatus.NA;
  },

  /**
   * Filter a List by UnitHealth.
   * @param {Array}  items  - Array of Nodes or HealthUnits to be filtered.
   * @param {String} health - Health title to filter by.
   * @return {Array}        - Array of filtered objects.
   */
  filterByHealth(items, health) {
    health = health.toLowerCase();

    if (health === 'all') {
      return items;
    }

    return _.filter(items, function (datum) {
      return datum.getHealth().title.toLowerCase() === health;
    });
  }

};

module.exports = UnitHealthUtil;
