import * as I2C from "i2c-bus"; // requires "allowSyntheticDefaultImports": true be added to tsconfig

export default class TouchInputs {

    // Register addresses.
        
    MPR121_I2CADDR_DEFAULT: number =    0x5A;
    MPR121_TOUCHSTATUS_L: number =      0x00;
    MPR121_TOUCHSTATUS_H: number =      0x01;
    MPR121_FILTDATA_0L: number =        0x04;
    MPR121_FILTDATA_0H: number =        0x05;
    MPR121_BASELINE_0: number =         0x1E;
    MPR121_MHDR: number =               0x2B;
    MPR121_NHDR: number =               0x2C;
    MPR121_NCLR: number =               0x2D;
    MPR121_FDLR: number =               0x2E;
    MPR121_MHDF: number =               0x2F;
    MPR121_NHDF: number =               0x30;
    MPR121_NCLF: number =               0x31;
    MPR121_FDLF: number =               0x32;
    MPR121_NHDT: number =               0x33;
    MPR121_NCLT: number =               0x34;
    MPR121_FDLT: number =               0x35;
    MPR121_TOUCHTH_0: number =          0x41;
    MPR121_RELEASETH_0: number =        0x42;
    MPR121_DEBOUNCE: number =           0x5B;
    MPR121_CONFIG1: number =            0x5C;
    MPR121_CONFIG2: number =            0x5D;
    MPR121_CHARGECURR_0: number =       0x5F;
    MPR121_CHARGETIME_1: number =       0x6C;
    MPR121_ECR: number =                0x5E;
    MPR121_AUTOCONFIG0: number =        0x7B;
    MPR121_AUTOCONFIG1: number =        0x7C;
    MPR121_UPLIMIT: number =            0x7D;
    MPR121_LOWLIMIT: number =           0x7E;
    MPR121_TARGETLIMIT: number =        0x7F;
    MPR121_GPIODIR: number =            0x76;
    MPR121_GPIOEN: number =             0x77;
    MPR121_GPIOSET: number =            0x78;
    MPR121_GPIOCLR: number =            0x79;
    MPR121_GPIOTOGGLE: number =         0x7A;
    MPR121_SOFTRESET: number =          0x80;

    MAX_I2C_RETRIES: number =           10;

    i2c:any;

    public async init(): Promise<void> {

        console.log("TouchInputs:: Opening I2C Bus");
        this.i2c = I2C.openSync(1);

        // Initialize communication with the MPR121. 
        // Can specify a custom I2C address for the device using the address 
        // parameter (defaults to 0x5A). Optional i2c parameter allows specifying a 
        // custom I2C bus source (defaults to platform's I2C bus).
        // Returns True if communication with the MPR121 was established, otherwise
        // returns False.
        
        // Assume we're using platform's default I2C bus if none is specified.
        
        console.log("TouchInputs:: Resetting touch sensor");
        this.reset();

        console.log("TouchInputs:: Init complete");
    }

    public async reset():Promise<void> {

        // Soft reset of device.
        await this.writeByte(this.MPR121_SOFTRESET, 0x63);
        
        // Set electrode configuration to default values.
        await this.writeByte(this.MPR121_ECR, 0x00);

        // Check CDT, SFI, ESI configuration is at default values.
        let c:number = await this.readByte(this.MPR121_CONFIG2);
        
        if (c != 0x24) {

           throw "TouchInputs:: Touch Sensor reset failed!";
        }
        
        // Set threshold for touch and release to default values.
        this.setThresholds(12, 6);
        
        // Configure baseline filtering control registers.
        await this.writeByte(this.MPR121_MHDR, 0x01);
        await this.writeByte(this.MPR121_NHDR, 0x01);
        await this.writeByte(this.MPR121_NCLR, 0x0E);
        await this.writeByte(this.MPR121_FDLR, 0x00);
        await this.writeByte(this.MPR121_MHDF, 0x01);
        await this.writeByte(this.MPR121_NHDF, 0x05);
        await this.writeByte(this.MPR121_NCLF, 0x01);
        await this.writeByte(this.MPR121_FDLF, 0x00);
        await this.writeByte(this.MPR121_NHDT, 0x00);
        await this.writeByte(this.MPR121_NCLT, 0x00);
        await this.writeByte(this.MPR121_FDLT, 0x00);
        
        // Set other configuration registers.
        await this.writeByte(this.MPR121_DEBOUNCE, 0);
        await this.writeByte(this.MPR121_CONFIG1, 0x10); // default, 16uA charge current
        await this.writeByte(this.MPR121_CONFIG2, 0x20); // 0.5uS encoding, 1ms period
        
        // Enable all electrodes.
        await this.writeByte(this.MPR121_ECR, 0x8F); // start with first 5 bits of baseline tracking
    }

    public async setThresholds(touch: number, release: number): Promise<void> {

        // Set the touch and release threshold for all inputs to the provided
        // values.  Both touch and release should be a value between 0 to 255
        // (inclusive).
        
        if (touch < 0)
            touch = 0;

        if (touch > 255)
            touch = 255;

        if (release < 0)
            release = 0;

        if (release > 255)
            release = 255;

        // Set the touch and release register value for all the inputs.
        for(let i = 0; i < 12; i++) {

            this.writeByte(this.MPR121_TOUCHTH_0 + 2 * i, touch);
            this.writeByte(this.MPR121_RELEASETH_0 + 2 * i, release);
        }
    }

    public async filteredData(pin: number): Promise<number> {

        // Return filtered data register value for the provided pin (0-11).
        // Useful for debugging.
        
        if (pin < 0)
            pin = 0;

        if (pin > 11)
            pin = 11;

        return await this.readWord(this.MPR121_FILTDATA_0L + pin * 2);
    }

    public async baselineData(pin: number): Promise<number> {

        // Return baseline data register value for the provided pin (0-11).
        // Useful for debugging.
        
        if (pin < 0)
            pin = 0;

        if (pin > 11)
            pin = 11;

        let bl: number = await this.readByte(this.MPR121_BASELINE_0 + pin);
        return bl << 2;
    }

    public async getTouchStates(): Promise<Array<Boolean>> {

        // Return array of true false where each index is a pin and bool is whether it's touched

        let t = await this.readWord(this.MPR121_TOUCHSTATUS_L);

        return [
            (t & (1 << 0)) > 0, 
            (t & (1 << 1)) > 0, 
            (t & (1 << 2)) > 0, 
            (t & (1 << 3)) > 0, 
            (t & (1 << 4)) > 0, 
            (t & (1 << 5)) > 0, 
            (t & (1 << 6)) > 0, 
            (t & (1 << 7)) > 0, 
            (t & (1 << 8)) > 0, 
            (t & (1 << 9)) > 0, 
            (t & (1 << 10)) > 0, 
            (t & (1 << 11)) > 0
        ];
    }

    public async isTouched(pin: number): Promise<Boolean> {

        // Return True if the specified pin is being touched, otherwise returns False.
        
        if (pin < 0)
            pin = 0;

        if (pin > 11)
            pin = 11;

        let t: Array<Boolean> = await this.getTouchStates();
        return t[pin];
    }

    public async writeByte(register: number, value: number): Promise<void> {
        
        return this.i2c.writeByteSync(this.MPR121_I2CADDR_DEFAULT, register, value & 0xFF);
    }

    public async readByte(register: number): Promise<number> {
        
        return this.i2c.readByteSync(this.MPR121_I2CADDR_DEFAULT, register);
    }    

    public async readWord(register: number): Promise<number> {
        
        return this.i2c.readWordSync(this.MPR121_I2CADDR_DEFAULT, register);
    } 
};