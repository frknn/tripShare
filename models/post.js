var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    tripImage:      {type: String,  required: "Cannot be empty"},
    tripType:       {type: String,  required: "Cannot be empty"},
    tripCountry:    {type: String,  required: "Cannot be empty"},
    tripCity:       {type: String,  required: "Cannot be empty"},
    tripDate:       {type: Date,    required: "Cannot be empty"},
    tripDuration:   {type: String,  required: "Cannot be empty"},
    tripSummary:    {type: String,  required: "Cannot be empty"},
    tripArticle:    {type: String,  required: "Cannot be empty"},
    postDate:       {type: Date,    default: Date.now},
    ownerID:        {type: String,  required: "Cannot be empty"},
    ownerMail:      {type: String,  required: "Cannot be empty"},
    isConfirmed:    {type: Boolean, default: false}
});

module.exports = mongoose.model("Post",postSchema);