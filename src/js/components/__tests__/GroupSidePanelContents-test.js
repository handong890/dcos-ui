jest.dontMock('../SidePanelContents');
jest.dontMock('../GroupSidePanelContents');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../mixins/InternalStorageMixin');
jest.dontMock('../../mixins/TabsMixin');
jest.dontMock('../RequestErrorMsg');
jest.dontMock('../../stores/ACLGroupStore');
jest.dontMock('../../stores/MesosSummaryStore');

require('../../utils/StoreMixinConfig');

var React = require('react');
var ReactDOM = require('react-dom');

var ACLGroupStore = require('../../stores/ACLGroupStore');
var MesosSummaryStore = require('../../stores/MesosSummaryStore');
var EventTypes = require('../../constants/EventTypes');
var GroupSidePanelContents = require('../GroupSidePanelContents');
var Group = require('../../structs/Group');

var groupDetailsFixture =
  require('../../../../tests/_fixtures/acl/group-with-details.json');
groupDetailsFixture.permissions = groupDetailsFixture.permissions.array;
groupDetailsFixture.users = groupDetailsFixture.users.array;

describe('GroupSidePanelContents', function () {

  beforeEach(function () {
    this.summaryGet = MesosSummaryStore.get;
    this.groupStoreGetGroup = ACLGroupStore.getGroup;

    MesosSummaryStore.get = function (status) {
      if (status === 'statesProcessed') {
        return true;
      }
    };

    ACLGroupStore.getGroup = function (groupID) {
      if (groupID === 'unicode') {
        return new Group(groupDetailsFixture);
      }
    };
  });

  afterEach(function () {
    MesosSummaryStore.get = this.summaryGet;
    ACLGroupStore.getGroup = this.groupStoreGetGroup;

    ACLGroupStore.removeAllListeners();
    MesosSummaryStore.removeAllListeners();
  });

  describe('#render', function () {
    beforeEach(function () {
      this.container = document.createElement('div');
    });
    afterEach(function () {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('should return error message if fetch error was received', function () {
      var groupID = 'unicode';
      this.instance = ReactDOM.render(
        <GroupSidePanelContents
          itemID={groupID}/>,
        this.container
      );

      ACLGroupStore.emit(EventTypes.ACL_GROUP_DETAILS_FETCHED_ERROR, groupID);

      var node = ReactDOM.findDOMNode(this.instance);
      var text = node.querySelector('h3');

      expect(text.textContent)
        .toEqual('Cannot Connect With The Server');
    });

    it('should show loading screen if still waiting on Store', function () {
      MesosSummaryStore.get = function (status) {
        if (status === 'statesProcessed') {
          return false;
        }
      };
      var groupID = 'unicode';
      this.instance = ReactDOM.render(
        <GroupSidePanelContents
          itemID={groupID}/>,
        this.container
      );

      var node = ReactDOM.findDOMNode(this.instance);
      var loading = node.querySelector('.ball-scale');

      expect(loading).toBeTruthy();
    });

    it('should not return error message or loading screen if group is found',
      function () {
        var groupID = 'unicode';

        this.instance = ReactDOM.render(
          <GroupSidePanelContents
            itemID={groupID}/>,
          this.container
        );

        var node = ReactDOM.findDOMNode(this.instance);
        var text = node.querySelector('.form-element-inline-text');

        expect(text.textContent).toEqual('藍-遙 遥 悠 遼 Größe');
      }
    );

  });
});
