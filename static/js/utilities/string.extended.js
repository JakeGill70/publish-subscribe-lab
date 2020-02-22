// Extends the String prototype for use in the notification service.
// Determines if a string contains any substring in a list of potential substrings.
String.prototype.containsAnyElementOf = function(strArray){
    let output = false;
    // Store what "this" is because of the contextual nature of "this" keyword in JS.
    let thisString = this.valueOf();

    strArray.forEach(subString => {
        let ts = thisString.safeTrim();
        let ss = subString.safeTrim();
        console.log([ss, ts]);
        if(ss !== "" && ts.indexOf(ss) > -1){
            output = true;
        }
    });
    return output;
}

String.prototype.safeTrim = function(){
    // Taken from https://www.w3schools.com/jsref/jsref_trim_string.asp
    let thisString = this.valueOf();
    let trimmedString = thisString.replace(/^\s+|\s+$/gm,'');
    return trimmedString;
}