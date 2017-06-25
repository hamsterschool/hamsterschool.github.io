(function(ext) {

	var sensory = {
		map: 0,
		signalStrength: 0,
		colorRed: 0,
		colorGreen: 0,
		colorBlue: 0,
		colorClear: 0,
		floor: 0,
		accelerationX: 0,
		accelerationY: 0,
		accelerationZ: 0,
		temperature: 0,
		button: 0,
		colorNumber: -1,
		colorPattern: -1,
		pulseCount: 0,
		wheelState: 0,
		soundState: 0,
		lineTracerState: 0
	};
	var motoring = {
		module: 'turtle',
		map: 0xf8000000,
		leftWheel: 0,
		rightWheel: 0,
		ledRed: 0,
		ledGreen: 0,
		ledBlue: 0,
		buzzer: 0,
		pulse: 0,
		note: 0,
		sound: 0,
		lineTracerMode: 0,
		lineTracerGain: 5,
		lineTracerSpeed: 5,
		lamp: 1,
		lock: 0,
		motionType: 0,
		motionUnit: 0,
		motionSpeed: 0,
		motionValue: 0,
		motionRadius: 0
	};
	var connectionState = 1;
	var pulseCallback = undefined;
	var soundId = 0;
	var soundRepeat = 1;
	var soundCallback = undefined;
	var lineTracerCallback = undefined;
	var clicked = false;
	var doubleClicked = false;
	var longPressed = false;
	var colorPattern = -1;
	var tempo = 60;
	var timeouts = [];
	var socket = undefined;
	var sendTimer = undefined;
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
		en: 'Turtle',
		ko: '거북이',
		uz: 'Turtle'
	};
	const BLOCKS = {
		en1: [
			['w', 'move forward', 'turtleMoveForward'],
			['w', 'move backward', 'turtleMoveBackward'],
			['w', 'turn %m.left_right', 'turtleTurn', 'left'],
			['-'],
			[' ', 'set head led to %m.led_color', 'turtleSetHeadLedTo', 'red'],
			[' ', 'clear head led', 'turtleClearHeadLed'],
			['-'],
			[' ', 'play sound %m.sound', 'turtlePlaySound', 'beep'],
			[' ', 'clear sound', 'turtleClearSound'],
			['-'],
			['b', 'touching %m.touching_color ?', 'turtleTouchingColor', 'red'],
			['b', 'button %m.button_state ?', 'turtleButtonState', 'clicked']
		],
		en2: [
			['w', 'move forward %n %m.cm_sec', 'turtleMoveForwardUnit', 6, 'cm'],
			['w', 'move backward %n %m.cm_sec', 'turtleMoveBackwardUnit', 6, 'cm'],
			['w', 'turn %m.left_right %n %m.deg_sec in place', 'turtleTurnUnitInPlace', 'left', 90, 'degrees'],
			['w', 'turn %m.left_right %n %m.deg_sec with radius %n cm in %m.head_tail direction', 'turtleTurnUnitWithRadiusInDirection', 'left', 90, 'degrees', 6, 'head'],
			['w', 'pivot around %m.left_right wheel %n %m.deg_sec in %m.head_tail direction', 'turtlePivotAroundWheelUnitInDirection', 'left', 90, 'degrees', 'head'],
			['-'],
			[' ', 'set head led to %m.led_color', 'turtleSetHeadLedTo', 'red'],
			[' ', 'clear head led', 'turtleClearHeadLed'],
			['-'],
			[' ', 'play sound %m.sound %n times', 'turtlePlaySoundTimes', 'beep', 1],
			['w', 'play sound %m.sound %n times until done', 'turtlePlaySoundTimesUntilDone', 'beep', 1],
			[' ', 'clear sound', 'turtleClearSound'],
			['w', 'play note %m.note %m.octave for %d.beats beats', 'turtlePlayNoteForBeats', 'C', '4', 0.5],
			['w', 'rest for %d.beats beats', 'turtleRestForBeats', 0.25],
			[' ', 'change tempo by %n', 'turtleChangeTempoBy', 20],
			[' ', 'set tempo to %n bpm', 'turtleSetTempoTo', 60],
			['-'],
			['b', 'touching %m.touching_color ?', 'turtleTouchingColor', 'red'],
			['b', 'color pattern %m.pattern_color %m.pattern_color ?', 'turtleIsColorPattern', 'red', 'yellow'],
			['b', 'button %m.button_state ?', 'turtleButtonState', 'clicked']
		],
		en3: [
			['w', 'move forward %n %m.move_unit', 'turtleMoveForwardUnit', 6, 'cm'],
			['w', 'move backward %n %m.move_unit', 'turtleMoveBackwardUnit', 6, 'cm'],
			['w', 'turn %m.left_right %n %m.turn_unit in place', 'turtleTurnUnitInPlace', 'left', 90, 'degrees'],
			['w', 'turn %m.left_right %n %m.turn_unit with radius %n cm in %m.head_tail direction', 'turtleTurnUnitWithRadiusInDirection', 'left', 90, 'degrees', 6, 'head'],
			['w', 'pivot around %m.left_right wheel %n %m.turn_unit in %m.head_tail direction', 'turtlePivotAroundWheelUnitInDirection', 'left', 90, 'degrees', 'head'],
			[' ', 'change wheels by left: %n right: %n', 'turtleChangeWheelsByLeftRight', 10, 10],
			[' ', 'set wheels to left: %n right: %n', 'turtleSetWheelsToLeftRight', 50, 50],
			[' ', 'change %m.left_right_both wheel by %n', 'turtleChangeWheelBy', 'left', 10],
			[' ', 'set %m.left_right_both wheel to %n', 'turtleSetWheelTo', 'left', 50],
			[' ', 'follow %m.line_color line', 'turtleFollowLine', 'black'],
			['w', 'follow black line until %m.target_color', 'turtleFollowLineUntil', 'red'],
			['w', 'follow %m.color_line line until black', 'turtleFollowLineUntilBlack', 'red'],
			['w', 'cross black intersection', 'turtleCrossIntersection'],
			['w', 'turn %m.left_right_back at black intersection', 'turtleTurnAtIntersection', 'left'],
			[' ', 'set following speed to %m.speed', 'turtleSetFollowingSpeedTo', '5'],
			[' ', 'stop', 'turtleStop'],
			['-'],
			[' ', 'set head led to %m.led_color', 'turtleSetHeadLedTo', 'red'],
			[' ', 'change head led by r: %n g: %n b: %n', 'turtleChangeHeadLedByRGB', 10, 0, 0],
			[' ', 'set head led to r: %n g: %n b: %n', 'turtleSetHeadLedToRGB', 255, 0, 0],
			[' ', 'clear head led', 'turtleClearHeadLed'],
			['-'],
			[' ', 'play sound %m.sound %n times', 'turtlePlaySoundTimes', 'beep', 1],
			['w', 'play sound %m.sound %n times until done', 'turtlePlaySoundTimesUntilDone', 'beep', 1],
			[' ', 'change buzzer by %n', 'turtleChangeBuzzerBy', 10],
			[' ', 'set buzzer to %n', 'turtleSetBuzzerTo', 1000],
			[' ', 'clear sound', 'turtleClearSound'],
			[' ', 'play note %m.note %m.octave', 'turtlePlayNote', 'C', '4'],
			['w', 'play note %m.note %m.octave for %d.beats beats', 'turtlePlayNoteForBeats', 'C', '4', 0.5],
			['w', 'rest for %d.beats beats', 'turtleRestForBeats', 0.25],
			[' ', 'change tempo by %n', 'turtleChangeTempoBy', 20],
			[' ', 'set tempo to %n bpm', 'turtleSetTempoTo', 60],
			['-'],
			['b', 'touching %m.touching_color ?', 'turtleTouchingColor', 'red'],
			['b', 'color pattern %m.pattern_color %m.pattern_color ?', 'turtleIsColorPattern', 'red', 'yellow'],
			['b', 'button %m.button_state ?', 'turtleButtonState', 'clicked'],
			['r', 'color number', 'turtleColorNumber'],
			['r', 'color pattern', 'turtleColorPattern'],
			['r', 'floor', 'turtleFloor'],
			['r', 'button', 'turtleButton'],
			['r', 'x acceleration', 'turtleAccelerationX'],
			['r', 'y acceleration', 'turtleAccelerationY'],
			['r', 'z acceleration', 'turtleAccelerationZ']
		],
		ko1: [
			['w', '앞으로 이동하기', 'turtleMoveForward'],
			['w', '뒤로 이동하기', 'turtleMoveBackward'],
			['w', '%m.left_right 으로 돌기', 'turtleTurn', '왼쪽'],
			['-'],
			[' ', '머리 LED를 %m.led_color 으로 정하기', 'turtleSetHeadLedTo', '빨간색'],
			[' ', '머리 LED 끄기', 'turtleClearHeadLed'],
			['-'],
			[' ', '%m.sound 소리 재생하기', 'turtlePlaySound', '삐'],
			[' ', '소리 끄기', 'turtleClearSound'],
			['-'],
			['b', '%m.touching_color 에 닿았는가?', 'turtleTouchingColor', '빨간색'],
			['b', '버튼을 %m.button_state ?', 'turtleButtonState', '클릭했는가']
		],
		ko2: [
			['w', '앞으로 %n %m.cm_sec 이동하기', 'turtleMoveForwardUnit', 6, 'cm'],
			['w', '뒤로 %n %m.cm_sec 이동하기', 'turtleMoveBackwardUnit', 6, 'cm'],
			['w', '%m.left_right 으로 %n %m.deg_sec 제자리 돌기', 'turtleTurnUnitInPlace', '왼쪽', 90, '도'],
			['w', '%m.left_right 으로 %n %m.deg_sec 반지름 %n cm를 %m.head_tail 방향으로 돌기', 'turtleTurnUnitWithRadiusInDirection', '왼쪽', 90, '도', 6, '머리'],
			['w', '%m.left_right 바퀴 중심으로 %n %m.deg_sec %m.head_tail 방향으로 돌기', 'turtlePivotAroundWheelUnitInDirection', '왼쪽', 90, '도', '머리'],
			['-'],
			[' ', '머리 LED를 %m.led_color 으로 정하기', 'turtleSetHeadLedTo', '빨간색'],
			[' ', '머리 LED 끄기', 'turtleClearHeadLed'],
			['-'],
			[' ', '%m.sound 소리 %n 번 재생하기', 'turtlePlaySoundTimes', '삐', 1],
			['w', '%m.sound 소리 %n 번 재생하고 기다리기', 'turtlePlaySoundTimesUntilDone', '삐', 1],
			[' ', '소리 끄기', 'turtleClearSound'],
			['w', '%m.note %m.octave 음을 %d.beats 박자 연주하기', 'turtlePlayNoteForBeats', '도', '4', 0.5],
			['w', '%d.beats 박자 쉬기', 'turtleRestForBeats', 0.25],
			[' ', '연주 속도를 %n 만큼 바꾸기', 'turtleChangeTempoBy', 20],
			[' ', '연주 속도를 %n BPM으로 정하기', 'turtleSetTempoTo', 60],
			['-'],
			['b', '%m.touching_color 에 닿았는가?', 'turtleTouchingColor', '빨간색'],
			['b', '색상 패턴이 %m.pattern_color %m.pattern_color 인가?', 'turtleIsColorPattern', '빨간색', '노란색'],
			['b', '버튼을 %m.button_state ?', 'turtleButtonState', '클릭했는가']
		],
		ko3: [
			['w', '앞으로 %n %m.move_unit 이동하기', 'turtleMoveForwardUnit', 6, 'cm'],
			['w', '뒤로 %n %m.move_unit 이동하기', 'turtleMoveBackwardUnit', 6, 'cm'],
			['w', '%m.left_right 으로 %n %m.turn_unit 제자리 돌기', 'turtleTurnUnitInPlace', '왼쪽', 90, '도'],
			['w', '%m.left_right 으로 %n %m.turn_unit 반지름 %n cm를 %m.head_tail 방향으로 돌기', 'turtleTurnUnitWithRadiusInDirection', '왼쪽', 90, '도', 6, '머리'],
			['w', '%m.left_right 바퀴 중심으로 %n %m.turn_unit %m.head_tail 방향으로 돌기', 'turtlePivotAroundWheelUnitInDirection', '왼쪽', 90, '도', '머리'],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기', 'turtleChangeWheelsByLeftRight', 10, 10],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기', 'turtleSetWheelsToLeftRight', 50, 50],
			[' ', '%m.left_right_both 바퀴 %n 만큼 바꾸기', 'turtleChangeWheelBy', '왼쪽', 10],
			[' ', '%m.left_right_both 바퀴 %n (으)로 정하기', 'turtleSetWheelTo', '왼쪽', 50],
			[' ', '%m.line_color 선을 따라가기', 'turtleFollowLine', '검은색'],
			['w', '검은색 선을 따라 %m.target_color 까지 이동하기', 'turtleFollowLineUntil', '빨간색'],
			['w', '%m.color_line 선을 따라 검은색까지 이동하기', 'turtleFollowLineUntilBlack', '빨간색'],
			['w', '검은색 교차로 건너가기', 'turtleCrossIntersection'],
			['w', '검은색 교차로에서 %m.left_right_back 으로 돌기', 'turtleTurnAtIntersection', '왼쪽'],
			[' ', '선 따라가기 속도를 %m.speed (으)로 정하기', 'turtleSetFollowingSpeedTo', '5'],
			[' ', '정지하기', 'turtleStop'],
			['-'],
			[' ', '머리 LED를 %m.led_color 으로 정하기', 'turtleSetHeadLedTo', '빨간색'],
			[' ', '머리 LED를 R: %n G: %n B: %n 만큼 바꾸기', 'turtleChangeHeadLedByRGB', 10, 0, 0],
			[' ', '머리 LED를 R: %n G: %n B: %n (으)로 정하기', 'turtleSetHeadLedToRGB', 255, 0, 0],
			[' ', '머리 LED 끄기', 'turtleClearHeadLed'],
			['-'],
			[' ', '%m.sound 소리 %n 번 재생하기', 'turtlePlaySoundTimes', '삐', 1],
			['w', '%m.sound 소리 %n 번 재생하고 기다리기', 'turtlePlaySoundTimesUntilDone', '삐', 1],
			[' ', '버저 음을 %n 만큼 바꾸기', 'turtleChangeBuzzerBy', 10],
			[' ', '버저 음을 %n (으)로 정하기', 'turtleSetBuzzerTo', 1000],
			[' ', '소리 끄기', 'turtleClearSound'],
			[' ', '%m.note %m.octave 음을 연주하기', 'turtlePlayNote', '도', '4'],
			['w', '%m.note %m.octave 음을 %d.beats 박자 연주하기', 'turtlePlayNoteForBeats', '도', '4', 0.5],
			['w', '%d.beats 박자 쉬기', 'turtleRestForBeats', 0.25],
			[' ', '연주 속도를 %n 만큼 바꾸기', 'turtleChangeTempoBy', 20],
			[' ', '연주 속도를 %n BPM으로 정하기', 'turtleSetTempoTo', 60],
			['-'],
			['b', '%m.touching_color 에 닿았는가?', 'turtleTouchingColor', '빨간색'],
			['b', '색상 패턴이 %m.pattern_color %m.pattern_color 인가?', 'turtleIsColorPattern', '빨간색', '노란색'],
			['b', '버튼을 %m.button_state ?', 'turtleButtonState', '클릭했는가'],
			['r', '색상 번호', 'turtleColorNumber'],
			['r', '색상 패턴', 'turtleColorPattern'],
			['r', '바닥 센서', 'turtleFloor'],
			['r', '버튼', 'turtleButton'],
			['r', 'x축 가속도', 'turtleAccelerationX'],
			['r', 'y축 가속도', 'turtleAccelerationY'],
			['r', 'z축 가속도', 'turtleAccelerationZ']
		],
		uz1: [
			['w', 'oldinga yurish', 'turtleMoveForward'],
			['w', 'orqaga yurish', 'turtleMoveBackward'],
			['w', '%m.left_right ga o\'girilish', 'turtleTurn', 'chap'],
			['-'],
			[' ', 'boshini LEDni %m.led_color ga sozlash', 'turtleSetHeadLedTo', 'qizil'],
			[' ', 'boshini LEDni o\'chirish', 'turtleClearHeadLed'],
			['-'],
			[' ', '%m.sound ovozi ijro', 'turtlePlaySound', 'qisqa'],
			[' ', 'ovozi o\'chirish', 'turtleClearSound'],
			['-'],
			['b', '%m.touching_color ga tegingan?', 'turtleTouchingColor', 'qizil'],
			['b', 'tugmasini %m.button_state ?', 'turtleButtonState', 'chertayotgan']
		],
		uz2: [
			['w', 'oldinga %n %m.cm_sec yurish', 'turtleMoveForwardUnit', 6, 'cm'],
			['w', 'orqaga %n %m.cm_sec yurish', 'turtleMoveBackwardUnit', 6, 'cm'],
			['w', '%m.left_right ga %n %m.deg_sec joyda o\'girilish', 'turtleTurnUnitInPlace', 'chap', 90, 'daraja'],
			['w', '%m.left_right ga %n %m.deg_sec radius %n cm %m.head_tail yo\'nalishda o\'girilish', 'turtleTurnUnitWithRadiusInDirection', 'chap', 90, 'daraja', 6, 'bosh'],
			['w', '%m.left_right g\'ildirak markaziga %n %m.deg_sec %m.head_tail yo\'nalishda o\'girilish', 'turtlePivotAroundWheelUnitInDirection', 'chap', 90, 'daraja', 'bosh'],
			['-'],
			[' ', 'boshini LEDni %m.led_color ga sozlash', 'turtleSetHeadLedTo', 'qizil'],
			[' ', 'boshini LEDni o\'chirish', 'turtleClearHeadLed'],
			['-'],
			[' ', '%m.sound ovozi %n marta ijro', 'turtlePlaySoundTimes', 'qisqa', 1],
			['w', '%m.sound ovozi %n marta amalga qadar ijro', 'turtlePlaySoundTimesUntilDone', 'qisqa', 1],
			[' ', 'ovozi o\'chirish', 'turtleClearSound'],
			['w', '%m.note %m.octave notani %d.beats zarb ijro etish', 'turtlePlayNoteForBeats', 'do', '4', 0.5],
			['w', '%d.beats zarb tanaffus', 'turtleRestForBeats', 0.25],
			[' ', 'temni %n ga o\'zgartirish', 'turtleChangeTempoBy', 20],
			[' ', 'temni %n bpm ga sozlash', 'turtleSetTempoTo', 60],
			['-'],
			['b', '%m.touching_color ga tegingan?', 'turtleTouchingColor', 'qizil'],
			['b', 'rang namuna %m.pattern_color %m.pattern_color ?', 'turtleIsColorPattern', 'qizil', 'sariq'],
			['b', 'tugmasini %m.button_state ?', 'turtleButtonState', 'chertayotgan']
		],
		uz3: [
			['w', 'oldinga %n %m.move_unit yurish', 'turtleMoveForwardUnit', 6, 'cm'],
			['w', 'orqaga %n %m.move_unit yurish', 'turtleMoveBackwardUnit', 6, 'cm'],
			['w', '%m.left_right ga %n %m.turn_unit joyda o\'girilish', 'turtleTurnUnitInPlace', 'chap', 90, 'daraja'],
			['w', '%m.left_right ga %n %m.turn_unit radius %n cm %m.head_tail yo\'nalishda o\'girilish', 'turtleTurnUnitWithRadiusInDirection', 'chap', 90, 'daraja', 6, 'bosh'],
			['w', '%m.left_right g\'ildirak markaziga %n %m.turn_unit %m.head_tail yo\'nalishda o\'girilish', 'turtlePivotAroundWheelUnitInDirection', 'chap', 90, 'daraja', 'bosh'],
			[' ', 'chap g\'ildirakni %n o\'ng g\'ildirakni %n ga o\'zgartirish', 'turtleChangeWheelsByLeftRight', 10, 10],
			[' ', 'chap g\'ildirakni %n o\'ng g\'ildirakni %n ga sozlash', 'turtleSetWheelsToLeftRight', 50, 50],
			[' ', '%m.left_right_both g\'ildirakni %n ga o\'zgarish', 'turtleChangeWheelBy', 'chap', 10],
			[' ', '%m.left_right_both g\'ildirakni %n ga sozlash', 'turtleSetWheelTo', 'chap', 50],
			[' ', '%m.line_color liniyasini ergashish', 'turtleFollowLine', 'qora'],
			['w', 'qora liniyasini ustida %m.target_color gacha yurish', 'turtleFollowLineUntil', 'qizil'],
			['w', '%m.color_line liniyasini ustida qora gacha yurish', 'turtleFollowLineUntilBlack', 'qizil'],
			['w', 'qora chorrahasida bo\'ylab borib', 'turtleCrossIntersection'],
			['w', 'qora chorrahasida %m.left_right_back ga o\'girilish', 'turtleTurnAtIntersection', 'chap'],
			[' ', 'liniyada ergashish tezligini %m.speed ga sozlash', 'turtleSetFollowingSpeedTo', '5'],
			[' ', 'to\'xtatish', 'turtleStop'],
			['-'],
			[' ', 'boshini LEDni %m.led_color ga sozlash', 'turtleSetHeadLedTo', 'qizil'],
			[' ', 'boshini LEDni r: %n g: %n b: %n ga o\'zgarish', 'turtleChangeHeadLedByRGB', 10, 0, 0],
			[' ', 'boshini LEDni r: %n g: %n b: %n ga sozlash', 'turtleSetHeadLedToRGB', 255, 0, 0],
			[' ', 'boshini LEDni o\'chirish', 'turtleClearHeadLed'],
			['-'],
			[' ', '%m.sound ovozi %n marta ijro', 'turtlePlaySoundTimes', 'qisqa', 1],
			['w', '%m.sound ovozi %n marta amalga qadar ijro', 'turtlePlaySoundTimesUntilDone', 'qisqa', 1],
			[' ', 'buzerning ovozini %n ga o\'zgartirish', 'turtleChangeBuzzerBy', 10],
			[' ', 'buzerning ovozini %n ga sozlash', 'turtleSetBuzzerTo', 1000],
			[' ', 'ovozi o\'chirish', 'turtleClearSound'],
			[' ', '%m.note %m.octave notani ijro etish', 'turtlePlayNote', 'do', '4'],
			['w', '%m.note %m.octave notani %d.beats zarb ijro etish', 'turtlePlayNoteForBeats', 'do', '4', 0.5],
			['w', '%d.beats zarb tanaffus', 'turtleRestForBeats', 0.25],
			[' ', 'temni %n ga o\'zgartirish', 'turtleChangeTempoBy', 20],
			[' ', 'temni %n bpm ga sozlash', 'turtleSetTempoTo', 60],
			['-'],
			['b', '%m.touching_color ga tegingan?', 'turtleTouchingColor', 'qizil'],
			['b', 'rang namuna %m.pattern_color %m.pattern_color ?', 'turtleIsColorPattern', 'qizil', 'sariq'],
			['b', 'tugmasini %m.button_state ?', 'turtleButtonState', 'chertayotgan'],
			['r', 'rang soni', 'turtleColorNumber'],
			['r', 'rang namuna', 'turtleColorPattern'],
			['r', 'taglik sensori', 'turtleFloor'],
			['r', 'tugmasi', 'turtleButton'],
			['r', 'x tezlanish', 'turtleAccelerationX'],
			['r', 'y tezlanish', 'turtleAccelerationY'],
			['r', 'z tezlanish', 'turtleAccelerationZ']
		]
	};
	const MENUS = {
		en: {
			'cm_sec': ['cm', 'seconds'],
			'deg_sec': ['degrees', 'seconds'],
			'move_unit': ['cm', 'seconds', 'pulses'],
			'turn_unit': ['degrees', 'seconds', 'pulses'],
			'head_tail': ['head', 'tail'],
			'left_right': ['left', 'right'],
			'left_right_both': ['left', 'right', 'both'],
			'left_right_back': ['left', 'right', 'back'],
			'line_color': ['black', 'red', 'green', 'blue', 'any color'],
			'target_color': ['red', 'yellow', 'green', 'sky blue', 'blue', 'purple', 'any color'],
			'color_line': ['red', 'green', 'blue', 'any color'],
			'touching_color': ['red', 'orange', 'yellow', 'green', 'sky blue', 'blue', 'purple', 'black', 'white'],
			'pattern_color': ['red', 'yellow', 'green', 'sky blue', 'blue', 'purple'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'led_color': ['red', 'orange', 'yellow', 'green', 'sky blue', 'blue', 'violet', 'purple', 'white'],
			'sound': ['beep', 'random beep', 'siren', 'engine', 'robot', 'march', 'birthday', 'dibidibidip', 'good job'],
			'note': ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'button_state': ['clicked', 'double-clicked', 'long-pressed']
		},
		ko: {
			'cm_sec': ['cm', '초'],
			'deg_sec': ['도', '초'],
			'move_unit': ['cm', '초', '펄스'],
			'turn_unit': ['도', '초', '펄스'],
			'head_tail': ['머리', '꼬리'],
			'left_right': ['왼쪽', '오른쪽'],
			'left_right_both': ['왼쪽', '오른쪽', '양쪽'],
			'left_right_back': ['왼쪽', '오른쪽', '뒤쪽'],
			'line_color': ['검은색', '빨간색', '초록색', '파란색', '아무 색'],
			'target_color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '자주색', '아무 색'],
			'color_line': ['빨간색', '초록색', '파란색', '아무 색'],
			'touching_color': ['빨간색', '주황색', '노란색', '초록색', '하늘색', '파란색', '자주색', '검은색', '하얀색'],
			'pattern_color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '자주색'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'led_color': ['빨간색', '주황색', '노란색', '초록색', '하늘색', '파란색', '보라색', '자주색', '하얀색'],
			'sound': ['삐', '무작위 삐', '사이렌', '엔진', '로봇', '행진', '생일', '디비디비딥', '잘 했어요'],
			'note': ['도', '도#', '레', '미b', '미', '파', '파#', '솔', '솔#', '라', '시b', '시'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'button_state': ['클릭했는가', '더블클릭했는가', '길게~눌렀는가']
		},
		uz: {
			'cm_sec': ['cm', 'soniya'],
			'deg_sec': ['daraja', 'soniya'],
			'move_unit': ['cm', 'soniya', 'urishlar'],
			'turn_unit': ['daraja', 'soniya', 'urishlar'],
			'head_tail': ['bosh', 'dum'],
			'left_right': ['chap', 'o\'ng'],
			'left_right_both': ['chap', 'o\'ng', 'har ikki'],
			'left_right_back': ['chap', 'o\'ng', 'orqa'],
			'line_color': ['qora', 'qizil', 'yashil', 'ko\'k', 'har qanday rang'],
			'target_color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyohrang', 'har qanday rang'],
			'color_line': ['qizil', 'yashil', 'ko\'k', 'har qanday rang'],
			'touching_color': ['qizil', 'apelsin', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyohrang', 'qora', 'oq'],
			'pattern_color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyohrang'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'led_color': ['qizil', 'apelsin', 'sariq', 'yashil', 'moviy', 'ko\'k', 'qirmizi', 'siyohrang', 'oq'],
			'sound': ['qisqa', 'tasodifiy qisqa', 'sirena', 'motor', 'robot', 'qadam tashlamoq', 'tug\'ilgan kun', 'dibidibidip', 'juda yaxshi'],
			'note': ['do', 'do#', 're', 'mib', 'mi', 'fa', 'fa#', 'sol', 'sol#', 'lya', 'sib', 'si'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'button_state': ['chertayotgan', 'ikki-chertayotgan', 'uzoq-bosdi']
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

	var LINE_COLORS = {};
	var COLOR_NUMBERS = {};
	var COLOR_PATTERNS = {};
	var RGB_COLORS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var SOUNDS = {};
	var BUTTON_STATES = {};
	var VALUES = {};
	const SECONDS = 1;
	const PULSES = 2;
	const DEGREES = 3;
	const LEFT = 4;
	const RIGHT = 5;
	const BACK = 6;
	const HEAD = 7;
	const LEVEL1_MOVE_CM = 12;
	const LEVEL1_TURN_DEG = 90;
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['line_color'];
		LINE_COLORS[tmp[0]] = 0;
		LINE_COLORS[tmp[1]] = 1;
		LINE_COLORS[tmp[2]] = 3;
		LINE_COLORS[tmp[3]] = 5;
		LINE_COLORS[tmp[4]] = 7;
		tmp = MENUS[i]['touching_color'];
		COLOR_NUMBERS[tmp[0]] = 1;
		COLOR_NUMBERS[tmp[1]] = 2;
		COLOR_NUMBERS[tmp[2]] = 3;
		COLOR_NUMBERS[tmp[3]] = 4;
		COLOR_NUMBERS[tmp[4]] = 5;
		COLOR_NUMBERS[tmp[5]] = 6;
		COLOR_NUMBERS[tmp[6]] = 7;
		COLOR_NUMBERS[tmp[7]] = 0;
		COLOR_NUMBERS[tmp[8]] = 8;
		tmp = MENUS[i]['pattern_color'];
		COLOR_PATTERNS[tmp[0]] = 1;
		COLOR_PATTERNS[tmp[1]] = 3;
		COLOR_PATTERNS[tmp[2]] = 4;
		COLOR_PATTERNS[tmp[3]] = 5;
		COLOR_PATTERNS[tmp[4]] = 6;
		COLOR_PATTERNS[tmp[5]] = 7;
		tmp = MENUS[i]['led_color'];
		RGB_COLORS[tmp[0]] = [255, 0, 0];
		RGB_COLORS[tmp[1]] = [255, 63, 0];
		RGB_COLORS[tmp[2]] = [255, 255, 0];
		RGB_COLORS[tmp[3]] = [0, 255, 0];
		RGB_COLORS[tmp[4]] = [0, 255, 255];
		RGB_COLORS[tmp[5]] = [0, 0, 255];
		RGB_COLORS[tmp[6]] = [63, 0, 255];
		RGB_COLORS[tmp[7]] = [255, 0, 255];
		RGB_COLORS[tmp[8]] = [255, 255, 255];
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
		tmp = MENUS[i]['sound'];
		SOUNDS[tmp[0]] = 1;
		SOUNDS[tmp[1]] = 2;
		SOUNDS[tmp[2]] = 3;
		SOUNDS[tmp[3]] = 4;
		SOUNDS[tmp[4]] = 5;
		SOUNDS[tmp[5]] = 6;
		SOUNDS[tmp[6]] = 7;
		SOUNDS[tmp[7]] = 8;
		SOUNDS[tmp[8]] = 9;
		tmp = MENUS[i]['button_state'];
		BUTTON_STATES[tmp[0]] = 1;
		BUTTON_STATES[tmp[1]] = 2;
		BUTTON_STATES[tmp[2]] = 3;
		tmp = MENUS[i]['move_unit'];
		VALUES[tmp[1]] = SECONDS;
		VALUES[tmp[2]] = PULSES;
		tmp = MENUS[i]['turn_unit'];
		VALUES[tmp[0]] = DEGREES;
		tmp = MENUS[i]['left_right_back'];
		VALUES[tmp[0]] = LEFT;
		VALUES[tmp[1]] = RIGHT;
		VALUES[tmp[2]] = BACK;
		tmp = MENUS[i]['head_tail'];
		VALUES[tmp[0]] = HEAD;
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
		motoring.map = 0xf8000000;
	}
	
	function setPulse(pulse) {
		motoring.pulse = pulse;
		motoring.map |= 0x04000000;
	}
	
	function setNote(note) {
		motoring.note = note;
		motoring.map |= 0x02000000;
	}
	
	function setSound(sound) {
		motoring.sound = sound;
		motoring.map |= 0x01000000;
	}

	function setLineTracerMode(mode) {
		motoring.lineTracerMode = mode;
		motoring.map |= 0x00800000;
	}
	
	function setLineTracerGain(gain) {
		motoring.lineTracerGain = gain;
		motoring.map |= 0x00400000;
	}
	
	function setLineTracerSpeed(speed) {
		motoring.lineTracerSpeed = speed;
		motoring.map |= 0x00200000;
	}
	
	function setMotion(type, unit, speed, value, radius) {
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map |= 0x00040000;
	}
	
	function runSound(sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			soundId = sound;
			soundRepeat = count;
			setSound(sound);
		}
	}
	
	function reset() {
		motoring.map = 0xffe40000;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.ledRed = 0;
		motoring.ledGreen = 0;
		motoring.ledBlue = 0;
		motoring.buzzer = 0;
		motoring.pulse = 0;
		motoring.note = 0;
		motoring.sound = 0;
		motoring.lineTracerMode = 0;
		motoring.lineTracerGain = 5;
		motoring.lineTracerSpeed = 5;
		motoring.lamp = 1;
		motoring.lock = 0;
		motoring.motionType = 0;
		motoring.motionUnit = 0;
		motoring.motionSpeed = 0;
		motoring.motionValue = 0;
		motoring.motionRadius = 0;

		pulseCallback = undefined;
		soundId = 0;
		soundRepeat = 1;
		soundCallback = undefined;
		lineTracerCallback = undefined;
		clicked = false;
		doubleClicked = false;
		longPressed = false;
		colorPattern = -1;
		tempo = 60;
		removeAllTimeouts();
	}
	
	function handleSensory() {
		if(sensory.map & 0x00000800) clicked = true;
		if(sensory.map & 0x00000400) doubleClicked = true;
		if(sensory.map & 0x00000200) longPressed = true;
		if(sensory.map & 0x00000080) colorPattern = sensory.colorPattern;
		
		if(lineTracerCallback) {
			if(sensory.map & 0x00000008) {
				if(sensory.lineTracerState == 0x02) {
					setLineTracerMode(0);
					var callback = lineTracerCallback;
					lineTracerCallback = undefined;
					if(callback) callback();
				}
			}
		}
		if(pulseCallback) {
			if(sensory.map & 0x00000020) {
				if(sensory.wheelState == 0) {
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					var callback = pulseCallback;
					pulseCallback = undefined;
					if(callback) callback();
				}
			}
		}
		if(sensory.map & 0x00000010) {
			if(sensory.soundState == 0) {
				if(soundId > 0) {
					if(soundRepeat < 0) {
						runSound(soundId, -1);
					} else if(soundRepeat > 1) {
						soundRepeat --;
						runSound(soundId, soundRepeat);
					} else {
						soundId = 0;
						soundRepeat = 1;
						var callback = soundCallback;
						soundCallback = undefined;
						if(callback) callback();
					}
				} else {
					soundId = 0;
					soundRepeat = 1;
					var callback = soundCallback;
					soundCallback = undefined;
					if(callback) callback();
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
								var json = JSON.stringify(motoring);
								if(canSend && socket) socket.send(json);
								clearMotoring();
							} catch (e) {
							}
						}
					}, 20);
					sock.onmessage = function(message) { // message: MessageEvent
						try {
							var data = JSON.parse(message.data);
							if(data.module == 'turtle') {
								if(data.type == 1) {
									if(data.index == 0) {
										sensory = data;
										handleSensory();
									}
								} else if(data.type == 0) {
									connectionState = data.state;
								}
							}
						} catch (e) {
						}
					};
					sock.onclose = function() {
						canSend = false;
						if(sendTimer) {
							clearInterval(sendTimer);
							sendTimer = undefined;
						}
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

	ext.turtleMoveForward = function(callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setLineTracerMode(0);
		setMotion(1, 1, 0, LEVEL1_MOVE_CM, 0);
		pulseCallback = callback;
	};
	
	ext.turtleMoveBackward = function(callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setLineTracerMode(0);
		setMotion(2, 1, 0, LEVEL1_MOVE_CM, 0);
		pulseCallback = callback;
	};
	
	ext.turtleTurn = function(direction, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setLineTracerMode(0);
		if(VALUES[direction] === LEFT) {
			setMotion(3, 1, 0, LEVEL1_TURN_DEG, 0);
		} else {
			setMotion(4, 1, 0, LEVEL1_TURN_DEG, 0);
		}
		pulseCallback = callback;
	};

	ext.turtleMoveForwardUnit = function(value, unit, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setLineTracerMode(0);
		if(value && value > 0) {
			unit = VALUES[unit];
			if(unit === SECONDS) unit = 2;
			else if(unit === PULSES) unit = 3;
			else unit = 1;
			setMotion(1, unit, 0, value, 0);
			pulseCallback = callback;
		} else {
			callback();
		}
	};

	ext.turtleMoveBackwardUnit = function(value, unit, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setLineTracerMode(0);
		if(value && value > 0) {
			unit = VALUES[unit];
			if(unit === SECONDS) unit = 2;
			else if(unit === PULSES) unit = 3;
			else unit = 1;
			setMotion(2, unit, 0, value, 0);
			pulseCallback = callback;
		} else {
			callback();
		}
	};

	ext.turtleTurnUnitInPlace = function(direction, value, unit, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setLineTracerMode(0);
		if(value && value > 0) {
			unit = VALUES[unit];
			if(unit === SECONDS) unit = 2;
			else if(unit === PULSES) unit = 3;
			else unit = 1;
			if(VALUES[direction] === LEFT) {
				setMotion(3, unit, 0, value, 0);
			} else {
				setMotion(4, unit, 0, value, 0);
			}
			pulseCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleTurnUnitWithRadiusInDirection = function(direction, value, unit, radius, head, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setLineTracerMode(0);
		if(value && value > 0 && (typeof radius == 'number') && radius >= 0) {
			unit = VALUES[unit];
			if(unit === SECONDS) unit = 2;
			else if(unit === PULSES) unit = 3;
			else unit = 1;
			if(VALUES[direction] === LEFT) {
				if(VALUES[head] === HEAD) {
					setMotion(9, unit, 0, value, radius);
				} else {
					setMotion(10, unit, 0, value, radius);
				}
			} else {
				if(VALUES[head] === HEAD) {
					setMotion(11, unit, 0, value, radius);
				} else {
					setMotion(12, unit, 0, value, radius);
				}
			}
			pulseCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtlePivotAroundWheelUnitInDirection = function(wheel, value, unit, head, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setLineTracerMode(0);
		if(value && value > 0) {
			unit = VALUES[unit];
			if(unit === SECONDS) unit = 2;
			else if(unit === PULSES) unit = 3;
			else unit = 1;
			if(VALUES[direction] === LEFT) {
				if(VALUES[head] === HEAD) {
					setMotion(5, unit, 0, value, 0);
				} else {
					setMotion(6, unit, 0, value, 0);
				}
			} else {
				if(VALUES[head] === HEAD) {
					setMotion(7, unit, 0, value, 0);
				} else {
					setMotion(8, unit, 0, value, 0);
				}
			}
			pulseCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleChangeWheelsByLeftRight = function(left, right) {
		left = parseFloat(left);
		right = parseFloat(right);
		setPulse(0);
		setLineTracerMode(0);
		setMotion(0, 0, 0, 0, 0);
		if(typeof left == 'number') {
			motoring.leftWheel += left;
		}
		if(typeof right == 'number') {
			motoring.rightWheel += right;
		}
	};

	ext.turtleSetWheelsToLeftRight = function(left, right) {
		left = parseFloat(left);
		right = parseFloat(right);
		setPulse(0);
		setLineTracerMode(0);
		setMotion(0, 0, 0, 0, 0);
		if(typeof left == 'number') {
			motoring.leftWheel = left;
		}
		if(typeof right == 'number') {
			motoring.rightWheel = right;
		}
	};

	ext.turtleChangeWheelBy = function(wheel, speed) {
		speed = parseFloat(speed);
		setPulse(0);
		setLineTracerMode(0);
		setMotion(0, 0, 0, 0, 0);
		if(typeof speed == 'number') {
			wheel = VALUES[wheel];
			if(wheel === LEFT) {
				motoring.leftWheel += speed;
			}
			else if(wheel === RIGHT) {
				motoring.rightWheel += speed;
			}
			else {
				motoring.leftWheel += speed;
				motoring.rightWheel += speed;
			}
		}
	};

	ext.turtleSetWheelTo = function(wheel, speed) {
		speed = parseFloat(speed);
		setPulse(0);
		setLineTracerMode(0);
		setMotion(0, 0, 0, 0, 0);
		if(typeof speed == 'number') {
			wheel = VALUES[wheel];
			if(wheel === LEFT) {
				motoring.leftWheel = speed;
			} else if(wheel === RIGHT) {
				motoring.rightWheel = speed;
			} else {
				motoring.leftWheel = speed;
				motoring.rightWheel = speed;
			}
		}
	};

	ext.turtleFollowLine = function(color) {
		var mode = 10 + LINE_COLORS[color];
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
		setLineTracerMode(mode);
	};

	ext.turtleFollowLineUntil = function(color, callback) {
		var mode = 60 + LINE_COLORS[color];
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
		setLineTracerMode(mode);
		lineTracerCallback = callback;
	};
	
	ext.turtleFollowLineUntilBlack = function(color, callback) {
		var mode = 70 + LINE_COLORS[color];
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
		setLineTracerMode(mode);
		lineTracerCallback = callback;
	};
	
	ext.turtleCrossIntersection = function(callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
		setLineTracerMode(40);
		lineTracerCallback = callback;
	};
	
	ext.turtleTurnAtIntersection = function(direction, callback) {
		var mode = 20;
		direction = VALUES[direction];
		if(direction === RIGHT) mode = 30;
		else if(direction === BACK) mode = 50;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
		setLineTracerMode(mode);
		lineTracerCallback = callback;
	};

	ext.turtleSetFollowingSpeedTo = function(speed) {
		speed = parseInt(speed);
		if(typeof speed == 'number') {
			setLineTracerSpeed(speed);
			setLineTracerGain(speed);
		}
	};

	ext.turtleStop = function() {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setLineTracerMode(0);
		setMotion(0, 0, 0, 0, 0);
	};

	ext.turtleSetHeadLedTo = function(color) {
		color = RGB_COLORS[color];
		if(color) {
			motoring.ledRed = color[0];
			motoring.ledGreen = color[1];
			motoring.ledBlue = color[2];
		}
	};
	
	ext.turtleChangeHeadLedByRGB = function(red, green, blue) {
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		if(typeof red == 'number') {
			motoring.ledRed += red;
		}
		if(typeof green == 'number') {
			motoring.ledGreen += green;
		}
		if(typeof blue == 'number') {
			motoring.ledBlue += blue;
		}
	};
	
	ext.turtleSetHeadLedToRGB = function(red, green, blue) {
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		if(typeof red == 'number') {
			motoring.ledRed = red;
		}
		if(typeof green == 'number') {
			motoring.ledGreen = green;
		}
		if(typeof blue == 'number') {
			motoring.ledBlue = blue;
		}
	};

	ext.turtleClearHeadLed = function() {
		motoring.ledRed = 0;
		motoring.ledGreen = 0;
		motoring.ledBlue = 0;
	};

	ext.turtlePlaySound = function(sound) {
		sound = SOUNDS[sound];
		motoring.buzzer = 0;
		setNote(0);
		if(sound) runSound(sound);
	};
	
	ext.turtlePlaySoundTimes = function(sound, count) {
		sound = SOUNDS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		setNote(0);
		if(sound && count) {
			runSound(sound, count);
		}
	};
	
	ext.turtlePlaySoundTimesUntilDone = function(sound, count, callback) {
		sound = SOUNDS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		setNote(0);
		if(sound && count) {
			runSound(sound, count);
			soundCallback = callback;
		} else {
			callback();
		}
	};

	ext.turtleChangeBuzzerBy = function(hz) {
		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer += hz;
		}
		setNote(0);
		runSound(0);
	};

	ext.turtleSetBuzzerTo = function(hz) {
		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer = hz;
		}
		setNote(0);
		runSound(0);
	};

	ext.turtleClearSound = function() {
		motoring.buzzer = 0;
		setNote(0);
		runSound(0);
	};
	
	ext.turtlePlayNote = function(note, octave) {
		note = NOTES[note];
		octave = parseInt(octave);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octavev < 8) {
			note += (octave - 1) * 12;
			setNote(note);
		}
		runSound(0);
	};
	
	ext.turtlePlayNoteForBeats = function(note, octave, beat, callback) {
		note = NOTES[note];
		octave = parseInt(octave);
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		runSound(0);
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

	ext.turtleRestForBeats = function(beat, callback) {
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		setNote(0);
		runSound(0);
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

	ext.turtleChangeTempoBy = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			tempo += bpm;
			if(tempo < 1) tempo = 1;
		}
	};

	ext.turtleSetTempoTo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			tempo = bpm;
			if(tempo < 1) tempo = 1;
		}
	};

	ext.turtleTouchingColor = function(color) {
		return sensory.colorNumber == COLOR_NUMBERS[color];
	};

	ext.turtleIsColorPattern = function(color1, color2) {
		return colorPattern == COLOR_PATTERNS[color1] * 10 + COLOR_PATTERNS[color2];
	};

	ext.turtleButtonState = function(state) {
		state = BUTTON_STATES[state];
		if(state == 1) return clicked;
		else if(state == 2) return doubleClicked;
		else if(state == 3) return longPressed;
		return false;
	};

	ext.turtleColorNumber = function() {
		return sensory.colorNumber;
	};

	ext.turtleColorPattern = function() {
		return colorPattern;
	};

	ext.turtleFloor = function() {
		return sensory.floor;
	};

	ext.turtleButton = function() {
		return sensory.button;
	};

	ext.turtleAccelerationX = function() {
		return sensory.accelerationX;
	};

	ext.turtleAccelerationY = function() {
		return sensory.accelerationY;
	};

	ext.turtleAccelerationZ = function() {
		return sensory.accelerationZ;
	};

	ext._getStatus = function() {
		clicked = false;
		doubleClicked = false;
		longPressed = false;
		colorPattern = -1;
		
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
		url: "http://turtle.school"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
