import mixin from 'reactjs-mixin';
import {Link} from 'react-router';
import {MountService} from 'foundation-ui';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Config from '../../config/Config';
import ConfigStore from '../../stores/ConfigStore';
import ConfigurationMap from '../../components/ConfigurationMap';
import ConfigurationMapHeading from '../../components/ConfigurationMapHeading';
import HashMapDisplay from '../../components/HashMapDisplay';
import Loader from '../../components/Loader';
import MarathonStore from '../../../../plugins/services/src/js/stores/MarathonStore';
import MetadataStore from '../../stores/MetadataStore';
import Page from '../../components/Page';
import VersionsModal from '../../components/modals/VersionsModal';

const METHODS_TO_BIND = [
  'handleClusterConfigModalClose',
  'handleClusterConfigModalOpen'
];

const ClusterDetailsBreadcrumbs = () => {
  const crumbs = [
    <Link to="/cluster" key={-1}>Cluster</Link>
  ];

  return <Page.Header.Breadcrumbs iconID="cluster" breadcrumbs={crumbs} />;
};

class OverviewDetailTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      isClusterBuildInfoOpen: false
    };

    this.store_listeners = [
      {
        name: 'config',
        events: ['ccidSuccess']
      },
      {
        name: 'marathon',
        events: ['instanceInfoSuccess']
      },
      {
        name: 'metadata',
        events: ['dcosBuildInfoChange', 'dcosSuccess']
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    ConfigStore.fetchCCID();
    MarathonStore.fetchMarathonInstanceInfo();
    MetadataStore.fetchDCOSBuildInfo();
  }

  handleClusterConfigModalOpen() {
    this.setState({isClusterBuildInfoOpen: true});
  }

  handleClusterConfigModalClose() {
    this.setState({isClusterBuildInfoOpen: false});
  }

  getLoading() {
    return <Loader size="small" type="ballBeat" />;
  }

  getClusterDetailsHash() {
    let ccid = ConfigStore.get('ccid');
    let productVersion = MetadataStore.version;

    if (Object.keys(ccid).length) {
      ccid = ccid.zbase32_public_key;
    } else {
      ccid = this.getLoading();
    }

    if (productVersion == null) {
      productVersion = this.getLoading();
    }

    return {
      [`${Config.productName} Version`]: productVersion,
      'Cryptographic Cluster ID': ccid
    };
  }

  getMarathonDetailsHash() {
    const marathonDetails = MarathonStore.getInstanceInfo();

    if (!Object.keys(marathonDetails).length) {
      return null;
    };

    return {
      'Marathon Details': {
        'Version': marathonDetails.version,
        'Framework ID': marathonDetails.frameworkId,
        'Leader': marathonDetails.leader,
        'Marathon Config': marathonDetails.marathon_config,
        'ZooKeeper Config': marathonDetails.zookeeper_config
      }
    };
  }

  getPageHeaderActions() {
    return [{
      label: 'View Cluster Configuration',
      onItemSelect: this.handleClusterConfigModalOpen
    }];
  }

  render() {
    const buildInfo = MetadataStore.get('dcosBuildInfo');
    const marathonHash = this.getMarathonDetailsHash();
    let marathonDetails = null;
    let versionsModal = null;

    if (marathonHash) {
      marathonDetails = <HashMapDisplay hash={marathonHash} />;
    }

    if (buildInfo != null) {
      versionsModal = (
        <VersionsModal onClose={this.handleClusterConfigModalClose}
          open={this.state.isClusterBuildInfoOpen}
          versionDump={buildInfo} />
      );
    }

    return (
      <Page>
        <Page.Header actions={this.getPageHeaderActions()}
          breadcrumbs={<ClusterDetailsBreadcrumbs />} />
        <div className="container">
          <ConfigurationMap>
            <ConfigurationMapHeading className="flush-top">
              Cluster Details
            </ConfigurationMapHeading>
            <HashMapDisplay hash={this.getClusterDetailsHash()} />
            {marathonDetails}
            <MountService.Mount
              type="OverviewDetailTab:AdditionalClusterDetails" />
          </ConfigurationMap>
        </div>
        {versionsModal}
      </Page>
    );
  }
};

OverviewDetailTab.routeConfig = {
  label: 'Overview',
  matches: /^\/cluster\/details/
};

module.exports = OverviewDetailTab;
