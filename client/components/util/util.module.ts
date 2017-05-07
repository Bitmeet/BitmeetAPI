'use strict';
const angular = require('angular');
import {UtilService} from './util.service';

export default angular.module('bitmeetApiApp.util', [])
  .factory('Util', UtilService)
  .name;
