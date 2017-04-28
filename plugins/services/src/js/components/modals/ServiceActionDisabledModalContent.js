import React, { PropTypes } from "react";

import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";
import {
  SCALE,
  RESTART,
  RESUME,
  SUSPEND,
  DELETE
} from "../../constants/ServiceActionItem";

const METHODS_TO_BIND = ["handleTextCopy"];

class ServiceActionDisabledModalContent extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { isTextCopied: false };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({ isTextCopied: false });
    }
  }

  handleTextCopy() {
    this.setState({ isTextCopied: true });
  }

  getUpdateCommand() {
    const { service } = this.props;
    const serviceID = service.getId();
    const packageName = service.getLabels().DCOS_PACKAGE_NAME;

    return `dcos ${packageName} --name=${serviceID} update --options=<my-options>.json`;
  }

  getRestartCommand() {
    const { service } = this.props;
    const serviceID = service.getId();

    return `dcos marathon app restart ${serviceID}`;
  }

  getDeleteCommand() {
    const { service } = this.props;
    const serviceID = service.getId();
    const packageName = service.getLabels().DCOS_PACKAGE_NAME;

    return `dcos package uninstall ${packageName} --app-id=${serviceID}`;
  }

  getRestartMessage() {
    const command = this.getRestartCommand();

    return (
      <div>
        <p>
          Restart your service from the DC/OS CLI.
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/cli/command-reference/dcos-marathon/dcos-marathon-app-restart/"
            )}
            target="_blank"
          >
            More information
          </a>
        </p>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getSuspendMessage() {
    const command = this.getUpdateCommand();

    return (
      <div>
        <p>
          Suspend your service by scaling to 0 instances from the DC/OS CLI using an `options.json` file.
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/config-universe-service/"
            )}
            target="_blank"
          >
            More information
          </a>
        </p>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getResumeMessage() {
    const command = this.getUpdateCommand();

    return (
      <div>
        <p>
          Resume your service by scaling to 1 or more instances from the DC/OS CLI using an `options.json` file.
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/config-universe-service/"
            )}
            target="_blank"
          >
            More information
          </a>
        </p>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getScaleMessage() {
    const command = this.getUpdateCommand();

    return (
      <div>
        <p>
          Update the number of instances in your service's target configuration using an `options.json` file.
        </p>
        <p>
          <span className="emphasis">Note:</span>
          {" "}
          Scaling to fewer instances is not supported.
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/usage/managing-services/config-universe-service"
            )}
            target="_blank"
          >
            More information
          </a>
          {" "}
        </p>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getDeleteMessage() {
    const { service } = this.props;
    const serviceID = service ? service.getId() : "";
    const command = this.getDeleteCommand();

    return (
      <div>
        <p>
          You must delete
          {" "}
          <span className="emphasis">{serviceID}</span>
          {" "}
          via the DC/OS CLI. Copy and paste this command into the CLI. See the
          {" "}
          <a
            href={MetadataStore.buildDocsURI("/deploying-services/uninstall/")}
            target="_blank"
          >
            documentation
          </a> for complete instructions.{" "}
        </p>
        {this.getClipboardTrigger(command)}
        <p>
          To clean up resources reserved by your service, run the
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/usage/managing-services/uninstall/#framework-cleaner"
            )}
            target="_blank"
          >
            framework cleaner script
          </a>
          .
        </p>
      </div>
    );
  }

  getClipboardTrigger(command) {
    const { isTextCopied } = this.state;
    const copyText = isTextCopied ? "Copied" : "Copy";

    return [
      <pre>{command}</pre>,
      <p>
        <ClipboardTrigger
          className="clickable"
          copyText={command}
          onTextCopy={this.handleTextCopy}
        >
          <a>{copyText}</a>
        </ClipboardTrigger>
      </p>
    ];
  }

  render() {
    const { actionID } = this.props;

    switch (actionID) {
      case RESTART:
        return this.getRestartMessage();
      case SUSPEND:
        return this.getSuspendMessage();
      case RESUME:
        return this.getResumeMessage();
      case SCALE:
        return this.getScaleMessage();
      case DELETE:
        return this.getDeleteMessage();
      default:
        return <noscript />;
    }
  }
}

ServiceActionDisabledModalContent.propTypes = {
  actionID: PropTypes.string,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ])
};

module.exports = ServiceActionDisabledModalContent;
