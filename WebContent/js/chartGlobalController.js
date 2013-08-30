var globalController = (function(){
		
	// SCRIPTS INSTANCES
    var instanceChartInitializer = undefined;
    var instanceChartUpdate = undefined;
    var instanceUtilFunctions =  undefined;
    var svg = undefined;
    
    var readJsonFile = function(propertiesToShow){
		d3.json("util/laminacao.json", function(root) {
			/*
			 *  The value property is not recognized as a property of each
			 *  node, so that's why it has to be added here at the beginning. 
			 *  The default properties that the JSON file must have are name
			 *  and value. 
			 */ 			
			var childrenArray = Object.keys(root.children[0]); 			
			childrenArray.splice(childrenArray.indexOf("children"), 1);
			childrenArray.push("value");
						
			instanceChartUpdate.setTooltipProperties(childrenArray);
			instanceUtilFunctions.setPropertiesToShow(["color", "value"]);			
			
			instanceChartInitializer.init(root, instanceUtilFunctions);
			instanceChartUpdate.init(root, instanceUtilFunctions);
			instanceUtilFunctions.setFont_Size();
		});
	};
    
    var instancesIntializer = function(root){
    	instanceChartInitializer = new ClassCharInitializerController();
    	instanceChartUpdate = new ClassUpdateChartController();
    	instanceUtilFunctions = new ClassUtilFunctionsController();
    };
    
    var loadResources = function(){
    	instanceGlobalFunctions.loadScript('js/chartUtilFunctionsController.js');
    	instanceGlobalFunctions.loadScript('js/chartInitializerController.js');
    	instanceGlobalFunctions.loadScript('js/chartUpdateController.js');    	
    };
    
	return { 
		_main: function(propertiesToShow){
			loadResources();
			instancesIntializer();
			readJsonFile(propertiesToShow);
		},
	
		createGrandParent: function(){
			return instanceChartInitializer.createGrandParent();
		},
		
		setSVG: function(nSvg){
			svg = nSvg;
		},
		
		getSVG: function(){
			return svg;
		}
	};
})();

var createGrandParent = function(){
	return globalController.createGrandParent();
};

var setSVG = function(nSvg){
	globalController.setSVG(nSvg);
};

var getSVG = function(){
	return globalController.getSVG();
};

var _mainController = function(propertiesToShow){
	globalController._main(propertiesToShow);
};

$(document).ready(function(){
	_mainController();
});