'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import fs from 'fs';

var sendgrid = require('sendgrid')(JSON.parse(fs.readFileSync('../apis.key.json', 'utf8')).sendgrid);

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    console.log(err);
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save()
    .then(function(user) {
      var protocol = (req.secure) ? 'https://' : 'http://',
        url = protocol + req.headers.host + '/';
      sendNewUserEmail(url, req.body.email, req.body.name, user._id);
      res.writeHead(302, {
        'Location': url
      });
      res.end();
      // var token = jwt.sign({ _id: user._id }, config.secrets.session, {
      //   expiresIn: 60 * 60 * 5
      // });
      // res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Verify the user after clicking the link in the mail
 */
export function verify(req, res) {
  var userId = req.params.id,
    protocol = (req.secure) ? 'https://' : 'http://',
    url = protocol + req.headers.host + '/successfulVerification';
  return User.findById(userId).exec()
    .then(user => {
      user.isVerified = true;
      return user.save()
        .then(() => {
          res.writeHead(302, {
            'Location': url
          });
          res.end();
        })
        .catch(validationError(res));
    });
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.findById(userId).exec()
    .then(user => {
      if(!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

function sendNewUserEmail(url, email, name, id) {
  var params = {
    smtpapi: new sendgrid.smtpapi(),
    to: email,
    from: 'info@bitmeet.co',
    // subject: 'Welcome to Bitmeet',
    // html: '<b>Hello ' + name + ', </b><br><br>' +
    //  'Click on the link to complete registration : <a href="' + url + 'api/users/verify/' + id +'">' + url + 'api/users/verify/' + id +'</a>'
    subject: 'ברוכים הבאים ל-Bitmeet!',
    html: '<html lang="he" dir="rtl"><body dir="rtl"><b>שלום ' + name + ', </b><br><br>' +
      'אנא לחצו על הלינק להשלמת הרישום: <a href="' + url + 'api/users/verify/' + id + '">' + url + 'api/users/verify/' + id + '</a><br><br>' +
      'בתודה,<br>צוות Bitmeet</body></html>'
  };
  var sendEmail = new sendgrid.Email(params);
  sendgrid.send(sendEmail, function (err, json) {
    if (err) {
      return console.error(err)
    }
    console.log(json);
  });
}

function sendTokenPasswordRecoveryEmail(url, email, name, token, key) {
  var params = {
    smtpapi: new sendgrid.smtpapi(),
    to: email,
    from: 'info@bitmeet.co',
    // subject: 'Bitmeet password recovery',
    // html: '<b>Hello ' + name + ', </b><br><br>' +
    //  'You are receiving this mail because you (or someone else) have requested the reset of the password for your account.<br><br>' +
    //  'If you requested to change your password then to continue the process please press: <a href="' + url + 'api/users/verifyRecoveryPasswordToken/' + token +
    //  '">here</a> and provide these key numbers: <b>' + key + '</b><br>If you did not request this, please ignore this email and your password will remain unchanged.'
    subject: 'שיחזור סיסמת חשבון Bitmeet',
    html: '<html lang="he" dir="rtl"><body dir="rtl"><b>שלום ' + name + ', </b><br><br>' +
      'אתם מקבלים דוא"ל זה מכיוון שאתם (או מישהו אחר) ביקשתם לאפס את סיסמת חשבונכם.<br><br>' +
      'אם בקשתם לאפס את הסיסמה אנא לחצו: <a href="' + url + 'api/users/verifyRecoveryPasswordToken/' + token +
      '">כאן</a> והכניסו את הקוד הבא: <b>' + key + '</b><br>אם לא בקשתם לאפס את הסיסמה, אנא התעלמו מדוא"ל זה וסיסמתכם תשאר ללא שינוי.<br><br>' +
      'בתודה,<br>צוות Bitmeet</body></html>'
  };
  var sendEmail = new sendgrid.Email(params);
  sendgrid.send(sendEmail, function (err, json) {
    if (err) {
      return console.error(err);
    }
    console.log(json);
  });
}
