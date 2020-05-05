(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const ALBERTAI = 'albertai';
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
		en: [ 'Please run Albert Coding software.', 'Robot is not connected.', 'Ready' ],
		ko: [ '알버트 코딩 소프트웨어를 실행해 주세요.', '로봇이 연결되어 있지 않습니다.', '정상입니다.' ],
		ja: [ 'アルバートコーディングソフトウェアを実行してください。', 'ロボットが接続されていません。', '正常です。' ],
		uz: [ 'Albert Kodlash dasturini ishga tushiring.', 'Robot ulanmagan.', 'Tayyorlangan' ]
	};
	const EXTENSION_NAME = {
		en: 'Albert AI',
		ko: '알버트 AI',
		ja: 'アルバートAI',
		uz: 'Albert AI'
	};
	const BLOCKS = {
		en1: [
			["w", "move forward", "albertaiMoveForward"],
			["w", "move backward", "albertaiMoveBackward"],
			["w", "turn %m.left_right", "albertaiTurn", "left"],
			["-"],
			[" ", "set %m.left_right_both eye to %m.led_color", "albertaiSetEyeTo", "left", "red"],
			[" ", "clear %m.left_right_both eye", "albertaiClearEye", "left"],
			["-"],
			[" ", "play sound %m.albertai_sound", "albertaiPlaySound", "beep"],
			[" ", "clear sound", "albertaiClearSound"],
			["-"],
			["h", "when hand found", "albertaiWhenHandFound"],
			["h", "when %m.touch_sensor touch sensor %m.when_touch_state", "albertaiWhenTouchState", "mic", "clicked"],
			["b", "hand found?", "albertaiHandFound"],
			["b", "%m.touch_sensor touch sensor %m.touch_state ?", "albertaiTouchState", "mic", "clicked"]
		],
		en2: [
			["w", "move forward %n %m.cm_sec", "albertaiMoveForwardUnit", 5, "cm"],
			["w", "move backward %n %m.cm_sec", "albertaiMoveBackwardUnit", 5, "cm"],
			["w", "turn %m.left_right %n %m.deg_sec in place", "albertaiTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.left_right wheel %n %m.deg_sec in %m.forward_backward direction", "albertaiPivotAroundWheelUnitInDirection", "left", 90, "degrees", "forward"],
			["-"],
			[" ", "set %m.left_right_both eye to %m.led_color", "albertaiSetEyeTo", "left", "red"],
			[" ", "clear %m.left_right_both eye", "albertaiClearEye", "left"],
			["-"],
			[" ", "play sound %m.albertai_sound %n times", "albertaiPlaySoundTimes", "beep", 1],
			["w", "play sound %m.albertai_sound %n times until done", "albertaiPlaySoundTimesUntilDone", "beep", 1],
			[" ", "clear sound", "albertaiClearSound"],
			["w", "play note %m.note %m.octave for %d.beats beats", "albertaiPlayNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "albertaiRestFor", 0.25],
			[" ", "change tempo by %n", "albertaiChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "albertaiSetTempoTo", 60],
			["-"],
			["h", "when hand found", "albertaiWhenHandFound"],
			["h", "when %m.touch_sensor touch sensor %m.when_touch_state", "albertaiWhenTouchState", "mic", "clicked"],
			["h", "when %m.when_albertai_tilt", "albertaiWhenTilt", "tilt forward"],
			["b", "hand found?", "albertaiHandFound"],
			["b", "%m.touch_sensor touch sensor %m.touch_state ?", "albertaiTouchState", "mic", "clicked"],
			["b", "%m.albertai_tilt ?", "albertaiTilt", "tilt forward"]
		],
		en3: [
			["w", "move forward %n %m.move_unit", "albertaiMoveForwardUnit", 5, "cm"],
			["w", "move backward %n %m.move_unit", "albertaiMoveBackwardUnit", 5, "cm"],
			["w", "turn %m.left_right %n %m.turn_unit in place", "albertaiTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.left_right wheel %n %m.turn_unit in %m.forward_backward direction", "albertaiPivotAroundWheelUnitInDirection", "left", 90, "degrees", "forward"],
			[" ", "change wheels by left: %n right: %n", "albertaiChangeBothWheelsBy", 10, 10],
			[" ", "set wheels to left: %n right: %n", "albertaiSetBothWheelsTo", 50, 50],
			[" ", "change %m.left_right_both wheel by %n", "albertaiChangeWheelBy", "left", 10],
			[" ", "set %m.left_right_both wheel to %n", "albertaiSetWheelTo", "left", 50],
			[" ", "stop", "albertaiStop"],
			["w", "move %m.move_forward_backward to x: %n y: %n on board", "albertaiMoveToOnBoard", "forward", 0, 0],
			["w", "turn towards %n degrees on board", "albertaiSetOrientationToOnBoard", 0],
			["-"],
			[" ", "set %m.left_right_both eye to %m.led_color", "albertaiSetEyeTo", "left", "red"],
			[" ", "change %m.left_right_both eye by r: %n g: %n b: %n", "albertaiChangeEyeByRGB", "left", 10, 0, 0],
			[" ", "set %m.left_right_both eye to r: %n g: %n b: %n", "albertaiSetEyeToRGB", "left", 255, 0, 0],
			[" ", "clear %m.left_right_both eye", "albertaiClearEye", "left"],
			["-"],
			[" ", "play sound %m.albertai_sound %n times", "albertaiPlaySoundTimes", "beep", 1],
			["w", "play sound %m.albertai_sound %n times until done", "albertaiPlaySoundTimesUntilDone", "beep", 1],
			[" ", "change buzzer by %n", "albertaiChangeBuzzerBy", 10],
			[" ", "set buzzer to %n", "albertaiSetBuzzerTo", 1000],
			[" ", "clear sound", "albertaiClearSound"],
			[" ", "play note %m.note %m.octave", "albertaiPlayNote", "C", "4"],
			["w", "play note %m.note %m.octave for %d.beats beats", "albertaiPlayNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "albertaiRestFor", 0.25],
			[" ", "change tempo by %n", "albertaiChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "albertaiSetTempoTo", 60],
			["-"],
			["r", "left proximity", "albertaiLeftProximity"],
			["r", "right proximity", "albertaiRightProximity"],
			["r", "x acceleration", "albertaiAccelerationX"],
			["r", "y acceleration", "albertaiAccelerationY"],
			["r", "z acceleration", "albertaiAccelerationZ"],
			["r", "mic touch", "albertaiMicTouch"],
			["r", "volume up touch", "albertaiVolumeUpTouch"],
			["r", "volume down touch", "albertaiVolumeDownTouch"],
			["r", "play touch", "albertaiPlayTouch"],
			["r", "back touch", "albertaiBackTouch"],
			["r", "oid mode", "albertaiOidMode"],
			["r", "oid", "albertaiOid"],
			["r", "lift", "albertaiLift"],
			["r", "x position", "albertaiPositionX"],
			["r", "y position", "albertaiPositionY"],
			["r", "orientation", "albertaiOrientation"],
			["r", "light", "albertaiLight"],
			["r", "signal strength", "albertaiSignalStrength"],
			["h", "when hand found", "albertaiWhenHandFound"],
			["h", "when %m.touch_sensor touch sensor %m.when_touch_state", "albertaiWhenTouchState", "mic", "clicked"],
			["h", "when oid is %n", "albertaiWhenOid", 0],
			["h", "when %m.when_albertai_tilt", "albertaiWhenTilt", "tilt forward"],
			["b", "hand found?", "albertaiHandFound"],
			["b", "%m.touch_sensor touch sensor %m.touch_state ?", "albertaiTouchState", "mic", "clicked"],
			["b", "oid %n ?", "albertaiIsOid", 0],
			["b", "%m.albertai_tilt ?", "albertaiTilt", "tilt forward"],
			["b", "battery %m.battery ?", "albertaiBattery", "normal"]
		],
		ko1: [
			["w", "앞으로 이동하기", "albertaiMoveForward"],
			["w", "뒤로 이동하기", "albertaiMoveBackward"],
			["w", "%m.left_right 으로 돌기", "albertaiTurn", "왼쪽"],
			["-"],
			[" ", "%m.left_right_both 눈을 %m.led_color 으로 정하기", "albertaiSetEyeTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both 눈 끄기", "albertaiClearEye", "왼쪽"],
			["-"],
			[" ", "%m.albertai_sound 소리 재생하기", "albertaiPlaySound", "삐"],
			[" ", "소리 끄기", "albertaiClearSound"],
			["-"],
			["h", "손 찾았을 때", "albertaiWhenHandFound"],
			["h", "%m.touch_sensor 터치 센서를 %m.when_touch_state 때", "albertaiWhenTouchState", "마이크", "클릭했을"],
			["b", "손 찾음?", "albertaiHandFound"],
			["b", "%m.touch_sensor 터치 센서를 %m.touch_state ?", "albertaiTouchState", "마이크", "클릭했는가"]
		],
		ko2: [
			["w", "앞으로 %n %m.cm_sec 이동하기", "albertaiMoveForwardUnit", 5, "cm"],
			["w", "뒤로 %n %m.cm_sec 이동하기", "albertaiMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right 으로 %n %m.deg_sec 제자리 돌기", "albertaiTurnUnitInPlace", "왼쪽", 90, "도"],
			["w", "%m.left_right 바퀴 중심으로 %n %m.deg_sec %m.forward_backward 방향으로 돌기", "albertaiPivotAroundWheelUnitInDirection", "왼쪽", 90, "도", "앞쪽"],
			["-"],
			[" ", "%m.left_right_both 눈을 %m.led_color 으로 정하기", "albertaiSetEyeTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both 눈 끄기", "albertaiClearEye", "왼쪽"],
			["-"],
			[" ", "%m.albertai_sound 소리 %n 번 재생하기", "albertaiPlaySoundTimes", "삐", 1],
			["w", "%m.albertai_sound 소리 %n 번 재생하고 기다리기", "albertaiPlaySoundTimesUntilDone", "삐", 1],
			[" ", "소리 끄기", "albertaiClearSound"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "albertaiPlayNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "albertaiRestFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "albertaiChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "albertaiSetTempoTo", 60],
			["-"],
			["h", "손 찾았을 때", "albertaiWhenHandFound"],
			["h", "%m.touch_sensor 터치 센서를 %m.when_touch_state 때", "albertaiWhenTouchState", "마이크", "클릭했을"],
			["h", "%m.when_albertai_tilt 때", "albertaiWhenTilt", "앞으로 기울였을"],
			["b", "손 찾음?", "albertaiHandFound"],
			["b", "%m.touch_sensor 터치 센서를 %m.touch_state ?", "albertaiTouchState", "마이크", "클릭했는가"],
			["b", "%m.albertai_tilt ?", "albertaiTilt", "앞으로 기울임"]
		],
		ko3: [
			["w", "앞으로 %n %m.move_unit 이동하기", "albertaiMoveForwardUnit", 5, "cm"],
			["w", "뒤로 %n %m.move_unit 이동하기", "albertaiMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right 으로 %n %m.turn_unit 제자리 돌기", "albertaiTurnUnitInPlace", "왼쪽", 90, "도"],
			["w", "%m.left_right 바퀴 중심으로 %n %m.turn_unit %m.forward_backward 방향으로 돌기", "albertaiPivotAroundWheelUnitInDirection", "왼쪽", 90, "도", "앞쪽"],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "albertaiChangeBothWheelsBy", 10, 10],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "albertaiSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both 바퀴 %n 만큼 바꾸기", "albertaiChangeWheelBy", "왼쪽", 10],
			[" ", "%m.left_right_both 바퀴 %n (으)로 정하기", "albertaiSetWheelTo", "왼쪽", 50],
			[" ", "정지하기", "albertaiStop"],
			["w", "말판 %m.move_forward_backward x: %n y: %n 위치로 이동하기", "albertaiMoveToOnBoard", "앞으로", 0, 0],
			["w", "말판 %n 도 방향으로 돌기", "albertaiSetOrientationToOnBoard", 0],
			["-"],
			[" ", "%m.left_right_both 눈을 %m.led_color 으로 정하기", "albertaiSetEyeTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both 눈을 R: %n G: %n B: %n 만큼 바꾸기", "albertaiChangeEyeByRGB", "왼쪽", 10, 0, 0],
			[" ", "%m.left_right_both 눈을 R: %n G: %n B: %n (으)로 정하기", "albertaiSetEyeToRGB", "왼쪽", 255, 0, 0],
			[" ", "%m.left_right_both 눈 끄기", "albertaiClearEye", "왼쪽"],
			["-"],
			[" ", "%m.albertai_sound 소리 %n 번 재생하기", "albertaiPlaySoundTimes", "삐", 1],
			["w", "%m.albertai_sound 소리 %n 번 재생하고 기다리기", "albertaiPlaySoundTimesUntilDone", "삐", 1],
			[" ", "버저 음을 %n 만큼 바꾸기", "albertaiChangeBuzzerBy", 10],
			[" ", "버저 음을 %n (으)로 정하기", "albertaiSetBuzzerTo", 1000],
			[" ", "소리 끄기", "albertaiClearSound"],
			[" ", "%m.note %m.octave 음을 연주하기", "albertaiPlayNote", "도", "4"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "albertaiPlayNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "albertaiRestFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "albertaiChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "albertaiSetTempoTo", 60],
			["-"],
			["r", "왼쪽 근접 센서", "albertaiLeftProximity"],
			["r", "오른쪽 근접 센서", "albertaiRightProximity"],
			["r", "x축 가속도", "albertaiAccelerationX"],
			["r", "y축 가속도", "albertaiAccelerationY"],
			["r", "z축 가속도", "albertaiAccelerationZ"],
			["r", "마이크 터치", "albertaiMicTouch"],
			["r", "소리 크게 터치", "albertaiVolumeUpTouch"],
			["r", "소리 작게 터치", "albertaiVolumeDownTouch"],
			["r", "실행 터치", "albertaiPlayTouch"],
			["r", "뒤로 터치", "albertaiBackTouch"],
			["r", "OID 모드", "albertaiOidMode"],
			["r", "OID", "albertaiOid"],
			["r", "들어올림", "albertaiLift"],
			["r", "x 위치", "albertaiPositionX"],
			["r", "y 위치", "albertaiPositionY"],
			["r", "방향", "albertaiOrientation"],
			["r", "밝기", "albertaiLight"],
			["r", "신호 세기", "albertaiSignalStrength"],
			["h", "손 찾았을 때", "albertaiWhenHandFound"],
			["h", "%m.touch_sensor 터치 센서를 %m.when_touch_state 때", "albertaiWhenTouchState", "마이크", "클릭했을"],
			["h", "OID가 %n 일 때", "albertaiWhenOid", 0],
			["h", "%m.when_albertai_tilt 때", "albertaiWhenTilt", "앞으로 기울였을"],
			["b", "손 찾음?", "albertaiHandFound"],
			["b", "%m.touch_sensor 터치 센서를 %m.touch_state ?", "albertaiTouchState", "마이크", "클릭했는가"],
			["b", "OID가 %n 인가?", "albertaiIsOid", 0],
			["b", "%m.albertai_tilt ?", "albertaiTilt", "앞으로 기울임"],
			["b", "배터리 %m.battery ?", "albertaiBattery", "정상"]
		],
		ja1: [
			["w", "前へ移動する", "albertaiMoveForward"],
			["w", "後ろへ移動する", "albertaiMoveBackward"],
			["w", "%m.left_right へ回す", "albertaiTurn", "左"],
			["-"],
			[" ", "%m.left_right_both 眼を %m.led_color にする", "albertaiSetEyeTo", "左", "赤色"],
			[" ", "%m.left_right_both 眼を消す", "albertaiClearEye", "左"],
			["-"],
			[" ", "%m.albertai_sound 音を鳴らす", "albertaiPlaySound", "ビープ"],
			[" ", "音を消す", "albertaiClearSound"],
			["-"],
			["h", "手を見つけたとき", "albertaiWhenHandFound"],
			["h", "%m.touch_sensor タッチセンサーを %m.when_touch_state とき", "albertaiWhenTouchState", "マイク", "クリックした"],
			["b", "手を見つけたか?", "albertaiHandFound"],
			["b", "%m.touch_sensor タッチセンサーを %m.touch_state ?", "albertaiTouchState", "マイク", "クリックしたか"]
		],
		ja2: [
			["w", "前へ %n %m.cm_sec 移動する", "albertaiMoveForwardUnit", 5, "cm"],
			["w", "後ろへ %n %m.cm_sec 移動する", "albertaiMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right へ %n %m.deg_sec その場で回す", "albertaiTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.left_right 車輪を中心に %n %m.deg_sec %m.forward_backward 方向へ回す", "albertaiPivotAroundWheelUnitInDirection", "左", 90, "度", "前"],
			["-"],
			[" ", "%m.left_right_both 眼を %m.led_color にする", "albertaiSetEyeTo", "左", "赤色"],
			[" ", "%m.left_right_both 眼を消す", "albertaiClearEye", "左"],
			["-"],
			[" ", "%m.albertai_sound 音を %n 回鳴らす", "albertaiPlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.albertai_sound 音を %n 回鳴らす", "albertaiPlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "音を消す", "albertaiClearSound"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "albertaiPlayNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "albertaiRestFor", 0.25],
			[" ", "テンポを %n ずつ変える", "albertaiChangeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "albertaiSetTempoTo", 60],
			["-"],
			["h", "手を見つけたとき", "albertaiWhenHandFound"],
			["h", "%m.touch_sensor タッチセンサーを %m.when_touch_state とき", "albertaiWhenTouchState", "マイク", "クリックした"],
			["h", "%m.when_albertai_tilt とき", "albertaiWhenTilt", "前に傾けた"],
			["b", "手を見つけたか?", "albertaiHandFound"],
			["b", "%m.touch_sensor タッチセンサーを %m.touch_state ?", "albertaiTouchState", "マイク", "クリックしたか"],
			["b", "%m.albertai_tilt ?", "albertaiTilt", "前に傾けたか"]
		],
		ja3: [
			["w", "前へ %n %m.move_unit 移動する", "albertaiMoveForwardUnit", 5, "cm"],
			["w", "後ろへ %n %m.move_unit 移動する", "albertaiMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right へ %n %m.turn_unit その場で回す", "albertaiTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.left_right 車輪を中心に %n %m.turn_unit %m.forward_backward 方向へ回す", "albertaiPivotAroundWheelUnitInDirection", "左", 90, "度", "前"],
			[" ", "左車輪を %n 右車輪を %n ずつ変える", "albertaiChangeBothWheelsBy", 10, 10],
			[" ", "左車輪を %n 右車輪を %n にする", "albertaiSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both 車輪を %n ずつ変える", "albertaiChangeWheelBy", "左", 10],
			[" ", "%m.left_right_both 車輪を %n にする", "albertaiSetWheelTo", "左", 50],
			[" ", "停止する", "albertaiStop"],
			["w", "ボード板上で %m.move_forward_backward x: %n y: %n 位置へ移動する", "albertaiMoveToOnBoard", "前へ", 0, 0],
			["w", "ボード板上で %n 度へ向ける", "albertaiSetOrientationToOnBoard", 0],
			["-"],
			[" ", "%m.left_right_both 眼を %m.led_color にする", "albertaiSetEyeTo", "左", "赤色"],
			[" ", "%m.left_right_both 眼をR: %n G: %n B: %n ずつ変える", "albertaiChangeEyeByRGB", "左", 10, 0, 0],
			[" ", "%m.left_right_both 眼をR: %n G: %n B: %n にする", "albertaiSetEyeToRGB", "左", 255, 0, 0],
			[" ", "%m.left_right_both 眼を消す", "albertaiClearEye", "左"],
			["-"],
			[" ", "%m.albertai_sound 音を %n 回鳴らす", "albertaiPlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.albertai_sound 音を %n 回鳴らす", "albertaiPlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "ブザー音を %n ずつ変える", "albertaiChangeBuzzerBy", 10],
			[" ", "ブザー音を %n にする", "albertaiSetBuzzerTo", 1000],
			[" ", "音を消す", "albertaiClearSound"],
			[" ", "%m.note %m.octave 音を鳴らす", "albertaiPlayNote", "ド", "4"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "albertaiPlayNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "albertaiRestFor", 0.25],
			[" ", "テンポを %n ずつ変える", "albertaiChangeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "albertaiSetTempoTo", 60],
			["-"],
			["r", "左近接センサー", "albertaiLeftProximity"],
			["r", "右近接センサー", "albertaiRightProximity"],
			["r", "x軸加速度", "albertaiAccelerationX"],
			["r", "y軸加速度", "albertaiAccelerationY"],
			["r", "z軸加速度", "albertaiAccelerationZ"],
			["r", "マイクタッチ", "albertaiMicTouch"],
			["r", "音量大タッチ", "albertaiVolumeUpTouch"],
			["r", "音量小タッチ", "albertaiVolumeDownTouch"],
			["r", "実行タッチ", "albertaiPlayTouch"],
			["r", "もどるタッチ", "albertaiBackTouch"],
			["r", "OIDモード", "albertaiOidMode"],
			["r", "OID", "albertaiOid"],
			["r", "持ち上ぐ", "albertaiLift"],
			["r", "x位置", "albertaiPositionX"],
			["r", "y位置", "albertaiPositionY"],
			["r", "方向", "albertaiOrientation"],
			["r", "照度", "albertaiLight"],
			["r", "信号強度", "albertaiSignalStrength"],
			["h", "手を見つけたとき", "albertaiWhenHandFound"],
			["h", "%m.touch_sensor タッチセンサーを %m.when_touch_state とき", "albertaiWhenTouchState", "マイク", "クリックした"],
			["h", "OIDが %n であるとき", "albertaiWhenOid", 0],
			["h", "%m.when_albertai_tilt とき", "albertaiWhenTilt", "前に傾けた"],
			["b", "手を見つけたか?", "albertaiHandFound"],
			["b", "%m.touch_sensor タッチセンサーを %m.touch_state ?", "albertaiTouchState", "マイク", "クリックしたか"],
			["b", "OIDが %n ですか?", "albertaiIsOid", 0],
			["b", "%m.albertai_tilt ?", "albertaiTilt", "前に傾けたか"],
			["b", "電池が %m.battery ?", "albertaiBattery", "正常か"]
		],
		uz1: [
			["w", "oldinga yurish", "albertaiMoveForward"],
			["w", "orqaga yurish", "albertaiMoveBackward"],
			["w", "%m.left_right ga o'girilish", "albertaiTurn", "chap"],
			["-"],
			[" ", "%m.left_right_both ko'zni %m.led_color ga sozlash", "albertaiSetEyeTo", "chap", "qizil"],
			[" ", "%m.left_right_both ko'zni o'chirish", "albertaiClearEye", "chap"],
			["-"],
			[" ", "%m.albertai_sound tovushni ijro etish", "albertaiPlaySound", "qisqa"],
			[" ", "tovushni o'chirish", "albertaiClearSound"],
			["-"],
			["h", "qo'l topilganda", "albertaiWhenHandFound"],
			["h", "%m.touch_sensor teginish sensorini %m.when_touch_state da", "albertaiWhenTouchState", "mikrofon", "bosgan"],
			["b", "qo'l topildimi?", "albertaiHandFound"],
			["b", "%m.touch_sensor teginish sensorini %m.touch_state ?", "albertaiTouchState", "mikrofon", "bosgan"]
		],
		uz2: [
			["w", "oldinga %n %m.cm_sec yurish", "albertaiMoveForwardUnit", 5, "cm"],
			["w", "orqaga %n %m.cm_sec yurish", "albertaiMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "albertaiTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.left_right g'ildirak markaziga %n %m.deg_sec %m.forward_backward yo'nalishga o'girilish", "albertaiPivotAroundWheelUnitInDirection", "chap", 90, "daraja", "old"],
			["-"],
			[" ", "%m.left_right_both ko'zni %m.led_color ga sozlash", "albertaiSetEyeTo", "chap", "qizil"],
			[" ", "%m.left_right_both ko'zni o'chirish", "albertaiClearEye", "chap"],
			["-"],
			[" ", "%m.albertai_sound tovushni %n marta ijro etish", "albertaiPlaySoundTimes", "qisqa", 1],
			["w", "%m.albertai_sound tovushni %n marta ijro tugaguncha kutish", "albertaiPlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "tovushni o'chirish", "albertaiClearSound"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "albertaiPlayNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "albertaiRestFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "albertaiChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "albertaiSetTempoTo", 60],
			["-"],
			["h", "qo'l topilganda", "albertaiWhenHandFound"],
			["h", "%m.touch_sensor teginish sensorini %m.when_touch_state da", "albertaiWhenTouchState", "mikrofon", "bosgan"],
			["h", "%m.when_albertai_tilt bo'lganda", "albertaiWhenTilt", "oldinga eğin"],
			["b", "qo'l topildimi?", "albertaiHandFound"],
			["b", "%m.touch_sensor teginish sensorini %m.touch_state ?", "albertaiTouchState", "mikrofon", "bosgan"],
			["b", "%m.albertai_tilt ?", "albertaiTilt", "oldinga eğin"]
		],
		uz3: [
			["w", "oldinga %n %m.move_unit yurish", "albertaiMoveForwardUnit", 5, "cm"],
			["w", "orqaga %n %m.move_unit yurish", "albertaiMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "albertaiTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.left_right g'ildirak markaziga %n %m.turn_unit %m.forward_backward yo'nalishga o'girilish", "albertaiPivotAroundWheelUnitInDirection", "chap", 90, "daraja", "old"],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "albertaiChangeBothWheelsBy", 10, 10],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "albertaiSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both g'ildirakni %n ga o'zgartirish", "albertaiChangeWheelBy", "chap", 10],
			[" ", "%m.left_right_both g'ildirakni %n ga sozlash", "albertaiSetWheelTo", "chap", 50],
			[" ", "to'xtatish", "albertaiStop"],
			["w", "doskada %m.move_forward_backward x: %n y: %n lavozimga yurish", "albertaiMoveToOnBoard", "oldinga", 0, 0],
			["w", "doskada %n daraja tomonga o'girilish", "albertaiSetOrientationToOnBoard", 0],
			["-"],
			[" ", "%m.left_right_both ko'zni %m.led_color ga sozlash", "albertaiSetEyeTo", "chap", "qizil"],
			[" ", "%m.left_right_both ko'zni r: %n g: %n b: %n ga o'zgartirish", "albertaiChangeEyeByRGB", "chap", 10, 0, 0],
			[" ", "%m.left_right_both ko'zni r: %n g: %n b: %n ga sozlash", "albertaiSetEyeToRGB", "chap", 255, 0, 0],
			[" ", "%m.left_right_both ko'zni o'chirish", "albertaiClearEye", "chap"],
			["-"],
			[" ", "%m.albertai_sound tovushni %n marta ijro etish", "albertaiPlaySoundTimes", "qisqa", 1],
			["w", "%m.albertai_sound tovushni %n marta ijro tugaguncha kutish", "albertaiPlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "buzerning ovozini %n ga o'zgartirish", "albertaiChangeBuzzerBy", 10],
			[" ", "buzerning ovozini %n ga sozlash", "albertaiSetBuzzerTo", 1000],
			[" ", "tovushni o'chirish", "albertaiClearSound"],
			[" ", "%m.note %m.octave notani ijro etish", "albertaiPlayNote", "do", "4"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "albertaiPlayNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "albertaiRestFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "albertaiChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "albertaiSetTempoTo", 60],
			["-"],
			["r", "chap yaqinlik", "albertaiLeftProximity"],
			["r", "o'ng yaqinlik", "albertaiRightProximity"],
			["r", "x tezlanish", "albertaiAccelerationX"],
			["r", "y tezlanish", "albertaiAccelerationY"],
			["r", "z tezlanish", "albertaiAccelerationZ"],
			["r", "mikrofon teginish", "albertaiMicTouch"],
			["r", "ovozni oshirish teginish", "albertaiVolumeUpTouch"],
			["r", "ovozni pasaytirish teginish", "albertaiVolumeDownTouch"],
			["r", "yugurish teginish", "albertaiPlayTouch"],
			["r", "orqaga teginish", "albertaiBackTouch"],
			["r", "oid rejimida", "albertaiOidMode"],
			["r", "oid", "albertaiOid"],
			["r", "ko'taring", "albertaiLift"],
			["r", "x lavozimi", "albertaiPositionX"],
			["r", "y lavozimi", "albertaiPositionY"],
			["r", "orientatsiya", "albertaiOrientation"],
			["r", "yorug'lik", "albertaiLight"],
			["r", "signal kuchi", "albertaiSignalStrength"],
			["h", "qo'l topilganda", "albertaiWhenHandFound"],
			["h", "%m.touch_sensor teginish sensorini %m.when_touch_state da", "albertaiWhenTouchState", "mikrofon", "bosgan"],
			["h", "oid %n bo'lganida", "albertaiWhenOid", 0],
			["h", "%m.when_albertai_tilt bo'lganda", "albertaiWhenTilt", "oldinga eğin"],
			["b", "qo'l topildimi?", "albertaiHandFound"],
			["b", "%m.touch_sensor teginish sensorini %m.touch_state ?", "albertaiTouchState", "mikrofon", "bosgan"],
			["b", "oid %n ?", "albertaiIsOid", 0],
			["b", "%m.albertai_tilt ?", "albertaiTilt", "oldinga eğin"],
			["b", "batareya %m.battery ?", "albertaiBattery", "normal"]
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
			"forward_backward": ["forward", "backward"],
			"move_forward_backward": ["forward", "backward"],
			"led_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "violet", "purple", "white"],
			"albertai_sound": ["beep", "random beep", "noise", "siren", "engine", "robot"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"touch_sensor": ["mic", "volume up", "volume down", "play", "back"],
			"when_touch_state": ["clicked", "long-pressed (1.5 secs)", "long-long-pressed (3 secs)"],
			"when_albertai_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt", "tap", "lift"],
			"touch_state": ["clicked", "long-pressed (1.5 secs)", "long-long-pressed (3 secs)"],
			"albertai_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt", "tap", "lift"],
			"battery": ["normal", "low", "empty"]
		},
		ko: {
			"move_unit": ["cm", "초", "펄스"],
			"turn_unit": ["도", "초", "펄스"],
			"cm_sec": ["cm", "초"],
			"deg_sec": ["도", "초"],
			"left_right": ["왼쪽", "오른쪽"],
			"left_right_both": ["왼쪽", "오른쪽", "양쪽"],
			"forward_backward": ["앞쪽", "뒤쪽"],
			"move_forward_backward": ["앞으로", "뒤로"],
			"led_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"albertai_sound": ["삐", "무작위 삐", "지지직", "사이렌", "엔진", "로봇"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"touch_sensor": ["마이크", "소리 크게", "소리 작게", "실행", "뒤로"],
			"when_touch_state": ["클릭했을", "오래 눌렀을(1.5초)", "아주 오래 눌렀을(3초)"],
			"when_albertai_tilt": ["앞으로 기울였을", "뒤로 기울였을", "왼쪽으로 기울였을", "오른쪽으로 기울였을", "거꾸로 뒤집었을", "기울이지 않았을", "두드렸을", "들어올렸을"],
			"touch_state": ["클릭했는가", "오래 눌렀는가(1.5초)", "아주 오래 눌렀는가(3초)"],
			"albertai_tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "기울이지 않음", "두드림", "들어올림"],
			"battery": ["정상", "부족", "없음"]
		},
		ja: {
			"move_unit": ["cm", "秒", "パルス"],
			"turn_unit": ["度", "秒", "パルス"],
			"cm_sec": ["cm", "秒"],
			"deg_sec": ["度", "秒"],
			"left_right": ["左", "右"],
			"left_right_both": ["左", "右", "両"],
			"forward_backward": ["前", "後"],
			"move_forward_backward": ["前へ", "後ろへ"],
			"led_color": ["赤色", "橙色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"albertai_sound": ["ビープ", "ランダムビープ", "ノイズ", "サイレン", "エンジン", "ロボット"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"touch_sensor": ["マイク", "音量大", "音量小", "実行", "もどる"],
			"when_touch_state": ["クリックした", "長く押した(1.5秒)", "非常に長く押した(3秒)"],
			"when_albertai_tilt": ["前に傾けた", "後に傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾けなかった", "叩いた", "持ち上げた"],
			"touch_state": ["クリックしたか", "長く押したか(1.5秒)", "非常に長く押したか(3秒)"],
			"albertai_tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾けなかったか", "叩いたか", "持ち上げるか"],
			"battery": ["正常か", "足りないか", "ないか"]
		},
		uz: {
			"move_unit": ["cm", "soniya", "puls"],
			"turn_unit": ["daraja", "soniya", "puls"],
			"cm_sec": ["cm", "soniya"],
			"deg_sec": ["daraja", "soniya"],
			"left_right": ["chap", "o'ng"],
			"left_right_both": ["chap", "o'ng", "har ikki"],
			"forward_backward": ["old", "orqa"],
			"move_forward_backward": ["oldinga", "orqaga"],
			"led_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "binafsha", "siyoh", "oq"],
			"albertai_sound": ["qisqa", "tasodifiy qisqa", "shovqin", "sirena", "motor", "robot"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"touch_sensor": ["mikrofon", "ovozni oshirish", "ovozni pasaytirish", "yugurish", "orqaga"],
			"when_touch_state": ["bosgan", "uzoq bosganmi (1.5 soniya)", "juda uzoq bosganmi (3 soniya)"],
			"when_albertai_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q", "jo'mrak", "ko'taring"],
			"touch_state": ["bosgan", "uzoq bosganmi (1.5 soniya)", "juda uzoq bosganmi (3 soniya)"],
			"albertai_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q", "jo'mrak", "ko'taring"],
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
	var RGB_COLORS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var AI_SOUNDS = {};
	var TOUCH_SENSORS = {};
	var TOUCH_STATES = {};
	var TILTS = {};
	var BATTERY_STATES = {};
	
	const LEFT = 1;
	const RIGHT = 2;
	const FORWARD = 1;
	const BACKWARD = 2;
	const SECONDS = 2;
	const TOUCH_MIC = 1;
	const TOUCH_VOLUME_UP = 2;
	const TOUCH_VOLUME_DOWN = 3;
	const TOUCH_PLAY = 4;
	const TOUCH_BACK = 5;
	const CLICKED = 1;
	const LONG_PRESSED = 2;
	const LONG_LONG_PRESSED = 3;
	const TILT_FORWARD = 1;
	const TILT_BACKWARD = 2;
	const TILT_LEFT = 3;
	const TILT_RIGHT = 4;
	const TILT_FLIP = 5;
	const TILT_NONE = 6;
	const TILT_TAP = 7;
	const TILT_LIFT = 8;
	
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['left_right_both'];
		PARTS[tmp[0]] = LEFT;
		PARTS[tmp[1]] = RIGHT;
		tmp = MENUS[i]['left_right'];
		DIRECTIONS[tmp[0]] = LEFT;
		DIRECTIONS[tmp[1]] = RIGHT;
		tmp = MENUS[i]['forward_backward'];
		TOWARDS[tmp[0]] = FORWARD;
		TOWARDS[tmp[1]] = BACKWARD;
		tmp = MENUS[i]['move_forward_backward'];
		TOWARDS[tmp[0]] = FORWARD;
		TOWARDS[tmp[1]] = BACKWARD;
		tmp = MENUS[i]['move_unit'];
		UNITS[tmp[0]] = 1; // cm
		UNITS[tmp[1]] = 2; // sec
		UNITS[tmp[2]] = 3; // pulse
		tmp = MENUS[i]['turn_unit'];
		UNITS[tmp[0]] = 1; // deg
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
		tmp = MENUS[i]['albertai_sound'];
		AI_SOUNDS[tmp[0]] = 1; // beep
		AI_SOUNDS[tmp[1]] = 2; // random beep
		AI_SOUNDS[tmp[2]] = 10; // noise
		AI_SOUNDS[tmp[3]] = 3; // siren
		AI_SOUNDS[tmp[4]] = 4; // engine
		AI_SOUNDS[tmp[5]] = 5; // robot
		tmp = MENUS[i]['touch_sensor'];
		TOUCH_SENSORS[tmp[0]] = TOUCH_MIC;
		TOUCH_SENSORS[tmp[1]] = TOUCH_VOLUME_UP;
		TOUCH_SENSORS[tmp[2]] = TOUCH_VOLUME_DOWN;
		TOUCH_SENSORS[tmp[3]] = TOUCH_PLAY;
		TOUCH_SENSORS[tmp[4]] = TOUCH_BACK;
		tmp = MENUS[i]['touch_state'];
		TOUCH_STATES[tmp[0]] = CLICKED;
		TOUCH_STATES[tmp[1]] = LONG_PRESSED;
		TOUCH_STATES[tmp[2]] = LONG_LONG_PRESSED;
		tmp = MENUS[i]['when_touch_state'];
		TOUCH_STATES[tmp[0]] = CLICKED;
		TOUCH_STATES[tmp[1]] = LONG_PRESSED;
		TOUCH_STATES[tmp[2]] = LONG_LONG_PRESSED;
		tmp = MENUS[i]['albertai_tilt'];
		TILTS[tmp[0]] = TILT_FORWARD;
		TILTS[tmp[1]] = TILT_BACKWARD;
		TILTS[tmp[2]] = TILT_LEFT;
		TILTS[tmp[3]] = TILT_RIGHT;
		TILTS[tmp[4]] = TILT_FLIP;
		TILTS[tmp[5]] = TILT_NONE;
		TILTS[tmp[6]] = TILT_TAP;
		TILTS[tmp[7]] = TILT_LIFT;
		tmp = MENUS[i]['when_albertai_tilt'];
		TILTS[tmp[0]] = TILT_FORWARD;
		TILTS[tmp[1]] = TILT_BACKWARD;
		TILTS[tmp[2]] = TILT_LEFT;
		TILTS[tmp[3]] = TILT_RIGHT;
		TILTS[tmp[4]] = TILT_FLIP;
		TILTS[tmp[5]] = TILT_NONE;
		TILTS[tmp[6]] = TILT_TAP;
		TILTS[tmp[7]] = TILT_LIFT;
		tmp = MENUS[i]['battery'];
		BATTERY_STATES[tmp[0]] = 2;
		BATTERY_STATES[tmp[1]] = 1;
		BATTERY_STATES[tmp[2]] = 0;
	}
	
	function AlbertAiController() {
		this.prevDirection = 0;
		this.prevDirectionFinal = 0;
		this.directionCount = 0;
		this.directionCountFinal = 0;
		this.positionCount = 0;
		this.positionCountFinal = 0;
		this.isBackward = false;
	}

	AlbertAiController.prototype.PI = 3.14159265;
	AlbertAiController.prototype.PI2 = 6.2831853;
	AlbertAiController.prototype.GAIN_ANGLE = 30;
	AlbertAiController.prototype.GAIN_ANGLE_FINE = 30;
	AlbertAiController.prototype.GAIN_POSITION_FINE = 30;
	AlbertAiController.prototype.STRAIGHT_SPEED = 50;//30;
	AlbertAiController.prototype.MAX_BASE_SPEED = 50;//30;
	AlbertAiController.prototype.GAIN_BASE_SPEED = 2;//1.5;
	AlbertAiController.prototype.GAIN_POSITION = 70;//52.5;
	AlbertAiController.prototype.POSITION_TOLERANCE_FINE = 3;
	AlbertAiController.prototype.POSITION_TOLERANCE_FINE_LARGE = 5;
	AlbertAiController.prototype.POSITION_TOLERANCE_ROUGH = 5;
	AlbertAiController.prototype.POSITION_TOLERANCE_ROUGH_LARGE = 10;
	AlbertAiController.prototype.ORIENTATION_TOLERANCE_FINAL = 0.087;
	AlbertAiController.prototype.ORIENTATION_TOLERANCE_FINAL_LARGE = 0.122;
	AlbertAiController.prototype.ORIENTATION_TOLERANCE_FINAL_LARGE_LARGE = 0.262;
	AlbertAiController.prototype.ORIENTATION_TOLERANCE_ROUGH = 0.122;
	AlbertAiController.prototype.ORIENTATION_TOLERANCE_ROUGH_LARGE = 0.262;
	AlbertAiController.prototype.ORIENTATION_TOLERANCE_ROUGH_LARGE_LARGE = 0.524;
	AlbertAiController.prototype.MINIMUM_WHEEL_SPEED = 18;
	AlbertAiController.prototype.MINIMUM_WHEEL_SPEED_FINE = 15;

	AlbertAiController.prototype.clear = function() {
		this.prevDirection = 0;
		this.prevDirectionFinal = 0;
		this.directionCount = 0;
		this.directionCountFinal = 0;
		this.positionCount = 0;
		this.positionCountFinal = 0;
	};

	AlbertAiController.prototype.setBackward = function(backward) {
		this.isBackward = backward;
	};

	AlbertAiController.prototype.controlAngleInitial = function(wheels, currentRadian, targetRadian) {
		if(this.isBackward) {
			currentRadian += this.PI;
		}
		var diff = this.validateRadian(targetRadian - currentRadian);
		var mag = Math.abs(diff);
		if (mag < this.ORIENTATION_TOLERANCE_ROUGH) return true;

		var direction = diff > 0 ? 1 : -1;
		if(mag < this.ORIENTATION_TOLERANCE_ROUGH_LARGE && direction * this.prevDirection < 0) return true;
		this.prevDirection = direction;

		var value = 0;
		if(diff > 0) {
			value = Math.log(1 + mag) * this.GAIN_ANGLE;
			if(value < this.MINIMUM_WHEEL_SPEED) value = this.MINIMUM_WHEEL_SPEED;
		} else {
			value = -Math.log(1 + mag) * this.GAIN_ANGLE;
			if(value > -this.MINIMUM_WHEEL_SPEED) value = -this.MINIMUM_WHEEL_SPEED;
		}
		value = parseInt(value);
		wheels.left = -value;
		wheels.right = value;
		return false;
	};

	AlbertAiController.prototype.controlAngleFinal = function(wheels, currentRadian, targetRadian) {
		var diff = this.validateRadian(targetRadian - currentRadian);
		var mag = Math.abs(diff);
		if(mag < this.ORIENTATION_TOLERANCE_FINAL) return true;

		var direction = diff > 0 ? 1 : -1;
		if(mag < this.ORIENTATION_TOLERANCE_FINAL_LARGE && direction * this.prevDirectionFinal < 0) return true;
		if(mag < this.ORIENTATION_TOLERANCE_FINAL_LARGE_LARGE && direction * this.prevDirectionFinal < 0) {
			if(++this.directionCountFinal > 3) return true;
		}
		this.prevDirectionFinal = direction;

		var value = 0;
		if(diff > 0) {
			value = Math.log(1 + mag) * this.GAIN_ANGLE_FINE;
			if(value < this.MINIMUM_WHEEL_SPEED) value = this.MINIMUM_WHEEL_SPEED;
		} else {
			value = -Math.log(1 + mag) * this.GAIN_ANGLE_FINE;
			if(value > -this.MINIMUM_WHEEL_SPEED) value = -this.MINIMUM_WHEEL_SPEED;
		}
		value = parseInt(value);
		wheels.left = -value;
		wheels.right = value;
		return false;
	};

	AlbertAiController.prototype.controlPositionFine = function(wheels, currentX, currentY, currentRadian, targetX, targetY) {
		var targetRadian = -Math.atan2(targetY - currentY, targetX - currentX);
		if(this.isBackward) {
			currentRadian += this.PI;
		}
		var diff = this.validateRadian(targetRadian - currentRadian);
		var mag = Math.abs(diff);
		var ex = targetX - currentX;
		var ey = targetY - currentY;
		var dist = Math.sqrt(ex * ex + ey * ey);
		if(dist < this.POSITION_TOLERANCE_FINE) return true;
		if(dist < this.POSITION_TOLERANCE_FINE_LARGE) {
			if (++this.positionCountFinal > 5) {
				this.positionCountFinal = 0;
				return true;
			}
		}
		var value = 0;
		if (diff > 0) value = Math.log(1 + mag) * this.GAIN_POSITION_FINE;
		else value = -Math.log(1 + mag) * this.GAIN_POSITION_FINE;
		if(this.isBackward) {
			value = -value;
		}
		value = parseInt(value);
		wheels.left = this.MINIMUM_WHEEL_SPEED_FINE - value;
		wheels.right = this.MINIMUM_WHEEL_SPEED_FINE + value;
		if(this.isBackward) {
			wheels.left = -wheels.left;
			wheels.right = -wheels.right;
		}
		return false;
	};

	AlbertAiController.prototype.controlPosition = function(wheels, currentX, currentY, currentRadian, targetX, targetY) {
		var targetRadian = -Math.atan2(targetY - currentY, targetX - currentX);
		if(this.isBackward) {
			currentRadian += this.PI;
		}
		var diff = this.validateRadian(targetRadian - currentRadian);
		var mag = Math.abs(diff);
		var ex = targetX - currentX;
		var ey = targetY - currentY;
		var dist = Math.sqrt(ex * ex + ey * ey);
		if(dist < this.POSITION_TOLERANCE_ROUGH) return true;
		if(dist < this.POSITION_TOLERANCE_ROUGH_LARGE) {
			if(++this.positionCount > 10) {
				this.positionCount = 0;
				return true;
			}
		} else {
			this.positionCount = 0;
		}
		if(mag < 0.01) {
			wheels.left = this.STRAIGHT_SPEED;
			wheels.right = this.STRAIGHT_SPEED;
		} else {
			var base = (this.MINIMUM_WHEEL_SPEED + 0.5 / mag) * this.GAIN_BASE_SPEED;
			if(base > this.MAX_BASE_SPEED) base = this.MAX_BASE_SPEED;

			var value = 0;
			if(diff > 0) value = Math.log(1 + mag) * this.GAIN_POSITION;
			else value = -Math.log(1 + mag) * this.GAIN_POSITION;
			if(this.isBackward) {
				value = -value;
			}
			base = parseInt(base);
			value = parseInt(value);
			wheels.left = base - value;
			wheels.right = base + value;
		}
		if(this.isBackward) {
			wheels.left = -wheels.left;
			wheels.right = -wheels.right;
		}
		return false;
	};

	AlbertAiController.prototype.validateRadian = function(radian) {
		if(radian > this.PI) return radian - this.PI2;
		else if(radian < -this.PI) return radian + this.PI2;
		return radian;
	};

	AlbertAiController.prototype.toRadian = function(degree) {
		return degree * 3.14159265 / 180.0;
	};

	function AlbertAiNavigator() {
		this.controller = new AlbertAiController();
		this.mode = 0;
		this.state = 0;
		this.initialized = false;
		this.currentX = -1;
		this.currentY = -1;
		this.currentTheta = -200;
		this.targetX = -1;
		this.targetY = -1;
		this.targetTheta = -200;
		this.wheels = { completed: false, left: 0, right: 0 };
	}

	AlbertAiNavigator.prototype.clear = function() {
		this.mode = 0;
		this.state = 0;
		this.initialized = false;
		this.currentX = -1;
		this.currentY = -1;
		this.currentTheta = -200;
		this.targetX = -1;
		this.targetY = -1;
		this.targetTheta = -200;
		this.wheels.completed = false;
		this.wheels.left = 0;
		this.wheels.right = 0;
		this.controller.clear();
	};

	AlbertAiNavigator.prototype.setBackward = function(backward) {
		this.controller.setBackward(backward);
	};

	AlbertAiNavigator.prototype.moveTo = function(x, y) {
		this.clear();
		this.targetX = x;
		this.targetY = y;
		this.state = 1;
		this.mode = 1;
	};

	AlbertAiNavigator.prototype.turnTo = function(deg) {
		this.clear();
		this.targetTheta = deg;
		this.state = 1;
		this.mode = 2;
	};

	AlbertAiNavigator.prototype.handleSensory = function(sensory) {
		if(this.mode == 1) {
			var x = sensory.positionX;
			var y = sensory.positionY;
			if(x >= 0) this.currentX = x;
			if(y >= 0) this.currentY = y;
			this.currentTheta = sensory.orientation;
			switch(this.state) {
				case 1: {
					if(this.initialized == false) {
						if(this.currentX < 0 || this.currentY < 0) {
							this.wheels.left = 20;
							this.wheels.right = -20;
						} else {
							this.initialized = true;
						}
					}
					if(this.initialized) {
						var currentRadian = this.controller.toRadian(this.currentTheta);
						var dx = this.targetX - this.currentX;
						var dy = this.targetY - this.currentY;
						var targetRadian = -Math.atan2(dy, dx);
						if(this.controller.controlAngleInitial(this.wheels, currentRadian, targetRadian)) {
							this.state = 2;
						}
					}
					break;
				}
				case 2: {
					var currentRadian = this.controller.toRadian(this.currentTheta);
					if(this.controller.controlPosition(this.wheels, this.currentX, this.currentY, currentRadian, this.targetX, this.targetY)) {
						this.state = 3;
					}
					break;
				}
				case 3: {
					var currentRadian = this.controller.toRadian(this.currentTheta);
					if(this.controller.controlPositionFine(this.wheels, this.currentX, this.currentY, currentRadian, this.targetX, this.targetY)) {
						this.clear();
						this.wheels.completed = true;
					}
					break;
				}
			}
		} else if(this.mode == 2) {
			this.currentTheta = sensory.orientation;
			switch(this.state) {
				case 1: {
					var currentRadian = this.controller.toRadian(this.currentTheta);
					var targetRadian = this.controller.toRadian(this.targetTheta);
					if(this.controller.controlAngleInitial(this.wheels, currentRadian, targetRadian)) {
						this.state = 2;
					}
					break;
				}
				case 2: {
					var currentRadian = this.controller.toRadian(this.currentTheta);
					var targetRadian = this.controller.toRadian(this.targetTheta);
					if(this.controller.controlAngleFinal(this.wheels, currentRadian, targetRadian)) {
						this.clear();
						this.wheels.completed = true;
					}
					break;
				}
			}
		}
		return this.wheels;
	};
	
	function AlbertAi(index) {
		this.sensory = {
			map1: 0,
			map2: 0,
			signalStrength: 0,
			leftProximity: 0,
			rightProximity: 0,
			accelerationX: 0,
			accelerationY: 0,
			accelerationZ: 0,
			positionX: -1,
			positionY: -1,
			orientation: -200,
			light: 0,
			micTouch: 0,
			volumeUpTouch: 0,
			volumeDownTouch: 0,
			playTouch: 0,
			backTouch: 0,
			oidMode: 0,
			oid: -1,
			lift: 0,
			pulseCount: 0,
			wheelState: 0,
			soundState: 0,
			batteryState: 2,
			tilt: 0,
			handFound: false
		};
		this.motoring = {
			module: ALBERTAI,
			index: index,
			map: 0xbfc00000,
			leftWheel: 0,
			rightWheel: 0,
			leftRed: 0,
			leftGreen: 0,
			leftBlue: 0,
			rightRed: 0,
			rightGreen: 0,
			rightBlue: 0,
			micRed: 0,
			micGreen: 0,
			micBlue: 0,
			buzzer: 0,
			pulse: 0,
			note: 0,
			sound: 0,
			boardWidth: 0,
			boardHeight: 0,
			motionType: 0,
			motionUnit: 0,
			motionSpeed: 0,
			motionValue: 0,
			motionRadius: 0
		};
		this.blockId = 0;
		this.navigationCallback = undefined;
		this.navigator = undefined;
		this.motionCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.micClicked = false;
		this.volumeUpClicked = false;
		this.volumeDownClicked = false;
		this.playClicked = false;
		this.backClicked = false;
		this.micLongPressed = false;
		this.volumeUpLongPressed = false;
		this.volumeDownLongPressed = false;
		this.playLongPressed = false;
		this.backLongPressed = false;
		this.micLongLongPressed = false;
		this.volumeUpLongLongPressed = false;
		this.volumeDownLongLongPressed = false;
		this.playLongLongPressed = false;
		this.backLongLongPressed = false;
		this.tap = false;
		this.tempo = 60;
		this.timeouts = [];
	}

	AlbertAi.prototype.reset = function() {
		var motoring = this.motoring;
		motoring.map = 0xbffe0000;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.leftRed = 0;
		motoring.leftGreen = 0;
		motoring.leftBlue = 0;
		motoring.rightRed = 0;
		motoring.rightGreen = 0;
		motoring.rightBlue = 0;
		motoring.micRed = 0;
		motoring.micGreen = 0;
		motoring.micBlue = 0;
		motoring.buzzer = 0;
		motoring.pulse = 0;
		motoring.note = 0;
		motoring.sound = 0;
		motoring.boardWidth = 0;
		motoring.boardHeight = 0;
		motoring.motionType = 0;
		motoring.motionUnit = 0;
		motoring.motionSpeed = 0;
		motoring.motionValue = 0;
		motoring.motionRadius = 0;

		this.blockId = 0;
		this.navigationCallback = undefined;
		this.navigator = undefined;
		this.motionCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.micClicked = false;
		this.volumeUpClicked = false;
		this.volumeDownClicked = false;
		this.playClicked = false;
		this.backClicked = false;
		this.micLongPressed = false;
		this.volumeUpLongPressed = false;
		this.volumeDownLongPressed = false;
		this.playLongPressed = false;
		this.backLongPressed = false;
		this.micLongLongPressed = false;
		this.volumeUpLongLongPressed = false;
		this.volumeDownLongLongPressed = false;
		this.playLongLongPressed = false;
		this.backLongLongPressed = false;
		this.tap = false;
		this.tempo = 60;

		this.__removeAllTimeouts();
	};

	AlbertAi.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	AlbertAi.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};

	AlbertAi.prototype.clearMotoring = function() {
		this.motoring.map = 0xbfc00000;
	};

	AlbertAi.prototype.clearEvent = function() {
		this.micClicked = false;
		this.volumeUpClicked = false;
		this.volumeDownClicked = false;
		this.playClicked = false;
		this.backClicked = false;
		this.micLongPressed = false;
		this.volumeUpLongPressed = false;
		this.volumeDownLongPressed = false;
		this.playLongPressed = false;
		this.backLongPressed = false;
		this.micLongLongPressed = false;
		this.volumeUpLongLongPressed = false;
		this.volumeDownLongLongPressed = false;
		this.playLongLongPressed = false;
		this.backLongLongPressed = false;
		this.tap = false;
	};

	AlbertAi.prototype.__setPulse = function(pulse) {
		this.motoring.pulse = pulse;
		this.motoring.map |= 0x00200000;
	};

	AlbertAi.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x00100000;
	};

	AlbertAi.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	AlbertAi.prototype.__cancelNote = function() {
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

	AlbertAi.prototype.__setSound = function(sound) {
		this.motoring.sound = sound;
		this.motoring.map |= 0x00080000;
	};

	AlbertAi.prototype.__runSound = function(sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			this.currentSound = sound;
			this.soundRepeat = count;
			this.__setSound(sound);
		}
	};

	AlbertAi.prototype.__cancelSound = function() {
		this.soundCallback = undefined;
	};

	AlbertAi.prototype.__setBoardSize = function(width, height) {
		this.motoring.boardWidth = width;
		this.motoring.boardHeight = height;
		this.motoring.map |= 0x00040000;
	};

	AlbertAi.prototype.__setMotion = function(type, unit, speed, value, radius) {
		var motoring = this.motoring;
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map |= 0x00020000;
	};

	AlbertAi.prototype.__cancelMotion = function() {
		this.motionCallback = undefined;
	};
	
	AlbertAi.prototype.__getNavigator = function() {
		if(this.navigator == undefined) {
			this.navigator = new AlbertAiNavigator();
		}
		return this.navigator;
	};

	AlbertAi.prototype.__cancelNavigation = function() {
		this.navigationCallback = undefined;
		if(this.navigator) {
			this.navigator.clear();
		}
	};

	AlbertAi.prototype.handleSensory = function() {
		var self = this;
		var sensory = self.sensory;

		if(sensory.map1 & 0x00000008) self.micClicked = true;
		if(sensory.map1 & 0x00000004) self.volumeUpClicked = true;
		if(sensory.map1 & 0x00000002) self.volumeDownClicked = true;
		if(sensory.map1 & 0x00000001) self.playClicked = true;
		if(sensory.map2 & 0x80000000) self.backClicked = true;
		if(sensory.map2 & 0x40000000) self.micLongPressed = true;
		if(sensory.map2 & 0x20000000) self.volumeUpLongPressed = true;
		if(sensory.map2 & 0x10000000) self.volumeDownLongPressed = true;
		if(sensory.map2 & 0x08000000) self.playLongPressed = true;
		if(sensory.map2 & 0x04000000) self.backLongPressed = true;
		if(sensory.map2 & 0x02000000) self.micLongLongPressed = true;
		if(sensory.map2 & 0x01000000) self.volumeUpLongLongPressed = true;
		if(sensory.map2 & 0x00800000) self.volumeDownLongLongPressed = true;
		if(sensory.map2 & 0x00400000) self.playLongLongPressed = true;
		if(sensory.map2 & 0x00200000) self.backLongLongPressed = true;
		if(sensory.map2 & 0x00100000) self.tap = true;

		if(self.motionCallback && (sensory.map2 & 0x00008000) != 0) {
			if(sensory.wheelState == 2) {
				self.motoring.leftWheel = 0;
				self.motoring.rightWheel = 0;
				var callback = self.motionCallback;
				self.__cancelMotion();
				if(callback) callback();
			}
		}
		if(self.navigationCallback) {
			if(self.navigator) {
				var result = self.navigator.handleSensory(self.sensory);
				self.motoring.leftWheel = result.left;
				self.motoring.rightWheel = result.right;
				if(result.completed) {
					var callback = self.navigationCallback;
					self.__cancelNavigation();
					if(callback) callback();
				}
			}
		}
		if((sensory.map2 & 0x00004000) != 0) {
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

	AlbertAi.prototype.__motion = function(type, callback) {
		var motoring = this.motoring;
		this.__cancelNavigation();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(type, 1, 0, 0, 0); // type, unit, speed, value, radius
		this.motionCallback = callback;
	};

	AlbertAi.prototype.__motionUnit = function(type, unit, value, callback) {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		value = parseFloat(value);
		if(value && value > 0) {
			this.__setMotion(type, unit, 0, value, 0); // type, unit, speed, value, radius
			this.motionCallback = callback;
		} else {
			this.__setMotion(0, 0, 0, 0, 0);
			callback();
		}
	};

	AlbertAi.prototype.moveForward = function(callback) {
		this.__motion(101, callback);
	};

	AlbertAi.prototype.moveBackward = function(callback) {
		this.__motion(102, callback);
	};

	AlbertAi.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(103, callback);
		} else {
			this.__motion(104, callback);
		}
	};

	AlbertAi.prototype.moveForwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(2, UNITS[unit], -value, callback);
		else this.__motionUnit(1, UNITS[unit], value, callback);
	};

	AlbertAi.prototype.moveBackwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(1, UNITS[unit], -value, callback);
		else this.__motionUnit(2, UNITS[unit], value, callback);
	};

	AlbertAi.prototype.turnUnit = function(direction, value, unit, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			if(value < 0) this.__motionUnit(4, UNITS[unit], -value, callback);
			else this.__motionUnit(3, UNITS[unit], value, callback);
		} else {
			if(value < 0) this.__motionUnit(3, UNITS[unit], -value, callback);
			else this.__motionUnit(4, UNITS[unit], value, callback);
		}
	};

	AlbertAi.prototype.pivotUnit = function(part, value, unit, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[part] == LEFT) {
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

	AlbertAi.prototype.setWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelNavigation();
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
	};

	AlbertAi.prototype.changeWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelNavigation();
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
	};

	AlbertAi.prototype.setWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelNavigation();
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
	};

	AlbertAi.prototype.changeWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelNavigation();
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
	};

	AlbertAi.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
	};

	AlbertAi.prototype.moveToOnBoard = function(toward, x, y, callback) {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelMotion();

		x = parseInt(x);
		y = parseInt(y);
		var navi = this.__getNavigator();
		if((typeof x == 'number') && (typeof y == 'number') && x >= 0 && y >= 0) {
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			this.__setPulse(0);
			this.__setMotion(0, 0, 0, 0, 0);
			navi.setBackward(TOWARDS[toward] == BACKWARD);
			navi.moveTo(x, y);
			this.navigationCallback = callback;
		}
	};

	AlbertAi.prototype.setOrientationToOnBoard = function(degree, callback) {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelMotion();

		degree = parseInt(degree);
		if(typeof degree == 'number') {
			var navi = this.__getNavigator();
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			this.__setPulse(0);
			this.__setMotion(0, 0, 0, 0, 0);
			navi.setBackward(false);
			navi.turnTo(degree);
			this.navigationCallback = callback;
		}
	};

	AlbertAi.prototype.setEyeColor = function(eye, color) {
		var rgb = RGB_COLORS[color];
		if(rgb) {
			this.setRgb(eye, rgb[0], rgb[1], rgb[2]);
		}
	};

	AlbertAi.prototype.clearEye = function(eye) {
		this.setRgb(eye, 0, 0, 0);
	};

	AlbertAi.prototype.setRgbArray = function(eye, rgb) {
		if(rgb) {
			this.setRgb(eye, rgb[0], rgb[1], rgb[2]);
		}
	};

	AlbertAi.prototype.setRgb = function(eye, red, green, blue) {
		var motoring = this.motoring;
		eye = PARTS[eye];
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		if(eye == LEFT) {
			if(typeof red == 'number') {
				motoring.leftRed = red;
			}
			if(typeof green == 'number') {
				motoring.leftGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.leftBlue = blue;
			}
		} else if(eye == RIGHT) {
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

	AlbertAi.prototype.changeRgb = function(eye, red, green, blue) {
		var motoring = this.motoring;
		eye = PARTS[eye];
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		if(eye == LEFT) {
			if(typeof red == 'number') {
				motoring.leftRed += red;
			}
			if(typeof green == 'number') {
				motoring.leftGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.leftBlue += blue;
			}
		} else if(eye == RIGHT) {
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

	AlbertAi.prototype.playSound = function(sound, count) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		sound = AI_SOUNDS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		this.__setNote(0);
		if(sound && count) {
			this.__runSound(sound, count);
		} else {
			this.__runSound(0);
		}
	};

	AlbertAi.prototype.playSoundUntil = function(sound, count, callback) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		sound = AI_SOUNDS[sound];
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

	AlbertAi.prototype.setBuzzer = function(hz) {
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

	AlbertAi.prototype.changeBuzzer = function(hz) {
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

	AlbertAi.prototype.clearSound = function() {
		this.__cancelNote();
		this.__cancelSound();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		this.__runSound(0);
	};

	AlbertAi.prototype.playNote = function(note, octave) {
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

	AlbertAi.prototype.playNoteBeat = function(note, octave, beat, callback) {
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

	AlbertAi.prototype.restBeat = function(beat, callback) {
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

	AlbertAi.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	AlbertAi.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	AlbertAi.prototype.getLeftProximity = function() {
		return this.sensory.leftProximity;
	};

	AlbertAi.prototype.getRightProximity = function() {
		return this.sensory.rightProximity;
	};

	AlbertAi.prototype.getAccelerationX = function() {
		return this.sensory.accelerationX;
	};

	AlbertAi.prototype.getAccelerationY = function() {
		return this.sensory.accelerationY;
	};

	AlbertAi.prototype.getAccelerationZ = function() {
		return this.sensory.accelerationZ;
	};

	AlbertAi.prototype.getMicTouch = function() {
		return this.sensory.micTouch;
	};

	AlbertAi.prototype.getVolumeUpTouch = function() {
		return this.sensory.volumeUpTouch;
	};

	AlbertAi.prototype.getVolumeDownTouch = function() {
		return this.sensory.volumeDownTouch;
	};

	AlbertAi.prototype.getPlayTouch = function() {
		return this.sensory.playTouch;
	};

	AlbertAi.prototype.getBackTouch = function() {
		return this.sensory.backTouch;
	};

	AlbertAi.prototype.getOidMode = function() {
		return this.sensory.oidMode;
	};

	AlbertAi.prototype.getOid = function() {
		return this.sensory.oid;
	};

	AlbertAi.prototype.getLift = function() {
		return this.sensory.lift;
	};

	AlbertAi.prototype.getPositionX = function() {
		return this.sensory.positionX;
	};

	AlbertAi.prototype.getPositionY = function() {
		return this.sensory.positionY;
	};

	AlbertAi.prototype.getOrientation = function() {
		return this.sensory.orientation;
	};

	AlbertAi.prototype.getLight = function() {
		return this.sensory.light;
	};

	AlbertAi.prototype.getSignalStrength = function() {
		return this.sensory.signalStrength;
	};

	AlbertAi.prototype.checkHandFound = function() {
		var sensory = this.sensory;
		return (sensory.handFound === undefined) ? (sensory.leftProximity > 40 || sensory.rightProximity > 40) : sensory.handFound;
	};

	AlbertAi.prototype.checkTouchState = function(sensor, event) {
		sensor = TOUCH_SENSORS[sensor];
		event = TOUCH_STATES[event];
		switch(sensor) {
			case TOUCH_MIC:
				switch(event) {
					case CLICKED: return this.micClicked;
					case LONG_PRESSED: return this.micLongPressed;
					case LONG_LONG_PRESSED: return this.micLongLongPressed;
				}
				break;
			case TOUCH_VOLUME_UP:
				switch(event) {
					case CLICKED: return this.volumeUpClicked;
					case LONG_PRESSED: return this.volumeUpLongPressed;
					case LONG_LONG_PRESSED: return this.volumeUpLongLongPressed;
				}
				break;
			case TOUCH_VOLUME_DOWN:
				switch(event) {
					case CLICKED: return this.volumeDownClicked;
					case LONG_PRESSED: return this.volumeDownLongPressed;
					case LONG_LONG_PRESSED: return this.volumeDownLongLongPressed;
				}
				break;
			case TOUCH_PLAY:
				switch(event) {
					case CLICKED: return this.playClicked;
					case LONG_PRESSED: return this.playLongPressed;
					case LONG_LONG_PRESSED: return this.playLongLongPressed;
				}
				break;
			case TOUCH_BACK:
				switch(event) {
					case CLICKED: return this.backClicked;
					case LONG_PRESSED: return this.backLongPressed;
					case LONG_LONG_PRESSED: return this.backLongLongPressed;
				}
				break;
		}
		return false;
	};

	AlbertAi.prototype.checkOid = function(value) {
		return this.sensory.oid == parseInt(value);
	};

	AlbertAi.prototype.checkTilt = function(tilt) {
		switch(TILTS[tilt]) {
			case TILT_FORWARD: return this.sensory.tilt == 1;
			case TILT_BACKWARD: return this.sensory.tilt == -1;
			case TILT_LEFT: return this.sensory.tilt == 2;
			case TILT_RIGHT: return this.sensory.tilt == -2;
			case TILT_FLIP: return this.sensory.tilt == 3;
			case TILT_NONE: return this.sensory.tilt == -3;
			case TILT_TAP: return this.tap;
			case TILT_LIFT: return this.sensory.lift == 1;
		}
		return false;
	};

	AlbertAi.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};

	function getOrCreateRobot(group, module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			switch(module) {
				case ALBERTAI: robot = new AlbertAi(index); break;
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
							if(received.states) {
								connectionState = received.states[ALBERTAI];
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
	
	ext.albertaiMoveForward = function(callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.moveForward(callback);
	};
	
	ext.albertaiMoveBackward = function(callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.albertaiTurn = function(direction, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.turn(direction, callback);
	};

	ext.albertaiMoveForwardUnit = function(value, unit, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.moveForwardUnit(value, unit, callback);
	};

	ext.albertaiMoveBackwardUnit = function(value, unit, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.moveBackwardUnit(value, unit, callback);
	};

	ext.albertaiTurnUnitInPlace = function(direction, value, unit, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.turnUnit(direction, value, unit, callback);
	};
	
	ext.albertaiPivotAroundWheelUnitInDirection = function(wheel, value, unit, toward, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.pivotUnit(wheel, value, unit, toward, callback);
	};
	
	ext.albertaiChangeBothWheelsBy = function(left, right) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.changeWheels(left, right);
	};

	ext.albertaiSetBothWheelsTo = function(left, right) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.setWheels(left, right);
	};

	ext.albertaiChangeWheelBy = function(wheel, velocity) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.changeWheel(wheel, velocity);
	};

	ext.albertaiSetWheelTo = function(wheel, velocity) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.setWheel(wheel, velocity);
	};

	ext.albertaiStop = function() {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.stop();
	};
	
	ext.albertaiMoveToOnBoard = function(toward, x, y, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.moveToOnBoard(toward, x, y, callback);
	};
	
	ext.albertaiSetOrientationToOnBoard = function(degree, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.setOrientationToOnBoard(degree, callback);
	};

	ext.albertaiSetEyeTo = function(eye, color) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.setEyeColor(eye, color);
	};
	
	ext.albertaiChangeEyeByRGB = function(eye, red, green, blue) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.changeRgb(eye, red, green, blue);
	};
	
	ext.albertaiSetEyeToRGB = function(eye, red, green, blue) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.setRgb(eye, red, green, blue);
	};

	ext.albertaiClearEye = function(eye) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.clearEye(eye);
	};

	ext.albertaiPlaySound = function(sound) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.playSound(sound, 1);
	};
	
	ext.albertaiPlaySoundTimes = function(sound, count) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.playSound(sound, count);
	};
	
	ext.albertaiPlaySoundTimesUntilDone = function(sound, count, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.playSoundUntil(sound, count, callback);
	};

	ext.albertaiChangeBuzzerBy = function(hz) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.changeBuzzer(hz);
	};

	ext.albertaiSetBuzzerTo = function(hz) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.setBuzzer(hz);
	};

	ext.albertaiClearSound = function() {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.clearSound();
	};
	
	ext.albertaiPlayNote = function(note, octave) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.albertaiPlayNoteFor = function(note, octave, beat, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};

	ext.albertaiRestFor = function(beat, callback) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.restBeat(beat, callback);
	};

	ext.albertaiChangeTempoBy = function(bpm) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.changeTempo(bpm);
	};

	ext.albertaiSetTempoTo = function(bpm) {
		var robot = getRobot(ALBERTAI, 0);
		if(robot) robot.setTempo(bpm);
	};
	
	ext.albertaiLeftProximity = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getLeftProximity() : 0;
	};
	
	ext.albertaiRightProximity = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getRightProximity() : 0;
	};
	
	ext.albertaiAccelerationX = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getAccelerationX() : 0;
	};
	
	ext.albertaiAccelerationY = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getAccelerationY() : 0;
	};
	
	ext.albertaiAccelerationZ = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getAccelerationZ() : 0;
	};
	
	ext.albertaiMicTouch = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getMicTouch() : 0;
	};
	
	ext.albertaiVolumeUpTouch = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getVolumeUpTouch() : 0;
	};
	
	ext.albertaiVolumeDownTouch = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getVolumeDownTouch() : 0;
	};
	
	ext.albertaiPlayTouch = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getPlayTouch() : 0;
	};
	
	ext.albertaiBackTouch = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getBackTouch() : 0;
	};
	
	ext.albertaiOidMode = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getOidMode() : 0;
	};
	
	ext.albertaiOid = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getOid() : -1;
	};
	
	ext.albertaiLift = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getLift() : 0;
	};
	
	ext.albertaiPositionX = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getPositionX() : -1;
	};
	
	ext.albertaiPositionY = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getPositionY() : -1;
	};
	
	ext.albertaiOrientation = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getOrientation() : -200;
	};
	
	ext.albertaiLight = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getLight() : 0;
	};
	
	ext.albertaiSignalStrength = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.getSignalStrength() : 0;
	};
	
	ext.albertaiWhenHandFound = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.checkHandFound() : false;
	};
	
	ext.albertaiWhenTouchState = function(sensor, event) {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.checkTouchState(sensor, event) : false;
	};
	
	ext.albertaiWhenOid = function(value) {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.checkOid(value) : false;
	};
	
	ext.albertaiWhenTilt = function(tilt) {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.checkTilt(tilt) : false;
	};
	
	ext.albertaiHandFound = function() {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.checkHandFound() : false;
	};
	
	ext.albertaiTouchState = function(sensor, event) {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.checkTouchState(sensor, event) : false;
	};
	
	ext.albertaiIsOid = function(value) {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.checkOid(value) : false;
	};
	
	ext.albertaiTilt = function(tilt) {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.checkTilt(tilt) : false;
	};
	
	ext.albertaiBattery = function(battery) {
		var robot = getRobot(ALBERTAI, 0);
		return robot ? robot.checkBattery(battery) : false;
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
		url: "http://albert.school"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:56417');
})({});
