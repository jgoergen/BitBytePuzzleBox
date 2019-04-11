// https://www.npmjs.com/package/midi
const MidiLib = require('midi');

export default class Midi {

    private output = new MidiLib.output();
    private input = new MidiLib.input();

    public sysexFilterDisabled = false;
    public timingFilterDisabled = false;
    public activeSensingFilterDisabled = false;

    public async init(messageCallback: Function): Promise<void> {

        this.input.on(
            'message', 
            messageCallback);
    }

    public async getInputPortCount(): Promise<number> {

        return this.input.getPortCount();
    }

    public async getInputPortName(port: number): Promise<string> {

        return this.input.getPortName(port);
    }

    public async openInputPort(port: number): Promise<boolean> {

        if (await this.getInputPortCount() < port)
            return false;

        try {
            this.input.openPort(port);
        } catch(e) {

        }
    }

    public async closeInputPort(): Promise<void> {

        try {
            this.input.closePort();
        } catch(e) {

        }
    }

    public async setInputSysexFilter(value: boolean): Promise<void> {

        this.sysexFilterDisabled = value;
        this.input.ignoreTypes(value, this.timingFilterDisabled, this.activeSensingFilterDisabled);
    }

    public async setInputTimingFilter(value: boolean): Promise<void> {

        this.timingFilterDisabled = value;
        this.input.ignoreTypes(this.sysexFilterDisabled, value, this.activeSensingFilterDisabled);
    }

    public async setInputActiveSensingFilter(value: boolean): Promise<void> {

        this.activeSensingFilterDisabled = value;
        this.input.ignoreTypes(this.sysexFilterDisabled, this.timingFilterDisabled, value);
    }

    public async getOutputPortCount(): Promise<number> {

        return this.output.getPortCount();
    }

    public async getOutputPortName(port: number): Promise<string> {

        return this.output.getPortName(port);
    }

    public async openOutputPort(port: number): Promise<void> {

        try {
            this.output.openPort(port);
        } catch(e) {

        }
    }

    public async closeOutputPort(): Promise<void> {

        try {
            this.output.closePort();
        } catch(e) {

        }
    }

    public async sendMessage(messageData: any): Promise<void> {

        this.output.sendMessage(messageData);
    }
};