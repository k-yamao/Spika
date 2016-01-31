var _ = require('lodash');
var Observer = require("node-observer");

var PeoplesManager = require("../lib/PeoplesManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var SocketHandlerBase = require("./SocketHandlerBase");
var PeopleModel = require("../Models/PeopleModel");
var MsgModel = require("../Models/MsgModel");
var async = require("async");
var Settings = require("../lib/Settings");

var OpenMsgActionHandler = function(){
    
}

_.extend(OpenMsgActionHandler.prototype,SocketHandlerBase.prototype);

OpenMsgActionHandler.prototype.attach = function(io,socket){
        
    var self = this;
    
    /**
     * @api {socket} "openMessage" Open Message
     * @apiName Notify message is read
     * @apiGroup Socket 
     * @apiDescription Called when user read message

     * @apiParam {string} userID User ID
     * @apiParam {string} messageIDs Array of message ID
     *
     */
     
    /**
     * @api {socket} "messageUpdated" Message Updated
     * @apiName Message Updated
     * @apiGroup Socket 
     * @apiDescription Sent from server when message state is changed

     * @apiSuccessExample Success-Response:
[
    "messageUpdated",
    [
        {
            "_id": "55d1f1336b040b99044e97f0",
            "user": {
                "userID": "test2",
                "name": "test2",
                "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                "token": "YMsHeg3KEQIhtvt46W5fgnaf",
                "created": 1439878824411,
                "_id": "55d2cea8caf997b543836fb6",
                "__v": 0
            },            "userID": "test",
            "roomID": "test",
            "message": "dd",
            "type": 1,
            "created": 1439822131327,
            "__v": 0,
            "seenBy": [
                {
                    "user": {
                        "userID": "test2",
                        "name": "test2",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "08WwesxDe1ATtOfre4LAitrS",
                        "created": 1439878824411,
                        "_id": "55d2cea8caf997b543836fb6",
                        "__v": 0
                    },
                    "at": 1439879208391
                },
                {
                    "user": {
                        "userID": "test3",
                        "name": "tset3",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "33Tca8hxgfKImWJDscmpQyfv",
                        "created": 1439878820142,
                        "_id": "55d2cea4caf997b543836fb4",
                        "__v": 0
                    },
                    "at": 1439879208418
                }
            ]
        },
        {
            "_id": "55d1f1bb320cb59b04267b58",
            "user": {
                "userID": "test2",
                "name": "test2",
                "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                "token": "YMsHeg3KEQIhtvt46W5fgnaf",
                "created": 1439878824411,
                "_id": "55d2cea8caf997b543836fb6",
                "__v": 0
            },            "userID": "test2",
            "roomID": "test",
            "message": "",
            "type": 1001,
            "created": 1439822267211,
            "__v": 0,
            "seenBy": [
                {
                    "user": {
                        "userID": "test2",
                        "name": "test2",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "08WwesxDe1ATtOfre4LAitrS",
                        "created": 1439878824411,
                        "_id": "55d2cea8caf997b543836fb6",
                        "__v": 0
                    },
                    "at": 1439879208391
                },
                {
                    "user": {
                        "userID": "test3",
                        "name": "tset3",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "33Tca8hxgfKImWJDscmpQyfv",
                        "created": 1439878820142,
                        "_id": "55d2cea4caf997b543836fb4",
                        "__v": 0
                    },
                    "at": 1439879208418
                }
            ]
        }
        ...
    ]
]
    */
    

    
    socket.on('openMsg', function(param){

        if(Utils.isEmpty(param.userID)){
            socket.emit('socketerror', {code:Const.resCodeSocketOpenMessageNoUserID});               
            return;
        }
        
        if(Utils.isEmpty(param.messageIDs)){
            socket.emit('socketerror', {code:Const.resCodeSocketOpenMessageNoMessageID});               
            return;
        }
        
        if(!_.isArray(param.messageIDs)){
            socket.emit('socketerror', {code:Const.resCodeSocketOpenMessageNoMessageID});               
            return;
        }
        
        var updatedMessages = [];
        
    
        PeopleModel.findPeopleById(param.userID,function (err,people) {

            async.forEach(param.messageIDs, function (messageID, callback){ 

                MsgModel.findMessagebyId(messageID,function(err,message){
                    
                    if(err) {
                        socket.emit('socketerror', {code:Const.resCodeSocketUnknownError});               
                        return;
                    }
                    

                    if(!message){
                        socket.emit('socketerror', {code:Const.resCodeSocketUnknownError});               
                        return;
                    } 
                                        
                    var listOfPeoples = [];
                    
                    _.forEach(message.seenBy,function(seenObj){
                           
                        listOfPeoples.push(seenObj.people.toString());
                        
                    });
                                        
                    if(_.indexOf(listOfPeoples,people._id.toString()) == -1){
                        
                        message.addSeenBy(people,function(err,messageUpdated){
                            
                            updatedMessages.push(messageUpdated);
                            callback(err);
                            
                        });
                        
                    }
                    
                });
                
        
            }, function(err) {

                if(err) {
                    socket.emit('socketerror', {code:Const.resCodeSocketUnknownError});               
                    return;
                }
                    
                    
                MsgModel.populateMessages(updatedMessages,function (err,messages) {

                    if(err) {
                        socket.emit('socketerror', {code:Const.resCodeSocketUnknownError});               
                        return;
                    }
                    
                    if(messages.length > 0){
    
                        // send updated messages
                        io.of(Settings.options.socketNameSpace).in(messages[0].roomID).emit('messageUpdated', messages);
                        Observer.send(this, Const.notificationMessageChanges, messages);
                        
                    }

                });

            });  

        });

    });

}


module["exports"] = new OpenMsgActionHandler();