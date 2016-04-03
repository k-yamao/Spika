var express = require('express');
var router = express.Router();
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');


var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
var CounterModel = require("../Models/CounterModel");
var PeopleModel = require("../Models/PeopleModel");
var RoomModel = require("../Models/RoomModel");
var Settings = require("../lib/Settings");
var Const = require("../const");

var RoomLogic = {
    execute : function(param,onSuccess,onError){
        
        var roomID   = param.roomID;
        var peopleID = param.peopleID;
        var peoples  = param.peoples;
        var title    = param.title;
        
        // ピープルIDの必須チェック
        if (Utils.isEmpty(peopleID)) {
        	onError("input error peopleID", Const.httpCodeBadRequest);
            return;
        }
        
        // ピープル配列のチェック
        if(!Utils.isEmpty(peoples) && !_.isArray(peoples)){
        	peoples = [peoples];
        }
        
        if (Utils.isEmpty(title)) {
        	title = "";
        }
        
        
        var data = {
            	roomID : "",
            	peopleID : peopleID, 
            	rooms : []
        }
       
        if(Utils.isEmpty(roomID)){
        	
        	// roomIDがすでに存在しないかチェック
        	this.checkRoom(peopleID,peoples, function (err,roomID) {

        		//console.log(roomID);
        		//onSuccess(data);
        		//return;
        		
        		
        		if (Utils.isEmpty(roomID)) {
	         	
		        	// roomIDを新規発行  カウンターからピープルIDを取得する
		        	CounterModel.getNewId("rooms", function (err,counter) {
		    		
		        		data.roomID = counter.seq;
		        		// ピープル配列にオーナーピープルも追加
		        		peoples.push({peopleID : peopleID});
		        		
		        		var cnt = peoples.length - 1;
		
						peoples.forEach(function(people, index){
							// roomドキュメントへメンバーを登録        		
							var newRoom = new DatabaseManager.roomModel({
							    roomID    : counter.seq,
								peopleID  : people.peopleID,
								title     : title,
							    updated   : Utils.now(),
							    created   : Utils.now()
							});
							
							// 新規登録
							newRoom.save(function(err,room){
								 if(err){            			 
									 onError("room save fail", Const.httpCodeInternalServerError);
							         return;
								 } else {
									 data.rooms.push(room);
									 
									 if(cnt == index) {
										onSuccess(data);
										return;
									 }
		
								 }
							});
							
		       		    });
		        	});
        		} else {

        			// roomを検索してあれば、ルームIDとメンバーを返す
                	RoomModel.findRoomByroomID(roomID,function (err,rooms) {
                		
                		if(err){  
                			onError("get room fail", Const.response,Const.httpCodeInternalServerError);
                		} else {
                			data.roomID = roomID;
                			data.rooms.push(rooms);
                			if(onSuccess)
                                onSuccess(data);
                			return;
                		}
                	});
        			
        		}        		
        	});
        } else {            // roomIDあり
        	// roomを検索してあれば、ルームIDとメンバーを返す
        	RoomModel.findRoomByroomID(roomID,function (err,rooms) {
        		
        		if(err){  
        			onError("get room fail", Const.response,Const.httpCodeInternalServerError);
        		} else {
        			data.roomID = roomID;
        			data.rooms.push(rooms);
        			if(onSuccess)
                        onSuccess(data);
        			return;
        		}
        	});
        	
        	
        }
    },
	checkRoom : function(peopleID, peoples, callBack){
		// ルーム作成相手のチェック用オブジェクト
		var peopleCheck       = {
				roomID    : null,
				peopleIDs : [],
				peopleCnt : 0
		};
		// ルーム作成相手のpeopleIDを格納
		peoples.forEach(function(p, index){
			peopleCheck.peopleIDs.push(p.peopleID);
			peopleCheck.peopleCnt++;
	    });
		

		// roomIDなしのときpeopleIDからすでにroomがあるか検索してみる（重複してroom作成されることの防止）
		RoomModel.findRoomBypeopleID(peopleID,function (err,rooms) {
			if (rooms.length > 0) {
			//if (false) {
				// 
				rooms.forEach(function(room, roomidx){
	        		//roomList.push(room);
	            	// roomを検索してあれば、ルームIDとメンバーを返す
					RoomModel.findRoomPeople(room.roomID,room, function (err,rs) {               		
	               		var checkCnt = 0;
	               		//console.log(rs.roomID);
	               		// roomのpeopleをループ
	               		rs.peoples.forEach(function(p, peopleidx){
	               			//console.log("ピープルID："+p.peopleID);
	               			//console.log("ピープル　indexof:"+peopleCheck.peopleIDs.indexOf(p.peopleID));
	                   		// roomのpeopleをチェックしてあれば、カウント
	               			if (peopleCheck.peopleIDs.indexOf(p.peopleID) >= 0){
	               				
	               				checkCnt++;
	               			}
	               			
	               			//console.log('ピープルインデックス' + peopleidx);
	               			if (peopleidx == (rs.peoples.length -1)){
//	               				console.log("peoplecheck:" +peopleCheck.peopleCnt);
//	               				console.log("check:"+checkCnt);
	               				if (peopleCheck.peopleCnt == checkCnt && peopleCheck.peopleCnt == (rs.peoples.length -1)) {
	               					peopleCheck.roomID = rs.roomID;
	               				}              				
	               				
	               				if (roomidx == (rooms.length - 1)) {
		               				// リクエストのピープルを含むルームがあったのルームIDを返す
	               					callBack(err,peopleCheck.roomID);
	               				}
	               			}
	               		});
	               	});
	    		});
			} else {
				callBack(err,null);
				return;
			}
		});
	}
}

module["exports"] = RoomLogic;