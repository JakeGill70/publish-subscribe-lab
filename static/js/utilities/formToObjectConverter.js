var formToObject = {
    convertFormArrayToAssociativeArray: function(formArray){
        let formDataFormatted = {};
        formArray.forEach(input => {
            formDataFormatted[input.name] = input.value
        });
        return formDataFormatted
    },

    serializeForm : function(formId){
        let formArray = $(formId).serializeArray();
        return formArray;
    },

    convert : function(formId){
        let formArray = this.serializeForm(formId);
        let formDataFormatted = this.convertFormArrayToAssociativeArray(formArray);
        return formDataFormatted;
    }
}