(function(ext) {

	var sensory = {
		signalStrength: 0,
		leftProximity: 0,
		rightProximity: 0,
		leftFloor: 0,
		rightFloor: 0,
		accelerationX: 0,
		accelerationY: 0,
		accelerationZ: 0,
		light: 0,
		temperature: 0,
		inputA: 0,
		inputB: 0,
		lineTracerState: 0,
		lineTracerStateId: 0
	};
	var motoring = {
		leftWheel: 0,
		rightWheel: 0,
		buzzer: 0,
		outputA: 0,
		outputB: 0,
		leftLed: 0,
		rightLed: 0,
		note: 0,
		lineTracerMode: 0,
		lineTracerModeId: 0,
		lineTracerSpeed: 5,
		ioModeA: 0,
		ioModeB: 0
	};
	var lineTracerModeId = 0;
	var lineTracerStateId = -1;
	var tempo = 60;
	var timeouts = [];
	var WHEEL_SPEED = 30;
	var TURN_SPEED = 30;

	var reset = function() {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.buzzer = 0;
		motoring.outputA = 0;
		motoring.outputB = 0;
		motoring.leftLed = 0;
		motoring.rightLed = 0;
		motoring.note = 0;
		motoring.lineTracerMode = 0;
		motoring.lineTracerModeId = 0;
		motoring.lineTracerSpeed = 5;
		motoring.ioModeA = 0;
		motoring.ioModeB = 0;
		
		lineTracerModeId = 0;
		lineTracerStateId = -1;
		tempo = 60;
		removeAllTimeouts();
	};
	
	var removeTimeout = function(id) {
		clearTimeout(id);
		var index = timeouts.indexOf(id);
		if(index >= 0) {
			timeouts.splice(index, 1);
		}
	};
	var removeAllTimeouts = function() {
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		timeouts = [];
	};
	var setLineTracerMode = function(mode) {
		lineTracerModeId = (lineTracerModeId + 1) & 0xff;
		motoring.lineTracerMode = mode;
		motoring.lineTracerModeId = lineTracerModeId;
	};

	var open = function(url) {
		if('WebSocket' in window) {
			try {
				var socket = new WebSocket(url);
				socket.binaryType = 'arraybuffer';
				ext.socket = socket;
				socket.onopen = function() {
					socket.onmessage = function(message) { // message: MessageEvent
						try {
							sensory = JSON.parse(message.data);
							socket.send(JSON.stringify(motoring));
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
	}

	function close() {
		if(ext.socket) {
			ext.socket.close();
			ext.socket = undefined;
		}
	}

	ext.moveForwardForSecs = function(sec, callback) {
	console.log('sec ' + (typeof sec));
		setLineTracerMode(0);
		if(sec && sec > 0) {
			motoring.leftWheel = WHEEL_SPEED;
			motoring.rightWheel = WHEEL_SPEED;
			var timer = setTimeout(function() {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, sec * 1000);
			timeouts.push(timer);
		}
	};
			
	ext.leftProximity = function() {
		return sensory['leftProximity'];
	};

	ext._getStatus = function() {
	console.log('status');
		return {status: 2, msg: 'Ready'};
	};
	
	ext._shutdown = function() {
	console.log('shutdown');
		reset();
		if(ext.socket) {
			ext.socket.close();
			ext.socket = undefined;
		}
	};
	
	ext._reset = function() {
		console.log('resetAll');
	};
	ext.reset = function() {
		console.log('reset_all');
	};
	ext.stop = function() {
		console.log('reset_all');
	};
	ext._stop = function() {
		console.log('reset_all');
	};

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
			["w", "move backward for %n secs", "moveBackwardForSecs", 1],
			["w", "turn %m.left_right for %n secs", "turnForSecs", "left", 1],
			[" ", "change wheels by left: %n right: %n", "changeBothWheelsBy", 10, 10],
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

	open('ws://localhost:23518');
	console.log(ext);
	
	console.log(window);
	
	window.on('message', function(e) {
		console.log(e);
	});
	
	window.__flash__addCallback(function() {
		console.log('test1');
	}, 'stop');
	window.__flash__addCallback(function() {
		console.log('test2');
	}, 'reset');
	window.__flash__addCallback(function() {
		console.log('test3');
	}, 'click');
	window.__flash__addCallback(function() {
		console.log('test4');
	}, 'resetAll');
	window.__flash__addCallback(function() {
		console.log('test5');
	}, 'reset_all');
	//window.__flash__addCallback(null, null);


})({});
