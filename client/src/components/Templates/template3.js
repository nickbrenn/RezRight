import React, { Component } from "react";
import { Divider } from "semantic-ui-react";
import { FormGroup } from "reactstrap";
import Sidebar from "../SubComponents/Sidebar/sidebar";
import Navbar from "../SubComponents/Navbar/navbar";
import "./template3.css";
import { Link } from "react-router-dom";
import DropDown from './dropdown';

class CheckBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    };
  }

  toggle = () => {
    this.setState(
      {
        checked: !this.state.checked
      },
      function() {
        console.log(this.state);
      }.bind(this)
    );
  };

  render() {
    return (
      <input
        type="checkbox"
        checked={this.state.checked}
        onChange={this.toggle}
      />
    );
  }
}

export class TemplateThree extends Component {
  constructor(props) {
    super(props);
  }

  // handleSubmit(e) {
  //   e.preventDefault();

  //   const resume = {};
  //   for (const field in this.refs) {
  //     resume[field] = this.refs[field].value;
  //   }
  //   console.log("-->", resume);
  //   alert("Resume submitted: " + this.state.value);
  //   event.preventDefault();
  // }

  render() {
    const userInfo = this.props.context.userInfo;
    const education = this.props.context.userInfo.education;
    const experience = this.props.context.userInfo.experience;
    console.log(userInfo);
    return (
      <div>
        <Navbar
          context={this.props.context}
          breadcrumbs={[
            { link: "/", title: "Home" },
            { link: "/templates", title: "Templates" },
            { link: "/Templates/template-3", title: "Template Three" }
          ]}
        />

        <div className="component-div">
          <Sidebar context={this.props.context} />
          <div className="page-div">
            <div className="d-block justify-content-center title-div">
              <h3 className="page-header">Elegant</h3>
            </div>
            <form className="template1" onSubmit={this.handleSubmit}>
              <div class="row">
                <div class="col" className="left-column">
                  <a
                    href="https://www.freeiconspng.com/img/37126"
                    title="Image from freeiconspng.com"
                  >
                    <img
                      src="https://www.freeiconspng.com/uploads/logo-lion-head-png-8.png"
                      className="logo"
                      alt="logo lion head png"
                    />
                  </a>
                  <FormGroup textAlign="center" className="contactSection">
                    <h3 class="subtitle">Contact Details</h3>
                    <a href={`mailto:${userInfo.email}`}>
                      <p className="contact-section">
                        {" "}
                        <CheckBox />
                        {userInfo.email}
                      </p>
                    </a>
                    <p className="contact-section">
                      <CheckBox />
                      {userInfo.location}
                    </p>
                    <p className="contact-section">
                      <CheckBox />
                      {userInfo.phonenumber}
                    </p>
                    <p className="contact-section">
                      <CheckBox />
                      {userInfo.links.linkedin}
                    </p>
                    <p className="contact-section">
                      <CheckBox />
                      {userInfo.links.github}
                    </p>
                    <p className="contact-section">
                      <CheckBox />
                      {userInfo.links.portfolio}
                    </p>
                  </FormGroup>
                </div>
                <div class="col">
                  <div textAlign="center" className="titleSection">
                    <h2>
                      {userInfo.name.firstname} {userInfo.name.lastname}
                    </h2>
                    {userInfo.title.map(title => {
                      return (
                        <div>
                          <h5>
                            <CheckBox /> {title.content}
                          </h5>
                        </div>
                      );
                    })}
                  </div>
                  <Divider className="divider-div" />
                  <FormGroup
                    textAlign="center"
                    id="summary"
                    className="summarySection"
                  >
                    <h3 class="subtitle">Summary</h3>
                    <DropDown data={userInfo.summary} />
                  </FormGroup>
                  <Divider className="divider-div" />

                  <Divider className="divider-div" />

                  <FormGroup textAlign="center" className="skillsSection">
                    <h3 class="subtitle">Skills</h3>
                    {userInfo.skills.map((content, index) => {
                      return (
                        <div key={index}>
                          <p>
                            <CheckBox /> {content.content}
                          </p>
                        </div>
                      );
                    })}
                  </FormGroup>
                  <Divider className="divider-div" />
                  <FormGroup textAlign="center" className="experienceSection">
                    <h3 class="subtitle">Experience</h3>
                    {experience.map((content, index) => {
                      return (
                        <div key={index}>
                          {console.log(content)}
                          <h5>
                            {" "}
                            <CheckBox /> {content.company}{" "}
                          </h5>
                          <p>
                            {content.title}
                            <br />
                            {content.location}
                            <br />
                            {content.from} - {content.to}
                          </p>
                          <p>{content.description} </p>
                        </div>
                      );
                    })}
                  </FormGroup>
                  <Divider className="divider-div" />
                  <FormGroup textAlign="center" className="educationSection">
                    <h3 class="subtitle">Education</h3>
                    {education.map((content, index) => {
                      return (
                        <div key={index}>
                          <h5>
                            <CheckBox /> {content.degree} in{" "}
                            {content.fieldofstudy}{" "}
                          </h5>
                          <p>{content.location}</p>
                          <p>
                            {content.school}
                            <br />
                            {content.from} - {content.to}
                          </p>
                        </div>
                      );
                    })}
                  </FormGroup>
                </div>
              </div>
            </form>
            <div class="justify-content-center">
              <Link to="/resumes" className="resume-button" type="submit">
                {" "}
                Add Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TemplateThree;