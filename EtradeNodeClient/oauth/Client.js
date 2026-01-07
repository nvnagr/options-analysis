/*
=============================================
This code is based on Andrew Smith oauth-1-client library code
with some modification
==============================================
Copyright statement from oauth-1-client code
The MIT License (MIT)

Copyright (c) Andrew Smith

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
*/

const assert = require('assert');
const OAuth = require('oauth');
const url = require('url');
const Promise = require('promise');
const debug = require('debug')('oauth-1-client');
const request = require('request');

require('extend-error');

const HttpApiError = Error.extend('HttpApiError');

const Client = function (options) {
  assert(options.key, 'Must provide API key');
  assert(options.secret, 'Must provide API secret');
  assert(options.requestUrl, 'Must provide requestUrl');
  assert(options.accessUrl, 'Must provide accessUrl');
  assert(options.apiHostName, 'Must provide apiHostName');

  this.apiKey = options.key;
  this.apiSecret = options.secret;
  this.apiHostName = options.apiHostName;

  // Note: callbackURL is optional here. Can also be provided via extraParams arg to requestToken
  this.callbackURL = options.callbackURL;

  this.oauthClient = new OAuth.OAuth(
    options.requestUrl,
    options.accessUrl,
    this.apiKey,
    this.apiSecret,
    '1.0',
    this.callbackURL,
    'HMAC-SHA1',
  );
};

function getCredentials(token, secret, required) {
  let credentials;
  if (typeof token === 'object') {
    credentials = token;
  } else {
    credentials = {
      token,
      secret,
    };
  }
  if (required) {
    assert(credentials.token, 'Must supply authentication token');
    assert(credentials.secret, 'Must supply authentication secret');
  }
  return credentials;
}

Client.prototype.auth = function (token, secret) {
  const credentials = getCredentials(token, secret);
  const self = this;
  return {
    get(path, pageOrQuery, extraParams, contentType) {
      return self.get(path, pageOrQuery, credentials, null, extraParams, contentType);
    },
    put(path, content) {
      return self.put(path, content, credentials);
    },
    post(path, content) {
      return self.post(path, content, credentials);
    },
    delete(path) {
      return self.delete(path, credentials);
    },
  };
};

// Patch the interface to allow user to set extra params and the content-type header
Client.prototype.get = function (path, pageOrQuery, token, secret, extraParams, contentType) {
  const credentials = getCredentials(token, secret);
  var contentType = (typeof contentType === 'undefined') ? 'application/json' : contentType;
  var extraParams = (typeof extraParams === 'undefined') ? null : extraParams;
  return new Promise((resolve, reject) => {
    const responseHandler = createResponseHandler(resolve, reject);
    let url;
    if (credentials.token && credentials.secret) {
      url = buildUrl(this.apiKey, this.apiSecret, this.apiHostName, path, pageOrQuery);
      if (extraParams !== null) {
        url += `?${require('querystring').stringify(extraParams)}`;
      }
      debug('GET (auth):', url);
      this.oauthClient._performSecureRequest(credentials.token, credentials.secret, 'GET', url, null, '', contentType, responseHandler);
    } else {
      url = buildUrl(this.apiKey, null, this.apiHostName, path, pageOrQuery);
      debug('GET (unauth):', url);
      request({
        uri: url,
        method: 'GET',
        headers: { 'Content-Type': contentType },
        qs: extraParams,
      }, (err, res, body) => {
        responseHandler(err, body, res);
      });
    }
  });
};

Client.prototype.put = function (path, content, token, secret) {
  const credentials = getCredentials(token, secret, true);
  const url = buildUrl(this.apiKey, this.apiSecret, this.apiHostName, path);
  return new Promise((resolve, reject) => {
    const responseHandler = createResponseHandler(resolve, reject);
    debug('PUT:', url);
    const contentType = 'application/json';
    this.oauthClient._performSecureRequest(credentials.token, credentials.secret, 'PUT', url, null, content, contentType, responseHandler);
  });
};

Client.prototype.post = function (path, content, token, secret) {
  const credentials = getCredentials(token, secret, true);
  const url = buildUrl(this.apiKey, this.apiSecret, this.apiHostName, path);
  return new Promise((resolve, reject) => {
    const responseHandler = createResponseHandler(resolve, reject);
    debug('POST:', url);
    const contentType = 'application/json';
    this.oauthClient._performSecureRequest(credentials.token, credentials.secret, 'POST', url, null, content, contentType, responseHandler);
  });
};

Client.prototype.delete = function (path, token, secret) {
  const credentials = getCredentials(token, secret, true);
  const url = buildUrl(this.apiKey, this.apiSecret, this.apiHostName, path);
  return new Promise((resolve, reject) => {
    const responseHandler = createResponseHandler(resolve, reject);
    debug('DELETE:', url);
    const contentType = 'application/json';
    this.oauthClient._performSecureRequest(credentials.token, credentials.secret, 'DELETE', url, null, content, contentType, responseHandler);
  });
};

Client.prototype.requestToken = function (extraParams) {
  return new Promise((resolve, reject) => {
    this.oauthClient.getOAuthRequestToken(extraParams || {}, (err, oauthToken, oauthTokenSecret, parsedQueryString) => {
      if (err) {
        return reject(err);
      }
      resolve({
        token: oauthToken,
        tokenSecret: oauthTokenSecret,
        authorizeUrl: parsedQueryString.login_url,
        query: parsedQueryString,
      });
    });
  });
};

Client.prototype.accessToken = function (token, secret, verifier) {
  return new Promise((resolve, reject) => {
    this.oauthClient.getOAuthAccessToken(token, secret, verifier, (err, oauthAccessToken, oauthAccessTokenSecret, parsedQueryString) => {
      if (err) {
        return reject(err);
      }
      resolve({
        token: oauthAccessToken,
        tokenSecret: oauthAccessTokenSecret,
        query: parsedQueryString,
      });
    });
  });
};

function createResponseHandler(resolve, reject) {
  return function responseHandler(err, data, res) {
    if (err) {
      // patch the error returned from oauth lib to add headers (can include important info like request IDs)
      if (res && res.headers) {
        err.headers = res.headers;
      }
      return reject(err);
    }
    if (res.statusCode.toString()[0] !== '2') {
      return reject(new HttpApiError({ statusCode: res.statusCode, body: data }));
    }
    if (typeof data === 'string') {
      try {
        const parsedBody = JSON.parse(data || '{}');
        resolve({
          statusCode: res.statusCode,
          body: parsedBody,
          headers: res.headers,
        });
      } catch (err) {
        reject(`Error parsing JSON response from API. Error:${err}`);
      }
    }
  };
}

function buildUrl(apiKey, apiSecret, apiHostName, path, pageOrQuery) {
  if (apiHostName === null) {
    throw new Error('Must provide apiHostName');
  }
  if (path === null) {
    throw new Error('Must provide a path');
  }
  const query = (pageOrQuery && typeof pageOrQuery === 'object')
    ? pageOrQuery
    : {};
  if (apiKey && !apiSecret) {
    query.api_key = apiKey;
  }
  return url.format({
    protocol: 'https:',
    hostname: apiHostName,
    pathname: path,
    query,
  });
}

module.exports = Client;
