const ArgumentType = Scratch.ArgumentType;
const BlockType = Scratch.BlockType;
const formatMessage = Scratch.formatMessage;
const log = Scratch.log;

class TestExt {
    constructor (runtime){
        this.runtime = runtime;
        this.runtime.registerPeripheralExtension('TestExt', this);
    }
    
    getInfo (){
        return {
            id: 'TestExt',
            name: 'TestExt',
            color1: '#DE5277',
            color2: '#AA3F5B',
            color3: '#AA3F5B',
            
            blocks: [
                {
                    opcode: 'test1',
                    blockType: BlockType.COMMAND,
                    text: 'Test [VALUE]',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 123
                        }
                    }
                },
                {
                    opcode: 'test2',
                    blockType: BlockType.REPORTER,

                    text: 'Random Value [MAX]',
                    arguments: {
                        MAX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
            ]
        };
    }
    
    test1 (args){
        console.log('test1', args.VALUE);
    }
    
    test2 (args){
        return Math.random()*args.MAX
    }
    
    
}

module.exports = TestExt;
