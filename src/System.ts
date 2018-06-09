import * as fs from "fs";
import TouchInputs from "./TouchInputs";
import Display from "./Display";
import GPIO from "./GPIO";

export default class System {

    gpio: GPIO;
    display: Display;
    touchInputs: TouchInputs;
    timer: any;

    touchStates: Array<Boolean>;

    public async init(): Promise<void> {

        console.log("Initializing");

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

        console.log("Starting");

        // start updates @ 5 fps

        setInterval(
            () => this.update(),
            1000);
    }

    // main update loop

    public async update():Promise<void> {

        this.touchStates = await this.touchInputs.getTouchStates();
        console.log(this.touchStates);
        this.display.buffer[Math.floor(Math.random() * 200)] = 0xFF;
        this.display.display();
    }
};