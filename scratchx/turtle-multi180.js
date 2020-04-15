(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
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
			["w", "Turtle %n : move forward %n %m.cm_sec", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : move backward %n %m.cm_sec", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : turn %m.left_right %n %m.deg_sec in place", "turtleTurnUnitInPlace", 0, "left", 90, "degrees"],
			["w", "Turtle %n : pivot around %m.left_right wheel %n %m.deg_sec in %m.head_tail direction", "turtlePivotAroundWheelUnitInDirection", 0, "left", 90, "degrees", "head"],
			["w", "Turtle %n : turn %m.left_right %n %m.deg_sec with radius %n cm in %m.head_tail direction", "turtleTurnUnitWithRadiusInDirection", 0, "left", 90, "degrees", 6, "head"],
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
			["w", "Turtle %n : move forward %n %m.move_unit", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : move backward %n %m.move_unit", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : turn %m.left_right %n %m.turn_unit in place", "turtleTurnUnitInPlace", 0, "left", 90, "degrees"],
			["w", "Turtle %n : pivot around %m.left_right wheel %n %m.turn_unit in %m.head_tail direction", "turtlePivotAroundWheelUnitInDirection", 0, "left", 90, "degrees", "head"],
			["w", "Turtle %n : turn %m.left_right %n %m.turn_unit with radius %n cm in %m.head_tail direction", "turtleTurnUnitWithRadiusInDirection", 0, "left", 90, "degrees", 6, "head"],
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
			["r", "Turtle %n : color number", "turtleColorNumber", 0],
			["r", "Turtle %n : color pattern", "turtleColorPattern", 0],
			["r", "Turtle %n : floor", "turtleFloor", 0],
			["r", "Turtle %n : button", "turtleButton", 0],
			["r", "Turtle %n : x acceleration", "turtleAccelerationX", 0],
			["r", "Turtle %n : y acceleration", "turtleAccelerationY", 0],
			["r", "Turtle %n : z acceleration", "turtleAccelerationZ", 0],
			["h", "Turtle %n : when %m.touching_color touched", "turtleWhenColorTouched", 0, "red"],
			["h", "Turtle %n : when color pattern is %m.pattern_color %m.pattern_color", "turtleWhenColorPattern", 0, "red", "yellow"],
			["h", "Turtle %n : when button %m.when_button_state", "turtleWhenButtonState", 0, "clicked"],
			["h", "Turtle %n : when %m.when_tilt", "turtleWhenTilt", 0, "tilt forward"],
			["b", "Turtle %n : touching %m.touching_color ?", "turtleTouchingColor", 0, "red"],
			["b", "Turtle %n : color pattern %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", 0, "red", "yellow"],
			["b", "Turtle %n : button %m.button_state ?", "turtleButtonState", 0, "clicked"],
			["b", "Turtle %n : %m.tilt ?", "turtleTilt", 0, "tilt forward"],
			["b", "Turtle %n : battery %m.battery ?", "turtleBattery", 0, "normal"]
		],
		ko1: [
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
			["w", "거북이 %n : 앞으로 %n %m.cm_sec 이동하기", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "거북이 %n : 뒤로 %n %m.cm_sec 이동하기", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "거북이 %n : %m.left_right 으로 %n %m.deg_sec 제자리 돌기", "turtleTurnUnitInPlace", 0, "왼쪽", 90, "도"],
			["w", "거북이 %n : %m.left_right 바퀴 중심으로 %n %m.deg_sec %m.head_tail 방향으로 돌기", "turtlePivotAroundWheelUnitInDirection", 0, "왼쪽", 90, "도", "머리"],
			["w", "거북이 %n : %m.left_right 으로 %n %m.deg_sec 반지름 %n cm를 %m.head_tail 방향으로 돌기", "turtleTurnUnitWithRadiusInDirection", 0, "왼쪽", 90, "도", 6, "머리"],
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
			["w", "거북이 %n : 앞으로 %n %m.move_unit 이동하기", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "거북이 %n : 뒤로 %n %m.move_unit 이동하기", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "거북이 %n : %m.left_right 으로 %n %m.turn_unit 제자리 돌기", "turtleTurnUnitInPlace", 0, "왼쪽", 90, "도"],
			["w", "거북이 %n : %m.left_right 바퀴 중심으로 %n %m.turn_unit %m.head_tail 방향으로 돌기", "turtlePivotAroundWheelUnitInDirection", 0, "왼쪽", 90, "도", "머리"],
			["w", "거북이 %n : %m.left_right 으로 %n %m.turn_unit 반지름 %n cm를 %m.head_tail 방향으로 돌기", "turtleTurnUnitWithRadiusInDirection", 0, "왼쪽", 90, "도", 6, "머리"],
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
			["r", "거북이 %n : 색깔 번호", "turtleColorNumber", 0],
			["r", "거북이 %n : 색깔 패턴", "turtleColorPattern", 0],
			["r", "거북이 %n : 바닥 센서", "turtleFloor", 0],
			["r", "거북이 %n : 버튼", "turtleButton", 0],
			["r", "거북이 %n : x축 가속도", "turtleAccelerationX", 0],
			["r", "거북이 %n : y축 가속도", "turtleAccelerationY", 0],
			["r", "거북이 %n : z축 가속도", "turtleAccelerationZ", 0],
			["h", "거북이 %n : %m.touching_color 에 닿았을 때", "turtleWhenColorTouched", 0, "빨간색"],
			["h", "거북이 %n : 색깔 패턴이 %m.pattern_color %m.pattern_color 일 때", "turtleWhenColorPattern", 0, "빨간색", "노란색"],
			["h", "거북이 %n : 버튼을 %m.when_button_state 때", "turtleWhenButtonState", 0, "클릭했을"],
			["h", "거북이 %n : %m.when_tilt 때", "turtleWhenTilt", 0, "앞으로 기울였을"],
			["b", "거북이 %n : %m.touching_color 에 닿았는가?", "turtleTouchingColor", 0, "빨간색"],
			["b", "거북이 %n : 색깔 패턴이 %m.pattern_color %m.pattern_color 인가?", "turtleIsColorPattern", 0, "빨간색", "노란색"],
			["b", "거북이 %n : 버튼을 %m.button_state ?", "turtleButtonState", 0, "클릭했는가"],
			["b", "거북이 %n : %m.tilt ?", "turtleTilt", 0, "앞으로 기울임"],
			["b", "거북이 %n : 배터리 %m.battery ?", "turtleBattery", 0, "정상"]
		],
		ja1: [
			["w", "カメ %n : 前へ移動する", "turtleMoveForward", 0],
			["w", "カメ %n : 後ろへ移動する", "turtleMoveBackward", 0],
			["w", "カメ %n : %m.left_right へ回る", "turtleTurn", 0, "左"],
			["-"],
			[" ", "カメ %n : 頭LEDを %m.led_color にする", "turtleSetHeadLedTo", 0, "赤色"],
			[" ", "カメ %n : 頭LEDをオフにする", "turtleClearHeadLed", 0],
			["-"],
			[" ", "カメ %n : %m.sound 音を再生する", "turtlePlaySound", 0, "ビープ"],
			[" ", "カメ %n : 音をオフにする", "turtleClearSound", 0],
			["-"],
			["h", "カメ %n : %m.touching_color に触れたとき", "turtleWhenColorTouched", 0, "赤色"],
			["h", "カメ %n : ボタンを %m.when_button_state とき", "turtleWhenButtonState", 0, "クリックした"],
			["b", "カメ %n : %m.touching_color に触れたか?", "turtleTouchingColor", 0, "赤色"],
			["b", "カメ %n : ボタンを %m.button_state ?", "turtleButtonState", 0, "クリックしたか"]
		],
		ja2: [
			["w", "カメ %n : 前へ %n %m.cm_sec 移動する", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "カメ %n : 後ろへ %n %m.cm_sec 移動する", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "カメ %n : %m.left_right へ %n %m.deg_sec その場所で回る", "turtleTurnUnitInPlace", 0, "左", 90, "度"],
			["w", "カメ %n : %m.left_right 車輪を中心に %n %m.deg_sec %m.head_tail 方向へ回る", "turtlePivotAroundWheelUnitInDirection", 0, "左", 90, "度", "頭"],
			["w", "カメ %n : %m.left_right へ %n %m.deg_sec 半径 %n cmを %m.head_tail 方向へ回る", "turtleTurnUnitWithRadiusInDirection", 0, "左", 90, "度", 6, "頭"],
			["-"],
			[" ", "カメ %n : 頭LEDを %m.led_color にする", "turtleSetHeadLedTo", 0, "赤色"],
			[" ", "カメ %n : 頭LEDをオフにする", "turtleClearHeadLed", 0],
			["-"],
			[" ", "カメ %n : %m.sound 音を %n 回再生する", "turtlePlaySoundTimes", 0, "ビープ", 1],
			["w", "カメ %n : %m.sound 音を %n 回再生して待つ", "turtlePlaySoundTimesUntilDone", 0, "ビープ", 1],
			[" ", "カメ %n : 音をオフにする", "turtleClearSound", 0],
			["w", "カメ %n : %m.note %m.octave 音を %d.beats 拍子奏でる", "turtlePlayNoteForBeats", 0, "ド", "4", 0.5],
			["w", "カメ %n : %d.beats 拍子止める", "turtleRestForBeats", 0, 0.25],
			[" ", "カメ %n : 演奏の速さを %n ずつ変える", "turtleChangeTempoBy", 0, 20],
			[" ", "カメ %n : 演奏の速さを %n BPMにする", "turtleSetTempoTo", 0, 60],
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
			["w", "カメ %n : 前へ %n %m.move_unit 移動する", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "カメ %n : 後ろへ %n %m.move_unit 移動する", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "カメ %n : %m.left_right へ %n %m.turn_unit その場所で回る", "turtleTurnUnitInPlace", 0, "左", 90, "度"],
			["w", "カメ %n : %m.left_right 車輪を中心に %n %m.turn_unit %m.head_tail 方向へ回る", "turtlePivotAroundWheelUnitInDirection", 0, "左", 90, "度", "頭"],
			["w", "カメ %n : %m.left_right へ %n %m.turn_unit 半径 %n cmを %m.head_tail 方向へ回る", "turtleTurnUnitWithRadiusInDirection", 0, "左", 90, "度", 6, "頭"],
			[" ", "カメ %n : 左車輪を %n 右車輪を %n ずつ変える", "turtleChangeWheelsByLeftRight", 0, 10, 10],
			[" ", "カメ %n : 左車輪を %n 右車輪を %n にする", "turtleSetWheelsToLeftRight", 0, 50, 50],
			[" ", "カメ %n : %m.left_right_both 車輪を %n ずつ変える", "turtleChangeWheelBy", 0, "左", 10],
			[" ", "カメ %n : %m.left_right_both 車輪を %n にする", "turtleSetWheelTo", 0, "左", 50],
			[" ", "カメ %n : %m.line_color 線に沿って移動する", "turtleFollowLine", 0, "黒色"],
			["w", "カメ %n : 黒色線に沿って %m.target_color まで移動する", "turtleFollowLineUntil", 0, "赤色"],
			["w", "カメ %n : %m.color_line 線に沿って黒色まで移動する", "turtleFollowLineUntilBlack", 0, "赤色"],
			["w", "カメ %n : 黒色交差点を渡る", "turtleCrossIntersection", 0],
			["w", "カメ %n : 黒色交差点で %m.left_right_back へ回る", "turtleTurnAtIntersection", 0, "左"],
			[" ", "カメ %n : 線に沿って移動する速さを %m.speed にする", "turtleSetFollowingSpeedTo", 0, "5"],
			[" ", "カメ %n : 停止する", "turtleStop", 0],
			["-"],
			[" ", "カメ %n : 頭LEDを %m.led_color にする", "turtleSetHeadLedTo", 0, "赤色"],
			[" ", "カメ %n : 頭LEDをR: %n G: %n B: %n ずつ変える", "turtleChangeHeadLedByRGB", 0, 10, 0, 0],
			[" ", "カメ %n : 頭LEDをR: %n G: %n B: %n にする", "turtleSetHeadLedToRGB", 0, 255, 0, 0],
			[" ", "カメ %n : 頭LEDをオフにする", "turtleClearHeadLed", 0],
			["-"],
			[" ", "カメ %n : %m.sound 音を %n 回再生する", "turtlePlaySoundTimes", 0, "ビープ", 1],
			["w", "カメ %n : %m.sound 音を %n 回再生して待つ", "turtlePlaySoundTimesUntilDone", 0, "ビープ", 1],
			[" ", "カメ %n : ブザー音を %n ずつ変える", "turtleChangeBuzzerBy", 0, 10],
			[" ", "カメ %n : ブザー音を %n にする", "turtleSetBuzzerTo", 0, 1000],
			[" ", "カメ %n : 音をオフにする", "turtleClearSound", 0],
			[" ", "カメ %n : %m.note %m.octave 音を奏でる", "turtlePlayNote", 0, "ド", "4"],
			["w", "カメ %n : %m.note %m.octave 音を %d.beats 拍子奏でる", "turtlePlayNoteForBeats", 0, "ド", "4", 0.5],
			["w", "カメ %n : %d.beats 拍子止める", "turtleRestForBeats", 0, 0.25],
			[" ", "カメ %n : 演奏の速さを %n ずつ変える", "turtleChangeTempoBy", 0, 20],
			[" ", "カメ %n : 演奏の速さを %n BPMにする", "turtleSetTempoTo", 0, 60],
			["-"],
			["r", "カメ %n : 色番号", "turtleColorNumber", 0],
			["r", "カメ %n : 色パターン", "turtleColorPattern", 0],
			["r", "カメ %n : 床底センサー", "turtleFloor", 0],
			["r", "カメ %n : ボタン", "turtleButton", 0],
			["r", "カメ %n : x軸加速度", "turtleAccelerationX", 0],
			["r", "カメ %n : y軸加速度", "turtleAccelerationY", 0],
			["r", "カメ %n : z軸加速度", "turtleAccelerationZ", 0],
			["h", "カメ %n : %m.touching_color に触れたとき", "turtleWhenColorTouched", 0, "赤色"],
			["h", "カメ %n : 色パターンが %m.pattern_color %m.pattern_color であるとき", "turtleWhenColorPattern", 0, "赤色", "黄色"],
			["h", "カメ %n : ボタンを %m.when_button_state とき", "turtleWhenButtonState", 0, "クリックした"],
			["h", "カメ %n : %m.when_tilt とき", "turtleWhenTilt", 0, "前に傾けた"],
			["b", "カメ %n : %m.touching_color に触れたか?", "turtleTouchingColor", 0, "赤色"],
			["b", "カメ %n : 色パターンが %m.pattern_color %m.pattern_color ですか?", "turtleIsColorPattern", 0, "赤色", "黄色"],
			["b", "カメ %n : ボタンを %m.button_state ?", "turtleButtonState", 0, "クリックしたか"],
			["b", "カメ %n : %m.tilt ?", "turtleTilt", 0, "前に傾けたか"],
			["b", "カメ %n : 電池充電が %m.battery ?", "turtleBattery", 0, "正常か"]
		],
		uz1: [
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
			["w", "Turtle %n : oldinga %n %m.cm_sec yurish", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : orqaga %n %m.cm_sec yurish", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : %m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "turtleTurnUnitInPlace", 0, "chap", 90, "daraja"],
			["w", "Turtle %n : %m.left_right g'ildirak markaziga %n %m.deg_sec %m.head_tail yo'nalishga o'girilish", "turtlePivotAroundWheelUnitInDirection", 0, "chap", 90, "daraja", "bosh"],
			["w", "Turtle %n : %m.left_right ga %n %m.deg_sec radius %n cm %m.head_tail yo'nalishga o'girilish", "turtleTurnUnitWithRadiusInDirection", 0, "chap", 90, "daraja", 6, "bosh"],
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
			["w", "Turtle %n : oldinga %n %m.move_unit yurish", "turtleMoveForwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : orqaga %n %m.move_unit yurish", "turtleMoveBackwardUnit", 0, 6, "cm"],
			["w", "Turtle %n : %m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "turtleTurnUnitInPlace", 0, "chap", 90, "daraja"],
			["w", "Turtle %n : %m.left_right g'ildirak markaziga %n %m.turn_unit %m.head_tail yo'nalishga o'girilish", "turtlePivotAroundWheelUnitInDirection", 0, "chap", 90, "daraja", "bosh"],
			["w", "Turtle %n : %m.left_right ga %n %m.turn_unit radius %n cm %m.head_tail yo'nalishga o'girilish", "turtleTurnUnitWithRadiusInDirection", 0, "chap", 90, "daraja", 6, "bosh"],
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
			["r", "Turtle %n : rang raqami", "turtleColorNumber", 0],
			["r", "Turtle %n : rang naqshi", "turtleColorPattern", 0],
			["r", "Turtle %n : taglik sensori", "turtleFloor", 0],
			["r", "Turtle %n : tugma", "turtleButton", 0],
			["r", "Turtle %n : x tezlanish", "turtleAccelerationX", 0],
			["r", "Turtle %n : y tezlanish", "turtleAccelerationY", 0],
			["r", "Turtle %n : z tezlanish", "turtleAccelerationZ", 0],
			["h", "Turtle %n : %m.touching_color ga tegilganda", "turtleWhenColorTouched", 0, "qizil"],
			["h", "Turtle %n : rang naqshi %m.pattern_color %m.pattern_color bo'lganida", "turtleWhenColorPattern", 0, "qizil", "sariq"],
			["h", "Turtle %n : tugmani %m.when_button_state da", "turtleWhenButtonState", 0, "bosgan"],
			["h", "Turtle %n : %m.when_tilt bo'lganda", "turtleWhenTilt", 0, "oldinga eğin"],
			["b", "Turtle %n : %m.touching_color ga tekkan?", "turtleTouchingColor", 0, "qizil"],
			["b", "Turtle %n : rang naqshi %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", 0, "qizil", "sariq"],
			["b", "Turtle %n : tugmani %m.button_state ?", "turtleButtonState", 0, "bosgan"],
			["b", "Turtle %n : %m.tilt ?", "turtleTilt", 0, "oldinga eğin"],
			["b", "Turtle %n : batareya %m.battery ?", "turtleBattery", 0, "normal"]
		]
	};
	const MENUS = {
		en: {
			"move_unit": ["cm", "seconds", "pulses"],
			"turn_unit": ["degrees", "seconds", "pulses"],
			"cm_sec": ["cm", "seconds"],
			"deg_sec": ["degrees", "seconds"],
			"head_tail": ["head", "tail"],
			"left_right": ["left", "right"],
			"left_right_both": ["left", "right", "both"],
			"left_right_back": ["left", "right", "back"],
			"line_color": ["black", "red", "green", "blue", "any color"],
			"target_color": ["red", "yellow", "green", "sky blue", "blue", "purple", "any color"],
			"color_line": ["red", "green", "blue", "any color"],
			"touching_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "purple", "black", "white"],
			"pattern_color": ["red", "yellow", "green", "sky blue", "blue", "purple"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "violet", "purple", "white"],
			"sound": ["beep", "random beep", "siren", "engine", "robot", "march", "birthday", "dibidibidip", "good job"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["clicked", "double-clicked", "long-pressed"],
			"when_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"button_state": ["clicked", "double-clicked", "long-pressed"],
			"tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"battery": ["normal", "low", "empty"]
		},
		ko: {
			"move_unit": ["cm", "초", "펄스"],
			"turn_unit": ["도", "초", "펄스"],
			"cm_sec": ["cm", "초"],
			"deg_sec": ["도", "초"],
			"head_tail": ["머리", "꼬리"],
			"left_right": ["왼쪽", "오른쪽"],
			"left_right_both": ["왼쪽", "오른쪽", "양쪽"],
			"left_right_back": ["왼쪽", "오른쪽", "뒤쪽"],
			"line_color": ["검은색", "빨간색", "초록색", "파란색", "아무 색"],
			"target_color": ["빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색", "아무 색"],
			"color_line": ["빨간색", "초록색", "파란색", "아무 색"],
			"touching_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "자주색", "검은색", "하얀색"],
			"pattern_color": ["빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"sound": ["삐", "무작위 삐", "사이렌", "엔진", "로봇", "행진", "생일", "디비디비딥", "잘 했어요"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["클릭했을", "더블클릭했을", "길게~눌렀을"],
			"when_tilt": ["앞으로 기울였을", "뒤로 기울였을", "왼쪽으로 기울였을", "오른쪽으로 기울였을", "거꾸로 뒤집었을", "기울이지 않았을"],
			"button_state": ["클릭했는가", "더블클릭했는가", "길게~눌렀는가"],
			"tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "기울이지 않음"],
			"battery": ["정상", "부족", "없음"]
		},
		ja: {
			"move_unit": ["cm", "秒", "パルス"],
			"turn_unit": ["度", "秒", "パルス"],
			"cm_sec": ["cm", "秒"],
			"deg_sec": ["度", "秒"],
			"head_tail": ["頭", "尾"],
			"left_right": ["左", "右"],
			"left_right_both": ["左", "右", "両方"],
			"left_right_back": ["左", "右", "後ろ"],
			"line_color": ["黒色", "赤色", "緑色", "青色", "全ての色"],
			"target_color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色", "全ての色"],
			"color_line": ["赤色", "緑色", "青色", "全ての色"],
			"touching_color": ["赤色", "オレンジ色", "黄色", "緑色", "水色", "青色", "紫色", "黒色", "白色"],
			"pattern_color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["赤色", "オレンジ色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"sound": ["ビープ", "ランダムビープ", "サイレン", "エンジン", "ロボット", "行進", "誕生日", "ディバディバディップ", "よくできました"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["クリックした", "ダブルクリックした", "長く押した"],
			"when_tilt": ["前に傾けた", "後ろに傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾いてなかった"],
			"button_state": ["クリックしたか", "ダブルクリックしたか", "長く押したか"],
			"tilt": ["前に傾けたか", "後ろに傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾いてないか"],
			"battery": ["正常か", "不足しているか", "なくなったか"]
		},
		uz: {
			"move_unit": ["cm", "soniya", "puls"],
			"turn_unit": ["daraja", "soniya", "puls"],
			"cm_sec": ["cm", "soniya"],
			"deg_sec": ["daraja", "soniya"],
			"head_tail": ["bosh", "dum"],
			"left_right": ["chap", "o'ng"],
			"left_right_both": ["chap", "o'ng", "har ikki"],
			"left_right_back": ["chap", "o'ng", "orqa"],
			"line_color": ["qora", "qizil", "yashil", "ko'k", "har qanday rang"],
			"target_color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh", "har qanday rang"],
			"color_line": ["qizil", "yashil", "ko'k", "har qanday rang"],
			"touching_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "siyoh", "qora", "oq"],
			"pattern_color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "binafsha", "siyoh", "oq"],
			"sound": ["qisqa", "tasodifiy qisqa", "sirena", "motor", "robot", "marsh", "tug'ilgan kun", "dibidibidip", "juda yaxshi"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["bosgan", "ikki-marta-bosgan", "uzoq-bosganmi"],
			"when_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q"],
			"button_state": ["bosgan", "ikki-marta-bosgan", "uzoq-bosganmi"],
			"tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q"],
			"battery": ["normal", "past", "bo'sh"]
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
	var LINE_COLORS = {};
	var RGB_COLORS = {};
	var COLOR_NUMBERS = {};
	var COLOR_PATTERNS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var SOUNDS = {};
	var BUTTON_STATES = {};
	var TILTS = {};
	var BATTERY_STATES = {};
	
	const LEFT = 1;
	const RIGHT = 2;
	const BACK = 5;
	const HEAD = 1;
	const SECONDS = 2;
	const CLICKED = 1;
	const DOUBLE_CLICKED = 2;
	const LONG_PRESSED = 3;
	const TILT_FORWARD = 1;
	const TILT_BACKWARD = 2;
	const TILT_LEFT = 3;
	const TILT_RIGHT = 4;
	const TILT_FLIP = 5;
	const TILT_NONE = 6;
	
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['left_right_both'];
		PARTS[tmp[0]] = LEFT;
		PARTS[tmp[1]] = RIGHT;
		tmp = MENUS[i]['left_right_back'];
		DIRECTIONS[tmp[0]] = LEFT;
		DIRECTIONS[tmp[1]] = RIGHT;
		DIRECTIONS[tmp[2]] = BACK;
		tmp = MENUS[i]['head_tail'];
		TOWARDS[tmp[0]] = HEAD;
		tmp = MENUS[i]['move_unit'];
		UNITS[tmp[0]] = 1; // cm
		UNITS[tmp[1]] = 2; // sec
		UNITS[tmp[2]] = 3; // pulse
		tmp = MENUS[i]['turn_unit'];
		UNITS[tmp[0]] = 1; // deg
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
		tmp = MENUS[i]['tilt'];
		TILTS[tmp[0]] = TILT_FORWARD;
		TILTS[tmp[1]] = TILT_BACKWARD;
		TILTS[tmp[2]] = TILT_LEFT;
		TILTS[tmp[3]] = TILT_RIGHT;
		TILTS[tmp[4]] = TILT_FLIP;
		TILTS[tmp[5]] = TILT_NONE;
		tmp = MENUS[i]['when_tilt'];
		TILTS[tmp[0]] = TILT_FORWARD;
		TILTS[tmp[1]] = TILT_BACKWARD;
		TILTS[tmp[2]] = TILT_LEFT;
		TILTS[tmp[3]] = TILT_RIGHT;
		TILTS[tmp[4]] = TILT_FLIP;
		TILTS[tmp[5]] = TILT_NONE;
		tmp = MENUS[i]['battery'];
		BATTERY_STATES[tmp[0]] = 2;
		BATTERY_STATES[tmp[1]] = 1;
		BATTERY_STATES[tmp[2]] = 0;
		tmp = MENUS[i]['button_state'];
		BUTTON_STATES[tmp[0]] = CLICKED;
		BUTTON_STATES[tmp[1]] = DOUBLE_CLICKED;
		BUTTON_STATES[tmp[2]] = LONG_PRESSED;
		tmp = MENUS[i]['when_button_state'];
		BUTTON_STATES[tmp[0]] = CLICKED;
		BUTTON_STATES[tmp[1]] = DOUBLE_CLICKED;
		BUTTON_STATES[tmp[2]] = LONG_PRESSED;
	}

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
		if(value < 0) this.__motionUnit(2, UNITS[unit], -value, callback);
		else this.__motionUnit(1, UNITS[unit], value, callback);
	};

	Turtle.prototype.moveBackwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(1, UNITS[unit], -value, callback);
		else this.__motionUnit(2, UNITS[unit], value, callback);
	};

	Turtle.prototype.turnUnit = function(direction, value, unit, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			if(value < 0) this.__motionUnit(4, UNITS[unit], -value, callback);
			else this.__motionUnit(3, UNITS[unit], value, callback);
		} else {
			if(value < 0) this.__motionUnit(3, UNITS[unit], -value, callback);
			else this.__motionUnit(4, UNITS[unit], value, callback);
		}
	};

	Turtle.prototype.pivotUnit = function(wheel, value, unit, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[wheel] == LEFT) {
			if(TOWARDS[toward] == HEAD) {
				if(value < 0) this.__motionUnit(6, unit, -value, callback);
				else this.__motionUnit(5, unit, value, callback);
			} else {
				if(value < 0) this.__motionUnit(5, unit, -value, callback);
				else this.__motionUnit(6, unit, value, callback);
			}
		} else {
			if(TOWARDS[toward] == HEAD) {
				if(value < 0) this.__motionUnit(8, unit, -value, callback);
				else this.__motionUnit(7, unit, value, callback);
			} else {
				if(value < 0) this.__motionUnit(7, unit, -value, callback);
				else this.__motionUnit(8, unit, value, callback);
			}
		}
	};

	Turtle.prototype.swingUnit = function(direction, value, unit, radius, toward, callback) {
		unit = UNITS[unit];
		if(DIRECTIONS[direction] == LEFT) {
			if(TOWARDS[toward] == HEAD) {
				if(value < 0) this.__motionUnitRadius(10, unit, -value, radius, callback);
				else this.__motionUnitRadius(9, unit, value, radius, callback);
			} else {
				if(value < 0) this.__motionUnitRadius(9, unit, -value, radius, callback);
				else this.__motionUnitRadius(10, unit, value, radius, callback);
			}
		} else {
			if(TOWARDS[toward] == HEAD) {
				if(value < 0) this.__motionUnitRadius(12, unit, -value, radius, callback);
				else this.__motionUnitRadius(11, unit, value, radius, callback);
			} else {
				if(value < 0) this.__motionUnitRadius(11, unit, -value, radius, callback);
				else this.__motionUnitRadius(12, unit, value, radius, callback);
			}
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
	
	ext.turtlePivotAroundWheelUnitInDirection = function(index, wheel, value, unit, head, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.pivotUnit(wheel, value, unit, head, callback);
	};
	
	ext.turtleTurnUnitWithRadiusInDirection = function(index, direction, value, unit, radius, head, callback) {
		var robot = getRobot(TURTLE, index);
		if(robot) robot.swingUnit(direction, value, unit, radius, head, callback);
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
