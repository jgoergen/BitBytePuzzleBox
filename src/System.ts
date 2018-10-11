import * as fs from "fs";
const exec = require('child_process').exec;
import TouchInputs from "./TouchInputs";
import Display from "./Display";
import GPIO from "./GPIO";
import Modes from "./Modes";

export default class System {

    EVENT_LOOP_SPEED: number = 33;

    gpio: GPIO;
    display: Display;
    touchInputs: TouchInputs;
    timer: any;
    modes: Modes;

    public async init(): Promise<void> {

        console.log("System:: Initializing");

        this.gpio = new GPIO();
        this.display = new Display();
        this.touchInputs = new TouchInputs();
        this.modes = new Modes();

        try {

            await this.gpio.init();
            await this.display.init();
            await this.touchInputs.init();
            await this.modes.init(this.gpio, this.display);

        } catch (e) {

            throw e;
        }
    }

    public async start(): Promise<void> {

        console.log("System:: Starting");

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

        this.modes.update(
            await this.touchInputs.getTouchStates());

        await this.checkForPowerDown();
    }
};