var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');

var DatabaseManager = {
    
    messageModel:null,
    msgModel:null,
    peopleModel:null,
    boardModel:null,
    counterModel:null,
    userModel:null,
    fileModel:null,
    roomModel:null,
    pickModel:null,
    reportModel:null,
    
    init: function(options){
		
		var self = this;
		
        // Connection to our chat database
        console.log("Connecting mongoDB " + options.chatDatabaseUrl);
        
        try{
            
            if(!mongoose.connection.readyState){
    
                mongoose.connect(options.chatDatabaseUrl, function(err){

                    if (err) {
                        
                        console.log("Failed to connect MongoDB!");
                        console.error(err);
                        
                    } else {
                        
                        // Defining a schema
                        self.setupSchema();
                        
                    }
                });
                
            } else {

                // Defining a schema
                self.setupSchema();                        
            }

	
        } catch(ex){
	        
	        console.log("Failed to connect MongoDB!");

	        throw ex;
	        
        }

    },
    
    setupSchema : function(){
    	
    	
    	this.peopleModel = require('../Models/PeopleModel').init();
    	this.boardModel = require('../Models/BoardModel').init();
    	this.counterModel = require('../Models/CounterModel').init();
    	this.msgModel = require('../Models/MsgModel').init();
        this.messageModel = require('../Models/MessageModel').init();
        this.userModel = require('../Models/UserModel').init();
        this.fileModel = require('../Models/FileModel').init();
        this.roomModel = require('../Models/RoomModel').init();
        this.pickModel = require('../Models/PickModel').init();
        this.reportModel = require('../Models/ReportModel').init();
        
    }
}

module["exports"] = DatabaseManager;