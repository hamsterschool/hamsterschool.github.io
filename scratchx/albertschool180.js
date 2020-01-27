(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const ALBERTSCHOOL = 'albertschool';
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
		en: 'Albert School',
		ko: '알버트 스쿨',
		ja: 'アルバートスクール',
		uz: 'Albert School'
	};
	const BLOCKS = {
		en1: [
			["w", "move forward", "moveForward"],
			["w", "move backward", "moveBackward"],
			["w", "turn %m.left_right", "turn", "left"],
			["-"],
			[" ", "set %m.left_right_both eye to %m.color", "setEyeTo", "left", "red"],
			[" ", "clear %m.left_right_both eye", "clearEye", "left"],
			[" ", "turn body led %m.on_off", "turnBodyLed", "on"],
			[" ", "turn front led %m.on_off", "turnFrontLed", "on"],
			["-"],
			["w", "beep", "beep"],
			["-"],
			["h", "when hand found", "whenHandFound"],
			["b", "hand found?", "handFound"]
		],
		en2: [
			["w", "move forward %n secs", "moveForwardForSecs", 1],
			["w", "move backward %n secs", "moveBackwardForSecs", 1],
			["w", "turn %m.left_right %n secs", "turnForSecs", "left", 1],
			["-"],
			[" ", "set %m.left_right_both eye to %m.color", "setEyeTo", "left", "red"],
			[" ", "clear %m.left_right_both eye", "clearEye", "left"],
			[" ", "turn body led %m.on_off", "turnBodyLed", "on"],
			[" ", "turn front led %m.on_off", "turnFrontLed", "on"],
			["-"],
			["w", "beep", "beep"],
			["w", "play note %m.note %m.octave for %d.beats beats", "playNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "restFor", 0.25],
			[" ", "change tempo by %n", "changeTempoBy", 20],
			[" ", "set tempo to %n bpm", "setTempoTo", 60],
			["-"],
			["h", "when hand found", "whenHandFound"],
			["h", "when %m.when_tilt", "whenTilt", "tilt forward"],
			["b", "hand found?", "handFound"],
			["b", "%m.tilt ?", "tilt", "tilt forward"]
		],
		en3: [
			["w", "move forward %n secs", "moveForwardForSecs", 1],
			["w", "move backward %n secs", "moveBackwardForSecs", 1],
			["w", "turn %m.left_right %n secs", "turnForSecs", "left", 1],
			[" ", "change wheels by left: %n right: %n", "changeBothWheelsBy", 10, 10],
			[" ", "set wheels to left: %n right: %n", "setBothWheelsTo", 30, 30],
			[" ", "change %m.left_right_both wheel by %n", "changeWheelBy", "left", 10],
			[" ", "set %m.left_right_both wheel to %n", "setWheelTo", "left", 30],
			[" ", "stop", "stop"],
			[" ", "set board size to width: %d.board_size height: %d.board_size", "setBoardSizeTo", 108, 76],
			["w", "move to x: %n y: %n on board", "moveToOnBoard", 0, 0],
			["w", "turn towards %n degrees on board", "setOrientationToOnBoard", 0],
			["-"],
			[" ", "set %m.left_right_both eye to %m.color", "setEyeTo", "left", "red"],
			[" ", "clear %m.left_right_both eye", "clearEye", "left"],
			[" ", "turn body led %m.on_off", "turnBodyLed", "on"],
			[" ", "turn front led %m.on_off", "turnFrontLed", "on"],
			["-"],
			["w", "beep", "beep"],
			[" ", "change buzzer by %n", "changeBuzzerBy", 10],
			[" ", "set buzzer to %n", "setBuzzerTo", 1000],
			[" ", "clear buzzer", "clearBuzzer"],
			[" ", "play note %m.note %m.octave", "playNote", "C", "4"],
			["w", "play note %m.note %m.octave for %d.beats beats", "playNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "restFor", 0.25],
			[" ", "change tempo by %n", "changeTempoBy", 20],
			[" ", "set tempo to %n bpm", "setTempoTo", 60],
			["-"],
			["r", "left proximity", "leftProximity"],
			["r", "right proximity", "rightProximity"],
			["r", "x acceleration", "accelerationX"],
			["r", "y acceleration", "accelerationY"],
			["r", "z acceleration", "accelerationZ"],
			["r", "front oid", "frontOid"],
			["r", "rear oid", "backOid"],
			["r", "x position", "positionX"],
			["r", "y position", "positionY"],
			["r", "orientation", "orientation"],
			["r", "light", "light"],
			["r", "temperature", "temperature"],
			["r", "signal strength", "signalStrength"],
			["h", "when hand found", "whenHandFound"],
			["h", "when %m.front_rear oid is %n", "whenOid", "front", 0],
			["h", "when %m.when_tilt", "whenTilt", "tilt forward"],
			["b", "hand found?", "handFound"],
			["b", "%m.front_rear oid %n ?", "isOid", "front", 0],
			["b", "%m.tilt ?", "tilt", "tilt forward"],
			["b", "battery %m.battery ?", "batteryState", "normal"]
		],
		ko1: [
			["w", "앞으로 이동하기", "moveForward"],
			["w", "뒤로 이동하기", "moveBackward"],
			["w", "%m.left_right 으로 돌기", "turn", "왼쪽"],
			["-"],
			[" ", "%m.left_right_both 눈을 %m.color 으로 정하기", "setEyeTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both 눈 끄기", "clearEye", "왼쪽"],
			[" ", "몸통 LED %m.on_off", "turnBodyLed", "켜기"],
			[" ", "앞쪽 LED %m.on_off", "turnFrontLed", "켜기"],
			["-"],
			["w", "삐 소리내기", "beep"],
			["-"],
			["h", "손 찾았을 때", "whenHandFound"],
			["b", "손 찾음?", "handFound"]
		],
		ko2: [
			["w", "앞으로 %n 초 이동하기", "moveForwardForSecs", 1],
			["w", "뒤로 %n 초 이동하기", "moveBackwardForSecs", 1],
			["w", "%m.left_right 으로 %n 초 돌기", "turnForSecs", "왼쪽", 1],
			["-"],
			[" ", "%m.left_right_both 눈을 %m.color 으로 정하기", "setEyeTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both 눈 끄기", "clearEye", "왼쪽"],
			[" ", "몸통 LED %m.on_off", "turnBodyLed", "켜기"],
			[" ", "앞쪽 LED %m.on_off", "turnFrontLed", "켜기"],
			["-"],
			["w", "삐 소리내기", "beep"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "playNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "restFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "changeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "setTempoTo", 60],
			["-"],
			["h", "손 찾았을 때", "whenHandFound"],
			["h", "%m.when_tilt 때", "whenTilt", "앞으로 기울였을"],
			["b", "손 찾음?", "handFound"],
			["b", "%m.tilt ?", "tilt", "앞으로 기울임"]
		],
		ko3: [
			["w", "앞으로 %n 초 이동하기", "moveForwardForSecs", 1],
			["w", "뒤로 %n 초 이동하기", "moveBackwardForSecs", 1],
			["w", "%m.left_right 으로 %n 초 돌기", "turnForSecs", "왼쪽", 1],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "changeBothWheelsBy", 10, 10],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "setBothWheelsTo", 30, 30],
			[" ", "%m.left_right_both 바퀴 %n 만큼 바꾸기", "changeWheelBy", "왼쪽", 10],
			[" ", "%m.left_right_both 바퀴 %n (으)로 정하기", "setWheelTo", "왼쪽", 30],
			[" ", "정지하기", "stop"],
			[" ", "말판 크기를 폭 %d.board_size 높이 %d.board_size (으)로 정하기", "setBoardSizeTo", 108, 76],
			["w", "밑판 x: %n y: %n 위치로 이동하기", "moveToOnBoard", 0, 0],
			["w", "말판 %n 도 방향으로 바라보기", "setOrientationToOnBoard", 0],
			["-"],
			[" ", "%m.left_right_both 눈을 %m.color 으로 정하기", "setEyeTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both 눈 끄기", "clearEye", "왼쪽"],
			[" ", "몸통 LED %m.on_off", "turnBodyLed", "켜기"],
			[" ", "앞쪽 LED %m.on_off", "turnFrontLed", "켜기"],
			["-"],
			["w", "삐 소리내기", "beep"],
			[" ", "버저 음을 %n 만큼 바꾸기", "changeBuzzerBy", 10],
			[" ", "버저 음을 %n (으)로 정하기", "setBuzzerTo", 1000],
			[" ", "버저 끄기", "clearBuzzer"],
			[" ", "%m.note %m.octave 음을 연주하기", "playNote", "도", "4"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "playNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "restFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "changeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "setTempoTo", 60],
			["-"],
			["r", "왼쪽 근접 센서", "leftProximity"],
			["r", "오른쪽 근접 센서", "rightProximity"],
			["r", "x축 가속도", "accelerationX"],
			["r", "y축 가속도", "accelerationY"],
			["r", "z축 가속도", "accelerationZ"],
			["r", "앞쪽 OID", "frontOid"],
			["r", "뒤쪽 OID", "backOid"],
			["r", "x 위치", "positionX"],
			["r", "y 위치", "positionY"],
			["r", "방향", "orientation"],
			["r", "밝기", "light"],
			["r", "온도", "temperature"],
			["r", "신호 세기", "signalStrength"],
			["h", "손 찾았을 때", "whenHandFound"],
			["h", "%m.front_rear OID가 %n 일 때", "whenOid", "앞쪽", 0],
			["h", "%m.when_tilt 때", "whenTilt", "앞으로 기울였을"],
			["b", "손 찾음?", "handFound"],
			["b", "%m.front_rear OID가 %n 인가?", "isOid", "앞쪽", 0],
			["b", "%m.tilt ?", "tilt", "앞으로 기울임"],
			["b", "배터리 %m.battery ?", "batteryState", "정상"]
		],
		ja1: [
			["w", "前へ動かす", "moveForward"],
			["w", "後ろへ動かす", "moveBackward"],
			["w", "%m.left_right に回す", "turn", "左"],
			["-"],
			[" ", "%m.left_right_both 眼を %m.color にする", "setEyeTo", "左", "赤色"],
			[" ", "%m.left_right_both 眼を消す", "clearEye", "左"],
			[" ", "体LEDを %m.on_off", "turnBodyLed", "点灯"],
			[" ", "前LEDを %m.on_off", "turnFrontLed", "点灯"],
			["-"],
			["w", "ビープ", "beep"],
			["-"],
			["h", "手を見つけたとき", "whenHandFound"],
			["b", "手を見つけたか?", "handFound"]
		],
		ja2: [
			["w", "前へ %n 秒動かす", "moveForwardForSecs", 1],
			["w", "後ろへ %n 秒動かす", "moveBackwardForSecs", 1],
			["w", "%m.left_right に %n 秒回す", "turnForSecs", "左", 1],
			["-"],
			[" ", "%m.left_right_both 眼を %m.color にする", "setEyeTo", "左", "赤色"],
			[" ", "%m.left_right_both 眼を消す", "clearEye", "左"],
			[" ", "体LEDを %m.on_off", "turnBodyLed", "点灯"],
			[" ", "前LEDを %m.on_off", "turnFrontLed", "点灯"],
			["-"],
			["w", "ビープ", "beep"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "playNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "restFor", 0.25],
			[" ", "テンポを %n ずつ変える", "changeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "setTempoTo", 60],
			["-"],
			["h", "手を見つけたとき", "whenHandFound"],
			["h", "%m.when_tilt とき", "whenTilt", "前に傾けた"],
			["b", "手を見つけたか?", "handFound"],
			["b", "%m.tilt ?", "tilt", "前に傾けたか"]
		],
		ja3: [
			["w", "前へ %n 秒動かす", "moveForwardForSecs", 1],
			["w", "後ろへ %n 秒動かす", "moveBackwardForSecs", 1],
			["w", "%m.left_right に %n 秒回す", "turnForSecs", "左", 1],
			[" ", "左車輪を %n 右車輪を %n ずつ変える", "changeBothWheelsBy", 10, 10],
			[" ", "左車輪を %n 右車輪を %n にする", "setBothWheelsTo", 30, 30],
			[" ", "%m.left_right_both 車輪を %n ずつ変える", "changeWheelBy", "左", 10],
			[" ", "%m.left_right_both 車輪を %n にする", "setWheelTo", "左", 30],
			[" ", "停止する", "stop"],
			[" ", "ボード板幅を %d.board_size 高さを %d.board_size にする", "setBoardSizeTo", 108, 76],
			["w", "ボード板上でx: %n y: %n 位置に動かす", "moveToOnBoard", 0, 0],
			["w", "ボード板上で %n 度に向ける", "setOrientationToOnBoard", 0],
			["-"],
			[" ", "%m.left_right_both 眼を %m.color にする", "setEyeTo", "左", "赤色"],
			[" ", "%m.left_right_both 眼を消す", "clearEye", "左"],
			[" ", "体LEDを %m.on_off", "turnBodyLed", "点灯"],
			[" ", "前LEDを %m.on_off", "turnFrontLed", "点灯"],
			["-"],
			["w", "ビープ", "beep"],
			[" ", "ブザー音を %n ずつ変える", "changeBuzzerBy", 10],
			[" ", "ブザー音を %n にする", "setBuzzerTo", 1000],
			[" ", "ブザー音を止める", "clearBuzzer"],
			[" ", "%m.note %m.octave 音を鳴らす", "playNote", "ド", "4"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "playNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "restFor", 0.25],
			[" ", "テンポを %n ずつ変える", "changeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "setTempoTo", 60],
			["-"],
			["r", "左近接センサー", "leftProximity"],
			["r", "右近接センサー", "rightProximity"],
			["r", "x軸加速度", "accelerationX"],
			["r", "y軸加速度", "accelerationY"],
			["r", "z軸加速度", "accelerationZ"],
			["r", "前OID", "frontOid"],
			["r", "後OID", "backOid"],
			["r", "x位置", "positionX"],
			["r", "y位置", "positionY"],
			["r", "方向", "orientation"],
			["r", "照度", "light"],
			["r", "温度", "temperature"],
			["r", "信号強度", "signalStrength"],
			["h", "手を見つけたとき", "whenHandFound"],
			["h", "%m.front_rear OIDが %n であるとき", "whenOid", "前", 0],
			["h", "%m.when_tilt とき", "whenTilt", "前に傾けた"],
			["b", "手を見つけたか?", "handFound"],
			["b", "%m.front_rear OIDが %n ですか?", "isOid", "前", 0],
			["b", "%m.tilt ?", "tilt", "前に傾けたか"],
			["b", "電池が %m.battery ?", "batteryState", "正常か"]
		],
		uz1: [
			["w", "oldinga yurish", "moveForward"],
			["w", "orqaga yurish", "moveBackward"],
			["w", "%m.left_right ga o'girilish", "turn", "chap"],
			["-"],
			[" ", "%m.left_right_both ko'zni %m.color ga sozlash", "setEyeTo", "chap", "qizil"],
			[" ", "%m.left_right_both ko'zni o'chirish", "clearEye", "chap"],
			[" ", "tanasi LEDni %m.on_off", "turnBodyLed", "yoqing"],
			[" ", "old LEDni %m.on_off", "turnFrontLed", "yoqing"],
			["-"],
			["w", "ovoz chiqarish", "beep"],
			["-"],
			["h", "qo'l topilganda", "whenHandFound"],
			["b", "qo'l topildimi?", "handFound"]
		],
		uz2: [
			["w", "oldinga %n soniya yurish", "moveForwardForSecs", 1],
			["w", "orqaga %n soniya yurish", "moveBackwardForSecs", 1],
			["w", "%m.left_right ga %n soniya o'girilish", "turnForSecs", "chap", 1],
			["-"],
			[" ", "%m.left_right_both ko'zni %m.color ga sozlash", "setEyeTo", "chap", "qizil"],
			[" ", "%m.left_right_both ko'zni o'chirish", "clearEye", "chap"],
			[" ", "tanasi LEDni %m.on_off", "turnBodyLed", "yoqing"],
			[" ", "old LEDni %m.on_off", "turnFrontLed", "yoqing"],
			["-"],
			["w", "ovoz chiqarish", "beep"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "playNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "restFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "changeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "setTempoTo", 60],
			["-"],
			["h", "qo'l topilganda", "whenHandFound"],
			["h", "%m.when_tilt bo'lganda", "whenTilt", "oldinga eğin"],
			["b", "qo'l topildimi?", "handFound"],
			["b", "%m.tilt ?", "tilt", "oldinga eğin"]
		],
		uz3: [
			["w", "oldinga %n soniya yurish", "moveForwardForSecs", 1],
			["w", "orqaga %n soniya yurish", "moveBackwardForSecs", 1],
			["w", "%m.left_right ga %n soniya o'girilish", "turnForSecs", "chap", 1],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "changeBothWheelsBy", 10, 10],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "setBothWheelsTo", 30, 30],
			[" ", "%m.left_right_both g'ildirakni %n ga o'zgartirish", "changeWheelBy", "chap", 10],
			[" ", "%m.left_right_both g'ildirakni %n ga sozlash", "setWheelTo", "chap", 30],
			[" ", "to'xtatish", "stop"],
			[" ", "doska kengligini %d.board_size balandligini %d.board_size ga sozlash", "setBoardSizeTo", 108, 76],
			["w", "doskada x: %n y: %n tomonga yurish", "moveToOnBoard", 0, 0],
			["w", "doskada %n daraja tomonga o'girilish", "setOrientationToOnBoard", 0],
			["-"],
			[" ", "%m.left_right_both ko'zni %m.color ga sozlash", "setEyeTo", "chap", "qizil"],
			[" ", "%m.left_right_both ko'zni o'chirish", "clearEye", "chap"],
			[" ", "tanasi LEDni %m.on_off", "turnBodyLed", "yoqing"],
			[" ", "old LEDni %m.on_off", "turnFrontLed", "yoqing"],
			["-"],
			["w", "ovoz chiqarish", "beep"],
			[" ", "buzerning ovozini %n ga o'zgartirish", "changeBuzzerBy", 10],
			[" ", "buzerning ovozini %n ga sozlash", "setBuzzerTo", 1000],
			[" ", "buzerni o'chirish", "clearBuzzer"],
			[" ", "%m.note %m.octave notani ijro etish", "playNote", "do", "4"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "playNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "restFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "changeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "setTempoTo", 60],
			["-"],
			["r", "chap yaqinlik", "leftProximity"],
			["r", "o'ng yaqinlik", "rightProximity"],
			["r", "x tezlanish", "accelerationX"],
			["r", "y tezlanish", "accelerationY"],
			["r", "z tezlanish", "accelerationZ"],
			["r", "old oid", "frontOid"],
			["r", "orqa oid", "backOid"],
			["r", "x lavozimi", "positionX"],
			["r", "y lavozimi", "positionY"],
			["r", "orientatsiya", "orientation"],
			["r", "yorug'lik", "light"],
			["r", "harorat", "temperature"],
			["r", "signal kuchi", "signalStrength"],
			["h", "qo'l topilganda", "whenHandFound"],
			["h", "%m.front_rear oid %n bo'lganida", "whenOid", "old", 0],
			["h", "%m.when_tilt bo'lganda", "whenTilt", "oldinga eğin"],
			["b", "qo'l topildimi?", "handFound"],
			["b", "%m.front_rear oid %n ?", "isOid", "old", 0],
			["b", "%m.tilt ?", "tilt", "oldinga eğin"],
			["b", "batareya %m.battery ?", "batteryState", "normal"]
		]
	};
	const MENUS = {
		en: {
			"left_right": ["left", "right"],
			"left_right_both": ["left", "right", "both"],
			"front_rear": ["front", "rear"],
			"board_size": ["37", "53", "76", "108", "153", "217"],
			"color": ["red", "yellow", "green", "sky blue", "blue", "purple", "white"],
			"on_off": ["on", "off"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"battery": ["normal", "low", "empty"]
		},
		ko: {
			"left_right": ["왼쪽", "오른쪽"],
			"left_right_both": ["왼쪽", "오른쪽", "양쪽"],
			"front_rear": ["앞쪽", "뒤쪽"],
			"board_size": ["37", "53", "76", "108", "153", "217"],
			"color": ["빨간색", "노란색", "초록색", "하늘색", "파란색", "자주색", "하얀색"],
			"on_off": ["켜기", "끄기"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_tilt": ["앞으로 기울였을", "뒤로 기울였을", "왼쪽으로 기울였을", "오른쪽으로 기울였을", "거꾸로 뒤집었을", "기울이지 않았을"],
			"tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "기울이지 않음"],
			"battery": ["정상", "부족", "없음"]
		},
		ja: {
			"left_right": ["左", "右"],
			"left_right_both": ["左", "右", "両"],
			"front_rear": ["前", "後"],
			"board_size": ["37", "53", "76", "108", "153", "217"],
			"color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色", "白色"],
			"on_off": ["点灯", "消す"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_tilt": ["前に傾けた", "後に傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾けなかった"],
			"tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾けなかったか"],
			"battery": ["正常か", "足りないか", "ないか"]
		},
		uz: {
			"left_right": ["chap", "o'ng"],
			"left_right_both": ["chap", "o'ng", "har ikki"],
			"front_rear": ["old", "orqa"],
			"board_size": ["37", "53", "76", "108", "153", "217"],
			"color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh", "oq"],
			"on_off": ["yoqing", "o'chirish"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q"],
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
	var COLORS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var TILTS = {};
	var BATTERY_STATES = {};
	var VALUES = {};

	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const FRONT = 4;
	const REAR = 5;
	const TILT_FORWARD = 1;
	const TILT_BACKWARD = 2;
	const TILT_LEFT = 3;
	const TILT_RIGHT = 4;
	const TILT_FLIP = 5;
	const TILT_NONE = 6;
	const ON = 4;
	const OFF = 5;

	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['left_right_both'];
		PARTS[tmp[0]] = LEFT;
		PARTS[tmp[1]] = RIGHT;
		PARTS[tmp[2]] = BOTH;
		tmp = MENUS[i]['front_rear'];
		PARTS[tmp[0]] = FRONT;
		PARTS[tmp[1]] = REAR;
		tmp = MENUS[i]['left_right'];
		DIRECTIONS[tmp[0]] = LEFT;
		DIRECTIONS[tmp[1]] = RIGHT;
		tmp = MENUS[i]['color'];
		COLORS[tmp[0]] = 4; // red
		COLORS[tmp[1]] = 6; // yellow
		COLORS[tmp[2]] = 2; // green
		COLORS[tmp[3]] = 3; // sky blue
		COLORS[tmp[4]] = 1; // blue
		COLORS[tmp[5]] = 5; // purple
		COLORS[tmp[6]] = 7; // white
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
		tmp = MENUS[i]['on_off'];
		VALUES[tmp[0]] = ON;
		VALUES[tmp[1]] = OFF;
	}

	function AlbertSchoolController() {
		this.PI = 3.14159265;
		this.PI2 = 6.2831853;
		this.prevDirection = 0;
		this.prevDirectionFinal = 0;
		this.directionCount = 0;
		this.directionCountFinal = 0;
		this.positionCount = 0;
		this.positionCountFinal = 0;
		this.GAIN_ANGLE = 30;
		this.GAIN_ANGLE_FINE = 30;
		this.GAIN_POSITION_FINE = 30;
		this.STRAIGHT_SPEED = 30;
		this.MAX_BASE_SPEED = 30;
		this.GAIN_BASE_SPEED = 1.5;
		this.GAIN_POSITION = 52.5;
		this.POSITION_TOLERANCE_FINE = 3;
		this.POSITION_TOLERANCE_FINE_LARGE = 5;
		this.POSITION_TOLERANCE_ROUGH = 5;
		this.POSITION_TOLERANCE_ROUGH_LARGE = 10;
		this.ORIENTATION_TOLERANCE_FINAL = 0.087;
		this.ORIENTATION_TOLERANCE_FINAL_LARGE = 0.122;
		this.ORIENTATION_TOLERANCE_FINAL_LARGE_LARGE = 0.262;
		this.ORIENTATION_TOLERANCE_ROUGH = 0.122;
		this.ORIENTATION_TOLERANCE_ROUGH_LARGE = 0.262;
		this.ORIENTATION_TOLERANCE_ROUGH_LARGE_LARGE = 0.524;
		this.MINIMUM_WHEEL_SPEED = 18;
		this.MINIMUM_WHEEL_SPEED_FINE = 15;
	}

	AlbertSchoolController.prototype.clear = function() {
		this.prevDirection = 0;
		this.prevDirectionFinal = 0;
		this.directionCount = 0;
		this.directionCountFinal = 0;
		this.positionCount = 0;
		this.positionCountFinal = 0;
	};

	AlbertSchoolController.prototype.controlAngleInitial = function(wheels, currentRadian, targetRadian) {
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

	AlbertSchoolController.prototype.controlAngleFinal = function(wheels, currentRadian, targetRadian) {
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

	AlbertSchoolController.prototype.controlPositionFine = function(wheels, currentX, currentY, currentRadian, targetX, targetY) {
		var targetRadian = Math.atan2(targetY - currentY, targetX - currentX);
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
		value = parseInt(value);
		wheels.left = this.MINIMUM_WHEEL_SPEED_FINE - value;
		wheels.right = this.MINIMUM_WHEEL_SPEED_FINE + value;
		return false;
	};

	AlbertSchoolController.prototype.controlPosition = function(wheels, currentX, currentY, currentRadian, targetX, targetY) {
		var targetRadian = Math.atan2(targetY - currentY, targetX - currentX);
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
			base = parseInt(base);
			value = parseInt(value);
			wheels.left = base - value;
			wheels.right = base + value;
		}
		return false;
	};

	AlbertSchoolController.prototype.validateRadian = function(radian) {
		if(radian > this.PI) return radian - this.PI2;
		else if(radian < -this.PI) return radian + this.PI2;
		return radian;
	};

	AlbertSchoolController.prototype.toRadian = function(degree) {
		return degree * 3.14159265 / 180.0;
	};

	function AlbertSchoolNavigator() {
		this.controller = new AlbertSchoolController();
		this.mode = 0;
		this.state = 0;
		this.initialized = false;
		this.boardWidth = 0;
		this.boardHeight = 0;
		this.currentX = -1;
		this.currentY = -1;
		this.currentTheta = -200;
		this.targetX = -1;
		this.targetY = -1;
		this.targetTheta = -200;
		this.wheels = { completed: false, left: 0, right: 0 };
	}

	AlbertSchoolNavigator.prototype.clear = function() {
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

	AlbertSchoolNavigator.prototype.getBoardWidth = function() {
		return this.boardWidth;
	};

	AlbertSchoolNavigator.prototype.getBoardHeight = function() {
		return this.boardHeight;
	};

	AlbertSchoolNavigator.prototype.setBoardSize = function(width, height) {
		this.boardWidth = width;
		this.boardHeight = height;
	};

	AlbertSchoolNavigator.prototype.moveTo = function(x, y) {
		this.clear();
		this.targetX = x;
		this.targetY = y;
		this.state = 1;
		this.mode = 1;
	};

	AlbertSchoolNavigator.prototype.turnTo = function(deg) {
		this.clear();
		this.targetTheta = deg;
		this.state = 1;
		this.mode = 2;
	};

	AlbertSchoolNavigator.prototype.handleSensory = function(sensory) {
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
						var targetRadian = Math.atan2(dy, dx);
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

	function AlbertSchool(index) {
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
			orientation: -200,
			light: 0,
			temperature: 0,
			battery: 0,
			frontOid: -1,
			rearOid: -1,
			batteryState: 2,
			tilt: 0,
			handFound: false
		};
		this.motoring = {
			module: 'albertschool',
			index: index,
			map: 0xbe000000,
			leftWheel: 0,
			rightWheel: 0,
			buzzer: 0,
			leftEye: 0,
			rightEye: 0,
			note: 0,
			bodyLed: 0,
			frontLed: 0,
			boardWidth: 0,
			boardHeight: 0,
			motion: 0
		};
		this.blockId = 0;
		this.wheelId = 0;
		this.wheelTimer = undefined;
		this.navigationCallback = undefined;
		this.navigator = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.tempo = 60;
		this.timeouts = [];
	}

	AlbertSchool.prototype.reset = function() {
		var motoring = this.motoring;
		motoring.map = 0x8efc0000;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.buzzer = 0;
		motoring.leftEye = 0;
		motoring.rightEye = 0;
		motoring.note = 0;
		motoring.bodyLed = 0;
		motoring.frontLed = 0;
		motoring.boardWidth = 0;
		motoring.boardHeight = 0;
		motoring.motion = 0;

		this.blockId = 0;
		this.wheelId = 0;
		this.wheelTimer = undefined;
		this.navigationCallback = undefined;
		this.navigator = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.tempo = 60;

		this.__removeAllTimeouts();
	};

	AlbertSchool.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	AlbertSchool.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};

	AlbertSchool.prototype.clearMotoring = function() {
		this.motoring.map = 0xbe000000;
	};

	AlbertSchool.prototype.clearEvent = function() {
	};

	AlbertSchool.prototype.__issueWheelId = function() {
		this.wheelId = this.blockId = (this.blockId % 65535) + 1;
		return this.wheelId;
	};

	AlbertSchool.prototype.__cancelWheel = function() {
		this.wheelId = 0;
		if(this.wheelTimer !== undefined) {
			this.__removeTimeout(this.wheelTimer);
		}
		this.wheelTimer = undefined;
	};

	AlbertSchool.prototype.__getNavigator = function() {
		if(this.navigator == undefined) {
			this.navigator = new AlbertSchoolNavigator();
		}
		return this.navigator;
	};

	AlbertSchool.prototype.__cancelNavigation = function() {
		this.navigationCallback = undefined;
		if(this.navigator) {
			this.navigator.clear();
		}
	};

	AlbertSchool.prototype.__setLeftEye = function(color) {
		this.motoring.leftEye = color;
		this.motoring.map |= 0x00800000;
	};

	AlbertSchool.prototype.__setRightEye = function(color) {
		this.motoring.rightEye = color;
		this.motoring.map |= 0x00400000;
	};

	AlbertSchool.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x00200000;
	};

	AlbertSchool.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	AlbertSchool.prototype.__cancelNote = function() {
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

	AlbertSchool.prototype.__setBodyLed = function(value) {
		this.motoring.bodyLed = value;
		this.motoring.map |= 0x00100000;
	};

	AlbertSchool.prototype.__setFrontLed = function(value) {
		this.motoring.frontLed = value;
		this.motoring.map |= 0x00080000;
	};

	AlbertSchool.prototype.__setBoardSize = function(width, height) {
		this.motoring.boardWidth = width;
		this.motoring.boardHeight = height;
		this.motoring.map |= 0x00040000;
	};

	AlbertSchool.prototype.handleSensory = function() {
		if(this.navigationCallback) {
			if(this.navigator) {
				var result = this.navigator.handleSensory(this.sensory);
				this.motoring.leftWheel = result.left;
				this.motoring.rightWheel = result.right;
				if(result.completed) {
					var callback = this.navigationCallback;
					this.__cancelNavigation();
					if(callback) callback();
				}
			}
		}
	};

	AlbertSchool.prototype.__motion = function(type, leftVelocity, rightVelocity, secs, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelNavigation();
		self.__cancelWheel();

		secs = parseFloat(secs);
		if(secs && secs > 0) {
			var id = self.__issueWheelId();
			motoring.leftWheel = leftVelocity;
			motoring.rightWheel = rightVelocity;
			motoring.motion = type;
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
			callback();
		}
	};

	AlbertSchool.prototype.moveForward = function(callback) {
		this.__motion(1, 30, 30, 1, callback);
	};

	AlbertSchool.prototype.moveBackward = function(callback) {
		this.__motion(2, -30, -30, 1, callback);
	};

	AlbertSchool.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(3, -30, 30, 1, callback);
		} else {
			this.__motion(4, 30, -30, 1, callback);
		}
	};

	AlbertSchool.prototype.moveForwardSecs = function(secs, callback) {
		if(secs < 0) this.__motion(2, -30, -30, -secs, callback);
		else this.__motion(1, 30, 30, secs, callback);
	};

	AlbertSchool.prototype.moveBackwardSecs = function(secs, callback) {
		if(secs < 0) this.__motion(1, 30, 30, -secs, callback);
		else this.__motion(2, -30, -30, secs, callback);
	};

	AlbertSchool.prototype.turnSecs = function(direction, secs, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			if(secs < 0) this.__motion(4, 30, -30, -secs, callback);
			else this.__motion(3, -30, 30, secs, callback);
		} else {
			if(secs < 0) this.__motion(3, -30, 30, -secs, callback);
			else this.__motion(4, 30, -30, secs, callback);
		}
	};

	AlbertSchool.prototype.setWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelWheel();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel = leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel = rightVelocity;
		}
		motoring.motion = 0;
	};

	AlbertSchool.prototype.changeWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelWheel();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel += leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel += rightVelocity;
		}
		motoring.motion = 0;
	};

	AlbertSchool.prototype.setWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelWheel();

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
	};

	AlbertSchool.prototype.changeWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelWheel();

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
	};

	AlbertSchool.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelWheel();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = 0;
	};

	AlbertSchool.prototype.setBoardSize = function(width, height) {
		width = parseInt(width);
		height = parseInt(height);
		if(width && height && width > 0 && height > 0) {
			var navi = this.__getNavigator();
			navi.setBoardSize(width, height);
			this.__setBoardSize(width, height);
		}
	};

	AlbertSchool.prototype.moveToOnBoard = function(x, y, callback) {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelWheel();

		x = parseInt(x);
		y = parseInt(y);
		var navi = this.__getNavigator();
		if((typeof x == 'number') && (typeof y == 'number') && x >= 0 && x < navi.getBoardWidth() && y >= 0 && y < navi.getBoardHeight()) {
			this.navigationCallback = callback;
			navi.moveTo(x, y);
		}
	};

	AlbertSchool.prototype.setOrientationToOnBoard = function(degree, callback) {
		var motoring = this.motoring;
		this.__cancelNavigation();
		this.__cancelWheel();

		degree = parseInt(degree);
		if(typeof degree == 'number') {
			var navi = this.__getNavigator();
			this.navigationCallback = callback;
			navi.turnTo(degree);
		}
	};

	AlbertSchool.prototype.setEye = function(eye, color) {
		color = COLORS[color];
		if(color && color > 0) {
			eye = PARTS[eye];
			if(eye == LEFT) {
				this.__setLeftEye(color);
			} else if(eye == RIGHT) {
				this.__setRightEye(color);
			} else {
				this.__setLeftEye(color);
				this.__setRightEye(color);
			}
		}
	};

	AlbertSchool.prototype.clearEye = function(eye) {
		eye = PARTS[eye];
		if(eye == LEFT) {
			this.__setLeftEye(0);
		} else if(eye == RIGHT) {
			this.__setRightEye(0);
		} else {
			this.__setLeftEye(0);
			this.__setRightEye(0);
		}
	};

	AlbertSchool.prototype.turnBodyLed = function(on) {
		on = VALUES[on];
		this.__setBodyLed(on == ON ? 1 : 0);
	};

	AlbertSchool.prototype.turnFrontLed = function(on) {
		on = VALUES[on];
		this.__setFrontLed(on == ON ? 1 : 0);
	};

	AlbertSchool.prototype.runBeep = function(count, id, callback) {
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

	AlbertSchool.prototype.beep = function(callback) {
		this.__cancelNote();
		var id = this.__issueNoteId();
		this.runBeep(1, id, callback);
	};

	AlbertSchool.prototype.setBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer = hz;
		}
		this.__setNote(0);
	};

	AlbertSchool.prototype.changeBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer += hz;
		}
		this.__setNote(0);
	};

	AlbertSchool.prototype.clearBuzzer = function() {
		this.__cancelNote();
		this.motoring.buzzer = 0;
		this.__setNote(0);
	};

	AlbertSchool.prototype.playNote = function(note, octave) {
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

	AlbertSchool.prototype.playNoteBeat = function(note, octave, beat, callback) {
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

	AlbertSchool.prototype.restBeat = function(beat, callback) {
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

	AlbertSchool.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	AlbertSchool.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	AlbertSchool.prototype.getLeftProximity = function() {
		return this.sensory.leftProximity;
	};

	AlbertSchool.prototype.getRightProximity = function() {
		return this.sensory.rightProximity;
	};

	AlbertSchool.prototype.getAccelerationX = function() {
		return this.sensory.accelerationX;
	};

	AlbertSchool.prototype.getAccelerationY = function() {
		return this.sensory.accelerationY;
	};

	AlbertSchool.prototype.getAccelerationZ = function() {
		return this.sensory.accelerationZ;
	};

	AlbertSchool.prototype.getFrontOid = function() {
		return this.sensory.frontOid;
	};

	AlbertSchool.prototype.getRearOid = function() {
		return this.sensory.rearOid;
	};

	AlbertSchool.prototype.getPositionX = function() {
		return this.sensory.positionX;
	};

	AlbertSchool.prototype.getPositionY = function() {
		return this.sensory.positionY;
	};

	AlbertSchool.prototype.getOrientation = function() {
		return this.sensory.orientation;
	};

	AlbertSchool.prototype.getLight = function() {
		return this.sensory.light;
	};

	AlbertSchool.prototype.getTemperature = function() {
		return this.sensory.temperature;
	};

	AlbertSchool.prototype.getSignalStrength = function() {
		return this.sensory.signalStrength;
	};

	AlbertSchool.prototype.checkHandFound = function() {
		var sensory = this.sensory;
		return (sensory.handFound === undefined) ? (sensory.leftProximity > 40 || sensory.rightProximity > 40) : sensory.handFound;
	};

	AlbertSchool.prototype.checkOid = function(oid, value) {
		value = parseInt(value);
		if(typeof value == 'number') {
			switch(PARTS[oid]) {
				case FRONT: return this.sensory.frontOid == value;
				case REAR: return this.sensory.rearOid == value;
			}
		}
		return false;
	};

	AlbertSchool.prototype.checkTilt = function(tilt) {
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

	AlbertSchool.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};
	
	function getOrCreateRobot(group, module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			switch(module) {
				case ALBERTSCHOOL: robot = new AlbertSchool(index); break;
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

	ext.moveForward = function(callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.moveForward(callback);
	};
	
	ext.moveBackward = function(callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.turn = function(direction, callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.turn(direction, callback);
	};
	
	ext.moveForwardForSecs = function(secs, callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.moveForwardSecs(secs, callback);
	};
	
	ext.moveBackwardForSecs = function(secs, callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.moveBackwardSecs(secs, callback);
	};
	
	ext.turnForSecs = function(direction, secs, callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.turnSecs(direction, secs, callback);
	};
	
	ext.changeBothWheelsBy = function(left, right) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.changeWheels(left, right);
	};
	
	ext.setBothWheelsTo = function(left, right) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.setWheels(left, right);
	};
	
	ext.changeWheelBy = function(wheel, value) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.changeWheel(wheel, value);
	};
	
	ext.setWheelTo = function(wheel, value) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.setWheel(wheel, value);
	};
	
	ext.stop = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.stop();
	};
	
	ext.setBoardSizeTo = function(width, height) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.setBoardSize(width, height);
	};
	
	ext.moveToOnBoard = function(x, y, callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.moveToOnBoard(x, y, callback);
	};
	
	ext.setOrientationToOnBoard = function(degree, callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.setOrientationToOnBoard(degree, callback);
	};
	
	ext.setEyeTo = function(eye, color) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.setEye(eye, color);
	};
	
	ext.clearEye = function(eye) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.clearEye(eye);
	};
	
	ext.turnBodyLed = function(onoff) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.turnBodyLed(onoff);
	};
	
	ext.turnFrontLed = function(onoff) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.turnFrontLed(onoff);
	};
	
	ext.albertschoolBeep = function(callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.beep(callback);
	};
	
	ext.changeBuzzerBy = function(hz) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.changeBuzzer(hz);
	};
	
	ext.setBuzzerTo = function(hz) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.setBuzzer(hz);
	};
	
	ext.clearBuzzer = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.clearBuzzer();
	};
	
	ext.playNote = function(note, octave) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.playNoteFor = function(note, octave, beat, callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};
	
	ext.restFor = function(beat, callback) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.restBeat(beat, callback);
	};
	
	ext.changeTempoBy = function(bpm) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.changeTempo(bpm);
	};
	
	ext.setTempoTo = function(bpm) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) robot.setTempo(bpm);
	};
	
	ext.leftProximity = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getLeftProximity();
		return 0;
	};
	
	ext.rightProximity = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getRightProximity();
		return 0;
	};
	
	ext.accelerationX = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getAccelerationX();
		return 0;
	};
	
	ext.accelerationY = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getAccelerationY();
		return 0;
	};
	
	ext.accelerationZ = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getAccelerationZ();
		return 0;
	};
	
	ext.frontOid = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getFrontOid();
		return -1;
	};
	
	ext.backOid = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getRearOid();
		return -1;
	};
	
	ext.positionX = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getPositionX();
		return -1;
	};
	
	ext.positionY = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getPositionY();
		return -1;
	};
	
	ext.orientation = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getOrientation();
		return -200;
	};
	
	ext.light = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getLight();
		return 0;
	};
	
	ext.temperature = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getTemperature();
		return 0;
	};
	
	ext.signalStrength = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.getSignalStrength();
		return 0;
	};
	
	ext.whenHandFound = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.whenOid = function(oid, value) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.checkOid(oid, value);
		return false;
	};
	
	ext.whenTilt = function(tilt) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.handFound = function() {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.isOid = function(oid, value) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.checkOid(oid, value);
		return false;
	};
	
	ext.tilt = function(tilt) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.batteryState = function(battery) {
		var robot = getRobot(ALBERTSCHOOL, 0);
		if(robot) return robot.checkBattery(battery);
		return false;
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
