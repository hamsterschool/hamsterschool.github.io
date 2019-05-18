(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const SPEED2GAINS = { 1: 6, 2: 6, 3: 5, 4: 5, 5: 4, 6: 4, 7: 3, 8: 3 };
	const HAMSTER = 'hamster';
	const HAMSTER_S = 'hamsterS';
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
		en: [ 'Please run Robot Coding software.', 'Robot is not connected.', 'Ready' ],
		ko: [ '로봇 코딩 소프트웨어를 실행해 주세요.', '로봇이 연결되어 있지 않습니다.', '정상입니다.' ],
		ja: [ 'ロボットコーディングソフトウェアを実行してください。', 'ロボットが接続されていません。', '正常です。' ],
		uz: [ 'Robot Kodlash dasturini ishga tushiring.', 'Robot ulanmagan.', 'Tayyorlangan' ]
	};
	const EXTENSION_NAME = {
		en: 'HamsterS',
		ko: '햄스터S',
		ja: 'ハムスターS',
		uz: 'HamsterS'
	};
	const BLOCKS = {
		en1: [
			["w", "move forward once on board", "sBoardMoveForward"],
			["w", "turn %m.left_right once on board", "sBoardTurn", "left"],
			["-"],
			["w", "move forward", "sMoveForward"],
			["w", "move backward", "sMoveBackward"],
			["w", "turn %m.left_right", "sTurn", "left"],
			["-"],
			[" ", "set %m.left_right_both led to %m.led_color", "sSetLedTo", "left", "red"],
			[" ", "clear %m.left_right_both led", "sClearLed", "left"],
			["-"],
			[" ", "play sound %m.sound_effect", "sPlaySound", "beep"],
			[" ", "clear sound", "sClearSound"],
			["-"],
			["h", "when hand found", "sWhenHandFound"],
			["b", "hand found?", "sHandFound"]
		],
		en2: [
			["w", "move forward once on board", "sBoardMoveForward"],
			["w", "turn %m.left_right once on board", "sBoardTurn", "left"],
			["-"],
			["w", "move forward %n %m.cm_sec", "sMoveForwardUnit", 5, "cm"],
			["w", "move backward %n %m.cm_sec", "sMoveBackwardUnit", 5, "cm"],
			["w", "turn %m.left_right %n %m.deg_sec in place", "sTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.left_right wheel %n %m.deg_sec in %m.forward_backward direction", "sPivotAroundWheelUnitInDirection", "left", 90, "degrees", "forward"],
			["w", "turn %m.left_right %n %m.deg_sec with radius %n cm in %m.forward_backward direction", "sTurnBodyUnitWithRadiusInDirection", "left", 90, "degrees", 5, "forward"],
			["-"],
			[" ", "set %m.left_right_both led to %m.led_color", "sSetLedTo", "left", "red"],
			[" ", "clear %m.left_right_both led", "sClearLed", "left"],
			["-"],
			[" ", "play sound %m.sound_effect %n times", "sPlaySoundTimes", "beep", 1],
			["w", "play sound %m.sound_effect %n times until done", "sPlaySoundTimesUntilDone", "beep", 1],
			[" ", "clear sound", "sClearSound"],
			["w", "play note %m.note %m.octave for %d.beats beats", "sPlayNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "sRestFor", 0.25],
			[" ", "change tempo by %n", "sChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "sSetTempoTo", 60],
			["-"],
			["h", "when hand found", "sWhenHandFound"],
			["h", "when %m.when_s_tilt", "sWhenTilt", "tilt forward"],
			["b", "hand found?", "sHandFound"],
			["b", "%m.s_tilt ?", "sTilt", "tilt forward"]
		],
		en3: [
			["w", "move forward once on board", "sBoardMoveForward"],
			["w", "turn %m.left_right once on board", "sBoardTurn", "left"],
			["-"],
			["w", "move forward %n %m.move_unit", "sMoveForwardUnit", 5, "cm"],
			["w", "move backward %n %m.move_unit", "sMoveBackwardUnit", 5, "cm"],
			["w", "turn %m.left_right %n %m.turn_unit in place", "sTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.pen_wheel %n %m.turn_unit in %m.forward_backward direction", "sPivotAroundUnitInDirection", "left pen", 90, "degrees", "forward"],
			["w", "%m.pen_body , turn %m.left_right %n %m.turn_unit with radius %n cm in %m.forward_backward direction", "sTurnUnitWithRadiusInDirection", "left pen", "left", 90, "degrees", 5, "forward"],
			[" ", "change wheels by left: %n right: %n", "sChangeBothWheelsBy", 10, 10],
			[" ", "set wheels to left: %n right: %n", "sSetBothWheelsTo", 30, 30],
			[" ", "change %m.left_right_both wheel by %n", "sChangeWheelBy", "left", 10],
			[" ", "set %m.left_right_both wheel to %n", "sSetWheelTo", "left", 30],
			[" ", "follow %m.black_white line with %m.left_right_both floor sensor", "sFollowLineUsingFloorSensor", "black", "left"],
			["w", "follow %m.black_white line until %m.left_right_front_rear intersection", "sFollowLineUntilIntersection", "black", "front"],
			[" ", "set following speed to %m.speed", "sSetFollowingSpeedTo", "5"],
			[" ", "set following directional variation to %m.gain", "sSetFollowingGainTo", "default"],
			[" ", "stop", "sStop"],
			["-"],
			[" ", "set %m.left_right_both led to %m.led_color", "sSetLedTo", "left", "red"],
			[" ", "change %m.left_right_both led by r: %n g: %n b: %n", "sChangeLedByRGB", "left", 10, 0, 0],
			[" ", "set %m.left_right_both led to r: %n g: %n b: %n", "sSetLedToRGB", "left", 255, 0, 0],
			[" ", "clear %m.left_right_both led", "sClearLed", "left"],
			["-"],
			[" ", "play sound %m.sound_effect %n times", "sPlaySoundTimes", "beep", 1],
			["w", "play sound %m.sound_effect %n times until done", "sPlaySoundTimesUntilDone", "beep", 1],
			[" ", "change buzzer by %n", "sChangeBuzzerBy", 10],
			[" ", "set buzzer to %n", "sSetBuzzerTo", 1000],
			[" ", "clear sound", "sClearSound"],
			[" ", "play note %m.note %m.octave", "sPlayNote", "C", "4"],
			["w", "play note %m.note %m.octave for %d.beats beats", "sPlayNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "sRestFor", 0.25],
			[" ", "change tempo by %n", "sChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "sSetTempoTo", 60],
			["-"],
			["r", "left proximity", "sLeftProximity"],
			["r", "right proximity", "sRightProximity"],
			["r", "left floor", "sLeftFloor"],
			["r", "right floor", "sRightFloor"],
			["r", "x acceleration", "sAccelerationX"],
			["r", "y acceleration", "sAccelerationY"],
			["r", "z acceleration", "sAccelerationZ"],
			["r", "light", "sLight"],
			["r", "temperature", "sTemperature"],
			["r", "signal strength", "sSignalStrength"],
			["h", "when hand found", "sWhenHandFound"],
			["h", "when %m.when_s_tilt", "sWhenTilt", "tilt forward"],
			["b", "hand found?", "sHandFound"],
			["b", "%m.s_tilt ?", "sTilt", "tilt forward"],
			["b", "battery %m.battery ?", "sBattery", "normal"],
			["-"],
			[" ", "set port %m.port to %m.s_mode", "sSetPortTo", "A", "analog input"],
			[" ", "change output %m.port by %n", "sChangeOutputBy", "A", 10],
			[" ", "set output %m.port to %n", "sSetOutputTo", "A", 100],
			["w", "%m.open_close gripper", "sGripper", "open"],
			[" ", "release gripper", "sReleaseGripper"],
			["r", "input A", "sInputA"],
			["r", "input B", "sInputB"],
			["-"],
			["w", "write %m.serial_output %s to serial", "sWriteSerial", "string", "abc123"],
			["w", "read serial %m.serial_delimiter", "sReadSerialUntil", "all"],
			[" ", "set serial rate to %m.serial_baud Bd", "sSetSerialRateTo", "9600"],
			["r", "serial input", "sSerial"]
		],
		ko1: [
			["w", "말판 앞으로 한 칸 이동하기", "sBoardMoveForward"],
			["w", "말판 %m.left_right 으로 한 번 돌기", "sBoardTurn", "왼쪽"],
			["-"],
			["w", "앞으로 이동하기", "sMoveForward"],
			["w", "뒤로 이동하기", "sMoveBackward"],
			["w", "%m.left_right 으로 돌기", "sTurn", "왼쪽"],
			["-"],
			[" ", "%m.left_right_both LED를 %m.led_color 으로 정하기", "sSetLedTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both LED 끄기", "sClearLed", "왼쪽"],
			["-"],
			[" ", "%m.sound_effect 소리 재생하기", "sPlaySound", "삐"],
			[" ", "소리 끄기", "sClearSound"],
			["-"],
			["h", "손 찾았을 때", "sWhenHandFound"],
			["b", "손 찾음?", "sHandFound"]
		],
		ko2: [
			["w", "말판 앞으로 한 칸 이동하기", "sBoardMoveForward"],
			["w", "말판 %m.left_right 으로 한 번 돌기", "sBoardTurn", "왼쪽"],
			["-"],
			["w", "앞으로 %n %m.cm_sec 이동하기", "sMoveForwardUnit", 5, "cm"],
			["w", "뒤로 %n %m.cm_sec 이동하기", "sMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right 으로 %n %m.deg_sec 제자리 돌기", "sTurnUnitInPlace", "왼쪽", 90, "도"],
			["w", "%m.left_right 바퀴 중심으로 %n %m.deg_sec %m.forward_backward 방향으로 돌기", "sPivotAroundWheelUnitInDirection", "왼쪽", 90, "도", "앞쪽"],
			["w", "%m.left_right 으로 %n %m.deg_sec 반지름 %n cm를 %m.forward_backward 방향으로 돌기", "sTurnBodyUnitWithRadiusInDirection", "왼쪽", 90, "도", 5, "앞쪽"],
			["-"],
			[" ", "%m.left_right_both LED를 %m.led_color 으로 정하기", "sSetLedTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both LED 끄기", "sClearLed", "왼쪽"],
			["-"],
			[" ", "%m.sound_effect 소리 %n 번 재생하기", "sPlaySoundTimes", "삐", 1],
			["w", "%m.sound_effect 소리 %n 번 재생하고 기다리기", "sPlaySoundTimesUntilDone", "삐", 1],
			[" ", "소리 끄기", "sClearSound"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "sPlayNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "sRestFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "sChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "sSetTempoTo", 60],
			["-"],
			["h", "손 찾았을 때", "sWhenHandFound"],
			["h", "%m.when_s_tilt 때", "sWhenTilt", "앞으로 기울였을"],
			["b", "손 찾음?", "sHandFound"],
			["b", "%m.s_tilt ?", "sTilt", "앞으로 기울임"]
		],
		ko3: [
			["w", "말판 앞으로 한 칸 이동하기", "sBoardMoveForward"],
			["w", "말판 %m.left_right 으로 한 번 돌기", "sBoardTurn", "왼쪽"],
			["-"],
			["w", "앞으로 %n %m.move_unit 이동하기", "sMoveForwardUnit", 5, "cm"],
			["w", "뒤로 %n %m.move_unit 이동하기", "sMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right 으로 %n %m.turn_unit 제자리 돌기", "sTurnUnitInPlace", "왼쪽", 90, "도"],
			["w", "%m.pen_wheel 중심으로 %n %m.turn_unit %m.forward_backward 방향으로 돌기", "sPivotAroundUnitInDirection", "왼쪽 펜", 90, "도", "앞쪽"],
			["w", "%m.pen_body , %m.left_right 으로 %n %m.turn_unit 반지름 %n cm를 %m.forward_backward 방향으로 돌기", "sTurnUnitWithRadiusInDirection", "왼쪽 펜", "왼쪽", 90, "도", 5, "앞쪽"],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "sChangeBothWheelsBy", 10, 10],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "sSetBothWheelsTo", 30, 30],
			[" ", "%m.left_right_both 바퀴 %n 만큼 바꾸기", "sChangeWheelBy", "왼쪽", 10],
			[" ", "%m.left_right_both 바퀴 %n (으)로 정하기", "sSetWheelTo", "왼쪽", 30],
			[" ", "%m.black_white 선을 %m.left_right_both 바닥 센서로 따라가기", "sFollowLineUsingFloorSensor", "검은색", "왼쪽"],
			["w", "%m.black_white 선을 따라 %m.left_right_front_rear 교차로까지 이동하기", "sFollowLineUntilIntersection", "검은색", "앞쪽"],
			[" ", "선 따라가기 속도를 %m.speed (으)로 정하기", "sSetFollowingSpeedTo", "5"],
			[" ", "선 따라가기 방향 변화량을 %m.gain (으)로 정하기", "sSetFollowingGainTo", "기본 값"],
			[" ", "정지하기", "sStop"],
			["-"],
			[" ", "%m.left_right_both LED를 %m.led_color 으로 정하기", "sSetLedTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both LED를 R: %n G: %n B: %n 만큼 바꾸기", "sChangeLedByRGB", "왼쪽", 10, 0, 0],
			[" ", "%m.left_right_both LED를 R: %n G: %n B: %n (으)로 정하기", "sSetLedToRGB", "왼쪽", 255, 0, 0],
			[" ", "%m.left_right_both LED 끄기", "sClearLed", "왼쪽"],
			["-"],
			[" ", "%m.sound_effect 소리 %n 번 재생하기", "sPlaySoundTimes", "삐", 1],
			["w", "%m.sound_effect 소리 %n 번 재생하고 기다리기", "sPlaySoundTimesUntilDone", "삐", 1],
			[" ", "버저 음을 %n 만큼 바꾸기", "sChangeBuzzerBy", 10],
			[" ", "버저 음을 %n (으)로 정하기", "sSetBuzzerTo", 1000],
			[" ", "소리 끄기", "sClearSound"],
			[" ", "%m.note %m.octave 음을 연주하기", "sPlayNote", "도", "4"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "sPlayNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "sRestFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "sChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "sSetTempoTo", 60],
			["-"],
			["r", "왼쪽 근접 센서", "sLeftProximity"],
			["r", "오른쪽 근접 센서", "sRightProximity"],
			["r", "왼쪽 바닥 센서", "sLeftFloor"],
			["r", "오른쪽 바닥 센서", "sRightFloor"],
			["r", "x축 가속도", "sAccelerationX"],
			["r", "y축 가속도", "sAccelerationY"],
			["r", "z축 가속도", "sAccelerationZ"],
			["r", "밝기", "sLight"],
			["r", "온도", "sTemperature"],
			["r", "신호 세기", "sSignalStrength"],
			["h", "손 찾았을 때", "sWhenHandFound"],
			["h", "%m.when_s_tilt 때", "sWhenTilt", "앞으로 기울였을"],
			["b", "손 찾음?", "sHandFound"],
			["b", "%m.s_tilt ?", "sTilt", "앞으로 기울임"],
			["b", "배터리 %m.battery ?", "sBattery", "정상"],
			["-"],
			[" ", "포트 %m.port 를 %m.s_mode 으로 정하기", "sSetPortTo", "A", "아날로그 입력"],
			[" ", "출력 %m.port 를 %n 만큼 바꾸기", "sChangeOutputBy", "A", 10],
			[" ", "출력 %m.port 를 %n (으)로 정하기", "sSetOutputTo", "A", 100],
			["w", "집게 %m.open_close", "sGripper", "열기"],
			[" ", "집게 끄기", "sReleaseGripper"],
			["r", "입력 A", "sInputA"],
			["r", "입력 B", "sInputB"],
			["-"],
			["w", "시리얼 %m.serial_output %s 쓰기", "sWriteSerial", "글자", "abc123"],
			["w", "시리얼 %m.serial_delimiter 읽기", "sReadSerialUntil", "모두"],
			[" ", "시리얼 속도를 %m.serial_baud Bd로 정하기", "sSetSerialRateTo", "9600"],
			["r", "시리얼 입력", "sSerial"]
		],
		ja1: [
			["w", "ボード板上で前へ動かす", "sBoardMoveForward"],
			["w", "ボード板上で %m.left_right に回す", "sBoardTurn", "左"],
			["-"],
			["w", "前へ動かす", "sMoveForward"],
			["w", "後ろへ動かす", "sMoveBackward"],
			["w", "%m.left_right に回す", "sTurn", "左"],
			["-"],
			[" ", "%m.left_right_both LEDを %m.led_color にする", "sSetLedTo", "左", "赤色"],
			[" ", "%m.left_right_both LEDをオフ", "sClearLed", "左"],
			["-"],
			[" ", "%m.sound_effect 音を鳴らす", "sPlaySound", "ビープ"],
			[" ", "音を止める", "sClearSound"],
			["-"],
			["h", "手を見つけたとき", "sWhenHandFound"],
			["b", "手を見つけたか?", "sHandFound"]
		],
		ja2: [
			["w", "ボード板上で前へ動かす", "sBoardMoveForward"],
			["w", "ボード板上で %m.left_right に回す", "sBoardTurn", "左"],
			["-"],
			["w", "前へ %n %m.cm_sec 動かす", "sMoveForwardUnit", 5, "cm"],
			["w", "後ろへ %n %m.cm_sec 動かす", "sMoveBackwardUnit", 5, "cm"],
			["w", "所定位置で %m.left_right に %n %m.deg_sec 回す", "sTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.left_right 車輪を中心に %n %m.deg_sec %m.forward_backward 方向に回す", "sPivotAroundWheelUnitInDirection", "左", 90, "度", "前"],
			["w", "%m.left_right に %n %m.deg_sec 半径 %n cmを %m.forward_backward 方向に回す", "sTurnBodyUnitWithRadiusInDirection", "左", 90, "度", 5, "前"],
			["-"],
			[" ", "%m.left_right_both LEDを %m.led_color にする", "sSetLedTo", "左", "赤色"],
			[" ", "%m.left_right_both LEDをオフ", "sClearLed", "左"],
			["-"],
			[" ", "%m.sound_effect 音を %n 回鳴らす", "sPlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.sound_effect 音を %n 回鳴らす", "sPlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "音を止める", "sClearSound"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "sPlayNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "sRestFor", 0.25],
			[" ", "テンポを %n ずつ変える", "sChangeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "sSetTempoTo", 60],
			["-"],
			["h", "手を見つけたとき", "sWhenHandFound"],
			["h", "%m.when_s_tilt とき", "sWhenTilt", "前に傾けた"],
			["b", "手を見つけたか?", "sHandFound"],
			["b", "%m.s_tilt ?", "sTilt", "前に傾けたか"]
		],
		ja3: [
			["w", "ボード板上で前へ動かす", "sBoardMoveForward"],
			["w", "ボード板上で %m.left_right に回す", "sBoardTurn", "左"],
			["-"],
			["w", "前へ %n %m.move_unit 動かす", "sMoveForwardUnit", 5, "cm"],
			["w", "後ろへ %n %m.move_unit 動かす", "sMoveBackwardUnit", 5, "cm"],
			["w", "所定位置で %m.left_right に %n %m.turn_unit 回す", "sTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.pen_wheel を中心に %n %m.turn_unit %m.forward_backward 方向に回す", "sPivotAroundUnitInDirection", "左ペン", 90, "度", "前"],
			["w", "%m.pen_body 、 %m.left_right に %n %m.turn_unit 半径 %n cmを %m.forward_backward 方向に回す", "sTurnUnitWithRadiusInDirection", "左ペン", "左", 90, "度", 5, "前"],
			[" ", "左車輪を %n 右車輪を %n ずつ変える", "sChangeBothWheelsBy", 10, 10],
			[" ", "左車輪を %n 右車輪を %n にする", "sSetBothWheelsTo", 30, 30],
			[" ", "%m.left_right_both 車輪を %n ずつ変える", "sChangeWheelBy", "左", 10],
			[" ", "%m.left_right_both 車輪を %n にする", "sSetWheelTo", "左", 30],
			[" ", "%m.black_white 線を %m.left_right_both フロアセンサーで追従する", "sFollowLineUsingFloorSensor", "黒色", "左"],
			["w", "%m.black_white 線を追従して %m.left_right_front_rear 交差点まで動かす", "sFollowLineUntilIntersection", "黒色", "前"],
			[" ", "線を追従する速度を %m.speed にする", "sSetFollowingSpeedTo", "5"],
			[" ", "線を追従する方向変化量を %m.gain にする", "sSetFollowingGainTo", "基本値"],
			[" ", "停止する", "sStop"],
			["-"],
			[" ", "%m.left_right_both LEDを %m.led_color にする", "sSetLedTo", "左", "赤色"],
			[" ", "%m.left_right_both LEDをR: %n G: %n B: %n ずつ変える", "sChangeLedByRGB", "左", 10, 0, 0],
			[" ", "%m.left_right_both LEDをR: %n G: %n B: %n にする", "sSetLedToRGB", "左", 255, 0, 0],
			[" ", "%m.left_right_both LEDをオフ", "sClearLed", "左"],
			["-"],
			[" ", "%m.sound_effect 音を %n 回鳴らす", "sPlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.sound_effect 音を %n 回鳴らす", "sPlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "ブザー音を %n ずつ変える", "sChangeBuzzerBy", 10],
			[" ", "ブザー音を %n にする", "sSetBuzzerTo", 1000],
			[" ", "音を止める", "sClearSound"],
			[" ", "%m.note %m.octave 音を鳴らす", "sPlayNote", "ド", "4"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "sPlayNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "sRestFor", 0.25],
			[" ", "テンポを %n ずつ変える", "sChangeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "sSetTempoTo", 60],
			["-"],
			["r", "左近接センサー", "sLeftProximity"],
			["r", "右近接センサー", "sRightProximity"],
			["r", "左フロアセンサー", "sLeftFloor"],
			["r", "右フロアセンサー", "sRightFloor"],
			["r", "x軸加速度", "sAccelerationX"],
			["r", "y軸加速度", "sAccelerationY"],
			["r", "z軸加速度", "sAccelerationZ"],
			["r", "照度", "sLight"],
			["r", "温度", "sTemperature"],
			["r", "信号強度", "sSignalStrength"],
			["h", "手を見つけたとき", "sWhenHandFound"],
			["h", "%m.when_s_tilt とき", "sWhenTilt", "前に傾けた"],
			["b", "手を見つけたか?", "sHandFound"],
			["b", "%m.s_tilt ?", "sTilt", "前に傾けたか"],
			["b", "電池が %m.battery ?", "sBattery", "正常か"],
			["-"],
			[" ", "ポート %m.port を %m.s_mode にする", "sSetPortTo", "A", "アナログ入力"],
			[" ", "出力 %m.port を %n ずつ変える", "sChangeOutputBy", "A", 10],
			[" ", "出力 %m.port を %n にする", "sSetOutputTo", "A", 100],
			["w", "グリッパを %m.open_close", "sGripper", "開く"],
			[" ", "グリッパをオフ", "sReleaseGripper"],
			["r", "入力A", "sInputA"],
			["r", "入力B", "sInputB"],
			["-"],
			["w", "シリアルに %m.serial_output %s を書き出す", "sWriteSerial", "文字列", "abc123"],
			["w", "シリアルを %m.serial_delimiter 読み取る", "sReadSerialUntil", "全部"],
			[" ", "シリアル速度を %m.serial_baud Bdにする", "sSetSerialRateTo", "9600"],
			["r", "シリアル入力", "sSerial"]
		],
		uz1: [
			["w", "doskada bir marta oldinga yurish", "sBoardMoveForward"],
			["w", "doskada bir marta %m.left_right ga o'girish", "sBoardTurn", "chap"],
			["-"],
			["w", "oldinga yurish", "sMoveForward"],
			["w", "orqaga yurish", "sMoveBackward"],
			["w", "%m.left_right ga o'girilish", "sTurn", "chap"],
			["-"],
			[" ", "%m.left_right_both LEDni %m.led_color ga sozlash", "sSetLedTo", "chap", "qizil"],
			[" ", "%m.left_right_both LEDni o'chirish", "sClearLed", "chap"],
			["-"],
			[" ", "%m.sound_effect tovushni ijro etish", "sPlaySound", "qisqa"],
			[" ", "tovushni o'chirish", "sClearSound"],
			["-"],
			["h", "qo'l topilganda", "sWhenHandFound"],
			["b", "qo'l topildimi?", "sHandFound"]
		],
		uz2: [
			["w", "doskada bir marta oldinga yurish", "sBoardMoveForward"],
			["w", "doskada bir marta %m.left_right ga o'girish", "sBoardTurn", "chap"],
			["-"],
			["w", "oldinga %n %m.cm_sec yurish", "sMoveForwardUnit", 5, "cm"],
			["w", "orqaga %n %m.cm_sec yurish", "sMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "sTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.left_right g'ildirak markaziga %n %m.deg_sec %m.forward_backward yo'nalishga o'girilish", "sPivotAroundWheelUnitInDirection", "chap", 90, "daraja", "old"],
			["w", "%m.left_right ga %n %m.deg_sec radius %n cm %m.forward_backward yo'nalishga o'girilish", "sTurnBodyUnitWithRadiusInDirection", "chap", 90, "daraja", 5, "old"],
			["-"],
			[" ", "%m.left_right_both LEDni %m.led_color ga sozlash", "sSetLedTo", "chap", "qizil"],
			[" ", "%m.left_right_both LEDni o'chirish", "sClearLed", "chap"],
			["-"],
			[" ", "%m.sound_effect tovushni %n marta ijro etish", "sPlaySoundTimes", "qisqa", 1],
			["w", "%m.sound_effect tovushni %n marta ijro tugaguncha kutish", "sPlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "tovushni o'chirish", "sClearSound"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "sPlayNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "sRestFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "sChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "sSetTempoTo", 60],
			["-"],
			["h", "qo'l topilganda", "sWhenHandFound"],
			["h", "%m.when_s_tilt bo'lganda", "sWhenTilt", "oldinga eğin"],
			["b", "qo'l topildimi?", "sHandFound"],
			["b", "%m.s_tilt ?", "sTilt", "oldinga eğin"]
		],
		uz3: [
			["w", "doskada bir marta oldinga yurish", "sBoardMoveForward"],
			["w", "doskada bir marta %m.left_right ga o'girish", "sBoardTurn", "chap"],
			["-"],
			["w", "oldinga %n %m.move_unit yurish", "sMoveForwardUnit", 5, "cm"],
			["w", "orqaga %n %m.move_unit yurish", "sMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "sTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.pen_wheel markaziga %n %m.turn_unit %m.forward_backward yo'nalishga o'girilish", "sPivotAroundUnitInDirection", "chap ruchka", 90, "daraja", "old"],
			["w", "%m.pen_body , %m.left_right ga %n %m.turn_unit radius %n cm %m.forward_backward yo'nalishga o'girilish", "sTurnUnitWithRadiusInDirection", "chap ruchka", "chap", 90, "daraja", 5, "old"],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "sChangeBothWheelsBy", 10, 10],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "sSetBothWheelsTo", 30, 30],
			[" ", "%m.left_right_both g'ildirakni %n ga o'zgartirish", "sChangeWheelBy", "chap", 10],
			[" ", "%m.left_right_both g'ildirakni %n ga sozlash", "sSetWheelTo", "chap", 30],
			[" ", "%m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish", "sFollowLineUsingFloorSensor", "qora", "chap"],
			["w", "%m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish", "sFollowLineUntilIntersection", "qora", "old"],
			[" ", "liniyada ergashish tezligini %m.speed ga sozlash", "sSetFollowingSpeedTo", "5"],
			[" ", "liniyada ergashish yo'nalishli o'zgarishni %m.gain ga sozlash", "sSetFollowingGainTo", "asl qiymati"],
			[" ", "to'xtatish", "sStop"],
			["-"],
			[" ", "%m.left_right_both LEDni %m.led_color ga sozlash", "sSetLedTo", "chap", "qizil"],
			[" ", "%m.left_right_both LEDni r: %n g: %n b: %n ga o'zgartirish", "sChangeLedByRGB", "chap", 10, 0, 0],
			[" ", "%m.left_right_both LEDni r: %n g: %n b: %n ga sozlash", "sSetLedToRGB", "chap", 255, 0, 0],
			[" ", "%m.left_right_both LEDni o'chirish", "sClearLed", "chap"],
			["-"],
			[" ", "%m.sound_effect tovushni %n marta ijro etish", "sPlaySoundTimes", "qisqa", 1],
			["w", "%m.sound_effect tovushni %n marta ijro tugaguncha kutish", "sPlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "buzerning ovozini %n ga o'zgartirish", "sChangeBuzzerBy", 10],
			[" ", "buzerning ovozini %n ga sozlash", "sSetBuzzerTo", 1000],
			[" ", "tovushni o'chirish", "sClearSound"],
			[" ", "%m.note %m.octave notani ijro etish", "sPlayNote", "do", "4"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "sPlayNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "sRestFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "sChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "sSetTempoTo", 60],
			["-"],
			["r", "chap yaqinlik", "sLeftProximity"],
			["r", "o'ng yaqinlik", "sRightProximity"],
			["r", "chap taglik", "sLeftFloor"],
			["r", "o'ng taglik", "sRightFloor"],
			["r", "x tezlanish", "sAccelerationX"],
			["r", "y tezlanish", "sAccelerationY"],
			["r", "z tezlanish", "sAccelerationZ"],
			["r", "yorug'lik", "sLight"],
			["r", "harorat", "sTemperature"],
			["r", "signal kuchi", "sSignalStrength"],
			["h", "qo'l topilganda", "sWhenHandFound"],
			["h", "%m.when_s_tilt bo'lganda", "sWhenTilt", "oldinga eğin"],
			["b", "qo'l topildimi?", "sHandFound"],
			["b", "%m.s_tilt ?", "sTilt", "oldinga eğin"],
			["b", "batareya %m.battery ?", "sBattery", "normal"],
			["-"],
			[" ", "%m.port portni %m.s_mode ga sozlash", "sSetPortTo", "A", "analog kiritish"],
			[" ", "%m.port portni %n ga o'zgartirish", "sChangeOutputBy", "A", 10],
			[" ", "%m.port portni %n ga sozlash", "sSetOutputTo", "A", 100],
			["w", "gripperni %m.open_close", "sGripper", "oching"],
			[" ", "gripperni ozod qilish", "sReleaseGripper"],
			["r", "A kirish", "sInputA"],
			["r", "B kirish", "sInputB"],
			["-"],
			["w", "%m.serial_output %s ni ketma-ketga yozing", "sWriteSerial", "harf", "abc123"],
			["w", "%m.serial_delimiter ketma-ketni o'qing", "sReadSerialUntil", "hammasi"],
			[" ", "ketma-ketni tezligini %m.serial_baud Bdga sozlash", "sSetSerialRateTo", "9600"],
			["r", "ketma-ket kiritish", "sSerial"]
		]
	};
	const MENUS = {
		en: {
			"move_unit": ["cm", "seconds", "pulses"],
			"turn_unit": ["degrees", "seconds", "pulses"],
			"cm_sec": ["cm", "seconds"],
			"deg_sec": ["degrees", "seconds"],
			"left_right": ["left", "right"],
			"left_right_both": ["left", "right", "both"],
			"pen_wheel": ["left pen", "right pen", "left wheel", "right wheel"],
			"pen_body": ["left pen", "right pen", "robot"],
			"forward_backward": ["forward", "backward"],
			"black_white": ["black", "white"],
			"left_right_front_rear": ["left", "right", "front", "rear"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"gain": ["default", "1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "violet", "purple", "white"],
			"sound_effect": ["beep", "random beep", "noise", "siren", "engine", "chop", "robot", "dibidibidip", "good job", "happy", "angry", "sad", "sleep", "march", "birthday"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_s_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt", "tap", "free fall"],
			"s_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt", "tap", "free fall"],
			"battery": ["normal", "low", "empty"],
			"port": ["A", "B", "A and B"],
			"s_mode": ["analog input", "digital input", "digital input (pull up)", "digital input (pull down)", "voltage input", "servo output", "pwm output", "digital output"],
			"open_close": ["open", "close"],
			"serial_output": ["string", "string line"],
			"serial_delimiter": ["all", "until ,(comma)", "until :(colon)", "until $", "until #", "until new line"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
		},
		ko: {
			"move_unit": ["cm", "초", "펄스"],
			"turn_unit": ["도", "초", "펄스"],
			"cm_sec": ["cm", "초"],
			"deg_sec": ["도", "초"],
			"left_right": ["왼쪽", "오른쪽"],
			"left_right_both": ["왼쪽", "오른쪽", "양쪽"],
			"pen_wheel": ["왼쪽 펜", "오른쪽 펜", "왼쪽 바퀴", "오른쪽 바퀴"],
			"pen_body": ["왼쪽 펜", "오른쪽 펜", "로봇"],
			"forward_backward": ["앞쪽", "뒤쪽"],
			"black_white": ["검은색", "하얀색"],
			"left_right_front_rear": ["왼쪽", "오른쪽", "앞쪽", "뒤쪽"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"gain": ["기본 값", "1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"sound_effect": ["삐", "무작위 삐", "지지직", "사이렌", "엔진", "쩝", "로봇", "디비디비딥", "잘 했어요", "행복", "화남", "슬픔", "졸림", "행진", "생일"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_s_tilt": ["앞으로 기울였을", "뒤로 기울였을", "왼쪽으로 기울였을", "오른쪽으로 기울였을", "거꾸로 뒤집었을", "기울이지 않았을", "두드렸을", "자유 낙하했을"],
			"s_tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "기울이지 않음", "두드림", "자유 낙하"],
			"battery": ["정상", "부족", "없음"],
			"port": ["A", "B", "A와 B"],
			"s_mode": ["아날로그 입력", "디지털 입력", "디지털 입력 (풀업)", "디지털 입력 (풀다운)", "전압 입력", "서보 출력", "PWM 출력", "디지털 출력"],
			"open_close": ["열기", "닫기"],
			"serial_output": ["글자", "글자 한 줄"],
			"serial_delimiter": ["모두", ",(쉼표)까지", ":(쌍점)까지", "$까지", "#까지", "줄 바꿈까지"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
		},
		ja: {
			"move_unit": ["cm", "秒", "パルス"],
			"turn_unit": ["度", "秒", "パルス"],
			"cm_sec": ["cm", "秒"],
			"deg_sec": ["度", "秒"],
			"left_right": ["左", "右"],
			"left_right_both": ["左", "右", "両"],
			"pen_wheel": ["左ペン", "右ペン", "左車輪", "右車輪"],
			"pen_body": ["左ペン", "右ペン", "ロボット"],
			"forward_backward": ["前", "後"],
			"black_white": ["黒色", "白色"],
			"left_right_front_rear": ["左", "右", "前", "後"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"gain": ["基本値", "1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["赤色", "橙色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"sound_effect": ["ビープ", "ランダムビープ", "ノイズ", "サイレン", "エンジン", "チョップ", "ロボット", "ディバディバディップ", "よくやった", "幸福", "怒った", "悲しみ", "睡眠", "行進", "誕生"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_s_tilt": ["前に傾けた", "後に傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾けなかった", "叩いた", "自由落下した"],
			"s_tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾けなかったか", "叩いたか", "自由落下したか"],
			"battery": ["正常か", "足りないか", "ないか"],
			"port": ["A", "B", "AとB"],
			"s_mode": ["アナログ入力", "デジタル入力", "デジタル入力 (プルアップ)", "デジタル入力 (プルダウン)", "電圧入力", "サーボ出力", "PWM出力", "デジタル出力"],
			"open_close": ["開く", "閉める"],
			"serial_output": ["文字列", "文字列1行"],
			"serial_delimiter": ["全部", "、(読点)まで", "：(コロン)まで", "$まで", "#まで", "改行まで"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"]
		},
		uz: {
			"move_unit": ["cm", "soniya", "puls"],
			"turn_unit": ["daraja", "soniya", "puls"],
			"cm_sec": ["cm", "soniya"],
			"deg_sec": ["daraja", "soniya"],
			"left_right": ["chap", "o'ng"],
			"left_right_both": ["chap", "o'ng", "har ikki"],
			"pen_wheel": ["chap ruchka", "o'ng ruchka", "chap g'ildirak", "o'ng g'ildirak"],
			"pen_body": ["chap ruchka", "o'ng ruchka", "robot"],
			"forward_backward": ["old", "orqa"],
			"black_white": ["qora", "oq"],
			"left_right_front_rear": ["chap", "o'ng", "old", "orqa"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"gain": ["asl qiymati", "1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "binafsha", "siyoh", "oq"],
			"sound_effect": ["qisqa", "tasodifiy qisqa", "shovqin", "sirena", "motor", "chop", "robot", "dibidibidip", "juda yaxshi", "baxtli", "badjahl", "xafa", "uyqu", "marsh", "tug'ilgan kun"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_s_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q", "jo'mrak", "erkin tushish"],
			"s_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q", "jo'mrak", "erkin tushish"],
			"battery": ["normal", "past", "bo'sh"],
			"port": ["A", "B", "A va B"],
			"s_mode": ["analog kiritish", "raqamli kiritish", "raqamli kiritish (pull up)", "raqamli kiritish (pull down)", "voltaj kiritish", "servo chiqish", "pwm chiqish", "raqamli chiqish"],
			"open_close": ["oching", "yoping"],
			"serial_output": ["harf", "harf qator"],
			"serial_delimiter": ["hammasi", ",(vergul)gacha", ":(qo'sh nuqta)gacha", "$gacha", "#gacha", "yangi satrgacha"],
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
	var RGB_COLORS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var SOUND_EFFECTS = {};
	var IO_MODES = {};
	var GRIPPERS = {};
	var TILTS = {};
	var BATTERY_STATES = {};
	var SERIAL_MODES = {};
	var SERIAL_DELIMITERS = {};
	var SERIAL_BAUDS = { '9600': 176, '14400': 177, '19200': 178, '28800': 179, '38400': 180, '57600': 181, '76800': 182, '115200': 183 };
	var VALUES = {};
	
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const FRONT = 4;
	const REAR = 5;
	const LEFT_PEN = 1;
	const RIGHT_PEN = 2;
	const LEFT_WHEEL = 3;
	const RIGHT_WHEEL = 4;
	const FORWARD = 1;
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
		tmp = MENUS[i]['pen_wheel'];
		PARTS[tmp[0]] = LEFT_PEN;
		PARTS[tmp[1]] = RIGHT_PEN;
		PARTS[tmp[2]] = LEFT_WHEEL;
		PARTS[tmp[3]] = RIGHT_WHEEL;
		tmp = MENUS[i]['left_right_front_rear'];
		DIRECTIONS[tmp[0]] = LEFT;
		DIRECTIONS[tmp[1]] = RIGHT;
		DIRECTIONS[tmp[2]] = FRONT;
		DIRECTIONS[tmp[3]] = REAR;
		tmp = MENUS[i]['forward_backward'];
		TOWARDS[tmp[0]] = FORWARD;
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
		RGB_COLORS[tmp[0]] = [255, 0, 0]; // red
		RGB_COLORS[tmp[1]] = [255, 63, 0]; // orange
		RGB_COLORS[tmp[2]] = [255, 255, 0]; // yellow
		RGB_COLORS[tmp[3]] = [0, 255, 0]; // green
		RGB_COLORS[tmp[4]] = [0, 255, 255]; // sky blue
		RGB_COLORS[tmp[5]] = [0, 0, 255]; // blue
		RGB_COLORS[tmp[6]] = [63, 0, 255]; // violet
		RGB_COLORS[tmp[7]] = [255, 0, 255]; // purple
		RGB_COLORS[tmp[8]] = [255, 255, 255]; // white
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
		if(secs < 0) this.__motion(2, -30, -30, -secs, callback);
		else this.__motion(1, 30, 30, secs, callback);
	};

	Hamster.prototype.moveBackwardSecs = function(secs, callback) {
		if(secs < 0) this.__motion(1, 30, 30, -secs, callback);
		else this.__motion(2, -30, -30, secs, callback);
	};

	Hamster.prototype.turnSecs = function(direction, secs, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			if(secs < 0) this.__motion(4, 30, -30, -secs, callback);
			else this.__motion(3, -30, 30, secs, callback);
		} else {
			if(secs < 0) this.__motion(3, -30, 30, -secs, callback);
			else this.__motion(4, 30, -30, secs, callback);
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

	Hamster.prototype.pivotWheelUnit = function(wheel, value, unit, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			if(PARTS[wheel] == LEFT) {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motion(6, 0, -30, -value, callback);
					else this.__motion(5, 0, 30, value, callback);
				} else {
					if(value < 0) this.__motion(5, 0, 30, -value, callback);
					else this.__motion(6, 0, -30, value, callback);
				}
			} else {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motion(8, -30, 0, -value, callback);
					else this.__motion(7, 30, 0, value, callback);
				} else {
					if(value < 0) this.__motion(7, 30, 0, -value, callback);
					else this.__motion(8, -30, 0, value, callback);
				}
			}
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.swingBodyUnit = function(direction, value, unit, radius, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			radius = parseFloat(radius);
			if((typeof radius == 'number') && radius >= 0) {
				this.motoring.radius = radius;
				if(DIRECTIONS[direction] == LEFT) {
					if(TOWARDS[toward] == FORWARD) {
						if(value < 0) this.__motion(10, 0, 0, -value, callback);
						else this.__motion(9, 0, 0, value, callback);
					} else {
						if(value < 0) this.__motion(9, 0, 0, -value, callback);
						else this.__motion(10, 0, 0, value, callback);
					}
				} else {
					if(TOWARDS[toward] == FORWARD) {
						if(value < 0) this.__motion(12, 0, 0, -value, callback);
						else this.__motion(11, 0, 0, value, callback);
					} else {
						if(value < 0) this.__motion(11, 0, 0, -value, callback);
						else this.__motion(12, 0, 0, value, callback);
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

	Hamster.prototype.pivotUnit = function(part, value, unit, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			part = PARTS[part];
			if(part == LEFT_PEN) {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motion(14, 0, 0, -value, callback);
					else this.__motion(13, 0, 0, value, callback);
				} else {
					if(value < 0) this.__motion(13, 0, 0, -value, callback);
					else this.__motion(14, 0, 0, value, callback);
				}
			} else if(part == RIGHT_PEN) {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motion(16, 0, 0, -value, callback);
					else this.__motion(15, 0, 0, value, callback);
				} else {
					if(value < 0) this.__motion(15, 0, 0, -value, callback);
					else this.__motion(16, 0, 0, value, callback);
				}
			} else if(part == LEFT_WHEEL) {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motion(6, 0, -30, -value, callback);
					else this.__motion(5, 0, 30, value, callback);
				} else {
					if(value < 0) this.__motion(5, 0, 30, -value, callback);
					else this.__motion(6, 0, -30, value, callback);
				}
			} else {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motion(8, -30, 0, -value, callback);
					else this.__motion(7, 30, 0, value, callback);
				} else {
					if(value < 0) this.__motion(7, 30, 0, -value, callback);
					else this.__motion(8, -30, 0, value, callback);
				}
			}
		} else {
			this.__stopMotion();
		}
	};
	
	Hamster.prototype.swingUnit = function(part, direction, value, unit, radius, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			radius = parseFloat(radius);
			if((typeof radius == 'number') && radius >= 0) {
				this.motoring.radius = radius;
				part = PARTS[part];
				if(part == LEFT_PEN) {
					if(DIRECTIONS[direction] == LEFT) {
						if(TOWARDS[toward] == FORWARD) {
							if(value < 0) this.__motion(18, 0, 0, -value, callback);
							else this.__motion(17, 0, 0, value, callback);
						} else {
							if(value < 0) this.__motion(17, 0, 0, -value, callback);
							else this.__motion(18, 0, 0, value, callback);
						}
					} else {
						if(TOWARDS[toward] == FORWARD) {
							if(value < 0) this.__motion(20, 0, 0, -value, callback);
							else this.__motion(19, 0, 0, value, callback);
						} else {
							if(value < 0) this.__motion(19, 0, 0, -value, callback);
							else this.__motion(20, 0, 0, value, callback);
						}
					}
				} else if(part == RIGHT_PEN) {
					if(DIRECTIONS[direction] == LEFT) {
						if(TOWARDS[toward] == FORWARD) {
							if(value < 0) this.__motion(22, 0, 0, -value, callback);
							else this.__motion(21, 0, 0, value, callback);
						} else {
							if(value < 0) this.__motion(21, 0, 0, -value, callback);
							else this.__motion(22, 0, 0, value, callback);
						}
					} else {
						if(TOWARDS[toward] == FORWARD) {
							if(value < 0) this.__motion(24, 0, 0, -value, callback);
							else this.__motion(23, 0, 0, value, callback);
						} else {
							if(value < 0) this.__motion(23, 0, 0, -value, callback);
							else this.__motion(24, 0, 0, value, callback);
						}
					}
				} else {
					if(DIRECTIONS[direction] == LEFT) {
						if(TOWARDS[toward] == FORWARD) {
							if(value < 0) this.__motion(10, 0, 0, -value, callback);
							else this.__motion(9, 0, 0, value, callback);
						} else {
							if(value < 0) this.__motion(9, 0, 0, -value, callback);
							else this.__motion(10, 0, 0, value, callback);
						}
					} else {
						if(TOWARDS[toward] == FORWARD) {
							if(value < 0) this.__motion(12, 0, 0, -value, callback);
							else this.__motion(11, 0, 0, value, callback);
						} else {
							if(value < 0) this.__motion(11, 0, 0, -value, callback);
							else this.__motion(12, 0, 0, value, callback);
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
		if(SOUND_EFFECTS[sound] == 1 && count) {
			this.runBeep(count);
		}
	};

	Hamster.prototype.playSoundUntil = function(sound, count, callback) {
		this.__cancelNote();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		count = parseInt(count);
		if(count) {
			if(SOUND_EFFECTS[sound] == 1) {
				var id = this.__issueNoteId();
				this.runBeep(count, id, callback);
			}
		} else {
			callback();
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
		if(secs < 0) this.__motionUnit(2, 2, -secs, callback);
		else this.__motionUnit(1, 2, secs, callback);
	};

	HamsterS.prototype.moveBackwardSecs = function(secs, callback) {
		if(secs < 0) this.__motionUnit(1, 2, -secs, callback);
		else this.__motionUnit(2, 2, secs, callback);
	};

	HamsterS.prototype.turnSecs = function(direction, secs, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			if(secs < 0) this.__motionUnit(4, 2, -secs, callback);
			else this.__motionUnit(3, 2, secs, callback);
		} else {
			if(secs < 0) this.__motionUnit(3, 2, -secs, callback);
			else this.__motionUnit(4, 2, secs, callback);
		}
	};

	HamsterS.prototype.moveForwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(2, UNITS[unit], -value, callback);
		else this.__motionUnit(1, UNITS[unit], value, callback);
	};

	HamsterS.prototype.moveBackwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(1, UNITS[unit], -value, callback);
		else this.__motionUnit(2, UNITS[unit], value, callback);
	};

	HamsterS.prototype.turnUnit = function(direction, value, unit, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			if(value < 0) this.__motionUnit(4, UNITS[unit], -value, callback);
			else this.__motionUnit(3, UNITS[unit], value, callback);
		} else {
			if(value < 0) this.__motionUnit(3, UNITS[unit], -value, callback);
			else this.__motionUnit(4, UNITS[unit], value, callback);
		}
	};

	HamsterS.prototype.pivotWheelUnit = function(wheel, value, unit, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[wheel] == LEFT) {
			if(TOWARDS[toward] == FORWARD) {
				if(value < 0) this.__motionUnit(6, unit, -value, callback);
				else this.__motionUnit(5, unit, value, callback);
			} else {
				if(value < 0) this.__motionUnit(5, unit, -value, callback);
				else this.__motionUnit(6, unit, value, callback);
			}
		} else {
			if(TOWARDS[toward] == FORWARD) {
				if(value < 0) this.__motionUnit(8, unit, -value, callback);
				else this.__motionUnit(7, unit, value, callback);
			} else {
				if(value < 0) this.__motionUnit(7, unit, -value, callback);
				else this.__motionUnit(8, unit, value, callback);
			}
		}
	};

	HamsterS.prototype.swingBodyUnit = function(direction, value, unit, radius, toward, callback) {
		unit = UNITS[unit];
		if(DIRECTIONS[direction] == LEFT) {
			if(TOWARDS[toward] == FORWARD) {
				if(value < 0) this.__motionUnitRadius(10, unit, -value, radius, callback);
				else this.__motionUnitRadius(9, unit, value, radius, callback);
			} else {
				if(value < 0) this.__motionUnitRadius(9, unit, -value, radius, callback);
				else this.__motionUnitRadius(10, unit, value, radius, callback);
			}
		} else {
			if(TOWARDS[toward] == FORWARD) {
				if(value < 0) this.__motionUnitRadius(12, unit, -value, radius, callback);
				else this.__motionUnitRadius(11, unit, value, radius, callback);
			} else {
				if(value < 0) this.__motionUnitRadius(11, unit, -value, radius, callback);
				else this.__motionUnitRadius(12, unit, value, radius, callback);
			}
		}
	};

	HamsterS.prototype.pivotUnit = function(part, value, unit, toward, callback) {
		part = PARTS[part];
		unit = UNITS[unit];
		if(part == LEFT_PEN) {
			if(TOWARDS[toward] == FORWARD) {
				if(value < 0) this.__motionUnit(14, unit, -value, callback);
				else this.__motionUnit(13, unit, value, callback);
			} else {
				if(value < 0) this.__motionUnit(13, unit, -value, callback);
				else this.__motionUnit(14, unit, value, callback);
			}
		} else if(part == RIGHT_PEN) {
			if(TOWARDS[toward] == FORWARD) {
				if(value < 0) this.__motionUnit(16, unit, -value, callback);
				else this.__motionUnit(15, unit, value, callback);
			} else {
				if(value < 0) this.__motionUnit(15, unit, -value, callback);
				else this.__motionUnit(16, unit, value, callback);
			}
		} else if(part == LEFT_WHEEL) {
			if(TOWARDS[toward] == FORWARD) {
				if(value < 0) this.__motionUnit(6, unit, -value, callback);
				else this.__motionUnit(5, unit, value, callback);
			} else {
				if(value < 0) this.__motionUnit(5, unit, -value, callback);
				else this.__motionUnit(6, unit, value, callback);
			}
		} else {
			if(TOWARDS[toward] == FORWARD) {
				if(value < 0) this.__motionUnit(8, unit, -value, callback);
				else this.__motionUnit(7, unit, value, callback);
			} else {
				if(value < 0) this.__motionUnit(7, unit, -value, callback);
				else this.__motionUnit(8, unit, value, callback);
			}
		}
	};
	
	HamsterS.prototype.swingUnit = function(part, direction, value, unit, radius, toward, callback) {
		part = PARTS[part];
		unit = UNITS[unit];
		if(part == LEFT_PEN) {
			if(DIRECTIONS[direction] == LEFT) {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motionUnitRadius(18, unit, -value, radius, callback);
					else this.__motionUnitRadius(17, unit, value, radius, callback);
				} else {
					if(value < 0) this.__motionUnitRadius(17, unit, -value, radius, callback);
					else this.__motionUnitRadius(18, unit, value, radius, callback);
				}
			} else {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motionUnitRadius(20, unit, -value, radius, callback);
					else this.__motionUnitRadius(19, unit, value, radius, callback);
				} else {
					if(value < 0) this.__motionUnitRadius(19, unit, -value, radius, callback);
					else this.__motionUnitRadius(20, unit, value, radius, callback);
				}
			}
		} else if(part == RIGHT_PEN) {
			if(DIRECTIONS[direction] == LEFT) {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motionUnitRadius(22, unit, -value, radius, callback);
					else this.__motionUnitRadius(21, unit, value, radius, callback);
				} else {
					if(value < 0) this.__motionUnitRadius(21, unit, -value, radius, callback);
					else this.__motionUnitRadius(22, unit, value, radius, callback);
				}
			} else {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motionUnitRadius(24, unit, -value, radius, callback);
					else this.__motionUnitRadius(23, unit, value, radius, callback);
				} else {
					if(value < 0) this.__motionUnitRadius(23, unit, -value, radius, callback);
					else this.__motionUnitRadius(24, unit, value, radius, callback);
				}
			}
		} else {
			if(DIRECTIONS[direction] == LEFT) {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motionUnitRadius(10, unit, -value, radius, callback);
					else this.__motionUnitRadius(9, unit, value, radius, callback);
				} else {
					if(value < 0) this.__motionUnitRadius(9, unit, -value, radius, callback);
					else this.__motionUnitRadius(10, unit, value, radius, callback);
				}
			} else {
				if(TOWARDS[toward] == FORWARD) {
					if(value < 0) this.__motionUnitRadius(12, unit, -value, radius, callback);
					else this.__motionUnitRadius(11, unit, value, radius, callback);
				} else {
					if(value < 0) this.__motionUnitRadius(11, unit, -value, radius, callback);
					else this.__motionUnitRadius(12, unit, value, radius, callback);
				}
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

	function getOrCreateRobot(group, module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			switch(module) {
				case HAMSTER: robot = new Hamster(index); break;
				case HAMSTER_S: robot = new HamsterS(index); break;
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
					if(data.index == 0) {
						var robot = getOrCreateRobot(data.module, data.realModule, 0);
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
							if(received.module == HAMSTER) {
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
									if(slaveVersion == 1) {
										var json = JSON.stringify(packet);
										if(canSend && socket) socket.send(json);
									} else {
										var robot = getRobot(HAMSTER, 0);
										if(robot) {
											var json = JSON.stringify(robot.motoring);
											if(canSend && socket) socket.send(json);
										}
									}
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
	
	ext.sBoardMoveForward = function(callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.boardForward(callback);
	};
	
	ext.sBoardTurn = function(direction, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.boardTurn(direction, callback);
	};
	
	ext.sMoveForward = function(callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveForward(callback);
	};
	
	ext.sMoveBackward = function(callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.sTurn = function(direction, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.turn(direction, callback);
	};
	
	ext.sMoveForwardUnit = function(value, unit, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveForwardUnit(value, unit, callback);
	};
	
	ext.sMoveBackwardUnit = function(value, unit, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveBackwardUnit(value, unit, callback);
	};
	
	ext.sTurnUnitInPlace = function(direction, value, unit, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.turnUnit(direction, value, unit, callback);
	};
	
	ext.sTurnUnitWithRadiusInDirection = function(direction, value, unit, radius, toward, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.swingUnit(direction, value, unit, radius, toward, callback);
	};
	
	ext.sPivotAroundWheelUnitInDirection = function(wheel, value, unit, toward, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.pivotUnit(wheel, value, unit, toward, callback);
	};
	
	ext.sTurnPenUnitWithRadiusInDirection = function(pen, direction, value, unit, radius, toward, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.swingPenUnit(pen, direction, value, unit, radius, toward, callback);
	};
	
	ext.sPivotAroundPenUnitInDirection = function(pen, value, unit, toward, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.pivotPenUnit(pen, value, unit, toward, callback);
	};
	
	ext.sChangeBothWheelsBy = function(left, right) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeWheels(left, right);
	};
	
	ext.sSetBothWheelsTo = function(left, right) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setWheels(left, right);
	};
	
	ext.sChangeWheelBy = function(wheel, value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeWheel(wheel, value);
	};
	
	ext.sSetWheelTo = function(wheel, value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setWheel(wheel, value);
	};
	
	ext.sFollowLineUsingFloorSensor = function(color, sensor) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.followLine(color, sensor);
	};
	
	ext.sFollowLineUntilIntersection = function(color, direction, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.followLineUntil(color, direction, callback);
	};
	
	ext.sSetFollowingSpeedTo = function(speed) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setLineTracerSpeed(speed);
	};
	
	ext.sSetFollowingGainTo = function(gain) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setLineTracerGain(gain);
	};
	
	ext.sStop = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.stop();
	};
	
	ext.sSetLedTo = function(led, color) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setLed(led, color);
	};
	
	ext.sChangeLedByRGB = function(led, red, green, blue) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeRgb(led, red, green, blue);
	};
	
	ext.sSetLedToRGB = function(led, red, green, blue) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setRgb(led, red, green, blue);
	};
	
	ext.sClearLed = function(led) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.clearLed(led);
	};
	
	ext.sPlaySound = function(sound) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.playSound(sound, 1);
	};
	
	ext.sPlaySoundTimes = function(sound, repeat) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.playSound(sound, repeat);
	};
	
	ext.sPlaySoundTimesUntilDone = function(sound, repeat, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.playSoundUntil(sound, repeat, callback);
	};
	
	ext.sChangeBuzzerBy = function(hz) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeBuzzer(hz);
	};
	
	ext.sSetBuzzerTo = function(hz) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setBuzzer(hz);
	};
	
	ext.sClearSound = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.clearSound();
	};
	
	ext.sPlayNote = function(note, octave) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.sPlayNoteFor = function(note, octave, beat, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};
	
	ext.sRestFor = function(beat, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.restBeat(beat, callback);
	};
	
	ext.sChangeTempoBy = function(bpm) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeTempo(bpm);
	};
	
	ext.sSetTempoTo = function(bpm) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setTempo(bpm);
	};
	
	ext.sLeftProximity = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getLeftProximity();
		return 0;
	};
	
	ext.sRightProximity = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getRightProximity();
		return 0;
	};
	
	ext.sLeftFloor = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getLeftFloor();
		return 0;
	};
	
	ext.sRightFloor = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getRightFloor();
		return 0;
	};
	
	ext.sAccelerationX = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getAccelerationX();
		return 0;
	};
	
	ext.sAccelerationY = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getAccelerationY();
		return 0;
	};
	
	ext.sAccelerationZ = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getAccelerationZ();
		return 0;
	};
	
	ext.sLight = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getLight();
		return 0;
	};
	
	ext.sTemperature = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getTemperature();
		return 0;
	};
	
	ext.sSignalStrength = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getSignalStrength();
		return 0;
	};
	
	ext.sWhenHandFound = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.sWhenTilt = function(tilt) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.sHandFound = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.sTilt = function(tilt) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.sBattery = function(state) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkBattery(state);
		return false;
	};
	
	ext.sSetPortTo = function(port, mode) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setIoMode(port, mode);
	};
	
	ext.sChangeOutputBy = function(port, value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeOutput(port, value);
	};
	
	ext.sSetOutputTo = function(port, value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setOutput(port, value);
	};
	
	ext.sGripper = function(action, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.gripper(action, callback);
	};
	
	ext.sReleaseGripper = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.releaseGripper();
	};
	
	ext.sInputA = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getInputA();
		return 0;
	};
	
	ext.sInputB = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getInputB();
		return 0;
	};
	
	ext.sWriteSerial = function(mode, text, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.writeSerial(mode, text, callback);
	};
	
	ext.sReadSerialUntil = function(delimiter, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.readSerialUltil(delimiter, callback);
	};
	
	ext.sSetSerialRateTo = function(baud) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setSerialRate(baud);
	};
	
	ext.sSerial = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getSerialInput();
		return '';
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
