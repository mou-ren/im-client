import {AuthMessage, Message, MessageType} from "./im_pb";

function authMessage(userId,msgId){
    let msg = new AuthMessage();
    msg.setUserid(userId)
    msg.setMsgid(msgId)
    msg.setTimestamp(Date.now())

    let message = new Message()
    message.setMessagetype(MessageType.AUTH);
    message.setVersion(1)
    message.setMessagebody(msg.serializeBinary())

    return message
}

exports.authMessage = authMessage