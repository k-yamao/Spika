(function(global) {
    "use strict;"

    // Class ------------------------------------------------
    var Config = {};
    
    Config.host = "localhost";
    Config.port = 3000;
    Config.urlPrefix = '/spika';
    Config.socketNameSpace = '/spika';

    Config.imageDownloadURL = "http://" + Config.host + "/:" + Config.port + Config.urlPrefix + "/media/images/";
    Config.noavatarImg = "http://" + Config.host + ":" + Config.port + Config.urlPrefix + "/img/noavatar.png";

    Config.chatDatabaseUrl = "mongodb://localhost/spika";
    Config.dbCollectionPrefix = "spika_";
    
    Config.uploadDir = 'public/uploads/';
    Config.sendAttendanceMessage = true;
    

    // Exports ----------------------------------------------
    module["exports"] = Config;

})((this || 0).self || global);
