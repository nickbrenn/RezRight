import React, { Component } from "react";

import axios from "axios";
const urls = require("../config/config.json");

export const AuthContext = React.createContext({});

class AuthProvider extends Component {
  state = {
    auth: false,
    username: "",
    email: "",
    name: {
      firstname: "",
      middlename: "",
      lastname: ""
    },
    title: [],
    phonenumber: "",
    links: [],
    education: [],
    experience: [],
    skills: [],
    summary: [],
    resumes: [],
    currentresume: null,
    membership: false
  };

  setLogout = () => {
    localStorage.removeItem("token");
    this.setState({
      auth: false,
      username: "",
      email: "",
      name: {
        firstname: "",
        middlename: "",
        lastname: ""
      },
      title: [],
      phonenumber: "",
      links: [],
      education: [],
      experience: [],
      skills: [],
      summary: [],
      resumes: [],
      currentresume: null,
      membership: false
    });
  };

  setLogin = (dataFromUser, expandResumes) => {
    const userData = dataFromUser.user;
    this.setState({
      auth: true,
      currentresume: userData.currentresume ? userData.currentresume : null,
      email: userData.email ? userData.email : "",
      name: {
        firstname: userData.name.firstname ? userData.name.firstname : "",
        middlename: userData.name.middlename ? userData.name.middlename : "",
        lastname: userData.name.lastname ? userData.name.lastname : ""
      },
      title: userData.title ? userData.title : [],
      links: {
        linkedin: userData.links.linkedin ? userData.links.linkedin : "",
        portfolio: userData.links.portfolio ? userData.links.portfolio : "",
        github: userData.links.github ? userData.links.github : ""
      },
      location: userData.location ? userData.location : "",
      phonenumber: userData.phonenumber ? userData.phonenumber : "",
      education: userData.sections.education ? userData.sections.education : [],
      experience: userData.sections.experience
        ? userData.sections.experience
        : [],
      skills: userData.sections.skills ? userData.sections.skills : [],
      summary: userData.sections.summary ? userData.sections.summary : [],
      username: userData.username ? userData.username : "",
      id: userData._id ? userData._id : null,
      membership: userData.membership ? userData.membership : false
    });
    // Every time setLogin is called due to changing user data in database,
    // setLogin is called which then updates the resumes.
    if (expandResumes === true) {
      this.expandResumeIDs();
    } else if (dataFromUser.resumes) {
      this.setResume(dataFromUser.resumes);
    }
  };

