import classNames from "classnames";
import React, { PropTypes } from "react";
import { routerShape } from "react-router";

import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLFilterField from "#SRC/js/components/DSLFilterField";
import DSLFilterList from "#SRC/js/structs/DSLFilterList";
import Page from "#SRC/js/components/Page";

import EmptyServiceTree from "./EmptyServiceTree";
import FuzzyTextDSLSection from "../../components/dsl/FuzzyTextDSLSection";
import Service from "../../structs/Service";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServiceHealthDSLSection
  from "../../components/dsl/ServiceHealthDSLSection";
import ServiceOtherDSLSection
  from "../../components/dsl/ServiceOtherDSLSection";
import ServicesTable from "./ServicesTable";
import ServiceStatusDSLSection
  from "../../components/dsl/ServiceStatusDSLSection";
import ServiceTree from "../../structs/ServiceTree";

class ServiceTreeView extends React.Component {
  getFilterBar() {
    const { filters, filterExpression, onFilterExpressionChange } = this.props;

    const hostClasses = classNames({
      "column-medium-5": !filterExpression.value,
      "column-medium-12": filterExpression.value
    });

    return (
      <div className="row">
        <div className={hostClasses}>
          <DSLFilterField
            filters={filters}
            formSections={[
              ServiceStatusDSLSection,
              ServiceHealthDSLSection,
              ServiceOtherDSLSection,
              FuzzyTextDSLSection
            ]}
            expression={filterExpression}
            onChange={onFilterExpressionChange}
          />
        </div>
      </div>
    );
  }

  getSearchHeader() {
    const { filterExpression } = this.props;
    if (filterExpression.defined) {
      return <h5 className="muted">Search Results</h5>;
    }

    return null;
  }

  render() {
    const {
      children,
      filterExpression,
      isEmpty,
      serviceTree,
      services
    } = this.props;

    const { modalHandlers } = this.context;
    // Only add id if service is not root
    const routePath = serviceTree.id === "/"
      ? "/services/overview/create"
      : `/services/overview/${encodeURIComponent(serviceTree.id)}/create`;

    const createService = () => {
      this.context.router.push(routePath);
    };

    if (isEmpty) {
      return (
        <Page>
          <Page.Header
            breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
          />
          <EmptyServiceTree
            onCreateGroup={modalHandlers.createGroup}
            onCreateService={createService}
          />
          {children}
        </Page>
      );
    }

    return (
      <Page>
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
          actions={[
            { onItemSelect: modalHandlers.createGroup, label: "Create Group" }
          ]}
          addButton={{ onItemSelect: createService, label: "Run a Service" }}
        />
        <div>
          {this.getFilterBar()}
          {this.getSearchHeader()}
          <ServicesTable
            isFiltered={filterExpression.defined}
            modalHandlers={modalHandlers}
            services={services}
          />
        </div>
        {children}
      </Page>
    );
  }
}

ServiceTreeView.contextTypes = {
  modalHandlers: PropTypes.shape({
    createGroup: PropTypes.func
  }).isRequired,
  router: routerShape
};

ServiceTreeView.defaultProps = {
  onFilterExpressionChange() {},
  isEmpty: false
};

ServiceTreeView.propTypes = {
  filters: PropTypes.instanceOf(DSLFilterList).isRequired,
  filterExpression: PropTypes.instanceOf(DSLExpression).isRequired,
  isEmpty: PropTypes.bool,
  children: PropTypes.node,
  onFilterExpressionChange: PropTypes.func,
  services: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.instanceOf(Service),
      PropTypes.instanceOf(ServiceTree)
    ])
  ).isRequired,
  serviceTree: PropTypes.instanceOf(ServiceTree)
};

module.exports = ServiceTreeView;
