(function(ext) {

	var robots = {};
	var packet = {
		version: 1
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
			['w', 'Turtle %n : move forward', 'turtleMoveForward', 0],
			['w', 'Turtle %n : move backward', 'turtleMoveBackward', 0],
			['w', 'Turtle %n : turn %m.left_right', 'turtleTurn', 0, 'left'],
			['-'],
			[' ', 'Turtle %n : set head led to %m.led_color', 'turtleSetHeadLedTo', 0, 'red'],
			[' ', 'Turtle %n : clear head led', 'turtleClearHeadLed', 0],
			['-'],
			[' ', 'Turtle %n : play sound %m.sound', 'turtlePlaySound', 0, 'beep'],
			[' ', 'Turtle %n : clear sound', 'turtleClearSound', 0],
			['-'],
			['b', 'Turtle %n : touching %m.touching_color ?', 'turtleTouchingColor', 0, 'red'],
			['b', 'Turtle %n : button %m.button_state ?', 'turtleButtonState', 0, 'clicked']
		],
		en2: [
			['w', 'Turtle %n : move forward %n %m.cm_sec', 'turtleMoveForwardUnit', 0, 6, 'cm'],
			['w', 'Turtle %n : move backward %n %m.cm_sec', 'turtleMoveBackwardUnit', 0, 6, 'cm'],
			['w', 'Turtle %n : turn %m.left_right %n %m.deg_sec in place', 'turtleTurnUnitInPlace', 0, 'left', 90, 'degrees'],
			['w', 'Turtle %n : turn %m.left_right %n %m.deg_sec with radius %n cm in %m.head_tail direction', 'turtleTurnUnitWithRadiusInDirection', 0, 'left', 90, 'degrees', 6, 'head'],
			['w', 'Turtle %n : pivot around %m.left_right wheel %n %m.deg_sec in %m.head_tail direction', 'turtlePivotAroundWheelUnitInDirection', 0, 'left', 90, 'degrees', 'head'],
			['-'],
			[' ', 'Turtle %n : set head led to %m.led_color', 'turtleSetHeadLedTo', 0, 'red'],
			[' ', 'Turtle %n : clear head led', 'turtleClearHeadLed', 0],
			['-'],
			[' ', 'Turtle %n : play sound %m.sound %n times', 'turtlePlaySoundTimes', 0, 'beep', 1],
			['w', 'Turtle %n : play sound %m.sound %n times until done', 'turtlePlaySoundTimesUntilDone', 0, 'beep', 1],
			[' ', 'Turtle %n : clear sound', 'turtleClearSound', 0],
			['w', 'Turtle %n : play note %m.note %m.octave for %d.beats beats', 'turtlePlayNoteForBeats', 0, 'C', '4', 0.5],
			['w', 'Turtle %n : rest for %d.beats beats', 'turtleRestForBeats', 0, 0.25],
			[' ', 'Turtle %n : change tempo by %n', 'turtleChangeTempoBy', 0, 20],
			[' ', 'Turtle %n : set tempo to %n bpm', 'turtleSetTempoTo', 0, 60],
			['-'],
			['b', 'Turtle %n : touching %m.touching_color ?', 'turtleTouchingColor', 0, 'red'],
			['b', 'Turtle %n : color pattern %m.pattern_color %m.pattern_color ?', 'turtleIsColorPattern', 0, 'red', 'yellow'],
			['b', 'Turtle %n : button %m.button_state ?', 'turtleButtonState', 0, 'clicked']
		],
		en3: [
			['w', 'Turtle %n : move forward %n %m.move_unit', 'turtleMoveForwardUnit', 0, 6, 'cm'],
			['w', 'Turtle %n : move backward %n %m.move_unit', 'turtleMoveBackwardUnit', 0, 6, 'cm'],
			['w', 'Turtle %n : turn %m.left_right %n %m.turn_unit in place', 'turtleTurnUnitInPlace', 0, 'left', 90, 'degrees'],
			['w', 'Turtle %n : turn %m.left_right %n %m.turn_unit with radius %n cm in %m.head_tail direction', 'turtleTurnUnitWithRadiusInDirection', 0, 'left', 90, 'degrees', 6, 'head'],
			['w', 'Turtle %n : pivot around %m.left_right wheel %n %m.turn_unit in %m.head_tail direction', 'turtlePivotAroundWheelUnitInDirection', 0, 'left', 90, 'degrees', 'head'],
			[' ', 'Turtle %n : change wheels by left: %n right: %n', 'turtleChangeWheelsByLeftRight', 0, 10, 10],
			[' ', 'Turtle %n : set wheels to left: %n right: %n', 'turtleSetWheelsToLeftRight', 0, 50, 50],
			[' ', 'Turtle %n : change %m.left_right_both wheel by %n', 'turtleChangeWheelBy', 0, 'left', 10],
			[' ', 'Turtle %n : set %m.left_right_both wheel to %n', 'turtleSetWheelTo', 0, 'left', 50],
			[' ', 'Turtle %n : follow %m.line_color line', 'turtleFollowLine', 0, 'black'],
			['w', 'Turtle %n : follow black line until %m.target_color', 'turtleFollowLineUntil', 0, 'red'],
			['w', 'Turtle %n : follow %m.color_line line until black', 'turtleFollowLineUntilBlack', 0, 'red'],
			['w', 'Turtle %n : cross black intersection', 'turtleCrossIntersection', 0],
			['w', 'Turtle %n : turn %m.left_right_back at black intersection', 'turtleTurnAtIntersection', 0, 'left'],
			[' ', 'Turtle %n : set following speed to %m.speed', 'turtleSetFollowingSpeedTo', 0, '5'],
			[' ', 'Turtle %n : stop', 'turtleStop', 0],
			['-'],
			[' ', 'Turtle %n : set head led to %m.led_color', 'turtleSetHeadLedTo', 0, 'red'],
			[' ', 'Turtle %n : change head led by r: %n g: %n b: %n', 'turtleChangeHeadLedByRGB', 0, 10, 0, 0],
			[' ', 'Turtle %n : set head led to r: %n g: %n b: %n', 'turtleSetHeadLedToRGB', 0, 255, 0, 0],
			[' ', 'Turtle %n : clear head led', 'turtleClearHeadLed', 0],
			['-'],
			[' ', 'Turtle %n : play sound %m.sound %n times', 'turtlePlaySoundTimes', 0, 'beep', 1],
			['w', 'Turtle %n : play sound %m.sound %n times until done', 'turtlePlaySoundTimesUntilDone', 0, 'beep', 1],
			[' ', 'Turtle %n : change buzzer by %n', 'turtleChangeBuzzerBy', 0, 10],
			[' ', 'Turtle %n : set buzzer to %n', 'turtleSetBuzzerTo', 0, 1000],
			[' ', 'Turtle %n : clear sound', 'turtleClearSound', 0],
			[' ', 'Turtle %n : play note %m.note %m.octave', 'turtlePlayNote', 0, 'C', '4'],
			['w', 'Turtle %n : play note %m.note %m.octave for %d.beats beats', 'turtlePlayNoteForBeats', 0, 'C', '4', 0.5],
			['w', 'Turtle %n : rest for %d.beats beats', 'turtleRestForBeats', 0, 0.25],
			[' ', 'Turtle %n : change tempo by %n', 'turtleChangeTempoBy', 0, 20],
			[' ', 'Turtle %n : set tempo to %n bpm', 'turtleSetTempoTo', 0, 60],
			['-'],
			['b', 'Turtle %n : touching %m.touching_color ?', 'turtleTouchingColor', 0, 'red'],
			['b', 'Turtle %n : color pattern %m.pattern_color %m.pattern_color ?', 'turtleIsColorPattern', 0, 'red', 'yellow'],
			['b', 'Turtle %n : button %m.button_state ?', 'turtleButtonState', 0, 'clicked'],
			['r', 'Turtle[0]: color number', 'turtleColorNumber0'],
			['r', 'Turtle[0]: color pattern', 'turtleColorPattern0'],
			['r', 'Turtle[0]: floor', 'turtleFloor0'],
			['r', 'Turtle[0]: button', 'turtleButton0'],
			['r', 'Turtle[0]: x acceleration', 'turtleAccelerationX0'],
			['r', 'Turtle[0]: y acceleration', 'turtleAccelerationY0'],
			['r', 'Turtle[0]: z acceleration', 'turtleAccelerationZ0'],
			['r', 'Turtle[1]: color number', 'turtleColorNumber1'],
			['r', 'Turtle[1]: color pattern', 'turtleColorPattern1'],
			['r', 'Turtle[1]: floor', 'turtleFloor1'],
			['r', 'Turtle[1]: button', 'turtleButton1'],
			['r', 'Turtle[1]: x acceleration', 'turtleAccelerationX1'],
			['r', 'Turtle[1]: y acceleration', 'turtleAccelerationY1'],
			['r', 'Turtle[1]: z acceleration', 'turtleAccelerationZ1'],
			['r', 'Turtle[2]: color number', 'turtleColorNumber2'],
			['r', 'Turtle[2]: color pattern', 'turtleColorPattern2'],
			['r', 'Turtle[2]: floor', 'turtleFloor2'],
			['r', 'Turtle[2]: button', 'turtleButton2'],
			['r', 'Turtle[2]: x acceleration', 'turtleAccelerationX2'],
			['r', 'Turtle[2]: y acceleration', 'turtleAccelerationY2'],
			['r', 'Turtle[2]: z acceleration', 'turtleAccelerationZ2'],
			['r', 'Turtle[3]: color number', 'turtleColorNumber3'],
			['r', 'Turtle[3]: color pattern', 'turtleColorPattern3'],
			['r', 'Turtle[3]: floor', 'turtleFloor3'],
			['r', 'Turtle[3]: button', 'turtleButton3'],
			['r', 'Turtle[3]: x acceleration', 'turtleAccelerationX3'],
			['r', 'Turtle[3]: y acceleration', 'turtleAccelerationY3'],
			['r', 'Turtle[3]: z acceleration', 'turtleAccelerationZ3'],
			['r', 'Turtle[4]: color number', 'turtleColorNumber4'],
			['r', 'Turtle[4]: color pattern', 'turtleColorPattern4'],
			['r', 'Turtle[4]: floor', 'turtleFloor4'],
			['r', 'Turtle[4]: button', 'turtleButton4'],
			['r', 'Turtle[4]: x acceleration', 'turtleAccelerationX4'],
			['r', 'Turtle[4]: y acceleration', 'turtleAccelerationY4'],
			['r', 'Turtle[4]: z acceleration', 'turtleAccelerationZ4'],
			['r', 'Turtle[5]: color number', 'turtleColorNumber5'],
			['r', 'Turtle[5]: color pattern', 'turtleColorPattern5'],
			['r', 'Turtle[5]: floor', 'turtleFloor5'],
			['r', 'Turtle[5]: button', 'turtleButton5'],
			['r', 'Turtle[5]: x acceleration', 'turtleAccelerationX5'],
			['r', 'Turtle[5]: y acceleration', 'turtleAccelerationY5'],
			['r', 'Turtle[5]: z acceleration', 'turtleAccelerationZ5']
		],
		ko1: [
			['w', '거북이 %n : 앞으로 이동하기', 'turtleMoveForward', 0],
			['w', '거북이 %n : 뒤로 이동하기', 'turtleMoveBackward', 0],
			['w', '거북이 %n : %m.left_right 으로 돌기', 'turtleTurn', 0, '왼쪽'],
			['-'],
			[' ', '거북이 %n : 머리 LED를 %m.led_color 으로 정하기', 'turtleSetHeadLedTo', 0, '빨간색'],
			[' ', '거북이 %n : 머리 LED 끄기', 'turtleClearHeadLed', 0],
			['-'],
			[' ', '거북이 %n : %m.sound 소리 재생하기', 'turtlePlaySound', 0, '삐'],
			[' ', '거북이 %n : 소리 끄기', 'turtleClearSound', 0],
			['-'],
			['b', '거북이 %n : %m.touching_color 에 닿았는가?', 'turtleTouchingColor', 0, '빨간색'],
			['b', '거북이 %n : 버튼을 %m.button_state ?', 'turtleButtonState', 0, '클릭했는가']
		],
		ko2: [
			['w', '거북이 %n : 앞으로 %n %m.cm_sec 이동하기', 'turtleMoveForwardUnit', 0, 6, 'cm'],
			['w', '거북이 %n : 뒤로 %n %m.cm_sec 이동하기', 'turtleMoveBackwardUnit', 0, 6, 'cm'],
			['w', '거북이 %n : %m.left_right 으로 %n %m.deg_sec 제자리 돌기', 'turtleTurnUnitInPlace', 0, '왼쪽', 90, '도'],
			['w', '거북이 %n : %m.left_right 으로 %n %m.deg_sec 반지름 %n cm를 %m.head_tail 방향으로 돌기', 'turtleTurnUnitWithRadiusInDirection', 0, '왼쪽', 90, '도', 6, '머리'],
			['w', '거북이 %n : %m.left_right 바퀴 중심으로 %n %m.deg_sec %m.head_tail 방향으로 돌기', 'turtlePivotAroundWheelUnitInDirection', 0, '왼쪽', 90, '도', '머리'],
			['-'],
			[' ', '거북이 %n : 머리 LED를 %m.led_color 으로 정하기', 'turtleSetHeadLedTo', 0, '빨간색'],
			[' ', '거북이 %n : 머리 LED 끄기', 'turtleClearHeadLed', 0],
			['-'],
			[' ', '거북이 %n : %m.sound 소리 %n 번 재생하기', 'turtlePlaySoundTimes', 0, '삐', 1],
			['w', '거북이 %n : %m.sound 소리 %n 번 재생하고 기다리기', 'turtlePlaySoundTimesUntilDone', 0, '삐', 1],
			[' ', '거북이 %n : 소리 끄기', 'turtleClearSound', 0],
			['w', '거북이 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기', 'turtlePlayNoteForBeats', 0, '도', '4', 0.5],
			['w', '거북이 %n : %d.beats 박자 쉬기', 'turtleRestForBeats', 0, 0.25],
			[' ', '거북이 %n : 연주 속도를 %n 만큼 바꾸기', 'turtleChangeTempoBy', 0, 20],
			[' ', '거북이 %n : 연주 속도를 %n BPM으로 정하기', 'turtleSetTempoTo', 0, 60],
			['-'],
			['b', '거북이 %n : %m.touching_color 에 닿았는가?', 'turtleTouchingColor', 0, '빨간색'],
			['b', '거북이 %n : 색깔 패턴이 %m.pattern_color %m.pattern_color 인가?', 'turtleIsColorPattern', 0, '빨간색', '노란색'],
			['b', '거북이 %n : 버튼을 %m.button_state ?', 'turtleButtonState', 0, '클릭했는가']
		],
		ko3: [
			['w', '거북이 %n : 앞으로 %n %m.move_unit 이동하기', 'turtleMoveForwardUnit', 0, 6, 'cm'],
			['w', '거북이 %n : 뒤로 %n %m.move_unit 이동하기', 'turtleMoveBackwardUnit', 0, 6, 'cm'],
			['w', '거북이 %n : %m.left_right 으로 %n %m.turn_unit 제자리 돌기', 'turtleTurnUnitInPlace', 0, '왼쪽', 90, '도'],
			['w', '거북이 %n : %m.left_right 으로 %n %m.turn_unit 반지름 %n cm를 %m.head_tail 방향으로 돌기', 'turtleTurnUnitWithRadiusInDirection', 0, '왼쪽', 90, '도', 6, '머리'],
			['w', '거북이 %n : %m.left_right 바퀴 중심으로 %n %m.turn_unit %m.head_tail 방향으로 돌기', 'turtlePivotAroundWheelUnitInDirection', 0, '왼쪽', 90, '도', '머리'],
			[' ', '거북이 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기', 'turtleChangeWheelsByLeftRight', 0, 10, 10],
			[' ', '거북이 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기', 'turtleSetWheelsToLeftRight', 0, 50, 50],
			[' ', '거북이 %n : %m.left_right_both 바퀴 %n 만큼 바꾸기', 'turtleChangeWheelBy', 0, '왼쪽', 10],
			[' ', '거북이 %n : %m.left_right_both 바퀴 %n (으)로 정하기', 'turtleSetWheelTo', 0, '왼쪽', 50],
			[' ', '거북이 %n : %m.line_color 선을 따라가기', 'turtleFollowLine', 0, '검은색'],
			['w', '거북이 %n : 검은색 선을 따라 %m.target_color 까지 이동하기', 'turtleFollowLineUntil', 0, '빨간색'],
			['w', '거북이 %n : %m.color_line 선을 따라 검은색까지 이동하기', 'turtleFollowLineUntilBlack', 0, '빨간색'],
			['w', '거북이 %n : 검은색 교차로 건너가기', 'turtleCrossIntersection', 0],
			['w', '거북이 %n : 검은색 교차로에서 %m.left_right_back 으로 돌기', 'turtleTurnAtIntersection', 0, '왼쪽'],
			[' ', '거북이 %n : 선 따라가기 속도를 %m.speed (으)로 정하기', 'turtleSetFollowingSpeedTo', 0, '5'],
			[' ', '거북이 %n : 정지하기', 'turtleStop', 0],
			['-'],
			[' ', '거북이 %n : 머리 LED를 %m.led_color 으로 정하기', 'turtleSetHeadLedTo', 0, '빨간색'],
			[' ', '거북이 %n : 머리 LED를 R: %n G: %n B: %n 만큼 바꾸기', 'turtleChangeHeadLedByRGB', 0, 10, 0, 0],
			[' ', '거북이 %n : 머리 LED를 R: %n G: %n B: %n (으)로 정하기', 'turtleSetHeadLedToRGB', 0, 255, 0, 0],
			[' ', '거북이 %n : 머리 LED 끄기', 'turtleClearHeadLed', 0],
			['-'],
			[' ', '거북이 %n : %m.sound 소리 %n 번 재생하기', 'turtlePlaySoundTimes', 0, '삐', 1],
			['w', '거북이 %n : %m.sound 소리 %n 번 재생하고 기다리기', 'turtlePlaySoundTimesUntilDone', 0, '삐', 1],
			[' ', '거북이 %n : 버저 음을 %n 만큼 바꾸기', 'turtleChangeBuzzerBy', 0, 10],
			[' ', '거북이 %n : 버저 음을 %n (으)로 정하기', 'turtleSetBuzzerTo', 0, 1000],
			[' ', '거북이 %n : 소리 끄기', 'turtleClearSound', 0],
			[' ', '거북이 %n : %m.note %m.octave 음을 연주하기', 'turtlePlayNote', 0, '도', '4'],
			['w', '거북이 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기', 'turtlePlayNoteForBeats', 0, '도', '4', 0.5],
			['w', '거북이 %n : %d.beats 박자 쉬기', 'turtleRestForBeats', 0, 0.25],
			[' ', '거북이 %n : 연주 속도를 %n 만큼 바꾸기', 'turtleChangeTempoBy', 0, 20],
			[' ', '거북이 %n : 연주 속도를 %n BPM으로 정하기', 'turtleSetTempoTo', 0, 60],
			['-'],
			['b', '거북이 %n : %m.touching_color 에 닿았는가?', 'turtleTouchingColor', 0, '빨간색'],
			['b', '거북이 %n : 색깔 패턴이 %m.pattern_color %m.pattern_color 인가?', 'turtleIsColorPattern', 0, '빨간색', '노란색'],
			['b', '거북이 %n : 버튼을 %m.button_state ?', 'turtleButtonState', 0, '클릭했는가'],
			['r', '거북이[0]: 색깔 번호', 'turtleColorNumber0'],
			['r', '거북이[0]: 색깔 패턴', 'turtleColorPattern0'],
			['r', '거북이[0]: 바닥 센서', 'turtleFloor0'],
			['r', '거북이[0]: 버튼', 'turtleButton0'],
			['r', '거북이[0]: x축 가속도', 'turtleAccelerationX0'],
			['r', '거북이[0]: y축 가속도', 'turtleAccelerationY0'],
			['r', '거북이[0]: z축 가속도', 'turtleAccelerationZ0'],
			['r', '거북이[1]: 색깔 번호', 'turtleColorNumber1'],
			['r', '거북이[1]: 색깔 패턴', 'turtleColorPattern1'],
			['r', '거북이[1]: 바닥 센서', 'turtleFloor1'],
			['r', '거북이[1]: 버튼', 'turtleButton1'],
			['r', '거북이[1]: x축 가속도', 'turtleAccelerationX1'],
			['r', '거북이[1]: y축 가속도', 'turtleAccelerationY1'],
			['r', '거북이[1]: z축 가속도', 'turtleAccelerationZ1'],
			['r', '거북이[2]: 색깔 번호', 'turtleColorNumber2'],
			['r', '거북이[2]: 색깔 패턴', 'turtleColorPattern2'],
			['r', '거북이[2]: 바닥 센서', 'turtleFloor2'],
			['r', '거북이[2]: 버튼', 'turtleButton2'],
			['r', '거북이[2]: x축 가속도', 'turtleAccelerationX2'],
			['r', '거북이[2]: y축 가속도', 'turtleAccelerationY2'],
			['r', '거북이[2]: z축 가속도', 'turtleAccelerationZ2'],
			['r', '거북이[3]: 색깔 번호', 'turtleColorNumber3'],
			['r', '거북이[3]: 색깔 패턴', 'turtleColorPattern3'],
			['r', '거북이[3]: 바닥 센서', 'turtleFloor3'],
			['r', '거북이[3]: 버튼', 'turtleButton3'],
			['r', '거북이[3]: x축 가속도', 'turtleAccelerationX3'],
			['r', '거북이[3]: y축 가속도', 'turtleAccelerationY3'],
			['r', '거북이[3]: z축 가속도', 'turtleAccelerationZ3'],
			['r', '거북이[4]: 색깔 번호', 'turtleColorNumber4'],
			['r', '거북이[4]: 색깔 패턴', 'turtleColorPattern4'],
			['r', '거북이[4]: 바닥 센서', 'turtleFloor4'],
			['r', '거북이[4]: 버튼', 'turtleButton4'],
			['r', '거북이[4]: x축 가속도', 'turtleAccelerationX4'],
			['r', '거북이[4]: y축 가속도', 'turtleAccelerationY4'],
			['r', '거북이[4]: z축 가속도', 'turtleAccelerationZ4'],
			['r', '거북이[5]: 색깔 번호', 'turtleColorNumber5'],
			['r', '거북이[5]: 색깔 패턴', 'turtleColorPattern5'],
			['r', '거북이[5]: 바닥 센서', 'turtleFloor5'],
			['r', '거북이[5]: 버튼', 'turtleButton5'],
			['r', '거북이[5]: x축 가속도', 'turtleAccelerationX5'],
			['r', '거북이[5]: y축 가속도', 'turtleAccelerationY5'],
			['r', '거북이[5]: z축 가속도', 'turtleAccelerationZ5']
		],
		uz1: [
			['w', 'Turtle %n : oldinga yurish', 'turtleMoveForward', 0],
			['w', 'Turtle %n : orqaga yurish', 'turtleMoveBackward', 0],
			['w', 'Turtle %n : %m.left_right ga o\'girilish', 'turtleTurn', 0, 'chap'],
			['-'],
			[' ', 'Turtle %n : boshining LEDni %m.led_color ga sozlash', 'turtleSetHeadLedTo', 0, 'qizil'],
			[' ', 'Turtle %n : boshining LEDni o\'chirish', 'turtleClearHeadLed', 0],
			['-'],
			[' ', 'Turtle %n : %m.sound tovushni ijro etish', 'turtlePlaySound', 0, 'qisqa'],
			[' ', 'Turtle %n : tovushni o\'chirish', 'turtleClearSound', 0],
			['-'],
			['b', 'Turtle %n : %m.touching_color ga tekkan?', 'turtleTouchingColor', 0, 'qizil'],
			['b', 'Turtle %n : tugmani %m.button_state ?', 'turtleButtonState', 0, 'bosgan']
		],
		uz2: [
			['w', 'Turtle %n : oldinga %n %m.cm_sec yurish', 'turtleMoveForwardUnit', 0, 6, 'cm'],
			['w', 'Turtle %n : orqaga %n %m.cm_sec yurish', 'turtleMoveBackwardUnit', 0, 6, 'cm'],
			['w', 'Turtle %n : %m.left_right ga %n %m.deg_sec o\'z joyda o\'girilish', 'turtleTurnUnitInPlace', 0, 'chap', 90, 'daraja'],
			['w', 'Turtle %n : %m.left_right ga %n %m.deg_sec radius %n cm %m.head_tail yo\'nalishga o\'girilish', 'turtleTurnUnitWithRadiusInDirection', 0, 'chap', 90, 'daraja', 6, 'bosh'],
			['w', 'Turtle %n : %m.left_right g\'ildirak markaziga %n %m.deg_sec %m.head_tail yo\'nalishga o\'girilish', 'turtlePivotAroundWheelUnitInDirection', 0, 'chap', 90, 'daraja', 'bosh'],
			['-'],
			[' ', 'Turtle %n : boshining LEDni %m.led_color ga sozlash', 'turtleSetHeadLedTo', 0, 'qizil'],
			[' ', 'Turtle %n : boshining LEDni o\'chirish', 'turtleClearHeadLed', 0],
			['-'],
			[' ', 'Turtle %n : %m.sound tovushni %n marta ijro etish', 'turtlePlaySoundTimes', 0, 'qisqa', 1],
			['w', 'Turtle %n : %m.sound tovushni %n marta ijro tugaguncha kutish', 'turtlePlaySoundTimesUntilDone', 0, 'qisqa', 1],
			[' ', 'Turtle %n : tovushni o\'chirish', 'turtleClearSound', 0],
			['w', 'Turtle %n : %m.note %m.octave notani %d.beats zarb ijro etish', 'turtlePlayNoteForBeats', 0, 'do', '4', 0.5],
			['w', 'Turtle %n : %d.beats zarb tanaffus', 'turtleRestForBeats', 0, 0.25],
			[' ', 'Turtle %n : temni %n ga o\'zgartirish', 'turtleChangeTempoBy', 0, 20],
			[' ', 'Turtle %n : temni %n bpm ga sozlash', 'turtleSetTempoTo', 0, 60],
			['-'],
			['b', 'Turtle %n : %m.touching_color ga tekkan?', 'turtleTouchingColor', 0, 'qizil'],
			['b', 'Turtle %n : rang naqshi %m.pattern_color %m.pattern_color ?', 'turtleIsColorPattern', 0, 'qizil', 'sariq'],
			['b', 'Turtle %n : tugmani %m.button_state ?', 'turtleButtonState', 0, 'bosgan']
		],
		uz3: [
			['w', 'Turtle %n : oldinga %n %m.move_unit yurish', 'turtleMoveForwardUnit', 0, 6, 'cm'],
			['w', 'Turtle %n : orqaga %n %m.move_unit yurish', 'turtleMoveBackwardUnit', 0, 6, 'cm'],
			['w', 'Turtle %n : %m.left_right ga %n %m.turn_unit o\'z joyda o\'girilish', 'turtleTurnUnitInPlace', 0, 'chap', 90, 'daraja'],
			['w', 'Turtle %n : %m.left_right ga %n %m.turn_unit radius %n cm %m.head_tail yo\'nalishga o\'girilish', 'turtleTurnUnitWithRadiusInDirection', 0, 'chap', 90, 'daraja', 6, 'bosh'],
			['w', 'Turtle %n : %m.left_right g\'ildirak markaziga %n %m.turn_unit %m.head_tail yo\'nalishga o\'girilish', 'turtlePivotAroundWheelUnitInDirection', 0, 'chap', 90, 'daraja', 'bosh'],
			[' ', 'Turtle %n : chap g\'ildirakni %n o\'ng g\'ildirakni %n ga o\'zgartirish', 'turtleChangeWheelsByLeftRight', 0, 10, 10],
			[' ', 'Turtle %n : chap g\'ildirakni %n o\'ng g\'ildirakni %n ga sozlash', 'turtleSetWheelsToLeftRight', 0, 50, 50],
			[' ', 'Turtle %n : %m.left_right_both g\'ildirakni %n ga o\'zgartirish', 'turtleChangeWheelBy', 0, 'chap', 10],
			[' ', 'Turtle %n : %m.left_right_both g\'ildirakni %n ga sozlash', 'turtleSetWheelTo', 0, 'chap', 50],
			[' ', 'Turtle %n : %m.line_color chiziqqa ergashish', 'turtleFollowLine', 0, 'qora'],
			['w', 'Turtle %n : qora chiziq ustida %m.target_color gacha yurish', 'turtleFollowLineUntil', 0, 'qizil'],
			['w', 'Turtle %n : %m.color_line chiziq ustida qora gacha yurish', 'turtleFollowLineUntilBlack', 0, 'qizil'],
			['w', 'Turtle %n : qora chorrahadan o\'tib yurish', 'turtleCrossIntersection', 0],
			['w', 'Turtle %n : qora chorrahada %m.left_right_back ga o\'girilish', 'turtleTurnAtIntersection', 0, 'chap'],
			[' ', 'Turtle %n : liniyada ergashish tezligini %m.speed ga sozlash', 'turtleSetFollowingSpeedTo', 0, '5'],
			[' ', 'Turtle %n : to\'xtatish', 'turtleStop', 0],
			['-'],
			[' ', 'Turtle %n : boshining LEDni %m.led_color ga sozlash', 'turtleSetHeadLedTo', 0, 'qizil'],
			[' ', 'Turtle %n : boshining LEDni r: %n g: %n b: %n ga o\'zgartirish', 'turtleChangeHeadLedByRGB', 0, 10, 0, 0],
			[' ', 'Turtle %n : boshining LEDni r: %n g: %n b: %n ga sozlash', 'turtleSetHeadLedToRGB', 0, 255, 0, 0],
			[' ', 'Turtle %n : boshining LEDni o\'chirish', 'turtleClearHeadLed', 0],
			['-'],
			[' ', 'Turtle %n : %m.sound tovushni %n marta ijro etish', 'turtlePlaySoundTimes', 0, 'qisqa', 1],
			['w', 'Turtle %n : %m.sound tovushni %n marta ijro tugaguncha kutish', 'turtlePlaySoundTimesUntilDone', 0, 'qisqa', 1],
			[' ', 'Turtle %n : buzerning ovozini %n ga o\'zgartirish', 'turtleChangeBuzzerBy', 0, 10],
			[' ', 'Turtle %n : buzerning ovozini %n ga sozlash', 'turtleSetBuzzerTo', 0, 1000],
			[' ', 'Turtle %n : tovushni o\'chirish', 'turtleClearSound', 0],
			[' ', 'Turtle %n : %m.note %m.octave notani ijro etish', 'turtlePlayNote', 0, 'do', '4'],
			['w', 'Turtle %n : %m.note %m.octave notani %d.beats zarb ijro etish', 'turtlePlayNoteForBeats', 0, 'do', '4', 0.5],
			['w', 'Turtle %n : %d.beats zarb tanaffus', 'turtleRestForBeats', 0, 0.25],
			[' ', 'Turtle %n : temni %n ga o\'zgartirish', 'turtleChangeTempoBy', 0, 20],
			[' ', 'Turtle %n : temni %n bpm ga sozlash', 'turtleSetTempoTo', 0, 60],
			['-'],
			['b', 'Turtle %n : %m.touching_color ga tekkan?', 'turtleTouchingColor', 0, 'qizil'],
			['b', 'Turtle %n : rang naqshi %m.pattern_color %m.pattern_color ?', 'turtleIsColorPattern', 0, 'qizil', 'sariq'],
			['b', 'Turtle %n : tugmani %m.button_state ?', 'turtleButtonState', 0, 'bosgan'],
			['r', 'Turtle[0]: rang raqami', 'turtleColorNumber0'],
			['r', 'Turtle[0]: rang naqshi', 'turtleColorPattern0'],
			['r', 'Turtle[0]: taglik sensori', 'turtleFloor0'],
			['r', 'Turtle[0]: tugma', 'turtleButton0'],
			['r', 'Turtle[0]: x tezlanish', 'turtleAccelerationX0'],
			['r', 'Turtle[0]: y tezlanish', 'turtleAccelerationY0'],
			['r', 'Turtle[0]: z tezlanish', 'turtleAccelerationZ0'],
			['r', 'Turtle[1]: rang raqami', 'turtleColorNumber1'],
			['r', 'Turtle[1]: rang naqshi', 'turtleColorPattern1'],
			['r', 'Turtle[1]: taglik sensori', 'turtleFloor1'],
			['r', 'Turtle[1]: tugma', 'turtleButton1'],
			['r', 'Turtle[1]: x tezlanish', 'turtleAccelerationX1'],
			['r', 'Turtle[1]: y tezlanish', 'turtleAccelerationY1'],
			['r', 'Turtle[1]: z tezlanish', 'turtleAccelerationZ1'],
			['r', 'Turtle[2]: rang raqami', 'turtleColorNumber2'],
			['r', 'Turtle[2]: rang naqshi', 'turtleColorPattern2'],
			['r', 'Turtle[2]: taglik sensori', 'turtleFloor2'],
			['r', 'Turtle[2]: tugma', 'turtleButton2'],
			['r', 'Turtle[2]: x tezlanish', 'turtleAccelerationX2'],
			['r', 'Turtle[2]: y tezlanish', 'turtleAccelerationY2'],
			['r', 'Turtle[2]: z tezlanish', 'turtleAccelerationZ2'],
			['r', 'Turtle[3]: rang raqami', 'turtleColorNumber3'],
			['r', 'Turtle[3]: rang naqshi', 'turtleColorPattern3'],
			['r', 'Turtle[3]: taglik sensori', 'turtleFloor3'],
			['r', 'Turtle[3]: tugma', 'turtleButton3'],
			['r', 'Turtle[3]: x tezlanish', 'turtleAccelerationX3'],
			['r', 'Turtle[3]: y tezlanish', 'turtleAccelerationY3'],
			['r', 'Turtle[3]: z tezlanish', 'turtleAccelerationZ3'],
			['r', 'Turtle[4]: rang raqami', 'turtleColorNumber4'],
			['r', 'Turtle[4]: rang naqshi', 'turtleColorPattern4'],
			['r', 'Turtle[4]: taglik sensori', 'turtleFloor4'],
			['r', 'Turtle[4]: tugma', 'turtleButton4'],
			['r', 'Turtle[4]: x tezlanish', 'turtleAccelerationX4'],
			['r', 'Turtle[4]: y tezlanish', 'turtleAccelerationY4'],
			['r', 'Turtle[4]: z tezlanish', 'turtleAccelerationZ4'],
			['r', 'Turtle[5]: rang raqami', 'turtleColorNumber5'],
			['r', 'Turtle[5]: rang naqshi', 'turtleColorPattern5'],
			['r', 'Turtle[5]: taglik sensori', 'turtleFloor5'],
			['r', 'Turtle[5]: tugma', 'turtleButton5'],
			['r', 'Turtle[5]: x tezlanish', 'turtleAccelerationX5'],
			['r', 'Turtle[5]: y tezlanish', 'turtleAccelerationY5'],
			['r', 'Turtle[5]: z tezlanish', 'turtleAccelerationZ5']
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
			'move_unit': ['cm', 'soniya', 'puls'],
			'turn_unit': ['daraja', 'soniya', 'puls'],
			'head_tail': ['bosh', 'dum'],
			'left_right': ['chap', 'o\'ng'],
			'left_right_both': ['chap', 'o\'ng', 'har ikki'],
			'left_right_back': ['chap', 'o\'ng', 'orqa'],
			'line_color': ['qora', 'qizil', 'yashil', 'ko\'k', 'har qanday rang'],
			'target_color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyoh', 'har qanday rang'],
			'color_line': ['qizil', 'yashil', 'ko\'k', 'har qanday rang'],
			'touching_color': ['qizil', 'mandarin', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyoh', 'qora', 'oq'],
			'pattern_color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyoh'],
			'speed': ['1', '2', '3', '4', '5', '6', '7', '8'],
			'led_color': ['qizil', 'mandarin', 'sariq', 'yashil', 'moviy', 'ko\'k', 'binafsha', 'siyoh', 'oq'],
			'sound': ['qisqa', 'tasodifiy qisqa', 'sirena', 'motor', 'robot', 'marsh', 'tug\'ilgan kun', 'dibidibidip', 'juda yaxshi'],
			'note': ['do', 'do#', 're', 'mib', 'mi', 'fa', 'fa#', 'sol', 'sol#', 'lya', 'sib', 'si'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4'],
			'button_state': ['bosgan', 'ikki-marta-bosgan', 'uzoq-bosganmi']
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
		LINE_COLORS[tmp[4]] = 7;
		tmp = MENUS[i]['touching_color'];
		LINE_COLORS[tmp[0]] = 1;
		LINE_COLORS[tmp[2]] = 2;
		LINE_COLORS[tmp[3]] = 3;
		LINE_COLORS[tmp[4]] = 4;
		LINE_COLORS[tmp[5]] = 5;
		LINE_COLORS[tmp[6]] = 6;
		COLOR_NUMBERS[tmp[7]] = 0;
		COLOR_NUMBERS[tmp[0]] = 1;
		COLOR_NUMBERS[tmp[1]] = 2;
		COLOR_NUMBERS[tmp[2]] = 3;
		COLOR_NUMBERS[tmp[3]] = 4;
		COLOR_NUMBERS[tmp[4]] = 5;
		COLOR_NUMBERS[tmp[5]] = 6;
		COLOR_NUMBERS[tmp[6]] = 7;
		COLOR_NUMBERS[tmp[8]] = 8;
		COLOR_PATTERNS[tmp[0]] = 1;
		COLOR_PATTERNS[tmp[2]] = 3;
		COLOR_PATTERNS[tmp[3]] = 4;
		COLOR_PATTERNS[tmp[4]] = 5;
		COLOR_PATTERNS[tmp[5]] = 6;
		COLOR_PATTERNS[tmp[6]] = 7;
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

	function getRobot(index) {
		var robot = robots[index];
		if(!robot) {
			robot = {};
			robot.sensory = {
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
			robot.motoring = {
				module: 'turtle',
				index: index,
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
			robot.pulseCallback = undefined;
			robot.soundId = 0;
			robot.soundRepeat = 1;
			robot.soundCallback = undefined;
			robot.lineTracerCallback = undefined;
			robot.clicked = false;
			robot.doubleClicked = false;
			robot.longPressed = false;
			robot.colorPattern = -1;
			robot.tempo = 60;
			robot.reset = function() {
				var motoring = robot.motoring;
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
				
				robot.pulseCallback = undefined;
				robot.soundId = 0;
				robot.soundRepeat = 1;
				robot.soundCallback = undefined;
				robot.lineTracerCallback = undefined;
				robot.clicked = false;
				robot.doubleClicked = false;
				robot.longPressed = false;
				robot.colorPattern = -1;
				robot.tempo = 60;
			};
			robot.clearMotoring = function() {
				robot.motoring.map = 0xf8000000;
			};
			robot.clearEvent = function() {
				robot.clicked = false;
				robot.doubleClicked = false;
				robot.longPressed = false;
				robot.colorPattern = -1;
			};
			robots[index] = robot;
			packet['turtle' + index] = robot.motoring;
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
	
	function setPulse(robot, pulse) {
		var motoring = robot.motoring;
		motoring.pulse = pulse;
		motoring.map |= 0x04000000;
	}
	
	function setNote(robot, note) {
		var motoring = robot.motoring;
		motoring.note = note;
		motoring.map |= 0x02000000;
	}
	
	function setSound(robot, sound) {
		var motoring = robot.motoring;
		motoring.sound = sound;
		motoring.map |= 0x01000000;
	}

	function setLineTracerMode(robot, mode) {
		var motoring = robot.motoring;
		motoring.lineTracerMode = mode;
		motoring.map |= 0x00800000;
	}
	
	function setLineTracerGain(robot, gain) {
		var motoring = robot.motoring;
		motoring.lineTracerGain = gain;
		motoring.map |= 0x00400000;
	}
	
	function setLineTracerSpeed(robot, speed) {
		var motoring = robot.motoring;
		motoring.lineTracerSpeed = speed;
		motoring.map |= 0x00200000;
	}
	
	function setMotion(robot, type, unit, speed, value, radius) {
		var motoring = robot.motoring;
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map |= 0x00040000;
	}
	
	function runSound(robot, sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			robot.soundId = sound;
			robot.soundRepeat = count;
			setSound(robot, sound);
		}
	}

	function reset() {
		for(var i in robots) {
			robots[i].reset();
		}
		removeAllTimeouts();
	}
	
	function handleSensory(robot) {
		var sensory = robot.sensory;
		if(sensory.map & 0x00000800) robot.clicked = true;
		if(sensory.map & 0x00000400) robot.doubleClicked = true;
		if(sensory.map & 0x00000200) robot.longPressed = true;
		if(sensory.map & 0x00000080) robot.colorPattern = sensory.colorPattern;
		
		if(robot.lineTracerCallback) {
			if(sensory.map & 0x00000008) {
				if(sensory.lineTracerState == 0x02) {
					setLineTracerMode(robot, 0);
					var callback = robot.lineTracerCallback;
					robot.lineTracerCallback = undefined;
					if(callback) callback();
				}
			}
		}
		if(robot.pulseCallback) {
			if(sensory.map & 0x00000020) {
				if(sensory.wheelState == 0) {
					robot.motoring.leftWheel = 0;
					robot.motoring.rightWheel = 0;
					var callback = robot.pulseCallback;
					robot.pulseCallback = undefined;
					if(callback) callback();
				}
			}
		}
		if(sensory.map & 0x00000010) {
			if(sensory.soundState == 0) {
				if(robot.soundId > 0) {
					if(robot.soundRepeat < 0) {
						runSound(robot, robot.soundId, -1);
					} else if(robot.soundRepeat > 1) {
						robot.soundRepeat --;
						runSound(robot, robot.soundId, robot.soundRepeat);
					} else {
						robot.soundId = 0;
						robot.soundRepeat = 1;
						var callback = robot.soundCallback;
						robot.soundCallback = undefined;
						if(callback) callback();
					}
				} else {
					robot.soundId = 0;
					robot.soundRepeat = 1;
					var callback = robot.soundCallback;
					robot.soundCallback = undefined;
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
					var slaveVersion = 1;
					var decode = function(data) {
						if(data.module == 'turtle' && data.index >= 0) {
							var robot = getRobot(data.index);
							if(robot) {
								robot.sensory = data;
								handleSensory(robot);
							}
						}
					};
					sock.onmessage = function(message) {
						try {
							var received = JSON.parse(message.data);
							slaveVersion = received.version || 0;
							if(received.type == 0) {
								if(received.module == 'turtle') {
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
	
	ext.turtleMoveForward = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			setMotion(robot, 1, 1, 0, LEVEL1_MOVE_CM, 0);
			robot.pulseCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleMoveBackward = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			setMotion(robot, 2, 1, 0, LEVEL1_MOVE_CM, 0);
			robot.pulseCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleTurn = function(index, direction, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			if(VALUES[direction] === LEFT) {
				setMotion(robot, 3, 1, 0, LEVEL1_TURN_DEG, 0);
			} else {
				setMotion(robot, 4, 1, 0, LEVEL1_TURN_DEG, 0);
			}
			robot.pulseCallback = callback;
		} else {
			callback();
		}
	};

	ext.turtleMoveForwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				setMotion(robot, 1, unit, 0, value, 0);
				robot.pulseCallback = callback;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.turtleMoveBackwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				setMotion(robot, 2, unit, 0, value, 0);
				robot.pulseCallback = callback;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.turtleTurnUnitInPlace = function(index, direction, value, unit, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				if(VALUES[direction] === LEFT) {
					setMotion(robot, 3, unit, 0, value, 0);
				} else {
					setMotion(robot, 4, unit, 0, value, 0);
				}
				robot.pulseCallback = callback;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};
	
	ext.turtleTurnUnitWithRadiusInDirection = function(index, direction, value, unit, radius, head, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			if(value && value > 0 && (typeof radius == 'number') && radius >= 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				if(VALUES[direction] === LEFT) {
					if(VALUES[head] === HEAD) {
						setMotion(robot, 9, unit, 0, value, radius);
					} else {
						setMotion(robot, 10, unit, 0, value, radius);
					}
				} else {
					if(VALUES[head] === HEAD) {
						setMotion(robot, 11, unit, 0, value, radius);
					} else {
						setMotion(robot, 12, unit, 0, value, radius);
					}
				}
				robot.pulseCallback = callback;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};
	
	ext.turtlePivotAroundWheelUnitInDirection = function(index, wheel, value, unit, head, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				if(VALUES[wheel] === LEFT) {
					if(VALUES[head] === HEAD) {
						setMotion(robot, 5, unit, 0, value, 0);
					} else {
						setMotion(robot, 6, unit, 0, value, 0);
					}
				} else {
					if(VALUES[head] === HEAD) {
						setMotion(robot, 7, unit, 0, value, 0);
					} else {
						setMotion(robot, 8, unit, 0, value, 0);
					}
				}
				robot.pulseCallback = callback;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};
	
	ext.turtleChangeWheelsByLeftRight = function(index, left, right) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			left = parseFloat(left);
			right = parseFloat(right);
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
			if(typeof left == 'number') {
				motoring.leftWheel += left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel += right;
			}
		}
	};

	ext.turtleSetWheelsToLeftRight = function(index, left, right) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			left = parseFloat(left);
			right = parseFloat(right);
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
			if(typeof left == 'number') {
				motoring.leftWheel = left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel = right;
			}
		}
	};

	ext.turtleChangeWheelBy = function(index, wheel, speed) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseFloat(speed);
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
			if(typeof speed == 'number') {
				wheel = VALUES[wheel];
				if(wheel === LEFT) {
					motoring.leftWheel += speed;
				} else if(wheel === RIGHT) {
					motoring.rightWheel += speed;
				} else {
					motoring.leftWheel += speed;
					motoring.rightWheel += speed;
				}
			}
		}
	};

	ext.turtleSetWheelTo = function(index, wheel, speed) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseFloat(speed);
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
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
		}
	};

	ext.turtleFollowLine = function(index, color) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var mode = 10 + LINE_COLORS[color];
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
			setLineTracerMode(robot, mode);
		}
	};

	ext.turtleFollowLineUntil = function(index, color, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var mode = 60 + LINE_COLORS[color];
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
			setLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleFollowLineUntilBlack = function(index, color, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var mode = 70 + LINE_COLORS[color];
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
			setLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleCrossIntersection = function(index, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
			setLineTracerMode(robot, 40);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleTurnAtIntersection = function(index, direction, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			var mode = 20;
			direction = VALUES[direction];
			if(direction === RIGHT) mode = 30;
			else if(direction === BACK) mode = 50;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
			setLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};

	ext.turtleSetFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(index);
		if(robot) {
			speed = parseInt(speed);
			if(typeof speed == 'number') {
				setLineTracerSpeed(robot, speed);
				setLineTracerGain(robot, speed);
			}
		}
	};

	ext.turtleStop = function(index) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setPulse(robot, 0);
			setLineTracerMode(robot, 0);
			setMotion(robot, 0, 0, 0, 0, 0);
		}
	};

	ext.turtleSetHeadLedTo = function(index, color) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			color = RGB_COLORS[color];
			if(color) {
				motoring.ledRed = color[0];
				motoring.ledGreen = color[1];
				motoring.ledBlue = color[2];
			}
		}
	};
	
	ext.turtleChangeHeadLedByRGB = function(index, red, green, blue) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
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
		}
	};
	
	ext.turtleSetHeadLedToRGB = function(index, red, green, blue) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
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
		}
	};

	ext.turtleClearHeadLed = function(index) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.ledRed = 0;
			motoring.ledGreen = 0;
			motoring.ledBlue = 0;
		}
	};

	ext.turtlePlaySound = function(index, sound) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			sound = SOUNDS[sound];
			motoring.buzzer = 0;
			setNote(robot, 0);
			if(sound) runSound(robot, sound);
		}
	};
	
	ext.turtlePlaySoundTimes = function(index, sound, count) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			sound = SOUNDS[sound];
			count = parseInt(count);
			motoring.buzzer = 0;
			setNote(robot, 0);
			if(sound && count) {
				runSound(robot, sound, count);
			}
		}
	};
	
	ext.turtlePlaySoundTimesUntilDone = function(index, sound, count, callback) {
		var robot = getRobot(index);
		if(robot) {
			var motoring = robot.motoring;
			sound = SOUNDS[sound];
			count = parseInt(count);
			motoring.buzzer = 0;
			setNote(robot, 0);
			if(sound && count) {
				runSound(robot, sound, count);
				robot.soundCallback = callback;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.turtleChangeBuzzerBy = function(index, hz) {
		var robot = getRobot(index);
		if(robot) {
			hz = parseFloat(hz);
			if(typeof hz == 'number') {
				robot.motoring.buzzer += hz;
			}
			setNote(robot, 0);
			runSound(robot, 0);
		}
	};

	ext.turtleSetBuzzerTo = function(index, hz) {
		var robot = getRobot(index);
		if(robot) {
			hz = parseFloat(hz);
			if(typeof hz == 'number') {
				robot.motoring.buzzer = hz;
			}
			setNote(robot, 0);
			runSound(robot, 0);
		}
	};

	ext.turtleClearSound = function(index) {
		var robot = getRobot(index);
		if(robot) {
			robot.motoring.buzzer = 0;
			setNote(robot, 0);
			runSound(robot, 0);
		}
	};
	
	ext.turtlePlayNote = function(index, note, octave) {
		var robot = getRobot(index);
		if(robot) {
			note = NOTES[note];
			octave = parseInt(octave);
			robot.motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8) {
				note += (octave - 1) * 12;
				setNote(robot, note);
			}
			runSound(robot, 0);
		}
	};
	
	ext.turtlePlayNoteForBeats = function(index, note, octave, beat, callback) {
		var robot = getRobot(index);
		if(robot) {
			note = NOTES[note];
			octave = parseInt(octave);
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			robot.motoring.buzzer = 0;
			runSound(robot, 0);
			if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && robot.tempo > 0) {
				note += (octave - 1) * 12;
				setNote(robot, note);
				var timeout = beat * 60 * 1000 / robot.tempo;
				var tail = 0;
				if(timeout > 100) {
					tail = 100;
				}
				if(tail > 0) {
					var timer1 = setTimeout(function() {
						setNote(robot, 0);
						removeTimeout(timer1);
					}, timeout - tail);
					timeouts.push(timer1);
				}
				var timer2 = setTimeout(function() {
					setNote(robot, 0);
					removeTimeout(timer2);
					callback();
				}, timeout);
				timeouts.push(timer2);
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.turtleRestForBeats = function(index, beat, callback) {
		var robot = getRobot(index);
		if(robot) {
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			robot.motoring.buzzer = 0;
			setNote(robot, 0);
			runSound(robot, 0);
			if(beat && beat > 0 && robot.tempo > 0) {
				var timer = setTimeout(function() {
					removeTimeout(timer);
					callback();
				}, beat * 60 * 1000 / robot.tempo);
				timeouts.push(timer);
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.turtleChangeTempoBy = function(index, bpm) {
		var robot = getRobot(index);
		if(robot) {
			bpm = parseFloat(bpm);
			if(typeof bpm == 'number') {
				robot.tempo += bpm;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		}
	};

	ext.turtleSetTempoTo = function(index, bpm) {
		var robot = getRobot(index);
		if(robot) {
			bpm = parseFloat(bpm);
			if(typeof bpm == 'number') {
				robot.tempo = bpm;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		}
	};

	ext.turtleTouchingColor = function(index, color) {
		var robot = getRobot(index);
		if(robot) return robot.sensory.colorNumber == COLOR_NUMBERS[color];
		return false;
	};

	ext.turtleIsColorPattern = function(index, color1, color2) {
		var robot = getRobot(index);
		if(robot) return robot.colorPattern == COLOR_PATTERNS[color1] * 10 + COLOR_PATTERNS[color2];
		return false;
	};

	ext.turtleButtonState = function(index, state) {
		var robot = getRobot(index);
		if(robot) {
			state = BUTTON_STATES[state];
			if(state == 1) return robot.clicked;
			else if(state == 2) return robot.doubleClicked;
			else if(state == 3) return robot.longPressed;
		}
		return false;
	};

	ext.turtleColorNumber0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ0 = function() {
		var robot = getRobot(0);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ1 = function() {
		var robot = getRobot(1);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ2 = function() {
		var robot = getRobot(2);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ3 = function() {
		var robot = getRobot(3);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ4 = function() {
		var robot = getRobot(4);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ5 = function() {
		var robot = getRobot(5);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
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
		url: "http://turtle.school"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
