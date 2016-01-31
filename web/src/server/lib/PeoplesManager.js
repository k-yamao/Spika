var _ = require('lodash');

var PeoplesManager = {
    
    rooms:{},
    addPeople: function(id,name,avatarURL,roomID,token){
        
        var people = {
            peopleID: id,
            name: name,
            avatarURL: avatarURL,
            roomID: roomID,
            token: token,
            socketID: ''
        };
         
        if(_.isUndefined(this.rooms[roomID])){
            this.rooms[roomID] = {};
        }

        if(_.isEmpty(this.rooms[roomID])){
            this.rooms[roomID] = {
                peoples:{}
            };
        }
                        
        if(_.isUndefined(this.rooms[roomID].peoples[id]))
            this.rooms[roomID].peoples[id] = people;
        
        this.rooms[roomID].peoples[id] = people;
                
    },
    removePeople: function(roomID,usPeople){
                
        delete this.rooms[roomID].peoples[peopleID];
                
    },
    getPeoples: function(roomID){
        
        if(!this.rooms[roomID])
            this.rooms[roomID] = {};
            
        var peoples = this.rooms[roomID].peoples;
                
        // change to array
        var peoplesAry = [];
        
        _.forEach(peoples, function(row, key) {
                                
            peoplesAry.push(row);
            
        });
            
        return peoplesAry;
        
    },
    getRoomByPeopleID: function(peopleID){
        
        var roomsAry = [];
        
        _.forEach(this.rooms, function(room, roomID) {
                                
            _.forEach(room.peoples, function(people, key) {
                                    
                if(people.peopleID == peopleID)
                    roomsAry.push(roomID);
                
            });
                
        });
        
        return roomsAry;
        
    },
    pairSocketIDandPeopleID: function(peopleID,socketID){
        
        _.forEach(this.rooms, function(room, roomID) {
                                
            _.forEach(room.peoples, function(people) {
                                    
                if(people.peopleID == peopleID)
                    people.socketID = socketID;
                
                                
            });
            
        });
                
    },
    getPeopleBySocketID: function(socketID){
        
        var peopleResult = null;
        
        _.forEach(this.rooms, function(room, roomID) {
                                
            _.forEach(room.peoples, function(people) {
                                                
                if(people.socketID == socketID)
                    peopleResult = people;
                                
            });

        });
                
        return peopleResult;
        
    },
    getRoomBySocketID: function(socketID){
        
        var roomResult = null;
        
        _.forEach(this.rooms, function(room, roomID) {
                                
            _.forEach(room.peoples, function(people) {
                            
                if(people.socketID == socketID)
                    roomResult = roomID;
                                
            });

        });
                
        return roomResult;
        
    }
    
    
}

module["exports"] = PeoplesManager;