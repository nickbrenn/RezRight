import React, { Component } from "react";
export const AuthContext = React.createContext({});

class AuthProvider extends Component {
  state = {
    auth: false,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    links: [],
    education: [],
    experience: [],
    skills: [],
    summary: [],
    userName: ""
  };

  toggleAuth = () => {
    this.setState({ auth: !this.state.auth });
  };

  setContext = (title, value) => {
    this.setState({ [title]: value });
  };

  setLogin = userData => {
    this.setState({
      auth: true,
      email: userData.email ? userData.email : "",
      password: userData.password ? userData.password : "",
      firstName: userData.firstName ? userData.firstName : "",
      lastName: userData.lastName ? userData.lastName : "",
      links: userData.links ? userData.links : [],
      phoneNumber: userData.phonenumber ? userData.phonenumber : "",
      education: userData.sections.education ? userData.sections.education : [],
      experience: userData.sections.experience
        ? userData.sections.experience
        : [],
      skills: userData.sections.skills ? userData.sections.skills : [],
      summary: userData.sections.summary ? userData.sections.summary : [],
      userName: userData.username ? userData.username : "",
      id: userData._id ? userData._id : null
    });
  };

  setElement = (index, elementName, elementValue) => {
    const temp = this.state;
    temp[elementName][index] = elementValue;
    this.setState(temp);
  };

  addElement = (elementName, elementValue) => {
    const temp = this.state;
    temp[elementName].push(elementValue);
    this.setState(temp);
  };

  render() {
    const userInfo = this.state;
    return (
      <AuthContext.Provider
        value={{
          userInfo,
          actions: {
            toggleAuth: this.toggleAuth,
            setContext: this.setContext,
            setLogin: this.setLogin,
            setElement: this.setElement,
            addElement: this.addElement
          }
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export default AuthProvider;