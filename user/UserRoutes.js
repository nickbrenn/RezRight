const express = require("express");
const UserRouter = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const base64url = require("base64url");
const crypto = require("crypto");
let websiteName = "";
if (process.env.SITE_NAME) {
  websiteName = process.env.SITE_NAME;
} else websiteName = "easy-resume.com";
require("dotenv").config();

const User = require("./UserModel.js");
const EmailConfirmation = require("./EmailConfirmationModel.js");

// GET users/currentuser (TEST ROUTE --- WILL REMOVE)
// Route to find id, username and email of current user
UserRouter.get(
  "/currentuser",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    req.user.password = null;
    res.status(200).json(req.user);
  }
);

// GET users (TEST ROUTE --- WILL REMOVE)
// Should get all the users
UserRouter.get("/", (req, res) => {
  User.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({ errorMessage: "Get unsuccessful.", error: err });
    });
});

// POST users/register
// Register a new user
// Make sure to send confirmation email
UserRouter.post("/register", (req, res) => {
  const userData = req.body;
  User.findOne({ email: userData.email })
    .then(user => {
      if (user) {
        res.status(500).json({
          errorMessage:
            "This email is already in use. Please choose the forgot password option to reset your password."
        });
      } else {
        const newUser = new User(userData);
        newUser
          .save()
          .then(user => {
            const payload = {
              id: user._id,
              email: user.email,
              password: user.password
            };
            const token = jwt.sign(payload, process.env.SECRET, {
              expiresIn: 604800
            });

            // pseudo random seed to make each hash different
            const random = crypto.randomBytes(20).toString("hex");
            // creates a hash
            const hash = crypto.createHash("sha256");
            // adds user id, secret and the randomly generated string to make a unique hash
            hash.update(user.id + process.env.SECRET + random + token);

            // This creates a new email confirmation waiting to be fulfilled. Once it is accessed successfully it should be deleted and the user activated.
            const newEmailConfirmation = new EmailConfirmation({
              hash: base64url(hash.digest("hex")) + "$",
              user: user._id
            });
            newEmailConfirmation
              .save()
              .then(emailconfirmation => {
                // This sends a test email that can set user.active to true, thus allowing them to use the sites functions.
                nodemailer.createTestAccount((err, account) => {
                  // create reusable transporter object using the default SMTP transport
                  let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                      user: account.user, // generated ethereal user
                      pass: account.pass // generated ethereal password
                    }
                  });
                  let mailOptions = {
                    from: `"Fredegar Fu 👻" <signup@${websiteName}>`,
                    to: `${user.email}`,
                    subject: `Confirm your registration to ${websiteName}!`,
                    text: `Thank you for signing up! Please go to this address to confirm your registration: ${req.get(
                      "host"
                    )}${req.baseUrl}/confirmemail/${newEmailConfirmation.hash}`,
                    html: `Thank you for signing up! Please click this <a href=${req.get(
                      "host"
                    )}${req.baseUrl}/confirmemail/${newEmailConfirmation.hash}
                }>link</a>.`
                  };

                  transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                      return console.log(err);
                    }
                    console.log("Message sent: %s", info.messageId);
                    console.log(
                      "Preview URL: %s",
                      nodemailer.getTestMessageUrl(info)
                    );
                  });
                });
              })
              .catch(err => {
                console.log({
                  errorMessage: "Could not save email confirmation.",
                  error: err
                });
              });
            user.password = null;
            res.status(201).json({ user, token });
          })
          .catch(err => {
            res.status(500).json({
              errorMessage:
                "There was an error in account creation, please try again.",
              error: err
            });
          });
      }
    })
    .catch(err => {
      return res.status(500).json({
        errorMessage:
          "There was an error in account creation, please try again.",
        error: err
      });
    });
});

