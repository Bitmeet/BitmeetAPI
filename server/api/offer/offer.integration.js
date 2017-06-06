'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOffer;

describe('Offer API:', function() {
  describe('GET /api/offers', function() {
    var offers;

    beforeEach(function(done) {
      request(app)
        .get('/api/offers')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          offers = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(offers).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/offers', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/offers')
        .send({
          name: 'New Offer',
          info: 'This is the brand new offer!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOffer = res.body;
          done();
        });
    });

    it('should respond with the newly created offer', function() {
      expect(newOffer.name).to.equal('New Offer');
      expect(newOffer.info).to.equal('This is the brand new offer!!!');
    });
  });

  describe('GET /api/offers/:id', function() {
    var offer;

    beforeEach(function(done) {
      request(app)
        .get(`/api/offers/${newOffer._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          offer = res.body;
          done();
        });
    });

    afterEach(function() {
      offer = {};
    });

    it('should respond with the requested offer', function() {
      expect(offer.name).to.equal('New Offer');
      expect(offer.info).to.equal('This is the brand new offer!!!');
    });
  });

  describe('PUT /api/offers/:id', function() {
    var updatedOffer;

    beforeEach(function(done) {
      request(app)
        .put(`/api/offers/${newOffer._id}`)
        .send({
          name: 'Updated Offer',
          info: 'This is the updated offer!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOffer = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOffer = {};
    });

    it('should respond with the updated offer', function() {
      expect(updatedOffer.name).to.equal('Updated Offer');
      expect(updatedOffer.info).to.equal('This is the updated offer!!!');
    });

    it('should respond with the updated offer on a subsequent GET', function(done) {
      request(app)
        .get(`/api/offers/${newOffer._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let offer = res.body;

          expect(offer.name).to.equal('Updated Offer');
          expect(offer.info).to.equal('This is the updated offer!!!');

          done();
        });
    });
  });

  describe('PATCH /api/offers/:id', function() {
    var patchedOffer;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/offers/${newOffer._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Offer' },
          { op: 'replace', path: '/info', value: 'This is the patched offer!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOffer = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOffer = {};
    });

    it('should respond with the patched offer', function() {
      expect(patchedOffer.name).to.equal('Patched Offer');
      expect(patchedOffer.info).to.equal('This is the patched offer!!!');
    });
  });

  describe('DELETE /api/offers/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/offers/${newOffer._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when offer does not exist', function(done) {
      request(app)
        .delete(`/api/offers/${newOffer._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
