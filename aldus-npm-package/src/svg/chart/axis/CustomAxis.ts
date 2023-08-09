import { SvgChart } from "../SvgChart"
import { AbstractAxis, AxisLabel } from "./AbstractAxis"

export class CustomAxis extends AbstractAxis {

    constructor(canvas: SvgChart, dimension: string, protected labels: any) {
        super(canvas, dimension)
    }


    getDisplayLabels(): Array<AxisLabel> {

        const dim = (this.dimension == "x") ? 0 : 1

        const result = Array<AxisLabel>()

        const lowestVisibleValue = this.canvas.bottomLeftWorld.values[dim]

        const canvasAxisLength_world = this.canvas.chartAreaSize.values[dim] / this.canvas.scale.values[dim]
     
      
     
        for (const pos in this.labels) {

            const label = this.labels[pos]

            if (label.pos < lowestVisibleValue || label.pos > lowestVisibleValue + canvasAxisLength_world) {
                continue
            }

            result[parseInt(pos)] = label
        }

        return result
    }



    render(): string {

        let result = ""

       
        const labels = this.getDisplayLabels()



        if (this.dimension == "x") {

            result += `<g class="axis x-axis custom-axis">`

            for (const pos in labels) {

              
                const label = labels[pos]

                result += `<text 
                class="x-axis-marker-text" 
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

            result += "</g>"


        }

        else if (this.dimension == "y") {

            result += `<g class="axis y-axis custom-axis">`


            for (const pos in labels) {

                const label = labels[pos]
                
                // ATTENTION: We add 7 px to the vertical position here because we have not yet figured out how to
                // set vertical alignment.
                result += `<text class="y-axis-marker-text" x="-7" y="${this.canvas.w2sy(label.pos) + 7}">${label.text}</text>`

                /*
                result += `<line class="y-axis-marker-line" x1="0" y1="${this.canvas.w2sy(label.pos)}" 
                x2="${this.canvas.chartAreaSize.x}" y2="${this.canvas.w2sy(label.pos)}"/>`
                */


                /*
                   <text :x="-7" :y="canvas.w2sy(label.pos)" :data-tooltip="label.tooltip">{{ label.text }}</text>

                <line :x1="0" :y1="canvas.w2sy(label.pos)" :x2="canvas.chartAreaSize.x" :y2="canvas.w2sy(label.pos)"
                    :class="getLineClass(label.pos)" />
                    */
            }

            result += "</g>"
        }

        return result
    }




    update() {

        const dim = (this.dimension == "x") ? 0 : 1

        const min = this.canvas.displayMin.clone()
        const max = this.canvas.displayMax.clone()


        let newMin = Number.MAX_VALUE
        let newMax = Number.MIN_VALUE


        for (const pos_string in this.labels) {

            const pos = parseInt(pos_string)
            // TODO: 4 Is this correct?
            if (max.values[dim] >= pos) {
                newMax = Math.max(pos)
            }

            if (min.values[dim] <= pos) {
                newMin = Math.min(pos)
            }
        }


        if (max.values[dim] != newMax || min.values[dim] != newMin) {
            max.values[dim] = newMax
            min.values[dim] = newMin

            this.canvas.updateDisplayMinMax(min, max)


        }
    }
}