// POST users/login
// Login with a registered user
UserRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ errorMessage: "Invalid credentials." });
      }
      const verified = user.checkPassword(password);
      if (verified) {
        const payload = {
          id: user._id,
          email: user.email,
          password: user.password
        };
        const token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: 604800
        });
        user.password = null;
        res.json({ token, user });
      } else
        return res.status(401).json({ errorMessage: "Invalid credentials." });
    })
    .catch(err => {
      res.status(500).json({ errorMessage: "Could not log in.", error: err });
    });
});

// DELETE users/:id
// Make sure to send confirmation email for deleting
UserRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const id = req.params.id;
    if (id === req.user.id) {
      User.findByIdAndRemove(id)
        .then(user => {
          res.status(200).send("User successfully deleted.");
        })
        .catch(err => {
          res.status(404).json({
            errorMessage: "Could not find and delete user.",
            error: err
          });
        });
    } else {
      res
        .status(500)
        .json({ errorMessage: "You do not have access to this user!" });
    }
  }
);

// PUT users/info/:id
// Update user information
UserRouter.put(
  "/info/:id", 
  passport.authenticate("jwt", { session: false }), 
  (req, res) => {
    const id = req.params.id;
    if (id === req.user.id) {
      delete req.body.username;
      // This is to allow editing the email if the password requirements are met
      // and the inputted email is different from the user email stored in the database
      const email = req.body.email;
      delete req.body.email;
      delete req.body.active;
      // Delete this to ensure the password isn't changed manually
      delete req.body.password;

      const changes = req.body;
      const options = {
        new: true
        // runValidators: true
      };

      User.findByIdAndUpdate(id, changes, options)
        .then(user => {
          if (!user) {
            return res
              .status(404)
              .json({ errorMessage: "No user with that id could be found." });
          } else {
            if (req.body.oldpassword) {
              const verified = req.user.checkPassword(req.body.oldpassword);
              if (verified) {
                // If the password was changed then return a new token as well
                // If the user edited their email, then this if statement sends an email confirmation to their new email to make sure
                if (email && email !== req.user.email) {
                  // pseudo random seed to make each hash different
                  const random = crypto.randomBytes(20).toString("hex");
                  // creates a hash
                  const hash = crypto.createHash("sha256");
                  // adds user id, secret and the randomly generated string to make a unique hash
                  hash.update(user.id + process.env.SECRET + random);

                  // This creates a new email confirmation waiting to be fulfilled. Once it is accessed successfully it should be deleted and the user activated.
                  const newEmailConfirmation = new EmailConfirmation({
                    hash: base64url(hash.digest("hex")) + "!",
                    user: user._id,
                    newemail: email
                  });
                  newEmailConfirmation
                    .save()
                    .then(emailconfirmation => {
                      // This sends a test email that can set user.active to true, thus allowing them to use the sites functions.
                      nodemailer.createTestAccount((err, account) => {
                        // create reusable transporter object using the default SMTP transport
                        let transporter = nodemailer.createTransport({
                          host: "smtp.ethereal.email",
                          port: 587,
                          secure: false, // true for 465, false for other ports
                          auth: {
                            user: account.user, // generated ethereal user
                            pass: account.pass // generated ethereal password
                          }
                        });
                        let mailOptions = {
                          from: `"Fredegar Fu 👻" <changemail@${websiteName}>`,
                          to: `${req.user.email}`,
                          subject: `Confirm your account email change for ${websiteName}!`,
                          text: `Please go to this link to make this your new account email address: ${req.get(
                            "host"
                          )}${req.baseUrl}/changeemail/${
                            newEmailConfirmation.hash
                          }`,
                          html: `Please click this <a href=${req.get("host")}${
                            req.baseUrl
                          }/changeemail/${newEmailConfirmation.hash}
                    }>link</a> to make this your new account email address.`
                        };

                        transporter.sendMail(mailOptions, (err, info) => {
                          if (err) {
                            console.log(err);
                          } else {
                            console.log("Message sent: %s", info.messageId);
                            console.log(
                              "Preview URL: %s",
                              nodemailer.getTestMessageUrl(info)
                            );
                          }
                        });
                      });
                    })
                    .catch(err => {
                      console.log({
                        errorMessage: "Could not save email confirmation.",
                        error: err
                      });
                    });
                }
                if (req.body.newpassword) {
                  user.password = req.body.newpassword;
                  user.save(function(err) {
                    if (err) {
                      user.password = null;
                      res.status(200).json({
                        user,
                        errorMessage: "Could not save new password.",
                        error: err
                      });
                    } else {
                      const payload = {
                        id: user._id,
                        email: user.email,
                        password: user.password
                      };
                      const token = jwt.sign(payload, process.env.SECRET, {
                        expiresIn: 604800
                      });
                      user.password = null;
                      res.json({ token, user });
                    }
                  });
                } else {
                  user.password = null;
                  res.status(200).json({ user });
                }
              } else {
                user.password = null;
                res.status(200).json({
                  user,
                  errorMessage:
                    "The password you entered was invalid. To update your email or password please enter your current password."
                });
              }
            } else {
              user.password = null;
              res.status(200).json({ user });
            }
          }
        })
        .catch(err => {
          res
            .status(500)
            .json({ errorMessage: "Could not update.", error: err });
        });
    } else {
      res
        .status(500)
        .json({ errorMessage: "You do not have access to this user!" });
    }
  }
);

