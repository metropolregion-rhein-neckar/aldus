import { AbstractSvgGraphicElement } from "./AbstractSvgGraphicElement";

export class SvgGraphic {
    
    elements = Array<AbstractSvgGraphicElement>()

    constructor(protected css: string) {

    }

    render() : string {

    
        let result = `<svg xmlns="http://www.w3.org/2000/svg"  version="1.1">`

        result += `<style>${this.css}</style>`

        // Dummy element to prevent render errors:
        result += `<rect x="0" y="0" width="1" height="1" style="fill:none;stroke:#fff;stroke-width:0;"/>`

        for(const element of this.elements) {
            result += element.render()
        }

        result += `</svg>`

        return result
    }
}