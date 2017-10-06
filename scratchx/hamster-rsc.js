(function(ext) {

	var sensory = {
		map: 0,
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
		lineTracerState: 0
	};
	var motoring = {
		module: 'hamster',
		map: 0xfc000000,
		leftWheel: 0,
		rightWheel: 0,
		buzzer: 0,
		outputA: 0,
		outputB: 0,
		leftLed: 0,
		rightLed: 0,
		note: 0,
		lineTracerMode: 0,
		lineTracerSpeed: 5,
		ioModeA: 0,
		ioModeB: 0,
		motion: 0
	};
	var packet = {
		hamster: motoring,
		extension: {
			module: 'extension'
		}
	};
	const MOTION = {
		NONE: 0,
		FORWARD: 1,
		BACKWARD: 2,
		LEFT: 3,
		RIGHT: 4
	};
	const STRAIGHT_SPEED = 50;
	const MINIMUM_WHEEL_SPEED = 18;
	const GAIN_BASE_SPEED = 2.0;
	const MAX_BASE_SPEED = 50;
	const GAIN_POSITION = 70;
	const GAIN_ANGLE = 50;
	const PI_2 = 2 * Math.PI;
	var connectionState = 1;
	var lineTracerCallback = undefined;
	var boardCommand = 0;
	var boardState = 0;
	var boardCount = 0;
	var boardCallback = undefined;
	var tempo = 60;
	var chat = {
		socket: undefined,
		messages: {}
	};
	var tolerance = {
		position: 15,
		angle: 5 * Math.PI / 180.0
	};
	var colors = {};
	var markers = {};
	var navigator = undefined;
	var timeouts = [];
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
		en: [ 'Please run Robot Coding software.', 'Robot is not connected.', 'Ready' ],
		ko: [ '로봇 코딩 소프트웨어를 실행해 주세요.', '로봇이 연결되어 있지 않습니다.', '정상입니다.' ],
		uz: [ 'Robot Kodlash dasturini ishga tushiring.', 'Robot bog\'lanmagan.', 'Tayyorlangan' ]
	};
	const EXTENSION_NAME = {
		en: 'Hamster',
		ko: '햄스터',
		uz: 'Hamster'
	};
	const BLOCKS = {
		en1: [
			['w', 'move forward once on board', 'boardMoveForward'],
			['w', 'turn %m.left_right once on board', 'boardTurn', 'left'],
			['-'],
			['w', 'move forward 1 sec', 'moveForward'],
			['w', 'move backward 1 sec', 'moveBackward'],
			['w', 'turn %m.left_right 1 sec', 'turn', 'left'],
			['-'],
			[' ', 'set %m.left_right_both led to %m.color', 'setLedTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both led', 'clearLed', 'left'],
			['-'],
			['w', 'beep', 'beep'],
			['-'],
			['b', 'hand found?', 'handFound']
		],
		en2: [
			['w', 'move forward once on board', 'boardMoveForward'],
			['w', 'turn %m.left_right once on board', 'boardTurn', 'left'],
			['-'],
			['w', 'move forward %n secs', 'moveForwardForSecs', 1],
			['w', 'move backward %n secs', 'moveBackwardForSecs', 1],
			['w', 'turn %m.left_right %n secs', 'turnForSecs', 'left', 1],
			['-'],
			[' ', 'set %m.left_right_both led to %m.color', 'setLedTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both led', 'clearLed', 'left'],
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
			['w', 'move forward once on board', 'boardMoveForward'],
			['w', 'turn %m.left_right once on board', 'boardTurn', 'left'],
			['-'],
			['w', 'move forward %n secs', 'moveForwardForSecs', 1],
			['w', 'move backward %n secs', 'moveBackwardForSecs', 1],
			['w', 'turn %m.left_right %n secs', 'turnForSecs', 'left', 1],
			[' ', 'change wheels by left: %n right: %n', 'changeBothWheelsBy', 10, 10],
			[' ', 'set wheels to left: %n right: %n', 'setBothWheelsTo', 30, 30],
			[' ', 'change %m.left_right_both wheel by %n', 'changeWheelBy', 'left', 10],
			[' ', 'set %m.left_right_both wheel to %n', 'setWheelTo', 'left', 30],
			[' ', 'follow %m.black_white line with %m.left_right_both floor sensor', 'followLineUsingFloorSensor', 'black', 'left'],
			['w', 'follow %m.black_white line until %m.left_right_front_rear intersection', 'followLineUntilIntersection', 'black', 'left'],
			[' ', 'set following speed to %m.speed', 'setFollowingSpeedTo', '5'],
			[' ', 'stop', 'stop'],
			['-'],
			[' ', 'set %m.left_right_both led to %m.color', 'setLedTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both led', 'clearLed', 'left'],
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
			['r', 'left floor', 'leftFloor'],
			['r', 'right floor', 'rightFloor'],
			['r', 'x acceleration', 'accelerationX'],
			['r', 'y acceleration', 'accelerationY'],
			['r', 'z acceleration', 'accelerationZ'],
			['r', 'light', 'light'],
			['r', 'temperature', 'temperature'],
			['r', 'signal strength', 'signalStrength'],
			['b', 'hand found?', 'handFound'],
			['-'],
			[' ', 'set port %m.port to %m.mode', 'setPortTo', 'A', 'analog input'],
			[' ', 'change output %m.port by %n', 'changeOutputBy', 'A', 10],
			[' ', 'set output %m.port to %n', 'setOutputTo', 'A', 100],
			['w', '%m.open_close gripper', 'gripper', 'open'],
			[' ', 'clear gripper', 'clearGripper'],
			['r', 'input A', 'inputA'],
			['r', 'input B', 'inputB']
		],
		en4: [
			['w', 'move forward once on board', 'boardMoveForward'],
			['w', 'turn %m.left_right once on board', 'boardTurn', 'left'],
			['-'],
			['w', 'move forward %n secs', 'moveForwardForSecs', 1],
			['w', 'move backward %n secs', 'moveBackwardForSecs', 1],
			['w', 'turn %m.left_right %n secs', 'turnForSecs', 'left', 1],
			[' ', 'change wheels by left: %n right: %n', 'changeBothWheelsBy', 10, 10],
			[' ', 'set wheels to left: %n right: %n', 'setBothWheelsTo', 30, 30],
			[' ', 'change %m.left_right_both wheel by %n', 'changeWheelBy', 'left', 10],
			[' ', 'set %m.left_right_both wheel to %n', 'setWheelTo', 'left', 30],
			[' ', 'follow %m.black_white line with %m.left_right_both floor sensor', 'followLineUsingFloorSensor', 'black', 'left'],
			['w', 'follow %m.black_white line until %m.left_right_front_rear intersection', 'followLineUntilIntersection', 'black', 'left'],
			[' ', 'set following speed to %m.speed', 'setFollowingSpeedTo', '5'],
			[' ', 'stop', 'stop'],
			['-'],
			[' ', 'set %m.left_right_both led to %m.color', 'setLedTo', 'left', 'red'],
			[' ', 'clear %m.left_right_both led', 'clearLed', 'left'],
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
			['r', 'left floor', 'leftFloor'],
			['r', 'right floor', 'rightFloor'],
			['r', 'x acceleration', 'accelerationX'],
			['r', 'y acceleration', 'accelerationY'],
			['r', 'z acceleration', 'accelerationZ'],
			['r', 'light', 'light'],
			['r', 'temperature', 'temperature'],
			['r', 'signal strength', 'signalStrength'],
			['b', 'hand found?', 'handFound'],
			['-'],
			[' ', 'set port %m.port to %m.mode', 'setPortTo', 'A', 'analog input'],
			[' ', 'change output %m.port by %n', 'changeOutputBy', 'A', 10],
			[' ', 'set output %m.port to %n', 'setOutputTo', 'A', 100],
			['w', '%m.open_close gripper', 'gripper', 'open'],
			[' ', 'clear gripper', 'clearGripper'],
			['r', 'input A', 'inputA'],
			['r', 'input B', 'inputB'],
			['-'],
			['w', 'connect to ip: %s port: %n as %s', 'connectToIpPortAs', '127.0.0.1', 60000, 'name'],
			[' ', 'send %s to %s', 'sendTo', 'message', 'receiver'],
			[' ', 'broadcast %s', 'broadcast', 'message'],
			['b', '%s received?', 'messageReceived', 'message'],
			['-'],
			[' ', 'set robot\'s marker to %n', 'setRobotMarkerTo', 0],
			['w', 'move %m.forward_backward to x: %n y: %n', 'moveToXY', 'forward', 320, 240],
			['w', 'turn in direction of x: %n y: %n', 'turnInDirectionOfXY', 320, 240],
			['w', 'turn in direction of %n degrees', 'turnInDirectionOfDegrees', 90],
			['r', '%m.camera_color object\'s %m.color_position', 'dataOfColorObject', 'red', 'x-position'],
			['r', 'marker %n \'s %m.marker_position', 'dataOfMarker', 0, 'x-position'],
			['r', 'distance from marker %n to marker %n', 'distanceFromMarkerToMarker', 0, 1],
			['r', 'orientation from marker %n to marker %n', 'orientationFromMarkerToMarker', 0, 1],
			['-'],
			[' ', 'show image %n', 'showImage', 0],
			[' ', 'hide image %n', 'hideImage', 0],
			[' ', 'set image %n \'s position to x: %n y: %n', 'setImagePositionToXY', 0, 320, 240],
			[' ', 'set image %n \'s orientation to %n degrees', 'setImageOrientationToDegrees', 0, 90],
			[' ', 'set image %n \'s size to %n %', 'setImageSizeTo', 0, 200]
		],
		ko1: [
			['w', '말판 앞으로 한 칸 이동하기', 'boardMoveForward'],
			['w', '말판 %m.left_right 으로 한 번 돌기', 'boardTurn', '왼쪽'],
			['-'],
			['w', '앞으로 1초 이동하기', 'moveForward'],
			['w', '뒤로 1초 이동하기', 'moveBackward'],
			['w', '%m.left_right 으로 1초 돌기', 'turn', '왼쪽'],
			['-'],
			[' ', '%m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both LED 끄기', 'clearLed', '왼쪽'],
			['-'],
			['w', '삐 소리내기', 'beep'],
			['-'],
			['b', '손 찾음?', 'handFound']
		],
		ko2: [
			['w', '말판 앞으로 한 칸 이동하기', 'boardMoveForward'],
			['w', '말판 %m.left_right 으로 한 번 돌기', 'boardTurn', '왼쪽'],
			['-'],
			['w', '앞으로 %n 초 이동하기', 'moveForwardForSecs', 1],
			['w', '뒤로 %n 초 이동하기', 'moveBackwardForSecs', 1],
			['w', '%m.left_right 으로 %n 초 돌기', 'turnForSecs', '왼쪽', 1],
			['-'],
			[' ', '%m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both LED 끄기', 'clearLed', '왼쪽'],
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
			['w', '말판 앞으로 한 칸 이동하기', 'boardMoveForward'],
			['w', '말판 %m.left_right 으로 한 번 돌기', 'boardTurn', '왼쪽'],
			['-'],
			['w', '앞으로 %n 초 이동하기', 'moveForwardForSecs', 1],
			['w', '뒤로 %n 초 이동하기', 'moveBackwardForSecs', 1],
			['w', '%m.left_right 으로 %n 초 돌기', 'turnForSecs', '왼쪽', 1],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기', 'changeBothWheelsBy', 10, 10],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기', 'setBothWheelsTo', 30, 30],
			[' ', '%m.left_right_both 바퀴 %n 만큼 바꾸기', 'changeWheelBy', '왼쪽', 10],
			[' ', '%m.left_right_both 바퀴 %n (으)로 정하기', 'setWheelTo', '왼쪽', 30],
			[' ', '%m.black_white 선을 %m.left_right_both 바닥 센서로 따라가기', 'followLineUsingFloorSensor', '검은색', '왼쪽'],
			['w', '%m.black_white 선을 따라 %m.left_right_front_rear 교차로까지 이동하기', 'followLineUntilIntersection', '검은색', '왼쪽'],
			[' ', '선 따라가기 속도를 %m.speed (으)로 정하기', 'setFollowingSpeedTo', '5'],
			[' ', '정지하기', 'stop'],
			['-'],
			[' ', '%m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both LED 끄기', 'clearLed', '왼쪽'],
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
			['r', '왼쪽 바닥 센서', 'leftFloor'],
			['r', '오른쪽 바닥 센서', 'rightFloor'],
			['r', 'x축 가속도', 'accelerationX'],
			['r', 'y축 가속도', 'accelerationY'],
			['r', 'z축 가속도', 'accelerationZ'],
			['r', '밝기', 'light'],
			['r', '온도', 'temperature'],
			['r', '신호 세기', 'signalStrength'],
			['b', '손 찾음?', 'handFound'],
			['-'],
			[' ', '포트 %m.port 를 %m.mode 으로 정하기', 'setPortTo', 'A', '아날로그 입력'],
			[' ', '출력 %m.port 를 %n 만큼 바꾸기', 'changeOutputBy', 'A', 10],
			[' ', '출력 %m.port 를 %n (으)로 정하기', 'setOutputTo', 'A', 100],
			['w', '집게 %m.open_close', 'gripper', '열기'],
			[' ', '집게 끄기', 'clearGripper'],
			['r', '입력 A', 'inputA'],
			['r', '입력 B', 'inputB']
		],
		ko4: [
			['w', '말판 앞으로 한 칸 이동하기', 'boardMoveForward'],
			['w', '말판 %m.left_right 으로 한 번 돌기', 'boardTurn', '왼쪽'],
			['-'],
			['w', '앞으로 %n 초 이동하기', 'moveForwardForSecs', 1],
			['w', '뒤로 %n 초 이동하기', 'moveBackwardForSecs', 1],
			['w', '%m.left_right 으로 %n 초 돌기', 'turnForSecs', '왼쪽', 1],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기', 'changeBothWheelsBy', 10, 10],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기', 'setBothWheelsTo', 30, 30],
			[' ', '%m.left_right_both 바퀴 %n 만큼 바꾸기', 'changeWheelBy', '왼쪽', 10],
			[' ', '%m.left_right_both 바퀴 %n (으)로 정하기', 'setWheelTo', '왼쪽', 30],
			[' ', '%m.black_white 선을 %m.left_right_both 바닥 센서로 따라가기', 'followLineUsingFloorSensor', '검은색', '왼쪽'],
			['w', '%m.black_white 선을 따라 %m.left_right_front_rear 교차로까지 이동하기', 'followLineUntilIntersection', '검은색', '왼쪽'],
			[' ', '선 따라가기 속도를 %m.speed (으)로 정하기', 'setFollowingSpeedTo', '5'],
			[' ', '정지하기', 'stop'],
			['-'],
			[' ', '%m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both LED 끄기', 'clearLed', '왼쪽'],
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
			['r', '왼쪽 바닥 센서', 'leftFloor'],
			['r', '오른쪽 바닥 센서', 'rightFloor'],
			['r', 'x축 가속도', 'accelerationX'],
			['r', 'y축 가속도', 'accelerationY'],
			['r', 'z축 가속도', 'accelerationZ'],
			['r', '밝기', 'light'],
			['r', '온도', 'temperature'],
			['r', '신호 세기', 'signalStrength'],
			['b', '손 찾음?', 'handFound'],
			['-'],
			[' ', '포트 %m.port 를 %m.mode 으로 정하기', 'setPortTo', 'A', '아날로그 입력'],
			[' ', '출력 %m.port 를 %n 만큼 바꾸기', 'changeOutputBy', 'A', 10],
			[' ', '출력 %m.port 를 %n (으)로 정하기', 'setOutputTo', 'A', 100],
			['w', '집게 %m.open_close', 'gripper', '열기'],
			[' ', '집게 끄기', 'clearGripper'],
			['r', '입력 A', 'inputA'],
			['r', '입력 B', 'inputB'],
			['-'],
			['w', '주소 %s 포트 %n 에 %s (으)로 연결하기', 'connectToIpPortAs', '127.0.0.1', 60000, '이름'],
			[' ', '%s 을(를) %s 에게 보내기', 'sendTo', '메시지', '받는 사람'],
			[' ', '%s 을(를) 모두에게 보내기', 'broadcast', '메시지'],
			['b', '%s 을(를) 받았는가?', 'messageReceived', '메시지'],
			['-'],
			[' ', '로봇의 마커를 %n (으)로 정하기', 'setRobotMarkerTo', 0],
			['w', '%m.forward_backward x %n y %n 위치로 이동하기', 'moveToXY', '앞으로', 320, 240],
			['w', 'x %n y %n 방향으로 돌기', 'turnInDirectionOfXY', 320, 240],
			['w', '%n 도 방향으로 돌기', 'turnInDirectionOfDegrees', 90],
			['r', '%m.camera_color 의 %m.color_position', 'dataOfColorObject', '빨간색', 'x-좌표'],
			['r', '마커 %n 의 %m.marker_position', 'dataOfMarker', 0, 'x-좌표'],
			['r', '마커 %n 에서 마커 %n 까지의 거리', 'distanceFromMarkerToMarker', 0, 1],
			['r', '마커 %n 에서 마커 %n 까지의 방향', 'orientationFromMarkerToMarker', 0, 1],
			['-'],
			[' ', '그림 %n 보이기', 'showImage', 0],
			[' ', '그림 %n 숨기기', 'hideImage', 0],
			[' ', '그림 %n 의 위치를 x %n y %n (으)로 정하기', 'setImagePositionToXY', 0, 320, 240],
			[' ', '그림 %n 의 방향을 %n 도로 정하기', 'setImageOrientationToDegrees', 0, 90],
			[' ', '그림 %n 의 크기를 %n %로 정하기', 'setImageSizeTo', 0, 200]
		],
		uz1: [
			['w', 'doskada bir marta oldinga yurish', 'boardMoveForward'],
			['w', 'doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 'chap'],
			['-'],
			['w', 'oldinga 1 soniya yurish', 'moveForward'],
			['w', 'orqaga 1 soniya yurish', 'moveBackward'],
			['w', '%m.left_right ga 1 soniya o\'girilish', 'turn', 'chap'],
			['-'],
			[' ', '%m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 'chap', 'qizil'],
			[' ', '%m.left_right_both LEDni o\'chirish', 'clearLed', 'chap'],
			['-'],
			['w', 'ovoz chiqarish', 'beep'],
			['-'],
			['b', 'qo\'l topildimi?', 'handFound']
		],
		uz2: [
			['w', 'doskada bir marta oldinga yurish', 'boardMoveForward'],
			['w', 'doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 'chap'],
			['-'],
			['w', 'oldinga %n soniya yurish', 'moveForwardForSecs', 1],
			['w', 'orqaga %n soniya yurish', 'moveBackwardForSecs', 1],
			['w', '%m.left_right ga %n soniya o\'girilish', 'turnForSecs', 'chap', 1],
			['-'],
			[' ', '%m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 'chap', 'qizil'],
			[' ', '%m.left_right_both LEDni o\'chirish', 'clearLed', 'chap'],
			['-'],
			['w', 'ovoz chiqarish', 'beep'],
			['w', '%m.note %m.octave notani %d.beats zarb ijro etish', 'playNoteFor', 'do', '4', 0.5],
			['w', '%d.beats zarb tanaffus', 'restFor', 0.25],
			[' ', 'temni %n ga o\'zgartirish', 'changeTempoBy', 20],
			[' ', 'temni %n bpm ga sozlash', 'setTempoTo', 60],
			['-'],
			['b', 'qo\'l topildimi?', 'handFound']
		],
		uz3: [
			['w', 'doskada bir marta oldinga yurish', 'boardMoveForward'],
			['w', 'doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 'chap'],
			['-'],
			['w', 'oldinga %n soniya yurish', 'moveForwardForSecs', 1],
			['w', 'orqaga %n soniya yurish', 'moveBackwardForSecs', 1],
			['w', '%m.left_right ga %n soniya o\'girilish', 'turnForSecs', 'chap', 1],
			[' ', 'chap g\'ildirakni %n o\'ng g\'ildirakni %n ga o\'zgartirish', 'changeBothWheelsBy', 10, 10],
			[' ', 'chap g\'ildirakni %n o\'ng g\'ildirakni %n ga sozlash', 'setBothWheelsTo', 30, 30],
			[' ', '%m.left_right_both g\'ildirakni %n ga o\'zgartirish', 'changeWheelBy', 'chap', 10],
			[' ', '%m.left_right_both g\'ildirakni %n ga sozlash', 'setWheelTo', 'chap', 30],
			[' ', '%m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish', 'followLineUsingFloorSensor', 'qora', 'chap'],
			['w', '%m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish', 'followLineUntilIntersection', 'qora', 'chap'],
			[' ', 'liniyada ergashish tezligini %m.speed ga sozlash', 'setFollowingSpeedTo', '5'],
			[' ', 'to\'xtatish', 'stop'],
			['-'],
			[' ', '%m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 'chap', 'qizil'],
			[' ', '%m.left_right_both LEDni o\'chirish', 'clearLed', 'chap'],
			['-'],
			['w', 'ovoz chiqarish', 'beep'],
			[' ', 'buzerning ovozini %n ga o\'zgartirish', 'changeBuzzerBy', 10],
			[' ', 'buzerning ovozini %n ga sozlash', 'setBuzzerTo', 1000],
			[' ', 'buzerni o\'chirish', 'clearBuzzer'],
			['w', '%m.note %m.octave notani %d.beats zarb ijro etish', 'playNoteFor', 'do', '4', 0.5],
			['w', '%d.beats zarb tanaffus', 'restFor', 0.25],
			[' ', 'temni %n ga o\'zgartirish', 'changeTempoBy', 20],
			[' ', 'temni %n bpm ga sozlash', 'setTempoTo', 60],
			['-'],
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
			['-'],
			[' ', '%m.port portni %m.mode ga sozlash', 'setPortTo', 'A', 'analog kiritish'],
			[' ', '%m.port portni %n ga o\'zgartirish', 'changeOutputBy', 'A', 10],
			[' ', '%m.port portni %n ga sozlash', 'setOutputTo', 'A', 100],
			['w', 'gripperni %m.open_close', 'gripper', 'oching'],
			[' ', 'gripperni o\'chirish', 'clearGripper'],
			['r', 'A kirish', 'inputA'],
			['r', 'B kirish', 'inputB']
		],
		uz4: [
			['w', 'doskada bir marta oldinga yurish', 'boardMoveForward'],
			['w', 'doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 'chap'],
			['-'],
			['w', 'oldinga %n soniya yurish', 'moveForwardForSecs', 1],
			['w', 'orqaga %n soniya yurish', 'moveBackwardForSecs', 1],
			['w', '%m.left_right ga %n soniya o\'girilish', 'turnForSecs', 'chap', 1],
			[' ', 'chap g\'ildirakni %n o\'ng g\'ildirakni %n ga o\'zgartirish', 'changeBothWheelsBy', 10, 10],
			[' ', 'chap g\'ildirakni %n o\'ng g\'ildirakni %n ga sozlash', 'setBothWheelsTo', 30, 30],
			[' ', '%m.left_right_both g\'ildirakni %n ga o\'zgartirish', 'changeWheelBy', 'chap', 10],
			[' ', '%m.left_right_both g\'ildirakni %n ga sozlash', 'setWheelTo', 'chap', 30],
			[' ', '%m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish', 'followLineUsingFloorSensor', 'qora', 'chap'],
			['w', '%m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish', 'followLineUntilIntersection', 'qora', 'chap'],
			[' ', 'liniyada ergashish tezligini %m.speed ga sozlash', 'setFollowingSpeedTo', '5'],
			[' ', 'to\'xtatish', 'stop'],
			['-'],
			[' ', '%m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 'chap', 'qizil'],
			[' ', '%m.left_right_both LEDni o\'chirish', 'clearLed', 'chap'],
			['-'],
			['w', 'ovoz chiqarish', 'beep'],
			[' ', 'buzerning ovozini %n ga o\'zgartirish', 'changeBuzzerBy', 10],
			[' ', 'buzerning ovozini %n ga sozlash', 'setBuzzerTo', 1000],
			[' ', 'buzerni o\'chirish', 'clearBuzzer'],
			['w', '%m.note %m.octave notani %d.beats zarb ijro etish', 'playNoteFor', 'do', '4', 0.5],
			['w', '%d.beats zarb tanaffus', 'restFor', 0.25],
			[' ', 'temni %n ga o\'zgartirish', 'changeTempoBy', 20],
			[' ', 'temni %n bpm ga sozlash', 'setTempoTo', 60],
			['-'],
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
			['-'],
			[' ', '%m.port portni %m.mode ga sozlash', 'setPortTo', 'A', 'analog kiritish'],
			[' ', '%m.port portni %n ga o\'zgartirish', 'changeOutputBy', 'A', 10],
			[' ', '%m.port portni %n ga sozlash', 'setOutputTo', 'A', 100],
			['w', 'gripperni %m.open_close', 'gripper', 'oching'],
			[' ', 'gripperni o\'chirish', 'clearGripper'],
			['r', 'A kirish', 'inputA'],
			['r', 'B kirish', 'inputB'],
			['-'],
			['w', 'ip: %s port: %n ga %s sifatida ulang', 'connectToIpPortAs', '127.0.0.1', 60000, 'nomi'],
			[' ', '%s ni %s ga yuboring', 'sendTo', 'xabar', 'qabul qiluvchi'],
			[' ', '%s ni hammaga yuboring', 'broadcast', 'xabar'],
			['b', '%s ni qabul qiling?', 'messageReceived', 'xabar'],
			['-'],
			[' ', 'robotning markerini %n ga sozlash', 'setRobotMarkerTo', 0],
			['w', '%m.forward_backward x: %n y: %n tomonga yurish', 'moveToXY', 'oldinga', 320, 240],
			['w', 'x: %n y: %n tomonga o\'girilish', 'turnInDirectionOfXY', 320, 240],
			['w', '%n daraja tomonga o\'girilish', 'turnInDirectionOfDegrees', 90],
			['r', '%m.camera_color ning %m.color_position', 'dataOfColorObject', 'qizil', 'x-holati'],
			['r', 'marker %n ning %m.marker_position', 'dataOfMarker', 0, 'x-holati'],
			['r', 'marker %n dan marker %n gacha masofa', 'distanceFromMarkerToMarker', 0, 1],
			['r', 'marker %n dan marker %n gacha orientatsiya', 'orientationFromMarkerToMarker', 0, 1],
			['-'],
			[' ', 'rasm %n ni ko\'rsatish', 'showImage', 0],
			[' ', 'rasm %n ni yashirish', 'hideImage', 0],
			[' ', 'rasm %n ning pozitsiyasini x %n y %n ga sozlash', 'setImagePositionToXY', 0, 320, 240],
			[' ', 'rasm %n ning yo\'nalishini %n darajaga sozlash', 'setImageOrientationToDegrees', 0, 90],
			[' ', 'rasm %n ning o\'lchamini %n % ga sozlash', 'setImageSizeTo', 0, 200]
		]
	};
	const MENUS = {
		en: {
			'left_right': ['left', 'right'],
			'left_right_both': ['left', 'right', 'both'],
			'black_white': ['black', 'white'],
			'left_right_front_rear': ['left', 'right', 'front', 'rear'],
			'forward_backward': ['forward', 'backward'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'color': ['red', 'yellow', 'green', 'sky blue', 'blue', 'purple', 'white'],
			'note': ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'port': ['A', 'B', 'A and B'],
			'mode': ['analog input', 'digital input', 'servo output', 'pwm output', 'digital output'],
			'open_close': ['open', 'close'],
			'camera_color': ['red', 'yellow', 'green', 'sky-blue', 'blue', 'purple'],
			'color_position': ['x-position', 'y-position', 'left-position', 'right-position', 'top-position', 'bottom-position', 'width', 'height', 'area'],
			'marker_position': ['x-position', 'y-position', 'left-position', 'right-position', 'top-position', 'bottom-position', 'orientation', 'width', 'height', 'area']
		},
		ko: {
			'left_right': ['왼쪽', '오른쪽'],
			'left_right_both': ['왼쪽', '오른쪽', '양쪽'],
			'black_white': ['검은색', '하얀색'],
			'left_right_front_rear': ['왼쪽', '오른쪽', '앞쪽', '뒤쪽'],
			'forward_backward': ['앞으로', '뒤로'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '자주색', '하얀색'],
			'note': ['도', '도#', '레', '미b', '미', '파', '파#', '솔', '솔#', '라', '시b', '시'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'port': ['A', 'B', 'A와 B'],
			'mode': ['아날로그 입력', '디지털 입력', '서보 출력', 'PWM 출력', '디지털 출력'],
			'open_close': ['열기', '닫기'],
			'camera_color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '자주색'],
			'color_position': ['x-좌표', 'y-좌표', '왼쪽-좌표', '오른쪽-좌표', '위쪽-좌표', '아래쪽-좌표', '폭', '높이', '넓이'],
			'marker_position': ['x-좌표', 'y-좌표', '왼쪽-좌표', '오른쪽-좌표', '위쪽-좌표', '아래쪽-좌표', '방향', '폭', '높이', '넓이']
		},
		uz: {
			'left_right': ['chap', 'o\'ng'],
			'left_right_both': ['chap', 'o\'ng', 'har ikki'],
			'black_white': ['qora', 'oq'],
			'left_right_front_rear': ['chap', 'o\'ng', 'old', 'orqa'],
			'forward_backward': ['oldinga', 'orqaga'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyoh', 'oq'],
			'note': ['do', 'do#', 're', 'mib', 'mi', 'fa', 'fa#', 'sol', 'sol#', 'lya', 'sib', 'si'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'port': ['A', 'B', 'A va B'],
			'mode': ['analog kiritish', 'raqamli kiritish', 'servo chiqish', 'pwm chiqish', 'raqamli chiqish'],
			'open_close': ['oching', 'yoping'],
			'camera_color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyoh'],
			'color_position': ['x-holati', 'y-holati', 'chap-holati', 'o\'ng-holati', 'tepada-holati', 'pastda-holati', 'kengligi', 'balandligi', 'maydoni'],
			'marker_position': ['x-holati', 'y-holati', 'chap-holati', 'o\'ng-holati', 'tepada-holati', 'pastda-holati', 'orientatsiya', 'kengligi', 'balandligi', 'maydoni']
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
	var MODES = {};
	var VALUES = {};
	var CAMERA_COLORS = {};
	var CAMERA_DATA = {};
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const FRONT = 4;
	const REAR = 5;
	const WHITE = 6;
	const OPEN = 7;
	const CLOSE = 8;
	const FORWARD = 9;
	const BACKWARD = 10;
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
		tmp = MENUS[i]['mode'];
		MODES[tmp[0]] = 0;
		MODES[tmp[1]] = 1;
		MODES[tmp[2]] = 8;
		MODES[tmp[3]] = 9;
		MODES[tmp[4]] = 10;
		tmp = MENUS[i]['left_right_both'];
		VALUES[tmp[0]] = LEFT;
		VALUES[tmp[1]] = RIGHT;
		VALUES[tmp[2]] = BOTH;
		tmp = MENUS[i]['left_right_front_rear'];
		VALUES[tmp[2]] = FRONT;
		VALUES[tmp[3]] = REAR;
		tmp = MENUS[i]['black_white'];
		VALUES[tmp[1]] = WHITE;
		tmp = MENUS[i]['open_close'];
		VALUES[tmp[0]] = OPEN;
		VALUES[tmp[1]] = CLOSE;
		tmp = MENUS[i]['forward_backward'];
		VALUES[tmp[0]] = FORWARD;
		VALUES[tmp[1]] = BACKWARD;
		tmp = MENUS[i]['camera_color'];
		CAMERA_COLORS[tmp[0]] = 'red';
		CAMERA_COLORS[tmp[1]] = 'yellow';
		CAMERA_COLORS[tmp[2]] = 'green';
		CAMERA_COLORS[tmp[3]] = 'cyan';
		CAMERA_COLORS[tmp[4]] = 'blue';
		CAMERA_COLORS[tmp[5]] = 'magenta';
		tmp = MENUS[i]['marker_position'];
		CAMERA_DATA[tmp[0]] = 'x';
		CAMERA_DATA[tmp[1]] = 'y';
		CAMERA_DATA[tmp[2]] = 'left';
		CAMERA_DATA[tmp[3]] = 'right';
		CAMERA_DATA[tmp[4]] = 'top';
		CAMERA_DATA[tmp[5]] = 'bottom';
		CAMERA_DATA[tmp[6]] = 'theta';
		CAMERA_DATA[tmp[7]] = 'width';
		CAMERA_DATA[tmp[8]] = 'height';
		CAMERA_DATA[tmp[9]] = 'area';
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
		motoring.map = 0xfc000000;
	}
	
	function setLeftLed(color) {
		motoring.leftLed = color;
		motoring.map |= 0x01000000;
	}
	
	function setRightLed(color) {
		motoring.rightLed = color;
		motoring.map |= 0x00800000;
	}
	
	function setNote(note) {
		motoring.note = note;
		motoring.map |= 0x00400000;
	}

	function setLineTracerMode(mode) {
		motoring.lineTracerMode = mode;
		motoring.map |= 0x00200000;
	}
	
	function setLineTracerSpeed(speed) {
		motoring.lineTracerSpeed = speed;
		motoring.map |= 0x00100000;
	}
	
	function setIoModeA(mode) {
		motoring.ioModeA = mode;
		motoring.map |= 0x00080000;
	}
	
	function setIoModeB(mode) {
		motoring.ioModeB = mode;
		motoring.map |= 0x00040000;
	}
	
	function chatDisconnect() {
		if(chat.socket) {
			chat.socket.close();
			chat.socket = undefined;
		}
	}
	
	function chatSend(data) {
		if(chat.socket) {
			try {
				chat.socket.send(JSON.stringify(data));
			} catch (e) {
			}
		}
	}
	
	function getNavigator() {
		if(!navigator) {
			navigator = {
				x: -1,
				y: -1,
				theta: 0,
				targetPositionX: -1,
				targetPositionY: -1,
				targetDirectionX: -1,
				targetDirectionY: -1,
				targetDegree: -200,
				backward: false,
				marker: -1,
				command: 0,
				callback: undefined,
				wheels: { left: 0, right: 0 },
				reset: function() {
					this.marker = -1;
					this.command = 0;
					this.callback = undefined;
				},
				clear: function() {
					this.x = -1;
					this.y = -1;
					this.theta = 0;
					this.targetPositionX = -1;
					this.targetPositionY = -1;
					this.targetDirectionX = -1;
					this.targetDirectionY = -1;
					this.targetDegree = -200;
					this.backward = false;
					this.wheels.left = 0;
					this.wheels.right = 0;
				},
				setTargetPosition: function(x, y) {
					this.targetPositionX = x;
					this.targetPositionY = y;
				},
				setTargetDirection: function(x, y) {
					this.targetDirectionX = x;
					this.targetDirectionY = y;
				},
				setTargetDegree: function(degree) {
					this.targetDegree = degree;
				},
				setBackward: function(backward) {
					this.backward = backward;
				},
				updatePosition: function() {
					var data = markers[this.marker];
					if(data) {
						this.x = data.x;
						this.y = data.y;
						this.theta = data.theta;
					}
				},
				moveTo: function() {
					var x = this.x;
					var y = this.y;
					var targetX = this.targetPositionX;
					var targetY = this.targetPositionY;
					var backward = this.backward;
					if(x >= 0 && y >= 0 && targetX >= 0 && targetY >= 0) {
						var currentRadian = this.theta * Math.PI / 180.0;
						if(backward) currentRadian += Math.PI;
						var targetRadian = Math.atan2(targetY - y, targetX - x);
						var diff = this.validateRadian(targetRadian - currentRadian);
						var mag = Math.abs(diff);
						var ex = targetX - x;
						var ey = targetY - y;
						var dist = Math.sqrt(ex * ex + ey * ey);
						if(dist > tolerance.position) {
							var wheels = this.wheels;
							if(mag < 0.01) {
								wheels.left = STRAIGHT_SPEED;
								wheels.right = STRAIGHT_SPEED;
							} else {
								var base = (MINIMUM_WHEEL_SPEED + 0.5 / mag) * GAIN_BASE_SPEED;
								if(base > MAX_BASE_SPEED) base = MAX_BASE_SPEED;
								var value = 0;
								if(diff > 0) value = Math.log(1 + mag) * GAIN_POSITION;
								else value = -Math.log(1 + mag) * GAIN_POSITION;
								if(backward) value = -value;
								wheels.left = parseInt(base - value);
								wheels.right = parseInt(base + value);
							}
							if(backward) {
								wheels.left = -wheels.left;
								wheels.right = -wheels.right;
							}
							return wheels;
						}
					} else {
						return this.wheels;
					}
				},
				turn: function(targetRadian) {
					var currentRadian = this.theta * Math.PI / 180.0;
					console.log('turn1 ' + currentRadian);
					var diff = this.validateRadian(targetRadian - currentRadian);
					var mag = Math.abs(diff);
					console.log('turn2 ' + mag + ', ' + tolerance.angle);
					var direction = (diff > 0) ? 1 : -1;
					if(mag > tolerance.angle) {
						var value = 0;
						if(diff > 0) value = Math.log(1 + mag) * GAIN_ANGLE;
						else value = -Math.log(1 + mag) * GAIN_ANGLE;
						var wheels = this.wheels;
						wheels.left = -value;
						wheels.right = value;
						console.log(wheels);
						return wheels;
					}
				},
				turnToXY: function() {
					var x = this.x;
					var y = this.y;
					var targetX = this.targetDirectionX;
					var targetY = this.targetDirectionY;
					if(x >= 0 && y >= 0 && targetX >= 0 && targetY >= 0) {
						var targetRadian = Math.atan2(targetY - y, targetX - x);
						return this.turn(targetRadian);
					} else {
						return this.wheels;
					}
				},
				turnToDegree: function() {
					var targetDegree = this.targetDegree;
					console.log(targetDegree);
					if(targetDegree > -200) {
						var targetRadian = targetDegree * Math.PI / 180.0;
						return this.turn(targetRadian);
					} else {
						return this.wheels;
					}
				},
				validateRadian: function(radian) {
					if(radian > Math.PI) return radian - this.PI_2;
					else if(radian < -Math.PI) return radian + this.PI_2;
					return radian;
				}
			};
		}
		return navigator;
	}
	
	function getArImage(id, index) {
		var ar = packet.extension.ar;
		if(ar === undefined) {
			ar = {};
			packet.extension.ar = ar;
		}
		var image = ar[id];
		if(image === undefined) {
			image = {};
			ar[id] = image;
		}
		image['id'] = index;
		return image;
	}

	function reset() {
		motoring.map = 0xfdfc0000;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.buzzer = 0;
		motoring.outputA = 0;
		motoring.outputB = 0;
		motoring.leftLed = 0;
		motoring.rightLed = 0;
		motoring.note = 0;
		motoring.lineTracerMode = 0;
		motoring.lineTracerSpeed = 5;
		motoring.ioModeA = 0;
		motoring.ioModeB = 0;
		motoring.motion = 0;
		
		lineTracerCallback = undefined;
		boardCommand = 0;
		boardState = 0;
		boardCount = 0;
		boardCallback = undefined;
		tempo = 60;
		packet.extension.ar = {};
		chat.messages = {};
		colors = {};
		markers = {};
		if(navigator) {
			navigator.reset();
			navigator = undefined;
		}
		removeAllTimeouts();
		chatDisconnect();
	}
	
	function handleLineTracer() {
		if(sensory.map & 0x00000010) {
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
	
	function handleNavigation() {
		var navi = getNavigator();
		navi.updatePosition();
		var wheels = undefined;
		if(navi.command == 1) {
			wheels = navi.moveTo();
		} else if(navi.command == 2) {
			wheels = navi.turnToXY();
		} else if(navi.command == 3) {
			console.log('test4');
			wheels = navi.turnToDegree();
		}
		if(wheels) {
			motoring.leftWheel = wheels.left;
			motoring.rightWheel = wheels.right;
		} else {
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			navi.command = 0;
			var callback = navi.callback;
			navi.callback = undefined;
			callback();
		}
	}

	function open(url) {
		if('WebSocket' in window) {
			try {
				var sock = new WebSocket(url);
				sock.binaryType = 'arraybuffer';
				socket = sock;
				sock.onopen = function() {
					sock.onmessage = function(message) {
						try {
							var received = JSON.parse(message.data);
							var data;
							for(var i in received) {
								data = received[i];
								if(i == 'connection') {
									if(data.module == 'hamster') {
										connectionState = data.state;
									}
								} else {
									if(data.module == 'extension') {
										if(data.colors) colors = data.colors;
										if(data.markers) markers = data.markers;
										if(data.tolerance) tolerance = data.tolerance;
									} else if(data.module == 'hamster' && data.index == 0) {
										sensory = data;
										if(lineTracerCallback) handleLineTracer();
										if(boardCallback) handleBoard();
										if(navigator && navigator.callback) handleNavigation();
									}
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

	ext.boardMoveForward = function(callback) {
		motoring.motion = MOTION.NONE;
		setLineTracerMode(0);
		motoring.leftWheel = 45;
		motoring.rightWheel = 45;
		boardCommand = 1;
		boardState = 1;
		boardCount = 0;
		boardCallback = callback;
	};

	ext.boardTurn = function(direction, callback) {
		motoring.motion = MOTION.NONE;
		setLineTracerMode(0);
		if(VALUES[direction] === LEFT) {
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
		motoring.motion = MOTION.FORWARD;
		boardCommand = 0;
		setLineTracerMode(0);
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
		boardCommand = 0;
		setLineTracerMode(0);
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
		boardCommand = 0;
		setLineTracerMode(0);
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
		boardCommand = 0;
		setLineTracerMode(0);
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
		boardCommand = 0;
		setLineTracerMode(0);
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
		boardCommand = 0;
		setLineTracerMode(0);
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
		boardCommand = 0;
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
		motoring.motion = MOTION.NONE;
		boardCommand = 0;
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
		motoring.motion = MOTION.NONE;
		boardCommand = 0;
		setLineTracerMode(0);
		if(typeof speed == 'number') {
			which = VALUES[which];
			if(which === LEFT) {
				motoring.leftWheel += speed;
			}
			else if(which === RIGHT) {
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
		motoring.motion = MOTION.NONE;
		boardCommand = 0;
		setLineTracerMode(0);
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

	ext.followLineUsingFloorSensor = function(color, which) {
		var mode = 1;
		which = VALUES[which];
		if(which === RIGHT)
			mode = 2;
		else if(which === BOTH)
			mode = 3;
		if(VALUES[color] === WHITE)
			mode += 7;
		
		motoring.motion = MOTION.NONE;
		boardCommand = 0;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setLineTracerMode(mode);
	};

	ext.followLineUntilIntersection = function(color, which, callback) {
		var mode = 4;
		which = VALUES[which];
		if(which === RIGHT)
			mode = 5;
		else if(which === FRONT)
			mode = 6;
		else if(which === REAR)
			mode = 7;
		if(VALUES[color] === WHITE)
			mode += 7;
		
		motoring.motion = MOTION.NONE;
		boardCommand = 0;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setLineTracerMode(mode);
		lineTracerCallback = callback;
	};

	ext.setFollowingSpeedTo = function(speed) {
		speed = parseInt(speed);
		if(typeof speed == 'number') {
			setLineTracerSpeed(speed);
		}
	};

	ext.stop = function() {
		motoring.motion = MOTION.NONE;
		boardCommand = 0;
		setLineTracerMode(0);
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
	};

	ext.setLedTo = function(which, color) {
		color = COLORS[color];
		if(color && color > 0) {
			which = VALUES[which];
			if(which === LEFT) {
				setLeftLed(color);
			} else if(which === RIGHT) {
				setRightLed(color);
			} else {
				setLeftLed(color);
				setRightLed(color);
			}
		}
	};

	ext.clearLed = function(which) {
		which = VALUES[which];
		if(which === LEFT) {
			setLeftLed(0);
		} else if(which === RIGHT) {
			setRightLed(0);
		} else {
			setLeftLed(0);
			setRightLed(0);
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
		if(typeof mode == 'number') {
			if(port == 'A') {
				setIoModeA(mode);
			} else if(port == 'B') {
				setIoModeB(mode);
			} else {
				setIoModeA(mode);
				setIoModeB(mode);
			}
		}
	};

	ext.changeOutputBy = function(port, value) {
		value = parseFloat(value);
		if(typeof value == 'number') {
			if(port == 'A') {
				motoring.outputA += value;
			} else if(port == 'B') {
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
			if(port == 'A') {
				motoring.outputA = value;
			} else if(port == 'B') {
				motoring.outputB = value;
			} else {
				motoring.outputA = value;
				motoring.outputB = value;
			}
		}
	};
	
	ext.gripper = function(action, callback) {
		action = VALUES[action];
		setIoModeA(10);
		setIoModeB(10);
		if(action == OPEN) {
			motoring.outputA = 1;
			motoring.outputB = 0;
		} else {
			motoring.outputA = 0;
			motoring.outputB = 1;
		}
		var timer = setTimeout(function() {
			removeTimeout(timer);
			callback();
		}, 500);
		timeouts.push(timer);
	};
	
	ext.clearGripper = function() {
		setIoModeA(10);
		setIoModeB(10);
		motoring.outputA = 0;
		motoring.outputB = 0;
	};

	ext.inputA = function() {
		return sensory.inputA;
	};

	ext.inputB = function() {
		return sensory.inputB;
	};
	
	ext.connectToIpPortAs = function(ip, port, name, callback) {
		port = parseInt(port);
		if(('WebSocket' in window) && (typeof port == 'number') && port > 0) {
			chatDisconnect();
			try {
				var sock = new WebSocket('ws://' + ip + ':' + port);
				sock.binaryType = 'arraybuffer';
				chat.socket = sock;
				sock.onopen = function() {
					sock.onmessage = function(message) {
						try {
							var data = JSON.parse(message.data);
							if(data.type === 'send' || data.type === 'broadcast') {
								chat.messages[data.message] = true;
							}
						} catch (e) {
						}
					};
					sock.onclose = function() {
						chat.socket = undefined;
					};
					chatSend({
						type: 'register',
						name: name
					});
					callback();
				};
			} catch (e) {
			}
		} else {
			callback();
		}
	};
	
	ext.sendTo = function(message, receiver) {
		chatSend({
			type: 'send',
			to: receiver,
			message: message
		});
	};
	
	ext.broadcast = function(message) {
		chatSend({
			type: 'broadcast',
			message: message
		});
	};
	
	ext.messageReceived = function(message) {
		return chat.messages[message] === true;
	};
	
	ext.setRobotMarkerTo = function(marker) {
		marker = parseInt(marker);
		if((typeof marker == 'number') && marker >= 0) {
			var navi = getNavigator();
			navi.marker = marker;
		}
	};
	
	ext.moveToXY = function(direction, x, y, callback) {
		x = parseInt(x);
		y = parseInt(y);
		if((typeof x == 'number') && (typeof y == 'number')) {
			boardCommand = 0;
			setLineTracerMode(0);
			var navi = getNavigator();
			navi.clear();
			navi.setTargetPosition(x, y);
			navi.setBackward(VALUES[direction] == BACKWARD);
			navi.callback = callback;
			navi.command = 1;
		} else {
			callback();
		}
	};
	
	ext.turnInDirectionOfXY = function(x, y, callback) {
		x = parseInt(x);
		y = parseInt(y);
		if((typeof x == 'number') && (typeof y == 'number')) {
			boardCommand = 0;
			setLineTracerMode(0);
			var navi = getNavigator();
			navi.clear();
			navi.setTargetDirection(x, y);
			navi.callback = callback;
			navi.command = 2;
		} else {
			callback();
		}
	};
	
	ext.turnInDirectionOfDegrees = function(degree, callback) {
		degree = parseFloat(degree);
		console.log('test1');
		if(typeof degree == 'number') {
			console.log('test2');
			if(degree > 180) {
				while(degree > 180) degree -= 360;
			} else if(degree < -180) {
				while(degree < -180) degree += 360;
			}
			console.log('test2-1');
			boardCommand = 0;
			setLineTracerMode(0);
			console.log('test2-2');
			var navi = getNavigator();
			console.log('test2-3');
			navi.clear();
			console.log('test2-4');
			navi.setTargetDegree(degree);
			console.log('test2-5');
			navi.callback = callback;
			console.log('test2-6');
			navi.command = 3;
			console.log('test3');
		} else {
			callback();
		}
	};
	
	ext.dataOfColorObject = function(color, value) {
		color = CAMERA_COLORS[color];
		value = CAMERA_DATA[value];
		color = colors[color];
		if(color) {
			value = color[value];
			if(typeof value == 'number') return value;
		}
		return -1;
	};
	
	ext.dataOfMarker = function(marker, value) {
		marker = parseInt(marker);
		value = CAMERA_DATA[value];
		if((typeof marker == 'number') && marker >= 0) {
			marker = markers[marker];
			if(marker) {
				var v = marker[value];
				if(typeof v == 'number') return v;
			}
		}
		if(value === 'theta') return -200;
		else return -1;
	};
	
	ext.distanceFromMarkerToMarker = function(marker1, marker2) {
		marker1 = parseInt(marker1);
		marker2 = parseInt(marker2);
		if((typeof marker1 == 'number') && marker1 >= 0 && (typeof marker2 == 'number') && marker2 >= 0) {
			marker1 = markers[marker1];
			marker2 = markers[marker2];
			if(marker1 && marker2) {
				var x1 = marker1.x;
				var y1 = marker1.y;
				var x2 = marker2.x;
				var y2 = marker2.y;
				if((typeof x1 == 'number') && (typeof y1 == 'number') && (typeof x2 == 'number') && (typeof y2 == 'number')) {
					var dx = x2 - x1, dy = y2 - y1;
					return Math.sqrt(dx * dx + dy * dy);
				}
			}
		}
		return 2147483647;
	};
	
	ext.orientationFromMarkerToMarker = function(marker1, marker2) {
		marker1 = parseInt(marker1);
		marker2 = parseInt(marker2);
		if((typeof marker1 == 'number') && marker1 >= 0 && (typeof marker2 == 'number') && marker2 >= 0) {
			marker1 = markers[marker1];
			marker2 = markers[marker2];
			if(marker1 && marker2) {
				var x1 = marker1.x;
				var y1 = marker1.y;
				var x2 = marker2.x;
				var y2 = marker2.y;
				if((typeof x1 == 'number') && (typeof y1 == 'number') && (typeof x2 == 'number') && (typeof y2 == 'number')) {
					var dx = x2 - x1, dy = y2 - y1;
					return Math.atan2(dy, dx) * 180.0 / Math.PI;
				}
			}
		}
		return -200;
	};
	
	ext.showImage = function(index) {
		index = parseInt(index);
		if((typeof index == 'number') && index >= 0) {
			var id = 'image' + index;
			var image = getArImage(id, index);
			image['visible'] = true;
		}
	};
	
	ext.hideImage = function(index) {
		index = parseInt(index);
		if((typeof index == 'number') && index >= 0) {
			var id = 'image' + index;
			var image = getArImage(id, index);
			image['visible'] = false;
		}
	};
	
	ext.setImagePositionToXY = function(index, x, y) {
		index = parseInt(index);
		x = parseInt(x);
		y = parseInt(y);
		if((typeof index == 'number') && index >= 0 && (typeof x == 'number') && (typeof y == 'number')) {
			var id = 'image' + index;
			var image = getArImage(id, index);
			image['x'] = x;
			image['y'] = y;
		}
	};
	
	ext.setImageOrientationToDegrees = function(index, degree) {
		index = parseInt(index);
		degree = parseFloat(degree);
		if((typeof index == 'number') && index >= 0 && (typeof degree == 'number')) {
			if(degree > 180) {
				while(degree > 180) degree -= 360;
			} else if(degree < -180) {
				while(degree < -180) degree += 360;
			}
			var id = 'image' + index;
			var image = getArImage(id, index);
			image['theta'] = degree;
		}
	};
	
	ext.setImageSizeTo = function(index, scale) {
		index = parseInt(index);
		scale = parseFloat(scale);
		if((typeof index == 'number') && index >= 0 && (typeof scale == 'number') && scale > 0) {
			var id = 'image' + index;
			var image = getArImage(id, index);
			image['scale'] = scale / 100.0;
		}
	};

	ext._getStatus = function() {
		chat.messages = {};
		
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
