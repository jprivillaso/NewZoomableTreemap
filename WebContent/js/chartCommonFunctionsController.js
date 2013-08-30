var classGlobalFunctions = function(){};

classGlobalFunctions.prototype = {
    
    loadScript: function( path ){
        var flagSuccess = false;
        jQuery.ajax({
            async: false,
            type: 'GET',
            cache: true,
            url: path,
            success: function(){
                flagSuccess = true;
            },
            dataType: 'script'
        });
        return (flagSuccess);
    }
};

var instanceGlobalFunctions = new classGlobalFunctions();
