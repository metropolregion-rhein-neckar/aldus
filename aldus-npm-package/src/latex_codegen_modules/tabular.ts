export function tabular(fields: Array<any>, rows: Array<any>): string {

    let tex_header_alignment = "|c | c | c|"


    let tex_rows = ""

    for (const row of rows) {
        tex_rows += row.join(" & ") + "\\\\"
    }

    let cells = fields.map((item) => item.label)


    let tex_header_cells = cells.join(" & ") + " \\\\"




    let template = `
\\begin{tabular}{ ${tex_header_alignment} }
\\hline
${tex_header_cells}
\\hline
${tex_rows}
\\hline
\\end{tabular}
`

    return template
}