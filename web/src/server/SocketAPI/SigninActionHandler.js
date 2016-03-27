var _ = require('lodash');
var Observer = require("node-observer");

var PeoplesManager = require("../lib/PeoplesManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var SocketHandlerBase = require("./SocketHandlerBase");
var PeopleModel = require("../Models/PeopleModel");
var Settings = require("../lib/Settings");

var LoginActionHandler = function(){
    
}

_.extend(LoginActionHandler.prototype,SocketHandlerBase.prototype);

LoginActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "login" Login to the room
     * @apiName Login to room
     * @apiGroup Socket 
     * @apiDescription Login to room
     * @apiParam {string} roomID Room ID
     *
     */
    socket.on('signin', function(param){
                    
        if(Utils.isEmpty(param.peopleID)){  
            socket.emit('socketerror', {code:Const.resCodeSocketLoginNoUserID});               
            return;
        }

        if(Utils.isEmpty(param.roomID)){                 
            socket.emit('socketerror', {code:Const.resCodeSocketLoginNoRoomID});               
            return;
        }
    
                
        socket.join(param.roomID);
        io.of(Settings.options.socketNameSpace).in(param.roomID).emit('newPeople', param);
        Observer.send(this, Const.notificationNewUser, param);

        //save as message
        PeopleModel.findPeopleById(param.peopleID,function (err,people) {
            
            if(_.isEmpty(people)){
                

            }
            
            PeoplesManager.addPeople(param.peopleID,people.name,people.avatarURL,param.roomID,people.token);
            PeoplesManager.pairSocketIDandPeopleID(param.peopleID,socket.id);            

            if(Settings.options.sendAttendanceMessage){
            
                // save to database
                var newMsg = new DatabaseManager.msgModel({
                    people:people._id,
                    peopleID: param.peopleID,
                    roomID: param.roomID,
                    msg: 'join',
                    type: Const.messageNewUser,
                    created: Utils.now()                   
                });
                            
                newMsg.save(function(err,msg){
                
                    if(err) {
                        socket.emit('socketerror', {code:Const.resCodeSocketUnknownError});               
                        return;
                    }
            
                    var msgObj = msg.toObject();
                    msgObj.people = people.toObject();
                    
                    io.of(Settings.options.socketNameSpace).in(param.roomID).emit('newMsg', msgObj);
                    
                });
                            
            }
            
        });                
        
    });

}


module["exports"] = new LoginActionHandler();