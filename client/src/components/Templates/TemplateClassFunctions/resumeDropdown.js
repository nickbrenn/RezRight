import React, { Component } from "react";
import axios from "axios";

const urls = require("../../../config/config.json");

class ResumeDropdown extends Component {
  // Adding default state as a placeholder
  constructor(props) {
    super(props);
    this.state = {
      toggled: false,
      edit: false
    };
  }

  handleEdit = editToggle => {
    if (editToggle === "toggle") this.setState({ edit: !this.state.toggled });
    else {
      const tempObj = this.props.context.userInfo.resumes[this.props.index];
      tempObj.name = this.props.resumeName;
      axios
        .put(
          `${urls[urls.basePath]}/resume/` +
            this.props.context.userInfo.resumes[this.props.index]._id,
          tempObj,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          }
        )
        .then(response => {
          axios
            .put(
              `${urls[urls.basePath]}/users/info/${
                this.props.context.userInfo.id
              }`,
              { currentresume: response.data.resume._id },
              {
                headers: {
                  Authorization: "Bearer " + localStorage.getItem("token")
                }
              }
            )
            .then(response => {
              this.setState({ edit: !this.state.edit });
            })
            .catch(err => {
              console.log("err", err);
            });
        })
        .catch(err => {
          console.log("err", err);
        });
    }
  };

  // Toggles the drop down menu to appear based on the boolean value of state
  handleToggle = () => {
    this.setState({
      toggled: !this.state.toggled
    });
  };

  // Allows us to select an li and set our state with the given value
  handleClick = (data, index) => {
    this.setState({
      toggled: false
    });
    // this updates template page index
    this.props.context.actions.setSingleElement("currentresume", data._id);
    this.props.updateResumeIndex(index);
  };

  render() {
    const { toggled } = this.state;
    let selectedResume = null;
    const list = this.props.context.userInfo.resumes.map((data, index) => {
      if (data._id === this.props.context.userInfo.currentresume) {
        selectedResume =
          data.name === "Untitled" ? "Untitled " + (index + 1) : data.name;
      }
      return (
        <li
          className="list-group-item"
          key={data._id}
          onClick={() => this.handleClick(data, index)}
          style={{ cursor: "pointer" }}
        >
          {data.name === "Untitled" ? "Untitled " + (index + 1) : data.name}
        </li>
      );
    });

    return (
      <div className="template-card card dropdown m-0">
        <div className="container resume-name">
          {this.state.edit ? (
            <React.Fragment>
              <input
                id="resumeName"
                type="text"
                value={
                  this.props.resumeName !== null ? this.props.resumeName : ""
                }
                onChange={this.props.onInputChange}
                className="form-control edit-name"
                placeholder={selectedResume}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    event.target.blur();
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleEdit();
                  }
                }}
                autoFocus
              />
              <i
                onClick={() => this.handleEdit()}
                className="fa fa-check fa-lg"
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <h4
                style={{
                  marginRight: "1%",
                  fontWeight: "600",
                  textShadow: "-1px -1px 1px white",
                  color: "black"
                }}
              >
                {selectedResume}
              </h4>
              <i
                onClick={() => this.handleEdit("toggle")}
                className="fa fa-pencil fa-lg"
              />
            </React.Fragment>
          )}
        </div>
        <h6 style={{ textTransform: "uppercase", fontWeight: "600" }}>
          Choose an option:{" "}
          <i
            // Dynamically assigns a classname based on the value of this.toggled
            className={
              toggled ? "fa fa-angle-up fa-sm" : "fa fa-angle-down fa-sm"
            }
            style={{ cursor: "pointer" }}
            onClick={this.handleToggle}
          />
        </h6>
        {toggled ? <ul className="list-group">{list}</ul> : null}
      </div>
    );
  }
}

export default ResumeDropdown;
