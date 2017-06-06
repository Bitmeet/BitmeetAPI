'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var offerCtrlStub = {
  index: 'offerCtrl.index',
  show: 'offerCtrl.show',
  create: 'offerCtrl.create',
  upsert: 'offerCtrl.upsert',
  patch: 'offerCtrl.patch',
  destroy: 'offerCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var offerIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './offer.controller': offerCtrlStub
});

describe('Offer API Router:', function() {
  it('should return an express router instance', function() {
    expect(offerIndex).to.equal(routerStub);
  });

  describe('GET /api/offers', function() {
    it('should route to offer.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'offerCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/offers/:id', function() {
    it('should route to offer.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'offerCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/offers', function() {
    it('should route to offer.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'offerCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/offers/:id', function() {
    it('should route to offer.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'offerCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/offers/:id', function() {
    it('should route to offer.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'offerCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/offers/:id', function() {
    it('should route to offer.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'offerCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
