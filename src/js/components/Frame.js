var React = require("react");

var Frame = React.createClass({

  displayName: "Frame",

  getDefaultProps: function () {
    return {
      onReady: function () {},
      style: {},
      className: "",
      src: ""
    };
  },

  componentDidUpdate: function () {
    this.renderFrameContents();
  },

  componentDidMount: function () {
    this.renderFrameContents();
  },

  renderFrameContents: function() {
    var doc = this.getDOMNode().contentDocument;

    if (doc.readyState === "complete") {
      this.props.onReady();
    } else {
      // If iframe is not done loading, continue to
      // check until it completes, then call onReady.
      setTimeout(this.renderFrameContents, 0);
    }
  },

  render: function() {
    return (
      <iframe
        className={this.props.className}
        src={this.props.src}
        style={this.props.style} />
    );
  }
});

module.exports = Frame;
