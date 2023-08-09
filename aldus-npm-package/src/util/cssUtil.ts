import * as fs from "fs"
import * as sass from 'node-sass'

export function compileScss(scssFilePath: string): string {


    if (!fs.existsSync(scssFilePath)) {
        return ""
    }

    const renderOptions: sass.SyncOptions = {
        outputStyle: "compressed",
        file: scssFilePath
    }

    const result = sass.renderSync(renderOptions)

    return result.css.toString()

}

