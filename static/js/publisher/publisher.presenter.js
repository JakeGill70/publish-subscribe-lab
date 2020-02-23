var presenter = {
    view : {},

    setView : function(v){
        this.view = v;
    },

    autoGenerateId : function(){
        // Taken from: https://gist.github.com/gordonbrander/2230317
        return Math.random().toString(36).substr(2,9);
    },

    sendTellToServer : function(){
        // Get data from form
        var formData = this.view.getTellInfoFromForm();
        // Convert that single JS object into a JSON formatted string
        var payload = JSON.stringify(formData);
        // Send form data as JSON string to the server
        $.ajax({
            url:"./tell",
            type:"POST",
            contentType:"application/json; charset=utf-8",
            data:payload,
            success:function(){
                alert("Tell was successfully created.");
            },
            error:function(event, request, settings){
                alert("Something went wrong. Tell was not created.");
                alert(event.status + " - " + event.statusText);
            }
        });
    }
}