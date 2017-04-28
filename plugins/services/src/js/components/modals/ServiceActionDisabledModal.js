import { Modal } from "reactjs-components";
import React, { PropTypes } from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";
import ServiceActionLabels from "../../constants/ServiceActionLabels";

class ServiceActionDisabledModal extends React.Component {
  getHeading() {
    const { actionID, service } = this.props;

    let itemText = "Service";

    if (service instanceof Pod) {
      itemText = "Pod";
    }

    if (service instanceof ServiceTree) {
      itemText = "Group";
    }

    return (
      <ModalHeading>
        {`${ServiceActionLabels[actionID]} ${itemText}`}
      </ModalHeading>
    );
  }

  getFooter() {
    const { onClose } = this.props;

    return (
      <div className="button-collection text-align-center flush-bottom">
        <button className="button" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  render() {
    const { children, onClose, open } = this.props;

    return (
      <Modal
        open={open}
        onClose={onClose}
        header={this.getHeading()}
        modalClass="modal confirm-modal"
        showCloseButton={false}
        showHeader={true}
        showFooter={true}
        footer={this.getFooter()}
      >
        {children}
      </Modal>
    );
  }
}

ServiceActionDisabledModal.propTypes = {
  actionID: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ])
};

module.exports = ServiceActionDisabledModal;
