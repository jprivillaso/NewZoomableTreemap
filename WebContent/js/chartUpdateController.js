var updateChartController = (function(){
	//CONSTANTS
	var FIRST_NODE_NAME_MARGIN_TOP = 0.75;
	var ZOOM_TRANSITION_DURATION = 350;
	
	//VARIABLES
	var tooltipProperties = [];
	var instanceUtilFunctions = undefined;
	var transitioning = false;
	var x = undefined;
	var y = undefined;
	
	var scaleDimensions = function(){
		x = d3.scale.linear()
			.domain([0, instanceUtilFunctions.getDimensions().width])
			.range([0, instanceUtilFunctions.getDimensions().width]);
		y = d3.scale.linear()
			.domain([0, instanceUtilFunctions.getDimensions().height])
			.range([0, instanceUtilFunctions.getDimensions().height]);
	};

	//This method sets the properties of each text element
	var text = function(text) {
		//Position in x
		text.attr("x", function(node) {
			return x(node.x) + instanceUtilFunctions.getTextMargins().left; 
		})
		//Position in y
		.attr("y", function(node) {
			return y(node.y) + instanceUtilFunctions.getTextMargins().top; 
		});
	};
	
	// This method sets the properties of each rectangle(node) element
	var rect = function(rect) {
		rect.attr("x", function(node) {			
			return x(node.x);
		}).attr("y", function(node) {
			return y(node.y); 
		}).attr("width", function(node) {
			return x(node.x + node.dx) - x(node.x);
		}).attr("height", function(node) {
			return y(node.y + node.dy) - y(node.y); 
		});		
	};
	
	//This method returns the name of the actual node
	var name = function(node) {
		return node.parent 
			? name(node.parent) + " - " + node.name
			: node.name;
	};
	
	/*
	 * This will append the text to each node depending on an array that is
	 * received as a parameter. The name don´t need to be included as it is 
	 * added by default 
	 */
	var appendChildren = function(nodeChildren) {
		var propertiesToShow = instanceUtilFunctions.getPropertiesToShow();
		if (propertiesToShow.length > 0){
			for (var iter = 0; iter < propertiesToShow.length; iter++) {
				nodeChildren.append("text")
	       		.attr("class", function(node){
	       			return "txt" + propertiesToShow[iter] + " " +
	       				node.name
	       				.replace(/ /g,'')
	       				.replace('(', '')
	       				.replace(')', '');
	       		})
	       		.attr("dy",(FIRST_NODE_NAME_MARGIN_TOP * ((iter) * 1.5) + 2) + "em")
		        .text(function(node) {
		        	return propertiesToShow[iter] + ": " 
		        		+ node[propertiesToShow[iter]];
		        }).call(text);
			}
		}
	};
	
	// Display the tree map
	var updateChart = function(node) {
		// Append Grandparent
	    var g1 = getSVG().insert("g", " .grandparent")
	        .datum(node)
	        .attr("class", "depth");

		var createEachNode = function(node){
	    	// Append Children
		    var nodeChildren = g1.selectAll("g")
		        .data(node.children)
		        .enter().append("g")
		        .attr("class", function(node){
		        	return "shown rect" + node.name
		        							  .replace(/ /g,'')
		        							  .replace('(', '')
		        							  .replace(')', '');
		        });

		    // Filter the displaying nodes just the node that has children
		    nodeChildren.filter(function(node) {
		    	return node.children; 
		    }).classed("children", true)
		    .on("click", function(actualNode){
		    	instanceUtilFunctions.setColorCalculationFlag(0);
				transition(actualNode);
			});
		    /*
	    	 * The class that is given is to assign the proper color
	    	 * depending on the color property of each node. 
	    	 * Check the COLORBREWER.CSS file to check the values that
	    	 * it can take
	    	 */  
		    nodeChildren.append("rect")
		        .attr("class", function(node){
		        	instanceUtilFunctions.setColorCalculationFlag(instanceUtilFunctions.getColorCalculationFlag() +1);
		        	return "q" + instanceUtilFunctions.colorGenerator(node) + "-9 parent ";
		        })
		        .attr("id", function(node){
		        	return node.name
		        	           .replace(/ /g,'')
		        	           .replace('(', '')
		        	           .replace(')', '');
		        })
		        .attr("name", function(node){
		    		return node.name;
		    	}).call(rect)
		        .append("title")
		        .text(function(node) {
		        	var tooltip = "";
		        	for ( var iter = 0; iter < tooltipProperties.length; iter++) {
						tooltip += tooltipProperties[iter] + ": " + node[tooltipProperties[iter]] + "\n";
					}
		        	return tooltip;
		        });
		    /*
	         *  Change the 'd y' attribute to change the position in Y axis
	         *  of the text
	         */ 
		    nodeChildren.append("text")
		    	.attr("class", function(node){
		    		return "txtname " + node.name.replace(/ /g,'').replace('(', '').replace(')', '');
		    	})
		    	.attr("value", function(node){
		    		return node.value;
		    	})
		        .attr("dy", FIRST_NODE_NAME_MARGIN_TOP + "em")
		        .text(function(node) {
		        	return node.name; 
		        }).call(text);
		    
		    appendChildren(nodeChildren);	
		    
		    this.getChildNode = function(){
		    	return nodeChildren;
		    };
	    };
	    
	    /*
	     * This is in charge of the zoom transition of the node when a node is
	     * clicked 
	     */
		var transition = function(node) {			
			if (transitioning || !node){
				return;
			}else{
				transitioning = true;
			}

	    	var chartUpdate = updateChart(node);
	    	var grandpTransition = g1.transition()
	    							 .duration(ZOOM_TRANSITION_DURATION);
	        var parentTransition = chartUpdate.transition()
	        								  .duration(ZOOM_TRANSITION_DURATION)
	        								  .each("end", function(){
	        									  //_.delay(this, 0);
	        									  instanceUtilFunctions.setFont_Size();
	        								  });

		    // Update the domain only after entering new elements.
	        x.domain([node.x, node.x + node.dx]);
	        y.domain([node.y, node.y + node.dy]);

		    // Enable anti-aliasing during the transition.
	        getSVG().style("shape-rendering", null);

		    // Draw child nodes on top of parent nodes.
	        getSVG().selectAll(".depth")
		    	.sort(function(a, b) {
		    		return a.depth - b.depth; 
		    	});

		    // Fade-in entering text.
		    chartUpdate.selectAll("text").style("fill-opacity", 0);

		    // Transition to the new view.
		    grandpTransition.selectAll("text").call(text).style("fill-opacity", 0);
		    parentTransition.selectAll("text").call(text).style("fill-opacity", 1);
		    parentTransition.selectAll(".depth .shown rect").call(rect);

		    // Remove the old node when the transition is finished.
		    grandpTransition.remove().each("end", function() {
		    	getSVG().style("shape-rendering", "crispEdges");
		        transitioning = false;
		    });
		};
		
		var grandparent = createGrandParent();
		grandparent.datum(node.parent)
			.on("click", function(actualNode){
				instanceUtilFunctions.setColorCalculationFlag(0);
				transition(actualNode);
			})
		    .select("text")
		    .text(name(node));
	
	    var g = new createEachNode(node);
	    return g.getChildNode();
	};		
	
	
	return {				
		chartUpdate : function(root) {
			updateChart(root);
		},
		
		setTooltipProperties: function(properties){
			tooltipProperties = properties;
		},
		
		initInstances: function(instanceUtilController){
			instanceUtilFunctions = instanceUtilController;
			scaleDimensions();
		}
	};
})();

var ClassUpdateChartController = function(){};

ClassUpdateChartController.prototype = {
	init: function(root, instanceUtilController){
		updateChartController.initInstances(instanceUtilController);
		updateChartController.chartUpdate(root);
	}, 
	
	getTooltipProperties: function(){
		return updateChartController.getTooltipProperties;
	},
	
	setTooltipProperties: function(properties){
		updateChartController.setTooltipProperties(properties);
	}
};