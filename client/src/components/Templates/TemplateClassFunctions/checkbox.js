import React, { Component } from "react";

class CheckBox extends Component {
  toggle = () => {
    this.props.context.actions.setResumeItemState(
      this.props.index,
      this.props.name,
      this.props.id
    );
  };

  render() {
    return (
      <input
        type="checkbox"
        checked={this.props.value}
        onChange={this.toggle}
      />
    );
  }
}

export default CheckBox;
