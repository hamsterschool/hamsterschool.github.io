(function(ext) {

	var robots = {};
	var packet = {
		version: 1
	};
	const MOTION = {
		NONE: 0,
		FORWARD: 1,
		BACKWARD: 2,
		LEFT: 3,
		RIGHT: 4
	};
	var connectionState = 1;
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
		en: [ 'Please run Robot Coding software.', 'First robot is not connected.', 'Ready' ],
		ko: [ '로봇 코딩 소프트웨어를 실행해 주세요.', '첫 번째 로봇이 연결되어 있지 않습니다.', '정상입니다.' ],
		uz: [ 'Robot Kodlash dasturini ishga tushiring.', 'Birinchi robot ulanmagan.', 'Tayyorlangan' ]
	};
	const EXTENSION_NAME = {
		en: 'Robot',
		ko: '로봇',
		uz: 'Robot'
	};
	const BLOCKS = {
		en1: [
			['w', 'Hamster %n : move forward once on board', 'boardMoveForward', 0],
			['w', 'Hamster %n : turn %m.left_right once on board', 'boardTurn', 0, 'left'],
			['-'],
			['w', 'Hamster %n : move forward', 'moveForward', 0],
			['w', 'Hamster %n : move backward', 'moveBackward', 0],
			['w', 'Hamster %n : turn %m.left_right', 'turn', 0, 'left'],
			['-'],
			[' ', 'Hamster %n : set %m.left_right_both led to %m.color', 'setLedTo', 0, 'left', 'red'],
			[' ', 'Hamster %n : clear %m.left_right_both led', 'clearLed', 0, 'left'],
			['-'],
			['w', 'Hamster %n : beep', 'beep', 0],
			['-'],
			['b', 'Hamster %n : hand found?', 'handFound', 0]
		],
		en2: [
			['w', 'Hamster %n : move forward once on board', 'boardMoveForward', 0],
			['w', 'Hamster %n : turn %m.left_right once on board', 'boardTurn', 0, 'left'],
			['-'],
			['w', 'Hamster %n : move forward %n secs', 'moveForwardForSecs', 0, 1],
			['w', 'Hamster %n : move backward %n secs', 'moveBackwardForSecs', 0, 1],
			['w', 'Hamster %n : turn %m.left_right %n secs', 'turnForSecs', 0, 'left', 1],
			['-'],
			[' ', 'Hamster %n : set %m.left_right_both led to %m.color', 'setLedTo', 0, 'left', 'red'],
			[' ', 'Hamster %n : clear %m.left_right_both led', 'clearLed', 0, 'left'],
			['-'],
			['w', 'Hamster %n : beep', 'beep', 0],
			['w', 'Hamster %n : play note %m.note %m.octave for %d.beats beats', 'playNoteFor', 0, 'C', '4', 0.5],
			['w', 'Hamster %n : rest for %d.beats beats', 'restFor', 0, 0.25],
			[' ', 'Hamster %n : change tempo by %n', 'changeTempoBy', 0, 20],
			[' ', 'Hamster %n : set tempo to %n bpm', 'setTempoTo', 0, 60],
			['-'],
			['b', 'Hamster %n : hand found?', 'handFound', 0]
		],
		en3: [
			['w', 'Hamster %n : move forward once on board', 'boardMoveForward', 0],
			['w', 'Hamster %n : turn %m.left_right once on board', 'boardTurn', 0, 'left'],
			['-'],
			['w', 'Hamster %n : move forward %n secs', 'moveForwardForSecs', 0, 1],
			['w', 'Hamster %n : move backward %n secs', 'moveBackwardForSecs', 0, 1],
			['w', 'Hamster %n : turn %m.left_right %n secs', 'turnForSecs', 0, 'left', 1],
			[' ', 'Hamster %n : change wheels by left: %n right: %n', 'changeBothWheelsBy', 0, 10, 10],
			[' ', 'Hamster %n : set wheels to left: %n right: %n', 'setBothWheelsTo', 0, 30, 30],
			[' ', 'Hamster %n : change %m.left_right_both wheel by %n', 'changeWheelBy', 0, 'left', 10],
			[' ', 'Hamster %n : set %m.left_right_both wheel to %n', 'setWheelTo', 0, 'left', 30],
			[' ', 'Hamster %n : follow %m.black_white line with %m.left_right_both floor sensor', 'followLineUsingFloorSensor', 0, 'black', 'left'],
			['w', 'Hamster %n : follow %m.black_white line until %m.left_right_front_rear intersection', 'followLineUntilIntersection', 0, 'black', 'left'],
			[' ', 'Hamster %n : set following speed to %m.speed', 'setFollowingSpeedTo', 0, '5'],
			[' ', 'Hamster %n : stop', 'stop', 0],
			['-'],
			[' ', 'Hamster %n : set %m.left_right_both led to %m.color', 'setLedTo', 0, 'left', 'red'],
			[' ', 'Hamster %n : clear %m.left_right_both led', 'clearLed', 0, 'left'],
			['-'],
			['w', 'Hamster %n : beep', 'beep', 0],
			[' ', 'Hamster %n : change buzzer by %n', 'changeBuzzerBy', 0, 10],
			[' ', 'Hamster %n : set buzzer to %n', 'setBuzzerTo', 0, 1000],
			[' ', 'Hamster %n : clear buzzer', 'clearBuzzer', 0],
			['w', 'Hamster %n : play note %m.note %m.octave for %d.beats beats', 'playNoteFor', 0, 'C', '4', 0.5],
			['w', 'Hamster %n : rest for %d.beats beats', 'restFor', 0, 0.25],
			[' ', 'Hamster %n : change tempo by %n', 'changeTempoBy', 0, 20],
			[' ', 'Hamster %n : set tempo to %n bpm', 'setTempoTo', 0, 60],
			['-'],
			['r', 'Hamster %n : left proximity', 'leftProximity', 0],
			['r', 'Hamster %n : right proximity', 'rightProximity', 0],
			['r', 'Hamster %n : left floor', 'leftFloor', 0],
			['r', 'Hamster %n : right floor', 'rightFloor', 0],
			['r', 'Hamster %n : x acceleration', 'accelerationX', 0],
			['r', 'Hamster %n : y acceleration', 'accelerationY', 0],
			['r', 'Hamster %n : z acceleration', 'accelerationZ', 0],
			['r', 'Hamster %n : light', 'light', 0],
			['r', 'Hamster %n : temperature', 'temperature', 0],
			['r', 'Hamster %n : signal strength', 'signalStrength', 0],
			['b', 'Hamster %n : hand found?', 'handFound', 0],
			['-'],
			[' ', 'Hamster %n : set port %m.port to %m.mode', 'setPortTo', 0, 'A', 'analog input'],
			[' ', 'Hamster %n : change output %m.port by %n', 'changeOutputBy', 0, 'A', 10],
			[' ', 'Hamster %n : set output %m.port to %n', 'setOutputTo', 0, 'A', 100],
			['w', 'Hamster %n : %m.open_close gripper', 'gripper', 0, 'open'],
			[' ', 'Hamster %n : release gripper', 'releaseGripper', 0],
			['r', 'Hamster %n : input A', 'inputA', 0],
			['r', 'Hamster %n : input B', 'inputB', 0]
		],
		ko1: [
			['w', '햄스터 %n : 말판 앞으로 한 칸 이동하기', 'boardMoveForward', 0],
			['w', '햄스터 %n : 말판 %m.left_right 으로 한 번 돌기', 'boardTurn', 0, '왼쪽'],
			['-'],
			['w', '햄스터 %n : 앞으로 이동하기', 'moveForward', 0],
			['w', '햄스터 %n : 뒤로 이동하기', 'moveBackward', 0],
			['w', '햄스터 %n : %m.left_right 으로 돌기', 'turn', 0, '왼쪽'],
			['-'],
			[' ', '햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', 0, '왼쪽', '빨간색'],
			[' ', '햄스터 %n : %m.left_right_both LED 끄기', 'clearLed', 0, '왼쪽'],
			['-'],
			['w', '햄스터 %n : 삐 소리내기', 'beep', 0],
			['-'],
			['b', '햄스터 %n : 손 찾음?', 'handFound', 0]
		],
		ko2: [
			['w', '햄스터 %n : 말판 앞으로 한 칸 이동하기', 'boardMoveForward', 0],
			['w', '햄스터 %n : 말판 %m.left_right 으로 한 번 돌기', 'boardTurn', 0, '왼쪽'],
			['-'],
			['w', '햄스터 %n : 앞으로 %n 초 이동하기', 'moveForwardForSecs', 0, 1],
			['w', '햄스터 %n : 뒤로 %n 초 이동하기', 'moveBackwardForSecs', 0, 1],
			['w', '햄스터 %n : %m.left_right 으로 %n 초 돌기', 'turnForSecs', 0, '왼쪽', 1],
			['-'],
			[' ', '햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', 0, '왼쪽', '빨간색'],
			[' ', '햄스터 %n : %m.left_right_both LED 끄기', 'clearLed', 0, '왼쪽'],
			['-'],
			['w', '햄스터 %n : 삐 소리내기', 'beep', 0],
			['w', '햄스터 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기', 'playNoteFor', 0, '도', '4', 0.5],
			['w', '햄스터 %n : %d.beats 박자 쉬기', 'restFor', 0, 0.25],
			[' ', '햄스터 %n : 연주 속도를 %n 만큼 바꾸기', 'changeTempoBy', 0, 20],
			[' ', '햄스터 %n : 연주 속도를 %n BPM으로 정하기', 'setTempoTo', 0, 60],
			['-'],
			['b', '햄스터 %n : 손 찾음?', 'handFound', 0]
		],
		ko3: [
			['w', '햄스터 %n : 말판 앞으로 한 칸 이동하기', 'boardMoveForward', 0],
			['w', '햄스터 %n : 말판 %m.left_right 으로 한 번 돌기', 'boardTurn', 0, '왼쪽'],
			['-'],
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
			['-'],
			[' ', '햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', 0, '왼쪽', '빨간색'],
			[' ', '햄스터 %n : %m.left_right_both LED 끄기', 'clearLed', 0, '왼쪽'],
			['-'],
			['w', '햄스터 %n : 삐 소리내기', 'beep', 0],
			[' ', '햄스터 %n : 버저 음을 %n 만큼 바꾸기', 'changeBuzzerBy', 0, 10],
			[' ', '햄스터 %n : 버저 음을 %n (으)로 정하기', 'setBuzzerTo', 0, 1000],
			[' ', '햄스터 %n : 버저 끄기', 'clearBuzzer', 0],
			['w', '햄스터 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기', 'playNoteFor', 0, '도', '4', 0.5],
			['w', '햄스터 %n : %d.beats 박자 쉬기', 'restFor', 0, 0.25],
			[' ', '햄스터 %n : 연주 속도를 %n 만큼 바꾸기', 'changeTempoBy', 0, 20],
			[' ', '햄스터 %n : 연주 속도를 %n BPM으로 정하기', 'setTempoTo', 0, 60],
			['-'],
			['r', '햄스터 %n : 왼쪽 근접 센서', 'leftProximity', 0],
			['r', '햄스터 %n : 오른쪽 근접 센서', 'rightProximity', 0],
			['r', '햄스터 %n : 왼쪽 바닥 센서', 'leftFloor', 0],
			['r', '햄스터 %n : 오른쪽 바닥 센서', 'rightFloor', 0],
			['r', '햄스터 %n : x축 가속도', 'accelerationX', 0],
			['r', '햄스터 %n : y축 가속도', 'accelerationY', 0],
			['r', '햄스터 %n : z축 가속도', 'accelerationZ', 0],
			['r', '햄스터 %n : 밝기', 'light', 0],
			['r', '햄스터 %n : 온도', 'temperature', 0],
			['r', '햄스터 %n : 신호 세기', 'signalStrength', 0],
			['b', '햄스터 %n : 손 찾음?', 'handFound', 0],
			['-'],
			[' ', '햄스터 %n : 포트 %m.port 를 %m.mode 으로 정하기', 'setPortTo', 0, 'A', '아날로그 입력'],
			[' ', '햄스터 %n : 출력 %m.port 를 %n 만큼 바꾸기', 'changeOutputBy', 0, 'A', 10],
			[' ', '햄스터 %n : 출력 %m.port 를 %n (으)로 정하기', 'setOutputTo', 0, 'A', 100],
			['w', '햄스터 %n : 집게 %m.open_close', 'gripper', 0, '열기'],
			[' ', '햄스터 %n : 집게 끄기', 'releaseGripper', 0],
			['r', '햄스터 %n : 입력 A', 'inputA', 0],
			['r', '햄스터 %n : 입력 B', 'inputB', 0]
		],
		uz1: [
			['w', 'Hamster %n : doskada bir marta oldinga yurish', 'boardMoveForward', 0],
			['w', 'Hamster %n : doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 0, 'chap'],
			['-'],
			['w', 'Hamster %n : oldinga yurish', 'moveForward', 0],
			['w', 'Hamster %n : orqaga yurish', 'moveBackward', 0],
			['w', 'Hamster %n : %m.left_right ga o\'girilish', 'turn', 0, 'chap'],
			['-'],
			[' ', 'Hamster %n : %m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 0, 'chap', 'qizil'],
			[' ', 'Hamster %n : %m.left_right_both LEDni o\'chirish', 'clearLed', 0, 'chap'],
			['-'],
			['w', 'Hamster %n : ovoz chiqarish', 'beep', 0],
			['-'],
			['b', 'Hamster %n : qo\'l topildimi?', 'handFound', 0]
		],
		uz2: [
			['w', 'Hamster %n : doskada bir marta oldinga yurish', 'boardMoveForward', 0],
			['w', 'Hamster %n : doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 0, 'chap'],
			['-'],
			['w', 'Hamster %n : oldinga %n soniya yurish', 'moveForwardForSecs', 0, 1],
			['w', 'Hamster %n : orqaga %n soniya yurish', 'moveBackwardForSecs', 0, 1],
			['w', 'Hamster %n : %m.left_right ga %n soniya o\'girilish', 'turnForSecs', 0, 'chap', 1],
			['-'],
			[' ', 'Hamster %n : %m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 0, 'chap', 'qizil'],
			[' ', 'Hamster %n : %m.left_right_both LEDni o\'chirish', 'clearLed', 0, 'chap'],
			['-'],
			['w', 'Hamster %n : ovoz chiqarish', 'beep', 0],
			['w', 'Hamster %n : %m.note %m.octave notani %d.beats zarb ijro etish', 'playNoteFor', 0, 'do', '4', 0.5],
			['w', 'Hamster %n : %d.beats zarb tanaffus', 'restFor', 0, 0.25],
			[' ', 'Hamster %n : temni %n ga o\'zgartirish', 'changeTempoBy', 0, 20],
			[' ', 'Hamster %n : temni %n bpm ga sozlash', 'setTempoTo', 0, 60],
			['-'],
			['b', 'Hamster %n : qo\'l topildimi?', 'handFound', 0]
		],
		uz3: [
			['w', 'Hamster %n : doskada bir marta oldinga yurish', 'boardMoveForward', 0],
			['w', 'Hamster %n : doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 0, 'chap'],
			['-'],
			['w', 'Hamster %n : oldinga %n soniya yurish', 'moveForwardForSecs', 0, 1],
			['w', 'Hamster %n : orqaga %n soniya yurish', 'moveBackwardForSecs', 0, 1],
			['w', 'Hamster %n : %m.left_right ga %n soniya o\'girilish', 'turnForSecs', 0, 'chap', 1],
			[' ', 'Hamster %n : chap g\'ildirakni %n o\'ng g\'ildirakni %n ga o\'zgartirish', 'changeBothWheelsBy', 0, 10, 10],
			[' ', 'Hamster %n : chap g\'ildirakni %n o\'ng g\'ildirakni %n ga sozlash', 'setBothWheelsTo', 0, 30, 30],
			[' ', 'Hamster %n : %m.left_right_both g\'ildirakni %n ga o\'zgartirish', 'changeWheelBy', 0, 'chap', 10],
			[' ', 'Hamster %n : %m.left_right_both g\'ildirakni %n ga sozlash', 'setWheelTo', 0, 'chap', 30],
			[' ', 'Hamster %n : %m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish', 'followLineUsingFloorSensor', 0, 'qora', 'chap'],
			['w', 'Hamster %n : %m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish', 'followLineUntilIntersection', 0, 'qora', 'chap'],
			[' ', 'Hamster %n : liniyada ergashish tezligini %m.speed ga sozlash', 'setFollowingSpeedTo', 0, '5'],
			[' ', 'Hamster %n : to\'xtatish', 'stop', 0],
			['-'],
			[' ', 'Hamster %n : %m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 0, 'chap', 'qizil'],
			[' ', 'Hamster %n : %m.left_right_both LEDni o\'chirish', 'clearLed', 0, 'chap'],
			['-'],
			['w', 'Hamster %n : ovoz chiqarish', 'beep', 0],
			[' ', 'Hamster %n : buzerning ovozini %n ga o\'zgartirish', 'changeBuzzerBy', 0, 10],
			[' ', 'Hamster %n : buzerning ovozini %n ga sozlash', 'setBuzzerTo', 0, 1000],
			[' ', 'Hamster %n : buzerni o\'chirish', 'clearBuzzer', 0],
			['w', 'Hamster %n : %m.note %m.octave notani %d.beats zarb ijro etish', 'playNoteFor', 0, 'do', '4', 0.5],
			['w', 'Hamster %n : %d.beats zarb tanaffus', 'restFor', 0, 0.25],
			[' ', 'Hamster %n : temni %n ga o\'zgartirish', 'changeTempoBy', 0, 20],
			[' ', 'Hamster %n : temni %n bpm ga sozlash', 'setTempoTo', 0, 60],
			['-'],
			['r', 'Hamster %n : chap yaqinlik', 'leftProximity', 0],
			['r', 'Hamster %n : o\'ng yaqinlik', 'rightProximity', 0],
			['r', 'Hamster %n : chap taglik', 'leftFloor', 0],
			['r', 'Hamster %n : o\'ng taglik', 'rightFloor', 0],
			['r', 'Hamster %n : x tezlanish', 'accelerationX', 0],
			['r', 'Hamster %n : y tezlanish', 'accelerationY', 0],
			['r', 'Hamster %n : z tezlanish', 'accelerationZ', 0],
			['r', 'Hamster %n : yorug\'lik', 'light', 0],
			['r', 'Hamster %n : harorat', 'temperature', 0],
			['r', 'Hamster %n : signal kuchi', 'signalStrength', 0],
			['b', 'Hamster %n : qo\'l topildimi?', 'handFound', 0],
			['-'],
			[' ', 'Hamster %n : %m.port portni %m.mode ga sozlash', 'setPortTo', 0, 'A', 'analog kiritish'],
			[' ', 'Hamster %n : %m.port portni %n ga o\'zgartirish', 'changeOutputBy', 0, 'A', 10],
			[' ', 'Hamster %n : %m.port portni %n ga sozlash', 'setOutputTo', 0, 'A', 100],
			['w', 'Hamster %n : gripperni %m.open_close', 'gripper', 0, 'oching'],
			[' ', 'Hamster %n : gripperni ozod qilish', 'releaseGripper', 0],
			['r', 'Hamster %n : A kirish', 'inputA', 0],
			['r', 'Hamster %n : B kirish', 'inputB', 0]
		]
	};
	const MENUS = {
		en: {
			'left_right': ['left', 'right'],
			'left_right_both': ['left', 'right', 'both'],
			'black_white': ['black', 'white'],
			'left_right_front_rear': ['left', 'right', 'front', 'rear'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'color': ['red', 'yellow', 'green', 'sky blue', 'blue', 'purple', 'white'],
			'note': ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'port': ['A', 'B', 'A and B'],
			'mode': ['analog input', 'digital input', 'servo output', 'pwm output', 'digital output'],
			'open_close': ['open', 'close']
		},
		ko: {
			'left_right': ['왼쪽', '오른쪽'],
			'left_right_both': ['왼쪽', '오른쪽', '양쪽'],
			'black_white': ['검은색', '하얀색'],
			'left_right_front_rear': ['왼쪽', '오른쪽', '앞쪽', '뒤쪽'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '자주색', '하얀색'],
			'note': ['도', '도# (레b)', '레', '레# (미b)', '미', '파', '파# (솔b)', '솔', '솔# (라b)', '라', '라# (시b)', '시'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'port': ['A', 'B', 'A와 B'],
			'mode': ['아날로그 입력', '디지털 입력', '서보 출력', 'PWM 출력', '디지털 출력'],
			'open_close': ['열기', '닫기']
		},
		uz: {
			'left_right': ['chap', 'o\'ng'],
			'left_right_both': ['chap', 'o\'ng', 'har ikki'],
			'black_white': ['qora', 'oq'],
			'left_right_front_rear': ['chap', 'o\'ng', 'old', 'orqa'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyoh', 'oq'],
			'note': ['do', 'do# (reb)', 're', 're# (mib)', 'mi', 'fa', 'fa# (solb)', 'sol', 'sol# (lyab)', 'lya', 'lya# (sib)', 'si'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'port': ['A', 'B', 'A va B'],
			'mode': ['analog kiritish', 'raqamli kiritish', 'servo chiqish', 'pwm chiqish', 'raqamli chiqish'],
			'open_close': ['oching', 'yoping']
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
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const FRONT = 4;
	const REAR = 5;
	const WHITE = 6;
	const OPEN = 7;
	const CLOSE = 8;
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

	function getRobot(index) {
		var robot = robots[index];
		if(!robot) {
			robot = {};
			robot.sensory = {
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
				lineTracerState: 0,
				handFound: false
			};
			robot.motoring = {
				module: 'hamster',
				index: index,
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
			robot.wheelId = 0;
			robot.wheelTimer = undefined;
			robot.lineTracerId = 0;
			robot.lineTracerCallback = undefined;
			robot.boardId = 0;
			robot.boardCommand = 0;
			robot.boardState = 0;
			robot.boardCount = 0;
			robot.boardCallback = undefined;
			robot.noteId = 0;
			robot.noteTimer1 = undefined;
			robot.noteTimer2 = undefined;
			robot.tempo = 60;
			robot.reset = function() {
				var motoring = robot.motoring;
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
				
				robot.wheelId = 0;
				robot.wheelTimer = undefined;
				robot.lineTracerId = 0;
				robot.lineTracerCallback = undefined;
				robot.boardId = 0;
				robot.boardCommand = 0;
				robot.boardState = 0;
				robot.boardCount = 0;
				robot.boardCallback = undefined;
				robot.noteId = 0;
				robot.noteTimer1 = undefined;
				robot.noteTimer2 = undefined;
				robot.tempo = 60;
			};
			robot.clearMotoring = function() {
				robot.motoring.map = 0xfc000000;
			};
			robots[index] = robot;
			packet['hamster' + index] = robot.motoring;
		}
		return robot;
	}
	
	function clearMotorings() {
		for(var i in robots) {
			robots[i].clearMotoring();
		}
	}
	
	function issueBoardId(robot) {
		return (robot.boardId % 65535) + 1;
	}
	
	function cancelBoard(robot) {
		robot.boardId = 0;
		robot.boardCommand = 0;
		robot.boardState = 0;
	}
	
	function issueWheelId(robot) {
		return (robot.wheelId % 65535) + 1;
	}
	
	function cancelWheel(robot) {
		robot.wheelId = 0;
		if(robot.wheelTimer !== undefined) {
			removeTimeout(robot.wheelTimer);
		}
		robot.wheelTimer = undefined;
	}
	
	function setLineTracerMode(robot, mode) {
		robot.motoring.lineTracerMode = mode;
		robot.motoring.map |= 0x00200000;
	}
	
	function setLineTracerSpeed(robot, speed) {
		robot.motoring.lineTracerSpeed = speed;
		robot.motoring.map |= 0x00100000;
	}
	
	function issueLineTracerId(robot) {
		return (robot.lineTracerId % 65535) + 1;
	}
	
	function cancelLineTracer(robot) {
		robot.lineTracerId = 0;
		setLineTracerMode(robot, 0);
	}
	
	function setLeftLed(robot, color) {
		robot.motoring.leftLed = color;
		robot.motoring.map |= 0x01000000;
	}
	
	function setRightLed(robot, color) {
		robot.motoring.rightLed = color;
		robot.motoring.map |= 0x00800000;
	}
	
	function setNote(robot, note) {
		robot.motoring.note = note;
		robot.motoring.map |= 0x00400000;
	}
	
	function issueNoteId(robot) {
		return (robot.noteId % 65535) + 1;
	}
	
	function cancelNote(robot) {
		robot.noteId = 0;
		if(robot.noteTimer1 !== undefined) {
			removeTimeout(robot, robot.noteTimer1);
		}
		if(robot.noteTimer2 !== undefined) {
			removeTimeout(robot, robot.noteTimer2);
		}
		robot.noteTimer1 = undefined;
		robot.noteTimer2 = undefined;
	}

	function setIoModeA(robot, mode) {
		robot.motoring.ioModeA = mode;
		robot.motoring.map |= 0x00080000;
	}
	
	function setIoModeB(robot, mode) {
		robot.motoring.ioModeB = mode;
		robot.motoring.map |= 0x00040000;
	}

	function reset() {
		for(var i in robots) {
			robots[i].reset();
		}
		removeAllTimeouts();
	}
	
	function handleLineTracer(robot) {
		var sensory = robot.sensory;
		if(robot.lineTracerId > 0 && (sensory.map & 0x00000010) != 0) {
			if(sensory.lineTracerState == 0x40) {
				cancelLineTracer(robot);
				var callback = robot.lineTracerCallback;
				robot.lineTracerCallback = undefined;
				if(callback) callback();
			}
		}
	}
	
	function handleBoard(robot) {
		if(robot.boardId > 0) {
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
						robot.boardId = 0;
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
							robot.boardId = 0;
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
							robot.boardId = 0;
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
						if(data.module == 'hamster' && data.index >= 0) {
							var robot = getRobot(data.index);
							if(robot) {
								robot.sensory = data;
								if(robot.lineTracerCallback) handleLineTracer(robot);
								if(robot.boardCallback) handleBoard(robot);
							}
						}
					};
					sock.onmessage = function(message) {
						try {
							var received = JSON.parse(message.data);
							slaveVersion = received.version || 0;
							if(received.type == 0) {
								if(received.module == 'hamster') {
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

	ext.boardMoveForward = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			motoring.motion = MOTION.NONE;
			motoring.leftWheel = 45;
			motoring.rightWheel = 45;
			robot.boardId = issueBoardId(robot);
			robot.boardCommand = 1;
			robot.boardState = 1;
			robot.boardCount = 0;
			robot.boardCallback = callback;
		} else {
			callback();
		}
	};

	ext.boardTurn = function(index, direction, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			motoring.motion = MOTION.NONE;
			if(VALUES[direction] === LEFT) {
				robot.boardCommand = 2;
				motoring.leftWheel = -45;
				motoring.rightWheel = 45;
			} else {
				robot.boardCommand = 3;
				motoring.leftWheel = 45;
				motoring.rightWheel = -45;
			}
			robot.boardId = issueBoardId(robot);
			robot.boardState = 1;
			robot.boardCount = 0;
			robot.boardCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.moveForward = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			var id = robot.wheelId = issueWheelId(robot);
			motoring.motion = MOTION.FORWARD;
			motoring.leftWheel = 30;
			motoring.rightWheel = 30;
			robot.wheelTimer = setTimeout(function() {
				if(robot.wheelId == id) {
					motoring.motion = MOTION.NONE;
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					cancelWheel(robot);
					callback();
				}
			}, 1000);
			timeouts.push(robot.wheelTimer);
		} else {
			callback();
		}
	};
	
	ext.moveBackward = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			var id = robot.wheelId = issueWheelId(robot);
			motoring.motion = MOTION.BACKWARD;
			motoring.leftWheel = -30;
			motoring.rightWheel = -30;
			robot.wheelTimer = setTimeout(function() {
				if(robot.wheelId == id) {
					motoring.motion = MOTION.NONE;
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					cancelWheel(robot);
					callback();
				}
			}, 1000);
			timeouts.push(robot.wheelTimer);
		} else {
			callback();
		}
	};
	
	ext.turn = function(index, direction, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);

			var id = robot.wheelId = issueWheelId(robot);
			if(VALUES[direction] === LEFT) {
				motoring.motion = MOTION.LEFT;
				motoring.leftWheel = -30;
				motoring.rightWheel = 30;
			} else {
				motoring.motion = MOTION.RIGHT;
				motoring.leftWheel = 30;
				motoring.rightWheel = -30;
			}
			robot.wheelTimer = setTimeout(function() {
				if(robot.wheelId == id) {
					motoring.motion = MOTION.NONE;
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					cancelWheel(robot);
					callback();
				}
			}, 1000);
			timeouts.push(robot.wheelTimer);
		} else {
			callback();
		}
	};

	ext.moveForwardForSecs = function(index, sec, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			sec = parseFloat(sec);
			if(sec && sec > 0) {
				var id = robot.wheelId = issueWheelId(robot);
				motoring.motion = MOTION.FORWARD;
				motoring.leftWheel = 30;
				motoring.rightWheel = 30;
				robot.wheelTimer = setTimeout(function() {
					if(robot.wheelId == id) {
						motoring.motion = MOTION.NONE;
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						cancelWheel(robot);
						callback();
					}
				}, sec * 1000);
				timeouts.push(robot.wheelTimer);
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.moveBackwardForSecs = function(index, sec, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			sec = parseFloat(sec);
			if(sec && sec > 0) {
				var id = robot.wheelId = issueWheelId(robot);
				motoring.motion = MOTION.BACKWARD;
				motoring.leftWheel = -30;
				motoring.rightWheel = -30;
				robot.wheelTimer = setTimeout(function() {
					if(robot.wheelId == id) {
						motoring.motion = MOTION.NONE;
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						cancelWheel(robot);
						callback();
					}
				}, sec * 1000);
				timeouts.push(robot.wheelTimer);
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.turnForSecs = function(index, direction, sec, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			sec = parseFloat(sec);
			if(sec && sec > 0) {
				var id = robot.wheelId = issueWheelId(robot);
				if(VALUES[direction] === LEFT) {
					motoring.motion = MOTION.LEFT;
					motoring.leftWheel = -30;
					motoring.rightWheel = 30;
				} else {
					motoring.motion = MOTION.RIGHT;
					motoring.leftWheel = 30;
					motoring.rightWheel = -30;
				}
				robot.wheelTimer = setTimeout(function() {
					if(robot.wheelId == id) {
						motoring.motion = MOTION.NONE;
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						cancelWheel(robot);
						callback();
					}
				}, sec * 1000);
				timeouts.push(robot.wheelTimer);
			} else {
				callback();
			}
		} else {
			callback();
		}
	};
	
	ext.changeBothWheelsBy = function(index, left, right) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			left = parseFloat(left);
			right = parseFloat(right);
			motoring.motion = MOTION.NONE;
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
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			left = parseFloat(left);
			right = parseFloat(right);
			motoring.motion = MOTION.NONE;
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
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			speed = parseFloat(speed);
			motoring.motion = MOTION.NONE;
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
		}
	};

	ext.setWheelTo = function(index, which, speed) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
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
		}
	};

	ext.followLineUsingFloorSensor = function(index, color, which) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var mode = 1;
			which = VALUES[which];
			if(which === RIGHT)
				mode = 2;
			else if(which === BOTH)
				mode = 3;
			if(VALUES[color] === WHITE)
				mode += 7;
			
			cancelBoard(robot);
			cancelWheel(robot);
			motoring.motion = MOTION.NONE;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			robot.lineTracerId = 0;
			setLineTracerMode(robot, mode);
		}
	};

	ext.followLineUntilIntersection = function(index, color, which, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
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
			
			cancelBoard(robot);
			cancelWheel(robot);
			motoring.motion = MOTION.NONE;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			robot.lineTracerId = issueLineTracerId(robot);
			setLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};

	ext.setFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseInt(speed);
			if(typeof speed == 'number') {
				setLineTracerSpeed(robot, speed);
			}
		}
	};

	ext.stop = function(index) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			motoring.motion = MOTION.NONE;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			cancelLineTracer(robot);
		}
	};

	ext.setLedTo = function(index, which, color) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			color = COLORS[color];
			if(color && color > 0) {
				which = VALUES[which];
				if(which === LEFT) {
					setLeftLed(robot, color);
				} else if(which === RIGHT) {
					setRightLed(robot, color);
				} else {
					setLeftLed(robot, color);
					setRightLed(robot, color);
				}
			}
		}
	};

	ext.clearLed = function(index, which) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			which = VALUES[which];
			if(which === LEFT) {
				setLeftLed(robot, 0);
			} else if(which === RIGHT) {
				setRightLed(robot, 0);
			} else {
				setLeftLed(robot, 0);
				setRightLed(robot, 0);
			}
		}
	};

	ext.beep = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			cancelNote(robot);
			var id = robot.noteId = issueNoteId(robot);
			motoring.buzzer = 440;
			setNote(robot, 0);
			robot.noteTimer1 = setTimeout(function() {
				if(robot.noteId == id) {
					motoring.buzzer = 0;
					cancelNote(robot);
					callback();
				}
			}, 200);
			timeouts.push(robot.noteTimer1);
		} else {
			callback();
		}
	};

	ext.changeBuzzerBy = function(index, value) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var buzzer = parseFloat(value);
			cancelNote(robot);
			setNote(robot, 0);
			if(typeof buzzer == 'number') {
				motoring.buzzer += buzzer;
			}
		}
	};

	ext.setBuzzerTo = function(index, value) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var buzzer = parseFloat(value);
			cancelNote(robot);
			setNote(robot, 0);
			if(typeof buzzer == 'number') {
				motoring.buzzer = buzzer;
			}
		}
	};

	ext.clearBuzzer = function(index) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.buzzer = 0;
			cancelNote(robot);
			setNote(robot, 0);
		}
	};
	
	ext.playNoteFor = function(index, note, octave, beat, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			note = NOTES[note];
			octave = parseInt(octave);
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
			cancelNote(robot);
			if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && robot.tempo > 0) {
				var id = robot.noteId = issueNoteId(robot);
				note += (octave - 1) * 12;
				setNote(robot, note);
				var timeout = beat * 60 * 1000 / robot.tempo;
				var tail = 0;
				if(timeout > 100) {
					tail = 100;
				}
				if(tail > 0) {
					robot.noteTimer1 = setTimeout(function() {
						if(robot.noteId == id) {
							setNote(robot, 0);
							removeTimeout(robot.noteTimer1);
							robot.noteTimer1 = undefined;
						}
					}, timeout - tail);
					timeouts.push(robot.noteTimer1);
				}
				robot.noteTimer2 = setTimeout(function() {
					if(robot.noteId == id) {
						setNote(robot, 0);
						cancelNote(robot);
						callback();
					}
				}, timeout);
				timeouts.push(robot.noteTimer2);
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.restFor = function(index, beat, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
			cancelNote(robot);
			setNote(robot, 0);
			if(beat && beat > 0 && robot.tempo > 0) {
				var id = robot.noteId = issueNoteId(robot);
				robot.noteTimer1 = setTimeout(function() {
					if(robot.noteId == id) {
						cancelNote(robot);
						callback();
					}
				}, beat * 60 * 1000 / robot.tempo);
				timeouts.push(robot.noteTimer1);
			} else {
				callback();
			}
		} else {
			callback();
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

	ext.leftProximity = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound = function(index) {
		var robot = getRobot(index);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.handFound || sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.setPortTo = function(index, port, mode) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			mode = MODES[mode];
			if(typeof mode == 'number') {
				if(port == 'A') {
					setIoModeA(robot, mode);
				} else if(port == 'B') {
					setIoModeB(robot, mode);
				} else {
					setIoModeA(robot, mode);
					setIoModeB(robot, mode);
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
				if(port == 'A') {
					motoring.outputA += value;
				} else if(port == 'B') {
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
				if(port == 'A') {
					motoring.outputA = value;
				} else if(port == 'B') {
					motoring.outputB = value;
				} else {
					motoring.outputA = value;
					motoring.outputB = value;
				}
			}
		}
	};
	
	ext.gripper = function(index, action, callback) {
		var robot = getRobot(index);
		if(robot) {
			action = VALUES[action];
			setIoModeA(robot, 10);
			setIoModeB(robot, 10);
			var motoring = robot.motoring;
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
		} else {
			callback();
		}
	};
	
	ext.releaseGripper = function(index) {
		var robot = getRobot(index);
		if(robot) {
			setIoModeA(robot, 10);
			setIoModeB(robot, 10);
			var motoring = robot.motoring;
			motoring.outputA = 0;
			motoring.outputB = 0;
		}
	};

	ext.inputA = function(index) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB = function(index) {
		var robot = getRobot(index);
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
