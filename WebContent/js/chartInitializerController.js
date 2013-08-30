//Encapsulating fields with Module pattern
var chartInitializerController = (function() {  
	// CONSTANTS
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
		
	var svg = undefined;	
	
	var createChart = function(root){
		
		// Create the Tree map to store the hierarchy
		var treemap = d3.layout.treemap()
			.children(function(node, depth) { return depth ? null : node.children; })
			.sort(function(a, b) { return a.value - b.value; })
			.ratio(CHART_HEIGHT / CHART_ANCHOR * 0.5 * (1 + Math.sqrt(5)))
			.round(false);
		/*
		* Create the SVG with its properties. Create the hierarchical elements
		* If you want to change the color of the nodes just change the class name
		* and then check what color do you want in the COLORBREWER.CSS file
		*/ 
		svg = d3.select("#chart").append("svg")
			.attr("class", "YlOrRd")
			.attr("width", CHART_ANCHOR + "px")
			.attr("height", CHART_HEIGHT + CHART_ELEMENTS_MARGIN.top + "px")
			.style("margin-left", -CHART_ELEMENTS_MARGIN.left + "px")
			.style("margin.right", -CHART_ELEMENTS_MARGIN.right + "px")
			.append("g")
			.attr("transform", "translate(" + CHART_ELEMENTS_MARGIN.left 
					+ "," + CHART_ELEMENTS_MARGIN.top + ")")
			.style("shape-rendering", "crispEdges");
		setSVG(svg);
		
		// Initial values for the chart
		var initializeNode = function(root) {
			root.x = root.y = 0;
			root.dx = CHART_ANCHOR;
			root.dy = CHART_HEIGHT;
			root.depth = 0;
		};

		/*
		 * This computes the values of all the children and show it as
		 * the "value" label in each node
		 */ 
		var accumulateNodeValue = function(root) {
			return root.children
			? root.value = root.children.reduce(function(parentValue, value) {
				return parentValue + accumulateNodeValue(value); 
			}, 0)
			: root.value;
		};

		/*
		 * Compute the tree map layout recursively such that each group of 
		 * siblings uses the same size rather than the dimensions of the 
		 * parent cell.
		 */ 
		var calculateLayout = function(node) {
			if (node.children) {
				treemap.nodes({children: node.children});
				node.children.forEach(function(child) {
					child.x = node.x + child.x * node.dx;
					child.y = node.y + child.y * node.dy;
					child.dx *= node.dx;
					child.dy *= node.dy;
					child.parent = node;
					calculateLayout(child);
				});
			}
		};
		initializeNode(root);
		accumulateNodeValue(root);
		calculateLayout(root);
	};
	
	var createGandparent = function(){	
		// Remove the older grandparent and updates the new one
		$(".grandparent").remove();

		// This is the field that will contain the hierarchy route
		var grandparent = svg.append("g")
		    .attr("class", "grandparent");

		grandparent.append("rect")
		    .attr("y", -CHART_ELEMENTS_MARGIN.top)
		    .attr("width", CHART_ANCHOR)
		    .attr("height", CHART_ELEMENTS_MARGIN.top);

		grandparent.append("text")
		    .attr("x", TEXT_MARGIN.left)
		    .attr("y", TEXT_MARGIN.top - CHART_ELEMENTS_MARGIN.top)
		    .attr("dy", ".90em");

		return grandparent;
	};
		
	return {  
		initChart : function(root){
			createChart(root);
		},
		
		initResources: function(instanceUtilFunctions){
			instanceUtilFunctionsController = instanceUtilFunctions;
		},
		
		createGrandParent: function(){
			return createGandparent();
		}
    };  
})();  

var ClassCharInitializerController = function(){};

ClassCharInitializerController.prototype = {
	init: function(root, instanceUtilFunctions){
		chartInitializerController.initResources(instanceUtilFunctions);
		chartInitializerController.initChart(root);
	},
	
	createGrandParent: function(){
		return chartInitializerController.createGrandParent();
	}
};