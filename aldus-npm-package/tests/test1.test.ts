// https://www.geeksforgeeks.org/introduction-to-mocha/

import { writeFileSync, existsSync } from "fs"
import { ejsToLatex } from "../src/ejsTolatex"
import { latexToPdf } from "../src/latexToPdf"
import { assert } from "chai"
import * as fs from 'fs'
import * as path from "path"


const recipe_path = "tests/test-recipes/test1/test1.ejs"


async function run(recipe_path: string, params: any) {

    console.log("Change detected, recompiling...")

    console.log("Recipe file: " + recipe_path)

    const before = performance.now()

    // Generate PDF as stream:
    const latexString = await ejsToLatex(recipe_path, params)

    // Write compiled EJS to file for debugging:
    writeFileSync(recipe_path + ".tex", latexString)

    console.log("Latex file written.")


    // Run LaTeX to generate PDF document file:
    await latexToPdf(latexString, recipe_path + ".pdf")

    console.log("PDF document generated.")


    const after = performance.now()

    console.log("Time: " + (after - before) + " ms")
}


beforeEach(function () {
    if (fs.existsSync(recipe_path + ".tex")) {
        fs.unlinkSync(recipe_path + ".tex")
    }

    if (fs.existsSync(recipe_path + ".pdf")) {
        fs.unlinkSync(recipe_path + ".pdf")
    }

});



describe('The library', async () => {

    it('creates a PDF file from an EJS/LaTeX template', async () => {


        const paramsFilePath = path.join(path.dirname(recipe_path), "params.json")

     
        const params = JSON.parse(fs.readFileSync(paramsFilePath).toString())

     
        await run(recipe_path, params)

        assert(existsSync(recipe_path + ".tex"))

        assert(existsSync(recipe_path + ".pdf"))

        console.log("test complete")
    });

    // TODO: it throws an exception if the specified template file does not exist
});