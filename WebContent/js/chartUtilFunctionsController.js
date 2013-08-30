// CONSTANTS
var COLOR_PROPERTY_SELECTOR = "color";

var CHART_ELEMENTS_MARGIN = {
	top: 45,
	right: 0,
	bottom: 0,
	left: 0
};
/*
 * You can change any time to reorder as you want the position of the text
 * in each node
 */
var TEXT_MARGIN = {
	top: 10,
	right: 0,
	bottom: 0,
	left : 6
};

var CHART_ANCHOR = 600;
var CHART_HEIGHT = 400;

// Variables
var propertiesToShow = [];
var maxShownValue = 0;
var colorCalculationFlag = 0;
var propertiesToShow = [];
var x;
var y;


propertiesToShow = ["color", "value"];

// METHODS
/*
 * Return the maximum value of the nodes that are displayed at the moment
 * in the chart
 */
var calculateMaxShownValue = function(property){
	var propertyArray = [];
	var elements = $(".depth:last .shown");

	for (var i = 0; i < elements.length; i++){
		propertyArray.push(elements[i].__data__[property]);
	}		
    maxShownValue = _.max(propertyArray);
	return {
		max: _.max(propertyArray)
	};
};


/*
 * This is the formula to calculate the proper color of the chart node. 
 * It is calculated based on the color property that is stored in the
 * JSON file, divided into the maximum value of the visible nodes and
 * then multiplied by 8 that is the mayor number in the COLORBREWER.JS
 * scale.
 * You can check the COLORBREWER.CSS file in order to get it. The number
 * 10 is because we need it the number in 10th base.
 * The colorCalculationFlag is used to check whether the function is 
 * accessed once or not, so after the first calculation, there will just
 *  read the maxShownValue attribute
 */
var colorNumberGenerator = function(node) {
	if (colorCalculationFlag > 1) {
		return parseInt((node.color/maxShownValue) * 8 , 10);
	}else{
		return parseInt((node.color/calculateMaxShownValue(COLOR_PROPERTY_SELECTOR).max) * 8 , 10);
	}
};

/*
 * Resize automatically the font-size of each node depending on the
 *  length of each text
 */
var setFontSize = function(){
	var namesArray = $(".depth:last .shown .txtname");
	/*
	 * Return the max length of each text present in 
	 * each node
	 */
	var getMaxTextLength = function(element){
		var selector = $(".shown.rect" + element.__data__.name
												.replace(/ /g,'')
												.replace('(', '')
												.replace(')', '') + " text");
		var widthArray = [];
		for (var j = 0; j < selector.length; j++) {
			widthArray.push(selector[j].offsetWidth);
		}
		return _.max(widthArray);
	};
	
	var sumOfHeights = function(element){
		var rectArray = $(".shown.rect" + element.__data__.name
												 .replace(/ /g,'')
												 .replace('(', '')
												 .replace(')', '') + " text");
			
		var sum = 0;
		for (var j = 0; j < rectArray.length; j++) {
			sum = sum + rectArray[j].offsetHeight;
		}
		return sum; 
	};
	
	/*
	 * Setting the font-size of nodes
	 */
	var setChildrenFonts = function(){
		for(var i = 0; i < namesArray.length; i++){
			while((getMaxTextLength(namesArray[i]) > (document.getElementById(namesArray[i].__data__.name.replace(/ /g,'').replace('(', '').replace(')', '')).getBBox().width)-5)
					|| (sumOfHeights(namesArray[i]) > (document.getElementById(namesArray[i].__data__.name.replace(/ /g,'').replace('(', '').replace(')', '')).getBBox().height)-5)){
				
				var fontSize = $(".txtname." + namesArray[i]
					.__data__.name
					.replace(/ /g,'')
					.replace('(', '')
					.replace(')', ''))
					.css("font-size"); 
				
				var newSize = fontSize.substring(0, fontSize.length-2);
				var className = namesArray[i].__data__.name
											 .replace(/ /g,'')
											 .replace('(', '')
											 .replace(')', '');
								
				$(".txtname." + className).css("font-size", (newSize - 1) + "px");
				
				for(var k = 0; k < propertiesToShow.length ; k++){
					$(".txt" + propertiesToShow[k] + "." + className)
									.css("font-size", (newSize - 1) + "px");
				}
			}
		}
	};
	
	/*
	 * Setting the font-size of the upper bar
	 */
	var setGrandparendFonts = function(){
		console.log("grndparent fotns");
		var grandparentText = $(".grandparent text");
		var grandparentRect = $(".grandparent rect");
		
		while (grandparentText[0].offsetWidth > 
					grandparentRect[0].width.baseVal.value) {
			
			var fontSize = grandparentText.css("font-size");
			var newSize = fontSize.substring(0, fontSize.length - 2);
			grandparentText.css("font-size", (newSize - 1) + "px" );
		}
	};	
	setChildrenFonts();
	setGrandparendFonts();
};

var ClassUtilFunctionsController = function(){};

ClassUtilFunctionsController.prototype = {
	// COMMON FUNCTIONS
	colorGenerator: function(node){
		return colorNumberGenerator(node);
	},	
	
	setFont_Size: function(){
		setFontSize();
	},
	
	// GETTERS AND SETTERS
	setPropertiesToShow: function(data){
		propertiesToShow = data;
	},
	
	getPropertiesToShow: function(){
		return propertiesToShow;
	},
	
	getColorCalculationFlag: function(){
		return colorCalculationFlag;
	}, 
	
	setColorCalculationFlag: function(flagValue){
		colorCalculationFlag = flagValue;
	},
	
	getTextMargins: function(){
		return TEXT_MARGIN;
	},
	
	getDimensions: function(){
		return {
			width: CHART_ANCHOR,
			height: CHART_HEIGHT
		};
	}
};