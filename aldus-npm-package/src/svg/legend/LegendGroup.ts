import { LegendItem } from "./LegendItem";


export interface LegendGroup {
    label?:string,
    items: Array<LegendItem>
}