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
			["w", "HamsterS %n : pivot around %m.left_right pen %n %m.deg_sec in %m.forward_backward direction", "sPivotAroundPenUnitInDirection", 0, "left", 90, "degrees", "forward"],
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
			["w", "HamsterS %n : pivot around %m.left_right pen %n %m.turn_unit in %m.forward_backward direction", "sPivotAroundPenUnitInDirection", 0, "left", 90, "degrees", "forward"],
			[" ", "HamsterS %n : change wheels by left: %n right: %n", "sChangeBothWheelsBy", 0, 10, 10],
			[" ", "HamsterS %n : set wheels to left: %n right: %n", "sSetBothWheelsTo", 0, 30, 30],
			[" ", "HamsterS %n : change %m.left_right_both wheel by %n", "sChangeWheelBy", 0, "left", 10],
			[" ", "HamsterS %n : set %m.left_right_both wheel to %n", "sSetWheelTo", 0, "left", 30],
			[" ", "HamsterS %n : follow %m.black_white line with %m.left_right_both floor sensor", "sFollowLineUsingFloorSensor", 0, "black", "left"],
			["w", "HamsterS %n : follow %m.black_white line until %m.left_right_front_rear intersection", "sFollowLineUntilIntersection", 0, "black", "front"],
			[" ", "HamsterS %n : set following speed to %m.speed", "sSetFollowingSpeedTo", 0, "5"],
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
			["w", "HamsterS %n : read serial", "sReadSerial", 0],
			["w", "HamsterS %n : read serial until %m.serial_delimiter", "sReadSerialUntil", 0, "new line"],
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
			["w", "햄스터S %n : %m.left_right 펜 중심으로 %n %m.deg_sec %m.forward_backward 방향으로 돌기", "sPivotAroundPenUnitInDirection", 0, "왼쪽", 90, "도", "앞쪽"],
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
			["w", "햄스터S %n : %m.left_right 펜 중심으로 %n %m.turn_unit %m.forward_backward 방향으로 돌기", "sPivotAroundPenUnitInDirection", 0, "왼쪽", 90, "도", "앞쪽"],
			[" ", "햄스터S %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "sChangeBothWheelsBy", 0, 10, 10],
			[" ", "햄스터S %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "sSetBothWheelsTo", 0, 30, 30],
			[" ", "햄스터S %n : %m.left_right_both 바퀴 %n 만큼 바꾸기", "sChangeWheelBy", 0, "왼쪽", 10],
			[" ", "햄스터S %n : %m.left_right_both 바퀴 %n (으)로 정하기", "sSetWheelTo", 0, "왼쪽", 30],
			[" ", "햄스터S %n : %m.black_white 선을 %m.left_right_both 바닥 센서로 따라가기", "sFollowLineUsingFloorSensor", 0, "검은색", "왼쪽"],
			["w", "햄스터S %n : %m.black_white 선을 따라 %m.left_right_front_rear 교차로까지 이동하기", "sFollowLineUntilIntersection", 0, "검은색", "앞쪽"],
			[" ", "햄스터S %n : 선 따라가기 속도를 %m.speed (으)로 정하기", "sSetFollowingSpeedTo", 0, "5"],
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
			["w", "햄스터S %n : 시리얼 읽기", "sReadSerial", 0],
			["w", "햄스터S %n : 시리얼 %m.serial_delimiter 까지 읽기", "sReadSerialUntil", 0, "줄 바꿈"],
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
			["w", "ハムスターS %n : %m.left_right ペンを中心に %n %m.deg_sec %m.forward_backward 方向に回す", "sPivotAroundPenUnitInDirection", 0, "左", 90, "度", "前"],
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
			["w", "ハムスターS %n : %m.left_right ペンを中心に %n %m.turn_unit %m.forward_backward 方向に回す", "sPivotAroundPenUnitInDirection", 0, "左", 90, "度", "前"],
			[" ", "ハムスターS %n : 左車輪を %n 右車輪を %n ずつ変える", "sChangeBothWheelsBy", 0, 10, 10],
			[" ", "ハムスターS %n : 左車輪を %n 右車輪を %n にする", "sSetBothWheelsTo", 0, 30, 30],
			[" ", "ハムスターS %n : %m.left_right_both 車輪を %n ずつ変える", "sChangeWheelBy", 0, "左", 10],
			[" ", "ハムスターS %n : %m.left_right_both 車輪を %n にする", "sSetWheelTo", 0, "左", 30],
			[" ", "ハムスターS %n : %m.black_white 線を %m.left_right_both フロアセンサーで追従する", "sFollowLineUsingFloorSensor", 0, "黒色", "左"],
			["w", "ハムスターS %n : %m.black_white 線を追従して %m.left_right_front_rear 交差点まで動かす", "sFollowLineUntilIntersection", 0, "黒色", "前"],
			[" ", "ハムスターS %n : 線を追従する速度を %m.speed にする", "sSetFollowingSpeedTo", 0, "5"],
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
			["w", "ハムスターS %n : シリアルを読み取る", "sReadSerial", 0],
			["w", "ハムスターS %n : シリアルを %m.serial_delimiter まで読み取る", "sReadSerialUntil", 0, "改行"],
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
			["w", "HamsterS %n : %m.left_right ruchka markaziga %n %m.deg_sec %m.forward_backward yo'nalishga o'girilish", "sPivotAroundPenUnitInDirection", 0, "chap", 90, "daraja", "old"],
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
			["w", "HamsterS %n : %m.left_right ruchka markaziga %n %m.turn_unit %m.forward_backward yo'nalishga o'girilish", "sPivotAroundPenUnitInDirection", 0, "chap", 90, "daraja", "old"],
			[" ", "HamsterS %n : chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "sChangeBothWheelsBy", 0, 10, 10],
			[" ", "HamsterS %n : chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "sSetBothWheelsTo", 0, 30, 30],
			[" ", "HamsterS %n : %m.left_right_both g'ildirakni %n ga o'zgartirish", "sChangeWheelBy", 0, "chap", 10],
			[" ", "HamsterS %n : %m.left_right_both g'ildirakni %n ga sozlash", "sSetWheelTo", 0, "chap", 30],
			[" ", "HamsterS %n : %m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish", "sFollowLineUsingFloorSensor", 0, "qora", "chap"],
			["w", "HamsterS %n : %m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish", "sFollowLineUntilIntersection", 0, "qora", "old"],
			[" ", "HamsterS %n : liniyada ergashish tezligini %m.speed ga sozlash", "sSetFollowingSpeedTo", 0, "5"],
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
			["w", "HamsterS %n : ketma-ketni o'qing", "sReadSerial", 0],
			["w", "HamsterS %n : %m.serial_delimiter gacha ketma-ketni o'qing", "sReadSerialUntil", 0, "qator uzilishi"],
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
			"color": ["red", "yellow", "green", "sky blue", "blue", "purple", "white"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "upside down", "normal posture"],
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
			"button_state": ["clicked", "double-clicked", "long-pressed"],
			"forward_backward": ["forward", "backward"],
			"sound_effect": ["beep", "random beep", "noise", "siren", "engine", "sound effect up", "sound effect down", "robot", "dibidibidip", "random melody", "good job", "happy", "angry", "sad", "lullaby", "march", "birthday"],
			"s_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "upside down", "normal posture", "tap", "free fall"],
			"s_mode": ["analog input", "digital input", "digital input (pull up)", "digital input (pull down)", "servo output", "pwm output", "digital output"],
			"serial_output": ["string", "string line"],
			"serial_delimiter": ["new line", ",", ":", "$", "#"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
		},
		ko: {
			"left_right": ["왼쪽", "오른쪽"],
			"left_right_both": ["왼쪽", "오른쪽", "양쪽"],
			"black_white": ["검은색", "하얀색"],
			"left_right_front_rear": ["왼쪽", "오른쪽", "앞쪽", "뒤쪽"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"color": ["빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색", "하얀색"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "똑바로 놓음"],
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
			"button_state": ["클릭했는가", "더블클릭했는가", "길게~눌렀는가"],
			"forward_backward": ["앞쪽", "뒤쪽"],
			"sound_effect": ["삐", "무작위 삐", "지지직", "사이렌", "엔진", "올라가는 효과음", "내려가는 효과음", "로봇", "디비디비딥", "무작위 멜로디", "잘 했어요", "행복", "화남", "슬픔", "자장가", "행진", "생일"],
			"s_tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "똑바로 놓음", "두드림", "자유 낙하"],
			"s_mode": ["아날로그 입력", "디지털 입력", "디지털 입력 (풀업)", "디지털 입력 (풀다운)", "서보 출력", "PWM 출력", "디지털 출력"],
			"serial_output": ["글자", "글자 한 줄"],
			"serial_delimiter": ["줄 바꿈", ",", ":", "$", "#"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
		},
		ja: {
			"left_right": ["左", "右"],
			"left_right_both": ["左", "右", "両"],
			"black_white": ["黒色", "白色"],
			"left_right_front_rear": ["左", "右", "前", "後"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色", "白色"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "通常置いたか"],
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
			"button_state": ["クリックしたか", "ダブルクリックしたか", "長く押したか"],
			"forward_backward": ["前", "後"],
			"sound_effect": ["ビープ", "ランダムビープ", "ノイズ", "サイレン", "エンジン", "上がる効果音", "下がる効果音", "ロボット", "ディバディバディップ", "ランダムメロディ", "よくやった", "幸福", "怒った", "悲しみ", "子守唄", "行進", "誕生"],
			"s_tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "通常置いたか", "叩いたか", "自由落下したか"],
			"s_mode": ["アナログ入力", "デジタル入力", "デジタル入力 (プルアップ)", "デジタル入力 (プルダウン)", "サーボ出力", "PWM出力", "デジタル出力"],
			"serial_output": ["文字列", "文字列1行"],
			"serial_delimiter": ["改行", ",", ":", "$", "#"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
		},
		uz: {
			"left_right": ["chap", "o'ng"],
			"left_right_both": ["chap", "o'ng", "har ikki"],
			"black_white": ["qora", "oq"],
			"left_right_front_rear": ["chap", "o'ng", "old", "orqa"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh", "oq"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "normal holat"],
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
			"button_state": ["bosgan", "ikki-marta-bosgan", "uzoq-bosganmi"],
			"forward_backward": ["old", "orqa"],
			"sound_effect": ["qisqa", "tasodifiy qisqa", "shovqin", "sirena", "motor", "ovoz effekti yuqori", "ovoz effekti past", "robot", "dibidibidip", "tasodifiy ohang", "juda yaxshi", "baxtli", "badjahl", "xafa", "alla", "marsh", "tug'ilgan kun"],
			"s_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "normal holat", "jo'mrak", "erkin tushish"],
			"s_mode": ["analog kiritish", "raqamli kiritish", "raqamli kiritish (pull up)", "raqamli kiritish (pull down)", "servo chiqish", "pwm chiqish", "raqamli chiqish"],
			"serial_output": ["harf", "harf qator"],
			"serial_delimiter": ["qator uzilishi", ",", ":", "$", "#"],
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
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const FRONT = 4;
	const REAR = 5;
	const WHITE = 6;
	const SECONDS = 7;
	const PULSES = 8;
	const DEGREES = 9;
	const BACK = 5;
	const HEAD = 11;
	const OPEN = 12;
	const CLOSE = 13;
	const LEVEL1_MOVE_CM = 6;
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
	
	function issueWheelId(robot) {
		robot.wheelId = robot.blockId = (robot.blockId % 65535) + 1;
		return robot.wheelId;
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
	
	function cancelLineTracer(robot) {
		robot.lineTracerCallback = undefined;
	}
	
	function cancelBoard(robot) {
		robot.boardCommand = 0;
		robot.boardState = 0;
		robot.boardCount = 0;
		robot.boardCallback = undefined;
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
		robot.noteId = robot.blockId = (robot.blockId % 65535) + 1;
		return robot.noteId;
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
	
	function issueIoId(robot) {
		robot.ioId = robot.blockId = (robot.blockId % 65535) + 1;
		return robot.ioId;
	}
	
	function cancelIo(robot) {
		robot.ioId = 0;
		if(robot.ioTimer !== undefined) {
			removeTimeout(robot.ioTimer);
		}
		robot.ioTimer = undefined;
	}
	
	function setTurtlePulse(robot, pulse) {
		robot.motoring.pulse = pulse;
		robot.motoring.map |= 0x04000000;
	}
	
	function setTurtleLineTracerMode(robot, mode) {
		robot.motoring.lineTracerMode = mode;
		robot.motoring.map |= 0x00800000;
	}
	
	function setTurtleLineTracerGain(robot, gain) {
		robot.motoring.lineTracerGain = gain;
		robot.motoring.map |= 0x00400000;
	}
	
	function setTurtleLineTracerSpeed(robot, speed) {
		robot.motoring.lineTracerSpeed = speed;
		robot.motoring.map |= 0x00200000;
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
	
	function cancelMotion(robot) {
		robot.motionCallback = undefined;
	};
	
	function setTurtleNote(robot, note) {
		robot.motoring.note = note;
		robot.motoring.map |= 0x02000000;
	}
	
	function setTurtleSound(robot, sound) {
		robot.motoring.sound = sound;
		robot.motoring.map |= 0x01000000;
	}

	function runTurtleSound(robot, sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			robot.currentSound = sound;
			robot.soundRepeat = count;
			setTurtleSound(robot, sound);
		}
	}
	
	function cancelSound(robot) {
		robot.soundCallback = undefined;
	};

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
				robot.blockId = 0;
				robot.wheelId = 0;
				robot.wheelTimer = undefined;
				robot.lineTracerCallback = undefined;
				robot.boardCommand = 0;
				robot.boardState = 0;
				robot.boardCount = 0;
				robot.boardCallback = undefined;
				robot.noteId = 0;
				robot.noteTimer1 = undefined;
				robot.noteTimer2 = undefined;
				robot.ioId = 0;
				robot.ioTimer = undefined;
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

					robot.blockId = 0;
					robot.wheelId = 0;
					robot.wheelTimer = undefined;
					robot.lineTracerCallback = undefined;
					robot.boardCommand = 0;
					robot.boardState = 0;
					robot.boardCount = 0;
					robot.boardCallback = undefined;
					robot.noteId = 0;
					robot.noteTimer1 = undefined;
					robot.noteTimer2 = undefined;
					robot.ioId = 0;
					robot.ioTimer = undefined;
					robot.tempo = 60;
				};
				robot.clearMotoring = function() {
					robot.motoring.map = 0xfc000000;
				};
				robot.handleSensory = function() {
					var sensory = robot.sensory;
					if(robot.lineTracerCallback && (sensory.map & 0x00000010) != 0) {
						if(sensory.lineTracerState == 0x40) {
							setLineTracerMode(robot, 0);
							var callback = robot.lineTracerCallback;
							cancelLineTracer(robot);
							if(callback) callback();
						}
					}
					if(robot.boardCallback) {
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
									robot.wheelTimer = setTimeout(function() {
										motoring.leftWheel = 0;
										motoring.rightWheel = 0;
										robot.boardState = 4;
										if(robot.wheelTimer !== undefined) removeTimeout(robot.wheelTimer);
										robot.wheelTimer = undefined;
									}, 250);
									timeouts.push(robot.wheelTimer);
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
									var callback = robot.boardCallback;
									cancelBoard(robot);
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
										var callback = robot.boardCallback;
										cancelBoard(robot);
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
										var callback = robot.boardCallback;
										cancelBoard(robot);
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
				robot.blockId = 0;
				robot.motionCallback = undefined;
				robot.lineTracerCallback = undefined;
				robot.currentSound = 0;
				robot.soundRepeat = 1;
				robot.soundCallback = undefined;
				robot.noteId = 0;
				robot.noteTimer1 = undefined;
				robot.noteTimer2 = undefined;
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

					robot.blockId = 0;
					robot.motionCallback = undefined;
					robot.lineTracerCallback = undefined;
					robot.currentSound = 0;
					robot.soundRepeat = 1;
					robot.soundCallback = undefined;
					robot.noteId = 0;
					robot.noteTimer1 = undefined;
					robot.noteTimer2 = undefined;
					robot.clicked = false;
					robot.doubleClicked = false;
					robot.longPressed = false;
					robot.colorPattern = -1;
					robot.tempo = 60;
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

					if(robot.lineTracerCallback && (sensory.map & 0x00000008) != 0) {
						if(sensory.lineTracerState == 0x02) {
							setTurtleLineTracerMode(robot, 0);
							var callback = robot.lineTracerCallback;
							cancelLineTracer(robot);
							if(callback) callback();
						}
					}
					if(robot.motionCallback && (sensory.map & 0x00000020) != 0) {
						if(sensory.wheelState == 0) {
							robot.motoring.leftWheel = 0;
							robot.motoring.rightWheel = 0;
							var callback = robot.motionCallback;
							cancelMotion(robot);
							if(callback) callback();
						}
					}
					if((sensory.map & 0x00000010) != 0) {
						if(sensory.soundState == 0) {
							if(robot.currentSound > 0) {
								if(robot.soundRepeat < 0) {
									runTurtleSound(robot, robot.currentSound, -1);
								} else if(robot.soundRepeat > 1) {
									robot.soundRepeat --;
									runTurtleSound(robot, robot.currentSound, robot.soundRepeat);
								} else {
									robot.currentSound = 0;
									robot.soundRepeat = 1;
									var callback = robot.soundCallback;
									cancelSound(robot);
									if(callback) callback();
								}
							} else {
								robot.currentSound = 0;
								robot.soundRepeat = 1;
								var callback = robot.soundCallback;
								cancelSound(robot);
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
	
	function reset() {
		for(var i in robots) {
			robots[i].reset();
		}
		removeAllTimeouts();
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
						if(data.index >= 0) {
							var robot = getRobot(data.module, data.index);
							if(robot) {
								robot.sensory = data;
								robot.handleSensory();
							}
						}
					};
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
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			motoring.leftWheel = 45;
			motoring.rightWheel = 45;
			motoring.motion = MOTION.NONE;
			robot.boardCommand = 1;
			robot.boardCount = 0;
			robot.boardState = 1;
			robot.boardCallback = callback;
			setLineTracerMode(robot, 0);
		}
	};

	ext.boardTurn = function(index, direction, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			if(VALUES[direction] === LEFT) {
				motoring.leftWheel = -45;
				motoring.rightWheel = 45;
				robot.boardCommand = 2;
			} else {
				motoring.leftWheel = 45;
				motoring.rightWheel = -45;
				robot.boardCommand = 3;
			}
			motoring.motion = MOTION.NONE;
			robot.boardCount = 0;
			robot.boardState = 1;
			robot.boardCallback = callback;
			setLineTracerMode(robot, 0);
		}
	};
	
	ext.moveForward = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			var id = issueWheelId(robot);
			motoring.leftWheel = 30;
			motoring.rightWheel = 30;
			motoring.motion = MOTION.FORWARD;
			setLineTracerMode(robot, 0);
			robot.wheelTimer = setTimeout(function() {
				if(robot.wheelId == id) {
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					motoring.motion = MOTION.NONE;
					cancelWheel(robot);
					callback();
				}
			}, 1000);
			timeouts.push(robot.wheelTimer);
		}
	};
	
	ext.moveBackward = function(index, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			var id = issueWheelId(robot);
			motoring.leftWheel = -30;
			motoring.rightWheel = -30;
			motoring.motion = MOTION.BACKWARD;
			setLineTracerMode(robot, 0);
			robot.wheelTimer = setTimeout(function() {
				if(robot.wheelId == id) {
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					motoring.motion = MOTION.NONE;
					cancelWheel(robot);
					callback();
				}
			}, 1000);
			timeouts.push(robot.wheelTimer);
		}
	};
	
	ext.turn = function(index, direction, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			var id = issueWheelId(robot);
			if(VALUES[direction] === LEFT) {
				motoring.leftWheel = -30;
				motoring.rightWheel = 30;
				motoring.motion = MOTION.LEFT;
			} else {
				motoring.leftWheel = 30;
				motoring.rightWheel = -30;
				motoring.motion = MOTION.RIGHT;
			}
			setLineTracerMode(robot, 0);
			robot.wheelTimer = setTimeout(function() {
				if(robot.wheelId == id) {
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					motoring.motion = MOTION.NONE;
					cancelWheel(robot);
					callback();
				}
			}, 1000);
			timeouts.push(robot.wheelTimer);
		}
	};

	ext.moveForwardForSecs = function(index, sec, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			sec = parseFloat(sec);
			if(sec && sec > 0) {
				var id = issueWheelId(robot);
				motoring.leftWheel = 30;
				motoring.rightWheel = 30;
				motoring.motion = MOTION.FORWARD;
				setLineTracerMode(robot, 0);
				robot.wheelTimer = setTimeout(function() {
					if(robot.wheelId == id) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						motoring.motion = MOTION.NONE;
						cancelWheel(robot);
						callback();
					}
				}, sec * 1000);
				timeouts.push(robot.wheelTimer);
			} else {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				motoring.motion = MOTION.NONE;
				setLineTracerMode(robot, 0);
				callback();
			}
		}
	};

	ext.moveBackwardForSecs = function(index, sec, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			sec = parseFloat(sec);
			if(sec && sec > 0) {
				var id = issueWheelId(robot);
				motoring.leftWheel = -30;
				motoring.rightWheel = -30;
				motoring.motion = MOTION.BACKWARD;
				setLineTracerMode(robot, 0);
				robot.wheelTimer = setTimeout(function() {
					if(robot.wheelId == id) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						motoring.motion = MOTION.NONE;
						cancelWheel(robot);
						callback();
					}
				}, sec * 1000);
				timeouts.push(robot.wheelTimer);
			} else {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				motoring.motion = MOTION.NONE;
				setLineTracerMode(robot, 0);
				callback();
			}
		}
	};

	ext.turnForSecs = function(index, direction, sec, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			sec = parseFloat(sec);
			if(sec && sec > 0) {
				var id = issueWheelId(robot);
				if(VALUES[direction] === LEFT) {
					motoring.leftWheel = -30;
					motoring.rightWheel = 30;
					motoring.motion = MOTION.LEFT;
				} else {
					motoring.leftWheel = 30;
					motoring.rightWheel = -30;
					motoring.motion = MOTION.RIGHT;
				}
				setLineTracerMode(robot, 0);
				robot.wheelTimer = setTimeout(function() {
					if(robot.wheelId == id) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						motoring.motion = MOTION.NONE;
						cancelWheel(robot);
						callback();
					}
				}, sec * 1000);
				timeouts.push(robot.wheelTimer);
			} else {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				motoring.motion = MOTION.NONE;
				setLineTracerMode(robot, 0);
				callback();
			}
		}
	};
	
	ext.changeBothWheelsBy = function(index, left, right) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			left = parseFloat(left);
			right = parseFloat(right);
			if(typeof left == 'number') {
				motoring.leftWheel += left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel += right;
			}
			motoring.motion = MOTION.NONE;
			setLineTracerMode(robot, 0);
		}
	};

	ext.setBothWheelsTo = function(index, left, right) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			left = parseFloat(left);
			right = parseFloat(right);
			if(typeof left == 'number') {
				motoring.leftWheel = left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel = right;
			}
			motoring.motion = MOTION.NONE;
			setLineTracerMode(robot, 0);
		}
	};

	ext.changeWheelBy = function(index, which, speed) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			speed = parseFloat(speed);
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
			motoring.motion = MOTION.NONE;
			setLineTracerMode(robot, 0);
		}
	};

	ext.setWheelTo = function(index, which, speed) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			speed = parseFloat(speed);
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
			motoring.motion = MOTION.NONE;
			setLineTracerMode(robot, 0);
		}
	};

	ext.followLineUsingFloorSensor = function(index, color, which) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			var motoring = robot.motoring;
			var mode = 1;
			which = VALUES[which];
			if(which === RIGHT)
				mode = 2;
			else if(which === BOTH)
				mode = 3;
			if(VALUES[color] === WHITE)
				mode += 7;
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			motoring.motion = MOTION.NONE;
			setLineTracerMode(robot, mode);
		}
	};

	ext.followLineUntilIntersection = function(index, color, which, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			cancelBoard(robot);
			cancelWheel(robot);
			
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
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			motoring.motion = MOTION.NONE;
			setLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		}
	};

	ext.setFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			speed = parseInt(speed);
			if(typeof speed == 'number') {
				setLineTracerSpeed(robot, speed);
			}
		}
	};

	ext.stop = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			cancelBoard(robot);
			cancelWheel(robot);
			cancelLineTracer(robot);
			
			var motoring = robot.motoring;
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			motoring.motion = MOTION.NONE;
			setLineTracerMode(robot, 0);
		}
	};

	ext.setLedTo = function(index, which, color) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
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
			cancelNote(robot);
			var motoring = robot.motoring;
			var id = issueNoteId(robot);
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
		}
	};

	ext.changeBuzzerBy = function(index, value) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			cancelNote(robot);
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
			cancelNote(robot);
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
			cancelNote(robot);
			var motoring = robot.motoring;
			motoring.buzzer = 0;
			setNote(robot, 0);
		}
	};
	
	ext.playNoteFor = function(index, note, octave, beat, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			cancelNote(robot);
			var motoring = robot.motoring;
			note = NOTES[note];
			octave = parseInt(octave);
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && robot.tempo > 0) {
				var id = issueNoteId(robot);
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
							if(robot.noteTimer1 !== undefined) removeTimeout(robot.noteTimer1);
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
				setNote(robot, 0);
				callback();
			}
		}
	};

	ext.restFor = function(index, beat, callback) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			cancelNote(robot);
			var motoring = robot.motoring;
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
			setNote(robot, 0);
			if(beat && beat > 0 && robot.tempo > 0) {
				var id = issueNoteId(robot);
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

	ext.leftProximity = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.leftProximity;
		else return 0;
	};

	ext.rightProximity = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.rightProximity;
		else return 0;
	};

	ext.leftFloor = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.leftFloor;
		else return 0;
	};

	ext.rightFloor = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.rightFloor;
		else return 0;
	};

	ext.accelerationX = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.accelerationX;
		else return 0;
	};

	ext.accelerationY = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.accelerationY;
		else return 0;
	};

	ext.accelerationZ = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.accelerationZ;
		else return 0;
	};

	ext.light = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.light;
		else return 0;
	};

	ext.temperature = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.temperature;
		else return 0;
	};

	ext.signalStrength = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.signalStrength;
		else return 0;
	};

	ext.handFound = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var sensory = robot.sensory;
			return (sensory.handFound === undefined) ? (sensory.leftProximity > 50 || sensory.rightProximity > 50) : sensory.handFound;
		} else {
			return false;
		}
	};

	ext.setPortTo = function(index, port, mode) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelIo(robot);
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
			cancelIo(robot);
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
			cancelIo(robot);
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
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelIo(robot);
			
			var id = issueIoId(robot);
			setIoModeA(robot, 10);
			setIoModeB(robot, 10);
			action = VALUES[action];
			if(action == OPEN) {
				motoring.outputA = 1;
				motoring.outputB = 0;
			} else {
				motoring.outputA = 0;
				motoring.outputB = 1;
			}
			robot.ioTimer = setTimeout(function() {
				if(robot.ioId == id) {
					cancelIo(robot);
					callback();
				}
			}, 500);
			timeouts.push(robot.ioTimer);
		}
	};
	
	ext.releaseGripper = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelIo(robot);
			setIoModeA(robot, 10);
			setIoModeB(robot, 10);
			motoring.outputA = 0;
			motoring.outputB = 0;
		}
	};

	ext.inputA = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.inputA;
		else return 0;
	};

	ext.inputB = function(index) {
		var robot = getRobot(HAMSTER, index);
		if(robot) return robot.sensory.inputB;
		else return 0;
	};

	ext.turtleMoveForward = function(index, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 101, 1, 0, LEVEL1_MOVE_CM, 0);
			robot.motionCallback = callback;
			setTurtleLineTracerMode(robot, 0);
		}
	};
	
	ext.turtleMoveBackward = function(index, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 102, 1, 0, LEVEL1_MOVE_CM, 0);
			robot.motionCallback = callback;
			setTurtleLineTracerMode(robot, 0);
		}
	};
	
	ext.turtleTurn = function(index, direction, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			if(VALUES[direction] === LEFT) {
				setTurtleMotion(robot, 103, 1, 0, LEVEL1_TURN_DEG, 0);
			} else {
				setTurtleMotion(robot, 104, 1, 0, LEVEL1_TURN_DEG, 0);
			}
			robot.motionCallback = callback;
			setTurtleLineTracerMode(robot, 0);
		}
	};

	ext.turtleMoveForwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				setTurtleMotion(robot, 1, unit, 0, value, 0);
				robot.motionCallback = callback;
				setTurtleLineTracerMode(robot, 0);
			} else {
				setTurtleMotion(robot, 0, 0, 0, 0, 0);
				setTurtleLineTracerMode(robot, 0);
				callback();
			}
		}
	};

	ext.turtleMoveBackwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			if(value && value > 0) {
				unit = VALUES[unit];
				if(unit === SECONDS) unit = 2;
				else if(unit === PULSES) unit = 3;
				else unit = 1;
				setTurtleMotion(robot, 2, unit, 0, value, 0);
				robot.motionCallback = callback;
				setTurtleLineTracerMode(robot, 0);
			} else {
				setTurtleMotion(robot, 0, 0, 0, 0, 0);
				setTurtleLineTracerMode(robot, 0);
				callback();
			}
		}
	};

	ext.turtleTurnUnitInPlace = function(index, direction, value, unit, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
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
				robot.motionCallback = callback;
				setTurtleLineTracerMode(robot, 0);
			} else {
				setTurtleMotion(robot, 0, 0, 0, 0, 0);
				setTurtleLineTracerMode(robot, 0);
				callback();
			}
		}
	};
	
	ext.turtleTurnUnitWithRadiusInDirection = function(index, direction, value, unit, radius, head, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
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
				robot.motionCallback = callback;
				setTurtleLineTracerMode(robot, 0);
			} else {
				setTurtleMotion(robot, 0, 0, 0, 0, 0);
				setTurtleLineTracerMode(robot, 0);
				callback();
			}
		}
	};
	
	ext.turtlePivotAroundWheelUnitInDirection = function(index, wheel, value, unit, head, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
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
				robot.motionCallback = callback;
				setTurtleLineTracerMode(robot, 0);
			} else {
				setTurtleMotion(robot, 0, 0, 0, 0, 0);
				setTurtleLineTracerMode(robot, 0);
				callback();
			}
		}
	};
	
	ext.turtleChangeWheelsByLeftRight = function(index, left, right) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			left = parseFloat(left);
			right = parseFloat(right);
			if(typeof left == 'number') {
				motoring.leftWheel += left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel += right;
			}
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, 0);
		}
	};

	ext.turtleSetWheelsToLeftRight = function(index, left, right) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			left = parseFloat(left);
			right = parseFloat(right);
			if(typeof left == 'number') {
				motoring.leftWheel = left;
			}
			if(typeof right == 'number') {
				motoring.rightWheel = right;
			}
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, 0);
		}
	};

	ext.turtleChangeWheelBy = function(index, wheel, speed) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			speed = parseFloat(speed);
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
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, 0);
		}
	};

	ext.turtleSetWheelTo = function(index, wheel, speed) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			speed = parseFloat(speed);
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
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, 0);
		}
	};

	ext.turtleFollowLine = function(index, color) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelLineTracer(robot);
			cancelMotion(robot);
			
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
			cancelMotion(robot);
			
			var mode = 60 + LINE_COLORS[color];
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		}
	};
	
	ext.turtleFollowLineUntilBlack = function(index, color, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelMotion(robot);
			
			var mode = 70 + LINE_COLORS[color];
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, mode);
			robot.lineTracerCallback = callback;
		}
	};
	
	ext.turtleCrossIntersection = function(index, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelMotion(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, 40);
			robot.lineTracerCallback = callback;
		}
	};
	
	ext.turtleTurnAtIntersection = function(index, direction, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelMotion(robot);
			
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
			cancelLineTracer(robot);
			cancelMotion(robot);
			
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			setTurtlePulse(robot, 0);
			setTurtleMotion(robot, 0, 0, 0, 0, 0);
			setTurtleLineTracerMode(robot, 0);
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
			cancelNote(robot);
			cancelSound(robot);
			
			sound = SOUNDS[sound];
			motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			if(sound) {
				runTurtleSound(robot, sound);
			} else {
				runTurtleSound(robot, 0);
			}
		}
	};
	
	ext.turtlePlaySoundTimes = function(index, sound, count) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelNote(robot);
			cancelSound(robot);
			
			sound = SOUNDS[sound];
			count = parseInt(count);
			motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			if(sound && count) {
				runTurtleSound(robot, sound, count);
			} else {
				runTurtleSound(robot, 0);
			}
		}
	};
	
	ext.turtlePlaySoundTimesUntilDone = function(index, sound, count, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			var motoring = robot.motoring;
			cancelNote(robot);
			cancelSound(robot);
			
			sound = SOUNDS[sound];
			count = parseInt(count);
			motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			if(sound && count) {
				runTurtleSound(robot, sound, count);
				robot.soundCallback = callback;
			} else {
				runTurtleSound(robot, 0);
				callback();
			}
		}
	};

	ext.turtleChangeBuzzerBy = function(index, hz) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			cancelNote(robot);
			cancelSound(robot);
			
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
			cancelNote(robot);
			cancelSound(robot);
			
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
			cancelNote(robot);
			cancelSound(robot);
			
			robot.motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			runTurtleSound(robot, 0);
		}
	};
	
	ext.turtlePlayNote = function(index, note, octave) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			cancelNote(robot);
			cancelSound(robot);
			
			note = NOTES[note];
			octave = parseInt(octave);
			robot.motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8) {
				note += (octave - 1) * 12;
				setTurtleNote(robot, note);
			} else {
				setTurtleNote(robot, 0);
			}
			runTurtleSound(robot, 0);
		}
	};
	
	ext.turtlePlayNoteForBeats = function(index, note, octave, beat, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			cancelNote(robot);
			cancelSound(robot);
			
			note = NOTES[note];
			octave = parseInt(octave);
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			robot.motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && robot.tempo > 0) {
				var id = issueNoteId(robot);
				note += (octave - 1) * 12;
				setTurtleNote(robot, note);
				var timeout = beat * 60 * 1000 / robot.tempo;
				var tail = 0;
				if(timeout > 100) {
					tail = 100;
				}
				if(tail > 0) {
					robot.noteTimer1 = setTimeout(function() {
						if(robot.noteId == id) {
							setTurtleNote(robot, 0);
							if(robot.noteTimer1 !== undefined) removeTimeout(robot.noteTimer1);
							robot.noteTimer1 = undefined;
						}
					}, timeout - tail);
					timeouts.push(robot.noteTimer1);
				}
				robot.noteTimer2 = setTimeout(function() {
					if(robot.noteId == id) {
						setTurtleNote(robot, 0);
						cancelNote(robot);
						callback();
					}
				}, timeout);
				timeouts.push(robot.noteTimer2);
				runTurtleSound(robot, 0);
			} else {
				setTurtleNote(robot, 0);
				runTurtleSound(robot, 0);
				callback();
			}
		}
	};

	ext.turtleRestForBeats = function(index, beat, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) {
			cancelNote(robot);
			cancelSound(robot);
			
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			robot.motoring.buzzer = 0;
			setTurtleNote(robot, 0);
			runTurtleSound(robot, 0);
			if(beat && beat > 0 && robot.tempo > 0) {
				var id = issueNoteId(robot);
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

	ext.turtleColorNumber = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.sensory.colorNumber;
		return -1;
	};

	ext.turtleColorPattern = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.colorPattern;
		return -1;
	};

	ext.turtleFloor = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.sensory.floor;
		return 0;
	};

	ext.turtleButton = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.sensory.button;
		return 0;
	};

	ext.turtleAccelerationX = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.sensory.accelerationX;
		return 0;
	};

	ext.turtleAccelerationY = function(index) {
		var robot = getRobot(TURTLE, index);
		if(robot) return robot.sensory.accelerationY;
		return 0;
	};

	ext.turtleAccelerationZ = function(index) {
		var robot = getRobot(TURTLE, index);
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
		url: "http://hamster.school"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
