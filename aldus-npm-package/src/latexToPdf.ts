// ATTENTION: If we import the module "node-latex" with the "import" syntax, it works, 
// but VS Code complains about the function "latex()" that "this expression is not callable". 
// Thus, we import it with "require()" import * as latex from 'node-latex';

import { createWriteStream } from "fs"

const latex = require("node-latex")

export async function latexToPdf(latexString: string, outfilePath: string): Promise<any> {


    const promise = new Promise((resolve: Function, reject: Function) => {

        // Compile LaTeX file to PDF:

        // TODO: At some point, replace the node-latex package with own code

        const pdfStream = latex(latexString, { args: ['--shell-escape'], cmd: "xelatex", passes: 2 })

        // Write PDF stream to output file:    
        const outputFile = createWriteStream(outfilePath)
        pdfStream.pipe(outputFile)

        outputFile.on("close",()=>{            
            resolve()
        })
    
    })

    return promise
}
