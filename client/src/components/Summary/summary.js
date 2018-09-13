import React, { Component } from "react";
import Navbar from "../SubComponents/Navbar/navbar";
import Sidebar from "../SubComponents/Sidebar/sidebar";
import ItemCard from "../SubComponents/ItemCard/itemCard";
import { Link } from "react-router-dom";

class Summary extends Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  
  render() {
    return (
      <div>
        <Navbar context={this.props.context} />
        <div className="overall-component-div row">
          <Sidebar context={this.props.context} />
          <div className="title-div col" style={{paddingRight: "1rem"}}>
            <div className="link-hide" >
              <h4>PERSONAL SUMMARY </h4>
              <Link
                to={{
                  pathname: "/summary/create", // component being Linked to
                  state: { index: false } // Setting Index passed into educationCreate component - false means new
                }}
              >
                <i className="fa fa-pencil fa-lg" />
              </Link>
            </div>
            <p
              style={{
                fontSize: "0.7rem",
                paddingLeft: ".6rem",
                borderTop: "1px solid black",
                width: "100%"
              }}
            >
              Click the pencil to add a Personal Summary.{" "}
            </p>

            <div className="summary-containment-div">
              {this.props.context.userInfo.summary.map((element, index) => {
                return (
                  <ItemCard
                    linkTo="/summary"
                    elementName="summary"
                    putPath="sections.summary"
                    index={index}
                    key={element._id ? element._id : index}
                    content={element.content}
                    context={this.props.context}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Summary;
