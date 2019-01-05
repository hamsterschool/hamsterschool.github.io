(function(ext) {

	var sensory = {
		map: 0
	};
	var motoring = {
		module: 'cloi',
		map: 0x80000000,
		pan: 0,
		tilt: 0,
		floorLed: 0,
		face: 0,
		tts: undefined,
		command: undefined
 	};
	var packet = {
		version: 1,
		robot: motoring
 	};
	var connectionState = 1;
	var touched = false;
	var longPressed = false;
	var called = false;
	var listenResult = '';
	var touchCallbacks = [];
	var longPressCallbacks = [];
	var callCallbacks = [];
	var listenCallbacks = {};
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
		en: [ 'Please run CLOi Coding software.', 'Robot is not connected.', 'Ready' ],
		ko: [ '클로이 코딩 소프트웨어를 실행해 주세요.', '로봇이 연결되어 있지 않습니다.', '정상입니다.' ]
	};
	const EXTENSION_NAME = {
		en: 'CLOi',
		ko: '클로이'
	};
	const BLOCKS = {
		en: [
			[' ', 'turn %m.left_right %n degrees', 'cloiPan', 'left', 5],
			[' ', 'turn %m.up_down %n degrees', 'cloiTilt', 'up', 5],
			['-'],
			[' ', 'set face to %m.face', 'cloiSetFace', 'smile'],
			[' ', 'blink %m.floor_color led on floor', 'cloiBlinkFloorLed', 'red'],
			['-'],
			[' ', 'say %s', 'cloiSay', 'hello'],
			['-'],
			['w', 'wait until %m.wait_until', 'cloiWaitUntil', 'face touched'],
			['b', '%m.is ?', 'cloiIs', 'face touched'],
			['-'],
			[' ', 'order %s command', 'cloiCommand', 'weather'],
			['w', 'wait until %s command', 'cloiWaitUntilListen', 'weather'],
			['r', 'command', 'cloiListenResult']
		],
		ko: [
			[' ', '%m.left_right 으로 %n 도 회전하기', 'cloiPan', '왼쪽', 5],
			[' ', '%m.up_down 으로 %n 도 회전하기', 'cloiTilt', '위쪽', 5],
			['-'],
			[' ', '얼굴 표정을 %m.face 으로 정하기', 'cloiSetFace', '웃음'],
			[' ', '바닥 LED를 %m.floor_color 으로 깜박이기', 'cloiBlinkFloorLed', '빨간색'],
			['-'],
			[' ', '%s 말하기', 'cloiSay', '안녕'],
			['-'],
			['w', '%m.wait_until 때까지 기다리기', 'cloiWaitUntil', '얼굴을 터치할'],
			['b', '%m.is ?', 'cloiIs', '얼굴을 터치했는가'],
			['-'],
			[' ', '%s 명령하기', 'cloiCommand', '날씨'],
			['w', '%s 명령 기다리기', 'cloiWaitUntilListen', '날씨'],
			['r', '명령', 'cloiListenResult']
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

	function clearMotoring() {
		motoring.map = 0x80000000;
	}
	
	function setPan(value) {
		motoring.pan = value;
		motoring.map |= 0x40000000;
	}
	
	function setTilt(value) {
		motoring.tilt = value;
		motoring.map |= 0x20000000;
	}
	
	function setFloorLed(value) {
		motoring.floorLed = value;
		motoring.map |= 0x10000000;
	}

	function setFace(value) {
		motoring.face = value;
		motoring.map |= 0x08000000;
	}
	
	function setTts(value) {
		motoring.tts = value;
		motoring.map |= 0x04000000;
	}
	
	function setCommand(value) {
		motoring.command = value;
		motoring.map |= 0x02000000;
	}
	
	function addTouchCallback(callback) {
		touchCallbacks.push(callback);
	}
	
	function removeTouchCallbacks() {
		var callback;
		for(var i in touchCallbacks) {
			callback = touchCallbacks[i];
			if(callback) callback();
		}
		touchCallbacks = [];
	}
	
	function addLongPressCallback(callback) {
		longPressCallbacks.push(callback);
	}
	
	function removeLongPressCallbacks() {
		var callback;
		for(var i in longPressCallbacks) {
			callback = longPressCallbacks[i];
			if(callback) callback();
		}
		longPressCallbacks = [];
	}
	
	function addCallCallback(callback) {
		callCallbacks.push(callback);
	}
	
	function removeCallCallbacks() {
		var callback;
		for(var i in callCallbacks) {
			callback = callCallbacks[i];
			if(callback) callback();
		}
		callCallbacks = [];
	}
	
	function addListenCallback(word, callback) {
		var callbacks = listenCallbacks[word];
		if(!callbacks) {
			callbacks = [];
			listenCallbacks[word] = callbacks;
		}
		callbacks.push(callback);
	}
	
	function removeListenCallbacks(word) {
		var callbacks = listenCallbacks[word];
		if(callbacks) {
			var callback;
			for(var i in callbacks) {
				callback = callbacks[i];
				if(callback) callback();
			}
			listenCallbacks[word] = [];
		}
	}
	
	function reset() {
		motoring.map = 0xfe000000;
		motoring.pan = 0;
		motoring.tilt = 0;
		motoring.floorLed = 0;
		motoring.face = 0;
		motoring.tts = undefined;
		motoring.command = undefined;

		touched = false;
		longPressed = false;
		called = false;
		listenResult = '';
		touchCallbacks = [];
		longPressCallbacks = [];
		callCallbacks = [];
		listenCallbacks = {};
	}
	
	function handleSensory() {
		if(sensory.map & 0x00008000) {
			touched = true;
			removeTouchCallbacks();
		}
		if(sensory.map & 0x00004000) {
			longPressed = true;
			removeLongPressCallbacks();
		}
		if(sensory.map & 0x00002000) {
			called = true;
			removeCallCallbacks();
		}
		if(sensory.map & 0x00001000) {
			listenResult = sensory.listen;
			if(listenResult) removeListenCallbacks(listenResult);
			else listenResult = '';
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
						if(data.module == 'cloi' && data.index == 0) {
							sensory = data;
							handleSensory();
						}
					};
					sock.onmessage = function(message) {
						try {
							var received = JSON.parse(message.data);
							slaveVersion = received.version || 0;
							if(received.type == 0) {
								if(received.module == 'cloi') {
									connectionState = received.state;
								}
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
									var json;
									if(slaveVersion == 1) json = JSON.stringify(packet);
									else json = JSON.stringify(packet.robot);
									if(canSend && socket) socket.send(json);
									clearMotoring();
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

	ext.cloiPan = function(direction, value) {
		value = parseInt(value);
		if(value && value > 0) {
			if(VALUES[direction] === LEFT) {
				setPan(value);
			} else {
				setPan(-value);
			}
		}
	};
	
	ext.cloiTilt = function(direction, value) {
		value = parseInt(value);
		if(value && value > 0) {
			if(VALUES[direction] === UP) {
				setTilt(value);
			} else {
				setTilt(-value);
			}
		}
	};
	
	ext.cloiSetFace = function(face) {
		face = FACES[face];
		if(face && face > 0) {
			setFace(face);
		}
	};

	ext.cloiBlinkFloorLed = function(color) {
		color = FLOOR_COLORS[color];
		if(color && color > 0) {
			setFloorLed(color);
		}
	};

	ext.cloiSay = function(text) {
		if(text !== undefined) {
			setTts(text);
		}
	};

	ext.cloiWaitUntil = function(value, callback) {
		value = WAIT_UNTILS[value];
		if(value && value > 0) {
			switch(value) {
				case WAIT_UNTIL_TOUCHED:
					addTouchCallback(callback);
					break;
				case WAIT_UNTIL_LONG_PRESSED:
					addLongPressCallback(callback);
					break;
				case WAIT_UNTIL_CALLED:
					addCallCallback(callback);
					break;
			}
		}
	};
	
	ext.cloiIs = function(value) {
		value = EVENTS[value];
		if(value && value > 0) {
			switch(value) {
				case IS_TOUCHED: return touched;
				case IS_LONG_PRESSED: return longPressed;
				case IS_CALLED: return called;
			}
		}
		return false;
	};
	
	ext.cloiCommand = function(text) {
		if(text !== undefined) {
			setCommand(text);
		}
	};
	
	ext.cloiWaitUntilListen = function(text, callback) {
		if(text !== undefined) {
			addListenCallback(text, callback);
		}
	};
	
	ext.cloiListenResult = function() {
		return listenResult;
	};

	ext._getStatus = function() {
		touched = false;
		longPressed = false;
		called = false;
		
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
		blocks: BLOCKS[lang],
		menus: MENUS[lang],
		url: "https://www.lge.co.kr"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
