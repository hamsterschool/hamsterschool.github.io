(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const LINE = 'line';
	const BROWN = 'brown';
	const SALLY = 'sally';
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
			["w", "Sally %n : move forward", "sallyMoveForward", 0],
			["w", "Sally %n : move backward", "sallyMoveBackward", 0],
			["w", "Sally %n : turn %m.left_right", "sallyTurn", 0, "left"],
			["-"],
			[" ", "Sally %n : set led to %m.led_color", "sallySetLedTo", 0, "red"],
			[" ", "Sally %n : clear led", "sallyClearLed", 0],
			["-"],
			[" ", "Sally %n : play sound %m.sound_effect", "sallyPlaySound", 0, "beep"],
			[" ", "Sally %n : clear sound", "sallyClearSound", 0],
			["-"],
			["h", "Sally %n : when %m.touching_color touched", "sallyWhenColorTouched", 0, "red"],
			["h", "Sally %n : when button %m.when_button_state", "sallyWhenButtonState", 0, "clicked"],
			["b", "Sally %n : touching %m.touching_color ?", "sallyTouchingColor", 0, "red"],
			["b", "Sally %n : button %m.button_state ?", "sallyButtonState", 0, "clicked"]
		],
		en2: [
			["w", "Sally %n : move forward %n %m.cm_sec", "sallyMoveForwardUnit", 0, 6, "cm"],
			["w", "Sally %n : move backward %n %m.cm_sec", "sallyMoveBackwardUnit", 0, 6, "cm"],
			["w", "Sally %n : turn %m.left_right %n %m.deg_sec in place", "sallyTurnUnitInPlace", 0, "left", 90, "degrees"],
			["w", "Sally %n : pivot around %m.left_right wheel %n %m.deg_sec in %m.forward_backward direction", "sallyPivotAroundWheelUnitInDirection", 0, "left", 90, "degrees", "forward"],
			["w", "Sally %n : turn %m.left_right %n %m.deg_sec with radius %n cm in %m.forward_backward direction", "sallyTurnUnitWithRadiusInDirection", 0, "left", 90, "degrees", 3, "forward"],
			["-"],
			[" ", "Sally %n : set led to %m.led_color", "sallySetLedTo", 0, "red"],
			[" ", "Sally %n : clear led", "sallyClearLed", 0],
			["-"],
			[" ", "Sally %n : play sound %m.sound_effect %n times", "sallyPlaySoundTimes", 0, "beep", 1],
			["w", "Sally %n : play sound %m.sound_effect %n times until done", "sallyPlaySoundTimesUntilDone", 0, "beep", 1],
			[" ", "Sally %n : clear sound", "sallyClearSound", 0],
			["w", "Sally %n : play note %m.note %m.octave for %d.beats beats", "sallyPlayNoteForBeats", 0, "C", "4", 0.5],
			["w", "Sally %n : rest for %d.beats beats", "sallyRestForBeats", 0, 0.25],
			[" ", "Sally %n : change tempo by %n", "sallyChangeTempoBy", 0, 20],
			[" ", "Sally %n : set tempo to %n bpm", "sallySetTempoTo", 0, 60],
			["-"],
			["h", "Sally %n : when %m.touching_color touched", "sallyWhenColorTouched", 0, "red"],
			["h", "Sally %n : when color pattern is %m.pattern_color_black %m.pattern_color_black", "sallyWhenColorPattern", 0, "black", "red"],
			["h", "Sally %n : when button %m.when_button_state", "sallyWhenButtonState", 0, "clicked"],
			["h", "Sally %n : when %m.when_s_tilt", "sallyWhenTilt", 0, "tilt forward"],
			["b", "Sally %n : touching %m.touching_color ?", "sallyTouchingColor", 0, "red"],
			["b", "Sally %n : color pattern %m.pattern_color_black %m.pattern_color_black ?", "sallyIsColorPattern", 0, "black", "red"],
			["b", "Sally %n : button %m.button_state ?", "sallyButtonState", 0, "clicked"],
			["b", "Sally %n : %m.s_tilt ?", "sallyTilt", 0, "tilt forward"]
		],
		en3: [
			["w", "Sally %n : move forward %n %m.move_unit", "sallyMoveForwardUnit", 0, 6, "cm"],
			["w", "Sally %n : move backward %n %m.move_unit", "sallyMoveBackwardUnit", 0, 6, "cm"],
			["w", "Sally %n : turn %m.left_right %n %m.turn_unit in place", "sallyTurnUnitInPlace", 0, "left", 90, "degrees"],
			["w", "Sally %n : pivot around %m.left_right wheel %n %m.turn_unit in %m.forward_backward direction", "sallyPivotAroundWheelUnitInDirection", 0, "left", 90, "degrees", "forward"],
			["w", "Sally %n : turn %m.left_right %n %m.turn_unit with radius %n cm in %m.forward_backward direction", "sallyTurnUnitWithRadiusInDirection", 0, "left", 90, "degrees", 3, "forward"],
			[" ", "Sally %n : change wheels by left: %n right: %n", "sallyChangeWheelsByLeftRight", 0, 10, 10],
			[" ", "Sally %n : set wheels to left: %n right: %n", "sallySetWheelsToLeftRight", 0, 40, 40],
			[" ", "Sally %n : change %m.left_right_both wheel by %n", "sallyChangeWheelBy", 0, "left", 10],
			[" ", "Sally %n : set %m.left_right_both wheel to %n", "sallySetWheelTo", 0, "left", 40],
			[" ", "Sally %n : follow line", "sallyFollowLine", 0],
			["w", "Sally %n : follow line until %m.target_color", "sallyFollowLineUntil", 0, "red"],
			["w", "Sally %n : cross intersection", "sallyCrossIntersection", 0],
			["w", "Sally %n : turn %m.left_right_back at intersection", "sallyTurnAtIntersection", 0, "left"],
			["w", "Sally %n : jump to %m.left_right line", "sallyJumpLine", 0, "left"],
			[" ", "Sally %n : set following speed to %m.speed", "sallySetFollowingSpeedTo", 0, "4"],
			[" ", "Sally %n : stop", "sallyStop", 0],
			["-"],
			[" ", "Sally %n : set led to %m.led_color", "sallySetLedTo", 0, "red"],
			[" ", "Sally %n : change led by r: %n g: %n b: %n", "sallyChangeLedByRGB", 0, 10, 0, 0],
			[" ", "Sally %n : set led to r: %n g: %n b: %n", "sallySetLedToRGB", 0, 255, 0, 0],
			[" ", "Sally %n : clear led", "sallyClearLed", 0],
			["-"],
			[" ", "Sally %n : play sound %m.sound_effect %n times", "sallyPlaySoundTimes", 0, "beep", 1],
			["w", "Sally %n : play sound %m.sound_effect %n times until done", "sallyPlaySoundTimesUntilDone", 0, "beep", 1],
			[" ", "Sally %n : change buzzer by %n", "sallyChangeBuzzerBy", 0, 10],
			[" ", "Sally %n : set buzzer to %n", "sallySetBuzzerTo", 0, 1000],
			[" ", "Sally %n : clear sound", "sallyClearSound", 0],
			[" ", "Sally %n : play note %m.note %m.octave", "sallyPlayNote", 0, "C", "4"],
			["w", "Sally %n : play note %m.note %m.octave for %d.beats beats", "sallyPlayNoteForBeats", 0, "C", "4", 0.5],
			["w", "Sally %n : rest for %d.beats beats", "sallyRestForBeats", 0, 0.25],
			[" ", "Sally %n : change tempo by %n", "sallyChangeTempoBy", 0, 20],
			[" ", "Sally %n : set tempo to %n bpm", "sallySetTempoTo", 0, 60],
			["-"],
			["r", "Sally %n : color number", "sallyColorNumber", 0],
			["r", "Sally %n : color pattern", "sallyColorPattern", 0],
			["r", "Sally %n : color r", "sallyColorRed", 0],
			["r", "Sally %n : color g", "sallyColorGreen", 0],
			["r", "Sally %n : color b", "sallyColorBlue", 0],
			["r", "Sally %n : floor", "sallyFloor", 0],
			["r", "Sally %n : button", "sallyButton", 0],
			["r", "Sally %n : x acceleration", "sallyAccelerationX", 0],
			["r", "Sally %n : y acceleration", "sallyAccelerationY", 0],
			["r", "Sally %n : z acceleration", "sallyAccelerationZ", 0],
			["r", "Sally %n : temperature", "sallyTemperature", 0],
			["r", "Sally %n : signal strength", "sallySignalStrength", 0],
			["h", "Sally %n : when %m.touching_color touched", "sallyWhenColorTouched", 0, "red"],
			["h", "Sally %n : when color pattern is %m.pattern_color_black %m.pattern_color_black", "sallyWhenColorPattern", 0, "black", "red"],
			["h", "Sally %n : when button %m.when_button_state", "sallyWhenButtonState", 0, "clicked"],
			["h", "Sally %n : when %m.when_s_tilt", "sallyWhenTilt", 0, "tilt forward"],
			["b", "Sally %n : touching %m.touching_color ?", "sallyTouchingColor", 0, "red"],
			["b", "Sally %n : color pattern %m.pattern_color_black %m.pattern_color_black ?", "sallyIsColorPattern", 0, "black", "red"],
			["b", "Sally %n : button %m.button_state ?", "sallyButtonState", 0, "clicked"],
			["b", "Sally %n : %m.s_tilt ?", "sallyTilt", 0, "tilt forward"],
			["b", "Sally %n : battery %m.battery ?", "sallyBattery", 0, "normal"]
		],
		ko1: [
			["w", "샐리 %n : 앞으로 이동하기", "sallyMoveForward", 0],
			["w", "샐리 %n : 뒤로 이동하기", "sallyMoveBackward", 0],
			["w", "샐리 %n : %m.left_right 으로 돌기", "sallyTurn", 0, "왼쪽"],
			["-"],
			[" ", "샐리 %n : LED를 %m.led_color 으로 정하기", "sallySetLedTo", 0, "빨간색"],
			[" ", "샐리 %n : LED 끄기", "sallyClearLed", 0],
			["-"],
			[" ", "샐리 %n : %m.sound_effect 소리 재생하기", "sallyPlaySound", 0, "삐"],
			[" ", "샐리 %n : 소리 끄기", "sallyClearSound", 0],
			["-"],
			["h", "샐리 %n : %m.touching_color 에 닿았을 때", "sallyWhenColorTouched", 0, "빨간색"],
			["h", "샐리 %n : 버튼을 %m.when_button_state 때", "sallyWhenButtonState", 0, "클릭했을"],
			["b", "샐리 %n : %m.touching_color 에 닿았는가?", "sallyTouchingColor", 0, "빨간색"],
			["b", "샐리 %n : 버튼을 %m.button_state ?", "sallyButtonState", 0, "클릭했는가"]
		],
		ko2: [
			["w", "샐리 %n : 앞으로 %n %m.cm_sec 이동하기", "sallyMoveForwardUnit", 0, 6, "cm"],
			["w", "샐리 %n : 뒤로 %n %m.cm_sec 이동하기", "sallyMoveBackwardUnit", 0, 6, "cm"],
			["w", "샐리 %n : %m.left_right 으로 %n %m.deg_sec 제자리 돌기", "sallyTurnUnitInPlace", 0, "왼쪽", 90, "도"],
			["w", "샐리 %n : %m.left_right 바퀴 중심으로 %n %m.deg_sec %m.forward_backward 방향으로 돌기", "sallyPivotAroundWheelUnitInDirection", 0, "왼쪽", 90, "도", "앞쪽"],
			["w", "샐리 %n : %m.left_right 으로 %n %m.deg_sec 반지름 %n cm를 %m.forward_backward 방향으로 돌기", "sallyTurnUnitWithRadiusInDirection", 0, "왼쪽", 90, "도", 3, "앞쪽"],
			["-"],
			[" ", "샐리 %n : LED를 %m.led_color 으로 정하기", "sallySetLedTo", 0, "빨간색"],
			[" ", "샐리 %n : LED 끄기", "sallyClearLed", 0],
			["-"],
			[" ", "샐리 %n : %m.sound_effect 소리 %n 번 재생하기", "sallyPlaySoundTimes", 0, "삐", 1],
			["w", "샐리 %n : %m.sound_effect 소리 %n 번 재생하고 기다리기", "sallyPlaySoundTimesUntilDone", 0, "삐", 1],
			[" ", "샐리 %n : 소리 끄기", "sallyClearSound", 0],
			["w", "샐리 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기", "sallyPlayNoteForBeats", 0, "도", "4", 0.5],
			["w", "샐리 %n : %d.beats 박자 쉬기", "sallyRestForBeats", 0, 0.25],
			[" ", "샐리 %n : 연주 속도를 %n 만큼 바꾸기", "sallyChangeTempoBy", 0, 20],
			[" ", "샐리 %n : 연주 속도를 %n BPM으로 정하기", "sallySetTempoTo", 0, 60],
			["-"],
			["h", "샐리 %n : %m.touching_color 에 닿았을 때", "sallyWhenColorTouched", 0, "빨간색"],
			["h", "샐리 %n : 색깔 패턴이 %m.pattern_color_black %m.pattern_color_black 일 때", "sallyWhenColorPattern", 0, "검은색", "빨간색"],
			["h", "샐리 %n : 버튼을 %m.when_button_state 때", "sallyWhenButtonState", 0, "클릭했을"],
			["h", "샐리 %n : %m.when_s_tilt 때", "sallyWhenTilt", 0, "앞으로 기울였을"],
			["b", "샐리 %n : %m.touching_color 에 닿았는가?", "sallyTouchingColor", 0, "빨간색"],
			["b", "샐리 %n : 색깔 패턴이 %m.pattern_color_black %m.pattern_color_black 인가?", "sallyIsColorPattern", 0, "검은색", "빨간색"],
			["b", "샐리 %n : 버튼을 %m.button_state ?", "sallyButtonState", 0, "클릭했는가"],
			["b", "샐리 %n : %m.s_tilt ?", "sallyTilt", 0, "앞으로 기울임"]
		],
		ko3: [
			["w", "샐리 %n : 앞으로 %n %m.move_unit 이동하기", "sallyMoveForwardUnit", 0, 6, "cm"],
			["w", "샐리 %n : 뒤로 %n %m.move_unit 이동하기", "sallyMoveBackwardUnit", 0, 6, "cm"],
			["w", "샐리 %n : %m.left_right 으로 %n %m.turn_unit 제자리 돌기", "sallyTurnUnitInPlace", 0, "왼쪽", 90, "도"],
			["w", "샐리 %n : %m.left_right 바퀴 중심으로 %n %m.turn_unit %m.forward_backward 방향으로 돌기", "sallyPivotAroundWheelUnitInDirection", 0, "왼쪽", 90, "도", "앞쪽"],
			["w", "샐리 %n : %m.left_right 으로 %n %m.turn_unit 반지름 %n cm를 %m.forward_backward 방향으로 돌기", "sallyTurnUnitWithRadiusInDirection", 0, "왼쪽", 90, "도", 3, "앞쪽"],
			[" ", "샐리 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "sallyChangeWheelsByLeftRight", 0, 10, 10],
			[" ", "샐리 %n : 왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "sallySetWheelsToLeftRight", 0, 40, 40],
			[" ", "샐리 %n : %m.left_right_both 바퀴 %n 만큼 바꾸기", "sallyChangeWheelBy", 0, "왼쪽", 10],
			[" ", "샐리 %n : %m.left_right_both 바퀴 %n (으)로 정하기", "sallySetWheelTo", 0, "왼쪽", 40],
			[" ", "샐리 %n : 선 따라가기", "sallyFollowLine", 0],
			["w", "샐리 %n : 선을 따라 %m.target_color 까지 이동하기", "sallyFollowLineUntil", 0, "빨간색"],
			["w", "샐리 %n : 교차로 건너가기", "sallyCrossIntersection", 0],
			["w", "샐리 %n : 교차로에서 %m.left_right_back 으로 돌기", "sallyTurnAtIntersection", 0, "왼쪽"],
			["w", "샐리 %n : %m.left_right 선으로 건너가기", "sallyJumpLine", 0, "왼쪽"],
			[" ", "샐리 %n : 선 따라가기 속도를 %m.speed (으)로 정하기", "sallySetFollowingSpeedTo", 0, "4"],
			[" ", "샐리 %n : 정지하기", "sallyStop", 0],
			["-"],
			[" ", "샐리 %n : LED를 %m.led_color 으로 정하기", "sallySetLedTo", 0, "빨간색"],
			[" ", "샐리 %n : LED를 R: %n G: %n B: %n 만큼 바꾸기", "sallyChangeLedByRGB", 0, 10, 0, 0],
			[" ", "샐리 %n : LED를 R: %n G: %n B: %n (으)로 정하기", "sallySetLedToRGB", 0, 255, 0, 0],
			[" ", "샐리 %n : LED 끄기", "sallyClearLed", 0],
			["-"],
			[" ", "샐리 %n : %m.sound_effect 소리 %n 번 재생하기", "sallyPlaySoundTimes", 0, "삐", 1],
			["w", "샐리 %n : %m.sound_effect 소리 %n 번 재생하고 기다리기", "sallyPlaySoundTimesUntilDone", 0, "삐", 1],
			[" ", "샐리 %n : 버저 음을 %n 만큼 바꾸기", "sallyChangeBuzzerBy", 0, 10],
			[" ", "샐리 %n : 버저 음을 %n (으)로 정하기", "sallySetBuzzerTo", 0, 1000],
			[" ", "샐리 %n : 소리 끄기", "sallyClearSound", 0],
			[" ", "샐리 %n : %m.note %m.octave 음을 연주하기", "sallyPlayNote", 0, "도", "4"],
			["w", "샐리 %n : %m.note %m.octave 음을 %d.beats 박자 연주하기", "sallyPlayNoteForBeats", 0, "도", "4", 0.5],
			["w", "샐리 %n : %d.beats 박자 쉬기", "sallyRestForBeats", 0, 0.25],
			[" ", "샐리 %n : 연주 속도를 %n 만큼 바꾸기", "sallyChangeTempoBy", 0, 20],
			[" ", "샐리 %n : 연주 속도를 %n BPM으로 정하기", "sallySetTempoTo", 0, 60],
			["-"],
			["r", "샐리 %n : 색깔 번호", "sallyColorNumber", 0],
			["r", "샐리 %n : 색깔 패턴", "sallyColorPattern", 0],
			["r", "샐리 %n : 색깔 R", "sallyColorRed", 0],
			["r", "샐리 %n : 색깔 G", "sallyColorGreen", 0],
			["r", "샐리 %n : 색깔 B", "sallyColorBlue", 0],
			["r", "샐리 %n : 바닥 센서", "sallyFloor", 0],
			["r", "샐리 %n : 버튼", "sallyButton", 0],
			["r", "샐리 %n : x축 가속도", "sallyAccelerationX", 0],
			["r", "샐리 %n : y축 가속도", "sallyAccelerationY", 0],
			["r", "샐리 %n : z축 가속도", "sallyAccelerationZ", 0],
			["r", "샐리 %n : 온도", "sallyTemperature", 0],
			["r", "샐리 %n : 신호 세기", "sallySignalStrength", 0],
			["h", "샐리 %n : %m.touching_color 에 닿았을 때", "sallyWhenColorTouched", 0, "빨간색"],
			["h", "샐리 %n : 색깔 패턴이 %m.pattern_color_black %m.pattern_color_black 일 때", "sallyWhenColorPattern", 0, "검은색", "빨간색"],
			["h", "샐리 %n : 버튼을 %m.when_button_state 때", "sallyWhenButtonState", 0, "클릭했을"],
			["h", "샐리 %n : %m.when_s_tilt 때", "sallyWhenTilt", 0, "앞으로 기울였을"],
			["b", "샐리 %n : %m.touching_color 에 닿았는가?", "sallyTouchingColor", 0, "빨간색"],
			["b", "샐리 %n : 색깔 패턴이 %m.pattern_color_black %m.pattern_color_black 인가?", "sallyIsColorPattern", 0, "검은색", "빨간색"],
			["b", "샐리 %n : 버튼을 %m.button_state ?", "sallyButtonState", 0, "클릭했는가"],
			["b", "샐리 %n : %m.s_tilt ?", "sallyTilt", 0, "앞으로 기울임"],
			["b", "샐리 %n : 배터리 %m.battery ?", "sallyBattery", 0, "정상"]
		],
		ja1: [
			["w", "サリー %n : 前へ移動する", "sallyMoveForward", 0],
			["w", "サリー %n : 後ろへ移動する", "sallyMoveBackward", 0],
			["w", "サリー %n : %m.left_right へ回す", "sallyTurn", 0, "左"],
			["-"],
			[" ", "サリー %n : LEDを %m.led_color にする", "sallySetLedTo", 0, "赤色"],
			[" ", "サリー %n : LEDを消す", "sallyClearLed", 0],
			["-"],
			[" ", "サリー %n : %m.sound_effect 音を鳴らす", "sallyPlaySound", 0, "ビープ"],
			[" ", "サリー %n : 音を消す", "sallyClearSound", 0],
			["-"],
			["h", "サリー %n : %m.touching_color に触れたとき", "sallyWhenColorTouched", 0, "赤色"],
			["h", "サリー %n : ボタンを %m.when_button_state とき", "sallyWhenButtonState", 0, "クリックした"],
			["b", "サリー %n : %m.touching_color に触れたか?", "sallyTouchingColor", 0, "赤色"],
			["b", "サリー %n : ボタンを %m.button_state ?", "sallyButtonState", 0, "クリックしたか"]
		],
		ja2: [
			["w", "サリー %n : 前へ %n %m.cm_sec 移動する", "sallyMoveForwardUnit", 0, 6, "cm"],
			["w", "サリー %n : 後ろへ %n %m.cm_sec 移動する", "sallyMoveBackwardUnit", 0, 6, "cm"],
			["w", "サリー %n : %m.left_right へ %n %m.deg_sec その場で回す", "sallyTurnUnitInPlace", 0, "左", 90, "度"],
			["w", "サリー %n : %m.left_right 車輪を中心に %n %m.deg_sec %m.forward_backward 方向へ回す", "sallyPivotAroundWheelUnitInDirection", 0, "左", 90, "度", "前"],
			["w", "サリー %n : %m.left_right へ %n %m.deg_sec 半径 %n cmを %m.forward_backward 方向へ回す", "sallyTurnUnitWithRadiusInDirection", 0, "左", 90, "度", 3, "前"],
			["-"],
			[" ", "サリー %n : LEDを %m.led_color にする", "sallySetLedTo", 0, "赤色"],
			[" ", "サリー %n : LEDを消す", "sallyClearLed", 0],
			["-"],
			[" ", "サリー %n : %m.sound_effect 音を %n 回鳴らす", "sallyPlaySoundTimes", 0, "ビープ", 1],
			["w", "サリー %n : 終わるまで %m.sound_effect 音を %n 回鳴らす", "sallyPlaySoundTimesUntilDone", 0, "ビープ", 1],
			[" ", "サリー %n : 音を消す", "sallyClearSound", 0],
			["w", "サリー %n : %m.note %m.octave 音を %d.beats 拍鳴らす", "sallyPlayNoteForBeats", 0, "ド", "4", 0.5],
			["w", "サリー %n : %d.beats 拍休む", "sallyRestForBeats", 0, 0.25],
			[" ", "サリー %n : テンポを %n ずつ変える", "sallyChangeTempoBy", 0, 20],
			[" ", "サリー %n : テンポを %n BPMにする", "sallySetTempoTo", 0, 60],
			["-"],
			["h", "サリー %n : %m.touching_color に触れたとき", "sallyWhenColorTouched", 0, "赤色"],
			["h", "サリー %n : 色パターンが %m.pattern_color_black %m.pattern_color_black であるとき", "sallyWhenColorPattern", 0, "黒色", "赤色"],
			["h", "サリー %n : ボタンを %m.when_button_state とき", "sallyWhenButtonState", 0, "クリックした"],
			["h", "サリー %n : %m.when_s_tilt とき", "sallyWhenTilt", 0, "前に傾けた"],
			["b", "サリー %n : %m.touching_color に触れたか?", "sallyTouchingColor", 0, "赤色"],
			["b", "サリー %n : 色パターンが %m.pattern_color_black %m.pattern_color_black ですか?", "sallyIsColorPattern", 0, "黒色", "赤色"],
			["b", "サリー %n : ボタンを %m.button_state ?", "sallyButtonState", 0, "クリックしたか"],
			["b", "サリー %n : %m.s_tilt ?", "sallyTilt", 0, "前に傾けたか"]
		],
		ja3: [
			["w", "サリー %n : 前へ %n %m.move_unit 移動する", "sallyMoveForwardUnit", 0, 6, "cm"],
			["w", "サリー %n : 後ろへ %n %m.move_unit 移動する", "sallyMoveBackwardUnit", 0, 6, "cm"],
			["w", "サリー %n : %m.left_right へ %n %m.turn_unit その場で回す", "sallyTurnUnitInPlace", 0, "左", 90, "度"],
			["w", "サリー %n : %m.left_right 車輪を中心に %n %m.turn_unit %m.forward_backward 方向へ回す", "sallyPivotAroundWheelUnitInDirection", 0, "左", 90, "度", "前"],
			["w", "サリー %n : %m.left_right へ %n %m.turn_unit 半径 %n cmを %m.forward_backward 方向へ回す", "sallyTurnUnitWithRadiusInDirection", 0, "左", 90, "度", 3, "前"],
			[" ", "サリー %n : 左車輪を %n 右車輪を %n ずつ変える", "sallyChangeWheelsByLeftRight", 0, 10, 10],
			[" ", "サリー %n : 左車輪を %n 右車輪を %n にする", "sallySetWheelsToLeftRight", 0, 40, 40],
			[" ", "サリー %n : %m.left_right_both 車輪を %n ずつ変える", "sallyChangeWheelBy", 0, "左", 10],
			[" ", "サリー %n : %m.left_right_both 車輪を %n にする", "sallySetWheelTo", 0, "左", 40],
			[" ", "サリー %n : 線を追従する", "sallyFollowLine", 0],
			["w", "サリー %n : 線を追従して %m.target_color まで移動する", "sallyFollowLineUntil", 0, "赤色"],
			["w", "サリー %n : 交差点を渡る", "sallyCrossIntersection", 0],
			["w", "サリー %n : 交差点で %m.left_right_back へ回す", "sallyTurnAtIntersection", 0, "左"],
			["w", "サリー %n : %m.left_right 線へ渡り行く", "sallyJumpLine", 0, "左"],
			[" ", "サリー %n : 線を追従する速度を %m.speed にする", "sallySetFollowingSpeedTo", 0, "4"],
			[" ", "サリー %n : 停止する", "sallyStop", 0],
			["-"],
			[" ", "サリー %n : LEDを %m.led_color にする", "sallySetLedTo", 0, "赤色"],
			[" ", "サリー %n : LEDをR: %n G: %n B: %n ずつ変える", "sallyChangeLedByRGB", 0, 10, 0, 0],
			[" ", "サリー %n : LEDをR: %n G: %n B: %n にする", "sallySetLedToRGB", 0, 255, 0, 0],
			[" ", "サリー %n : LEDを消す", "sallyClearLed", 0],
			["-"],
			[" ", "サリー %n : %m.sound_effect 音を %n 回鳴らす", "sallyPlaySoundTimes", 0, "ビープ", 1],
			["w", "サリー %n : 終わるまで %m.sound_effect 音を %n 回鳴らす", "sallyPlaySoundTimesUntilDone", 0, "ビープ", 1],
			[" ", "サリー %n : ブザー音を %n ずつ変える", "sallyChangeBuzzerBy", 0, 10],
			[" ", "サリー %n : ブザー音を %n にする", "sallySetBuzzerTo", 0, 1000],
			[" ", "サリー %n : 音を消す", "sallyClearSound", 0],
			[" ", "サリー %n : %m.note %m.octave 音を鳴らす", "sallyPlayNote", 0, "ド", "4"],
			["w", "サリー %n : %m.note %m.octave 音を %d.beats 拍鳴らす", "sallyPlayNoteForBeats", 0, "ド", "4", 0.5],
			["w", "サリー %n : %d.beats 拍休む", "sallyRestForBeats", 0, 0.25],
			[" ", "サリー %n : テンポを %n ずつ変える", "sallyChangeTempoBy", 0, 20],
			[" ", "サリー %n : テンポを %n BPMにする", "sallySetTempoTo", 0, 60],
			["-"],
			["r", "サリー %n : 色番号", "sallyColorNumber", 0],
			["r", "サリー %n : 色パターン", "sallyColorPattern", 0],
			["r", "サリー %n : 色R", "sallyColorRed", 0],
			["r", "サリー %n : 色G", "sallyColorGreen", 0],
			["r", "サリー %n : 色B", "sallyColorBlue", 0],
			["r", "サリー %n : フロアセンサー", "sallyFloor", 0],
			["r", "サリー %n : ボタン", "sallyButton", 0],
			["r", "サリー %n : x軸加速度", "sallyAccelerationX", 0],
			["r", "サリー %n : y軸加速度", "sallyAccelerationY", 0],
			["r", "サリー %n : z軸加速度", "sallyAccelerationZ", 0],
			["r", "サリー %n : 温度", "sallyTemperature", 0],
			["r", "サリー %n : 信号強度", "sallySignalStrength", 0],
			["h", "サリー %n : %m.touching_color に触れたとき", "sallyWhenColorTouched", 0, "赤色"],
			["h", "サリー %n : 色パターンが %m.pattern_color_black %m.pattern_color_black であるとき", "sallyWhenColorPattern", 0, "黒色", "赤色"],
			["h", "サリー %n : ボタンを %m.when_button_state とき", "sallyWhenButtonState", 0, "クリックした"],
			["h", "サリー %n : %m.when_s_tilt とき", "sallyWhenTilt", 0, "前に傾けた"],
			["b", "サリー %n : %m.touching_color に触れたか?", "sallyTouchingColor", 0, "赤色"],
			["b", "サリー %n : 色パターンが %m.pattern_color_black %m.pattern_color_black ですか?", "sallyIsColorPattern", 0, "黒色", "赤色"],
			["b", "サリー %n : ボタンを %m.button_state ?", "sallyButtonState", 0, "クリックしたか"],
			["b", "サリー %n : %m.s_tilt ?", "sallyTilt", 0, "前に傾けたか"],
			["b", "サリー %n : 電池が %m.battery ?", "sallyBattery", 0, "正常か"]
		],
		uz1: [
			["w", "Sally %n : oldinga yurish", "sallyMoveForward", 0],
			["w", "Sally %n : orqaga yurish", "sallyMoveBackward", 0],
			["w", "Sally %n : %m.left_right ga o'girilish", "sallyTurn", 0, "chap"],
			["-"],
			[" ", "Sally %n : LEDni %m.led_color ga sozlash", "sallySetLedTo", 0, "qizil"],
			[" ", "Sally %n : LEDni o'chirish", "sallyClearLed", 0],
			["-"],
			[" ", "Sally %n : %m.sound_effect tovushni ijro etish", "sallyPlaySound", 0, "qisqa"],
			[" ", "Sally %n : tovushni o'chirish", "sallyClearSound", 0],
			["-"],
			["h", "Sally %n : %m.touching_color ga tegilganda", "sallyWhenColorTouched", 0, "qizil"],
			["h", "Sally %n : tugmani %m.when_button_state da", "sallyWhenButtonState", 0, "bosgan"],
			["b", "Sally %n : %m.touching_color ga tekkan?", "sallyTouchingColor", 0, "qizil"],
			["b", "Sally %n : tugmani %m.button_state ?", "sallyButtonState", 0, "bosgan"]
		],
		uz2: [
			["w", "Sally %n : oldinga %n %m.cm_sec yurish", "sallyMoveForwardUnit", 0, 6, "cm"],
			["w", "Sally %n : orqaga %n %m.cm_sec yurish", "sallyMoveBackwardUnit", 0, 6, "cm"],
			["w", "Sally %n : %m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "sallyTurnUnitInPlace", 0, "chap", 90, "daraja"],
			["w", "Sally %n : %m.left_right g'ildirak markaziga %n %m.deg_sec %m.forward_backward yo'nalishga o'girilish", "sallyPivotAroundWheelUnitInDirection", 0, "chap", 90, "daraja", "old"],
			["w", "Sally %n : %m.left_right ga %n %m.deg_sec radius %n cm %m.forward_backward yo'nalishga o'girilish", "sallyTurnUnitWithRadiusInDirection", 0, "chap", 90, "daraja", 3, "old"],
			["-"],
			[" ", "Sally %n : LEDni %m.led_color ga sozlash", "sallySetLedTo", 0, "qizil"],
			[" ", "Sally %n : LEDni o'chirish", "sallyClearLed", 0],
			["-"],
			[" ", "Sally %n : %m.sound_effect tovushni %n marta ijro etish", "sallyPlaySoundTimes", 0, "qisqa", 1],
			["w", "Sally %n : %m.sound_effect tovushni %n marta ijro tugaguncha kutish", "sallyPlaySoundTimesUntilDone", 0, "qisqa", 1],
			[" ", "Sally %n : tovushni o'chirish", "sallyClearSound", 0],
			["w", "Sally %n : %m.note %m.octave notani %d.beats zarb ijro etish", "sallyPlayNoteForBeats", 0, "do", "4", 0.5],
			["w", "Sally %n : %d.beats zarb tanaffus", "sallyRestForBeats", 0, 0.25],
			[" ", "Sally %n : temni %n ga o'zgartirish", "sallyChangeTempoBy", 0, 20],
			[" ", "Sally %n : temni %n bpm ga sozlash", "sallySetTempoTo", 0, 60],
			["-"],
			["h", "Sally %n : %m.touching_color ga tegilganda", "sallyWhenColorTouched", 0, "qizil"],
			["h", "Sally %n : rang naqshi %m.pattern_color_black %m.pattern_color_black bo'lganida", "sallyWhenColorPattern", 0, "qora", "qizil"],
			["h", "Sally %n : tugmani %m.when_button_state da", "sallyWhenButtonState", 0, "bosgan"],
			["h", "Sally %n : %m.when_s_tilt bo'lganda", "sallyWhenTilt", 0, "oldinga eğin"],
			["b", "Sally %n : %m.touching_color ga tekkan?", "sallyTouchingColor", 0, "qizil"],
			["b", "Sally %n : rang naqshi %m.pattern_color_black %m.pattern_color_black ?", "sallyIsColorPattern", 0, "qora", "qizil"],
			["b", "Sally %n : tugmani %m.button_state ?", "sallyButtonState", 0, "bosgan"],
			["b", "Sally %n : %m.s_tilt ?", "sallyTilt", 0, "oldinga eğin"]
		],
		uz3: [
			["w", "Sally %n : oldinga %n %m.move_unit yurish", "sallyMoveForwardUnit", 0, 6, "cm"],
			["w", "Sally %n : orqaga %n %m.move_unit yurish", "sallyMoveBackwardUnit", 0, 6, "cm"],
			["w", "Sally %n : %m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "sallyTurnUnitInPlace", 0, "chap", 90, "daraja"],
			["w", "Sally %n : %m.left_right g'ildirak markaziga %n %m.turn_unit %m.forward_backward yo'nalishga o'girilish", "sallyPivotAroundWheelUnitInDirection", 0, "chap", 90, "daraja", "old"],
			["w", "Sally %n : %m.left_right ga %n %m.turn_unit radius %n cm %m.forward_backward yo'nalishga o'girilish", "sallyTurnUnitWithRadiusInDirection", 0, "chap", 90, "daraja", 3, "old"],
			[" ", "Sally %n : chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "sallyChangeWheelsByLeftRight", 0, 10, 10],
			[" ", "Sally %n : chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "sallySetWheelsToLeftRight", 0, 40, 40],
			[" ", "Sally %n : %m.left_right_both g'ildirakni %n ga o'zgartirish", "sallyChangeWheelBy", 0, "chap", 10],
			[" ", "Sally %n : %m.left_right_both g'ildirakni %n ga sozlash", "sallySetWheelTo", 0, "chap", 40],
			[" ", "Sally %n : chiziqqa ergashish", "sallyFollowLine", 0],
			["w", "Sally %n : chiziq ustida %m.target_color gacha yurish", "sallyFollowLineUntil", 0, "qizil"],
			["w", "Sally %n : chorrahadan o'tib yurish", "sallyCrossIntersection", 0],
			["w", "Sally %n : chorrahada %m.left_right_back ga o'girilish", "sallyTurnAtIntersection", 0, "chap"],
			["w", "Sally %n : %m.left_right chiziqqa sakrash", "sallyJumpLine", 0, "chap"],
			[" ", "Sally %n : liniyada ergashish tezligini %m.speed ga sozlash", "sallySetFollowingSpeedTo", 0, "4"],
			[" ", "Sally %n : to'xtatish", "sallyStop", 0],
			["-"],
			[" ", "Sally %n : LEDni %m.led_color ga sozlash", "sallySetLedTo", 0, "qizil"],
			[" ", "Sally %n : LEDni r: %n g: %n b: %n ga o'zgartirish", "sallyChangeLedByRGB", 0, 10, 0, 0],
			[" ", "Sally %n : LEDni r: %n g: %n b: %n ga sozlash", "sallySetLedToRGB", 0, 255, 0, 0],
			[" ", "Sally %n : LEDni o'chirish", "sallyClearLed", 0],
			["-"],
			[" ", "Sally %n : %m.sound_effect tovushni %n marta ijro etish", "sallyPlaySoundTimes", 0, "qisqa", 1],
			["w", "Sally %n : %m.sound_effect tovushni %n marta ijro tugaguncha kutish", "sallyPlaySoundTimesUntilDone", 0, "qisqa", 1],
			[" ", "Sally %n : buzerning ovozini %n ga o'zgartirish", "sallyChangeBuzzerBy", 0, 10],
			[" ", "Sally %n : buzerning ovozini %n ga sozlash", "sallySetBuzzerTo", 0, 1000],
			[" ", "Sally %n : tovushni o'chirish", "sallyClearSound", 0],
			[" ", "Sally %n : %m.note %m.octave notani ijro etish", "sallyPlayNote", 0, "do", "4"],
			["w", "Sally %n : %m.note %m.octave notani %d.beats zarb ijro etish", "sallyPlayNoteForBeats", 0, "do", "4", 0.5],
			["w", "Sally %n : %d.beats zarb tanaffus", "sallyRestForBeats", 0, 0.25],
			[" ", "Sally %n : temni %n ga o'zgartirish", "sallyChangeTempoBy", 0, 20],
			[" ", "Sally %n : temni %n bpm ga sozlash", "sallySetTempoTo", 0, 60],
			["-"],
			["r", "Sally %n : rang raqami", "sallyColorNumber", 0],
			["r", "Sally %n : rang naqshi", "sallyColorPattern", 0],
			["r", "Sally %n : rang r", "sallyColorRed", 0],
			["r", "Sally %n : rang g", "sallyColorGreen", 0],
			["r", "Sally %n : rang b", "sallyColorBlue", 0],
			["r", "Sally %n : taglik sensori", "sallyFloor", 0],
			["r", "Sally %n : tugma", "sallyButton", 0],
			["r", "Sally %n : x tezlanish", "sallyAccelerationX", 0],
			["r", "Sally %n : y tezlanish", "sallyAccelerationY", 0],
			["r", "Sally %n : z tezlanish", "sallyAccelerationZ", 0],
			["r", "Sally %n : harorat", "sallyTemperature", 0],
			["r", "Sally %n : signal kuchi", "sallySignalStrength", 0],
			["h", "Sally %n : %m.touching_color ga tegilganda", "sallyWhenColorTouched", 0, "qizil"],
			["h", "Sally %n : rang naqshi %m.pattern_color_black %m.pattern_color_black bo'lganida", "sallyWhenColorPattern", 0, "qora", "qizil"],
			["h", "Sally %n : tugmani %m.when_button_state da", "sallyWhenButtonState", 0, "bosgan"],
			["h", "Sally %n : %m.when_s_tilt bo'lganda", "sallyWhenTilt", 0, "oldinga eğin"],
			["b", "Sally %n : %m.touching_color ga tekkan?", "sallyTouchingColor", 0, "qizil"],
			["b", "Sally %n : rang naqshi %m.pattern_color_black %m.pattern_color_black ?", "sallyIsColorPattern", 0, "qora", "qizil"],
			["b", "Sally %n : tugmani %m.button_state ?", "sallyButtonState", 0, "bosgan"],
			["b", "Sally %n : %m.s_tilt ?", "sallyTilt", 0, "oldinga eğin"],
			["b", "Sally %n : batareya %m.battery ?", "sallyBattery", 0, "normal"]
		]
	};
	const MENUS = {
		en: {
			"move_unit": ["cm", "seconds", "pulses"],
			"turn_unit": ["degrees", "seconds", "pulses"],
			"cm_sec": ["cm", "seconds"],
			"deg_sec": ["degrees", "seconds"],
			"forward_backward": ["forward", "backward"],
			"left_right": ["left", "right"],
			"left_right_both": ["left", "right", "both"],
			"left_right_back": ["left", "right", "back"],
			"target_color": ["red", "yellow", "green", "sky blue", "blue", "purple", "any color"],
			"touching_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "purple", "black", "white"],
			"pattern_color_black": ["black", "red", "yellow", "green", "sky blue", "blue", "purple"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "violet", "purple", "white"],
			"sound_effect": ["beep", "random beep", "noise", "siren", "engine", "chop", "robot", "dibidibidip", "good job", "happy", "angry", "sad", "sleep", "march", "birthday"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["clicked", "double-clicked", "long-pressed"],
			"when_s_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt", "tap", "free fall"],
			"button_state": ["clicked", "double-clicked", "long-pressed"],
			"s_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt", "tap", "free fall"],
			"battery": ["normal", "low", "empty"]
		},
		ko: {
			"move_unit": ["cm", "초", "펄스"],
			"turn_unit": ["도", "초", "펄스"],
			"cm_sec": ["cm", "초"],
			"deg_sec": ["도", "초"],
			"forward_backward": ["앞쪽", "뒤쪽"],
			"left_right": ["왼쪽", "오른쪽"],
			"left_right_both": ["왼쪽", "오른쪽", "양쪽"],
			"left_right_back": ["왼쪽", "오른쪽", "뒤쪽"],
			"target_color": ["빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색", "아무 색"],
			"touching_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "자주색", "검은색", "하얀색"],
			"pattern_color_black": ["검은색", "빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"sound_effect": ["삐", "무작위 삐", "지지직", "사이렌", "엔진", "쩝", "로봇", "디비디비딥", "잘 했어요", "행복", "화남", "슬픔", "졸림", "행진", "생일"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["클릭했을", "더블클릭했을", "오래 눌렀을"],
			"when_s_tilt": ["앞으로 기울였을", "뒤로 기울였을", "왼쪽으로 기울였을", "오른쪽으로 기울였을", "거꾸로 뒤집었을", "기울이지 않았을", "두드렸을", "자유 낙하했을"],
			"button_state": ["클릭했는가", "더블클릭했는가", "오래 눌렀는가"],
			"s_tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "기울이지 않음", "두드림", "자유 낙하"],
			"battery": ["정상", "부족", "없음"]
		},
		ja: {
			"move_unit": ["cm", "秒", "パルス"],
			"turn_unit": ["度", "秒", "パルス"],
			"cm_sec": ["cm", "秒"],
			"deg_sec": ["度", "秒"],
			"forward_backward": ["前", "後"],
			"left_right": ["左", "右"],
			"left_right_both": ["左", "右", "両"],
			"left_right_back": ["左", "右", "後ろ"],
			"target_color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色", "何色"],
			"touching_color": ["赤色", "橙色", "黄色", "緑色", "水色", "青色", "紫色", "黒色", "白色"],
			"pattern_color_black": ["黒色", "赤色", "黄色", "緑色", "水色", "青色", "紫色"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["赤色", "橙色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"sound_effect": ["ビープ", "ランダムビープ", "ノイズ", "サイレン", "エンジン", "チョップ", "ロボット", "ディバディバディップ", "よくやった", "幸福", "怒った", "悲しみ", "睡眠", "行進", "誕生"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["クリックした", "ダブルクリックした", "長く押した"],
			"when_s_tilt": ["前に傾けた", "後に傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾けなかった", "叩いた", "自由落下した"],
			"button_state": ["クリックしたか", "ダブルクリックしたか", "長く押したか"],
			"s_tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾けなかったか", "叩いたか", "自由落下したか"],
			"battery": ["正常か", "足りないか", "ないか"]
		},
		uz: {
			"move_unit": ["cm", "soniya", "puls"],
			"turn_unit": ["daraja", "soniya", "puls"],
			"cm_sec": ["cm", "soniya"],
			"deg_sec": ["daraja", "soniya"],
			"forward_backward": ["old", "orqa"],
			"left_right": ["chap", "o'ng"],
			"left_right_both": ["chap", "o'ng", "har ikki"],
			"left_right_back": ["chap", "o'ng", "orqa"],
			"target_color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh", "har qanday rang"],
			"touching_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "siyoh", "qora", "oq"],
			"pattern_color_black": ["qora", "qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "binafsha", "siyoh", "oq"],
			"sound_effect": ["qisqa", "tasodifiy qisqa", "shovqin", "sirena", "motor", "chop", "robot", "dibidibidip", "juda yaxshi", "baxtli", "badjahl", "xafa", "uyqu", "marsh", "tug'ilgan kun"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["bosgan", "ikki-marta-bosgan", "uzoq-bosganmi"],
			"when_s_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q", "jo'mrak", "erkin tushish"],
			"button_state": ["bosgan", "ikki-marta-bosgan", "uzoq-bosganmi"],
			"s_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q", "jo'mrak", "erkin tushish"],
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
	var TARGET_COLORS = {};
	var RGB_COLORS = {};
	var LINE_COLOR_NUMBERS = {};
	var LINE_COLOR_PATTERNS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var SOUND_EFFECTS = {};
	var BUTTON_STATES = {};
	var TILTS = {};
	var BATTERY_STATES = {};
	
	const LEFT = 1;
	const RIGHT = 2;
	const BACK = 5;
	const FORWARD = 1;
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
	const TILT_TAP = 7;
	const TILT_FREE_FALL = 8;
	
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['left_right_both'];
		PARTS[tmp[0]] = LEFT;
		PARTS[tmp[1]] = RIGHT;
		tmp = MENUS[i]['left_right_back'];
		DIRECTIONS[tmp[0]] = LEFT;
		DIRECTIONS[tmp[1]] = RIGHT;
		DIRECTIONS[tmp[2]] = BACK;
		tmp = MENUS[i]['forward_backward'];
		TOWARDS[tmp[0]] = FORWARD;
		tmp = MENUS[i]['move_unit'];
		UNITS[tmp[0]] = 1; // cm
		UNITS[tmp[1]] = 2; // sec
		UNITS[tmp[2]] = 3; // pulse
		tmp = MENUS[i]['turn_unit'];
		UNITS[tmp[0]] = 1; // deg
		tmp = MENUS[i]['target_color'];
		TARGET_COLORS[tmp[0]] = 10; // red
		TARGET_COLORS[tmp[1]] = 11; // yellow
		TARGET_COLORS[tmp[2]] = 12; // green
		TARGET_COLORS[tmp[3]] = 13; // sky blue
		TARGET_COLORS[tmp[4]] = 14; // blue
		TARGET_COLORS[tmp[5]] = 15; // purple
		TARGET_COLORS[tmp[6]] = 2; // any color
		tmp = MENUS[i]['touching_color'];
		LINE_COLOR_NUMBERS[tmp[0]] = 1; // red
		LINE_COLOR_NUMBERS[tmp[1]] = 7; // orange
		LINE_COLOR_NUMBERS[tmp[2]] = 2; // yellow
		LINE_COLOR_NUMBERS[tmp[3]] = 3; // green
		LINE_COLOR_NUMBERS[tmp[4]] = 4; // sky blue
		LINE_COLOR_NUMBERS[tmp[5]] = 5; // blue
		LINE_COLOR_NUMBERS[tmp[6]] = 6; // purple
		LINE_COLOR_NUMBERS[tmp[7]] = 0; // black
		LINE_COLOR_NUMBERS[tmp[8]] = 8; // white
		tmp = MENUS[i]['pattern_color_black'];
		LINE_COLOR_PATTERNS[tmp[0]] = 0; // black
		LINE_COLOR_PATTERNS[tmp[1]] = 1; // red
		LINE_COLOR_PATTERNS[tmp[2]] = 2; // yellow
		LINE_COLOR_PATTERNS[tmp[3]] = 3; // green
		LINE_COLOR_PATTERNS[tmp[4]] = 4; // sky blue
		LINE_COLOR_PATTERNS[tmp[5]] = 5; // blue
		LINE_COLOR_PATTERNS[tmp[6]] = 6; // purple
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
		
		tmp = MENUS[i]['button_state'];
		BUTTON_STATES[tmp[0]] = CLICKED;
		BUTTON_STATES[tmp[1]] = DOUBLE_CLICKED;
		BUTTON_STATES[tmp[2]] = LONG_PRESSED;
		tmp = MENUS[i]['when_button_state'];
		BUTTON_STATES[tmp[0]] = CLICKED;
		BUTTON_STATES[tmp[1]] = DOUBLE_CLICKED;
		BUTTON_STATES[tmp[2]] = LONG_PRESSED;
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
	}

	function LineRobot(index, module) {
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
			batteryState: 2
		};
		this.motoring = {
			group: 'line',
			module: module,
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
			lineTracerSpeed: 4,
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
		this.freeFall = false;
		this.tap = false;
		this.tempo = 60;
		this.timeouts = [];
	}

	LineRobot.prototype.reset = function() {
		var motoring = this.motoring;
		motoring.map = 0xffe00000;
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
		motoring.lineTracerSpeed = 4;
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
		this.freeFall = false;
		this.tap = false;
		this.tempo = 60;

		this.__removeAllTimeouts();
	};

	LineRobot.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	LineRobot.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};

	LineRobot.prototype.clearMotoring = function() {
		this.motoring.map = 0xf8000000;
	};

	LineRobot.prototype.clearEvent = function() {
		this.clicked = false;
		this.doubleClicked = false;
		this.longPressed = false;
		this.colorPattern = -1;
		this.freeFall = false;
		this.tap = false;
	};

	LineRobot.prototype.__setPulse = function(pulse) {
		this.motoring.pulse = pulse;
		this.motoring.map |= 0x04000000;
	};

	LineRobot.prototype.__setLineTracerMode = function(mode) {
		this.motoring.lineTracerMode = mode;
		this.motoring.map |= 0x00800000;
	};

	LineRobot.prototype.__setLineTracerSpeed = function(speed) {
		this.motoring.lineTracerSpeed = speed;
		this.motoring.map |= 0x00400000;
	};

	LineRobot.prototype.__cancelLineTracer = function() {
		this.lineTracerCallback = undefined;
	};

	LineRobot.prototype.__setMotion = function(type, unit, speed, value, radius) {
		var motoring = this.motoring;
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map |= 0x00200000;
	};

	LineRobot.prototype.__cancelMotion = function() {
		this.motionCallback = undefined;
	};

	LineRobot.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x02000000;
	};

	LineRobot.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	LineRobot.prototype.__cancelNote = function() {
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

	LineRobot.prototype.__setSound = function(sound) {
		this.motoring.sound = sound;
		this.motoring.map |= 0x01000000;
	};

	LineRobot.prototype.__runSound = function(sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			this.currentSound = sound;
			this.soundRepeat = count;
			this.__setSound(sound);
		}
	};

	LineRobot.prototype.__cancelSound = function() {
		this.soundCallback = undefined;
	};

	LineRobot.prototype.handleSensory = function() {
		var self = this;
		var sensory = self.sensory;
		if(sensory.map & 0x00004000) self.clicked = true;
		if(sensory.map & 0x00002000) self.doubleClicked = true;
		if(sensory.map & 0x00001000) self.longPressed = true;
		if(sensory.map & 0x00000400) self.colorPattern = sensory.colorPattern;
		if(sensory.map & 0x00000008) self.freeFall = true;
		if(sensory.map & 0x00000004) self.tap = true;

		if(self.lineTracerCallback && (sensory.map & 0x00000040) != 0) {
			self.__setLineTracerMode(0);
			var callback = self.lineTracerCallback;
			self.__cancelLineTracer();
			if(callback) callback();
		}
		if(self.motionCallback && (sensory.map & 0x00000100) != 0) {
			self.motoring.leftWheel = 0;
			self.motoring.rightWheel = 0;
			var callback = self.motionCallback;
			self.__cancelMotion();
			if(callback) callback();
		}
		if((sensory.map & 0x00000080) != 0) {
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
	};

	LineRobot.prototype.__motion = function(type, callback) {
		var motoring = this.motoring;
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(type, 1, 0, 0, 0); // type, unit, speed, value, radius
		this.motionCallback = callback;
		this.__setLineTracerMode(0);
	};

	LineRobot.prototype.__motionUnit = function(type, unit, value, callback) {
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

	LineRobot.prototype.__motionUnitRadius = function(type, unit, value, radius, callback) {
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

	LineRobot.prototype.moveForward = function(callback) {
		this.__motion(101, callback);
	};

	LineRobot.prototype.moveBackward = function(callback) {
		this.__motion(102, callback);
	};

	LineRobot.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(103, callback);
		} else {
			this.__motion(104, callback);
		}
	};

	LineRobot.prototype.moveForwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(2, UNITS[unit], -value, callback);
		else this.__motionUnit(1, UNITS[unit], value, callback);
	};

	LineRobot.prototype.moveBackwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(1, UNITS[unit], -value, callback);
		else this.__motionUnit(2, UNITS[unit], value, callback);
	};

	LineRobot.prototype.turnUnit = function(direction, value, unit, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			if(value < 0) this.__motionUnit(4, UNITS[unit], -value, callback);
			else this.__motionUnit(3, UNITS[unit], value, callback);
		} else {
			if(value < 0) this.__motionUnit(3, UNITS[unit], -value, callback);
			else this.__motionUnit(4, UNITS[unit], value, callback);
		}
	};

	LineRobot.prototype.pivotUnit = function(wheel, value, unit, toward, callback) {
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

	LineRobot.prototype.circleUnit = function(direction, value, unit, radius, toward, callback) {
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

	LineRobot.prototype.setWheels = function(leftVelocity, rightVelocity) {
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

	LineRobot.prototype.changeWheels = function(leftVelocity, rightVelocity) {
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

	LineRobot.prototype.setWheel = function(wheel, velocity) {
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

	LineRobot.prototype.changeWheel = function(wheel, velocity) {
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

	LineRobot.prototype.followLine = function() {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(1);
	};

	LineRobot.prototype.followLineUntil = function(color, callback) {
		var motoring = this.motoring;
		this.__cancelMotion();

		var mode = TARGET_COLORS[color];
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};

	LineRobot.prototype.crossIntersection = function(callback) {
		var motoring = this.motoring;
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(3);
		this.lineTracerCallback = callback;
	};

	LineRobot.prototype.turnAtIntersection = function(direction, callback) {
		var motoring = this.motoring;
		this.__cancelMotion();

		var mode = 4;
		direction = DIRECTIONS[direction];
		if(direction == RIGHT) mode = 5;
		else if(direction === BACK) mode = 6;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};
	
	LineRobot.prototype.jumpLine = function(direction, callback) {
		var motoring = this.motoring;
		this.__cancelMotion();

		var mode = 7;
		if(DIRECTIONS[direction] == RIGHT) mode = 8;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};

	LineRobot.prototype.setLineTracerSpeed = function(speed) {
		speed = parseInt(speed);
		if(typeof speed == 'number') {
			this.__setLineTracerSpeed(speed);
		}
	};

	LineRobot.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelLineTracer();
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	LineRobot.prototype.setLedColor = function(color) {
		var rgb = RGB_COLORS[color];
		if(rgb) {
			this.setLedRgb(rgb[0], rgb[1], rgb[2]);
		}
	};

	LineRobot.prototype.setLedRgbArray = function(rgb) {
		if(rgb) {
			this.setLedRgb(rgb[0], rgb[1], rgb[2]);
		}
	};

	LineRobot.prototype.setLedRgb = function(red, green, blue) {
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

	LineRobot.prototype.changeLedRgb = function(red, green, blue) {
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

	LineRobot.prototype.clearLed = function() {
		this.setLedRgb(0, 0, 0);
	};

	LineRobot.prototype.playSound = function(sound, count) {
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

	LineRobot.prototype.playSoundUntil = function(sound, count, callback) {
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

	LineRobot.prototype.setBuzzer = function(hz) {
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

	LineRobot.prototype.changeBuzzer = function(hz) {
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

	LineRobot.prototype.clearSound = function() {
		this.__cancelNote();
		this.__cancelSound();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		this.__runSound(0);
	};

	LineRobot.prototype.playNote = function(note, octave) {
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

	LineRobot.prototype.playNoteBeat = function(note, octave, beat, callback) {
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

	LineRobot.prototype.restBeat = function(beat, callback) {
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

	LineRobot.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	LineRobot.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	LineRobot.prototype.checkTouchingColor = function(color) {
		color = LINE_COLOR_NUMBERS[color];
		if(typeof color == 'number') {
			return this.sensory.colorNumber == color;
		}
		return false;
	};

	LineRobot.prototype.checkColorPattern = function(color1, color2) {
		color1 = LINE_COLOR_PATTERNS[color1];
		color2 = LINE_COLOR_PATTERNS[color2];
		if((typeof color1 == 'number') && (typeof color2 == 'number')) {
			return this.colorPattern == color1 * 10 + color2;
		}
		return false;
	};

	LineRobot.prototype.checkButtonEvent = function(event) {
		switch(BUTTON_STATES[event]) {
			case CLICKED: return this.clicked;
			case DOUBLE_CLICKED: return this.doubleClicked;
			case LONG_PRESSED: return this.longPressed;
		}
		return false;
	};

	LineRobot.prototype.checkTilt = function(tilt) {
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

	LineRobot.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};

	LineRobot.prototype.getSignalStrength = function() {
		return this.sensory.signalStrength;
	};
	
	LineRobot.prototype.getColorRed = function() {
		return this.sensory.colorRed;
	};
	
	LineRobot.prototype.getColorGreen = function() {
		return this.sensory.colorGreen;
	};
	
	LineRobot.prototype.getColorBlue = function() {
		return this.sensory.colorBlue;
	};
	
	LineRobot.prototype.getFloor = function() {
		return this.sensory.floor;
	};

	LineRobot.prototype.getAccelerationX = function() {
		return this.sensory.accelerationX;
	};

	LineRobot.prototype.getAccelerationY = function() {
		return this.sensory.accelerationY;
	};

	LineRobot.prototype.getAccelerationZ = function() {
		return this.sensory.accelerationZ;
	};
	
	LineRobot.prototype.getTemperature = function() {
		return this.sensory.temperature;
	};
	
	LineRobot.prototype.getButton = function() {
		return this.sensory.button;
	};
	
	LineRobot.prototype.getColorNumber = function() {
		return this.sensory.colorNumber;
	};

	LineRobot.prototype.getColorPattern = function() {
		return this.colorPattern;
	};
	
	function getOrCreateRobot(group, module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			switch(module) {
				case BROWN:
				case SALLY: robot = new LineRobot(index, module); break;
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
	
	ext.sallyMoveForward = function(index, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.moveForward(callback);
	};

	ext.sallyMoveBackward = function(index, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.sallyTurn = function(index, direction, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.turn(direction, callback);
	};

	ext.sallyMoveForwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.moveForwardUnit(value, unit, callback);
	};

	ext.sallyMoveBackwardUnit = function(index, value, unit, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.moveBackwardUnit(value, unit, callback);
	};

	ext.sallyTurnUnitInPlace = function(index, direction, value, unit, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.turnUnit(direction, value, unit, callback);
	};
	
	ext.sallyPivotAroundWheelUnitInDirection = function(index, wheel, value, unit, toward, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.pivotUnit(wheel, value, unit, toward, callback);
	};
	
	ext.sallyTurnUnitWithRadiusInDirection = function(index, direction, value, unit, radius, toward, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.circleUnit(direction, value, unit, radius, toward, callback);
	};
	
	ext.sallyChangeWheelsByLeftRight = function(index, left, right) {
		var robot = getRobot(LINE, index);
		if(robot) robot.changeWheels(left, right);
	};

	ext.sallySetWheelsToLeftRight = function(index, left, right) {
		var robot = getRobot(LINE, index);
		if(robot) robot.setWheels(left, right);
	};

	ext.sallyChangeWheelBy = function(index, wheel, velocity) {
		var robot = getRobot(LINE, index);
		if(robot) robot.changeWheel(wheel, velocity);
	};

	ext.sallySetWheelTo = function(index, wheel, velocity) {
		var robot = getRobot(LINE, index);
		if(robot) robot.setWheel(wheel, velocity);
	};

	ext.sallyFollowLine = function(index) {
		var robot = getRobot(LINE, index);
		if(robot) robot.followLine();
	};

	ext.sallyFollowLineUntil = function(index, color, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.followLineUntil(color, callback);
	};
	
	ext.sallyCrossIntersection = function(index, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.crossIntersection(callback);
	};
	
	ext.sallyTurnAtIntersection = function(index, direction, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.turnAtIntersection(direction, callback);
	};
	
	ext.sallyJumpLine = function(index, direction, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.jumpLine(direction, callback);
	};

	ext.sallySetFollowingSpeedTo = function(index, speed) {
		var robot = getRobot(LINE, index);
		if(robot) robot.setLineTracerSpeed(speed);
	};

	ext.sallyStop = function(index) {
		var robot = getRobot(LINE, index);
		if(robot) robot.stop();
	};

	ext.sallySetLedTo = function(index, color) {
		var robot = getRobot(LINE, index);
		if(robot) robot.setLedColor(color);
	};
	
	ext.sallyChangeLedByRGB = function(index, red, green, blue) {
		var robot = getRobot(LINE, index);
		if(robot) robot.changeLedRgb(red, green, blue);
	};
	
	ext.sallySetLedToRGB = function(index, red, green, blue) {
		var robot = getRobot(LINE, index);
		if(robot) robot.setLedRgb(red, green, blue);
	};

	ext.sallyClearLed = function(index) {
		var robot = getRobot(LINE, index);
		if(robot) robot.clearLed();
	};

	ext.sallyPlaySound = function(index, sound) {
		var robot = getRobot(LINE, index);
		if(robot) robot.playSound(sound, 1);
	};
	
	ext.sallyPlaySoundTimes = function(index, sound, count) {
		var robot = getRobot(LINE, index);
		if(robot) robot.playSound(sound, count);
	};
	
	ext.sallyPlaySoundTimesUntilDone = function(index, sound, count, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.playSoundUntil(sound, count, callback);
	};

	ext.sallyChangeBuzzerBy = function(index, hz) {
		var robot = getRobot(LINE, index);
		if(robot) robot.changeBuzzer(hz);
	};

	ext.sallySetBuzzerTo = function(index, hz) {
		var robot = getRobot(LINE, index);
		if(robot) robot.setBuzzer(hz);
	};

	ext.sallyClearSound = function(index) {
		var robot = getRobot(LINE, index);
		if(robot) robot.clearSound();
	};
	
	ext.sallyPlayNote = function(index, note, octave) {
		var robot = getRobot(LINE, index);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.sallyPlayNoteForBeats = function(index, note, octave, beat, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};

	ext.sallyRestForBeats = function(index, beat, callback) {
		var robot = getRobot(LINE, index);
		if(robot) robot.restBeat(beat, callback);
	};

	ext.sallyChangeTempoBy = function(index, bpm) {
		var robot = getRobot(LINE, index);
		if(robot) robot.changeTempo(bpm);
	};

	ext.sallySetTempoTo = function(index, bpm) {
		var robot = getRobot(LINE, index);
		if(robot) robot.setTempo(bpm);
	};

	ext.sallyWhenColorTouched = function(index, color) {
		var robot = getRobot(LINE, index);
		return robot ? robot.checkTouchingColor(color) : false;
	};
	
	ext.sallyWhenColorPattern = function(index, color1, color2) {
		var robot = getRobot(LINE, index);
		return robot ? robot.checkColorPattern(color1, color2) : false;
	};
	
	ext.sallyWhenButtonState = function(index, state) {
		var robot = getRobot(LINE, index);
		return robot ? robot.checkButtonEvent(state) : false;
	};
	
	ext.sallyWhenTilt = function(index, tilt) {
		var robot = getRobot(LINE, index);
		return robot ? robot.checkTilt(tilt) : false;
	};
	
	ext.sallyTouchingColor = function(index, color) {
		var robot = getRobot(LINE, index);
		return robot ? robot.checkTouchingColor(color) : false;
	};
	
	ext.sallyIsColorPattern = function(index, color1, color2) {
		var robot = getRobot(LINE, index);
		return robot ? robot.checkColorPattern(color1, color2) : false;
	};
	
	ext.sallyButtonState = function(index, state) {
		var robot = getRobot(LINE, index);
		return robot ? robot.checkButtonEvent(state) : false;
	};
	
	ext.sallyTilt = function(index, tilt) {
		var robot = getRobot(LINE, index);
		return robot ? robot.checkTilt(tilt) : false;
	};
	
	ext.sallyBattery = function(index, state) {
		var robot = getRobot(LINE, index);
		return robot ? robot.checkBattery(state) : false;
	};

	ext.sallyColorNumber = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getColorNumber() : -1;
	};

	ext.sallyColorPattern = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getColorPattern() : -1;
	};
	
	ext.sallyColorRed = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getColorRed() : 0;
	};
	
	ext.sallyColorGreen = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getColorGreen() : 0;
	};
	
	ext.sallyColorBlue = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getColorBlue() : 0;
	};

	ext.sallyFloor = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getFloor() : 0;
	};

	ext.sallyButton = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getButton() : 0;
	};

	ext.sallyAccelerationX = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getAccelerationX() : 0;
	};

	ext.sallyAccelerationY = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getAccelerationY() : 0;
	};

	ext.sallyAccelerationZ = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getAccelerationZ() : 0;
	};
	
	ext.sallyTemperature = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getTemperature() : 0;
	};
	
	ext.sallySignalStrength = function(index) {
		var robot = getRobot(LINE, index);
		return robot ? robot.getSignalStrength() : 0;
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
