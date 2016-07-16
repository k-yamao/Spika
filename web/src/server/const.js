(function(global) {
    "use strict;"

    // Class ------------------------------------------------
    var Const = {};
    
    Const.httpCodeSucceed             = 200;
    Const.httpCodeAccepted            = 203;
    Const.httpCodeBadRequest          = 400;
    Const.httpCodeFileNotFound        = 404;
    Const.httpCodeInternalServerError = 500;
    
 
    Const.responsecodeSucceed = 1;
    Const.resCodeLoginNoName = 1000001;
    Const.resCodeLoginNoRoomID = 1000002;
    Const.resCodeLoginNoUserID = 1000003;
    Const.resCodeUserListNoRoomID = 1000004;
    Const.resCodeMessageListNoRoomID = 1000005;
    Const.resCodeMessageListNoLastMessageID = 1000006;
    Const.resCodeSendMessageNoFile = 1000007;
    Const.resCodeSendMessageNoRoomID = 1000008;
    Const.resCodeSendMessageNoUserID = 1000009;
    Const.resCodeSendMessageNoType = 1000010;
    Const.resCodeFileUploadNoFile = 1000011;
    Const.resCodeSocketUnknownError = 1000012;
    Const.resCodeSocketDeleteMessageNoUserID = 1000013;
    Const.resCodeSocketDeleteMessageNoMessageID = 1000014;
    Const.resCodeSocketSendMessageNoRoomID = 1000015;
    Const.resCodeSocketSendMessageNoUserId = 1000016;
    Const.resCodeSocketSendMessageNoType = 1000017;
    Const.resCodeSocketSendMessageNoMessage = 1000018;
    Const.resCodeSocketSendMessageNoLocation = 1000019;
    Const.resCodeSocketSendMessageFail = 1000020;

    Const.resCodeSocketTypingNoUserID = 1000021;
    Const.resCodeSocketTypingNoRoomID = 1000022;
    Const.resCodeSocketTypingNoType = 1000023;
    Const.resCodeSocketTypingFaild = 1000024;
                
    Const.resCodeSocketLoginNoUserID = 1000025;      
    Const.resCodeSocketLoginNoRoomID = 1000026;    
        
    Const.responsecodeParamError = 2001;
    Const.responsecodeTokenError = 2100;

    Const.messageTypeText = 1;
    Const.messageTypeFile = 6;
    Const.messageTypeLocation = 7;
    Const.messageNewUser = 1000;
    Const.messageUserLeave = 1001;

    Const.typingOn = 1;
    Const.typingOff = 0;
    
    Const.pagingLimit = 50;

    Const.notificationSendMsg = "SendMsg";
    Const.notificationSendMessage = "SendMessage";
    Const.notificationNewUser = "NewUser";
    Const.notificationUserTyping = "UserTyping";
    Const.notificationMessageChanges = "MessageChanges";

    Const.mailUser = "info@local-c.com"; // Your gmail address.
    Const.mailClientId = "58148489510-rj5hb6h68h64e9632av9mm2k9fvqi5sr.apps.googleusercontent.com";
    Const.mailClientSecret =  "PY8JIV6xPfS5XSnVU5UwjD9L";
    Const.mailRefreshToken =  "1/In-TIBz9R1ZU_e2iwYX2QQKugFQBGaCy28D5QJVdKuoMEudVrK5jSpoR30zcRFq6";
    Const.mailSignature =  "<br><br><br><p>────────────────────────<br>Street<br>〒151-0062<br>東京都渋谷区元代々木町43-6<br>TEL:03-6804-8225<br>Email: info@local-c.com<br>────────────────────────<p>";
    Const.mailTitleChangePassword =  "Street パスワード変更";
    Const.mailTitleInitPassword   =  "Street パスワードを初期化";
    Const.mailTitleAuth           =  "Street 本人確認";
    Const.mailHtmlChangePassword  =  "<p>Streetのパスワード変更が完了しました。</p>";
    Const.mailHtmlInitPassword    =  "<p>Streetのパスワードを初期化しました。</p>";
    Const.mailHtmlAuth            =  "<p>URLにアクセスして登録を完了させてください。</p>";
    Const.mailAuthUrl             =  "http://street.local-c.com/auth.php?token=";
    
    
    
    // Exports ----------------------------------------------
    module["exports"] = Const;

})((this || 0).self || global);