// PUT users/email/:id
// Update user email
UserRouter.get("/changeemail/:hash", (req, res) => {
  const hash = req.params.hash;
  const options = {
    new: true
  };

  EmailConfirmation.findOne({ hash: hash })
    .then(emailconfirmation => {
      if (emailconfirmation && emailconfirmation.newemail) {
        User.findOneAndUpdate(
          { _id: emailconfirmation.user },
          { email: emailconfirmation.newemail },
          options
        )
          .then(user => {
            // Deletes the now useless email confirmation if it still exists for some reason
            const oldemail = emailconfirmation.oldemail;
            EmailConfirmation.deleteOne({ _id: emailconfirmation.id })
              .then()
              .catch(err => {
                console.log({
                  errorMessage: "Could not delete email confirmation.",
                  error: err
                });
              });

            if (user !== null) {
              const payload = {
                id: user._id,
                email: user.email,
                password: user.password
              };
              const token = jwt.sign(payload, process.env.SECRET, {
                expiresIn: 604800
              });
              res.status(200).json({
                message: "You have successfully changed your email address!",
                email: oldemail,
                token
              });
            } else
              res.status(404).json({
                errorMessage:
                  "Your email could not be changed for some reason. Please try again."
              });
          })
          .catch(err => {
            res.status(500).json({
              errorMessage:
                "Your email could not be changed for some reason. Please try again.",
              error: err
            });
          });
      } else
        res.status(500).json({
          errorMessage:
            "Your email could not be changed for some reason. Please try again."
        });
    })
    .catch(err => {
      res.status(500).json({
        errorMessage:
          "Email confirmation could not be found. Please try again.",
        error: err
      });
    });
});

// PUT users/confirmemail/:hash
// Confirm user signup with an email
UserRouter.get("/confirmemail/:hash", (req, res) => {
  const hash = req.params.hash;
  const changes = {
    active: true
  };
  const options = {
    new: true
  };

  EmailConfirmation.findOne({ hash: hash })
    .then(emailconfirmation => {
      if (emailconfirmation) {
        User.findOneAndUpdate(
          { _id: emailconfirmation.user, active: false },
          changes,
          options
        )
          .then(user => {
            // Deletes the now useless email confirmation if it still exists for some reason
            EmailConfirmation.deleteOne({ _id: emailconfirmation.id })
              .then()
              .catch(err => {
                console.log({
                  errorMessage: "Could not delete email confirmation.",
                  error: err
                });
              });

            if (user !== null) {
              res
                .status(200)
                .json({ message: "You have successfully signed up!" });
            } else
              res.status(404).json({
                errorMessage:
                  "You took too long to confirm your email. Please register again and confirm your email within 30 minutes."
              });
          })
          .catch(err => {
            res.status(500).json({
              errorMessage:
                "Your account has already been activated or does not exist.",
              error: err
            });
          });
      } else
        res.status(500).json({
          errorMessage:
            "Your account has already been activated or does not exist."
        });
    })
    .catch(err =>
      res.status(404).json({
        errorMessage: "Could not find email confirmation in database.",
        error: err
      })
    );
});

