(function(ext) {

	var sensory = {
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
	var motoring = {
    		group: 'hamster',
		module: 'hamster',
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
	var packet = {
		version: 1,
		robot: motoring
	};
	const MOTION = {
		NONE: 0,
		FORWARD: 1,
		BACKWARD: 2,
		LEFT: 3,
		RIGHT: 4
	};
	var connectionState = 1;
	var blockId = 0;
	var wheelId = 0;
	var wheelTimer = undefined;
	var lineTracerCallback = undefined;
	var boardCommand = 0;
	var boardState = 0;
	var boardCount = 0;
	var boardCallback = undefined;
	var noteId = 0;
	var noteTimer1 = undefined;
	var noteTimer2 = undefined;
	var ioId = 0;
	var ioTimer = undefined;
	var tempo = 60;
	var timeouts = [];
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
		en: 'Hamster',
		ko: '햄스터',
		ja: 'ハムスター',
		uz: 'Hamster'
	};
	const BLOCKS = {
		en1: [
			["w", "move forward once on board", "boardMoveForward"],
			["w", "turn %m.left_right once on board", "boardTurn", "left"],
			["-"],
			["w", "move forward", "moveForward"],
			["w", "move backward", "moveBackward"],
			["w", "turn %m.left_right", "turn", "left"],
			["-"],
			[" ", "set %m.left_right_both led to %m.color", "setLedTo", "left", "red"],
			[" ", "clear %m.left_right_both led", "clearLed", "left"],
			["-"],
			["w", "beep", "beep"],
			["-"],
			["b", "hand found?", "handFound"]
		],
		en2: [
			["w", "move forward once on board", "boardMoveForward"],
			["w", "turn %m.left_right once on board", "boardTurn", "left"],
			["-"],
			["w", "move forward %n secs", "moveForwardForSecs", 1],
			["w", "move backward %n secs", "moveBackwardForSecs", 1],
			["w", "turn %m.left_right %n secs", "turnForSecs", "left", 1],
			["-"],
			[" ", "set %m.left_right_both led to %m.color", "setLedTo", "left", "red"],
			[" ", "clear %m.left_right_both led", "clearLed", "left"],
			["-"],
			["w", "beep", "beep"],
			["w", "play note %m.note %m.octave for %d.beats beats", "playNoteFor", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "restFor", 0.25],
			[" ", "change tempo by %n", "changeTempoBy", 20],
			[" ", "set tempo to %n bpm", "setTempoTo", 60],
			["-"],
			["b", "hand found?", "handFound"],
			["b", "%m.tilt ?", "tilt", "tilt forward"]
		],
		en3: [
			["w", "move forward once on board", "boardMoveForward"],
			["w", "turn %m.left_right once on board", "boardTurn", "left"],
			["-"],
			["w", "move forward %n secs", "moveForwardForSecs", 1],
			["w", "move backward %n secs", "moveBackwardForSecs", 1],
			["w", "turn %m.left_right %n secs", "turnForSecs", "left", 1],
			[" ", "change wheels by left: %n right: %n", "changeBothWheelsBy", 10, 10],
			[" ", "set wheels to left: %n right: %n", "setBothWheelsTo", 30, 30],
			[" ", "change %m.left_right_both wheel by %n", "changeWheelBy", "left", 10],
			[" ", "set %m.left_right_both wheel to %n", "setWheelTo", "left", 30],
			[" ", "follow %m.black_white line with %m.left_right_both floor sensor", "followLineUsingFloorSensor", "black", "left"],
			["w", "follow %m.black_white line until %m.left_right_front_rear intersection", "followLineUntilIntersection", "black", "front"],
			[" ", "set following speed to %m.speed", "setFollowingSpeedTo", "5"],
			[" ", "stop", "stop"],
			["-"],
			[" ", "set %m.left_right_both led to %m.color", "setLedTo", "left", "red"],
			[" ", "clear %m.left_right_both led", "clearLed", "left"],
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
			["r", "left floor", "leftFloor"],
			["r", "right floor", "rightFloor"],
			["r", "x acceleration", "accelerationX"],
			["r", "y acceleration", "accelerationY"],
			["r", "z acceleration", "accelerationZ"],
			["r", "light", "light"],
			["r", "temperature", "temperature"],
			["r", "signal strength", "signalStrength"],
			["b", "hand found?", "handFound"],
			["b", "%m.tilt ?", "tilt", "tilt forward"],
			["b", "battery %m.battery ?", "battery", "normal"],
			["-"],
			[" ", "set port %m.port to %m.mode", "setPortTo", "A", "analog input"],
			[" ", "change output %m.port by %n", "changeOutputBy", "A", 10],
			[" ", "set output %m.port to %n", "setOutputTo", "A", 100],
			["w", "%m.open_close gripper", "gripper", "open"],
			[" ", "release gripper", "releaseGripper"],
			["r", "input A", "inputA"],
			["r", "input B", "inputB"]
		],
		ko1: [
			["w", "말판 앞으로 한 칸 이동하기", "boardMoveForward"],
			["w", "말판 %m.left_right 으로 한 번 돌기", "boardTurn", "왼쪽"],
			["-"],
			["w", "앞으로 이동하기", "moveForward"],
			["w", "뒤로 이동하기", "moveBackward"],
			["w", "%m.left_right 으로 돌기", "turn", "왼쪽"],
			["-"],
			[" ", "%m.left_right_both LED를 %m.color 으로 정하기", "setLedTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both LED 끄기", "clearLed", "왼쪽"],
			["-"],
			["w", "삐 소리내기", "beep"],
			["-"],
			["b", "손 찾음?", "handFound"]
		],
		ko2: [
			["w", "말판 앞으로 한 칸 이동하기", "boardMoveForward"],
			["w", "말판 %m.left_right 으로 한 번 돌기", "boardTurn", "왼쪽"],
			["-"],
			["w", "앞으로 %n 초 이동하기", "moveForwardForSecs", 1],
			["w", "뒤로 %n 초 이동하기", "moveBackwardForSecs", 1],
			["w", "%m.left_right 으로 %n 초 돌기", "turnForSecs", "왼쪽", 1],
			["-"],
			[" ", "%m.left_right_both LED를 %m.color 으로 정하기", "setLedTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both LED 끄기", "clearLed", "왼쪽"],
			["-"],
			["w", "삐 소리내기", "beep"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "playNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "restFor", 0.25],
			[" ", "연주 속도를 %n 만큼 바꾸기", "changeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "setTempoTo", 60],
			["-"],
			["b", "손 찾음?", "handFound"],
			["b", "%m.tilt ?", "tilt", "앞으로 기울임"]
		],
		ko3: [
			["w", "말판 앞으로 한 칸 이동하기", "boardMoveForward"],
			["w", "말판 %m.left_right 으로 한 번 돌기", "boardTurn", "왼쪽"],
			["-"],
			["w", "앞으로 %n 초 이동하기", "moveForwardForSecs", 1],
			["w", "뒤로 %n 초 이동하기", "moveBackwardForSecs", 1],
			["w", "%m.left_right 으로 %n 초 돌기", "turnForSecs", "왼쪽", 1],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기", "changeBothWheelsBy", 10, 10],
			[" ", "왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기", "setBothWheelsTo", 30, 30],
			[" ", "%m.left_right_both 바퀴 %n 만큼 바꾸기", "changeWheelBy", "왼쪽", 10],
			[" ", "%m.left_right_both 바퀴 %n (으)로 정하기", "setWheelTo", "왼쪽", 30],
			[" ", "%m.black_white 선을 %m.left_right_both 바닥 센서로 따라가기", "followLineUsingFloorSensor", "검은색", "왼쪽"],
			["w", "%m.black_white 선을 따라 %m.left_right_front_rear 교차로까지 이동하기", "followLineUntilIntersection", "검은색", "앞쪽"],
			[" ", "선 따라가기 속도를 %m.speed (으)로 정하기", "setFollowingSpeedTo", "5"],
			[" ", "정지하기", "stop"],
			["-"],
			[" ", "%m.left_right_both LED를 %m.color 으로 정하기", "setLedTo", "왼쪽", "빨간색"],
			[" ", "%m.left_right_both LED 끄기", "clearLed", "왼쪽"],
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
			["r", "왼쪽 바닥 센서", "leftFloor"],
			["r", "오른쪽 바닥 센서", "rightFloor"],
			["r", "x축 가속도", "accelerationX"],
			["r", "y축 가속도", "accelerationY"],
			["r", "z축 가속도", "accelerationZ"],
			["r", "밝기", "light"],
			["r", "온도", "temperature"],
			["r", "신호 세기", "signalStrength"],
			["b", "손 찾음?", "handFound"],
			["b", "%m.tilt ?", "tilt", "앞으로 기울임"],
			["b", "배터리 %m.battery ?", "battery", "정상"],
			["-"],
			[" ", "포트 %m.port 를 %m.mode 으로 정하기", "setPortTo", "A", "아날로그 입력"],
			[" ", "출력 %m.port 를 %n 만큼 바꾸기", "changeOutputBy", "A", 10],
			[" ", "출력 %m.port 를 %n (으)로 정하기", "setOutputTo", "A", 100],
			["w", "집게 %m.open_close", "gripper", "열기"],
			[" ", "집게 끄기", "releaseGripper"],
			["r", "입력 A", "inputA"],
			["r", "입력 B", "inputB"]
		],
		ja1: [
			["w", "ボード板上で前へ動かす", "boardMoveForward"],
			["w", "ボード板上で %m.left_right に回す", "boardTurn", "左"],
			["-"],
			["w", "前へ動かす", "moveForward"],
			["w", "後ろへ動かす", "moveBackward"],
			["w", "%m.left_right に回す", "turn", "左"],
			["-"],
			[" ", "%m.left_right_both LEDを %m.color にする", "setLedTo", "左", "赤色"],
			[" ", "%m.left_right_both LEDをオフ", "clearLed", "左"],
			["-"],
			["w", "ビープ", "beep"],
			["-"],
			["b", "手を見つけたか?", "handFound"]
		],
		ja2: [
			["w", "ボード板上で前へ動かす", "boardMoveForward"],
			["w", "ボード板上で %m.left_right に回す", "boardTurn", "左"],
			["-"],
			["w", "前へ %n 秒動かす", "moveForwardForSecs", 1],
			["w", "後ろへ %n 秒動かす", "moveBackwardForSecs", 1],
			["w", "%m.left_right に %n 秒回す", "turnForSecs", "左", 1],
			["-"],
			[" ", "%m.left_right_both LEDを %m.color にする", "setLedTo", "左", "赤色"],
			[" ", "%m.left_right_both LEDをオフ", "clearLed", "左"],
			["-"],
			["w", "ビープ", "beep"],
			["w", "%m.note %m.octave 音を %d.beats 拍鳴らす", "playNoteFor", "ド", "4", 0.5],
			["w", "%d.beats 拍休む", "restFor", 0.25],
			[" ", "テンポを %n ずつ変える", "changeTempoBy", 20],
			[" ", "テンポを %n BPMにする", "setTempoTo", 60],
			["-"],
			["b", "手を見つけたか?", "handFound"],
			["b", "%m.tilt ?", "tilt", "前に傾けたか"]
		],
		ja3: [
			["w", "ボード板上で前へ動かす", "boardMoveForward"],
			["w", "ボード板上で %m.left_right に回す", "boardTurn", "左"],
			["-"],
			["w", "前へ %n 秒動かす", "moveForwardForSecs", 1],
			["w", "後ろへ %n 秒動かす", "moveBackwardForSecs", 1],
			["w", "%m.left_right に %n 秒回す", "turnForSecs", "左", 1],
			[" ", "左車輪を %n 右車輪を %n ずつ変える", "changeBothWheelsBy", 10, 10],
			[" ", "左車輪を %n 右車輪を %n にする", "setBothWheelsTo", 30, 30],
			[" ", "%m.left_right_both 車輪を %n ずつ変える", "changeWheelBy", "左", 10],
			[" ", "%m.left_right_both 車輪を %n にする", "setWheelTo", "左", 30],
			[" ", "%m.black_white 線を %m.left_right_both フロアセンサーで追従する", "followLineUsingFloorSensor", "黒色", "左"],
			["w", "%m.black_white 線を追従して %m.left_right_front_rear 交差点まで動かす", "followLineUntilIntersection", "黒色", "前"],
			[" ", "線を追従する速度を %m.speed にする", "setFollowingSpeedTo", "5"],
			[" ", "停止する", "stop"],
			["-"],
			[" ", "%m.left_right_both LEDを %m.color にする", "setLedTo", "左", "赤色"],
			[" ", "%m.left_right_both LEDをオフ", "clearLed", "左"],
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
			["r", "左フロアセンサー", "leftFloor"],
			["r", "右フロアセンサー", "rightFloor"],
			["r", "x軸加速度", "accelerationX"],
			["r", "y軸加速度", "accelerationY"],
			["r", "z軸加速度", "accelerationZ"],
			["r", "照度", "light"],
			["r", "温度", "temperature"],
			["r", "信号強度", "signalStrength"],
			["b", "手を見つけたか?", "handFound"],
			["b", "%m.tilt ?", "tilt", "前に傾けたか"],
			["b", "電池が %m.battery ?", "battery", "正常か"],
			["-"],
			[" ", "ポート %m.port を %m.mode にする", "setPortTo", "A", "アナログ入力"],
			[" ", "出力 %m.port を %n ずつ変える", "changeOutputBy", "A", 10],
			[" ", "出力 %m.port を %n にする", "setOutputTo", "A", 100],
			["w", "グリッパを %m.open_close", "gripper", "開く"],
			[" ", "グリッパをオフ", "releaseGripper"],
			["r", "入力A", "inputA"],
			["r", "入力B", "inputB"]
		],
		uz1: [
			["w", "doskada bir marta oldinga yurish", "boardMoveForward"],
			["w", "doskada bir marta %m.left_right ga o'girish", "boardTurn", "chap"],
			["-"],
			["w", "oldinga yurish", "moveForward"],
			["w", "orqaga yurish", "moveBackward"],
			["w", "%m.left_right ga o'girilish", "turn", "chap"],
			["-"],
			[" ", "%m.left_right_both LEDni %m.color ga sozlash", "setLedTo", "chap", "qizil"],
			[" ", "%m.left_right_both LEDni o'chirish", "clearLed", "chap"],
			["-"],
			["w", "ovoz chiqarish", "beep"],
			["-"],
			["b", "qo'l topildimi?", "handFound"]
		],
		uz2: [
			["w", "doskada bir marta oldinga yurish", "boardMoveForward"],
			["w", "doskada bir marta %m.left_right ga o'girish", "boardTurn", "chap"],
			["-"],
			["w", "oldinga %n soniya yurish", "moveForwardForSecs", 1],
			["w", "orqaga %n soniya yurish", "moveBackwardForSecs", 1],
			["w", "%m.left_right ga %n soniya o'girilish", "turnForSecs", "chap", 1],
			["-"],
			[" ", "%m.left_right_both LEDni %m.color ga sozlash", "setLedTo", "chap", "qizil"],
			[" ", "%m.left_right_both LEDni o'chirish", "clearLed", "chap"],
			["-"],
			["w", "ovoz chiqarish", "beep"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "playNoteFor", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "restFor", 0.25],
			[" ", "temni %n ga o'zgartirish", "changeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "setTempoTo", 60],
			["-"],
			["b", "qo'l topildimi?", "handFound"],
			["b", "%m.tilt ?", "tilt", "oldinga eğin"]
		],
		uz3: [
			["w", "doskada bir marta oldinga yurish", "boardMoveForward"],
			["w", "doskada bir marta %m.left_right ga o'girish", "boardTurn", "chap"],
			["-"],
			["w", "oldinga %n soniya yurish", "moveForwardForSecs", 1],
			["w", "orqaga %n soniya yurish", "moveBackwardForSecs", 1],
			["w", "%m.left_right ga %n soniya o'girilish", "turnForSecs", "chap", 1],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "changeBothWheelsBy", 10, 10],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "setBothWheelsTo", 30, 30],
			[" ", "%m.left_right_both g'ildirakni %n ga o'zgartirish", "changeWheelBy", "chap", 10],
			[" ", "%m.left_right_both g'ildirakni %n ga sozlash", "setWheelTo", "chap", 30],
			[" ", "%m.black_white liniyasini %m.left_right_both tomon taglik sensori orqali ergashish", "followLineUsingFloorSensor", "qora", "chap"],
			["w", "%m.black_white liniya ustida %m.left_right_front_rear kesishmagacha yurish", "followLineUntilIntersection", "qora", "old"],
			[" ", "liniyada ergashish tezligini %m.speed ga sozlash", "setFollowingSpeedTo", "5"],
			[" ", "to'xtatish", "stop"],
			["-"],
			[" ", "%m.left_right_both LEDni %m.color ga sozlash", "setLedTo", "chap", "qizil"],
			[" ", "%m.left_right_both LEDni o'chirish", "clearLed", "chap"],
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
			["r", "chap taglik", "leftFloor"],
			["r", "o'ng taglik", "rightFloor"],
			["r", "x tezlanish", "accelerationX"],
			["r", "y tezlanish", "accelerationY"],
			["r", "z tezlanish", "accelerationZ"],
			["r", "yorug'lik", "light"],
			["r", "harorat", "temperature"],
			["r", "signal kuchi", "signalStrength"],
			["b", "qo'l topildimi?", "handFound"],
			["b", "%m.tilt ?", "tilt", "oldinga eğin"],
			["b", "batareya %m.battery ?", "battery", "normal"],
			["-"],
			[" ", "%m.port portni %m.mode ga sozlash", "setPortTo", "A", "analog kiritish"],
			[" ", "%m.port portni %n ga o'zgartirish", "changeOutputBy", "A", 10],
			[" ", "%m.port portni %n ga sozlash", "setOutputTo", "A", 100],
			["w", "gripperni %m.open_close", "gripper", "oching"],
			[" ", "gripperni ozod qilish", "releaseGripper"],
			["r", "A kirish", "inputA"],
			["r", "B kirish", "inputB"]
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
			"forward_backward": ["forward", "backward"],
			"move_unit": ["cm", "seconds", "pulses"],
			"led_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "violet", "purple", "white"],
			"sound_effect": ["beep", "random beep", "noise", "siren", "engine", "sound effect up", "sound effect down", "robot", "dibidibidip", "random melody", "good job", "happy", "angry", "sad", "lullaby", "march", "birthday"]
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
			"forward_backward": ["앞쪽", "뒤쪽"],
			"move_unit": ["cm", "초", "펄스"],
			"led_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"sound_effect": ["삐", "무작위 삐", "지지직", "사이렌", "엔진", "올라가는 효과음", "내려가는 효과음", "로봇", "디비디비딥", "무작위 멜로디", "잘 했어요", "행복", "화남", "슬픔", "자장가", "행진", "생일"]
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
			"forward_backward": ["前", "後"],
			"move_unit": ["cm", "秒", "パルス"],
			"led_color": ["赤色", "橙色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"sound_effect": ["ビープ", "ランダムビープ", "ノイズ", "サイレン", "エンジン", "上がる効果音", "下がる効果音", "ロボット", "ディバディバディップ", "ランダムメロディ", "よくやった", "幸福", "怒った", "悲しみ", "子守唄", "行進", "誕生"]
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
			"forward_backward": ["old", "orqa"],
			"move_unit": ["cm", "soniya", "puls"],
			"led_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "binafsha", "siyoh", "oq"],
			"sound_effect": ["qisqa", "tasodifiy qisqa", "shovqin", "sirena", "motor", "ovoz effekti yuqori", "ovoz effekti past", "robot", "dibidibidip", "tasodifiy ohang", "juda yaxshi", "baxtli", "badjahl", "xafa", "alla", "marsh", "tug'ilgan kun"]
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
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var SOUNDS = {};
	var MODES = {};
	var GRIPPERS = {};
	var VALUES = {};
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const FRONT = 4;
	const REAR = 5;
	const FORWARD = 1;
	const SECONDS = 1;
	const OPEN = 1;
	const CLOSE = 2;
	const WHITE = 1;
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['left_right_both'];
		PARTS[tmp[0]] = LEFT;
		PARTS[tmp[1]] = RIGHT;
		PARTS[tmp[2]] = BOTH;
		tmp = MENUS[i]['left_right_front_rear'];
		DIRECTIONS[tmp[0]] = LEFT;
		DIRECTIONS[tmp[1]] = RIGHT;
		DIRECTIONS[tmp[2]] = FRONT;
		DIRECTIONS[tmp[3]] = REAR;
		tmp = MENUS[i]['forward_backward'];
		TOWARDS[tmp[0]] = FORWARD;
		tmp = MENUS[i]['move_unit'];
		UNITS[tmp[1]] = SECONDS;
		tmp = MENUS[i]['led_color'];
		COLORS[tmp[0]] = 4;
		COLORS[tmp[1]] = 4;
		COLORS[tmp[2]] = 6;
		COLORS[tmp[3]] = 2;
		COLORS[tmp[4]] = 3;
		COLORS[tmp[5]] = 1;
		COLORS[tmp[6]] = 5;
		COLORS[tmp[7]] = 5;
		COLORS[tmp[8]] = 7;
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
		SOUNDS[tmp[0]] = 1;
		tmp = MENUS[i]['mode'];
		MODES[tmp[0]] = 0;
		MODES[tmp[1]] = 1;
		MODES[tmp[2]] = 8;
		MODES[tmp[3]] = 9;
		MODES[tmp[4]] = 10;
		tmp = MENUS[i]['open_close'];
		VALUES[tmp[0]] = OPEN;
		VALUES[tmp[1]] = CLOSE;
		tmp = MENUS[i]['black_white'];
		VALUES[tmp[1]] = WHITE;
	}
	
	function removeTimeout(id) {
		clearTimeout(id);
		var idx = timeouts.indexOf(id);
		if(idx >= 0) {
			timeouts.splice(idx, 1);
		}
	}

	function removeAllTimeouts() {
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		timeouts = [];
	}
	
	function clearMotoring() {
		motoring.map = 0xfc000000;
	}
	
	function issueWheelId() {
		wheelId = blockId = (blockId % 65535) + 1;
		return wheelId;
	}
	
	function cancelWheel() {
		wheelId = 0;
		if(wheelTimer !== undefined) {
			removeTimeout(wheelTimer);
		}
		wheelTimer = undefined;
	}
	
	function setLineTracerMode(mode) {
		motoring.lineTracerMode = mode;
		motoring.map |= 0x00200000;
	}
	
	function setLineTracerSpeed(speed) {
		motoring.lineTracerSpeed = speed;
		motoring.map |= 0x00100000;
	}
	
	function cancelLineTracer() {
		lineTracerCallback = undefined;
	}
	
	function cancelBoard() {
		boardCommand = 0;
		boardState = 0;
		boardCount = 0;
		boardCallback = undefined;
	}
	
	function setLeftLed(color) {
		motoring.leftLed = color;
		motoring.map |= 0x01000000;
	}
	
	function setRightLed(color) {
		motoring.rightLed = color;
		motoring.map |= 0x00800000;
	}
	
	function setNote(note) {
		motoring.note = note;
		motoring.map |= 0x00400000;
	}
	
	function issueNoteId() {
		noteId = blockId = (blockId % 65535) + 1;
		return noteId;
	}
	
	function cancelNote() {
		noteId = 0;
		if(noteTimer1 !== undefined) {
			removeTimeout(noteTimer1);
		}
		if(noteTimer2 !== undefined) {
			removeTimeout(noteTimer2);
		}
		noteTimer1 = undefined;
		noteTimer2 = undefined;
	}

	function setIoModeA(mode) {
		motoring.ioModeA = mode;
		motoring.map |= 0x00080000;
	}
	
	function setIoModeB(mode) {
		motoring.ioModeB = mode;
		motoring.map |= 0x00040000;
	}
	
	function issueIoId() {
		ioId = blockId = (blockId % 65535) + 1;
		return ioId;
	}
	
	function cancelIo() {
		ioId = 0;
		if(ioTimer !== undefined) {
			removeTimeout(ioTimer);
		}
		ioTimer = undefined;
	}

	function reset() {
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
		
		blockId = 0;
		wheelId = 0;
		wheelTimer = undefined;
		lineTracerCallback = undefined;
		boardCommand = 0;
		boardState = 0;
		boardCount = 0;
		boardCallback = undefined;
		noteId = 0;
		noteTimer1 = undefined;
		noteTimer2 = undefined;
		ioId = 0;
		ioTimer = undefined;
		tempo = 60;
		removeAllTimeouts();
	}
	
	function handleLineTracer() {
		if(lineTracerCallback && (sensory.map & 0x00000010) != 0) {
			if(sensory.lineTracerState == 0x40) {
				setLineTracerMode(0);
				var callback = lineTracerCallback;
				cancelLineTracer();
				if(callback) callback();
			}
		}
	}
	
	function handleBoard() {
		if(boardCallback) {
			if(boardCommand == 1) {
				switch(boardState) {
					case 1: {
						if(boardCount < 2) {
							if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
								boardCount ++;
							else
								boardCount = 0;
							var diff = sensory.leftFloor - sensory.rightFloor;
							motoring.leftWheel = 45 + diff * 0.25;
							motoring.rightWheel = 45 - diff * 0.25;
						} else {
							boardCount = 0;
							boardState = 2;
						}
						break;
					}
					case 2: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						motoring.leftWheel = 45 + diff * 0.25;
						motoring.rightWheel = 45 - diff * 0.25;
						boardState = 3;
						wheelTimer = setTimeout(function() {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							boardState = 4;
							if(wheelTimer !== undefined) removeTimeout(wheelTimer);
							wheelTimer = undefined;
						}, 250);
						timeouts.push(wheelTimer);
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
						var callback = boardCallback;
						cancelBoard();
						if(callback) callback();
						break;
					}
				}
			} else if(boardCommand == 2) {
				switch(boardState) {
					case 1: {
						if(boardCount < 2) {
							if(sensory.leftFloor > 50)
								boardCount ++;
						} else {
							boardCount = 0;
							boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.leftFloor < 20) {
							boardState = 3;
						}
						break;
					}
					case 3: {
						if(boardCount < 2) {
							if(sensory.leftFloor < 20)
								boardCount ++;
						} else {
							boardCount = 0;
							boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.leftFloor > 50) {
							boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = boardCallback;
							cancelBoard();
							if(callback) callback();
						} else {
							motoring.leftWheel = diff * 0.5;
							motoring.rightWheel = -diff * 0.5;
						}
						break;
					}
				}
			} else if(boardCommand == 3) {
				switch(boardState) {
					case 1: {
						if(boardCount < 2) {
							if(sensory.rightFloor > 50)
								boardCount ++;
						} else {
							boardCount = 0;
							boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.rightFloor < 20) {
							boardState = 3;
						}
						break;
					}
					case 3: {
						if(boardCount < 2) {
							if(sensory.rightFloor < 20)
								boardCount ++;
						} else {
							boardCount = 0;
							boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.rightFloor > 50) {
							boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.rightFloor - sensory.leftFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = boardCallback;
							cancelBoard();
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
						if(data.module == 'hamster' && data.index == 0) {
							sensory = data;
							if(lineTracerCallback) handleLineTracer();
							if(boardCallback) handleBoard();
						}
					};
					sock.onmessage = function(message) {
						try {
							var received = JSON.parse(message.data);
							slaveVersion = received.version || 0;
							if(received.type == 0) {
								if(received.module == 'hamster') {
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
									var json;
									if(slaveVersion == 1) json = JSON.stringify(packet);
									else json = JSON.stringify(packet.robot);
									if(canSend && socket) socket.send(json);
									clearMotoring();
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
	
	function __board(leftVelocity, rightVelocity, command, callback) {
		cancelWheel();
		cancelLineTracer();
		
		motoring.leftWheel = leftVelocity;
		motoring.rightWheel = rightVelocity;
		motoring.motion = MOTION.NONE;
		boardCommand = command;
		boardCount = 0;
		boardState = 1;
		boardCallback = callback;
		setLineTracerMode(0);
	}

	ext.boardMoveForward = function(callback) {
		__board(45, 45, 1, callback);
	};

	ext.boardTurn = function(direction, callback) {
		if(DIRECTIONS[direction] === LEFT) {
			__board(-45, 45, 2, callback);
		} else {
			__board(45, -45, 3, callback);
		}
	};
	
	function __motion(type, leftVelocity, rightVelocity, secs, callback) {
		cancelBoard();
		cancelWheel();
		cancelLineTracer();
		
		secs = parseFloat(secs);
		if(secs && secs > 0) {
			var id = issueWheelId();
			motoring.leftWheel = leftVelocity;
			motoring.rightWheel = rightVelocity;
			motoring.motion = type;
			setLineTracerMode(0);
			wheelTimer = setTimeout(function() {
				if(wheelId == id) {
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					motoring.motion = MOTION.NONE;
					cancelWheel();
					callback();
				}
			}, secs * 1000);
			timeouts.push(wheelTimer);
		} else {
			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			motoring.motion = MOTION.NONE;
			setLineTracerMode(0);
			callback();
		}
	}
	
	ext.moveForward = function(callback) {
		__motion(MOTION.FORWAR, 30, 30, 1, callback);
	};
	
	ext.moveBackward = function(callback) {
		__motion(MOTION.BACKWARD, -30, -30, 1, callback);
	};
	
	ext.turn = function(direction, callback) {
		if(DIRECTIONS[direction] === LEFT) {
			__motion(MOTION.LEFT, -30, 30, 1, callback);
		} else {
			__motion(MOTION.RIGHT, 30, -30, 1, callback);
		}
	};

	ext.moveForwardForSecs = function(secs, callback) {
		__motion(MOTION.FORWARD, 30, 30, secs, callback);
	};

	ext.moveBackwardForSecs = function(secs, callback) {
		__motion(MOTION.BACKWARD, -30, -30, secs, callback);
	};

	ext.turnForSecs = function(direction, secs, callback) {
		if(DIRECTIONS[direction] === LEFT) {
			__motion(MOTION.LEFT, -30, 30, secs, callback);
		else {
			__motion(MOTION.RIGHT, 30, -30, secs, callback);
		}
	};
	
	ext.changeBothWheelsBy = function(left, right) {
		cancelBoard();
		cancelWheel();
		cancelLineTracer();
		
		left = parseFloat(left);
		right = parseFloat(right);
		if(typeof left == 'number') {
			motoring.leftWheel += left;
		}
		if(typeof right == 'number') {
			motoring.rightWheel += right;
		}
		motoring.motion = MOTION.NONE;
		setLineTracerMode(0);
	};

	ext.setBothWheelsTo = function(left, right) {
		cancelBoard();
		cancelWheel();
		cancelLineTracer();
		
		left = parseFloat(left);
		right = parseFloat(right);
		if(typeof left == 'number') {
			motoring.leftWheel = left;
		}
		if(typeof right == 'number') {
			motoring.rightWheel = right;
		}
		motoring.motion = MOTION.NONE;
		setLineTracerMode(0);
	};

	ext.changeWheelBy = function(which, speed) {
		cancelBoard();
		cancelWheel();
		cancelLineTracer();
		
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
		setLineTracerMode(0);
	};

	ext.setWheelTo = function(which, speed) {
		cancelBoard();
		cancelWheel();
		cancelLineTracer();
		
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
		setLineTracerMode(0);
	};

	ext.followLineUsingFloorSensor = function(color, which) {
		cancelBoard();
		cancelWheel();
		cancelLineTracer();
		
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
		setLineTracerMode(mode);
	};

	ext.followLineUntilIntersection = function(color, which, callback) {
		cancelBoard();
		cancelWheel();
		
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
		setLineTracerMode(mode);
		lineTracerCallback = callback;
	};

	ext.setFollowingSpeedTo = function(speed) {
		speed = parseInt(speed);
		if(typeof speed == 'number') {
			setLineTracerSpeed(speed);
		}
	};

	ext.stop = function() {
		cancelBoard();
		cancelWheel();
		cancelLineTracer();
		
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = MOTION.NONE;
		setLineTracerMode(0);
	};

	ext.setLedTo = function(which, color) {
		color = COLORS[color];
		if(color && color > 0) {
			which = VALUES[which];
			if(which === LEFT) {
				setLeftLed(color);
			} else if(which === RIGHT) {
				setRightLed(color);
			} else {
				setLeftLed(color);
				setRightLed(color);
			}
		}
	};

	ext.clearLed = function(which) {
		which = VALUES[which];
		if(which === LEFT) {
			setLeftLed(0);
		} else if(which === RIGHT) {
			setRightLed(0);
		} else {
			setLeftLed(0);
			setRightLed(0);
		}
	};

	ext.beep = function(callback) {
		cancelNote();
		var id = issueNoteId();
		motoring.buzzer = 440;
		setNote(0);
		noteTimer1 = setTimeout(function() {
			if(noteId == id) {
				motoring.buzzer = 0;
				cancelNote();
				callback();
			}
		}, 200);
		timeouts.push(noteTimer1);
	};

	ext.changeBuzzerBy = function(value) {
		cancelNote();
		var buzzer = parseFloat(value);
		if(typeof buzzer == 'number') {
			motoring.buzzer += buzzer;
		}
		setNote(0);
	};

	ext.setBuzzerTo = function(value) {
		cancelNote();
		var buzzer = parseFloat(value);
		if(typeof buzzer == 'number') {
			motoring.buzzer = buzzer;
		}
		setNote(0);
	};

	ext.clearBuzzer = function() {
		cancelNote();
		motoring.buzzer = 0;
		setNote(0);
	};
	
	ext.playNoteFor = function(note, octave, beat, callback) {
		cancelNote();
		note = NOTES[note];
		octave = parseInt(octave);
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && tempo > 0) {
			var id = issueNoteId();
			note += (octave - 1) * 12;
			setNote(note);
			var timeout = beat * 60 * 1000 / tempo;
			var tail = 0;
			if(timeout > 100) {
				tail = 100;
			}
			if(tail > 0) {
				noteTimer1 = setTimeout(function() {
					if(noteId == id) {
						setNote(0);
						if(noteTimer1 !== undefined) removeTimeout(noteTimer1);
						noteTimer1 = undefined;
					}
				}, timeout - tail);
				timeouts.push(noteTimer1);
			}
			noteTimer2 = setTimeout(function() {
				if(noteId == id) {
					setNote(0);
					cancelNote();
					callback();
				}
			}, timeout);
			timeouts.push(noteTimer2);
		} else {
			setNote(0);
			callback();
		}
	};

	ext.restFor = function(beat, callback) {
		cancelNote();
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		setNote(0);
		if(beat && beat > 0 && tempo > 0) {
			var id = issueNoteId();
			noteTimer1 = setTimeout(function() {
				if(noteId == id) {
					cancelNote();
					callback();
				}
			}, beat * 60 * 1000 / tempo);
			timeouts.push(noteTimer1);
		} else {
			callback();
		}
	};

	ext.changeTempoBy = function(value) {
		value = parseFloat(value);
		if(typeof value == 'number') {
			tempo += value;
			if(tempo < 1) tempo = 1;
		}
	};

	ext.setTempoTo = function(value) {
		value = parseFloat(value);
		if(typeof value == 'number') {
			tempo = value;
			if(tempo < 1) tempo = 1;
		}
	};

	ext.leftProximity = function() {
		return sensory.leftProximity;
	};

	ext.rightProximity = function() {
		return sensory.rightProximity;
	};

	ext.leftFloor = function() {
		return sensory.leftFloor;
	};

	ext.rightFloor = function() {
		return sensory.rightFloor;
	};

	ext.accelerationX = function() {
		return sensory.accelerationX;
	};

	ext.accelerationY = function() {
		return sensory.accelerationY;
	};

	ext.accelerationZ = function() {
		return sensory.accelerationZ;
	};

	ext.light = function() {
		return sensory.light;
	};

	ext.temperature = function() {
		return sensory.temperature;
	};

	ext.signalStrength = function() {
		return sensory.signalStrength;
	};

	ext.handFound = function() {
		return (sensory.handFound === undefined) ? (sensory.leftProximity > 50 || sensory.rightProximity > 50) : sensory.handFound;
	};

	ext.setPortTo = function(port, mode) {
		cancelIo();
		mode = MODES[mode];
		if(typeof mode == 'number') {
			if(port == 'A') {
				setIoModeA(mode);
			} else if(port == 'B') {
				setIoModeB(mode);
			} else {
				setIoModeA(mode);
				setIoModeB(mode);
			}
		}
	};

	ext.changeOutputBy = function(port, value) {
		cancelIo();
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

	ext.setOutputTo = function(port, value) {
		cancelIo();
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
	
	ext.gripper = function(action, callback) {
		cancelIo();
		
		var id = issueIoId();
		setIoModeA(10);
		setIoModeB(10);
		action = VALUES[action];
		if(action == OPEN) {
			motoring.outputA = 1;
			motoring.outputB = 0;
		} else {
			motoring.outputA = 0;
			motoring.outputB = 1;
		}
		ioTimer = setTimeout(function() {
			if(ioId == id) {
				cancelIo();
				callback();
			}
		}, 500);
		timeouts.push(ioTimer);
	};
	
	ext.releaseGripper = function() {
		cancelIo();
		setIoModeA(10);
		setIoModeB(10);
		motoring.outputA = 0;
		motoring.outputB = 0;
	};

	ext.inputA = function() {
		return sensory.inputA;
	};

	ext.inputB = function() {
		return sensory.inputB;
	};
	
	ext._getStatus = function() {
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
