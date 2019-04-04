(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const MOTION = {
		NONE: 0,
		FORWARD: 1,
		BACKWARD: 2,
		LEFT: 3,
		RIGHT: 4
	};
	const SPEED2GAINS = { 1: 7, 2: 6, 3: 6, 4: 5, 5: 4, 6: 3, 7: 3, 8: 2 };
	const LED2RGB = {
		0: [0, 0, 0],
		1: [0, 0, 255],
		2: [0, 255, 0],
		3: [0, 255, 255],
		4: [255, 0, 0],
		5: [255, 0, 255],
		6: [255, 255, 0],
		7: [255, 255, 255]
	};
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
	var IO_MODES = {};
	var GRIPPERS = {};
	var TILTS = {};
	var BATTERY_STATES = {};
	var VALUES = {};
	const LEFT = 1;
	const RIGHT = 2;
	const BOTH = 3;
	const FRONT = 4;
	const REAR = 5;
	const FORWARD = 1;
	const SECONDS = 1;
	const BEEP = 1;
	const OPEN = 1;
	const CLOSE = 2;
	const WHITE = 1;
	const TILT_FORWARD = 1;
	const TILT_BACKWARD = 2;
	const TILT_LEFT = 3;
	const TILT_RIGHT = 4;
	const TILT_UPSIDEDOWN = 5;
	const TILT_NORMAL = 6;
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
		tmp = MENUS[i]['color'];
		COLORS[tmp[0]] = 4;
		COLORS[tmp[1]] = 6;
		COLORS[tmp[2]] = 2;
		COLORS[tmp[3]] = 3;
		COLORS[tmp[4]] = 1;
		COLORS[tmp[5]] = 5;
		COLORS[tmp[6]] = 7;
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
		SOUNDS[tmp[0]] = BEEP;
		tmp = MENUS[i]['mode'];
		IO_MODES[tmp[0]] = 0;
		IO_MODES[tmp[1]] = 1;
		IO_MODES[tmp[2]] = 8;
		IO_MODES[tmp[3]] = 9;
		IO_MODES[tmp[4]] = 10;
		tmp = MENUS[i]['open_close'];
		GRIPPERS[tmp[0]] = OPEN;
		GRIPPERS[tmp[1]] = CLOSE;
		tmp = MENUS[i]['tilt'];
		TILTS[tmp[0]] = TILT_FORWARD;
		TILTS[tmp[1]] = TILT_BACKWARD;
		TILTS[tmp[2]] = TILT_LEFT;
		TILTS[tmp[3]] = TILT_RIGHT;
		TILTS[tmp[4]] = TILT_UPSIDEDOWN;
		TILTS[tmp[5]] = TILT_NORMAL;
		tmp = MENUS[i]['battery'];
		BATTERY_STATES[tmp[0]] = 2;
		BATTERY_STATES[tmp[1]] = 1;
		BATTERY_STATES[tmp[2]] = 0;
		tmp = MENUS[i]['black_white'];
		VALUES[tmp[1]] = WHITE;
	}
	
	function createHamster(index) {
		var robot = {};
		robot.sensory = {
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
		robot.motoring = {
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
		robot.blockId = 0;
		robot.wheelId = 0;
		robot.wheelTimer = undefined;
		robot.lineTracerCallback = undefined;
		robot.boardCommand = 0;
		robot.boardState = 0;
		robot.boardCount = 0;
		robot.boardCallback = undefined;
		robot.noteId = 0;
		robot.noteTimer1 = undefined;
		robot.noteTimer2 = undefined;
		robot.ioId = 0;
		robot.ioTimer = undefined;
		robot.tempo = 60;
		robot.timeouts = [];
		robot.reset = function() {
			var motoring = robot.motoring;
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

			robot.blockId = 0;
			robot.wheelId = 0;
			robot.wheelTimer = undefined;
			robot.lineTracerCallback = undefined;
			robot.boardCommand = 0;
			robot.boardState = 0;
			robot.boardCount = 0;
			robot.boardCallback = undefined;
			robot.noteId = 0;
			robot.noteTimer1 = undefined;
			robot.noteTimer2 = undefined;
			robot.ioId = 0;
			robot.ioTimer = undefined;
			robot.tempo = 60;

			robot.__removeAllTimeouts();
		};
		robot.__removeTimeout = function(id) {
			clearTimeout(id);
			var idx = robot.timeouts.indexOf(id);
			if(idx >= 0) {
				robot.timeouts.splice(idx, 1);
			}
		};
		robot.__removeAllTimeouts = function() {
			var timeouts = robot.timeouts;
			for(var i in timeouts) {
				clearTimeout(timeouts[i]);
			}
			robot.timeouts = [];
		};
		robot.clearMotoring = function() {
			robot.motoring.map = 0xfc000000;
		};
		robot.clearEvent = function() {
		};
		robot.__issueWheelId = function() {
			robot.wheelId = robot.blockId = (robot.blockId % 65535) + 1;
			return robot.wheelId;
		};
		robot.__cancelWheel = function() {
			robot.wheelId = 0;
			if(robot.wheelTimer !== undefined) {
				robot.__removeTimeout(robot.wheelTimer);
			}
			robot.wheelTimer = undefined;
		};
		robot.__setLineTracerMode = function(mode) {
			robot.motoring.lineTracerMode = mode;
			robot.motoring.map |= 0x00200000;
		};
		robot.__setLineTracerSpeed = function(speed) {
			robot.motoring.lineTracerSpeed = speed;
			robot.motoring.map |= 0x00100000;
		};
		robot.__cancelLineTracer = function() {
			robot.lineTracerCallback = undefined;
		};
		robot.__cancelBoard = function() {
			robot.boardCommand = 0;
			robot.boardState = 0;
			robot.boardCount = 0;
			robot.boardCallback = undefined;
		};
		robot.__setLeftLed = function(color) {
			robot.motoring.leftLed = color;
			robot.motoring.map |= 0x01000000;
		};
		robot.__setRightLed = function(color) {
			robot.motoring.rightLed = color;
			robot.motoring.map |= 0x00800000;
		};
		robot.__setNote = function(note) {
			robot.motoring.note = note;
			robot.motoring.map |= 0x00400000;
		};
		robot.__issueNoteId = function() {
			robot.noteId = robot.blockId = (robot.blockId % 65535) + 1;
			return robot.noteId;
		};
		robot.__cancelNote = function() {
			robot.noteId = 0;
			if(robot.noteTimer1 !== undefined) {
				robot.__removeTimeout(robot.noteTimer1);
			}
			if(robot.noteTimer2 !== undefined) {
				robot.__removeTimeout(robot.noteTimer2);
			}
			robot.noteTimer1 = undefined;
			robot.noteTimer2 = undefined;
		};
		robot.__setIoModeA = function(mode) {
			robot.motoring.ioModeA = mode;
			robot.motoring.map |= 0x00080000;
		};
		robot.__setIoModeB = function(mode) {
			robot.motoring.ioModeB = mode;
			robot.motoring.map |= 0x00040000;
		};
		robot.__issueIoId = function() {
			robot.ioId = robot.blockId = (robot.blockId % 65535) + 1;
			return robot.ioId;
		};
		robot.__cancelIo = function() {
			robot.ioId = 0;
			if(robot.ioTimer !== undefined) {
				robot.__removeTimeout(robot.ioTimer);
			}
			robot.ioTimer = undefined;
		};
		robot.handleSensory = function() {
			var sensory = robot.sensory;
			if(robot.lineTracerCallback && (sensory.map & 0x00000010) != 0) {
				if(sensory.lineTracerState == 0x40) {
					robot.__setLineTracerMode(0);
					var callback = robot.lineTracerCallback;
					robot.__cancelLineTracer();
					if(callback) callback();
				}
			}
			if(robot.boardCallback) {
				var motoring = robot.motoring;
				if(robot.boardCommand == 1) {
					switch(robot.boardState) {
						case 1: {
							if(robot.boardCount < 2) {
								if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
									robot.boardCount ++;
								else
									robot.boardCount = 0;
								var diff = sensory.leftFloor - sensory.rightFloor;
								motoring.leftWheel = 45 + diff * 0.25;
								motoring.rightWheel = 45 - diff * 0.25;
							} else {
								robot.boardCount = 0;
								robot.boardState = 2;
							}
							break;
						}
						case 2: {
							var diff = sensory.leftFloor - sensory.rightFloor;
							motoring.leftWheel = 45 + diff * 0.25;
							motoring.rightWheel = 45 - diff * 0.25;
							robot.boardState = 3;
							robot.wheelTimer = setTimeout(function() {
								motoring.leftWheel = 0;
								motoring.rightWheel = 0;
								robot.boardState = 4;
								if(robot.wheelTimer !== undefined) robot.__removeTimeout(robot.wheelTimer);
								robot.wheelTimer = undefined;
							}, 250);
							robot.timeouts.push(robot.wheelTimer);
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
							var callback = robot.boardCallback;
							robot.__cancelBoard();
							if(callback) callback();
							break;
						}
					}
				} else if(robot.boardCommand == 2) {
					switch(robot.boardState) {
						case 1: {
							if(robot.boardCount < 2) {
								if(sensory.leftFloor > 50)
									robot.boardCount ++;
							} else {
								robot.boardCount = 0;
								robot.boardState = 2;
							}
							break;
						}
						case 2: {
							if(sensory.leftFloor < 20) {
								robot.boardState = 3;
							}
							break;
						}
						case 3: {
							if(robot.boardCount < 2) {
								if(sensory.leftFloor < 20)
									robot.boardCount ++;
							} else {
								robot.boardCount = 0;
								robot.boardState = 4;
							}
							break;
						}
						case 4: {
							if(sensory.leftFloor > 50) {
								robot.boardState = 5;
							}
							break;
						}
						case 5: {
							var diff = sensory.leftFloor - sensory.rightFloor;
							if(diff > -15) {
								motoring.leftWheel = 0;
								motoring.rightWheel = 0;
								var callback = robot.boardCallback;
								robot.__cancelBoard();
								if(callback) callback();
							} else {
								motoring.leftWheel = diff * 0.5;
								motoring.rightWheel = -diff * 0.5;
							}
							break;
						}
					}
				} else if(robot.boardCommand == 3) {
					switch(robot.boardState) {
						case 1: {
							if(robot.boardCount < 2) {
								if(sensory.rightFloor > 50)
									robot.boardCount ++;
							} else {
								robot.boardCount = 0;
								robot.boardState = 2;
							}
							break;
						}
						case 2: {
							if(sensory.rightFloor < 20) {
								robot.boardState = 3;
							}
							break;
						}
						case 3: {
							if(robot.boardCount < 2) {
								if(sensory.rightFloor < 20)
									robot.boardCount ++;
							} else {
								robot.boardCount = 0;
								robot.boardState = 4;
							}
							break;
						}
						case 4: {
							if(sensory.rightFloor > 50) {
								robot.boardState = 5;
							}
							break;
						}
						case 5: {
							var diff = sensory.rightFloor - sensory.leftFloor;
							if(diff > -15) {
								motoring.leftWheel = 0;
								motoring.rightWheel = 0;
								var callback = robot.boardCallback;
								robot.__cancelBoard();
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
		robot.__board = function(leftVelocity, rightVelocity, command, callback) {
			var motoring = robot.motoring;
			robot.__cancelWheel();
			robot.__cancelLineTracer();

			motoring.leftWheel = leftVelocity;
			motoring.rightWheel = rightVelocity;
			motoring.motion = 0;
			robot.boardCommand = command;
			robot.boardCount = 0;
			robot.boardState = 1;
			robot.boardCallback = callback;
			robot.__setLineTracerMode(0);
		};
		robot.boardForward = function(callback) {
			robot.__board(45, 45, 1, callback);
		};
		robot.boardTurn = function(direction, callback) {
			if(DIRECTIONS[direction] == LEFT) {
				robot.__board(-45, 45, 2, callback);
			} else {
				robot.__board(45, -45, 3, callback);
			}
		};
		robot.__motion = function(type, leftVelocity, rightVelocity, secs, callback) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelWheel();
			robot.__cancelLineTracer();

			secs = parseFloat(secs);
			if(secs && secs > 0) {
				var id = robot.__issueWheelId();
				motoring.leftWheel = leftVelocity;
				motoring.rightWheel = rightVelocity;
				motoring.motion = type;
				robot.__setLineTracerMode(0);
				robot.wheelTimer = setTimeout(function() {
					if(robot.wheelId == id) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						motoring.motion = 0;
						robot.__cancelWheel();
						callback();
					}
				}, secs * 1000);
				robot.timeouts.push(robot.wheelTimer);
			} else {
				motoring.leftWheel = 0;
				motoring.rightWheel = 0;
				motoring.motion = 0;
				robot.__setLineTracerMode(0);
				callback();
			}
		};
		robot.moveForward = function(callback) {
			robot.__motion(1, 30, 30, 1, callback);
		};
		robot.moveBackward = function(callback) {
			robot.__motion(2, -30, -30, 1, callback);
		};
		robot.turn = function(direction, callback) {
			if(DIRECTIONS[direction] == LEFT) {
				robot.__motion(3, -30, 30, 1, callback);
			} else {
				robot.__motion(4, 30, -30, 1, callback);
			}
		};
		robot.moveForwardSecs = function(secs, callback) {
			robot.__motion(1, 30, 30, secs, callback);
		};
		robot.moveBackwardSecs = function(secs, callback) {
			robot.__motion(2, -30, -30, secs, callback);
		};
		robot.turnSecs = function(direction, secs, callback) {
			if(DIRECTIONS[direction] == LEFT) {
				robot.__motion(3, -30, 30, secs, callback);
			} else {
				robot.__motion(4, 30, -30, secs, callback);
			}
		};
		robot.moveForwardUnit = function(value, unit, callback) {
			if(UNITS[unit] == SECONDS) {
				robot.moveForwardSecs(value, callback);
			}
		};
		robot.moveBackwardUnit = function(value, unit, callback) {
			if(UNITS[unit] == SECONDS) {
				robot.moveBackwardSecs(value, callback);
			}
		};
		robot.turnUnit = function(direction, value, unit, callback) {
			if(UNITS[unit] == SECONDS) {
				robot.turnSecs(direction, value, callback);
			}
		};
		robot.pivotUnit = function(wheel, value, unit, toward, callback) {
			if(UNITS[unit] == SECONDS) {
				if(PARTS[wheel] == LEFT) {
					if(TOWARDS[toward] == FORWARD) {
						robot.__motion(5, 0, 30, value, callback);
					} else {
						robot.__motion(6, 0, -30, value, callback);
					}
				} else {
					if(TOWARDS[toward] == FORWARD) {
						robot.__motion(7, 30, 0, value, callback);
					} else {
						robot.__motion(8, -30, 0, value, callback);
					}
				}
			}
		};
		robot.swingUnit = function(wheel, value, unit, radius, toward, callback) {
			if(UNITS[unit] == SECONDS) {
				robot.motoring.radius = radius;
				if(PARTS[wheel] == LEFT) {
					if(TOWARDS[toward] == FORWARD) {
						robot.__motion(9, 0, 0, value, callback);
					} else {
						robot.__motion(10, 0, 0, value, callback);
					}
				} else {
					if(TOWARDS[toward] == FORWARD) {
						robot.__motion(11, 0, 0, value, callback);
					} else {
						robot.__motion(12, 0, 0, value, callback);
					}
				}
			}
		};
		robot.penUnit = function(pen, value, unit, toward, callback) {
			if(UNITS[unit] == SECONDS) {
				if(PARTS[pen] == LEFT) {
					if(TOWARDS[toward] == FORWARD) {
						robot.__motion(13, 0, 0, value, callback);
					} else {
						robot.__motion(14, 0, 0, value, callback);
					}
				} else {
					if(TOWARDS[toward] == FORWARD) {
						robot.__motion(15, 0, 0, value, callback);
					} else {
						robot.__motion(16, 0, 0, value, callback);
					}
				}
			}
		};
		robot.setWheels = function(leftVelocity, rightVelocity) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelWheel();
			robot.__cancelLineTracer();

			leftVelocity = parseFloat(leftVelocity);
			rightVelocity = parseFloat(rightVelocity);
			if(typeof leftVelocity == 'number') {
				motoring.leftWheel = leftVelocity;
			}
			if(typeof rightVelocity == 'number') {
				motoring.rightWheel = rightVelocity;
			}
			motoring.motion = 0;
			robot.__setLineTracerMode(0);
		};
		robot.changeWheels = function(leftVelocity, rightVelocity) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelWheel();
			robot.__cancelLineTracer();

			leftVelocity = parseFloat(leftVelocity);
			rightVelocity = parseFloat(rightVelocity);
			if(typeof leftVelocity == 'number') {
				motoring.leftWheel += leftVelocity;
			}
			if(typeof rightVelocity == 'number') {
				motoring.rightWheel += rightVelocity;
			}
			motoring.motion = 0;
			robot.__setLineTracerMode(0);
		};
		robot.setWheel = function(wheel, velocity) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelWheel();
			robot.__cancelLineTracer();

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
			robot.__setLineTracerMode(0);
		};
		robot.changeWheel = function(wheel, velocity) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelWheel();
			robot.__cancelLineTracer();

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
			robot.__setLineTracerMode(0);
		};
		robot.followLine = function(color, sensor) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelWheel();
			robot.__cancelLineTracer();

			var mode = 1;
			sensor = PARTS[sensor];
			if(sensor == RIGHT) mode = 2;
			else if(sensor == BOTH) mode = 3;
			if(VALUES[color] == WHITE) mode += 7;

			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			motoring.motion = 0;
			robot.__setLineTracerMode(mode);
		};
		robot.followLineUntil = function(color, direction, callback) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelWheel();

			var mode = 4;
			direction = DIRECTIONS[direction];
			if(direction == RIGHT) mode = 5;
			else if(direction == FRONT) mode = 6;
			else if(direction == REAR) mode = 7;
			if(VALUES[color] == WHITE) mode += 7;

			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			motoring.motion = 0;
			robot.__setLineTracerMode(mode);
			robot.lineTracerCallback = callback;
		};
		robot.setLineTracerSpeed = function(speed) {
			speed = parseInt(speed);
			if(typeof speed == 'number') {
				robot.__setLineTracerSpeed(speed);
			}
		};
		robot.stop = function() {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelWheel();
			robot.__cancelLineTracer();

			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			motoring.motion = 0;
			robot.__setLineTracerMode(0);
		};
		robot.setLed = function(led, color) {
			color = COLORS[color];
			if(color && color > 0) {
				led = PARTS[led];
				if(led == LEFT) {
					robot.__setLeftLed(color);
				} else if(led == RIGHT) {
					robot.__setRightLed(color);
				} else {
					robot.__setLeftLed(color);
					robot.__setRightLed(color);
				}
			}
		};
		robot.clearLed = function(led) {
			led = PARTS[led];
			if(led == LEFT) {
				robot.__setLeftLed(0);
			} else if(led == RIGHT) {
				robot.__setRightLed(0);
			} else {
				robot.__setLeftLed(0);
				robot.__setRightLed(0);
			}
		};
		robot.setRgbArray = function(led, rgb) {
		};
		robot.setRgb = function(led, red, green, blue) {
		};
		robot.changeRgb = function(led, red, green, blue) {
		};
		robot.runBeep = function(count, id, callback) {
			if(count) {
				var motoring = robot.motoring;
				motoring.buzzer = 440;
				robot.__setNote(0);
				robot.noteTimer1 = setTimeout(function() {
					if(!id || robot.noteId == id) {
						motoring.buzzer = 0;
						if(robot.noteTimer1 !== undefined) robot.removeTimeout(robot.noteTimer1);
						robot.noteTimer1 = undefined;
					}
				}, 100);
				robot.timeouts.push(robot.noteTimer1);
				robot.noteTimer2 = setTimeout(function() {
					if(!id || robot.noteId == id) {
						motoring.buzzer = 0;
						if(robot.noteTimer2 !== undefined) robot.removeTimeout(robot.noteTimer2);
						robot.noteTimer2 = undefined;
						if(count < 0) {
							robot.runBeep(-1, id);
						} else if(count == 1) {
							robot.__cancelNote();
							if(id && callback) callback();
						} else {
							robot.runBeep(count - 1, id);
						}
					}
				}, 200);
				robot.timeouts.push(robot.noteTimer2);
			}
		};
		robot.beep = function(callback) {
			robot.__cancelNote();
			var id = robot.__issueNoteId();
			robot.runBeep(1, id, callback);
		};
		robot.playSound = function(sound, count) {
			robot.__cancelNote();
			robot.motoring.buzzer = 0;
			robot.__setNote(0);
			if(SOUNDS[sound] == BEEP && count) {
				robot.runBeep(count);
			}
		};
		robot.playSoundUntil = function(sound, count, callback) {
			robot.__cancelNote();
			robot.motoring.buzzer = 0;
			robot.__setNote(0);
			if(SOUNDS[sound] == BEEP && count) {
				var id = robot.__issueNoteId();
				robot.runBeep(count, id, callback);
			}
		};
		robot.setBuzzer = function(hz) {
			var motoring = robot.motoring;
			robot.__cancelNote();

			hz = parseFloat(hz);
			if(typeof hz == 'number') {
				motoring.buzzer = hz;
			}
			robot.__setNote(0);
		};
		robot.changeBuzzer = function(hz) {
			var motoring = robot.motoring;
			robot.__cancelNote();

			hz = parseFloat(hz);
			if(typeof hz == 'number') {
				motoring.buzzer += hz;
			}
			robot.__setNote(0);
		};
		robot.clearBuzzer = function() {
			robot.__cancelNote();
			robot.motoring.buzzer = 0;
			robot.__setNote(0);
		};
		robot.clearSound = function() {
			robot.clearBuzzer();
		};
		robot.playNote = function(note, octave) {
			var motoring = robot.motoring;
			robot.__cancelNote();

			note = NOTES[note];
			octave = parseInt(octave);
			motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8) {
				note += (octave - 1) * 12;
				robot.__setNote(note);
			} else {
				robot.__setNote(0);
			}
		};
		robot.playNoteBeat = function(note, octave, beat, callback) {
			var motoring = robot.motoring;
			robot.__cancelNote();

			note = NOTES[note];
			octave = parseInt(octave);
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && robot.tempo > 0) {
				var id = robot.__issueNoteId();
				note += (octave - 1) * 12;
				robot.__setNote(note);
				var timeout = beat * 60 * 1000 / robot.tempo;
				var tail = (timeout > 100) ? 100 : 0;
				if(tail > 0) {
					robot.noteTimer1 = setTimeout(function() {
						if(robot.noteId == id) {
							robot.__setNote(0);
							if(robot.noteTimer1 !== undefined) robot.__removeTimeout(robot.noteTimer1);
							robot.noteTimer1 = undefined;
						}
					}, timeout - tail);
					robot.timeouts.push(robot.noteTimer1);
				}
				robot.noteTimer2 = setTimeout(function() {
					if(robot.noteId == id) {
						robot.__setNote(0);
						robot.__cancelNote();
						callback();
					}
				}, timeout);
				robot.timeouts.push(robot.noteTimer2);
			} else {
				robot.__setNote(0);
				callback();
			}
		};
		robot.restBeat = function(beat, callback) {
			var motoring = robot.motoring;
			robot.__cancelNote();

			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
			robot.__setNote(0);
			if(beat && beat > 0 && robot.tempo > 0) {
				var id = robot.__issueNoteId();
				robot.noteTimer1 = setTimeout(function() {
					if(robot.noteId == id) {
						robot.__cancelNote();
						callback();
					}
				}, beat * 60 * 1000 / robot.tempo);
				robot.timeouts.push(robot.noteTimer1);
			} else {
				callback();
			}
		};
		robot.setTempo = function(bpm) {
			bpm = parseFloat(bpm);
			if(typeof bpm == 'number') {
				robot.tempo = bpm;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		};
		robot.changeTempo = function(bpm) {
			bpm = parseFloat(bpm);
			if(typeof bpm == 'number') {
				robot.tempo += bpm;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		};
		robot.getLeftProximity = function() {
			return robot.sensory.leftProximity;
		};
		robot.getRightProximity = function() {
			return robot.sensory.rightProximity;
		};
		robot.getLeftFloor = function() {
			return robot.sensory.leftFloor;
		};
		robot.getRightFloor = function() {
			return robot.sensory.rightFloor;
		};
		robot.getAccelerationX = function() {
			return robot.sensory.accelerationX;
		};
		robot.getAccelerationY = function() {
			return robot.sensory.accelerationY;
		};
		robot.getAccelerationZ = function() {
			return robot.sensory.accelerationZ;
		};
		robot.getLight = function() {
			return robot.sensory.light;
		};
		robot.getTemperature = function() {
			return robot.sensory.temperature;
		};
		robot.getSignalStrength = function() {
			return robot.sensory.signalStrength;
		};
		robot.checkHandFound = function() {
			var sensory = robot.sensory;
			return (sensory.handFound === undefined) ? (sensory.leftProximity > 50 || sensory.rightProximity > 50) : sensory.handFound;
		};
		robot.checkTilt = function(tilt) {
			switch(TILTS[tilt]) {
				case TILT_FORWARD: return robot.sensory.tilt == 1;
				case TILT_BACKWARD: return robot.sensory.tilt == -1;
				case TILT_LEFT: return robot.sensory.tilt == 2;
				case TILT_RIGHT: return robot.sensory.tilt == -2;
				case TILT_UPSIDEDOWN: return robot.sensory.tilt == 3;
				case TILT_NORMAL: return robot.sensory.tilt == -3;
			}
			return false;
		};
		robot.checkBattery = function(battery) {
			return robot.sensory.batteryState == BATTERY_STATES[battery];
		};
		robot.setIoMode = function(port, mode) {
			robot.__cancelIo();
			mode = IO_MODES[mode];
			if(typeof mode == 'number') {
				if(port == 'A') {
					robot.__setIoModeA(mode);
				} else if(port == 'B') {
					robot.__setIoModeB(mode);
				} else {
					robot.__setIoModeA(mode);
					robot.__setIoModeB(mode);
				}
			}
		};
		robot.setOutput = function(port, value) {
			var motoring = robot.motoring;
			robot.__cancelIo();
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
		robot.changeOutput = function(port, value) {
			var motoring = robot.motoring;
			robot.__cancelIo();
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
		robot.gripper = function(action, callback) {
			var motoring = robot.motoring;
			robot.__cancelIo();

			var id = robot.__issueIoId();
			robot.__setIoModeA(10);
			robot.__setIoModeB(10);
			if(GRIPPERS[action] == OPEN) {
				motoring.outputA = 1;
				motoring.outputB = 0;
			} else {
				motoring.outputA = 0;
				motoring.outputB = 1;
			}
			robot.ioTimer = setTimeout(function() {
				if(robot.ioId == id) {
					robot.__cancelIo();
					callback();
				}
			}, 500);
			robot.timeouts.push(robot.ioTimer);
		};
		robot.releaseGripper = function() {
			var motoring = robot.motoring;
			robot.__cancelIo();
			robot.__setIoModeA(10);
			robot.__setIoModeB(10);
			motoring.outputA = 0;
			motoring.outputB = 0;
		};
		robot.getInputA = function() {
			return robot.sensory.inputA;
		};
		robot.getInputB = function() {
			return robot.sensory.inputB;
		};
		robot.writeSerial = function(mode, text, callback) {
			robot.__cancelIo();
		};
		robot.readSerial = function(callback) {
			robot.__cancelIo();
		};
		robot.readSerialUltil = function(delimiter, callback) {
			robot.__cancelIo();
		};
		robot.setSerialRate = function(baud) {
			robot.__cancelIo();
		};
		robot.getSerialInput = function() {
			return '';
		};
	}
	
	function createHamsterS(index) {
		var robot = {};
		robot.sensory = {
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
		robot.motoring = {
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
		robot.blockId = 0;
		robot.motionCallback = undefined;
		robot.lineTracerCallback = undefined;
		robot.boardCommand = 0;
		robot.boardState = 0;
		robot.boardCount = 0;
		robot.boardCallback = undefined;
		robot.currentSound = 0;
		robot.soundRepeat = 1;
		robot.soundCallback = undefined;
		robot.noteId = 0;
		robot.noteTimer1 = undefined;
		robot.noteTimer2 = undefined;
		robot.ioId = 0;
		robot.ioTimer = undefined;
		robot.serialDelimiter = 0;
		robot.serialRate = 176;
		robot.writeSerialCallbacks = [];
		robot.readSerialCallbacks = [];
		robot.freeFall = false;
		robot.tap = false;
		robot.tempo = 60;
		//robot.writeQueue = new WriteQueue(64);
		//robot.readQueue = new ReadQueue(64);
		robot.timeouts = [];
		robot.reset = function() {
			var motoring = robot.motoring;
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

			robot.blockId = 0;
			robot.motionCallback = undefined;
			robot.lineTracerCallback = undefined;
			robot.boardCommand = 0;
			robot.boardState = 0;
			robot.boardCount = 0;
			robot.boardCallback = undefined;
			robot.currentSound = 0;
			robot.soundRepeat = 1;
			robot.soundCallback = undefined;
			robot.noteId = 0;
			robot.noteTimer1 = undefined;
			robot.noteTimer2 = undefined;
			robot.ioId = 0;
			robot.ioTimer = undefined;
			robot.serialDelimiter = 0;
			robot.serialRate = 176;
			//robot.writeSerialCallbacks = [];
			//robot.readSerialCallbacks = [];
			robot.freeFall = false;
			robot.tap = false;
			robot.tempo = 60;

			robot.__removeAllTimeouts();
			//robot.writeQueue.reset();
			//robot.readQueue.reset();
		};
		robot.__removeTimeout = function(id) {
			clearTimeout(id);
			var idx = robot.timeouts.indexOf(id);
			if(idx >= 0) {
				robot.timeouts.splice(idx, 1);
			}
		};
		robot.__removeAllTimeouts = function() {
			var timeouts = robot.timeouts;
			for(var i in timeouts) {
				clearTimeout(timeouts[i]);
			}
			robot.timeouts = [];
		};
		robot.__fireWriteSerialCallbacks = function() {
			//var callbacks = robot.writeSerialCallbacks;
			//for(var i in callbacks) {
			//	callbacks[i]();
			//}
			//robot.writeSerialCallbacks = [];
		};
		robot.prototype.__fireReadSerialCallbacks = function() {
			//var callbacks = robot.readSerialCallbacks;
			//for(var i in callbacks) {
			//	callbacks[i]();
			//}
			//robot.readSerialCallbacks = [];
		};
		robot.clearMotoring = function() {
			robot.motoring.map = 0xfc000000;
			robot.motoring.map2 = 0xc0000000;
		};
		robot.clearEvent = function() {
			robot.freeFall = false;
			robot.tap = false;
		};
		robot.__setPulse = function(pulse) {
			robot.motoring.pulse = pulse;
			robot.motoring.map2 |= 0x20000000;
		};
		robot.__setLineTracerMode = function(mode) {
			throbotis.motoring.lineTracerMode = mode;
			robot.motoring.map |= 0x00200000;
		};
		robot.__setLineTracerGain = function(gain) {
			robot.motoring.lineTracerGain = gain;
			robot.motoring.map2 |= 0x08000000;
		};
		robot.__setLineTracerSpeed = function(speed) {
			robot.motoring.lineTracerSpeed = speed;
			robot.motoring.map |= 0x00100000;
		};
		robot.__cancelLineTracer = function() {
			robot.lineTracerCallback = undefined;
		};
		robot.__setMotion = function(type, unit, speed, value, radius) {
			var motoring = robot.motoring;
			motoring.motionType = type;
			motoring.motionUnit = unit;
			motoring.motionSpeed = speed;
			motoring.motionValue = value;
			motoring.motionRadius = radius;
			motoring.map2 |= 0x02000000;
		};
		robot.__cancelMotion = function() {
			robot.motionCallback = undefined;
		};
		robot.__cancelBoard = function() {
			robot.boardCommand = 0;
			robot.boardState = 0;
			robot.boardCount = 0;
			robot.boardCallback = undefined;
		};
		robot.__setNote = function(note) {
			robot.motoring.note = note;
			robot.motoring.map |= 0x00400000;
		};
		robot.__issueNoteId = function() {
			robot.noteId = robot.blockId = (robot.blockId % 65535) + 1;
			return robot.noteId;
		};
		robot.__cancelNote = function() {
			robot.noteId = 0;
			if(robot.noteTimer1 !== undefined) {
				robot.__removeTimeout(robot.noteTimer1);
			}
			if(robot.noteTimer2 !== undefined) {
				robot.__removeTimeout(robot.noteTimer2);
			}
			robot.noteTimer1 = undefined;
			robot.noteTimer2 = undefined;
		};
		robot.__setSound = function(sound) {
			robot.motoring.sound = sound;
			robot.motoring.map2 |= 0x10000000;
		};
		robot.__runSound = function(sound, count) {
			if(typeof count != 'number') count = 1;
			if(count < 0) count = -1;
			if(count) {
				robot.currentSound = sound;
				robot.soundRepeat = count;
				robot.__setSound(sound);
			}
		};
		robot.__cancelSound = function() {
			robot.soundCallback = undefined;
		};
		robot.__setIoModeA = function(mode) {
			robot.motoring.ioModeA = mode;
			robot.motoring.map |= 0x00080000;
		};
		robot.__setIoModeB = function(mode) {
			robot.motoring.ioModeB = mode;
			robot.motoring.map |= 0x00040000;
		};
		robot.__issueIoId = function() {
			robot.ioId = robot.blockId = (robot.blockId % 65535) + 1;
			return robot.ioId;
		};
		robot.__cancelIo = function() {
			robot.ioId = 0;
			if(robot.ioTimer !== undefined) {
				robot.__removeTimeout(robot.ioTimer);
			}
			robot.ioTimer = undefined;
		};
		robot.__setSerial = function(arr) {
			var motoring = robot.motoring;
			if(motoring.serial == undefined) motoring.serial = new Array(19);
			for(let i = 0; i < 19; ++i) {
				motoring.serial[i] = arr[i];
			}
			motoring.map2 |= 0x04000000;
		};
		robot.handleSensory = function() {
			var sensory = robot.sensory;
			if(sensory.map2 & 0x00008000) robot.freeFall = true;
			if(sensory.map2 & 0x00004000) robot.tap = true;

			if(robot.lineTracerCallback && (sensory.map & 0x00000010) != 0) {
				if(sensory.lineTracerState == 2) {
					robot.__setLineTracerMode(0);
					var callback = robot.lineTracerCallback;
					robot.__cancelLineTracer();
					if(callback) callback();
				}
			}
			if(robot.boardCallback) {
				var motoring = robot.motoring;
				if(robot.boardCommand == 1) {
					switch(robot.boardState) {
						case 1: {
							if(robot.boardCount < 2) {
								if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
									robot.boardCount ++;
								else
									robot.boardCount = 0;
								var diff = sensory.leftFloor - sensory.rightFloor;
								motoring.leftWheel = 45 + diff * 0.25;
								motoring.rightWheel = 45 - diff * 0.25;
							} else {
								robot.boardCount = 0;
								robot.boardState = 2;
							}
							break;
						}
						case 2: {
							var diff = sensory.leftFloor - sensory.rightFloor;
							motoring.leftWheel = 45 + diff * 0.25;
							motoring.rightWheel = 45 - diff * 0.25;
							robot.boardState = 3;
							robot.wheelTimer = setTimeout(function() {
								motoring.leftWheel = 0;
								motoring.rightWheel = 0;
								robot.boardState = 4;
								if(robot.wheelTimer !== undefined) robot.__removeTimeout(robot.wheelTimer);
								robot.wheelTimer = undefined;
							}, 250);
							robot.timeouts.push(robot.wheelTimer);
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
							var callback = robot.boardCallback;
							robot.__cancelBoard();
							if(callback) callback();
							break;
						}
					}
				} else if(robot.boardCommand == 2) {
					switch(robot.boardState) {
						case 1: {
							if(robot.boardCount < 2) {
								if(sensory.leftFloor > 50)
									robot.boardCount ++;
							} else {
								robot.boardCount = 0;
								robot.boardState = 2;
							}
							break;
						}
						case 2: {
							if(sensory.leftFloor < 20) {
								robot.boardState = 3;
							}
							break;
						}
						case 3: {
							if(robot.boardCount < 2) {
								if(sensory.leftFloor < 20)
									robot.boardCount ++;
							} else {
								robot.boardCount = 0;
								robot.boardState = 4;
							}
							break;
						}
						case 4: {
							if(sensory.leftFloor > 50) {
								robot.boardState = 5;
							}
							break;
						}
						case 5: {
							var diff = sensory.leftFloor - sensory.rightFloor;
							if(diff > -15) {
								motoring.leftWheel = 0;
								motoring.rightWheel = 0;
								var callback = robot.boardCallback;
								robot.__cancelBoard();
								if(callback) callback();
							} else {
								motoring.leftWheel = diff * 0.5;
								motoring.rightWheel = -diff * 0.5;
							}
							break;
						}
					}
				} else if(robot.boardCommand == 3) {
					switch(robot.boardState) {
						case 1: {
							if(robot.boardCount < 2) {
								if(sensory.rightFloor > 50)
									robot.boardCount ++;
							} else {
								robot.boardCount = 0;
								robot.boardState = 2;
							}
							break;
						}
						case 2: {
							if(sensory.rightFloor < 20) {
								robot.boardState = 3;
							}
							break;
						}
						case 3: {
							if(robot.boardCount < 2) {
								if(sensory.rightFloor < 20)
									robot.boardCount ++;
							} else {
								robot.boardCount = 0;
								robot.boardState = 4;
							}
							break;
						}
						case 4: {
							if(sensory.rightFloor > 50) {
								robot.boardState = 5;
							}
							break;
						}
						case 5: {
							var diff = sensory.rightFloor - sensory.leftFloor;
							if(diff > -15) {
								motoring.leftWheel = 0;
								motoring.rightWheel = 0;
								var callback = robot.boardCallback;
								robot.__cancelBoard();
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
			if(robot.motionCallback && (sensory.map2 & 0x00000800) != 0) {
				if(sensory.wheelState == 2) {
					robot.motoring.leftWheel = 0;
					robot.motoring.rightWheel = 0;
					var callback = robot.motionCallback;
					robot.__cancelMotion();
					if(callback) callback();
				}
			}
			if((sensory.map2 & 0x00000400) != 0) {
				if(sensory.soundState == 0) {
					if(robot.currentSound > 0) {
						if(robot.soundRepeat < 0) {
							robot.__runSound(robot.currentSound, -1);
						} else if(robot.soundRepeat > 1) {
							robot.soundRepeat --;
							robot.__runSound(robot.currentSound, robot.soundRepeat);
						} else {
							robot.currentSound = 0;
							robot.soundRepeat = 1;
							var callback = robot.soundCallback;
							robot.__cancelSound();
							if(callback) callback();
						}
					} else {
						robot.currentSound = 0;
						robot.soundRepeat = 1;
						var callback = robot.soundCallback;
						robot.__cancelSound();
						if(callback) callback();
					}
				}
			}
			//if(sensory.map2 & 0x00002000) {
			//	if(sensory.serial) robot.readQueue.push(sensory.serial);
			//}
			//if(sensory.map2 & 0x00000200) {
			//	var tmp = robot.writeQueue.pop();
			//	if(tmp) {
			//		robot.__setSerial(tmp);
			//	} else {
			//		robot.__fireWriteSerialCallbacks();
			//	}
			//}
			//if(robot.readSerialCallbacks.length > 0) {
			//	var tmp = robot.readQueue.pop(robot.serialDelimiter);
			//	if(tmp) {
			//		sensory.serial = tmp;
			//		robot.__fireReadSerialCallbacks();
			//	}
			//}
		};
		robot.__board = function(leftVelocity, rightVelocity, command, callback) {
			var motoring = robot.motoring;
			robot.__cancelMotion();
			robot.__cancelLineTracer();

			motoring.leftWheel = leftVelocity;
			motoring.rightWheel = rightVelocity;
			robot.boardCommand = command;
			robot.boardCount = 0;
			robot.boardState = 1;
			robot.boardCallback = callback;
			robot.__setPulse(0);
			robot.__setMotion(0, 0, 0, 0, 0);
			robot.__setLineTracerMode(0);
		};
		robot.boardForward = function(callback) {
			robot.__board(45, 45, 1, callback);
		};
		robot.boardTurn = function(direction, callback) {
			if(DIRECTIONS[direction] == LEFT) {
				robot.__board(-45, 45, 2, callback);
			} else {
				robot.__board(45, -45, 3, callback);
			}
		};
		robot.__motion = function(type, callback) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelLineTracer();

			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			robot.__setPulse(0);
			robot.__setMotion(type, 1, 0, 0, 0); // type, unit, speed, value, radius
			robot.motionCallback = callback;
			robot.__setLineTracerMode(0);
		};
		robot.__motionUnit = function(type, unit, value, callback) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelMotion();
			robot.__cancelLineTracer();

			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			robot.__setPulse(0);
			value = parseFloat(value);
			if(value && value > 0) {
				robot.__setMotion(type, unit, 0, value, 0); // type, unit, speed, value, radius
				robot.motionCallback = callback;
				robot.__setLineTracerMode(0);
			} else {
				robot.__setMotion(0, 0, 0, 0, 0);
				robot.__setLineTracerMode(0);
				callback();
			}
		};
		robot.__motionUnitRadius = function(type, unit, value, radius, callback) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelMotion();
			robot.__cancelLineTracer();

			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			robot.__setPulse(0);
			value = parseFloat(value);
			radius = parseFloat(radius);
			if(value && value > 0 && (typeof radius == 'number') && radius >= 0) {
				robot.__setMotion(type, unit, 0, value, radius); // type, unit, speed, value, radius
				robot.motionCallback = callback;
				robot.__setLineTracerMode(0);
			} else {
				robot.__setMotion(0, 0, 0, 0, 0);
				robot.__setLineTracerMode(0);
				callback();
			}
		};
		robot.moveForward = function(callback) {
			robot.__motion(101, callback);
		};
		robot.moveBackward = function(callback) {
			robot.__motion(102, callback);
		};
		robot.turn = function(direction, callback) {
			if(DIRECTIONS[direction] == LEFT) {
				robot.__motion(103, callback);
			} else {
				robot.__motion(104, callback);
			}
		};
		robot.moveForwardSecs = function(secs, callback) {
			robot.__motionUnit(1, 2, secs, callback);
		};
		robot.moveBackwardSecs = function(secs, callback) {
			robot.__motionUnit(2, 2, secs, callback);
		};
		robot.turnSecs = function(direction, secs, callback) {
			if(DIRECTIONS[direction] == LEFT) {
				robot.__motionUnit(3, 2, secs, callback);
			} else {
				robot.__motionUnit(4, 2, secs, callback);
			}
		};
		robot.moveForwardUnit = function(value, unit, callback) {
			robot.__motionUnit(1, UNITS[unit], value, callback);
		};
		robot.moveBackwardUnit = function(value, unit, callback) {
			robot.__motionUnit(2, UNITS[unit], value, callback);
		};
		robot.turnUnit = function(direction, value, unit, callback) {
			if(DIRECTIONS[direction] == LEFT) {
				robot.__motionUnit(3, UNITS[unit], value, callback);
			} else {
				robot.__motionUnit(4, UNITS[unit], value, callback);
			}
		};
		robot.pivotUnit = function(wheel, value, unit, toward, callback) {
			unit = UNITS[unit];
			if(PARTS[wheel] == LEFT) {
				if(TOWARDS[toward] == FORWARD) robot.__motionUnit(5, unit, value, callback);
				else robot.__motionUnit(6, unit, value, callback);
			} else {
				if(TOWARDS[toward] == FORWARD) robot.__motionUnit(7, unit, value, callback);
				else robot.__motionUnit(8, unit, value, callback);
			}
		};
		robot.swingUnit = function(direction, value, unit, radius, toward, callback) {
			unit = UNITS[unit];
			if(DIRECTIONS[direction] == LEFT) {
				if(TOWARDS[toward] == FORWARD) robot.__motionUnitRadius(9, unit, value, radius, callback);
				else robot.__motionUnitRadius(10, unit, value, radius, callback);
			} else {
				if(TOWARDS[toward] == FORWARD) robot.__motionUnitRadius(11, unit, value, radius, callback);
				else robot.__motionUnitRadius(12, unit, value, radius, callback);
			}
		};
		robot.penUnit = function(pen, value, unit, toward, callback) {
			unit = UNITS[unit];
			if(PARTS[pen] == LEFT) {
				if(TOWARDS[toward] == FORWARD) robot.__motionUnit(13, unit, value, callback);
				else robot.__motionUnit(14, unit, value, callback);
			} else {
				if(TOWARDS[toward] == FORWARD) robot.__motionUnit(15, unit, value, callback);
				else robot.__motionUnit(16, unit, value, callback);
			}
		};
		robot.setWheels = function(leftVelocity, rightVelocity) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelMotion();
			robot.__cancelLineTracer();

			leftVelocity = parseFloat(leftVelocity);
			rightVelocity = parseFloat(rightVelocity);
			if(typeof leftVelocity == 'number') {
				motoring.leftWheel = leftVelocity;
			}
			if(typeof rightVelocity == 'number') {
				motoring.rightWheel = rightVelocity;
			}
			robot.__setPulse(0);
			robot.__setMotion(0, 0, 0, 0, 0);
			throbotis.__setLineTracerMode(0);
		};
		robot.changeWheels = function(leftVelocity, rightVelocity) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelMotion();
			robot.__cancelLineTracer();

			leftVelocity = parseFloat(leftVelocity);
			rightVelocity = parseFloat(rightVelocity);
			if(typeof leftVelocity == 'number') {
				motoring.leftWheel += leftVelocity;
			}
			if(typeof rightVelocity == 'number') {
				motoring.rightWheel += rightVelocity;
			}
			robot.__setPulse(0);
			robot.__setMotion(0, 0, 0, 0, 0);
			robot.__setLineTracerMode(0);
		};
		robot.setWheel = function(wheel, velocity) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelMotion();
			robot.__cancelLineTracer();

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
			robot.__setPulse(0);
			robot.__setMotion(0, 0, 0, 0, 0);
			robot.__setLineTracerMode(0);
		};
		robot.changeWheel = function(wheel, velocity) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelMotion();
			robot.__cancelLineTracer();

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
			robot.__setPulse(0);
			robot.__setMotion(0, 0, 0, 0, 0);
			robot.__setLineTracerMode(0);
		};
		robot.followLine = function(color, sensor) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelMotion();
			robot.__cancelLineTracer();

			var mode = 1;
			sensor = PARTS[sensor];
			if(sensor == RIGHT) mode = 2;
			else if(sensor == BOTH) mode = 3;
			if(VALUES[color] == WHITE) mode += 7;

			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			robot.__setPulse(0);
			robot.__setMotion(0, 0, 0, 0, 0);
			robot.__setLineTracerMode(mode);
		};
		robot.followLineUntil = function(color, direction, callback) {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelMotion();

			var mode = 4;
			direction = DIRECTIONS[direction];
			if(direction == RIGHT) mode = 5;
			else if(direction == FRONT) mode = 6;
			else if(direction == REAR) mode = 7;
			if(VALUES[color] == WHITE) mode += 7;

			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			robot.__setPulse(0);
			robot.__setMotion(0, 0, 0, 0, 0);
			robot.__setLineTracerMode(mode);
			robot.lineTracerCallback = callback;
		};
		robot.setLineTracerSpeed = function(speed) {
			speed = parseInt(speed);
			var gain = SPEED2GAINS[speed];
			if((typeof speed == 'number') && (typeof gain == 'number')) {
				robot.__setLineTracerSpeed(speed);
				robot.__setLineTracerGain(gain);
			}
		};
		robot.stop = function() {
			var motoring = robot.motoring;
			robot.__cancelBoard();
			robot.__cancelMotion();
			robot.__cancelLineTracer();

			motoring.leftWheel = 0;
			motoring.rightWheel = 0;
			robot.__setPulse(0);
			robot.__setMotion(0, 0, 0, 0, 0);
			robot.__setLineTracerMode(0);
		};
		robot.setLed = function(led, color) {
			var rgb = LED2RGB[COLORS[color]];
			if(rgb) {
				robot.setRgb(led, rgb[0], rgb[1], rgb[2]);
			}
		};
		robot.clearLed = function(led) {
			robot.setRgb(led, 0, 0, 0);
		};
		robot.setRgbArray = function(led, rgb) {
			if(rgb) {
				robot.setRgb(led, rgb[0], rgb[1], rgb[2]);
			}
		};
		robot.setRgb = function(led, red, green, blue) {
			var motoring = robot.motoring;
			red = parseInt(red);
			green = parseInt(green);
			blue = parseInt(blue);
			if(led == 'left') {
				if(typeof red == 'number') {
					motoring.leftRed = red;
				}
				if(typeof green == 'number') {
					motoring.leftGreen = green;
				}
				if(typeof blue == 'number') {
					motoring.leftBlue = blue;
				}
			} else if(led == 'right') {
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
		robot.changeRgb = function(led, red, green, blue) {
			var motoring = robot.motoring;
			red = parseInt(red);
			green = parseInt(green);
			blue = parseInt(blue);
			if(led == 'left') {
				if(typeof red == 'number') {
					motoring.leftRed += red;
				}
				if(typeof green == 'number') {
					motoring.leftGreen += green;
				}
				if(typeof blue == 'number') {
					motoring.leftBlue += blue;
				}
			} else if(led == 'right') {
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
		robot.beep = function(callback) {
			robot.playSoundUntil(1, 1, callback);
		};
		robot.playSound = function(sound, count) {
			var motoring = robot.motoring;
			robot.__cancelNote();
			robot.__cancelSound();

			sound = SOUNDS[sound];
			count = parseInt(count);
			motoring.buzzer = 0;
			robot.__setNote(0);
			if(sound && count) {
				robot.__runSound(sound, count);
			} else {
				robot.__runSound(0);
			}
		};
		robot.playSoundUntil = function(sound, count, callback) {
			var motoring = robot.motoring;
			robot.__cancelNote();
			robot.__cancelSound();

			sound = SOUNDS[sound];
			count = parseInt(count);
			motoring.buzzer = 0;
			robot.__setNote(0);
			if(sound && count) {
				robot.__runSound(sound, count);
				robot.soundCallback = callback;
			} else {
				robot.__runSound(0);
				callback();
			}
		};
		robot.setBuzzer = function(hz) {
			var motoring = robot.motoring;
			robot.__cancelNote();
			robot.__cancelSound();

			hz = parseFloat(hz);
			if(typeof hz == 'number') {
				motoring.buzzer = hz;
			}
			robot.__setNote(0);
			robot.__runSound(0);
		};
		robot.changeBuzzer = function(hz) {
			var motoring = robot.motoring;
			robot.__cancelNote();
			robot.__cancelSound();

			hz = parseFloat(hz);
			if(typeof hz == 'number') {
				motoring.buzzer += hz;
			}
			robot.__setNote(0);
			robot.__runSound(0);
		};
		robot.clearBuzzer = function() {
			robot.clearSound();
		};
		robot.clearSound = function() {
			robot.__cancelNote();
			robot.__cancelSound();
			robot.motoring.buzzer = 0;
			robot.__setNote(0);
			robot.__runSound(0);
		};
		robot.playNote = function(note, octave) {
			var motoring = robot.motoring;
			robot.__cancelNote();
			robot.__cancelSound();

			note = NOTES[note];
			octave = parseInt(octave);
			motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8) {
				note += (octave - 1) * 12;
				robot.__setNote(note);
			} else {
				robot.__setNote(0);
			}
			robot.__runSound(0);
		};
		robot.playNoteBeat = function(note, octave, beat, callback) {
			var motoring = robot.motoring;
			robot.__cancelNote();
			robot.__cancelSound();

			note = NOTES[note];
			octave = parseInt(octave);
			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
			if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && self.tempo > 0) {
				var id = robot.__issueNoteId();
				note += (octave - 1) * 12;
				robot.__setNote(note);
				var timeout = beat * 60 * 1000 / robot.tempo;
				var tail = (timeout > 100) ? 100 : 0;
				if(tail > 0) {
					robot.noteTimer1 = setTimeout(function() {
						if(robot.noteId == id) {
							robot.__setNote(0);
							if(robot.noteTimer1 !== undefined) robot.__removeTimeout(robot.noteTimer1);
							robot.noteTimer1 = undefined;
						}
					}, timeout - tail);
					robot.timeouts.push(robot.noteTimer1);
				}
				robot.noteTimer2 = setTimeout(function() {
					if(robot.noteId == id) {
						robot.__setNote(0);
						robot.__cancelNote();
						callback();
					}
				}, timeout);
				robot.timeouts.push(robot.noteTimer2);
				robot.__runSound(0);
			} else {
				robot.__setNote(0);
				robot.__runSound(0);
				callback();
			}
		};
		robot.restBeat = function(beat, callback) {
			var motoring = robot.motoring;
			robot.__cancelNote();
			robot.__cancelSound();

			var tmp = BEATS[beat];
			if(tmp) beat = tmp;
			else beat = parseFloat(beat);
			motoring.buzzer = 0;
			robot.__setNote(0);
			robot.__runSound(0);
			if(beat && beat > 0 && robot.tempo > 0) {
				var id = robot.__issueNoteId();
				robot.noteTimer1 = setTimeout(function() {
					if(robot.noteId == id) {
						robot.__cancelNote();
						callback();
					}
				}, beat * 60 * 1000 / robot.tempo);
				robot.timeouts.push(robot.noteTimer1);
			} else {
				callback();
			}
		};
		robot.setTempo = function(bpm) {
			bpm = parseFloat(bpm);
			if(typeof bpm == 'number') {
				robot.tempo = bpm;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		};
		robot.changeTempo = function(bpm) {
			bpm = parseFloat(bpm);
			if(typeof bpm == 'number') {
				robot.tempo += bpm;
				if(robot.tempo < 1) robot.tempo = 1;
			}
		};
		robot.getLeftProximity = function() {
			return robot.sensory.leftProximity;
		};
		robot.getRightProximity = function() {
			return robot.sensory.rightProximity;
		};
		robot.getLeftFloor = function() {
			return robot.sensory.leftFloor;
		};
		robot.getRightFloor = function() {
			return robot.sensory.rightFloor;
		};
		robot.getAccelerationX = function() {
			return robot.sensory.accelerationX;
		};
		robot.getAccelerationY = function() {
			return robot.sensory.accelerationY;
		};
		robot.getAccelerationZ = function() {
			return robot.sensory.accelerationZ;
		};
		robot.getLight = function() {
			return robot.sensory.light;
		};
		robot.getTemperature = function() {
			return robot.sensory.temperature;
		};
		robot.getSignalStrength = function() {
			return robot.sensory.signalStrength;
		};
		robot.checkHandFound = function() {
			const sensory = robot.sensory;
			return (sensory.handFound === undefined) ? (sensory.leftProximity > 50 || sensory.rightProximity > 50) : sensory.handFound;
		};
		robot.checkTilt = function(tilt) {
			switch(TILTS[tilt]) {
				case TILT_FORWARD: return robot.sensory.tilt == 1;
				case TILT_BACKWARD: return robot.sensory.tilt == -1;
				case TILT_LEFT: return robot.sensory.tilt == 2;
				case TILT_RIGHT: return robot.sensory.tilt == -2;
				case TILT_UPSIDEDOWN: return robot.sensory.tilt == 3;
				case TILT_NORMAL: return robot.sensory.tilt == -3;
				//case TAP: return robot.tap;
				//case FREE_FALL: return robot.freeFall;
			}
			return false;
		};
		robot.checkBattery = function(battery) {
			return robot.sensory.batteryState == BATTERY_STATES[battery];
		};
		robot.setIoMode = function(port, mode) {
			robot.__cancelIo();
			mode = IO_MODES[mode];
			if(typeof mode == 'number') {
				if(port == 'A') {
					robot.__setIoModeA(mode);
				} else if(port == 'B') {
					thirobots.__setIoModeB(mode);
				} else {
					robot.__setIoModeA(mode);
					robot.__setIoModeB(mode);
				}
			}
		};
		robot.setOutput = function(port, value) {
			var motoring = robot.motoring;
			robot.__cancelIo();
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
		robot.changeOutput = function(port, value) {
			var motoring = robot.motoring;
			robot.__cancelIo();
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
		robot.gripper = function(action, callback) {
			var motoring = robot.motoring;
			robot.__cancelIo();

			var id = robot.__issueIoId();
			robot.__setIoModeA(10);
			robot.__setIoModeB(10);
			if(GRIPPERS[action] == OPEN) {
				motoring.outputA = 1;
				motoring.outputB = 0;
			} else {
				motoring.outputA = 0;
				motoring.outputB = 1;
			}
			robot.ioTimer = setTimeout(function() {
				if(robot.ioId == id) {
					robot.__cancelIo();
					callback();
				}
			}, 500);
			robot.timeouts.push(robot.ioTimer);
		};
		robot.releaseGripper = function() {
			var motoring = robot.motoring;
			robot.__cancelIo();
			robot.__setIoModeA(10);
			robot.__setIoModeB(10);
			motoring.outputA = 0;
			motoring.outputB = 0;
		};
		robot.getInputA = function() {
			return robot.sensory.inputA;
		};
		robot.getInputB = function() {
			return robot.sensory.inputB;
		};
		robot.writeSerial = function(mode, text, callback) {
		//	var motoring = robot.motoring;
		//	robot.__cancelIo();
		//	robot.__setIoModeA(robot.serialRate);
		//	robot.__setIoModeB(robot.serialRate);
		//	var queue = robot.writeQueue;
		//	queue.push(text, mode != 'string');
		//	var data = queue.pop();
		//	if(data) {
		//		robot.writeSerialCallbacks.push(callback);
		//		robot.__setSerial(data);
		//	}
		};
		robot.readSerial = function(callback) {
		//	var motoring = robot.motoring;
		//	robot.__cancelIo();
		//	robot.__setIoModeA(robot.serialRate);
		//	robot.__setIoModeB(robot.serialRate);
		//	robot.serialDelimiter = 0;
		//	robot.readSerialCallbacks.push(callback);
		};
		robot.readSerialUltil = function(delimiter, callback) {
		//	var motoring = robot.motoring;
		//	robot.__cancelIo();
		//	robot.__setIoModeA(robot.serialRate);
		//	robot.__setIoModeB(robot.serialRate);
		//	delimiter = robot.__SERIAL_DELIMITERS[delimiter];
		//	if(typeof delimiter == 'number') {
		//		robot.serialDelimiter = delimiter;
		//		robot.readSerialCallbacks.push(callback);
		//	}
		};
		robot.setSerialRate = function(baud) {
		//	var motoring = robot.motoring;
		//	robot.__cancelIo();
		//	baud = SERIAL_BAUDS[baud];
		//	if(baud && baud > 0) {
		//		robot.serialRate = baud;
		//		robot.__setIoModeA(baud);
		//		robot.__setIoModeB(baud);
		//	}
		};
		robot.getSerialInput = function() {
			return robot.sensory.serial;
		};
	}
	
	function getOrCreateRobot(group, module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			if(module == HAMSTER) {
				robot = createHamster(index);
			} else if(module == HAMSTER_S) {
				robot = createHamsterS(index);
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
					if(data.module == HAMSTER && data.index == 0) {
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
									var json;
									if(slaveVersion == 1) json = JSON.stringify(packet);
									else json = JSON.stringify(packet.robot);
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
	
	ext.boardMoveForward = function(callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.boardForward(callback);
	};

	ext.boardTurn = function(direction, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.boardTurn(direction, callback);
	};
	
	ext.moveForward = function(callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveForward(callback);
	};
	
	ext.moveBackward = function(callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveBackward(callback);
	};
	
	ext.turn = function(direction, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.turn(direction, callback);
	};

	ext.moveForwardForSecs = function(secs, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveForwardSecs(secs, callback);
	};

	ext.moveBackwardForSecs = function(secs, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveBackwardSecs(secs, callback);
	};

	ext.turnForSecs = function(direction, secs, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.turnSecs(direction, secs, callback);
	};
	
	ext.changeBothWheelsBy = function(left, right) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeWheels(left, right);
	};

	ext.setBothWheelsTo = function(left, right) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setWheels(left, right);
	};

	ext.changeWheelBy = function(which, speed) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeWheel(which, speed);
	};

	ext.setWheelTo = function(which, speed) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setWheel(which, speed);
	};

	ext.followLineUsingFloorSensor = function(color, which) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.fillowLine(color, which);
	};

	ext.followLineUntilIntersection = function(color, which, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.followLineUntil(color, which, callback);
	};

	ext.setFollowingSpeedTo = function(speed) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setLineTracerSpeed(speed);
	};

	ext.stop = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.stop();
	};

	ext.setLedTo = function(which, color) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setLed(which, color);
	};

	ext.clearLed = function(which) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.clearLed(which);
	};

	ext.beep = function(callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.beep(callback);
	};

	ext.changeBuzzerBy = function(value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeBuzzer(value);
	};

	ext.setBuzzerTo = function(value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setBuzzer(value);
	};

	ext.clearBuzzer = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.clearBuzzer();
	};
	
	ext.playNote = function(note, octave) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.playNote(note, octave);
	};
	
	ext.playNoteFor = function(note, octave, beat, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.playNoteBeat(note, octave, beat, callback);
	};

	ext.restFor = function(beat, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.restBeat(beat, callback);
	};

	ext.changeTempoBy = function(value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeTempo(value);
	};

	ext.setTempoTo = function(value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setTempo(value);
	};

	ext.leftProximity = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getLeftProximity();
		return 0;
	};

	ext.rightProximity = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getRightProximity();
		return 0;
	};

	ext.leftFloor = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getLeftFloor();
		return 0;
	};

	ext.rightFloor = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getRightFloor();
		return 0;
	};

	ext.accelerationX = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getAccelerationX();
		return 0;
	};

	ext.accelerationY = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getAccelerationY();
		return 0;
	};

	ext.accelerationZ = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getAccelerationZ();
		return 0;
	};

	ext.light = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getLight();
		return 0;
	};

	ext.temperature = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getTemperature();
		return 0;
	};

	ext.signalStrength = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getSignalStrength();
		return 0;
	};

	ext.handFound = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkHandFound();
		return false;
	};

	ext.setPortTo = function(port, mode) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setIoMode(port, mode);
	};

	ext.changeOutputBy = function(port, value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.changeOutput(port, value);
	};

	ext.setOutputTo = function(port, value) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.setOutput(port, value);
	};
	
	ext.gripper = function(action, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.gripper(action, callback);
	};
	
	ext.releaseGripper = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.releaseGripper();
	};

	ext.inputA = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getInputA();
		return 0;
	};

	ext.inputB = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getInputB();
		return 0;
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
