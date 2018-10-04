import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";

import classnames from "classnames";
const urls = require("../../../config/config.json");

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: true
    };
  }

  componentDidMount = () => {
    if (
      localStorage.getItem("token") &&
      this.props.context.userInfo.auth !== true
    ) {
      axios
        .get(`${urls[urls.basePath]}/users/currentuser/`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        })
        .then(response => {
          this.props.context.actions.setLogin(response.data);
        })
        .catch(err => {
          this.props.context.actions.setLogout();
        });
    } else {
      if (
        this.props.context.userInfo.resumes[0] &&
        !this.props.context.userInfo.currentresume
      ) {
        this.props.context.actions.setSingleElement(
          "currentresume",
          this.props.context.userInfo.resumes[0]._id
        );
      }
    }
  };

  onSetSidebarOpen = open => {
    this.setState({ sidebarOpen: open });
  };

  render() {
    // If there is no token, then going to any page will result in a redirect to login
    if (!localStorage.getItem("token")) {
      return <Redirect to="/login" />;
    }
    return (
      <div className="sidebar">
        <div
          className="static-sidebar"
          style={{
            fontFamily: "Verdana",
            fontSize: "0.6rem",
            fontWeight: "0"
          }}
        >
          <Link
            to="/dashboard"
            className={classnames({
              active: window.location.pathname.includes("/dashboard")
            })}
          >
            {" "}
            <div
              className="fa fa-check-square sm"
              style={{ color: "white" }}
            />{" "}
            DASHBOARD
          </Link>
          <Link
            to="/templates"
            className={classnames({
              active: window.location.pathname.includes("/templates")
            })}
          >
            {" "}
            <div
              className="fa fa-file-alt sm"
              style={{ color: "white" }}
            />{" "}
            TEMPLATES
          </Link>
          <Link
            to="/jobtitle"
            className={classnames({
              active: window.location.pathname.includes("/jobtitle")
            })}
          >
            <div className="fa fa-briefcase sm" style={{ color: "white" }} />{" "}
            JOB TITLE
          </Link>
          <Link
            to="/summary"
            className={classnames({
              active: window.location.pathname.includes("/summary")
            })}
          >
            {" "}
            <div className="fa fa-edit sm" style={{ color: "white" }} /> SUMMARY
          </Link>
          <Link
            to="/skills"
            className={classnames({
              active: window.location.pathname.includes("/skills")
            })}
          >
            {" "}
            <div className="fa fa-wrench" style={{ color: "white" }} /> SKILLS
          </Link>
          <Link
            to="/experience"
            className={classnames({
              active: window.location.pathname.includes("/experience")
            })}
          >
            {" "}
            <div
              className="fa fa-lightbulb sm"
              style={{ color: "white" }}
            />{" "}
            EXPERIENCE
          </Link>
          <Link
            to="/education"
            className={classnames({
              active: window.location.pathname.includes("/education")
            })}
          >
            <div
              className="fa fa-graduation-cap sm"
              style={{ color: "white" }}
            />{" "}
            EDUCATION
          </Link>
          <Link
            to="/billing"
            className={classnames({
              active: window.location.pathname.includes("/billing")
            })}
          >
            {" "}
            <div
              className="fa fa-credit-card sm"
              style={{ color: "white" }}
            />{" "}
            BILLING
          </Link>
          <Link
            to="/settings"
            className={classnames({
              active: window.location.pathname.includes("/settings")
            })}
          >
            {" "}
            <div
              className="fa fa-sliders-h sm"
              style={{ color: "white" }}
            />{" "}
            SETTING
          </Link>
        </div>
      </div>
    );
  }
}

export default Sidebar;
