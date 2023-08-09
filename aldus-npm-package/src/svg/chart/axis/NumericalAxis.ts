import { AbstractAxis, AxisLabel } from "./AbstractAxis"


export class NumericalAxis extends AbstractAxis {

    axisSteps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000,
        500000, 1000000, 2500000, 5000000, 10000000, 25000000, 50000000]

    targetPixelsPerAxisStep = 30



    numDecimals = 0

    cfg_reduceSteps = [{ num: 1000000000, label: "Mrd." }, { num: 1000000, label: "Mio." }]

  


    autoFit() {

        const dim = (this.dimension == "x") ? 0 : 1

        const min = this.canvas.displayMin.clone()
        const max = this.canvas.displayMax.clone()

        const newMin = this.getNextAxisStep(min.values[dim], true)
        const newMax = this.getNextAxisStep(max.values[dim], false)

        if (max.values[dim] != newMax || min.values[dim] != newMin) {

            min.values[dim] = newMin
            max.values[dim] = newMax

      
            this.canvas.updateDisplayMinMax(min, max)
        }

    }




    getDisplayLabels(): Array<AxisLabel> {

        const dim = (this.dimension == "x") ? 0 : 1

        const result = Array<AxisLabel>()

        let labelDistance_px = this.getLabelStep()

      

        const lowestVisibleValue = this.canvas.bottomLeftWorld.values[dim]

        let pos = this.getNextAxisStep(lowestVisibleValue, true)


        const canvasAxisLength_world = this.canvas.chartAreaSize.values[dim] / this.canvas.scale.values[dim]

        while (pos <= lowestVisibleValue + canvasAxisLength_world) {


            if (pos < this.canvas.bottomLeftWorld.values[dim]) {
                pos += labelDistance_px
                continue
            }

            let value = pos

            // TODO: 2 Pass label func as an option
            let text = pos.toString()// formatNumber(pos, { numDecimals: this.numDecimals })

            if (value >= 10000) {
                for (const rs of this.cfg_reduceSteps) {

                    if (value < -rs.num || value > rs.num) {
                        value /= rs.num
                        text = value + " " + rs.label
                    }
                }
            }

            result.push({ pos: pos, text: text })

            pos += labelDistance_px
        }


        return result
    }


    getLabelStep(): number {

        const dim = (this.dimension == "x") ? 0 : 1

        const canvasSizeDim = this.canvas.chartAreaSize.values[dim]
        const canvasScaleDim = this.canvas.scale.values[dim]


        // ATTENTION: This check is a workaround to avoid auto-scaling to the highest defined step size
        // if getLabelStep() is called while the MultiChart isn't fully initialized yet. It does possibly
        // not guarantee correct results in every scenario.
        if (canvasScaleDim == 0) {
            return 1
        }

        const numSteps = canvasSizeDim / this.targetPixelsPerAxisStep


        const displayRange = canvasSizeDim / canvasScaleDim

        let result = displayRange / numSteps


        const axisSteps = this.axisSteps

        for (let ii = 0; ii < axisSteps.length; ii++) {

            if (axisSteps[ii] >= result || ii == axisSteps.length - 1) {
                result = axisSteps[ii]
                break
            }
        }


        return result
    }


    getNextAxisStep(value: number, down: boolean): number {

        const stepSize = this.getLabelStep()

        // ATTENTION: Math.ceil is correct here
        let result = Math.ceil(value / stepSize) * stepSize


        if (down && value < result) {
            result -= stepSize
        }

        return result
    }


    getXAxisLabelStyle(label: AxisLabel, labelAngle: number): any {

        let transform = `translate(${this.canvas.w2sx(label.pos)}px, ${this.canvas.chartAreaSize.y + 20}px) `

        let textAnchor = "middle"

        if (labelAngle != 0) {
            transform += `translateY(-5px) rotate(${labelAngle}deg)`
            textAnchor = "start"
        }


        return `transform: ${transform}; text-anchor: ${textAnchor}`

    }


    getYAxisLineClass(label:AxisLabel) {
        let result = "y-axis-line"

        if (label.pos == 0) {
            result += " zero-line"
        }

        return result
    }


    render(): string {

        let result = ""


        result += `<g>`

        if (this.dimension == "x") {

          

            for (const label of this.getDisplayLabels()) {

                result += `<text class="x-axis-marker-text" 
                x="${this.canvas.w2sx(label.pos)}" 
                y="${this.canvas.chartAreaSize.y + 30}">
                    ${label.text}
                </text>`


                    /*
                result += `<line class="x-axis-marker-line" x1="${this.canvas.w2sx(label.pos)}" 
                y1="${this.canvas.chartAreaSize.y}"
                
                x2="${this.canvas.w2sx(label.pos)}" y2="${this.canvas.chartAreaSize.y + 10}"
                style="stroke:#000" />`
*/
                /*
               

                <line :x1="canvas.w2sx(label.pos)" :y1="0" :x2="canvas.w2sx(label.pos)" :y2="canvas.chartAreaSize.y"
                    :class="getLineClass(label.pos)" />
                }
                */

            }


        

        }

        else {
            for (const label of this.getDisplayLabels()) {

                // ATTENTION: We add 7 px to the vertical position here because we have not yet figured out how to
                // set vertical alignment.
                result += `<text class="y-axis-marker-text" x="-7" y="${this.canvas.w2sy(label.pos) + 7}">${label.text}</text>`

                
                result += `<line class="${this.getYAxisLineClass(label)}" x1="0" y1="${this.canvas.w2sy(label.pos)}" 
                x2="${this.canvas.chartAreaSize.x}" y2="${this.canvas.w2sy(label.pos)}"/>`
                
                
             
                /*
                   <text :x="-7" :y="canvas.w2sy(label.pos)" :data-tooltip="label.tooltip">{{ label.text }}</text>

                <line :x1="0" :y1="canvas.w2sy(label.pos)" :x2="canvas.chartAreaSize.x" :y2="canvas.w2sy(label.pos)"
                    :class="getLineClass(label.pos)" />
                    */
            }
        }

        result += `</g>`

        return result
    }

    
    update() {
        this.autoFit()
    }
}