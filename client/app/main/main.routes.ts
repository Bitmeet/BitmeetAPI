'use strict';

export default function routes($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/', {
      template: '<main></main>'
    })
    .when('/successfulVerification', {
      template: '<div class="container"><div class="row jumbotron"><div class="col-sm-12 text-center">Verification succeeded! You may now login with your username and password.</div><br><br><div class="col-sm-12 text-center"><a class="btn btn-default btn-lg btn-login" href="/login">Process to login page</a></div></div></div>'
    });
};

