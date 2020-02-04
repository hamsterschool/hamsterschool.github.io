(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const ZERONE = 'zerone';
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
		en: 'Zerone',
		ko: '제로원',
		ja: 'ゼロワン',
		uz: 'Zerone'
	};
	const BLOCKS = {
		en1: [
			["w", "move forward", "zeroneMoveForward"],
			["w", "move backward", "zeroneMoveBackward"],
			["w", "turn %m.left_right", "zeroneTurn", "left"],
			["-"],
			[" ", "set %m.left_right_head_tail_all led to %m.led_color", "zeroneSetLedTo", "head", "red"],
			[" ", "clear %m.left_right_head_tail_all led", "zeroneClearLed", "head"],
			["-"],
			[" ", "play sound %m.sound_effect", "zeronePlaySound", "beep"],
			[" ", "clear sound", "zeroneClearSound"],
			["-"],
			[" ", "start %m.zerone_sensor_mode sensor", "zeroneStartSensor", "gesture"],
			["b", "gesture %m.gesture ?", "zeroneIsGesture", "forward"],
			["b", "touching %m.zerone_color ?", "zeroneTouchingColor", "red"]
		],
		en2: [
			["w", "move forward %n %m.cm_sec", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "move backward %n %m.cm_sec", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "turn %m.left_right %n %m.deg_sec in place", "zeroneTurnUnitInPlace", "left", 90, "degrees"],
			["-"],
			[" ", "set %m.left_right_head_tail_all led to %m.led_color", "zeroneSetLedTo", "head", "red"],
			[" ", "clear %m.left_right_head_tail_all led", "zeroneClearLed", "head"],
			["-"],
			[" ", "play sound %m.sound_effect %n times", "zeronePlaySoundTimes", "beep", 1],
			["w", "play sound %m.sound_effect %n times until done", "zeronePlaySoundTimesUntilDone", "beep", 1],
			[" ", "clear sound", "zeroneClearSound"],
			["w", "play note %m.note %m.octave for %d.beats beats", "zeronePlayNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "zeroneRestFor", 0.25],
			[" ", "change tempo by %n", "zeroneChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "zeroneSetTempoTo", 60],
			["-"],
			[" ", "start %m.zerone_sensor_mode sensor", "zeroneStartSensor", "gesture"],
			["b", "gesture %m.gesture ?", "zeroneIsGesture", "forward"],
			["b", "touching %m.zerone_color ?", "zeroneTouchingColor", "red"]
		],
		en3: [
			["w", "move forward %n %m.move_unit", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "move backward %n %m.move_unit", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "turn %m.left_right %n %m.turn_unit in place", "zeroneTurnUnitInPlace", "left", 90, "degrees"],
			[" ", "change wheels by left: %n right: %n", "zeroneChangeBothWheelsBy", 10, 10],
			[" ", "set wheels to left: %n right: %n", "zeroneSetBothWheelsTo", 50, 50],
			[" ", "change %m.left_right_both wheel by %n", "zeroneChangeWheelBy", "left", 10],
			[" ", "set %m.left_right_both wheel to %n", "zeroneSetWheelTo", "left", 50],
			[" ", "stop", "zeroneStop"],
			["-"],
			[" ", "set %m.left_right_head_tail_all led to %m.led_color", "zeroneSetLedTo", "head", "red"],
			[" ", "change %m.left_right_head_tail_all led by r: %n g: %n b: %n", "zeroneChangeLedByRGB", "head", 10, 0, 0],
			[" ", "set %m.left_right_head_tail_all led to r: %n g: %n b: %n", "zeroneSetLedToRGB", "head", 255, 0, 0],
			[" ", "clear %m.left_right_head_tail_all led", "zeroneClearLed", "head"],
			["-"],
			[" ", "play sound %m.sound_effect %n times", "zeronePlaySoundTimes", "beep", 1],
			["w", "play sound %m.sound_effect %n times until done", "zeronePlaySoundTimesUntilDone", "beep", 1],
			[" ", "change buzzer by %n", "zeroneChangeBuzzerBy", 10],
			[" ", "set buzzer to %n", "zeroneSetBuzzerTo", 1000],
			[" ", "clear sound", "zeroneClearSound"],
			[" ", "play note %m.note %m.octave", "zeronePlayNote", "C", "4"],
			["w", "play note %m.note %m.octave for %d.beats beats", "zeronePlayNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "zeroneRestFor", 0.25],
			[" ", "change tempo by %n", "zeroneChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "zeroneSetTempoTo", 60],
			["-"],
			[" ", "start %m.zerone_sensor_mode sensor", "zeroneStartSensor", "gesture"],
			["r", "left proximity", "zeroneLeftProximity"],
			["r", "right proximity", "zeroneRightProximity"],
			["r", "front proximity", "zeroneFrontProximity"],
			["r", "rear proximity", "zeroneRearProximity"],
			["r", "gesture", "zeroneGesture"],
			["r", "color number", "zeroneColorNumber"],
			["r", "color r", "zeroneColorRed"],
			["r", "color g", "zeroneColorGreen"],
			["r", "color b", "zeroneColorBlue"],
			["r", "signal strength", "zeroneSignalStrength"],
			["b", "gesture %m.gesture ?", "zeroneIsGesture", "forward"],
			["b", "touching %m.zerone_color ?", "zeroneTouchingColor", "red"],
			["b", "battery %m.battery ?", "zeroneBattery", "normal"]
		],
		ko1: [
			["w", "앞으로 이동하기", "zeroneMoveForward"],
			["w", "뒤로 이동하기", "zeroneMoveBackward"],
			["w", "%m.left_right 으로 돌기", "zeroneTurn", "왼쪽"],
			["-"],
			[" ", "%m.left_right_head_tail_all LED를 %m.led_color 으로 정하기", "zeroneSetLedTo", "앞쪽", "빨간색"],
			[" ", "%m.left_right_head_tail_all LED 끄기", "zeroneClearLed", "앞쪽"],
			["-"],
			[" ", "%m.sound_effect 소리 재생하기", "zeronePlaySound", "삐"],
			[" ", "소리 끄기", "zeroneClearSound"],
			["-"],
			[" ", "%m.zerone_sensor_mode 센서 시작하기", "zeroneStartSensor", "제스처"],
			["b", "제스처가 %m.gesture 인가?", "zeroneIsGesture", "앞으로"],
			["b", "%m.zerone_color 에 닿았는가?", "zeroneTouchingColor", "빨간색"]
		],
		ko2: [
			["w", "앞으로 %n %m.cm_sec 이동하기", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "뒤로 %n %m.cm_sec 이동하기", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "%m.left_right 으로 %n %m.deg_sec 제자리 돌기", "zeroneTurnUnitInPlace", "왼쪽", 90, "도"],
			["-"],
			[" ", "%m.left_right_head_tail_all LED를 %m.led_color 으로 정하기", "zeroneSetLedTo", "앞쪽", "빨간색"],
			[" ", "%m.left_right_head_tail_all LED 끄기", "zeroneClearLed", "앞쪽"],
			["-"],
			[" ", "%m.sound_effect 소리 %n 번 재생하기", "zeronePlaySoundTimes", "삐", 1],
			["w", "%m.sound_effect 소리 %n 번 재생하고 기다리기", "zeronePlaySoundTimesUntilDone", "삐", 1],
			[" ", "소리 끄기", "zeroneClearSound"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "zeronePlayNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "zeroneRestFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "zeroneChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "zeroneSetTempoTo", 60],
			["-"],
			[" ", "%m.zerone_sensor_mode 센서 시작하기", "zeroneStartSensor", "제스처"],
			["b", "제스처가 %m.gesture 인가?", "zeroneIsGesture", "앞으로"],
			["b", "%m.zerone_color 에 닿았는가?", "zeroneTouchingColor", "빨간색"]
		],
		ko3: [
			["w", "앞으로 %n %m.move_unit 이동하기", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "뒤로 %n %m.move_unit 이동하기", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "%m.left_right 으로 %n %m.turn_unit 제자리 돌기", "zeroneTurnUnitInPlace", "왼쪽", 90, "도"],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "zeroneChangeBothWheelsBy", 10, 10],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "zeroneSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both 바퀴 %n 만큼 바꾸기", "zeroneChangeWheelBy", "왼쪽", 10],
			[" ", "%m.left_right_both 바퀴 %n (으)로 정하기", "zeroneSetWheelTo", "왼쪽", 50],
			[" ", "정지하기", "zeroneStop"],
			["-"],
			[" ", "%m.left_right_head_tail_all LED를 %m.led_color 으로 정하기", "zeroneSetLedTo", "앞쪽", "빨간색"],
			[" ", "%m.left_right_head_tail_all LED를 R: %n G: %n B: %n 만큼 바꾸기", "zeroneChangeLedByRGB", "앞쪽", 10, 0, 0],
			[" ", "%m.left_right_head_tail_all LED를 R: %n G: %n B: %n (으)로 정하기", "zeroneSetLedToRGB", "앞쪽", 255, 0, 0],
			[" ", "%m.left_right_head_tail_all LED 끄기", "zeroneClearLed", "앞쪽"],
			["-"],
			[" ", "%m.sound_effect 소리 %n 번 재생하기", "zeronePlaySoundTimes", "삐", 1],
			["w", "%m.sound_effect 소리 %n 번 재생하고 기다리기", "zeronePlaySoundTimesUntilDone", "삐", 1],
			[" ", "버저 음을 %n 만큼 바꾸기", "zeroneChangeBuzzerBy", 10],
			[" ", "버저 음을 %n (으)로 정하기", "zeroneSetBuzzerTo", 1000],
			[" ", "소리 끄기", "zeroneClearSound"],
			[" ", "%m.note %m.octave 음을 연주하기", "zeronePlayNote", "도", "4"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "zeronePlayNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "zeroneRestFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "zeroneChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "zeroneSetTempoTo", 60],
			["-"],
			[" ", "%m.zerone_sensor_mode 센서 시작하기", "zeroneStartSensor", "제스처"],
			["r", "왼쪽 근접 센서", "zeroneLeftProximity"],
			["r", "오른쪽 근접 센서", "zeroneRightProximity"],
			["r", "앞쪽 근접 센서", "zeroneFrontProximity"],
			["r", "뒤쪽 근접 센서", "zeroneRearProximity"],
			["r", "제스처", "zeroneGesture"],
			["r", "색깔 번호", "zeroneColorNumber"],
			["r", "색깔 R", "zeroneColorRed"],
			["r", "색깔 G", "zeroneColorGreen"],
			["r", "색깔 B", "zeroneColorBlue"],
			["r", "신호 세기", "zeroneSignalStrength"],
			["b", "제스처가 %m.gesture 인가?", "zeroneIsGesture", "앞으로"],
			["b", "%m.zerone_color 에 닿았는가?", "zeroneTouchingColor", "빨간색"],
			["b", "배터리 %m.battery ?", "zeroneBattery", "정상"]
		],
		ja1: [
			["w", "前へ動かす", "zeroneMoveForward"],
			["w", "後ろへ動かす", "zeroneMoveBackward"],
			["w", "%m.left_right に回す", "zeroneTurn", "左"],
			["-"],
			[" ", "%m.left_right_head_tail_all LEDを %m.led_color にする", "zeroneSetLedTo", "前", "赤色"],
			[" ", "%m.left_right_head_tail_all LEDをオフ", "zeroneClearLed", "前"],
			["-"],
			[" ", "%m.sound_effect 音を鳴らす", "zeronePlaySound", "ビープ"],
			[" ", "音を止める", "zeroneClearSound"],
			["-"],
			[" ", "%m.zerone_sensor_mode センサーを開始する", "zeroneStartSensor", "ジェスチャー"],
			["b", "ジェスチャーが %m.gesture ですか?", "zeroneIsGesture", "前へ"],
			["b", "%m.zerone_color に触れたか?", "zeroneTouchingColor", "赤色"]
		],
		ja2: [
			["w", "前へ %n %m.cm_sec 動かす", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "後ろへ %n %m.cm_sec 動かす", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "所定位置で %m.left_right に %n %m.deg_sec 回す", "zeroneTurnUnitInPlace", "左", 90, "度"],
			["-"],
			[" ", "%m.left_right_head_tail_all LEDを %m.led_color にする", "zeroneSetLedTo", "前", "赤色"],
			[" ", "%m.left_right_head_tail_all LEDをオフ", "zeroneClearLed", "前"],
			["-"],
			[" ", "%m.sound_effect 音を %n 回鳴らす", "zeronePlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.sound_effect 音を %n 回鳴らす", "zeronePlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "音を止める", "zeroneClearSound"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "zeronePlayNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "zeroneRestFor", 0.25],
			[" ", "テンポを %n ずつ変える", "zeroneChangeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "zeroneSetTempoTo", 60],
			["-"],
			[" ", "%m.zerone_sensor_mode センサーを開始する", "zeroneStartSensor", "ジェスチャー"],
			["b", "ジェスチャーが %m.gesture ですか?", "zeroneIsGesture", "前へ"],
			["b", "%m.zerone_color に触れたか?", "zeroneTouchingColor", "赤色"]
		],
		ja3: [
			["w", "前へ %n %m.move_unit 動かす", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "後ろへ %n %m.move_unit 動かす", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "所定位置で %m.left_right に %n %m.turn_unit 回す", "zeroneTurnUnitInPlace", "左", 90, "度"],
			[" ", "左車輪を %n 右車輪を %n ずつ変える", "zeroneChangeBothWheelsBy", 10, 10],
			[" ", "左車輪を %n 右車輪を %n にする", "zeroneSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both 車輪を %n ずつ変える", "zeroneChangeWheelBy", "左", 10],
			[" ", "%m.left_right_both 車輪を %n にする", "zeroneSetWheelTo", "左", 50],
			[" ", "停止する", "zeroneStop"],
			["-"],
			[" ", "%m.left_right_head_tail_all LEDを %m.led_color にする", "zeroneSetLedTo", "前", "赤色"],
			[" ", "%m.left_right_head_tail_all LEDをR: %n G: %n B: %n ずつ変える", "zeroneChangeLedByRGB", "前", 10, 0, 0],
			[" ", "%m.left_right_head_tail_all LEDをR: %n G: %n B: %n にする", "zeroneSetLedToRGB", "前", 255, 0, 0],
			[" ", "%m.left_right_head_tail_all LEDをオフ", "zeroneClearLed", "前"],
			["-"],
			[" ", "%m.sound_effect 音を %n 回鳴らす", "zeronePlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.sound_effect 音を %n 回鳴らす", "zeronePlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "ブザー音を %n ずつ変える", "zeroneChangeBuzzerBy", 10],
			[" ", "ブザー音を %n にする", "zeroneSetBuzzerTo", 1000],
			[" ", "音を止める", "zeroneClearSound"],
			[" ", "%m.note %m.octave 音を鳴らす", "zeronePlayNote", "ド", "4"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "zeronePlayNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "zeroneRestFor", 0.25],
			[" ", "テンポを %n ずつ変える", "zeroneChangeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "zeroneSetTempoTo", 60],
			["-"],
			[" ", "%m.zerone_sensor_mode センサーを開始する", "zeroneStartSensor", "ジェスチャー"],
			["r", "左近接センサー", "zeroneLeftProximity"],
			["r", "右近接センサー", "zeroneRightProximity"],
			["r", "前近接センサー", "zeroneFrontProximity"],
			["r", "後近接センサー", "zeroneRearProximity"],
			["r", "ジェスチャー", "zeroneGesture"],
			["r", "色番号", "zeroneColorNumber"],
			["r", "色R", "zeroneColorRed"],
			["r", "色G", "zeroneColorGreen"],
			["r", "色B", "zeroneColorBlue"],
			["r", "信号強度", "zeroneSignalStrength"],
			["b", "ジェスチャーが %m.gesture ですか?", "zeroneIsGesture", "前へ"],
			["b", "%m.zerone_color に触れたか?", "zeroneTouchingColor", "赤色"],
			["b", "電池が %m.battery ?", "zeroneBattery", "正常か"]
		],
		uz1: [
			["w", "oldinga yurish", "zeroneMoveForward"],
			["w", "orqaga yurish", "zeroneMoveBackward"],
			["w", "%m.left_right ga o'girilish", "zeroneTurn", "chap"],
			["-"],
			[" ", "%m.left_right_head_tail_all LEDni %m.led_color ga sozlash", "zeroneSetLedTo", "old", "qizil"],
			[" ", "%m.left_right_head_tail_all LEDni o'chirish", "zeroneClearLed", "old"],
			["-"],
			[" ", "%m.sound_effect tovushni ijro etish", "zeronePlaySound", "qisqa"],
			[" ", "tovushni o'chirish", "zeroneClearSound"],
			["-"],
			[" ", "%m.zerone_sensor_mode sensorini ishga tushiring", "zeroneStartSensor", "jest"],
			["b", "jest %m.gesture ?", "zeroneIsGesture", "oldinga"],
			["b", "%m.zerone_color ga tekkan?", "zeroneTouchingColor", "qizil"]
		],
		uz2: [
			["w", "oldinga %n %m.cm_sec yurish", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "orqaga %n %m.cm_sec yurish", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "%m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "zeroneTurnUnitInPlace", "chap", 90, "daraja"],
			["-"],
			[" ", "%m.left_right_head_tail_all LEDni %m.led_color ga sozlash", "zeroneSetLedTo", "old", "qizil"],
			[" ", "%m.left_right_head_tail_all LEDni o'chirish", "zeroneClearLed", "old"],
			["-"],
			[" ", "%m.sound_effect tovushni %n marta ijro etish", "zeronePlaySoundTimes", "qisqa", 1],
			["w", "%m.sound_effect tovushni %n marta ijro tugaguncha kutish", "zeronePlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "tovushni o'chirish", "zeroneClearSound"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "zeronePlayNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "zeroneRestFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "zeroneChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "zeroneSetTempoTo", 60],
			["-"],
			[" ", "%m.zerone_sensor_mode sensorini ishga tushiring", "zeroneStartSensor", "jest"],
			["b", "jest %m.gesture ?", "zeroneIsGesture", "oldinga"],
			["b", "%m.zerone_color ga tekkan?", "zeroneTouchingColor", "qizil"]
		],
		uz3: [
			["w", "oldinga %n %m.move_unit yurish", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "orqaga %n %m.move_unit yurish", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "%m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "zeroneTurnUnitInPlace", "chap", 90, "daraja"],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "zeroneChangeBothWheelsBy", 10, 10],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "zeroneSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both g'ildirakni %n ga o'zgartirish", "zeroneChangeWheelBy", "chap", 10],
			[" ", "%m.left_right_both g'ildirakni %n ga sozlash", "zeroneSetWheelTo", "chap", 50],
			[" ", "to'xtatish", "zeroneStop"],
			["-"],
			[" ", "%m.left_right_head_tail_all LEDni %m.led_color ga sozlash", "zeroneSetLedTo", "old", "qizil"],
			[" ", "%m.left_right_head_tail_all LEDni r: %n g: %n b: %n ga o'zgartirish", "zeroneChangeLedByRGB", "old", 10, 0, 0],
			[" ", "%m.left_right_head_tail_all LEDni r: %n g: %n b: %n ga sozlash", "zeroneSetLedToRGB", "old", 255, 0, 0],
			[" ", "%m.left_right_head_tail_all LEDni o'chirish", "zeroneClearLed", "old"],
			["-"],
			[" ", "%m.sound_effect tovushni %n marta ijro etish", "zeronePlaySoundTimes", "qisqa", 1],
			["w", "%m.sound_effect tovushni %n marta ijro tugaguncha kutish", "zeronePlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "buzerning ovozini %n ga o'zgartirish", "zeroneChangeBuzzerBy", 10],
			[" ", "buzerning ovozini %n ga sozlash", "zeroneSetBuzzerTo", 1000],
			[" ", "tovushni o'chirish", "zeroneClearSound"],
			[" ", "%m.note %m.octave notani ijro etish", "zeronePlayNote", "do", "4"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "zeronePlayNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "zeroneRestFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "zeroneChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "zeroneSetTempoTo", 60],
			["-"],
			[" ", "%m.zerone_sensor_mode sensorini ishga tushiring", "zeroneStartSensor", "jest"],
			["r", "chap yaqinlik", "zeroneLeftProximity"],
			["r", "o'ng yaqinlik", "zeroneRightProximity"],
			["r", "old yaqinlik", "zeroneFrontProximity"],
			["r", "orqa yaqinlik", "zeroneRearProximity"],
			["r", "jest", "zeroneGesture"],
			["r", "rang raqami", "zeroneColorNumber"],
			["r", "rang r", "zeroneColorRed"],
			["r", "rang g", "zeroneColorGreen"],
			["r", "rang b", "zeroneColorBlue"],
			["r", "signal kuchi", "zeroneSignalStrength"],
			["b", "jest %m.gesture ?", "zeroneIsGesture", "oldinga"],
			["b", "%m.zerone_color ga tekkan?", "zeroneTouchingColor", "qizil"],
			["b", "batareya %m.battery ?", "zeroneBattery", "normal"]
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
			"left_right_head_tail_all": ["left head", "right head", "left tail", "right tail", "left", "right", "head", "tail", "all"],
			"zerone_color": ["red", "yellow", "green", "sky blue", "blue", "purple"],
			"led_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "violet", "purple", "white"],
			"sound_effect": ["beep", "random beep", "noise", "siren", "engine", "chop", "robot", "dibidibidip", "good job", "happy", "angry", "sad", "sleep", "march", "birthday"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"zerone_sensor_mode": ["gesture", "color"],
			"gesture": ["forward", "backward", "leftward", "rightward", "near", "far", "long block"],
			"battery": ["normal", "low", "empty"]
		},
		ko: {
			"move_unit": ["cm", "초", "펄스"],
			"turn_unit": ["도", "초", "펄스"],
			"cm_sec": ["cm", "초"],
			"deg_sec": ["도", "초"],
			"left_right": ["왼쪽", "오른쪽"],
			"left_right_both": ["왼쪽", "오른쪽", "양쪽"],
			"left_right_head_tail_all": ["왼쪽 앞", "오른쪽 앞", "왼쪽 뒤", "오른쪽 뒤", "왼쪽", "오른쪽", "앞쪽", "뒤쪽", "모든"],
			"zerone_color": ["빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색"],
			"led_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"sound_effect": ["삐", "무작위 삐", "지지직", "사이렌", "엔진", "쩝", "로봇", "디비디비딥", "잘 했어요", "행복", "화남", "슬픔", "졸림", "행진", "생일"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"zerone_sensor_mode": ["제스처", "색깔"],
			"gesture": ["앞으로", "뒤로", "왼쪽으로", "오른쪽으로", "가까이", "멀리", "오래 가림"],
			"battery": ["정상", "부족", "없음"]
		},
		ja: {
			"move_unit": ["cm", "秒", "パルス"],
			"turn_unit": ["度", "秒", "パルス"],
			"cm_sec": ["cm", "秒"],
			"deg_sec": ["度", "秒"],
			"left_right": ["左", "右"],
			"left_right_both": ["左", "右", "両"],
			"left_right_head_tail_all": ["左前", "右前", "左後", "右後", "左", "右", "前", "後", "すべて"],
			"zerone_color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色"],
			"led_color": ["赤色", "橙色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"sound_effect": ["ビープ", "ランダムビープ", "ノイズ", "サイレン", "エンジン", "チョップ", "ロボット", "ディバディバディップ", "よくやった", "幸福", "怒った", "悲しみ", "睡眠", "行進", "誕生"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"zerone_sensor_mode": ["ジェスチャー", "色"],
			"gesture": ["前へ", "後ろへ", "左へ", "右へ", "近く", "遠く", "長く遮蔽"],
			"battery": ["正常か", "足りないか", "ないか"]
		},
		uz: {
			"move_unit": ["cm", "soniya", "puls"],
			"turn_unit": ["daraja", "soniya", "puls"],
			"cm_sec": ["cm", "soniya"],
			"deg_sec": ["daraja", "soniya"],
			"left_right": ["chap", "o'ng"],
			"left_right_both": ["chap", "o'ng", "har ikki"],
			"left_right_head_tail_all": ["chap old", "o'ng old", "chap orqa", "o'ng orqa", "chap", "o'ng", "old", "orqa", "barcha"],
			"zerone_color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh"],
			"led_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "binafsha", "siyoh", "oq"],
			"sound_effect": ["qisqa", "tasodifiy qisqa", "shovqin", "sirena", "motor", "chop", "robot", "dibidibidip", "juda yaxshi", "baxtli", "badjahl", "xafa", "uyqu", "marsh", "tug'ilgan kun"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"zerone_sensor_mode": ["jest", "rang"],
			"gesture": ["oldinga", "orqaga", "chapga", "o'ngga", "yaqin", "uzoq", "uzoq to'smoq"],
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
		tmp = MENUS[i]['button_state'];
		BUTTON_STATES[tmp[0]] = CLICKED;
		BUTTON_STATES[tmp[1]] = DOUBLE_CLICKED;
		BUTTON_STATES[tmp[2]] = LONG_PRESSED;
		tmp = MENUS[i]['when_button_state'];
		BUTTON_STATES[tmp[0]] = CLICKED;
		BUTTON_STATES[tmp[1]] = DOUBLE_CLICKED;
		BUTTON_STATES[tmp[2]] = LONG_PRESSED;
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
							if(received.module == TURTLE) {
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
										var robot = getRobot(TURTLE, 0);
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
	
	ext.turtleMoveForward = function(callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.moveForward(callback);
	};
	
	ext.turtleMoveBackward = function(callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.turtleTurn = function(direction, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.turn(direction, callback);
	};

	ext.turtleMoveForwardUnit = function(value, unit, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.moveForwardUnit(value, unit, callback);
	};

	ext.turtleMoveBackwardUnit = function(value, unit, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.moveBackwardUnit(value, unit, callback);
	};

	ext.turtleTurnUnitInPlace = function(direction, value, unit, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.turnUnit(direction, value, unit, callback);
	};
	
	ext.turtlePivotAroundWheelUnitInDirection = function(wheel, value, unit, head, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.pivotUnit(wheel, value, unit, head, callback);
	};
	
	ext.turtleTurnUnitWithRadiusInDirection = function(direction, value, unit, radius, head, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.swingUnit(direction, value, unit, radius, head, callback);
	};
	
	ext.turtleChangeWheelsByLeftRight = function(left, right) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.changeWheels(left, right);
	};

	ext.turtleSetWheelsToLeftRight = function(left, right) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.setWheels(left, right);
	};

	ext.turtleChangeWheelBy = function(wheel, speed) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.changeWheel(wheel, speed);
	};

	ext.turtleSetWheelTo = function(wheel, speed) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.setWheel(wheel, speed);
	};

	ext.turtleFollowLine = function(color) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.followLine(color);
	};

	ext.turtleFollowLineUntil = function(color, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.followLineUntil(color, callback);
	};
	
	ext.turtleFollowLineUntilBlack = function(color, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.followLineUntilBlack(color, callback);
	};
	
	ext.turtleCrossIntersection = function(callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.crossIntersection(callback);
	};
	
	ext.turtleTurnAtIntersection = function(direction, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.turnAtIntersection(direction, callback);
	};

	ext.turtleSetFollowingSpeedTo = function(speed) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.setLineTracerSpeed(speed);
	};

	ext.turtleStop = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.stop();
	};

	ext.turtleSetHeadLedTo = function(color) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.setHeadColor(color);
	};
	
	ext.turtleChangeHeadLedByRGB = function(red, green, blue) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.changeHeadRgb(red, green, blue);
	};
	
	ext.turtleSetHeadLedToRGB = function(red, green, blue) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.setHeadRgb(red, green, blue);
	};

	ext.turtleClearHeadLed = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.clearHead();
	};

	ext.turtlePlaySound = function(sound) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.playSound(sound, 1);
	};
	
	ext.turtlePlaySoundTimes = function(sound, count) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.playSound(sound, count);
	};
	
	ext.turtlePlaySoundTimesUntilDone = function(sound, count, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.playSoundUntil(sound, count, callback);
	};

	ext.turtleChangeBuzzerBy = function(hz) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.changeBuzzer(hz);
	};

	ext.turtleSetBuzzerTo = function(hz) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.setBuzzer(hz);
	};

	ext.turtleClearSound = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.clearSound();
	};
	
	ext.turtlePlayNote = function(note, octave) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.turtlePlayNoteForBeats = function(note, octave, beat, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};

	ext.turtleRestForBeats = function(beat, callback) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.restBeat(beat, callback);
	};

	ext.turtleChangeTempoBy = function(bpm) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.changeTempo(bpm);
	};

	ext.turtleSetTempoTo = function(bpm) {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.setTempo(bpm);
	};

	ext.turtleWhenColorTouched = function(color) {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.checkTouchingColor(color);
		return false;
	};
	
	ext.turtleWhenColorPattern = function(color1, color2) {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.checkColorPattern(color1, color2);
		return false;
	};
	
	ext.turtleWhenButtonState = function(state) {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.checkButtonEvent(state);
		return false;
	};
	
	ext.turtleWhenTilt = function(tilt) {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.turtleTouchingColor = function(color) {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.checkTouchingColor(color);
		return false;
	};
	
	ext.turtleIsColorPattern = function(color1, color2) {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.checkColorPattern(color1, color2);
		return false;
	};
	
	ext.turtleButtonState = function(state) {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.checkButtonEvent(state);
		return false;
	};
	
	ext.turtleTilt = function(tilt) {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.turtleBattery = function(state) {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.checkBattery(state);
		return false;
	};

	ext.turtleColorNumber = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) robot.getColorNumber();
		return -1;
	};

	ext.turtleColorPattern = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.getColorPattern();
		return -1;
	};

	ext.turtleFloor = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.getFloor();
		return 0;
	};

	ext.turtleButton = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.getButton();
		return 0;
	};

	ext.turtleAccelerationX = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.getAccelerationX();
		return 0;
	};

	ext.turtleAccelerationY = function() {
		var robot = getRobot(TURTLE, 0);
		if(robot) return robot.getAccelerationY();
		return 0;
	};

	ext.turtleAccelerationZ = function() {
		var robot = getRobot(TURTLE, 0);
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
