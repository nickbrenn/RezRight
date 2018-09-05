import React, { Component } from "react";
import { Link, Redirect, Route } from "react-router-dom";
import axios from "axios";

import classnames from "classnames";
import "./sidebar.css";
const urls = require("../../../config/config.json");

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: true
    };
  }

  componentDidMount() {
    if (localStorage.getItem("token") && this.props.context.auth !== true) {
      console.log("ComponentDidMount on sidebar called for new user info");
      axios
        .get(`${urls[urls.basePath]}/users/currentuser/`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        })
        .then(response => {
          console.log("sidebar get response for currentuser:", response);
          const userData = response.data.user;
          const resumeData = response.data.resumes;
          this.props.context.actions.setLogin(userData);
          this.props.context.actions.setResume(resumeData);
        })
        .catch(err => {
          console.log("Server Error: ", err);
          this.props.context.actions.setLogout();
        });
    } else {
      console.log("Sidebar detected no token and/or auth === false");
    }
  }

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
            fontSize: "0.7rem",
            fontWeight: "550"
          }}
        >
          <Link
            to="/templates"
            className={classnames({
              active: window.location.pathname.includes("/templates")
            })}
          >
            <div className="fa fa-copy sm" style={{ color: "white" }} />{" "}
            Templates
          </Link>
          <Link
            to="/resumes"
            className={classnames({
              active: window.location.pathname.includes("/resumes")
            })}
          >
            <div className="fa fa-file-alt sm" style={{ color: "white" }} />
            Resumes
          </Link>
          <Link
            to="/jobtitle"
            className={classnames({
              active: window.location.pathname.includes("/jobtitle")
            })}
          >
            <div className="fa fa-briefcase sm" style={{ color: "white" }} />{" "}
            Job Title
          </Link>
          <Link
            to="/summary"
            className={classnames({
              active: window.location.pathname.includes("/summary")
            })}
          >
            <div className="fa fa-edit sm" style={{ color: "white" }} /> Summary
          </Link>
          <Link
            to="/skills"
            className={classnames({
              active: window.location.pathname.includes("/skills")
            })}
          >
            <div className="fa fa-wrench" style={{ color: "white" }} /> Skills
          </Link>
          <Link
            to="/experience"
            className={classnames({
              active: window.location.pathname.includes("/experience")
            })}
          >
            <div className="fa fa-lightbulb sm" style={{ color: "white" }} />
            Experience
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
            />
            Education
          </Link>
          <Link
            to="/billing"
            className={classnames({
              active: window.location.pathname.includes("/billing")
            })}
          >
            <div className="fa fa-credit-card sm" style={{ color: "white" }} />{" "}
            Billing
          </Link>
          <Link
            to="/settings"
            className={classnames({
              active: window.location.pathname.includes("/settings")
            })}
          >
            <div className="fa fa-sliders-h sm" style={{ color: "white" }} />
            Settings
          </Link>
        </div>
        <Route
          render={({ history }) => (
            <div
              className="logout btn"
              onClick={() => {
                this.props.context.actions.setLogout();
                history.push("/");
              }}
            >
              Logout
            </div>
          )}
        />
      </div>
    );
  }
}

export default Sidebar;
