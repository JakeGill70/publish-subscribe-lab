var view = {
    setTellId : function(id){
        $("#id").val(id);
    },

    getTellInfoFromForm : function(){
        // XXX: Requires that the form input's have the same name as a tell's attributes.
        // Get data from form
        let formData = formToObject.convert("#publicationRequest");
        // That data is the same as a tell
        let tell = formData;
        return tell;
    },

    initJqueryHooks : function(){
        // Publish Subscriber Infomation
        $("#publicationRequest").on("submit", function(domEvent){domEvent.preventDefault(); presenter.sendTellToServer();});
    }
}