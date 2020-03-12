(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const UOALBERT = 'uoalbert';
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
		en: 'UO Albert',
		ko: 'UO 알버트',
		ja: 'UOアルバート',
		uz: 'UO Albert'
	};
	const BLOCKS = {
		en1: [
			["w", "move forward", "uoMoveForward"],
			["w", "move backward", "uoMoveBackward"],
			["w", "turn %m.left_right", "uoTurn", "left"],
			["-"],
			[" ", "set %m.left_right_both eye to %m.led_color", "uoSetEyeTo", "left", "red"],
			[" ", "clear %m.left_right_both eye", "uoClearEye", "left"],
			["-"],
			[" ", "play sound %m.uo_sound", "uoPlaySound", "beep"],
			[" ", "clear sound", "uoClearSound"],
			["-"],
			["h", "when hand found", "uoWhenHandFound"],
			["h", "when touch sensor %m.when_touch_state", "uoWhenTouchState", "clicked"],
			["b", "hand found?", "uoHandFound"],
			["b", "touch sensor %m.touch_state ?", "uoTouchState", "clicked"]
		],
		en2: [
			["w", "move forward %n %m.cm_sec", "uoMoveForwardUnit", 5, "cm"],
			["w", "move backward %n %m.cm_sec", "uoMoveBackwardUnit", 5, "cm"],
			["w", "turn %m.left_right %n %m.deg_sec in place", "uoTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.left_right wheel %n %m.deg_sec in %m.forward_backward direction", "uoPivotAroundWheelUnitInDirection", "left", 90, "degrees", "forward"],
			["-"],
			[" ", "set %m.left_right_both eye to %m.led_color", "uoSetEyeTo", "left", "red"],
			[" ", "clear %m.left_right_both eye", "uoClearEye", "left"],
			["-"],
			[" ", "play sound %m.uo_sound %n times", "uoPlaySoundTimes", "beep", 1],
			["w", "play sound %m.uo_sound %n times until done", "uoPlaySoundTimesUntilDone", "beep", 1],
			[" ", "clear sound", "uoClearSound"],
			["w", "play note %m.note %m.octave for %d.beats beats", "uoPlayNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "uoRestFor", 0.25],
			[" ", "change tempo by %n", "uoChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "uoSetTempoTo", 60],
			["-"],
			["h", "when hand found", "uoWhenHandFound"],
			["h", "when touch sensor %m.when_touch_state", "uoWhenTouchState", "clicked"],
			["h", "when %m.when_tilt", "uoWhenTilt", "tilt forward"],
			["b", "hand found?", "uoHandFound"],
			["b", "touch sensor %m.touch_state ?", "uoTouchState", "clicked"],
			["b", "%m.tilt ?", "uoTilt", "tilt forward"]
		],
		en3: [
			["w", "move forward %n %m.move_unit", "uoMoveForwardUnit", 5, "cm"],
			["w", "move backward %n %m.move_unit", "uoMoveBackwardUnit", 5, "cm"],
			["w", "turn %m.left_right %n %m.turn_unit in place", "uoTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.left_right wheel %n %m.turn_unit in %m.forward_backward direction", "uoPivotAroundWheelUnitInDirection", "left", 90, "degrees", "forward"],
			[" ", "change wheels by left: %n right: %n", "uoChangeBothWheelsBy", 10, 10],
			[" ", "set wheels to left: %n right: %n", "uoSetBothWheelsTo", 50, 50],
			[" ", "change %m.left_right_both wheel by %n", "uoChangeWheelBy", "left", 10],
			[" ", "set %m.left_right_both wheel to %n", "uoSetWheelTo", "left", 50],
			[" ", "stop", "uoStop"],
			[" ", "set board size to width: %d.board_size height: %d.board_size", "uoSetBoardSizeTo", 108, 76],
			["-"],
			[" ", "set %m.left_right_both eye to %m.led_color", "uoSetEyeTo", "left", "red"],
			[" ", "change %m.left_right_both eye by r: %n g: %n b: %n", "uoChangeEyeByRGB", "left", 10, 0, 0],
			[" ", "set %m.left_right_both eye to r: %n g: %n b: %n", "uoSetEyeToRGB", "left", 255, 0, 0],
			[" ", "clear %m.left_right_both eye", "uoClearEye", "left"],
			["-"],
			[" ", "play sound %m.uo_sound %n times", "uoPlaySoundTimes", "beep", 1],
			["w", "play sound %m.uo_sound %n times until done", "uoPlaySoundTimesUntilDone", "beep", 1],
			[" ", "change buzzer by %n", "uoChangeBuzzerBy", 10],
			[" ", "set buzzer to %n", "uoSetBuzzerTo", 1000],
			[" ", "clear sound", "uoClearSound"],
			[" ", "play note %m.note %m.octave", "uoPlayNote", "C", "4"],
			["w", "play note %m.note %m.octave for %d.beats beats", "uoPlayNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "uoRestFor", 0.25],
			[" ", "change tempo by %n", "uoChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "uoSetTempoTo", 60],
			["-"],
			["r", "left proximity", "uoLeftProximity"],
			["r", "right proximity", "uoRightProximity"],
			["r", "x acceleration", "uoAccelerationX"],
			["r", "y acceleration", "uoAccelerationY"],
			["r", "z acceleration", "uoAccelerationZ"],
			["r", "touch", "uoTouch"],
			["r", "oid", "uoOid"],
			["r", "x position", "uoPositionX"],
			["r", "y position", "uoPositionY"],
			["r", "light", "uoLight"],
			["r", "temperature", "uoTemperature"],
			["r", "signal strength", "uoSignalStrength"],
			["h", "when hand found", "uoWhenHandFound"],
			["h", "when touch sensor %m.when_touch_state", "uoWhenTouchState", "clicked"],
			["h", "when oid is %n", "uoWhenOid", 0],
			["h", "when %m.when_tilt", "uoWhenTilt", "tilt forward"],
			["b", "hand found?", "uoHandFound"],
			["b", "touch sensor %m.touch_state ?", "uoTouchState", "clicked"],
			["b", "oid %n ?", "uoIsOid", 0],
			["b", "%m.tilt ?", "uoTilt", "tilt forward"],
			["b", "battery %m.battery ?", "uoBatteryState", "normal"]
		],
		ko1: [
			["w", "앞으로 이동하기", "uoMoveForward"],
			["w", "뒤로 이동하기", "uoMoveBackward"],
			["w", "%m.left_right 으로 돌기", "uoTurn", "왼쪽"],
			["-"],
			[" ", "%m.left_right_both 눈을 %m.led_color 으로 정하기", "uoSetEyeTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both 눈 끄기", "uoClearEye", "왼쪽"],
			["-"],
			[" ", "%m.uo_sound 소리 재생하기", "uoPlaySound", "삐"],
			[" ", "소리 끄기", "uoClearSound"],
			["-"],
			["h", "손 찾았을 때", "uoWhenHandFound"],
			["h", "터치 센서를 %m.when_touch_state 때", "uoWhenTouchState", "클릭했을"],
			["b", "손 찾음?", "uoHandFound"],
			["b", "터치 센서를 %m.touch_state ?", "uoTouchState", "클릭했는가"]
		],
		ko2: [
			["w", "앞으로 %n %m.cm_sec 이동하기", "uoMoveForwardUnit", 5, "cm"],
			["w", "뒤로 %n %m.cm_sec 이동하기", "uoMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right 으로 %n %m.deg_sec 제자리 돌기", "uoTurnUnitInPlace", "왼쪽", 90, "도"],
			["w", "%m.left_right 바퀴 중심으로 %n %m.deg_sec %m.forward_backward 방향으로 돌기", "uoPivotAroundWheelUnitInDirection", "왼쪽", 90, "도", "앞쪽"],
			["-"],
			[" ", "%m.left_right_both 눈을 %m.led_color 으로 정하기", "uoSetEyeTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both 눈 끄기", "uoClearEye", "왼쪽"],
			["-"],
			[" ", "%m.uo_sound 소리 %n 번 재생하기", "uoPlaySoundTimes", "삐", 1],
			["w", "%m.uo_sound 소리 %n 번 재생하고 기다리기", "uoPlaySoundTimesUntilDone", "삐", 1],
			[" ", "소리 끄기", "uoClearSound"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "uoPlayNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "uoRestFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "uoChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "uoSetTempoTo", 60],
			["-"],
			["h", "손 찾았을 때", "uoWhenHandFound"],
			["h", "터치 센서를 %m.when_touch_state 때", "uoWhenTouchState", "클릭했을"],
			["h", "%m.when_tilt 때", "uoWhenTilt", "앞으로 기울였을"],
			["b", "손 찾음?", "uoHandFound"],
			["b", "터치 센서를 %m.touch_state ?", "uoTouchState", "클릭했는가"],
			["b", "%m.tilt ?", "uoTilt", "앞으로 기울임"]
		],
		ko3: [
			["w", "앞으로 %n %m.move_unit 이동하기", "uoMoveForwardUnit", 5, "cm"],
			["w", "뒤로 %n %m.move_unit 이동하기", "uoMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right 으로 %n %m.turn_unit 제자리 돌기", "uoTurnUnitInPlace", "왼쪽", 90, "도"],
			["w", "%m.left_right 바퀴 중심으로 %n %m.turn_unit %m.forward_backward 방향으로 돌기", "uoPivotAroundWheelUnitInDirection", "왼쪽", 90, "도", "앞쪽"],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "uoChangeBothWheelsBy", 10, 10],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "uoSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both 바퀴 %n 만큼 바꾸기", "uoChangeWheelBy", "왼쪽", 10],
			[" ", "%m.left_right_both 바퀴 %n (으)로 정하기", "uoSetWheelTo", "왼쪽", 50],
			[" ", "정지하기", "uoStop"],
			[" ", "말판 크기를 폭 %d.board_size 높이 %d.board_size (으)로 정하기", "uoSetBoardSizeTo", 108, 76],
			["-"],
			[" ", "%m.left_right_both 눈을 %m.led_color 으로 정하기", "uoSetEyeTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both 눈을 R: %n G: %n B: %n 만큼 바꾸기", "uoChangeEyeByRGB", "왼쪽", 10, 0, 0],
			[" ", "%m.left_right_both 눈을 R: %n G: %n B: %n (으)로 정하기", "uoSetEyeToRGB", "왼쪽", 255, 0, 0],
			[" ", "%m.left_right_both 눈 끄기", "uoClearEye", "왼쪽"],
			["-"],
			[" ", "%m.uo_sound 소리 %n 번 재생하기", "uoPlaySoundTimes", "삐", 1],
			["w", "%m.uo_sound 소리 %n 번 재생하고 기다리기", "uoPlaySoundTimesUntilDone", "삐", 1],
			[" ", "버저 음을 %n 만큼 바꾸기", "uoChangeBuzzerBy", 10],
			[" ", "버저 음을 %n (으)로 정하기", "uoSetBuzzerTo", 1000],
			[" ", "소리 끄기", "uoClearSound"],
			[" ", "%m.note %m.octave 음을 연주하기", "uoPlayNote", "도", "4"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "uoPlayNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "uoRestFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "uoChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "uoSetTempoTo", 60],
			["-"],
			["r", "왼쪽 근접 센서", "uoLeftProximity"],
			["r", "오른쪽 근접 센서", "uoRightProximity"],
			["r", "x축 가속도", "uoAccelerationX"],
			["r", "y축 가속도", "uoAccelerationY"],
			["r", "z축 가속도", "uoAccelerationZ"],
			["r", "터치", "uoTouch"],
			["r", "OID", "uoOid"],
			["r", "x 위치", "uoPositionX"],
			["r", "y 위치", "uoPositionY"],
			["r", "밝기", "uoLight"],
			["r", "온도", "uoTemperature"],
			["r", "신호 세기", "uoSignalStrength"],
			["h", "손 찾았을 때", "uoWhenHandFound"],
			["h", "터치 센서를 %m.when_touch_state 때", "uoWhenTouchState", "클릭했을"],
			["h", "OID가 %n 일 때", "uoWhenOid", 0],
			["h", "%m.when_tilt 때", "uoWhenTilt", "앞으로 기울였을"],
			["b", "손 찾음?", "uoHandFound"],
			["b", "터치 센서를 %m.touch_state ?", "uoTouchState", "클릭했는가"],
			["b", "OID가 %n 인가?", "uoIsOid", 0],
			["b", "%m.tilt ?", "uoTilt", "앞으로 기울임"],
			["b", "배터리 %m.battery ?", "uoBatteryState", "정상"]
		],
		ja1: [
			["w", "前へ移動する", "uoMoveForward"],
			["w", "後ろへ移動する", "uoMoveBackward"],
			["w", "%m.left_right へ回す", "uoTurn", "左"],
			["-"],
			[" ", "%m.left_right_both 眼を %m.led_color にする", "uoSetEyeTo", "左", "赤色"],
			[" ", "%m.left_right_both 眼を消す", "uoClearEye", "左"],
			["-"],
			[" ", "%m.uo_sound 音を鳴らす", "uoPlaySound", "ビープ"],
			[" ", "音を消す", "uoClearSound"],
			["-"],
			["h", "手を見つけたとき", "uoWhenHandFound"],
			["h", "タッチセンサーを %m.when_touch_state とき", "uoWhenTouchState", "クリックした"],
			["b", "手を見つけたか?", "uoHandFound"],
			["b", "タッチセンサーを %m.touch_state ?", "uoTouchState", "クリックしたか"]
		],
		ja2: [
			["w", "前へ %n %m.cm_sec 移動する", "uoMoveForwardUnit", 5, "cm"],
			["w", "後ろへ %n %m.cm_sec 移動する", "uoMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right へ %n %m.deg_sec その場で回す", "uoTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.left_right 車輪を中心に %n %m.deg_sec %m.forward_backward 方向に回す", "uoPivotAroundWheelUnitInDirection", "左", 90, "度", "前"],
			["-"],
			[" ", "%m.left_right_both 眼を %m.led_color にする", "uoSetEyeTo", "左", "赤色"],
			[" ", "%m.left_right_both 眼を消す", "uoClearEye", "左"],
			["-"],
			[" ", "%m.uo_sound 音を %n 回鳴らす", "uoPlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.uo_sound 音を %n 回鳴らす", "uoPlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "音を消す", "uoClearSound"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "uoPlayNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "uoRestFor", 0.25],
			[" ", "テンポを %n ずつ変える", "uoChangeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "uoSetTempoTo", 60],
			["-"],
			["h", "手を見つけたとき", "uoWhenHandFound"],
			["h", "タッチセンサーを %m.when_touch_state とき", "uoWhenTouchState", "クリックした"],
			["h", "%m.when_tilt とき", "uoWhenTilt", "前に傾けた"],
			["b", "手を見つけたか?", "uoHandFound"],
			["b", "タッチセンサーを %m.touch_state ?", "uoTouchState", "クリックしたか"],
			["b", "%m.tilt ?", "uoTilt", "前に傾けたか"]
		],
		ja3: [
			["w", "前へ %n %m.move_unit 移動する", "uoMoveForwardUnit", 5, "cm"],
			["w", "後ろへ %n %m.move_unit 移動する", "uoMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right へ %n %m.turn_unit その場で回す", "uoTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.left_right 車輪を中心に %n %m.turn_unit %m.forward_backward 方向に回す", "uoPivotAroundWheelUnitInDirection", "左", 90, "度", "前"],
			[" ", "左車輪を %n 右車輪を %n ずつ変える", "uoChangeBothWheelsBy", 10, 10],
			[" ", "左車輪を %n 右車輪を %n にする", "uoSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both 車輪を %n ずつ変える", "uoChangeWheelBy", "左", 10],
			[" ", "%m.left_right_both 車輪を %n にする", "uoSetWheelTo", "左", 50],
			[" ", "停止する", "uoStop"],
			[" ", "ボード板幅を %d.board_size 高さを %d.board_size にする", "uoSetBoardSizeTo", 108, 76],
			["-"],
			[" ", "%m.left_right_both 眼を %m.led_color にする", "uoSetEyeTo", "左", "赤色"],
			[" ", "%m.left_right_both 眼をR: %n G: %n B: %n ずつ変える", "uoChangeEyeByRGB", "左", 10, 0, 0],
			[" ", "%m.left_right_both 眼をR: %n G: %n B: %n にする", "uoSetEyeToRGB", "左", 255, 0, 0],
			[" ", "%m.left_right_both 眼を消す", "uoClearEye", "左"],
			["-"],
			[" ", "%m.uo_sound 音を %n 回鳴らす", "uoPlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.uo_sound 音を %n 回鳴らす", "uoPlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "ブザー音を %n ずつ変える", "uoChangeBuzzerBy", 10],
			[" ", "ブザー音を %n にする", "uoSetBuzzerTo", 1000],
			[" ", "音を消す", "uoClearSound"],
			[" ", "%m.note %m.octave 音を鳴らす", "uoPlayNote", "ド", "4"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "uoPlayNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "uoRestFor", 0.25],
			[" ", "テンポを %n ずつ変える", "uoChangeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "uoSetTempoTo", 60],
			["-"],
			["r", "左近接センサー", "uoLeftProximity"],
			["r", "右近接センサー", "uoRightProximity"],
			["r", "x軸加速度", "uoAccelerationX"],
			["r", "y軸加速度", "uoAccelerationY"],
			["r", "z軸加速度", "uoAccelerationZ"],
			["r", "タッチ", "uoTouch"],
			["r", "OID", "uoOid"],
			["r", "x位置", "uoPositionX"],
			["r", "y位置", "uoPositionY"],
			["r", "照度", "uoLight"],
			["r", "温度", "uoTemperature"],
			["r", "信号強度", "uoSignalStrength"],
			["h", "手を見つけたとき", "uoWhenHandFound"],
			["h", "タッチセンサーを %m.when_touch_state とき", "uoWhenTouchState", "クリックした"],
			["h", "OIDが %n であるとき", "uoWhenOid", 0],
			["h", "%m.when_tilt とき", "uoWhenTilt", "前に傾けた"],
			["b", "手を見つけたか?", "uoHandFound"],
			["b", "タッチセンサーを %m.touch_state ?", "uoTouchState", "クリックしたか"],
			["b", "OIDが %n ですか?", "uoIsOid", 0],
			["b", "%m.tilt ?", "uoTilt", "前に傾けたか"],
			["b", "電池が %m.battery ?", "uoBatteryState", "正常か"]
		],
		uz1: [
			["w", "oldinga yurish", "uoMoveForward"],
			["w", "orqaga yurish", "uoMoveBackward"],
			["w", "%m.left_right ga o'girilish", "uoTurn", "chap"],
			["-"],
			[" ", "%m.left_right_both ko'zni %m.led_color ga sozlash", "uoSetEyeTo", "chap", "qizil"],
			[" ", "%m.left_right_both ko'zni o'chirish", "uoClearEye", "chap"],
			["-"],
			[" ", "%m.uo_sound tovushni ijro etish", "uoPlaySound", "qisqa"],
			[" ", "tovushni o'chirish", "uoClearSound"],
			["-"],
			["h", "qo'l topilganda", "uoWhenHandFound"],
			["h", "teginish sensorini %m.when_touch_state da", "uoWhenTouchState", "bosgan"],
			["b", "qo'l topildimi?", "uoHandFound"],
			["b", "teginish sensorini %m.touch_state ?", "uoTouchState", "bosgan"]
		],
		uz2: [
			["w", "oldinga %n %m.cm_sec yurish", "uoMoveForwardUnit", 5, "cm"],
			["w", "orqaga %n %m.cm_sec yurish", "uoMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "uoTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.left_right g'ildirak markaziga %n %m.deg_sec %m.forward_backward yo'nalishga o'girilish", "uoPivotAroundWheelUnitInDirection", "chap", 90, "daraja", "old"],
			["-"],
			[" ", "%m.left_right_both ko'zni %m.led_color ga sozlash", "uoSetEyeTo", "chap", "qizil"],
			[" ", "%m.left_right_both ko'zni o'chirish", "uoClearEye", "chap"],
			["-"],
			[" ", "%m.uo_sound tovushni %n marta ijro etish", "uoPlaySoundTimes", "qisqa", 1],
			["w", "%m.uo_sound tovushni %n marta ijro tugaguncha kutish", "uoPlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "tovushni o'chirish", "uoClearSound"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "uoPlayNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "uoRestFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "uoChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "uoSetTempoTo", 60],
			["-"],
			["h", "qo'l topilganda", "uoWhenHandFound"],
			["h", "teginish sensorini %m.when_touch_state da", "uoWhenTouchState", "bosgan"],
			["h", "%m.when_tilt bo'lganda", "uoWhenTilt", "oldinga eğin"],
			["b", "qo'l topildimi?", "uoHandFound"],
			["b", "teginish sensorini %m.touch_state ?", "uoTouchState", "bosgan"],
			["b", "%m.tilt ?", "uoTilt", "oldinga eğin"]
		],
		uz3: [
			["w", "oldinga %n %m.move_unit yurish", "uoMoveForwardUnit", 5, "cm"],
			["w", "orqaga %n %m.move_unit yurish", "uoMoveBackwardUnit", 5, "cm"],
			["w", "%m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "uoTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.left_right g'ildirak markaziga %n %m.turn_unit %m.forward_backward yo'nalishga o'girilish", "uoPivotAroundWheelUnitInDirection", "chap", 90, "daraja", "old"],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "uoChangeBothWheelsBy", 10, 10],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "uoSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both g'ildirakni %n ga o'zgartirish", "uoChangeWheelBy", "chap", 10],
			[" ", "%m.left_right_both g'ildirakni %n ga sozlash", "uoSetWheelTo", "chap", 50],
			[" ", "to'xtatish", "uoStop"],
			[" ", "doska kengligini %d.board_size balandligini %d.board_size ga sozlash", "uoSetBoardSizeTo", 108, 76],
			["-"],
			[" ", "%m.left_right_both ko'zni %m.led_color ga sozlash", "uoSetEyeTo", "chap", "qizil"],
			[" ", "%m.left_right_both ko'zni r: %n g: %n b: %n ga o'zgartirish", "uoChangeEyeByRGB", "chap", 10, 0, 0],
			[" ", "%m.left_right_both ko'zni r: %n g: %n b: %n ga sozlash", "uoSetEyeToRGB", "chap", 255, 0, 0],
			[" ", "%m.left_right_both ko'zni o'chirish", "uoClearEye", "chap"],
			["-"],
			[" ", "%m.uo_sound tovushni %n marta ijro etish", "uoPlaySoundTimes", "qisqa", 1],
			["w", "%m.uo_sound tovushni %n marta ijro tugaguncha kutish", "uoPlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "buzerning ovozini %n ga o'zgartirish", "uoChangeBuzzerBy", 10],
			[" ", "buzerning ovozini %n ga sozlash", "uoSetBuzzerTo", 1000],
			[" ", "tovushni o'chirish", "uoClearSound"],
			[" ", "%m.note %m.octave notani ijro etish", "uoPlayNote", "do", "4"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "uoPlayNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "uoRestFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "uoChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "uoSetTempoTo", 60],
			["-"],
			["r", "chap yaqinlik", "uoLeftProximity"],
			["r", "o'ng yaqinlik", "uoRightProximity"],
			["r", "x tezlanish", "uoAccelerationX"],
			["r", "y tezlanish", "uoAccelerationY"],
			["r", "z tezlanish", "uoAccelerationZ"],
			["r", "teginish", "uoTouch"],
			["r", "oid", "uoOid"],
			["r", "x lavozimi", "uoPositionX"],
			["r", "y lavozimi", "uoPositionY"],
			["r", "yorug'lik", "uoLight"],
			["r", "harorat", "uoTemperature"],
			["r", "signal kuchi", "uoSignalStrength"],
			["h", "qo'l topilganda", "uoWhenHandFound"],
			["h", "teginish sensorini %m.when_touch_state da", "uoWhenTouchState", "bosgan"],
			["h", "oid %n bo'lganida", "uoWhenOid", 0],
			["h", "%m.when_tilt bo'lganda", "uoWhenTilt", "oldinga eğin"],
			["b", "qo'l topildimi?", "uoHandFound"],
			["b", "teginish sensorini %m.touch_state ?", "uoTouchState", "bosgan"],
			["b", "oid %n ?", "uoIsOid", 0],
			["b", "%m.tilt ?", "uoTilt", "oldinga eğin"],
			["b", "batareya %m.battery ?", "uoBatteryState", "normal"]
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
			"board_size": ["37", "53", "76", "108", "153", "217"],
			"led_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "violet", "purple", "white"],
			"uo_sound": ["beep", "siren", "engine", "robot", "dibidibidip", "march", "birthday"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_touch_state": ["clicked", "long-pressed (1.5 secs)", "long-long-pressed (3 secs)"],
			"when_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"touch_state": ["clicked", "long-pressed (1.5 secs)", "long-long-pressed (3 secs)"],
			"tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
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
			"board_size": ["37", "53", "76", "108", "153", "217"],
			"led_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"uo_sound": ["삐", "사이렌", "엔진", "로봇", "디비디비딥", "행진", "생일"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_touch_state": ["클릭했을", "오래 눌렀을(1.5초)", "아주 오래 눌렀을(3초)"],
			"when_tilt": ["앞으로 기울였을", "뒤로 기울였을", "왼쪽으로 기울였을", "오른쪽으로 기울였을", "거꾸로 뒤집었을", "기울이지 않았을"],
			"touch_state": ["클릭했는가", "오래 눌렀는가(1.5초)", "아주 오래 눌렀는가(3초)"],
			"tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "기울이지 않음"],
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
			"board_size": ["37", "53", "76", "108", "153", "217"],
			"led_color": ["赤色", "橙色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"uo_sound": ["ビープ", "サイレン", "エンジン", "ロボット", "ディバディバディップ", "行進", "誕生"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_touch_state": ["クリックした", "長く押した(1.5秒)", "非常に長く押した(3秒)"],
			"when_tilt": ["前に傾けた", "後に傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾けなかった"],
			"touch_state": ["クリックしたか", "長く押したか(1.5秒)", "非常に長く押したか(3秒)"],
			"tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾けなかったか"],
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
			"board_size": ["37", "53", "76", "108", "153", "217"],
			"led_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "binafsha", "siyoh", "oq"],
			"uo_sound": ["qisqa", "sirena", "motor", "robot", "dibidibidip", "marsh", "tug'ilgan kun"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_touch_state": ["bosgan", "uzoq bosganmi (1.5 soniya)", "juda uzoq bosganmi (3 soniya)"],
			"when_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q"],
			"touch_state": ["bosgan", "uzoq bosganmi (1.5 soniya)", "juda uzoq bosganmi (3 soniya)"],
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
	var RGB_COLORS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var UO_SOUNDS = {};
	var TILTS = {};
	var BATTERY_STATES = {};
	
	const LEFT = 1;
	const RIGHT = 2;
	const FORWARD = 1;
	const SECONDS = 2;
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
		tmp = MENUS[i]['left_right'];
		DIRECTIONS[tmp[0]] = LEFT;
		DIRECTIONS[tmp[1]] = RIGHT;
		tmp = MENUS[i]['forward_backward'];
		TOWARDS[tmp[0]] = FORWARD;
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
		tmp = MENUS[i]['uo_sound'];
		UO_SOUNDS[tmp[0]] = 1; // beep
		UO_SOUNDS[tmp[1]] = 2; // siren
		UO_SOUNDS[tmp[2]] = 3; // engine
		UO_SOUNDS[tmp[3]] = 4; // robot
		UO_SOUNDS[tmp[4]] = 7; // dibidibidip
		UO_SOUNDS[tmp[5]] = 5; // march
		UO_SOUNDS[tmp[6]] = 6; // birthday
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
	}
	
	function UoAlbert(index) {
		this.sensory = {
			map: 0,
			signalStrength: 0,
			leftProximity: 0,
			rightProximity: 0,
			accelerationX: 0,
			accelerationY: 0,
			accelerationZ: 0,
			positionX: -1,
			positionY: -1,
			light: 0,
			temperature: 0,
			battery: 0,
			touch: 0,
			oid: -1,
			pulseCount: 0,
			wheelState: 0,
			soundState: 0,
			batteryState: 2,
			tilt: 0,
			handFound: false
		};
		this.motoring = {
			module: UOALBERT,
			index: index,
			map: 0xbf800000,
			leftWheel: 0,
			rightWheel: 0,
			leftRed: 0,
			leftGreen: 0,
			leftBlue: 0,
			rightRed: 0,
			rightGreen: 0,
			rightBlue: 0,
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
		this.motionCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.tempo = 60;
		this.timeouts = [];
	}

	UoAlbert.prototype.reset = function() {
		var motoring = this.motoring;
		motoring.map = 0xbff80001;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.leftRed = 0;
		motoring.leftGreen = 0;
		motoring.leftBlue = 0;
		motoring.rightRed = 0;
		motoring.rightGreen = 0;
		motoring.rightBlue = 0;
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
		this.motionCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.tempo = 60;

		this.__removeAllTimeouts();
	};

	UoAlbert.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	UoAlbert.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};

	UoAlbert.prototype.clearMotoring = function() {
		this.motoring.map = 0xbf800000;
	};

	UoAlbert.prototype.clearEvent = function() {
	};

	UoAlbert.prototype.__setPulse = function(pulse) {
		this.motoring.pulse = pulse;
		this.motoring.map |= 0x00400000;
	};

	UoAlbert.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x00200000;
	};

	UoAlbert.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	UoAlbert.prototype.__cancelNote = function() {
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

	UoAlbert.prototype.__setSound = function(sound) {
		this.motoring.sound = sound;
		this.motoring.map |= 0x00100000;
	};

	UoAlbert.prototype.__runSound = function(sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			this.currentSound = sound;
			this.soundRepeat = count;
			this.__setSound(sound);
		}
	};

	UoAlbert.prototype.__cancelSound = function() {
		this.soundCallback = undefined;
	};

	UoAlbert.prototype.__setBoardSize = function(width, height) {
		this.motoring.boardWidth = width;
		this.motoring.boardHeight = height;
		this.motoring.map |= 0x00080000;
	};

	UoAlbert.prototype.__setMotion = function(type, unit, speed, value, radius) {
		var motoring = this.motoring;
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map |= 0x00000001;
	};

	UoAlbert.prototype.__cancelMotion = function() {
		this.motionCallback = undefined;
	};

	UoAlbert.prototype.handleSensory = function() {
		var self = this;
		var sensory = self.sensory;

		if(self.motionCallback && (sensory.map & 0x00000010) != 0) {
			if(sensory.wheelState == 0) {
				self.motoring.leftWheel = 0;
				self.motoring.rightWheel = 0;
				var callback = self.motionCallback;
				self.__cancelMotion();
				if(callback) callback();
			}
		}
		if((sensory.map & 0x00000008) != 0) {
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

	UoAlbert.prototype.__motion = function(type, callback) {
		var motoring = this.motoring;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(type, 1, 0, 0, 0); // type, unit, speed, value, radius
		this.motionCallback = callback;
	};

	UoAlbert.prototype.__motionUnit = function(type, unit, value, callback) {
		var motoring = this.motoring;
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

	UoAlbert.prototype.moveForward = function(callback) {
		this.__motion(101, callback);
	};

	UoAlbert.prototype.moveBackward = function(callback) {
		this.__motion(102, callback);
	};

	UoAlbert.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(103, callback);
		} else {
			this.__motion(104, callback);
		}
	};

	UoAlbert.prototype.moveForwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(2, UNITS[unit], -value, callback);
		else this.__motionUnit(1, UNITS[unit], value, callback);
	};

	UoAlbert.prototype.moveBackwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(1, UNITS[unit], -value, callback);
		else this.__motionUnit(2, UNITS[unit], value, callback);
	};

	UoAlbert.prototype.turnUnit = function(direction, value, unit, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			if(value < 0) this.__motionUnit(4, UNITS[unit], -value, callback);
			else this.__motionUnit(3, UNITS[unit], value, callback);
		} else {
			if(value < 0) this.__motionUnit(3, UNITS[unit], -value, callback);
			else this.__motionUnit(4, UNITS[unit], value, callback);
		}
	};

	UoAlbert.prototype.pivotUnit = function(part, value, unit, toward, callback) {
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

	UoAlbert.prototype.setWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
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

	UoAlbert.prototype.changeWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
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

	UoAlbert.prototype.setWheel = function(wheel, velocity) {
		var motoring = this.motoring;
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

	UoAlbert.prototype.changeWheel = function(wheel, velocity) {
		var motoring = this.motoring;
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

	UoAlbert.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
	};

	UoAlbert.prototype.setBoardSize = function(width, height) {
		var motoring = this.motoring;
		width = parseInt(width);
		height = parseInt(height);
		if((typeof width == 'number') && (typeof height == 'number')) {
			this.__setBoardSize(width, height);
		}
	};

	UoAlbert.prototype.setEyeColor = function(eye, color) {
		var rgb = RGB_COLORS[color];
		if(rgb) {
			this.setRgb(eye, rgb[0], rgb[1], rgb[2]);
		}
	};

	UoAlbert.prototype.clearEye = function(eye) {
		this.setRgb(eye, 0, 0, 0);
	};

	UoAlbert.prototype.setRgbArray = function(eye, rgb) {
		if(rgb) {
			this.setRgb(eye, rgb[0], rgb[1], rgb[2]);
		}
	};

	UoAlbert.prototype.setRgb = function(eye, red, green, blue) {
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

	UoAlbert.prototype.changeRgb = function(eye, red, green, blue) {
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

	UoAlbert.prototype.playSound = function(sound, count) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		sound = UO_SOUNDS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		this.__setNote(0);
		if(sound && count) {
			this.__runSound(sound, count);
		} else {
			this.__runSound(0);
		}
	};

	UoAlbert.prototype.playSoundUntil = function(sound, count, callback) {
		var motoring = this.motoring;
		this.__cancelNote();
		this.__cancelSound();

		sound = UO_SOUNDS[sound];
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

	UoAlbert.prototype.setBuzzer = function(hz) {
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

	UoAlbert.prototype.changeBuzzer = function(hz) {
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

	UoAlbert.prototype.clearSound = function() {
		this.__cancelNote();
		this.__cancelSound();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		this.__runSound(0);
	};

	UoAlbert.prototype.playNote = function(note, octave) {
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

	UoAlbert.prototype.playNoteBeat = function(note, octave, beat, callback) {
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

	UoAlbert.prototype.restBeat = function(beat, callback) {
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

	UoAlbert.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	UoAlbert.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	UoAlbert.prototype.getLeftProximity = function() {
		return this.sensory.leftProximity;
	};

	UoAlbert.prototype.getRightProximity = function() {
		return this.sensory.rightProximity;
	};

	UoAlbert.prototype.getAccelerationX = function() {
		return this.sensory.accelerationX;
	};

	UoAlbert.prototype.getAccelerationY = function() {
		return this.sensory.accelerationY;
	};

	UoAlbert.prototype.getAccelerationZ = function() {
		return this.sensory.accelerationZ;
	};

	UoAlbert.prototype.getTouch = function() {
		return this.sensory.touch;
	};

	UoAlbert.prototype.getOid = function() {
		return this.sensory.oid;
	};

	UoAlbert.prototype.getPositionX = function() {
		return this.sensory.positionX;
	};

	UoAlbert.prototype.getPositionY = function() {
		return this.sensory.positionY;
	};

	UoAlbert.prototype.getLight = function() {
		return this.sensory.light;
	};

	UoAlbert.prototype.getTemperature = function() {
		return this.sensory.temperature;
	};

	UoAlbert.prototype.getSignalStrength = function() {
		return this.sensory.signalStrength;
	};

	UoAlbert.prototype.checkHandFound = function() {
		var sensory = this.sensory;
		return (sensory.handFound === undefined) ? (sensory.leftProximity > 40 || sensory.rightProximity > 40) : sensory.handFound;
	};

	UoAlbert.prototype.checkTouch = function() {
		return this.sensory.touch == 1;
	};

	UoAlbert.prototype.checkOid = function(value) {
		return this.sensory.oid == parseInt(value);
	};

	UoAlbert.prototype.checkTilt = function(tilt) {
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

	UoAlbert.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};

	function getOrCreateRobot(group, module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			switch(module) {
				case UOALBERT: robot = new UoAlbert(index); break;
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
							if(received.module == UOALBERT) {
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
										var robot = getRobot(UOALBERT, 0);
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
	
	ext.uoMoveForward = function(callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.moveForward(callback);
	};
	
	ext.uoMoveBackward = function(callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.uoTurn = function(direction, callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.turn(direction, callback);
	};

	ext.uoMoveForwardUnit = function(value, unit, callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.moveForwardUnit(value, unit, callback);
	};

	ext.uoMoveBackwardUnit = function(value, unit, callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.moveBackwardUnit(value, unit, callback);
	};

	ext.uoTurnUnitInPlace = function(direction, value, unit, callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.turnUnit(direction, value, unit, callback);
	};
	
	ext.uoPivotAroundWheelUnitInDirection = function(wheel, value, unit, head, callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.pivotUnit(wheel, value, unit, head, callback);
	};
	
	ext.uoChangeBothWheelsBy = function(left, right) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.changeWheels(left, right);
	};

	ext.uoSetBothWheelsTo = function(left, right) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.setWheels(left, right);
	};

	ext.uoChangeWheelBy = function(wheel, speed) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.changeWheel(wheel, speed);
	};

	ext.uoSetWheelTo = function(wheel, speed) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.setWheel(wheel, speed);
	};

	ext.uoStop = function() {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.stop();
	};
	
	ext.uoSetBoardSizeTo = function(width, height) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.setBoardSize(width, height);
	};

	ext.uoSetEyeTo = function(eye, color) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.setEyeColor(eye, color);
	};
	
	ext.uoChangeEyeByRGB = function(eye, red, green, blue) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.changeRgb(eye, red, green, blue);
	};
	
	ext.uoSetEyeToRGB = function(eye, red, green, blue) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.setRgb(eye, red, green, blue);
	};

	ext.uoClearEye = function(eye) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.clearEye(eye);
	};

	ext.uoPlaySound = function(sound) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.playSound(sound, 1);
	};
	
	ext.uoPlaySoundTimes = function(sound, count) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.playSound(sound, count);
	};
	
	ext.uoPlaySoundTimesUntilDone = function(sound, count, callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.playSoundUntil(sound, count, callback);
	};

	ext.uoChangeBuzzerBy = function(hz) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.changeBuzzer(hz);
	};

	ext.uoSetBuzzerTo = function(hz) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.setBuzzer(hz);
	};

	ext.uoClearSound = function() {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.clearSound();
	};
	
	ext.uoPlayNote = function(note, octave) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.uoPlayNoteFor = function(note, octave, beat, callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};

	ext.uoRestFor = function(beat, callback) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.restBeat(beat, callback);
	};

	ext.uoChangeTempoBy = function(bpm) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.changeTempo(bpm);
	};

	ext.uoSetTempoTo = function(bpm) {
		var robot = getRobot(UOALBERT, 0);
		if(robot) robot.setTempo(bpm);
	};
	
	ext.uoLeftProximity = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getLeftProximity() : 0;
	};
	
	ext.uoRightProximity = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getRightProximity() : 0;
	};
	
	ext.uoAccelerationX = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getAccelerationX() : 0;
	};
	
	ext.uoAccelerationY = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getAccelerationY() : 0;
	};
	
	ext.uoAccelerationZ = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getAccelerationZ() : 0;
	};
	
	ext.uoTouch = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getTouch() : 0;
	};
	
	ext.uoOid = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getOid() : -1;
	};
	
	ext.uoPositionX = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getPositionX() : -1;
	};
	
	ext.uoPositionY = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getPositionY() : -1;
	};
	
	ext.uoLight = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getLight() : 0;
	};
	
	ext.uoTemperature = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getTemperature() : 0;
	};
	
	ext.uoSignalStrength = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.getSignalStrength() : 0;
	};
	
	ext.uoWhenHandFound = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.checkHandFound() : false;
	};
	
	ext.uoWhenTouched = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.checkTouch() : false;
	};
	
	ext.uoWhenOid = function(value) {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.checkOid(value) : false;
	};
	
	ext.uoWhenTilt = function(tilt) {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.checkTilt(tilt) : false;
	};
	
	ext.uoHandFound = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.checkHandFound() : false;
	};
	
	ext.uoTouching = function() {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.checkTouch() : false;
	};
	
	ext.uoIsOid = function(value) {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.checkOid(value) : false;
	};
	
	ext.uoTilt = function(tilt) {
		var robot = getRobot(UOALBERT, 0);
		return robot ? robot.checkTilt(tilt) : false;
	};
	
	ext.uoBatteryState = function(battery) {
		var robot = getRobot(UOALBERT, 0);
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

	open('ws://localhost:51417');
})({});
