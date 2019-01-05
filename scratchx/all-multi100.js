(function(ext) {

	var robots = {};
	var packet = {
		version: 1
	};
	const CLOI = 'cloi';
	var connectionState = 1;
	var socket = undefined;
	var canSend = false;
	const STATE = {
		CONNECTING: 1,
		CONNECTED: 2,
		CONNECTION_LOST: 3,
		DISCONNECTED: 4,
		CLOSED: 5
	};
	const STATE_MSG = {
		en: [ 'Please run CLOi Coding software.', 'First robot is not connected.', 'Ready' ],
		ko: [ '클로이 코딩 소프트웨어를 실행해 주세요.', '첫 번째 로봇이 연결되어 있지 않습니다.', '정상입니다.' ]
	};
	const EXTENSION_NAME = {
		en: 'Robot',
		ko: '로봇'
	};
	const BLOCKS = {
		en: [
			[' ', 'CLOi %n : turn %m.left_right %n degrees', 'cloiPan', 0, 'left', 5],
			[' ', 'CLOi %n : turn %m.up_down %n degrees', 'cloiTilt', 0, 'up', 5],
			['-'],
			[' ', 'CLOi %n : set face to %m.face', 'cloiSetFace', 0, 'smile'],
			[' ', 'CLOi %n : blink %m.floor_color led on floor', 'cloiBlinkFloorLed', 0, 'red'],
			['-'],
			[' ', 'CLOi %n : say %s', 'cloiSay', 0, 'hello'],
			['-'],
			['w', 'CLOi %n : wait until %m.wait_until', 'cloiWaitUntil', 0, 'face touched'],
			['b', 'CLOi %n : %m.is ?', 'cloiIs', 0, 'face touched'],
			['-'],
			[' ', 'CLOi %n : order %s command', 'cloiCommand', 0, 'weather'],
			['w', 'CLOi %n : wait until %s command', 'cloiWaitUntilListen', 0, 'weather'],
			['r', 'CLOi %n : command', 'cloiListenResult', 0]
		],
		ko: [
			[' ', '클로이 %n : %m.left_right 으로 %n 도 회전하기', 'cloiPan', 0, '왼쪽', 5],
			[' ', '클로이 %n : %m.up_down 으로 %n 도 회전하기', 'cloiTilt', 0, '위쪽', 5],
			['-'],
			[' ', '클로이 %n : 얼굴 표정을 %m.face 으로 정하기', 'cloiSetFace', 0, '웃음'],
			[' ', '클로이 %n : 바닥 LED를 %m.floor_color 으로 깜박이기', 'cloiBlinkFloorLed', 0, '빨간색'],
			['-'],
			[' ', '클로이 %n : %s 말하기', 'cloiSay', 0, '안녕'],
			['-'],
			['w', '클로이 %n : %m.wait_until 때까지 기다리기', 'cloiWaitUntil', 0, '얼굴을 터치할'],
			['b', '클로이 %n : %m.is ?', 'cloiIs', 0, '얼굴을 터치했는가'],
			['-'],
			[' ', '클로이 %n : %s 명령하기', 'cloiCommand', 0, '날씨'],
			['w', '클로이 %n : %s 명령 기다리기', 'cloiWaitUntilListen', 0, '날씨'],
			['r', '클로이 %n : 명령', 'cloiListenResult', 0]
		]
	};
	const MENUS = {
		en: {
			'left_right': ['left', 'right'],
			'up_down': ['up', 'down'],
			'face': ['smile', 'sad', 'love'],
			'floor_color': ['red', 'yellow', 'green', 'blue'],
			'wait_until': ['face touched', 'head long pressed', 'called'],
			'is': ['face touched', 'head long pressed', 'called']
		},
		ko: {
			'left_right': ['왼쪽', '오른쪽'],
			'up_down': ['위쪽', '아래쪽'],
			'face': ['웃음', '슬픔', '사랑'],
			'floor_color': ['빨간색', '노란색', '초록색', '파란색'],
			'wait_until': ['얼굴을 터치할', '머리를 길게 눌렀다 뗄', '호출할'],
			'is': ['얼굴을 터치했는가', '머리를 길게 눌렀다 뗐는가', '호출했는가']
		}
	};
	
	var vars = window.location.search.replace(/^\?|\/$/g, '').split("&");
	var lang = 'en';
	var level = '3';
	var pair;
	for(var i = 0; i < vars.length; i++) {
		pair = vars[i].split('=');
		if(pair.length > 1) {
			if(pair[0] == 'lang')
				lang = pair[1];
			else if(pair[0] == 'level')
				level = pair[1];
		}
	}

	var FLOOR_COLORS = {};
	var FACES = {};
	var WAIT_UNTILS = {};
	var EVENTS = {};
	var VALUES = {};
	const WAIT_UNTIL_TOUCHED = 1;
	const WAIT_UNTIL_LONG_PRESSED = 2;
	const WAIT_UNTIL_CALLED = 3;
	const IS_TOUCHED = 1;
	const IS_LONG_PRESSED = 2;
	const IS_CALLED = 3;
	const LEFT = 1;
	const RIGHT = 2;
	const UP = 3;
	const DOWN = 4;
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['floor_color'];
		FLOOR_COLORS[tmp[0]] = 2;
		FLOOR_COLORS[tmp[1]] = 1;
		FLOOR_COLORS[tmp[2]] = 3;
		FLOOR_COLORS[tmp[3]] = 4;
		tmp = MENUS[i]['face'];
		FACES[tmp[0]] = 1;
		FACES[tmp[1]] = 2;
		FACES[tmp[2]] = 3;
		tmp = MENUS[i]['wait_until'];
		WAIT_UNTILS[tmp[0]] = WAIT_UNTIL_TOUCHED;
		WAIT_UNTILS[tmp[1]] = WAIT_UNTIL_LONG_PRESSED;
		WAIT_UNTILS[tmp[2]] = WAIT_UNTIL_CALLED;
		tmp = MENUS[i]['is'];
		EVENTS[tmp[0]] = IS_TOUCHED;
		EVENTS[tmp[1]] = IS_LONG_PRESSED;
		EVENTS[tmp[2]] = IS_CALLED;
		tmp = MENUS[i]['left_right'];
		VALUES[tmp[0]] = LEFT;
		VALUES[tmp[1]] = RIGHT;
		tmp = MENUS[i]['up_down'];
		VALUES[tmp[0]] = UP;
		VALUES[tmp[1]] = DOWN;
	}

	function getRobot(module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			if(module == CLOI) {
				robot = {};
				robot.sensory = {
					map: 0
				};
				robot.motoring = {
					module: 'cloi',
					index: index,
					map: 0x80000000,
					pan: 0,
					tilt: 0,
					floorLed: 0,
					face: 0,
					tts: undefined,
					command: undefined
				};
				robot.touched = false;
				robot.longPressed = false;
				robot.called = false;
				robot.listenResult = '';
				robot.touchCallbacks = [];
				robot.longPressCallbacks = [];
				robot.callCallbacks = [];
				robot.listenCallbacks = {};
				robot.reset = function() {
					var motoring = robot.motoring;
					motoring.map = 0xfe000000;
					motoring.pan = 0;
					motoring.tilt = 0;
					motoring.floorLed = 0;
					motoring.face = 0;
					motoring.tts = undefined;
					motoring.command = undefined;

					robot.touched = false;
					robot.longPressed = false;
					robot.called = false;
					robot.listenResult = '';
					robot.touchCallbacks = [];
					robot.longPressCallbacks = [];
					robot.callCallbacks = [];
					robot.listenCallbacks = {};
				};
				robot.clearMotoring = function() {
					robot.motoring.map = 0x80000000;
				};
				robot.handleSensory = function() {
					var sensory = robot.sensory;
					if(sensory.map & 0x00008000) {
						robot.touched = true;
						removeTouchCallbacks(robot);
					}
					if(sensory.map & 0x00004000) {
						robot.longPressed = true;
						removeLongPressCallbacks(robot);
					}
					if(sensory.map & 0x00002000) {
						robot.called = true;
						removeCallCallbacks(robot);
					}
					if(sensory.map & 0x00001000) {
						robot.listenResult = sensory.listen;
						if(robot.listenResult) removeListenCallbacks(robot, robot.listenResult);
						else robot.listenResult = '';
					}
				};
				robot.clearEvent = function() {
					robot.touched = false;
					robot.longPressed = false;
					robot.called = false;
				};
				robots[key] = robot;
				packet[key] = robot.motoring;
			}
		}
		return robot;
	}
	
	function clearMotorings() {
		for(var i in robots) {
			robots[i].clearMotoring();
		}
	}
	
	function clearEvents() {
		for(var i in robots) {
			robots[i].clearEvent();
		}
	}
	
	function setPan(robot, value) {
		var motoring = robot.motoring;
		motoring.pan = value;
		motoring.map |= 0x40000000;
	}
	
	function setTilt(robot, value) {
		var motoring = robot.motoring;
		motoring.tilt = value;
		motoring.map |= 0x20000000;
	}
	
	function setFloorLed(robot, value) {
		var motoring = robot.motoring;
		motoring.floorLed = value;
		motoring.map |= 0x10000000;
	}

	function setFace(robot, value) {
		var motoring = robot.motoring;
		motoring.face = value;
		motoring.map |= 0x08000000;
	}
	
	function setTts(robot, value) {
		var motoring = robot.motoring;
		motoring.tts = value;
		motoring.map |= 0x04000000;
	}
	
	function setCommand(robot, value) {
		var motoring = robot.motoring;
		motoring.command = value;
		motoring.map |= 0x02000000;
	}
	
	function addTouchCallback(robot, callback) {
		robot.touchCallbacks.push(callback);
	}
	
	function removeTouchCallbacks(robot) {
		var callback;
		for(var i in robot.touchCallbacks) {
			callback = robot.touchCallbacks[i];
			if(callback) callback();
		}
		robot.touchCallbacks = [];
	}
	
	function addLongPressCallback(robot, callback) {
		robot.longPressCallbacks.push(callback);
	}
	
	function removeLongPressCallbacks(robot) {
		var callback;
		for(var i in robot.longPressCallbacks) {
			callback = robot.longPressCallbacks[i];
			if(callback) callback();
		}
		robot.longPressCallbacks = [];
	}
	
	function addCallCallback(robot, callback) {
		robot.callCallbacks.push(callback);
	}
	
	function removeCallCallbacks(robot) {
		var callback;
		for(var i in robot.callCallbacks) {
			callback = robot.callCallbacks[i];
			if(callback) callback();
		}
		robot.callCallbacks = [];
	}
	
	function addListenCallback(robot, word, callback) {
		var callbacks = robot.listenCallbacks[word];
		if(!callbacks) {
			callbacks = [];
			robot.listenCallbacks[word] = callbacks;
		}
		callbacks.push(callback);
	}
	
	function removeListenCallbacks(robot, word) {
		var callbacks = robot.listenCallbacks[word];
		if(callbacks) {
			var callback;
			for(var i in callbacks) {
				callback = callbacks[i];
				if(callback) callback();
			}
			robot.listenCallbacks[word] = [];
		}
	}

	function reset() {
		for(var i in robots) {
			robots[i].reset();
		}
	}
	
	function open(url) {
		if('WebSocket' in window) {
			try {
				var sock = new WebSocket(url);
				sock.binaryType = 'arraybuffer';
				socket = sock;
				sock.onopen = function() {
					var slaveVersion = 1;
					var decode = function(data) {
						if(data.index >= 0) {
							var robot = getRobot(data.module, data.index);
							if(robot) {
								robot.sensory = data;
								robot.handleSensory();
							}
						}
					};
					sock.onmessage = function(message) {
						try {
							var received = JSON.parse(message.data);
							slaveVersion = received.version || 0;
							if(received.type == 0) {
								connectionState = received.state;
							} else {
								if(slaveVersion == 1) {
									for(var i in received) {
										decode(received[i]);
									}
								} else {
									decode(received);
								}
							}
						} catch (e) {
						}
					};
					sock.onclose = function() {
						canSend = false;
						connectionState = STATE.CLOSED;
					};
					
					if(!Date.now) {
						Date.now = function() {
							return new Date().getTime();
						};
					}
					
					var targetTime = Date.now();
					var run = function() {
						if(canSend && socket) {
							if(Date.now() > targetTime) {
								try {
									var json = JSON.stringify(packet);
									if(canSend && socket) socket.send(json);
									clearMotorings();
								} catch (e) {
								}
								targetTime += 20;
							}
							setTimeout(run, 5);
						}
					};
					
					canSend = true;
					run();
				};
				return true;
			} catch (e) {
			}
		}
		return false;
	}

	function close() {
		canSend = false;
		if(socket) {
			socket.close();
			socket = undefined;
		}
	}

	ext.cloiPan = function(index, direction, value) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			value = parseInt(value);
			if(value && value > 0) {
				if(VALUES[direction] === LEFT) {
					setPan(robot, value);
				} else {
					setPan(robot, -value);
				}
			}
		}
	};

	ext.cloiTilt  = function(index, direction, value) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			value = parseInt(value);
			if(value && value > 0) {
				if(VALUES[direction] === UP) {
					setTilt(robot, value);
				} else {
					setTilt(robot, -value);
				}
			}
		}
	};
	
	ext.cloiSetFace = function(index, face) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			face = FACES[face];
			if(face && face > 0) {
				setFace(robot, face);
			}
		}
	};

	ext.cloiBlinkFloorLed = function(index, color) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			color = FLOOR_COLORS[color];
			if(color && color > 0) {
				setFloorLed(robot, color);
			}
		}
	};

	ext.cloiSay = function(index, text) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			if(text !== undefined) {
				setTts(robot, text);
			}
		}
	};

	ext.cloiWaitUntil = function(index, value, callback) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			value = WAIT_UNTILS[value];
			if(value && value > 0) {
				switch(value) {
					case WAIT_UNTIL_TOUCHED:
						addTouchCallback(robot, callback);
						break;
					case WAIT_UNTIL_LONG_PRESSED:
						addLongPressCallback(robot, callback);
						break;
					case WAIT_UNTIL_CALLED:
						addCallCallback(robot, callback);
						break;
				}
			}
		}
	};
	
	ext.cloiIs = function(index, value) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			value = EVENTS[value];
			if(value && value > 0) {
				switch(value) {
					case IS_TOUCHED: return robot.touched;
					case IS_LONG_PRESSED: return robot.longPressed;
					case IS_CALLED: return robot.called;
				}
			}
		}
		return false;
	};
	
	ext.cloiCommand = function(index, text) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			if(text !== undefined) {
				setCommand(robot, text);
			}
		}
	};
	
	ext.cloiWaitUntilListen = function(index, text, callback) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			if(text !== undefined) {
				addListenCallback(robot, text, callback);
			}
		}
	};

	ext.cloiListenResult = function(index) {
		var robot = getRobot(CLOI, index);
		if(robot) {
			return robot.listenResult;
		}
		return '';
	};
	
	ext._getStatus = function() {
		clearEvents();
		switch(connectionState) {
			case STATE.CONNECTED:
				return { status: 2, msg: STATE_MSG[lang][2] };
			case STATE.CLOSED:
				return { status: 0, msg: STATE_MSG[lang][0] };
		}
		return { status: 1, msg: STATE_MSG[lang][1] };
	};

	ext._shutdown = function() {
		reset();
		close();
	};

	ext.resetAll = function() {
		reset();
	};

	var descriptor = {
		blocks: BLOCKS[lang + level],
		menus: MENUS[lang],
		url: "https://www.lge.co.kr"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
