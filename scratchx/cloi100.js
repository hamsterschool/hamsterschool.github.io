(function(ext) {

	var sensory = {
		map: 0
	};
	var motoring = {
		module: 'cloi',
		map: 0x80000000,
		pan: 0,
		tilt: 0,
		color: 0,
		red: 0,
		green: 0,
		blue: 0,
		face: 0
 	};
	var packet = {
		version: 1,
		robot: motoring
 	};
	var connectionState = 1;
	var faceTouched = false;
	var faceFlicked = false;
	var headTouched = false;
	var bodyTouched = false;
	var faceTouchCallbacks = [];
	var faceFlickCallbacks = [];
	var headTouchCallbacks = [];
	var bodyTouchCallbacks = [];
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
			[' ', 'set face to %m.face', 'cloiSetFace', 'happy'],
			[' ', 'blink led in %m.color', 'cloiSetColor', 'red'],
			[' ', 'blink led in r: %n g: %n b: %n', 'cloiSetRgb', 255, 0, 0],
			['-'],
			['w', 'wait until %m.wait_until', 'cloiWaitUntil', 'face touched'],
			['b', '%m.is ?', 'cloiIs', 'face touched']
		],
		ko: [
			[' ', '%m.left_right 으로 %n 도 회전하기', 'cloiPan', '왼쪽', 5],
			[' ', '%m.up_down 으로 %n 도 회전하기', 'cloiTilt', '위쪽', 5],
			['-'],
			[' ', '얼굴 표정을 %m.face (으)로 정하기', 'cloiSetFace', '행복'],
			[' ', 'LED를 %m.color 으로 깜박이기', 'cloiSetColor', '빨간색'],
			[' ', 'LED를 R: %n G: %n B: %n (으)로 깜박이기', 'cloiSetRgb', 255, 0, 0],
			['-'],
			['w', '%m.wait_until 때까지 기다리기', 'cloiWaitUntil', '얼굴을 터치할'],
			['b', '%m.is ?', 'cloiIs', '얼굴을 터치했는가']
		]
	};
	const MENUS = {
		en: {
			'left_right': ['left', 'right'],
			'up_down': ['up', 'down'],
			'face': ['neutral', 'happy', 'smile', 'love', 'wink', 'sad', 'dizzy', 'curious', 'bored', 'flustered', 'unpleasant', 'thinking', 'wakeup'],
			'color': ['red', 'orange', 'green', 'violet'],
			'wait_until': ['face touched', 'face flicked', 'head touched', 'body touched'],
			'is': ['face touched', 'face flicked', 'head touched', 'body touched']
		},
		ko: {
			'left_right': ['왼쪽', '오른쪽'],
			'up_down': ['위쪽', '아래쪽'],
			'face': ['무표정', '행복', '웃음', '사랑', '윙크', '슬픔', '어지러움', '궁금함', '지루함', '당황함', '불쾌함', '생각 중', '잠을 깸'],
			'color': ['빨간색', '주황색', '초록색', '보라색'],
			'wait_until': ['얼굴을 터치할', '얼굴 화면을 빠르게 넘길', '머리를 터치할', '몸을 터치할'],
			'is': ['얼굴을 터치했는가', '얼굴 화면을 빠르게 넘겼는가', '머리를 터치했는가', '몸을 터치했는가']
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

	var COLORS = {};
	var FACES = {};
	var WAIT_UNTILS = {};
	var EVENTS = {};
	var VALUES = {};
	const WAIT_UNTIL_FACE_TOUCHED = 1;
	const WAIT_UNTIL_FACE_FLICKED = 2;
	const WAIT_UNTIL_HEAD_TOUCHED = 3;
	const WAIT_UNTIL_BODY_TOUCHED = 4;
	const IS_FACE_TOUCHED = 1;
	const IS_FACE_FLICKED = 2;
	const IS_HEAD_TOUCHED = 3;
	const IS_BODY_TOUCHED = 4;
	const LEFT = 1;
	const RIGHT = 2;
	const UP = 3;
	const DOWN = 4;
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['color'];
		COLORS[tmp[0]] = 'red';
		COLORS[tmp[1]] = 'orange';
		COLORS[tmp[2]] = 'green';
		COLORS[tmp[3]] = 'purple';
		tmp = MENUS[i]['face'];
		FACES[tmp[0]] = 'neutral';
		FACES[tmp[1]] = 'happy';
		FACES[tmp[2]] = 'smile';
		FACES[tmp[3]] = 'love';
		FACES[tmp[4]] = 'wink';
		FACES[tmp[5]] = 'sad';
		FACES[tmp[6]] = 'dizzy';
		FACES[tmp[7]] = 'curious';
		FACES[tmp[8]] = 'bored';
		FACES[tmp[9]] = 'flustered';
		FACES[tmp[10]] = 'unpleasant';
		FACES[tmp[11]] = 'thinking';
		FACES[tmp[12]] = 'wakeup';
		tmp = MENUS[i]['wait_until'];
		WAIT_UNTILS[tmp[0]] = WAIT_UNTIL_FACE_TOUCHED;
		WAIT_UNTILS[tmp[1]] = WAIT_UNTIL_FACE_FLICKED;
		WAIT_UNTILS[tmp[2]] = WAIT_UNTIL_HEAD_TOUCHED;
		WAIT_UNTILS[tmp[3]] = WAIT_UNTIL_BODY_TOUCHED;
		tmp = MENUS[i]['is'];
		EVENTS[tmp[0]] = IS_FACE_TOUCHED;
		EVENTS[tmp[1]] = IS_FACE_FLICKED;
		EVENTS[tmp[2]] = IS_HEAD_TOUCHED;
		EVENTS[tmp[3]] = IS_BODY_TOUCHED;
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
	
	function setColor(value) {
		motoring.color = value;
		motoring.map |= 0x10000000;
	}
	
	function setRgb(r, g, b) {
		motoring.red = r;
		motoring.green = g;
		motoring.blue = b;
		motoring.map |= 0x08000000;
	}

	function setFace(value) {
		motoring.face = value;
		motoring.map |= 0x04000000;
	}
	
	function addFaceTouchCallback(callback) {
		faceTouchCallbacks.push(callback);
	}
	
	function removeFaceTouchCallbacks() {
		var callback;
		for(var i in faceTouchCallbacks) {
			callback = faceTouchCallbacks[i];
			if(callback) callback();
		}
		faceTouchCallbacks = [];
	}
	
	function addFaceFlickCallback(callback) {
		faceFlickCallbacks.push(callback);
	}
	
	function removeFaceFlickCallbacks() {
		var callback;
		for(var i in faceFlickCallbacks) {
			callback = faceFlickCallbacks[i];
			if(callback) callback();
		}
		faceFlickCallbacks = [];
	}
	
	function addHeadTouchCallback(callback) {
		headTouchCallbacks.push(callback);
	}
	
	function removeHeadTouchCallbacks() {
		var callback;
		for(var i in headTouchCallbacks) {
			callback = headTouchCallbacks[i];
			if(callback) callback();
		}
		headTouchCallbacks = [];
	}
	
	function addBodyTouchCallback(callback) {
		bodyTouchCallbacks.push(callback);
	}
	
	function removeBodyTouchCallbacks() {
		var callback;
		for(var i in bodyTouchCallbacks) {
			callback = bodyTouchCallbacks[i];
			if(callback) callback();
		}
		bodyTouchCallbacks = [];
	}
	
	function reset() {
		motoring.map = 0xfe000000;
		motoring.pan = 0;
		motoring.tilt = 0;
		motoring.color = 0;
		motoring.red = 0;
		motoring.green = 0;
		motoring.blue = 0;
		motoring.face = 0;

		faceTouched = false;
		faceFlicked = false;
		headTouched = false;
		bodyTouched = false;
		faceTouchCallbacks = [];
		faceFlickCallbacks = [];
		headTouchCallbacks = [];
		bodyTouchCallbacks = [];
	}
	
	function handleSensory() {
		if(sensory.map & 0x00008000) {
			faceTouched = true;
			removeFaceTouchCallbacks();
		}
		if(sensory.map & 0x00004000) {
			faceFlicked = true;
			removeFaceFlickCallbacks();
		}
		if(sensory.map & 0x00002000) {
			headTouched = true;
			removeHeadTouchCallbacks();
		}
		if(sensory.map & 0x00001000) {
			bodyTouched = true;
			removeBodyTouchCallbacks();
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
		if(face) {
			setFace(face);
		}
	};

	ext.cloiSetColor = function(color) {
		color = COLORS[color];
		setColor(color);
	};
	
	ext.cloiSetRgb = function(red, green, blue) {
		if((typeof red == 'number') && (typeof green == 'number') && (typeof blue == 'number')) {
			if(red < 0) red = 0;
			else if(red > 255) red = 255;
			if(green < 0) green = 0;
			else if(green > 255) green = 255;
			if(blue < 0) blue = 0;
			else if(blue > 255) blue = 255;
			setRgb(red, green, blue);
		}
	};

	ext.cloiWaitUntil = function(value, callback) {
		value = WAIT_UNTILS[value];
		if(value && value > 0) {
			switch(value) {
				case WAIT_UNTIL_FACE_TOUCHED:
					addFaceTouchCallback(callback);
					break;
				case WAIT_UNTIL_FACE_FLICKED:
					addFaceFlickCallback(callback);
					break;
				case WAIT_UNTIL_HEAD_TOUCHED:
					addHeadTouchCallback(callback);
					break;
				case WAIT_UNTIL_BODY_TOUCHED:
					addBodyTouchCallback(callback);
					break;
			}
		}
	};
	
	ext.cloiIs = function(value) {
		value = EVENTS[value];
		if(value && value > 0) {
			switch(value) {
				case IS_FACE_TOUCHED: return faceTouched;
				case IS_FACE_FLICKED: return faceFlicked;
				case IS_HEAD_TOUCHED: return headTouched;
				case IS_BODY_TOUCHED: return bodyTouched;
			}
		}
		return false;
	};
	
	ext._getStatus = function() {
		faceTouched = false;
		faceFlicked = false;
		headTouched = false;
		bodyTouched = false;
		
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
