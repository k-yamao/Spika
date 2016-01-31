
var _ = require('lodash');

var PeoplesManager = require("../lib/PeoplesManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var PeopleModel = require("../Models/PeopleModel");
var MsgModel = require("../Models/MsgModel");
var Settings = require("../lib/Settings");
var Observer = require("node-observer");

var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

var SendMsg = {
    execute : function(peopleID,param,onSucess,onError){
        
        //save to DB
    	PeopleModel.findUserbyId(peopleID,function (err,user) {
                        
            var objMessage = {
                user:user._id,
                peopleID: userID,
                roomID: param.roomID,
                message: param.message,
                localID: param.localID,
                type: param.type,
                file: null,
                created: Utils.now()                   
            };
            
            if(!Utils.isEmpty(param.file)){
                
                objMessage.file = {
                    file : {
		                id: param.file.file.id,
    		            name: param.file.file.name,
    		            size: param.file.file.size,
    		            mimeType: param.file.file.mimeType
                    }
                };
                
                if(!Utils.isEmpty(param.file.thumb)){
                 
                    objMessage.file.thumb = {
		                id: param.file.thumb.id,
    		            name: param.file.thumb.name,
    		            size: param.file.thumb.size,
    		            mimeType: param.file.thumb.mimeType
                    };
                
                }
                
            }

            if(!Utils.isEmpty(param.location)){
                
                objMessage.location = param.location;

            }
            
            // save to database
            var newMessage = new DatabaseManager.msgModel(objMessage);

            newMessage.save(function(err,msg){

                if(err) {
                    if(onError)
                        onError(err);
                }

                MsgModel.populateMessamsgsage,function (err,data) {
                                        
                    var messageObj = data[0];
                    messageObj.localID = '';
                    messageObj.deleted = 0;
                    
                    if(!Utils.isEmpty(param.localID))
                        messageObj.localID = param.localID;
                                        
                    SocketAPIHandler.io.of(Settings.options.socketNameSpace).in(param.roomID).emit('newMessage', data[0]);
                    Observer.send(this, Const.notificationSendMessage, data[0]);
                    
                    if(onSucess)
                        onSucess(msg);

                });

            });
            
        });

    }
}

module["exports"] = SendMsg;