import * as fs from 'fs'
import * as uuid from 'uuid'
import * as path from "path"
import { MapLayer } from '../svg/map/MapLayer'
import { SvgMap } from '../svg/map/SvgMap'
import { SvgGraphic } from '../svg/SvgGraphic'
import { compileScss } from '../util/cssUtil'
import { SvgLegend, SvgLegendOptions } from '../svg/legend/SvgLegend'



export function svgMap(options: any, env:any): string {

    

    const layers = options.layers


    if (!layers) {
        return "ERROR: Failed to read attribute 'geojson'"
    }




    const styleFilePath = options.scss || "style.scss"

    const css = compileScss(path.join(env.__TEMPLATE_FOLDER_PATH__, styleFilePath))

    const graphic = new SvgGraphic(css)

    const mapMaker = new SvgMap()

    for (const layerdef of layers) {

        let geojson

        // If layerdef is a string, we assume it to be the file path of a GeoJSON file:
        if (typeof layerdef.geojson == "string") {
            geojson = JSON.parse(fs.readFileSync(path.join(env.__TEMPLATE_FOLDER_PATH__, layerdef.geojson)).toString())
        }
        else if (typeof layerdef.geojson == "object") {
            switch(layerdef.geojson.type) {
                case "FeatureCollection":
                    geojson = layerdef.geojson
                    break
            }
        }


        if (!geojson) {
            continue
        }

        const layer = new MapLayer(geojson, layerdef.title)

        if (layerdef.style) {
            layer.styleFunc = (feature: any) => {
                return layerdef.style
            }
        }

        mapMaker.addLayer(layer)
    }


    graphic.elements.push(mapMaker)


    const legendOptions: SvgLegendOptions = {
        data: mapMaker.getLegendData()

    }
    const legend = new SvgLegend(legendOptions)

    graphic.elements.push(legend)

    const svg = graphic.render()

    // TODO: Don't hard-code tmp path!
    const svgFilePath =  path.join("/tmp/", uuid.v4() + ".svg")

    fs.writeFileSync(svgFilePath, svg)

    const tex_map = `\\includesvg[width=\\linewidth]{${svgFilePath}}`

    return tex_map
}


