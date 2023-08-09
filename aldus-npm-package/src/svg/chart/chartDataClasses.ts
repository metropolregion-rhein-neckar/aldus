export interface BoundingBox {
    minx : number
    maxx: number,
    miny:number,
    maxy:number
}


export interface DataPoint {
    x : number,
    y : number
}

export interface Dataset {   
    cssClass?:string, 
    color?:string,
    label:string,
    numDecimals?:number,
    points: Array<DataPoint>,
    shortLabel?: string,
    symbolUrl?:string
    unit?:string,
    
}
