(function(ext) {

	var robots = {};
	var robotsByGroup = {};
	var packet = {
		version: 2
	};
	const TURTLE = 'turtle';
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
		en: 'Turtle',
		ko: '거북이',
		ja: 'カメ',
		uz: 'Turtle'
	};
	const BLOCKS = {
		en1: [
			["w", "move forward", "turtleMoveForward"],
			["w", "move backward", "turtleMoveBackward"],
			["w", "turn %m.left_right", "turtleTurn", "left"],
			["-"],
			[" ", "set head led to %m.led_color", "turtleSetHeadLedTo", "red"],
			[" ", "clear head led", "turtleClearHeadLed"],
			["-"],
			[" ", "play sound %m.sound", "turtlePlaySound", "beep"],
			[" ", "clear sound", "turtleClearSound"],
			["-"],
			["h", "when %m.touching_color touched", "turtleWhenColorTouched", "red"],
			["h", "when button %m.when_button_state", "turtleWhenButtonState", "clicked"],
			["b", "touching %m.touching_color ?", "turtleTouchingColor", "red"],
			["b", "button %m.button_state ?", "turtleButtonState", "clicked"]
		],
		en2: [
			["w", "move forward %n %m.cm_sec", "turtleMoveForwardUnit", 6, "cm"],
			["w", "move backward %n %m.cm_sec", "turtleMoveBackwardUnit", 6, "cm"],
			["w", "turn %m.left_right %n %m.deg_sec in place", "turtleTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.left_right wheel %n %m.deg_sec in %m.head_tail direction", "turtlePivotAroundWheelUnitInDirection", "left", 90, "degrees", "head"],
			["w", "turn %m.left_right %n %m.deg_sec with radius %n cm in %m.head_tail direction", "turtleTurnUnitWithRadiusInDirection", "left", 90, "degrees", 6, "head"],
			["-"],
			[" ", "set head led to %m.led_color", "turtleSetHeadLedTo", "red"],
			[" ", "clear head led", "turtleClearHeadLed"],
			["-"],
			[" ", "play sound %m.sound %n times", "turtlePlaySoundTimes", "beep", 1],
			["w", "play sound %m.sound %n times until done", "turtlePlaySoundTimesUntilDone", "beep", 1],
			[" ", "clear sound", "turtleClearSound"],
			["w", "play note %m.note %m.octave for %d.beats beats", "turtlePlayNoteForBeats", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "turtleRestForBeats", 0.25],
			[" ", "change tempo by %n", "turtleChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "turtleSetTempoTo", 60],
			["-"],
			["h", "when %m.touching_color touched", "turtleWhenColorTouched", "red"],
			["h", "when color pattern is %m.pattern_color %m.pattern_color", "turtleWhenColorPattern", "red", "yellow"],
			["h", "when button %m.when_button_state", "turtleWhenButtonState", "clicked"],
			["h", "when %m.when_tilt", "turtleWhenTilt", "tilt forward"],
			["b", "touching %m.touching_color ?", "turtleTouchingColor", "red"],
			["b", "color pattern %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", "red", "yellow"],
			["b", "button %m.button_state ?", "turtleButtonState", "clicked"],
			["b", "%m.tilt ?", "turtleTilt", "tilt forward"]
		],
		en3: [
			["w", "move forward %n %m.move_unit", "turtleMoveForwardUnit", 6, "cm"],
			["w", "move backward %n %m.move_unit", "turtleMoveBackwardUnit", 6, "cm"],
			["w", "turn %m.left_right %n %m.turn_unit in place", "turtleTurnUnitInPlace", "left", 90, "degrees"],
			["w", "pivot around %m.left_right wheel %n %m.turn_unit in %m.head_tail direction", "turtlePivotAroundWheelUnitInDirection", "left", 90, "degrees", "head"],
			["w", "turn %m.left_right %n %m.turn_unit with radius %n cm in %m.head_tail direction", "turtleTurnUnitWithRadiusInDirection", "left", 90, "degrees", 6, "head"],
			[" ", "change wheels by left: %n right: %n", "turtleChangeWheelsByLeftRight", 10, 10],
			[" ", "set wheels to left: %n right: %n", "turtleSetWheelsToLeftRight", 50, 50],
			[" ", "change %m.left_right_both wheel by %n", "turtleChangeWheelBy", "left", 10],
			[" ", "set %m.left_right_both wheel to %n", "turtleSetWheelTo", "left", 50],
			[" ", "follow %m.line_color line", "turtleFollowLine", "black"],
			["w", "follow black line until %m.target_color", "turtleFollowLineUntil", "red"],
			["w", "follow %m.color_line line until black", "turtleFollowLineUntilBlack", "red"],
			["w", "cross black intersection", "turtleCrossIntersection"],
			["w", "turn %m.left_right_back at black intersection", "turtleTurnAtIntersection", "left"],
			[" ", "set following speed to %m.speed", "turtleSetFollowingSpeedTo", "5"],
			[" ", "stop", "turtleStop"],
			["-"],
			[" ", "set head led to %m.led_color", "turtleSetHeadLedTo", "red"],
			[" ", "change head led by r: %n g: %n b: %n", "turtleChangeHeadLedByRGB", 10, 0, 0],
			[" ", "set head led to r: %n g: %n b: %n", "turtleSetHeadLedToRGB", 255, 0, 0],
			[" ", "clear head led", "turtleClearHeadLed"],
			["-"],
			[" ", "play sound %m.sound %n times", "turtlePlaySoundTimes", "beep", 1],
			["w", "play sound %m.sound %n times until done", "turtlePlaySoundTimesUntilDone", "beep", 1],
			[" ", "change buzzer by %n", "turtleChangeBuzzerBy", 10],
			[" ", "set buzzer to %n", "turtleSetBuzzerTo", 1000],
			[" ", "clear sound", "turtleClearSound"],
			[" ", "play note %m.note %m.octave", "turtlePlayNote", "C", "4"],
			["w", "play note %m.note %m.octave for %d.beats beats", "turtlePlayNoteForBeats", "C", "4", 0.5],
			["w", "rest for %d.beats beats", "turtleRestForBeats", 0.25],
			[" ", "change tempo by %n", "turtleChangeTempoBy", 20],
			[" ", "set tempo to %n bpm", "turtleSetTempoTo", 60],
			["-"],
			["r", "color number", "turtleColorNumber"],
			["r", "color pattern", "turtleColorPattern"],
			["r", "floor", "turtleFloor"],
			["r", "button", "turtleButton"],
			["r", "x acceleration", "turtleAccelerationX"],
			["r", "y acceleration", "turtleAccelerationY"],
			["r", "z acceleration", "turtleAccelerationZ"],
			["h", "when %m.touching_color touched", "turtleWhenColorTouched", "red"],
			["h", "when color pattern is %m.pattern_color %m.pattern_color", "turtleWhenColorPattern", "red", "yellow"],
			["h", "when button %m.when_button_state", "turtleWhenButtonState", "clicked"],
			["h", "when %m.when_tilt", "turtleWhenTilt", "tilt forward"],
			["b", "touching %m.touching_color ?", "turtleTouchingColor", "red"],
			["b", "color pattern %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", "red", "yellow"],
			["b", "button %m.button_state ?", "turtleButtonState", "clicked"],
			["b", "%m.tilt ?", "turtleTilt", "tilt forward"],
			["b", "battery %m.battery ?", "turtleBattery", "normal"]
		],
		ko1: [
			[" ", "%m.sound_effect 소리 재생하기", "cheesePlaySound", "삐"],
			[" ", "소리 끄기", "cheeseClearSound"],
			["-"],
			[" ", "RGB LED를 %m.led_intensity %m.led_color 으로 정하기", "cheeseSetLedLToColor", "기본", "빨간색"],
			[" ", "RGB LED 끄기", "cheeseClearLedL"]
		],
		ko2: [
			["b", "%m.cheese_tilt ?", "cheeseTilt", "로고가 하늘 방향"],
			["-"],
			[" ", "%m.sound_effect 소리 %n 번 재생하기", "cheesePlaySoundTimes", "삐", 1],
			["w", "%m.sound_effect 소리 %n 번 재생하고 기다리기", "cheesePlaySoundTimesUntilDone", "삐", 1],
			[" ", "소리 끄기", "cheeseClearSound"],
			["w", "%m.note %m.octave 음을 %d.beats 박자 연주하기", "cheesePlayNoteFor", "도", "4", 0.5],
			["w", "%d.beats 박자 쉬기", "cheeseRestFor", 0.25],
			[" ", "연주 속도를 %n BPM만큼 바꾸기", "cheeseChangeTempoBy", 20],
			[" ", "연주 속도를 %n BPM으로 정하기", "cheeseSetTempoTo", 60],
			["-"],
			[" ", "서보 모터 %m.cheese_port_servo_motor 의 각도를 %n 도만큼 바꾸기", "cheeseChangeServoMotorAngleBy", "Sa", 10],
			[" ", "서보 모터 %m.cheese_port_servo_motor 의 각도를 %n 도로 정하기", "cheeseSetServoMotorAngleTo", "Sa", 0],
			["-"],
			[" ", "RGB LED를 %m.led_intensity %m.led_color 으로 정하기", "cheeseSetLedLToColor", "기본", "빨간색"],
			[" ", "RGB LED 끄기", "cheeseClearLedL"],
			["-"],
			["w", "네오픽셀 LED %n 개, %m.cheese_neopixel_type 로 정하기", "cheeseNeopixelSetNumberAndTypeTo", 10, "GRB"],
			["w", "네오픽셀 모든 LED를 %m.neopixel_pattern 패턴으로 정하기", "cheeseNeopixelSetAllLedsToPattern", "3색"],
			["w", "네오픽셀 모든 LED를 %m.led_color 으로 정하기", "cheeseNeopixelSetAllLedsToColor", "빨간색"],
			["w", "네오픽셀 모든 LED 끄기", "cheeseNeopixelClearAllLeds"],
			["w", "네오픽셀 %n 번째 LED를 %m.led_color 으로 정하기", "cheeseNeopixelSetLedAtToColor", 1, "빨간색"],
			["w", "네오픽셀 %n 번째 LED 끄기", "cheeseNeopixelClearLedAt", 1],
			["w", "네오픽셀 밝기를 %n %만큼 바꾸기", "cheeseNeopixelChangeBrightnessBy", 10],
			["w", "네오픽셀 밝기를 %n %로 정하기", "cheeseNeopixelSetBrightnessTo", 50]
		],
		ko3: [
			["r", "%m.cheese_sensor[SENSOR]", "cheeseSensor", "x축 가속도"],
			["b", "%m.cheese_tilt[TILT]?", "cheeseTilt", "로고가 하늘 방향"],
			["b", "배터리 %m.battery[BATTERY]?", "cheeseBattery", "정상"],
			["-"],
			[" ", "%m.sound_effect[SOUND] 소리 %n[REPEAT]번 재생하기", "cheesePlaySoundTimes", "삐", 1],
			["w", "%m.sound_effect[SOUND] 소리 %n[REPEAT]번 재생하고 기다리기", "cheesePlaySoundTimesUntilDone", "삐", 1],
			[" ", "버저 음을 %n[HZ]Hz만큼 바꾸기", "cheeseChangeBuzzerBy", 10],
			[" ", "버저 음을 %n[HZ]Hz로 정하기", "cheeseSetBuzzerTo", 1000],
			[" ", "소리 끄기", "cheeseClearSound"],
			[" ", "%m.note[NOTE]%m.octave[OCTAVE] 음을 연주하기", "cheesePlayNote", "도", "4"],
			["w", "%m.note[NOTE]%m.octave[OCTAVE] 음을 %n[BEAT]박자 연주하기", "cheesePlayNoteFor", "도", "4", 0.5],
			["w", "%n[BEAT]박자 쉬기", "cheeseRestFor", 0.25],
			[" ", "연주 속도를 %n[BPM]BPM만큼 바꾸기", "cheeseChangeTempoBy", 20],
			[" ", "연주 속도를 %n[BPM]BPM으로 정하기", "cheeseSetTempoTo", 60],
			[" ", "소리 출력을 %m.cheese_port_sound[PORT]로 정하기", "cheeseSetSoundPortTo", "내부 스피커"],
			["-"],
			[" ", "포트 %m.cheese_input_port[PORT]를 %m.cheese_mode_input_s_l[MODE] 입력으로 정하기", "cheeseSetInputPortTo", "Sa", "메이키"],
			[" ", "입력 %m.cheese_input_port[PORT]의 범위 %n[LOW1]~%n[HIGH1]을(를) %n[LOW2]~%n[HIGH2] 소수점 %m.cheese_range_decimal[DECIMAL]으로 정하기", "cheeseSetInputRangeTo", "Sa", 0, 255, 0, 100, "없음"],
			[" ", "입력 %m.cheese_input_port[PORT]의 범위 %n[LOW1]~%n[MIDDLE1]~%n[HIGH1]을(를) %n[LOW2]~%n[MIDDLE2]~%n[HIGH2] 소수점 %m.cheese_range_decimal[DECIMAL]으로 정하기", "cheeseSetThreeInputRangesTo", "Sa", 0, 127, 255, -100, 0, 100, "없음"],
			["r", "입력 %m.cheese_input_port[PORT]", "cheeseAnalogInput", "Sa"],
			["b", "입력 %m.cheese_input_port[PORT] %m.cheese_digital_value[VALUE]?", "cheeseDigitalInput", "Sa", "1"],
			["b", "버튼 %m.cheese_input_port[PORT]를 %m.button_state[STATE]?", "cheeseButtonState", "Sa", "클릭했는가"],
			["-"],
			[" ", "포트 %m.cheese_input_port_c[PORT]를 %m.cheese_mode_input_s_l_c[MODE] 입력으로 정하기", "cheeseSetInputPortToPulse", "Sc", "펄스"],
			["b", "포트 %m.cheese_input_port_c[PORT]에서 펄스 감지?", "cheesePulseDetected", "Sc"],
			["-"],
			[" ", "디지털 출력 %m.cheese_port_digital_output[PORT]를 %m.cheese_digital_value[VALUE](으)로 정하기", "cheeseSetDigitalOutputTo", "Sa", "1"],
			["-"],
			[" ", "PWM 출력 %m.cheese_port_pwm_output[PORT]를 %n[VALUE]%만큼 바꾸기", "cheeseChangePwmOutputBy", "Sa", 10],
			[" ", "PWM 출력 %m.cheese_port_pwm_output[PORT]를 %n[VALUE]%로 정하기", "cheeseSetPwmOutputTo", "Sa", 50],
			["-"],
			[" ", "서보 모터 %m.cheese_port_servo_motor[PORT]의 각도를 %n[VALUE]도만큼 바꾸기", "cheeseChangeServoMotorAngleBy", "Sa", 10],
			[" ", "서보 모터 %m.cheese_port_servo_motor[PORT]의 각도를 %n[VALUE]도로 정하기", "cheeseSetServoMotorAngleTo", "Sa", 0],
			[" ", "서보 모터 %m.cheese_port_servo_motor[PORT] 전원 끄기", "cheeseTurnOffServoMotor", "Sa"],
			["-"],
			[" ", "DC 모터 %m.cheese_port_dc_motor[PORT]의 속도를 %n[VALUE]%만큼 바꾸기", "cheeseChangeDcMotorVelocityBy", "Mab", 10],
			[" ", "DC 모터 %m.cheese_port_dc_motor[PORT]의 속도를 %n[VALUE]%로 정하기", "cheeseSetDcMotorVelocityTo", "Mab", 50],
			[" ", "DC 모터 %m.cheese_port_dc_motor[PORT] 정지하기", "cheeseStopDcMotor", "Mab"],
			["-"],
			["w", "스텝 모터 %n[STEP]스텝을 속도 %n[VELOCITY]스텝/초로 회전하기", "cheeseRotateStepMotor", 100, 300],
			[" ", "스텝 모터의 속도를 %n[VELOCITY]스텝/초만큼 바꾸기", "cheeseChangeStepMotorVelocityBy", 50],
			[" ", "스텝 모터의 속도를 %n[VELOCITY]스텝/초로 정하기", "cheeseSetStepMotorVelocityTo", 300],
			[" ", "스텝 모터 %m.cheese_stop_off[ACTION]", "cheeseStopOffStepMotor", "정지하기"],
			[" ", "스텝 모터를 %m.cheese_mode_step_motor[MODE] 모드로 정하기", "cheeseSetStepMotorModeTo", "기본"],
			["r", "스텝 수", "cheeseStepCount"],
			["-"],
			[" ", "RGB LED %m.cheese_led_port[PORT]을(를) %m.led_intensity[INTENSITY] %m.led_color[COLOR]으로 정하기", "cheeseSetLedToColor", "L", "기본", "빨간색"],
			[" ", "RGB LED %m.cheese_led_port[PORT]을(를) R: %n[RED] G: %n[GREEN] B: %n[BLUE]만큼 바꾸기", "cheeseChangeLedByRgb", "L", 10, 0, 0],
			[" ", "RGB LED %m.cheese_led_port[PORT]을(를) R: %n[RED] G: %n[GREEN] B: %n[BLUE](으)로 정하기", "cheeseSetLedToRgb", "L", 255, 0, 0],
			[" ", "RGB LED %m.cheese_led_port[PORT] 끄기", "cheeseClearLed", "L"],
			[" ", "RGB LED %m.cheese_led_port[PORT]을(를) %m.cheese_led_type[TYPE]형으로 정하기", "cheeseSetLedTypeTo", "L", "기본"],
			["-"],
			["w", "네오픽셀 LED %n[NUNBER]개, %m.cheese_neopixel_type[TYPE]로 정하기", "cheeseNeopixelSetNumberAndTypeTo", 10, "GRB"],
			["w", "네오픽셀 모든 LED를 %m.neopixel_pattern[PATTERN] 패턴으로 정하기", "cheeseNeopixelSetAllLedsToPattern", "3색"],
			["w", "네오픽셀 모든 LED를 %m.led_color[COLOR]으로 정하기", "cheeseNeopixelSetAllLedsToColor", "빨간색"],
			["w", "네오픽셀 모든 LED를 R: %n[RED] G: %n[GREEN] B: %n[BLUE]만큼 바꾸기", "cheeseNeopixelChangeAllLedsByRGB", 10, 0, 0],
			["w", "네오픽셀 모든 LED를 R: %n[RED] G: %n[GREEN] B: %n[BLUE](으)로 정하기", "cheeseNeopixelSetAllLedsToRGB", 255, 0, 0],
			["w", "네오픽셀 모든 LED 끄기", "cheeseNeopixelClearAllLeds"],
			["w", "네오픽셀 %n[PIXEL]번째 LED를 %m.led_color[COLOR]으로 정하기", "cheeseNeopixelSetLedAtToColor", 1, "빨간색"],
			["w", "네오픽셀 %n[PIXEL]번째 LED를 R: %n[RED] G: %n[GREEN] B: %n[BLUE]만큼 바꾸기", "cheeseNeopixelChangeLedAtByRGB", 1, 10, 0, 0],
			["w", "네오픽셀 %n[PIXEL]번째 LED를 R: %n[RED] G: %n[GREEN] B: %n[BLUE](으)로 정하기", "cheeseNeopixelSetLedAtToRGB", 1, 255, 0, 0],
			["w", "네오픽셀 %n[PIXEL]번째 LED 끄기", "cheeseNeopixelClearLedAt", 1],
			["w", "네오픽셀 %n[START]번째부터 %n[END]번째까지의 LED를 %m.neopixel_pattern[PATTERN] 패턴으로 정하기", "cheeseNeopixelSetLedFromToPattern", 1, 10, "3색"],
			["w", "네오픽셀 %n[START]번째부터 %n[END]번째까지 %n[INCREMENT]칸 간격의 LED를 %m.led_color[COLOR]으로 정하기", "cheeseNeopixelSetLedFromToColor", 1, 10, 2, "빨간색"],
			["w", "네오픽셀 %n[START]번째부터 %n[END]번째까지 %n[INCREMENT]칸 간격의 LED를 R: %n[RED] G: %n[GREEN] B: %n[BLUE]만큼 바꾸기", "cheeseNeopixelChangeLedFromByRGB", 1, 10, 2, 10, 0, 0],
			["w", "네오픽셀 %n[START]번째부터 %n[END]번째까지 %n[INCREMENT]칸 간격의 LED를 R: %n[RED] G: %n[GREEN] B: %n[BLUE](으)로 정하기", "cheeseNeopixelSetLedFromToRGB", 1, 10, 2, 255, 0, 0],
			["w", "네오픽셀 %n[START]번째부터 %n[END]번째까지 %n[INCREMENT]칸 간격의 LED 끄기", "cheeseNeopixelClearLedFromTo", 1, 10, 2],
			["w", "네오픽셀 %n[PIXEL]칸 이동하기", "cheeseNeopixelShift", 1],
			["w", "네오픽셀 %n[PIXEL]칸 회전하기", "cheeseNeopixelRotate", 1],
			["w", "네오픽셀 밝기를 %n[BRIGHTNESS]%만큼 바꾸기", "cheeseNeopixelChangeBrightnessBy", 10],
			["w", "네오픽셀 밝기를 %n[BRIGHTNESS]%로 정하기", "cheeseNeopixelSetBrightnessTo", 50],
			["-"],
			["w", "시리얼 %m.serial_output[MODE] %s[TEXT] 쓰기", "cheeseWriteSerial", "글자", "abc123"],
			["w", "시리얼 %m.serial_delimiter[DELIMITER] 읽기", "cheeseReadSerialUntil", "모두"],
			[" ", "시리얼 포트를 %m.serial_port[PORT]로 정하기", "cheeseSetSerialPortTo", "La(쓰기) Lb(읽기)"],
			[" ", "시리얼 속도를 %m.serial_baud[BAUD]Bd로 정하기", "cheeseSetSerialRateTo", "9600"],
			["r", "시리얼 입력", "cheeseSerial"],
			["-"],
			[" ", "%m.cheese_pid_device[DEVICE] 시작하기", "cheesePidStart", "PID-10 초음파 센서(HC-SR04+)"],
			[" ", "PID %m.cheese_pid_range_input[INPUT]의 범위 %n[LOW1]~%n[HIGH1]을(를) %n[LOW2]~%n[HIGH2] 소수점 %m.cheese_range_decimal[DECIMAL]으로 정하기", "cheesePidSetRangeTo", "x1", 0, 255, 0, 100, "없음"],
			[" ", "PID %m.cheese_pid_range_input[INPUT]의 범위 %n[LOW1]~%n[MIDDLE1]~%n[HIGH1]을(를) %n[LOW2]~%n[MIDDLE2]~%n[HIGH2] 소수점 %m.cheese_range_decimal[DECIMAL]으로 정하기", "cheesePidSetThreeRangesTo", "x1", 0, 127, 255, -100, 0, 100, "없음"],
			[" ", "PID 엔코더 값 초기화하기", "cheesePidResetEncoder"],
			["r", "PID %m.cheese_pid_input[INPUT]", "cheesePidInput", "거리 (cm)"],
			["b", "PID 버튼 %m.cheese_pid_button[BUTTON]을(를) %m.button_state[STATE]?", "cheesePidButtonState", "1", "클릭했는가"],
			["-"],
			[" ", "HAT-010 5x5 매트릭스 시작하기", "cheeseHat10StartMatrix"],
			["r", "HAT-010 버튼 %m.cheese_hat10_button[BUTTON]", "cheeseHat10Button", "A"],
			["b", "HAT-010 버튼 %m.cheese_hat10_button[BUTTON]를 %m.button_state[STATE]?", "cheeseHat10ButtonState", "A", "클릭했는가"],
			["-"],
			[" ", "HAT-010 배경 x: %n[X] y: %n[Y] %m.cheese_hat10_color[COLOR]으로 켜기", "cheeseHat10BackgroundTurnOnXY", 0, 0, "빨간색"],
			[" ", "HAT-010 배경 x: %n[X] y: %n[Y] 끄기", "cheeseHat10BackgroundTurnOffXY", 0, 0],
			[" ", "HAT-010 배경 %m.cheese_hat10_color[COLOR] %m.cheese_shape[SHAPE]을(를) x: %n[X] y: %n[Y]에 그리기", "cheeseHat10BackgroundDrawShapeAtXY", "빨간색", "사각형", 0, 0],
			[" ", "HAT-010 배경 %m.cheese_hat10_color[COLOR] 글자 %s[TEXT]을(를) x: %n[X] y: %n[Y]에 그리기", "cheeseHat10BackgroundDrawStringAtXY", "빨간색", "abc123", 0, 0],
			[" ", "HAT-010 배경 %m.cheese_hat10_color[COLOR] 패턴 %s[PATTERN]을(를) x: %n[X] y: %n[Y]에 그리기", "cheeseHat10BackgroundDrawPatternAtXY", "빨간색", "10010", 0, 0],
			[" ", "HAT-010 %m.cheese_background_all[OBJECT] 지우기", "cheeseHat10Clear", "배경"],
			[" ", "HAT-010 %m.cheese_background_all[OBJECT] x: %n[X] y: %n[Y]만큼 이동하기", "cheeseHat10ScrollByXY", "배경", 0, 0],
			["-"],
			[" ", "HAT-010 그림 %n[SPRITE]을(를) %m.cheese_hat10_color[COLOR] %m.cheese_shape[SHAPE](으)로 정하기", "cheeseHat10SpriteSetToShape", 1, "빨간색", "사각형"],
			[" ", "HAT-010 그림 %n[SPRITE]을(를) %m.cheese_hat10_color[COLOR] 글자 %s[TEXT](으)로 정하기", "cheeseHat10SpriteSetToString", 1, "빨간색", "abc123"],
			[" ", "HAT-010 그림 %n[SPRITE]을(를) %m.cheese_hat10_color[COLOR] 패턴 %s[PATTERN](으)로 정하기", "cheeseHat10SpriteSetToPattern", 1, "빨간색", "10010"],
			[" ", "HAT-010 그림 %n[SPRITE] %m.cheese_clear_show_hide[ACTION]", "cheeseHat10SpriteClearShowHide", 1, "지우기"],
			[" ", "HAT-010 그림 %n[SPRITE]의 위치를 x: %n[X] y: %n[Y]만큼 바꾸기", "cheeseHat10SpriteChangePositionsByXY", 1, 0, 0],
			[" ", "HAT-010 그림 %n[SPRITE]의 위치를 x: %n[X] y: %n[Y](으)로 정하기", "cheeseHat10SpriteSetPositionsToXY", 1, 0, 0],
			[" ", "HAT-010 그림 %n[SPRITE]의 %m.cheese_position[POSITION] 위치를 %n[VALUE]만큼 바꾸기", "cheeseHat10SpriteChangePositionByValue", 1, "x", 1],
			[" ", "HAT-010 그림 %n[SPRITE]의 %m.cheese_position[POSITION] 위치를 %n[VALUE](으)로 정하기", "cheeseHat10SpriteSetPositionToValue", 1, "x", 0],
			[" ", "HAT-010 그림 %n[SPRITE]을(를) %m.cheese_clockwise[DIRECTION] 방향으로 회전하기", "cheeseHat10SpriteRotate", 1, "시계"],
			[" ", "HAT-010 그림 %n[SPRITE]을(를) %m.cheese_flip[DIRECTION] 방향으로 뒤집기", "cheeseHat10SpriteFlipInDirection", 1, "왼쪽-오른쪽"],
			[" ", "HAT-010 그림 %n[SPRITE]을(를) 배경에 도장 찍기", "cheeseHat10SpriteStampToBackground", 1],
			["r", "HAT-010 그림 %n[SPRITE]의 %m.cheese_position[POSITION] 위치", "cheeseHat10SpritePosition", 1, "x"],
			["b", "HAT-010 그림 %n[SPRITE]이(가) 그림 %n[TARGET]에 닿았는가?", "cheeseHat10SpriteTouchingSprite", 1, 2],
			["b", "HAT-010 그림 %n[SPRITE]이(가) %m.cheese_touching[TARGET]에 닿았는가?", "cheeseHat10SpriteTouching", 1, "배경"],
			["-"],
			[" ", "HAT-010 밝기를 %n[BRIGHTNESS]%만큼 바꾸기", "cheeseHat10ChangeBrightnessBy", 5],
			[" ", "HAT-010 밝기를 %n[BRIGHTNESS]%로 정하기", "cheeseHat10SetBrightnessTo", 20]
		],
		ja1: [
			["w", "前へ移動する", "turtleMoveForward"],
			["w", "後ろへ移動する", "turtleMoveBackward"],
			["w", "%m.left_right へ回る", "turtleTurn", "左"],
			["-"],
			[" ", "頭LEDを %m.led_color にする", "turtleSetHeadLedTo", "赤色"],
			[" ", "頭LEDをオフにする", "turtleClearHeadLed"],
			["-"],
			[" ", "%m.sound 音を再生する", "turtlePlaySound", "ビープ"],
			[" ", "音をオフにする", "turtleClearSound"],
			["-"],
			["h", "%m.touching_color に触れたとき", "turtleWhenColorTouched", "赤色"],
			["h", "ボタンを %m.when_button_state とき", "turtleWhenButtonState", "クリックした"],
			["b", "%m.touching_color に触れたか?", "turtleTouchingColor", "赤色"],
			["b", "ボタンを %m.button_state ?", "turtleButtonState", "クリックしたか"]
		],
		ja2: [
			["w", "前へ %n %m.cm_sec 移動する", "turtleMoveForwardUnit", 6, "cm"],
			["w", "後ろへ %n %m.cm_sec 移動する", "turtleMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right へ %n %m.deg_sec その場所で回る", "turtleTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.left_right 車輪を中心に %n %m.deg_sec %m.head_tail 方向へ回る", "turtlePivotAroundWheelUnitInDirection", "左", 90, "度", "頭"],
			["w", "%m.left_right へ %n %m.deg_sec 半径 %n cmを %m.head_tail 方向へ回る", "turtleTurnUnitWithRadiusInDirection", "左", 90, "度", 6, "頭"],
			["-"],
			[" ", "頭LEDを %m.led_color にする", "turtleSetHeadLedTo", "赤色"],
			[" ", "頭LEDをオフにする", "turtleClearHeadLed"],
			["-"],
			[" ", "%m.sound 音を %n 回再生する", "turtlePlaySoundTimes", "ビープ", 1],
			["w", "%m.sound 音を %n 回再生して待つ", "turtlePlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "音をオフにする", "turtleClearSound"],
			["w", "%m.note %m.octave 音を %d.beats 拍子奏でる", "turtlePlayNoteForBeats", "ド", "4", 0.5],
			["w", "%d.beats 拍子止める", "turtleRestForBeats", 0.25],
			[" ", "演奏の速さを %n ずつ変える", "turtleChangeTempoBy", 20],
			[" ", "演奏の速さを %n BPMにする", "turtleSetTempoTo", 60],
			["-"],
			["h", "%m.touching_color に触れたとき", "turtleWhenColorTouched", "赤色"],
			["h", "色パターンが %m.pattern_color %m.pattern_color であるとき", "turtleWhenColorPattern", "赤色", "黄色"],
			["h", "ボタンを %m.when_button_state とき", "turtleWhenButtonState", "クリックした"],
			["h", "%m.when_tilt とき", "turtleWhenTilt", "前に傾けた"],
			["b", "%m.touching_color に触れたか?", "turtleTouchingColor", "赤色"],
			["b", "色パターンが %m.pattern_color %m.pattern_color ですか?", "turtleIsColorPattern", "赤色", "黄色"],
			["b", "ボタンを %m.button_state ?", "turtleButtonState", "クリックしたか"],
			["b", "%m.tilt ?", "turtleTilt", "前に傾けたか"]
		],
		ja3: [
			["w", "前へ %n %m.move_unit 移動する", "turtleMoveForwardUnit", 6, "cm"],
			["w", "後ろへ %n %m.move_unit 移動する", "turtleMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right へ %n %m.turn_unit その場所で回る", "turtleTurnUnitInPlace", "左", 90, "度"],
			["w", "%m.left_right 車輪を中心に %n %m.turn_unit %m.head_tail 方向へ回る", "turtlePivotAroundWheelUnitInDirection", "左", 90, "度", "頭"],
			["w", "%m.left_right へ %n %m.turn_unit 半径 %n cmを %m.head_tail 方向へ回る", "turtleTurnUnitWithRadiusInDirection", "左", 90, "度", 6, "頭"],
			[" ", "左車輪を %n 右車輪を %n ずつ変える", "turtleChangeWheelsByLeftRight", 10, 10],
			[" ", "左車輪を %n 右車輪を %n にする", "turtleSetWheelsToLeftRight", 50, 50],
			[" ", "%m.left_right_both 車輪を %n ずつ変える", "turtleChangeWheelBy", "左", 10],
			[" ", "%m.left_right_both 車輪を %n にする", "turtleSetWheelTo", "左", 50],
			[" ", "%m.line_color 線に沿って移動する", "turtleFollowLine", "黒色"],
			["w", "黒色線に沿って %m.target_color まで移動する", "turtleFollowLineUntil", "赤色"],
			["w", "%m.color_line 線に沿って黒色まで移動する", "turtleFollowLineUntilBlack", "赤色"],
			["w", "黒色交差点を渡る", "turtleCrossIntersection"],
			["w", "黒色交差点で %m.left_right_back へ回る", "turtleTurnAtIntersection", "左"],
			[" ", "線に沿って移動する速さを %m.speed にする", "turtleSetFollowingSpeedTo", "5"],
			[" ", "停止する", "turtleStop"],
			["-"],
			[" ", "頭LEDを %m.led_color にする", "turtleSetHeadLedTo", "赤色"],
			[" ", "頭LEDをR: %n G: %n B: %n ずつ変える", "turtleChangeHeadLedByRGB", 10, 0, 0],
			[" ", "頭LEDをR: %n G: %n B: %n にする", "turtleSetHeadLedToRGB", 255, 0, 0],
			[" ", "頭LEDをオフにする", "turtleClearHeadLed"],
			["-"],
			[" ", "%m.sound 音を %n 回再生する", "turtlePlaySoundTimes", "ビープ", 1],
			["w", "%m.sound 音を %n 回再生して待つ", "turtlePlaySoundTimesUntilDone", "ビープ", 1],
			[" ", "ブザー音を %n ずつ変える", "turtleChangeBuzzerBy", 10],
			[" ", "ブザー音を %n にする", "turtleSetBuzzerTo", 1000],
			[" ", "音をオフにする", "turtleClearSound"],
			[" ", "%m.note %m.octave 音を奏でる", "turtlePlayNote", "ド", "4"],
			["w", "%m.note %m.octave 音を %d.beats 拍子奏でる", "turtlePlayNoteForBeats", "ド", "4", 0.5],
			["w", "%d.beats 拍子止める", "turtleRestForBeats", 0.25],
			[" ", "演奏の速さを %n ずつ変える", "turtleChangeTempoBy", 20],
			[" ", "演奏の速さを %n BPMにする", "turtleSetTempoTo", 60],
			["-"],
			["r", "色番号", "turtleColorNumber"],
			["r", "色パターン", "turtleColorPattern"],
			["r", "床底センサー", "turtleFloor"],
			["r", "ボタン", "turtleButton"],
			["r", "x軸加速度", "turtleAccelerationX"],
			["r", "y軸加速度", "turtleAccelerationY"],
			["r", "z軸加速度", "turtleAccelerationZ"],
			["h", "%m.touching_color に触れたとき", "turtleWhenColorTouched", "赤色"],
			["h", "色パターンが %m.pattern_color %m.pattern_color であるとき", "turtleWhenColorPattern", "赤色", "黄色"],
			["h", "ボタンを %m.when_button_state とき", "turtleWhenButtonState", "クリックした"],
			["h", "%m.when_tilt とき", "turtleWhenTilt", "前に傾けた"],
			["b", "%m.touching_color に触れたか?", "turtleTouchingColor", "赤色"],
			["b", "色パターンが %m.pattern_color %m.pattern_color ですか?", "turtleIsColorPattern", "赤色", "黄色"],
			["b", "ボタンを %m.button_state ?", "turtleButtonState", "クリックしたか"],
			["b", "%m.tilt ?", "turtleTilt", "前に傾けたか"],
			["b", "電池充電が %m.battery ?", "turtleBattery", "正常か"]
		],
		uz1: [
			["w", "oldinga yurish", "turtleMoveForward"],
			["w", "orqaga yurish", "turtleMoveBackward"],
			["w", "%m.left_right ga o'girilish", "turtleTurn", "chap"],
			["-"],
			[" ", "boshining LEDni %m.led_color ga sozlash", "turtleSetHeadLedTo", "qizil"],
			[" ", "boshining LEDni o'chirish", "turtleClearHeadLed"],
			["-"],
			[" ", "%m.sound tovushni ijro etish", "turtlePlaySound", "qisqa"],
			[" ", "tovushni o'chirish", "turtleClearSound"],
			["-"],
			["h", "%m.touching_color ga tegilganda", "turtleWhenColorTouched", "qizil"],
			["h", "tugmani %m.when_button_state da", "turtleWhenButtonState", "bosgan"],
			["b", "%m.touching_color ga tekkan?", "turtleTouchingColor", "qizil"],
			["b", "tugmani %m.button_state ?", "turtleButtonState", "bosgan"]
		],
		uz2: [
			["w", "oldinga %n %m.cm_sec yurish", "turtleMoveForwardUnit", 6, "cm"],
			["w", "orqaga %n %m.cm_sec yurish", "turtleMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right ga %n %m.deg_sec o'z joyda o'girilish", "turtleTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.left_right g'ildirak markaziga %n %m.deg_sec %m.head_tail yo'nalishga o'girilish", "turtlePivotAroundWheelUnitInDirection", "chap", 90, "daraja", "bosh"],
			["w", "%m.left_right ga %n %m.deg_sec radius %n cm %m.head_tail yo'nalishga o'girilish", "turtleTurnUnitWithRadiusInDirection", "chap", 90, "daraja", 6, "bosh"],
			["-"],
			[" ", "boshining LEDni %m.led_color ga sozlash", "turtleSetHeadLedTo", "qizil"],
			[" ", "boshining LEDni o'chirish", "turtleClearHeadLed"],
			["-"],
			[" ", "%m.sound tovushni %n marta ijro etish", "turtlePlaySoundTimes", "qisqa", 1],
			["w", "%m.sound tovushni %n marta ijro tugaguncha kutish", "turtlePlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "tovushni o'chirish", "turtleClearSound"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "turtlePlayNoteForBeats", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "turtleRestForBeats", 0.25],
			[" ", "temni %n ga o'zgartirish", "turtleChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "turtleSetTempoTo", 60],
			["-"],
			["h", "%m.touching_color ga tegilganda", "turtleWhenColorTouched", "qizil"],
			["h", "rang naqshi %m.pattern_color %m.pattern_color bo'lganida", "turtleWhenColorPattern", "qizil", "sariq"],
			["h", "tugmani %m.when_button_state da", "turtleWhenButtonState", "bosgan"],
			["h", "%m.when_tilt bo'lganda", "turtleWhenTilt", "oldinga eğin"],
			["b", "%m.touching_color ga tekkan?", "turtleTouchingColor", "qizil"],
			["b", "rang naqshi %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", "qizil", "sariq"],
			["b", "tugmani %m.button_state ?", "turtleButtonState", "bosgan"],
			["b", "%m.tilt ?", "turtleTilt", "oldinga eğin"]
		],
		uz3: [
			["w", "oldinga %n %m.move_unit yurish", "turtleMoveForwardUnit", 6, "cm"],
			["w", "orqaga %n %m.move_unit yurish", "turtleMoveBackwardUnit", 6, "cm"],
			["w", "%m.left_right ga %n %m.turn_unit o'z joyda o'girilish", "turtleTurnUnitInPlace", "chap", 90, "daraja"],
			["w", "%m.left_right g'ildirak markaziga %n %m.turn_unit %m.head_tail yo'nalishga o'girilish", "turtlePivotAroundWheelUnitInDirection", "chap", 90, "daraja", "bosh"],
			["w", "%m.left_right ga %n %m.turn_unit radius %n cm %m.head_tail yo'nalishga o'girilish", "turtleTurnUnitWithRadiusInDirection", "chap", 90, "daraja", 6, "bosh"],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga o'zgartirish", "turtleChangeWheelsByLeftRight", 10, 10],
			[" ", "chap g'ildirakni %n o'ng g'ildirakni %n ga sozlash", "turtleSetWheelsToLeftRight", 50, 50],
			[" ", "%m.left_right_both g'ildirakni %n ga o'zgartirish", "turtleChangeWheelBy", "chap", 10],
			[" ", "%m.left_right_both g'ildirakni %n ga sozlash", "turtleSetWheelTo", "chap", 50],
			[" ", "%m.line_color chiziqqa ergashish", "turtleFollowLine", "qora"],
			["w", "qora chiziq ustida %m.target_color gacha yurish", "turtleFollowLineUntil", "qizil"],
			["w", "%m.color_line chiziq ustida qora gacha yurish", "turtleFollowLineUntilBlack", "qizil"],
			["w", "qora chorrahadan o'tib yurish", "turtleCrossIntersection"],
			["w", "qora chorrahada %m.left_right_back ga o'girilish", "turtleTurnAtIntersection", "chap"],
			[" ", "liniyada ergashish tezligini %m.speed ga sozlash", "turtleSetFollowingSpeedTo", "5"],
			[" ", "to'xtatish", "turtleStop"],
			["-"],
			[" ", "boshining LEDni %m.led_color ga sozlash", "turtleSetHeadLedTo", "qizil"],
			[" ", "boshining LEDni r: %n g: %n b: %n ga o'zgartirish", "turtleChangeHeadLedByRGB", 10, 0, 0],
			[" ", "boshining LEDni r: %n g: %n b: %n ga sozlash", "turtleSetHeadLedToRGB", 255, 0, 0],
			[" ", "boshining LEDni o'chirish", "turtleClearHeadLed"],
			["-"],
			[" ", "%m.sound tovushni %n marta ijro etish", "turtlePlaySoundTimes", "qisqa", 1],
			["w", "%m.sound tovushni %n marta ijro tugaguncha kutish", "turtlePlaySoundTimesUntilDone", "qisqa", 1],
			[" ", "buzerning ovozini %n ga o'zgartirish", "turtleChangeBuzzerBy", 10],
			[" ", "buzerning ovozini %n ga sozlash", "turtleSetBuzzerTo", 1000],
			[" ", "tovushni o'chirish", "turtleClearSound"],
			[" ", "%m.note %m.octave notani ijro etish", "turtlePlayNote", "do", "4"],
			["w", "%m.note %m.octave notani %d.beats zarb ijro etish", "turtlePlayNoteForBeats", "do", "4", 0.5],
			["w", "%d.beats zarb tanaffus", "turtleRestForBeats", 0.25],
			[" ", "temni %n ga o'zgartirish", "turtleChangeTempoBy", 20],
			[" ", "temni %n bpm ga sozlash", "turtleSetTempoTo", 60],
			["-"],
			["r", "rang raqami", "turtleColorNumber"],
			["r", "rang naqshi", "turtleColorPattern"],
			["r", "taglik sensori", "turtleFloor"],
			["r", "tugma", "turtleButton"],
			["r", "x tezlanish", "turtleAccelerationX"],
			["r", "y tezlanish", "turtleAccelerationY"],
			["r", "z tezlanish", "turtleAccelerationZ"],
			["h", "%m.touching_color ga tegilganda", "turtleWhenColorTouched", "qizil"],
			["h", "rang naqshi %m.pattern_color %m.pattern_color bo'lganida", "turtleWhenColorPattern", "qizil", "sariq"],
			["h", "tugmani %m.when_button_state da", "turtleWhenButtonState", "bosgan"],
			["h", "%m.when_tilt bo'lganda", "turtleWhenTilt", "oldinga eğin"],
			["b", "%m.touching_color ga tekkan?", "turtleTouchingColor", "qizil"],
			["b", "rang naqshi %m.pattern_color %m.pattern_color ?", "turtleIsColorPattern", "qizil", "sariq"],
			["b", "tugmani %m.button_state ?", "turtleButtonState", "bosgan"],
			["b", "%m.tilt ?", "turtleTilt", "oldinga eğin"],
			["b", "batareya %m.battery ?", "turtleBattery", "normal"]
		]
	};
	const MENUS = {
		en: {
			"move_unit": ["cm", "seconds", "pulses"],
			"turn_unit": ["degrees", "seconds", "pulses"],
			"cm_sec": ["cm", "seconds"],
			"deg_sec": ["degrees", "seconds"],
			"head_tail": ["head", "tail"],
			"left_right": ["left", "right"],
			"left_right_both": ["left", "right", "both"],
			"left_right_back": ["left", "right", "back"],
			"line_color": ["black", "red", "green", "blue", "any color"],
			"target_color": ["red", "yellow", "green", "sky blue", "blue", "purple", "any color"],
			"color_line": ["red", "green", "blue", "any color"],
			"touching_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "purple", "black", "white"],
			"pattern_color": ["red", "yellow", "green", "sky blue", "blue", "purple"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["red", "orange", "yellow", "green", "sky blue", "blue", "violet", "purple", "white"],
			"sound": ["beep", "random beep", "siren", "engine", "robot", "march", "birthday", "dibidibidip", "good job"],
			"note": ["C", "C♯ (D♭)", "D", "D♯ (E♭)", "E", "F", "F♯ (G♭)", "G", "G♯ (A♭)", "A", "A♯ (B♭)", "B"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["clicked", "double-clicked", "long-pressed"],
			"when_tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"button_state": ["clicked", "double-clicked", "long-pressed"],
			"tilt": ["tilt forward", "tilt backward", "tilt left", "tilt right", "tilt flip", "not tilt"],
			"battery": ["normal", "low", "empty"]
		},
		ko: {
			"cheese_sensor": ["x축 가속도", "y축 가속도", "z축 가속도", "신호 세기 (dBm)"],
			"when_cheese_tilt": ["로고가 하늘 방향일", "로고가 땅 방향일", "전원 스위치가 하늘 방향일", "전원 스위치가 땅 방향일", "포트 S가 하늘 방향일", "포트 S가 땅 방향일", "두드렸을", "자유 낙하했을"],
			"cheese_tilt": ["로고가 하늘 방향", "로고가 땅 방향", "전원 스위치가 하늘 방향", "전원 스위치가 땅 방향", "포트 S가 하늘 방향", "포트 S가 땅 방향", "두드림", "자유 낙하"],
			"battery": ["정상", "부족", "없음"],
			"sound_effect": ["삐", "무작위 삐", "지지직", "사이렌", "엔진", "쩝", "로봇", "디비디비딥", "잘 했어요", "행복", "화남", "슬픔", "졸림", "행진", "생일"],
			"note": ["도", "도♯ (레♭)", "레", "레♯ (미♭)", "미", "파", "파♯ (솔♭)", "솔", "솔♯ (라♭)", "라", "라♯ (시♭)", "시"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"cheese_port_sound": ["내부 스피커", "포트 Mab"],
			"cheese_input_port": ["Sa", "Sb", "Sc", "La", "Lb", "Lc"],
			"cheese_mode_input_s_l": ["메이키", "버튼", "디지털 (풀업)", "디지털 (풀다운)", "아날로그", "전압"],
			"cheese_range_decimal": ["없음", "있음"],
			"cheese_digital_value": ["0", "1"],
			"when_button_state": ["클릭했을", "오래 눌렀을"],
			"button_state": ["클릭했는가", "오래 눌렀는가"],
			"cheese_input_port_c": ["Sc", "Lc"],
			"cheese_mode_input_s_l_c": ["펄스", "펄스 (풀업)", "펄스 (풀다운)"],
			"cheese_port_digital_output": ["Sa", "Sb", "Sc", "La", "Lb", "Lc", "고전류 Ma(-)b", "고전류 Mc(-)d"],
			"cheese_port_pwm_output": ["Sa", "Sb", "Sc", "La", "Lb", "Lc"],
			"cheese_port_servo_motor": ["Sa", "Sb", "Sc", "La", "Lb", "Lc", "Ma(-)b(+)c", "Ma(-)b", "Mc(-)d"],
			"cheese_port_dc_motor": ["Mab", "Mcd"],
			"cheese_stop_off": ["정지하기", "전원 끄기"],
			"cheese_mode_step_motor": ["기본", "파워"],
			"led_intensity": ["어두운", "기본", "밝은"],
			"led_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"cheese_led_port": ["L", "S"],
			"cheese_led_type": ["기본", "-RGB", "-RBG", "-GRB", "-GBR", "-BRG", "-BGR", "+RGB", "+RBG", "+GRB", "+GBR", "+BRG", "+BGR"],
			"cheese_neopixel_type": ["GRB", "GRBW"],
			"neopixel_pattern": ["3색", "6색", "12색", "빨간색부터 초록색까지", "빨간색부터 파란색까지", "빨간색부터 하얀색까지", "초록색부터 빨간색까지", "초록색부터 파란색까지", "초록색부터 하얀색까지", "파란색부터 빨간색까지", "파란색부터 초록색까지", "파란색부터 하얀색까지", "하얀색부터 빨간색까지", "하얀색부터 초록색까지", "하얀색부터 파란색까지", "빨간색 점점 어둡게", "초록색 점점 어둡게", "파란색 점점 어둡게", "하얀색 점점 어둡게", "빨간색 점점 밝게", "초록색 점점 밝게", "파란색 점점 밝게", "하얀색 점점 밝게"],
			"serial_output": ["글자", "글자 한 줄"],
			"serial_delimiter": ["모두", ",(쉼표)까지", ":(쌍점)까지", "$까지", "#까지", "줄 바꿈까지"],
			"serial_port": ["La(쓰기) Lb(읽기)", "La(읽기) Lb(쓰기)", "La(쓰기)", "La(읽기)"],
			"serial_baud": ["9600", "14400", "19200", "28800", "38400", "57600", "76800", "115200"],
			"cheese_pid_device": ["PID-10 초음파 센서(HC-SR04+)", "PID-11-1 온습도 센서(DHT11)", "PID-11-2 온습도 센서(DHT21)", "PID-11-3 온습도 센서(DHT22)", "PID-12 온도 센서(DS18B20)", "PID-13 조이스틱과 버튼", "PID-14 듀얼 조이스틱", "PID-16 엔코더"],
			"cheese_pid_range_input": ["x1", "y1", "x2", "y2"],
			"cheese_pid_input": ["거리 (cm)", "온도 (℃)", "습도 (%RH)", "x1", "y1", "x2", "y2", "버튼1", "버튼2", "엔코더"],
			"cheese_pid_button": ["1", "2"],
			"cheese_hat10_button": ["A", "B"],
			"cheese_hat10_color": ["빨간색", "주황색", "노란색", "초록색", "하늘색", "파란색", "보라색", "자주색", "하얀색"],
			"cheese_shape": ["사각형", "삼각형", "다이아몬드", "원", "X", "좋음", "싫음", "화남", "입 열기", "입 닫기", "걷기 1", "걷기 2", "하트", "별", "비행기", "강아지", "나비", "4분 음표", "8분 음표", "왼쪽 화살표", "오른쪽 화살표", "위쪽 화살표", "아래쪽 화살표"],
			"cheese_background_all": ["배경", "모두"],
			"cheese_clear_show_hide": ["지우기", "보이기", "숨기기"],
			"cheese_position": ["x", "y"],
			"cheese_clockwise": ["시계", "반시계"],
			"cheese_flip": ["왼쪽-오른쪽", "위-아래"],
			"cheese_touching": ["배경", "다른 그림", "왼쪽 벽", "오른쪽 벽", "위쪽 벽", "아래쪽 벽", "아무 벽"]
		},
		ja: {
			"move_unit": ["cm", "秒", "パルス"],
			"turn_unit": ["度", "秒", "パルス"],
			"cm_sec": ["cm", "秒"],
			"deg_sec": ["度", "秒"],
			"head_tail": ["頭", "尾"],
			"left_right": ["左", "右"],
			"left_right_both": ["左", "右", "両方"],
			"left_right_back": ["左", "右", "後ろ"],
			"line_color": ["黒色", "赤色", "緑色", "青色", "全ての色"],
			"target_color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色", "全ての色"],
			"color_line": ["赤色", "緑色", "青色", "全ての色"],
			"touching_color": ["赤色", "オレンジ色", "黄色", "緑色", "水色", "青色", "紫色", "黒色", "白色"],
			"pattern_color": ["赤色", "黄色", "緑色", "水色", "青色", "紫色"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["赤色", "オレンジ色", "黄色", "緑色", "水色", "青色", "青紫色", "紫色", "白色"],
			"sound": ["ビープ", "ランダムビープ", "サイレン", "エンジン", "ロボット", "行進", "誕生日", "ディバディバディップ", "よくできました"],
			"note": ["ド", "ド♯ (レ♭)", "レ", "レ♯ (ミ♭)", "ミ", "ファ", "ファ♯ (ソ♭)", "ソ", "ソ♯ (ラ♭)", "ラ", "ラ♯ (シ♭)", "シ"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["クリックした", "ダブルクリックした", "長く押した"],
			"when_tilt": ["前に傾けた", "後ろに傾けた", "左に傾けた", "右に傾けた", "上下裏返した", "傾いてなかった"],
			"button_state": ["クリックしたか", "ダブルクリックしたか", "長く押したか"],
			"tilt": ["前に傾けたか", "後ろに傾けたか", "左に傾けたか", "右に傾けたか", "上下裏返したか", "傾いてないか"],
			"battery": ["正常か", "不足しているか", "なくなったか"]
		},
		uz: {
			"move_unit": ["cm", "soniya", "puls"],
			"turn_unit": ["daraja", "soniya", "puls"],
			"cm_sec": ["cm", "soniya"],
			"deg_sec": ["daraja", "soniya"],
			"head_tail": ["bosh", "dum"],
			"left_right": ["chap", "o'ng"],
			"left_right_both": ["chap", "o'ng", "har ikki"],
			"left_right_back": ["chap", "o'ng", "orqa"],
			"line_color": ["qora", "qizil", "yashil", "ko'k", "har qanday rang"],
			"target_color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh", "har qanday rang"],
			"color_line": ["qizil", "yashil", "ko'k", "har qanday rang"],
			"touching_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "siyoh", "qora", "oq"],
			"pattern_color": ["qizil", "sariq", "yashil", "moviy", "ko'k", "siyoh"],
			"speed": ["1", "2", "3", "4", "5", "6", "7", "8"],
			"led_color": ["qizil", "mandarin", "sariq", "yashil", "moviy", "ko'k", "binafsha", "siyoh", "oq"],
			"sound": ["qisqa", "tasodifiy qisqa", "sirena", "motor", "robot", "marsh", "tug'ilgan kun", "dibidibidip", "juda yaxshi"],
			"note": ["do", "do♯ (re♭)", "re", "re♯ (mi♭)", "mi", "fa", "fa♯ (sol♭)", "sol", "sol♯ (lya♭)", "lya", "lya♯ (si♭)", "si"],
			"octave": ["1", "2", "3", "4", "5", "6", "7"],
			"beats": ["¼", "½", "¾", "1", "1¼", "1½", "1¾", "2", "3", "4"],
			"when_button_state": ["bosgan", "ikki-marta-bosgan", "uzoq-bosganmi"],
			"when_tilt": ["oldinga eğin", "orqaga eğin", "chapga eğin", "o'ngga eğin", "ostin-ustun", "eğin yo'q"],
			"button_state": ["bosgan", "ikki-marta-bosgan", "uzoq-bosganmi"],
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
		if(robot) return robot.getColorNumber();
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
