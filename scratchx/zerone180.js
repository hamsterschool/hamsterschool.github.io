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
			["h", "when gesture is %m.gesture", "zeroneWhenGesture", "forward"],
			["h", "when %m.zerone_color touched", "zeroneWhenColorTouched", "red"],
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
			["h", "when gesture is %m.gesture", "zeroneWhenGesture", "forward"],
			["h", "when %m.zerone_color touched", "zeroneWhenColorTouched", "red"],
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
			["h", "when gesture is %m.gesture", "zeroneWhenGesture", "forward"],
			["h", "when %m.zerone_color touched", "zeroneWhenColorTouched", "red"],
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
			["h", "제스처가 %m.gesture 일 때", "zeroneWhenGesture", "앞으로"],
			["h", "%m.zerone_color 에 닿았을 때", "zeroneWhenColorTouched", "빨간색"],
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
			["h", "제스처가 %m.gesture 일 때", "zeroneWhenGesture", "앞으로"],
			["h", "%m.zerone_color 에 닿았을 때", "zeroneWhenColorTouched", "빨간색"],
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
			["h", "제스처가 %m.gesture 일 때", "zeroneWhenGesture", "앞으로"],
			["h", "%m.zerone_color 에 닿았을 때", "zeroneWhenColorTouched", "빨간색"],
			["b", "제스처가 %m.gesture 인가?", "zeroneIsGesture", "앞으로"],
			["b", "%m.zerone_color 에 닿았는가?", "zeroneTouchingColor", "빨간색"],
			["b", "배터리 %m.battery ?", "zeroneBattery", "정상"]
		],
		ja1: [
			["w", "前へ移動する", "zeroneMoveForward"],
			["w", "後ろへ移動する", "zeroneMoveBackward"],
			["w", "%m.left_right へ回す", "zeroneTurn", "左"],
			["-"],
			[" ", "%m.left_right_head_tail_all LEDを %m.led_color にする", "zeroneSetLedTo", "前", "赤色"],
			[" ", "%m.left_right_head_tail_all LEDを消す", "zeroneClearLed", "前"],
			["-"],
			[" ", "%m.sound_effect 音を鳴らす", "zeronePlaySound", "ビープ"],
			[" ", "音を消す", "zeroneClearSound"],
			["-"],
			[" ", "%m.zerone_sensor_mode センサーを開始する", "zeroneStartSensor", "ジェスチャー"],
			["h", "ジェスチャーが %m.gesture であるとき", "zeroneWhenGesture", "前へ"],
			["h", "%m.zerone_color に触れたとき", "zeroneWhenColorTouched", "赤色"],
			["b", "ジェスチャーが %m.gesture ですか?", "zeroneIsGesture", "前へ"],
			["b", "%m.zerone_color に触れたか?", "zeroneTouchingColor", "赤色"]
		],
		ja2: [
			["w", "前へ %n %m.cm_sec 移動する", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "後ろへ %n %m.cm_sec 移動する", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "%m.left_right へ %n %m.deg_sec 回す", "zeroneTurnUnitInPlace", "左", 90, "度"],
			["-"],
			[" ", "%m.left_right_head_tail_all LEDを %m.led_color にする", "zeroneSetLedTo", "前", "赤色"],
			[" ", "%m.left_right_head_tail_all LEDを消す", "zeroneClearLed", "前"],
			["-"],
			[" ", "%m.sound_effect 音を %n 回鳴らす", "zeronePlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.sound_effect 音を %n 回鳴らす", "zeronePlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "音を消す", "zeroneClearSound"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "zeronePlayNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "zeroneRestFor", 0.25],
			[" ", "テンポを %n ずつ変える", "zeroneChangeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "zeroneSetTempoTo", 60],
			["-"],
			[" ", "%m.zerone_sensor_mode センサーを開始する", "zeroneStartSensor", "ジェスチャー"],
			["h", "ジェスチャーが %m.gesture であるとき", "zeroneWhenGesture", "前へ"],
			["h", "%m.zerone_color に触れたとき", "zeroneWhenColorTouched", "赤色"],
			["b", "ジェスチャーが %m.gesture ですか?", "zeroneIsGesture", "前へ"],
			["b", "%m.zerone_color に触れたか?", "zeroneTouchingColor", "赤色"]
		],
		ja3: [
			["w", "前へ %n %m.move_unit 移動する", "zeroneMoveForwardUnit", 6.5, "cm"],
			["w", "後ろへ %n %m.move_unit 移動する", "zeroneMoveBackwardUnit", 6.5, "cm"],
			["w", "%m.left_right へ %n %m.turn_unit 回す", "zeroneTurnUnitInPlace", "左", 90, "度"],
			[" ", "左車輪を %n 右車輪を %n ずつ変える", "zeroneChangeBothWheelsBy", 10, 10],
			[" ", "左車輪を %n 右車輪を %n にする", "zeroneSetBothWheelsTo", 50, 50],
			[" ", "%m.left_right_both 車輪を %n ずつ変える", "zeroneChangeWheelBy", "左", 10],
			[" ", "%m.left_right_both 車輪を %n にする", "zeroneSetWheelTo", "左", 50],
			[" ", "停止する", "zeroneStop"],
			["-"],
			[" ", "%m.left_right_head_tail_all LEDを %m.led_color にする", "zeroneSetLedTo", "前", "赤色"],
			[" ", "%m.left_right_head_tail_all LEDをR: %n G: %n B: %n ずつ変える", "zeroneChangeLedByRGB", "前", 10, 0, 0],
			[" ", "%m.left_right_head_tail_all LEDをR: %n G: %n B: %n にする", "zeroneSetLedToRGB", "前", 255, 0, 0],
			[" ", "%m.left_right_head_tail_all LEDを消す", "zeroneClearLed", "前"],
			["-"],
			[" ", "%m.sound_effect 音を %n 回鳴らす", "zeronePlaySoundTimes", "ビープ", 1],
			["w", "終わるまで %m.sound_effect 音を %n 回鳴らす", "zeronePlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "ブザー音を %n ずつ変える", "zeroneChangeBuzzerBy", 10],
			[" ", "ブザー音を %n にする", "zeroneSetBuzzerTo", 1000],
			[" ", "音を消す", "zeroneClearSound"],
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
			["h", "ジェスチャーが %m.gesture であるとき", "zeroneWhenGesture", "前へ"],
			["h", "%m.zerone_color に触れたとき", "zeroneWhenColorTouched", "赤色"],
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
			["h", "jest %m.gesture bo'lganida", "zeroneWhenGesture", "oldinga"],
			["h", "%m.zerone_color ga tegilganda", "zeroneWhenColorTouched", "qizil"],
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
			["h", "jest %m.gesture bo'lganida", "zeroneWhenGesture", "oldinga"],
			["h", "%m.zerone_color ga tegilganda", "zeroneWhenColorTouched", "qizil"],
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
			["h", "jest %m.gesture bo'lganida", "zeroneWhenGesture", "oldinga"],
			["h", "%m.zerone_color ga tegilganda", "zeroneWhenColorTouched", "qizil"],
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
			"gesture": ["forward", "backward", "leftward", "rightward", "near", "far", "click", "long touch"],
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
			"gesture": ["앞으로", "뒤로", "왼쪽으로", "오른쪽으로", "가까이", "멀리", "클릭", "오래 터치"],
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
			"gesture": ["前へ", "後ろへ", "左へ", "右へ", "近く", "遠く", "クリック", "長くタッチ"],
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
			"gesture": ["oldinga", "orqaga", "chapga", "o'ngga", "yaqin", "uzoq", "bosgan", "uzoq bosganmi"],
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
	var UNITS = {};
	var MODES = {};
	var RGB_COLORS = {};
	var COLOR_NUMBERS = {};
	var GESTURES = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var SOUNDS = {};
	var BATTERY_STATES = {};
	
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const LEFT_HEAD = 4;
	const RIGHT_HEAD = 5;
	const LEFT_TAIL = 6;
	const RIGHT_TAIL = 7;
	const HEAD = 8;
	const TAIL = 9;
	const ALL = 10;

	const CM = 1;
	const SECONDS = 2;
	const PULSES = 3;
	const DEGREES = 1;

	const GESTURE = 1;
	const COLOR = 2;
	
	const GESTURE_FORWARD = 0;
	const GESTURE_BACKWARD = 1;
	const GESTURE_LEFTWARD = 2;
	const GESTURE_RIGHTWARD = 3;
	const GESTURE_NEAR = 4;
	const GESTURE_FAR = 5;
	const GESTURE_CLICK = 6;
	const GESTURE_LONG_TOUCH = 7;
	
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['left_right_both'];
		PARTS[tmp[0]] = LEFT;
		PARTS[tmp[1]] = RIGHT;
		PARTS[tmp[2]] = BOTH;
		tmp = MENUS[i]['left_right_head_tail_all'];
		PARTS[tmp[0]] = LEFT_HEAD;
		PARTS[tmp[1]] = RIGHT_HEAD;
		PARTS[tmp[2]] = LEFT_TAIL;
		PARTS[tmp[3]] = RIGHT_TAIL;
		PARTS[tmp[6]] = HEAD;
		PARTS[tmp[7]] = TAIL;
		PARTS[tmp[8]] = ALL;
		tmp = MENUS[i]['left_right'];
		DIRECTIONS[tmp[0]] = LEFT;
		DIRECTIONS[tmp[1]] = RIGHT;
		tmp = MENUS[i]['move_unit'];
		UNITS[tmp[0]] = CM;
		UNITS[tmp[1]] = SECONDS;
		UNITS[tmp[2]] = PULSES;
		tmp = MENUS[i]['turn_unit'];
		UNITS[tmp[0]] = DEGREES;
		tmp = MENUS[i]['zerone_sensor_mode'];
		MODES[tmp[0]] = GESTURE;
		MODES[tmp[1]] = COLOR;
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
		SOUNDS[tmp[0]] = 1; // beep
		SOUNDS[tmp[1]] = 2; // random beep
		SOUNDS[tmp[2]] = 10; // noise
		SOUNDS[tmp[3]] = 3; // siren
		SOUNDS[tmp[4]] = 4; // engine
		SOUNDS[tmp[5]] = 11; // chop
		SOUNDS[tmp[6]] = 5; // robot
		SOUNDS[tmp[7]] = 8; // dibidibidip
		SOUNDS[tmp[8]] = 9; // good job
		SOUNDS[tmp[9]] = 12; // happy
		SOUNDS[tmp[10]] = 13; // angry
		SOUNDS[tmp[11]] = 14; // sad
		SOUNDS[tmp[12]] = 15; // sleep
		SOUNDS[tmp[13]] = 6; // march
		SOUNDS[tmp[14]] = 7; // birthday
		tmp = MENUS[i]['zerone_color'];
		COLOR_NUMBERS[tmp[0]] = 1; // red
		COLOR_NUMBERS[tmp[1]] = 2; // yellow
		COLOR_NUMBERS[tmp[2]] = 3; // green
		COLOR_NUMBERS[tmp[3]] = 4; // sky blue
		COLOR_NUMBERS[tmp[4]] = 5; // blue
		COLOR_NUMBERS[tmp[5]] = 6; // purple
		tmp = MENUS[i]['gesture'];
		GESTURES[tmp[0]] = GESTURE_FORWARD;
		GESTURES[tmp[1]] = GESTURE_BACKWARD;
		GESTURES[tmp[2]] = GESTURE_LEFTWARD;
		GESTURES[tmp[3]] = GESTURE_RIGHTWARD;
		GESTURES[tmp[4]] = GESTURE_NEAR;
		GESTURES[tmp[5]] = GESTURE_FAR;
		GESTURES[tmp[6]] = GESTURE_CLICK;
		GESTURES[tmp[7]] = GESTURE_LONG_TOUCH;
		tmp = MENUS[i]['battery'];
		BATTERY_STATES[tmp[0]] = 2;
		BATTERY_STATES[tmp[1]] = 1;
		BATTERY_STATES[tmp[2]] = 0;
	}
	
	function Zerone(index) {
		this.sensory = {
			map: 0,
			signalStrength: 0,
			leftProximity: 0,
			rightProximity: 0,
			frontProximity: 0,
			rearProximity: 0,
			colorRed: 0,
			colorGreen: 0,
			colorBlue: 0,
			gesture: -1,
			colorNumber: -1,
			pulseCount: 0,
			batteryState: 2
		};
		this.motoring = {
			module: ZERONE,
			index: index,
			map: 0xff000000,
			leftWheel: 0,
			rightWheel: 0,
			leftHeadRed: 0,
			leftHeadGreen: 0,
			leftHeadBlue: 0,
			rightHeadRed: 0,
			rightHeadGreen: 0,
			rightHeadBlue: 0,
			leftTailRed: 0,
			leftTailGreen: 0,
			leftTailBlue: 0,
			rightTailRed: 0,
			rightTailGreen: 0,
			rightTailBlue: 0,
			buzzer: 0,
			pulse: 0,
			note: 0,
			sound: 0,
			motionType: 0,
			motionUnit: 0,
			motionSpeed: 0,
			motionValue: 0,
			motionRadius: 0,
			sensorMode: 0
		};
		this.blockId = 0;
		this.motionCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.gesture = -1;
		this.tempo = 60;
		this.timeouts = [];
	}

	Zerone.prototype.reset = function() {
		var motoring = this.motoring;
		motoring.map = 0xfff80000;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.leftHeadRed = 0;
		motoring.leftHeadGreen = 0;
		motoring.leftHeadBlue = 0;
		motoring.rightHeadRed = 0;
		motoring.rightHeadGreen = 0;
		motoring.rightHeadBlue = 0;
		motoring.leftTailRed = 0;
		motoring.leftTailGreen = 0;
		motoring.leftTailBlue = 0;
		motoring.rightTailRed = 0;
		motoring.rightTailGreen = 0;
		motoring.rightTailBlue = 0;
		motoring.buzzer = 0;
		motoring.pulse = 0;
		motoring.note = 0;
		motoring.sound = 0;
		motoring.motionType = 0;
		motoring.motionUnit = 0;
		motoring.motionSpeed = 0;
		motoring.motionValue = 0;
		motoring.motionRadius = 0;
		motoring.sensorMode = 0;

		this.blockId = 0;
		this.motionCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.gesture = -1;
		this.tempo = 60;

		this.__removeAllTimeouts();
	};

	Zerone.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	Zerone.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};

	Zerone.prototype.clearMotoring = function() {
		this.motoring.map = 0xff000000;
	};

	Zerone.prototype.clearEvent = function() {
		this.gesture = -1;
	};

	Zerone.prototype.__setPulse = function(pulse) {
		this.motoring.pulse = pulse;
		this.motoring.map |= 0x00800000;
	};

	Zerone.prototype.__setMotion = function(type, unit, speed, value, radius) {
		var motoring = this.motoring;
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map |= 0x00100000;
	};

	Zerone.prototype.__cancelMotion = function() {
		this.motionCallback = undefined;
	};

	Zerone.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x00400000;
	};

	Zerone.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	Zerone.prototype.__cancelNote = function() {
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

	Zerone.prototype.__setSound = function(sound) {
		this.motoring.sound = sound;
		this.motoring.map |= 0x00200000;
	};

	Zerone.prototype.__runSound = function(sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			this.currentSound = sound;
			this.soundRepeat = count;
			this.__setSound(sound);
		}
	};

	Zerone.prototype.__cancelSound = function() {
		this.soundCallback = undefined;
	};
	
	Zerone.prototype.__setSensorMode = function(mode) {
		this.motoring.sensorMode = mode;
		this.motoring.map |= 0x00080000;
	};

	Zerone.prototype.handleSensory = function() {
		var self = this;
		var sensory = self.sensory;
		if(sensory.map & 0x00001000) self.gesture = sensory.gesture;

		if(self.motionCallback && (sensory.map & 0x00000200) != 0) {
			self.motoring.leftWheel = 0;
			self.motoring.rightWheel = 0;
			var callback = self.motionCallback;
			self.__cancelMotion();
			if(callback) callback();
		}
		if((sensory.map & 0x00000100) != 0) {
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

	Zerone.prototype.__motion = function(type, callback) {
		var motoring = this.motoring;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(type, 1, 0, 0, 0); // type, unit, speed, value, radius
		this.motionCallback = callback;
	};

	Zerone.prototype.__motionUnit = function(type, unit, value, callback) {
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

	Zerone.prototype.moveForward = function(callback) {
		this.__motion(101, callback);
	};

	Zerone.prototype.moveBackward = function(callback) {
		this.__motion(102, callback);
	};

	Zerone.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(103, callback);
		} else {
			this.__motion(104, callback);
		}
	};

	Zerone.prototype.moveForwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(2, UNITS[unit], -value, callback);
		else this.__motionUnit(1, UNITS[unit], value, callback);
	};

	Zerone.prototype.moveBackwardUnit = function(value, unit, callback) {
		if(value < 0) this.__motionUnit(1, UNITS[unit], -value, callback);
		else this.__motionUnit(2, UNITS[unit], value, callback);
	};

	Zerone.prototype.turnUnit = function(direction, value, unit, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			if(value < 0) this.__motionUnit(4, UNITS[unit], -value, callback);
			else this.__motionUnit(3, UNITS[unit], value, callback);
		} else {
			if(value < 0) this.__motionUnit(3, UNITS[unit], -value, callback);
			else this.__motionUnit(4, UNITS[unit], value, callback);
		}
	};

	Zerone.prototype.setWheels = function(leftVelocity, rightVelocity) {
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

	Zerone.prototype.changeWheels = function(leftVelocity, rightVelocity) {
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

	Zerone.prototype.setWheel = function(wheel, velocity) {
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

	Zerone.prototype.changeWheel = function(wheel, velocity) {
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

	Zerone.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelMotion();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
	};

	Zerone.prototype.setLed = function(led, color) {
		var rgb = RGB_COLORS[color];
		if(rgb) {
			this.setRgb(led, rgb[0], rgb[1], rgb[2]);
		}
	};

	Zerone.prototype.setHeadRgbArray = function(led, rgb) {
		if(rgb) {
			this.setRgb(led, rgb[0], rgb[1], rgb[2]);
		}
	};

	Zerone.prototype.setRgb = function(led, red, green, blue) {
		var motoring = this.motoring;
		led = PARTS[led];
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		if(led == LEFT_HEAD || led == LEFT || led == HEAD || led == ALL) {
			if(typeof red == 'number') {
				motoring.leftHeadRed = red;
			}
			if(typeof green == 'number') {
				motoring.leftHeadGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.leftHeadBlue = blue;
			}
		}
		if(led == RIGHT_HEAD || led == RIGHT || led == HEAD || led == ALL) {
			if(typeof red == 'number') {
				motoring.rightHeadRed = red;
			}
			if(typeof green == 'number') {
				motoring.rightHeadGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.rightHeadBlue = blue;
			}
		}
		if(led == LEFT_TAIL || led == LEFT || led == TAIL || led == ALL) {
			if(typeof red == 'number') {
				motoring.leftTailRed = red;
			}
			if(typeof green == 'number') {
				motoring.leftTailGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.leftTailBlue = blue;
			}
		}
		if(led == RIGHT_TAIL || led == RIGHT || led == TAIL || led == ALL) {
			if(typeof red == 'number') {
				motoring.rightTailRed = red;
			}
			if(typeof green == 'number') {
				motoring.rightTailGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.rightTailBlue = blue;
			}
		}
	};

	Zerone.prototype.changeRgb = function(led, red, green, blue) {
		var motoring = this.motoring;
		led = PARTS[led];
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		if(led == LEFT_HEAD || led == LEFT || led == HEAD || led == ALL) {
			if(typeof red == 'number') {
				motoring.leftHeadRed += red;
			}
			if(typeof green == 'number') {
				motoring.leftHeadGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.leftHeadBlue += blue;
			}
		}
		if(led == RIGHT_HEAD || led == RIGHT || led == HEAD || led == ALL) {
			if(typeof red == 'number') {
				motoring.rightHeadRed += red;
			}
			if(typeof green == 'number') {
				motoring.rightHeadGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.rightHeadBlue += blue;
			}
		}
		if(led == LEFT_TAIL || led == LEFT || led == TAIL || led == ALL) {
			if(typeof red == 'number') {
				motoring.leftTailRed += red;
			}
			if(typeof green == 'number') {
				motoring.leftTailGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.leftTailBlue += blue;
			}
		}
		if(led == RIGHT_TAIL || led == RIGHT || led == TAIL || led == ALL) {
			if(typeof red == 'number') {
				motoring.rightTailRed += red;
			}
			if(typeof green == 'number') {
				motoring.rightTailGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.rightTailBlue += blue;
			}
		}
	};

	Zerone.prototype.clearLed = function(led) {
		this.setRgb(led, 0, 0, 0);
	};

	Zerone.prototype.playSound = function(sound, count) {
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

	Zerone.prototype.playSoundUntil = function(sound, count, callback) {
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

	Zerone.prototype.setBuzzer = function(hz) {
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

	Zerone.prototype.changeBuzzer = function(hz) {
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

	Zerone.prototype.clearSound = function() {
		this.__cancelNote();
		this.__cancelSound();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		this.__runSound(0);
	};

	Zerone.prototype.playNote = function(note, octave) {
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

	Zerone.prototype.playNoteBeat = function(note, octave, beat, callback) {
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

	Zerone.prototype.restBeat = function(beat, callback) {
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

	Zerone.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	Zerone.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};
	
	Zerone.prototype.startSensor = function(mode) {
		mode = MODES[mode];
		if(mode == GESTURE) this.__setSensorMode(0);
		else if(mode == COLOR) this.__setSensorMode(1);
	};
	
	Zerone.prototype.checkGesture = function(gesture) {
		return this.gesture == GESTURES[gesture];
	};

	Zerone.prototype.checkTouchingColor = function(color) {
		color = COLOR_NUMBERS[color];
		if(typeof color == 'number') {
			return this.sensory.colorNumber == color;
		}
		return false;
	};

	Zerone.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};
	
	Zerone.prototype.getSignalStrength = function() {
		return this.sensory.signalStrength;
	};
	
	Zerone.prototype.getLeftProximity = function() {
		return this.sensory.leftProximity;
	};
	
	Zerone.prototype.getRightProximity = function() {
		return this.sensory.rightProximity;
	};
	
	Zerone.prototype.getFrontProximity = function() {
		return this.sensory.frontProximity;
	};
	
	Zerone.prototype.getRearProximity = function() {
		return this.sensory.rearProximity;
	};
	
	Zerone.prototype.getColorRed = function() {
		return this.sensory.colorRed;
	};
	
	Zerone.prototype.getColorGreen = function() {
		return this.sensory.colorGreen;
	};
	
	Zerone.prototype.getColorBlue = function() {
		return this.sensory.colorBlue;
	};
	
	Zerone.prototype.getGesture = function() {
		return this.gesture;
	};
	
	Zerone.prototype.getColorNumber = function() {
		return this.sensory.colorNumber;
	};

	function getOrCreateRobot(group, module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			switch(module) {
				case ZERONE: robot = new Zerone(index); break;
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
							if(received.module == ZERONE) {
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
										var robot = getRobot(ZERONE, 0);
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
	
	ext.zeroneMoveForward = function(callback) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.moveForward(callback);
	};
	
	ext.zeroneMoveBackward = function(callback) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.zeroneTurn = function(direction, callback) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.turn(direction, callback);
	};

	ext.zeroneMoveForwardUnit = function(value, unit, callback) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.moveForwardUnit(value, unit, callback);
	};

	ext.zeroneMoveBackwardUnit = function(value, unit, callback) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.moveBackwardUnit(value, unit, callback);
	};

	ext.zeroneTurnUnitInPlace = function(direction, value, unit, callback) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.turnUnit(direction, value, unit, callback);
	};
	
	ext.zeroneChangeBothWheelsBy = function(left, right) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.changeWheels(left, right);
	};

	ext.zeroneSetBothWheelsTo = function(left, right) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.setWheels(left, right);
	};

	ext.zeroneChangeWheelBy = function(wheel, value) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.changeWheel(wheel, value);
	};

	ext.zeroneSetWheelTo = function(wheel, value) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.setWheel(wheel, value);
	};

	ext.zeroneStop = function() {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.stop();
	};

	ext.zeroneSetLedTo = function(led, color) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.setLed(led, color);
	};
	
	ext.zeroneChangeLedByRGB = function(led, red, green, blue) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.changeRgb(led, red, green, blue);
	};
	
	ext.zeroneSetLedToRGB = function(led, red, green, blue) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.setRgb(led, red, green, blue);
	};

	ext.zeroneClearLed = function(led) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.clearLed(led);
	};

	ext.zeronePlaySound = function(sound) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.playSound(sound, 1);
	};
	
	ext.zeronePlaySoundTimes = function(sound, count) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.playSound(sound, count);
	};
	
	ext.zeronePlaySoundTimesUntilDone = function(sound, count, callback) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.playSoundUntil(sound, count, callback);
	};

	ext.zeroneChangeBuzzerBy = function(hz) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.changeBuzzer(hz);
	};

	ext.zeroneSetBuzzerTo = function(hz) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.setBuzzer(hz);
	};

	ext.zeroneClearSound = function() {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.clearSound();
	};
	
	ext.zeronePlayNote = function(note, octave) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.zeronePlayNoteFor = function(note, octave, beat, callback) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};

	ext.zeroneRestFor = function(beat, callback) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.restBeat(beat, callback);
	};

	ext.zeroneChangeTempoBy = function(bpm) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.changeTempo(bpm);
	};

	ext.zeroneSetTempoTo = function(bpm) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.setTempo(bpm);
	};
	
	ext.zeroneStartSensor = function(mode) {
		var robot = getRobot(ZERONE, 0);
		if(robot) robot.startSensor(mode);
	};
	
	ext.zeroneLeftProximity = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getLeftProximity() : 0;
	};
	
	ext.zeroneRightProximity = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getRightProximity() : 0;
	};
	
	ext.zeroneFrontProximity = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getFrontProximity() : 0;
	};
	
	ext.zeroneRearProximity = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getRearProximity() : 0;
	};
	
	ext.zeroneColorRed = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getColorRed() : 0;
	};
	
	ext.zeroneColorGreen = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getColorGreen() : 0;
	};
	
	ext.zeroneColorBlue = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getColorBlue() : 0;
	};
	
	ext.zeroneGesture = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getGesture() : -1;
	};
	
	ext.zeroneColorNumber = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getColorNumber() : -1;
	};
	
	ext.zeroneSignalStrength = function() {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.getSignalStrength() : 0;
	};
	
	ext.zeroneWhenGesture = function(gesture) {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.checkGesture(gesture) : false;
	};

	ext.zeroneWhenColorTouched = function(color) {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.checkTouchingColor(color) : false;
	};
	
	ext.zeroneIsGesture = function(gesture) {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.checkGesture(gesture) : false;
	};
	
	ext.zeroneTouchingColor = function(color) {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.checkTouchingColor(color) : false;
	};
	
	ext.zeroneBattery = function(state) {
		var robot = getRobot(ZERONE, 0);
		return robot ? robot.checkBattery(state) : false;
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
