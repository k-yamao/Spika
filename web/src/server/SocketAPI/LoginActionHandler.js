var _ = require('lodash');
var Observer = require("node-observer");

var UsersManager = require("../lib/UsersManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var SocketHandlerBase = require("./SocketHandlerBase");
var UserModel = require("../Models/UserModel");
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
    socket.on('login', function(param){
                                        
        socket.join(param.roomID);
                
        io.of(Settings.options.socketNameSpace).in(param.roomID).emit('newUser', param);
        Observer.send(this, Const.notificationNewUser, param);

        if(Utils.isEmpty(param.userID)){
            console.log('err');                    
            return;
        }
        
        //save as message
        UserModel.findUserbyId(param.userID,function (err,user) {
            
            UsersManager.addUser(param.userID,user.name,user.avatarURL,param.roomID,user.token);
            UsersManager.pairSocketIDandUserID(param.userID,socket.id);            

            if(Settings.options.sendAttendanceMessage){
            
                // save to database
                var newMessage = new DatabaseManager.messageModel({
                    user:user._id,
                    userID: param.userID,
                    roomID: param.roomID,
                    message: '',
                    type: Const.messageNewUser,
                    created: Utils.now()                   
                });
                            
                newMessage.save(function(err,message){
                
                    if(err) throw err;
            
                    var messageObj = message.toObject();
                    messageObj.user = user.toObject();
                    
                    io.of(Settings.options.socketNameSpace).in(param.roomID).emit('newMessage', messageObj);
                    
                });
                            
            }
            
        });                
        
    });

}


module["exports"] = new LoginActionHandler();