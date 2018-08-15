import React, { Component } from "react";
import Sidebar from "./subComponents/sidebar";
import Navbar from "./subComponents/navbar";

class Templates extends Component {
  render() {
    return (
      <div>
        <Navbar breadcrumbs={["positions", "education"]} />
        <div className="component-div">
          <Sidebar />
          <div className="title-div">
            <h1>Content Here</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default Templates;
