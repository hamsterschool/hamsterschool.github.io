(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const SPEED2GAINS = { 1: 6, 2: 6, 3: 5, 4: 5, 5: 4, 6: 4, 7: 3, 8: 3 };
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
			["h", "when hand found", "whenHandFound"],
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
			["h", "when hand found", "whenHandFound"],
			["h", "when %m.when_tilt", "whenTilt", "tilt forward"],
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
			["h", "when hand found", "whenHandFound"],
			["h", "when %m.when_tilt", "whenTilt", "tilt forward"],
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
			["h", "손 찾았을 때", "whenHandFound"],
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
			["h", "손 찾았을 때", "whenHandFound"],
			["h", "%m.when_tilt 때", "whenTilt", "앞으로 기울였을"],
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
			["h", "손 찾았을 때", "whenHandFound"],
			["h", "%m.when_tilt 때", "whenTilt", "앞으로 기울였을"],
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
			["h", "手を見つけたとき", "whenHandFound"],
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
			["h", "手を見つけたとき", "whenHandFound"],
			["h", "%m.when_tilt とき", "whenTilt", "前に傾けた"],
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
			["h", "手を見つけたとき", "whenHandFound"],
			["h", "%m.when_tilt とき", "whenTilt", "前に傾けた"],
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
			["h", "qo'l topilganda", "whenHandFound"],
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
			["h", "qo'l topilganda", "whenHandFound"],
			["h", "%m.when_tilt bo'lganda", "whenTilt", "oldinga eğin"],
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
			["h", "qo'l topilganda", "whenHandFound"],
			["h", "%m.when_tilt bo'lganda", "whenTilt", "oldinga eğin"],
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
			"when_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"battery": ["normal", "low", "empty"],
			"port": ["A", "B", "A and B"],
			"mode": ["analog input", "digital input", "servo output", "pwm output", "digital output"],
			"open_close": ["open", "close"],
			"forward_backward": ["forward", "backward"],
			"move_unit": ["cm", "seconds", "pulses"],
			"sound": ["beep", "random beep", "siren", "engine", "robot", "march", "birthday", "dibidibidip", "good job"]
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
			"when_tilt": ["앞으로 기울였을", "뒤로 기울였을", "왼쪽으로 기울였을", "오른쪽으로 기울였을", "거꾸로 뒤집었을", "기울이지 않았을"],
			"tilt": ["앞으로 기울임", "뒤로 기울임", "왼쪽으로 기울임", "오른쪽으로 기울임", "거꾸로 뒤집음", "기울이지 않음"],
			"battery": ["정상", "부족", "없음"],
			"port": ["A", "B", "A와 B"],
			"mode": ["아날로그 입력", "디지털 입력", "서보 출력", "PWM 출력", "디지털 출력"],
			"open_close": ["열기", "닫기"],
			"forward_backward": ["앞쪽", "뒤쪽"],
			"move_unit": ["cm", "초", "펄스"],
			"sound": ["삐", "무작위 삐", "사이렌", "엔진", "로봇", "행진", "생일", "디비디비딥", "잘 했어요"]
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
			"when_tilt": ["前に傾けた", "後に傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾けなかった"],
			"tilt": ["前に傾けたか", "後に傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾けなかったか"],
			"battery": ["正常か", "足りないか", "ないか"],
			"port": ["A", "B", "AとB"],
			"mode": ["アナログ入力", "デジタル入力", "サーボ出力", "PWM出力", "デジタル出力"],
			"open_close": ["開く", "閉める"],
			"forward_backward": ["前", "後"],
			"move_unit": ["cm", "秒", "パルス"],
			"sound": ["ビープ", "ランダムビープ", "サイレン", "エンジン", "ロボット", "行進", "誕生", "ディバディバディップ", "よくやった"]
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
			"when_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q"],
			"tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q"],
			"battery": ["normal", "past", "bo'sh"],
			"port": ["A", "B", "A va B"],
			"mode": ["analog kiritish", "raqamli kiritish", "servo chiqish", "pwm chiqish", "raqamli chiqish"],
			"open_close": ["oching", "yoping"],
			"forward_backward": ["old", "orqa"],
			"move_unit": ["cm", "soniya", "puls"],
			"sound": ["qisqa", "tasodifiy qisqa", "sirena", "motor", "robot", "marsh", "tug'ilgan kun", "dibidibidip", "juda yaxshi"]
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
	const SECONDS = 2;
	const BEEP = 1;
	const OPEN = 1;
	const CLOSE = 2;
	const TILT_FORWARD = 1;
	const TILT_BACKWARD = 2;
	const TILT_LEFT = 3;
	const TILT_RIGHT = 4;
	const TILT_FLIP = 5;
	const TILT_NONE = 6;
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
		tmp = MENUS[i]['sound'];
		SOUNDS[tmp[0]] = BEEP;
		tmp = MENUS[i]['mode'];
		IO_MODES[tmp[0]] = 0; // analog input
		IO_MODES[tmp[1]] = 1; // digital input
		IO_MODES[tmp[2]] = 8; // servo output
		IO_MODES[tmp[3]] = 9; // pwm output
		IO_MODES[tmp[4]] = 10; // digital output
		tmp = MENUS[i]['open_close'];
		GRIPPERS[tmp[0]] = OPEN;
		GRIPPERS[tmp[1]] = CLOSE;
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
		tmp = MENUS[i]['black_white'];
		VALUES[tmp[1]] = WHITE;
	}
	
	function Hamster(index) {
		this.sensory = {
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
		this.motoring = {
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
		this.blockId = 0;
		this.wheelId = 0;
		this.wheelTimer = undefined;
		this.lineTracerCallback = undefined;
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.ioId = 0;
		this.ioTimer = undefined;
		this.tempo = 60;
		this.timeouts = [];
	}
	
	Hamster.prototype.reset = function() {
		var motoring = this.motoring;
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

		this.blockId = 0;
		this.wheelId = 0;
		this.wheelTimer = undefined;
		this.lineTracerCallback = undefined;
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.ioId = 0;
		this.ioTimer = undefined;
		this.tempo = 60;

		this.__removeAllTimeouts();
	};
	
	Hamster.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	Hamster.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};
	
	Hamster.prototype.clearMotoring = function() {
		this.motoring.map = 0xfc000000;
	};

	Hamster.prototype.clearEvent = function() {
	};
	
	Hamster.prototype.__issueWheelId = function() {
		this.wheelId = this.blockId = (this.blockId % 65535) + 1;
		return this.wheelId;
	};

	Hamster.prototype.__cancelWheel = function() {
		this.wheelId = 0;
		if(this.wheelTimer !== undefined) {
			this.__removeTimeout(this.wheelTimer);
		}
		this.wheelTimer = undefined;
	};

	Hamster.prototype.__setLineTracerMode = function(mode) {
		this.motoring.lineTracerMode = mode;
		this.motoring.map |= 0x00200000;
	};

	Hamster.prototype.__setLineTracerSpeed = function(speed) {
		this.motoring.lineTracerSpeed = speed;
		this.motoring.map |= 0x00100000;
	};

	Hamster.prototype.__cancelLineTracer = function() {
		this.lineTracerCallback = undefined;
	};

	Hamster.prototype.__cancelBoard = function() {
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
	};

	Hamster.prototype.__setLeftLed = function(color) {
		this.motoring.leftLed = color;
		this.motoring.map |= 0x01000000;
	};

	Hamster.prototype.__setRightLed = function(color) {
		this.motoring.rightLed = color;
		this.motoring.map |= 0x00800000;
	};

	Hamster.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x00400000;
	};

	Hamster.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	Hamster.prototype.__cancelNote = function() {
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

	Hamster.prototype.__setIoModeA = function(mode) {
		this.motoring.ioModeA = mode;
		this.motoring.map |= 0x00080000;
	};

	Hamster.prototype.__setIoModeB = function(mode) {
		this.motoring.ioModeB = mode;
		this.motoring.map |= 0x00040000;
	};

	Hamster.prototype.__issueIoId = function() {
		this.ioId = this.blockId = (this.blockId % 65535) + 1;
		return this.ioId;
	};

	Hamster.prototype.__cancelIo = function() {
		this.ioId = 0;
		if(this.ioTimer !== undefined) {
			this.__removeTimeout(this.ioTimer);
		}
		this.ioTimer = undefined;
	};

	Hamster.prototype.handleSensory = function() {
		var self = this;
		var sensory = self.sensory;
		if(self.lineTracerCallback && (sensory.map & 0x00000010) != 0) {
			if(sensory.lineTracerState == 0x40) {
				self.__setLineTracerMode(0);
				var callback = self.lineTracerCallback;
				self.__cancelLineTracer();
				if(callback) callback();
			}
		}
		if(self.boardCallback) {
			var motoring = self.motoring;
			if(self.boardCommand == 1) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
								self.boardCount ++;
							else
								self.boardCount = 0;
							var diff = sensory.leftFloor - sensory.rightFloor;
							motoring.leftWheel = 45 + diff * 0.25;
							motoring.rightWheel = 45 - diff * 0.25;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						motoring.leftWheel = 45 + diff * 0.25;
						motoring.rightWheel = 45 - diff * 0.25;
						self.boardState = 3;
						self.wheelTimer = setTimeout(function() {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							self.boardState = 4;
							if(self.wheelTimer !== undefined) self.__removeTimeout(self.wheelTimer);
							self.wheelTimer = undefined;
						}, 250);
						self.timeouts.push(self.wheelTimer);
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
						var callback = self.boardCallback;
						self.__cancelBoard();
						if(callback) callback();
						break;
					}
				}
			} else if(self.boardCommand == 2) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor > 50)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.leftFloor < 20) {
							self.boardState = 3;
						}
						break;
					}
					case 3: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor < 20)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.leftFloor > 50) {
							self.boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = self.boardCallback;
							self.__cancelBoard();
							if(callback) callback();
						} else {
							motoring.leftWheel = diff * 0.5;
							motoring.rightWheel = -diff * 0.5;
						}
						break;
					}
				}
			} else if(self.boardCommand == 3) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.rightFloor > 50)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.rightFloor < 20) {
							self.boardState = 3;
						}
						break;
					}
					case 3: {
						if(self.boardCount < 2) {
							if(sensory.rightFloor < 20)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.rightFloor > 50) {
							self.boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.rightFloor - sensory.leftFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = self.boardCallback;
							self.__cancelBoard();
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

	Hamster.prototype.__board = function(leftVelocity, rightVelocity, command, callback) {
		var motoring = this.motoring;
		this.__cancelWheel();
		this.__cancelLineTracer();

		motoring.leftWheel = leftVelocity;
		motoring.rightWheel = rightVelocity;
		motoring.motion = 0;
		this.boardCommand = command;
		this.boardCount = 0;
		this.boardState = 1;
		this.boardCallback = callback;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.boardForward = function(callback) {
		this.__board(45, 45, 1, callback);
	};

	Hamster.prototype.boardTurn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__board(-45, 45, 2, callback);
		} else {
			this.__board(45, -45, 3, callback);
		}
	};

	Hamster.prototype.__motion = function(type, leftVelocity, rightVelocity, secs, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelBoard();
		self.__cancelWheel();
		self.__cancelLineTracer();

		secs = parseFloat(secs);
		if(secs && secs > 0) {
			var id = self.__issueWheelId();
			motoring.leftWheel = leftVelocity;
			motoring.rightWheel = rightVelocity;
			motoring.motion = type;
			self.__setLineTracerMode(0);
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
			self.__setLineTracerMode(0);
			callback();
		}
	};

	Hamster.prototype.moveForward = function(callback) {
		this.__motion(1, 30, 30, 1, callback);
	};

	Hamster.prototype.moveBackward = function(callback) {
		this.__motion(2, -30, -30, 1, callback);
	};

	Hamster.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(3, -30, 30, 1, callback);
		} else {
			this.__motion(4, 30, -30, 1, callback);
		}
	};

	Hamster.prototype.moveForwardSecs = function(secs, callback) {
		this.__motion(1, 30, 30, secs, callback);
	};

	Hamster.prototype.moveBackwardSecs = function(secs, callback) {
		this.__motion(2, -30, -30, secs, callback);
	};

	Hamster.prototype.turnSecs = function(direction, secs, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(3, -30, 30, secs, callback);
		} else {
			this.__motion(4, 30, -30, secs, callback);
		}
	};
	
	Hamster.prototype.__stopMotion = function() {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.moveForwardUnit = function(value, unit, callback) {
		if(UNITS[unit] == SECONDS) {
			this.moveForwardSecs(value, callback);
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.moveBackwardUnit = function(value, unit, callback) {
		if(UNITS[unit] == SECONDS) {
			this.moveBackwardSecs(value, callback);
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.turnUnit = function(direction, value, unit, callback) {
		if(UNITS[unit] == SECONDS) {
			this.turnSecs(direction, value, callback);
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.pivotUnit = function(wheel, value, unit, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			if(PARTS[wheel] == LEFT) {
				if(TOWARDS[toward] == FORWARD) {
					this.__motion(5, 0, 30, value, callback);
				} else {
					this.__motion(6, 0, -30, value, callback);
				}
			} else {
				if(TOWARDS[toward] == FORWARD) {
					this.__motion(7, 30, 0, value, callback);
				} else {
					this.__motion(8, -30, 0, value, callback);
				}
			}
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.swingUnit = function(wheel, value, unit, radius, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			radius = parseFloat(radius);
			if((typeof radius == 'number') && radius >= 0) {
				this.motoring.radius = radius;
				if(DIRECTIONS[wheel] == LEFT) {
					if(TOWARDS[toward] == FORWARD) {
						this.__motion(9, 0, 0, value, callback);
					} else {
						this.__motion(10, 0, 0, value, callback);
					}
				} else {
					if(TOWARDS[toward] == FORWARD) {
						this.__motion(11, 0, 0, value, callback);
					} else {
						this.__motion(12, 0, 0, value, callback);
					}
				}
			} else {
				this.__stopMotion();
				callback();
			}
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.pivotPenUnit = function(pen, value, unit, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			if(PARTS[pen] == LEFT) {
				if(TOWARDS[toward] == FORWARD) {
					this.__motion(13, 0, 0, value, callback);
				} else {
					this.__motion(14, 0, 0, value, callback);
				}
			} else {
				if(TOWARDS[toward] == FORWARD) {
					this.__motion(15, 0, 0, value, callback);
				} else {
					this.__motion(16, 0, 0, value, callback);
				}
			}
		} else {
			this.__stopMotion();
		}
	};
	
	Hamster.prototype.swingPenUnit = function(pen, direction, value, unit, radius, toward, callback) {
		if(UNITS[unit] == SECONDS) {
			radius = parseFloat(radius);
			if((typeof radius == 'number') && radius >= 0) {
				this.motoring.radius = radius;
				if(PARTS[pen] == LEFT) {
					if(DIRECTIONS[direction] == LEFT) {
						if(TOWARDS[toward] == FORWARD) {
							this.__motion(17, 0, 0, value, callback);
						} else {
							this.__motion(18, 0, 0, value, callback);
						}
					} else {
						if(TOWARDS[toward] == FORWARD) {
							this.__motion(19, 0, 0, value, callback);
						} else {
							this.__motion(20, 0, 0, value, callback);
						}
					}
				} else {
					if(DIRECTIONS[direction] == LEFT) {
						if(TOWARDS[toward] == FORWARD) {
							this.__motion(21, 0, 0, value, callback);
						} else {
							this.__motion(22, 0, 0, value, callback);
						}
					} else {
						if(TOWARDS[toward] == FORWARD) {
							this.__motion(23, 0, 0, value, callback);
						} else {
							this.__motion(24, 0, 0, value, callback);
						}
					}
				}
			} else {
				this.__stopMotion();
				callback();
			}
		} else {
			this.__stopMotion();
		}
	};

	Hamster.prototype.setWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel = leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel = rightVelocity;
		}
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.changeWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		leftVelocity = parseFloat(leftVelocity);
		rightVelocity = parseFloat(rightVelocity);
		if(typeof leftVelocity == 'number') {
			motoring.leftWheel += leftVelocity;
		}
		if(typeof rightVelocity == 'number') {
			motoring.rightWheel += rightVelocity;
		}
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.setWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

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
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.changeWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

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
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.followLine = function(color, sensor) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		var mode = 1;
		sensor = PARTS[sensor];
		if(sensor == RIGHT) mode = 2;
		else if(sensor == BOTH) mode = 3;
		if(VALUES[color] == WHITE) mode += 7;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = 0;
		this.__setLineTracerMode(mode);
	};

	Hamster.prototype.followLineUntil = function(color, direction, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();

		var mode = 4;
		direction = DIRECTIONS[direction];
		if(direction == RIGHT) mode = 5;
		else if(direction == FRONT) mode = 6;
		else if(direction == REAR) mode = 7;
		if(VALUES[color] == WHITE) mode += 7;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = 0;
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};

	Hamster.prototype.setLineTracerSpeed = function(speed) {
		speed = parseInt(speed);
		if(typeof speed == 'number') {
			this.__setLineTracerSpeed(speed);
		}
	};
	
	Hamster.prototype.setLineTracerGain = function(gain) {
	};

	Hamster.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelWheel();
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.motion = 0;
		this.__setLineTracerMode(0);
	};

	Hamster.prototype.setLed = function(led, color) {
		color = COLORS[color];
		if(color && color > 0) {
			led = PARTS[led];
			if(led == LEFT) {
				this.__setLeftLed(color);
			} else if(led == RIGHT) {
				this.__setRightLed(color);
			} else {
				this.__setLeftLed(color);
				this.__setRightLed(color);
			}
		}
	};

	Hamster.prototype.clearLed = function(led) {
		led = PARTS[led];
		if(led == LEFT) {
			this.__setLeftLed(0);
		} else if(led == RIGHT) {
			this.__setRightLed(0);
		} else {
			this.__setLeftLed(0);
			this.__setRightLed(0);
		}
	};

	Hamster.prototype.setRgbArray = function(led, rgb) {
	};

	Hamster.prototype.setRgb = function(led, red, green, blue) {
	};

	Hamster.prototype.changeRgb = function(led, red, green, blue) {
	};

	Hamster.prototype.runBeep = function(count, id, callback) {
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

	Hamster.prototype.beep = function(callback) {
		this.__cancelNote();
		var id = this.__issueNoteId();
		this.runBeep(1, id, callback);
	};

	Hamster.prototype.playSound = function(sound, count) {
		this.__cancelNote();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		count = parseInt(count);
		if(SOUNDS[sound] == BEEP && count) {
			this.runBeep(count);
		}
	};

	Hamster.prototype.playSoundUntil = function(sound, count, callback) {
		this.__cancelNote();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		count = parseInt(count);
		if(SOUNDS[sound] == BEEP && count) {
			var id = this.__issueNoteId();
			this.runBeep(count, id, callback);
		}
	};

	Hamster.prototype.setBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer = hz;
		}
		this.__setNote(0);
	};

	Hamster.prototype.changeBuzzer = function(hz) {
		var motoring = this.motoring;
		this.__cancelNote();

		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer += hz;
		}
		this.__setNote(0);
	};

	Hamster.prototype.clearBuzzer = function() {
		this.__cancelNote();
		this.motoring.buzzer = 0;
		this.__setNote(0);
	};

	Hamster.prototype.clearSound = function() {
		this.clearBuzzer();
	};

	Hamster.prototype.playNote = function(note, octave) {
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

	Hamster.prototype.playNoteBeat = function(note, octave, beat, callback) {
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

	Hamster.prototype.restBeat = function(beat, callback) {
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

	Hamster.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	Hamster.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	Hamster.prototype.getLeftProximity = function() {
		return this.sensory.leftProximity;
	};

	Hamster.prototype.getRightProximity = function() {
		return this.sensory.rightProximity;
	};

	Hamster.prototype.getLeftFloor = function() {
		return this.sensory.leftFloor;
	};

	Hamster.prototype.getRightFloor = function() {
		return this.sensory.rightFloor;
	};

	Hamster.prototype.getAccelerationX = function() {
		return this.sensory.accelerationX;
	};

	Hamster.prototype.getAccelerationY = function() {
		return this.sensory.accelerationY;
	};

	Hamster.prototype.getAccelerationZ = function() {
		return this.sensory.accelerationZ;
	};

	Hamster.prototype.getLight = function() {
		return this.sensory.light;
	};

	Hamster.prototype.getTemperature = function() {
		return this.sensory.temperature;
	};

	Hamster.prototype.getSignalStrength = function() {
		return this.sensory.signalStrength;
	};

	Hamster.prototype.checkHandFound = function() {
		var sensory = this.sensory;
		return (sensory.handFound === undefined) ? (sensory.leftProximity > 50 || sensory.rightProximity > 50) : sensory.handFound;
	};

	Hamster.prototype.checkTilt = function(tilt) {
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

	Hamster.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};

	Hamster.prototype.setIoMode = function(port, mode) {
		this.__cancelIo();
		mode = IO_MODES[mode];
		if(typeof mode == 'number') {
			if(port == 'A') {
				this.__setIoModeA(mode);
			} else if(port == 'B') {
				this.__setIoModeB(mode);
			} else {
				this.__setIoModeA(mode);
				this.__setIoModeB(mode);
			}
		}
	};

	Hamster.prototype.setOutput = function(port, value) {
		var motoring = this.motoring;
		this.__cancelIo();
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

	Hamster.prototype.changeOutput = function(port, value) {
		var motoring = this.motoring;
		this.__cancelIo();
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

	Hamster.prototype.gripper = function(action, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelIo();

		var id = self.__issueIoId();
		self.__setIoModeA(10);
		self.__setIoModeB(10);
		if(GRIPPERS[action] == OPEN) {
			motoring.outputA = 1;
			motoring.outputB = 0;
		} else {
			motoring.outputA = 0;
			motoring.outputB = 1;
		}
		self.ioTimer = setTimeout(function() {
			if(self.ioId == id) {
				self.__cancelIo();
				callback();
			}
		}, 500);
		self.timeouts.push(self.ioTimer);
	};

	Hamster.prototype.releaseGripper = function() {
		var motoring = this.motoring;
		this.__cancelIo();
		this.__setIoModeA(10);
		this.__setIoModeB(10);
		motoring.outputA = 0;
		motoring.outputB = 0;
	};

	Hamster.prototype.getInputA = function() {
		return this.sensory.inputA;
	};

	Hamster.prototype.getInputB = function() {
		return this.sensory.inputB;
	};

	function HamsterS(index) {
		this.sensory = {
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
		this.motoring = {
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
		this.blockId = 0;
		this.motionCallback = undefined;
		this.lineTracerCallback = undefined;
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.ioId = 0;
		this.ioTimer = undefined;
		this.tempo = 60;
		this.speed = 5;
		this.gain = -1;
		this.timeouts = [];
	}
	
	HamsterS.prototype.reset = function() {
		var motoring = this.motoring;
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

		this.blockId = 0;
		this.motionCallback = undefined;
		this.lineTracerCallback = undefined;
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
		this.currentSound = 0;
		this.soundRepeat = 1;
		this.soundCallback = undefined;
		this.noteId = 0;
		this.noteTimer1 = undefined;
		this.noteTimer2 = undefined;
		this.ioId = 0;
		this.ioTimer = undefined;
		this.tempo = 60;
		this.speed = 5;
		this.gain = -1;

		this.__removeAllTimeouts();
	};
	
	HamsterS.prototype.__removeTimeout = function(id) {
		clearTimeout(id);
		var idx = this.timeouts.indexOf(id);
		if(idx >= 0) {
			this.timeouts.splice(idx, 1);
		}
	};

	HamsterS.prototype.__removeAllTimeouts = function() {
		var timeouts = this.timeouts;
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		this.timeouts = [];
	};

	HamsterS.prototype.clearMotoring = function() {
		this.motoring.map = 0xfc000000;
		this.motoring.map2 = 0xc0000000;
	};

	HamsterS.prototype.clearEvent = function() {
		this.freeFall = false;
		this.tap = false;
	};

	HamsterS.prototype.__setPulse = function(pulse) {
		this.motoring.pulse = pulse;
		this.motoring.map2 |= 0x20000000;
	};

	HamsterS.prototype.__setLineTracerMode = function(mode) {
		this.motoring.lineTracerMode = mode;
		this.motoring.map |= 0x00200000;
	};

	HamsterS.prototype.__setLineTracerGain = function(gain) {
		this.motoring.lineTracerGain = gain;
		this.motoring.map2 |= 0x08000000;
	};

	HamsterS.prototype.__setLineTracerSpeed = function(speed) {
		this.motoring.lineTracerSpeed = speed;
		this.motoring.map |= 0x00100000;
	};

	HamsterS.prototype.__cancelLineTracer = function() {
		this.lineTracerCallback = undefined;
	};

	HamsterS.prototype.__setMotion = function(type, unit, speed, value, radius) {
		var motoring = this.motoring;
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map2 |= 0x02000000;
	};

	HamsterS.prototype.__cancelMotion = function() {
		this.motionCallback = undefined;
	};

	HamsterS.prototype.__cancelBoard = function() {
		this.boardCommand = 0;
		this.boardState = 0;
		this.boardCount = 0;
		this.boardCallback = undefined;
	};

	HamsterS.prototype.__setNote = function(note) {
		this.motoring.note = note;
		this.motoring.map |= 0x00400000;
	};

	HamsterS.prototype.__issueNoteId = function() {
		this.noteId = this.blockId = (this.blockId % 65535) + 1;
		return this.noteId;
	};

	HamsterS.prototype.__cancelNote = function() {
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

	HamsterS.prototype.__setSound = function(sound) {
		this.motoring.sound = sound;
		this.motoring.map2 |= 0x10000000;
	};

	HamsterS.prototype.__runSound = function(sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			this.currentSound = sound;
			this.soundRepeat = count;
			this.__setSound(sound);
		}
	};

	HamsterS.prototype.__cancelSound = function() {
		this.soundCallback = undefined;
	};

	HamsterS.prototype.__setIoModeA = function(mode) {
		this.motoring.ioModeA = mode;
		this.motoring.map |= 0x00080000;
	};

	HamsterS.prototype.__setIoModeB = function(mode) {
		this.motoring.ioModeB = mode;
		this.motoring.map |= 0x00040000;
	};

	HamsterS.prototype.__issueIoId = function() {
		this.ioId = this.blockId = (this.blockId % 65535) + 1;
		return this.ioId;
	};

	HamsterS.prototype.__cancelIo = function() {
		this.ioId = 0;
		if(this.ioTimer !== undefined) {
			this.__removeTimeout(this.ioTimer);
		}
		this.ioTimer = undefined;
	};

	HamsterS.prototype.handleSensory = function() {
		var self = this;
		var sensory = self.sensory;

		if(self.lineTracerCallback && (sensory.map & 0x00000010) != 0) {
			if(sensory.lineTracerState == 0x40) {
				self.__setLineTracerMode(0);
				var callback = self.lineTracerCallback;
				self.__cancelLineTracer();
				if(callback) callback();
			}
		}
		if(self.boardCallback) {
			var motoring = self.motoring;
			if(self.boardCommand == 1) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
								self.boardCount ++;
							else
								self.boardCount = 0;
							var diff = sensory.leftFloor - sensory.rightFloor;
							motoring.leftWheel = 45 + diff * 0.25;
							motoring.rightWheel = 45 - diff * 0.25;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						motoring.leftWheel = 45 + diff * 0.25;
						motoring.rightWheel = 45 - diff * 0.25;
						self.boardState = 3;
						self.wheelTimer = setTimeout(function() {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							self.boardState = 4;
							if(self.wheelTimer !== undefined) self.__removeTimeout(self.wheelTimer);
							self.wheelTimer = undefined;
						}, 250);
						self.timeouts.push(self.wheelTimer);
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
						var callback = self.boardCallback;
						self.__cancelBoard();
						if(callback) callback();
						break;
					}
				}
			} else if(self.boardCommand == 2) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor > 50)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.leftFloor < 20) {
							self.boardState = 3;
						}
						break;
					}
					case 3: {
						if(self.boardCount < 2) {
							if(sensory.leftFloor < 20)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.leftFloor > 50) {
							self.boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.leftFloor - sensory.rightFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = self.boardCallback;
							self.__cancelBoard();
							if(callback) callback();
						} else {
							motoring.leftWheel = diff * 0.5;
							motoring.rightWheel = -diff * 0.5;
						}
						break;
					}
				}
			} else if(self.boardCommand == 3) {
				switch(self.boardState) {
					case 1: {
						if(self.boardCount < 2) {
							if(sensory.rightFloor > 50)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 2;
						}
						break;
					}
					case 2: {
						if(sensory.rightFloor < 20) {
							self.boardState = 3;
						}
						break;
					}
					case 3: {
						if(self.boardCount < 2) {
							if(sensory.rightFloor < 20)
								self.boardCount ++;
						} else {
							self.boardCount = 0;
							self.boardState = 4;
						}
						break;
					}
					case 4: {
						if(sensory.rightFloor > 50) {
							self.boardState = 5;
						}
						break;
					}
					case 5: {
						var diff = sensory.rightFloor - sensory.leftFloor;
						if(diff > -15) {
							motoring.leftWheel = 0;
							motoring.rightWheel = 0;
							var callback = self.boardCallback;
							self.__cancelBoard();
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
		if(self.motionCallback && (sensory.map2 & 0x00000800) != 0) {
			if(sensory.wheelState == 2) {
				self.motoring.leftWheel = 0;
				self.motoring.rightWheel = 0;
				var callback = self.motionCallback;
				self.__cancelMotion();
				if(callback) callback();
			}
		}
		if((sensory.map2 & 0x00000400) != 0) {
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

	HamsterS.prototype.__board = function(leftVelocity, rightVelocity, command, callback) {
		var motoring = this.motoring;
		this.__cancelMotion();
		this.__cancelLineTracer();

		motoring.leftWheel = leftVelocity;
		motoring.rightWheel = rightVelocity;
		this.boardCommand = command;
		this.boardCount = 0;
		this.boardState = 1;
		this.boardCallback = callback;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.boardForward = function(callback) {
		this.__board(45, 45, 1, callback);
	};

	HamsterS.prototype.boardTurn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__board(-45, 45, 2, callback);
		} else {
			this.__board(45, -45, 3, callback);
		}
	};

	HamsterS.prototype.__motion = function(type, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(type, 1, 0, 0, 0); // type, unit, speed, value, radius
		this.motionCallback = callback;
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.__motionUnit = function(type, unit, value, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

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

	HamsterS.prototype.__motionUnitRadius = function(type, unit, value, radius, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

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

	HamsterS.prototype.moveForward = function(callback) {
		this.__motion(101, callback);
	};

	HamsterS.prototype.moveBackward = function(callback) {
		this.__motion(102, callback);
	};

	HamsterS.prototype.turn = function(direction, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motion(103, callback);
		} else {
			this.__motion(104, callback);
		}
	};

	HamsterS.prototype.moveForwardSecs = function(secs, callback) {
		this.__motionUnit(1, 2, secs, callback);
	};

	HamsterS.prototype.moveBackwardSecs = function(secs, callback) {
		this.__motionUnit(2, 2, secs, callback);
	};

	HamsterS.prototype.turnSecs = function(direction, secs, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motionUnit(3, 2, secs, callback);
		} else {
			this.__motionUnit(4, 2, secs, callback);
		}
	};

	HamsterS.prototype.moveForwardUnit = function(value, unit, callback) {
		this.__motionUnit(1, UNITS[unit], value, callback);
	};

	HamsterS.prototype.moveBackwardUnit = function(value, unit, callback) {
		this.__motionUnit(2, UNITS[unit], value, callback);
	};

	HamsterS.prototype.turnUnit = function(direction, value, unit, callback) {
		if(DIRECTIONS[direction] == LEFT) {
			this.__motionUnit(3, UNITS[unit], value, callback);
		} else {
			this.__motionUnit(4, UNITS[unit], value, callback);
		}
	};

	HamsterS.prototype.pivotUnit = function(wheel, value, unit, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[wheel] == LEFT) {
			if(TOWARDS[toward] == FORWARD) this.__motionUnit(5, unit, value, callback);
			else this.__motionUnit(6, unit, value, callback);
		} else {
			if(TOWARDS[toward] == FORWARD) this.__motionUnit(7, unit, value, callback);
			else this.__motionUnit(8, unit, value, callback);
		}
	};

	HamsterS.prototype.swingUnit = function(direction, value, unit, radius, toward, callback) {
		unit = UNITS[unit];
		if(DIRECTIONS[direction] == LEFT) {
			if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(9, unit, value, radius, callback);
			else this.__motionUnitRadius(10, unit, value, radius, callback);
		} else {
			if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(11, unit, value, radius, callback);
			else this.__motionUnitRadius(12, unit, value, radius, callback);
		}
	};

	HamsterS.prototype.pivotPenUnit = function(pen, value, unit, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[pen] == LEFT) {
			if(TOWARDS[toward] == FORWARD) this.__motionUnit(13, unit, value, callback);
			else this.__motionUnit(14, unit, value, callback);
		} else {
			if(TOWARDS[toward] == FORWARD) this.__motionUnit(15, unit, value, callback);
			else this.__motionUnit(16, unit, value, callback);
		}
	};
	
	HamsterS.prototype.swingPenUnit = function(pen, direction, value, unit, radius, toward, callback) {
		unit = UNITS[unit];
		if(PARTS[pen] == LEFT) {
			if(DIRECTIONS[direction] == LEFT) {
				if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(17, unit, value, radius, callback);
				else this.__motionUnitRadius(18, unit, value, radius, callback);
			} else {
				if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(19, unit, value, radius, callback);
				else this.__motionUnitRadius(20, unit, value, radius, callback);
			}
		} else {
			if(DIRECTIONS[direction] == LEFT) {
				if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(21, unit, value, radius, callback);
				else this.__motionUnitRadius(22, unit, value, radius, callback);
			} else {
				if(TOWARDS[toward] == FORWARD) this.__motionUnitRadius(23, unit, value, radius, callback);
				else this.__motionUnitRadius(24, unit, value, radius, callback);
			}
		}
	};

	HamsterS.prototype.setWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

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

	HamsterS.prototype.changeWheels = function(leftVelocity, rightVelocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

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

	HamsterS.prototype.setWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

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

	HamsterS.prototype.changeWheel = function(wheel, velocity) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

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

	HamsterS.prototype.followLine = function(color, sensor) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		var mode = 1;
		sensor = PARTS[sensor];
		if(sensor == RIGHT) mode = 2;
		else if(sensor == BOTH) mode = 3;
		if(VALUES[color] == WHITE) mode += 7;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
	};

	HamsterS.prototype.followLineUntil = function(color, direction, callback) {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();

		var mode = 4;
		direction = DIRECTIONS[direction];
		if(direction == RIGHT) mode = 5;
		else if(direction == FRONT) mode = 6;
		else if(direction == REAR) mode = 7;
		if(VALUES[color] == WHITE) mode += 7;

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(mode);
		this.lineTracerCallback = callback;
	};

	HamsterS.prototype.setLineTracerSpeed = function(speed) {
		speed = parseInt(speed);
		var gain = this.gain;
		if(gain < 0) gain = SPEED2GAINS[speed];
		if(speed && gain && speed > 0 && gain > 0) {
			this.speed = speed;
			this.__setLineTracerSpeed(speed);
			this.__setLineTracerGain(gain);
		}
	};
	
	HamsterS.prototype.setLineTracerGain = function(gain) {
		gain = parseInt(gain);
		if(gain && gain > 0) {
			this.gain = gain;
			this.__setLineTracerGain(gain);
		} else {
			this.gain = -1;
			gain = SPEED2GAINS[this.speed];
			if(gain && gain > 0) {
				this.__setLineTracerGain(gain);
			}
		}
	};

	HamsterS.prototype.stop = function() {
		var motoring = this.motoring;
		this.__cancelBoard();
		this.__cancelMotion();
		this.__cancelLineTracer();

		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		this.__setPulse(0);
		this.__setMotion(0, 0, 0, 0, 0);
		this.__setLineTracerMode(0);
	};

	HamsterS.prototype.setLed = function(led, color) {
		var rgb = RGB_COLORS[color];
		if(rgb) {
			this.setRgb(led, rgb[0], rgb[1], rgb[2]);
		}
	};

	HamsterS.prototype.clearLed = function(led) {
		this.setRgb(led, 0, 0, 0);
	};

	HamsterS.prototype.setRgbArray = function(led, rgb) {
		if(rgb) {
			this.setRgb(led, rgb[0], rgb[1], rgb[2]);
		}
	};

	HamsterS.prototype.setRgb = function(led, red, green, blue) {
		var motoring = this.motoring;
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		led = PARTS[led];
		if(led == LEFT) {
			if(typeof red == 'number') {
				motoring.leftRed = red;
			}
			if(typeof green == 'number') {
				motoring.leftGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.leftBlue = blue;
			}
		} else if(led == RIGHT) {
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

	HamsterS.prototype.changeRgb = function(led, red, green, blue) {
		var motoring = this.motoring;
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		led = PARTS[led];
		if(led == LEFT) {
			if(typeof red == 'number') {
				motoring.leftRed += red;
			}
			if(typeof green == 'number') {
				motoring.leftGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.leftBlue += blue;
			}
		} else if(led == RIGHT) {
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

	HamsterS.prototype.beep = function(callback) {
		this.playSoundUntil('beep', 1, callback);
	};

	HamsterS.prototype.playSound = function(sound, count) {
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

	HamsterS.prototype.playSoundUntil = function(sound, count, callback) {
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

	HamsterS.prototype.setBuzzer = function(hz) {
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

	HamsterS.prototype.changeBuzzer = function(hz) {
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

	HamsterS.prototype.clearBuzzer = function() {
		this.clearSound();
	};

	HamsterS.prototype.clearSound = function() {
		this.__cancelNote();
		this.__cancelSound();
		this.motoring.buzzer = 0;
		this.__setNote(0);
		this.__runSound(0);
	};

	HamsterS.prototype.playNote = function(note, octave) {
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

	HamsterS.prototype.playNoteBeat = function(note, octave, beat, callback) {
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

	HamsterS.prototype.restBeat = function(beat, callback) {
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

	HamsterS.prototype.setTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo = bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	HamsterS.prototype.changeTempo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			this.tempo += bpm;
			if(this.tempo < 1) this.tempo = 1;
		}
	};

	HamsterS.prototype.getLeftProximity = function() {
		return this.sensory.leftProximity;
	};

	HamsterS.prototype.getRightProximity = function() {
		return this.sensory.rightProximity;
	};

	HamsterS.prototype.getLeftFloor = function() {
		return this.sensory.leftFloor;
	};

	HamsterS.prototype.getRightFloor = function() {
		return this.sensory.rightFloor;
	};

	HamsterS.prototype.getAccelerationX = function() {
		return this.sensory.accelerationX;
	};

	HamsterS.prototype.getAccelerationY = function() {
		return this.sensory.accelerationY;
	};

	HamsterS.prototype.getAccelerationZ = function() {
		return this.sensory.accelerationZ;
	};

	HamsterS.prototype.getLight = function() {
		return this.sensory.light;
	};

	HamsterS.prototype.getTemperature = function() {
		return this.sensory.temperature;
	};

	HamsterS.prototype.getSignalStrength = function() {
		return this.sensory.signalStrength;
	};

	HamsterS.prototype.checkHandFound = function() {
		var sensory = this.sensory;
		return (sensory.handFound === undefined) ? (sensory.leftProximity > 50 || sensory.rightProximity > 50) : sensory.handFound;
	};

	HamsterS.prototype.checkTilt = function(tilt) {
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

	HamsterS.prototype.checkBattery = function(battery) {
		return this.sensory.batteryState == BATTERY_STATES[battery];
	};

	HamsterS.prototype.setIoMode = function(port, mode) {
		this.__cancelIo();
		mode = IO_MODES[mode];
		if(typeof mode == 'number') {
			if(port == 'A') {
				this.__setIoModeA(mode);
			} else if(port == 'B') {
				this.__setIoModeB(mode);
			} else {
				this.__setIoModeA(mode);
				this.__setIoModeB(mode);
			}
		}
	};

	HamsterS.prototype.setOutput = function(port, value) {
		var motoring = this.motoring;
		this.__cancelIo();
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

	HamsterS.prototype.changeOutput = function(port, value) {
		var motoring = this.motoring;
		this.__cancelIo();
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

	HamsterS.prototype.gripper = function(action, callback) {
		var self = this;
		var motoring = self.motoring;
		self.__cancelIo();

		var id = self.__issueIoId();
		self.__setIoModeA(10);
		self.__setIoModeB(10);
		if(GRIPPERS[action] == OPEN) {
			motoring.outputA = 1;
			motoring.outputB = 0;
		} else {
			motoring.outputA = 0;
			motoring.outputB = 1;
		}
		self.ioTimer = setTimeout(function() {
			if(self.ioId == id) {
				self.__cancelIo();
				callback();
			}
		}, 500);
		self.timeouts.push(self.ioTimer);
	};

	HamsterS.prototype.releaseGripper = function() {
		var motoring = this.motoring;
		this.__cancelIo();
		this.__setIoModeA(10);
		this.__setIoModeB(10);
		motoring.outputA = 0;
		motoring.outputB = 0;
	};

	HamsterS.prototype.getInputA = function() {
		return this.sensory.inputA;
	};

	HamsterS.prototype.getInputB = function() {
		return this.sensory.inputB;
	};

	function getOrCreateRobot(group, module, index) {
		var key = module + index;
		var robot = robots[key];
		if(!robot) {
			switch(module) {
				case HAMSTER: robot = new Hamster(index); break;
				case HAMSTER_S: robot = new HamsterS(index); break;
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

	ext.moveForwardForSecs = function(sec, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveForwardSecs(sec, callback);
	};

	ext.moveBackwardForSecs = function(sec, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.moveBackwardSecs(sec, callback);
	};

	ext.turnForSecs = function(direction, sec, callback) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) robot.turnSecs(direction, sec, callback);
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
		if(robot) robot.followLine(color, which);
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
		else return 0;
	};

	ext.rightProximity = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getRightProximity();
		else return 0;
	};

	ext.leftFloor = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getLeftFloor();
		else return 0;
	};

	ext.rightFloor = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getRightFloor();
		else return 0;
	};

	ext.accelerationX = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getAccelerationX();
		else return 0;
	};

	ext.accelerationY = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getAccelerationY();
		else return 0;
	};

	ext.accelerationZ = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getAccelerationZ();
		else return 0;
	};

	ext.light = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getLight();
		else return 0;
	};

	ext.temperature = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getTemperature();
		else return 0;
	};

	ext.signalStrength = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getSignalStrength();
		else return 0;
	};

	ext.whenHandFound = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.whenTilt = function(tilt) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.handFound = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkHandFound();
		return false;
	};
	
	ext.tilt = function(tilt) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkTilt(tilt);
		return false;
	};
	
	ext.battery = function(state) {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.checkBattery(state);
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
		else return 0;
	};

	ext.inputB = function() {
		var robot = getRobot(HAMSTER, 0);
		if(robot) return robot.getInputB();
		else return 0;
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
