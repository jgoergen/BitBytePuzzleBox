import * as fs from "fs";
import TouchInputs from "./TouchInputs";
import Display from "./Display";
import GPIO from "./GPIO";

export default class System {

    gpio: GPIO;
    display: Display;
    touchInputs: TouchInputs;
    timer: any;

    public async init(): Promise<void> {

        console.log("Initializing");

        this.gpio = new GPIO();
        this.display = new Display();
        this.touchInputs = new TouchInputs();

        await this.gpio.init();
        await this.display.init();
        await this.touchInputs.init();
    }

    public start(): void {

        console.log("Starting");

        // start updates @ 5 fps

        setInterval(
            () => this.update(),
            200);
    }

    // main update loop

    public update():void {

        // these potentially need to be updated faster then once per beat

        this.display.update();
    }
};