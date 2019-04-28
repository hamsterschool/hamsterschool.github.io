(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const MOTION = {
		NONE: 0,
		FORWARD: 1,
		BACKWARD: 2,
		LEFT: 3,
		RIGHT: 4
	};
	const SPEED2GAINS = { 1: 6, 2: 6, 3: 5, 4: 5, 5: 4, 6: 4, 7: 3, 8: 3 };
	const HAMSTER = 'hamster';
	const HAMSTER_S = 'hamsterS';
	const TURTLE = 'turtle';
	var connectionState = 1;
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
		ja: [ 'ロボットコーディングソフトウェアを実行してください。', '最初のロボットが接続されていません。', '正常です。' ],
		uz: [ 'Robot Kodlash dasturini ishga tushiring.', 'Birinchi robot ulanmagan.', 'Tayyorlangan' ]
	};
	const EXTENSION_NAME = {
		en: 'Robot',
		ko: '로봇',
		ja: 'ロボット',
		uz: 'Robot'
	};
	const BLOCKS = {
		en1: [
			["w", "Hamster %n : move forward once on board", "boardMoveForward", 0],
			["w", "Hamster %n : turn %m.left_right once on board", "boardTurn", 0, "left"],
			["-"],
			["w", "Hamster %n : move forward", "moveForward", 0],
			["w", "Hamster %n : move backward", "moveBackward", 0],
			["w", "Hamster %n : turn %m.left_right", "turn", 0, "left"],
			["-"],
			[" ", "Hamster %n : set %m.left_right_both led to %m.color", "setLedTo", 0, "left", "red"],
			[" ", "Hamster %n : clear %m.left_right_both led", "clearLed", 0, "left"],
			["-"],
			["w", "Hamster %n : beep", "beep", 0],
			["-"],
			["h", "Hamster %n : when hand found", "whenHandFound", 0],
			["b", "Hamster %n : hand found?", "handFound", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "HamsterS %n : move forward once on board", "sBoardMoveForward", 0],
			["w", "HamsterS %n : turn %m.left_right once on board", "sBoardTurn", 0, "left"],
			["-"],
			["w", "HamsterS %n : move forward", "sMoveForward", 0],
			["w", "HamsterS %n : move backward", "sMoveBackward", 0],
			["w", "HamsterS %n : turn %m.left_right", "sTurn", 0, "left"],
			["-"],
			[" ", "HamsterS %n : set %m.left_right_both led to %m.led_color", "sSetLedTo", 0, "left", "red"],
			[" ", "HamsterS %n : clear %m.left_right_both led", "sClearLed", 0, "left"],
			["-"],
			[" ", "HamsterS %n : play sound %m.sound_effect", "sPlaySound", 0, "beep"],
			[" ", "HamsterS %n : clear sound", "sClearSound", 0],
			["-"],
			["h", "HamsterS %n : when hand found", "sWhenHandFound", 0],
			["b", "HamsterS %n : hand found?", "sHandFound", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "Turtle %n : move forward", "turtleMoveForward", 0],
			["w", "Turtle %n : move backward", "turtleMoveBackward", 0],
			["w", "Turtle %n : turn %m.left_right", "turtleTurn", 0, "left"],
			["-"],
			[" ", "Turtle %n : set head led to %m.led_color", "turtleSetHeadLedTo", 0, "red"],
			[" ", "Turtle %n : clear head led", "turtleClearHeadLed", 0],
			["-"],
			[" ", "Turtle %n : play sound %m.sound", "turtlePlaySound", 0, "beep"],
			[" ", "Turtle %n : clear sound", "turtleClearSound", 0],
			["-"],
			["h", "Turtle %n : when %m.touching_color touched", "turtleWhenColorTouched", 0, "red"],
			["h", "Turtle %n : when button %m.when_button_state", "turtleWhenButtonState", 0, "clicked"],
			["b", "Turtle %n : touching %m.touching_color ?", "turtleTouchingColor", 0, "red"],
			["b", "Turtle %n : button %m.button_state ?", "turtleButtonState", 0, "clicked"]
		],
		en2: [
			["w", "Hamster %n : move forward once on board", "boardMoveForward", 0],
			["w", "Hamster %n : turn %m.left_right once on board", "boardTurn", 0, "left"],
			["-"],
			["w", "Hamster %n : move forward %n secs", "moveForwardForSecs", 0, 1],
			["w", "Hamster %n : move backward %n secs", "moveBackwardForSecs", 0, 1],
			["w", "Hamster %n : turn %m.left_right %n secs", "turnForSecs", 0, "left", 1],
			["-"],
			[" ", "Hamster %n : set %m.left_right_both led to %m.color", "setLedTo", 0, "left", "red"],
			[" ", "Hamster %n : clear %m.left_right_both led", "clearLed", 0, "left"],
			["-"],
			["w", "Hamster %n : beep", "beep", 0],
			["w", "Hamster %n : play note %m.note %m.octave for %d.beats beats", "playNoteFor", 0, "C", "4", 0.5],
			["w", "Hamster %n : rest for %d.beats beats", "restFor", 0, 0.25],
			[" ", "Hamster %n : change tempo by %n", "changeTempoBy", 0, 20],
			[" ", "Hamster %n : set tempo to %n bpm", "setTempoTo", 0, 60],
			["-"],
			["h", "Hamster %n : when hand found", "whenHandFound", 0],
			["h", "Hamster %n : when %m.when_tilt", "whenTilt", 0, "tilt forward"],
			["b", "Hamster %n : hand found?", "handFound", 0],
			["b", "Hamster %n : %m.tilt ?", "tilt", 0, "tilt forward"],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "HamsterS %n : move forward once on board", "sBoardMoveForward", 0],
			["w", "HamsterS %n : turn %m.left_right once on board", "sBoardTurn", 0, "left"],
			["-"],
			["w", "HamsterS %n : move forward %n %m.cm_sec", "sMoveForwardUnit", 0, 5, "cm"],
			["w", "HamsterS %n : move backward %n %m.cm_sec", "sMoveBackwardUnit", 0, 5, "cm"],
			["w", "HamsterS %n : turn %m.left_right %n %m.deg_sec in place", "sTurnUnitInPlace", 0, "left", 90, "degrees"],
			["w", "HamsterS %n : turn %m.left_right %n %m.deg_sec with radius %n cm in %m.forward_backward direction", "sTurnUnitWithRadiusInDirection", 0, "left", 90, "degrees", 5, "forward"],
			["w", "HamsterS %n : pivot around %m.left_right wheel %n %m.deg_sec in %m.forward_backward direction", "sPivotAroundWheelUnitInDirection", 0, "left", 90, "degrees", "forward"],
			["-"],
			[" ", "HamsterS %n : set %m.left_right_both led to %m.led_color", "sSetLedTo", 0, "left", "red"],
			[" ", "HamsterS %n : clear %m.left_right_both led", "sClearLed", 0, "left"],
			["-"],
			[" ", "HamsterS %n : play sound %m.sound_effect %n times", "sPlaySoundTimes", 0, "beep", 1],
			["w", "HamsterS %n : play sound %m.sound_effect %n times until done", "sPlaySoundTimesUntilDone", 0, "beep", 1],
			[" ", "HamsterS %n : clear sound", "sClearSound", 0],
			["w", "HamsterS %n : play note %m.note %m.octave for %d.beats beats", "sPlayNoteFor", 0, "C", "4", 0.5],
			["w", "HamsterS %n : rest for %d.beats beats", "sRestFor", 0, 0.25],
			[" ", "HamsterS %n : change tempo by %n", "sChangeTempoBy", 0, 20],
			[" ", "HamsterS %n : set tempo to %n bpm", "sSetTempoTo", 0, 60],
			["-"],
			["h", "HamsterS %n : when hand found", "sWhenHandFound", 0],
			["h", "HamsterS %n : when %m.when_s_tilt", "sWhenTilt", 0, "tilt forward"],
			["b", "HamsterS %n : hand found?", "sHandFound", 0],
			["b", "HamsterS %n : %m.s_tilt ?", "sTilt", 0, "tilt forward"],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "Turtle %n : move forward %n %m.cm_sec", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : move backward %n %m.cm_sec", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : turn %m.left_right %n %m.deg_sec in place", "turtleTurnUnitInPlace", 0, "left", 90, "degrees"],
			["w", "Turtle %n : turn %m.left_right %n %m.deg_sec with radius %n cm in %m.head_tail direction", "turtleTurnUnitWithRadiusInDirection", 0, "left", 90, "degrees", 6, "head"],
			["w", "Turtle %n : pivot around %m.left_right wheel %n %m.deg_sec in %m.head_tail direction", "turtlePivotAroundWheelUnitInDirection", 0, "left", 90, "degrees", "head"],
			["-"],
			[" ", "Turtle %n : set head led to %m.led_color", "turtleSetHeadLedTo", 0, "red"],
			[" ", "Turtle %n : clear head led", "turtleClearHeadLed", 0],
			["-"],
			[" ", "Turtle %n : play sound %m.sound %n times", "turtlePlaySoundTimes", 0, "beep", 1],
			["w", "Turtle %n : play sound %m.sound %n times until done", "turtlePlaySoundTimesUntilDone", 0, "beep", 1],
			[" ", "Turtle %n : clear sound", "turtleClearSound", 0],
			["w", "Turtle %n : play note %m.note %m.octave for %d.beats beats", "turtlePlayNoteForBeats", 0, "C", "4", 0.5],
			["w", "Turtle %n : rest for %d.beats beats", "turtleRestForBeats", 0, 0.25],
			[" ", "Turtle %n : change tempo by %n", "turtleChangeTempoBy", 0, 20],
			[" ", "Turtle %n : set tempo to %n bpm", "turtleSetTempoTo", 0, 60],
			["-"],
			["h", "Turtle %n : when %m.touching_color touched", "turtleWhenColorTouched", 0, "red"],
			["h", "Turtle %n : when color pattern is %m.pattern_color %m.pattern_color", "turtleWhenColorPattern", 0, "red", "yellow"],
			["h", "Turtle %n : when button %m.when_button_state", "turtleWhenButtonState", 0, "clicked"],
			["h", "Turtle %n : when %m.when_tilt", "turtleWhenTilt", 0, "tilt forward"],
			["b", "Turtle %n : touching %m.touching_color ?", "turtleTouchingColor", 0, "red"],
			["b", "Turtle %n : color pattern %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", 0, "red", "yellow"],
			["b", "Turtle %n : button %m.button_state ?", "turtleButtonState", 0, "clicked"],
			["b", "Turtle %n : %m.tilt ?", "turtleTilt", 0, "tilt forward"]
		],
		en3: [
			["w", "Hamster %n : move forward once on board", "boardMoveForward", 0],
			["w", "Hamster %n : turn %m.left_right once on board", "boardTurn", 0, "left"],
			["-"],
			["w", "Hamster %n : move forward %n secs", "moveForwardForSecs", 0, 1],
			["w", "Hamster %n : move backward %n secs", "moveBackwardForSecs", 0, 1],
			["w", "Hamster %n : turn %m.left_right %n secs", "turnForSecs", 0, "left", 1],
			[" ", "Hamster %n : change wheels by left: %n right: %n", "changeBothWheelsBy", 0, 10, 10],
			[" ", "Hamster %n : set wheels to left: %n right: %n", "setBothWheelsTo", 0, 30, 30],
			[" ", "Hamster %n : change %m.left_right_both wheel by %n", "changeWheelBy", 0, "left", 10],
			[" ", "Hamster %n : set %m.left_right_both wheel to %n", "setWheelTo", 0, "left", 30],
			[" ", "Hamster %n : follow %m.black_white line with %m.left_right_both floor sensor", "followLineUsingFloorSensor", 0, "black", "left"],
			["w", "Hamster %n : follow %m.black_white line until %m.left_right_front_rear intersection", "followLineUntilIntersection", 0, "black", "front"],
			[" ", "Hamster %n : set following speed to %m.speed", "setFollowingSpeedTo", 0, "5"],
			[" ", "Hamster %n : stop", "stop", 0],
			["-"],
			[" ", "Hamster %n : set %m.left_right_both led to %m.color", "setLedTo", 0, "left", "red"],
			[" ", "Hamster %n : clear %m.left_right_both led", "clearLed", 0, "left"],
			["-"],
			["w", "Hamster %n : beep", "beep", 0],
			[" ", "Hamster %n : change buzzer by %n", "changeBuzzerBy", 0, 10],
			[" ", "Hamster %n : set buzzer to %n", "setBuzzerTo", 0, 1000],
			[" ", "Hamster %n : clear buzzer", "clearBuzzer", 0],
			[" ", "Hamster %n : play note %m.note %m.octave", "playNote", 0, "C", "4"],
			["w", "Hamster %n : play note %m.note %m.octave for %d.beats beats", "playNoteFor", 0, "C", "4", 0.5],
			["w", "Hamster %n : rest for %d.beats beats", "restFor", 0, 0.25],
			[" ", "Hamster %n : change tempo by %n", "changeTempoBy", 0, 20],
			[" ", "Hamster %n : set tempo to %n bpm", "setTempoTo", 0, 60],
			["-"],
			["r", "Hamster %n : left proximity", "leftProximity", 0],
			["r", "Hamster %n : right proximity", "rightProximity", 0],
			["r", "Hamster %n : left floor", "leftFloor", 0],
			["r", "Hamster %n : right floor", "rightFloor", 0],
			["r", "Hamster %n : x acceleration", "accelerationX", 0],
			["r", "Hamster %n : y acceleration", "accelerationY", 0],
			["r", "Hamster %n : z acceleration", "accelerationZ", 0],
			["r", "Hamster %n : light", "light", 0],
			["r", "Hamster %n : temperature", "temperature", 0],
			["r", "Hamster %n : signal strength", "signalStrength", 0],
			["h", "Hamster %n : when hand found", "whenHandFound", 0],
			["h", "Hamster %n : when %m.when_tilt", "whenTilt", 0, "tilt forward"],
			["b", "Hamster %n : hand found?", "handFound", 0],
			["b", "Hamster %n : %m.tilt ?", "tilt", 0, "tilt forward"],
			["b", "Hamster %n : battery %m.battery ?", "battery", 0, "normal"],
			["-"],
			[" ", "Hamster %n : set port %m.port to %m.mode", "setPortTo", 0, "A", "analog input"],
			[" ", "Hamster %n : change output %m.port by %n", "changeOutputBy", 0, "A", 10],
			[" ", "Hamster %n : set output %m.port to %n", "setOutputTo", 0, "A", 100],
			["w", "Hamster %n : %m.open_close gripper", "gripper", 0, "open"],
			[" ", "Hamster %n : release gripper", "releaseGripper", 0],
			["r", "Hamster %n : input A", "inputA", 0],
			["r", "Hamster %n : input B", "inputB", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "HamsterS %n : move forward once on board", "sBoardMoveForward", 0],
			["w", "HamsterS %n : turn %m.left_right once on board", "sBoardTurn", 0, "left"],
			["-"],
			["w", "HamsterS %n : move forward %n %m.move_unit", "sMoveForwardUnit", 0, 5, "cm"],
			["w", "HamsterS %n : move backward %n %m.move_unit", "sMoveBackwardUnit", 0, 5, "cm"],
			["w", "HamsterS %n : turn %m.left_right %n %m.turn_unit in place", "sTurnUnitInPlace", 0, "left", 90, "degrees"],
			["w", "HamsterS %n : turn %m.left_right %n %m.turn_unit with radius %n cm in %m.forward_backward direction", "sTurnUnitWithRadiusInDirection", 0, "left", 90, "degrees", 5, "forward"],
			["w", "HamsterS %n : pivot around %m.left_right wheel %n %m.turn_unit in %m.forward_backward direction", "sPivotAroundWheelUnitInDirection", 0, "left", 90, "degrees", "forward"],
			["w", "HamsterS %n : %m.left_right pen, turn %m.left_right %n %m.turn_unit with radius %n cm in %m.forward_backward direction", "sTurnPenUnitWithRadiusInDirection", 0, "left", "left", 90, "degrees", 5, "forward"],
			["w", "HamsterS %n : pivot around %m.left_right pen %n %m.turn_unit in %m.forward_backward direction", "sPivotAroundPenUnitInDirection", 0, "left", 90, "degrees", "forward"],
			[" ", "HamsterS %n : change wheels by left: %n right: %n", "sChangeBothWheelsBy", 0, 10, 10],
			[" ", "HamsterS %n : set wheels to left: %n right: %n", "sSetBothWheelsTo", 0, 30, 30],
			[" ", "HamsterS %n : change %m.left_right_both wheel by %n", "sChangeWheelBy", 0, "left", 10],
			[" ", "HamsterS %n : set %m.left_right_both wheel to %n", "sSetWheelTo", 0, "left", 30],
			[" ", "HamsterS %n : follow %m.black_white line with %m.left_right_both floor sensor", "sFollowLineUsingFloorSensor", 0, "black", "left"],
			["w", "HamsterS %n : follow %m.black_white line until %m.left_right_front_rear intersection", "sFollowLineUntilIntersection", 0, "black", "front"],
			[" ", "HamsterS %n : set following speed to %m.speed", "sSetFollowingSpeedTo", 0, "5"],
			[" ", "HamsterS %n : set following directional variation to %m.gain", "sSetFollowingGainTo", 0, "default"],
			[" ", "HamsterS %n : stop", "sStop", 0],
			["-"],
			[" ", "HamsterS %n : set %m.left_right_both led to %m.led_color", "sSetLedTo", 0, "left", "red"],
			[" ", "HamsterS %n : change %m.left_right_both led by r: %n g: %n b: %n", "sChangeLedByRGB", 0, "left", 10, 0, 0],
			[" ", "HamsterS %n : set %m.left_right_both led to r: %n g: %n b: %n", "sSetLedToRGB", 0, "left", 255, 0, 0],
			[" ", "HamsterS %n : clear %m.left_right_both led", "sClearLed", 0, "left"],
			["-"],
			[" ", "HamsterS %n : play sound %m.sound_effect %n times", "sPlaySoundTimes", 0, "beep", 1],
			["w", "HamsterS %n : play sound %m.sound_effect %n times until done", "sPlaySoundTimesUntilDone", 0, "beep", 1],
			[" ", "HamsterS %n : change buzzer by %n", "sChangeBuzzerBy", 0, 10],
			[" ", "HamsterS %n : set buzzer to %n", "sSetBuzzerTo", 0, 1000],
			[" ", "HamsterS %n : clear sound", "sClearSound", 0],
			[" ", "HamsterS %n : play note %m.note %m.octave", "sPlayNote", 0, "C", "4"],
			["w", "HamsterS %n : play note %m.note %m.octave for %d.beats beats", "sPlayNoteFor", 0, "C", "4", 0.5],
			["w", "HamsterS %n : rest for %d.beats beats", "sRestFor", 0, 0.25],
			[" ", "HamsterS %n : change tempo by %n", "sChangeTempoBy", 0, 20],
			[" ", "HamsterS %n : set tempo to %n bpm", "sSetTempoTo", 0, 60],
			["-"],
			["r", "HamsterS %n : left proximity", "sLeftProximity", 0],
			["r", "HamsterS %n : right proximity", "sRightProximity", 0],
			["r", "HamsterS %n : left floor", "sLeftFloor", 0],
			["r", "HamsterS %n : right floor", "sRightFloor", 0],
			["r", "HamsterS %n : x acceleration", "sAccelerationX", 0],
			["r", "HamsterS %n : y acceleration", "sAccelerationY", 0],
			["r", "HamsterS %n : z acceleration", "sAccelerationZ", 0],
			["r", "HamsterS %n : light", "sLight", 0],
			["r", "HamsterS %n : temperature", "sTemperature", 0],
			["r", "HamsterS %n : signal strength", "sSignalStrength", 0],
			["h", "HamsterS %n : when hand found", "sWhenHandFound", 0],
			["h", "HamsterS %n : when %m.when_s_tilt", "sWhenTilt", 0, "tilt forward"],
			["b", "HamsterS %n : hand found?", "sHandFound", 0],
			["b", "HamsterS %n : %m.s_tilt ?", "sTilt", 0, "tilt forward"],
			["b", "HamsterS %n : battery %m.battery ?", "sBattery", 0, "normal"],
			["-"],
			[" ", "HamsterS %n : set port %m.port to %m.s_mode", "sSetPortTo", 0, "A", "analog input"],
			[" ", "HamsterS %n : change output %m.port by %n", "sChangeOutputBy", 0, "A", 10],
			[" ", "HamsterS %n : set output %m.port to %n", "sSetOutputTo", 0, "A", 100],
			["w", "HamsterS %n : %m.open_close gripper", "sGripper", 0, "open"],
			[" ", "HamsterS %n : release gripper", "sReleaseGripper", 0],
			["r", "HamsterS %n : input A", "sInputA", 0],
			["r", "HamsterS %n : input B", "sInputB", 0],
			["-"],
			["w", "HamsterS %n : write %m.serial_output %s to serial", "sWriteSerial", 0, "string", "abc123"],
			["w", "HamsterS %n : read serial %m.serial_delimiter", "sReadSerialUntil", 0, "all"],
			[" ", "HamsterS %n : set serial rate to %m.serial_baud Bd", "sSetSerialRateTo", 0, "9600"],
			["r", "HamsterS %n : serial input", "sSerial", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "Turtle %n : move forward %n %m.move_unit", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : move backward %n %m.move_unit", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : turn %m.left_right %n %m.turn_unit in place", "turtleTurnUnitInPlace", 0, "left", 90, "degrees"],
			["w", "Turtle %n : turn %m.left_right %n %m.turn_unit with radius %n cm in %m.head_tail direction", "turtleTurnUnitWithRadiusInDirection", 0, "left", 90, "degrees", 6, "head"],
			["w", "Turtle %n : pivot around %m.left_right wheel %n %m.turn_unit in %m.head_tail direction", "turtlePivotAroundWheelUnitInDirection", 0, "left", 90, "degrees", "head"],
			[" ", "Turtle %n : change wheels by left: %n right: %n", "turtleChangeWheelsByLeftRight", 0, 10, 10],
			[" ", "Turtle %n : set wheels to left: %n right: %n", "turtleSetWheelsToLeftRight", 0, 50, 50],
			[" ", "Turtle %n : change %m.left_right_both wheel by %n", "turtleChangeWheelBy", 0, "left", 10],
			[" ", "Turtle %n : set %m.left_right_both wheel to %n", "turtleSetWheelTo", 0, "left", 50],
			[" ", "Turtle %n : follow %m.line_color line", "turtleFollowLine", 0, "black"],
			["w", "Turtle %n : follow black line until %m.target_color", "turtleFollowLineUntil", 0, "red"],
			["w", "Turtle %n : follow %m.color_line line until black", "turtleFollowLineUntilBlack", 0, "red"],
			["w", "Turtle %n : cross black intersection", "turtleCrossIntersection", 0],
			["w", "Turtle %n : turn %m.left_right_back at black intersection", "turtleTurnAtIntersection", 0, "left"],
			[" ", "Turtle %n : set following speed to %m.speed", "turtleSetFollowingSpeedTo", 0, "5"],
			[" ", "Turtle %n : stop", "turtleStop", 0],
			["-"],
			[" ", "Turtle %n : set head led to %m.led_color", "turtleSetHeadLedTo", 0, "red"],
			[" ", "Turtle %n : change head led by r: %n g: %n b: %n", "turtleChangeHeadLedByRGB", 0, 10, 0, 0],
			[" ", "Turtle %n : set head led to r: %n g: %n b: %n", "turtleSetHeadLedToRGB", 0, 255, 0, 0],
			[" ", "Turtle %n : clear head led", "turtleClearHeadLed", 0],
			["-"],
			[" ", "Turtle %n : play sound %m.sound %n times", "turtlePlaySoundTimes", 0, "beep", 1],
			["w", "Turtle %n : play sound %m.sound %n times until done", "turtlePlaySoundTimesUntilDone", 0, "beep", 1],
			[" ", "Turtle %n : change buzzer by %n", "turtleChangeBuzzerBy", 0, 10],
			[" ", "Turtle %n : set buzzer to %n", "turtleSetBuzzerTo", 0, 1000],
			[" ", "Turtle %n : clear sound", "turtleClearSound", 0],
			[" ", "Turtle %n : play note %m.note %m.octave", "turtlePlayNote", 0, "C", "4"],
			["w", "Turtle %n : play note %m.note %m.octave for %d.beats beats", "turtlePlayNoteForBeats", 0, "C", "4", 0.5],
			["w", "Turtle %n : rest for %d.beats beats", "turtleRestForBeats", 0, 0.25],
			[" ", "Turtle %n : change tempo by %n", "turtleChangeTempoBy", 0, 20],
			[" ", "Turtle %n : set tempo to %n bpm", "turtleSetTempoTo", 0, 60],
			["-"],
			["h", "Turtle %n : when %m.touching_color touched", "turtleWhenColorTouched", 0, "red"],
			["h", "Turtle %n : when color pattern is %m.pattern_color %m.pattern_color", "turtleWhenColorPattern", 0, "red", "yellow"],
			["h", "Turtle %n : when button %m.when_button_state", "turtleWhenButtonState", 0, "clicked"],
			["h", "Turtle %n : when %m.when_tilt", "turtleWhenTilt", 0, "tilt forward"],
			["b", "Turtle %n : touching %m.touching_color ?", "turtleTouchingColor", 0, "red"],
			["b", "Turtle %n : color pattern %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", 0, "red", "yellow"],
			["b", "Turtle %n : button %m.button_state ?", "turtleButtonState", 0, "clicked"],
			["b", "Turtle %n : %m.tilt ?", "turtleTilt", 0, "tilt forward"],
			["b", "Turtle %n : battery %m.battery ?", "turtleBattery", 0, "normal"],
			["r", "Turtle %n : color number", "turtleColorNumber", 0],
			["r", "Turtle %n : color pattern", "turtleColorPattern", 0],
			["r", "Turtle %n : floor", "turtleFloor", 0],
			["r", "Turtle %n : button", "turtleButton", 0],
			["r", "Turtle %n : x acceleration", "turtleAccelerationX", 0],
			["r", "Turtle %n : y acceleration", "turtleAccelerationY", 0],
			["r", "Turtle %n : z acceleration", "turtleAccelerationZ", 0]
		],
		ko1: [
			["w", "햄스터 %n : 말판 앞으로 한 칸 이동하기", "boardMoveForward", 0],
			["w", "햄스터 %n : 말판 %m.left_right 으로 한 번 돌기", "boardTurn", 0, "왼쪽"],
			["-"],
			["w", "햄스터 %n : 앞으로 이동하기", "moveForward", 0],
			["w", "햄스터 %n : 뒤로 이동하기", "moveBackward", 0],
			["w", "햄스터 %n : %m.left_right 으로 돌기", "turn", 0, "왼쪽"],
			["-"],
			[" ", "햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기", "setLedTo", 0, "왼쪽", "빨간색"],
			[" ", "햄스터 %n : %m.left_right_both LED 끄기", "clearLed", 0, "왼쪽"],
			["-"],
			["w", "햄스터 %n : 삐 소리내기", "beep", 0],
			["-"],
			["h", "햄스터 %n : 손 찾았을 때", "whenHandFound", 0],
			["b", "햄스터 %n : 손 찾음?", "handFound", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "햄스터S %n : 말판 앞으로 한 칸 이동하기", "sBoardMoveForward", 0],
			["w", "햄스터S %n : 말판 %m.left_right 으로 한 번 돌기", "sBoardTurn", 0, "왼쪽"],
			["-"],
			["w", "햄스터S %n : 앞으로 이동하기", "sMoveForward", 0],
			["w", "햄스터S %n : 뒤로 이동하기", "sMoveBackward", 0],
			["w", "햄스터S %n : %m.left_right 으로 돌기", "sTurn", 0, "왼쪽"],
			["-"],
			[" ", "햄스터S %n : %m.left_right_both LED를 %m.led_color 으로 정하기", "sSetLedTo", 0, "왼쪽", "빨간색"],
			[" ", "햄스터S %n : %m.left_right_both LED 끄기", "sClearLed", 0, "왼쪽"],
			["-"],
			[" ", "햄스터S %n : %m.sound_effect 소리 재생하기", "sPlaySound", 0, "삐"],
			[" ", "햄스터S %n : 소리 끄기", "sClearSound", 0],
			["-"],
			["h", "햄스터S %n : 손 찾았을 때", "sWhenHandFound", 0],
			["b", "햄스터S %n : 손 찾음?", "sHandFound", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "거북이 %n : 앞으로 이동하기", "turtleMoveForward", 0],
			["w", "거북이 %n : 뒤로 이동하기", "turtleMoveBackward", 0],
			["w", "거북이 %n : %m.left_right 으로 돌기", "turtleTurn", 0, "왼쪽"],
			["-"],
			[" ", "거북이 %n : 머리 LED를 %m.led_color 으로 정하기", "turtleSetHeadLedTo", 0, "빨간색"],
			[" ", "거북이 %n : 머리 LED 끄기", "turtleClearHeadLed", 0],
			["-"],
			[" ", "거북이 %n : %m.sound 소리 재생하기", "turtlePlaySound", 0, "삐"],
			[" ", "거북이 %n : 소리 끄기", "turtleClearSound", 0],
			["-"],
			["h", "거북이 %n : %m.touching_color 에 닿았을 때", "turtleWhenColorTouched", 0, "빨간색"],
			["h", "거북이 %n : 버튼을 %m.when_button_state 때", "turtleWhenButtonState", 0, "클릭했을"],
			["b", "거북이 %n : %m.touching_color 에 닿았는가?", "turtleTouchingColor", 0, "빨간색"],
			["b", "거북이 %n : 버튼을 %m.button_state ?", "turtleButtonState", 0, "클릭했는가"]
		],
		ko2: [
			["w", "햄스터 %n : 말판 앞으로 한 칸 이동하기", "boardMoveForward", 0],
			["w", "햄스터 %n : 말판 %m.left_right 으로 한 번 돌기", "boardTurn", 0, "왼쪽"],
			["-"],
			["w", "햄스터 %n : 앞으로 %n 초 이동하기", "moveForwardForSecs", 0, 1],
			["w", "햄스터 %n : 뒤로 %n 초 이동하기", "moveBackwardForSecs", 0, 1],
			["w", "햄스터 %n : %m.left_right 으로 %n 초 돌기", "turnForSecs", 0, "왼쪽", 1],
			["-"],
			[" ", "햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기", "setLedTo", 0, "왼쪽", "빨간색"],
			[" ", "햄스터 %n : %m.left_right_both LED 끄기", "clearLed", 0, "왼쪽"],
			["-"],
			["w", "햄스터 %n : 삐 소리내기", "beep", 0],
			["w", "햄스터 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기", "playNoteFor", 0, "도", "4", 0.5],
			["w", "햄스터 %n : %d.beats 박자 쉬기", "restFor", 0, 0.25],
			[" ", "햄스터 %n : 연주 속도를 %n 만큼 바꾸기", "changeTempoBy", 0, 20],
			[" ", "햄스터 %n : 연주 속도를 %n BPM으로 정하기", "setTempoTo", 0, 60],
			["-"],
			["h", "햄스터 %n : 손 찾았을 때", "whenHandFound", 0],
			["h", "햄스터 %n : %m.when_tilt 때", "whenTilt", 0, "앞으로 기울였을"],
			["b", "햄스터 %n : 손 찾음?", "handFound", 0],
			["b", "햄스터 %n : %m.tilt ?", "tilt", 0, "앞으로 기울임"],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "햄스터S %n : 말판 앞으로 한 칸 이동하기", "sBoardMoveForward", 0],
			["w", "햄스터S %n : 말판 %m.left_right 으로 한 번 돌기", "sBoardTurn", 0, "왼쪽"],
			["-"],
			["w", "햄스터S %n : 앞으로 %n %m.cm_sec 이동하기", "sMoveForwardUnit", 0, 5, "cm"],
			["w", "햄스터S %n : 뒤로 %n %m.cm_sec 이동하기", "sMoveBackwardUnit", 0, 5, "cm"],
			["w", "햄스터S %n : %m.left_right 으로 %n %m.deg_sec 제자리 돌기", "sTurnUnitInPlace", 0, "왼쪽", 90, "도"],
			["w", "햄스터S %n : %m.left_right 으로 %n %m.deg_sec 반지름 %n cm를 %m.forward_backward 방향으로 돌기", "sTurnUnitWithRadiusInDirection", 0, "왼쪽", 90, "도", 5, "앞쪽"],
			["w", "햄스터S %n : %m.left_right 바퀴 중심으로 %n %m.deg_sec %m.forward_backward 방향으로 돌기", "sPivotAroundWheelUnitInDirection", 0, "왼쪽", 90, "도", "앞쪽"],
			["-"],
			[" ", "햄스터S %n : %m.left_right_both LED를 %m.led_color 으로 정하기", "sSetLedTo", 0, "왼쪽", "빨간색"],
			[" ", "햄스터S %n : %m.left_right_both LED 끄기", "sClearLed", 0, "왼쪽"],
			["-"],
			[" ", "햄스터S %n : %m.sound_effect 소리 %n 번 재생하기", "sPlaySoundTimes", 0, "삐", 1],
			["w", "햄스터S %n : %m.sound_effect 소리 %n 번 재생하고 기다리기", "sPlaySoundTimesUntilDone", 0, "삐", 1],
			[" ", "햄스터S %n : 소리 끄기", "sClearSound", 0],
			["w", "햄스터S %n : %m.note %m.octave 음을 %d.beats 박자 연주하기", "sPlayNoteFor", 0, "도", "4", 0.5],
			["w", "햄스터S %n : %d.beats 박자 쉬기", "sRestFor", 0, 0.25],
			[" ", "햄스터S %n : 연주 속도를 %n 만큼 바꾸기", "sChangeTempoBy", 0, 20],
			[" ", "햄스터S %n : 연주 속도를 %n BPM으로 정하기", "sSetTempoTo", 0, 60],
			["-"],
			["h", "햄스터S %n : 손 찾았을 때", "sWhenHandFound", 0],
			["h", "햄스터S %n : %m.when_s_tilt 때", "sWhenTilt", 0, "앞으로 기울였을"],
			["b", "햄스터S %n : 손 찾음?", "sHandFound", 0],
			["b", "햄스터S %n : %m.s_tilt ?", "sTilt", 0, "앞으로 기울임"],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "거북이 %n : 앞으로 %n %m.cm_sec 이동하기", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "거북이 %n : 뒤로 %n %m.cm_sec 이동하기", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "거북이 %n : %m.left_right 으로 %n %m.deg_sec 제자리 돌기", "turtleTurnUnitInPlace", 0, "왼쪽", 90, "도"],
			["w", "거북이 %n : %m.left_right 으로 %n %m.deg_sec 반지름 %n cm를 %m.head_tail 방향으로 돌기", "turtleTurnUnitWithRadiusInDirection", 0, "왼쪽", 90, "도", 6, "머리"],
			["w", "거북이 %n : %m.left_right 바퀴 중심으로 %n %m.deg_sec %m.head_tail 방향으로 돌기", "turtlePivotAroundWheelUnitInDirection", 0, "왼쪽", 90, "도", "머리"],
			["-"],
			[" ", "거북이 %n : 머리 LED를 %m.led_color 으로 정하기", "turtleSetHeadLedTo", 0, "빨간색"],
			[" ", "거북이 %n : 머리 LED 끄기", "turtleClearHeadLed", 0],
			["-"],
			[" ", "거북이 %n : %m.sound 소리 %n 번 재생하기", "turtlePlaySoundTimes", 0, "삐", 1],
			["w", "거북이 %n : %m.sound 소리 %n 번 재생하고 기다리기", "turtlePlaySoundTimesUntilDone", 0, "삐", 1],
			[" ", "거북이 %n : 소리 끄기", "turtleClearSound", 0],
			["w", "거북이 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기", "turtlePlayNoteForBeats", 0, "도", "4", 0.5],
			["w", "거북이 %n : %d.beats 박자 쉬기", "turtleRestForBeats", 0, 0.25],
			[" ", "거북이 %n : 연주 속도를 %n 만큼 바꾸기", "turtleChangeTempoBy", 0, 20],
			[" ", "거북이 %n : 연주 속도를 %n BPM으로 정하기", "turtleSetTempoTo", 0, 60],
			["-"],
			["h", "거북이 %n : %m.touching_color 에 닿았을 때", "turtleWhenColorTouched", 0, "빨간색"],
			["h", "거북이 %n : 색깔 패턴이 %m.pattern_color %m.pattern_color 일 때", "turtleWhenColorPattern", 0, "빨간색", "노란색"],
			["h", "거북이 %n : 버튼을 %m.when_button_state 때", "turtleWhenButtonState", 0, "클릭했을"],
			["h", "거북이 %n : %m.when_tilt 때", "turtleWhenTilt", 0, "앞으로 기울였을"],
			["b", "거북이 %n : %m.touching_color 에 닿았는가?", "turtleTouchingColor", 0, "빨간색"],
			["b", "거북이 %n : 색깔 패턴이 %m.pattern_color %m.pattern_color 인가?", "turtleIsColorPattern", 0, "빨간색", "노란색"],
			["b", "거북이 %n : 버튼을 %m.button_state ?", "turtleButtonState", 0, "클릭했는가"],
			["b", "거북이 %n : %m.tilt ?", "turtleTilt", 0, "앞으로 기울임"]
		],
		ko3: [
			["w", "햄스터 %n : 말판 앞으로 한 칸 이동하기", "boardMoveForward", 0],
			["w", "햄스터 %n : 말판 %m.left_right 으로 한 번 돌기", "boardTurn", 0, "왼쪽"],
			["-"],
			["w", "햄스터 %n : 앞으로 %n 초 이동하기", "moveForwardForSecs", 0, 1],
			["w", "햄스터 %n : 뒤로 %n 초 이동하기", "moveBackwardForSecs", 0, 1],
			["w", "햄스터 %n : %m.left_right 으로 %n 초 돌기", "turnForSecs", 0, "왼쪽", 1],
			[" ", "햄스터 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "changeBothWheelsBy", 0, 10, 10],
			[" ", "햄스터 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "setBothWheelsTo", 0, 30, 30],
			[" ", "햄스터 %n : %m.left_right_both 바퀴 %n 만큼 바꾸기", "changeWheelBy", 0, "왼쪽", 10],
			[" ", "햄스터 %n : %m.left_right_both 바퀴 %n (으)로 정하기", "setWheelTo", 0, "왼쪽", 30],
			[" ", "햄스터 %n : %m.black_white 선을 %m.left_right_both 바닥 센서로 따라가기", "followLineUsingFloorSensor", 0, "검은색", "왼쪽"],
			["w", "햄스터 %n : %m.black_white 선을 따라 %m.left_right_front_rear 교차로까지 이동하기", "followLineUntilIntersection", 0, "검은색", "앞쪽"],
			[" ", "햄스터 %n : 선 따라가기 속도를 %m.speed (으)로 정하기", "setFollowingSpeedTo", 0, "5"],
			[" ", "햄스터 %n : 정지하기", "stop", 0],
			["-"],
			[" ", "햄스터 %n : %m.left_right_both LED를 %m.color 으로 정하기", "setLedTo", 0, "왼쪽", "빨간색"],
			[" ", "햄스터 %n : %m.left_right_both LED 끄기", "clearLed", 0, "왼쪽"],
			["-"],
			["w", "햄스터 %n : 삐 소리내기", "beep", 0],
			[" ", "햄스터 %n : 버저 음을 %n 만큼 바꾸기", "changeBuzzerBy", 0, 10],
			[" ", "햄스터 %n : 버저 음을 %n (으)로 정하기", "setBuzzerTo", 0, 1000],
			[" ", "햄스터 %n : 버저 끄기", "clearBuzzer", 0],
			[" ", "햄스터 %n : %m.note %m.octave 음을 연주하기", "playNote", 0, "도", "4"],
			["w", "햄스터 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기", "playNoteFor", 0, "도", "4", 0.5],
			["w", "햄스터 %n : %d.beats 박자 쉬기", "restFor", 0, 0.25],
			[" ", "햄스터 %n : 연주 속도를 %n 만큼 바꾸기", "changeTempoBy", 0, 20],
			[" ", "햄스터 %n : 연주 속도를 %n BPM으로 정하기", "setTempoTo", 0, 60],
			["-"],
			["r", "햄스터 %n : 왼쪽 근접 센서", "leftProximity", 0],
			["r", "햄스터 %n : 오른쪽 근접 센서", "rightProximity", 0],
			["r", "햄스터 %n : 왼쪽 바닥 센서", "leftFloor", 0],
			["r", "햄스터 %n : 오른쪽 바닥 센서", "rightFloor", 0],
			["r", "햄스터 %n : x축 가속도", "accelerationX", 0],
			["r", "햄스터 %n : y축 가속도", "accelerationY", 0],
			["r", "햄스터 %n : z축 가속도", "accelerationZ", 0],
			["r", "햄스터 %n : 밝기", "light", 0],
			["r", "햄스터 %n : 온도", "temperature", 0],
			["r", "햄스터 %n : 신호 세기", "signalStrength", 0],
			["h", "햄스터 %n : 손 찾았을 때", "whenHandFound", 0],
			["h", "햄스터 %n : %m.when_tilt 때", "whenTilt", 0, "앞으로 기울였을"],
			["b", "햄스터 %n : 손 찾음?", "handFound", 0],
			["b", "햄스터 %n : %m.tilt ?", "tilt", 0, "앞으로 기울임"],
			["b", "햄스터 %n : 배터리 %m.battery ?", "battery", 0, "정상"],
			["-"],
			[" ", "햄스터 %n : 포트 %m.port 를 %m.mode 으로 정하기", "setPortTo", 0, "A", "아날로그 입력"],
			[" ", "햄스터 %n : 출력 %m.port 를 %n 만큼 바꾸기", "changeOutputBy", 0, "A", 10],
			[" ", "햄스터 %n : 출력 %m.port 를 %n (으)로 정하기", "setOutputTo", 0, "A", 100],
			["w", "햄스터 %n : 집게 %m.open_close", "gripper", 0, "열기"],
			[" ", "햄스터 %n : 집게 끄기", "releaseGripper", 0],
			["r", "햄스터 %n : 입력 A", "inputA", 0],
			["r", "햄스터 %n : 입력 B", "inputB", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "햄스터S %n : 말판 앞으로 한 칸 이동하기", "sBoardMoveForward", 0],
			["w", "햄스터S %n : 말판 %m.left_right 으로 한 번 돌기", "sBoardTurn", 0, "왼쪽"],
			["-"],
			["w", "햄스터S %n : 앞으로 %n %m.move_unit 이동하기", "sMoveForwardUnit", 0, 5, "cm"],
			["w", "햄스터S %n : 뒤로 %n %m.move_unit 이동하기", "sMoveBackwardUnit", 0, 5, "cm"],
			["w", "햄스터S %n : %m.left_right 으로 %n %m.turn_unit 제자리 돌기", "sTurnUnitInPlace", 0, "왼쪽", 90, "도"],
			["w", "햄스터S %n : %m.left_right 으로 %n %m.turn_unit 반지름 %n cm를 %m.forward_backward 방향으로 돌기", "sTurnUnitWithRadiusInDirection", 0, "왼쪽", 90, "도", 5, "앞쪽"],
			["w", "햄스터S %n : %m.left_right 바퀴 중심으로 %n %m.turn_unit %m.forward_backward 방향으로 돌기", "sPivotAroundWheelUnitInDirection", 0, "왼쪽", 90, "도", "앞쪽"],
			["w", "햄스터S %n : %m.left_right 펜, %m.left_right 으로 %n %m.turn_unit 반지름 %n cm를 %m.forward_backward 방향으로 돌기", "sTurnPenUnitWithRadiusInDirection", 0, "왼쪽", "왼쪽", 90, "도", 5, "앞쪽"],
			["w", "햄스터S %n : %m.left_right 펜 중심으로 %n %m.turn_unit %m.forward_backward 방향으로 돌기", "sPivotAroundPenUnitInDirection", 0, "왼쪽", 90, "도", "앞쪽"],
			[" ", "햄스터S %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "sChangeBothWheelsBy", 0, 10, 10],
			[" ", "햄스터S %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "sSetBothWheelsTo", 0, 30, 30],
			[" ", "햄스터S %n : %m.left_right_both 바퀴 %n 만큼 바꾸기", "sChangeWheelBy", 0, "왼쪽", 10],
			[" ", "햄스터S %n : %m.left_right_both 바퀴 %n (으)로 정하기", "sSetWheelTo", 0, "왼쪽", 30],
			[" ", "햄스터S %n : %m.black_white 선을 %m.left_right_both 바닥 센서로 따라가기", "sFollowLineUsingFloorSensor", 0, "검은색", "왼쪽"],
			["w", "햄스터S %n : %m.black_white 선을 따라 %m.left_right_front_rear 교차로까지 이동하기", "sFollowLineUntilIntersection", 0, "검은색", "앞쪽"],
			[" ", "햄스터S %n : 선 따라가기 속도를 %m.speed (으)로 정하기", "sSetFollowingSpeedTo", 0, "5"],
			[" ", "햄스터S %n : 선 따라가기 방향 변화량을 %m.gain (으)로 정하기", "sSetFollowingGainTo", 0, "기본 값"],
			[" ", "햄스터S %n : 정지하기", "sStop", 0],
			["-"],
			[" ", "햄스터S %n : %m.left_right_both LED를 %m.led_color 으로 정하기", "sSetLedTo", 0, "왼쪽", "빨간색"],
			[" ", "햄스터S %n : %m.left_right_both LED를 R: %n G: %n B: %n 만큼 바꾸기", "sChangeLedByRGB", 0, "왼쪽", 10, 0, 0],
			[" ", "햄스터S %n : %m.left_right_both LED를 R: %n G: %n B: %n (으)로 정하기", "sSetLedToRGB", 0, "왼쪽", 255, 0, 0],
			[" ", "햄스터S %n : %m.left_right_both LED 끄기", "sClearLed", 0, "왼쪽"],
			["-"],
			[" ", "햄스터S %n : %m.sound_effect 소리 %n 번 재생하기", "sPlaySoundTimes", 0, "삐", 1],
			["w", "햄스터S %n : %m.sound_effect 소리 %n 번 재생하고 기다리기", "sPlaySoundTimesUntilDone", 0, "삐", 1],
			[" ", "햄스터S %n : 버저 음을 %n 만큼 바꾸기", "sChangeBuzzerBy", 0, 10],
			[" ", "햄스터S %n : 버저 음을 %n (으)로 정하기", "sSetBuzzerTo", 0, 1000],
			[" ", "햄스터S %n : 소리 끄기", "sClearSound", 0],
			[" ", "햄스터S %n : %m.note %m.octave 음을 연주하기", "sPlayNote", 0, "도", "4"],
			["w", "햄스터S %n : %m.note %m.octave 음을 %d.beats 박자 연주하기", "sPlayNoteFor", 0, "도", "4", 0.5],
			["w", "햄스터S %n : %d.beats 박자 쉬기", "sRestFor", 0, 0.25],
			[" ", "햄스터S %n : 연주 속도를 %n 만큼 바꾸기", "sChangeTempoBy", 0, 20],
			[" ", "햄스터S %n : 연주 속도를 %n BPM으로 정하기", "sSetTempoTo", 0, 60],
			["-"],
			["r", "햄스터S %n : 왼쪽 근접 센서", "sLeftProximity", 0],
			["r", "햄스터S %n : 오른쪽 근접 센서", "sRightProximity", 0],
			["r", "햄스터S %n : 왼쪽 바닥 센서", "sLeftFloor", 0],
			["r", "햄스터S %n : 오른쪽 바닥 센서", "sRightFloor", 0],
			["r", "햄스터S %n : x축 가속도", "sAccelerationX", 0],
			["r", "햄스터S %n : y축 가속도", "sAccelerationY", 0],
			["r", "햄스터S %n : z축 가속도", "sAccelerationZ", 0],
			["r", "햄스터S %n : 밝기", "sLight", 0],
			["r", "햄스터S %n : 온도", "sTemperature", 0],
			["r", "햄스터S %n : 신호 세기", "sSignalStrength", 0],
			["h", "햄스터S %n : 손 찾았을 때", "sWhenHandFound", 0],
			["h", "햄스터S %n : %m.when_s_tilt 때", "sWhenTilt", 0, "앞으로 기울였을"],
			["b", "햄스터S %n : 손 찾음?", "sHandFound", 0],
			["b", "햄스터S %n : %m.s_tilt ?", "sTilt", 0, "앞으로 기울임"],
			["b", "햄스터S %n : 배터리 %m.battery ?", "sBattery", 0, "정상"],
			["-"],
			[" ", "햄스터S %n : 포트 %m.port 를 %m.s_mode 으로 정하기", "sSetPortTo", 0, "A", "아날로그 입력"],
			[" ", "햄스터S %n : 출력 %m.port 를 %n 만큼 바꾸기", "sChangeOutputBy", 0, "A", 10],
			[" ", "햄스터S %n : 출력 %m.port 를 %n (으)로 정하기", "sSetOutputTo", 0, "A", 100],
			["w", "햄스터S %n : 집게 %m.open_close", "sGripper", 0, "열기"],
			[" ", "햄스터S %n : 집게 끄기", "sReleaseGripper", 0],
			["r", "햄스터S %n : 입력 A", "sInputA", 0],
			["r", "햄스터S %n : 입력 B", "sInputB", 0],
			["-"],
			["w", "햄스터S %n : 시리얼 %m.serial_output %s 쓰기", "sWriteSerial", 0, "글자", "abc123"],
			["w", "햄스터S %n : 시리얼 %m.serial_delimiter 읽기", "sReadSerialUntil", 0, "모두"],
			[" ", "햄스터S %n : 시리얼 속도를 %m.serial_baud Bd로 정하기", "sSetSerialRateTo", 0, "9600"],
			["r", "햄스터S %n : 시리얼 입력", "sSerial", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "거북이 %n : 앞으로 %n %m.move_unit 이동하기", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "거북이 %n : 뒤로 %n %m.move_unit 이동하기", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "거북이 %n : %m.left_right 으로 %n %m.turn_unit 제자리 돌기", "turtleTurnUnitInPlace", 0, "왼쪽", 90, "도"],
			["w", "거북이 %n : %m.left_right 으로 %n %m.turn_unit 반지름 %n cm를 %m.head_tail 방향으로 돌기", "turtleTurnUnitWithRadiusInDirection", 0, "왼쪽", 90, "도", 6, "머리"],
			["w", "거북이 %n : %m.left_right 바퀴 중심으로 %n %m.turn_unit %m.head_tail 방향으로 돌기", "turtlePivotAroundWheelUnitInDirection", 0, "왼쪽", 90, "도", "머리"],
			[" ", "거북이 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "turtleChangeWheelsByLeftRight", 0, 10, 10],
			[" ", "거북이 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "turtleSetWheelsToLeftRight", 0, 50, 50],
			[" ", "거북이 %n : %m.left_right_both 바퀴 %n 만큼 바꾸기", "turtleChangeWheelBy", 0, "왼쪽", 10],
			[" ", "거북이 %n : %m.left_right_both 바퀴 %n (으)로 정하기", "turtleSetWheelTo", 0, "왼쪽", 50],
			[" ", "거북이 %n : %m.line_color 선을 따라가기", "turtleFollowLine", 0, "검은색"],
			["w", "거북이 %n : 검은색 선을 따라 %m.target_color 까지 이동하기", "turtleFollowLineUntil", 0, "빨간색"],
			["w", "거북이 %n : %m.color_line 선을 따라 검은색까지 이동하기", "turtleFollowLineUntilBlack", 0, "빨간색"],
			["w", "거북이 %n : 검은색 교차로 건너가기", "turtleCrossIntersection", 0],
			["w", "거북이 %n : 검은색 교차로에서 %m.left_right_back 으로 돌기", "turtleTurnAtIntersection", 0, "왼쪽"],
			[" ", "거북이 %n : 선 따라가기 속도를 %m.speed (으)로 정하기", "turtleSetFollowingSpeedTo", 0, "5"],
			[" ", "거북이 %n : 정지하기", "turtleStop", 0],
			["-"],
			[" ", "거북이 %n : 머리 LED를 %m.led_color 으로 정하기", "turtleSetHeadLedTo", 0, "빨간색"],
			[" ", "거북이 %n : 머리 LED를 R: %n G: %n B: %n 만큼 바꾸기", "turtleChangeHeadLedByRGB", 0, 10, 0, 0],
			[" ", "거북이 %n : 머리 LED를 R: %n G: %n B: %n (으)로 정하기", "turtleSetHeadLedToRGB", 0, 255, 0, 0],
			[" ", "거북이 %n : 머리 LED 끄기", "turtleClearHeadLed", 0],
			["-"],
			[" ", "거북이 %n : %m.sound 소리 %n 번 재생하기", "turtlePlaySoundTimes", 0, "삐", 1],
			["w", "거북이 %n : %m.sound 소리 %n 번 재생하고 기다리기", "turtlePlaySoundTimesUntilDone", 0, "삐", 1],
			[" ", "거북이 %n : 버저 음을 %n 만큼 바꾸기", "turtleChangeBuzzerBy", 0, 10],
			[" ", "거북이 %n : 버저 음을 %n (으)로 정하기", "turtleSetBuzzerTo", 0, 1000],
			[" ", "거북이 %n : 소리 끄기", "turtleClearSound", 0],
			[" ", "거북이 %n : %m.note %m.octave 음을 연주하기", "turtlePlayNote", 0, "도", "4"],
			["w", "거북이 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기", "turtlePlayNoteForBeats", 0, "도", "4", 0.5],
			["w", "거북이 %n : %d.beats 박자 쉬기", "turtleRestForBeats", 0, 0.25],
			[" ", "거북이 %n : 연주 속도를 %n 만큼 바꾸기", "turtleChangeTempoBy", 0, 20],
			[" ", "거북이 %n : 연주 속도를 %n BPM으로 정하기", "turtleSetTempoTo", 0, 60],
			["-"],
			["h", "거북이 %n : %m.touching_color 에 닿았을 때", "turtleWhenColorTouched", 0, "빨간색"],
			["h", "거북이 %n : 색깔 패턴이 %m.pattern_color %m.pattern_color 일 때", "turtleWhenColorPattern", 0, "빨간색", "노란색"],
			["h", "거북이 %n : 버튼을 %m.when_button_state 때", "turtleWhenButtonState", 0, "클릭했을"],
			["h", "거북이 %n : %m.when_tilt 때", "turtleWhenTilt", 0, "앞으로 기울였을"],
			["b", "거북이 %n : %m.touching_color 에 닿았는가?", "turtleTouchingColor", 0, "빨간색"],
			["b", "거북이 %n : 색깔 패턴이 %m.pattern_color %m.pattern_color 인가?", "turtleIsColorPattern", 0, "빨간색", "노란색"],
			["b", "거북이 %n : 버튼을 %m.button_state ?", "turtleButtonState", 0, "클릭했는가"],
			["b", "거북이 %n : %m.tilt ?", "turtleTilt", 0, "앞으로 기울임"],
			["b", "거북이 %n : 배터리 %m.battery ?", "turtleBattery", 0, "정상"],
			["r", "거북이 %n : 색깔 번호", "turtleColorNumber", 0],
			["r", "거북이 %n : 색깔 패턴", "turtleColorPattern", 0],
			["r", "거북이 %n : 바닥 센서", "turtleFloor", 0],
			["r", "거북이 %n : 버튼", "turtleButton", 0],
			["r", "거북이 %n : x축 가속도", "turtleAccelerationX", 0],
			["r", "거북이 %n : y축 가속도", "turtleAccelerationY", 0],
			["r", "거북이 %n : z축 가속도", "turtleAccelerationZ", 0]
		],
		ja1: [
			["w", "ハムスター %n : ボード板上で前へ動かす", "boardMoveForward", 0],
			["w", "ハムスター %n : ボード板上で %m.left_right に回す", "boardTurn", 0, "左"],
			["-"],
			["w", "ハムスター %n : 前へ動かす", "moveForward", 0],
			["w", "ハムスター %n : 後ろへ動かす", "moveBackward", 0],
			["w", "ハムスター %n : %m.left_right に回す", "turn", 0, "左"],
			["-"],
			[" ", "ハムスター %n : %m.left_right_both LEDを %m.color にする", "setLedTo", 0, "左", "赤色"],
			[" ", "ハムスター %n : %m.left_right_both LEDをオフ", "clearLed", 0, "左"],
			["-"],
			["w", "ハムスター %n : ビープ", "beep", 0],
			["-"],
			["h", "ハムスター %n : 手を見つけたとき", "whenHandFound", 0],
			["b", "ハムスター %n : 手を見つけたか?", "handFound", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "ハムスターS %n : ボード板上で前へ動かす", "sBoardMoveForward", 0],
			["w", "ハムスターS %n : ボード板上で %m.left_right に回す", "sBoardTurn", 0, "左"],
			["-"],
			["w", "ハムスターS %n : 前へ動かす", "sMoveForward", 0],
			["w", "ハムスターS %n : 後ろへ動かす", "sMoveBackward", 0],
			["w", "ハムスターS %n : %m.left_right に回す", "sTurn", 0, "左"],
			["-"],
			[" ", "ハムスターS %n : %m.left_right_both LEDを %m.led_color にする", "sSetLedTo", 0, "左", "赤色"],
			[" ", "ハムスターS %n : %m.left_right_both LEDをオフ", "sClearLed", 0, "左"],
			["-"],
			[" ", "ハムスターS %n : %m.sound_effect 音を鳴らす", "sPlaySound", 0, "ビープ"],
			[" ", "ハムスターS %n : 音を止める", "sClearSound", 0],
			["-"],
			["h", "ハムスターS %n : 手を見つけたとき", "sWhenHandFound", 0],
			["b", "ハムスターS %n : 手を見つけたか?", "sHandFound", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "カメ %n : 前へ動かす", "turtleMoveForward", 0],
			["w", "カメ %n : 後ろへ動かす", "turtleMoveBackward", 0],
			["w", "カメ %n : %m.left_right に回す", "turtleTurn", 0, "左"],
			["-"],
			[" ", "カメ %n : 頭LEDを %m.led_color にする", "turtleSetHeadLedTo", 0, "赤色"],
			[" ", "カメ %n : 頭LEDをオフ", "turtleClearHeadLed", 0],
			["-"],
			[" ", "カメ %n : %m.sound 音を鳴らす", "turtlePlaySound", 0, "ビープ"],
			[" ", "カメ %n : 音を止める", "turtleClearSound", 0],
			["-"],
			["h", "カメ %n : %m.touching_color に触れたとき", "turtleWhenColorTouched", 0, "赤色"],
			["h", "カメ %n : ボタンを %m.when_button_state とき", "turtleWhenButtonState", 0, "クリックした"],
			["b", "カメ %n : %m.touching_color に触れたか?", "turtleTouchingColor", 0, "赤色"],
			["b", "カメ %n : ボタンを %m.button_state ?", "turtleButtonState", 0, "クリックしたか"]
		],
		ja2: [
			["w", "ハムスター %n : ボード板上で前へ動かす", "boardMoveForward", 0],
			["w", "ハムスター %n : ボード板上で %m.left_right に回す", "boardTurn", 0, "左"],
			["-"],
			["w", "ハムスター %n : 前へ %n 秒動かす", "moveForwardForSecs", 0, 1],
			["w", "ハムスター %n : 後ろへ %n 秒動かす", "moveBackwardForSecs", 0, 1],
			["w", "ハムスター %n : %m.left_right に %n 秒回す", "turnForSecs", 0, "左", 1],
			["-"],
			[" ", "ハムスター %n : %m.left_right_both LEDを %m.color にする", "setLedTo", 0, "左", "赤色"],
			[" ", "ハムスター %n : %m.left_right_both LEDをオフ", "clearLed", 0, "左"],
			["-"],
			["w", "ハムスター %n : ビープ", "beep", 0],
			["w", "ハムスター %n : %m.note %m.octave 音を %d.beats 拍鳴らす", "playNoteFor", 0, "ド", "4", 0.5],
			["w", "ハムスター %n : %d.beats 拍休む", "restFor", 0, 0.25],
			[" ", "ハムスター %n : テンポを %n ずつ変える", "changeTempoBy", 0, 20],
			[" ", "ハムスター %n : テンポを %n BPMにする", "setTempoTo", 0, 60],
			["-"],
			["h", "ハムスター %n : 手を見つけたとき", "whenHandFound", 0],
			["h", "ハムスター %n : %m.when_tilt とき", "whenTilt", 0, "前に傾けた"],
			["b", "ハムスター %n : 手を見つけたか?", "handFound", 0],
			["b", "ハムスター %n : %m.tilt ?", "tilt", 0, "前に傾けたか"],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "ハムスターS %n : ボード板上で前へ動かす", "sBoardMoveForward", 0],
			["w", "ハムスターS %n : ボード板上で %m.left_right に回す", "sBoardTurn", 0, "左"],
			["-"],
			["w", "ハムスターS %n : 前へ %n %m.cm_sec 動かす", "sMoveForwardUnit", 0, 5, "cm"],
			["w", "ハムスターS %n : 後ろへ %n %m.cm_sec 動かす", "sMoveBackwardUnit", 0, 5, "cm"],
			["w", "ハムスターS %n : 所定位置で %m.left_right に %n %m.deg_sec 回す", "sTurnUnitInPlace", 0, "左", 90, "度"],
			["w", "ハムスターS %n : %m.left_right に %n %m.deg_sec 半径 %n cmを %m.forward_backward 方向に回す", "sTurnUnitWithRadiusInDirection", 0, "左", 90, "度", 5, "前"],
			["w", "ハムスターS %n : %m.left_right 車輪を中心に %n %m.deg_sec %m.forward_backward 方向に回す", "sPivotAroundWheelUnitInDirection", 0, "左", 90, "度", "前"],
			["-"],
			[" ", "ハムスターS %n : %m.left_right_both LEDを %m.led_color にする", "sSetLedTo", 0, "左", "赤色"],
			[" ", "ハムスターS %n : %m.left_right_both LEDをオフ", "sClearLed", 0, "左"],
			["-"],
			[" ", "ハムスターS %n : %m.sound_effect 音を %n 回鳴らす", "sPlaySoundTimes", 0, "ビープ", 1],
			["w", "ハムスターS %n : 終わるまで %m.sound_effect 音を %n 回鳴らす", "sPlaySoundTimesUntilDone", 0, "ビープ", 1],
			[" ", "ハムスターS %n : 音を止める", "sClearSound", 0],
			["w", "ハムスターS %n : %m.note %m.octave 音を %d.beats 拍鳴らす", "sPlayNoteFor", 0, "ド", "4", 0.5],
			["w", "ハムスターS %n : %d.beats 拍休む", "sRestFor", 0, 0.25],
			[" ", "ハムスターS %n : テンポを %n ずつ変える", "sChangeTempoBy", 0, 20],
			[" ", "ハムスターS %n : テンポを %n BPMにする", "sSetTempoTo", 0, 60],
			["-"],
			["h", "ハムスターS %n : 手を見つけたとき", "sWhenHandFound", 0],
			["h", "ハムスターS %n : %m.when_s_tilt とき", "sWhenTilt", 0, "前に傾けた"],
			["b", "ハムスターS %n : 手を見つけたか?", "sHandFound", 0],
			["b", "ハムスターS %n : %m.s_tilt ?", "sTilt", 0, "前に傾けたか"],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "カメ %n : 前へ %n %m.cm_sec 動かす", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "カメ %n : 後ろへ %n %m.cm_sec 動かす", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "カメ %n : 所定位置で %m.left_right に %n %m.deg_sec 回す", "turtleTurnUnitInPlace", 0, "左", 90, "度"],
			["w", "カメ %n : %m.left_right に %n %m.deg_sec 半径 %n cmを %m.head_tail 方向に回す", "turtleTurnUnitWithRadiusInDirection", 0, "左", 90, "度", 6, "頭"],
			["w", "カメ %n : %m.left_right 車輪を中心に %n %m.deg_sec %m.head_tail 方向に回す", "turtlePivotAroundWheelUnitInDirection", 0, "左", 90, "度", "頭"],
			["-"],
			[" ", "カメ %n : 頭LEDを %m.led_color にする", "turtleSetHeadLedTo", 0, "赤色"],
			[" ", "カメ %n : 頭LEDをオフ", "turtleClearHeadLed", 0],
			["-"],
			[" ", "カメ %n : %m.sound 音を %n 回鳴らす", "turtlePlaySoundTimes", 0, "ビープ", 1],
			["w", "カメ %n : 終わるまで %m.sound 音を %n 回鳴らす", "turtlePlaySoundTimesUntilDone", 0, "ビープ", 1],
			[" ", "カメ %n : 音を止める", "turtleClearSound", 0],
			["w", "カメ %n : %m.note %m.octave 音を %d.beats 拍鳴らす", "turtlePlayNoteForBeats", 0, "ド", "4", 0.5],
			["w", "カメ %n : %d.beats 拍休む", "turtleRestForBeats", 0, 0.25],
			[" ", "カメ %n : テンポを %n ずつ変える", "turtleChangeTempoBy", 0, 20],
			[" ", "カメ %n : テンポを %n BPMにする", "turtleSetTempoTo", 0, 60],
			["-"],
			["h", "カメ %n : %m.touching_color に触れたとき", "turtleWhenColorTouched", 0, "赤色"],
			["h", "カメ %n : 色パターンが %m.pattern_color %m.pattern_color であるとき", "turtleWhenColorPattern", 0, "赤色", "黄色"],
			["h", "カメ %n : ボタンを %m.when_button_state とき", "turtleWhenButtonState", 0, "クリックした"],
			["h", "カメ %n : %m.when_tilt とき", "turtleWhenTilt", 0, "前に傾けた"],
			["b", "カメ %n : %m.touching_color に触れたか?", "turtleTouchingColor", 0, "赤色"],
			["b", "カメ %n : 色パターンが %m.pattern_color %m.pattern_color ですか?", "turtleIsColorPattern", 0, "赤色", "黄色"],
			["b", "カメ %n : ボタンを %m.button_state ?", "turtleButtonState", 0, "クリックしたか"],
			["b", "カメ %n : %m.tilt ?", "turtleTilt", 0, "前に傾けたか"]
		],
		ja3: [
			["w", "ハムスター %n : ボード板上で前へ動かす", "boardMoveForward", 0],
			["w", "ハムスター %n : ボード板上で %m.left_right に回す", "boardTurn", 0, "左"],
			["-"],
			["w", "ハムスター %n : 前へ %n 秒動かす", "moveForwardForSecs", 0, 1],
			["w", "ハムスター %n : 後ろへ %n 秒動かす", "moveBackwardForSecs", 0, 1],
			["w", "ハムスター %n : %m.left_right に %n 秒回す", "turnForSecs", 0, "左", 1],
			[" ", "ハムスター %n : 左車輪を %n 右車輪を %n ずつ変える", "changeBothWheelsBy", 0, 10, 10],
			[" ", "ハムスター %n : 左車輪を %n 右車輪を %n にする", "setBothWheelsTo", 0, 30, 30],
			[" ", "ハムスター %n : %m.left_right_both 車輪を %n ずつ変える", "changeWheelBy", 0, "左", 10],
			[" ", "ハムスター %n : %m.left_right_both 車輪を %n にする", "setWheelTo", 0, "左", 30],
			[" ", "ハムスター %n : %m.black_white 線を %m.left_right_both フロアセンサーで追従する", "followLineUsingFloorSensor", 0, "黒色", "左"],
			["w", "ハムスター %n : %m.black_white 線を追従して %m.left_right_front_rear 交差点まで動かす", "followLineUntilIntersection", 0, "黒色", "前"],
			[" ", "ハムスター %n : 線を追従する速度を %m.speed にする", "setFollowingSpeedTo", 0, "5"],
			[" ", "ハムスター %n : 停止する", "stop", 0],
			["-"],
			[" ", "ハムスター %n : %m.left_right_both LEDを %m.color にする", "setLedTo", 0, "左", "赤色"],
			[" ", "ハムスター %n : %m.left_right_both LEDをオフ", "clearLed", 0, "左"],
			["-"],
			["w", "ハムスター %n : ビープ", "beep", 0],
			[" ", "ハムスター %n : ブザー音を %n ずつ変える", "changeBuzzerBy", 0, 10],
			[" ", "ハムスター %n : ブザー音を %n にする", "setBuzzerTo", 0, 1000],
			[" ", "ハムスター %n : ブザー音を止める", "clearBuzzer", 0],
			[" ", "ハムスター %n : %m.note %m.octave 音を鳴らす", "playNote", 0, "ド", "4"],
			["w", "ハムスター %n : %m.note %m.octave 音を %d.beats 拍鳴らす", "playNoteFor", 0, "ド", "4", 0.5],
			["w", "ハムスター %n : %d.beats 拍休む", "restFor", 0, 0.25],
			[" ", "ハムスター %n : テンポを %n ずつ変える", "changeTempoBy", 0, 20],
			[" ", "ハムスター %n : テンポを %n BPMにする", "setTempoTo", 0, 60],
			["-"],
			["r", "ハムスター %n : 左近接センサー", "leftProximity", 0],
			["r", "ハムスター %n : 右近接センサー", "rightProximity", 0],
			["r", "ハムスター %n : 左フロアセンサー", "leftFloor", 0],
			["r", "ハムスター %n : 右フロアセンサー", "rightFloor", 0],
			["r", "ハムスター %n : x軸加速度", "accelerationX", 0],
			["r", "ハムスター %n : y軸加速度", "accelerationY", 0],
			["r", "ハムスター %n : z軸加速度", "accelerationZ", 0],
			["r", "ハムスター %n : 照度", "light", 0],
			["r", "ハムスター %n : 温度", "temperature", 0],
			["r", "ハムスター %n : 信号強度", "signalStrength", 0],
			["h", "ハムスター %n : 手を見つけたとき", "whenHandFound", 0],
			["h", "ハムスター %n : %m.when_tilt とき", "whenTilt", 0, "前に傾けた"],
			["b", "ハムスター %n : 手を見つけたか?", "handFound", 0],
			["b", "ハムスター %n : %m.tilt ?", "tilt", 0, "前に傾けたか"],
			["b", "ハムスター %n : 電池が %m.battery ?", "battery", 0, "正常か"],
			["-"],
			[" ", "ハムスター %n : ポート %m.port を %m.mode にする", "setPortTo", 0, "A", "アナログ入力"],
			[" ", "ハムスター %n : 出力 %m.port を %n ずつ変える", "changeOutputBy", 0, "A", 10],
			[" ", "ハムスター %n : 出力 %m.port を %n にする", "setOutputTo", 0, "A", 100],
			["w", "ハムスター %n : グリッパを %m.open_close", "gripper", 0, "開く"],
			[" ", "ハムスター %n : グリッパをオフ", "releaseGripper", 0],
			["r", "ハムスター %n : 入力A", "inputA", 0],
			["r", "ハムスター %n : 入力B", "inputB", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "ハムスターS %n : ボード板上で前へ動かす", "sBoardMoveForward", 0],
			["w", "ハムスターS %n : ボード板上で %m.left_right に回す", "sBoardTurn", 0, "左"],
			["-"],
			["w", "ハムスターS %n : 前へ %n %m.move_unit 動かす", "sMoveForwardUnit", 0, 5, "cm"],
			["w", "ハムスターS %n : 後ろへ %n %m.move_unit 動かす", "sMoveBackwardUnit", 0, 5, "cm"],
			["w", "ハムスターS %n : 所定位置で %m.left_right に %n %m.turn_unit 回す", "sTurnUnitInPlace", 0, "左", 90, "度"],
			["w", "ハムスターS %n : %m.left_right に %n %m.turn_unit 半径 %n cmを %m.forward_backward 方向に回す", "sTurnUnitWithRadiusInDirection", 0, "左", 90, "度", 5, "前"],
			["w", "ハムスターS %n : %m.left_right 車輪を中心に %n %m.turn_unit %m.forward_backward 方向に回す", "sPivotAroundWheelUnitInDirection", 0, "左", 90, "度", "前"],
			["w", "ハムスターS %n : %m.left_right ペン、 %m.left_right に %n %m.turn_unit 半径 %n cmを %m.forward_backward 方向に回す", "sTurnPenUnitWithRadiusInDirection", 0, "左", "左", 90, "度", 5, "前"],
			["w", "ハムスターS %n : %m.left_right ペンを中心に %n %m.turn_unit %m.forward_backward 方向に回す", "sPivotAroundPenUnitInDirection", 0, "左", 90, "度", "前"],
			[" ", "ハムスターS %n : 左車輪を %n 右車輪を %n ずつ変える", "sChangeBothWheelsBy", 0, 10, 10],
			[" ", "ハムスターS %n : 左車輪を %n 右車輪を %n にする", "sSetBothWheelsTo", 0, 30, 30],
			[" ", "ハムスターS %n : %m.left_right_both 車輪を %n ずつ変える", "sChangeWheelBy", 0, "左", 10],
			[" ", "ハムスターS %n : %m.left_right_both 車輪を %n にする", "sSetWheelTo", 0, "左", 30],
			[" ", "ハムスターS %n : %m.black_white 線を %m.left_right_both フロアセンサーで追従する", "sFollowLineUsingFloorSensor", 0, "黒色", "左"],
			["w", "ハムスターS %n : %m.black_white 線を追従して %m.left_right_front_rear 交差点まで動かす", "sFollowLineUntilIntersection", 0, "黒色", "前"],
			[" ", "ハムスターS %n : 線を追従する速度を %m.speed にする", "sSetFollowingSpeedTo", 0, "5"],
			[" ", "ハムスターS %n : 線を追従する方向変化量を %m.gain にする", "sSetFollowingGainTo", 0, "基本値"],
			[" ", "ハムスターS %n : 停止する", "sStop", 0],
			["-"],
			[" ", "ハムスターS %n : %m.left_right_both LEDを %m.led_color にする", "sSetLedTo", 0, "左", "赤色"],
			[" ", "ハムスターS %n : %m.left_right_both LEDをR: %n G: %n B: %n ずつ変える", "sChangeLedByRGB", 0, "左", 10, 0, 0],
			[" ", "ハムスターS %n : %m.left_right_both LEDをR: %n G: %n B: %n にする", "sSetLedToRGB", 0, "左", 255, 0, 0],
			[" ", "ハムスターS %n : %m.left_right_both LEDをオフ", "sClearLed", 0, "左"],
			["-"],
			[" ", "ハムスターS %n : %m.sound_effect 音を %n 回鳴らす", "sPlaySoundTimes", 0, "ビープ", 1],
			["w", "ハムスターS %n : 終わるまで %m.sound_effect 音を %n 回鳴らす", "sPlaySoundTimesUntilDone", 0, "ビープ", 1],
			[" ", "ハムスターS %n : ブザー音を %n ずつ変える", "sChangeBuzzerBy", 0, 10],
			[" ", "ハムスターS %n : ブザー音を %n にする", "sSetBuzzerTo", 0, 1000],
			[" ", "ハムスターS %n : 音を止める", "sClearSound", 0],
			[" ", "ハムスターS %n : %m.note %m.octave 音を鳴らす", "sPlayNote", 0, "ド", "4"],
			["w", "ハムスターS %n : %m.note %m.octave 音を %d.beats 拍鳴らす", "sPlayNoteFor", 0, "ド", "4", 0.5],
			["w", "ハムスターS %n : %d.beats 拍休む", "sRestFor", 0, 0.25],
			[" ", "ハムスターS %n : テンポを %n ずつ変える", "sChangeTempoBy", 0, 20],
			[" ", "ハムスターS %n : テンポを %n BPMにする", "sSetTempoTo", 0, 60],
			["-"],
			["r", "ハムスターS %n : 左近接センサー", "sLeftProximity", 0],
			["r", "ハムスターS %n : 右近接センサー", "sRightProximity", 0],
			["r", "ハムスターS %n : 左フロアセンサー", "sLeftFloor", 0],
			["r", "ハムスターS %n : 右フロアセンサー", "sRightFloor", 0],
			["r", "ハムスターS %n : x軸加速度", "sAccelerationX", 0],
			["r", "ハムスターS %n : y軸加速度", "sAccelerationY", 0],
			["r", "ハムスターS %n : z軸加速度", "sAccelerationZ", 0],
			["r", "ハムスターS %n : 照度", "sLight", 0],
			["r", "ハムスターS %n : 温度", "sTemperature", 0],
			["r", "ハムスターS %n : 信号強度", "sSignalStrength", 0],
			["h", "ハムスターS %n : 手を見つけたとき", "sWhenHandFound", 0],
			["h", "ハムスターS %n : %m.when_s_tilt とき", "sWhenTilt", 0, "前に傾けた"],
			["b", "ハムスターS %n : 手を見つけたか?", "sHandFound", 0],
			["b", "ハムスターS %n : %m.s_tilt ?", "sTilt", 0, "前に傾けたか"],
			["b", "ハムスターS %n : 電池が %m.battery ?", "sBattery", 0, "正常か"],
			["-"],
			[" ", "ハムスターS %n : ポート %m.port を %m.s_mode にする", "sSetPortTo", 0, "A", "アナログ入力"],
			[" ", "ハムスターS %n : 出力 %m.port を %n ずつ変える", "sChangeOutputBy", 0, "A", 10],
			[" ", "ハムスターS %n : 出力 %m.port を %n にする", "sSetOutputTo", 0, "A", 100],
			["w", "ハムスターS %n : グリッパを %m.open_close", "sGripper", 0, "開く"],
			[" ", "ハムスターS %n : グリッパをオフ", "sReleaseGripper", 0],
			["r", "ハムスターS %n : 入力A", "sInputA", 0],
			["r", "ハムスターS %n : 入力B", "sInputB", 0],
			["-"],
			["w", "ハムスターS %n : シリアルに %m.serial_output %s を書き出す", "sWriteSerial", 0, "文字列", "abc123"],
			["w", "ハムスターS %n : シリアルを %m.serial_delimiter 読み取る", "sReadSerialUntil", 0, "全部"],
			[" ", "ハムスターS %n : シリアル速度を %m.serial_baud Bdにする", "sSetSerialRateTo", 0, "9600"],
			["r", "ハムスターS %n : シリアル入力", "sSerial", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "カメ %n : 前へ %n %m.move_unit 動かす", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "カメ %n : 後ろへ %n %m.move_unit 動かす", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "カメ %n : 所定位置で %m.left_right に %n %m.turn_unit 回す", "turtleTurnUnitInPlace", 0, "左", 90, "度"],
			["w", "カメ %n : %m.left_right に %n %m.turn_unit 半径 %n cmを %m.head_tail 方向に回す", "turtleTurnUnitWithRadiusInDirection", 0, "左", 90, "度", 6, "頭"],
			["w", "カメ %n : %m.left_right 車輪を中心に %n %m.turn_unit %m.head_tail 方向に回す", "turtlePivotAroundWheelUnitInDirection", 0, "左", 90, "度", "頭"],
			[" ", "カメ %n : 左車輪を %n 右車輪を %n ずつ変える", "turtleChangeWheelsByLeftRight", 0, 10, 10],
			[" ", "カメ %n : 左車輪を %n 右車輪を %n にする", "turtleSetWheelsToLeftRight", 0, 50, 50],
			[" ", "カメ %n : %m.left_right_both 車輪を %n ずつ変える", "turtleChangeWheelBy", 0, "左", 10],
			[" ", "カメ %n : %m.left_right_both 車輪を %n にする", "turtleSetWheelTo", 0, "左", 50],
			[" ", "カメ %n : %m.line_color 線を追従する", "turtleFollowLine", 0, "黒色"],
			["w", "カメ %n : 黒色線を追従して %m.target_color まで動かす", "turtleFollowLineUntil", 0, "赤色"],
			["w", "カメ %n : %m.color_line 線を追従して黒色まで動かす", "turtleFollowLineUntilBlack", 0, "赤色"],
			["w", "カメ %n : 黒色交差点を渡る", "turtleCrossIntersection", 0],
			["w", "カメ %n : 黒色交差点で %m.left_right_back に回す", "turtleTurnAtIntersection", 0, "左"],
			[" ", "カメ %n : 線を追従する速度を %m.speed にする", "turtleSetFollowingSpeedTo", 0, "5"],
			[" ", "カメ %n : 停止する", "turtleStop", 0],
			["-"],
			[" ", "カメ %n : 頭LEDを %m.led_color にする", "turtleSetHeadLedTo", 0, "赤色"],
			[" ", "カメ %n : 頭LEDをR: %n G: %n B: %n ずつ変える", "turtleChangeHeadLedByRGB", 0, 10, 0, 0],
			[" ", "カメ %n : 頭LEDをR: %n G: %n B: %n にする", "turtleSetHeadLedToRGB", 0, 255, 0, 0],
			[" ", "カメ %n : 頭LEDをオフ", "turtleClearHeadLed", 0],
			["-"],
			[" ", "カメ %n : %m.sound 音を %n 回鳴らす", "turtlePlaySoundTimes", 0, "ビープ", 1],
			["w", "カメ %n : 終わるまで %m.sound 音を %n 回鳴らす", "turtlePlaySoundTimesUntilDone", 0, "ビープ", 1],
			[" ", "カメ %n : ブザー音を %n ずつ変える", "turtleChangeBuzzerBy", 0, 10],
			[" ", "カメ %n : ブザー音を %n にする", "turtleSetBuzzerTo", 0, 1000],
			[" ", "カメ %n : 音を止める", "turtleClearSound", 0],
			[" ", "カメ %n : %m.note %m.octave 音を鳴らす", "turtlePlayNote", 0, "ド", "4"],
			["w", "カメ %n : %m.note %m.octave 音を %d.beats 拍鳴らす", "turtlePlayNoteForBeats", 0, "ド", "4", 0.5],
			["w", "カメ %n : %d.beats 拍休む", "turtleRestForBeats", 0, 0.25],
			[" ", "カメ %n : テンポを %n ずつ変える", "turtleChangeTempoBy", 0, 20],
			[" ", "カメ %n : テンポを %n BPMにする", "turtleSetTempoTo", 0, 60],
			["-"],
			["h", "カメ %n : %m.touching_color に触れたとき", "turtleWhenColorTouched", 0, "赤色"],
			["h", "カメ %n : 色パターンが %m.pattern_color %m.pattern_color であるとき", "turtleWhenColorPattern", 0, "赤色", "黄色"],
			["h", "カメ %n : ボタンを %m.when_button_state とき", "turtleWhenButtonState", 0, "クリックした"],
			["h", "カメ %n : %m.when_tilt とき", "turtleWhenTilt", 0, "前に傾けた"],
			["b", "カメ %n : %m.touching_color に触れたか?", "turtleTouchingColor", 0, "赤色"],
			["b", "カメ %n : 色パターンが %m.pattern_color %m.pattern_color ですか?", "turtleIsColorPattern", 0, "赤色", "黄色"],
			["b", "カメ %n : ボタンを %m.button_state ?", "turtleButtonState", 0, "クリックしたか"],
			["b", "カメ %n : %m.tilt ?", "turtleTilt", 0, "前に傾けたか"],
			["b", "カメ %n : 電池が %m.battery ?", "turtleBattery", 0, "正常か"],
			["r", "カメ %n : 色番号", "turtleColorNumber", 0],
			["r", "カメ %n : 色パターン", "turtleColorPattern", 0],
			["r", "カメ %n : フロアセンサー", "turtleFloor", 0],
			["r", "カメ %n : ボタン", "turtleButton", 0],
			["r", "カメ %n : x軸加速度", "turtleAccelerationX", 0],
			["r", "カメ %n : y軸加速度", "turtleAccelerationY", 0],
			["r", "カメ %n : z軸加速度", "turtleAccelerationZ", 0]
		],
		uz1: [
			["w", "Hamster %n : doskada bir marta oldinga yurish", "boardMoveForward", 0],
			["w", "Hamster %n : doskada bir marta %m.left_right ga o'girish", "boardTurn", 0, "chap"],
			["-"],
			["w", "Hamster %n : oldinga yurish", "moveForward", 0],
			["w", "Hamster %n : orqaga yurish", "moveBackward", 0],
			["w", "Hamster %n : %m.left_right ga o'girilish", "turn", 0, "chap"],
			["-"],
			[" ", "Hamster %n : %m.left_right_both LEDni %m.color ga sozlash", "setLedTo", 0, "chap", "qizil"],
			[" ", "Hamster %n : %m.left_right_both LEDni o'chirish", "clearLed", 0, "chap"],
			["-"],
			["w", "Hamster %n : ovoz chiqarish", "beep", 0],
			["-"],
			["h", "Hamster %n : qo'l topilganda", "whenHandFound", 0],
			["b", "Hamster %n : qo'l topildimi?", "handFound", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "HamsterS %n : doskada bir marta oldinga yurish", "sBoardMoveForward", 0],
			["w", "HamsterS %n : doskada bir marta %m.left_right ga o'girish", "sBoardTurn", 0, "chap"],
			["-"],
			["w", "HamsterS %n : oldinga yurish", "sMoveForward", 0],
			["w", "HamsterS %n : orqaga yurish", "sMoveBackward", 0],
			["w", "HamsterS %n : %m.left_right ga o'girilish", "sTurn", 0, "chap"],
			["-"],
			[" ", "HamsterS %n : %m.left_right_both LEDni %m.led_color ga sozlash", "sSetLedTo", 0, "chap", "qizil"],
			[" ", "HamsterS %n : %m.left_right_both LEDni o'chirish", "sClearLed", 0, "chap"],
			["-"],
			[" ", "HamsterS %n : %m.sound_effect tovushni ijro etish", "sPlaySound", 0, "qisqa"],
			[" ", "HamsterS %n : tovushni o'chirish", "sClearSound", 0],
			["-"],
			["h", "HamsterS %n : qo'l topilganda", "sWhenHandFound", 0],
			["b", "HamsterS %n : qo'l topildimi?", "sHandFound", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "Turtle %n : oldinga yurish", "turtleMoveForward", 0],
			["w", "Turtle %n : orqaga yurish", "turtleMoveBackward", 0],
			["w", "Turtle %n : %m.left_right ga o'girilish", "turtleTurn", 0, "chap"],
			["-"],
			[" ", "Turtle %n : boshining LEDni %m.led_color ga sozlash", "turtleSetHeadLedTo", 0, "qizil"],
			[" ", "Turtle %n : boshining LEDni o'chirish", "turtleClearHeadLed", 0],
			["-"],
			[" ", "Turtle %n : %m.sound tovushni ijro etish", "turtlePlaySound", 0, "qisqa"],
			[" ", "Turtle %n : tovushni o'chirish", "turtleClearSound", 0],
			["-"],
			["h", "Turtle %n : %m.touching_color ga tegilganda", "turtleWhenColorTouched", 0, "qizil"],
			["h", "Turtle %n : tugmani %m.when_button_state da", "turtleWhenButtonState", 0, "bosgan"],
			["b", "Turtle %n : %m.touching_color ga tekkan?", "turtleTouchingColor", 0, "qizil"],
			["b", "Turtle %n : tugmani %m.button_state ?", "turtleButtonState", 0, "bosgan"]
		],
		uz2: [
			["w", "Hamster %n : doskada bir marta oldinga yurish", "boardMoveForward", 0],
			["w", "Hamster %n : doskada bir marta %m.left_right ga o'girish", "boardTurn", 0, "chap"],
			["-"],
			["w", "Hamster %n : oldinga %n soniya yurish", "moveForwardForSecs", 0, 1],
			["w", "Hamster %n : orqaga %n soniya yurish", "moveBackwardForSecs", 0, 1],
			["w", "Hamster %n : %m.left_right ga %n soniya o'girilish", "turnForSecs", 0, "chap", 1],
			["-"],
			[" ", "Hamster %n : %m.left_right_both LEDni %m.color ga sozlash", "setLedTo", 0, "chap", "qizil"],
			[" ", "Hamster %n : %m.left_right_both LEDni o'chirish", "clearLed", 0, "chap"],
			["-"],
			["w", "Hamster %n : ovoz chiqarish", "beep", 0],
			["w", "Hamster %n : %m.note %m.octave notani %d.beats zarb ijro etish", "playNoteFor", 0, "do", "4", 0.5],
			["w", "Hamster %n : %d.beats zarb tanaffus", "restFor", 0, 0.25],
			[" ", "Hamster %n : temni %n ga o'zgartirish", "changeTempoBy", 0, 20],
			[" ", "Hamster %n : temni %n bpm ga sozlash", "setTempoTo", 0, 60],
			["-"],
			["h", "Hamster %n : qo'l topilganda", "whenHandFound", 0],
			["h", "Hamster %n : %m.when_tilt bo'lganda", "whenTilt", 0, "oldinga eğin"],
			["b", "Hamster %n : qo'l topildimi?", "handFound", 0],
			["b", "Hamster %n : %m.tilt ?", "tilt", 0, "oldinga eğin"],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "HamsterS %n : doskada bir marta oldinga yurish", "sBoardMoveForward", 0],
			["w", "HamsterS %n : doskada bir marta %m.left_right ga o'girish", "sBoardTurn", 0, "chap"],
			["-"],
			["w", "HamsterS %n : oldinga %n %m.cm_sec yurish", "sMoveForwardUnit", 0, 5, "cm"],
			["w", "HamsterS %n : orqaga %n %m.cm_sec yurish", "sMoveBackwardUnit", 0, 5, "cm"],
			["w", "HamsterS %n : %m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "sTurnUnitInPlace", 0, "chap", 90, "daraja"],
			["w", "HamsterS %n : %m.left_right ga %n %m.deg_sec radius %n cm %m.forward_backward yo'nalishga o'girilish", "sTurnUnitWithRadiusInDirection", 0, "chap", 90, "daraja", 5, "old"],
			["w", "HamsterS %n : %m.left_right g'ildirak markaziga %n %m.deg_sec %m.forward_backward yo'nalishga o'girilish", "sPivotAroundWheelUnitInDirection", 0, "chap", 90, "daraja", "old"],
			["-"],
			[" ", "HamsterS %n : %m.left_right_both LEDni %m.led_color ga sozlash", "sSetLedTo", 0, "chap", "qizil"],
			[" ", "HamsterS %n : %m.left_right_both LEDni o'chirish", "sClearLed", 0, "chap"],
			["-"],
			[" ", "HamsterS %n : %m.sound_effect tovushni %n marta ijro etish", "sPlaySoundTimes", 0, "qisqa", 1],
			["w", "HamsterS %n : %m.sound_effect tovushni %n marta ijro tugaguncha kutish", "sPlaySoundTimesUntilDone", 0, "qisqa", 1],
			[" ", "HamsterS %n : tovushni o'chirish", "sClearSound", 0],
			["w", "HamsterS %n : %m.note %m.octave notani %d.beats zarb ijro etish", "sPlayNoteFor", 0, "do", "4", 0.5],
			["w", "HamsterS %n : %d.beats zarb tanaffus", "sRestFor", 0, 0.25],
			[" ", "HamsterS %n : temni %n ga o'zgartirish", "sChangeTempoBy", 0, 20],
			[" ", "HamsterS %n : temni %n bpm ga sozlash", "sSetTempoTo", 0, 60],
			["-"],
			["h", "HamsterS %n : qo'l topilganda", "sWhenHandFound", 0],
			["h", "HamsterS %n : %m.when_s_tilt bo'lganda", "sWhenTilt", 0, "oldinga eğin"],
			["b", "HamsterS %n : qo'l topildimi?", "sHandFound", 0],
			["b", "HamsterS %n : %m.s_tilt ?", "sTilt", 0, "oldinga eğin"],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "Turtle %n : oldinga %n %m.cm_sec yurish", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : orqaga %n %m.cm_sec yurish", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : %m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "turtleTurnUnitInPlace", 0, "chap", 90, "daraja"],
			["w", "Turtle %n : %m.left_right ga %n %m.deg_sec radius %n cm %m.head_tail yo'nalishga o'girilish", "turtleTurnUnitWithRadiusInDirection", 0, "chap", 90, "daraja", 6, "bosh"],
			["w", "Turtle %n : %m.left_right g'ildirak markaziga %n %m.deg_sec %m.head_tail yo'nalishga o'girilish", "turtlePivotAroundWheelUnitInDirection", 0, "chap", 90, "daraja", "bosh"],
			["-"],
			[" ", "Turtle %n : boshining LEDni %m.led_color ga sozlash", "turtleSetHeadLedTo", 0, "qizil"],
			[" ", "Turtle %n : boshining LEDni o'chirish", "turtleClearHeadLed", 0],
			["-"],
			[" ", "Turtle %n : %m.sound tovushni %n marta ijro etish", "turtlePlaySoundTimes", 0, "qisqa", 1],
			["w", "Turtle %n : %m.sound tovushni %n marta ijro tugaguncha kutish", "turtlePlaySoundTimesUntilDone", 0, "qisqa", 1],
			[" ", "Turtle %n : tovushni o'chirish", "turtleClearSound", 0],
			["w", "Turtle %n : %m.note %m.octave notani %d.beats zarb ijro etish", "turtlePlayNoteForBeats", 0, "do", "4", 0.5],
			["w", "Turtle %n : %d.beats zarb tanaffus", "turtleRestForBeats", 0, 0.25],
			[" ", "Turtle %n : temni %n ga o'zgartirish", "turtleChangeTempoBy", 0, 20],
			[" ", "Turtle %n : temni %n bpm ga sozlash", "turtleSetTempoTo", 0, 60],
			["-"],
			["h", "Turtle %n : %m.touching_color ga tegilganda", "turtleWhenColorTouched", 0, "qizil"],
			["h", "Turtle %n : rang naqshi %m.pattern_color %m.pattern_color bo'lganida", "turtleWhenColorPattern", 0, "qizil", "sariq"],
			["h", "Turtle %n : tugmani %m.when_button_state da", "turtleWhenButtonState", 0, "bosgan"],
			["h", "Turtle %n : %m.when_tilt bo'lganda", "turtleWhenTilt", 0, "oldinga eğin"],
			["b", "Turtle %n : %m.touching_color ga tekkan?", "turtleTouchingColor", 0, "qizil"],
			["b", "Turtle %n : rang naqshi %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", 0, "qizil", "sariq"],
			["b", "Turtle %n : tugmani %m.button_state ?", "turtleButtonState", 0, "bosgan"],
			["b", "Turtle %n : %m.tilt ?", "turtleTilt", 0, "oldinga eğin"]
		],
		uz3: [
			["w", "Hamster %n : doskada bir marta oldinga yurish", "boardMoveForward", 0],
			["w", "Hamster %n : doskada bir marta %m.left_right ga o'girish", "boardTurn", 0, "chap"],
			["-"],
			["w", "Hamster %n : oldinga %n soniya yurish", "moveForwardForSecs", 0, 1],
			["w", "Hamster %n : orqaga %n soniya yurish", "moveBackwardForSecs", 0, 1],
			["w", "Hamster %n : %m.left_right ga %n soniya o'girilish", "turnForSecs", 0, "chap", 1],
			[" ", "Hamster %n : chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "changeBothWheelsBy", 0, 10, 10],
			[" ", "Hamster %n : chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "setBothWheelsTo", 0, 30, 30],
			[" ", "Hamster %n : %m.left_right_both g'ildirakni %n ga o'zgartirish", "changeWheelBy", 0, "chap", 10],
			[" ", "Hamster %n : %m.left_right_both g'ildirakni %n ga sozlash", "setWheelTo", 0, "chap", 30],
			[" ", "Hamster %n : %m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish", "followLineUsingFloorSensor", 0, "qora", "chap"],
			["w", "Hamster %n : %m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish", "followLineUntilIntersection", 0, "qora", "old"],
			[" ", "Hamster %n : liniyada ergashish tezligini %m.speed ga sozlash", "setFollowingSpeedTo", 0, "5"],
			[" ", "Hamster %n : to'xtatish", "stop", 0],
			["-"],
			[" ", "Hamster %n : %m.left_right_both LEDni %m.color ga sozlash", "setLedTo", 0, "chap", "qizil"],
			[" ", "Hamster %n : %m.left_right_both LEDni o'chirish", "clearLed", 0, "chap"],
			["-"],
			["w", "Hamster %n : ovoz chiqarish", "beep", 0],
			[" ", "Hamster %n : buzerning ovozini %n ga o'zgartirish", "changeBuzzerBy", 0, 10],
			[" ", "Hamster %n : buzerning ovozini %n ga sozlash", "setBuzzerTo", 0, 1000],
			[" ", "Hamster %n : buzerni o'chirish", "clearBuzzer", 0],
			[" ", "Hamster %n : %m.note %m.octave notani ijro etish", "playNote", 0, "do", "4"],
			["w", "Hamster %n : %m.note %m.octave notani %d.beats zarb ijro etish", "playNoteFor", 0, "do", "4", 0.5],
			["w", "Hamster %n : %d.beats zarb tanaffus", "restFor", 0, 0.25],
			[" ", "Hamster %n : temni %n ga o'zgartirish", "changeTempoBy", 0, 20],
			[" ", "Hamster %n : temni %n bpm ga sozlash", "setTempoTo", 0, 60],
			["-"],
			["r", "Hamster %n : chap yaqinlik", "leftProximity", 0],
			["r", "Hamster %n : o'ng yaqinlik", "rightProximity", 0],
			["r", "Hamster %n : chap taglik", "leftFloor", 0],
			["r", "Hamster %n : o'ng taglik", "rightFloor", 0],
			["r", "Hamster %n : x tezlanish", "accelerationX", 0],
			["r", "Hamster %n : y tezlanish", "accelerationY", 0],
			["r", "Hamster %n : z tezlanish", "accelerationZ", 0],
			["r", "Hamster %n : yorug'lik", "light", 0],
			["r", "Hamster %n : harorat", "temperature", 0],
			["r", "Hamster %n : signal kuchi", "signalStrength", 0],
			["h", "Hamster %n : qo'l topilganda", "whenHandFound", 0],
			["h", "Hamster %n : %m.when_tilt bo'lganda", "whenTilt", 0, "oldinga eğin"],
			["b", "Hamster %n : qo'l topildimi?", "handFound", 0],
			["b", "Hamster %n : %m.tilt ?", "tilt", 0, "oldinga eğin"],
			["b", "Hamster %n : batareya %m.battery ?", "battery", 0, "normal"],
			["-"],
			[" ", "Hamster %n : %m.port portni %m.mode ga sozlash", "setPortTo", 0, "A", "analog kiritish"],
			[" ", "Hamster %n : %m.port portni %n ga o'zgartirish", "changeOutputBy", 0, "A", 10],
			[" ", "Hamster %n : %m.port portni %n ga sozlash", "setOutputTo", 0, "A", 100],
			["w", "Hamster %n : gripperni %m.open_close", "gripper", 0, "oching"],
			[" ", "Hamster %n : gripperni ozod qilish", "releaseGripper", 0],
			["r", "Hamster %n : A kirish", "inputA", 0],
			["r", "Hamster %n : B kirish", "inputB", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "HamsterS %n : doskada bir marta oldinga yurish", "sBoardMoveForward", 0],
			["w", "HamsterS %n : doskada bir marta %m.left_right ga o'girish", "sBoardTurn", 0, "chap"],
			["-"],
			["w", "HamsterS %n : oldinga %n %m.move_unit yurish", "sMoveForwardUnit", 0, 5, "cm"],
			["w", "HamsterS %n : orqaga %n %m.move_unit yurish", "sMoveBackwardUnit", 0, 5, "cm"],
			["w", "HamsterS %n : %m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "sTurnUnitInPlace", 0, "chap", 90, "daraja"],
			["w", "HamsterS %n : %m.left_right ga %n %m.turn_unit radius %n cm %m.forward_backward yo'nalishga o'girilish", "sTurnUnitWithRadiusInDirection", 0, "chap", 90, "daraja", 5, "old"],
			["w", "HamsterS %n : %m.left_right g'ildirak markaziga %n %m.turn_unit %m.forward_backward yo'nalishga o'girilish", "sPivotAroundWheelUnitInDirection", 0, "chap", 90, "daraja", "old"],
			["w", "HamsterS %n : %m.left_right ruchka, %m.left_right ga %n %m.turn_unit radius %n cm %m.forward_backward yo'nalishga o'girilish", "sTurnPenUnitWithRadiusInDirection", 0, "chap", "chap", 90, "daraja", 5, "old"],
			["w", "HamsterS %n : %m.left_right ruchka markaziga %n %m.turn_unit %m.forward_backward yo'nalishga o'girilish", "sPivotAroundPenUnitInDirection", 0, "chap", 90, "daraja", "old"],
			[" ", "HamsterS %n : chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "sChangeBothWheelsBy", 0, 10, 10],
			[" ", "HamsterS %n : chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "sSetBothWheelsTo", 0, 30, 30],
			[" ", "HamsterS %n : %m.left_right_both g'ildirakni %n ga o'zgartirish", "sChangeWheelBy", 0, "chap", 10],
			[" ", "HamsterS %n : %m.left_right_both g'ildirakni %n ga sozlash", "sSetWheelTo", 0, "chap", 30],
			[" ", "HamsterS %n : %m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish", "sFollowLineUsingFloorSensor", 0, "qora", "chap"],
			["w", "HamsterS %n : %m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish", "sFollowLineUntilIntersection", 0, "qora", "old"],
			[" ", "HamsterS %n : liniyada ergashish tezligini %m.speed ga sozlash", "sSetFollowingSpeedTo", 0, "5"],
			[" ", "HamsterS %n : liniyada ergashish yo'nalishli o'zgarishni %m.gain ga sozlash", "sSetFollowingGainTo", 0, "asl qiymati"],
			[" ", "HamsterS %n : to'xtatish", "sStop", 0],
			["-"],
			[" ", "HamsterS %n : %m.left_right_both LEDni %m.led_color ga sozlash", "sSetLedTo", 0, "chap", "qizil"],
			[" ", "HamsterS %n : %m.left_right_both LEDni r: %n g: %n b: %n ga o'zgartirish", "sChangeLedByRGB", 0, "chap", 10, 0, 0],
			[" ", "HamsterS %n : %m.left_right_both LEDni r: %n g: %n b: %n ga sozlash", "sSetLedToRGB", 0, "chap", 255, 0, 0],
			[" ", "HamsterS %n : %m.left_right_both LEDni o'chirish", "sClearLed", 0, "chap"],
			["-"],
			[" ", "HamsterS %n : %m.sound_effect tovushni %n marta ijro etish", "sPlaySoundTimes", 0, "qisqa", 1],
			["w", "HamsterS %n : %m.sound_effect tovushni %n marta ijro tugaguncha kutish", "sPlaySoundTimesUntilDone", 0, "qisqa", 1],
			[" ", "HamsterS %n : buzerning ovozini %n ga o'zgartirish", "sChangeBuzzerBy", 0, 10],
			[" ", "HamsterS %n : buzerning ovozini %n ga sozlash", "sSetBuzzerTo", 0, 1000],
			[" ", "HamsterS %n : tovushni o'chirish", "sClearSound", 0],
			[" ", "HamsterS %n : %m.note %m.octave notani ijro etish", "sPlayNote", 0, "do", "4"],
			["w", "HamsterS %n : %m.note %m.octave notani %d.beats zarb ijro etish", "sPlayNoteFor", 0, "do", "4", 0.5],
			["w", "HamsterS %n : %d.beats zarb tanaffus", "sRestFor", 0, 0.25],
			[" ", "HamsterS %n : temni %n ga o'zgartirish", "sChangeTempoBy", 0, 20],
			[" ", "HamsterS %n : temni %n bpm ga sozlash", "sSetTempoTo", 0, 60],
			["-"],
			["r", "HamsterS %n : chap yaqinlik", "sLeftProximity", 0],
			["r", "HamsterS %n : o'ng yaqinlik", "sRightProximity", 0],
			["r", "HamsterS %n : chap taglik", "sLeftFloor", 0],
			["r", "HamsterS %n : o'ng taglik", "sRightFloor", 0],
			["r", "HamsterS %n : x tezlanish", "sAccelerationX", 0],
			["r", "HamsterS %n : y tezlanish", "sAccelerationY", 0],
			["r", "HamsterS %n : z tezlanish", "sAccelerationZ", 0],
			["r", "HamsterS %n : yorug'lik", "sLight", 0],
			["r", "HamsterS %n : harorat", "sTemperature", 0],
			["r", "HamsterS %n : signal kuchi", "sSignalStrength", 0],
			["h", "HamsterS %n : qo'l topilganda", "sWhenHandFound", 0],
			["h", "HamsterS %n : %m.when_s_tilt bo'lganda", "sWhenTilt", 0, "oldinga eğin"],
			["b", "HamsterS %n : qo'l topildimi?", "sHandFound", 0],
			["b", "HamsterS %n : %m.s_tilt ?", "sTilt", 0, "oldinga eğin"],
			["b", "HamsterS %n : batareya %m.battery ?", "sBattery", 0, "normal"],
			["-"],
			[" ", "HamsterS %n : %m.port portni %m.s_mode ga sozlash", "sSetPortTo", 0, "A", "analog kiritish"],
			[" ", "HamsterS %n : %m.port portni %n ga o'zgartirish", "sChangeOutputBy", 0, "A", 10],
			[" ", "HamsterS %n : %m.port portni %n ga sozlash", "sSetOutputTo", 0, "A", 100],
			["w", "HamsterS %n : gripperni %m.open_close", "sGripper", 0, "oching"],
			[" ", "HamsterS %n : gripperni ozod qilish", "sReleaseGripper", 0],
			["r", "HamsterS %n : A kirish", "sInputA", 0],
			["r", "HamsterS %n : B kirish", "sInputB", 0],
			["-"],
			["w", "HamsterS %n : %m.serial_output %s ni ketma-ketga yozing", "sWriteSerial", 0, "harf", "abc123"],
			["w", "HamsterS %n : %m.serial_delimiter ketma-ketni o'qing", "sReadSerialUntil", 0, "hammasi"],
			[" ", "HamsterS %n : ketma-ketni tezligini %m.serial_baud Bdga sozlash", "sSetSerialRateTo", 0, "9600"],
			["r", "HamsterS %n : ketma-ket kiritish", "sSerial", 0],
			["-"],
			["-"],
			["-"],
			["-"],
			["-"],
			["w", "Turtle %n : oldinga %n %m.move_unit yurish", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : orqaga %n %m.move_unit yurish", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : %m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "turtleTurnUnitInPlace", 0, "chap", 90, "daraja"],
			["w", "Turtle %n : %m.left_right ga %n %m.turn_unit radius %n cm %m.head_tail yo'nalishga o'girilish", "turtleTurnUnitWithRadiusInDirection", 0, "chap", 90, "daraja", 6, "bosh"],
			["w", "Turtle %n : %m.left_right g'ildirak markaziga %n %m.turn_unit %m.head_tail yo'nalishga o'girilish", "turtlePivotAroundWheelUnitInDirection", 0, "chap", 90, "daraja", "bosh"],
			[" ", "Turtle %n : chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "turtleChangeWheelsByLeftRight", 0, 10, 10],
			[" ", "Turtle %n : chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "turtleSetWheelsToLeftRight", 0, 50, 50],
			[" ", "Turtle %n : %m.left_right_both g'ildirakni %n ga o'zgartirish", "turtleChangeWheelBy", 0, "chap", 10],
			[" ", "Turtle %n : %m.left_right_both g'ildirakni %n ga sozlash", "turtleSetWheelTo", 0, "chap", 50],
			[" ", "Turtle %n : %m.line_color chiziqqa ergashish", "turtleFollowLine", 0, "qora"],
			["w", "Turtle %n : qora chiziq ustida %m.target_color gacha yurish", "turtleFollowLineUntil", 0, "qizil"],
			["w", "Turtle %n : %m.color_line chiziq ustida qora gacha yurish", "turtleFollowLineUntilBlack", 0, "qizil"],
			["w", "Turtle %n : qora chorrahadan o'tib yurish", "turtleCrossIntersection", 0],
			["w", "Turtle %n : qora chorrahada %m.left_right_back ga o'girilish", "turtleTurnAtIntersection", 0, "chap"],
			[" ", "Turtle %n : liniyada ergashish tezligini %m.speed ga sozlash", "turtleSetFollowingSpeedTo", 0, "5"],
			[" ", "Turtle %n : to'xtatish", "turtleStop", 0],
			["-"],
			[" ", "Turtle %n : boshining LEDni %m.led_color ga sozlash", "turtleSetHeadLedTo", 0, "qizil"],
			[" ", "Turtle %n : boshining LEDni r: %n g: %n b: %n ga o'zgartirish", "turtleChangeHeadLedByRGB", 0, 10, 0, 0],
			[" ", "Turtle %n : boshining LEDni r: %n g: %n b: %n ga sozlash", "turtleSetHeadLedToRGB", 0, 255, 0, 0],
			[" ", "Turtle %n : boshining LEDni o'chirish", "turtleClearHeadLed", 0],
			["-"],
			[" ", "Turtle %n : %m.sound tovushni %n marta ijro etish", "turtlePlaySoundTimes", 0, "qisqa", 1],
			["w", "Turtle %n : %m.sound tovushni %n marta ijro tugaguncha kutish", "turtlePlaySoundTimesUntilDone", 0, "qisqa", 1],
			[" ", "Turtle %n : buzerning ovozini %n ga o'zgartirish", "turtleChangeBuzzerBy", 0, 10],
			[" ", "Turtle %n : buzerning ovozini %n ga sozlash", "turtleSetBuzzerTo", 0, 1000],
			[" ", "Turtle %n : tovushni o'chirish", "turtleClearSound", 0],
			[" ", "Turtle %n : %m.note %m.octave notani ijro etish", "turtlePlayNote", 0, "do", "4"],
			["w", "Turtle %n : %m.note %m.octave notani %d.beats zarb ijro etish", "turtlePlayNoteForBeats", 0, "do", "4", 0.5],
			["w", "Turtle %n : %d.beats zarb tanaffus", "turtleRestForBeats", 0, 0.25],
			[" ", "Turtle %n : temni %n ga o'zgartirish", "turtleChangeTempoBy", 0, 20],
			[" ", "Turtle %n : temni %n bpm ga sozlash", "turtleSetTempoTo", 0, 60],
			["-"],
			["h", "Turtle %n : %m.touching_color ga tegilganda", "turtleWhenColorTouched", 0, "qizil"],
			["h", "Turtle %n : rang naqshi %m.pattern_color %m.pattern_color bo'lganida", "turtleWhenColorPattern", 0, "qizil", "sariq"],
			["h", "Turtle %n : tugmani %m.when_button_state da", "turtleWhenButtonState", 0, "bosgan"],
			["h", "Turtle %n : %m.when_tilt bo'lganda", "turtleWhenTilt", 0, "oldinga eğin"],
			["b", "Turtle %n : %m.touching_color ga tekkan?", "turtleTouchingColor", 0, "qizil"],
			["b", "Turtle %n : rang naqshi %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", 0, "qizil", "sariq"],
			["b", "Turtle %n : tugmani %m.button_state ?", "turtleButtonState", 0, "bosgan"],
			["b", "Turtle %n : %m.tilt ?", "turtleTilt", 0, "oldinga eğin"],
			["b", "Turtle %n : batareya %m.battery ?", "turtleBattery", 0, "normal"],
			["r", "Turtle %n : rang raqami", "turtleColorNumber", 0],
			["r", "Turtle %n : rang naqshi", "turtleColorPattern", 0],
			["r", "Turtle %n : taglik sensori", "turtleFloor", 0],
			["r", "Turtle %n : tugma", "turtleButton", 0],
			["r", "Turtle %n : x tezlanish", "turtleAccelerationX", 0],
			["r", "Turtle %n : y tezlanish", "turtleAccelerationY", 0],
			["r", "Turtle %n : z tezlanish", "turtleAccelerationZ", 0]
		]
	};
	const MENUS = {
		en: {
			"left_right": ["left", "right"],
			"left_right_both": ["left", "right", "both"],
			"black_white": ["black", "white"],
			"left_right_front_rear": ["left", "right", "front", "rear"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"gain": ["default", "1", "2", "3", "4", "5", "6", "7", "8"],
			"color": ["red", "yellow", "green", "sky blue", "blue", "purple", "white"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"when_s_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt", "tap", "free fall"],
			"tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"battery": ["normal", "low", "empty"],
			"port": ["A", "B", "A and B"],
			"mode": ["analog input", "digital input", "servo output", "pwm output", "digital output"],
			"open_close": ["open", "close"],
			"cm_sec": ["cm", "seconds"],
			"deg_sec": ["degrees", "seconds"],
			"move_unit": ["cm", "seconds", "pulses"],
			"turn_unit": ["degrees", "seconds", "pulses"],
			"head_tail": ["head", "tail"],
			"left_right_back": ["left", "right", "back"],
			"line_color": ["black", "red", "green", "blue", "any color"],
			"target_color": ["red", "yellow", "green", "sky blue", "blue", "purple", "any color"],
			"color_line": ["red", "green", "blue", "any color"],
			"touching_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "purple", "black", "white"],
			"pattern_color": ["red", "yellow", "green", "sky blue", "blue", "purple"],
			"led_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "violet", "purple", "white"],
			"sound": ["beep", "random beep", "siren", "engine", "robot", "march", "birthday", "dibidibidip", "good job"],
			"when_button_state": ["clicked", "double-clicked", "long-pressed"],
			"button_state": ["clicked", "double-clicked", "long-pressed"],
			"forward_backward": ["forward", "backward"],
			"sound_effect": ["beep", "random beep", "noise", "siren", "engine", "chop", "robot", "dibidibidip", "good job", "happy", "angry", "sad", "sleep", "march", "birthday"],
			"s_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt", "tap", "free fall"],
			"s_mode": ["analog input", "digital input", "digital input (pull up)", "digital input (pull down)", "voltage input", "servo output", "pwm output", "digital output"],
			"serial_output": ["string", "string + new line"],
			"serial_delimiter": ["all", "until new line", "until ,(comma)", "until :(colon)", "until $", "until #"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
		},
		ko: {
			"left_right": ["왼쪽", "오른쪽"],
			"left_right_both": ["왼쪽", "오른쪽", "양쪽"],
			"black_white": ["검은색", "하얀색"],
			"left_right_front_rear": ["왼쪽", "오른쪽", "앞쪽", "뒤쪽"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"gain": ["기본 값", "1", "2", "3", "4", "5", "6", "7", "8"],
			"color": ["빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색", "하얀색"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_tilt": ["앞으로 기울였을", "뒤로 기울였을", "왼쪽으로 기울였을", "오른쪽으로 기울였을", "거꾸로 뒤집었을", "기울이지 않았을"],
			"when_s_tilt": ["앞으로 기울였을", "뒤로 기울였을", "왼쪽으로 기울였을", "오른쪽으로 기울였을", "거꾸로 뒤집었을", "기울이지 않았을", "두드렸을", "자유 낙하했을"],
			"tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "기울이지 않음"],
			"battery": ["정상", "부족", "없음"],
			"port": ["A", "B", "A와 B"],
			"mode": ["아날로그 입력", "디지털 입력", "서보 출력", "PWM 출력", "디지털 출력"],
			"open_close": ["열기", "닫기"],
			"cm_sec": ["cm", "초"],
			"deg_sec": ["도", "초"],
			"move_unit": ["cm", "초", "펄스"],
			"turn_unit": ["도", "초", "펄스"],
			"head_tail": ["머리", "꼬리"],
			"left_right_back": ["왼쪽", "오른쪽", "뒤쪽"],
			"line_color": ["검은색", "빨간색", "초록색", "파란색", "아무 색"],
			"target_color": ["빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색", "아무 색"],
			"color_line": ["빨간색", "초록색", "파란색", "아무 색"],
			"touching_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "자주색", "검은색", "하얀색"],
			"pattern_color": ["빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색"],
			"led_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"sound": ["삐", "무작위 삐", "사이렌", "엔진", "로봇", "행진", "생일", "디비디비딥", "잘 했어요"],
			"when_button_state": ["클릭했을", "더블클릭했을", "길게~눌렀을"],
			"button_state": ["클릭했는가", "더블클릭했는가", "길게~눌렀는가"],
			"forward_backward": ["앞쪽", "뒤쪽"],
			"sound_effect": ["삐", "무작위 삐", "지지직", "사이렌", "엔진", "쩝", "로봇", "디비디비딥", "잘 했어요", "행복", "화남", "슬픔", "졸림", "행진", "생일"],
			"s_tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "기울이지 않음", "두드림", "자유 낙하"],
			"s_mode": ["아날로그 입력", "디지털 입력", "디지털 입력 (풀업)", "디지털 입력 (풀다운)", "전압 입력", "서보 출력", "PWM 출력", "디지털 출력"],
			"serial_output": ["글자", "글자 + 줄 바꿈"],
			"serial_delimiter": ["모두", "줄 바꿈까지", ",(쉼표)까지", ":(쌍점)까지", "$까지", "#까지"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
		},
		ja: {
			"left_right": ["左", "右"],
			"left_right_both": ["左", "右", "両"],
			"black_white": ["黒色", "白色"],
			"left_right_front_rear": ["左", "右", "前", "後"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"gain": ["基本値", "1", "2", "3", "4", "5", "6", "7", "8"],
			"color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色", "白色"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_tilt": ["前に傾けた", "後に傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾けなかった"],
			"when_s_tilt": ["前に傾けた", "後に傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾けなかった", "叩いた", "自由落下した"],
			"tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾けなかったか"],
			"battery": ["正常か", "足りないか", "ないか"],
			"port": ["A", "B", "AとB"],
			"mode": ["アナログ入力", "デジタル入力", "サーボ出力", "PWM出力", "デジタル出力"],
			"open_close": ["開く", "閉める"],
			"cm_sec": ["cm", "秒"],
			"deg_sec": ["度", "秒"],
			"move_unit": ["cm", "秒", "パルス"],
			"turn_unit": ["度", "秒", "パルス"],
			"head_tail": ["頭", "尾"],
			"left_right_back": ["左", "右", "後ろ"],
			"line_color": ["黒色", "赤色", "緑色", "青色", "何色"],
			"target_color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色", "何色"],
			"color_line": ["赤色", "緑色", "青色", "何色"],
			"touching_color": ["赤色", "橙色", "黄色", "緑色", "水色", "青色", "紫色", "黒色", "白色"],
			"pattern_color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色"],
			"led_color": ["赤色", "橙色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"sound": ["ビープ", "ランダムビープ", "サイレン", "エンジン", "ロボット", "行進", "誕生", "ディバディバディップ", "よくやった"],
			"when_button_state": ["クリックした", "ダブルクリックした", "長く押した"],
			"button_state": ["クリックしたか", "ダブルクリックしたか", "長く押したか"],
			"forward_backward": ["前", "後"],
			"sound_effect": ["ビープ", "ランダムビープ", "ノイズ", "サイレン", "エンジン", "チョップ", "ロボット", "ディバディバディップ", "よくやった", "幸福", "怒った", "悲しみ", "睡眠", "行進", "誕生"],
			"s_tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾けなかったか", "叩いたか", "自由落下したか"],
			"s_mode": ["アナログ入力", "デジタル入力", "デジタル入力 (プルアップ)", "デジタル入力 (プルダウン)", "電圧入力", "サーボ出力", "PWM出力", "デジタル出力"],
			"serial_output": ["文字列", "文字列 + 改行"],
			"serial_delimiter": ["全部", "改行まで", "、(読点)まで", "：(コロン)まで", "$まで", "#まで"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
		},
		uz: {
			"left_right": ["chap", "o'ng"],
			"left_right_both": ["chap", "o'ng", "har ikki"],
			"black_white": ["qora", "oq"],
			"left_right_front_rear": ["chap", "o'ng", "old", "orqa"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"gain": ["asl qiymati", "1", "2", "3", "4", "5", "6", "7", "8"],
			"color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh", "oq"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q"],
			"when_s_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q", "jo'mrak", "erkin tushish"],
			"tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q"],
			"battery": ["normal", "past", "bo'sh"],
			"port": ["A", "B", "A va B"],
			"mode": ["analog kiritish", "raqamli kiritish", "servo chiqish", "pwm chiqish", "raqamli chiqish"],
			"open_close": ["oching", "yoping"],
			"cm_sec": ["cm", "soniya"],
			"deg_sec": ["daraja", "soniya"],
			"move_unit": ["cm", "soniya", "puls"],
			"turn_unit": ["daraja", "soniya", "puls"],
			"head_tail": ["bosh", "dum"],
			"left_right_back": ["chap", "o'ng", "orqa"],
			"line_color": ["qora", "qizil", "yashil", "ko'k", "har qanday rang"],
			"target_color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh", "har qanday rang"],
			"color_line": ["qizil", "yashil", "ko'k", "har qanday rang"],
			"touching_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "siyoh", "qora", "oq"],
			"pattern_color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh"],
			"led_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "binafsha", "siyoh", "oq"],
			"sound": ["qisqa", "tasodifiy qisqa", "sirena", "motor", "robot", "marsh", "tug'ilgan kun", "dibidibidip", "juda yaxshi"],
			"when_button_state": ["bosgan", "ikki-marta-bosgan", "uzoq-bosganmi"],
			"button_state": ["bosgan", "ikki-marta-bosgan", "uzoq-bosganmi"],
			"forward_backward": ["old", "orqa"],
			"sound_effect": ["qisqa", "tasodifiy qisqa", "shovqin", "sirena", "motor", "chop", "robot", "dibidibidip", "juda yaxshi", "baxtli", "badjahl", "xafa", "uyqu", "marsh", "tug'ilgan kun"],
			"s_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q", "jo'mrak", "erkin tushish"],
			"s_mode": ["analog kiritish", "raqamli kiritish", "raqamli kiritish (pull up)", "raqamli kiritish (pull down)", "voltaj kiritish", "servo chiqish", "pwm chiqish", "raqamli chiqish"],
			"serial_output": ["harf", "harf + yangi satrga"],
			"serial_delimiter": ["hammasi", "yangi satrgacha", ",(vergul)gacha", ":(qo'sh nuqta)gacha", "$gacha", "#gacha"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
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

	var PARTS = {};
	var DIRECTIONS = {};
	var TOWARDS = {};
	var UNITS = {};
	var COLORS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var SOUNDS = {};
	var SOUND_EFFECTS = {};
	var IO_MODES = {};
	var GRIPPERS = {};
	var TILTS = {};
	var BATTERY_STATES = {};
	var LINE_COLORS = {};
	var COLOR_NUMBERS = {};
	var COLOR_PATTERNS = {};
	var RGB_COLORS = {};
	var BUTTON_STATES = {};
	var SERIAL_MODES = {};
	var SERIAL_DELIMITERS = {};
	var SERIAL_BAUDS = { '9600': 176, '14400': 177, '19200': 178, '28800': 179, '38400': 180, '57600': 181, '76800': 182, '115200': 183 };
	var VALUES = {};
	
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const FRONT = 4;
	const REAR = 5;
	const BACK = 5;
	const FORWARD = 1;
	const HEAD = 1;
	const SECONDS = 2;
	const OPEN = 1;
	const CLOSE = 2;
	const TILT_FORWARD = 1;
	const TILT_BACKWARD = 2;
	const TILT_LEFT = 3;
	const TILT_RIGHT = 4;
	const TILT_FLIP = 5;
	const TILT_NONE = 6;
	const TILT_TAP = 7;
	const TILT_FREE_FALL = 8;
	const CLICKED = 1;
	const DOUBLE_CLICKED = 2;
	const LONG_PRESSED = 3;
	const SERIAL_STRING = 1;
	const SERIAL_STRING_LINE = 2;
	const SERIAL_ALL = 0;
	const SERIAL_NEW_LINE = 0x0D;
	const SERIAL_COMMA = 0x2C;
	const SERIAL_COLON = 0x3A;
	const SERIAL_DOLLAR = 0x24;
	const SERIAL_SHARP = 0x23;
	const WHITE = 1;
	
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['left_right_both'];
		PARTS[tmp[0]] = LEFT;
		PARTS[tmp[1]] = RIGHT;
		PARTS[tmp[2]] = BOTH;
		tmp = MENUS[i]['left_right_front_rear'];
		DIRECTIONS[tmp[0]] = LEFT;
		DIRECTIONS[tmp[1]] = RIGHT;
		DIRECTIONS[tmp[2]] = FRONT;
		DIRECTIONS[tmp[3]] = REAR;
		tmp = MENUS[i]['left_right_back'];
		DIRECTIONS[tmp[2]] = BACK;
		tmp = MENUS[i]['forward_backward'];
		TOWARDS[tmp[0]] = FORWARD;
		tmp = MENUS[i]['head_tail'];
		TOWARDS[tmp[0]] = HEAD;
		tmp = MENUS[i]['move_unit'];
		UNITS[tmp[0]] = 1; // cm
		UNITS[tmp[1]] = 2; // sec
		UNITS[tmp[2]] = 3; // pulse
		tmp = MENUS[i]['turn_unit'];
		UNITS[tmp[0]] = 1; // deg
		tmp = MENUS[i]['led_color'];
		COLORS[tmp[0]] = 4; // red
		COLORS[tmp[1]] = 4; // orange
		COLORS[tmp[2]] = 6; // yellow
		COLORS[tmp[3]] = 2; // green
		COLORS[tmp[4]] = 3; // sky blue
		COLORS[tmp[5]] = 1; // blue
		COLORS[tmp[6]] = 5; // violet
		COLORS[tmp[7]] = 5; // purple
		COLORS[tmp[8]] = 7; // white
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
		SOUNDS[tmp[0]] = 1; // beep
		SOUNDS[tmp[1]] = 2; // random beep
		SOUNDS[tmp[2]] = 3; // siren
		SOUNDS[tmp[3]] = 4; // engine
		SOUNDS[tmp[4]] = 5; // robot
		SOUNDS[tmp[5]] = 6; // march
		SOUNDS[tmp[6]] = 7; // birthday
		SOUNDS[tmp[7]] = 8; // dibidibidip
		SOUNDS[tmp[8]] = 9; // good job
		tmp = MENUS[i]['sound_effect'];
		SOUND_EFFECTS[tmp[0]] = 1; // beep
		SOUND_EFFECTS[tmp[1]] = 2; // random beep
		SOUND_EFFECTS[tmp[2]] = 10; // noise
		SOUND_EFFECTS[tmp[3]] = 3; // siren
		SOUND_EFFECTS[tmp[4]] = 4; // engine
		SOUND_EFFECTS[tmp[5]] = 11; // chop
		SOUND_EFFECTS[tmp[6]] = 5; // robot
		SOUND_EFFECTS[tmp[7]] = 8; // dibidibidip
		SOUND_EFFECTS[tmp[8]] = 9; // good job
		SOUND_EFFECTS[tmp[9]] = 12; // happy
		SOUND_EFFECTS[tmp[10]] = 13; // angry
		SOUND_EFFECTS[tmp[11]] = 14; // sad
		SOUND_EFFECTS[tmp[12]] = 15; // sleep
		SOUND_EFFECTS[tmp[13]] = 6; // march
		SOUND_EFFECTS[tmp[14]] = 7; // birthday
		tmp = MENUS[i]['s_mode'];
		IO_MODES[tmp[0]] = 0; // analog input
		IO_MODES[tmp[1]] = 1; // digital input
		IO_MODES[tmp[2]] = 2; // digital input (pull up)
		IO_MODES[tmp[3]] = 3; // digital input (pull down)
		IO_MODES[tmp[4]] = 4; // voltage input
		IO_MODES[tmp[5]] = 8; // servo output
		IO_MODES[tmp[6]] = 9; // pwm output
		IO_MODES[tmp[7]] = 10; // digital output
		tmp = MENUS[i]['open_close'];
		GRIPPERS[tmp[0]] = OPEN;
		GRIPPERS[tmp[1]] = CLOSE;
		tmp = MENUS[i]['s_tilt'];
		TILTS[tmp[0]] = TILT_FORWARD;
		TILTS[tmp[1]] = TILT_BACKWARD;
		TILTS[tmp[2]] = TILT_LEFT;
		TILTS[tmp[3]] = TILT_RIGHT;
		TILTS[tmp[4]] = TILT_FLIP;
		TILTS[tmp[5]] = TILT_NONE;
		TILTS[tmp[6]] = TILT_TAP;
		TILTS[tmp[7]] = TILT_FREE_FALL;
		tmp = MENUS[i]['when_s_tilt'];
		TILTS[tmp[0]] = TILT_FORWARD;
		TILTS[tmp[1]] = TILT_BACKWARD;
		TILTS[tmp[2]] = TILT_LEFT;
		TILTS[tmp[3]] = TILT_RIGHT;
		TILTS[tmp[4]] = TILT_FLIP;
		TILTS[tmp[5]] = TILT_NONE;
		TILTS[tmp[6]] = TILT_TAP;
		TILTS[tmp[7]] = TILT_FREE_FALL;
		tmp = MENUS[i]['battery'];
		BATTERY_STATES[tmp[0]] = 2;
		BATTERY_STATES[tmp[1]] = 1;
		BATTERY_STATES[tmp[2]] = 0;
		tmp = MENUS[i]['line_color'];
		LINE_COLORS[tmp[0]] = 0; // black
		LINE_COLORS[tmp[4]] = 7; // any color
		tmp = MENUS[i]['touching_color'];
		LINE_COLORS[tmp[0]] = 1; // red
		LINE_COLORS[tmp[2]] = 2; // yellow
		LINE_COLORS[tmp[3]] = 3; // green
		LINE_COLORS[tmp[4]] = 4; // sky blue
		LINE_COLORS[tmp[5]] = 5; // blue
		LINE_COLORS[tmp[6]] = 6; // purple
		COLOR_NUMBERS[tmp[7]] = 0; // black
		COLOR_NUMBERS[tmp[0]] = 1; // red
		COLOR_NUMBERS[tmp[1]] = 2; // orange
		COLOR_NUMBERS[tmp[2]] = 3; // yellow
		COLOR_NUMBERS[tmp[3]] = 4; // green
		COLOR_NUMBERS[tmp[4]] = 5; // sky blue
		COLOR_NUMBERS[tmp[5]] = 6; // blue
		COLOR_NUMBERS[tmp[6]] = 7; // purple
		COLOR_NUMBERS[tmp[8]] = 8; // white
		COLOR_PATTERNS[tmp[0]] = 1; // red
		COLOR_PATTERNS[tmp[2]] = 3; // yellow
		COLOR_PATTERNS[tmp[3]] = 4; // green
		COLOR_PATTERNS[tmp[4]] = 5; // sky blue
		COLOR_PATTERNS[tmp[5]] = 6; // blue
		COLOR_PATTERNS[tmp[6]] = 7; // purple
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
		tmp = MENUS[i]['button_state'];
		BUTTON_STATES[tmp[0]] = CLICKED;
		BUTTON_STATES[tmp[1]] = DOUBLE_CLICKED;
		BUTTON_STATES[tmp[2]] = LONG_PRESSED;
		tmp = MENUS[i]['when_button_state'];
		BUTTON_STATES[tmp[0]] = CLICKED;
		BUTTON_STATES[tmp[1]] = DOUBLE_CLICKED;
		BUTTON_STATES[tmp[2]] = LONG_PRESSED;
		tmp = MENUS[i]['serial_output'];
		SERIAL_MODES[tmp[0]] = SERIAL_STRING;
		SERIAL_MODES[tmp[1]] = SERIAL_STRING_LINE;
		tmp = MENUS[i]['serial_delimiter'];
		SERIAL_DELIMITERS[tmp[0]] = SERIAL_ALL;
		SERIAL_DELIMITERS[tmp[1]] = SERIAL_NEW_LINE;
		SERIAL_DELIMITERS[tmp[2]] = SERIAL_COMMA;
		SERIAL_DELIMITERS[tmp[3]] = SERIAL_COLON;
		SERIAL_DELIMITERS[tmp[4]] = SERIAL_DOLLAR;
		SERIAL_DELIMITERS[tmp[5]] = SERIAL_SHARP;
		tmp = MENUS[i]['black_white'];
		VALUES[tmp[1]] = WHITE;
	}
	
	function WriteQueue(size) {
		this.setSize(size);
		this.output = new Array(19);
	}

	WriteQueue.prototype.setSize = function(size) {
		this.buffer = new Array(size);
		this.mask = size - 1;
		this.provider = 0;
		this.consumer = 0;
	};

	WriteQueue.prototype.reset = function() {
		this.provider = 0;
		this.consumer = 0;
	};

	WriteQueue.prototype.push = function(str, line) {
		var buffer = this.buffer;
		var mask = this.mask;
		var provider = this.provider;
		var consumer = this.consumer;

		var len = str.length;
		if(len > 0) {
			for(var i = 0; i < len; ++i) {
				if(((provider - consumer) & mask) == mask) { // full
					consumer = (consumer + 1) & mask;
				}
				buffer[provider] = str.charCodeAt(i);
				provider = (provider + 1) & mask;
			}
		}
		if(line) {
			if(((provider - consumer) & mask) == mask) { // full
				consumer = (consumer + 1) & mask;
			}
			buffer[provider] = 0x0D;
			provider = (provider + 1) & mask;
		}
		this.provider = provider;
		this.consumer = consumer;
	};

	WriteQueue.prototype.pop = function() {
		var provider = this.provider;
		var consumer = this.consumer;
		if(provider == consumer) return undefined; // empty

		var buffer = this.buffer;
		var mask = this.mask;
		var output = this.output;
		var len = (provider - consumer) & mask;
		if(len > 18) len = 18;

		output[0] = len;
		var i = 1;
		for(; i <= len && consumer != provider; ++i) {
			output[i] = buffer[consumer];
			consumer = (consumer + 1) & mask;
		}
		for(; i <= 18; ++i) {
			output[i] = 0;
		}
		this.consumer = consumer;
		return output;
	};

	function ReadQueue(size) {
		this.setSize(size);
	}

	ReadQueue.prototype.setSize = function(size) {
		this.buffer = new Array(size);
		this.mask = size - 1;
		this.provider = 0;
		this.consumer = 0;
	};

	ReadQueue.prototype.reset = function() {
		this.provider = 0;
		this.consumer = 0;
	};

	ReadQueue.prototype.push = function(packet) {
		var len = packet[0];
		if(len > 0) {
			if(len > 18) len = 18;

			var buffer = this.buffer;
			var mask = this.mask;
			var provider = this.provider;
			var consumer = this.consumer;
			for(var i = 1; i <= len; ++i) {
				if(((provider - consumer) & mask) == mask) { // full
					consumer = (consumer + 1) & mask;
				}
				buffer[provider] = packet[i];
				provider = (provider + 1) & mask;
			}
			this.provider = provider;
			this.consumer = consumer;
		}
	};

	ReadQueue.prototype.pop = function(delimiter) {
		var provider = this.provider;
		var consumer = this.consumer;
		if(provider == consumer) return undefined; // empty

		var buffer = this.buffer;
		var mask = this.mask;
		if(delimiter == 0) {
			var str = '';
			while(consumer != provider) {
				str += String.fromCharCode(buffer[consumer]);
				consumer = (consumer + 1) & mask;
			}
			this.consumer = consumer;
			return str;
		} else {
			var found = -1;
			while(consumer != provider) {
				if(buffer[consumer] == delimiter) {
					found = consumer;
					break;
				}
				consumer = (consumer + 1) & mask;
			}
			if(found >= 0) {
				consumer = this.consumer;
				var str = '';
				while(consumer != found) {
					str += String.fromCharCode(buffer[consumer]);
					consumer = (consumer + 1) & mask;
				}
				this.consumer = (consumer + 1) & mask;
				return str;
			}
		}
	};
	
	function Hamster(index) {
		this.sensory = {
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
			tilt: 0,
			lineTracerState: 0,
			batteryState: 2,
			handFound: false
		};
		this.motoring = {
			module: HAMSTER,
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
			motion: 0,
			radius: 5
		};
		this.blockId = 0;
		this.wheelId = 0;
		this.wheelTimer = undefined;
		this.lineTracerCallback = undefined;
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.ioId = 0;
		this.ioTimer = undefined;
		this.tempo = 60;
		this.timeouts = [];
	}
	
	Hamster.prototype.reset = function() {
		var motoring = this.motoring;
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
		motoring.radius = 5;

		this.blockId = 0;
		this.wheelId = 0;
		this.wheelTimer = undefined;
		this.lineTracerCallback = undefined;
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.ioId = 0;
		this.ioTimer = undefined;
		this.tempo = 60;

		this.__removeAllTimeouts();
	};
	
	Hamster.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	Hamster.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};
	
	Hamster.prototype.clearMotoring = function() {
		this.motoring.map = 0xfc000000;
	};

	Hamster.prototype.clearEvent = function() {
	};
	
	Hamster.prototype.__issueWheelId = function() {
		this.wheelId = this.blockId = (this.blockId % 65535) + 1;
		return this.wheelId;
	};

	Hamster.prototype.__cancelWheel = function() {
		this.wheelId = 0;
		if(this.wheelTimer !== undefined) {
			this.__removeTimeout(this.wheelTimer);
		}
		this.wheelTimer = undefined;
	};

	Hamster.prototype.__setLineTracerMode = function(mode) {
		this.motoring.lineTracerMode = mode;
		this.motoring.map |= 0x00200000;
	};

	Hamster.prototype.__setLineTracerSpeed = function(speed) {
		this.motoring.lineTracerSpeed = speed;
		this.motoring.map |= 0x00100000;
	};

	Hamster.prototype.__cancelLineTracer = function() {
		this.lineTracerCallback = undefined;
	};

	Hamster.prototype.__cancelBoard = function() {
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
	};

	Hamster.prototype.__setLeftLed = function(color) {
		this.motoring.leftLed = color;
		this.motoring.map |= 0x01000000;
	};

	Hamster.prototype.__setRightLed = function(color) {
		this.motoring.rightLed = color;
		this.motoring.map |= 0x00800000;
	};

	Hamster.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x00400000;
	};

	Hamster.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	Hamster.prototype.__cancelNote = function() {
		this.noteId = 0;
		if(this.noteTimer1 !== undefined) {
			this.__removeTimeout(this.noteTimer1);
		}
		if(this.noteTimer2 !== undefined) {
			this.__removeTimeout(this.noteTimer2);
		}
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
	};

	Hamster.prototype.__setIoModeA = function(mode) {
		this.motoring.ioModeA = mode;
		this.motoring.map |= 0x00080000;
	};

	Hamster.prototype.__setIoModeB = function(mode) {
		this.motoring.ioModeB = mode;
		this.motoring.map |= 0x00040000;
	};

	Hamster.prototype.__issueIoId = function() {
		this.ioId = this.blockId = (this.blockId % 65535) + 1;
		return this.ioId;
	};

	Hamster.prototype.__cancelIo = function() {
		this.ioId = 0;
		if(this.ioTimer !== undefined) {
			this.__removeTimeout(this.ioTimer);
		}
		this.ioTimer = undefined;
	};

	Hamster.prototype.handleSensory = function() {
		var self = this;
		var sensory = self.sensory;
		if(self.lineTracerCallback && (sensory.map & 0x00000010) != 0) {
			if(sensory.lineTracerState == 0x40) {
				self.__setLineTracerMode(0);
				var callback = self.lineTracerCallback;
				self.__cancelLineTracer();
				if(callback) callback();
			}
		}
		if(self.boardCallback) {
			var motoring = self.motoring;
			if(self.boardCommand == 1) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
								self.boardCount ++;
							else
								self.boardCount = 0;
							var diff = sensory.leftFloor - sensory.rightFloor;
							motoring.leftWheel = 45 + diff * 0.25;
							motoring.rightWheel = 45 - diff * 0.25;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						motoring.leftWheel = 45 + diff * 0.25;
						motoring.rightWheel = 45 - diff * 0.25;
						self.boardState = 3;
						self.wheelTimer = setTimeout(function() {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							self.boardState = 4;
							if(self.wheelTimer !== undefined) self.__removeTimeout(self.wheelTimer);
							self.wheelTimer = undefined;
						}, 250);
						self.timeouts.push(self.wheelTimer);
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
						var callback = self.boardCallback;
						self.__cancelBoard();
						if(callback) callback();
						break;
					}
				}
			} else if(self.boardCommand == 2) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor > 50)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.leftFloor < 20) {
							self.boardState = 3;
						}
						break;
					}
					case 3: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor < 20)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.leftFloor > 50) {
							self.boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = self.boardCallback;
							self.__cancelBoard();
							if(callback) callback();
						} else {
							motoring.leftWheel = diff * 0.5;
							motoring.rightWheel = -diff * 0.5;
						}
						break;
					}
				}
			} else if(self.boardCommand == 3) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.rightFloor > 50)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.rightFloor < 20) {
							self.boardState = 3;
						}
						break;
					}
					case 3: {
						if(self.boardCount < 2) {
							if(sensory.rightFloor < 20)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.rightFloor > 50) {
							self.boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.rightFloor - sensory.leftFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = self.boardCallback;
							self.__cancelBoard();
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

	Hamster.prototype.__board = function(leftVelocity, rightVelocity, command, callback) {
		var motoring = this.motoring;
		this.__cancelWheel();
		this.__cancelLineTracer();

		motoring.leftWheel = leftVelocity;
		motoring.rightWheel = rightVelocity;
		motoring.motion = 0;
		this.boardCommand = command;
		this.boardCount = 0;
		this.boardState = 1;
		this.boardCallback = callback;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.boardForward = function(callback) {
		this.__board(45, 45, 1, callback);
	};

	Hamster.prototype.boardTurn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__board(-45, 45, 2, callback);
		} else {
			this.__board(45, -45, 3, callback);
		}
	};

	Hamster.prototype.__motion = function(type, leftVelocity, rightVelocity, secs, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelBoard();
		self.__cancelWheel();
		self.__cancelLineTracer();

		secs = parseFloat(secs);
		if(secs && secs > 0) {
			var id = self.__issueWheelId();
			motoring.leftWheel = leftVelocity;
			motoring.rightWheel = rightVelocity;
			motoring.motion = type;
			self.__setLineTracerMode(0);
			self.wheelTimer = setTimeout(function() {
				if(self.wheelId == id) {
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					motoring.motion = 0;
					self.__cancelWheel();
					callback();
				}
			}, secs * 1000);
			self.timeouts.push(self.wheelTimer);
		} else {
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			motoring.motion = 0;
			self.__setLineTracerMode(0);
			callback();
		}
	};

	Hamster.prototype.moveForward = function(callback) {
		this.__motion(1, 30, 30, 1, callback);
	};

	Hamster.prototype.moveBackward = function(callback) {
		this.__motion(2, -30, -30, 1, callback);
	};

	Hamster.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(3, -30, 30, 1, callback);
		} else {
			this.__motion(4, 30, -30, 1, callback);
		}
	};

	Hamster.prototype.moveForwardSecs = function(secs, callback) {
		this.__motion(1, 30, 30, secs, callback);
	};

	Hamster.prototype.moveBackwardSecs = function(secs, callback) {
		this.__motion(2, -30, -30, secs, callback);
	};

	Hamster.prototype.turnSecs = function(direction, secs, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(3, -30, 30, secs, callback);
		} else {
			this.__motion(4, 30, -30, secs, callback);
		}
	};
	
	Hamster.prototype.__stopMotion = function() {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.moveForwardUnit = function(value, unit, callback) {
		if(UNITS[unit] == SECONDS) {
			this.moveForwardSecs(value, callback);
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.moveBackwardUnit = function(value, unit, callback) {
		if(UNITS[unit] == SECONDS) {
			this.moveBackwardSecs(value, callback);
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.turnUnit = function(direction, value, unit, callback) {
		if(UNITS[unit] == SECONDS) {
			this.turnSecs(direction, value, callback);
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.pivotUnit = function(wheel, value, unit, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			if(PARTS[wheel] == LEFT) {
				if(TOWARDS[toward] == FORWARD) {
					this.__motion(5, 0, 30, value, callback);
				} else {
					this.__motion(6, 0, -30, value, callback);
				}
			} else {
				if(TOWARDS[toward] == FORWARD) {
					this.__motion(7, 30, 0, value, callback);
				} else {
					this.__motion(8, -30, 0, value, callback);
				}
			}
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.swingUnit = function(wheel, value, unit, radius, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			radius = parseFloat(radius);
			if((typeof radius == 'number') && radius >= 0) {
				this.motoring.radius = radius;
				if(DIRECTIONS[wheel] == LEFT) {
					if(TOWARDS[toward] == FORWARD) {
						this.__motion(9, 0, 0, value, callback);
					} else {
						this.__motion(10, 0, 0, value, callback);
					}
				} else {
					if(TOWARDS[toward] == FORWARD) {
						this.__motion(11, 0, 0, value, callback);
					} else {
						this.__motion(12, 0, 0, value, callback);
					}
				}
			} else {
				this.__stopMotion();
				callback();
			}
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.pivotPenUnit = function(pen, value, unit, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			if(PARTS[pen] == LEFT) {
				if(TOWARDS[toward] == FORWARD) {
					this.__motion(13, 0, 0, value, callback);
				} else {
					this.__motion(14, 0, 0, value, callback);
				}
			} else {
				if(TOWARDS[toward] == FORWARD) {
					this.__motion(15, 0, 0, value, callback);
				} else {
					this.__motion(16, 0, 0, value, callback);
				}
			}
		} else {
			this.__stopMotion();
		}
	};
	
	Hamster.prototype.swingPenUnit = function(pen, direction, value, unit, radius, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			radius = parseFloat(radius);
			if((typeof radius == 'number') && radius >= 0) {
				this.motoring.radius = radius;
				if(PARTS[pen] == LEFT) {
					if(DIRECTIONS[direction] == LEFT) {
						if(TOWARDS[toward] == FORWARD) {
							this.__motion(17, 0, 0, value, callback);
						} else {
							this.__motion(18, 0, 0, value, callback);
						}
					} else {
						if(TOWARDS[toward] == FORWARD) {
							this.__motion(19, 0, 0, value, callback);
						} else {
							this.__motion(20, 0, 0, value, callback);
						}
					}
				} else {
					if(DIRECTIONS[direction] == LEFT) {
						if(TOWARDS[toward] == FORWARD) {
							this.__motion(21, 0, 0, value, callback);
						} else {
							this.__motion(22, 0, 0, value, callback);
						}
					} else {
						if(TOWARDS[toward] == FORWARD) {
							this.__motion(23, 0, 0, value, callback);
						} else {
							this.__motion(24, 0, 0, value, callback);
						}
					}
				}
			} else {
				this.__stopMotion();
				callback();
			}
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.setWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel = leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel = rightVelocity;
		}
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.changeWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel += leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel += rightVelocity;
		}
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.setWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		velocity = parseFloat(velocity);
		if(typeof velocity == 'number') {
			wheel = PARTS[wheel];
			if(wheel == LEFT) {
				motoring.leftWheel = velocity;
			} else if(wheel == RIGHT) {
				motoring.rightWheel = velocity;
			} else {
				motoring.leftWheel = velocity;
				motoring.rightWheel = velocity;
			}
		}
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.changeWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		velocity = parseFloat(velocity);
		if(typeof velocity == 'number') {
			wheel = PARTS[wheel];
			if(wheel == LEFT) {
				motoring.leftWheel += velocity;
			} else if(wheel == RIGHT) {
				motoring.rightWheel += velocity;
			} else {
				motoring.leftWheel += velocity;
				motoring.rightWheel += velocity;
			}
		}
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.followLine = function(color, sensor) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		var mode = 1;
		sensor = PARTS[sensor];
		if(sensor == RIGHT) mode = 2;
		else if(sensor == BOTH) mode = 3;
		if(VALUES[color] == WHITE) mode += 7;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = 0;
		this.__setLineTracerMode(mode);
	};

	Hamster.prototype.followLineUntil = function(color, direction, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();

		var mode = 4;
		direction = DIRECTIONS[direction];
		if(direction == RIGHT) mode = 5;
		else if(direction == FRONT) mode = 6;
		else if(direction == REAR) mode = 7;
		if(VALUES[color] == WHITE) mode += 7;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = 0;
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};

	Hamster.prototype.setLineTracerSpeed = function(speed) {
		speed = parseInt(speed);
		if(typeof speed == 'number') {
			this.__setLineTracerSpeed(speed);
		}
	};
	
	Hamster.prototype.setLineTracerGain = function(gain) {
	};

	Hamster.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.setLed = function(led, color) {
		color = COLORS[color];
		if(color && color > 0) {
			led = PARTS[led];
			if(led == LEFT) {
				this.__setLeftLed(color);
			} else if(led == RIGHT) {
				this.__setRightLed(color);
			} else {
				this.__setLeftLed(color);
				this.__setRightLed(color);
			}
		}
	};

	Hamster.prototype.clearLed = function(led) {
		led = PARTS[led];
		if(led == LEFT) {
			this.__setLeftLed(0);
		} else if(led == RIGHT) {
			this.__setRightLed(0);
		} else {
			this.__setLeftLed(0);
			this.__setRightLed(0);
		}
	};

	Hamster.prototype.setRgbArray = function(led, rgb) {
	};

	Hamster.prototype.setRgb = function(led, red, green, blue) {
	};

	Hamster.prototype.changeRgb = function(led, red, green, blue) {
	};

	Hamster.prototype.runBeep = function(count, id, callback) {
		if(count) {
			var self = this;
			var motoring = self.motoring;
			motoring.buzzer = 440;
			self.__setNote(0);
			self.noteTimer1 = setTimeout(function() {
				if(!id || self.noteId == id) {
					motoring.buzzer = 0;
					if(self.noteTimer1 !== undefined) self.__removeTimeout(self.noteTimer1);
					self.noteTimer1 = undefined;
				}
			}, 100);
			self.timeouts.push(self.noteTimer1);
			self.noteTimer2 = setTimeout(function() {
				if(!id || self.noteId == id) {
					motoring.buzzer = 0;
					if(self.noteTimer2 !== undefined) self.__removeTimeout(self.noteTimer2);
					self.noteTimer2 = undefined;
					if(count < 0) {
						self.runBeep(-1, id, callback);
					} else if(count == 1) {
						self.__cancelNote();
						if(id && callback) callback();
					} else {
						self.runBeep(count - 1, id, callback);
					}
				}
			}, 200);
			self.timeouts.push(self.noteTimer2);
		}
	};

	Hamster.prototype.beep = function(callback) {
		this.__cancelNote();
		var id = this.__issueNoteId();
		this.runBeep(1, id, callback);
	};

	Hamster.prototype.playSound = function(sound, count) {
		this.__cancelNote();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		count = parseInt(count);
		if(SOUNDS[sound] == 1 && count) {
			this.runBeep(count);
		}
	};

	Hamster.prototype.playSoundUntil = function(sound, count, callback) {
		this.__cancelNote();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		count = parseInt(count);
		if(SOUNDS[sound] == 1 && count) {
			var id = this.__issueNoteId();
			this.runBeep(count, id, callback);
		}
	};

	Hamster.prototype.setBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer = hz;
		}
		this.__setNote(0);
	};

	Hamster.prototype.changeBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer += hz;
		}
		this.__setNote(0);
	};

	Hamster.prototype.clearBuzzer = function() {
		this.__cancelNote();
		this.motoring.buzzer = 0;
		this.__setNote(0);
	};

	Hamster.prototype.clearSound = function() {
		this.clearBuzzer();
	};

	Hamster.prototype.playNote = function(note, octave) {
		var motoring = this.motoring;
		this.__cancelNote();

		note = NOTES[note];
		octave = parseInt(octave);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8) {
			note += (octave - 1) * 12;
			this.__setNote(note);
		} else {
			this.__setNote(0);
		}
	};

	Hamster.prototype.playNoteBeat = function(note, octave, beat, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelNote();

		note = NOTES[note];
		octave = parseInt(octave);
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && self.tempo > 0) {
			var id = self.__issueNoteId();
			note += (octave - 1) * 12;
			self.__setNote(note);
			var timeout = beat * 60 * 1000 / self.tempo;
			var tail = (timeout > 100) ? 100 : 0;
			if(tail > 0) {
				self.noteTimer1 = setTimeout(function() {
					if(self.noteId == id) {
						self.__setNote(0);
						if(self.noteTimer1 !== undefined) self.__removeTimeout(self.noteTimer1);
						self.noteTimer1 = undefined;
					}
				}, timeout - tail);
				self.timeouts.push(self.noteTimer1);
			}
			self.noteTimer2 = setTimeout(function() {
				if(self.noteId == id) {
					self.__setNote(0);
					self.__cancelNote();
					callback();
				}
			}, timeout);
			self.timeouts.push(self.noteTimer2);
		} else {
			self.__setNote(0);
			callback();
		}
	};

	Hamster.prototype.restBeat = function(beat, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelNote();

		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		self.__setNote(0);
		if(beat && beat > 0 && self.tempo > 0) {
			var id = self.__issueNoteId();
			self.noteTimer1 = setTimeout(function() {
				if(self.noteId == id) {
					self.__cancelNote();
					callback();
				}
			}, beat * 60 * 1000 / self.tempo);
			self.timeouts.push(self.noteTimer1);
		} else {
			callback();
		}
	};

	Hamster.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	Hamster.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	Hamster.prototype.getLeftProximity = function() {
		return this.sensory.leftProximity;
	};

	Hamster.prototype.getRightProximity = function() {
		return this.sensory.rightProximity;
	};

	Hamster.prototype.getLeftFloor = function() {
		return this.sensory.leftFloor;
	};

	Hamster.prototype.getRightFloor = function() {
		return this.sensory.rightFloor;
	};

	Hamster.prototype.getAccelerationX = function() {
		return this.sensory.accelerationX;
	};

	Hamster.prototype.getAccelerationY = function() {
		return this.sensory.accelerationY;
	};

	Hamster.prototype.getAccelerationZ = function() {
		return this.sensory.accelerationZ;
	};

	Hamster.prototype.getLight = function() {
		return this.sensory.light;
	};

	Hamster.prototype.getTemperature = function() {
		return this.sensory.temperature;
	};

	Hamster.prototype.getSignalStrength = function() {
		return this.sensory.signalStrength;
	};

	Hamster.prototype.checkHandFound = function() {
		var sensory = this.sensory;
		return (sensory.handFound === undefined) ? (sensory.leftProximity > 50 || sensory.rightProximity > 50) : sensory.handFound;
	};

	Hamster.prototype.checkTilt = function(tilt) {
		switch(TILTS[tilt]) {
			case TILT_FORWARD: return this.sensory.tilt == 1;
			case TILT_BACKWARD: return this.sensory.tilt == -1;
			case TILT_LEFT: return this.sensory.tilt == 2;
			case TILT_RIGHT: return this.sensory.tilt == -2;
			case TILT_FLIP: return this.sensory.tilt == 3;
			case TILT_NONE: return this.sensory.tilt == -3;
		}
		return false;
	};

	Hamster.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};

	Hamster.prototype.setIoMode = function(port, mode) {
		this.__cancelIo();
		mode = IO_MODES[mode];
		if(typeof mode == 'number') {
			if(port == 'A') {
				this.__setIoModeA(mode);
			} else if(port == 'B') {
				this.__setIoModeB(mode);
			} else {
				this.__setIoModeA(mode);
				this.__setIoModeB(mode);
			}
		}
	};

	Hamster.prototype.setOutput = function(port, value) {
		var motoring = this.motoring;
		this.__cancelIo();
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

	Hamster.prototype.changeOutput = function(port, value) {
		var motoring = this.motoring;
		this.__cancelIo();
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

	Hamster.prototype.gripper = function(action, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelIo();

		var id = self.__issueIoId();
		self.__setIoModeA(10);
		self.__setIoModeB(10);
		if(GRIPPERS[action] == OPEN) {
			motoring.outputA = 1;
			motoring.outputB = 0;
		} else {
			motoring.outputA = 0;
			motoring.outputB = 1;
		}
		self.ioTimer = setTimeout(function() {
			if(self.ioId == id) {
				self.__cancelIo();
				callback();
			}
		}, 500);
		self.timeouts.push(self.ioTimer);
	};

	Hamster.prototype.releaseGripper = function() {
		var motoring = this.motoring;
		this.__cancelIo();
		this.__setIoModeA(10);
		this.__setIoModeB(10);
		motoring.outputA = 0;
		motoring.outputB = 0;
	};

	Hamster.prototype.getInputA = function() {
		return this.sensory.inputA;
	};

	Hamster.prototype.getInputB = function() {
		return this.sensory.inputB;
	};

	Hamster.prototype.writeSerial = function(mode, text, callback) {
		this.__cancelIo();
	};

	Hamster.prototype.readSerialUltil = function(delimiter, callback) {
		this.__cancelIo();
	};

	Hamster.prototype.setSerialRate = function(baud) {
		this.__cancelIo();
	};

	Hamster.prototype.getSerialInput = function() {
		return '';
	};
	
	function HamsterS(index) {
		this.sensory = {
			map: 0,
			map2: 0,
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
			tilt: 0,
			serial: '',
			pulseCount: 0,
			wheelState: 0,
			soundState: 0,
			lineTracerState: 0,
			batteryState: 2,
			handFound: false
		};
		this.motoring = {
			module: HAMSTER_S,
			index: index,
			map: 0xfc000000,
			map2: 0xc0000000,
			leftWheel: 0,
			rightWheel: 0,
			leftRed: 0,
			leftGreen: 0,
			leftBlue: 0,
			rightRed: 0,
			rightGreen: 0,
			rightBlue: 0,
			buzzer: 0,
			outputA: 0,
			outputB: 0,
			pulse: 0,
			note: 0,
			sound: 0,
			lineTracerMode: 0,
			lineTracerGain: 4,
			lineTracerSpeed: 5,
			ioModeA: 0,
			ioModeB: 0,
			serial: undefined,
			motionType: 0,
			motionUnit: 0,
			motionSpeed: 0,
			motionValue: 0,
			motionRadius: 0
		};
		this.blockId = 0;
		this.motionCallback = undefined;
		this.lineTracerCallback = undefined;
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.ioId = 0;
		this.ioTimer = undefined;
		this.serialDelimiter = 0;
		this.serialRate = 176;
		this.writeSerialCallbacks = [];
		this.readSerialCallbacks = [];
		this.serialInput = '';
		this.freeFall = false;
		this.tap = false;
		this.tempo = 60;
		this.speed = 5;
		this.gain = -1;
		this.writeQueue = new WriteQueue(64);
		this.readQueue = new ReadQueue(64);
		this.timeouts = [];
	}
	
	HamsterS.prototype.reset = function() {
		var motoring = this.motoring;
		motoring.map = 0xfc7c0000;
		motoring.map2 = 0xfa000000;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.leftRed = 0;
		motoring.leftGreen = 0;
		motoring.leftBlue = 0;
		motoring.rightRed = 0;
		motoring.rightGreen = 0;
		motoring.rightBlue = 0;
		motoring.buzzer = 0;
		motoring.outputA = 0;
		motoring.outputB = 0;
		motoring.pulse = 0;
		motoring.note = 0;
		motoring.sound = 0;
		motoring.lineTracerMode = 0;
		motoring.lineTracerGain = 4;
		motoring.lineTracerSpeed = 5;
		motoring.ioModeA = 0;
		motoring.ioModeB = 0;
		motoring.serial = undefined;
		motoring.motionType = 0;
		motoring.motionUnit = 0;
		motoring.motionSpeed = 0;
		motoring.motionValue = 0;
		motoring.motionRadius = 0;

		this.blockId = 0;
		this.motionCallback = undefined;
		this.lineTracerCallback = undefined;
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.ioId = 0;
		this.ioTimer = undefined;
		this.serialDelimiter = 0;
		this.serialRate = 176;
		this.writeSerialCallbacks = [];
		this.readSerialCallbacks = [];
		this.serialInput = '';
		this.freeFall = false;
		this.tap = false;
		this.tempo = 60;
		this.speed = 5;
		this.gain = -1;

		this.__removeAllTimeouts();
		this.writeQueue.reset();
		this.readQueue.reset();
	};
	
	HamsterS.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	HamsterS.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};

	HamsterS.prototype.__fireWriteSerialCallbacks = function() {
		var callbacks = this.writeSerialCallbacks;
		for(var i in callbacks) {
			callbacks[i]();
		}
		this.writeSerialCallbacks = [];
	};

	HamsterS.prototype.__fireReadSerialCallbacks = function() {
		var callbacks = this.readSerialCallbacks;
		for(var i in callbacks) {
			callbacks[i]();
		}
		this.readSerialCallbacks = [];
	};

	HamsterS.prototype.clearMotoring = function() {
		this.motoring.map = 0xfc000000;
		this.motoring.map2 = 0xc0000000;
	};

	HamsterS.prototype.clearEvent = function() {
		this.freeFall = false;
		this.tap = false;
	};

	HamsterS.prototype.__setPulse = function(pulse) {
		this.motoring.pulse = pulse;
		this.motoring.map2 |= 0x20000000;
	};

	HamsterS.prototype.__setLineTracerMode = function(mode) {
		this.motoring.lineTracerMode = mode;
		this.motoring.map |= 0x00200000;
	};

	HamsterS.prototype.__setLineTracerGain = function(gain) {
		this.motoring.lineTracerGain = gain;
		this.motoring.map2 |= 0x08000000;
	};

	HamsterS.prototype.__setLineTracerSpeed = function(speed) {
		this.motoring.lineTracerSpeed = speed;
		this.motoring.map |= 0x00100000;
	};

	HamsterS.prototype.__cancelLineTracer = function() {
		this.lineTracerCallback = undefined;
	};

	HamsterS.prototype.__setMotion = function(type, unit, speed, value, radius) {
		var motoring = this.motoring;
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map2 |= 0x02000000;
	};

	HamsterS.prototype.__cancelMotion = function() {
		this.motionCallback = undefined;
	};

	HamsterS.prototype.__cancelBoard = function() {
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
	};

	HamsterS.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x00400000;
	};

	HamsterS.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	HamsterS.prototype.__cancelNote = function() {
		this.noteId = 0;
		if(this.noteTimer1 !== undefined) {
			this.__removeTimeout(this.noteTimer1);
		}
		if(this.noteTimer2 !== undefined) {
			this.__removeTimeout(this.noteTimer2);
		}
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
	};

	HamsterS.prototype.__setSound = function(sound) {
		this.motoring.sound = sound;
		this.motoring.map2 |= 0x10000000;
	};

	HamsterS.prototype.__runSound = function(sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			this.currentSound = sound;
			this.soundRepeat = count;
			this.__setSound(sound);
		}
	};

	HamsterS.prototype.__cancelSound = function() {
		this.soundCallback = undefined;
	};

	HamsterS.prototype.__setIoModeA = function(mode) {
		this.motoring.ioModeA = mode;
		this.motoring.map |= 0x00080000;
	};

	HamsterS.prototype.__setIoModeB = function(mode) {
		this.motoring.ioModeB = mode;
		this.motoring.map |= 0x00040000;
	};

	HamsterS.prototype.__issueIoId = function() {
		this.ioId = this.blockId = (this.blockId % 65535) + 1;
		return this.ioId;
	};

	HamsterS.prototype.__cancelIo = function() {
		this.ioId = 0;
		if(this.ioTimer !== undefined) {
			this.__removeTimeout(this.ioTimer);
		}
		this.ioTimer = undefined;
	};

	HamsterS.prototype.__setSerial = function(arr) {
		var motoring = this.motoring;
		if(motoring.serial == undefined) motoring.serial = new Array(19);
		for(var i = 0; i < 19; ++i) {
			motoring.serial[i] = arr[i];
		}
		motoring.map2 |= 0x04000000;
	};

	HamsterS.prototype.handleSensory = function() {
		var self = this;
		var sensory = self.sensory;
		if(sensory.map2 & 0x00008000) self.freeFall = true;
		if(sensory.map2 & 0x00004000) self.tap = true;

		if(self.lineTracerCallback && (sensory.map & 0x00000010) != 0) {
			if(sensory.lineTracerState == 0x40) {
				self.__setLineTracerMode(0);
				var callback = self.lineTracerCallback;
				self.__cancelLineTracer();
				if(callback) callback();
			}
		}
		if(self.boardCallback) {
			var motoring = self.motoring;
			if(self.boardCommand == 1) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
								self.boardCount ++;
							else
								self.boardCount = 0;
							var diff = sensory.leftFloor - sensory.rightFloor;
							motoring.leftWheel = 45 + diff * 0.25;
							motoring.rightWheel = 45 - diff * 0.25;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						motoring.leftWheel = 45 + diff * 0.25;
						motoring.rightWheel = 45 - diff * 0.25;
						self.boardState = 3;
						self.wheelTimer = setTimeout(function() {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							self.boardState = 4;
							if(self.wheelTimer !== undefined) self.__removeTimeout(self.wheelTimer);
							self.wheelTimer = undefined;
						}, 250);
						self.timeouts.push(self.wheelTimer);
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
						var callback = self.boardCallback;
						self.__cancelBoard();
						if(callback) callback();
						break;
					}
				}
			} else if(self.boardCommand == 2) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor > 50)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.leftFloor < 20) {
							self.boardState = 3;
						}
						break;
					}
					case 3: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor < 20)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.leftFloor > 50) {
							self.boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = self.boardCallback;
							self.__cancelBoard();
							if(callback) callback();
						} else {
							motoring.leftWheel = diff * 0.5;
							motoring.rightWheel = -diff * 0.5;
						}
						break;
					}
				}
			} else if(self.boardCommand == 3) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.rightFloor > 50)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.rightFloor < 20) {
							self.boardState = 3;
						}
						break;
					}
					case 3: {
						if(self.boardCount < 2) {
							if(sensory.rightFloor < 20)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.rightFloor > 50) {
							self.boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.rightFloor - sensory.leftFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = self.boardCallback;
							self.__cancelBoard();
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
		if(self.motionCallback && (sensory.map2 & 0x00000800) != 0) {
			if(sensory.wheelState == 2) {
				self.motoring.leftWheel = 0;
				self.motoring.rightWheel = 0;
				var callback = self.motionCallback;
				self.__cancelMotion();
				if(callback) callback();
			}
		}
		if((sensory.map2 & 0x00000400) != 0) {
			if(sensory.soundState == 0) {
				if(self.currentSound > 0) {
					if(self.soundRepeat < 0) {
						self.__runSound(self.currentSound, -1);
					} else if(self.soundRepeat > 1) {
						self.soundRepeat --;
						self.__runSound(self.currentSound, self.soundRepeat);
					} else {
						self.currentSound = 0;
						self.soundRepeat = 1;
						var callback = self.soundCallback;
						self.__cancelSound();
						if(callback) callback();
					}
				} else {
					self.currentSound = 0;
					self.soundRepeat = 1;
					var callback = self.soundCallback;
					self.__cancelSound();
					if(callback) callback();
				}
			}
		}
		if(sensory.map2 & 0x00002000) {
			if(sensory.serial) self.readQueue.push(sensory.serial);
		}
		if(sensory.map2 & 0x00000200) {
			var tmp = self.writeQueue.pop();
			if(tmp) {
				self.__setSerial(tmp);
			} else {
				self.__fireWriteSerialCallbacks();
			}
		}
		if(self.readSerialCallbacks.length > 0) {
			var tmp = self.readQueue.pop(self.serialDelimiter);
			if(tmp) {
				self.serialInput = tmp;
				self.__fireReadSerialCallbacks();
			}
		}
	};

	HamsterS.prototype.__board = function(leftVelocity, rightVelocity, command, callback) {
		var motoring = this.motoring;
		this.__cancelMotion();
		this.__cancelLineTracer();

		motoring.leftWheel = leftVelocity;
		motoring.rightWheel = rightVelocity;
		this.boardCommand = command;
		this.boardCount = 0;
		this.boardState = 1;
		this.boardCallback = callback;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.boardForward = function(callback) {
		this.__board(45, 45, 1, callback);
	};

	HamsterS.prototype.boardTurn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__board(-45, 45, 2, callback);
		} else {
			this.__board(45, -45, 3, callback);
		}
	};

	HamsterS.prototype.__motion = function(type, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(type, 1, 0, 0, 0); // type, unit, speed, value, radius
		this.motionCallback = callback;
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.__motionUnit = function(type, unit, value, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		value = parseFloat(value);
		if(value && value > 0) {
			this.__setMotion(type, unit, 0, value, 0); // type, unit, speed, value, radius
			this.motionCallback = callback;
			this.__setLineTracerMode(0);
		} else {
			this.__setMotion(0, 0, 0, 0, 0);
			this.__setLineTracerMode(0);
			callback();
		}
	};

	HamsterS.prototype.__motionUnitRadius = function(type, unit, value, radius, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		value = parseFloat(value);
		radius = parseFloat(radius);
		if(value && value > 0 && (typeof radius == 'number') && radius >= 0) {
			this.__setMotion(type, unit, 0, value, radius); // type, unit, speed, value, radius
			this.motionCallback = callback;
			this.__setLineTracerMode(0);
		} else {
			this.__setMotion(0, 0, 0, 0, 0);
			this.__setLineTracerMode(0);
			callback();
		}
	};

	HamsterS.prototype.moveForward = function(callback) {
		this.__motion(101, callback);
	};

	HamsterS.prototype.moveBackward = function(callback) {
		this.__motion(102, callback);
	};

	HamsterS.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(103, callback);
		} else {
			this.__motion(104, callback);
		}
	};

	HamsterS.prototype.moveForwardSecs = function(secs, callback) {
		this.__motionUnit(1, 2, secs, callback);
	};

	HamsterS.prototype.moveBackwardSecs = function(secs, callback) {
		this.__motionUnit(2, 2, secs, callback);
	};

	HamsterS.prototype.turnSecs = function(direction, secs, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motionUnit(3, 2, secs, callback);
		} else {
			this.__motionUnit(4, 2, secs, callback);
		}
	};

	HamsterS.prototype.moveForwardUnit = function(value, unit, callback) {
		this.__motionUnit(1, UNITS[unit], value, callback);
	};

	HamsterS.prototype.moveBackwardUnit = function(value, unit, callback) {
		this.__motionUnit(2, UNITS[unit], value, callback);
	};

	HamsterS.prototype.turnUnit = function(direction, value, unit, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motionUnit(3, UNITS[unit], value, callback);
		} else {
			this.__motionUnit(4, UNITS[unit], value, callback);
		}
	};

	HamsterS.prototype.pivotUnit = function(wheel, value, unit, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[wheel] == LEFT) {
			if(TOWARDS[toward] == FORWARD) this.__motionUnit(5, unit, value, callback);
			else this.__motionUnit(6, unit, value, callback);
		} else {
			if(TOWARDS[toward] == FORWARD) this.__motionUnit(7, unit, value, callback);
			else this.__motionUnit(8, unit, value, callback);
		}
	};

	HamsterS.prototype.swingUnit = function(direction, value, unit, radius, toward, callback) {
		unit = UNITS[unit];
		if(DIRECTIONS[direction] == LEFT) {
			if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(9, unit, value, radius, callback);
			else this.__motionUnitRadius(10, unit, value, radius, callback);
		} else {
			if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(11, unit, value, radius, callback);
			else this.__motionUnitRadius(12, unit, value, radius, callback);
		}
	};

	HamsterS.prototype.pivotPenUnit = function(pen, value, unit, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[pen] == LEFT) {
			if(TOWARDS[toward] == FORWARD) this.__motionUnit(13, unit, value, callback);
			else this.__motionUnit(14, unit, value, callback);
		} else {
			if(TOWARDS[toward] == FORWARD) this.__motionUnit(15, unit, value, callback);
			else this.__motionUnit(16, unit, value, callback);
		}
	};
	
	HamsterS.prototype.swingPenUnit = function(pen, direction, value, unit, radius, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[pen] == LEFT) {
			if(DIRECTIONS[direction] == LEFT) {
				if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(17, unit, value, radius, callback);
				else this.__motionUnitRadius(18, unit, value, radius, callback);
			} else {
				if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(19, unit, value, radius, callback);
				else this.__motionUnitRadius(20, unit, value, radius, callback);
			}
		} else {
			if(DIRECTIONS[direction] == LEFT) {
				if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(21, unit, value, radius, callback);
				else this.__motionUnitRadius(22, unit, value, radius, callback);
			} else {
				if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(23, unit, value, radius, callback);
				else this.__motionUnitRadius(24, unit, value, radius, callback);
			}
		}
	};

	HamsterS.prototype.setWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel = leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel = rightVelocity;
		}
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.changeWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel += leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel += rightVelocity;
		}
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.setWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		velocity = parseFloat(velocity);
		if(typeof velocity == 'number') {
			wheel = PARTS[wheel];
			if(wheel == LEFT) {
				motoring.leftWheel = velocity;
			} else if(wheel == RIGHT) {
				motoring.rightWheel = velocity;
			} else {
				motoring.leftWheel = velocity;
				motoring.rightWheel = velocity;
			}
		}
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.changeWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		velocity = parseFloat(velocity);
		if(typeof velocity == 'number') {
			wheel = PARTS[wheel];
			if(wheel == LEFT) {
				motoring.leftWheel += velocity;
			} else if(wheel == RIGHT) {
				motoring.rightWheel += velocity;
			} else {
				motoring.leftWheel += velocity;
				motoring.rightWheel += velocity;
			}
		}
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.followLine = function(color, sensor) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		var mode = 1;
		sensor = PARTS[sensor];
		if(sensor == RIGHT) mode = 2;
		else if(sensor == BOTH) mode = 3;
		if(VALUES[color] == WHITE) mode += 7;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
	};

	HamsterS.prototype.followLineUntil = function(color, direction, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();

		var mode = 4;
		direction = DIRECTIONS[direction];
		if(direction == RIGHT) mode = 5;
		else if(direction == FRONT) mode = 6;
		else if(direction == REAR) mode = 7;
		if(VALUES[color] == WHITE) mode += 7;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};

	HamsterS.prototype.setLineTracerSpeed = function(speed) {
		speed = parseInt(speed);
		var gain = this.gain;
		if(gain < 0) gain = SPEED2GAINS[speed];
		if(speed && gain && speed > 0 && gain > 0) {
			this.speed = speed;
			this.__setLineTracerSpeed(speed);
			this.__setLineTracerGain(gain);
		}
	};
	
	HamsterS.prototype.setLineTracerGain = function(gain) {
		gain = parseInt(gain);
		if(gain && gain > 0) {
			this.gain = gain;
			this.__setLineTracerGain(gain);
		} else {
			this.gain = -1;
			gain = SPEED2GAINS[this.speed];
			if(gain && gain > 0) {
				this.__setLineTracerGain(gain);
			}
		}
	};

	HamsterS.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.setLed = function(led, color) {
		var rgb = RGB_COLORS[color];
		if(rgb) {
			this.setRgb(led, rgb[0], rgb[1], rgb[2]);
		}
	};

	HamsterS.prototype.clearLed = function(led) {
		this.setRgb(led, 0, 0, 0);
	};

	HamsterS.prototype.setRgbArray = function(led, rgb) {
		if(rgb) {
			this.setRgb(led, rgb[0], rgb[1], rgb[2]);
		}
	};

	HamsterS.prototype.setRgb = function(led, red, green, blue) {
		var motoring = this.motoring;
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		led = PARTS[led];
		if(led == LEFT) {
			if(typeof red == 'number') {
				motoring.leftRed = red;
			}
			if(typeof green == 'number') {
				motoring.leftGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.leftBlue = blue;
			}
		} else if(led == RIGHT) {
			if(typeof red == 'number') {
				motoring.rightRed = red;
			}
			if(typeof green == 'number') {
				motoring.rightGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.rightBlue = blue;
			}
		} else {
			if(typeof red == 'number') {
				motoring.leftRed = red;
				motoring.rightRed = red;
			}
			if(typeof green == 'number') {
				motoring.leftGreen = green;
				motoring.rightGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.leftBlue = blue;
				motoring.rightBlue = blue;
			}
		}
	};

	HamsterS.prototype.changeRgb = function(led, red, green, blue) {
		var motoring = this.motoring;
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		led = PARTS[led];
		if(led == LEFT) {
			if(typeof red == 'number') {
				motoring.leftRed += red;
			}
			if(typeof green == 'number') {
				motoring.leftGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.leftBlue += blue;
			}
		} else if(led == RIGHT) {
			if(typeof red == 'number') {
				motoring.rightRed += red;
			}
			if(typeof green == 'number') {
				motoring.rightGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.rightBlue += blue;
			}
		} else {
			if(typeof red == 'number') {
				motoring.leftRed += red;
				motoring.rightRed += red;
			}
			if(typeof green == 'number') {
				motoring.leftGreen += green;
				motoring.rightGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.leftBlue += blue;
				motoring.rightBlue += blue;
			}
		}
	};

	HamsterS.prototype.beep = function(callback) {
		this.playSoundUntil('beep', 1, callback);
	};

	HamsterS.prototype.playSound = function(sound, count) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		sound = SOUND_EFFECTS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		this.__setNote(0);
		if(sound && count) {
			this.__runSound(sound, count);
		} else {
			this.__runSound(0);
		}
	};

	HamsterS.prototype.playSoundUntil = function(sound, count, callback) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		sound = SOUND_EFFECTS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		this.__setNote(0);
		if(sound && count) {
			this.__runSound(sound, count);
			this.soundCallback = callback;
		} else {
			this.__runSound(0);
			callback();
		}
	};

	HamsterS.prototype.setBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer = hz;
		}
		this.__setNote(0);
		this.__runSound(0);
	};

	HamsterS.prototype.changeBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer += hz;
		}
		this.__setNote(0);
		this.__runSound(0);
	};

	HamsterS.prototype.clearBuzzer = function() {
		this.clearSound();
	};

	HamsterS.prototype.clearSound = function() {
		this.__cancelNote();
		this.__cancelSound();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		this.__runSound(0);
	};

	HamsterS.prototype.playNote = function(note, octave) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		note = NOTES[note];
		octave = parseInt(octave);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8) {
			note += (octave - 1) * 12;
			this.__setNote(note);
		} else {
			this.__setNote(0);
		}
		this.__runSound(0);
	};

	HamsterS.prototype.playNoteBeat = function(note, octave, beat, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelNote();
		self.__cancelSound();

		note = NOTES[note];
		octave = parseInt(octave);
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && self.tempo > 0) {
			var id = self.__issueNoteId();
			note += (octave - 1) * 12;
			self.__setNote(note);
			var timeout = beat * 60 * 1000 / self.tempo;
			var tail = (timeout > 100) ? 100 : 0;
			if(tail > 0) {
				self.noteTimer1 = setTimeout(function() {
					if(self.noteId == id) {
						self.__setNote(0);
						if(self.noteTimer1 !== undefined) self.__removeTimeout(self.noteTimer1);
						self.noteTimer1 = undefined;
					}
				}, timeout - tail);
				self.timeouts.push(self.noteTimer1);
			}
			self.noteTimer2 = setTimeout(function() {
				if(self.noteId == id) {
					self.__setNote(0);
					self.__cancelNote();
					callback();
				}
			}, timeout);
			self.timeouts.push(self.noteTimer2);
			self.__runSound(0);
		} else {
			self.__setNote(0);
			self.__runSound(0);
			callback();
		}
	};

	HamsterS.prototype.restBeat = function(beat, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelNote();
		self.__cancelSound();

		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		self.__setNote(0);
		self.__runSound(0);
		if(beat && beat > 0 && self.tempo > 0) {
			var id = self.__issueNoteId();
			self.noteTimer1 = setTimeout(function() {
				if(self.noteId == id) {
					self.__cancelNote();
					callback();
				}
			}, beat * 60 * 1000 / self.tempo);
			self.timeouts.push(self.noteTimer1);
		} else {
			callback();
		}
	};

	HamsterS.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	HamsterS.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	HamsterS.prototype.getLeftProximity = function() {
		return this.sensory.leftProximity;
	};

	HamsterS.prototype.getRightProximity = function() {
		return this.sensory.rightProximity;
	};

	HamsterS.prototype.getLeftFloor = function() {
		return this.sensory.leftFloor;
	};

	HamsterS.prototype.getRightFloor = function() {
		return this.sensory.rightFloor;
	};

	HamsterS.prototype.getAccelerationX = function() {
		return this.sensory.accelerationX;
	};

	HamsterS.prototype.getAccelerationY = function() {
		return this.sensory.accelerationY;
	};

	HamsterS.prototype.getAccelerationZ = function() {
		return this.sensory.accelerationZ;
	};

	HamsterS.prototype.getLight = function() {
		return this.sensory.light;
	};

	HamsterS.prototype.getTemperature = function() {
		return this.sensory.temperature;
	};

	HamsterS.prototype.getSignalStrength = function() {
		return this.sensory.signalStrength;
	};

	HamsterS.prototype.checkHandFound = function() {
		var sensory = this.sensory;
		return (sensory.handFound === undefined) ? (sensory.leftProximity > 50 || sensory.rightProximity > 50) : sensory.handFound;
	};

	HamsterS.prototype.checkTilt = function(tilt) {
		switch(TILTS[tilt]) {
			case TILT_FORWARD: return this.sensory.tilt == 1;
			case TILT_BACKWARD: return this.sensory.tilt == -1;
			case TILT_LEFT: return this.sensory.tilt == 2;
			case TILT_RIGHT: return this.sensory.tilt == -2;
			case TILT_FLIP: return this.sensory.tilt == 3;
			case TILT_NONE: return this.sensory.tilt == -3;
			case TILT_TAP: return this.tap;
			case TILT_FREE_FALL: return this.freeFall;
		}
		return false;
	};

	HamsterS.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};

	HamsterS.prototype.setIoMode = function(port, mode) {
		this.__cancelIo();
		mode = IO_MODES[mode];
		if(typeof mode == 'number') {
			if(port == 'A') {
				this.__setIoModeA(mode);
			} else if(port == 'B') {
				this.__setIoModeB(mode);
			} else {
				this.__setIoModeA(mode);
				this.__setIoModeB(mode);
			}
		}
	};

	HamsterS.prototype.setOutput = function(port, value) {
		var motoring = this.motoring;
		this.__cancelIo();
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

	HamsterS.prototype.changeOutput = function(port, value) {
		var motoring = this.motoring;
		this.__cancelIo();
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

	HamsterS.prototype.gripper = function(action, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelIo();

		var id = self.__issueIoId();
		self.__setIoModeA(10);
		self.__setIoModeB(10);
		if(GRIPPERS[action] == OPEN) {
			motoring.outputA = 1;
			motoring.outputB = 0;
		} else {
			motoring.outputA = 0;
			motoring.outputB = 1;
		}
		self.ioTimer = setTimeout(function() {
			if(self.ioId == id) {
				self.__cancelIo();
				callback();
			}
		}, 500);
		self.timeouts.push(self.ioTimer);
	};

	HamsterS.prototype.releaseGripper = function() {
		var motoring = this.motoring;
		this.__cancelIo();
		this.__setIoModeA(10);
		this.__setIoModeB(10);
		motoring.outputA = 0;
		motoring.outputB = 0;
	};

	HamsterS.prototype.getInputA = function() {
		return this.sensory.inputA;
	};

	HamsterS.prototype.getInputB = function() {
		return this.sensory.inputB;
	};

	HamsterS.prototype.writeSerial = function(mode, text, callback) {
		var motoring = this.motoring;
		this.__cancelIo();
		this.__setIoModeA(this.serialRate);
		this.__setIoModeB(this.serialRate);
		var queue = this.writeQueue;
		queue.push(text, SERIAL_MODES[mode] != SERIAL_STRING);
		var data = queue.pop();
		if(data) {
			this.writeSerialCallbacks.push(callback);
			this.__setSerial(data);
		}
	};

	HamsterS.prototype.readSerialUltil = function(delimiter, callback) {
		var motoring = this.motoring;
		this.__cancelIo();
		this.__setIoModeA(this.serialRate);
		this.__setIoModeB(this.serialRate);
		delimiter = SERIAL_DELIMITERS[delimiter];
		if(typeof delimiter == 'number') {
			this.serialDelimiter = delimiter;
			this.readSerialCallbacks.push(callback);
		}
	};

	HamsterS.prototype.setSerialRate = function(baud) {
		var motoring = this.motoring;
		this.__cancelIo();
		baud = SERIAL_BAUDS[baud];
		if(baud && baud > 0) {
			this.serialRate = baud;
			this.__setIoModeA(baud);
			this.__setIoModeB(baud);
		}
	};

	HamsterS.prototype.getSerialInput = function() {
		return this.serialInput;
	};
	
	function Turtle(index) {
		this.sensory = {
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
			tilt: 0,
			wheelState: 0,
			soundState: 0,
			lineTracerState: 0,
			batteryState: 2
		};
		this.motoring = {
			module: TURTLE,
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
		this.blockId = 0;
		this.motionCallback = undefined;
		this.lineTracerCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.clicked = false;
		this.doubleClicked = false;
		this.longPressed = false;
		this.colorPattern = -1;
		this.tempo = 60;
		this.timeouts = [];
	}

	Turtle.prototype.reset = function() {
		var motoring = this.motoring;
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

		this.blockId = 0;
		this.motionCallback = undefined;
		this.lineTracerCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.clicked = false;
		this.doubleClicked = false;
		this.longPressed = false;
		this.colorPattern = -1;
		this.tempo = 60;

		this.__removeAllTimeouts();
	};

	Turtle.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	Turtle.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};

	Turtle.prototype.clearMotoring = function() {
		this.motoring.map = 0xf8000000;
	};

	Turtle.prototype.clearEvent = function() {
		this.clicked = false;
		this.doubleClicked = false;
		this.longPressed = false;
		this.colorPattern = -1;
	};

	Turtle.prototype.__setPulse = function(pulse) {
		this.motoring.pulse = pulse;
		this.motoring.map |= 0x04000000;
	};

	Turtle.prototype.__setLineTracerMode = function(mode) {
		this.motoring.lineTracerMode = mode;
		this.motoring.map |= 0x00800000;
	};

	Turtle.prototype.__setLineTracerGain = function(gain) {
		this.motoring.lineTracerGain = gain;
		this.motoring.map |= 0x00400000;
	};

	Turtle.prototype.__setLineTracerSpeed = function(speed) {
		this.motoring.lineTracerSpeed = speed;
		this.motoring.map |= 0x00200000;
	};

	Turtle.prototype.__cancelLineTracer = function() {
		this.lineTracerCallback = undefined;
	};

	Turtle.prototype.__setMotion = function(type, unit, speed, value, radius) {
		var motoring = this.motoring;
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map |= 0x00040000;
	};

	Turtle.prototype.__cancelMotion = function() {
		this.motionCallback = undefined;
	};

	Turtle.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x02000000;
	};

	Turtle.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	Turtle.prototype.__cancelNote = function() {
		this.noteId = 0;
		if(this.noteTimer1 !== undefined) {
			this.__removeTimeout(this.noteTimer1);
		}
		if(this.noteTimer2 !== undefined) {
			this.__removeTimeout(this.noteTimer2);
		}
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
	};

	Turtle.prototype.__setSound = function(sound) {
		this.motoring.sound = sound;
		this.motoring.map |= 0x01000000;
	};

	Turtle.prototype.__runSound = function(sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			this.currentSound = sound;
			this.soundRepeat = count;
			this.__setSound(sound);
		}
	};

	Turtle.prototype.__cancelSound = function() {
		this.soundCallback = undefined;
	};

	Turtle.prototype.handleSensory = function() {
		var self = this;
		var sensory = self.sensory;
		if(sensory.map & 0x00000800) self.clicked = true;
		if(sensory.map & 0x00000400) self.doubleClicked = true;
		if(sensory.map & 0x00000200) self.longPressed = true;
		if(sensory.map & 0x00000080) self.colorPattern = sensory.colorPattern;

		if(self.lineTracerCallback && (sensory.map & 0x00000008) != 0) {
			if(sensory.lineTracerState == 0x02) {
				self.__setLineTracerMode(0);
				var callback = self.lineTracerCallback;
				self.__cancelLineTracer();
				if(callback) callback();
			}
		}
		if(self.motionCallback && (sensory.map & 0x00000020) != 0) {
			if(sensory.wheelState == 0) {
				self.motoring.leftWheel = 0;
				self.motoring.rightWheel = 0;
				var callback = self.motionCallback;
				self.__cancelMotion();
				if(callback) callback();
			}
		}
		if((sensory.map & 0x00000010) != 0) {
			if(sensory.soundState == 0) {
				if(self.currentSound > 0) {
					if(self.soundRepeat < 0) {
						self.__runSound(self.currentSound, -1);
					} else if(self.soundRepeat > 1) {
						self.soundRepeat --;
						self.__runSound(self.currentSound, self.soundRepeat);
					} else {
						self.currentSound = 0;
						self.soundRepeat = 1;
						var callback = self.soundCallback;
						self.__cancelSound();
						if(callback) callback();
					}
				} else {
					self.currentSound = 0;
					self.soundRepeat = 1;
					var callback = self.soundCallback;
					self.__cancelSound();
					if(callback) callback();
				}
			}
		}
	};

	Turtle.prototype.__motion = function(type, callback) {
		var motoring = this.motoring;
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(type, 1, 0, 0, 0); // type, unit, speed, value, radius
		this.motionCallback = callback;
		this.__setLineTracerMode(0);
	};

	Turtle.prototype.__motionUnit = function(type, unit, value, callback) {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		value = parseFloat(value);
		if(value && value > 0) {
			this.__setMotion(type, unit, 0, value, 0); // type, unit, speed, value, radius
			this.motionCallback = callback;
			this.__setLineTracerMode(0);
		} else {
			this.__setMotion(0, 0, 0, 0, 0);
			this.__setLineTracerMode(0);
			callback();
		}
	};

	Turtle.prototype.__motionUnitRadius = function(type, unit, value, radius, callback) {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		value = parseFloat(value);
		radius = parseFloat(radius);
		if(value && value > 0 && (typeof radius == 'number') && radius >= 0) {
			this.__setMotion(type, unit, 0, value, radius); // type, unit, speed, value, radius
			this.motionCallback = callback;
			this.__setLineTracerMode(0);
		} else {
			this.__setMotion(0, 0, 0, 0, 0);
			this.__setLineTracerMode(0);
			callback();
		}
	};

	Turtle.prototype.moveForward = function(callback) {
		this.__motion(101, callback);
	};

	Turtle.prototype.moveBackward = function(callback) {
		this.__motion(102, callback);
	};

	Turtle.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(103, callback);
		} else {
			this.__motion(104, callback);
		}
	};

	Turtle.prototype.moveForwardUnit = function(value, unit, callback) {
		this.__motionUnit(1, UNITS[unit], value, callback);
	};

	Turtle.prototype.moveBackwardUnit = function(value, unit, callback) {
		this.__motionUnit(2, UNITS[unit], value, callback);
	};

	Turtle.prototype.turnUnit = function(direction, value, unit, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motionUnit(3, UNITS[unit], value, callback);
		} else {
			this.__motionUnit(4, UNITS[unit], value, callback);
		}
	};

	Turtle.prototype.pivotUnit = function(wheel, value, unit, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[wheel] == LEFT) {
			if(TOWARDS[toward] == HEAD) this.__motionUnit(5, unit, value, callback);
			else this.__motionUnit(6, unit, value, callback);
		} else {
			if(TOWARDS[toward] == HEAD) this.__motionUnit(7, unit, value, callback);
			else this.__motionUnit(8, unit, value, callback);
		}
	};

	Turtle.prototype.swingUnit = function(direction, value, unit, radius, toward, callback) {
		unit = UNITS[unit];
		if(DIRECTIONS[direction] == LEFT) {
			if(TOWARDS[toward] == HEAD) this.__motionUnitRadius(9, unit, value, radius, callback);
			else this.__motionUnitRadius(10, unit, value, radius, callback);
		} else {
			if(TOWARDS[toward] == HEAD) this.__motionUnitRadius(11, unit, value, radius, callback);
			else this.__motionUnitRadius(12, unit, value, radius, callback);
		}
	};

	Turtle.prototype.setWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel = leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel = rightVelocity;
		}
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	Turtle.prototype.changeWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel += leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel += rightVelocity;
		}
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	Turtle.prototype.setWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		velocity = parseFloat(velocity);
		if(typeof velocity == 'number') {
			wheel = PARTS[wheel];
			if(wheel == LEFT) {
				motoring.leftWheel = velocity;
			} else if(wheel == RIGHT) {
				motoring.rightWheel = velocity;
			} else {
				motoring.leftWheel = velocity;
				motoring.rightWheel = velocity;
			}
		}
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	Turtle.prototype.changeWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		velocity = parseFloat(velocity);
		if(typeof velocity == 'number') {
			wheel = PARTS[wheel];
			if(wheel == LEFT) {
				motoring.leftWheel += velocity;
			} else if(wheel == RIGHT) {
				motoring.rightWheel += velocity;
			} else {
				motoring.leftWheel += velocity;
				motoring.rightWheel += velocity;
			}
		}
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	Turtle.prototype.followLine = function(color) {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		var mode = 10 + LINE_COLORS[color];
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
	};

	Turtle.prototype.followLineUntil = function(color, callback) {
		var motoring = this.motoring;
		this.__cancelMotion();

		var mode = 60 + LINE_COLORS[color];
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};

	Turtle.prototype.followLineUntilBlack = function(color, callback) {
		var motoring = this.motoring;
		this.__cancelMotion();

		var mode = 70 + LINE_COLORS[color];
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};

	Turtle.prototype.crossIntersection = function(callback) {
		var motoring = this.motoring;
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(40);
		this.lineTracerCallback = callback;
	};

	Turtle.prototype.turnAtIntersection = function(direction, callback) {
		var motoring = this.motoring;
		this.__cancelMotion();

		var mode = 20;
		direction = DIRECTIONS[direction];
		if(direction == RIGHT) mode = 30;
		else if(direction === BACK) mode = 50;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};

	Turtle.prototype.setLineTracerSpeed = function(speed) {
		speed = parseInt(speed);
		if(typeof speed == 'number') {
			this.__setLineTracerSpeed(speed);
			this.__setLineTracerGain(speed);
		}
	};

	Turtle.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	Turtle.prototype.setHeadColor = function(color) {
		var rgb = RGB_COLORS[color];
		if(rgb) {
			this.setHeadRgb(rgb[0], rgb[1], rgb[2]);
		}
	};

	Turtle.prototype.setHeadRgbArray = function(rgb) {
		if(rgb) {
			this.setHeadRgb(rgb[0], rgb[1], rgb[2]);
		}
	};

	Turtle.prototype.setHeadRgb = function(red, green, blue) {
		var motoring = this.motoring;
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

	Turtle.prototype.changeHeadRgb = function(red, green, blue) {
		var motoring = this.motoring;
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

	Turtle.prototype.clearHead = function() {
		this.setHeadRgb(0, 0, 0);
	};

	Turtle.prototype.playSound = function(sound, count) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		sound = SOUNDS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		this.__setNote(0);
		if(sound && count) {
			this.__runSound(sound, count);
		} else {
			this.__runSound(0);
		}
	};

	Turtle.prototype.playSoundUntil = function(sound, count, callback) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		sound = SOUNDS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		this.__setNote(0);
		if(sound && count) {
			this.__runSound(sound, count);
			this.soundCallback = callback;
		} else {
			this.__runSound(0);
			callback();
		}
	};

	Turtle.prototype.setBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer = hz;
		}
		this.__setNote(0);
		this.__runSound(0);
	};

	Turtle.prototype.changeBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer += hz;
		}
		this.__setNote(0);
		this.__runSound(0);
	};

	Turtle.prototype.clearSound = function() {
		this.__cancelNote();
		this.__cancelSound();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		this.__runSound(0);
	};

	Turtle.prototype.playNote = function(note, octave) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		note = NOTES[note];
		octave = parseInt(octave);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8) {
			note += (octave - 1) * 12;
			this.__setNote(note);
		} else {
			this.__setNote(0);
		}
		this.__runSound(0);
	};

	Turtle.prototype.playNoteBeat = function(note, octave, beat, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelNote();
		self.__cancelSound();

		note = NOTES[note];
		octave = parseInt(octave);
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && self.tempo > 0) {
			var id = self.__issueNoteId();
			note += (octave - 1) * 12;
			self.__setNote(note);
			var timeout = beat * 60 * 1000 / self.tempo;
			var tail = (timeout > 100) ? 100 : 0;
			if(tail > 0) {
				self.noteTimer1 = setTimeout(function() {
					if(self.noteId == id) {
						self.__setNote(0);
						if(self.noteTimer1 !== undefined) self.__removeTimeout(self.noteTimer1);
						self.noteTimer1 = undefined;
					}
				}, timeout - tail);
				self.timeouts.push(self.noteTimer1);
			}
			self.noteTimer2 = setTimeout(function() {
				if(self.noteId == id) {
					self.__setNote(0);
					self.__cancelNote();
					callback();
				}
			}, timeout);
			self.timeouts.push(self.noteTimer2);
			self.__runSound(0);
		} else {
			self.__setNote(0);
			self.__runSound(0);
			callback();
		}
	};

	Turtle.prototype.restBeat = function(beat, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelNote();
		self.__cancelSound();

		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		self.__setNote(0);
		self.__runSound(0);
		if(beat && beat > 0 && self.tempo > 0) {
			var id = self.__issueNoteId();
			self.noteTimer1 = setTimeout(function() {
				if(self.noteId == id) {
					self.__cancelNote();
					callback();
				}
			}, beat * 60 * 1000 / self.tempo);
			self.timeouts.push(self.noteTimer1);
		} else {
			callback();
		}
	};

	Turtle.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	Turtle.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	Turtle.prototype.checkTouchingColor = function(color) {
		color = COLOR_NUMBERS[color];
		if(typeof color == 'number') {
			return this.sensory.colorNumber == color;
		}
		return false;
	};

	Turtle.prototype.checkColorPattern = function(color1, color2) {
		color1 = COLOR_PATTERNS[color1];
		color2 = COLOR_PATTERNS[color2];
		if((typeof color1 == 'number') && (typeof color2 == 'number')) {
			return this.colorPattern == color1 * 10 + color2;
		}
		return false;
	};

	Turtle.prototype.checkButtonEvent = function(event) {
		switch(BUTTON_STATES[event]) {
			case CLICKED: return this.clicked;
			case DOUBLE_CLICKED: return this.doubleClicked;
			case LONG_PRESSED: return this.longPressed;
		}
		return false;
	};

	Turtle.prototype.checkTilt = function(tilt) {
		switch(TILTS[tilt]) {
			case TILT_FORWARD: return this.sensory.tilt == 1;
			case TILT_BACKWARD: return this.sensory.tilt == -1;
			case TILT_LEFT: return this.sensory.tilt == 2;
			case TILT_RIGHT: return this.sensory.tilt == -2;
			case TILT_FLIP: return this.sensory.tilt == 3;
			case TILT_NONE: return this.sensory.tilt == -3;
		}
		return false;
	};

	Turtle.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};

	Turtle.prototype.getColorNumber = function() {
		return this.sensory.colorNumber;
	};

	Turtle.prototype.getColorPattern = function() {
		return this.colorPattern;
	};

	Turtle.prototype.getFloor = function() {
		return this.sensory.floor;
	};

	Turtle.prototype.getButton = function() {
		return this.sensory.button;
	};

	Turtle.prototype.getAccelerationX = function() {
		return this.sensory.accelerationX;
	};

	Turtle.prototype.getAccelerationY = function() {
		return this.sensory.accelerationY;
	};

	Turtle.prototype.getAccelerationZ = function() {
		return this.sensory.accelerationZ;
	};
	
	function getOrCreateRobot(group, module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			switch(module) {
				case HAMSTER: robot = new Hamster(index); break;
				case HAMSTER_S: robot = new HamsterS(index); break;
				case TURTLE: robot = new Turtle(index); break;
			}
			if(robot) {
				robots[key] = robot;
				packet[key] = robot.motoring;
			}
		}
		robotsByGroup[group + index] = robot;
		return robot;
	}
	
	function getRobot(group, index) {
		return robotsByGroup[group + index];
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
	
	function reset() {
		for(var i in robots) {
			robots[i].reset();
		}
	}
	
	function open(url) {
		if('WebSocket' in window) {
			try {
				var sock = new WebSocket(url);
				var slaveVersion = 1;
				var decode = function(data) {
					if(data.index >= 0) {
						var robot = getOrCreateRobot(data.module, data.realModule, data.index);
						if(robot) {
							robot.sensory = data;
							robot.handleSensory();
						}
					}
				};
				sock.binaryType = 'arraybuffer';
				socket = sock;
				sock.onmessage = function(message) {
					try {
						var received = JSON.parse(message.data);
						slaveVersion = received.version || 0;
						if(received.type == 0) {
							connectionState = received.state;
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
				sock.onopen = function() {
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
		if(robot) robot.boardForward(callback);
	};

	ext.boardTurn = function(index, direction, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.boardTurn(direction, callback);
	};
	
	ext.moveForward = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.moveForward(callback);
	};
	
	ext.moveBackward = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.turn = function(index, direction, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.turn(direction, callback);
	};

	ext.moveForwardForSecs = function(index, sec, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.moveForwardSecs(sec, callback);
	};

	ext.moveBackwardForSecs = function(index, sec, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.moveBackwardSecs(sec, callback);
	};

	ext.turnForSecs = function(index, direction, sec, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.turnSecs(direction, sec, callback);
	};
	
	ext.changeBothWheelsBy = function(index, left, right) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeWheels(left, right);
	};

	ext.setBothWheelsTo = function(index, left, right) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setWheels(left, right);
	};

	ext.changeWheelBy = function(index, which, speed) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeWheel(which, speed);
	};

	ext.setWheelTo = function(index, which, speed) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setWheel(which, speed);
	};

	ext.followLineUsingFloorSensor = function(index, color, which) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.followLine(color, which);
	};

	ext.followLineUntilIntersection = function(index, color, which, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.followLineUntil(color, which, callback);
	};

	ext.setFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setLineTracerSpeed(speed);
	};

	ext.stop = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.stop();
	};

	ext.setLedTo = function(index, which, color) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setLed(which, color);
	};

	ext.clearLed = function(index, which) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.clearLed(which);
	};

	ext.beep = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.beep(callback);
	};

	ext.changeBuzzerBy = function(index, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeBuzzer(value);
	};

	ext.setBuzzerTo = function(index, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setBuzzer(value);
	};

	ext.clearBuzzer = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.clearBuzzer();
	};
	
	ext.playNote = function(index, note, octave) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.playNoteFor = function(index, note, octave, beat, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};

	ext.restFor = function(index, beat, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.restBeat(beat, callback);
	};

	ext.changeTempoBy = function(index, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeTempo(value);
	};

	ext.setTempoTo = function(index, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setTempo(value);
	};

	ext.leftProximity = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getLeftProximity();
		else return 0;
	};

	ext.rightProximity = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getRightProximity();
		else return 0;
	};

	ext.leftFloor = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getLeftFloor();
		else return 0;
	};

	ext.rightFloor = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getRightFloor();
		else return 0;
	};

	ext.accelerationX = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getAccelerationX();
		else return 0;
	};

	ext.accelerationY = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getAccelerationY();
		else return 0;
	};

	ext.accelerationZ = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getAccelerationZ();
		else return 0;
	};

	ext.light = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getLight();
		else return 0;
	};

	ext.temperature = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getTemperature();
		else return 0;
	};

	ext.signalStrength = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getSignalStrength();
		else return 0;
	};

	ext.whenHandFound = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.whenTilt = function(index, tilt) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.handFound = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.tilt = function(index, tilt) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.battery = function(index, state) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkBattery(state);
		return false;
	};

	ext.setPortTo = function(index, port, mode) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setIoMode(port, mode);
	};

	ext.changeOutputBy = function(index, port, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeOutput(port, value);
	};

	ext.setOutputTo = function(index, port, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setOutput(port, value);
	};
	
	ext.gripper = function(index, action, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.gripper(action, callback);
	};
	
	ext.releaseGripper = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.releaseGripper();
	};

	ext.inputA = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getInputA();
		else return 0;
	};

	ext.inputB = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getInputB();
		else return 0;
	};
	
	ext.sBoardMoveForward = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.boardForward(callback);
	};
	
	ext.sBoardTurn = function(index, direction, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.boardTurn(direction, callback);
	};
	
	ext.sMoveForward = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.moveForward(callback);
	};
	
	ext.sMoveBackward = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.sTurn = function(index, direction, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.turn(direction, callback);
	};
	
	ext.sMoveForwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.moveForwardUnit(value, unit, callback);
	};
	
	ext.sMoveBackwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.moveBackwardUnit(value, unit, callback);
	};
	
	ext.sTurnUnitInPlace = function(index, direction, value, unit, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.turnUnit(direction, value, unit, callback);
	};
	
	ext.sTurnUnitWithRadiusInDirection = function(index, direction, value, unit, radius, toward, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.swingUnit(direction, value, unit, radius, toward, callback);
	};
	
	ext.sPivotAroundWheelUnitInDirection = function(index, wheel, value, unit, toward, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.pivotUnit(wheel, value, unit, toward, callback);
	};
	
	ext.sTurnPenUnitWithRadiusInDirection = function(index, pen, direction, value, unit, radius, toward, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.swingPenUnit(pen, direction, value, unit, radius, toward, callback);
	};
	
	ext.sPivotAroundPenUnitInDirection = function(index, pen, value, unit, toward, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.pivotPenUnit(pen, value, unit, toward, callback);
	};
	
	ext.sChangeBothWheelsBy = function(index, left, right) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeWheels(left, right);
	};
	
	ext.sSetBothWheelsTo = function(index, left, right) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setWheels(left, right);
	};
	
	ext.sChangeWheelBy = function(index, wheel, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeWheel(wheel, value);
	};
	
	ext.sSetWheelTo = function(index, wheel, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setWheel(wheel, value);
	};
	
	ext.sFollowLineUsingFloorSensor = function(index, color, sensor) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.followLine(color, sensor);
	};
	
	ext.sFollowLineUntilIntersection = function(index, color, direction, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.followLineUntil(color, direction, callback);
	};
	
	ext.sSetFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setLineTracerSpeed(speed);
	};
	
	ext.sSetFollowingGainTo = function(index, gain) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setLineTracerGain(gain);
	};
	
	ext.sStop = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.stop();
	};
	
	ext.sSetLedTo = function(index, led, color) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setLed(led, color);
	};
	
	ext.sChangeLedByRGB = function(index, led, red, green, blue) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeRgb(led, red, green, blue);
	};
	
	ext.sSetLedToRGB = function(index, led, red, green, blue) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setRgb(led, red, green, blue);
	};
	
	ext.sClearLed = function(index, led) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.clearLed(led);
	};
	
	ext.sPlaySound = function(index, sound) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.playSound(sound, 1);
	};
	
	ext.sPlaySoundTimes = function(index, sound, repeat) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.playSound(sound, repeat);
	};
	
	ext.sPlaySoundTimesUntilDone = function(index, sound, repeat, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.playSoundUntil(sound, repeat, callback);
	};
	
	ext.sChangeBuzzerBy = function(index, hz) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeBuzzer(hz);
	};
	
	ext.sSetBuzzerTo = function(index, hz) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setBuzzer(hz);
	};
	
	ext.sClearSound = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.clearSound();
	};
	
	ext.sPlayNote = function(index, note, octave) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.sPlayNoteFor = function(index, note, octave, beat, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};
	
	ext.sRestFor = function(index, beat, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.restBeat(beat, callback);
	};
	
	ext.sChangeTempoBy = function(index, bpm) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeTempo(bpm);
	};
	
	ext.sSetTempoTo = function(index, bpm) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setTempo(bpm);
	};
	
	ext.sLeftProximity = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getLeftProximity();
		return 0;
	};
	
	ext.sRightProximity = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getRightProximity();
		return 0;
	};
	
	ext.sLeftFloor = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getLeftFloor();
		return 0;
	};
	
	ext.sRightFloor = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getRightFloor();
		return 0;
	};
	
	ext.sAccelerationX = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getAccelerationX();
		return 0;
	};
	
	ext.sAccelerationY = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getAccelerationY();
		return 0;
	};
	
	ext.sAccelerationZ = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getAccelerationZ();
		return 0;
	};
	
	ext.sLight = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getLight();
		return 0;
	};
	
	ext.sTemperature = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getTemperature();
		return 0;
	};
	
	ext.sSignalStrength = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getSignalStrength();
		return 0;
	};
	
	ext.sWhenHandFound = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.sWhenTilt = function(index, tilt) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.sHandFound = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.sTilt = function(index, tilt) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.sBattery = function(index, state) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.checkBattery(state);
		return false;
	};
	
	ext.sSetPortTo = function(index, port, mode) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setIoMode(port, mode);
	};
	
	ext.sChangeOutputBy = function(index, port, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.changeOutput(port, value);
	};
	
	ext.sSetOutputTo = function(index, port, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setOutput(port, value);
	};
	
	ext.sGripper = function(index, action, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.gripper(action, callback);
	};
	
	ext.sReleaseGripper = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.releaseGripper();
	};
	
	ext.sInputA = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getInputA();
		return 0;
	};
	
	ext.sInputB = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getInputB();
		return 0;
	};
	
	ext.sWriteSerial = function(index, mode, text, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.writeSerial(mode, text, callback);
	};
	
	ext.sReadSerialUntil = function(index, delimiter, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.readSerialUltil(delimiter, callback);
	};
	
	ext.sSetSerialRateTo = function(index, baud) {
		var robot = getRobot(HAMSTER, index);
		if(robot) robot.setSerialRate(baud);
	};
	
	ext.sSerial = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.getSerialInput();
		return '';
	};
	
	ext.turtleMoveForward = function(index, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.moveForward(callback);
	};
	
	ext.turtleMoveBackward = function(index, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.turtleTurn = function(index, direction, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.turn(direction, callback);
	};

	ext.turtleMoveForwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.moveForwardUnit(value, unit, callback);
	};

	ext.turtleMoveBackwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.moveBackwardUnit(value, unit, callback);
	};

	ext.turtleTurnUnitInPlace = function(index, direction, value, unit, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.turnUnit(direction, value, unit, callback);
	};
	
	ext.turtleTurnUnitWithRadiusInDirection = function(index, direction, value, unit, radius, head, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.swingUnit(direction, value, unit, radius, head, callback);
	};
	
	ext.turtlePivotAroundWheelUnitInDirection = function(index, wheel, value, unit, head, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.pivotUnit(wheel, value, unit, head, callback);
	};
	
	ext.turtleChangeWheelsByLeftRight = function(index, left, right) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.changeWheels(left, right);
	};

	ext.turtleSetWheelsToLeftRight = function(index, left, right) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.setWheels(left, right);
	};

	ext.turtleChangeWheelBy = function(index, wheel, speed) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.changeWheel(wheel, speed);
	};

	ext.turtleSetWheelTo = function(index, wheel, speed) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.setWheel(wheel, speed);
	};

	ext.turtleFollowLine = function(index, color) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.followLine(color);
	};

	ext.turtleFollowLineUntil = function(index, color, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.followLineUntil(color, callback);
	};
	
	ext.turtleFollowLineUntilBlack = function(index, color, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.followLineUntilBlack(color, callback);
	};
	
	ext.turtleCrossIntersection = function(index, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.crossIntersection(callback);
	};
	
	ext.turtleTurnAtIntersection = function(index, direction, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.turnAtIntersection(direction, callback);
	};

	ext.turtleSetFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.setLineTracerSpeed(speed);
	};

	ext.turtleStop = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.stop();
	};

	ext.turtleSetHeadLedTo = function(index, color) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.setHeadColor(color);
	};
	
	ext.turtleChangeHeadLedByRGB = function(index, red, green, blue) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.changeHeadRgb(red, green, blue);
	};
	
	ext.turtleSetHeadLedToRGB = function(index, red, green, blue) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.setHeadRgb(red, green, blue);
	};

	ext.turtleClearHeadLed = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.clearHead();
	};

	ext.turtlePlaySound = function(index, sound) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.playSound(sound, 1);
	};
	
	ext.turtlePlaySoundTimes = function(index, sound, count) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.playSound(sound, count);
	};
	
	ext.turtlePlaySoundTimesUntilDone = function(index, sound, count, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.playSoundUntil(sound, count, callback);
	};

	ext.turtleChangeBuzzerBy = function(index, hz) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.changeBuzzer(hz);
	};

	ext.turtleSetBuzzerTo = function(index, hz) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.setBuzzer(hz);
	};

	ext.turtleClearSound = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.clearSound();
	};
	
	ext.turtlePlayNote = function(index, note, octave) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.turtlePlayNoteForBeats = function(index, note, octave, beat, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};

	ext.turtleRestForBeats = function(index, beat, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.restBeat(beat, callback);
	};

	ext.turtleChangeTempoBy = function(index, bpm) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.changeTempo(bpm);
	};

	ext.turtleSetTempoTo = function(index, bpm) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.setTempo(bpm);
	};

	ext.turtleWhenColorTouched = function(index, color) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.checkTouchingColor(color);
		return false;
	};
	
	ext.turtleWhenColorPattern = function(index, color1, color2) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.checkColorPattern(color1, color2);
		return false;
	};
	
	ext.turtleWhenButtonState = function(index, state) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.checkButtonEvent(state);
		return false;
	};
	
	ext.turtleWhenTilt = function(index, tilt) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.turtleTouchingColor = function(index, color) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.checkTouchingColor(color);
		return false;
	};
	
	ext.turtleIsColorPattern = function(index, color1, color2) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.checkColorPattern(color1, color2);
		return false;
	};
	
	ext.turtleButtonState = function(index, state) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.checkButtonEvent(state);
		return false;
	};
	
	ext.turtleTilt = function(index, tilt) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.turtleBattery = function(index, state) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.checkBattery(state);
		return false;
	};

	ext.turtleColorNumber = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.getColorNumber();
		return -1;
	};

	ext.turtleColorPattern = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.getColorPattern();
		return -1;
	};

	ext.turtleFloor = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.getFloor();
		return 0;
	};

	ext.turtleButton = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.getButton();
		return 0;
	};

	ext.turtleAccelerationX = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.getAccelerationX();
		return 0;
	};

	ext.turtleAccelerationY = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.getAccelerationY();
		return 0;
	};

	ext.turtleAccelerationZ = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.getAccelerationZ();
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
		url: "http://hamster.school"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
