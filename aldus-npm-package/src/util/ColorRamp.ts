import { ColorRGBA } from "./ColorRGBA"

export class ColorRamp {

    private colorDiff! : ColorRGBA

    constructor(private colorStart: ColorRGBA, private colorEnd : ColorRGBA) {
        this.colorDiff = this.colorEnd.sub(this.colorStart)
    }
    
    getColorAt(pos:number) : ColorRGBA {

        return this.colorStart.add(this.colorDiff.mult(pos))
        
    }
}