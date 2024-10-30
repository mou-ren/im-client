function generateMsgId(userId,timestamp){
    return userId+"_"+timestamp+"0000";
}
exports.generateMsgId = generateMsgId