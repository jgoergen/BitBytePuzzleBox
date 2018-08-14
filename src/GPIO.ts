const Gpio = require('onoff').Gpio;

export default class GPIO {

    POWER_PIN: number = 17;
    BIT_LED_1: number = 18;
    BIT_LED_2: number = 23;
    BIT_LED_3: number = 24;
    BIT_LED_4: number = 25;
    BIT_LED_5: number = 12;
    BIT_LED_6: number = 16;
    BIT_LED_7: number = 20;
    BIT_LED_8: number = 21;
    BUZZER: number = 13;
    power: any;
    bitLED1: any;
    bitLED2: any;
    bitLED3: any;
    bitLED4: any;
    bitLED5: any;
    bitLED6: any;
    bitLED7: any;
    bitLED8: any;
    buzzer: any;

    public async init(): Promise<void> {

        this.power = new Gpio(this.POWER_PIN, "in", "both");

        this.bitLED1 = new Gpio(this.BIT_LED_1, "out");
        this.bitLED2 = new Gpio(this.BIT_LED_2, "out");
        this.bitLED3 = new Gpio(this.BIT_LED_3, "out");
        this.bitLED4 = new Gpio(this.BIT_LED_4, "out");
        this.bitLED5 = new Gpio(this.BIT_LED_5, "out");
        this.bitLED6 = new Gpio(this.BIT_LED_6, "out");
        this.bitLED7 = new Gpio(this.BIT_LED_7, "out");
        this.bitLED8 = new Gpio(this.BIT_LED_8, "out");
        this.buzzer = new Gpio(this.BUZZER, "out");

        this.setBitLED(0, true);
        this.setBitLED(1, true);
        this.setBitLED(2, true);
        this.setBitLED(3, true);
        this.setBitLED(4, true);
        this.setBitLED(5, true);
        this.setBitLED(6, true);
        this.setBitLED(7, true);

        await this.buzz(20, 1);
        await this.buzz(20, 1);

        setTimeout(
            async () => { 

                await this.finishInit(); 
            }, 500);
    }

    public async finishInit(): Promise<void> {

        this.setBitLED(0, false);
        this.setBitLED(1, false);
        this.setBitLED(2, false);
        this.setBitLED(3, false);
        this.setBitLED(4, false);
        this.setBitLED(5, false);
        this.setBitLED(6, false);
        this.setBitLED(7, false);
    }

    public async isPowerPressed() : Promise<boolean> {

        return await this.power.readSync() == 0;
    }

    public async buzz(count: number, wait: number) : Promise<void> {

        for (let i = 0; i < count; i++) {

            await this.setBuzzer(true);
            await this.setBuzzer(false);
        }
    }

    public async setBuzzer(state: boolean) : Promise<void> {

        this.buzzer.writeSync(state ? 1 : 0);
    }

    public async setBitLED(index: number, state: boolean) : Promise<void> {

        if (state)
            await this.buzz(10, 1);

        switch(index) {
            case 0: 
                this.bitLED1.writeSync(state ? 1 : 0);
                break;
            case 1: 
                this.bitLED2.writeSync(state ? 1 : 0);
                break;
            case 2: 
                this.bitLED3.writeSync(state ? 1 : 0);
                break;
            case 3: 
                this.bitLED4.writeSync(state ? 1 : 0);
                break;
            case 4: 
                this.bitLED5.writeSync(state ? 1 : 0);
                break;
            case 5: 
                this.bitLED6.writeSync(state ? 1 : 0);
                break;
            case 6: 
                this.bitLED7.writeSync(state ? 1 : 0);
                break;
            case 7: 
                this.bitLED8.writeSync(state ? 1 : 0);
                break;
            default:
                break;
        }
    }
};