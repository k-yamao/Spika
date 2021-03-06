var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');

var RequestHandlerBase = require("./RequestHandlerBase");
var UsersManager = require("../lib/UsersManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

var UserListHandler = function(){
    
}

_.extend(UserListHandler.prototype,RequestHandlerBase.prototype);

UserListHandler.prototype.attach = function(app){
        
    var self = this;

    /**
     * @api {get} /user/list/:roomID  Get List of Users in room
     * @apiName Get User List
     * @apiGroup WebAPI
     * @apiDescription Get list of users who are currently in the room

     * @apiParam {String} roomID ID of the room
     *
     *     
     * @apiSuccessExample Success-Response:
{
  "success": 1,
  "result": [
    {
      "userID": "test",
      "name": "test",
      "avatarURL": "http://localhost:8080/img/noavatar.png",
      "roomID": "test",
      "socketID": "Znw8kW-ulKXBMoVAAAAB"
    },
    {
      "userID": "test2",
      "name": "test2",
      "avatarURL": "http://localhost:8080/img/noavatar.png",
      "roomID": "test",
      "socketID": "xIBEwT0swJwjcI2hAAAC"
    }
  ]
}
    */
    app.get(this.path('/user/list/:roomID'),function(request,response){
        var roomID = request.params.roomID;
        var users = UsersManager.getUsers(roomID);

        
        self.successResponse(response,users);
        
    });


}


module["exports"] = new UserListHandler();