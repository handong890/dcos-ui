jest.dontMock("../ACLAuthStore");
jest.dontMock("../../config/Config");
jest.dontMock("../../events/AppDispatcher");
jest.dontMock("../../events/ACLAuthActions");
jest.dontMock("../../constants/EventTypes");
jest.dontMock("../../utils/RequestUtil");
jest.dontMock("../../utils/Store");
jest.dontMock("../../utils/Util");

var cookie = require("cookie");

var ACLAuthStore = require("../ACLAuthStore");
var EventTypes = require("../../constants/EventTypes");
var RequestUtil = require("../../utils/RequestUtil");
const USER_COOKIE_KEY = "ACLMetadata";

/* eslint-disable */
// atob polyfill from https://github.com/davidchambers/Base64.js
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
global.atob || (
  global.atob = function (input) {
    var str = String(input).replace(/=+$/, '');
    if (str.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = str.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  }
);
/* eslint-enable */

describe("ACLAuthStore", function () {

  beforeEach(function () {
    this.cookieParse = cookie.parse;
  });

  afterEach(function () {
    cookie.parse = this.cookieParse;
  });

  describe("#isLoggedIn", function () {
    it("returns false if there is no cookie set", function () {
      cookie.parse = function () {
        var cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = "";
        return cookieObj;
      };
      expect(ACLAuthStore.isLoggedIn()).toEqual(false);
    });

    it("returns true if there is a cookie set", function () {
      cookie.parse = function () {
        var cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = "aRandomCode";
        return cookieObj;
      };
      expect(ACLAuthStore.isLoggedIn()).toEqual(true);
    });
  });

  describe("#logout", function () {
    beforeEach(function () {
      this.document = global.document;
      cookie.serialize = jasmine.createSpy();
      global.document = {cookie: ""};
      ACLAuthStore.emit = jasmine.createSpy();
      ACLAuthStore.logout();
    });

    afterEach(function () {
      global.document = this.document;
    });

    it("should set the cookie to an empty string", function () {
      var args = cookie.serialize.mostRecentCall.args;

      expect(args[0]).toEqual(USER_COOKIE_KEY);
      expect(args[1]).toEqual("");
    });

    it("should emit a logout event", function () {
      var args = ACLAuthStore.emit.mostRecentCall.args;

      expect(args[0]).toEqual(EventTypes.ACL_AUTH_USER_LOGOUT);
    });
  });

  describe("#login", function () {
    it("should make a request to login", function () {
      RequestUtil.json = jasmine.createSpy();
      ACLAuthStore.login({});

      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });

  describe("#getUser", function () {
    cookie.parse = function () {
      var cookieObj = {};
      // {description: "John Doe"}
      cookieObj[USER_COOKIE_KEY] = "eyJkZXNjcmlwdGlvbiI6IkpvaG4gRG9lIn0=";
      return cookieObj;
    };

    expect(ACLAuthStore.getUser()).toEqual({description: "John Doe"});
  });
});
