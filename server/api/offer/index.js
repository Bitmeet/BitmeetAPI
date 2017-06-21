'use strict';

var express = require('express');
var controller = require('./offer.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/getSortedOffers/:position/:lat/:lng', controller.getSortedOffers);
router.get('/getSortedOffers/:position/:lat/:lng/:radius', controller.getSortedOffers);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
