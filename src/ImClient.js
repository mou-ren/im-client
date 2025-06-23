const MessageUtil = require("./MessageUtil")
const {TextContent, FileContent, ChatMessage, Message, MessageType, AuthMessage} = require("./im_pb");


class ImClient {
    url;
    openHandler;
    messageHandler;
    errorHandler;
    closeHandler;
    _ws;
    _open=false;
    userId;

    static defaultHandler(res){
        console.log(res)
    }
    static connect(url,
                   openHandler = ImClient.defaultHandler,
                   messageHandler = ImClient.defaultHandler,
                   closeHandler = ImClient.defaultHandler,
                   errorHandler = ImClient.defaultHandler){

        var client = new ImClient(url, openHandler, messageHandler, closeHandler, errorHandler)
        client.connect();
        return client
    }
    constructor(url,
                openHandler = ImClient.defaultHandler,
                messageHandler = ImClient.defaultHandler,
                closeHandler = ImClient.defaultHandler,
                errorHandler = ImClient.defaultHandler) {
        this.url=url
        this.openHandler = openHandler;
        this.messageHandler = messageHandler;
        this.errorHandler = errorHandler;
        this.closeHandler = closeHandler;
    }
    connect(){
        console.log('websocket starting');
        this._ws = new WebSocket(this.url)
        this._ws.binaryType = "arraybuffer"
        let client = this
        this._ws.onopen = (function () {
            function f(res) {
                client._onopen(res)
            }
            return f
        })();
        this._ws.onmessage =  (function () {
            function f(res) {
                client._onmessage(res)
            }
            return f
        })();
        this._ws.onerror =  (function () {
            function f(res) {
                client._onerror(res)
            }
            return f
        })();
        this._ws.onclose =  (function () {
            function f(res) {
                client._onclose(res)
            }
            return f
        })();
    }
    close(){
        client._open = false;
        this._ws.close();
    }
    _send(buffer){
        if(this._ws.readyState == 1){
            this._ws.send(buffer)
            return true;
        } else {
            return false
        }
    }
    login(userId){
        let timestamp = Date.now()
        let msg = new AuthMessage();
        msg.setUserid(userId)
        msg.setMsgid(MessageUtil.generateMsgId(userId,timestamp))
        msg.setTimestamp(timestamp)

        let message = new Message()
        message.setMessagetype(MessageType.AUTH);
        message.setVersion(1)
        message.setMessagebody(msg.serializeBinary())

        this._send(message.serializeBinary())
        this.userId = userId
    }
    sendText(toUid,content){
        let timestamp = Date.now()
        let text = new TextContent();
        text.setText(content);

        var msg = new ChatMessage();
        msg.setUserid(this.userId)
        msg.setMsgid(MessageUtil.generateMsgId(this.userId,timestamp))
        msg.setTimestamp(timestamp)
        msg.setFrom(this.userId)
        msg.setTo(toUid)
        msg.setTextcontent(text)

        var message = new Message()
        message.setMessagetype(MessageType.CHAT);
        message.setVersion(1)
        message.setMessagebody(msg.serializeBinary())
        return this._send(message.serializeBinary())
    }
    sendFile(toUid,filename,url,type){
        let timestamp = Date.now()
        let fileContent = new FileContent();
        fileContent.setFilename(filename);
        fileContent.setUrl(url);
        fileContent.setType(type);

        var msg = new ChatMessage();
        msg.setUserid(this.userId)
        msg.setMsgid(MessageUtil.generateMsgId(this.userId,timestamp))
        msg.setTimestamp(timestamp)
        msg.setFrom(this.userId)
        msg.setTo(toUid)
        msg.setTextcontent(text)

        var message = new Message()
        message.setMessagetype(MessageType.CHAT);
        message.setVersion(1)
        message.setMessagebody(msg.serializeBinary())
        return this._send(message.serializeBinary())
    }
    _onopen(res){
        this._open = true;
        if(this.openHandler){
            this.openHandler(res)
        }
    }
    _onmessage(res){
        if(this.messageHandler){
            this.messageHandler(res)
        }
    }
    _onerror(res){
        if(this.errorHandler){
            this.errorHandler(res)
        }
    }
    _onclose(res){
        if(this._open){
            this.connect()
            return;
        }
        if(this.closeHandler){
            this.closeHandler(res)
        }
    }
}


exports.ImClient = ImClient