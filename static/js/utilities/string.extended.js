// Extends the String prototype for use in the notification service.
// Determines if a string contains any substring in a list of potential substrings.
String.prototype.containsAnyElementOf = function(strArray){
    let output = false;
    // Store what "this" is because of the contextual nature of "this" keyword in JS.
    let thisString = this.valueOf();

    strArray.forEach(subString => {
        subsString = $.trim(subString);
        if(subString !== "" && thisString.indexOf(subString) > -1){
            output = true;
        }
    });
    return output;
}