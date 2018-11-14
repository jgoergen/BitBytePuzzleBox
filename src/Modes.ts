import Display from "./Display";
import GPIO from "./GPIO";
import Midi from "./Midi";

export default class Modes {

    gpio: GPIO;
    display: Display;
    phrase: Array<string>;
    phraseIndex: number;
    lastChar: string;
    mode: number;
    midi: Midi;

    public async init(gpio: GPIO, display: Display): Promise<void> {

        console.log("Modes:: Initializing");

        this.gpio = gpio;
        this.display = display;
        this.midi = new Midi();
        await this.midi.init(this.receiveMidiData);
        await this.setMode(0);
    }

    public async nextMode(): Promise<void> {

        this.setMode(this.mode + 1);
    }

    public async prevMode(): Promise<void> {

        this.setMode(this.mode - 1);
    }

    public async setMode(which: number): Promise<void> {

        if (which > 2)
            which = 2;
        
        if (which < 0)
            which = 0;
        
        if (which != this.mode) {
            
            console.log("Modes:: Changing mode to " + which);
            this.mode = which;
            this.resetMode();
        }
    }

    public async update(touchStates: Array<boolean>):Promise<void> {

        if (touchStates[9])
            this.prevMode();
        else if (touchStates[11])
            this.nextMode();

        switch(this.mode) {

            case 0: 
                await this.mode1Loop(touchStates);
                break;

            case 1: 
                await this.mode2Loop(touchStates);
                break;

            case 2: 
                await this.mode3Loop(touchStates);
                break;
        }
    }

    public async resetMode(): Promise<void> {

        this.gpio.buzz(10, 1 + this.mode);
        //this.display.clear();

        switch(this.mode) {

            case 0: 
                this.phrase = new Array<string>();
                for(var i = 0; i < 8; i++)
                    this.phrase.push("");
                this.lastChar = "";
                this.phraseIndex = 0;
                await this.display.clear();
                break;

            case 1: 
                this.phrase = new Array<string>();
                for(var i = 0; i < 72; i++)
                    this.phrase.push("");
                this.lastChar = "";
                this.phraseIndex = 0;
                await this.display.clear();
                await this.display.setCursor(0, 0);
                await this.display.sendString("Garbage!");
                break;

            case 2:

                this.display.clear();

                try{
                    await this.midi.closeInputPort();
                    this.conectedToMidi = await this.midi.openInputPort(0);
                    await this.display.setCursor(0, 0);
                    await this.display.sendString(`Midi! ${this.conectedToMidi ? "=)" : "=("}`);

                } catch(e) {
                    
                    await this.display.setCursor(0, 0);
                    await this.display.sendString(`Midi! O_o`);
                }
                break;
        }
    }

    public async mode2Loop(touchStates: Array<boolean>): Promise<void> {

        let touchBinary = 
            touchStates
            .slice(0, 8)
            .map(
                (touched) => touched ? "1" : "0")
            .join("");
               
        let charCode = 
            parseInt(
                touchBinary, 
                2);

        let char = "";

        // limit the charcodes to numbers and lowercase letters
        /**/

        if ((charCode >= 32 && charCode <= 126))
            char = 
                String
                .fromCharCode(charCode)
                .toUpperCase();

        if (char && this.lastChar !== char) {

            this.phrase[this.phraseIndex] = char;
            this.lastChar = char;
            this.phraseIndex ++;
            
            if (this.phraseIndex >= this.phrase.length)
                this.phraseIndex = 0;
        }

        await this.display.setCursor(0, 0);
        await this.display.sendString(
            this.phrase.join(""));
    }

    public async mode1Loop(touchStates: Array<boolean>): Promise<void> {
        
        let touchBinary = 
            touchStates
            .slice(0, 8)
            .map(
                (touched) => touched ? "1" : "0")
            .join("");
               
        let charCode = 
            parseInt(
                touchBinary, 
                2);

        let char = "";

        // limit the charcodes to numbers and lowercase letters
        /**/

        if ((charCode >= 32 && charCode <= 126))
            char = 
                String
                .fromCharCode(charCode)
                .toUpperCase();

        if (char && this.lastChar !== char) {

            this.phrase[this.phraseIndex] = char;
            this.lastChar = char;
            this.phraseIndex ++;
            
            if (this.phraseIndex >= this.phrase.length)
                this.phraseIndex = 0;
        }

        await this.display.setCursor(0, 0);
        await this.display.sendString("Puzzle Box!");
        await this.display.setCursor(2, 2);
        await this.display.sendString(touchBinary);
        await this.display.setCursor(2, 4);
        await this.display.sendString(
            this.phrase.join(""));
    }

    private lineIndex: number = 0;
    private conectedToMidi: boolean = false;

    public receiveMidiData(deltaTime: any, message: any) {

        if (this.mode != 2)
            return;

        // The message is an array of numbers corresponding to the MIDI bytes:
        //   [status, data1, data2]
        // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
        // information interpreting the messages.

        console.log('m:' + message + ' d:' + deltaTime);

        this.display.setCursor(this.lineIndex, 0);
        this.display.sendString(`< ${deltaTime}: ${message[0]}: ${message[1]}-${message[2]}`);

        this.lineIndex ++;
        if (this.lineIndex > 5)
            this.lineIndex = 0;
    }

    public async mode3Loop(touchStates: Array<boolean>): Promise<void> {
        
        
    }
};