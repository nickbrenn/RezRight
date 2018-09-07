import React, { Component } from "react";

import Navbar from "../SubComponents/Navbar/navbar";import Sidebar from "../SubComponents/Sidebar/sidebar";
import { Link } from "react-router-dom";
import ItemCard from "../SubComponents/ItemCard/itemCard";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label
} from "reactstrap";
import "../CSS/component-general.css";

import axios from "axios";
const urls = require("../../config/config.json");

class Skills extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newSkill: "",
      skills: []
    };
  }
  componentDidMount = () => {
    window.scrollTo(0, 0);
  }

  componentDidUpdate = () => {
    console.log("ComponentDidUpdate");
    if (this.state.skills !== this.props.context.userInfo.skills && this.props.context.userInfo.auth === true) {
      this.setState({ skills: this.props.context.userInfo.skills});
    }
  };

  handleChange = (e, index) => {
    // this.setState({ [e.target.id]: e.target.value });
    const eName = e.target.name;
    const value = e.target.value;
    let newState = this.state.skills;
    newState[index][eName] = value;
    this.setState({ skills: newState })
  };

  newSkillChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  handleSubmit = (action) => {
    if(action === "add"){
      this.props.context.actions.addElement("skills", { "groupname": this.state.newSkill });
    } else if(action === "edit"){
      this.props.context.actions.setEntireElement("skills", this.state.skills);
    }

    this.setState({ newSkill: "" })


    const tempObj = {
      "sections.skills": this.props.context.userInfo.skills
    };
    
    axios
      .put(
        `${urls[urls.basePath]}/users/info/` + this.props.context.userInfo.id, tempObj,
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        }
      )
      .then(response => {
        // This updates context with the new user info from server
        this.props.context.actions.setLogin(response.data.user);
      })
      .catch(err => {
        console.log("oops", err.message);
      });
  };

  render() {
    return (
      <div>
        <Navbar context={this.props.context}/>
        <div className="overall-component-div row">
          <Sidebar context={this.props.context} />
          <div className="title-div col">
            <div className="link-hide">
              <h4>
                SKILLS{" "}</h4>
                <Link
                  to={{
                    pathname: "/skills/create", // component being Linked to
                    state: { index: false } // Setting Index passed into educationCreate component - false means new
                  }}
                >{" "}
                  <i className="fa fa-pencil fa-lg" />
                </Link>
            </div>
            <p style={{fontSize: "0.7rem", paddingLeft: ".6rem"}}>
              Click the pencil to enter your work related skills.
            </p>

            <div className="skills-containment-div">
              {this.state.skills.map((element, index) => {
                return (
                  <div className="skillgroup" key={element._id ? element._id : element.groupname + index}>
                    <FormGroup>
                      <Label>Groupname</Label>
                      <Input
                        id={`skills`}
                        name="groupname"
                        placeholder="Group Name"
                        size="sm"
                        value={this.state.skills[index].groupname}
                        onChange={(e) => this.handleChange(e, index)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Skills</Label>
                      <Input
                        id={`skills`}
                        name="content"
                        placeholder="Skill 1, skill 2, skill 3..."
                        size="sm"
                        value={this.state.skills[index].content}
                        onChange={(e) => this.handleChange(e, index)}
                      />
                    </FormGroup>
                  </div>
                )
              })}
              <Button color="primary" onClick={() => this.handleSubmit("edit")}>
                Submit
              </Button>
              <div className="skillgroup-input">
                <FormGroup>
                  <Label>New Skill Group</Label>
                  <Input
                    id="newSkill"
                    size="sm"
                    value={this.state.newSkill}
                    onChange={this.newSkillChange}
                  />
                </FormGroup>
                <Button color="primary" onClick={() => this.handleSubmit("add")}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Skills;
