import { AbstractChartElement } from "../AbstractChartElement";
import { SvgChart } from "../SvgChart";


export interface AxisLabel {
    pos: number,
    text: string,
    tooltip?: string
}


export class AbstractAxis extends AbstractChartElement {
    constructor(canvas: SvgChart, protected dimension: string) {
        super(canvas)
    }
}