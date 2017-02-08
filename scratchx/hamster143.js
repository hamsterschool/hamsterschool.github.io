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
	var connectionState = 1;
	var lineTracerModeId = 0;
	var lineTracerStateId = -1;
	var lineTracerCallback = undefined;
	var boardCommand = 0;
	var boardState = 0;
	var boardCount = 0;
	var boardCallback = undefined;
	var tempo = 60;
	var timeouts = [];
	var socket = undefined;
	var sendTimer = undefined;
	var canSend = false;
	var WHEEL_SPEED = 30;
	var TURN_SPEED = 30;
	var STATE = {
		CONNECTING: 1,
		CONNECTED: 2,
		CONNECTION_LOST: 3,
		DISCONNECTED: 4,
		CLOSED: 5
	};
	var STATE_MSG = {
		en: [ 'Please run Robot Coding software.', 'Robot is not connected.', 'Ready' ],
		ko: [ '로봇 코딩 소프트웨어를 실행해 주세요.', '로봇이 연결되어 있지 않습니다.', '정상입니다.' ],
		uz: [ 'Robot Kodlash Dasturini ishga tushiring.', 'Robot bog\'lanmagan.', 'Tayyor' ]
	};
	var EXTENSION_NAME = {
		en: 'Hamster',
		ko: '햄스터',
		uz: 'Hamster'
	};
	var BLOCKS = {
		en1: [
			['w', 'move forward once on board', 'boardMoveForward'],
			['w', 'turn %m.left_right once on board', 'boardTurn', 'left'],
			['w', 'move forward', 'moveForward'],
			['w', 'move backward', 'moveBackward'],
			['w', 'turn %m.left_right', 'turn', 'left'],
			[' ', 'set %m.left_right_both led to %m.color', 'setLedTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both led', 'clearLed', 'left'],
			['w', 'beep', 'beep'],
			['b', 'hand found?', 'handFound']
		],
		en2: [
			['w', 'move forward once on board', 'boardMoveForward'],
			['w', 'turn %m.left_right once on board', 'boardTurn', 'left'],
			['w', 'move forward for %n secs', 'moveForwardForSecs', 1],
			['w', 'move backward for %n secs', 'moveBackwardForSecs', 1],
			['w', 'turn %m.left_right for %n secs', 'turnForSecs', 'left', 1],
			[' ', 'set %m.left_right_both led to %m.color', 'setLedTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both led', 'clearLed', 'left'],
			['w', 'beep', 'beep'],
			['w', 'play note %m.note %m.octave for %n beats', 'playNoteFor', 'C', '4', 0.5],
			['w', 'rest for %n beats', 'restFor', 0.25],
			[' ', 'change tempo by %n', 'changeTempoBy', 20],
			[' ', 'set tempo to %n bpm', 'setTempoTo', 60],
			['b', 'hand found?', 'handFound']
		],
		en3: [
			['w', 'move forward once on board', 'boardMoveForward'],
			['w', 'turn %m.left_right once on board', 'boardTurn', 'left'],
			['w', 'move forward for %n secs at speed %n', 'moveForwardForSecsAtSpeed', 1, 30],
			['w', 'move backward for %n secs at speed %n', 'moveBackwardForSecsAtSpeed', 1, 30],
			['w', 'turn %m.left_right for %n secs at speed %n', 'turnForSecsAtSpeed', 'left', 1, 30],
			[' ', 'change wheels by left: %n right: %n', 'changeBothWheelsBy', 10, 10],
			[' ', 'set wheels to left: %n right: %n', 'setBothWheelsTo', 30, 30],
			[' ', 'change %m.left_right_both wheel by %n', 'changeWheelBy', 'left', 10],
			[' ', 'set %m.left_right_both wheel to %n', 'setWheelTo', 'left', 30],
			[' ', 'follow %m.black_white line using %m.left_right_both floor sensor', 'followLineUsingFloorSensor', 'black', 'left'],
			['w', 'follow %m.black_white line until %m.left_right_front_rear intersection', 'followLineUntilIntersection', 'black', 'left'],
			[' ', 'set following speed to %m.speed', 'setFollowingSpeedTo', '5'],
			[' ', 'stop', 'stop'],
			[' ', 'set %m.left_right_both led to %m.color', 'setLedTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both led', 'clearLed', 'left'],
			['w', 'beep', 'beep'],
			[' ', 'change buzzer by %n', 'changeBuzzerBy', 10],
			[' ', 'set buzzer to %n', 'setBuzzerTo', 1000],
			[' ', 'clear buzzer', 'clearBuzzer'],
			['w', 'play note %m.note %m.octave for %n beats', 'playNoteFor', 'C', '4', 0.5],
			['w', 'rest for %n beats', 'restFor', 0.25],
			[' ', 'change tempo by %n', 'changeTempoBy', 20],
			[' ', 'set tempo to %n bpm', 'setTempoTo', 60],
			['r', 'left proximity', 'leftProximity'],
			['r', 'right proximity', 'rightProximity'],
			['r', 'left floor', 'leftFloor'],
			['r', 'right floor', 'rightFloor'],
			['r', 'x acceleration', 'accelerationX'],
			['r', 'y acceleration', 'accelerationY'],
			['r', 'z acceleration', 'accelerationZ'],
			['r', 'light', 'light'],
			['r', 'temperature', 'temperature'],
			['r', 'signal strength', 'signalStrength'],
			['b', 'hand found?', 'handFound'],
			[' ', 'set port %m.port to %m.mode', 'setPortTo', 'A', 'analog input'],
			[' ', 'change output %m.port by %n', 'changeOutputBy', 'A', 10],
			[' ', 'set output %m.port to %n', 'setOutputTo', 'A', 100],
			['r', 'input A', 'inputA'],
			['r', 'input B', 'inputB']
		],
		ko1: [
			['w', '말판 앞으로 한 칸 이동하기', 'boardMoveForward'],
			['w', '말판 %m.left_right 으로 한 번 돌기', 'boardTurn', '왼쪽'],
			['w', '앞으로 이동하기', 'moveForward'],
			['w', '뒤로 이동하기', 'moveBackward'],
			['w', '%m.left_right 으로 돌기', 'turn', '왼쪽'],
			[' ', '%m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both LED 끄기', 'clearLed', '왼쪽'],
			['w', '삐 소리내기', 'beep'],
			['b', '손 찾음?', 'handFound']
		],
		ko2: [
			['w', '말판 앞으로 한 칸 이동하기', 'boardMoveForward'],
			['w', '말판 %m.left_right 으로 한 번 돌기', 'boardTurn', '왼쪽'],
			['w', '앞으로 %n 초 이동하기', 'moveForwardForSecs', 1],
			['w', '뒤로 %n 초 이동하기', 'moveBackwardForSecs', 1],
			['w', '%m.left_right 으로 %n 초 돌기', 'turnForSecs', '왼쪽', 1],
			[' ', '%m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both LED 끄기', 'clearLed', '왼쪽'],
			['w', '삐 소리내기', 'beep'],
			['w', '%m.note %m.octave 음을 %n 박자 연주하기', 'playNoteFor', '도', '4', 0.5],
			['w', '%n 박자 쉬기', 'restFor', 0.25],
			[' ', '연주 속도를 %n 만큼 바꾸기', 'changeTempoBy', 20],
			[' ', '연주 속도를 %n BPM으로 정하기', 'setTempoTo', 60],
			['b', '손 찾음?', 'handFound']
		],
		ko3: [
			['w', '말판 앞으로 한 칸 이동하기', 'boardMoveForward'],
			['w', '말판 %m.left_right 으로 한 번 돌기', 'boardTurn', '왼쪽'],
			['w', '앞으로 %n 초 속도 %n (으)로 이동하기', 'moveForwardForSecsAtSpeed', 1, 30],
			['w', '뒤로 %n 초 속도 %n (으)로 이동하기', 'moveBackwardForSecsAtSpeed', 1, 30],
			['w', '%m.left_right 으로 %n 초 속도 %n (으)로 돌기', 'turnForSecsAtSpeed', '왼쪽', 1, 30],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기', 'changeBothWheelsBy', 10, 10],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기', 'setBothWheelsTo', 30, 30],
			[' ', '%m.left_right_both 바퀴 %n 만큼 바꾸기', 'changeWheelBy', '왼쪽', 10],
			[' ', '%m.left_right_both 바퀴 %n (으)로 정하기', 'setWheelTo', '왼쪽', 30],
			[' ', '%m.black_white 선을 %m.left_right_both 바닥 센서로 따라가기', 'followLineUsingFloorSensor', '검은색', '왼쪽'],
			['w', '%m.black_white 선을 따라 %m.left_right_front_rear 교차로까지 이동하기', 'followLineUntilIntersection', '검은색', '왼쪽'],
			[' ', '선 따라가기 속도를 %m.speed (으)로 정하기', 'setFollowingSpeedTo', '5'],
			[' ', '정지하기', 'stop'],
			[' ', '%m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both LED 끄기', 'clearLed', '왼쪽'],
			['w', '삐 소리내기', 'beep'],
			[' ', '버저 음을 %n 만큼 바꾸기', 'changeBuzzerBy', 10],
			[' ', '버저 음을 %n (으)로 정하기', 'setBuzzerTo', 1000],
			[' ', '버저 끄기', 'clearBuzzer'],
			['w', '%m.note %m.octave 음을 %n 박자 연주하기', 'playNoteFor', '도', '4', 0.5],
			['w', '%n 박자 쉬기', 'restFor', 0.25],
			[' ', '연주 속도를 %n 만큼 바꾸기', 'changeTempoBy', 20],
			[' ', '연주 속도를 %n BPM으로 정하기', 'setTempoTo', 60],
			['r', '왼쪽 근접 센서', 'leftProximity'],
			['r', '오른쪽 근접 센서', 'rightProximity'],
			['r', '왼쪽 바닥 센서', 'leftFloor'],
			['r', '오른쪽 바닥 센서', 'rightFloor'],
			['r', 'x축 가속도', 'accelerationX'],
			['r', 'y축 가속도', 'accelerationY'],
			['r', 'z축 가속도', 'accelerationZ'],
			['r', '밝기', 'light'],
			['r', '온도', 'temperature'],
			['r', '신호 세기', 'signalStrength'],
			['b', '손 찾음?', 'handFound'],
			[' ', '포트 %m.port 를 %m.mode 으로 정하기', 'setPortTo', 'A', '아날로그 입력'],
			[' ', '출력 %m.port 를 %n 만큼 바꾸기', 'changeOutputBy', 'A', 10],
			[' ', '출력 %m.port 를 %n (으)로 정하기', 'setOutputTo', 'A', 100],
			['r', '입력 A', 'inputA'],
			['r', '입력 B', 'inputB']
		],
		uz1: [
			['w', 'doskada bir marta oldinga yurish', 'boardMoveForward'],
			['w', 'doskada bir marta %m.left_right o\'girish', 'boardTurn', 'chapga'],
			['w', 'oldinga yurish', 'moveForward'],
			['w', 'orqaga yurish', 'moveBackward'],
			['w', '%m.left_right o\'girilish', 'turn', 'chapga'],
			[' ', 'm.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 'chap', 'qizil'],
			[' ', '%m.left_right_both LEDni o\'chirish', 'clearLed', 'chap'],
			['w', 'ovoz chiqarish', 'beep'],
			['b', 'qo\'l topildimi?', 'handFound']
		],
		uz2: [
			['w', 'doskada bir marta oldinga yurish', 'boardMoveForward'],
			['w', 'doskada bir marta %m.left_right o\'girish', 'boardTurn', 'chapga'],
			['w', 'oldinga %n soniya yurish', 'moveForwardForSecs', 1],
			['w', 'orqaga %n soniya yurish', 'moveBackwardForSecs', 1],
			['w', '%m.left_right %n soniya o\'girilish', 'turnForSecs', 'chapga', 1],
			[' ', '%m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 'chap', 'qizil'],
			[' ', '%m.left_right_both LEDni o\'chirish', 'clearLed', 'chap'],
			['w', 'ovoz chiqarish', 'beep'],
			['w', '%m.note %m.octave notani %n zarb ijro etish', 'playNoteFor', 'do', '4', 0.5],
			['w', '%n zarb tanaffus', 'restFor', 0.25],
			[' ', 'temni %n ga o\'zgartirish', 'changeTempoBy', 20],
			[' ', 'temni %n bpm ga sozlash', 'setTempoTo', 60],
			['b', 'qo\'l topildimi?', 'handFound']
		],
		uz3: [
			['w', 'doskada bir marta oldinga yurish', 'boardMoveForward'],
			['w', 'doskada bir marta %m.left_right o\'girish', 'boardTurn', 'chapga'],
			['w', 'oldinga %n soniya %n tezlikda yurish', 'moveForwardForSecsAtSpeed', 1, 30],
			['w', 'orqaga %n soniya %n tezlikda yurish', 'moveBackwardForSecsAtSpeed', 1, 30],
			['w', '%m.left_right %n soniya %n tezlikda o\'girilish', 'turnForSecsAtSpeed', 'chapga', 1, 30],
			[' ', 'chap g\'ildirakni %n o\'ng g\'ildirakni %n ga o\'zgartirish', 'changeBothWheelsBy', 10, 10],
			[' ', 'chap g\'ildirakni %n o\'ng g\'ildirakni %n ga sozlash', 'setBothWheelsTo', 30, 30],
			[' ', '%m.left_right_both g\'ildirakni %n ga o\'zgarish', 'changeWheelBy', 'chap', 10],
			[' ', '%m.left_right_both g\'ildirakni %n ga sozlash', 'setWheelTo', 'chap', 30],
			[' ', '%m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish', 'followLineUsingFloorSensor', 'qora', 'chap'],
			['w', '%m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish', 'followLineUntilIntersection', 'qora', 'chap'],
			[' ', 'liniyada ergashish tezligini %m.speed ga sozlash', 'setFollowingSpeedTo', '5'],
			[' ', 'to\'xtatish', 'stop'],
			[' ', '%m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 'chap', 'qizil'],
			[' ', '%m.left_right_both LEDni o\'chirish', 'clearLed', 'chap'],
			['w', 'ovoz chiqarish', 'beep'],
			[' ', 'buzerning ovozini %n ga o\'zgartirish', 'changeBuzzerBy', 10],
			[' ', 'buzerning ovozini %n ga sozlash', 'setBuzzerTo', 1000],
			[' ', 'buzerni o\'chirish', 'clearBuzzer'],
			['w', '%m.note %m.octave notani %n zarb ijro etish', 'playNoteFor', 'do', '4', 0.5],
			['w', '%n zarb tanaffus', 'restFor', 0.25],
			[' ', 'temni %n ga o\'zgartirish', 'changeTempoBy', 20],
			[' ', 'temni %n bpm ga sozlash', 'setTempoTo', 60],
			['r', 'chap yaqinlik', 'leftProximity'],
			['r', 'o\'ng yaqinlik', 'rightProximity'],
			['r', 'chap taglik', 'leftFloor'],
			['r', 'o\'ng taglik', 'rightFloor'],
			['r', 'x tezlanish', 'accelerationX'],
			['r', 'y tezlanish', 'accelerationY'],
			['r', 'z tezlanish', 'accelerationZ'],
			['r', 'yorug\'lik', 'light'],
			['r', 'harorat', 'temperature'],
			['r', 'signal kuchi', 'signalStrength'],
			['b', 'qo\'l topildimi?', 'handFound'],
			[' ', '%m.port portni %m.mode ga sozlash', 'setPortTo', 'A', 'analog kiritish'],
			[' ', '%m.port portni %n ga o\'zgartirish', 'changeOutputBy', 'A', 10],
			[' ', '%m.port portni %n ga sozlash', 'setOutputTo', 'A', 100],
			['r', 'A kirish', 'inputA'],
			['r', 'B kirish', 'inputB']
		]
	};
	var MENUS = {
		en: {
			'left_right': ['left', 'right'],
			'left_right_both': ['left', 'right', 'both'],
			'black_white': ['black', 'white'],
			'left_right_front_rear': ['left', 'right', 'front', 'rear'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'color': ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'white'],
			'note': ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'port': ['A', 'B', 'A and B'],
			'mode': ['analog input', 'digital input', 'servo output', 'pwm output', 'digital output']
		},
		ko: {
			'left_right': ['왼쪽', '오른쪽'],
			'left_right_both': ['왼쪽', '오른쪽', '양쪽'],
			'black_white': ['검은색', '하얀색'],
			'left_right_front_rear': ['왼쪽', '오른쪽', '앞쪽', '뒤쪽'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '보라색', '하얀색'],
			'note': ['도', '도#', '레', '미b', '미', '파', '파#', '솔', '솔#', '라', '시b', '시'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'port': ['A', 'B', 'A와 B'],
			'mode': ['아날로그 입력', '디지털 입력', '서보 출력', 'PWM 출력', '디지털 출력']
		},
		uz: {
			'left_right': ['chapga', 'o\'nga'],
			'left_right_both': ['chap', 'o\'ng', 'har ikki'],
			'black_white': ['qora', 'oq'],
			'left_right_front_rear': ['chap', 'o\'ng', 'old', 'orqa'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'qirmizi', 'oq'],
			'note': ['do', 'do#', 're', 'mib', 'mi', 'fa', 'fa#', 'sol', 'sol#', 'lya', 'sib', 'si'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'port': ['A', 'B', 'A va B'],
			'mode': ['analog kiritish', 'raqamli kiritish', 'servo chiqish', 'pwm chiqish', 'raqamli chiqish']
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

	var LEFT = 0;
	var RIGHT = 1;
	var BOTH = 2;
	var FRONT = 3;
	var REAR = 4;
	var WHITE = 7;
	var BLACK = 8;
	var PORT_A = 0;
	var PORT_B = 1;
	var PORT_BOTH = 2;
	
	var langLeftRight = MENUS[lang]['left_right'];
	var langLeftRightBoth = MENUS[lang]['left_right_both'];
	var langFrontRear = MENUS[lang]['left_right_front_rear'];
	var DIRECTIONS = {};
	DIRECTIONS[langLeftRight[0]] = LEFT;
	DIRECTIONS[langLeftRight[1]] = RIGHT;
	DIRECTIONS[langLeftRightBoth[0]] = LEFT;
	DIRECTIONS[langLeftRightBoth[1]] = RIGHT;
	DIRECTIONS[langLeftRightBoth[2]] = BOTH;
	DIRECTIONS[langFrontRear[2]] = FRONT;
	DIRECTIONS[langFrontRear[3]] = REAR;
	var langBlackWhite = MENUS[lang]['black_white'];
	var langColor = MENUS[lang]['color'];
	var COLORS = {};
	COLORS[langColor[0]] = 4;
	COLORS[langColor[1]] = 6;
	COLORS[langColor[2]] = 2;
	COLORS[langColor[3]] = 3;
	COLORS[langColor[4]] = 1;
	COLORS[langColor[5]] = 5;
	COLORS[langColor[6]] = 7;
	COLORS[langBlackWhite[0]] = 8;
	var langNote = MENUS[lang]['note'];
	var NOTES = {};
	NOTES[langNote[0]] = 4;
	NOTES[langNote[1]] = 5;
	NOTES[langNote[2]] = 6;
	NOTES[langNote[3]] = 7;
	NOTES[langNote[4]] = 8;
	NOTES[langNote[5]] = 9;
	NOTES[langNote[6]] = 10;
	NOTES[langNote[7]] = 11;
	NOTES[langNote[8]] = 12;
	NOTES[langNote[9]] = 13;
	NOTES[langNote[10]] = 14;
	NOTES[langNote[11]] = 15;
	var langPort = MENUS[lang]['port'];
	var PORTS = {};
	PORTS[langPort[0]] = PORT_A;
	PORTS[langPort[1]] = PORT_B;
	PORTS[langPort[2]] = PORT_BOTH;
	var langMode = MENUS[lang]['mode'];
	var MODES = {};
	MODES[langMode[0]] = 0;
	MODES[langMode[1]] = 1;
	MODES[langMode[2]] = 8;
	MODES[langMode[3]] = 9;
	MODES[langMode[4]] = 10;

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

	function setLineTracerMode(mode) {
		lineTracerModeId = (lineTracerModeId + 1) & 0xff;
		motoring.lineTracerMode = mode;
		motoring.lineTracerModeId = lineTracerModeId;
	}

	function reset() {
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
		lineTracerCallback = undefined;
		boardCommand = 0;
		boardState = 0;
		boardCount = 0;
		boardCallback = undefined;
		tempo = 60;
		removeAllTimeouts();
	}
	
	function handleLineTracer() {
		if(sensory.lineTracerStateId != lineTracerStateId) {
			lineTracerStateId = sensory.lineTracerStateId;
			if(sensory.lineTracerState == 0x40) {
				setLineTracerMode(0);
				var callback = lineTracerCallback;
				lineTracerCallback = undefined;
				if(callback) callback();
			}
		}
	}
	
	function handleBoard() {
		if(boardCommand == 1) {
			switch(boardState) {
				case 1: {
					if(boardCount < 2) {
						if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
							boardCount ++;
						else
							boardCount = 0;
						var diff = sensory.leftFloor - sensory.rightFloor;
						motoring.leftWheel = 45 + diff * 0.25;
						motoring.rightWheel = 45 - diff * 0.25;
					} else {
						boardCount = 0;
						boardState = 2;
					}
					break;
				}
				case 2: {
					var diff = sensory.leftFloor - sensory.rightFloor;
					motoring.leftWheel = 45 + diff * 0.25;
					motoring.rightWheel = 45 - diff * 0.25;
					boardState = 3;
					var timer = setTimeout(function() {
						boardState = 4;
						removeTimeout(timer);
					}, 250);
					timeouts.push(timer);
					break;
				}
				case 3: {
					var diff = sensory.leftFloor - sensory.rightFloor;
					motoring.leftWheel = 45 + diff * 0.25;
					motoring.rightWheel = 45 - diff * 0.25;
					break;
				}
				case 4: {
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					boardCommand = 0;
					boardState = 0;
					var callback = boardCallback;
					boardCallback = undefined;
					if(callback) callback();
					break;
				}
			}
		} else if(boardCommand == 2) {
			switch(boardState) {
				case 1: {
					if(boardCount < 2) {
						if(sensory.leftFloor > 50)
							boardCount ++;
					} else {
						boardCount = 0;
						boardState = 2;
					}
					break;
				}
				case 2: {
					if(sensory.leftFloor < 20) {
						boardState = 3;
					}
					break;
				}
				case 3: {
					if(boardCount < 2) {
						if(sensory.leftFloor < 20)
							boardCount ++;
					} else {
						boardCount = 0;
						boardState = 4;
					}
					break;
				}
				case 4: {
					if(sensory.leftFloor > 50) {
						boardState = 5;
					}
					break;
				}
				case 5: {
					var diff = sensory.leftFloor - sensory.rightFloor;
					if(diff > -15) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						boardCommand = 0;
						boardState = 0;
						var callback = boardCallback;
						boardCallback = undefined;
						if(callback) callback();
					} else {
						motoring.leftWheel = diff * 0.5;
						motoring.rightWheel = -diff * 0.5;
					}
					break;
				}
			}
		} else if(boardCommand == 3) {
			switch(boardState) {
				case 1: {
					if(boardCount < 2) {
						if(sensory.rightFloor > 50)
							boardCount ++;
					} else {
						boardCount = 0;
						boardState = 2;
					}
					break;
				}
				case 2: {
					if(sensory.rightFloor < 20) {
						boardState = 3;
					}
					break;
				}
				case 3: {
					if(boardCount < 2) {
						if(sensory.rightFloor < 20)
							boardCount ++;
					} else {
						boardCount = 0;
						boardState = 4;
					}
					break;
				}
				case 4: {
					if(sensory.rightFloor > 50) {
						boardState = 5;
					}
					break;
				}
				case 5: {
					var diff = sensory.rightFloor - sensory.leftFloor;
					if(diff > -15) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						boardCommand = 0;
						boardState = 0;
						var callback = boardCallback;
						boardCallback = undefined;
						if(callback) callback();
					} else {
						motoring.leftWheel = -diff * 0.5;
						motoring.rightWheel = diff * 0.5;
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
					canSend = true;
					sendTimer = setInterval(function() {
						if(canSend && socket) {
							try {
								socket.send(JSON.stringify(motoring));
							} catch (e) {
							}
						}
					}, 20);
					sock.onmessage = function(message) { // message: MessageEvent
						try {
							var data = JSON.parse(message.data);
							if(data.type == 1) {
								if(data.index == 0) {
									sensory = data;
									if(lineTracerCallback) handleLineTracer();
									if(boardCallback) handleBoard();
								}
							} else if(data.type == 0) {
								connectionState = data.state;
							}
						} catch (e) {
						}
					};
					sock.onclose = function() {
						canSend = false;
						connectionState = STATE.CLOSED;
					};
				};
				return true;
			} catch (e) {
			}
		}
		return false;
	}

	function close() {
		canSend = false;
		if(sendTimer) {
			clearInterval(sendTimer);
			sendTimer = undefined;
		}
		if(socket) {
			socket.close();
			socket = undefined;
		}
	}

	ext.boardMoveForward = function(callback) {
		setLineTracerMode(0);
		motoring.leftWheel = 45;
		motoring.rightWheel = 45;
		boardCommand = 1;
		boardState = 1;
		boardCount = 0;
		boardCallback = callback;
	};

	ext.boardTurn = function(direction, callback) {
		setLineTracerMode(0);
		direction = DIRECTIONS[direction];
		if(direction == LEFT) {
			boardCommand = 2;
			motoring.leftWheel = -45;
			motoring.rightWheel = 45;
		} else {
			boardCommand = 3;
			motoring.leftWheel = 45;
			motoring.rightWheel = -45;
		}
		boardState = 1;
		boardCount = 0;
		boardCallback = callback;
	};
	
	ext.moveForward = function(callback) {
		setLineTracerMode(0);
		motoring.leftWheel = WHEEL_SPEED;
		motoring.rightWheel = WHEEL_SPEED;
		var timer = setTimeout(function() {
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			removeTimeout(timer);
			callback();
		}, 1000);
		timeouts.push(timer);
	};
	
	ext.moveBackward = function(callback) {
		setLineTracerMode(0);
		motoring.leftWheel = -WHEEL_SPEED;
		motoring.rightWheel = -WHEEL_SPEED;
		var timer = setTimeout(function() {
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			removeTimeout(timer);
			callback();
		}, 1000);
		timeouts.push(timer);
	};
	
	ext.turn = function(direction, callback) {
		setLineTracerMode(0);
		if(DIRECTIONS[direction] == LEFT) {
			motoring.leftWheel = -TURN_SPEED;
			motoring.rightWheel = TURN_SPEED;
		} else {
			motoring.leftWheel = TURN_SPEED;
			motoring.rightWheel = -TURN_SPEED;
		}
		var timer = setTimeout(function() {
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			removeTimeout(timer);
			callback();
		}, 1000);
		timeouts.push(timer);
	};

	ext.moveForwardForSecs = function(sec, callback) {
		sec = parseFloat(sec);
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

	ext.moveBackwardForSecs = function(sec, callback) {
		sec = parseFloat(sec);
		setLineTracerMode(0);
		if(sec && sec > 0) {
			motoring.leftWheel = -WHEEL_SPEED;
			motoring.rightWheel = -WHEEL_SPEED;
			var timer = setTimeout(function() {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, sec * 1000);
			timeouts.push(timer);
		}
	};

	ext.turnForSecs = function(direction, sec, callback) {
		sec = parseFloat(sec);
		setLineTracerMode(0);
		if(sec && sec > 0) {
			if(DIRECTIONS[direction] == LEFT) {
				motoring.leftWheel = -TURN_SPEED;
				motoring.rightWheel = TURN_SPEED;
			} else {
				motoring.leftWheel = TURN_SPEED;
				motoring.rightWheel = -TURN_SPEED;
			}
			var timer = setTimeout(function() {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, sec * 1000);
			timeouts.push(timer);
		}
	};
	
	ext.moveForwardForSecsAtSpeed = function(sec, speed, callback) {
		sec = parseFloat(sec);
		speed = parseFloat(speed);
		setLineTracerMode(0);
		if(sec && sec > 0 && speed && speed > 0) {
			motoring.leftWheel = speed;
			motoring.rightWheel = speed;
			var timer = setTimeout(function() {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, sec * 1000);
			timeouts.push(timer);
		}
	};

	ext.moveBackwardForSecsAtSpeed = function(sec, speed, callback) {
		sec = parseFloat(sec);
		speed = parseFloat(speed);
		setLineTracerMode(0);
		if(sec && sec > 0 && speed && speed > 0) {
			motoring.leftWheel = -speed;
			motoring.rightWheel = -speed;
			var timer = setTimeout(function() {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, sec * 1000);
			timeouts.push(timer);
		}
	};

	ext.turnForSecsAtSpeed = function(direction, sec, speed, callback) {
		sec = parseFloat(sec);
		speed = parseFloat(speed);
		setLineTracerMode(0);
		if(sec && sec > 0 && speed && speed > 0) {
			if(DIRECTIONS[direction] == LEFT) {
				motoring.leftWheel = -speed;
				motoring.rightWheel = speed;
			} else {
				motoring.leftWheel = speed;
				motoring.rightWheel = -speed;
			}
			var timer = setTimeout(function() {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, sec * 1000);
			timeouts.push(timer);
		}
	};

	ext.changeBothWheelsBy = function(left, right) {
		left = parseFloat(left);
		right = parseFloat(right);
		setLineTracerMode(0);
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
		setLineTracerMode(0);
		if(typeof left == 'number') {
			motoring.leftWheel = left;
		}
		if(typeof right == 'number') {
			motoring.rightWheel = right;
		}
	};

	ext.changeWheelBy = function(which, speed) {
		speed = parseFloat(speed);
		setLineTracerMode(0);
		if(typeof speed == 'number') {
			which = DIRECTIONS[which];
			if(which == LEFT) {
				motoring.leftWheel += speed;
			}
			else if(which == RIGHT) {
				motoring.rightWheel += speed;
			}
			else {
				motoring.leftWheel += speed;
				motoring.rightWheel += speed;
			}
		}
	};

	ext.setWheelTo = function(which, speed) {
		speed = parseFloat(speed);
		setLineTracerMode(0);
		if(typeof speed == 'number') {
			which = DIRECTIONS[which];
			if(which == LEFT) {
				motoring.leftWheel = speed;
			} else if(which == RIGHT) {
				motoring.rightWheel = speed;
			} else {
				motoring.leftWheel = speed;
				motoring.rightWheel = speed;
			}
		}
	};

	ext.followLineUsingFloorSensor = function(color, which) {
		var mode = 1;
		which = DIRECTIONS[which];
		if(which == RIGHT)
			mode = 2;
		else if(which == BOTH)
			mode = 3;
		if(COLORS[color] == WHITE)
			mode += 7;
		
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setLineTracerMode(mode);
	};

	ext.followLineUntilIntersection = function(color, which, callback) {
		var mode = 4;
		which = DIRECTIONS[which];
		if(which == RIGHT)
			mode = 5;
		else if(which == FRONT)
			mode = 6;
		else if(which == REAR)
			mode = 7;
		if(COLORS[color] == WHITE)
			mode += 7;
		
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setLineTracerMode(mode);
		lineTracerCallback = callback;
	};

	ext.setFollowingSpeedTo = function(speed) {
		speed = parseInt(speed);
		if(typeof speed == 'number') {
			motoring.lineTracerSpeed = speed;
		}
	};

	ext.stop = function() {
		setLineTracerMode(0);
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
	};

	ext.setLedTo = function(which, color) {
		color = COLORS[color];
		if(color && color > 0) {
			which = DIRECTIONS[which];
			if(which == LEFT) {
				motoring.leftLed = color;
			} else if(which == RIGHT) {
				motoring.rightLed = color;
			} else {
				motoring.leftLed = color;
				motoring.rightLed = color;
			}
		}
	};

	ext.clearLed = function(which) {
		which = DIRECTIONS[which];
		if(which == LEFT) {
			motoring.leftLed = 0;
		} else if(which == RIGHT) {
			motoring.rightLed = 0;
		} else {
			motoring.leftLed = 0;
			motoring.rightLed = 0;
		}
	};

	ext.beep = function(callback) {
		motoring.buzzer = 440;
		motoring.note = 0;
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
		motoring.note = 0;
	};

	ext.setBuzzerTo = function(value) {
		var buzzer = parseFloat(value);
		if(typeof buzzer == 'number') {
			motoring.buzzer = buzzer;
		}
		motoring.note = 0;
	};

	ext.clearBuzzer = function() {
		motoring.buzzer = 0;
		motoring.note = 0;
	};

	ext.playNoteFor = function(note, octave, beat, callback) {
		note = NOTES[note];
		octave = parseInt(octave);
		beat = parseFloat(beat);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && tempo > 0) {
			note += (octave - 1) * 12;
			motoring.note = note;
			var timeout = beat * 60 * 1000 / tempo;
			var tail = 0;
			if(timeout > 100) {
				tail = 100;
			}
			if(tail > 0) {
				var timer1 = setTimeout(function() {
					motoring.note = 0;
					removeTimeout(timer1);
				}, timeout - tail);
				timeouts.push(timer1);
			}
			var timer2 = setTimeout(function() {
				motoring.note = 0;
				removeTimeout(timer2);
				callback();
			}, timeout);
			timeouts.push(timer2);
		}
	};

	ext.restFor = function(beat, callback) {
		beat = parseFloat(beat);
		motoring.buzzer = 0;
		motoring.note = 0;
		if(beat && beat > 0 && tempo > 0) {
			var timer = setTimeout(function() {
				removeTimeout(timer);
				callback();
			}, beat * 60 * 1000 / tempo);
			timeouts.push(timer);
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

	ext.leftFloor = function() {
		return sensory.leftFloor;
	};

	ext.rightFloor = function() {
		return sensory.rightFloor;
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

	ext.light = function() {
		return sensory.light;
	};

	ext.temperature = function() {
		return sensory.temperature;
	};

	ext.signalStrength = function() {
		return sensory.signalStrength;
	};

	ext.handFound = function() {
		return sensory.leftProximity > 50 || sensory.rightProximity > 50;
	};

	ext.setPortTo = function(port, mode) {
		mode = MODES[mode];
		if(mode >= 0) {
			port = PORTS[port];
			if(port == PORT_A) {
				motoring.ioModeA = mode;
			} else if(port == PORT_B) {
				motoring.ioModeB = mode;
			} else {
				motoring.ioModeA = mode;
				motoring.ioModeB = mode;
			}
		}
	};

	ext.changeOutputBy = function(port, value) {
		value = parseFloat(value);
		if(typeof value == 'number') {
			port = PORTS[port];
			if(port == PORT_A) {
				motoring.outputA += value;
			} else if(port == PORT_B) {
				motoring.outputB += value;
			} else {
				motoring.outputA += value;
				motoring.outputB += value;
			}
		}
	};

	ext.setOutputTo = function(port, value) {
		value = parseFloat(value);
		if(typeof value == 'number') {
			port = PORTS[port];
			if(port == PORT_A) {
				motoring.outputA = value;
			} else if(port == PORT_B) {
				motoring.outputB = value;
			} else {
				motoring.outputA = value;
				motoring.outputB = value;
			}
		}
	};

	ext.inputA = function() {
		return sensory.inputA;
	};

	ext.inputB = function() {
		return sensory.inputB;
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
		url: "http://hamster.school"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
