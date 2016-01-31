var _ = require('lodash');

var PeoplesManager = require("../lib/PeoplesManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var SocketHandlerBase = require("./SocketHandlerBase");
var PeopleModel = require("../Models/PeopleModel");
var Settings = require("../lib/Settings");

var DisconActionHandler = function(){
    
}

_.extend(DisconActionHandler.prototype,SocketHandlerBase.prototype);

DisconActionHandler.prototype.attach = function(io,socket){
        
    var self = this;
    
    socket.on('discon', function () {
        
        var roomID = PeoplesManager.getRoomBySocketID(socket.id);
        var people = PeoplesManager.getPeopleBySocketID(socket.id);
                        
        if(!_.isNull(people)){
        
            PeoplesManager.removePeople(roomID,people.peopleID);
            socket.leave(roomID);
            
            io.of(Settings.options.socketNameSpace).in(roomID).emit('peopleLeft', people);
            
            if(Settings.options.sendAttendanceMessage){

                //save as message
            	PeopleModel.findPeopleById(people.peopleID,function (err,people) {
                    
                    // save to database
                    var newMessage = new DatabaseManager.messageModel({
                        people:people._id,
                        peopleID: people.peopleID,
                        roomID: roomID,
                        message: '',
                        type: Const.messageUserLeave,
                        created: Utils.now()                   
                    });
                                
                    newMessage.save(function(err,message){
                    
                        if(err) throw err;
                
                        var messageObj = message.toObject();
                        messageObj.people = people.toObject();
                        
                        io.of(Settings.options.socketNameSpace).in(roomID).emit('newMessage', messageObj);
                        
                    });
                    
                });
            
            }
            
        } else {
            
        }
        
    });

}


module["exports"] = new DisconActionHandler();