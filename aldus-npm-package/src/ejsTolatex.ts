//#region 3rd party imports
import * as path from 'path'
import * as fs from 'fs'
import * as ejs from 'ejs'
//#endregion 3rd party imports

//#region Own imports
import { andromedaSvgChart } from "./latex_codegen_modules/andromedaSvgChart";
import { svgMap } from "./latex_codegen_modules/svgMap";
import { formatNumber } from './util/formatNumber';

//#endregion Own imports




export async function ejsToLatex(templateFilePath: string, params:any): Promise<string> {

    const templateFolderPath = path.dirname(templateFilePath)
    const ejsTemplateString = fs.readFileSync(templateFilePath).toString()

 
    params.__TEMPLATE_FOLDER_PATH__ = templateFolderPath

    //#region Prepare context object for EJS template compilation
    const context = {

        params : params,
     

        require: require,

        util: {
            formatNumber: formatNumber,
            resolvePath: (filePath: string) => path.resolve(path.join(templateFolderPath, filePath))
        },

        andromedaSvgChart: (args: any) => andromedaSvgChart(args, params),

        svgMap: (args: any) => svgMap(args, params)

    }
    //#endregion Prepare context object for EJS template compilation



    //#region Compile EJS template file
    const latexString = await ejs.render(ejsTemplateString, context, {
        async: true, includer:

            file => {
                // `file` is the string passed to include
                let modifiedFilename = path.resolve(templateFolderPath, file)
                return { filename: modifiedFilename }
            }

    })
    //#endregion Compile EJS template file


    return latexString
}
