(function(ext) {

	var sensory = {
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
		handFound: false
	};
	var motoring = {
		module: 'uoalbert',
		map: 0xbf800000,
		leftWheel: 0,
		rightWheel: 0,
		leftEyeRed: 0,
		leftEyeGreen: 0,
		leftEyeBlue: 0,
		rightEyeRed: 0,
		rightEyeGreen: 0,
		rightEyeBlue: 0,
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
	var packet = {
		version: 1,
		robot: motoring
 	};
	var connectionState = 1;
	var pulseCallback = undefined;
	var soundId = 0;
	var soundRepeat = 1;
	var soundCallback = undefined;
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
		uz: [ 'Robot Kodlash dasturini ishga tushiring.', 'Robot ulanmagan.', 'Tayyorlangan' ]
	};
	const EXTENSION_NAME = {
		en: 'UO Albert',
		ko: 'UO 알버트'
	};
	const BLOCKS = {
		en1: [
			['w', 'move forward', 'uoMoveForward'],
			['w', 'move backward', 'uoMoveBackward'],
			['w', 'turn %m.left_right', 'uoTurn', 'left'],
			['-'],
			[' ', 'set %m.left_right_both eye to %m.color', 'uoSetEyeToColor', 'left', 'red'],
			[' ', 'clear %m.left_right_both eye', 'uoClearEye', 'left'],
			['-'],
			[' ', 'play sound %m.sound', 'uoPlaySound', 'beep'],
			[' ', 'clear sound', 'uoClearSound'],
			['-'],
			['b', 'hand found?', 'uoHandFound'],
			['b', 'touching?', 'uoTouching']
		],
		en2: [
			['w', 'move forward %n %m.cm_sec', 'uoMoveForwardUnit', 5, 'cm'],
			['w', 'move backward %n %m.cm_sec', 'uoMoveBackwardUnit', 5, 'cm'],
			['w', 'turn %m.left_right %n %m.deg_sec in place', 'uoTurnUnit', 'left', 90, 'degrees'],
			['w', 'pivot around %m.left_right wheel %n %m.deg_sec in %m.front_rear direction', 'uoPivotUnit', 'left', 90, 'degrees', 'front'],
			['-'],
			[' ', 'set %m.left_right_both eye to %m.color', 'uoSetEyeToColor', 'left', 'red'],
			[' ', 'clear %m.left_right_both eye', 'uoClearEye', 'left'],
			['-'],
			[' ', 'play sound %m.sound %n times', 'uoPlaySoundTimes', 'beep', 1],
			['w', 'play sound %m.sound %n times until done', 'uoPlaySoundTimesUntilDone', 'beep', 1],
			[' ', 'clear sound', 'uoClearSound'],
			['w', 'play note %m.note %m.octave for %d.beats beats', 'uoPlayNoteForBeats', 'C', '4', 0.5],
			['w', 'rest for %d.beats beats', 'uoRestForBeats', 0.25],
			[' ', 'change tempo by %n', 'uoChangeTempoBy', 20],
			[' ', 'set tempo to %n bpm', 'uoSetTempoTo', 60],
			['-'],
			['b', 'hand found?', 'uoHandFound'],
			['b', 'touching?', 'uoTouching']
		],
		en3: [
			['w', 'move forward %n %m.move_unit', 'uoMoveForwardUnit', 5, 'cm'],
			['w', 'move backward %n %m.move_unit', 'uoMoveBackwardUnit', 5, 'cm'],
			['w', 'turn %m.left_right %n %m.turn_unit in place', 'uoTurnUnit', 'left', 90, 'degrees'],
			['w', 'pivot around %m.left_right wheel %n %m.turn_unit in %m.front_rear direction', 'uoPivotUnit', 'left', 90, 'degrees', 'front'],
			[' ', 'change wheels by left: %n right: %n', 'uoChangeWheelsByLeftRight', 10, 10],
			[' ', 'set wheels to left: %n right: %n', 'uoSetWheelsToLeftRight', 50, 50],
			[' ', 'change %m.left_right_both wheel by %n', 'uoChangeWheelBy', 'left', 10],
			[' ', 'set %m.left_right_both wheel to %n', 'uoSetWheelTo', 'left', 50],
			[' ', 'stop', 'uoStop'],
			[' ', 'set board size to width: %d.board_size height: %d.board_size', 'uoSetBoardSizeTo', 108, 76],
			['-'],
			[' ', 'set %m.left_right_both eye to %m.color', 'uoSetEyeToColor', 'left', 'red'],
			[' ', 'change %m.left_right_both eye by r: %n g: %n b: %n', 'uoChangeEyeByRGB', 'left', 10, 0, 0],
			[' ', 'set %m.left_right_both eye to r: %n g: %n b: %n', 'uoSetEyeToRGB', 'left', 255, 0, 0],
			[' ', 'clear %m.left_right_both eye', 'uoClearEye', 'left'],
			['-'],
			[' ', 'play sound %m.sound %n times', 'uoPlaySoundTimes', 'beep', 1],
			['w', 'play sound %m.sound %n times until done', 'uoPlaySoundTimesUntilDone', 'beep', 1],
			[' ', 'change buzzer by %n', 'uoChangeBuzzerBy', 10],
			[' ', 'set buzzer to %n', 'uoSetBuzzerTo', 1000],
			[' ', 'clear sound', 'uoClearSound'],
			[' ', 'play note %m.note %m.octave', 'uoPlayNote', 'C', '4'],
			['w', 'play note %m.note %m.octave for %d.beats beats', 'uoPlayNoteForBeats', 'C', '4', 0.5],
			['w', 'rest for %d.beats beats', 'uoRestForBeats', 0.25],
			[' ', 'change tempo by %n', 'uoChangeTempoBy', 20],
			[' ', 'set tempo to %n bpm', 'uoSetTempoTo', 60],
			['-'],
			['r', 'left proximity', 'uoLeftProximity'],
			['r', 'right proximity', 'uoRightProximity'],
			['r', 'x acceleration', 'uoAccelerationX'],
			['r', 'y acceleration', 'uoAccelerationY'],
			['r', 'z acceleration', 'uoAccelerationZ'],
			['r', 'touch', 'uoTouch'],
			['r', 'oid', 'uoOid'],
			['r', 'x position', 'uoPositionX'],
			['r', 'y position', 'uoPositionY'],
			['r', 'light', 'uoLight'],
			['r', 'temperature', 'uoTemperature'],
			['r', 'battery', 'uoBattery'],
			['r', 'signal strength', 'uoSignalStrength'],
			['b', 'hand found?', 'uoHandFound'],
			['b', 'touching?', 'uoTouching']
		],
		ko1: [
			['w', '앞으로 이동하기', 'uoMoveForward'],
			['w', '뒤로 이동하기', 'uoMoveBackward'],
			['w', '%m.left_right 으로 돌기', 'uoTurn', '왼쪽'],
			['-'],
			[' ', '%m.left_right_both 눈을 %m.color 으로 정하기', 'uoSetEyeToColor', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both 눈 끄기', 'uoClearEye', '왼쪽'],
			['-'],
			[' ', '%m.sound 소리 재생하기', 'uoPlaySound', '삐'],
			[' ', '소리 끄기', 'uoClearSound'],
			['-'],
			['b', '손 찾음?', 'uoHandFound'],
			['b', '터치하고 있는가?', 'uoTouching']
		],
		ko2: [
			['w', '앞으로 %n %m.cm_sec 이동하기', 'uoMoveForwardUnit', 5, 'cm'],
			['w', '뒤로 %n %m.cm_sec 이동하기', 'uoMoveBackwardUnit', 5, 'cm'],
			['w', '%m.left_right 으로 %n %m.deg_sec 제자리 돌기', 'uoTurnUnit', '왼쪽', 90, '도'],
			['w', '%m.left_right 바퀴 중심으로 %n %m.deg_sec %m.front_rear 방향으로 돌기', 'uoPivotUnit', '왼쪽', 90, '도', '앞쪽'],
			['-'],
			[' ', '%m.left_right_both 눈을 %m.color 으로 정하기', 'uoSetEyeToColor', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both 눈 끄기', 'uoClearEye', '왼쪽'],
			['-'],
			[' ', '%m.sound 소리 %n 번 재생하기', 'uoPlaySoundTimes', '삐', 1],
			['w', '%m.sound 소리 %n 번 재생하고 기다리기', 'uoPlaySoundTimesUntilDone', '삐', 1],
			[' ', '소리 끄기', 'uoClearSound'],
			['w', '%m.note %m.octave 음을 %d.beats 박자 연주하기', 'uoPlayNoteForBeats', '도', '4', 0.5],
			['w', '%d.beats 박자 쉬기', 'uoRestForBeats', 0.25],
			[' ', '연주 속도를 %n 만큼 바꾸기', 'uoChangeTempoBy', 20],
			[' ', '연주 속도를 %n BPM으로 정하기', 'uoSetTempoTo', 60],
			['-'],
			['b', '손 찾음?', 'uoHandFound'],
			['b', '터치하고 있는가?', 'uoTouching']
		],
		ko3: [
			['w', '앞으로 %n %m.move_unit 이동하기', 'uoMoveForwardUnit', 5, 'cm'],
			['w', '뒤로 %n %m.move_unit 이동하기', 'uoMoveBackwardUnit', 5, 'cm'],
			['w', '%m.left_right 으로 %n %m.turn_unit 제자리 돌기', 'uoTurnUnit', '왼쪽', 90, '도'],
			['w', '%m.left_right 바퀴 중심으로 %n %m.turn_unit %m.front_rear 방향으로 돌기', 'uoPivotUnit', '왼쪽', 90, '도', '앞쪽'],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n 만큼 바꾸기', 'uoChangeWheelsByLeftRight', 10, 10],
			[' ', '왼쪽 바퀴 %n 오른쪽 바퀴 %n (으)로 정하기', 'uoSetWheelsToLeftRight', 50, 50],
			[' ', '%m.left_right_both 바퀴 %n 만큼 바꾸기', 'uoChangeWheelBy', '왼쪽', 10],
			[' ', '%m.left_right_both 바퀴 %n (으)로 정하기', 'uoSetWheelTo', '왼쪽', 50],
			[' ', '정지하기', 'uoStop'],
			[' ', '말판 크기를 폭 %d.board_size 높이 %d.board_size (으)로 정하기', 'uoSetBoardSizeTo', 108, 76],
			['-'],
			[' ', '%m.left_right_both 눈을 %m.color 으로 정하기', 'uoSetEyeToColor', '왼쪽', '빨간색'],
			[' ', '%m.left_right_both 눈을 R: %n G: %n B: %n 만큼 바꾸기', 'uoChangeEyeByRGB', '왼쪽', 10, 0, 0],
			[' ', '%m.left_right_both 눈을 R: %n G: %n B: %n (으)로 정하기', 'uoSetEyeToRGB', '왼쪽', 255, 0, 0],
			[' ', '%m.left_right_both 눈 끄기', 'uoClearEye', '왼쪽'],
			['-'],
			[' ', '%m.sound 소리 %n 번 재생하기', 'uoPlaySoundTimes', '삐', 1],
			['w', '%m.sound 소리 %n 번 재생하고 기다리기', 'uoPlaySoundTimesUntilDone', '삐', 1],
			[' ', '버저 음을 %n 만큼 바꾸기', 'uoChangeBuzzerBy', 10],
			[' ', '버저 음을 %n (으)로 정하기', 'uoSetBuzzerTo', 1000],
			[' ', '소리 끄기', 'uoClearSound'],
			[' ', '%m.note %m.octave 음을 연주하기', 'uoPlayNote', '도', '4'],
			['w', '%m.note %m.octave 음을 %d.beats 박자 연주하기', 'uoPlayNoteForBeats', '도', '4', 0.5],
			['w', '%d.beats 박자 쉬기', 'uoRestForBeats', 0.25],
			[' ', '연주 속도를 %n 만큼 바꾸기', 'uoChangeTempoBy', 20],
			[' ', '연주 속도를 %n BPM으로 정하기', 'uoSetTempoTo', 60],
			['-'],
			['r', '왼쪽 근접 센서', 'uoLeftProximity'],
			['r', '오른쪽 근접 센서', 'uoRightProximity'],
			['r', 'x축 가속도', 'uoAccelerationX'],
			['r', 'y축 가속도', 'uoAccelerationY'],
			['r', 'z축 가속도', 'uoAccelerationZ'],
			['r', '터치', 'uoTouch'],
			['r', 'OID', 'uoOid'],
			['r', 'x 위치', 'uoPositionX'],
			['r', 'y 위치', 'uoPositionY'],
			['r', '밝기', 'uoLight'],
			['r', '온도', 'uoTemperature'],
			['r', '배터리', 'uoBattery'],
			['r', '신호 세기', 'uoSignalStrength'],
			['b', '손 찾음?', 'uoHandFound'],
			['b', '터치하고 있는가?', 'uoTouching']
		]
	};
	const MENUS = {
		en: {
			'cm_sec': ['cm', 'seconds'],
			'deg_sec': ['degrees', 'seconds'],
			'move_unit': ['cm', 'seconds', 'pulses'],
			'turn_unit': ['degrees', 'seconds', 'pulses'],
			'left_right': ['left', 'right'],
			'left_right_both': ['left', 'right', 'both'],
			'front_rear': ['front', 'rear'],
			'board_size': ['37', '53', '76', '108', '153', '217'],
			'color': ['red', 'orange', 'yellow', 'green', 'sky blue', 'blue', 'violet', 'purple', 'white'],
			'sound': ['beep', 'siren', 'engine', 'robot', 'march', 'birthday', 'dibidibidip'],
			'note': ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4']
		},
		ko: {
			'cm_sec': ['cm', '초'],
			'deg_sec': ['도', '초'],
			'move_unit': ['cm', '초', '펄스'],
			'turn_unit': ['도', '초', '펄스'],
			'left_right': ['왼쪽', '오른쪽'],
			'left_right_both': ['왼쪽', '오른쪽', '양쪽'],
			'front_rear': ['앞쪽', '뒤쪽'],
			'board_size': ['37', '53', '76', '108', '153', '217'],
			'color': ['빨간색', '주황색', '노란색', '초록색', '하늘색', '파란색', '보라색', '자주색', '하얀색'],
			'sound': ['삐', '사이렌', '엔진', '로봇', '행진', '생일', '디비디비딥'],
			'note': ['도', '도#', '레', '미b', '미', '파', '파#', '솔', '솔#', '라', '시b', '시'],
			'octave': ['1', '2', '3', '4', '5', '6', '7'],
			'beats': ['¼', '½', '¾', '1', '1¼', '1½', '1¾', '2', '3', '4']
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

	var RGB_COLORS = {};
	var NOTES = {};
	var BEATS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '1¼': 1.25, '1½': 1.5, '1¾': 1.75 };
	var SOUNDS = {};
	var VALUES = {};
	const SECONDS = 1;
	const PULSES = 2;
	const DEGREES = 3;
	const LEFT = 4;
	const RIGHT = 5;
	const FRONT = 6;
	var tmp;
	for(var i in MENUS) {
		tmp = MENUS[i]['color'];
		RGB_COLORS[tmp[0]] = [255, 0, 0];
		RGB_COLORS[tmp[1]] = [255, 63, 0];
		RGB_COLORS[tmp[2]] = [255, 255, 0];
		RGB_COLORS[tmp[3]] = [0, 255, 0];
		RGB_COLORS[tmp[4]] = [0, 255, 255];
		RGB_COLORS[tmp[5]] = [0, 0, 255];
		RGB_COLORS[tmp[6]] = [63, 0, 255];
		RGB_COLORS[tmp[7]] = [255, 0, 255];
		RGB_COLORS[tmp[8]] = [255, 255, 255];
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
		SOUNDS[tmp[0]] = 1;
		SOUNDS[tmp[1]] = 2;
		SOUNDS[tmp[2]] = 3;
		SOUNDS[tmp[3]] = 4;
		SOUNDS[tmp[4]] = 5;
		SOUNDS[tmp[5]] = 6;
		SOUNDS[tmp[6]] = 7;
		tmp = MENUS[i]['move_unit'];
		VALUES[tmp[1]] = SECONDS;
		VALUES[tmp[2]] = PULSES;
		tmp = MENUS[i]['turn_unit'];
		VALUES[tmp[0]] = DEGREES;
		tmp = MENUS[i]['left_right'];
		VALUES[tmp[0]] = LEFT;
		VALUES[tmp[1]] = RIGHT;
		tmp = MENUS[i]['front_rear'];
		VALUES[tmp[0]] = FRONT;
	}

	function removeTimeout(id) {
		clearTimeout(id);
		var index = timeouts.indexOf(id);
		if(index >= 0) {
			timeouts.splice(index, 1);
		}
	}

	function removeAllTimeouts() {
		for(var i in timeouts) {
			clearTimeout(timeouts[i]);
		}
		timeouts = [];
	}
	
	function clearMotoring() {
		motoring.map = 0xbf800000;
	}
	
	function setPulse(pulse) {
		motoring.pulse = pulse;
		motoring.map |= 0x00400000;
	}
	
	function setNote(note) {
		motoring.note = note;
		motoring.map |= 0x00200000;
	}
	
	function setSound(sound) {
		motoring.sound = sound;
		motoring.map |= 0x00100000;
	}

	function setBoardSize(width, height) {
		motoring.boardWidth = width;
		motoring.boardHeight = height;
		motoring.map |= 0x00080000;
	}
	
	function setMotion(type, unit, speed, value, radius) {
		motoring.motionType = type;
		motoring.motionUnit = unit;
		motoring.motionSpeed = speed;
		motoring.motionValue = value;
		motoring.motionRadius = radius;
		motoring.map |= 0x00000004;
	}
	
	function runSound(sound, count) {
		if(typeof count != 'number') count = 1;
		if(count < 0) count = -1;
		if(count) {
			soundId = sound;
			soundRepeat = count;
			setSound(sound);
		}
	}
	
	function reset() {
		motoring.map = 0x8ff80004;
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		motoring.leftEyeRed = 0;
		motoring.leftEyeGreen = 0;
		motoring.leftEyeBlue = 0;
		motoring.rightEyeRed = 0;
		motoring.rightEyeGreen = 0;
		motoring.rightEyeBlue = 0;
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
		
		pulseCallback = undefined;
		soundId = 0;
		soundRepeat = 1;
		soundCallback = undefined;
		tempo = 60;
		removeAllTimeouts();
	}
	
	function handleSensory() {
		if(pulseCallback) {
			if(sensory.map & 0x00000010) {
				if(sensory.wheelState == 0) {
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					var callback = pulseCallback;
					pulseCallback = undefined;
					if(callback) callback();
				}
			}
		}
		if(sensory.map & 0x00000008) {
			if(sensory.soundState == 0) {
				if(soundId > 0) {
					if(soundRepeat < 0) {
						runSound(soundId, -1);
					} else if(soundRepeat > 1) {
						soundRepeat --;
						runSound(soundId, soundRepeat);
					} else {
						soundId = 0;
						soundRepeat = 1;
						var callback = soundCallback;
						soundCallback = undefined;
						if(callback) callback();
					}
				} else {
					soundId = 0;
					soundRepeat = 1;
					var callback = soundCallback;
					soundCallback = undefined;
					if(callback) callback();
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
						if(data.module == 'uoalbert' && data.index == 0) {
							sensory = data;
							handleSensory();
						}
					};
					sock.onmessage = function(message) {
						try {
							var received = JSON.parse(message.data);
							slaveVersion = received.version || 0;
							if(received.type == 0) {
								if(received.module == 'uoalbert') {
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

	ext.uoMoveForward = function(callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setMotion(11, 1, 0, 5, 0);
		pulseCallback = callback;
	};
	
	ext.uoMoveBackward = function(callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setMotion(12, 1, 0, 5, 0);
		pulseCallback = callback;
	};
	
	ext.uoTurn = function(direction, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		if(VALUES[direction] === LEFT) {
			setMotion(13, 1, 0, 90, 0);
		} else {
			setMotion(14, 1, 0, 90, 0);
		}
		pulseCallback = callback;
	};

	ext.uoMoveForwardUnit = function(value, unit, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		if(value && value > 0) {
			unit = VALUES[unit];
			if(unit === SECONDS) unit = 2;
			else if(unit === PULSES) unit = 3;
			else unit = 1;
			setMotion(1, unit, 0, value, 0);
			pulseCallback = callback;
		} else {
			callback();
		}
	};

	ext.uoMoveBackwardUnit = function(value, unit, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		if(value && value > 0) {
			unit = VALUES[unit];
			if(unit === SECONDS) unit = 2;
			else if(unit === PULSES) unit = 3;
			else unit = 1;
			setMotion(2, unit, 0, value, 0);
			pulseCallback = callback;
		} else {
			callback();
		}
	};

	ext.uoTurnUnit = function(direction, value, unit, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		if(value && value > 0) {
			unit = VALUES[unit];
			if(unit === SECONDS) unit = 2;
			else if(unit === PULSES) unit = 3;
			else unit = 1;
			if(VALUES[direction] === LEFT) {
				setMotion(3, unit, 0, value, 0);
			} else {
				setMotion(4, unit, 0, value, 0);
			}
			pulseCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.uoPivotUnit = function(wheel, value, unit, head, callback) {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		if(value && value > 0) {
			unit = VALUES[unit];
			if(unit === SECONDS) unit = 2;
			else if(unit === PULSES) unit = 3;
			else unit = 1;
			if(VALUES[wheel] === LEFT) {
				if(VALUES[head] === FRONT) {
					setMotion(5, unit, 0, value, 0);
				} else {
					setMotion(6, unit, 0, value, 0);
				}
			} else {
				if(VALUES[head] === FRONT) {
					setMotion(7, unit, 0, value, 0);
				} else {
					setMotion(8, unit, 0, value, 0);
				}
			}
			pulseCallback = callback;
		} else {
			callback();
		}
	};
	
	ext.uoChangeWheelsByLeftRight = function(left, right) {
		left = parseFloat(left);
		right = parseFloat(right);
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
		if(typeof left == 'number') {
			motoring.leftWheel += left;
		}
		if(typeof right == 'number') {
			motoring.rightWheel += right;
		}
	};

	ext.uoSetWheelsToLeftRight = function(left, right) {
		left = parseFloat(left);
		right = parseFloat(right);
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
		if(typeof left == 'number') {
			motoring.leftWheel = left;
		}
		if(typeof right == 'number') {
			motoring.rightWheel = right;
		}
	};

	ext.uoChangeWheelBy = function(wheel, speed) {
		speed = parseFloat(speed);
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
		if(typeof speed == 'number') {
			wheel = VALUES[wheel];
			if(wheel === LEFT) {
				motoring.leftWheel += speed;
			} else if(wheel === RIGHT) {
				motoring.rightWheel += speed;
			} else {
				motoring.leftWheel += speed;
				motoring.rightWheel += speed;
			}
		}
	};

	ext.uoSetWheelTo = function(wheel, speed) {
		speed = parseFloat(speed);
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
		if(typeof speed == 'number') {
			wheel = VALUES[wheel];
			if(wheel === LEFT) {
				motoring.leftWheel = speed;
			} else if(wheel === RIGHT) {
				motoring.rightWheel = speed;
			} else {
				motoring.leftWheel = speed;
				motoring.rightWheel = speed;
			}
		}
	};

	ext.uoStop = function() {
		motoring.leftWheel = 0;
		motoring.rightWheel = 0;
		setPulse(0);
		setMotion(0, 0, 0, 0, 0);
	};
	
	ext.uoSetBoardSizeTo = function(width, height) {
		width = parseInt(width);
		height = parseInt(height);
		if(width && height && width > 0 && height > 0) {
			setBoardSize(width, height);
		}
	};

	ext.uoSetEyeToColor = function(which, color) {
		color = RGB_COLORS[color];
		if(color) {
			which = VALUES[which];
			if(which === LEFT) {
				motoring.leftEyeRed = color[0];
				motoring.leftEyeGreen = color[1];
				motoring.leftEyeBlue = color[2];
			} else if(which === RIGHT) {
				motoring.rightEyeRed = color[0];
				motoring.rightEyeGreen = color[1];
				motoring.rightEyeBlue = color[2];
			} else {
				motoring.leftEyeRed = color[0];
				motoring.leftEyeGreen = color[1];
				motoring.leftEyeBlue = color[2];
				motoring.rightEyeRed = color[0];
				motoring.rightEyeGreen = color[1];
				motoring.rightEyeBlue = color[2];
			}
		}
	};
	
	ext.uoChangeEyeByRGB = function(which, red, green, blue) {
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		which = VALUES[which];
		if(which === LEFT) {
			if(typeof red == 'number') {
				motoring.leftEyeRed += red;
			}
			if(typeof green == 'number') {
				motoring.leftEyeGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.leftEyeBlue += blue;
			}
		} else if(which === RIGHT) {
			if(typeof red == 'number') {
				motoring.rightEyeRed += red;
			}
			if(typeof green == 'number') {
				motoring.rightEyeGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.rightEyeBlue += blue;
			}
		} else {
			if(typeof red == 'number') {
				motoring.leftEyeRed += red;
				motoring.rightEyeRed += red;
			}
			if(typeof green == 'number') {
				motoring.leftEyeGreen += green;
				motoring.rightEyeGreen += green;
			}
			if(typeof blue == 'number') {
				motoring.leftEyeBlue += blue;
				motoring.rightEyeBlue += blue;
			}
		}
	};
	
	ext.uoSetEyeToRGB = function(which, red, green, blue) {
		red = parseInt(red);
		green = parseInt(green);
		blue = parseInt(blue);
		which = VALUES[which];
		if(which === LEFT) {
			if(typeof red == 'number') {
				motoring.leftEyeRed = red;
			}
			if(typeof green == 'number') {
				motoring.leftEyeGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.leftEyeBlue = blue;
			}
		} else if(which === RIGHT) {
			if(typeof red == 'number') {
				motoring.rightEyeRed = red;
			}
			if(typeof green == 'number') {
				motoring.rightEyeGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.rightEyeBlue = blue;
			}
		} else {
			if(typeof red == 'number') {
				motoring.leftEyeRed = red;
				motoring.rightEyeRed = red;
			}
			if(typeof green == 'number') {
				motoring.leftEyeGreen = green;
				motoring.rightEyeGreen = green;
			}
			if(typeof blue == 'number') {
				motoring.leftEyeBlue = blue;
				motoring.rightEyeBlue = blue;
			}
		}
	};

	ext.uoClearEye = function() {
		motoring.leftEyeRed = 0;
		motoring.leftEyeGreen = 0;
		motoring.leftEyeBlue = 0;
		motoring.rightEyeRed = 0;
		motoring.rightEyeGreen = 0;
		motoring.rightEyeBlue = 0;
	};

	ext.uoPlaySound = function(sound) {
		sound = SOUNDS[sound];
		motoring.buzzer = 0;
		setNote(0);
		if(sound) runSound(sound);
	};
	
	ext.uoPlaySoundTimes = function(sound, count) {
		sound = SOUNDS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		setNote(0);
		if(sound && count) {
			runSound(sound, count);
		}
	};
	
	ext.uoPlaySoundTimesUntilDone = function(sound, count, callback) {
		sound = SOUNDS[sound];
		count = parseInt(count);
		motoring.buzzer = 0;
		setNote(0);
		if(sound && count) {
			runSound(sound, count);
			soundCallback = callback;
		} else {
			callback();
		}
	};

	ext.uoChangeBuzzerBy = function(hz) {
		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer += hz;
		}
		setNote(0);
		runSound(0);
	};

	ext.uoSetBuzzerTo = function(hz) {
		hz = parseFloat(hz);
		if(typeof hz == 'number') {
			motoring.buzzer = hz;
		}
		setNote(0);
		runSound(0);
	};

	ext.uoClearSound = function() {
		motoring.buzzer = 0;
		setNote(0);
		runSound(0);
	};
	
	ext.uoPlayNote = function(note, octave) {
		note = NOTES[note];
		octave = parseInt(octave);
		motoring.buzzer = 0;
		if(note && octave && octave > 0 && octave < 8) {
			note += (octave - 1) * 12;
			setNote(note);
		}
		runSound(0);
	};
	
	ext.uoPlayNoteForBeats = function(note, octave, beat, callback) {
		note = NOTES[note];
		octave = parseInt(octave);
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		runSound(0);
		if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && tempo > 0) {
			note += (octave - 1) * 12;
			setNote(note);
			var timeout = beat * 60 * 1000 / tempo;
			var tail = 0;
			if(timeout > 100) {
				tail = 100;
			}
			if(tail > 0) {
				var timer1 = setTimeout(function() {
					setNote(0);
					removeTimeout(timer1);
				}, timeout - tail);
				timeouts.push(timer1);
			}
			var timer2 = setTimeout(function() {
				setNote(0);
				removeTimeout(timer2);
				callback();
			}, timeout);
			timeouts.push(timer2);
		} else {
			callback();
		}
	};

	ext.uoRestForBeats = function(beat, callback) {
		var tmp = BEATS[beat];
		if(tmp) beat = tmp;
		else beat = parseFloat(beat);
		motoring.buzzer = 0;
		setNote(0);
		runSound(0);
		if(beat && beat > 0 && tempo > 0) {
			var timer = setTimeout(function() {
				removeTimeout(timer);
				callback();
			}, beat * 60 * 1000 / tempo);
			timeouts.push(timer);
		} else {
			callback();
		}
	};

	ext.uoChangeTempoBy = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			tempo += bpm;
			if(tempo < 1) tempo = 1;
		}
	};

	ext.uoSetTempoTo = function(bpm) {
		bpm = parseFloat(bpm);
		if(typeof bpm == 'number') {
			tempo = bpm;
			if(tempo < 1) tempo = 1;
		}
	};

	ext.uoLeftProximity = function(color) {
		return sensory.leftProximity;
	};

	ext.uoRightProximity = function(color1, color2) {
		return sensory.rightProximity;
	};

	ext.uoAccelerationX = function() {
		return sensory.accelerationX;
	};

	ext.uoAccelerationY = function() {
		return sensory.accelerationY;
	};

	ext.uoAccelerationZ = function() {
		return sensory.accelerationZ;
	};
	
	ext.uoTouch = function() {
		return sensory.touch;
	};
	
	ext.uoOid = function() {
		return sensory.oid;
	};
	
	ext.uoPositionX = function() {
		return sensory.positionX;
	};
	
	ext.uoPositionY = function() {
		return sensory.positionY;
	};
	
	ext.uoLight = function() {
		return sensory.light;
	};
	
	ext.uoTemperature = function() {
		return sensory.temperature;
	};
	
	ext.uoBattery = function() {
		return sensory.battery;
	};
	
	ext.uoSignalStrength = function() {
		return sensory.signalStrength;
	};
	
	ext.uoHandFound = function() {
		return sensory.handFound || sensory.leftProximity > 40 || sensory.rightProximity > 40;
	};
	
	ext.uoTouching = function() {
		return sensory.touch == 1;
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
		url: "http://albert.school"
	};

	ScratchExtensions.register(EXTENSION_NAME[lang], descriptor, ext);

	open('ws://localhost:51417');
})({});
