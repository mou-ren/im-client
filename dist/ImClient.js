"use strict";

function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const MessageUtil = require("./MessageUtil");
const {
  TextContent,
  FileContent,
  ChatMessage,
  Message,
  MessageType,
  AuthMessage
} = require("./im_pb");
class ImClient {
  static defaultHandler(res) {
    console.log(res);
  }
  static connect(url) {
    let openHandler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ImClient.defaultHandler;
    let messageHandler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ImClient.defaultHandler;
    let closeHandler = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ImClient.defaultHandler;
    let errorHandler = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ImClient.defaultHandler;
    var client = new ImClient(url, openHandler, messageHandler, closeHandler, errorHandler);
    client.connect();
    return client;
  }
  constructor(url) {
    let openHandler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ImClient.defaultHandler;
    let messageHandler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ImClient.defaultHandler;
    let closeHandler = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ImClient.defaultHandler;
    let errorHandler = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ImClient.defaultHandler;
    _defineProperty(this, "url", void 0);
    _defineProperty(this, "openHandler", void 0);
    _defineProperty(this, "messageHandler", void 0);
    _defineProperty(this, "errorHandler", void 0);
    _defineProperty(this, "closeHandler", void 0);
    _defineProperty(this, "_ws", void 0);
    _defineProperty(this, "_open", false);
    _defineProperty(this, "userId", void 0);
    this.url = url;
    this.openHandler = openHandler;
    this.messageHandler = messageHandler;
    this.errorHandler = errorHandler;
    this.closeHandler = closeHandler;
  }
  connect() {
    console.log('websocket starting');
    this._ws = new WebSocket(this.url);
    this._ws.binaryType = "arraybuffer";
    let client = this;
    this._ws.onopen = function () {
      function f(res) {
        client._onopen(res);
      }
      return f;
    }();
    this._ws.onmessage = function () {
      function f(res) {
        client._onmessage(res);
      }
      return f;
    }();
    this._ws.onerror = function () {
      function f(res) {
        client._onerror(res);
      }
      return f;
    }();
    this._ws.onclose = function () {
      function f(res) {
        client._onclose(res);
      }
      return f;
    }();
  }
  close() {
    client._open = false;
    this._ws.close();
  }
  _send(buffer) {
    if (this._ws.readyState == 1) {
      this._ws.send(buffer);
      return true;
    } else {
      return false;
    }
  }
  login(userId) {
    let timestamp = Date.now();
    let msg = new AuthMessage();
    msg.setUserid(userId);
    msg.setMsgid(MessageUtil.generateMsgId(userId, timestamp));
    msg.setTimestamp(timestamp);
    let message = new Message();
    message.setMessagetype(MessageType.AUTH);
    message.setVersion(1);
    message.setMessagebody(msg.serializeBinary());
    this._send(message.serializeBinary());
    this.userId = userId;
  }
  sendText(toUid, content) {
    let timestamp = Date.now();
    let text = new TextContent();
    text.setText(content);
    var msg = new ChatMessage();
    msg.setUserid(this.userId);
    msg.setMsgid(MessageUtil.generateMsgId(this.userId, timestamp));
    msg.setTimestamp(timestamp);
    msg.setFrom(this.userId);
    msg.setTo(toUid);
    msg.setTextcontent(text);
    var message = new Message();
    message.setMessagetype(MessageType.CHAT);
    message.setVersion(1);
    message.setMessagebody(msg.serializeBinary());
    return this._send(message.serializeBinary());
  }
  sendFile(toUid, filename, url, type) {
    let timestamp = Date.now();
    let fileContent = new FileContent();
    fileContent.setFilename(filename);
    fileContent.setUrl(url);
    fileContent.setType(type);
    var msg = new ChatMessage();
    msg.setUserid(this.userId);
    msg.setMsgid(MessageUtil.generateMsgId(this.userId, timestamp));
    msg.setTimestamp(timestamp);
    msg.setFrom(this.userId);
    msg.setTo(toUid);
    msg.setFileContent(fileContent);
    var message = new Message();
    message.setMessagetype(MessageType.CHAT);
    message.setVersion(1);
    message.setMessagebody(msg.serializeBinary());
    return this._send(message.serializeBinary());
  }
  _onopen(res) {
    this._open = true;
    if (this.openHandler) {
      this.openHandler(res);
    }
  }
  _onmessage(res) {
    if (this.messageHandler) {
      this.messageHandler(res);
    }
  }
  _onerror(res) {
    if (this.errorHandler) {
      this.errorHandler(res);
    }
  }
  _onclose(res) {
    if (this._open) {
      this.connect();
      return;
    }
    if (this.closeHandler) {
      this.closeHandler(res);
    }
  }
}
exports.ImClient = ImClient;