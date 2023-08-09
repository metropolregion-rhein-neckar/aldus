import { ColorRGBA } from "./ColorRGBA"

export function makeColorRamp(colorStart : string, colorEnd : string, numSteps : number) : Array<ColorRGBA> {

    const colStart = new ColorRGBA(colorStart)
    const colEnd = new ColorRGBA(colorEnd)

    const colorDiff = colEnd.sub(colStart)

    let colors = Array<ColorRGBA>()

    for (let index = 0; index < numSteps; index++) {
    
        let step = 0
    
        if (numSteps > 1) {
            step = index / (numSteps - 1)
        }
    
        colors.push(colStart.add(colorDiff.mult(step)).round())
    }

    return colors
}