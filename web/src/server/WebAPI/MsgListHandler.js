var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');

var RequestHandlerBase = require("./RequestHandlerBase");
var PeoplesManager = require("../lib/PeoplesManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
var PeopleModel = require("../Models/PeopleModel");
var MsgModel = require("../Models/MsgModel");

var MessageListHandler = function(){
    
}

_.extend(MessageListHandler.prototype,RequestHandlerBase.prototype);

MessageListHandler.prototype.attach = function(router){
        
    var self = this;

    /**
     * @api {get} /message/list/:roomID/:lastMessageID Get messages sent to room
     * @apiName Get messages of the room
     * @apiGroup WebAPI
     * @apiDescription Get last 50 message from the room

     * @apiParam {String} RoomID ID of room
     * @apiParam {String} lastMessageID MessageID of last message already shown. To get last 50 message put this param 0
     *
     * @apiSuccess {String} Token
     * @apiSuccess {String} User Model of loginned user
     *     
     * @apiSuccessExample Success-Response:
{

{
    "code": 1,
    "data": [
        {
            "__v": 0,
            "_id": "55d2d194caf997b543836fc8",
            "created": 1439879572232,
            "message": "",
            "roomID": "test",
            "type": 1001,
            "user": {
                "userID": "test",
                "name": "test",
                "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                "token": "UI6yHxeyZnXOZ1EgT6g5ftwD",
                "created": 1439878817506,
                "_id": "55d2cea1caf997b543836fb2",
                "__v": 0
            },
            "userID": "test",
            "seenBy": [
                {
                    "user": {
                        "userID": "test2",
                        "name": "test2",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "YMsHeg3KEQIhtvt46W5fgnaf",
                        "created": 1439878824411,
                        "_id": "55d2cea8caf997b543836fb6",
                        "__v": 0
                    },
                    "at": 1439879572353
                },
                {
                    "user": {
                        "userID": "test3",
                        "name": "tset3",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "TahnOaC6JzldCh6gAmJs3jMC",
                        "created": 1439878820142,
                        "_id": "55d2cea4caf997b543836fb4",
                        "__v": 0
                    },
                    "at": 1439879572361
                }
            ]
        },
        ...
    ]
}

    */
    
    router.get('/:roomID/:lastMessageID',function(request,response){
                
        var roomID = request.params.roomID;
        var lastMessageID = request.params.lastMessageID;
        
        if(Utils.isEmpty(roomID)){
            
            self.successResponse(response,Const.resCodeMessageListNoRoomID);
                
            return;
            
        }
        
        async.waterfall([
        
            function (done) {

                MsgModel.findMessages(roomID,lastMessageID,Const.pagingLimit,function (err,data) {
                    
                    done(err,data);

                });
                
            },
            function (messages,done) {

                MsgModel.populateMsgs(messages,function (err,data) {
                    
                    done(err,data);

                });
                
            }
        ],
            function (err, data) {
                
                if(err){
                    self.setRes(response,Const.httpCodeInternalServerError,"server error", err);
                
                }else{
                	self.setRes(response,Const.httpCodeSucceed,"msg list success", data);
                }
                     
            }
            
        );
        
    });
    
    /**
     * メッセージを既読にする（msg.status = 1　にする）
     */
    router.get('/read/:roomID/:peopleID',function(request,response){
    	var roomID = request.params.roomID;
        var peopleID = request.params.peopleID;
       
        if(Utils.isEmpty(roomID)){
        	self.setRes(response,Const.httpCodeFileNotFound,"input roomID error", request);
            return;
        }
        if(Utils.isEmpty(peopleID)){
        	self.setRes(response,Const.httpCodeFileNotFound,"input peopleID error", request);
            return;
        }
        MsgModel.updateMsgsStatus(roomID, peopleID, function (err,data) {
            
        	if(err){
                self.setRes(response,Const.httpCodeInternalServerError,"server error", err);
            
            }else{
            	self.setRes(response,Const.httpCodeSucceed,"msg list success", data);
            }

        });
        
        
        
    });

}

new MessageListHandler().attach(router);
module["exports"] = router;
