import { AbstractSvgGraphicElement } from "../AbstractSvgGraphicElement"
import { LegendGroup } from "../legend/LegendGroup"
import { Vector2 } from "../../util/Vector2"
import { MapLayer } from "./MapLayer"



export class SvgMap extends AbstractSvgGraphicElement {

    layers = Array<MapLayer>()

    extent_min = new Vector2()
    extent_max = new Vector2()


    addLayer(geojson: any) {
        this.layers.push(geojson)

        this.updateExtent()
    }


    getLegendData(): Array<LegendGroup> {

      let result = Array<LegendGroup>()

        for (const layer of this.layers) {

            let group: LegendGroup = {
                items: [],
                label:layer.title
            }
            
            result.push(group)
        }

        return result
    }

    getPropMinMax(geojson: any, propName: string): { min: number, max: number } {

        let min = Infinity
        let max = -Infinity

        for (const feature of geojson.features) {


            const val = feature.properties[propName]

            min = Math.min(min, val)
            max = Math.max(max, val)

        }

        return { min: min, max: max }
    }


    updateExtent() {

        let min = new Vector2(Infinity, Infinity)
        let max = new Vector2(-Infinity, -Infinity)

        //#region Find min and max coordinates
        for (const layer of this.layers) {
            for (const feature of layer.geojson.features) {

                for (const piece of feature.geometry.coordinates) {
                    for (const loop of piece) {

                        for (const p of loop) {

                            min.x = Math.min(min.x, p[0])
                            min.y = Math.min(min.y, p[1])

                            max.x = Math.max(max.x, p[0])
                            max.y = Math.max(max.y, p[1])
                        }
                    }
                }
            }
        }

        this.extent_min = min
        this.extent_max = max
    }


    render(): string {

        const scale = new Vector2(1, 1.5)

        const width_svg = 1000 * scale.x



        const size_world = this.extent_max.sub(this.extent_min)

        const ratio = size_world.x / size_world.y

        const height_svg = (width_svg / ratio) * scale.y

        const size_svg = new Vector2(width_svg, height_svg)



        const projFunc = (x: number, y: number): Vector2 => {

            const xp = (x - this.extent_min.x) / size_world.x * size_svg.x
            const yp = (this.extent_max.y - y) / size_world.y * size_svg.y

            return new Vector2(xp, yp)
        }





        let result = ""

        for (const layer of this.layers) {
            result += this.renderLayer(layer, projFunc)
        }


        return result
    }



    renderLayer(layer: MapLayer, projFunc: Function): string {

        let result = ""

        let styleFunc = layer.styleFunc

        if (!styleFunc) {
            styleFunc = (feature: any) => {
                return {
                    "fill": "none",
                    "stroke": "#000",
                    "stroke-width": "1px"
                }
            }
        }

        for (const feature of layer.geojson.features) {

            let path = ""

            for (const piece of feature.geometry.coordinates) {

                for (const loop of piece) {

                    let first = true

                    for (const p of loop) {

                        const pp = projFunc(p[0], p[1])

                        path += first ? "M" : "L"
                        path += ` ${pp.x} ${pp.y} `

                        first = false
                    }
                }
            }

            // One path for each feature:
            result += `<path d="${path}" style="${this.style2string(styleFunc(feature))}"/>`
        }

        return result
    }


    style2string(styleObj: any): string {

        let result = ""

        for (const key in styleObj) {
            result += key + ":" + styleObj[key] + ";"
        }

        return result
    }
}