const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Resume = new Schema({
  user: {
    type: ObjectId,
    ref: "User"
  },
  template: {
    type: String,
    default: "traditional",
    required: true
  },
  title: [
    {
      id: Number,
      value: Boolean
    }
  ],
  links: {
    linkedin: Boolean,
    github: Boolean,
    portfolio: Boolean
  },
  sections: {
    experience: [
      {
        id: Number,
        value: Boolean
      }
    ],
    education: [
      {
        id: Number,
        value: Boolean
      }
    ],
    summary: [
      {
        id: Number,
        value: Boolean
      }
    ],
    skills: [
      {
        id: Number,
        value: Boolean
      }
    ]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", Resume);
