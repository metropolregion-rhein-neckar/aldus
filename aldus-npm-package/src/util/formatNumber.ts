
export interface FormatNumberOptions {
    numDecimals? : number 
    decimalSeparator? : string 
    thousandsSeparator? : string 
    unit? : string 
    addSign? : boolean 
    shortThreshold? : number
}


export function formatNumber(value: number|null, options : FormatNumberOptions = {}) {
    
    if (value == null) {
        return ""
    }
    
    if (isNaN(value)) {
        return ""
    }

    const numDecimals =  options.numDecimals || 0
    const decimalSeparator : string = options.decimalSeparator || ","
    const thousandsSeparator : string = options.thousandsSeparator || "."
    const unit : string = options.unit || ""
    const addSign : boolean = options.addSign || false
    const shortThreshold : number = options.shortThreshold || Infinity
    


    let shortChar = ""

    let shortValue = value

    if (shortThreshold) {
        
        
        if (shortThreshold <= 1000 && shortValue >= 1000) {
            shortValue = value / 1000
            shortChar = "&nbsp;Tsd"
        }
     

        if (shortThreshold <= 1000000 && value >= 1000000) {
            shortValue = value / 1000000
            shortChar = "&nbsp;Mio"
        }


    }

    value = shortValue

    const factor = Math.pow(10,numDecimals)

    const roundedValue = Math.round(value * factor) / factor

    const piece = roundedValue.toString()

    let parts = [piece]

    if (piece.includes(".")) {
        parts = piece.split(".")        
    }


    let result = ""

    if (value > 0 && addSign) {
        result += "+"
    }

    // TODO: 3 Explain this regexp. Source?
    result += parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

    
    if (numDecimals > 0) {
        

        let decimalsString = ""

        if (parts.length > 1) {
            decimalsString = parts[1].substring(0, numDecimals)
        }

        //if (parseInt(decimalsString) > 0) {
            result += decimalSeparator
            result += decimalsString.padEnd(numDecimals, '0');    
        //}

        
    }

    result += shortChar

    // NOTE: Adding the unit in this function instead of in the caller code does make sense
    // because we can directly do the logic for "adding a space after the value? yes/no" here:

    if (unit != "") {
        result += " " + unit
    }
  
    return result;
}


