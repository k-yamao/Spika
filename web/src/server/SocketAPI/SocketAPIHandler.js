var _ = require('lodash');

var UsersManager = require("../lib/UsersManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var UserModel = require("../Models/UserModel");
var MessageModel = require("../Models/MessageModel");
var Settings = require("../lib/Settings");
var Observer = require("node-observer");


var SocketAPIHandler = {
    
    io:null,
    nsp : null,
    init: function(io){
        
        var self = this;
        this.io = io;
        this.nsp = io.of(Settings.options.socketNameSpace);
        
        this.nsp.on('connection', function(socket) {
        	
            require('./DisconnectActionHandler').attach(io,socket);
            require('./DisconActionHandler').attach(io,socket);
            require('./LoginActionHandler').attach(io,socket);
            require('./SigninActionHandler').attach(io,socket);
            require('./SendMessageActionHandler').attach(io,socket);
            require('./SendMsgActionHandler').attach(io,socket);
            require('./SendTypingActionHandler').attach(io,socket);
            require('./SendTypeActionHandler').attach(io,socket);
            require('./OpenMessageActionHandler').attach(io,socket);
            require('./OpenMsgActionHandler').attach(io,socket);
            require('./DeleteMessageActionHandler').attach(io,socket);
            require('./DeleteMsgActionHandler').attach(io,socket);
            socket.emit('text', 'socket.io OK!!');
            socket.on('hoge', function(param){
            	console.log(param);
            });
        });

    }
    
};

module["exports"] = SocketAPIHandler;