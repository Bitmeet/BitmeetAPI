/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/offers              ->  index
 * POST    /api/offers              ->  create
 * GET     /api/offers/:id          ->  show
 * PUT     /api/offers/:id          ->  upsert
 * PATCH   /api/offers/:id          ->  patch
 * DELETE  /api/offers/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Offer from './offer.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Offers
export function index(req, res) {
  return Offer.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getSortedOffers(req, res) {
  return Offer.find({
      position: req.params.position,
      active: true
    }).exec()
    .then((offers) => {
      return offers
        .filter(function(offer) {
          return offer.location && (offer.location.lat || offer.location.lat === 0) && (offer.location.lng || offer.location.lng === 0) ? req.params.radius ?
            getDistanceFromLatLonInKm(
              offer.location.lat,
              offer.location.lng,
              parseFloat(req.params.lat),
              parseFloat(req.params.lng)) * 1000 <= Math.min(parseFloat(req.params.radius), offer.location.radius || 6371000)
            : (offer.location.radius || offer.location.radius === 0 ? 
              getDistanceFromLatLonInKm(
              offer.location.lat,
              offer.location.lng,
              parseFloat(req.params.lat),
              parseFloat(req.params.lng)) * 1000 <= offer.location.radius : true) : false;
        })
        .sort(function(offerA, offerB) {
          return getDistanceFromLatLonInKm(
            offerA.location.lat,
            offerA.location.lng,
            parseFloat(req.params.lat),
            parseFloat(req.params.lng)) >=
          getDistanceFromLatLonInKm(
            offerB.location.lat,
            offerB.location.lng,
            parseFloat(req.params.lat),
            parseFloat(req.params.lng));
        });
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Offer from the DB
export function show(req, res) {
  return Offer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Offer in the DB
export function create(req, res) {
  return Offer.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Offer in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Offer.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Offer in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Offer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Offer from the DB
export function destroy(req, res) {
  return Offer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1); 
  var a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}