// PUT users/forgotpassword/:id
// Create a temporary password if the user forgot theirs
UserRouter.put("/forgotpassword", (req, res) => {
  const email = req.body.email;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ errorMessage: "Invalid credentials." });
      }

      // pseudo random seed to make each hash different
      const random = crypto.randomBytes(20).toString("hex");
      // creates a hash
      const hash = crypto.createHash("sha256");
      // adds user id, secret and the randomly generated string to make a unique hash
      hash.update(user.id + process.env.SECRET + random);

      // This creates a new email confirmation waiting to be fulfilled. Once it is accessed successfully it should be deleted and the user activated.
      const newEmailConfirmation = new EmailConfirmation({
        hash: base64url(hash.digest("hex")) + "!",
        user: user._id
      });
      newEmailConfirmation
        .save()
        .then(emailconfirmation => {
          // This sends a test email that can set user.active to true, thus allowing them to use the sites functions.
          nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
              host: "smtp.ethereal.email",
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                user: account.user, // generated ethereal user
                pass: account.pass // generated ethereal password
              }
            });
            let mailOptions = {
              from: `"Fredegar Fu 👻" <forgotpassword@${websiteName}>`,
              to: `${user.email}`,
              subject: `Confirm your password change for ${websiteName}!`,
              text: `Please go to this link to reset your password: ${req.get(
                "host"
              )}${req.baseUrl}/resetpassword/${newEmailConfirmation.hash}`,
              html: `Please click this <a href=${req.get("host")}${
                req.baseUrl
              }/resetpassword/${newEmailConfirmation.hash}
          }>link</a> to reset your password.`
            };

            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                return res
                  .status(500)
                  .json({ errorMessage: "Could not send email.", error: err });
              }
              console.log("Message sent: %s", info.messageId);
              console.log(
                "Preview URL: %s",
                nodemailer.getTestMessageUrl(info)
              );
              res
                .status(200)
                .json({ message: "Email confirmation saved and email sent." });
            });
          });
        })
        .catch(err => {
          console.log({
            errorMessage: "Could not save email confirmation.",
            error: err
          });
        });

      res.status(200).json(user.email);
    })
    .catch(err => {
      res.status(500).json({
        errorMessage: "Could not change password. Please try again.",
        error: err
      });
    });
});

// PUT users/info/:id
// Update user information
UserRouter.get("/resetpassword/:hash", (req, res) => {
  const hash = req.params.hash;

  EmailConfirmation.findOne({ hash: hash })
    .then(emailconfirmation => {
      if (emailconfirmation) {
        User.findById(emailconfirmation.user)
          .then(user => {
            // Deletes the now useless email confirmation if it still exists for some reason
            EmailConfirmation.deleteOne({ _id: emailconfirmation.id })
              .then()
              .catch(err => {
                console.log({
                  errorMessage: "Could not delete email confirmation.",
                  error: err
                });
              });

            if (user !== null) {
              user.password = hash;
              user.save(function(err) {
                if (err) {
                  res.status(500).json({
                    errorMessage:
                      "There was an error setting the temporary password.",
                    error: err
                  });
                } else res.status(200).json({ message: "Temporary password set successfully!", password: hash });
              });
            } else
              res.status(404).json({
                errorMessage:
                  "You took too long to confirm your email. Please register again and confirm your email within 30 minutes."
              });
          })
          .catch(err => {
            res.status(500).json({
              errorMessage:
                "Your account has already been activated or does not exist.",
              error: err
            });
          });
      } else
        res.status(500).json({
          errorMessage:
            "Your account has already been activated or does not exist."
        });
    })
    .catch(err => {
      res.status(500).json({
        errorMessage: "Your password could not be reset for some reason.",
        error: err
      });
    });
});

module.exports = UserRouter;