  setCurrentResume = resume => {
    if (this.state.resumes.length > 0) {
      const newCurrentResume = resume ? resume : this.state.resumes[0]._id;
      this.setState({ currentresume: newCurrentResume });
      axios
        .put(
          `${urls[urls.basePath]}/users/info/${this.state.id}`,
          { currentresume: newCurrentResume },
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          }
        )
        .then(response => {})
        .catch(err => {
          console.log("err", err);
        });
    }
  };

  setResume = resumeData => {
    if (this.state.auth !== true) {
      return;
    } else if (
      !(this.state.resumes.length > 0) &&
      resumeData &&
      resumeData.length > 0
    ) {
      this.setState({ resumes: resumeData });
    } else {
      return;
    }
  };

  pushResumes = newResume => {
    let newState = this.state.resumes;
    newState.push(newResume);
    this.setState({ resumes: newState, currentresume: newResume });
  };

  createResume = newResume => {
    let tempState = this.state.resumes;
    const tempObj = {
      value: false,
      links: { linkedin: false, github: false, portfolio: false },
      title: this.state.title.map(item => {
        return { _id: item._id, value: false };
      }),
      sections: {
        experience: this.state.experience.map(item => {
          return { _id: item._id, value: false };
        }),
        education: this.state.education.map(item => {
          return { _id: item._id, value: false };
        }),
        summary: this.state.summary.map(item => {
          return { _id: item._id, value: false };
        }),
        skills: this.state.skills.map(item => {
          return { _id: item._id, value: false };
        })
      }
    };
    if (newResume) {
      tempState = [];
      tempState.push(tempObj);
    } else tempState.push(tempObj);
    tempObj["resumes"] = tempState.map(resume => resume._id);
    this.setState({ resumes: tempState });

    axios
      .post(`${urls[urls.basePath]}/resume/`, tempObj, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      })
      .then(response => {
        let tempState = this.state.resumes;
        tempState.push(response.data.Resume);
        this.setState({
          resumes: tempState,
          currentresume: response.data.Resume._id
        });
      })
      .catch(err => {
        console.log("err", err);
      });
  };

  expandResumeIDs = () => {
    function findWithAttr(array, attr, value) {
      for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          return i;
        }
      }
      return -1;
    }

    const tempResumes = this.state.resumes;

    const expandSection = (section, resumeSection, index) => {
      let tempObj;
      if (!resumeSection) {
        tempObj = tempResumes[index][section];
        for (let item of this.state[section]) {
          const current = tempResumes[index][section].filter(
            resumeItem => resumeItem._id === item._id
          );
          if (current.length === 0) {
            tempObj.push({
              _id: item._id,
              value: false
            });
          }
        } // All items in context now have a resume counterpart
        let loopVar = tempResumes[index][section].length;
        for (let i = 0; loopVar > i; i++) {
          if (
            !(
              findWithAttr(
                this.state[section],
                "_id",
                tempResumes[index][section][i]._id
              ) > -1
            )
          ) {
            tempObj.splice(i, 1);
            loopVar--;
            i--;
          }
        } // All items in resume that are not in context were deleted from resume
      } else {
        tempObj = tempResumes[index].sections[section];
        //.sections portion
        for (let item of this.state[section]) {
          const current = tempResumes[index].sections[section].filter(
            resumeItem => resumeItem._id === item._id
          );
          if (current.length === 0) {
            tempObj.push({
              _id: item._id,
              value: false
            });
          }
        } // All items in context now have a resume counterpart
        let loopVar = tempResumes[index].sections[section].length;
        for (let i = 0; loopVar > i; i++) {
          if (
            !(
              findWithAttr(
                this.state[section],
                "_id",
                tempResumes[index].sections[section][i]._id
              ) > -1
            )
          ) {
            tempObj.splice(i, 1);
            loopVar--;
            i--;
          }
        } // All items in resume that are not in context were deleted from resume
      }
      return tempObj;
    };

    // Using promises means the state is only set a single name, rather than for each
    // subattribute changed or once for each resume that is updated.

    // SET TRUE IF .SECTION IS IN FRONT OF IT SO TITLE IS FALSE DUDE
    this.state.resumes.forEach((item, index) => {
      const newTitle = expandSection("title", false, index);
      const newExperience = expandSection("experience", true, index);
      const newEducation = expandSection("education", true, index);
      const newSummary = expandSection("summary", true, index);
      const newSkills = expandSection("skills", true, index);
      tempResumes[index].title = newTitle;
      tempResumes[index].sections.experience = newExperience;
      tempResumes[index].sections.education = newEducation;
      tempResumes[index].sections.summary = newSummary;
      tempResumes[index].sections.skills = newSkills;
    });

    this.setState({ resumes: tempResumes });

    for (let i = 0; i < this.state.resumes.length; i++) {
      axios
        .put(
          `${urls[urls.basePath]}/resume/` + this.state.resumes[i]._id,
          this.state.resumes[i],
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          }
        )
        .then(response => {})
        .catch(err => {
          console.log("err", err);
        });
    }
  };

  setResumeItemState = (index, name, id) => {
    const tempState = this.state;
    if (name === "linkedin" || name === "github" || name === "portfolio") {
      tempState.resumes[index].links[name] = !tempState.resumes[index].links[
        name
      ];
    } else {
      tempState.resumes[index].sections[name].forEach(field => {
        if (field._id === id) {
          field.value = !field.value;
        }
      });
    }
    this.setState(tempState);
  }; //Checkboxes

  setResumeItemDropdown = (index, name, id) => {
    const tempState = this.state;
    if (name === "title") {
      tempState.resumes[index][name].forEach(field => {
        if (field._id === id) {
          field.value = true;
        } else {
          field.value = false;
        }
      });
    } else {
      tempState.resumes[index].sections[name].forEach(field => {
        if (field._id === id) {
          field.value = true;
        } else {
          field.value = false;
        }
      });
    }
    this.setState(tempState);
  }; //Dropdowns

  setElement = (index, elementName, elementValue) => {
    const temp = this.state;
    temp[elementName][index] = elementValue;
    this.setState(temp);
  };

  setSingleElement = (elementName, elementValue) => {
    this.setState({ [elementName]: elementValue });
  };

  addElement = (elementName, elementValue) => {
    const temp = this.state;
    temp[elementName].push(elementValue);
    this.setState(temp);
  };

  removeElement = (index, elementName) => {
    const temp = this.state;
    temp[elementName].splice(index, 1);
    this.setState(temp);
  };

  render() {
    const userInfo = this.state;
    return (
      <AuthContext.Provider
        value={{
          userInfo,
          actions: {
            setResume: this.setResume,
            toggleAuth: this.toggleAuth,
            createResume: this.createResume,
            expandResumeIDs: this.expandResumeIDs,
            setResumeItemState: this.setResumeItemState,
            setResumeItemDropdown: this.setResumeItemDropdown,
            setLogin: this.setLogin,
            setLogout: this.setLogout,
            setElement: this.setElement,
            addElement: this.addElement,
            removeElement: this.removeElement,
            setSingleElement: this.setSingleElement,
            pushResumes: this.pushResumes,
            setCurrentResume: this.setCurrentResume
          }
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export default AuthProvider;
