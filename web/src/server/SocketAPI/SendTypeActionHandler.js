var _ = require('lodash');
var Observer = require("node-observer");

var PeoplesManager = require("../lib/PeoplesManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var SocketHandlerBase = require("./SocketHandlerBase");
var PeopleModel = require("../Models/PeopleModel");
var Settings = require("../lib/Settings");

var BridgeManager = require('../lib/BridgeManager');

var SendTypeActionHandler = function(){
    
}

_.extend(SendTypeActionHandler.prototype,SocketHandlerBase.prototype);

SendTypeActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "sendTyping" Send typing notification
     * @apiName Typing Notification
     * @apiGroup Socket 
     * @apiDescription Send typing notification

     * @apiParam {string} userID User ID
     * @apiParam {string} roomID Room ID
     * @apiParam {string} type 0: Remove typing notificaiton 1: Show typing notification
     *
     */
     
    socket.on('sendType', function(param){

        if(Utils.isEmpty(param.peopleID)){
            socket.emit('socketerror', {code:Const.resCodeSocketTypingNoUserID});
            return;
        }
        
        if(Utils.isEmpty(param.roomID)){
            socket.emit('socketerror', {code:Const.resCodeSocketTypingNoRoomID});
            return;
        }
        
        if(Utils.isEmpty(param.type)){
            socket.emit('socketerror', {code:Const.resCodeSocketTypingNoType});
            return;
        }
        
        BridgeManager.hook('type',param,function(result){
            
            if(result == null || result.canSend){
                
                PeopleModel.findPeopleById(param.peopleID,function (err,people) {
                    
                    if(err){
                        socket.emit('socketerror', {code:Const.resCodeSocketTypingFaild});
                        return;   
                    }
                    
                    param.people = people;
                    io.of(Settings.options.socketNameSpace).in(param.roomID).emit('sendTyping', param);
                    Observer.send(this, Const.notificationUserTyping, param);
        
                    
                });
            
            }
            
        });
        
    });

}


module["exports"] = new SendTypeActionHandler();