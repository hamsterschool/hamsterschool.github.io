(function(ext) {

	var robots = {};
	var motorings = {};
	var connectionState = 1;
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
		uz: [ 'Robot Kodlash dasturini ishga tushiring.', 'Robot bog\'lanmagan.', 'Tayyorlangan' ]
	};
	var EXTENSION_NAME = {
		en: 'Hamster',
		ko: '햄스터',
		uz: 'Hamster'
	};
	var BLOCKS = {
		en1: [
			['w', 'Hamster %n : move forward once on board', 'boardMoveForward', 0],
			['w', 'Hamster %n : turn %m.left_right once on board', 'boardTurn', 0, 'left'],
			['w', 'Hamster %n : move forward for 1 second', 'moveForward', 0],
			['w', 'Hamster %n : move backward for 1 second', 'moveBackward', 0],
			['w', 'Hamster %n : turn %m.left_right for 1 second', 'turn', 0, 'left'],
			[' ', 'Hamster %n : set %m.left_right_both led to %m.color', 'setLedTo', 0, 'left', 'red'],
			[' ', 'Hamster %n : clear %m.left_right_both led', 'clearLed', 0, 'left'],
			['w', 'Hamster %n : beep', 'beep', 0],
			['b', 'Hamster[0]: hand found?', 'handFound0'],
			['b', 'Hamster[1]: hand found?', 'handFound1'],
			['b', 'Hamster[2]: hand found?', 'handFound2'],
			['b', 'Hamster[3]: hand found?', 'handFound3'],
			['b', 'Hamster[4]: hand found?', 'handFound4'],
			['b', 'Hamster[5]: hand found?', 'handFound5']
		],
		en2: [
			['w', 'Hamster %n : move forward once on board', 'boardMoveForward', 0],
			['w', 'Hamster %n : turn %m.left_right once on board', 'boardTurn', 0, 'left'],
			['w', 'Hamster %n : move forward for %n secs', 'moveForwardForSecs', 0, 1],
			['w', 'Hamster %n : move backward for %n secs', 'moveBackwardForSecs', 0, 1],
			['w', 'Hamster %n : turn %m.left_right for %n secs', 'turnForSecs', 0, 'left', 1],
			[' ', 'Hamster %n : set %m.left_right_both led to %m.color', 'setLedTo', 0, 'left', 'red'],
			[' ', 'Hamster %n : clear %m.left_right_both led', 'clearLed', 0, 'left'],
			['w', 'Hamster %n : beep', 'beep', 0],
			['w', 'Hamster %n : play note %m.note %m.octave for %n beats', 'playNoteFor', 0, 'C', '4', 0.5],
			['w', 'Hamster %n : rest for %n beats', 'restFor', 0, 0.25],
			[' ', 'Hamster %n : change tempo by %n', 'changeTempoBy', 0, 20],
			[' ', 'Hamster %n : set tempo to %n bpm', 'setTempoTo', 0, 60],
			['b', 'Hamster[0]: hand found?', 'handFound0'],
			['b', 'Hamster[1]: hand found?', 'handFound1'],
			['b', 'Hamster[2]: hand found?', 'handFound2'],
			['b', 'Hamster[3]: hand found?', 'handFound3'],
			['b', 'Hamster[4]: hand found?', 'handFound4'],
			['b', 'Hamster[5]: hand found?', 'handFound5']
		],
		en3: [
			['w', 'Hamster %n : move forward once on board', 'boardMoveForward', 0],
			['w', 'Hamster %n : turn %m.left_right once on board', 'boardTurn', 0, 'left'],
			['w', 'Hamster %n : move forward for %n secs', 'moveForwardForSecs', 0, 1],
			['w', 'Hamster %n : move backward for %n secs', 'moveBackwardForSecs', 0, 1],
			['w', 'Hamster %n : turn %m.left_right for %n secs', 'turnForSecs', 0, 'left', 1],
			[' ', 'Hamster %n : change wheels by left: %n right: %n', 'changeBothWheelsBy', 0, 10, 10],
			[' ', 'Hamster %n : set wheels to left: %n right: %n', 'setBothWheelsTo', 0, 30, 30],
			[' ', 'Hamster %n : change %m.left_right_both wheel by %n', 'changeWheelBy', 0, 'left', 10],
			[' ', 'Hamster %n : set %m.left_right_both wheel to %n', 'setWheelTo', 0, 'left', 30],
			[' ', 'Hamster %n : follow %m.black_white line using %m.left_right_both floor sensor', 'followLineUsingFloorSensor', 0, 'black', 'left'],
			['w', 'Hamster %n : follow %m.black_white line until %m.left_right_front_rear intersection', 'followLineUntilIntersection', 0, 'black', 'left'],
			[' ', 'Hamster %n : set following speed to %m.speed', 'setFollowingSpeedTo', 0, '5'],
			[' ', 'Hamster %n : stop', 'stop', 0],
			[' ', 'Hamster %n : set %m.left_right_both led to %m.color', 'setLedTo', 0, 'left', 'red'],
			[' ', 'Hamster %n : clear %m.left_right_both led', 'clearLed', 0, 'left'],
			['w', 'Hamster %n : beep', 'beep', 0],
			[' ', 'Hamster %n : change buzzer by %n', 'changeBuzzerBy', 0, 10],
			[' ', 'Hamster %n : set buzzer to %n', 'setBuzzerTo', 0, 1000],
			[' ', 'Hamster %n : clear buzzer', 'clearBuzzer', 0],
			['w', 'Hamster %n : play note %m.note %m.octave for %n beats', 'playNoteFor', 0, 'C', '4', 0.5],
			['w', 'Hamster %n : rest for %n beats', 'restFor', 0, 0.25],
			[' ', 'Hamster %n : change tempo by %n', 'changeTempoBy', 0, 20],
			[' ', 'Hamster %n : set tempo to %n bpm', 'setTempoTo', 0, 60],
			['r', 'Hamster[0]: left proximity', 'leftProximity0'],
			['r', 'Hamster[0]: right proximity', 'rightProximity0'],
			['r', 'Hamster[0]: left floor', 'leftFloor0'],
			['r', 'Hamster[0]: right floor', 'rightFloor0'],
			['r', 'Hamster[0]: x acceleration', 'accelerationX0'],
			['r', 'Hamster[0]: y acceleration', 'accelerationY0'],
			['r', 'Hamster[0]: z acceleration', 'accelerationZ0'],
			['r', 'Hamster[0]: light', 'light0'],
			['r', 'Hamster[0]: temperature', 'temperature0'],
			['r', 'Hamster[0]: signal strength', 'signalStrength0'],
			['b', 'Hamster[0]: hand found?', 'handFound0'],
			['r', 'Hamster[1]: left proximity', 'leftProximity1'],
			['r', 'Hamster[1]: right proximity', 'rightProximity1'],
			['r', 'Hamster[1]: left floor', 'leftFloor1'],
			['r', 'Hamster[1]: right floor', 'rightFloor1'],
			['r', 'Hamster[1]: x acceleration', 'accelerationX1'],
			['r', 'Hamster[1]: y acceleration', 'accelerationY1'],
			['r', 'Hamster[1]: z acceleration', 'accelerationZ1'],
			['r', 'Hamster[1]: light', 'light1'],
			['r', 'Hamster[1]: temperature', 'temperature1'],
			['r', 'Hamster[1]: signal strength', 'signalStrength1'],
			['b', 'Hamster[1]: hand found?', 'handFound1'],
			['r', 'Hamster[2]: left proximity', 'leftProximity2'],
			['r', 'Hamster[2]: right proximity', 'rightProximity2'],
			['r', 'Hamster[2]: left floor', 'leftFloor2'],
			['r', 'Hamster[2]: right floor', 'rightFloor2'],
			['r', 'Hamster[2]: x acceleration', 'accelerationX2'],
			['r', 'Hamster[2]: y acceleration', 'accelerationY2'],
			['r', 'Hamster[2]: z acceleration', 'accelerationZ2'],
			['r', 'Hamster[2]: light', 'light2'],
			['r', 'Hamster[2]: temperature', 'temperature2'],
			['r', 'Hamster[2]: signal strength', 'signalStrength2'],
			['b', 'Hamster[2]: hand found?', 'handFound2'],
			['r', 'Hamster[3]: left proximity', 'leftProximity3'],
			['r', 'Hamster[3]: right proximity', 'rightProximity3'],
			['r', 'Hamster[3]: left floor', 'leftFloor3'],
			['r', 'Hamster[3]: right floor', 'rightFloor3'],
			['r', 'Hamster[3]: x acceleration', 'accelerationX3'],
			['r', 'Hamster[3]: y acceleration', 'accelerationY3'],
			['r', 'Hamster[3]: z acceleration', 'accelerationZ3'],
			['r', 'Hamster[3]: light', 'light3'],
			['r', 'Hamster[3]: temperature', 'temperature3'],
			['r', 'Hamster[3]: signal strength', 'signalStrength3'],
			['b', 'Hamster[3]: hand found?', 'handFound3'],
			['r', 'Hamster[4]: left proximity', 'leftProximity4'],
			['r', 'Hamster[4]: right proximity', 'rightProximity4'],
			['r', 'Hamster[4]: left floor', 'leftFloor4'],
			['r', 'Hamster[4]: right floor', 'rightFloor4'],
			['r', 'Hamster[4]: x acceleration', 'accelerationX4'],
			['r', 'Hamster[4]: y acceleration', 'accelerationY4'],
			['r', 'Hamster[4]: z acceleration', 'accelerationZ4'],
			['r', 'Hamster[4]: light', 'light4'],
			['r', 'Hamster[4]: temperature', 'temperature4'],
			['r', 'Hamster[4]: signal strength', 'signalStrength4'],
			['b', 'Hamster[4]: hand found?', 'handFound4'],
			['r', 'Hamster[5]: left proximity', 'leftProximity5'],
			['r', 'Hamster[5]: right proximity', 'rightProximity5'],
			['r', 'Hamster[5]: left floor', 'leftFloor5'],
			['r', 'Hamster[5]: right floor', 'rightFloor5'],
			['r', 'Hamster[5]: x acceleration', 'accelerationX5'],
			['r', 'Hamster[5]: y acceleration', 'accelerationY5'],
			['r', 'Hamster[5]: z acceleration', 'accelerationZ5'],
			['r', 'Hamster[5]: light', 'light5'],
			['r', 'Hamster[5]: temperature', 'temperature5'],
			['r', 'Hamster[5]: signal strength', 'signalStrength5'],
			['b', 'Hamster[5]: hand found?', 'handFound5'],
			[' ', 'Hamster %n : set port %m.port to %m.mode', 'setPortTo', 0, 'A', 'analog input'],
			[' ', 'Hamster %n : change output %m.port by %n', 'changeOutputBy', 0, 'A', 10],
			[' ', 'Hamster %n : set output %m.port to %n', 'setOutputTo', 0, 'A', 100],
			['r', 'Hamster[0]: input A', 'inputA0'],
			['r', 'Hamster[0]: input B', 'inputB0'],
			['r', 'Hamster[1]: input A', 'inputA1'],
			['r', 'Hamster[1]: input B', 'inputB1'],
			['r', 'Hamster[2]: input A', 'inputA2'],
			['r', 'Hamster[2]: input B', 'inputB2'],
			['r', 'Hamster[3]: input A', 'inputA3'],
			['r', 'Hamster[3]: input B', 'inputB3'],
			['r', 'Hamster[4]: input A', 'inputA4'],
			['r', 'Hamster[4]: input B', 'inputB4'],
			['r', 'Hamster[5]: input A', 'inputA5'],
			['r', 'Hamster[5]: input B', 'inputB5']
		],
		ko1: [
			['w', '햄스터 %n : 말판 앞으로 한 칸 이동하기', 'boardMoveForward', 0],
			['w', '햄스터 %n : 말판 %m.left_right 으로 한 번 돌기', 'boardTurn', 0, '왼쪽'],
			['w', '햄스터 %n : 앞으로 1초 이동하기', 'moveForward', 0],
			['w', '햄스터 %n : 뒤로 1초 이동하기', 'moveBackward', 0],
			['w', '햄스터 %n : %m.left_right 으로 1초 돌기', 'turn', 0, '왼쪽'],
			[' ', '햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', 0, '왼쪽', '빨간색'],
			[' ', '햄스터 %n : %m.left_right_both LED 끄기', 'clearLed', 0, '왼쪽'],
			['w', '햄스터 %n : 삐 소리내기', 'beep', 0],
			['b', '햄스터[0]: 손 찾음?', 'handFound0'],
			['b', '햄스터[1]: 손 찾음?', 'handFound1'],
			['b', '햄스터[2]: 손 찾음?', 'handFound2'],
			['b', '햄스터[3]: 손 찾음?', 'handFound3'],
			['b', '햄스터[4]: 손 찾음?', 'handFound4'],
			['b', '햄스터[5]: 손 찾음?', 'handFound5']
		],
		ko2: [
			['w', '햄스터 %n : 말판 앞으로 한 칸 이동하기', 'boardMoveForward', 0],
			['w', '햄스터 %n : 말판 %m.left_right 으로 한 번 돌기', 'boardTurn', 0, '왼쪽'],
			['w', '햄스터 %n : 앞으로 %n 초 이동하기', 'moveForwardForSecs', 0, 1],
			['w', '햄스터 %n : 뒤로 %n 초 이동하기', 'moveBackwardForSecs', 0, 1],
			['w', '햄스터 %n : %m.left_right 으로 %n 초 돌기', 'turnForSecs', 0, '왼쪽', 1],
			[' ', '햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', 0, '왼쪽', '빨간색'],
			[' ', '햄스터 %n : %m.left_right_both LED 끄기', 'clearLed', 0, '왼쪽'],
			['w', '햄스터 %n : 삐 소리내기', 'beep', 0],
			['w', '햄스터 %n : %m.note %m.octave 음을 %n 박자 연주하기', 'playNoteFor', 0, '도', '4', 0.5],
			['w', '햄스터 %n : %n 박자 쉬기', 'restFor', 0, 0.25],
			[' ', '햄스터 %n : 연주 속도를 %n 만큼 바꾸기', 'changeTempoBy', 0, 20],
			[' ', '햄스터 %n : 연주 속도를 %n BPM으로 정하기', 'setTempoTo', 0, 60],
			['b', '햄스터[0]: 손 찾음?', 'handFound0'],
			['b', '햄스터[1]: 손 찾음?', 'handFound1'],
			['b', '햄스터[2]: 손 찾음?', 'handFound2'],
			['b', '햄스터[3]: 손 찾음?', 'handFound3'],
			['b', '햄스터[4]: 손 찾음?', 'handFound4'],
			['b', '햄스터[5]: 손 찾음?', 'handFound5']
		],
		ko3: [
			['w', '햄스터 %n : 말판 앞으로 한 칸 이동하기', 'boardMoveForward', 0],
			['w', '햄스터 %n : 말판 %m.left_right 으로 한 번 돌기', 'boardTurn', 0, '왼쪽'],
			['w', '햄스터 %n : 앞으로 %n 초 이동하기', 'moveForwardForSecs', 0, 1],
			['w', '햄스터 %n : 뒤로 %n 초 이동하기', 'moveBackwardForSecs', 0, 1],
			['w', '햄스터 %n : %m.left_right 으로 %n 초 돌기', 'turnForSecs', 0, '왼쪽', 1],
			[' ', '햄스터 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기', 'changeBothWheelsBy', 0, 10, 10],
			[' ', '햄스터 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기', 'setBothWheelsTo', 0, 30, 30],
			[' ', '햄스터 %n : %m.left_right_both 바퀴 %n 만큼 바꾸기', 'changeWheelBy', 0, '왼쪽', 10],
			[' ', '햄스터 %n : %m.left_right_both 바퀴 %n (으)로 정하기', 'setWheelTo', 0, '왼쪽', 30],
			[' ', '햄스터 %n : %m.black_white 선을 %m.left_right_both 바닥 센서로 따라가기', 'followLineUsingFloorSensor', 0, '검은색', '왼쪽'],
			['w', '햄스터 %n : %m.black_white 선을 따라 %m.left_right_front_rear 교차로까지 이동하기', 'followLineUntilIntersection', 0, '검은색', '왼쪽'],
			[' ', '햄스터 %n : 선 따라가기 속도를 %m.speed (으)로 정하기', 'setFollowingSpeedTo', 0, '5'],
			[' ', '햄스터 %n : 정지하기', 'stop', 0],
			[' ', '햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', 0, '왼쪽', '빨간색'],
			[' ', '햄스터 %n : %m.left_right_both LED 끄기', 'clearLed', 0, '왼쪽'],
			['w', '햄스터 %n : 삐 소리내기', 'beep', 0],
			[' ', '햄스터 %n : 버저 음을 %n 만큼 바꾸기', 'changeBuzzerBy', 0, 10],
			[' ', '햄스터 %n : 버저 음을 %n (으)로 정하기', 'setBuzzerTo', 0, 1000],
			[' ', '햄스터 %n : 버저 끄기', 'clearBuzzer', 0],
			['w', '햄스터 %n : %m.note %m.octave 음을 %n 박자 연주하기', 'playNoteFor', 0, '도', '4', 0.5],
			['w', '햄스터 %n : %n 박자 쉬기', 'restFor', 0, 0.25],
			[' ', '햄스터 %n : 연주 속도를 %n 만큼 바꾸기', 'changeTempoBy', 0, 20],
			[' ', '햄스터 %n : 연주 속도를 %n BPM으로 정하기', 'setTempoTo', 0, 60],
			['r', '햄스터[0]: 왼쪽 근접 센서', 'leftProximity0'],
			['r', '햄스터[0]: 오른쪽 근접 센서', 'rightProximity0'],
			['r', '햄스터[0]: 왼쪽 바닥 센서', 'leftFloor0'],
			['r', '햄스터[0]: 오른쪽 바닥 센서', 'rightFloor0'],
			['r', '햄스터[0]: x축 가속도', 'accelerationX0'],
			['r', '햄스터[0]: y축 가속도', 'accelerationY0'],
			['r', '햄스터[0]: z축 가속도', 'accelerationZ0'],
			['r', '햄스터[0]: 밝기', 'light0'],
			['r', '햄스터[0]: 온도', 'temperature0'],
			['r', '햄스터[0]: 신호 세기', 'signalStrength0'],
			['b', '햄스터[0]: 손 찾음?', 'handFound0'],
			['r', '햄스터[1]: 왼쪽 근접 센서', 'leftProximity1'],
			['r', '햄스터[1]: 오른쪽 근접 센서', 'rightProximity1'],
			['r', '햄스터[1]: 왼쪽 바닥 센서', 'leftFloor1'],
			['r', '햄스터[1]: 오른쪽 바닥 센서', 'rightFloor1'],
			['r', '햄스터[1]: x축 가속도', 'accelerationX1'],
			['r', '햄스터[1]: y축 가속도', 'accelerationY1'],
			['r', '햄스터[1]: z축 가속도', 'accelerationZ1'],
			['r', '햄스터[1]: 밝기', 'light1'],
			['r', '햄스터[1]: 온도', 'temperature1'],
			['r', '햄스터[1]: 신호 세기', 'signalStrength1'],
			['b', '햄스터[1]: 손 찾음?', 'handFound1'],
			['r', '햄스터[2]: 왼쪽 근접 센서', 'leftProximity2'],
			['r', '햄스터[2]: 오른쪽 근접 센서', 'rightProximity2'],
			['r', '햄스터[2]: 왼쪽 바닥 센서', 'leftFloor2'],
			['r', '햄스터[2]: 오른쪽 바닥 센서', 'rightFloor2'],
			['r', '햄스터[2]: x축 가속도', 'accelerationX2'],
			['r', '햄스터[2]: y축 가속도', 'accelerationY2'],
			['r', '햄스터[2]: z축 가속도', 'accelerationZ2'],
			['r', '햄스터[2]: 밝기', 'light2'],
			['r', '햄스터[2]: 온도', 'temperature2'],
			['r', '햄스터[2]: 신호 세기', 'signalStrength2'],
			['b', '햄스터[2]: 손 찾음?', 'handFound2'],
			['r', '햄스터[3]: 왼쪽 근접 센서', 'leftProximity3'],
			['r', '햄스터[3]: 오른쪽 근접 센서', 'rightProximity3'],
			['r', '햄스터[3]: 왼쪽 바닥 센서', 'leftFloor3'],
			['r', '햄스터[3]: 오른쪽 바닥 센서', 'rightFloor3'],
			['r', '햄스터[3]: x축 가속도', 'accelerationX3'],
			['r', '햄스터[3]: y축 가속도', 'accelerationY3'],
			['r', '햄스터[3]: z축 가속도', 'accelerationZ3'],
			['r', '햄스터[3]: 밝기', 'light3'],
			['r', '햄스터[3]: 온도', 'temperature3'],
			['r', '햄스터[3]: 신호 세기', 'signalStrength3'],
			['b', '햄스터[3]: 손 찾음?', 'handFound3'],
			['r', '햄스터[4]: 왼쪽 근접 센서', 'leftProximity4'],
			['r', '햄스터[4]: 오른쪽 근접 센서', 'rightProximity4'],
			['r', '햄스터[4]: 왼쪽 바닥 센서', 'leftFloor4'],
			['r', '햄스터[4]: 오른쪽 바닥 센서', 'rightFloor4'],
			['r', '햄스터[4]: x축 가속도', 'accelerationX4'],
			['r', '햄스터[4]: y축 가속도', 'accelerationY4'],
			['r', '햄스터[4]: z축 가속도', 'accelerationZ4'],
			['r', '햄스터[4]: 밝기', 'light4'],
			['r', '햄스터[4]: 온도', 'temperature4'],
			['r', '햄스터[4]: 신호 세기', 'signalStrength4'],
			['b', '햄스터[4]: 손 찾음?', 'handFound4'],
			['r', '햄스터[5]: 왼쪽 근접 센서', 'leftProximity5'],
			['r', '햄스터[5]: 오른쪽 근접 센서', 'rightProximity5'],
			['r', '햄스터[5]: 왼쪽 바닥 센서', 'leftFloor5'],
			['r', '햄스터[5]: 오른쪽 바닥 센서', 'rightFloor5'],
			['r', '햄스터[5]: x축 가속도', 'accelerationX5'],
			['r', '햄스터[5]: y축 가속도', 'accelerationY5'],
			['r', '햄스터[5]: z축 가속도', 'accelerationZ5'],
			['r', '햄스터[5]: 밝기', 'light5'],
			['r', '햄스터[5]: 온도', 'temperature5'],
			['r', '햄스터[5]: 신호 세기', 'signalStrength5'],
			['b', '햄스터[5]: 손 찾음?', 'handFound5'],
			[' ', '햄스터 %n : 포트 %m.port 를 %m.mode 으로 정하기', 'setPortTo', 0, 'A', '아날로그 입력'],
			[' ', '햄스터 %n : 출력 %m.port 를 %n 만큼 바꾸기', 'changeOutputBy', 0, 'A', 10],
			[' ', '햄스터 %n : 출력 %m.port 를 %n (으)로 정하기', 'setOutputTo', 0, 'A', 100],
			['r', '햄스터[0]: 입력 A', 'inputA0'],
			['r', '햄스터[0]: 입력 B', 'inputB0'],
			['r', '햄스터[1]: 입력 A', 'inputA1'],
			['r', '햄스터[1]: 입력 B', 'inputB1'],
			['r', '햄스터[2]: 입력 A', 'inputA2'],
			['r', '햄스터[2]: 입력 B', 'inputB2'],
			['r', '햄스터[3]: 입력 A', 'inputA3'],
			['r', '햄스터[3]: 입력 B', 'inputB3'],
			['r', '햄스터[4]: 입력 A', 'inputA4'],
			['r', '햄스터[4]: 입력 B', 'inputB4'],
			['r', '햄스터[5]: 입력 A', 'inputA5'],
			['r', '햄스터[5]: 입력 B', 'inputB5']
		],
		uz1: [
			['w', 'Hamster %n : doskada bir marta oldinga yurish', 'boardMoveForward', 0],
			['w', 'Hamster %n : doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 0, 'chapga'],
			['w', 'Hamster %n : oldinga yurish', 'moveForward', 0],
			['w', 'Hamster %n : orqaga yurish', 'moveBackward', 0],
			['w', 'Hamster %n : %m.left_right ga o\'girilish', 'turn', 0, 'chapga'],
			[' ', 'Hamster %n : %m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 0, 'chap', 'qizil'],
			[' ', 'Hamster %n : %m.left_right_both LEDni o\'chirish', 'clearLed', 0, 'chap'],
			['w', 'Hamster %n : ovoz chiqarish', 'beep', 0],
			['b', 'Hamster[0]: qo\'l topildimi?', 'handFound0'],
			['b', 'Hamster[1]: qo\'l topildimi?', 'handFound1'],
			['b', 'Hamster[2]: qo\'l topildimi?', 'handFound2'],
			['b', 'Hamster[3]: qo\'l topildimi?', 'handFound3'],
			['b', 'Hamster[4]: qo\'l topildimi?', 'handFound4'],
			['b', 'Hamster[5]: qo\'l topildimi?', 'handFound5']
		],
		uz2: [
			['w', 'Hamster %n : doskada bir marta oldinga yurish', 'boardMoveForward', 0],
			['w', 'Hamster %n : doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 0, 'chapga'],
			['w', 'Hamster %n : oldinga %n soniya yurish', 'moveForwardForSecs', 0, 1],
			['w', 'Hamster %n : orqaga %n soniya yurish', 'moveBackwardForSecs', 0, 1],
			['w', 'Hamster %n : %m.left_right ga %n soniya o\'girilish', 'turnForSecs', 0, 'chapga', 1],
			[' ', 'Hamster %n : %m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 0, 'chap', 'qizil'],
			[' ', 'Hamster %n : %m.left_right_both LEDni o\'chirish', 'clearLed', 0, 'chap'],
			['w', 'Hamster %n : ovoz chiqarish', 'beep', 0],
			['w', 'Hamster %n : %m.note %m.octave notani %n zarb ijro etish', 'playNoteFor', 0, 'do', '4', 0.5],
			['w', 'Hamster %n : %n zarb tanaffus', 'restFor', 0, 0.25],
			[' ', 'Hamster %n : temni %n ga o\'zgartirish', 'changeTempoBy', 0, 20],
			[' ', 'Hamster %n : temni %n bpm ga sozlash', 'setTempoTo', 0, 60],
			['b', 'Hamster[0]: qo\'l topildimi?', 'handFound0'],
			['b', 'Hamster[1]: qo\'l topildimi?', 'handFound1'],
			['b', 'Hamster[2]: qo\'l topildimi?', 'handFound2'],
			['b', 'Hamster[3]: qo\'l topildimi?', 'handFound3'],
			['b', 'Hamster[4]: qo\'l topildimi?', 'handFound4'],
			['b', 'Hamster[5]: qo\'l topildimi?', 'handFound5']
		],
		uz3: [
			['w', 'Hamster %n : doskada bir marta oldinga yurish', 'boardMoveForward', 0],
			['w', 'Hamster %n : doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 0, 'chapga'],
			['w', 'Hamster %n : oldinga %n soniya %n tezlikda yurish', 'moveForwardForSecsAtSpeed', 0, 1, 30],
			['w', 'Hamster %n : orqaga %n soniya %n tezlikda yurish', 'moveBackwardForSecsAtSpeed', 0, 1, 30],
			['w', 'Hamster %n : %m.left_right ga %n soniya %n tezlikda o\'girilish', 'turnForSecsAtSpeed', 0, 'chapga', 1, 30],
			[' ', 'Hamster %n : chap g\'ildirakni %n o\'ng g\'ildirakni %n ga o\'zgartirish', 'changeBothWheelsBy', 0, 10, 10],
			[' ', 'Hamster %n : chap g\'ildirakni %n o\'ng g\'ildirakni %n ga sozlash', 'setBothWheelsTo', 0, 30, 30],
			[' ', 'Hamster %n : %m.left_right_both g\'ildirakni %n ga o\'zgarish', 'changeWheelBy', 0, 'chap', 10],
			[' ', 'Hamster %n : %m.left_right_both g\'ildirakni %n ga sozlash', 'setWheelTo', 0, 'chap', 30],
			[' ', 'Hamster %n : %m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish', 'followLineUsingFloorSensor', 0, 'qora', 'chap'],
			['w', 'Hamster %n : %m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish', 'followLineUntilIntersection', 0, 'qora', 'chap'],
			[' ', 'Hamster %n : liniyada ergashish tezligini %m.speed ga sozlash', 'setFollowingSpeedTo', 0, '5'],
			[' ', 'Hamster %n : to\'xtatish', 'stop', 0],
			[' ', 'Hamster %n : %m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 0, 'chap', 'qizil'],
			[' ', 'Hamster %n : %m.left_right_both LEDni o\'chirish', 'clearLed', 0, 'chap'],
			['w', 'Hamster %n : ovoz chiqarish', 'beep', 0],
			[' ', 'Hamster %n : buzerning ovozini %n ga o\'zgartirish', 'changeBuzzerBy', 0, 10],
			[' ', 'Hamster %n : buzerning ovozini %n ga sozlash', 'setBuzzerTo', 0, 1000],
			[' ', 'Hamster %n : buzerni o\'chirish', 'clearBuzzer', 0],
			['w', 'Hamster %n : %m.note %m.octave notani %n zarb ijro etish', 'playNoteFor', 0, 'do', '4', 0.5],
			['w', 'Hamster %n : %n zarb tanaffus', 'restFor', 0, 0.25],
			[' ', 'Hamster %n : temni %n ga o\'zgartirish', 'changeTempoBy', 0, 20],
			[' ', 'Hamster %n : temni %n bpm ga sozlash', 'setTempoTo', 0, 60],
			['r', 'Hamster[0]: chap yaqinlik', 'leftProximity0'],
			['r', 'Hamster[0]: o\'ng yaqinlik', 'rightProximity0'],
			['r', 'Hamster[0]: chap taglik', 'leftFloor0'],
			['r', 'Hamster[0]: o\'ng taglik', 'rightFloor0'],
			['r', 'Hamster[0]: x tezlanish', 'accelerationX0'],
			['r', 'Hamster[0]: y tezlanish', 'accelerationY0'],
			['r', 'Hamster[0]: z tezlanish', 'accelerationZ0'],
			['r', 'Hamster[0]: yorug\'lik', 'light0'],
			['r', 'Hamster[0]: harorat', 'temperature0'],
			['r', 'Hamster[0]: signal kuchi', 'signalStrength0'],
			['b', 'Hamster[0]: qo\'l topildimi?', 'handFound0'],
			['r', 'Hamster[1]: chap yaqinlik', 'leftProximity1'],
			['r', 'Hamster[1]: o\'ng yaqinlik', 'rightProximity1'],
			['r', 'Hamster[1]: chap taglik', 'leftFloor1'],
			['r', 'Hamster[1]: o\'ng taglik', 'rightFloor1'],
			['r', 'Hamster[1]: x tezlanish', 'accelerationX1'],
			['r', 'Hamster[1]: y tezlanish', 'accelerationY1'],
			['r', 'Hamster[1]: z tezlanish', 'accelerationZ1'],
			['r', 'Hamster[1]: yorug\'lik', 'light1'],
			['r', 'Hamster[1]: harorat', 'temperature1'],
			['r', 'Hamster[1]: signal kuchi', 'signalStrength1'],
			['b', 'Hamster[1]: qo\'l topildimi?', 'handFound1'],
			['r', 'Hamster[2]: chap yaqinlik', 'leftProximity2'],
			['r', 'Hamster[2]: o\'ng yaqinlik', 'rightProximity2'],
			['r', 'Hamster[2]: chap taglik', 'leftFloor2'],
			['r', 'Hamster[2]: o\'ng taglik', 'rightFloor2'],
			['r', 'Hamster[2]: x tezlanish', 'accelerationX2'],
			['r', 'Hamster[2]: y tezlanish', 'accelerationY2'],
			['r', 'Hamster[2]: z tezlanish', 'accelerationZ2'],
			['r', 'Hamster[2]: yorug\'lik', 'light2'],
			['r', 'Hamster[2]: harorat', 'temperature2'],
			['r', 'Hamster[2]: signal kuchi', 'signalStrength2'],
			['b', 'Hamster[2]: qo\'l topildimi?', 'handFound2'],
			['r', 'Hamster[3]: chap yaqinlik', 'leftProximity3'],
			['r', 'Hamster[3]: o\'ng yaqinlik', 'rightProximity3'],
			['r', 'Hamster[3]: chap taglik', 'leftFloor3'],
			['r', 'Hamster[3]: o\'ng taglik', 'rightFloor3'],
			['r', 'Hamster[3]: x tezlanish', 'accelerationX3'],
			['r', 'Hamster[3]: y tezlanish', 'accelerationY3'],
			['r', 'Hamster[3]: z tezlanish', 'accelerationZ3'],
			['r', 'Hamster[3]: yorug\'lik', 'light3'],
			['r', 'Hamster[3]: harorat', 'temperature3'],
			['r', 'Hamster[3]: signal kuchi', 'signalStrength3'],
			['b', 'Hamster[3]: qo\'l topildimi?', 'handFound3'],
			['r', 'Hamster[4]: chap yaqinlik', 'leftProximity4'],
			['r', 'Hamster[4]: o\'ng yaqinlik', 'rightProximity4'],
			['r', 'Hamster[4]: chap taglik', 'leftFloor4'],
			['r', 'Hamster[4]: o\'ng taglik', 'rightFloor4'],
			['r', 'Hamster[4]: x tezlanish', 'accelerationX4'],
			['r', 'Hamster[4]: y tezlanish', 'accelerationY4'],
			['r', 'Hamster[4]: z tezlanish', 'accelerationZ4'],
			['r', 'Hamster[4]: yorug\'lik', 'light4'],
			['r', 'Hamster[4]: harorat', 'temperature4'],
			['r', 'Hamster[4]: signal kuchi', 'signalStrength4'],
			['b', 'Hamster[4]: qo\'l topildimi?', 'handFound4'],
			['r', 'Hamster[5]: chap yaqinlik', 'leftProximity5'],
			['r', 'Hamster[5]: o\'ng yaqinlik', 'rightProximity5'],
			['r', 'Hamster[5]: chap taglik', 'leftFloor5'],
			['r', 'Hamster[5]: o\'ng taglik', 'rightFloor5'],
			['r', 'Hamster[5]: x tezlanish', 'accelerationX5'],
			['r', 'Hamster[5]: y tezlanish', 'accelerationY5'],
			['r', 'Hamster[5]: z tezlanish', 'accelerationZ5'],
			['r', 'Hamster[5]: yorug\'lik', 'light5'],
			['r', 'Hamster[5]: harorat', 'temperature5'],
			['r', 'Hamster[5]: signal kuchi', 'signalStrength5'],
			['b', 'Hamster[5]: qo\'l topildimi?', 'handFound5'],
			[' ', 'Hamster %n : %m.port portni %m.mode ga sozlash', 'setPortTo', 0, 'A', 'analog kiritish'],
			[' ', 'Hamster %n : %m.port portni %n ga o\'zgartirish', 'changeOutputBy', 0, 'A', 10],
			[' ', 'Hamster %n : %m.port portni %n ga sozlash', 'setOutputTo', 0, 'A', 100],
			['r', 'Hamster[0]: A kirish', 'inputA0'],
			['r', 'Hamster[0]: B kirish', 'inputB0'],
			['r', 'Hamster[1]: A kirish', 'inputA1'],
			['r', 'Hamster[1]: B kirish', 'inputB1'],
			['r', 'Hamster[2]: A kirish', 'inputA2'],
			['r', 'Hamster[2]: B kirish', 'inputB2'],
			['r', 'Hamster[3]: A kirish', 'inputA3'],
			['r', 'Hamster[3]: B kirish', 'inputB3'],
			['r', 'Hamster[4]: A kirish', 'inputA4'],
			['r', 'Hamster[4]: B kirish', 'inputB4'],
			['r', 'Hamster[5]: A kirish', 'inputA5'],
			['r', 'Hamster[5]: B kirish', 'inputB5']
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
			'left_right': ['chap', 'o\'ng'],
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
	
	var langLeftRightBoth = MENUS[lang]['left_right_both'];
	var langFrontRear = MENUS[lang]['left_right_front_rear'];
	var DIRECTIONS = {};
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

	function getRobot(index) {
		var robot = robots[index];
		if(!robot) {
			robot = {};
			robot.sensory = {
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
			robot.motoring = {
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
			robot.lineTracerModeId = 0;
			robot.lineTracerStateId = -1;
			robot.lineTracerCallback = undefined;
			robot.boardCommand = 0;
			robot.boardState = 0;
			robot.boardCount = 0;
			robot.boardCallback = undefined;
			robot.tempo = 60;
			robot.reset = function() {
				var motoring = robot.motoring;
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
				
				robot.lineTracerModeId = 0;
				robot.lineTracerStateId = -1;
				robot.lineTracerCallback = undefined;
				robot.boardCommand = 0;
				robot.boardState = 0;
				robot.boardCount = 0;
				robot.boardCallback = undefined;
				robot.tempo = 60;
			};
			robots[index] = robot;
			motorings[index] = robot.motoring;
		}
		return robot;
	}

	function setLineTracerMode(robot, mode) {
		robot.lineTracerModeId = (robot.lineTracerModeId + 1) & 0xff;
		robot.motoring.lineTracerMode = mode;
		robot.motoring.lineTracerModeId = robot.lineTracerModeId;
	}

	function reset() {
		for(var i in robots) {
			robots[i].reset();
		}
		removeAllTimeouts();
	}
	
	function handleLineTracer(robot) {
		var sensory = robot.sensory;
		if(sensory.lineTracerStateId != robot.lineTracerStateId) {
			robot.lineTracerStateId = sensory.lineTracerStateId;
			if(sensory.lineTracerState == 0x40) {
				setLineTracerMode(robot, 0);
				var callback = robot.lineTracerCallback;
				robot.lineTracerCallback = undefined;
				if(callback) callback();
			}
		}
	}
	
	function handleBoard(robot) {
		var sensory = robot.sensory;
		var motoring = robot.motoring;
		if(robot.boardCommand == 1) {
			switch(robot.boardState) {
				case 1: {
					if(robot.boardCount < 2) {
						if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
							robot.boardCount ++;
						else
							robot.boardCount = 0;
						var diff = sensory.leftFloor - sensory.rightFloor;
						motoring.leftWheel = 45 + diff * 0.25;
						motoring.rightWheel = 45 - diff * 0.25;
					} else {
						robot.boardCount = 0;
						robot.boardState = 2;
					}
					break;
				}
				case 2: {
					var diff = sensory.leftFloor - sensory.rightFloor;
					motoring.leftWheel = 45 + diff * 0.25;
					motoring.rightWheel = 45 - diff * 0.25;
					robot.boardState = 3;
					var timer = setTimeout(function() {
						robot.boardState = 4;
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
					robot.boardCommand = 0;
					robot.boardState = 0;
					var callback = robot.boardCallback;
					robot.boardCallback = undefined;
					if(callback) callback();
					break;
				}
			}
		} else if(robot.boardCommand == 2) {
			switch(robot.boardState) {
				case 1: {
					if(robot.boardCount < 2) {
						if(sensory.leftFloor > 50)
							robot.boardCount ++;
					} else {
						robot.boardCount = 0;
						robot.boardState = 2;
					}
					break;
				}
				case 2: {
					if(sensory.leftFloor < 20) {
						robot.boardState = 3;
					}
					break;
				}
				case 3: {
					if(robot.boardCount < 2) {
						if(sensory.leftFloor < 20)
							robot.boardCount ++;
					} else {
						robot.boardCount = 0;
						robot.boardState = 4;
					}
					break;
				}
				case 4: {
					if(sensory.leftFloor > 50) {
						robot.boardState = 5;
					}
					break;
				}
				case 5: {
					var diff = sensory.leftFloor - sensory.rightFloor;
					if(diff > -15) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						robot.boardCommand = 0;
						robot.boardState = 0;
						var callback = robot.boardCallback;
						robot.boardCallback = undefined;
						if(callback) callback();
					} else {
						motoring.leftWheel = diff * 0.5;
						motoring.rightWheel = -diff * 0.5;
					}
					break;
				}
			}
		} else if(robot.boardCommand == 3) {
			switch(robot.boardState) {
				case 1: {
					if(robot.boardCount < 2) {
						if(sensory.rightFloor > 50)
							robot.boardCount ++;
					} else {
						robot.boardCount = 0;
						robot.boardState = 2;
					}
					break;
				}
				case 2: {
					if(sensory.rightFloor < 20) {
						robot.boardState = 3;
					}
					break;
				}
				case 3: {
					if(robot.boardCount < 2) {
						if(sensory.rightFloor < 20)
							robot.boardCount ++;
					} else {
						robot.boardCount = 0;
						robot.boardState = 4;
					}
					break;
				}
				case 4: {
					if(sensory.rightFloor > 50) {
						robot.boardState = 5;
					}
					break;
				}
				case 5: {
					var diff = sensory.rightFloor - sensory.leftFloor;
					if(diff > -15) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						robot.boardCommand = 0;
						robot.boardState = 0;
						var callback = robot.boardCallback;
						robot.boardCallback = undefined;
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
								socket.send(JSON.stringify(motorings));
							} catch (e) {
							}
						}
					}, 20);
					sock.onmessage = function(message) { // message: MessageEvent
						try {
							var data = JSON.parse(message.data);
							if(data.type == 1) {
								if(data.index >= 0) {
									var robot = getRobot(data.index);
									if(robot) {
										robot.sensory = data;
										if(robot.lineTracerCallback) handleLineTracer(robot);
										if(robot.boardCallback) handleBoard(robot);
									}
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

	ext.boardMoveForward = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			setLineTracerMode(robot, 0);
			motoring.leftWheel = 45;
			motoring.rightWheel = 45;
			robot.boardCommand = 1;
			robot.boardState = 1;
			robot.boardCount = 0;
			robot.boardCallback = callback;
		}
	};

	ext.boardTurn = function(index, direction, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			setLineTracerMode(robot, 0);
			direction = DIRECTIONS[direction];
			if(direction == LEFT) {
				robot.boardCommand = 2;
				motoring.leftWheel = -45;
				motoring.rightWheel = 45;
			} else {
				robot.boardCommand = 3;
				motoring.leftWheel = 45;
				motoring.rightWheel = -45;
			}
			robot.boardState = 1;
			robot.boardCount = 0;
			robot.boardCallback = callback;
		}
	};
	
	ext.moveForward = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			setLineTracerMode(robot, 0);
			motoring.leftWheel = WHEEL_SPEED;
			motoring.rightWheel = WHEEL_SPEED;
			var timer = setTimeout(function() {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, 1000);
			timeouts.push(timer);
		}
	};
	
	ext.moveBackward = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			setLineTracerMode(robot, 0);
			motoring.leftWheel = -WHEEL_SPEED;
			motoring.rightWheel = -WHEEL_SPEED;
			var timer = setTimeout(function() {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				removeTimeout(timer);
				callback();
			}, 1000);
			timeouts.push(timer);
		}
	};
	
	ext.turn = function(index, direction, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			setLineTracerMode(robot, 0);
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
		}
	};

	ext.moveForwardForSecs = function(index, sec, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			sec = parseFloat(sec);
			setLineTracerMode(robot, 0);
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
		}
	};

	ext.moveBackwardForSecs = function(index, sec, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			sec = parseFloat(sec);
			setLineTracerMode(robot, 0);
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
		}
	};

	ext.turnForSecs = function(index, direction, sec, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			sec = parseFloat(sec);
			setLineTracerMode(robot, 0);
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
		}
	};
	
	ext.moveForwardForSecsAtSpeed = function(index, sec, speed, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			sec = parseFloat(sec);
			speed = parseFloat(speed);
			setLineTracerMode(robot, 0);
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
		}
	};

	ext.moveBackwardForSecsAtSpeed = function(index, sec, speed, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			sec = parseFloat(sec);
			speed = parseFloat(speed);
			setLineTracerMode(robot, 0);
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
		}
	};

	ext.turnForSecsAtSpeed = function(index, direction, sec, speed, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			sec = parseFloat(sec);
			speed = parseFloat(speed);
			setLineTracerMode(robot, 0);
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
		}
	};

	ext.changeBothWheelsBy = function(index, left, right) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			left = parseFloat(left);
			right = parseFloat(right);
			setLineTracerMode(robot, 0);
			if(typeof left == 'number') {
				motoring.leftWheel += left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel += right;
			}
		}
	};

	ext.setBothWheelsTo = function(index, left, right) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			left = parseFloat(left);
			right = parseFloat(right);
			setLineTracerMode(robot, 0);
			if(typeof left == 'number') {
				motoring.leftWheel = left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel = right;
			}
		}
	};

	ext.changeWheelBy = function(index, which, speed) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseFloat(speed);
			setLineTracerMode(robot, 0);
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
		}
	};

	ext.setWheelTo = function(index, which, speed) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseFloat(speed);
			setLineTracerMode(robot, 0);
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
		}
	};

	ext.followLineUsingFloorSensor = function(index, color, which) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
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
			setLineTracerMode(robot, mode);
		}
	};

	ext.followLineUntilIntersection = function(index, color, which, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
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
			setLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		}
	};

	ext.setFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseInt(speed);
			if(typeof speed == 'number') {
				motoring.lineTracerSpeed = speed;
			}
		}
	};

	ext.stop = function(index) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			setLineTracerMode(robot, 0);
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
		}
	};

	ext.setLedTo = function(index, which, color) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
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
		}
	};

	ext.clearLed = function(index, which) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			which = DIRECTIONS[which];
			if(which == LEFT) {
				motoring.leftLed = 0;
			} else if(which == RIGHT) {
				motoring.rightLed = 0;
			} else {
				motoring.leftLed = 0;
				motoring.rightLed = 0;
			}
		}
	};

	ext.beep = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.buzzer = 440;
			motoring.note = 0;
			var timer = setTimeout(function() {
				motoring.buzzer = 0;
				removeTimeout(timer);
				callback();
			}, 200);
			timeouts.push(timer);
		}
	};

	ext.changeBuzzerBy = function(index, value) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var buzzer = parseFloat(value);
			if(typeof buzzer == 'number') {
				motoring.buzzer += buzzer;
			}
			motoring.note = 0;
		}
	};

	ext.setBuzzerTo = function(index, value) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var buzzer = parseFloat(value);
			if(typeof buzzer == 'number') {
				motoring.buzzer = buzzer;
			}
			motoring.note = 0;
		}
	};

	ext.clearBuzzer = function(index) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.buzzer = 0;
			motoring.note = 0;
		}
	};

	ext.playNoteFor = function(index, note, octave, beat, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			note = NOTES[note];
			octave = parseInt(octave);
			beat = parseFloat(beat);
			motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && robot.tempo > 0) {
				note += (octave - 1) * 12;
				motoring.note = note;
				var timeout = beat * 60 * 1000 / robot.tempo;
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
		}
	};

	ext.restFor = function(index, beat, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			beat = parseFloat(beat);
			motoring.buzzer = 0;
			motoring.note = 0;
			if(beat && beat > 0 && robot.tempo > 0) {
				var timer = setTimeout(function() {
					removeTimeout(timer);
					callback();
				}, beat * 60 * 1000 / robot.tempo);
				timeouts.push(timer);
			}
		}
	};

	ext.changeTempoBy = function(index, value) {
		var robot = getRobot(index);
		if(robot) {
			value = parseFloat(value);
			if(typeof value == 'number') {
				robot.tempo += value;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		}
	};

	ext.setTempoTo = function(index, value) {
		var robot = getRobot(index);
		if(robot) {
			value = parseFloat(value);
			if(typeof value == 'number') {
				robot.tempo = value;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		}
	};

	ext.leftProximity0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound0 = function() {
		var robot = getRobot(0);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound1 = function() {
		var robot = getRobot(1);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound2 = function() {
		var robot = getRobot(2);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound3 = function() {
		var robot = getRobot(3);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound4 = function() {
		var robot = getRobot(4);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound5 = function() {
		var robot = getRobot(5);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.setPortTo = function(index, port, mode) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
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
		}
	};

	ext.changeOutputBy = function(index, port, value) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
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
		}
	};

	ext.setOutputTo = function(index, port, value) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
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
		}
	};

	ext.inputA0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.inputB;
		else return 0;
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
