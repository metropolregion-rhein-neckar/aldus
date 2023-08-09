import { AbstractSvgGraphicElement } from "../AbstractSvgGraphicElement"
import { Vector2, vector2Max, vector2Min } from "../../util/Vector2"
import { AbstractChartElement } from "./AbstractChartElement"

export interface SvgChartOptions {

}


export class SvgChart extends AbstractSvgGraphicElement {


    constructor(protected options: SvgChartOptions) {
        super()
    }


    chartElements = Array<AbstractChartElement>()


    padding = [20,10,40,80]
 
    autoScaleX = true
    autoScaleY = true

    yAxisLabelWidth = 100


    imageSize = new Vector2(1000,300)



    bottomLeftWorld = new Vector2()
    scale = new Vector2(1, 1)


    displayMin = new Vector2(Number.MAX_VALUE, Number.MAX_VALUE)
    displayMax = new Vector2(Number.MIN_VALUE, Number.MIN_VALUE)

    get chartAreaSize() {
        return new Vector2(this.imageSize.x - this.padding[1] - this.padding[3], this.imageSize.y - this.padding[0] - this.padding[2])
    }


    fitExtent() {

        let extent = []

        if (this.autoScaleX) {
            extent[0] = this.displayMin.x
            extent[2] = this.displayMax.x
        }

        if (this.autoScaleY) {
            extent[1] = this.displayMin.y
            extent[3] = this.displayMax.y
        }


        const extentMin = new Vector2(extent[0], extent[1])
        const extentMax = new Vector2(extent[2], extent[3])

        const extentRange = extentMax.sub(extentMin)


        this.bottomLeftWorld = extentMin

        this.scale = new Vector2(this.chartAreaSize.x / extentRange.x, this.chartAreaSize.y / extentRange.y)
    }


    updateDisplayMinMax(min: Vector2, max: Vector2) {

        const dmin = vector2Min(min, this.displayMin)
        const dmax = vector2Max(max, this.displayMax)

        if (dmin.equals(this.displayMin) && dmax.equals(this.displayMax)) {
            return
        }

        this.displayMin = dmin
        this.displayMax = dmax


        this.fitExtent()
    }



    render(): string {

    
        for (const element of this.chartElements) {
            element.update()

        }

        // ATTENTION: This needs to run twice because of axis auto-fitting: Each element may change the min/max
        // extent of the chart. Since there is no strict/guaranteed order of elements, it is no guaranteed that
        // the auto-fitting of an axis element is performed after all other min/max changes (usually caused by
        // chart elements) have happened. However, auto-fitting must happen last. This is why we run element.update()
        // twice. 


        for (const element of this.chartElements) {
            element.update()

        }


        this.fitExtent()



        let result = ""

        // This total image outline:
        // NOTE: This is the largest element of the graphic. When included into a LaTeX document, this
        // element also defines the size of the graphic.

        result += `<rect id="image-outline" x="0" y="0" width="${this.imageSize.x}" height="${this.imageSize.y}"/>`


        // The Chart outline:

        result += `<g transform="translate(${this.padding[3]} ${this.padding[1]})">`

        result += `<rect id="chart-outline" x="0" y="0" width="${this.chartAreaSize.x}" height="${this.chartAreaSize.y}" />`
        

        for (const element of this.chartElements) {
            result += element.render()
        }

        result += "</g>"

        return result

    }


    //#region Coordinate transformation functions 

    // NOTE: World-to-screen and screen-to-world functions do not take into account the position offset of
    // the chart (chartAreaPos). This must be explicitly added/subtracted for drawing and for pointer input processing.


    s2w(v: Vector2): Vector2 {

        const x = (v.x / this.scale.x) + this.bottomLeftWorld.x
        const y = (this.chartAreaSize.y - v.y) / this.scale.y + this.bottomLeftWorld.y

        return new Vector2(x, y)
    }


    s2wx(pixels: number): number {
        return (pixels / this.scale.x) + this.bottomLeftWorld.x
    }


    s2wy(pixels: number): number {
        return (this.chartAreaSize.y - pixels) / this.scale.y + this.bottomLeftWorld.y
    }


    w2sx(value: number): number {
        return (value - this.bottomLeftWorld.x) * this.scale.x
    }


    w2sy(value: number): number {
        return this.chartAreaSize.y - (value - this.bottomLeftWorld.y) * this.scale.y
    }

    //#endregion Coordinate transformation functions 
}