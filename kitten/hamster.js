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
		lineTracerState: 0,
		tilt: 0,
		batteryState: 2,
		handFound: false
	};
	this.motoring = {
		module: 'hamster',
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
	const motoring = this.motoring;
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
	const idx = this.timeouts.indexOf(id);
	if(idx >= 0) {
		this.timeouts.splice(idx, 1);
	}
};

Hamster.prototype.__removeAllTimeouts = function() {
	const timeouts = this.timeouts;
	for(const i in timeouts) {
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
	const self = this;
	const sensory = self.sensory;
	if(self.lineTracerCallback && (sensory.map & 0x00000010) != 0) {
		if(sensory.lineTracerState == 0x40) {
			self.__setLineTracerMode(0);
			const callback = self.lineTracerCallback;
			self.__cancelLineTracer();
			if(callback) callback();
		}
	}
	if(self.boardCallback) {
		const motoring = self.motoring;
		if(self.boardCommand == 1) {
			switch(self.boardState) {
				case 1: {
					if(self.boardCount < 2) {
						if(sensory.leftFloor < 50 && sensory.rightFloor < 50)
							self.boardCount ++;
						else
							self.boardCount = 0;
						const diff = sensory.leftFloor - sensory.rightFloor;
						motoring.leftWheel = 45 + diff * 0.25;
						motoring.rightWheel = 45 - diff * 0.25;
					} else {
						self.boardCount = 0;
						self.boardState = 2;
					}
					break;
				}
				case 2: {
					const diff = sensory.leftFloor - sensory.rightFloor;
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
					const diff = sensory.leftFloor - sensory.rightFloor;
					motoring.leftWheel = 45 + diff * 0.25;
					motoring.rightWheel = 45 - diff * 0.25;
					break;
				}
				case 4: {
					motoring.leftWheel = 0;
					motoring.rightWheel = 0;
					const callback = self.boardCallback;
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
					const diff = sensory.leftFloor - sensory.rightFloor;
					if(diff > -15) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						const callback = self.boardCallback;
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
					const diff = sensory.rightFloor - sensory.leftFloor;
					if(diff > -15) {
						motoring.leftWheel = 0;
						motoring.rightWheel = 0;
						const callback = self.boardCallback;
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
	const motoring = this.motoring;
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
	if(direction == 'left') {
		this.__board(-45, 45, 2, callback);
	} else {
		this.__board(45, -45, 3, callback);
	}
};

Hamster.prototype.__motion = function(type, leftVelocity, rightVelocity, secs, callback) {
	const self = this;
	const motoring = self.motoring;
	self.__cancelBoard();
	self.__cancelWheel();
	self.__cancelLineTracer();
	
	secs = parseFloat(secs);
	if(secs && secs > 0) {
		const id = self.__issueWheelId();
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
	if(direction == 'left') {
		this.__motion(3, -30, 30, 1, callback);
	} else {
		this.__motion(4, 30, -30, 1, callback);
	}
};

Hamster.prototype.moveForwardSecs = function(secs, callback) {
	if(secs < 0) this.__motion(2, -30, -30, -secs, callback);
	else this.__motion(1, 30, 30, secs, callback);
};

Hamster.prototype.moveBackwardSecs = function(secs, callback) {
	if(secs < 0) this.__motion(1, 30, 30, -secs, callback);
	else this.__motion(2, -30, -30, secs, callback);
};

Hamster.prototype.turnSecs = function(direction, secs, callback) {
	if(direction == 'left') {
		if(secs < 0) this.__motion(4, 30, -30, -secs, callback);
		else this.__motion(3, -30, 30, secs, callback);
	} else {
		if(secs < 0) this.__motion(3, -30, 30, -secs, callback);
		else this.__motion(4, 30, -30, secs, callback);
	}
};

Hamster.prototype.__stopMotion = function() {
	const motoring = this.motoring;
	this.__cancelBoard();
	this.__cancelWheel();
	this.__cancelLineTracer();
	motoring.leftWheel = 0;
	motoring.rightWheel = 0;
	motoring.motion = 0;
	this.__setLineTracerMode(0);
};

Hamster.prototype.moveForwardUnit = function(value, unit, callback) {
	if(unit == 'seconds') {
		this.moveForwardSecs(value, callback);
	} else {
		this.__stopMotion();
	}
};

Hamster.prototype.moveBackwardUnit = function(value, unit, callback) {
	if(unit == 'seconds') {
		this.moveBackwardSecs(value, callback);
	} else {
		this.__stopMotion();
	}
};

Hamster.prototype.turnUnit = function(direction, value, unit, callback) {
	if(unit == 'seconds') {
		this.turnSecs(direction, value, callback);
	} else {
		this.__stopMotion();
	}
};

Hamster.prototype.pivotWheelUnit = function(wheel, value, unit, toward, callback) {
	if(unit == 'seconds') {
		if(wheel == 'left') {
			if(toward == 'forward') {
				if(value < 0) this.__motion(6, 0, -30, -value, callback);
				else this.__motion(5, 0, 30, value, callback);
			} else {
				if(value < 0) this.__motion(5, 0, 30, -value, callback);
				else this.__motion(6, 0, -30, value, callback);
			}
		} else {
			if(toward == 'forward') {
				if(value < 0) this.__motion(8, -30, 0, -value, callback);
				else this.__motion(7, 30, 0, value, callback);
			} else {
				if(value < 0) this.__motion(7, 30, 0, -value, callback);
				else this.__motion(8, -30, 0, value, callback);
			}
		}
	} else {
		this.__stopMotion();
	}
};

Hamster.prototype.swingBodyUnit = function(direction, value, unit, radius, toward, callback) {
	if(unit == 'seconds') {
		radius = parseFloat(radius);
		if((typeof radius == 'number') && radius >= 0) {
			this.motoring.radius = radius;
			if(direction == 'left') {
				if(toward == 'forward') {
					if(value < 0) this.__motion(10, 0, 0, -value, callback);
					else this.__motion(9, 0, 0, value, callback);
				} else {
					if(value < 0) this.__motion(9, 0, 0, -value, callback);
					else this.__motion(10, 0, 0, value, callback);
				}
			} else {
				if(toward == 'forward') {
					if(value < 0) this.__motion(12, 0, 0, -value, callback);
					else this.__motion(11, 0, 0, value, callback);
				} else {
					if(value < 0) this.__motion(11, 0, 0, -value, callback);
					else this.__motion(12, 0, 0, value, callback);
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

Hamster.prototype.pivotUnit = function(part, value, unit, toward, callback) {
	if(unit == 'seconds') {
		if(part == 'left pen') {
			if(toward == 'forward') {
				if(value < 0) this.__motion(14, 0, 0, -value, callback);
				else this.__motion(13, 0, 0, value, callback);
			} else {
				if(value < 0) this.__motion(13, 0, 0, -value, callback);
				else this.__motion(14, 0, 0, value, callback);
			}
		} else if(part == 'right pen') {
			if(toward == 'forward') {
				if(value < 0) this.__motion(16, 0, 0, -value, callback);
				else this.__motion(15, 0, 0, value, callback);
			} else {
				if(value < 0) this.__motion(15, 0, 0, -value, callback);
				else this.__motion(16, 0, 0, value, callback);
			}
		} else if(part == 'left wheel') {
			if(toward == 'forward') {
				if(value < 0) this.__motion(6, 0, -30, -value, callback);
				else this.__motion(5, 0, 30, value, callback);
			} else {
				if(value < 0) this.__motion(5, 0, 30, -value, callback);
				else this.__motion(6, 0, -30, value, callback);
			}
		} else {
			if(toward == 'forward') {
				if(value < 0) this.__motion(8, -30, 0, -value, callback);
				else this.__motion(7, 30, 0, value, callback);
			} else {
				if(value < 0) this.__motion(7, 30, 0, -value, callback);
				else this.__motion(8, -30, 0, value, callback);
			}
		}
	} else {
		this.__stopMotion();
	}
};

Hamster.prototype.swingUnit = function(part, direction, value, unit, radius, toward, callback) {
	if(unit == 'seconds') {
		radius = parseFloat(radius);
		if((typeof radius == 'number') && radius >= 0) {
			this.motoring.radius = radius;
			if(part == 'left pen') {
				if(direction == 'left') {
					if(toward == 'forward') {
						if(value < 0) this.__motion(18, 0, 0, -value, callback);
						else this.__motion(17, 0, 0, value, callback);
					} else {
						if(value < 0) this.__motion(17, 0, 0, -value, callback);
						else this.__motion(18, 0, 0, value, callback);
					}
				} else {
					if(toward == 'forward') {
						if(value < 0) this.__motion(20, 0, 0, -value, callback);
						else this.__motion(19, 0, 0, value, callback);
					} else {
						if(value < 0) this.__motion(19, 0, 0, -value, callback);
						else this.__motion(20, 0, 0, value, callback);
					}
				}
			} else if(part == 'right pen') {
				if(direction == 'left') {
					if(toward == 'forward') {
						if(value < 0) this.__motion(22, 0, 0, -value, callback);
						else this.__motion(21, 0, 0, value, callback);
					} else {
						if(value < 0) this.__motion(21, 0, 0, -value, callback);
						else this.__motion(22, 0, 0, value, callback);
					}
				} else {
					if(toward == 'forward') {
						if(value < 0) this.__motion(24, 0, 0, -value, callback);
						else this.__motion(23, 0, 0, value, callback);
					} else {
						if(value < 0) this.__motion(23, 0, 0, -value, callback);
						else this.__motion(24, 0, 0, value, callback);
					}
				}
			} else {
				if(direction == 'left') {
					if(toward == 'forward') {
						if(value < 0) this.__motion(10, 0, 0, -value, callback);
						else this.__motion(9, 0, 0, value, callback);
					} else {
						if(value < 0) this.__motion(9, 0, 0, -value, callback);
						else this.__motion(10, 0, 0, value, callback);
					}
				} else {
					if(toward == 'forward') {
						if(value < 0) this.__motion(12, 0, 0, -value, callback);
						else this.__motion(11, 0, 0, value, callback);
					} else {
						if(value < 0) this.__motion(11, 0, 0, -value, callback);
						else this.__motion(12, 0, 0, value, callback);
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
	const motoring = this.motoring;
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
	const motoring = this.motoring;
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
	const motoring = this.motoring;
	this.__cancelBoard();
	this.__cancelWheel();
	this.__cancelLineTracer();
	
	velocity = parseFloat(velocity);
	if(typeof velocity == 'number') {
		if(wheel == 'left') {
			motoring.leftWheel = velocity;
		} else if(wheel == 'right') {
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
	const motoring = this.motoring;
	this.__cancelBoard();
	this.__cancelWheel();
	this.__cancelLineTracer();
	
	velocity = parseFloat(velocity);
	if(typeof velocity == 'number') {
		if(wheel == 'left') {
			motoring.leftWheel += velocity;
		} else if(wheel == 'right') {
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
	const motoring = this.motoring;
	this.__cancelBoard();
	this.__cancelWheel();
	this.__cancelLineTracer();
	
	let mode = 1;
	if(sensor == 'right') mode = 2;
	else if(sensor == 'both') mode = 3;
	if(color == 'white') mode += 7;
	
	motoring.leftWheel = 0;
	motoring.rightWheel = 0;
	motoring.motion = 0;
	this.__setLineTracerMode(mode);
};

Hamster.prototype.followLineUntil = function(color, direction, callback) {
	const motoring = this.motoring;
	this.__cancelBoard();
	this.__cancelWheel();
	
	let mode = 4;
	if(direction == 'right') mode = 5;
	else if(direction == 'front') mode = 6;
	else if(direction == 'rear') mode = 7;
	if(color == 'white') mode += 7;
	
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
	const motoring = this.motoring;
	this.__cancelBoard();
	this.__cancelWheel();
	this.__cancelLineTracer();
	
	motoring.leftWheel = 0;
	motoring.rightWheel = 0;
	motoring.motion = 0;
	this.__setLineTracerMode(0);
};

Hamster.prototype.__COLORS = {
	'red': 4,
	'orange': 4,
	'yellow': 6,
	'green': 2,
	'sky blue': 3,
	'blue': 1,
	'violet': 5,
	'purple': 5,
	'white': 7
};

Hamster.prototype.setLed = function(led, color) {
	color = this.__COLORS[color];
	if(color && color > 0) {
		if(led == 'left') {
			this.__setLeftLed(color);
		} else if(led == 'right') {
			this.__setRightLed(color);
		} else {
			this.__setLeftLed(color);
			this.__setRightLed(color);
		}
	}
};

Hamster.prototype.clearLed = function(led) {
	if(led == 'left') {
		this.__setLeftLed(0);
	} else if(led == 'right') {
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
		const self = this;
		const motoring = self.motoring;
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
	const id = this.__issueNoteId();
	this.runBeep(1, id, callback);
};

Hamster.prototype.playSound = function(sound, count) {
	this.__cancelNote();
	this.motoring.buzzer = 0;
	this.__setNote(0);
	count = parseInt(count);
	if(sound == 'beep' && count) {
		this.runBeep(count);
	}
};

Hamster.prototype.playSoundUntil = function(sound, count, callback) {
	this.__cancelNote();
	this.motoring.buzzer = 0;
	this.__setNote(0);
	count = parseInt(count);
	if(count) {
		if(sound == 'beep') {
			const id = this.__issueNoteId();
			this.runBeep(count, id, callback);
		}
	} else {
		callback();
	}
};

Hamster.prototype.setBuzzer = function(hz) {
	const motoring = this.motoring;
	this.__cancelNote();
	
	hz = parseFloat(hz);
	if(typeof hz == 'number') {
		motoring.buzzer = hz;
	}
	this.__setNote(0);
};

Hamster.prototype.changeBuzzer = function(hz) {
	const motoring = this.motoring;
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

Hamster.prototype.__NOTES = {
	'C': 4,
	'C♯ (D♭)': 5,
	'D': 6,
	'D♯ (E♭)': 7,
	'E': 8,
	'F': 9,
	'F♯ (G♭)': 10,
	'G': 11,
	'G♯ (A♭)': 12,
	'A': 13,
	'A♯ (B♭)': 14,
	'B': 15
};

Hamster.prototype.playNote = function(note, octave) {
	const motoring = this.motoring;
	this.__cancelNote();
	
	note = this.__NOTES[note];
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
	const self = this;
	const motoring = self.motoring;
	self.__cancelNote();
	
	note = self.__NOTES[note];
	octave = parseInt(octave);
	beat = parseFloat(beat);
	motoring.buzzer = 0;
	if(note && octave && octave > 0 && octave < 8 && beat && beat > 0 && self.tempo > 0) {
		const id = self.__issueNoteId();
		note += (octave - 1) * 12;
		self.__setNote(note);
		const timeout = beat * 60 * 1000 / self.tempo;
		const tail = (timeout > 100) ? 100 : 0;
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
	const self = this;
	const motoring = self.motoring;
	self.__cancelNote();
	
	beat = parseFloat(beat);
	motoring.buzzer = 0;
	self.__setNote(0);
	if(beat && beat > 0 && self.tempo > 0) {
		const id = self.__issueNoteId();
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
	const sensory = this.sensory;
	return (sensory.handFound === undefined) ? (sensory.leftProximity > 40 || sensory.rightProximity > 40) : sensory.handFound;
};

Hamster.prototype.checkTilt = function(tilt) {
	switch(tilt) {
		case 'tilt forward': return this.sensory.tilt == 1;
		case 'tilt backward': return this.sensory.tilt == -1;
		case 'tilt left': return this.sensory.tilt == 2;
		case 'tilt right': return this.sensory.tilt == -2;
		case 'tilt flip': return this.sensory.tilt == 3;
		case 'not tilt': return this.sensory.tilt == -3;
	}
	return false;
};

Hamster.prototype.__BATTERY_STATES = {
	'normal': 2,
	'low': 1,
	'empty': 0
};

Hamster.prototype.checkBattery = function(battery) {
	return this.sensory.batteryState == this.__BATTERY_STATES[battery];
};

Hamster.prototype.__IO_MODES = {
	'analog input': 0,
	'digital input': 1,
	'servo output': 8,
	'pwm output': 9,
	'digital output': 10
};

Hamster.prototype.setIoMode = function(port, mode) {
	this.__cancelIo();
	mode = this.__IO_MODES[mode];
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
	const motoring = this.motoring;
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
	const motoring = this.motoring;
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
	const self = this;
	const motoring = self.motoring;
	self.__cancelIo();
	
	const id = self.__issueIoId();
	self.__setIoModeA(10);
	self.__setIoModeB(10);
	if(action == 'open') {
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
	const motoring = this.motoring;
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

Hamster.prototype.writeSerial = function(mode, text, callback) {
	this.__cancelIo();
};

Hamster.prototype.readSerialUltil = function(delimiter, callback) {
	this.__cancelIo();
};

Hamster.prototype.setSerialRate = function(baud) {
	this.__cancelIo();
};

Hamster.prototype.getSerialInput = function() {
	return '';
};

const RoboidRunner = {
	robots: {},
	robotsByGroup: {},
	robotsByModule: {},
	packet: {},
	retryId: undefined,
	alive: false,
	canSend: false,
	addRobotByModule: function(module, key, robot) {
		let robots = RoboidRunner.robotsByModule[module];
		if(robots === undefined) {
			robots = RoboidRunner.robotsByModule[module] = {};
		}
		robots[key] = robot;
	},
	getOrCreateRobot: function(group, module, index) {
		const robots = RoboidRunner.robots;
		const key = module + index;
		let robot = robots[key];
		if(!robot) {
			if(module == 'hamster') {
				robot = new Hamster(index);
			}
			if(robot) {
				robots[key] = robot;
				RoboidRunner.packet[key] = robot.motoring;
				RoboidRunner.addRobotByModule(module, key, robot);
			}
		}
		RoboidRunner.robotsByGroup[group + index] = robot;
		return robot;
	},
	getRobot: function(group, index) {
		return RoboidRunner.robotsByGroup[group + index];
	},
	clearMotorings: function() {
		const robots = RoboidRunner.robots;
		for(const i in robots) {
			robots[i].clearMotoring();
		}
	},
	afterTick: function() {
		const robots = RoboidRunner.robots;
		for(const i in robots) {
			robots[i].clearEvent();
		}
	},
	reset: function(module) {
		const robots = RoboidRunner.robotsByModule[module];
		if(robots) {
			for(const i in robots) {
				robots[i].reset();
			}
		}
	},
	open: function() {
		try {
			const self = RoboidRunner;
			const sock = new WebSocket('ws://localhost:56417');
			sock.binaryType = 'arraybuffer';
			self.socket = sock;
			sock.onmessage = function(message) {
				try {
					const received = JSON.parse(message.data);
					if(received.type == 0) {
					} else if(received.type == 2) {
						for(const module in received.modules) {
						}
					} else {
						if(received.index >= 0) {
							const robot = self.getOrCreateRobot(received.group, received.module, received.index);
							if(robot) {
								robot.clearEvent();
								robot.sensory = received;
								robot.handleSensory();
							}
						}
					}
				} catch (e) {
				}
			};
			sock.onclose = function() {
				self.alive = false;
				self.canSend = false;
				if(self.retryId === undefined) {
					self.retryId = setInterval(function() {
						if(self.alive) {
							if(self.retryId !== undefined) {
								clearInterval(self.retryId);
								self.retryId = undefined;
							}
						} else {
							self.open();
						}
					}, 2000);
				}
			};
			sock.onopen = function() {
				self.alive = true;
				
				let targetTime = Date.now();
				const run = function() {
					if(self.canSend && self.socket) {
						if(Date.now() > targetTime) {
							try {
								const json = JSON.stringify(self.packet);
								if(self.canSend && self.socket) self.socket.send(json);
								self.clearMotorings();
							} catch (e) {
							}
							targetTime += 20;
						}
						setTimeout(run, 5);
					}
				};
				self.canSend = true;
				run();
			};
			return true;
		} catch(e) {
		}
		return false;
	},
	close: function() {
		RoboidRunner.canSend = false;
		if(RoboidRunner.socket) {
			RoboidRunner.socket.close();
			RoboidRunner.socket = undefined;
		}
	}
};

const RoboidUtil = {
	toNumber: function(value, defaultValue) {
		if(defaultValue === undefined) defaultValue = 0;
		const n = Number(value);
		if(isNaN(n)) return defaultValue;
		return n;
	},
	toBoolean: function(value) {
		if(typeof value === 'boolean') {
			return value;
		}
		if(typeof value === 'string') {
			if((value === '') || (value === '0') || (value.toLowerCase() === 'false')) {
				return false;
			}
			return true;
		}
		return Boolean(value);
	},
	toString: function(value) {
		return String(value);
	},
	hexToRgb: function(hex) {
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	},
	decimalToRgb: function(decimal) {
		const a = (decimal >> 24) & 0xff;
		const r = (decimal >> 16) & 0xff;
		const g = (decimal >> 8) & 0xff;
		const b = decimal & 0xff;
		return {r: r, g: g, b: b, a: a > 0 ? a : 255};
	},
	toRgbArray: function(value) {
		let color;
		if(typeof value === 'string' && value.substring(0, 1) === '#') {
			color = RoboidUtil.hexToRgb(value);
		} else {
			color = RoboidUtil.decimalToRgb(RoboidUtil.toNumber(value));
		}
		return [color.r, color.g, color.b];
	}
};

const RoboidUx = {
	retryId: undefined,
	alive: false,
	commands: {},
	open: function() {
		try {
			const self = RoboidUx;
			const sock = new WebSocket('ws://localhost:56419');
			sock.binaryType = 'arraybuffer';
			self.socket = sock;
			sock.onmessage = function(message) {
				try {
					const received = JSON.parse(message.data);
					if(received && received.command) {
						const cmds = self.commands[received.command];
						if(cmds) {
							for(const i in cmds) {
								cmds[i]();
							}
						}
					}
				} catch (e) {
				}
			};
			sock.onclose = function() {
				self.alive = false;
				if(self.retryId === undefined) {
					self.retryId = setInterval(function() {
						if(self.alive) {
							if(self.retryId !== undefined) {
								clearInterval(self.retryId);
								self.retryId = undefined;
							}
						} else {
							self.open();
						}
					}, 2000);
				}
			};
			sock.onopen = function() {
				self.alive = true;
			};
			return true;
		} catch(e) {
		}
		return false;
	},
	close: function() {
		if(RoboidUx.socket) {
			RoboidUx.socket.close();
			RoboidUx.socket = undefined;
		}
	},
	on: function(key, callback) {
		let cmds = RoboidUx.commands[key];
		if(!cmds) {
			cmds = RoboidUx.commands[key] = [];
		}
		cmds.push(callback);
	}
};

class HamsterExtension {
	constructor(runtime) {
		this._icon = 'https://hamsterschool.github.io/ml4kids/images/hamster192.png';
		RoboidUx.on('stopAll', this.onStop.bind(this));
	}
	
	onStop() {
		RoboidRunner.reset('hamster');
	}
	
	getInfo() {
		return {
			id: 'hamster',
			name: '햄스터',
			menuIconURI: this._icon,
			blockIconURI: this._icon,
			blocks: [
				{"opcode":"boardMoveForward","text":"말판 앞으로 한 칸 이동하기","blockType":"command","func":"boardMoveForward","blockCategory":"motion"},
				{"opcode":"boardTurn","text":"말판 [DIRECTION]으로 한 번 돌기","blockType":"command","arguments":{"DIRECTION":{"type":"string","menu":"left_right","defaultValue":"left"}},"func":"boardTurn","blockCategory":"motion"},"---",
				{"opcode":"moveForwardForSecs","text":"앞으로 [SECS]초 이동하기","blockType":"command","arguments":{"SECS":{"type":"number","defaultValue":1}},"func":"moveForwardForSecs","blockCategory":"motion"},
				{"opcode":"moveBackwardForSecs","text":"뒤로 [SECS]초 이동하기","blockType":"command","arguments":{"SECS":{"type":"number","defaultValue":1}},"func":"moveBackwardForSecs","blockCategory":"motion"},
				{"opcode":"turnForSecs","text":"[DIRECTION]으로 [SECS]초 돌기","blockType":"command","arguments":{"DIRECTION":{"type":"string","menu":"left_right","defaultValue":"left"},"SECS":{"type":"number","defaultValue":1}},"func":"turnForSecs","blockCategory":"motion"},
				{"opcode":"changeBothWheelsBy","text":"왼쪽 바퀴 [LEFT] 오른쪽 바퀴 [RIGHT]만큼 바꾸기","blockType":"command","arguments":{"LEFT":{"type":"number","defaultValue":10},"RIGHT":{"type":"number","defaultValue":10}},"func":"changeBothWheelsBy","blockCategory":"motion"},
				{"opcode":"setBothWheelsTo","text":"왼쪽 바퀴 [LEFT] 오른쪽 바퀴 [RIGHT](으)로 정하기","blockType":"command","arguments":{"LEFT":{"type":"number","defaultValue":30},"RIGHT":{"type":"number","defaultValue":30}},"func":"setBothWheelsTo","blockCategory":"motion"},
				{"opcode":"changeWheelBy","text":"[WHEEL] 바퀴 [VALUE]만큼 바꾸기","blockType":"command","arguments":{"WHEEL":{"type":"string","menu":"left_right_both","defaultValue":"left"},"VALUE":{"type":"number","defaultValue":10}},"func":"changeWheelBy","blockCategory":"motion"},
				{"opcode":"setWheelTo","text":"[WHEEL] 바퀴 [VALUE](으)로 정하기","blockType":"command","arguments":{"WHEEL":{"type":"string","menu":"left_right_both","defaultValue":"left"},"VALUE":{"type":"number","defaultValue":30}},"func":"setWheelTo","blockCategory":"motion"},
				{"opcode":"followLineUsingFloorSensor","text":"[COLOR] 선을 [SENSOR] 바닥 센서로 따라가기","blockType":"command","arguments":{"COLOR":{"type":"string","menu":"black_white","defaultValue":"black"},"SENSOR":{"type":"string","menu":"left_right_both","defaultValue":"left"}},"func":"followLineUsingFloorSensor","blockCategory":"motion"},
				{"opcode":"followLineUntilIntersection","text":"[COLOR] 선을 따라 [DIRECTION] 교차로까지 이동하기","blockType":"command","arguments":{"COLOR":{"type":"string","menu":"black_white","defaultValue":"black"},"DIRECTION":{"type":"string","menu":"left_right_front_rear","defaultValue":"front"}},"func":"followLineUntilIntersection","blockCategory":"motion"},
				{"opcode":"setFollowingSpeedTo","text":"선 따라가기 속도를 [SPEED](으)로 정하기","blockType":"command","arguments":{"SPEED":{"type":"string","menu":"speed","defaultValue":"5"}},"func":"setFollowingSpeedTo","blockCategory":"motion"},
				{"opcode":"stop","text":"정지하기","blockType":"command","func":"stop","blockCategory":"motion"},"---",
				{"opcode":"setLedTo","text":"[LED] LED를 [COLOR]으로 정하기","blockType":"command","arguments":{"LED":{"type":"string","menu":"left_right_both","defaultValue":"left"},"COLOR":{"type":"string","menu":"color","defaultValue":"red"}},"func":"setLedTo","blockCategory":"looks"},
				{"opcode":"clearLed","text":"[LED] LED 끄기","blockType":"command","arguments":{"LED":{"type":"string","menu":"left_right_both","defaultValue":"left"}},"func":"clearLed","blockCategory":"looks"},"---",
				{"opcode":"beep","text":"삐 소리내기","blockType":"command","func":"beep","blockCategory":"sound"},
				{"opcode":"changeBuzzerBy","text":"버저 음을 [HZ]만큼 바꾸기","blockType":"command","arguments":{"HZ":{"type":"number","defaultValue":10}},"func":"changeBuzzerBy","blockCategory":"sound"},
				{"opcode":"setBuzzerTo","text":"버저 음을 [HZ](으)로 정하기","blockType":"command","arguments":{"HZ":{"type":"number","defaultValue":1000}},"func":"setBuzzerTo","blockCategory":"sound"},
				{"opcode":"clearBuzzer","text":"버저 끄기","blockType":"command","func":"clearBuzzer","blockCategory":"sound"},
				{"opcode":"playNote","text":"[NOTE][OCTAVE] 음을 연주하기","blockType":"command","arguments":{"NOTE":{"type":"string","menu":"note","defaultValue":"C"},"OCTAVE":{"type":"string","menu":"octave","defaultValue":"4"}},"func":"playNote","blockCategory":"sound"},
				{"opcode":"playNoteFor","text":"[NOTE][OCTAVE] 음을 [BEAT]박자 연주하기","blockType":"command","arguments":{"NOTE":{"type":"string","menu":"note","defaultValue":"C"},"OCTAVE":{"type":"string","menu":"octave","defaultValue":"4"},"BEAT":{"type":"number","defaultValue":0.5}},"func":"playNoteFor","blockCategory":"sound"},
				{"opcode":"restFor","text":"[BEAT]박자 쉬기","blockType":"command","arguments":{"BEAT":{"type":"number","defaultValue":0.25}},"func":"restFor","blockCategory":"sound"},
				{"opcode":"changeTempoBy","text":"연주 속도를 [BPM]만큼 바꾸기","blockType":"command","arguments":{"BPM":{"type":"number","defaultValue":20}},"func":"changeTempoBy","blockCategory":"sound"},
				{"opcode":"setTempoTo","text":"연주 속도를 [BPM]BPM으로 정하기","blockType":"command","arguments":{"BPM":{"type":"number","defaultValue":60}},"func":"setTempoTo","blockCategory":"sound"},"---",
				{"opcode":"leftProximity","text":"왼쪽 근접 센서","blockType":"reporter","func":"leftProximity","blockCategory":"sensing"},
				{"opcode":"rightProximity","text":"오른쪽 근접 센서","blockType":"reporter","func":"rightProximity","blockCategory":"sensing"},
				{"opcode":"leftFloor","text":"왼쪽 바닥 센서","blockType":"reporter","func":"leftFloor","blockCategory":"sensing"},
				{"opcode":"rightFloor","text":"오른쪽 바닥 센서","blockType":"reporter","func":"rightFloor","blockCategory":"sensing"},
				{"opcode":"accelerationX","text":"x축 가속도","blockType":"reporter","func":"accelerationX","blockCategory":"sensing"},
				{"opcode":"accelerationY","text":"y축 가속도","blockType":"reporter","func":"accelerationY","blockCategory":"sensing"},
				{"opcode":"accelerationZ","text":"z축 가속도","blockType":"reporter","func":"accelerationZ","blockCategory":"sensing"},
				{"opcode":"light","text":"밝기","blockType":"reporter","func":"light","blockCategory":"sensing"},
				{"opcode":"temperature","text":"온도","blockType":"reporter","func":"temperature","blockCategory":"sensing"},
				{"opcode":"signalStrength","text":"신호 세기","blockType":"reporter","func":"signalStrength","blockCategory":"sensing"},
				{"opcode":"whenHandFound","text":"손 찾았을 때","blockType":"hat","func":"whenHandFound","blockCategory":"sensing"},
				{"opcode":"whenTilt","text":"[TILT] 때","blockType":"hat","arguments":{"TILT":{"type":"string","menu":"when_tilt","defaultValue":"tilt forward"}},"func":"whenTilt","blockCategory":"sensing"},
				{"opcode":"handFound","text":"손 찾음?","blockType":"Boolean","func":"handFound","blockCategory":"sensing"},
				{"opcode":"tilt","text":"[TILT]?","blockType":"Boolean","arguments":{"TILT":{"type":"string","menu":"tilt","defaultValue":"tilt forward"}},"func":"tilt","blockCategory":"sensing"},
				{"opcode":"battery","text":"배터리 [BATTERY]?","blockType":"Boolean","arguments":{"BATTERY":{"type":"string","menu":"battery","defaultValue":"normal"}},"func":"battery","blockCategory":"sensing"},"---",
				{"opcode":"setPortTo","text":"포트 [PORT]를 [MODE]으로 정하기","blockType":"command","arguments":{"PORT":{"type":"string","menu":"port","defaultValue":"A"},"MODE":{"type":"string","menu":"mode","defaultValue":"analog input"}},"func":"setPortTo","blockCategory":"etc"},
				{"opcode":"changeOutputBy","text":"출력 [PORT]를 [VALUE]만큼 바꾸기","blockType":"command","arguments":{"PORT":{"type":"string","menu":"port","defaultValue":"A"},"VALUE":{"type":"number","defaultValue":10}},"func":"changeOutputBy","blockCategory":"etc"},
				{"opcode":"setOutputTo","text":"출력 [PORT]를 [VALUE](으)로 정하기","blockType":"command","arguments":{"PORT":{"type":"string","menu":"port","defaultValue":"A"},"VALUE":{"type":"number","defaultValue":100}},"func":"setOutputTo","blockCategory":"etc"},
				{"opcode":"gripper","text":"집게 [ACTION]","blockType":"command","arguments":{"ACTION":{"type":"string","menu":"open_close","defaultValue":"open"}},"func":"gripper","blockCategory":"etc"},
				{"opcode":"releaseGripper","text":"집게 끄기","blockType":"command","func":"releaseGripper","blockCategory":"etc"},
				{"opcode":"inputA","text":"입력 A","blockType":"reporter","func":"inputA","blockCategory":"etc"},
				{"opcode":"inputB","text":"입력 B","blockType":"reporter","func":"inputB","blockCategory":"etc"}
			],
			menus: {
				"left_right":[{"text":"왼쪽","value":"left"},{"text":"오른쪽","value":"right"}],
				"left_right_both":[{"text":"왼쪽","value":"left"},{"text":"오른쪽","value":"right"},{"text":"양쪽","value":"both"}],
				"black_white":[{"text":"검은색","value":"black"},{"text":"하얀색","value":"white"}],
				"left_right_front_rear":[{"text":"왼쪽","value":"left"},{"text":"오른쪽","value":"right"},{"text":"앞쪽","value":"front"},{"text":"뒤쪽","value":"rear"}],
				"speed":[{"text":"1","value":"1"},{"text":"2","value":"2"},{"text":"3","value":"3"},{"text":"4","value":"4"},{"text":"5","value":"5"},{"text":"6","value":"6"},{"text":"7","value":"7"},{"text":"8","value":"8"}],
				"color":[{"text":"빨간색","value":"red"},{"text":"노란색","value":"yellow"},{"text":"초록색","value":"green"},{"text":"하늘색","value":"sky blue"},{"text":"파란색","value":"blue"},{"text":"자주색","value":"purple"},{"text":"하얀색","value":"white"}],
				"note":[{"text":"도","value":"C"},{"text":"도♯ (레♭)","value":"C♯ (D♭)"},{"text":"레","value":"D"},{"text":"레♯ (미♭)","value":"D♯ (E♭)"},{"text":"미","value":"E"},{"text":"파","value":"F"},{"text":"파♯ (솔♭)","value":"F♯ (G♭)"},{"text":"솔","value":"G"},{"text":"솔♯ (라♭)","value":"G♯ (A♭)"},{"text":"라","value":"A"},{"text":"라♯ (시♭)","value":"A♯ (B♭)"},{"text":"시","value":"B"}],
				"octave":[{"text":"1","value":"1"},{"text":"2","value":"2"},{"text":"3","value":"3"},{"text":"4","value":"4"},{"text":"5","value":"5"},{"text":"6","value":"6"},{"text":"7","value":"7"}],
				"when_tilt":[{"text":"앞으로 기울였을","value":"tilt forward"},{"text":"뒤로 기울였을","value":"tilt backward"},{"text":"왼쪽으로 기울였을","value":"tilt left"},{"text":"오른쪽으로 기울였을","value":"tilt right"},{"text":"거꾸로 뒤집었을","value":"tilt flip"},{"text":"기울이지 않았을","value":"not tilt"}],
				"tilt":[{"text":"앞으로 기울임","value":"tilt forward"},{"text":"뒤로 기울임","value":"tilt backward"},{"text":"왼쪽으로 기울임","value":"tilt left"},{"text":"오른쪽으로 기울임","value":"tilt right"},{"text":"거꾸로 뒤집음","value":"tilt flip"},{"text":"기울이지 않음","value":"not tilt"}],
				"battery":[{"text":"정상","value":"normal"},{"text":"부족","value":"low"},{"text":"없음","value":"empty"}],
				"port":[{"text":"A","value":"A"},{"text":"B","value":"B"},{"text":"A와 B","value":"A and B"}],
				"mode":[{"text":"아날로그 입력","value":"analog input"},{"text":"디지털 입력","value":"digital input"},{"text":"서보 출력","value":"servo output"},{"text":"PWM 출력","value":"pwm output"},{"text":"디지털 출력","value":"digital output"}],
				"open_close":[{"text":"열기","value":"open"},{"text":"닫기","value":"close"}]
			}
		};
	}
	
	getRobot(args) {
		if(args.INDEX === undefined) {
			return RoboidRunner.getRobot('hamster', 0);
		} else {
			const index = RoboidUtil.toNumber(args.INDEX, -1);
			if(index >= 0) {
				return RoboidRunner.getRobot('hamster', index);
			}
		}
	}
	
	boardMoveForward(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.boardForward(resolve);
		});
	}
	
	boardTurn(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.boardTurn(args.DIRECTION, resolve);
		});
	}
	
	moveForward(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.moveForward(resolve);
		});
	}
	
	moveBackward(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.moveBackward(resolve);
		});
	}
	
	turn(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.turn(args.DIRECTION, resolve);
		});
	}
	
	moveForwardForSecs(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.moveForwardSecs(args.SECS, resolve);
		});
	}
	
	moveBackwardForSecs(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.moveBackwardSecs(args.SECS, resolve);
		});
	}
	
	turnForSecs(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.turnSecs(args.DIRECTION, args.SECS, resolve);
		});
	}
	
	changeBothWheelsBy(args) {
		const robot = this.getRobot(args);
		if(robot) robot.changeWheels(args.LEFT, args.RIGHT);
	}
	
	setBothWheelsTo(args) {
		const robot = this.getRobot(args);
		if(robot) robot.setWheels(args.LEFT, args.RIGHT);
	}
	
	changeWheelBy(args) {
		const robot = this.getRobot(args);
		if(robot) robot.changeWheel(args.WHEEL, args.VALUE);
	}
	
	setWheelTo(args) {
		const robot = this.getRobot(args);
		if(robot) robot.setWheel(args.WHEEL, args.VALUE);
	}
	
	followLineUsingFloorSensor(args) {
		const robot = this.getRobot(args);
		if(robot) robot.followLine(args.COLOR, args.SENSOR);
	}
	
	followLineUntilIntersection(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.followLineUntil(args.COLOR, args.DIRECTION, resolve);
		});
	}
	
	setFollowingSpeedTo(args) {
		const robot = this.getRobot(args);
		if(robot) robot.setLineTracerSpeed(args.SPEED);
	}
	
	stop(args) {
		const robot = this.getRobot(args);
		if(robot) robot.stop();
	}
	
	setLedTo(args) {
		const robot = this.getRobot(args);
		if(robot) robot.setLed(args.LED, args.COLOR);
	}
	
	clearLed(args) {
		const robot = this.getRobot(args);
		if(robot) robot.clearLed(args.LED);
	}
	
	beep(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.beep(resolve);
		});
	}
	
	changeBuzzerBy(args) {
		const robot = this.getRobot(args);
		if(robot) robot.changeBuzzer(args.HZ);
	}
	
	setBuzzerTo(args) {
		const robot = this.getRobot(args);
		if(robot) robot.setBuzzer(args.HZ);
	}
	
	clearBuzzer(args) {
		const robot = this.getRobot(args);
		if(robot) robot.clearBuzzer();
	}
	
	playNote(args) {
		const robot = this.getRobot(args);
		if(robot) robot.playNote(args.NOTE, args.OCTAVE);
	}
	
	playNoteFor(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.playNoteBeat(args.NOTE, args.OCTAVE, args.BEAT, resolve);
		});
	}
	
	restFor(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.restBeat(args.BEAT, resolve);
		});
	}
	
	changeTempoBy(args) {
		const robot = this.getRobot(args);
		if(robot) robot.changeTempo(args.BPM);
	}
	
	setTempoTo(args) {
		const robot = this.getRobot(args);
		if(robot) robot.setTempo(args.BPM);
	}
	
	leftProximity(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getLeftProximity() : 0;
	}
	
	rightProximity(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getRightProximity() : 0;
	}
	
	leftFloor(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getLeftFloor() : 0;
	}
	
	rightFloor(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getRightFloor() : 0;
	}
	
	accelerationX(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getAccelerationX() : 0;
	}
	
	accelerationY(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getAccelerationY() : 0;
	}
	
	accelerationZ(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getAccelerationZ() : 0;
	}
	
	light(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getLight() : 0;
	}
	
	temperature(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getTemperature() : 0;
	}
	
	signalStrength(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getSignalStrength() : 0;
	}
	
	whenHandFound(args) {
		const robot = this.getRobot(args);
		return robot ? robot.checkHandFound() : false;
	}
	
	whenTilt(args) {
		const robot = this.getRobot(args);
		return robot ? robot.checkTilt(args.TILT) : false;
	}
	
	handFound(args) {
		const robot = this.getRobot(args);
		return robot ? robot.checkHandFound() : false;
	}
	
	tilt(args) {
		const robot = this.getRobot(args);
		return robot ? robot.checkTilt(args.TILT) : false;
	}
	
	battery(args) {
		const robot = this.getRobot(args);
		return robot ? robot.checkBattery(args.BATTERY) : false;
	}
	
	setPortTo(args) {
		const robot = this.getRobot(args);
		if(robot) robot.setIoMode(args.PORT, args.MODE);
	}
	
	changeOutputBy(args) {
		const robot = this.getRobot(args);
		if(robot) robot.changeOutput(args.PORT, args.VALUE);
	}
	
	setOutputTo(args) {
		const robot = this.getRobot(args);
		if(robot) robot.setOutput(args.PORT, args.VALUE);
	}
	
	gripper(args) {
		return new Promise(resolve => {
			const robot = this.getRobot(args);
			if(robot) robot.gripper(args.ACTION, resolve);
		});
	}
	
	releaseGripper(args) {
		const robot = this.getRobot(args);
		if(robot) robot.releaseGripper();
	}
	
	inputA(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getInputA() : 0;
	}
	
	inputB(args) {
		const robot = this.getRobot(args);
		return robot ? robot.getInputB() : 0;
	}
}

if(!Date.now) {
	Date.now = function() {
		return new Date().getTime();
	};
}
setTimeout(() => {
	RoboidRunner.open();
}, 1000);

module.exports = HamsterExtension;
