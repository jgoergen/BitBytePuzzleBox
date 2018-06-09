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
            100);
    }

    // main update loop

    public async update():Promise<void> {

        this.touchStates = await this.touchInputs.getTouchStates();

        let touchBinary = 
            this.touchStates
            .slice(0, 7)
            .map(
                (touched) => touched ? "1" : "0")
            .join("");

        let char = 
            String
            .fromCharCode(
                parseInt(
                    touchBinary, 
                    2))
            .toUpperCase();

        console.log(touchBinary, char);

        this.display.setCursor(0, 0);
        this.display.sendString("Puzzle Box!");
        this.display.setCursor(2, 2);
        this.display.sendString(touchBinary);
        this.display.setCursor(10, 4);
        this.display.sendString(char);
    }
};