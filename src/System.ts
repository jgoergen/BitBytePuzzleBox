import * as fs from "fs";
const exec = require('child_process').exec;
import TouchInputs from "./TouchInputs";
import Display from "./Display";
import GPIO from "./GPIO";

export default class System {

    EVENT_LOOP_SPEED: number = 100;

    gpio: GPIO;
    display: Display;
    touchInputs: TouchInputs;
    timer: any;

    touchStates: Array<Boolean>;

    public async init(): Promise<void> {

        console.log("System:: Initializing");

        this.gpio = new GPIO();
        this.display = new Display();
        this.touchInputs = new TouchInputs();

        try {

            await this.gpio.init();
            await this.display.init();
            await this.touchInputs.init();

        } catch (e) {

            throw e;
        }
    }

    public async start(): Promise<void> {

        console.log("System:: Starting");

        // start updates @ 5 fps

        setInterval(
            () => this.update(),
            this.EVENT_LOOP_SPEED);
    }

    public async checkForPowerDown() {

        if (await this.gpio.isPowerPressed()) {

            console.log("System:: Powering down!");

            this.display.clear();
            this.display.setCursor(5, 5);
            this.display.sendString("Powering down!");

            let child = 
            exec(
                "sudo shutdown -h now", 
                function (error: any, stdout: any, stderr: any) {

                    console.log(`Shell:: stdout: '${stdout}'`);
                    console.log(`Shell:: stderr: '${stderr}'`);

                    if (error !== null)
                        throw error;
                });
        }
    }

    // main update loop

    public async update():Promise<void> {

        this.touchStates = await this.touchInputs.getTouchStates();

        this.touchStates.forEach(
            (state: boolean, index: number) => {

                this.gpio.setBitLED(index, state);
            });

        let touchBinary = 
            this.touchStates
            .slice(0, 7)
            .map(
                (touched) => touched ? "1" : "0")
            .join("");
        
        /*
        console.log(
            "System:: Updating", 
            "touch ", this.touchStates.map((touched) => touched ? "1" : "0").join(""));
        */
       
        let char = 
            String
            .fromCharCode(
                parseInt(
                    touchBinary, 
                    2))
            .toUpperCase();

        this.display.setCursor(0, 0);
        this.display.sendString("Puzzle Box!");
        this.display.setCursor(2, 2);
        this.display.sendString(touchBinary);
        this.display.setCursor(10, 4);
        this.display.sendString(char);

        await this.checkForPowerDown();
    }
};