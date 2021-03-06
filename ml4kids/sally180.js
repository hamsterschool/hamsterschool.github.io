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
		en: [ 'Please run Robot Coding software.', 'Robot is not connected.', 'Ready' ],
		ko: [ '로봇 코딩 소프트웨어를 실행해 주세요.', '로봇이 연결되어 있지 않습니다.', '정상입니다.' ],
		ja: [ 'ロボットコーディングソフトウェアを実行してください。', 'ロボットが接続されていません。', '正常です。' ],
		uz: [ 'Robot Kodlash dasturini ishga tushiring.', 'Robot ulanmagan.', 'Tayyorlangan' ]
	};
	const EXTENSION_NAME = {
		en: 'Sally',
		ko: '샐리',
		ja: 'サリー',
		uz: 'Sally'
	};
	const BLOCKS = {
		en1: [
			["w", "move forward", "sallyMoveForward"],
			["w", "move backward", "sallyMoveBackward"],
			["w", "turn %m.left_right", "sallyTurn", "left"],
			["-"],
			[" ", "set led to %m.led_color", "sallySetLedTo", "red"],
			[" ", "clear led", "sallyClearLed"],
			["-"],
			[" ", "play sound %m.sound_effect", "sallyPlaySound", "beep"],
			[" ", "clear sound", "sallyClearSound"],
			["-"],
			["h", "when %m.touching_color touched", "sallyWhenColorTouched", "red"],
			["h", "when button %m.when_button_state", "sallyWhenButtonState", "clicked"],
			["b", "touching %m.touching_color ?", "sallyTouchingColor", "red"],
			["b", "button %m.button_state ?", "sallyButtonState", "clicked"]
		],
		en2: [
			["w", "move forward %n %m.cm_sec", "sallyMoveForwardUnit", 6, "cm"],
			["w", "move backward %n %m.cm_sec", "sallyMoveBackwardUnit", 6, "cm"],
			["w", "turn %m.left_right %n %m.deg_sec in place", "sallyTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.left_right wheel %n %m.deg_sec in %m.forward_backward direction", "sallyPivotAroundWheelUnitInDirection", "left", 90, "degrees", "forward"],
			["-"],
			[" ", "set led to %m.led_color", "sallySetLedTo", "red"],
			[" ", "clear led", "sallyClearLed"],
			["-"],
			[" ", "play sound %m.sound_effect %n times", "sallyPlaySoundTimes", "beep", 1],
			["w", "play sound %m.sound_effect %n times until done", "sallyPlaySoundTimesUntilDone", "beep", 1],
			[" ", "clear sound", "sallyClearSound"],
			["w", "play note %m.note %m.octave for %d.beats beats", "sallyPlayNoteForBeats", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "sallyRestForBeats", 0.25],
			[" ", "change tempo by %n", "sallyChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "sallySetTempoTo", 60],
			["-"],
			["h", "when %m.touching_color touched", "sallyWhenColorTouched", "red"],
			["h", "when color pattern is %m.pattern_color_black %m.pattern_color_black", "sallyWhenColorPattern", "black", "red"],
			["h", "when button %m.when_button_state", "sallyWhenButtonState", "clicked"],
			["h", "when %m.when_s_tilt", "sallyWhenTilt", "tilt forward"],
			["b", "touching %m.touching_color ?", "sallyTouchingColor", "red"],
			["b", "color pattern %m.pattern_color_black %m.pattern_color_black ?", "sallyIsColorPattern", "black", "red"],
			["b", "button %m.button_state ?", "sallyButtonState", "clicked"],
			["b", "%m.s_tilt ?", "sallyTilt", "tilt forward"]
		],
		en3: [
			["w", "move forward %n %m.move_unit", "sallyMoveForwardUnit", 6, "cm"],
			["w", "move backward %n %m.move_unit", "sallyMoveBackwardUnit", 6, "cm"],
			["w", "turn %m.left_right %n %m.turn_unit in place", "sallyTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.left_right wheel %n %m.turn_unit in %m.forward_backward direction", "sallyPivotAroundWheelUnitInDirection", "left", 90, "degrees", "forward"],
			[" ", "change wheels by left: %n right: %n", "sallyChangeWheelsByLeftRight", 10, 10],
			[" ", "set wheels to left: %n right: %n", "sallySetWheelsToLeftRight", 40, 40],
			[" ", "change %m.left_right_both wheel by %n", "sallyChangeWheelBy", "left", 10],
			[" ", "set %m.left_right_both wheel to %n", "sallySetWheelTo", "left", 40],
			[" ", "follow line", "sallyFollowLine"],
			["w", "follow line until %m.target_color", "sallyFollowLineUntil", "red"],
			["w", "follow line until intersection", "sallyFollowLineUntilIntersection"],
			["w", "cross intersection", "sallyCrossIntersection"],
			["w", "turn %m.left_right_back at intersection", "sallyTurnAtIntersection", "left"],
			["w", "jump to %m.left_right line", "sallyJumpLine", "left"],
			[" ", "set following speed to %m.speed", "sallySetFollowingSpeedTo", "4"],
			[" ", "stop", "sallyStop"],
			["-"],
			[" ", "set led to %m.led_color", "sallySetLedTo", "red"],
			[" ", "change led by r: %n g: %n b: %n", "sallyChangeLedByRGB", 10, 0, 0],
			[" ", "set led to r: %n g: %n b: %n", "sallySetLedToRGB", 255, 0, 0],
			[" ", "clear led", "sallyClearLed"],
			["-"],
			[" ", "play sound %m.sound_effect %n times", "sallyPlaySoundTimes", "beep", 1],
			["w", "play sound %m.sound_effect %n times until done", "sallyPlaySoundTimesUntilDone", "beep", 1],
			[" ", "change buzzer by %n", "sallyChangeBuzzerBy", 10],
			[" ", "set buzzer to %n", "sallySetBuzzerTo", 1000],
			[" ", "clear sound", "sallyClearSound"],
			[" ", "play note %m.note %m.octave", "sallyPlayNote", "C", "4"],
			["w", "play note %m.note %m.octave for %d.beats beats", "sallyPlayNoteForBeats", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "sallyRestForBeats", 0.25],
			[" ", "change tempo by %n", "sallyChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "sallySetTempoTo", 60],
			["-"],
			["r", "color number", "sallyColorNumber"],
			["r", "color pattern", "sallyColorPattern"],
			["r", "color r", "sallyColorRed"],
			["r", "color g", "sallyColorGreen"],
			["r", "color b", "sallyColorBlue"],
			["r", "floor", "sallyFloor"],
			["r", "button", "sallyButton"],
			["r", "x acceleration", "sallyAccelerationX"],
			["r", "y acceleration", "sallyAccelerationY"],
			["r", "z acceleration", "sallyAccelerationZ"],
			["r", "temperature", "sallyTemperature"],
			["r", "signal strength", "sallySignalStrength"],
			["h", "when %m.touching_color touched", "sallyWhenColorTouched", "red"],
			["h", "when color pattern is %m.pattern_color_black %m.pattern_color_black", "sallyWhenColorPattern", "black", "red"],
			["h", "when button %m.when_button_state", "sallyWhenButtonState", "clicked"],
			["h", "when %m.when_s_tilt", "sallyWhenTilt", "tilt forward"],
			["b", "touching %m.touching_color ?", "sallyTouchingColor", "red"],
			["b", "color pattern %m.pattern_color_black %m.pattern_color_black ?", "sallyIsColorPattern", "black", "red"],
			["b", "button %m.button_state ?", "sallyButtonState", "clicked"],
			["b", "%m.s_tilt ?", "sallyTilt", "tilt forward"],
			["b", "battery %m.battery ?", "sallyBattery", "normal"]
		],
		ko1: [
			["w", "앞으로 이동하기", "sallyMoveForward"],
			["w", "뒤로 이동하기", "sallyMoveBackward"],
			["w", "%m.left_right 으로 돌기", "sallyTurn", "왼쪽"],
			["-"],
			[" ", "LED를 %m.led_color 으로 정하기", "sallySetLedTo", "빨간색"],
			[" ", "LED 끄기", "sallyClearLed"],
			["-"],
			[" ", "%m.sound_effect 소리 재생하기", "sallyPlaySound", "삐"],
			[" ", "소리 끄기", "sallyClearSound"],
			["-"],
			["h", "%m.touching_color 에 닿았을 때", "sallyWhenColorTouched", "빨간색"],
			["h", "버튼을 %m.when_button_state 때", "sallyWhenButtonState", "클릭했을"],
			["b", "%m.touching_color 에 닿았는가?", "sallyTouchingColor", "빨간색"],
			["b", "버튼을 %m.button_state ?", "sallyButtonState", "클릭했는가"]
		],
		ko2: [
			["w", "앞으로 %n %m.cm_sec 이동하기", "sallyMoveForwardUnit", 6, "cm"],
			["w", "뒤로 %n %m.cm_sec 이동하기", "sallyMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right 으로 %n %m.deg_sec 제자리 돌기", "sallyTurnUnitInPlace", "왼쪽", 90, "도"],
			["w", "%m.left_right 바퀴 중심으로 %n %m.deg_sec %m.forward_backward 방향으로 돌기", "sallyPivotAroundWheelUnitInDirection", "왼쪽", 90, "도", "앞쪽"],
			["-"],
			[" ", "LED를 %m.led_color 으로 정하기", "sallySetLedTo", "빨간색"],
			[" ", "LED 끄기", "sallyClearLed"],
			["-"],
			[" ", "%m.sound_effect 소리 %n 번 재생하기", "sallyPlaySoundTimes", "삐", 1],
			["w", "%m.sound_effect 소리 %n 번 재생하고 기다리기", "sallyPlaySoundTimesUntilDone", "삐", 1],
			[" ", "소리 끄기", "sallyClearSound"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "sallyPlayNoteForBeats", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "sallyRestForBeats", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "sallyChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "sallySetTempoTo", 60],
			["-"],
			["h", "%m.touching_color 에 닿았을 때", "sallyWhenColorTouched", "빨간색"],
			["h", "색깔 패턴이 %m.pattern_color_black %m.pattern_color_black 일 때", "sallyWhenColorPattern", "검은색", "빨간색"],
			["h", "버튼을 %m.when_button_state 때", "sallyWhenButtonState", "클릭했을"],
			["h", "%m.when_s_tilt 때", "sallyWhenTilt", "앞으로 기울였을"],
			["b", "%m.touching_color 에 닿았는가?", "sallyTouchingColor", "빨간색"],
			["b", "색깔 패턴이 %m.pattern_color_black %m.pattern_color_black 인가?", "sallyIsColorPattern", "검은색", "빨간색"],
			["b", "버튼을 %m.button_state ?", "sallyButtonState", "클릭했는가"],
			["b", "%m.s_tilt ?", "sallyTilt", "앞으로 기울임"]
		],
		ko3: [
			["w", "앞으로 %n %m.move_unit 이동하기", "sallyMoveForwardUnit", 6, "cm"],
			["w", "뒤로 %n %m.move_unit 이동하기", "sallyMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right 으로 %n %m.turn_unit 제자리 돌기", "sallyTurnUnitInPlace", "왼쪽", 90, "도"],
			["w", "%m.left_right 바퀴 중심으로 %n %m.turn_unit %m.forward_backward 방향으로 돌기", "sallyPivotAroundWheelUnitInDirection", "왼쪽", 90, "도", "앞쪽"],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "sallyChangeWheelsByLeftRight", 10, 10],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "sallySetWheelsToLeftRight", 40, 40],
			[" ", "%m.left_right_both 바퀴 %n 만큼 바꾸기", "sallyChangeWheelBy", "왼쪽", 10],
			[" ", "%m.left_right_both 바퀴 %n (으)로 정하기", "sallySetWheelTo", "왼쪽", 40],
			[" ", "선 따라가기", "sallyFollowLine"],
			["w", "선을 따라 %m.target_color 까지 이동하기", "sallyFollowLineUntil", "빨간색"],
			["w", "선을 따라 교차로까지 이동하기", "sallyFollowLineUntilIntersection"],
			["w", "교차로 건너가기", "sallyCrossIntersection"],
			["w", "교차로에서 %m.left_right_back 으로 돌기", "sallyTurnAtIntersection", "왼쪽"],
			["w", "%m.left_right 선으로 건너가기", "sallyJumpLine", "왼쪽"],
			[" ", "선 따라가기 속도를 %m.speed (으)로 정하기", "sallySetFollowingSpeedTo", "4"],
			[" ", "정지하기", "sallyStop"],
			["-"],
			[" ", "LED를 %m.led_color 으로 정하기", "sallySetLedTo", "빨간색"],
			[" ", "LED를 R: %n G: %n B: %n 만큼 바꾸기", "sallyChangeLedByRGB", 10, 0, 0],
			[" ", "LED를 R: %n G: %n B: %n (으)로 정하기", "sallySetLedToRGB", 255, 0, 0],
			[" ", "LED 끄기", "sallyClearLed"],
			["-"],
			[" ", "%m.sound_effect 소리 %n 번 재생하기", "sallyPlaySoundTimes", "삐", 1],
			["w", "%m.sound_effect 소리 %n 번 재생하고 기다리기", "sallyPlaySoundTimesUntilDone", "삐", 1],
			[" ", "버저 음을 %n 만큼 바꾸기", "sallyChangeBuzzerBy", 10],
			[" ", "버저 음을 %n (으)로 정하기", "sallySetBuzzerTo", 1000],
			[" ", "소리 끄기", "sallyClearSound"],
			[" ", "%m.note %m.octave 음을 연주하기", "sallyPlayNote", "도", "4"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "sallyPlayNoteForBeats", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "sallyRestForBeats", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "sallyChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "sallySetTempoTo", 60],
			["-"],
			["r", "색깔 번호", "sallyColorNumber"],
			["r", "색깔 패턴", "sallyColorPattern"],
			["r", "색깔 R", "sallyColorRed"],
			["r", "색깔 G", "sallyColorGreen"],
			["r", "색깔 B", "sallyColorBlue"],
			["r", "바닥 센서", "sallyFloor"],
			["r", "버튼", "sallyButton"],
			["r", "x축 가속도", "sallyAccelerationX"],
			["r", "y축 가속도", "sallyAccelerationY"],
			["r", "z축 가속도", "sallyAccelerationZ"],
			["r", "온도", "sallyTemperature"],
			["r", "신호 세기", "sallySignalStrength"],
			["h", "%m.touching_color 에 닿았을 때", "sallyWhenColorTouched", "빨간색"],
			["h", "색깔 패턴이 %m.pattern_color_black %m.pattern_color_black 일 때", "sallyWhenColorPattern", "검은색", "빨간색"],
			["h", "버튼을 %m.when_button_state 때", "sallyWhenButtonState", "클릭했을"],
			["h", "%m.when_s_tilt 때", "sallyWhenTilt", "앞으로 기울였을"],
			["b", "%m.touching_color 에 닿았는가?", "sallyTouchingColor", "빨간색"],
			["b", "색깔 패턴이 %m.pattern_color_black %m.pattern_color_black 인가?", "sallyIsColorPattern", "검은색", "빨간색"],
			["b", "버튼을 %m.button_state ?", "sallyButtonState", "클릭했는가"],
			["b", "%m.s_tilt ?", "sallyTilt", "앞으로 기울임"],
			["b", "배터리 %m.battery ?", "sallyBattery", "정상"]
		],
		ja1: [
			["w", "前へ移動する", "sallyMoveForward"],
			["w", "後ろへ移動する", "sallyMoveBackward"],
			["w", "%m.left_right へ回る", "sallyTurn", "左"],
			["-"],
			[" ", "LEDを %m.led_color にする", "sallySetLedTo", "赤色"],
			[" ", "LEDをオフにする", "sallyClearLed"],
			["-"],
			[" ", "%m.sound_effect 音を再生する", "sallyPlaySound", "ビープ"],
			[" ", "音をオフにする", "sallyClearSound"],
			["-"],
			["h", "%m.touching_color に触れたとき", "sallyWhenColorTouched", "赤色"],
			["h", "ボタンを %m.when_button_state とき", "sallyWhenButtonState", "クリックした"],
			["b", "%m.touching_color に触れたか?", "sallyTouchingColor", "赤色"],
			["b", "ボタンを %m.button_state ?", "sallyButtonState", "クリックしたか"]
		],
		ja2: [
			["w", "前へ %n %m.cm_sec 移動する", "sallyMoveForwardUnit", 6, "cm"],
			["w", "後ろへ %n %m.cm_sec 移動する", "sallyMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right へ %n %m.deg_sec その場所で回る", "sallyTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.left_right 車輪を中心に %n %m.deg_sec %m.forward_backward 方向へ回る", "sallyPivotAroundWheelUnitInDirection", "左", 90, "度", "前"],
			["-"],
			[" ", "LEDを %m.led_color にする", "sallySetLedTo", "赤色"],
			[" ", "LEDをオフにする", "sallyClearLed"],
			["-"],
			[" ", "%m.sound_effect 音を %n 回再生する", "sallyPlaySoundTimes", "ビープ", 1],
			["w", "%m.sound_effect 音を %n 回再生して待つ", "sallyPlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "音をオフにする", "sallyClearSound"],
			["w", "%m.note %m.octave 音を %d.beats 拍子奏でる", "sallyPlayNoteForBeats", "ド", "4", 0.5],
			["w", "%d.beats 拍子止める", "sallyRestForBeats", 0.25],
			[" ", "演奏の速さを %n ずつ変える", "sallyChangeTempoBy", 20],
			[" ", "演奏の速さを %n BPMにする", "sallySetTempoTo", 60],
			["-"],
			["h", "%m.touching_color に触れたとき", "sallyWhenColorTouched", "赤色"],
			["h", "色パターンが %m.pattern_color_black %m.pattern_color_black であるとき", "sallyWhenColorPattern", "黒色", "赤色"],
			["h", "ボタンを %m.when_button_state とき", "sallyWhenButtonState", "クリックした"],
			["h", "%m.when_s_tilt とき", "sallyWhenTilt", "前に傾けた"],
			["b", "%m.touching_color に触れたか?", "sallyTouchingColor", "赤色"],
			["b", "色パターンが %m.pattern_color_black %m.pattern_color_black ですか?", "sallyIsColorPattern", "黒色", "赤色"],
			["b", "ボタンを %m.button_state ?", "sallyButtonState", "クリックしたか"],
			["b", "%m.s_tilt ?", "sallyTilt", "前に傾けたか"]
		],
		ja3: [
			["w", "前へ %n %m.move_unit 移動する", "sallyMoveForwardUnit", 6, "cm"],
			["w", "後ろへ %n %m.move_unit 移動する", "sallyMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right へ %n %m.turn_unit その場所で回る", "sallyTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.left_right 車輪を中心に %n %m.turn_unit %m.forward_backward 方向へ回る", "sallyPivotAroundWheelUnitInDirection", "左", 90, "度", "前"],
			[" ", "左車輪を %n 右車輪を %n ずつ変える", "sallyChangeWheelsByLeftRight", 10, 10],
			[" ", "左車輪を %n 右車輪を %n にする", "sallySetWheelsToLeftRight", 40, 40],
			[" ", "%m.left_right_both 車輪を %n ずつ変える", "sallyChangeWheelBy", "左", 10],
			[" ", "%m.left_right_both 車輪を %n にする", "sallySetWheelTo", "左", 40],
			[" ", "線に沿って移動する", "sallyFollowLine"],
			["w", "線に沿って %m.target_color まで移動する", "sallyFollowLineUntil", "赤色"],
			["w", "線にそって交差点まで移動する", "sallyFollowLineUntilIntersection"],
			["w", "交差点を渡る", "sallyCrossIntersection"],
			["w", "交差点で %m.left_right_back へ回る", "sallyTurnAtIntersection", "左"],
			["w", "%m.left_right 線へ渡り行く", "sallyJumpLine", "左"],
			[" ", "線に沿って移動する速さを %m.speed にする", "sallySetFollowingSpeedTo", "4"],
			[" ", "停止する", "sallyStop"],
			["-"],
			[" ", "LEDを %m.led_color にする", "sallySetLedTo", "赤色"],
			[" ", "LEDをR: %n G: %n B: %n ずつ変える", "sallyChangeLedByRGB", 10, 0, 0],
			[" ", "LEDをR: %n G: %n B: %n にする", "sallySetLedToRGB", 255, 0, 0],
			[" ", "LEDをオフにする", "sallyClearLed"],
			["-"],
			[" ", "%m.sound_effect 音を %n 回再生する", "sallyPlaySoundTimes", "ビープ", 1],
			["w", "%m.sound_effect 音を %n 回再生して待つ", "sallyPlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "ブザー音を %n ずつ変える", "sallyChangeBuzzerBy", 10],
			[" ", "ブザー音を %n にする", "sallySetBuzzerTo", 1000],
			[" ", "音をオフにする", "sallyClearSound"],
			[" ", "%m.note %m.octave 音を奏でる", "sallyPlayNote", "ド", "4"],
			["w", "%m.note %m.octave 音を %d.beats 拍子奏でる", "sallyPlayNoteForBeats", "ド", "4", 0.5],
			["w", "%d.beats 拍子止める", "sallyRestForBeats", 0.25],
			[" ", "演奏の速さを %n ずつ変える", "sallyChangeTempoBy", 20],
			[" ", "演奏の速さを %n BPMにする", "sallySetTempoTo", 60],
			["-"],
			["r", "色番号", "sallyColorNumber"],
			["r", "色パターン", "sallyColorPattern"],
			["r", "色R", "sallyColorRed"],
			["r", "色G", "sallyColorGreen"],
			["r", "色B", "sallyColorBlue"],
			["r", "床底センサー", "sallyFloor"],
			["r", "ボタン", "sallyButton"],
			["r", "x軸加速度", "sallyAccelerationX"],
			["r", "y軸加速度", "sallyAccelerationY"],
			["r", "z軸加速度", "sallyAccelerationZ"],
			["r", "温度", "sallyTemperature"],
			["r", "信号強度", "sallySignalStrength"],
			["h", "%m.touching_color に触れたとき", "sallyWhenColorTouched", "赤色"],
			["h", "色パターンが %m.pattern_color_black %m.pattern_color_black であるとき", "sallyWhenColorPattern", "黒色", "赤色"],
			["h", "ボタンを %m.when_button_state とき", "sallyWhenButtonState", "クリックした"],
			["h", "%m.when_s_tilt とき", "sallyWhenTilt", "前に傾けた"],
			["b", "%m.touching_color に触れたか?", "sallyTouchingColor", "赤色"],
			["b", "色パターンが %m.pattern_color_black %m.pattern_color_black ですか?", "sallyIsColorPattern", "黒色", "赤色"],
			["b", "ボタンを %m.button_state ?", "sallyButtonState", "クリックしたか"],
			["b", "%m.s_tilt ?", "sallyTilt", "前に傾けたか"],
			["b", "電池充電が %m.battery ?", "sallyBattery", "正常か"]
		],
		uz1: [
			["w", "oldinga yurish", "sallyMoveForward"],
			["w", "orqaga yurish", "sallyMoveBackward"],
			["w", "%m.left_right ga o'girilish", "sallyTurn", "chap"],
			["-"],
			[" ", "LEDni %m.led_color ga sozlash", "sallySetLedTo", "qizil"],
			[" ", "LEDni o'chirish", "sallyClearLed"],
			["-"],
			[" ", "%m.sound_effect tovushni ijro etish", "sallyPlaySound", "qisqa"],
			[" ", "tovushni o'chirish", "sallyClearSound"],
			["-"],
			["h", "%m.touching_color ga tegilganda", "sallyWhenColorTouched", "qizil"],
			["h", "tugmani %m.when_button_state da", "sallyWhenButtonState", "bosgan"],
			["b", "%m.touching_color ga tekkan?", "sallyTouchingColor", "qizil"],
			["b", "tugmani %m.button_state ?", "sallyButtonState", "bosgan"]
		],
		uz2: [
			["w", "oldinga %n %m.cm_sec yurish", "sallyMoveForwardUnit", 6, "cm"],
			["w", "orqaga %n %m.cm_sec yurish", "sallyMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "sallyTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.left_right g'ildirak markaziga %n %m.deg_sec %m.forward_backward yo'nalishga o'girilish", "sallyPivotAroundWheelUnitInDirection", "chap", 90, "daraja", "old"],
			["-"],
			[" ", "LEDni %m.led_color ga sozlash", "sallySetLedTo", "qizil"],
			[" ", "LEDni o'chirish", "sallyClearLed"],
			["-"],
			[" ", "%m.sound_effect tovushni %n marta ijro etish", "sallyPlaySoundTimes", "qisqa", 1],
			["w", "%m.sound_effect tovushni %n marta ijro tugaguncha kutish", "sallyPlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "tovushni o'chirish", "sallyClearSound"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "sallyPlayNoteForBeats", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "sallyRestForBeats", 0.25],
			[" ", "temni %n ga o'zgartirish", "sallyChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "sallySetTempoTo", 60],
			["-"],
			["h", "%m.touching_color ga tegilganda", "sallyWhenColorTouched", "qizil"],
			["h", "rang naqshi %m.pattern_color_black %m.pattern_color_black bo'lganida", "sallyWhenColorPattern", "qora", "qizil"],
			["h", "tugmani %m.when_button_state da", "sallyWhenButtonState", "bosgan"],
			["h", "%m.when_s_tilt bo'lganda", "sallyWhenTilt", "oldinga eğin"],
			["b", "%m.touching_color ga tekkan?", "sallyTouchingColor", "qizil"],
			["b", "rang naqshi %m.pattern_color_black %m.pattern_color_black ?", "sallyIsColorPattern", "qora", "qizil"],
			["b", "tugmani %m.button_state ?", "sallyButtonState", "bosgan"],
			["b", "%m.s_tilt ?", "sallyTilt", "oldinga eğin"]
		],
		uz3: [
			["w", "oldinga %n %m.move_unit yurish", "sallyMoveForwardUnit", 6, "cm"],
			["w", "orqaga %n %m.move_unit yurish", "sallyMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "sallyTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.left_right g'ildirak markaziga %n %m.turn_unit %m.forward_backward yo'nalishga o'girilish", "sallyPivotAroundWheelUnitInDirection", "chap", 90, "daraja", "old"],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "sallyChangeWheelsByLeftRight", 10, 10],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "sallySetWheelsToLeftRight", 40, 40],
			[" ", "%m.left_right_both g'ildirakni %n ga o'zgartirish", "sallyChangeWheelBy", "chap", 10],
			[" ", "%m.left_right_both g'ildirakni %n ga sozlash", "sallySetWheelTo", "chap", 40],
			[" ", "chiziqqa ergashish", "sallyFollowLine"],
			["w", "chiziq ustida %m.target_color gacha yurish", "sallyFollowLineUntil", "qizil"],
			["w", "chiziq ustida chorrahagacha yurish", "sallyFollowLineUntilIntersection"],
			["w", "chorrahadan o'tib yurish", "sallyCrossIntersection"],
			["w", "chorrahada %m.left_right_back ga o'girilish", "sallyTurnAtIntersection", "chap"],
			["w", "%m.left_right chiziqqa sakrash", "sallyJumpLine", "chap"],
			[" ", "liniyada ergashish tezligini %m.speed ga sozlash", "sallySetFollowingSpeedTo", "4"],
			[" ", "to'xtatish", "sallyStop"],
			["-"],
			[" ", "LEDni %m.led_color ga sozlash", "sallySetLedTo", "qizil"],
			[" ", "LEDni r: %n g: %n b: %n ga o'zgartirish", "sallyChangeLedByRGB", 10, 0, 0],
			[" ", "LEDni r: %n g: %n b: %n ga sozlash", "sallySetLedToRGB", 255, 0, 0],
			[" ", "LEDni o'chirish", "sallyClearLed"],
			["-"],
			[" ", "%m.sound_effect tovushni %n marta ijro etish", "sallyPlaySoundTimes", "qisqa", 1],
			["w", "%m.sound_effect tovushni %n marta ijro tugaguncha kutish", "sallyPlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "buzerning ovozini %n ga o'zgartirish", "sallyChangeBuzzerBy", 10],
			[" ", "buzerning ovozini %n ga sozlash", "sallySetBuzzerTo", 1000],
			[" ", "tovushni o'chirish", "sallyClearSound"],
			[" ", "%m.note %m.octave notani ijro etish", "sallyPlayNote", "do", "4"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "sallyPlayNoteForBeats", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "sallyRestForBeats", 0.25],
			[" ", "temni %n ga o'zgartirish", "sallyChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "sallySetTempoTo", 60],
			["-"],
			["r", "rang raqami", "sallyColorNumber"],
			["r", "rang naqshi", "sallyColorPattern"],
			["r", "rang r", "sallyColorRed"],
			["r", "rang g", "sallyColorGreen"],
			["r", "rang b", "sallyColorBlue"],
			["r", "taglik sensori", "sallyFloor"],
			["r", "tugma", "sallyButton"],
			["r", "x tezlanish", "sallyAccelerationX"],
			["r", "y tezlanish", "sallyAccelerationY"],
			["r", "z tezlanish", "sallyAccelerationZ"],
			["r", "harorat", "sallyTemperature"],
			["r", "signal kuchi", "sallySignalStrength"],
			["h", "%m.touching_color ga tegilganda", "sallyWhenColorTouched", "qizil"],
			["h", "rang naqshi %m.pattern_color_black %m.pattern_color_black bo'lganida", "sallyWhenColorPattern", "qora", "qizil"],
			["h", "tugmani %m.when_button_state da", "sallyWhenButtonState", "bosgan"],
			["h", "%m.when_s_tilt bo'lganda", "sallyWhenTilt", "oldinga eğin"],
			["b", "%m.touching_color ga tekkan?", "sallyTouchingColor", "qizil"],
			["b", "rang naqshi %m.pattern_color_black %m.pattern_color_black ?", "sallyIsColorPattern", "qora", "qizil"],
			["b", "tugmani %m.button_state ?", "sallyButtonState", "bosgan"],
			["b", "%m.s_tilt ?", "sallyTilt", "oldinga eğin"],
			["b", "batareya %m.battery ?", "sallyBattery", "normal"]
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
			"left_right_both": ["左", "右", "両方"],
			"left_right_back": ["左", "右", "後ろ"],
			"target_color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色", "全ての色"],
			"touching_color": ["赤色", "オレンジ色", "黄色", "緑色", "水色", "青色", "紫色", "黒色", "白色"],
			"pattern_color_black": ["黒色", "赤色", "黄色", "緑色", "水色", "青色", "紫色"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["赤色", "オレンジ色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"sound_effect": ["ビープ", "ランダムビープ", "ノイズ", "サイレン", "エンジン", "チョップ", "ロボット", "ディバディバディップ", "よくできました", "幸せ", "怒り", "悲しみ", "眠い", "行進", "誕生日"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["クリックした", "ダブルクリックした", "長く押した"],
			"when_s_tilt": ["前に傾けた", "後ろに傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾いてなかった", "叩いた", "自由落下した"],
			"button_state": ["クリックしたか", "ダブルクリックしたか", "長く押したか"],
			"s_tilt": ["前に傾けたか", "後ろに傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾いてないか", "叩いたか", "自由落下したか"],
			"battery": ["正常か", "不足しているか", "なくなったか"]
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
	
	LineRobot.prototype.followLineUntilIntersection = function(callback) {
		var motoring = this.motoring;
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(9);
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
				sock.binaryType = 'arraybuffer';
				socket = sock;
				sock.onmessage = function(message) {
					try {
						var received = JSON.parse(message.data);
						if(received.type == 0) {
							if(received.route && received.states) {
								connectionState = received.states[received.route.module][received.route.index];
							}
						} else {
							if(received.index >= 0) {
								var robot = getOrCreateRobot(received.group, received.module, received.index);
								if(robot) {
									robot.sensory = received;
									robot.handleSensory();
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
	
	ext.sallyMoveForward = function(callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.moveForward(callback);
	};
	
	ext.sallyMoveBackward = function(callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.sallyTurn = function(direction, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.turn(direction, callback);
	};

	ext.sallyMoveForwardUnit = function(value, unit, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.moveForwardUnit(value, unit, callback);
	};

	ext.sallyMoveBackwardUnit = function(value, unit, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.moveBackwardUnit(value, unit, callback);
	};

	ext.sallyTurnUnitInPlace = function(direction, value, unit, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.turnUnit(direction, value, unit, callback);
	};
	
	ext.sallyPivotAroundWheelUnitInDirection = function(wheel, value, unit, toward, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.pivotUnit(wheel, value, unit, toward, callback);
	};
	
	ext.sallyTurnUnitWithRadiusInDirection = function(direction, value, unit, radius, toward, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.circleUnit(direction, value, unit, radius, toward, callback);
	};
	
	ext.sallyChangeWheelsByLeftRight = function(left, right) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.changeWheels(left, right);
	};

	ext.sallySetWheelsToLeftRight = function(left, right) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.setWheels(left, right);
	};

	ext.sallyChangeWheelBy = function(wheel, velocity) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.changeWheel(wheel, velocity);
	};

	ext.sallySetWheelTo = function(wheel, velocity) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.setWheel(wheel, velocity);
	};

	ext.sallyFollowLine = function() {
		var robot = getRobot(LINE, 0);
		if(robot) robot.followLine();
	};

	ext.sallyFollowLineUntil = function(color, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.followLineUntil(color, callback);
	};
	
	ext.sallyFollowLineUntilIntersection = function(callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.followLineUntilIntersection(callback);
	};
	
	ext.sallyCrossIntersection = function(callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.crossIntersection(callback);
	};
	
	ext.sallyTurnAtIntersection = function(direction, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.turnAtIntersection(direction, callback);
	};
	
	ext.sallyJumpLine = function(direction, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.jumpLine(direction, callback);
	};

	ext.sallySetFollowingSpeedTo = function(speed) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.setLineTracerSpeed(speed);
	};

	ext.sallyStop = function() {
		var robot = getRobot(LINE, 0);
		if(robot) robot.stop();
	};

	ext.sallySetLedTo = function(color) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.setLedColor(color);
	};
	
	ext.sallyChangeLedByRGB = function(red, green, blue) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.changeLedRgb(red, green, blue);
	};
	
	ext.sallySetLedToRGB = function(red, green, blue) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.setLedRgb(red, green, blue);
	};

	ext.sallyClearLed = function() {
		var robot = getRobot(LINE, 0);
		if(robot) robot.clearLed();
	};

	ext.sallyPlaySound = function(sound) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.playSound(sound, 1);
	};
	
	ext.sallyPlaySoundTimes = function(sound, count) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.playSound(sound, count);
	};
	
	ext.sallyPlaySoundTimesUntilDone = function(sound, count, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.playSoundUntil(sound, count, callback);
	};

	ext.sallyChangeBuzzerBy = function(hz) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.changeBuzzer(hz);
	};

	ext.sallySetBuzzerTo = function(hz) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.setBuzzer(hz);
	};

	ext.sallyClearSound = function() {
		var robot = getRobot(LINE, 0);
		if(robot) robot.clearSound();
	};
	
	ext.sallyPlayNote = function(note, octave) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.sallyPlayNoteForBeats = function(note, octave, beat, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};

	ext.sallyRestForBeats = function(beat, callback) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.restBeat(beat, callback);
	};

	ext.sallyChangeTempoBy = function(bpm) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.changeTempo(bpm);
	};

	ext.sallySetTempoTo = function(bpm) {
		var robot = getRobot(LINE, 0);
		if(robot) robot.setTempo(bpm);
	};

	ext.sallyWhenColorTouched = function(color) {
		var robot = getRobot(LINE, 0);
		return robot ? robot.checkTouchingColor(color) : false;
	};
	
	ext.sallyWhenColorPattern = function(color1, color2) {
		var robot = getRobot(LINE, 0);
		return robot ? robot.checkColorPattern(color1, color2) : false;
	};
	
	ext.sallyWhenButtonState = function(state) {
		var robot = getRobot(LINE, 0);
		return robot ? robot.checkButtonEvent(state) : false;
	};
	
	ext.sallyWhenTilt = function(tilt) {
		var robot = getRobot(LINE, 0);
		return robot ? robot.checkTilt(tilt) : false;
	};
	
	ext.sallyTouchingColor = function(color) {
		var robot = getRobot(LINE, 0);
		return robot ? robot.checkTouchingColor(color) : false;
	};
	
	ext.sallyIsColorPattern = function(color1, color2) {
		var robot = getRobot(LINE, 0);
		return robot ? robot.checkColorPattern(color1, color2) : false;
	};
	
	ext.sallyButtonState = function(state) {
		var robot = getRobot(LINE, 0);
		return robot ? robot.checkButtonEvent(state) : false;
	};
	
	ext.sallyTilt = function(tilt) {
		var robot = getRobot(LINE, 0);
		return robot ? robot.checkTilt(tilt) : false;
	};
	
	ext.sallyBattery = function(state) {
		var robot = getRobot(LINE, 0);
		return robot ? robot.checkBattery(state) : false;
	};

	ext.sallyColorNumber = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getColorNumber() : -1;
	};

	ext.sallyColorPattern = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getColorPattern() : -1;
	};
	
	ext.sallyColorRed = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getColorRed() : 0;
	};
	
	ext.sallyColorGreen = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getColorGreen() : 0;
	};
	
	ext.sallyColorBlue = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getColorBlue() : 0;
	};

	ext.sallyFloor = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getFloor() : 0;
	};

	ext.sallyButton = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getButton() : 0;
	};

	ext.sallyAccelerationX = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getAccelerationX() : 0;
	};

	ext.sallyAccelerationY = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getAccelerationY() : 0;
	};

	ext.sallyAccelerationZ = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getAccelerationZ() : 0;
	};
	
	ext.sallyTemperature = function() {
		var robot = getRobot(LINE, 0);
		return robot ? robot.getTemperature() : 0;
	};
	
	ext.sallySignalStrength = function() {
		var robot = getRobot(LINE, 0);
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

	open('ws://localhost:56417');
})({});
