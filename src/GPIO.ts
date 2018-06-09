const Gpio = require('onoff').Gpio;

export default class GPIO {

    POWER_PIN: number = 26;
    power: any;

    public async init(): Promise<void> {

        this.power = new Gpio(this.POWER_PIN, "in", "both");
    }

    public async isPowerPressed() : Promise<boolean> {

        return await this.power.readSync() == 1;
    }
};