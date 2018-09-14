(function(ext) {

	var sensory = {
		map: 0,
		signalStrength: 0,
		leftProximity: 0,
		rightProximity: 0,
		accelerationX: 0,
		accelerationY: 0,
		accelerationZ: 0,
		positionX: -1,
		positionY: -1,
		orientation: -200,
		light: 0,
		temperature: 0,
		battery: 0,
		frontOid: -1,
		rearOid: -1
	};
	var motoring = {
		module: 'albertschool',
		map: 0xbe000000,
		leftWheel: 0,
		rightWheel: 0,
		buzzer: 0,
		topology: 0,
		leftEye: 0,
		rightEye: 0,
		note: 0,
		bodyLed: 0,
		frontLed: 0,
		boardWidth: 0,
		boardHeight: 0,
		motion: 0
	};
	var packet = {
		version: 1,
		robot: motoring
	};
	const MOTION = {
		NONE: 0,
		FORWARD: 1,
		BACKWARD: 2,
		LEFT: 3,
		RIGHT: 4
	};
	var connectionState = 1;
	var tempo = 60;
	var timeouts = [];
	var socket = undefined;
	var canSend = false;
	var navigation = {
		callback: undefined,
		mode: 0,
		state: 0,
		initialized: false,
		board: { width: 0, height: 0 },
		current: { x: -1, y: -1, theta: -200 },
		target: { x: -1, y: -1, theta: -200 },
		clear: function() {
			this.callback = undefined;
			this.mode = 0;
			this.state = 0;
			this.initialized = false;
			this.board.width = 0;
			this.board.height = 0;
			this.current.x = -1;
			this.current.y = -1;
			this.current.theta = -200;
			this.target.x = -1;
			this.target.y = -1;
			this.target.theta = -200;
		}
	};
	var controller = {
		PI: 3.14159265,
		PI2: 6.2831853,
		prevDirection: 0,
		prevDirectionFinal: 0,
		directionCount: 0,
		directionCountFinal: 0,
		positionCount: 0,
		positionCountFinal: 0,
		GAIN_ANGLE: 30,
		GAIN_ANGLE_FINE: 30,
		GAIN_POSITION_FINE: 30,
		STRAIGHT_SPEED: 30,
		MAX_BASE_SPEED: 30,
		GAIN_BASE_SPEED: 1.5,
		GAIN_POSITION: 52.5,
		POSITION_TOLERANCE_FINE: 3,
		POSITION_TOLERANCE_FINE_LARGE: 5,
		POSITION_TOLERANCE_ROUGH: 5,
		POSITION_TOLERANCE_ROUGH_LARGE: 10,
		ORIENTATION_TOLERANCE_FINAL: 0.087,
		ORIENTATION_TOLERANCE_FINAL_LARGE: 0.122,
		ORIENTATION_TOLERANCE_FINAL_LARGE_LARGE: 0.262,
		ORIENTATION_TOLERANCE_ROUGH: 0.122,
		ORIENTATION_TOLERANCE_ROUGH_LARGE: 0.262,
		ORIENTATION_TOLERANCE_ROUGH_LARGE_LARGE: 0.524,
		MINIMUM_WHEEL_SPEED: 18,
		MINIMUM_WHEEL_SPEED_FINE: 15,
		clear: function() {
			this.prevDirection = 0;
			this.prevDirectionFinal = 0;
			this.directionCount = 0;
			this.directionCountFinal = 0;
			this.positionCount = 0;
			this.positionCountFinal = 0;
		},
		controlAngle: function(currentRadian, targetRadian) {
			var diff = this.validateRadian(targetRadian - currentRadian);
			var mag = Math.abs(diff);
			if(mag < this.ORIENTATION_TOLERANCE_ROUGH) return false;
			
			var direction = diff > 0 ? 1 : -1;
			if (mag < this.ORIENTATION_TOLERANCE_ROUGH_LARGE && direction * this.prevDirection < 0)
				return false;
			this.prevDirection = direction;
			
			var value = 0;
			if(diff > 0) {
				value = Math.log(1 + mag) * this.GAIN_ANGLE;
				if(value < this.MINIMUM_WHEEL_SPEED) value = this.MINIMUM_WHEEL_SPEED;
			} else {
				value = -Math.log(1 + mag) * this.GAIN_ANGLE;
				if(value > -this.MINIMUM_WHEEL_SPEED) value = -this.MINIMUM_WHEEL_SPEED;
			}
			value = parseInt(value);
			robot.motoring.leftWheel.write(-value);
			robot.motoring.rightWheel.write(value);
			return true;
		},
		controlAngleFine: function(currentRadian, targetRadian) {
			var diff = this.validateRadian(targetRadian - currentRadian);
			var mag = Math.abs(diff);
			if (mag < this.ORIENTATION_TOLERANCE_FINAL) return false;
			
			var direction = diff > 0 ? 1 : -1;
			if(mag < this.ORIENTATION_TOLERANCE_FINAL_LARGE && direction * this.prevDirectionFinal < 0) return false;
			if(mag < this.ORIENTATION_TOLERANCE_FINAL_LARGE_LARGE && direction * this.prevDirectionFinal < 0) {
				if(++this.directionCountFinal > 3) return false;
			}
			this.prevDirectionFinal = direction;
			
			var value = 0;
			if(diff > 0) {
				value = Math.log(1 + mag) * this.GAIN_ANGLE_FINE;
				if(value < this.MINIMUM_WHEEL_SPEED) value = this.MINIMUM_WHEEL_SPEED;
			} else {
				value = -Math.log(1 + mag) * this.GAIN_ANGLE_FINE;
				if(value > -this.MINIMUM_WHEEL_SPEED) value = -this.MINIMUM_WHEEL_SPEED;
			}
			value = parseInt(value);
			robot.motoring.leftWheel.write(-value);
			robot.motoring.rightWheel.write(value);
			return true;
		},
		controlPositionFine: function(currentX, currentY, currentRadian, targetX, targetY) {
			var targetRadian = Math.atan2(targetY - currentY, targetX - currentX);
			var diff = this.validateRadian(targetRadian - currentRadian);
			var mag = Math.abs(diff);
			var ex = targetX - currentX;
			var ey = targetY - currentY;
			var dist = Math.sqrt(ex * ex + ey * ey);
			if (dist < this.POSITION_TOLERANCE_FINE) return false;
			if(dist < this.POSITION_TOLERANCE_FINE_LARGE) {
				if(++this.positionCountFinal > 5) {
					this.positionCountFinal = 0;
					return false;
				}
			}
			var value = 0;
			if(diff > 0) value = Math.log(1 + mag) * this.GAIN_POSITION_FINE;
			else value = -Math.log(1 + mag) * this.GAIN_POSITION_FINE;
			value = parseInt(value);
			robot.motoring.leftWheel.write(this.MINIMUM_WHEEL_SPEED_FINE - value);
			robot.motoring.rightWheel.write(this.MINIMUM_WHEEL_SPEED_FINE + value);
			return true;
		},
		controlPosition: function(currentX, currentY, currentRadian, targetX, targetY) {
			var targetRadian = Math.atan2(targetY - currentY, targetX - currentX);
			var diff = this.validateRadian(targetRadian - currentRadian);
			var mag = Math.abs(diff);
			var ex = targetX - currentX;
			var ey = targetY - currentY;
			var dist = Math.sqrt(ex * ex + ey * ey);
			if(dist < this.POSITION_TOLERANCE_ROUGH) return false;
			if(dist < this.POSITION_TOLERANCE_ROUGH_LARGE) {
				if(++this.positionCount > 10) {
					this.positionCount = 0;
					return false;
				}
			} else {
				this.positionCount = 0;
			}
			if(mag < 0.01) {
				robot.motoring.leftWheel.write(this.STRAIGHT_SPEED);
				robot.motoring.rightWheel.write(this.STRAIGHT_SPEED);
			} else {
				var base = (this.MINIMUM_WHEEL_SPEED + 0.5 / mag) * this.GAIN_BASE_SPEED;
				if(base > this.MAX_BASE_SPEED) base = this.MAX_BASE_SPEED;
				
				var value = 0;
				if(diff > 0) value = Math.log(1 + mag) * this.GAIN_POSITION;
				else value = -Math.log(1 + mag) * this.GAIN_POSITION;
				base = parseInt(base);
				value = parseInt(value);
				robot.motoring.leftWheel.write(base - value);
				robot.motoring.rightWheel.write(base + value);
			}
			return true;
		},
		validateRadian: function(radian) {
			if(radian > this.PI) return radian - this.PI2;
			else if(radian < -this.PI) return radian + this.PI2;
			return radian;
		},
		toRadian: function(degree) {
			return degree * 3.14159265 / 180.0;
		}
	};
	const STATE = {
		CONNECTING: 1,
		CONNECTED: 2,
		CONNECTION_LOST: 3,
		DISCONNECTED: 4,
		CLOSED: 5
	};
	const STATE_MSG = {
		en: [ 'Please run Robot Coding software.', 'Robot is not connected.', 'Ready' ],
		ko: [ '로봇 코딩 소프트웨어를 실행해 주세요.', '로봇이 연결되어 있지 않습니다.', '정상입니다.' ]
	};
	const EXTENSION_NAME = {
		en: 'Albert School',
		ko: '알버트 스쿨'
	};
	const BLOCKS = {
		en1: [
			['w', 'move forward', 'moveForward'],
			['w', 'move backward', 'moveBackward'],
			['w', 'turn %m.left_right', 'turn', 'left'],
			['-'],
			[' ', 'set %m.left_right_both eye to %m.color', 'setEyeTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both eye', 'clearEye', 'left'],
			[' ', 'turn body led %m.on_off', 'turnBodyLed', 'on'],
			[' ', 'turn front led %m.on_off', 'turnFrontLed', 'on'],
			['-'],
			['w', 'beep', 'beep'],
			['-'],
			['b', 'hand found?', 'handFound']
		],
		en2: [
			['w', 'move forward %n secs', 'moveForwardForSecs', 1],
			['w', 'move backward %n secs', 'moveBackwardForSecs', 1],
			['w', 'turn %m.left_right %n secs', 'turnForSecs', 'left', 1],
			['-'],
			[' ', 'set %m.left_right_both eye to %m.color', 'setEyeTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both eye', 'clearEye', 'left'],
			[' ', 'turn body led %m.on_off', 'turnBodyLed', 'on'],
			[' ', 'turn front led %m.on_off', 'turnFrontLed', 'on'],
			['-'],
			['w', 'beep', 'beep'],
			['w', 'play note %m.note %m.octave for %d.beats beats', 'playNoteFor', 'C', '4', 0.5],
			['w', 'rest for %d.beats beats', 'restFor', 0.25],
			[' ', 'change tempo by %n', 'changeTempoBy', 20],
			[' ', 'set tempo to %n bpm', 'setTempoTo', 60],
			['-'],
			['b', 'hand found?', 'handFound']
		],
		en3: [
			['w', 'move forward %n secs', 'moveForwardForSecs', 1],
			['w', 'move backward %n secs', 'moveBackwardForSecs', 1],
			['w', 'turn %m.left_right %n secs', 'turnForSecs', 'left', 1],
			[' ', 'change wheels by left: %n right: %n', 'changeBothWheelsBy', 10, 10],
			[' ', 'set wheels to left: %n right: %n', 'setBothWheelsTo', 30, 30],
			[' ', 'change %m.left_right_both wheel by %n', 'changeWheelBy', 'left', 10],
			[' ', 'set %m.left_right_both wheel to %n', 'setWheelTo', 'left', 30],
			[' ', 'stop', 'stop'],
			[' ', 'set board size to width: %d.board_size height: %d.board_size', 'setBoardSizeTo', 108, 76],
			['w', 'move to x: %n y: %n on board', 'moveToOnBoard', 0, 0],
			['w', 'turn towards %n degrees on board', 'setOrientationToOnBoard', 0],
			['-'],
			[' ', 'set %m.left_right_both eye to %m.color', 'setEyeTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both eye', 'clearEye', 'left'],
			[' ', 'turn body led %m.on_off', 'turnBodyLed', 'on'],
			[' ', 'turn front led %m.on_off', 'turnFrontLed', 'on'],
			['-'],
			['w', 'beep', 'beep'],
			[' ', 'change buzzer by %n', 'changeBuzzerBy', 10],
			[' ', 'set buzzer to %n', 'setBuzzerTo', 1000],
			[' ', 'clear buzzer', 'clearBuzzer'],
			['w', 'play note %m.note %m.octave for %d.beats beats', 'playNoteFor', 'C', '4', 0.5],
			['w', 'rest for %d.beats beats', 'restFor', 0.25],
			[' ', 'change tempo by %n', 'changeTempoBy', 20],
			[' ', 'set tempo to %n bpm', 'setTempoTo', 60],
			['-'],
			['r', 'left proximity', 'leftProximity'],
			['r', 'right proximity', 'rightProximity'],
			['r', 'x acceleration', 'accelerationX'],
			['r', 'y acceleration', 'accelerationY'],
			['r', 'z acceleration', 'accelerationZ'],
			['r', 'front oid', 'frontOid'],
			['r', 'rear oid', 'backOid'],
			['r', 'x position', 'positionX'],
			['r', 'y position', 'positionY'],
			['r', 'orientation', 'orientation'],
			['r', 'light', 'light'],
			['r', 'temperature', 'temperature'],
			['r', 'battery', 'battery'],
			['r', 'signal strength', 'signalStrength'],
			['b', 'hand found?', 'handFound']
		],
		ko1: [
			['w', '앞으로 이동하기', 'moveForward'],
			['w', '뒤로 이동하기', 'moveBackward'],
			['w', '%m.left_right 으로 돌기', 'turn', '왼쪽'],
			['-'],
			[' ', '%m.left_right_both 눈을 %m.color 으로 정하기', 'setEyeTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both 눈 끄기', 'clearEye', '왼쪽'],
			[' ', '몸통 LED %m.on_off', 'turnBodyLed', '켜기'],
			[' ', '앞쪽 LED %m.on_off', 'turnFrontLed', '켜기'],
			['-'],
			['w', '삐 소리내기', 'beep'],
			['-'],
			['b', '손 찾음?', 'handFound']
		],
		ko2: [
			['w', '앞으로 %n 초 이동하기', 'moveForwardForSecs', 1],
			['w', '뒤로 %n 초 이동하기', 'moveBackwardForSecs', 1],
			['w', '%m.left_right 으로 %n 초 돌기', 'turnForSecs', '왼쪽', 1],
			['-'],
			[' ', '%m.left_right_both 눈을 %m.color 으로 정하기', 'setEyeTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both 눈 끄기', 'clearEye', '왼쪽'],
			[' ', '몸통 LED %m.on_off', 'turnBodyLed', '켜기'],
			[' ', '앞쪽 LED %m.on_off', 'turnFrontLed', '켜기'],
			['-'],
			['w', '삐 소리내기', 'beep'],
			['w', '%m.note %m.octave 음을 %d.beats 박자 연주하기', 'playNoteFor', '도', '4', 0.5],
			['w', '%d.beats 박자 쉬기', 'restFor', 0.25],
			[' ', '연주 속도를 %n 만큼 바꾸기', 'changeTempoBy', 20],
			[' ', '연주 속도를 %n BPM으로 정하기', 'setTempoTo', 60],
			['-'],
			['b', '손 찾음?', 'handFound']
		],
		ko3: [
			['w', '앞으로 %n 초 이동하기', 'moveForwardForSecs', 1],
			['w', '뒤로 %n 초 이동하기', 'moveBackwardForSecs', 1],
			['w', '%m.left_right 으로 %n 초 돌기', 'turnForSecs', '왼쪽', 1],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기', 'changeBothWheelsBy', 10, 10],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기', 'setBothWheelsTo', 30, 30],
			[' ', '%m.left_right_both 바퀴 %n 만큼 바꾸기', 'changeWheelBy', '왼쪽', 10],
			[' ', '%m.left_right_both 바퀴 %n (으)로 정하기', 'setWheelTo', '왼쪽', 30],
			[' ', '정지하기', 'stop'],
			[' ', '말판 크기를 폭 %d.board_size 높이 %d.board_size (으)로 정하기', 'setBoardSizeTo', 108, 76],
			['w', '밑판 x: %n y: %n 위치로 이동하기', 'moveToOnBoard', 0, 0],
			['w', '말판 %n 도 방향으로 바라보기', 'setOrientationToOnBoard', 0],
			['-'],
			[' ', '%m.left_right_both 눈을 %m.color 으로 정하기', 'setEyeTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both 눈 끄기', 'clearEye', '왼쪽'],
			[' ', '몸통 LED %m.on_off', 'turnBodyLed', '켜기'],
			[' ', '앞쪽 LED %m.on_off', 'turnFrontLed', '켜기'],
			['-'],
			['w', '삐 소리내기', 'beep'],
			[' ', '버저 음을 %n 만큼 바꾸기', 'changeBuzzerBy', 10],
			[' ', '버저 음을 %n (으)로 정하기', 'setBuzzerTo', 1000],
			[' ', '버저 끄기', 'clearBuzzer'],
			['w', '%m.note %m.octave 음을 %d.beats 박자 연주하기', 'playNoteFor', '도', '4', 0.5],
			['w', '%d.beats 박자 쉬기', 'restFor', 0.25],
			[' ', '연주 속도를 %n 만큼 바꾸기', 'changeTempoBy', 20],
			[' ', '연주 속도를 %n BPM으로 정하기', 'setTempoTo', 60],
			['-'],
			['r', '왼쪽 근접 센서', 'leftProximity'],
			['r', '오른쪽 근접 센서', 'rightProximity'],
			['r', 'x축 가속도', 'accelerationX'],
			['r', 'y축 가속도', 'accelerationY'],
			['r', 'z축 가속도', 'accelerationZ'],
			['r', '앞쪽 OID', 'frontOid'],
			['r', '뒤쪽 OID', 'backOid'],
			['r', 'x 위치', 'positionX'],
			['r', 'y 위치', 'positionY'],
			['r', '방향', 'orientation'],
			['r', '밝기', 'light'],
			['r', '온도', 'temperature'],
			['r', '배터리', 'battery'],
			['r', '신호 세기', 'signalStrength'],
			['b', '손 찾음?', 'handFound']
		]
	};
	const MENUS = {
		en: {
			'left_right': ['left', 'right'],
			'left_right_both': ['left', 'right', 'both'],
			'board_size': ['37', '53', '76', '108', '153', '217'],
			'color': ['red', 'yellow', 'green', 'sky blue', 'blue', 'purple', 'white'],
			'on_off': ['on', 'off'],
			'note': ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4']
		},
		ko: {
			'left_right': ['왼쪽', '오른쪽'],
			'left_right_both': ['왼쪽', '오른쪽', '양쪽'],
			'board_size': ['37', '53', '76', '108', '153', '217'],
			'color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '자주색', '하얀색'],
			'on_off': ['켜기', '끄기'],
			'note': ['도', '도#', '레', '미b', '미', '파', '파#', '솔', '솔#', '라', '시b', '시'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4']
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
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var VALUES = {};
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const ON = 4;
	const OFF = 5;
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['color'];
		COLORS[tmp[0]] = 4;
		COLORS[tmp[1]] = 6;
		COLORS[tmp[2]] = 2;
		COLORS[tmp[3]] = 3;
		COLORS[tmp[4]] = 1;
		COLORS[tmp[5]] = 5;
		COLORS[tmp[6]] = 7;
		tmp = MENUS[i]['note'];
		NOTES[tmp[0]] = 4;
		NOTES[tmp[1]] = 5;
		NOTES[tmp[2]] = 6;
		NOTES[tmp[3]] = 7;
		NOTES[tmp[4]] = 8;
		NOTES[tmp[5]] = 9;
		NOTES[tmp[6]] = 10;
		NOTES[tmp[7]] = 11;
		NOTES[tmp[8]] = 12;
		NOTES[tmp[9]] = 13;
		NOTES[tmp[10]] = 14;
		NOTES[tmp[11]] = 15;
		tmp = MENUS[i]['left_right_both'];
		VALUES[tmp[0]] = LEFT;
		VALUES[tmp[1]] = RIGHT;
		VALUES[tmp[2]] = BOTH;
		tmp = MENUS[i]['on_off'];
		VALUES[tmp[0]] = ON;
		VALUES[tmp[1]] = OFF;
	}
	
	function removeTimeout(id) {
		clearTimeout(id);
		var index = timeouts.indexOf(id);
		if(index >= 0) {
			timeouts.splice(index, 1);
		}
	}

	function removeAllTimeouts() {
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		timeouts = [];
	}
	
	function clearMotoring() {
		motoring.map = 0xbe000000;
	}
	
	function setLeftEye(color) {
		motoring.leftEye = color;
		motoring.map |= 0x00800000;
	}
	
	function setRightEye(color) {
		motoring.rightEye = color;
		motoring.map |= 0x00400000;
	}
	
	function setNote(note) {
		motoring.note = note;
		motoring.map |= 0x00200000;
	}

	function setBodyLed(onoff) {
		motoring.bodyLed = onoff;
		motoring.map |= 0x00100000;
	}
	
	function setFrontLed(onoff) {
		motoring.frontLed = onoff;
		motoring.map |= 0x00080000;
	}
	
	function setBoardSize(width, height) {
		motoring.boardWidth = width;
		motoring.boardHeight = height;
		motoring.map |= 0x00040000;
	}
	
	function reset() {
		motoring.map = 0x8ffc0000;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.buzzer = 0;
		motoring.topology = 0;
		motoring.leftEye = 0;
		motoring.rightEye = 0;
		motoring.note = 0;
		motoring.bodyLed = 0;
		motoring.frontLed = 0;
		motoring.boardWidth = 0;
		motoring.boardHeight = 0;
		motoring.motion = 0;
		tempo = 60;
		navigation.clear();
		controller.clear();
		removeAllTimeouts();
	}
	
	function handleNavigation() {
		if(navigation.mode == 1) {
			var x = sensory.positionX;
			var y = sensory.positionY;
			if(x >= 0) navigation.current.x = x;
			if(y >= 0) navigation.current.y = y;
			navigation.current.theta = sensory.orientation;
			switch(navigation.state) {
				case 1: {
					if(navigation.initialized == false) {
						if(navigation.current.x < 0 || navigation.current.y < 0) {
							motoring.leftWheel.write(20);
							motoring.rightWheel.write(-20);
						} else {
							navigation.initialized = true;
						}
					}
					if(navigation.initialized) {
						var current = controller.toRadian(navigation.current.theta);
						var dx = navigation.target.x - navigation.current.x;
						var dy = navigation.target.y - navigation.current.y;
						var target = Math.atan2(dy, dx);
						if(controller.controlAngle(current, target) == false) {
							navigation.state = 2;
						}
					}
					break;
				}
				case 2: {
					if(controller.controlPosition(navigation.current.x, navigation.current.y, controller.toRadian(navigation.current.theta), navigation.target.x, navigation.target.y) == false) {
						navigation.state = 3;
					}
					break;
				}
				case 3: {
					if(controller.controlPositionFine(navigation.current.x, navigation.current.y, controller.toRadian(navigation.current.theta), navigation.target.x, navigation.target.y) == false) {
						motoring.leftWheel.write(0);
						motoring.rightWheel.write(0);
						var callback = navigation.callback;
						navigation.clear();
						controller.clear();
						if(callback) callback();
					}
					break;
				}
			}
		} else if(navigation.mode == 2) {
			navigation.current.theta = sensory.orientation;
			switch(navigation.state) {
				case 1: {
					var current = controller.toRadian(navigation.current.theta);
					var target = controller.toRadian(navigation.target.theta);
					if(controller.controlAngle(current, target) == false) {
						navigation.state = 2;
					}
					break;
				}
				case 2: {
					var current = controller.toRadian(navigation.current.theta);
					var target = controller.toRadian(navigation.target.theta);
					if(controller.controlAngleFine(current, target) == false) {
						motoring.leftWheel.write(0);
						motoring.rightWheel.write(0);
						var callback = navigation.callback;
						navigation.clear();
						controller.clear();
						if(callback) callback();
					}
					break;
				}
			}
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
						if(data.module == 'albertschool' && data.index == 0) {
							sensory = data;
							if(navigation.callback) handleNavigation();
						}
					};
					sock.onmessage = function(message) {
						try {
							var received = JSON.parse(message.data);
							slaveVersion = received.version || 0;
							if(received.type == 0) {
								if(received.module == 'albertschool') {
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

	ext.moveForward = function(callback) {
		motoring.motion = MOTION.FORWARD;
		motoring.leftWheel = 30;
		motoring.rightWheel = 30;
		var timer = setTimeout(function() {
			motoring.motion = MOTION.NONE;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			removeTimeout(timer);
			callback();
		}, 1000);
		timeouts.push(timer);
	};
	
	ext.moveBackward = function(callback) {
		motoring.motion = MOTION.BACKWARD;
		motoring.leftWheel = -30;
		motoring.rightWheel = -30;
		var timer = setTimeout(function() {
			motoring.motion = MOTION.NONE;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			removeTimeout(timer);
			callback();
		}, 1000);
		timeouts.push(timer);
	};
	
	ext.turn = function(direction, callback) {
		if(VALUES[direction] === LEFT) {
			motoring.motion = MOTION.LEFT;
			motoring.leftWheel = -30;
			motoring.rightWheel = 30;
		} else {
			motoring.motion = MOTION.RIGHT;
			motoring.leftWheel = 30;
			motoring.rightWheel = -30;
		}
		var timer = setTimeout(function() {
			motoring.motion = MOTION.NONE;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			removeTimeout(timer);
			callback();
		}, 1000);
		timeouts.push(timer);
	};

	ext.moveForwardForSecs = function(sec, callback) {
		sec = parseFloat(sec);
		if(sec && sec > 0) {
			motoring.motion = MOTION.FORWARD;
			motoring.leftWheel = 30;
			motoring.rightWheel = 30;
			var timer = setTimeout(function() {
				motoring.motion = MOTION.NONE;
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, sec * 1000);
			timeouts.push(timer);
		} else {
			callback();
		}
	};

	ext.moveBackwardForSecs = function(sec, callback) {
		sec = parseFloat(sec);
		if(sec && sec > 0) {
			motoring.motion = MOTION.BACKWARD;
			motoring.leftWheel = -30;
			motoring.rightWheel = -30;
			var timer = setTimeout(function() {
				motoring.motion = MOTION.NONE;
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, sec * 1000);
			timeouts.push(timer);
		} else {
			callback();
		}
	};

	ext.turnForSecs = function(direction, sec, callback) {
		sec = parseFloat(sec);
		if(sec && sec > 0) {
			if(VALUES[direction] === LEFT) {
				motoring.motion = MOTION.LEFT;
				motoring.leftWheel = -30;
				motoring.rightWheel = 30;
			} else {
				motoring.motion = MOTION.RIGHT;
				motoring.leftWheel = 30;
				motoring.rightWheel = -30;
			}
			var timer = setTimeout(function() {
				motoring.motion = MOTION.NONE;
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, sec * 1000);
			timeouts.push(timer);
		} else {
			callback();
		}
	};
	
	ext.changeBothWheelsBy = function(left, right) {
		left = parseFloat(left);
		right = parseFloat(right);
		motoring.motion = MOTION.NONE;
		if(typeof left == 'number') {
			motoring.leftWheel += left;
		}
		if(typeof right == 'number') {
			motoring.rightWheel += right;
		}
	};

	ext.setBothWheelsTo = function(left, right) {
		left = parseFloat(left);
		right = parseFloat(right);
		motoring.motion = MOTION.NONE;
		if(typeof left == 'number') {
			motoring.leftWheel = left;
		}
		if(typeof right == 'number') {
			motoring.rightWheel = right;
		}
	};

	ext.changeWheelBy = function(which, speed) {
		speed = parseFloat(speed);
		motoring.motion = MOTION.NONE;
		if(typeof speed == 'number') {
			which = VALUES[which];
			if(which === LEFT) {
				motoring.leftWheel += speed;
			} else if(which === RIGHT) {
				motoring.rightWheel += speed;
			} else {
				motoring.leftWheel += speed;
				motoring.rightWheel += speed;
			}
		}
	};

	ext.setWheelTo = function(which, speed) {
		speed = parseFloat(speed);
		motoring.motion = MOTION.NONE;
		if(typeof speed == 'number') {
			which = VALUES[which];
			if(which === LEFT) {
				motoring.leftWheel = speed;
			} else if(which === RIGHT) {
				motoring.rightWheel = speed;
			} else {
				motoring.leftWheel = speed;
				motoring.rightWheel = speed;
			}
		}
	};

	ext.stop = function() {
		motoring.motion = MOTION.NONE;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
	};
	
	ext.setBoardSizeTo = function(width, height) {
		width = parseInt(width);
		height = parseInt(height);
		if(width && height && width > 0 && height > 0) {
			navigation.board.width = width;
			navigation.board.height = height;
			setBoardSize(width, height);
		}
	};
	
	ext.moveToOnBoard = function(x, y, callback) {
		x = parseInt(x);
		y = parseInt(y);
		motoring.motion = MOTION.NONE;
		if(typeof x == 'number' && typeof y == 'number' && x >= 0 && x < navigation.board.width && y >= 0 && y < navigation.board.height) {
			navigation.initialized = false;
			navigation.state = 1;
			navigation.current.x = -1;
			navigation.current.y = -1;
			navigation.current.theta = -200;
			navigation.target.x = x;
			navigation.target.y = y;
			controller.clear();
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			navigation.mode = 1;
			navigation.callback = callback;
		} else {
			callback();
		}
	};
	
	ext.setOrientationToOnBoard = function(orientation, callback) {
		orientation = parseInt(orientation);
		motoring.motion = MOTION.NONE;
		if(typeof orientation == 'number') {
			navigation.state = 1;
			navigation.current.theta = -200;
			navigation.target.theta = orientation;
			controller.clear();
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			navigation.mode = 2;
			navigation.callback = callback;
		} else {
			callback();
		}
	};

	ext.setEyeTo = function(which, color) {
		color = COLORS[color];
		if(color && color > 0) {
			which = VALUES[which];
			if(which === LEFT) {
				setLeftEye(color);
			} else if(which === RIGHT) {
				setRightEye(color);
			} else {
				setLeftEye(color);
				setRightEye(color);
			}
		}
	};

	ext.clearEye = function(which) {
		which = VALUES[which];
		if(which === LEFT) {
			setLeftEye(0);
		} else if(which === RIGHT) {
			setRightEye(0);
		} else {
			setLeftEye(0);
			setRightEye(0);
		}
	};
	
	ext.turnBodyLed = function(onoff) {
		onoff = VALUES[onoff];
		if(onoff === ON) {
			setBodyLed(1);
		} else {
			setBodyLed(0);
		}
	};
	
	ext.turnFrontLed = function(onoff) {
		onoff = VALUES[onoff];
		if(onoff === ON) {
			setFrontLed(1);
		} else {
			setFrontLed(0);
		}
	};

	ext.beep = function(callback) {
		motoring.buzzer = 440;
		setNote(0);
		var timer = setTimeout(function() {
			motoring.buzzer = 0;
			removeTimeout(timer);
			callback();
		}, 200);
		timeouts.push(timer);
	};

	ext.changeBuzzerBy = function(value) {
		var buzzer = parseFloat(value);
		if(typeof buzzer == 'number') {
			motoring.buzzer += buzzer;
		}
		setNote(0);
	};

	ext.setBuzzerTo = function(value) {
		var buzzer = parseFloat(value);
		if(typeof buzzer == 'number') {
			motoring.buzzer = buzzer;
		}
		setNote(0);
	};

	ext.clearBuzzer = function() {
		motoring.buzzer = 0;
		setNote(0);
	};
	
	ext.playNoteFor = function(note, octave, beat, callback) {
		note = NOTES[note];
		octave = parseInt(octave);
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && tempo > 0) {
			note += (octave - 1) * 12;
			setNote(note);
			var timeout = beat * 60 * 1000 / tempo;
			var tail = 0;
			if(timeout > 100) {
				tail = 100;
			}
			if(tail > 0) {
				var timer1 = setTimeout(function() {
					setNote(0);
					removeTimeout(timer1);
				}, timeout - tail);
				timeouts.push(timer1);
			}
			var timer2 = setTimeout(function() {
				setNote(0);
				removeTimeout(timer2);
				callback();
			}, timeout);
			timeouts.push(timer2);
		} else {
			callback();
		}
	};

	ext.restFor = function(beat, callback) {
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		setNote(0);
		if(beat && beat > 0 && tempo > 0) {
			var timer = setTimeout(function() {
				removeTimeout(timer);
				callback();
			}, beat * 60 * 1000 / tempo);
			timeouts.push(timer);
		} else {
			callback();
		}
	};

	ext.changeTempoBy = function(value) {
		value = parseFloat(value);
		if(typeof value == 'number') {
			tempo += value;
			if(tempo < 1) tempo = 1;
		}
	};

	ext.setTempoTo = function(value) {
		value = parseFloat(value);
		if(typeof value == 'number') {
			tempo = value;
			if(tempo < 1) tempo = 1;
		}
	};

	ext.leftProximity = function() {
		return sensory.leftProximity;
	};

	ext.rightProximity = function() {
		return sensory.rightProximity;
	};

	ext.accelerationX = function() {
		return sensory.accelerationX;
	};

	ext.accelerationY = function() {
		return sensory.accelerationY;
	};

	ext.accelerationZ = function() {
		return sensory.accelerationZ;
	};
	
	ext.frontOid = function() {
		return sensory.frontOid;
	};
	
	ext.backOid = function() {
		return sensory.rearOid;
	};
	
	ext.positionX = function() {
		return sensory.positionX;
	};
	
	ext.positionY = function() {
		return sensory.positionY;
	};
	
	ext.orientation = function() {
		return sensory.orientation;
	};

	ext.light = function() {
		return sensory.light;
	};

	ext.temperature = function() {
		return sensory.temperature;
	};
	
	ext.battery = function() {
		return sensory.battery;
	};

	ext.signalStrength = function() {
		return sensory.signalStrength;
	};

	ext.handFound = function() {
		return sensory.handFound || sensory.leftProximity > 40 || sensory.rightProximity > 40;
	};

	ext._getStatus = function() {
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
		url: "http://albert.school"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
