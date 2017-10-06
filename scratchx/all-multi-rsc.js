(function(ext) {

	var robots = {};
	var packet = {
		version: 1,
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
	const HAMSTER = 'hamster';
	const TURTLE = 'turtle';
	const ZERO_WHEELS = { left: 0, right: 0 };
	const STRAIGHT_SPEED = 50;
	const MINIMUM_WHEEL_SPEED = 18;
	const GAIN_BASE_SPEED = 2.0;
	const MAX_BASE_SPEED = 50;
	const GAIN_POSITION = 70;
	const GAIN_ANGLE = 50;
	const PI_2 = 2 * Math.PI;
	var connectionState = 1;
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
		en: 'Robot',
		ko: '로봇',
		uz: 'Robot'
	};
	const BLOCKS = {
		en1: [
			['w', 'Hamster %n : move forward once on board', 'boardMoveForward', 0],
			['w', 'Hamster %n : turn %m.left_right once on board', 'boardTurn', 0, 'left'],
			['-'],
			['w', 'Hamster %n : move forward 1 sec', 'moveForward', 0],
			['w', 'Hamster %n : move backward 1 sec', 'moveBackward', 0],
			['w', 'Hamster %n : turn %m.left_right 1 sec', 'turn', 0, 'left'],
			['-'],
			[' ', 'Hamster %n : set %m.left_right_both led to %m.color', 'setLedTo', 0, 'left', 'red'],
			[' ', 'Hamster %n : clear %m.left_right_both led', 'clearLed', 0, 'left'],
			['-'],
			['w', 'Hamster %n : beep', 'beep', 0],
			['-'],
			['b', 'Hamster[0]: hand found?', 'handFound0'],
			['b', 'Hamster[1]: hand found?', 'handFound1'],
			['b', 'Hamster[2]: hand found?', 'handFound2'],
			['b', 'Hamster[3]: hand found?', 'handFound3'],
			['b', 'Hamster[4]: hand found?', 'handFound4'],
			['b', 'Hamster[5]: hand found?', 'handFound5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
			['b', 'Hamster[0]: hand found?', 'handFound0'],
			['b', 'Hamster[1]: hand found?', 'handFound1'],
			['b', 'Hamster[2]: hand found?', 'handFound2'],
			['b', 'Hamster[3]: hand found?', 'handFound3'],
			['b', 'Hamster[4]: hand found?', 'handFound4'],
			['b', 'Hamster[5]: hand found?', 'handFound5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
			['-'],
			[' ', 'Hamster %n : set port %m.port to %m.mode', 'setPortTo', 0, 'A', 'analog input'],
			[' ', 'Hamster %n : change output %m.port by %n', 'changeOutputBy', 0, 'A', 10],
			[' ', 'Hamster %n : set output %m.port to %n', 'setOutputTo', 0, 'A', 100],
			['w', 'Hamster %n : %m.open_close gripper', 'gripper', 0, 'open'],
			[' ', 'Hamster %n : clear gripper', 'clearGripper', 0],
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
			['r', 'Hamster[5]: input B', 'inputB5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
		en4: [
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
			['-'],
			[' ', 'Hamster %n : set port %m.port to %m.mode', 'setPortTo', 0, 'A', 'analog input'],
			[' ', 'Hamster %n : change output %m.port by %n', 'changeOutputBy', 0, 'A', 10],
			[' ', 'Hamster %n : set output %m.port to %n', 'setOutputTo', 0, 'A', 100],
			['w', 'Hamster %n : %m.open_close gripper', 'gripper', 0, 'open'],
			[' ', 'Hamster %n : clear gripper', 'clearGripper', 0],
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
			['r', 'Hamster[5]: input B', 'inputB5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
			['r', 'Turtle[5]: z acceleration', 'turtleAccelerationZ5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
			['w', 'connect to ip: %s port: %n as %s', 'connectToIpPortAs', '127.0.0.1', 60000, 'name'],
			[' ', 'send %s to %s', 'sendTo', 'message', 'receiver'],
			[' ', 'broadcast %s', 'broadcast', 'message'],
			['b', '%s received?', 'messageReceived', 'message'],
			['-'],
			[' ', '%m.robots %n : set robot\'s marker to %n', 'setRobotMarkerTo', 'Hamster', 0, 0],
			['w', '%m.robots %n : move %m.forward_backward to x: %n y: %n', 'moveToXY', 'Hamster', 0, 'forward', 320, 240],
			['w', '%m.robots %n : turn in direction of x: %n y: %n', 'turnInDirectionOfXY', 'Hamster', 0, 320, 240],
			['w', '%m.robots %n : turn in direction of %n degrees', 'turnInDirectionOfDegrees', 'Hamster', 0, 90],
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
			['w', '햄스터 %n : 말판 앞으로 한 칸 이동하기', 'boardMoveForward', 0],
			['w', '햄스터 %n : 말판 %m.left_right 으로 한 번 돌기', 'boardTurn', 0, '왼쪽'],
			['-'],
			['w', '햄스터 %n : 앞으로 1초 이동하기', 'moveForward', 0],
			['w', '햄스터 %n : 뒤로 1초 이동하기', 'moveBackward', 0],
			['w', '햄스터 %n : %m.left_right 으로 1초 돌기', 'turn', 0, '왼쪽'],
			['-'],
			[' ', '햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기', 'setLedTo', 0, '왼쪽', '빨간색'],
			[' ', '햄스터 %n : %m.left_right_both LED 끄기', 'clearLed', 0, '왼쪽'],
			['-'],
			['w', '햄스터 %n : 삐 소리내기', 'beep', 0],
			['-'],
			['b', '햄스터[0]: 손 찾음?', 'handFound0'],
			['b', '햄스터[1]: 손 찾음?', 'handFound1'],
			['b', '햄스터[2]: 손 찾음?', 'handFound2'],
			['b', '햄스터[3]: 손 찾음?', 'handFound3'],
			['b', '햄스터[4]: 손 찾음?', 'handFound4'],
			['b', '햄스터[5]: 손 찾음?', 'handFound5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
			['b', '햄스터[0]: 손 찾음?', 'handFound0'],
			['b', '햄스터[1]: 손 찾음?', 'handFound1'],
			['b', '햄스터[2]: 손 찾음?', 'handFound2'],
			['b', '햄스터[3]: 손 찾음?', 'handFound3'],
			['b', '햄스터[4]: 손 찾음?', 'handFound4'],
			['b', '햄스터[5]: 손 찾음?', 'handFound5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
			['-'],
			[' ', '햄스터 %n : 포트 %m.port 를 %m.mode 으로 정하기', 'setPortTo', 0, 'A', '아날로그 입력'],
			[' ', '햄스터 %n : 출력 %m.port 를 %n 만큼 바꾸기', 'changeOutputBy', 0, 'A', 10],
			[' ', '햄스터 %n : 출력 %m.port 를 %n (으)로 정하기', 'setOutputTo', 0, 'A', 100],
			['w', '햄스터 %n : 집게 %m.open_close', 'gripper', 0, '열기'],
			[' ', '햄스터 %n : 집게 끄기', 'clearGripper', 0],
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
			['r', '햄스터[5]: 입력 B', 'inputB5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
		ko4: [
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
			['-'],
			[' ', '햄스터 %n : 포트 %m.port 를 %m.mode 으로 정하기', 'setPortTo', 0, 'A', '아날로그 입력'],
			[' ', '햄스터 %n : 출력 %m.port 를 %n 만큼 바꾸기', 'changeOutputBy', 0, 'A', 10],
			[' ', '햄스터 %n : 출력 %m.port 를 %n (으)로 정하기', 'setOutputTo', 0, 'A', 100],
			['w', '햄스터 %n : 집게 %m.open_close', 'gripper', 0, '열기'],
			[' ', '햄스터 %n : 집게 끄기', 'clearGripper', 0],
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
			['r', '햄스터[5]: 입력 B', 'inputB5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
			['r', '거북이[5]: z축 가속도', 'turtleAccelerationZ5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
			['w', '주소 %s 포트 %n 에 %s (으)로 연결하기', 'connectToIpPortAs', '127.0.0.1', 60000, '이름'],
			[' ', '%s 을(를) %s 에게 보내기', 'sendTo', '메시지', '받는 사람'],
			[' ', '%s 을(를) 모두에게 보내기', 'broadcast', '메시지'],
			['b', '%s 을(를) 받았는가?', 'messageReceived', '메시지'],
			['-'],
			[' ', '%m.robots %n : 로봇의 마커를 %n (으)로 정하기', 'setRobotMarkerTo', '햄스터', 0, 0],
			['w', '%m.robots %n : %m.forward_backward x %n y %n 위치로 이동하기', 'moveToXY', '햄스터', 0, '앞으로', 320, 240],
			['w', '%m.robots %n : x %n y %n 방향으로 돌기', 'turnInDirectionOfXY', '햄스터', 0, 320, 240],
			['w', '%m.robots %n : %n 도 방향으로 돌기', 'turnInDirectionOfDegrees', '햄스터', 0, 90],
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
			['w', 'Hamster %n : doskada bir marta oldinga yurish', 'boardMoveForward', 0],
			['w', 'Hamster %n : doskada bir marta %m.left_right ga o\'girish', 'boardTurn', 0, 'chap'],
			['-'],
			['w', 'Hamster %n : oldinga 1 soniya yurish', 'moveForward', 0],
			['w', 'Hamster %n : orqaga 1 soniya yurish', 'moveBackward', 0],
			['w', 'Hamster %n : %m.left_right ga 1 soniya o\'girilish', 'turn', 0, 'chap'],
			['-'],
			[' ', 'Hamster %n : %m.left_right_both LEDni %m.color ga sozlash', 'setLedTo', 0, 'chap', 'qizil'],
			[' ', 'Hamster %n : %m.left_right_both LEDni o\'chirish', 'clearLed', 0, 'chap'],
			['-'],
			['w', 'Hamster %n : ovoz chiqarish', 'beep', 0],
			['-'],
			['b', 'Hamster[0]: qo\'l topildimi?', 'handFound0'],
			['b', 'Hamster[1]: qo\'l topildimi?', 'handFound1'],
			['b', 'Hamster[2]: qo\'l topildimi?', 'handFound2'],
			['b', 'Hamster[3]: qo\'l topildimi?', 'handFound3'],
			['b', 'Hamster[4]: qo\'l topildimi?', 'handFound4'],
			['b', 'Hamster[5]: qo\'l topildimi?', 'handFound5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
			['b', 'Hamster[0]: qo\'l topildimi?', 'handFound0'],
			['b', 'Hamster[1]: qo\'l topildimi?', 'handFound1'],
			['b', 'Hamster[2]: qo\'l topildimi?', 'handFound2'],
			['b', 'Hamster[3]: qo\'l topildimi?', 'handFound3'],
			['b', 'Hamster[4]: qo\'l topildimi?', 'handFound4'],
			['b', 'Hamster[5]: qo\'l topildimi?', 'handFound5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
			['-'],
			[' ', 'Hamster %n : %m.port portni %m.mode ga sozlash', 'setPortTo', 0, 'A', 'analog kiritish'],
			[' ', 'Hamster %n : %m.port portni %n ga o\'zgartirish', 'changeOutputBy', 0, 'A', 10],
			[' ', 'Hamster %n : %m.port portni %n ga sozlash', 'setOutputTo', 0, 'A', 100],
			['w', 'Hamster %n : gripperni %m.open_close', 'gripper', 0, 'oching'],
			[' ', 'Hamster %n : gripperni o\'chirish', 'clearGripper', 0],
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
			['r', 'Hamster[5]: B kirish', 'inputB5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
		],
		uz4: [
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
			['-'],
			[' ', 'Hamster %n : %m.port portni %m.mode ga sozlash', 'setPortTo', 0, 'A', 'analog kiritish'],
			[' ', 'Hamster %n : %m.port portni %n ga o\'zgartirish', 'changeOutputBy', 0, 'A', 10],
			[' ', 'Hamster %n : %m.port portni %n ga sozlash', 'setOutputTo', 0, 'A', 100],
			['w', 'Hamster %n : gripperni %m.open_close', 'gripper', 0, 'oching'],
			[' ', 'Hamster %n : gripperni o\'chirish', 'clearGripper', 0],
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
			['r', 'Hamster[5]: B kirish', 'inputB5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
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
			['r', 'Turtle[5]: z tezlanish', 'turtleAccelerationZ5'],
			['-'],
			['-'],
			['-'],
			['-'],
			['-'],
			['w', 'ip: %s port: %n ga %s sifatida ulang', 'connectToIpPortAs', '127.0.0.1', 60000, 'nomi'],
			[' ', '%s ni %s ga yuboring', 'sendTo', 'xabar', 'qabul qiluvchi'],
			[' ', '%s ni hammaga yuboring', 'broadcast', 'xabar'],
			['b', '%s ni qabul qiling?', 'messageReceived', 'xabar'],
			['-'],
			[' ', '%m.robots %n : robotning markerini %n ga sozlash', 'setRobotMarkerTo', 'Hamster', 0, 0],
			['w', '%m.robots %n : %m.forward_backward x: %n y: %n tomonga yurish', 'moveToXY', 'Hamster', 0, 'oldinga', 320, 240],
			['w', '%m.robots %n : x: %n y: %n tomonga o\'girilish', 'turnInDirectionOfXY', 'Hamster', 0, 320, 240],
			['w', '%m.robots %n : %n daraja tomonga o\'girilish', 'turnInDirectionOfDegrees', 'Hamster', 0, 90],
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
			'robots': ['Hamster', 'Turtle'],
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
			'cm_sec': ['cm', 'seconds'],
			'deg_sec': ['degrees', 'seconds'],
			'move_unit': ['cm', 'seconds', 'pulses'],
			'turn_unit': ['degrees', 'seconds', 'pulses'],
			'head_tail': ['head', 'tail'],
			'left_right_back': ['left', 'right', 'back'],
			'line_color': ['black', 'red', 'green', 'blue', 'any color'],
			'target_color': ['red', 'yellow', 'green', 'sky blue', 'blue', 'purple', 'any color'],
			'color_line': ['red', 'green', 'blue', 'any color'],
			'touching_color': ['red', 'orange', 'yellow', 'green', 'sky blue', 'blue', 'purple', 'black', 'white'],
			'pattern_color': ['red', 'yellow', 'green', 'sky blue', 'blue', 'purple'],
			'led_color': ['red', 'orange', 'yellow', 'green', 'sky blue', 'blue', 'violet', 'purple', 'white'],
			'sound': ['beep', 'random beep', 'siren', 'engine', 'robot', 'march', 'birthday', 'dibidibidip', 'good job'],
			'button_state': ['clicked', 'double-clicked', 'long-pressed'],
			'camera_color': ['red', 'yellow', 'green', 'sky-blue', 'blue', 'purple'],
			'color_position': ['x-position', 'y-position', 'left-position', 'right-position', 'top-position', 'bottom-position', 'width', 'height', 'area'],
			'marker_position': ['x-position', 'y-position', 'left-position', 'right-position', 'top-position', 'bottom-position', 'orientation', 'width', 'height', 'area']
		},
		ko: {
			'robots': ['햄스터', '거북이'],
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
			'cm_sec': ['cm', '초'],
			'deg_sec': ['도', '초'],
			'move_unit': ['cm', '초', '펄스'],
			'turn_unit': ['도', '초', '펄스'],
			'head_tail': ['머리', '꼬리'],
			'left_right_back': ['왼쪽', '오른쪽', '뒤쪽'],
			'line_color': ['검은색', '빨간색', '초록색', '파란색', '아무 색'],
			'target_color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '자주색', '아무 색'],
			'color_line': ['빨간색', '초록색', '파란색', '아무 색'],
			'touching_color': ['빨간색', '주황색', '노란색', '초록색', '하늘색', '파란색', '자주색', '검은색', '하얀색'],
			'pattern_color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '자주색'],
			'led_color': ['빨간색', '주황색', '노란색', '초록색', '하늘색', '파란색', '보라색', '자주색', '하얀색'],
			'sound': ['삐', '무작위 삐', '사이렌', '엔진', '로봇', '행진', '생일', '디비디비딥', '잘 했어요'],
			'button_state': ['클릭했는가', '더블클릭했는가', '길게~눌렀는가'],
			'camera_color': ['빨간색', '노란색', '초록색', '하늘색', '파란색', '자주색'],
			'color_position': ['x-좌표', 'y-좌표', '왼쪽-좌표', '오른쪽-좌표', '위쪽-좌표', '아래쪽-좌표', '폭', '높이', '넓이'],
			'marker_position': ['x-좌표', 'y-좌표', '왼쪽-좌표', '오른쪽-좌표', '위쪽-좌표', '아래쪽-좌표', '방향', '폭', '높이', '넓이']
		},
		uz: {
			'robots': ['Hamster', 'Turtle'],
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
			'cm_sec': ['cm', 'soniya'],
			'deg_sec': ['daraja', 'soniya'],
			'move_unit': ['cm', 'soniya', 'puls'],
			'turn_unit': ['daraja', 'soniya', 'puls'],
			'head_tail': ['bosh', 'dum'],
			'left_right_back': ['chap', 'o\'ng', 'orqa'],
			'line_color': ['qora', 'qizil', 'yashil', 'ko\'k', 'har qanday rang'],
			'target_color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyoh', 'har qanday rang'],
			'color_line': ['qizil', 'yashil', 'ko\'k', 'har qanday rang'],
			'touching_color': ['qizil', 'mandarin', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyoh', 'qora', 'oq'],
			'pattern_color': ['qizil', 'sariq', 'yashil', 'moviy', 'ko\'k', 'siyoh'],
			'led_color': ['qizil', 'mandarin', 'sariq', 'yashil', 'moviy', 'ko\'k', 'binafsha', 'siyoh', 'oq'],
			'sound': ['qisqa', 'tasodifiy qisqa', 'sirena', 'motor', 'robot', 'marsh', 'tug\'ilgan kun', 'dibidibidip', 'juda yaxshi'],
			'button_state': ['bosgan', 'ikki-marta-bosgan', 'uzoq-bosganmi'],
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

	var MODULES = {
		'Hamster': 'hamster',
		'햄스터': 'hamster',
		'Turtle': 'turtle',
		'거북이': 'turtle'
	};
	var COLORS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var MODES = {};
	var LINE_COLORS = {};
	var COLOR_NUMBERS = {};
	var COLOR_PATTERNS = {};
	var RGB_COLORS = {};
	var SOUNDS = {};
	var BUTTON_STATES = {};
	var VALUES = {};
	var CAMERA_COLORS = {};
	var CAMERA_DATA = {};
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const FRONT = 4;
	const REAR = 5;
	const WHITE = 6;
	const SECONDS = 7;
	const PULSES = 8;
	const DEGREES = 9;
	const BACK = 10;
	const HEAD = 11;
	const OPEN = 12;
	const CLOSE = 13;
	const FORWARD = 14;
	const BACKWARD = 15;
	const LEVEL1_MOVE_CM = 12;
	const LEVEL1_TURN_DEG = 90;
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
		tmp = MENUS[i]['move_unit'];
		VALUES[tmp[1]] = SECONDS;
		VALUES[tmp[2]] = PULSES;
		tmp = MENUS[i]['turn_unit'];
		VALUES[tmp[0]] = DEGREES;
		tmp = MENUS[i]['left_right_back'];
		VALUES[tmp[2]] = BACK;
		tmp = MENUS[i]['head_tail'];
		VALUES[tmp[0]] = HEAD;
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

	function getRobot(module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			if(module == HAMSTER) {
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
					lineTracerState: 0
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
				robot.lineTracerCallback = undefined;
				robot.boardCommand = 0;
				robot.boardState = 0;
				robot.boardCount = 0;
				robot.boardCallback = undefined;
				robot.tempo = 60;
				robot.navigator = undefined;
				robot.getNavigator = function() {
					if(!robot.navigator) robot.navigator = createNavigator();
					return robot.navigator;
				};
				robot.resetData = function() {
					robot.boardCommand = 0;
					setLineTracerMode(robot, 0);
				};
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

					robot.lineTracerCallback = undefined;
					robot.boardCommand = 0;
					robot.boardState = 0;
					robot.boardCount = 0;
					robot.boardCallback = undefined;
					robot.tempo = 60;
					if(robot.navigator) {
						robot.navigator.reset();
						robot.navigator = undefined;
					}
				};
				robot.clearMotoring = function() {
					robot.motoring.map = 0xfc000000;
				};
				robot.handleSensory = function() {
					if(robot.lineTracerCallback) {
						var sensory = robot.sensory;
						if(sensory.map & 0x00000010) {
							if(sensory.lineTracerState == 0x40) {
								setLineTracerMode(robot, 0);
								var callback = robot.lineTracerCallback;
								robot.lineTracerCallback = undefined;
								if(callback) callback();
							}
						}
					}
					if(robot.boardCallback) {
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
				};
				robot.clearEvent = function() {
				};
				robots[key] = robot;
				packet[key] = robot.motoring;
			} else if(module == TURTLE) {
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
				robot.navigator = undefined;
				robot.getNavigator = function() {
					if(!robot.navigator) robot.navigator = createNavigator();
					return robot.navigator;
				};
				robot.resetData = function() {
					setTurtlePulse(robot, 0);
					setTurtleLineTracerMode(robot, 0);
					setTurtleMotion(robot, 0, 0, 0, 0, 0);
				};
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
					if(robot.navigator) {
						robot.navigator.reset();
						robot.navigator = undefined;
					}
				};
				robot.clearMotoring = function() {
					robot.motoring.map = 0xf8000000;
				};
				robot.handleSensory = function() {
					var sensory = robot.sensory;
					if(sensory.map & 0x00000800) robot.clicked = true;
					if(sensory.map & 0x00000400) robot.doubleClicked = true;
					if(sensory.map & 0x00000200) robot.longPressed = true;
					if(sensory.map & 0x00000080) robot.colorPattern = sensory.colorPattern;

					if(robot.lineTracerCallback) {
						if(sensory.map & 0x00000008) {
							if(sensory.lineTracerState == 0x02) {
								setTurtleLineTracerMode(robot, 0);
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
									runTurtleSound(robot, robot.soundId, -1);
								} else if(robot.soundRepeat > 1) {
									robot.soundRepeat --;
									runTurtleSound(robot, robot.soundId, robot.soundRepeat);
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
				};
				robot.clearEvent = function() {
					robot.clicked = false;
					robot.doubleClicked = false;
					robot.longPressed = false;
					robot.colorPattern = -1;
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

	function setLineTracerMode(robot, mode) {
		robot.motoring.lineTracerMode = mode;
		robot.motoring.map |= 0x00200000;
	}
	
	function setLineTracerSpeed(robot, speed) {
		robot.motoring.lineTracerSpeed = speed;
		robot.motoring.map |= 0x00100000;
	}
	
	function setIoModeA(robot, mode) {
		robot.motoring.ioModeA = mode;
		robot.motoring.map |= 0x00080000;
	}
	
	function setIoModeB(robot, mode) {
		robot.motoring.ioModeB = mode;
		robot.motoring.map |= 0x00040000;
	}
	
	function setTurtlePulse(robot, pulse) {
		var motoring = robot.motoring;
		motoring.pulse = pulse;
		motoring.map |= 0x04000000;
	}
	
	function setTurtleNote(robot, note) {
		var motoring = robot.motoring;
		motoring.note = note;
		motoring.map |= 0x02000000;
	}
	
	function setTurtleSound(robot, sound) {
		var motoring = robot.motoring;
		motoring.sound = sound;
		motoring.map |= 0x01000000;
	}

	function setTurtleLineTracerMode(robot, mode) {
		var motoring = robot.motoring;
		motoring.lineTracerMode = mode;
		motoring.map |= 0x00800000;
	}
	
	function setTurtleLineTracerGain(robot, gain) {
		var motoring = robot.motoring;
		motoring.lineTracerGain = gain;
		motoring.map |= 0x00400000;
	}
	
	function setTurtleLineTracerSpeed(robot, speed) {
		var motoring = robot.motoring;
		motoring.lineTracerSpeed = speed;
		motoring.map |= 0x00200000;
	}
	
	function setTurtleMotion(robot, type, unit, speed, value, radius) {
		var motoring = robot.motoring;
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map |= 0x00040000;
	}
	
	function runTurtleSound(robot, sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			robot.soundId = sound;
			robot.soundRepeat = count;
			setTurtleSound(robot, sound);
		}
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
	
	function createNavigator() {
		return {
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
					return ZERO_WHEELS;
				}
			},
			turn: function(targetRadian) {
				var currentRadian = this.theta * Math.PI / 180.0;
				var diff = this.validateRadian(targetRadian - currentRadian);
				var mag = Math.abs(diff);
				var direction = (diff > 0) ? 1 : -1;
				if(mag > tolerance.angle) {
					var value = 0;
					if(diff > 0) value = Math.log(1 + mag) * GAIN_ANGLE;
					else value = -Math.log(1 + mag) * GAIN_ANGLE;
					var wheels = this.wheels;
					wheels.left = -value;
					wheels.right = value;
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
					return ZERO_WHEELS;
				}
			},
			turnToDegree: function() {
				var targetDegree = this.targetDegree;
				if(targetDegree > -200) {
					var targetRadian = targetDegree * Math.PI / 180.0;
					return this.turn(targetRadian);
				} else {
					return ZERO_WHEELS;
				}
			},
			validateRadian: function(radian) {
				if(radian > Math.PI) return radian - PI_2;
				else if(radian < -Math.PI) return radian + PI_2;
				return radian;
			}
		};
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
		for(var i in robots) {
			robots[i].reset();
		}
		packet.extension.ar = {};
		chat.messages = {};
		colors = {};
		markers = {};
		removeAllTimeouts();
		chatDisconnect();
	}
	
	function handleNavigation(robot) {
		var navi = robot.getNavigator();
		navi.updatePosition();
		var wheels = undefined;
		if(navi.command == 1) {
			wheels = navi.moveTo();
		} else if(navi.command == 2) {
			wheels = navi.turnToXY();
		} else if(navi.command == 3) {
			wheels = navi.turnToDegree();
		}
		var motoring = robot.motoring;
		if(wheels) {
			motoring.leftWheel = wheels.left;
			motoring.rightWheel = wheels.right;
		} else {
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			navi.command = 0;
			var callback = navi.callback;
			navi.callback = undefined;
			if(callback) callback();
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
					sock.onmessage = function(message) { // message: MessageEvent
						try {
							var received = JSON.parse(message.data);
							slaveVersion = received.version || 0;
							if(received.type == 0) {
								connectionState = received.state;
							} else {
								if(slaveVersion == 1) {
									var data;
									for(var i in received) {
										data = received[i];
										if(data.module == 'extension') {
											if(data.colors) colors = data.colors;
											if(data.markers) markers = data.markers;
											if(data.tolerance) tolerance = data.tolerance;
										} else if(data.index >= 0) {
											var robot = getRobot(data.module, data.index);
											if(robot) {
												robot.sensory = data;
												robot.handleSensory();
												if(robot.navigator && robot.navigator.callback) handleNavigation(robot);
											}
										}
									}
								} else {
									if(received.index >= 0) {
										var robot = getRobot(received.module, received.index);
										if(robot) {
											robot.sensory = received;
											robot.handleSensory();
										}
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
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.motion = MOTION.NONE;
			setLineTracerMode(robot, 0);
			motoring.leftWheel = 45;
			motoring.rightWheel = 45;
			robot.boardCommand = 1;
			robot.boardState = 1;
			robot.boardCount = 0;
			robot.boardCallback = callback;
		} else {
			callback();
		}
	};

	ext.boardTurn = function(index, direction, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.motion = MOTION.NONE;
			setLineTracerMode(robot, 0);
			if(VALUES[direction] === LEFT) {
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
		} else {
			callback();
		}
	};
	
	ext.moveForward = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.motion = MOTION.FORWARD;
			robot.boardCommand = 0;
			setLineTracerMode(robot, 0);
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
		} else {
			callback();
		}
	};
	
	ext.moveBackward = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.motion = MOTION.BACKWARD;
			robot.boardCommand = 0;
			setLineTracerMode(robot, 0);
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
		} else {
			callback();
		}
	};
	
	ext.turn = function(index, direction, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			robot.boardCommand = 0;
			setLineTracerMode(robot, 0);
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
		} else {
			callback();
		}
	};

	ext.moveForwardForSecs = function(index, sec, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			sec = parseFloat(sec);
			robot.boardCommand = 0;
			setLineTracerMode(robot, 0);
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
		} else {
			callback();
		}
	};

	ext.moveBackwardForSecs = function(index, sec, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			sec = parseFloat(sec);
			robot.boardCommand = 0;
			setLineTracerMode(robot, 0);
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
		} else {
			callback();
		}
	};

	ext.turnForSecs = function(index, direction, sec, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			sec = parseFloat(sec);
			robot.boardCommand = 0;
			setLineTracerMode(robot, 0);
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
		} else {
			callback();
		}
	};
	
	ext.changeBothWheelsBy = function(index, left, right) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			left = parseFloat(left);
			right = parseFloat(right);
			motoring.motion = MOTION.NONE;
			robot.boardCommand = 0;
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
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			left = parseFloat(left);
			right = parseFloat(right);
			motoring.motion = MOTION.NONE;
			robot.boardCommand = 0;
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
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseFloat(speed);
			motoring.motion = MOTION.NONE;
			robot.boardCommand = 0;
			setLineTracerMode(robot, 0);
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
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseFloat(speed);
			motoring.motion = MOTION.NONE;
			robot.boardCommand = 0;
			setLineTracerMode(robot, 0);
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
		var robot = getRobot(HAMSTER, index);
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
			
			motoring.motion = MOTION.NONE;
			robot.boardCommand = 0;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setLineTracerMode(robot, mode);
		}
	};

	ext.followLineUntilIntersection = function(index, color, which, callback) {
		var robot = getRobot(HAMSTER, index);
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
			
			motoring.motion = MOTION.NONE;
			robot.boardCommand = 0;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};

	ext.setFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseInt(speed);
			if(typeof speed == 'number') {
				setLineTracerSpeed(robot, speed);
			}
		}
	};

	ext.stop = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.motion = MOTION.NONE;
			robot.boardCommand = 0;
			setLineTracerMode(robot, 0);
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
		}
	};

	ext.setLedTo = function(index, which, color) {
		var robot = getRobot(HAMSTER, index);
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
		var robot = getRobot(HAMSTER, index);
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
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.buzzer = 440;
			setNote(robot, 0);
			var timer = setTimeout(function() {
				motoring.buzzer = 0;
				removeTimeout(timer);
				callback();
			}, 200);
			timeouts.push(timer);
		} else {
			callback();
		}
	};

	ext.changeBuzzerBy = function(index, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			var buzzer = parseFloat(value);
			if(typeof buzzer == 'number') {
				motoring.buzzer += buzzer;
			}
			setNote(robot, 0);
		}
	};

	ext.setBuzzerTo = function(index, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			var buzzer = parseFloat(value);
			if(typeof buzzer == 'number') {
				motoring.buzzer = buzzer;
			}
			setNote(robot, 0);
		}
	};

	ext.clearBuzzer = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.buzzer = 0;
			setNote(robot, 0);
		}
	};
	
	ext.playNoteFor = function(index, note, octave, beat, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			note = NOTES[note];
			octave = parseInt(octave);
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
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

	ext.restFor = function(index, beat, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
			setNote(robot, 0);
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

	ext.changeTempoBy = function(index, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			value = parseFloat(value);
			if(typeof value == 'number') {
				robot.tempo += value;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		}
	};

	ext.setTempoTo = function(index, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			value = parseFloat(value);
			if(typeof value == 'number') {
				robot.tempo = value;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		}
	};

	ext.leftProximity0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.leftProximity5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) {
			var sensory = robot.sensory;
			return sensory.leftProximity > 50 || sensory.rightProximity > 50;
		} else {
			return false;
		}
	};

	ext.setPortTo = function(index, port, mode) {
		var robot = getRobot(HAMSTER, index);
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
		var robot = getRobot(HAMSTER, index);
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
		var robot = getRobot(HAMSTER, index);
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
	
	ext.clearGripper = function(index) {
		var robot = getRobot(index);
		if(robot) {
			setIoModeA(robot, 10);
			setIoModeB(robot, 10);
			var motoring = robot.motoring;
			motoring.outputA = 0;
			motoring.outputB = 0;
		}
	};

	ext.inputA0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB0 = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB1 = function() {
		var robot = getRobot(HAMSTER, 1);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB2 = function() {
		var robot = getRobot(HAMSTER, 2);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB3 = function() {
		var robot = getRobot(HAMSTER, 3);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB4 = function() {
		var robot = getRobot(HAMSTER, 4);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.inputA5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB5 = function() {
		var robot = getRobot(HAMSTER, 5);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};
	
	ext.turtleMoveForward = function(index, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			setTurtleMotion(robot, 1, 1, 0, LEVEL1_MOVE_CM, 0);
			robot.pulseCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleMoveBackward = function(index, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			setTurtleMotion(robot, 2, 1, 0, LEVEL1_MOVE_CM, 0);
			robot.pulseCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleTurn = function(index, direction, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			if(VALUES[direction] === LEFT) {
				setTurtleMotion(robot, 3, 1, 0, LEVEL1_TURN_DEG, 0);
			} else {
				setTurtleMotion(robot, 4, 1, 0, LEVEL1_TURN_DEG, 0);
			}
			robot.pulseCallback = callback;
		} else {
			callback();
		}
	};

	ext.turtleMoveForwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				setTurtleMotion(robot, 1, unit, 0, value, 0);
				robot.pulseCallback = callback;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.turtleMoveBackwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				setTurtleMotion(robot, 2, unit, 0, value, 0);
				robot.pulseCallback = callback;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.turtleTurnUnitInPlace = function(index, direction, value, unit, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				if(VALUES[direction] === LEFT) {
					setTurtleMotion(robot, 3, unit, 0, value, 0);
				} else {
					setTurtleMotion(robot, 4, unit, 0, value, 0);
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
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			if(value && value > 0 && (typeof radius == 'number') && radius >= 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				if(VALUES[direction] === LEFT) {
					if(VALUES[head] === HEAD) {
						setTurtleMotion(robot, 9, unit, 0, value, radius);
					} else {
						setTurtleMotion(robot, 10, unit, 0, value, radius);
					}
				} else {
					if(VALUES[head] === HEAD) {
						setTurtleMotion(robot, 11, unit, 0, value, radius);
					} else {
						setTurtleMotion(robot, 12, unit, 0, value, radius);
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
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				if(VALUES[wheel] === LEFT) {
					if(VALUES[head] === HEAD) {
						setTurtleMotion(robot, 5, unit, 0, value, 0);
					} else {
						setTurtleMotion(robot, 6, unit, 0, value, 0);
					}
				} else {
					if(VALUES[head] === HEAD) {
						setTurtleMotion(robot, 7, unit, 0, value, 0);
					} else {
						setTurtleMotion(robot, 8, unit, 0, value, 0);
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
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			left = parseFloat(left);
			right = parseFloat(right);
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			if(typeof left == 'number') {
				motoring.leftWheel += left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel += right;
			}
		}
	};

	ext.turtleSetWheelsToLeftRight = function(index, left, right) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			left = parseFloat(left);
			right = parseFloat(right);
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			if(typeof left == 'number') {
				motoring.leftWheel = left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel = right;
			}
		}
	};

	ext.turtleChangeWheelBy = function(index, wheel, speed) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseFloat(speed);
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
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
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			speed = parseFloat(speed);
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
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
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			var mode = 10 + LINE_COLORS[color];
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, mode);
		}
	};

	ext.turtleFollowLineUntil = function(index, color, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			var mode = 60 + LINE_COLORS[color];
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleFollowLineUntilBlack = function(index, color, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			var mode = 70 + LINE_COLORS[color];
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleCrossIntersection = function(index, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, 40);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.turtleTurnAtIntersection = function(index, direction, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			var mode = 20;
			direction = VALUES[direction];
			if(direction === RIGHT) mode = 30;
			else if(direction === BACK) mode = 50;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		} else {
			callback();
		}
	};

	ext.turtleSetFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			speed = parseInt(speed);
			if(typeof speed == 'number') {
				setTurtleLineTracerSpeed(robot, speed);
				setTurtleLineTracerGain(robot, speed);
			}
		}
	};

	ext.turtleStop = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleLineTracerMode(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
		}
	};

	ext.turtleSetHeadLedTo = function(index, color) {
		var robot = getRobot(TURTLE, index);
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
		var robot = getRobot(TURTLE, index);
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
		var robot = getRobot(TURTLE, index);
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
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			motoring.ledRed = 0;
			motoring.ledGreen = 0;
			motoring.ledBlue = 0;
		}
	};

	ext.turtlePlaySound = function(index, sound) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			sound = SOUNDS[sound];
			motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			if(sound) runTurtleSound(robot, sound);
		}
	};
	
	ext.turtlePlaySoundTimes = function(index, sound, count) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			sound = SOUNDS[sound];
			count = parseInt(count);
			motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			if(sound && count) {
				runTurtleSound(robot, sound, count);
			}
		}
	};
	
	ext.turtlePlaySoundTimesUntilDone = function(index, sound, count, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			sound = SOUNDS[sound];
			count = parseInt(count);
			motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			if(sound && count) {
				runTurtleSound(robot, sound, count);
				robot.soundCallback = callback;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	ext.turtleChangeBuzzerBy = function(index, hz) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			hz = parseFloat(hz);
			if(typeof hz == 'number') {
				robot.motoring.buzzer += hz;
			}
			setTurtleNote(robot, 0);
			runTurtleSound(robot, 0);
		}
	};

	ext.turtleSetBuzzerTo = function(index, hz) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			hz = parseFloat(hz);
			if(typeof hz == 'number') {
				robot.motoring.buzzer = hz;
			}
			setTurtleNote(robot, 0);
			runTurtleSound(robot, 0);
		}
	};

	ext.turtleClearSound = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			robot.motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			runTurtleSound(robot, 0);
		}
	};
	
	ext.turtlePlayNote = function(index, note, octave) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			note = NOTES[note];
			octave = parseInt(octave);
			robot.motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8) {
				note += (octave - 1) * 12;
				setTurtleNote(robot, note);
			}
			runTurtleSound(robot, 0);
		}
	};
	
	ext.turtlePlayNoteForBeats = function(index, note, octave, beat, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			note = NOTES[note];
			octave = parseInt(octave);
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			robot.motoring.buzzer = 0;
			runTurtleSound(robot, 0);
			if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && robot.tempo > 0) {
				note += (octave - 1) * 12;
				setTurtleNote(robot, note);
				var timeout = beat * 60 * 1000 / robot.tempo;
				var tail = 0;
				if(timeout > 100) {
					tail = 100;
				}
				if(tail > 0) {
					var timer1 = setTimeout(function() {
						setTurtleNote(robot, 0);
						removeTimeout(timer1);
					}, timeout - tail);
					timeouts.push(timer1);
				}
				var timer2 = setTimeout(function() {
					setTurtleNote(robot, 0);
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
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			robot.motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			runTurtleSound(robot, 0);
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
		var robot = getRobot(TURTLE, index);
		if(robot) {
			bpm = parseFloat(bpm);
			if(typeof bpm == 'number') {
				robot.tempo += bpm;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		}
	};

	ext.turtleSetTempoTo = function(index, bpm) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			bpm = parseFloat(bpm);
			if(typeof bpm == 'number') {
				robot.tempo = bpm;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		}
	};

	ext.turtleTouchingColor = function(index, color) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.sensory.colorNumber == COLOR_NUMBERS[color];
		return false;
	};

	ext.turtleIsColorPattern = function(index, color1, color2) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.colorPattern == COLOR_PATTERNS[color1] * 10 + COLOR_PATTERNS[color2];
		return false;
	};

	ext.turtleButtonState = function(index, state) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			state = BUTTON_STATES[state];
			if(state == 1) return robot.clicked;
			else if(state == 2) return robot.doubleClicked;
			else if(state == 3) return robot.longPressed;
		}
		return false;
	};

	ext.turtleColorNumber0 = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern0 = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor0 = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton0 = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX0 = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY0 = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ0 = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber1 = function() {
		var robot = getRobot(TURTLE, 1);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern1 = function() {
		var robot = getRobot(TURTLE, 1);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor1 = function() {
		var robot = getRobot(TURTLE, 1);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton1 = function() {
		var robot = getRobot(TURTLE, 1);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX1 = function() {
		var robot = getRobot(TURTLE, 1);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY1 = function() {
		var robot = getRobot(TURTLE, 1);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ1 = function() {
		var robot = getRobot(TURTLE, 1);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber2 = function() {
		var robot = getRobot(TURTLE, 2);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern2 = function() {
		var robot = getRobot(TURTLE, 2);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor2 = function() {
		var robot = getRobot(TURTLE, 2);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton2 = function() {
		var robot = getRobot(TURTLE, 2);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX2 = function() {
		var robot = getRobot(TURTLE, 2);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY2 = function() {
		var robot = getRobot(TURTLE, 2);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ2 = function() {
		var robot = getRobot(TURTLE, 2);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber3 = function() {
		var robot = getRobot(TURTLE, 3);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern3 = function() {
		var robot = getRobot(TURTLE, 3);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor3 = function() {
		var robot = getRobot(TURTLE, 3);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton3 = function() {
		var robot = getRobot(TURTLE, 3);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX3 = function() {
		var robot = getRobot(TURTLE, 3);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY3 = function() {
		var robot = getRobot(TURTLE, 3);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ3 = function() {
		var robot = getRobot(TURTLE, 3);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber4 = function() {
		var robot = getRobot(TURTLE, 4);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern4 = function() {
		var robot = getRobot(TURTLE, 4);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor4 = function() {
		var robot = getRobot(TURTLE, 4);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton4 = function() {
		var robot = getRobot(TURTLE, 4);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX4 = function() {
		var robot = getRobot(TURTLE, 4);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY4 = function() {
		var robot = getRobot(TURTLE, 4);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ4 = function() {
		var robot = getRobot(TURTLE, 4);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
	};
	
	ext.turtleColorNumber5 = function() {
		var robot = getRobot(TURTLE, 5);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern5 = function() {
		var robot = getRobot(TURTLE, 5);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor5 = function() {
		var robot = getRobot(TURTLE, 5);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton5 = function() {
		var robot = getRobot(TURTLE, 5);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX5 = function() {
		var robot = getRobot(TURTLE, 5);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY5 = function() {
		var robot = getRobot(TURTLE, 5);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ5 = function() {
		var robot = getRobot(TURTLE, 5);
		if(robot) return robot.sensory.accelerationZ;
		return 0;
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
	
	ext.setRobotMarkerTo = function(robot, index, marker) {
		var module = MODULES[robot];
		robot = getRobot(module, index);
		if(robot) {
			marker = parseInt(marker);
			if((typeof marker == 'number') && marker >= 0) {
				var navi = robot.getNavigator();
				navi.marker = marker;
			}
		}
	};
	
	ext.moveToXY = function(robot, index, direction, x, y, callback) {
		var module = MODULES[robot];
		robot = getRobot(module, index);
		if(robot) {
			x = parseInt(x);
			y = parseInt(y);
			if((typeof x == 'number') && (typeof y == 'number')) {
				robot.resetData();
				var navi = robot.getNavigator();
				navi.clear();
				navi.setTargetPosition(x, y);
				navi.setBackward(VALUES[direction] == BACKWARD);
				navi.callback = callback;
				navi.command = 1;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};
	
	ext.turnInDirectionOfXY = function(robot, index, x, y, callback) {
		var module = MODULES[robot];
		robot = getRobot(module, index);
		if(robot) {
			x = parseInt(x);
			y = parseInt(y);
			if((typeof x == 'number') && (typeof y == 'number')) {
				robot.resetData();
				var navi = robot.getNavigator();
				navi.clear();
				navi.setTargetDirection(x, y);
				navi.callback = callback;
				navi.command = 2;
			} else {
				callback();
			}
		} else {
			callback();
		}
	};
	
	ext.turnInDirectionOfDegrees = function(robot, index, degree, callback) {
		var module = MODULES[robot];
		robot = getRobot(module, index);
		if(robot) {
			degree = parseFloat(degree);
			if(typeof degree == 'number') {
				robot.resetData();
				var navi = robot.getNavigator();
				navi.clear();
				navi.setTargetDegree(degree);
				navi.callback = callback;
				navi.command = 3;
			} else {
				callback();
			}
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
		url: "http://hamster.school"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
