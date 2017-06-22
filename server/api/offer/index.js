'use strict';

import * as auth from '../../auth/auth.service'
var express = require('express');
var controller = require('./offer.controller');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/getSortedOffers/:position/:lat/:lng', controller.getSortedOffers);
router.get('/getSortedOffers/:position/:lat/:lng/:radius', controller.getSortedOffers);
router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.upsert);
router.patch('/:id', auth.isAuthenticated(), controller.patch);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
