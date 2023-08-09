//#region 3rd party imports
import * as uuid from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
//#endregion

//#region Our imports
import { ColumnChart, SvgColumnChartOptions } from '../svg/chart/ColumnChart'
import { SvgChart, SvgChartOptions } from '../svg/chart/SvgChart'
import { AxisLabel } from '../svg/chart/axis/AbstractAxis'
import { SvgLegend, SvgLegendOptions } from '../svg/legend/SvgLegend'
import { makeColorRamp } from '../util/colorUtils'
import { Dataset } from '../svg/chart/chartDataClasses'
import { compileScss } from '../util/cssUtil'
import { Vector2 } from '../util/Vector2'
import { CustomAxis } from '../svg/chart/axis/CustomAxis'
import { NumericalAxis } from '../svg/chart/axis/NumericalAxis'
import { HttpCache } from '../util/httpCache'
import { SvgGraphic } from '../svg/SvgGraphic'

//#endregion

const httpCache = new HttpCache("httpcache")


export async function andromedaSvgChart(options: any, env:any): Promise<string> {

    //#region Prepare chart data


    // TODO: Don't hard-code these things here


    const colorRamps = [
        ["#66d", "#e0e0ff"],
        ["#4c4", "#555"],
        ["#cc3", "#a33"],
    ]

    
    const brokerBaseUrl = env.andromeda.brokerBaseUrl
    let timeAt = "2011-01-01T00:00:00Z"
    let endTimeAt = "2030-01-01T00:00:00Z"

   
   
    if (!options.series) {
        return `ERROR: Failed to parse series JSON in Andromeda recipe.`
    }



    const res_metadata = await httpCache.get(brokerBaseUrl + "/attributes/")

    

    const metadata = JSON.parse(res_metadata)


    let series = Array<any>()

    let xlabels = Array<AxisLabel>()

    let errors = ""

    for (let kk = 0; kk < options.series.length; kk++) {

        const stack_in = options.series[kk]

        let colorRamp = makeColorRamp("#44f", "#fff", stack_in.length)

        if (colorRamps.length > kk) {
            let c = colorRamps[kk]
            colorRamp = makeColorRamp(c[0], c[1], stack_in.length)
        }


        let stack_out = []



        for (let ii = 0; ii < stack_in.length; ii++) {

            const series_in = stack_in[ii]

            let eid = series_in.entityId
            let attrName = series_in.attrName

            if (!attrName) {
                errors += "attrName undefined in series"
                continue
            }

            const url = brokerBaseUrl + `/entities2/?id=${eid}&attrs=name,${attrName}&timeAt=${timeAt}&endTimeAt=${endTimeAt}&timerel=between`

            const response = await httpCache.get(url)

            const entity = JSON.parse(response)[0]



            const instances = entity[attrName]

            if (instances instanceof Array) {
                let points = []

                for (const instance of instances) {

                    let year = parseInt(instance.observedAt.substring(0, 4))

                    points.push({ "x": year, "y": instance.value })

                    xlabels[year] = { pos: year, text: year.toString() }
                }


                let label = series_in.label

                if (!label) {
                    label = metadata[attrName]?.metadata?.label
                }

                const ds: Dataset = {
                    "label": label,
                    "points": points,
                    "color": colorRamp[ii].toHexString(false)
                }


                stack_out.push(ds)
            }
            else {
               
                // TODO: 2 Find out why underscores cause a latex error
                errors += "ERROR: Attribute not found: " + attrName.replace(/_/g, "-")
            }
        }

        series.push(stack_out)
    }
    //#endregion


    if (errors != "") {
        console.log("There were errors")
        return errors
        //return figure(errors, {})

    }


    //#region Create SVG file


    const styleFilePath = options.scss || "style.scss"

    const css = compileScss(path.join(env.__TEMPLATE_FOLDER_PATH__, styleFilePath))


    const graphic = new SvgGraphic(css)


    const chartSize = new Vector2(1000, 500)


    const scOptions: SvgChartOptions = {}



    const svgChart = new SvgChart(scOptions)

    graphic.elements.push(svgChart)

    const ccoptions: SvgColumnChartOptions = {
        pos: new Vector2(60, 20),
        size: chartSize.sub(new Vector2(100, 0)),
        series: series
    }

    const columnChart = new ColumnChart(svgChart, ccoptions)




    svgChart.chartElements.push(new CustomAxis(svgChart, "x", xlabels))
    svgChart.chartElements.push(new NumericalAxis(svgChart, "y"))


    svgChart.chartElements.push(columnChart)



    const legendOptions: SvgLegendOptions = {
        data: columnChart.getLegendData(),
        // TODO: Define pos with Vector2
        x: 0,
        y: 310
    }

    graphic.elements.push(new SvgLegend(legendOptions))



    const svg = graphic.render()

    // TODO: 2 Don't hard-code tmp path

    const svgFilePath = path.join("/tmp/", uuid.v4() + ".svg")

    fs.writeFileSync(svgFilePath, svg)

    //#endregion Create SVG file



    const svgchart_latex = `\\includesvg[width=\\linewidth]{${svgFilePath}}`

    return svgchart_latex
}

