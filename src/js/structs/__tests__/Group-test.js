var fixturePath = '../../../../tests/_fixtures/acl/group-with-details.json';

jest.dontMock('underscore');
jest.dontMock('../Group');
jest.dontMock('../Item');
jest.dontMock('../List');
jest.dontMock('../User');
jest.dontMock('../UsersList');
jest.dontMock('../../utils/Util');
jest.dontMock(fixturePath);

var _ = require('underscore');
var Group = require('../Group');
var groupFixture = require(fixturePath);
var UsersList = require('../UsersList');

groupFixture.permissions = groupFixture.permissions.array;
groupFixture.users = groupFixture.users.array;

describe('Group', function () {

  beforeEach(function () {
    this.groupFixture = _.clone(groupFixture);
    this.instance = new Group(groupFixture);
  });

  describe('#getPermissions', function () {

    it('returns the permissions it was given', function () {
      expect(this.instance.getPermissions())
        .toEqual(this.groupFixture.permissions);
    });

  });

  describe('#getPermissionCount', function () {

    it('returns the number of permissions group has access to', function () {
      expect(this.instance.getPermissionCount())
        .toEqual(1);
    });

  });

  describe('#getUsers', function () {

    it('returns an instance of UsersList', function () {
      var users = this.instance.getUsers();
      expect(users instanceof UsersList).toBeTruthy();
    });

    it('returns a UsersList with the number of items we provided',
      function () {
      var users = this.instance.getUsers().getItems();
      expect(users.length)
        .toEqual(this.groupFixture.users.length);
    });

    it('returns a UsersList with the data we provided', function () {
      var users = this.instance.getUsers().getItems();
      expect(users[0].get('uid'))
        .toEqual(this.groupFixture.users[0].user.uid);
      expect(users[1].get('uid'))
        .toEqual(this.groupFixture.users[1].user.uid);
    });

  });

  describe('#getUserCount', function () {

    it('returns the number of users in group', function () {
      expect(this.instance.getUserCount())
        .toEqual(2);
    });

  });
});
