import { Vector2 } from "../../util/Vector2";
import { AbstractChartElement } from "./AbstractChartElement";
import { Dataset } from "./chartDataClasses";

import { LegendItem } from "../legend/LegendItem";
import { SvgChart } from "./SvgChart";
import { LegendGroup } from "../legend/LegendGroup";


export interface SvgColumnChartOptions {
    series:any,
    pos:Vector2,
    size:Vector2
}


interface StackItem {
    dataset: Dataset,
    y: number,
    value: number,
    color?: string
}

class Stack {
    positive: number = 0
    negative: number = 0
    items = Array<StackItem>()
}


export class ColumnChart extends AbstractChartElement {

    constructor(canvas: SvgChart, protected options: SvgColumnChartOptions) {
        super(canvas)
    }

    symbolsDisplayData = Array<any>()


    stackData: any = null

    displayMax = new Vector2(Number.MIN_VALUE, Number.MIN_VALUE)
    displayMin = new Vector2(Number.MAX_VALUE, Number.MAX_VALUE)


    columnWidthPx = 10
    columnSpacingPx = 6

    stacked = true

    all_datasets = Array<Dataset>()



    getLegendData(): Array<LegendGroup> {

        const data = this.options.series
        const result = Array<LegendGroup>()

        for (let ii = 0; ii < data.length; ii++) {
            const bucket = data[ii]

            const legendGroup: LegendGroup = {
               // label: "Gruppe " + ii,
                items: []
            }

            for (const dataset of bucket) {

                const item: LegendItem = {
                    label: dataset.label,
                    shortLabel: dataset.shortLabel,
                    style: this.getDatasetStyle(dataset),
                   // symbolUrl: props.symbolUrl
                }

                legendGroup.items.push(item)
            }

            result.push(legendGroup)
        }

        return result
    }




    getDatasetStyle(dataset: Dataset) {

        let result = ""


        if (dataset.color) {
            result += "fill: " + dataset.color
        }

     //   result = "fill:#ccc;"
        return result
    }


    prepareDisplayData(stackData: any) {



        this.symbolsDisplayData.length = 0


        let paths: any = {}


        const blubb = this.columnWidthPx + this.columnSpacingPx



        for (const x in stackData) {

            const ix = parseInt(x)

            const group = stackData[x]

            const bla = this.canvas.w2sx(ix) - (group.length * blubb) / 2

            for (const stackIndex in group) {


                const rx = bla + parseInt(stackIndex) * blubb + this.columnSpacingPx / 2

                if (rx + this.columnWidthPx < 0 || rx > this.canvas.chartAreaSize.x) {
                    continue
                }

                const stack = group[stackIndex]

                for (const stackItem of stack.items) {

                    const ry = this.canvas.w2sy(stackItem.y)

                    const rh = Math.abs(stackItem.value) * this.canvas.scale.y
                    const rw = this.columnWidthPx


                    this.symbolsDisplayData.push({
                        x: rx + rw / 2,
                        y: ry,
                        rw: rw,
                        rh: rh,
                        stackItem: stackItem
                    })



                    if (rh > 0.001) {

                        const pathIndex = this.all_datasets.indexOf(stackItem.dataset)

                        if (paths[pathIndex] == undefined) {
                            paths[pathIndex] = { path: "", class: stackItem.dataset.cssClass, style: this.getDatasetStyle(stackItem.dataset) }
                        }

                        paths[pathIndex].path += `M ${rx},${ry} l ${rw},0 l 0,${rh} l -${rw},0 l 0,-${rh} `


                    }

                }
            }
        }

        return paths
    }



    prepareStackData(buckets: Array<Array<Dataset>>) {



        this.all_datasets = []

        if (buckets == undefined) {
            return
        }

        this.displayMax.x = Number.MIN_VALUE
        this.displayMax.y = Number.MIN_VALUE

        this.displayMin.x = Number.MAX_VALUE
        this.displayMin.y = 0

        const result: any = {}


        for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {

            const bucket = buckets[bucketIndex]


            for (let datasetIndex = 0; datasetIndex < bucket.length; datasetIndex++) {

                const dataset = bucket[datasetIndex]

                let cssClass = "dataset-" + structuredClone(datasetIndex)

                dataset.cssClass = cssClass

                this.all_datasets.push(dataset)

                let pairs = Array<string>()

                for (const p of dataset.points) {

                    //#region ignore duplicates
                    const hash = p.x + "-" + p.y

                    if (pairs.includes(hash)) {
                        continue
                    }

                    pairs.push(hash)
                    //#endregion


                    // ATTENTION: We must NOT skipt if p.y == 0. This can break the alignment of the chart
                    // if an entire bucket is missing!

                    const x = p.x

                    if (result[x] == undefined) {
                        result[x] = Array<Stack>()
                    }

                    if (result[x][bucketIndex] == undefined) {
                        result[x][bucketIndex] = new Stack()
                    }

                    const stack = result[x][bucketIndex] as Stack





                    this.displayMin.x = Math.min(this.displayMin.x, p.x)
                    this.displayMax.x = Math.max(this.displayMax.x, p.x)


                    let y: number = 0

                    if (this.stacked) {

                        if (p.y < 0) {

                            y = stack.negative

                            stack.negative += p.y

                            this.displayMin.y = Math.min(this.displayMin.y, stack.negative)

                        }
                        else if (p.y > 0) {
                            stack.positive += p.y

                            y = stack.positive

                            this.displayMax.y = Math.max(this.displayMax.y, stack.positive)
                        }
                    }
                    else {
                        y = p.y

                        this.displayMin.y = Math.min(this.displayMin.y, y)
                        this.displayMax.y = Math.max(this.displayMax.y, y)
                    }


                    const item: StackItem = {
                        "dataset": dataset,
                        "y": y,
                        "value": p.y
                    }

                    stack.items.push(item)

                }
            }
        }

        return result
    }



    render(): string {
        const columnsDisplayData = this.prepareDisplayData(this.stackData)
     

        let result = ""

        result += `<g class="column-chart">`

        for (const key in columnsDisplayData) {
            const path = columnsDisplayData[key]
            result += `<path d="${path.path}" style="${path.style}"/>`
        }


        result += `</g>`



        return result
    }




    update() {

        this.stackData = this.prepareStackData(this.options.series)

        // NOTE: The rest of this function equals "updateMinMax()" in the Vue version:

        const range = this.displayMax.sub(this.displayMin)

        // TODO: Find better algorithm to determine left and right padding for auto-fit

        // NOTE: The 0.1 makes sure that charts with a single column are centered
        let padding = range.x / 15 + 0.01



        // NOTE: The subtraction/addition creates a padding for autoscale. 
        // The padding causes the chart to be horizontally centered on 
        // the canvas if there is only one data point.

        const paddingVec = new Vector2(padding, 0)

        const dmin = this.displayMin.sub(paddingVec)
        const dmax = this.displayMax.add(paddingVec)


        this.canvas.updateDisplayMinMax(dmin, dmax)
    }
}