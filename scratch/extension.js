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

    function open(url) {
        if('WebSocket' in window) {
            try {
                var socket = new WebSocket(url);
				socket.binaryType = 'arraybuffer';
				ext.socket = socket;
				socket.onopen = function() {
					socket.onmessage = function(message) { // message: MessageEvent
						try {
							ext.receiveData = JSON.parse(message.data);
						} catch (e) {
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

	function close() {
    	if(ext.socket) {
        	ext.socket.close();
            	ext.socket = undefined;
    	}
	};

	ext.sendHandler = new JsonHandler('020401');

	open('ws://localhost:23518');

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

	ext.leftProximity = function() {
		ext.receiveData.leftProximity;
	}

    var vars = window.location.search.replace(/^\?|\/$/g, '').split("&");
    var lang = 'en';
    var level = '3';
    var board = 'n';
    var pair;
    for(var i = 0; i < vars.length; i++) {
        pair = vars[i].split('=');
        if(pair.length > 1) {
            if(pair[0] == 'lang')
                lang = pair[1];
            else if(pair[0] == 'level')
                level = pair[1];
            else if(pair[0] == 'board')
                board = pair[1];
        }
    }
    lang = 'en';

	var blocks = {
		en3n: [
			["w", "move forward for %n secs", "moveForwardForSecs", "1"],
			["w", "move backward for %n secs", "moveBackwardForSecs", "1"],
			["w", "turn %m.left_right for %n secs", "turnForSecs", "left", "1"],
			[" ", "change wheels by left: %n right: %n", "changeBothWheelsBy", "10", "10"],
			[" ", "set wheels to left: %n right: %n", "setBothWheelsTo", "30", "30"],
			[" ", "change %m.left_right_both wheel by %n", "changeWheelBy", "left", "10"],
			[" ", "set %m.left_right_both wheel to %n", "setWheelTo", "left", "30"],
			[" ", "follow %m.black_white line using %m.left_right_both floor sensor", "followLineUsingFloorSensor", "black", "left"],
			["w", "follow %m.black_white line until %m.left_right_front_rear intersection", "followLineUntilIntersection", "black", "left"],
			[" ", "set following speed to %m.speed", "setFollowingSpeedTo", "5"],
			[" ", "stop", "stop"],
			[" ", "set %m.left_right_both led to %m.color", "setLedTo", "left", "red"],
			[" ", "clear %m.left_right_both led", "clearLed", "left"],
			["w", "beep", "beep"],
			[" ", "change buzzer by %n", "changeBuzzerBy", "10"],
			[" ", "set buzzer to %n", "setBuzzerTo", "1000"],
			[" ", "clear buzzer", "clearBuzzer"],
			["w", "play note %m.note %m.octave for %n beats", "playNoteFor", "C", "4", "0.5"],
			["w", "rest for %n beats", "restFor", "0.25"],
			[" ", "change tempo by %n", "changeTempoBy", "20"],
			[" ", "set tempo to %n bpm", "setTempoTo", "60"],
			["r", "left proximity", "leftProximity"],
			["r", "right proximity", "rightProximity"],
			["r", "left floor", "leftFloor"],
			["r", "right floor", "rightFloor"],
			["r", "x acceleration", "accelerationX"],
			["r", "y acceleration", "accelerationY"],
			["r", "z acceleration", "accelerationZ"],
			["r", "light", "light"],
			["r", "temperature", "temperature"],
			["r", "signal strength", "signalStrength"],
			["b", "hand found?", "handFound"],
			[" ", "set port %m.port to %m.mode", "setPortTo", "A", "analog input"],
			[" ", "change output %m.port by %n", "changeOutputBy", "A", "10"],
			[" ", "set output %m.port to %n", "setOutputTo", "A", "100"],
			["r", "input A", "inputA"],
			["r", "input B", "inputB"]
		]
	};
	var menus = {
		en: {
			"left_right": ["left", "right"],
			"left_right_both": ["left", "right", "both"],
			"black_white": ["black", "white"],
			"left_right_front_rear": ["left", "right", "front", "rear"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"color": ["red", "yellow", "green", "cyan", "blue", "magenta", "white"],
			"note": ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"port": ["A", "B", "A and B"],
			"mode": ["analog input", "digital input", "servo output", "pwm output", "diginal output"]
		}
	};
    
    var descriptor = {
        blocks: blocks[lang + level + board],
        menus: menus[lang],
	    url: "http://hamster.school"
    };

    ScratchExtensions.register('Hamster', descriptor, ext);
})({});
