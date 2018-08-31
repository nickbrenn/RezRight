import React, { Component } from "react";
import {
  Button,
  Form,
  FormGroup,
  FormFeedback,
  Input,
  Label
} from "reactstrap";
import axios from "axios";
import "./login.css";
const urls = require("../../config/config.json");

const scrinch = {
  email: "scrinch@gmail.com",
  password: "tacobell1!G",
  invalidCredentials: false
};

const bobbert = {
  email: "bobbert@gmail.com",
  password:
    "NGVmNjllOTVhOGRlNDU0Y2ZkYzA2MmViYTUyNTYyNTk5OTVmOTdhZjBiZjNhMjRlYWNiNTEzZGVjM2ViY2Y1ZA!",
  invalidCredentials: false
};

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = scrinch;
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    axios
      .post(`${urls[urls.basePath]}/users/login`, {
        email: this.state.email,
        password: this.state.password
      })
      .then(response => {
        if (response.data.token) {
          const userData = response.data.user;
          console.log(userData);
          localStorage.setItem("token", response.data.token);
          this.props.context.actions.setLogin(userData);

          console.log(this.props.context.userInfo);
          this.props.history.push("/templates");
        } else this.setState({ invalidCredentials: true, password: "" });
      })
      .catch(err => {
        console.log("err", err);
        localStorage.removeItem("token");
        this.setState({ invalidCredentials: true, password: "" });
      });
  };

  render() {
    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit}>
          <FormGroup>
            <Label>Email</Label>
            <Input
              autoFocus
              id="email"
              invalid={this.state.invalidCredentials}
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Password</Label>
            <Input
              id="password"
              invalid={this.state.invalidCredentials}
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
            <FormFeedback invalid>
              The email or password you entered are incorrect.
            </FormFeedback>
          </FormGroup>
          <Button
            block
            size="lg"
            color="primary"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
        </Form>
      </div>
    );
  }
}
