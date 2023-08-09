import { LegendGroup } from "./LegendGroup";
import { AbstractSvgGraphicElement } from "../AbstractSvgGraphicElement";


export interface SvgLegendOptions {
    data: Array<LegendGroup>,
    x?: number,
    y?: number
}

export class SvgLegend extends AbstractSvgGraphicElement {

    constructor(protected options: SvgLegendOptions) {
        super()
    }

    render() {
        let result = ""

        let anchorX = this.options.x || 0
        let anchorY = this.options.y || 0

        let fontSize = 12
        result += `<g class="legend" transform="translate(${anchorX} ${anchorY})">`
        let x = 0
        let y = 0


        let halfSize = 8

        for (const group of this.options.data) {

            if (group.label) {
                result += `<text x="${x}" y="${y + fontSize / 2}" style="font-weight:bold">${group.label}</text>`

                y += 20
            }

            for (const item of group.items) {

                result += `<rect x="${x}" y="${y}" width="${halfSize * 2}" height="${halfSize * 2}"
                style="${item.style}"/>`
                //result += `<line x1="${x}" y1="${y}" x2="${x+100}" y2="${y}"/>`
                result += `<text x="${x + 24}" y="${y + fontSize + 4}">${item.label}</text>`

                y += 30
            }

            
        }


        result += `</g>`
        return result
    }
}