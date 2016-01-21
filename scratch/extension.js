(function(ext) {

function JsonHandler(id) {
	var data = {
		version: 0x01,
		networkId: 0,
		protocol: 'json'
	};
	
	var str = id.slice(0, 2); // company id
	data.companyId = parseInt(str, 16) & 0xff;
	str = id.slice(2, 4); // model id
	data.modelId = parseInt(str, 16) & 0xff;
	str = id.slice(4, 6); // variation id
	data.variationId = parseInt(str, 16) & 0xff;
	
	this.data = data;
}

JsonHandler.prototype.encode = function() {
	if(this.data) {
		return JSON.stringify(this.data);
	}
};

JsonHandler.prototype.decode = function(data) { // data: array buffer
	try {
		this.data = JSON.parse(data);
	} catch (e) {
	}
};

JsonHandler.prototype.read = function(key) {
	var data = this.data;
	if(data) {
		return data[key];
	}
};

JsonHandler.prototype.write = function(key, value) {
	var data = this.data;
	if(data) {
		data[key] = value;
		return true;
	}
	return false;
};

ext.open = function(id, url) {
    if('WebSocket' in window) {
        try {
            var socket = new WebSocket(url);
            socket.binaryType = 'arraybuffer';
            ext.socket = socket;
            socket.onopen = function() {
                socket.onmessage = function(message) { // message: MessageEvent
                    var data = message.data;
                    if(!ext.receiveHandler) {
                        ext.receiveHandler = new JsonHandler(id);
                    }
                    if(ext.receiveHandler) {
                        ext.receiveHandler.decode(data);
                        if(ext.dataChangedListener) {
                            ext.dataChangedListener();
                        }
                    }
                };
                socket.onclose = function() {
                    if(ext.stateChangedListener) {
                        ext.stateChangedListener('closed');
                    }
                };
            };
            return true;
        } catch (e) {
        }
    }
    return false;
};

ext.close = function() {
    if(ext.socket) {
        ext.socket.close();
            ext.socket = undefined;
    }
};

ext.sendHandler = new JsonHandler('020401');

ext.open('020401', 'ws://localhost:23518');

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
    





//ext._deviceRemoved = function(dev) {
  //  if(device != dev) return;
    //if(poller) poller = clearInterval(poller);
//    device = null;
//};



    var langs = {
        'ko': 'ko'
    };
    var vars = window.location.search.replace(/^\?|\/$/g, '').split("&");
    var lang = undefined;
    for(var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if(pair.length > 1 && pair[0] == 'lang')
            lang = pair[1];
    }
    if(!lang)
        lang = window.navigator.userLanguage || window.navigator.language;
    lang = langs[lang];
    if(lang == undefined)
        lang = 'en';
    //alert(lang);

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            ["w", "move forward", "moveForward"],
		    ["w", "move backward", "moveBackward"],
		    ["w", "turn %m.left_right", "turn", "left"],
		    [" ", "set %m.left_right_both led to %m.color", "setLedTo", "left", "red"],
		    [" ", "clear %m.left_right_both led", "clearLed", "left"],
		    ["w", "beep", "beep"],
		    ["b", "hand found?", "handFound"]
        ],
        menus: {
		    "left_right": ["left", "right"],
		    "left_right_both": ["left", "right", "both"],
		    "color": ["red", "yellow", "green", "cyan", "blue", "magenta", "white"]
	    },
	    url: "http://hamster.school"
    };

    // Register the extension
    ScratchExtensions.register('Hamster', descriptor, ext);
})({});
