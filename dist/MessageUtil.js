"use strict";

var _im_pb = require("./im_pb");
function authMessage(userId, msgId) {
  let msg = new _im_pb.AuthMessage();
  msg.setUserid(userId);
  msg.setMsgid(msgId);
  msg.setTimestamp(Date.now());
  let message = new _im_pb.Message();
  message.setMessagetype(_im_pb.MessageType.AUTH);
  message.setVersion(1);
  message.setMessagebody(msg.serializeBinary());
  return message;
}
exports.authMessage = authMessage;