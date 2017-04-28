import { combineReducers, simpleReducer } from "#SRC/js/utils/ReducerUtil";
import { SET } from "#SRC/js/constants/TransactionTypes";
import Networking from "#SRC/js/constants/Networking";

import { PROTOCOLS } from "../../constants/PortDefinitionConstants";
import ContainerConstants from "../../constants/ContainerConstants";
import networkingReducer from "./Networking";
import VipLabelUtil from "../../utils/VipLabelUtil";

const { DOCKER, NONE } = ContainerConstants.type;

const { BRIDGE, HOST, USER } = Networking.type;

function getContainerSettingsReducer(name) {
  return function(_, { type, path = [], value }) {
    const joinedPath = path.join(".");
    if (joinedPath === "container.type" && Boolean(value)) {
      this.networkType = value;
    }
    if (type === SET && joinedPath === `container.docker.${name}`) {
      this.value = Boolean(value);
    }
    if (this.networkType === DOCKER && this.value != null) {
      return this.value;
    }

    return null;
  };
}

module.exports = combineReducers({
  privileged: getContainerSettingsReducer("privileged"),
  forcePullImage: simpleReducer("container.docker.forcePullImage", null),
  image: simpleReducer("container.docker.image", ""),
  network(state = null, { type, path = [], value }) {
    if (!this.containerType) {
      this.containerType = NONE;
    }

    if (!this.appState) {
      this.appState = {
        id: "",
        networkType: HOST
      };
    }

    const joinedPath = path.join(".");
    if (type === SET && joinedPath === "container.type") {
      this.containerType = value;
    }

    if (joinedPath === "container.docker.network" && Boolean(value)) {
      this.appState.networkType = value.split(".")[0];
    }

    // Universal containerizer does not support network for USER network
    if (this.containerType !== DOCKER && this.appState.networkType === USER) {
      return null;
    }

    if (type === SET && joinedPath === "container.docker.network") {
      return Networking.type[value.split(".")[0]];
    }

    return state;
  },
  portMappings(state, action) {
    const { path = [], value, type } = action;
    if (!this.appState) {
      this.appState = {
        id: "",
        networkType: HOST
      };
    }
    if (!this.containerType) {
      this.containerType = NONE;
    }

    const joinedPath = path.join(".");
    if (type === SET && joinedPath === "container.type") {
      this.containerType = value;
    }

    if (joinedPath === "container.docker.network" && Boolean(value)) {
      this.appState.networkType = value.split(".")[0];
    }

    if (joinedPath === "id" && Boolean(value)) {
      this.appState.id = value;
    }

    // Apply networkingReducer to retrieve updated local state
    // Store the change no matter what network type we have
    this.portDefinitions = networkingReducer(this.portDefinitions, action);

    // Universal containerizer does not support portMappings for USER
    if (this.containerType !== DOCKER && this.appState.networkType === USER) {
      return null;
    }

    // We only want portMappings for networks of type BRIDGE or USER
    if (
      this.appState.networkType !== BRIDGE &&
      this.appState.networkType !== USER
    ) {
      return null;
    }

    // Convert portDefinitions to portMappings
    return this.portDefinitions.map((portDefinition, index) => {
      const vipLabel = `VIP_${index}`;
      const containerPort = Number(portDefinition.containerPort) || 0;
      const servicePort = parseInt(portDefinition.servicePort, 10) || null;
      let hostPort = Number(portDefinition.hostPort) || 0;
      let protocol = PROTOCOLS.filter(function(protocol) {
        return portDefinition.protocol[protocol];
      }).join(",");

      // Do not expose hostPort or protocol, when portMapping is turned off
      if (this.appState.networkType === USER && !portDefinition.portMapping) {
        hostPort = null;
        protocol = null;
      }

      // Prefer container port
      // because this is what a user would expect to get load balanced
      const vipPort = containerPort || hostPort || 0;
      const labels = VipLabelUtil.generateVipLabel(
        this.appState.id,
        portDefinition,
        vipLabel,
        vipPort
      );

      return {
        containerPort,
        hostPort,
        labels,
        protocol,
        servicePort,
        name: portDefinition.name
      };
    });
  }
});
