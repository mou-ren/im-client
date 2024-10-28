let im = require("./im_pb")
let client = require("./ImClient")
let MessageUtil = require("./MessageUtil")

module.exports = Object.assign({}, im,client)
module.exports.MessageUtil = MessageUtil