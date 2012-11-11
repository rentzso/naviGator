
var d3properties = {
	width : 600,
	height : 600,
	padding : 50,
	
	color : d3.scale.category20(),
	
	foci_charge : 1.6,
	
	force : function() { return d3.layout.force()
	    .charge( function(d){ return d.focus?-400:-40 } )
	    .gravity(0.15)
	    .linkDistance( function(d){return d.source.focus&&d.target.focus?100:(!d.source.focus)&&(!d.target.focus)?20:0})
	    .size([d3properties.width, d3properties.height]) },
	
	svg : function(){ return d3.select("#chart").append("svg")
	    .attr("width", d3properties.width)
	    .attr("height", d3properties.height) }
}






var graphEngine = function(jsonfile, properties){
  var foci_charge = properties.foci_charge;
	var padding = properties.padding;
	var width = properties.width;
	var height = properties.height;

  var force = properties.force();
  var svg = properties.svg();
  var vis = svg.append("g");
  var text = vis.append("text").style("font-size", "30px");

  var limits = null;
  
  
  
  
  
  
  
  
  var initialize = function(json){
  
    var n = json.nodes.length;
	  json.nodes.forEach(function(d, i) {
		  var r = Math.min(properties.width, properties.height)/2;
		  d.x = Math.floor( r * Math.cos(2*Math.PI*i/n) + properties.width/2);
		  d.y = Math.floor( r * Math.sin(2*Math.PI*i/n) + properties.height/2);
	  });
	  
	  json.foci = json.foci.map(function(d, i){
	    json.nodes[d]["properties"] = {"color": properties.color(i), "focus": json.nodes[d].tag};
	    //console.log(color(i));
	    return json.nodes[d]; 
	  });
	  
    //initialize force
    force
	      .nodes(json.nodes)
	      .links(json.links)
	      .start();
	  
	  json.links = json.links.map(
	  	  function(d){
	  	    if (d.source.focus && d.target.focus){
	  	    	//console.log('cioa', d);
	  	    	d["focus"] = (d.source.count>d.target.count)?d.source:d.target;
	  	    } else if (d.source.focus){
	  	    	d["focus"] = d.source;
	  	    	d.target.properties = d.source.properties;
	  	    } else if (d.target.focus){
	  	    	d["focus"] = d.target;
	  	    	d.source.properties = d.target.properties;
	  	    }
	  	    //console.log(d);
	  	    return d;
	  	  }
	  	);
    
  }
  
  









  
  
  d3.json(jsonfile, function(json){
	  
	initialize(json);
	     
	var link = vis.selectAll("line.link")
	      .data(json.links)
	      .enter().append("line")
	      .attr("class", function(link){ return link.show?"link show":"link hide"});
	      
	var nodes_to_draw = json.nodes.filter(function(d){return !d.focus}).concat( json.nodes.filter(function(d){return d.focus}) );     
	var node = vis.selectAll("circle.node")
	    .data(nodes_to_draw)
	    .enter().append("g")
	    .attr("class", function(d){return d.show?"node show":"node hide";} )
	    .attr("x", function(d) {return d.x;} )
	    .attr("y", function(d) {return d.y;} )
	    .on("click", function(d){
	      
	        showNotesForNode(d);
	        
	        var subgraph = filters.filterIds(json, d.related);
                //d.show = true;
	        
	        node.attr("class", function(d){return d.show?"node show":"node hide";} );
	        link.attr("class", function(link){ return link.show?"link show":"link hide"});
	        
	        limits = [2*width, 2*height, -width, -height];  
	  	$(".node.show").each(
	  		function(i){
	  			j=i;		  
	  			if (1*$(this).attr("x") < limits[0]) limits[0] = 1*$(this).attr("x");
	  			if (1*$(this).attr("x") > limits[2]) limits[2] = 1*$(this).attr("x");

	  			if (1*$(this).attr("y") < limits[1]) limits[1] = 1*$(this).attr("y");
	  			if (1*$(this).attr("y") > limits[3]) limits[3] = 1*$(this).attr("y");
	  		});
	  			
	  	var ax =  (width - 2*padding)/(limits[2] - limits[0]);
	 	var ay =  (height- 2*padding)/(limits[3] - limits[1]);
	  	a = Math.min(ax,ay,2.5);
	 	var bx =  (width  - a*(limits[0] + limits[2]) )/2;
	 	var by =  (height - a*(limits[1] + limits[3]) )/2;
	 	vis.transition().attr("transform", 
	 				 "matrix("+ a + 
		  					 " 0 0 " + a + " " + bx +" " + by +")");
	        $(".hide").fadeOut();
	        $(".show").fadeIn();
                //console.log(this);
	        d3.event.stopPropagation();
	        d3.event.preventDefault();
		force.stop();//gravity(0).linkDistance(5).
		//nodes(subgraph.nodes).links(subgraph.links).resume();
		text.attr("x", Math.floor( (padding -bx)/a ) - 10 )
                    .attr("y", Math.floor( (padding - by)/a )+ 5  )
		    .style("fill", d.properties?d.properties.color:"grey" )
                    .style("stroke", d.properties?d3.rgb( d.properties.color ).darker(2):"black" )
                    .style("stroke-opacity", 1)
                    .style("stroke-width", 1)
                    .style("z-index", 10).text(d.tag).transition();
                vis.on("mousemove", function() {});
	    })
	    //.style("z-index", function(d){return d.focus?10:-1;})
	    .call(force.drag);
	      
	  svg.on("click", function(){
	    //if (that) {d3.select(that).selectAll("text").style("font-size", "25px")};
	    $(".hide").fadeIn();
	    vis.transition().attr("transform", "");
            text_non_foci.text("");
	    limits = null;
/*	    force.gravity(0.15)
	      .linkDistance( function(d){return d.source.focus&&d.target.focus?100:(!d.source.focus)&&(!d.target.focus)?20:0})
              .nodes(json.nodes)
              .links(json.links).resume();*/
            force.resume();
	    text.text("").transition();
            mousemove();
	  });
	  var fisheye = d3.fisheye.circular()
                                   .radius(120);
 
	  
	        
	  node.filter(function(d){return !d.focus})
	      .append("circle")
	      .style("fill", function(d) {return d.properties?d.properties.color:"grey";})
	      .style("stroke", function(d) { return d.properties?d3.rgb( d.properties.color ).darker(2):"black"; })
	      .style("stroke-width", 1.5)
             // .style("z-index", -1)
	      .attr("r", function(d){return fisheye(d).z * d.count});

          var text_non_foci = node.filter(function(d){return !d.focus})
		.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", ".3em")
                .style("font-size", "15px")
                .style("fill", function(d) { return d.properties?d.properties.color:"grey"; })
                .style("stroke", function(d) { return d.properties?d3.rgb( d.properties.color ).darker(2):"black"; })
                .style("stroke-opacity", 1)
                .style("stroke-width", 0.5)
		.style("z-index", 10);

          node.filter(function(d){return d.focus})
                        .append("text")
                .attr("x", function(d){return d.x})
                .attr("y", function(d){return d.y})
                .attr("text-anchor", "middle")
                .attr("dy", ".3em")
                .style("font-size", "25px")
                .style("fill", function(d) { return d.properties.color; })
                .style("stroke", function(d) { return d.properties?d3.rgb( d.properties.color ).darker(2):"black"; })
                .style("stroke-opacity", 1)
                .style("stroke-width", 1)
               // .style("z-index", 10)
                .text(function(d) { return d.tag; });
	      
	   
	        
	        
	        
	  link.style("stroke", function(link){ return typeof link.focus==="undefined"?"black":link.focus.properties.color })
	      .style("stroke-opacity", function(link){ return typeof link.focus==="undefined"?0.2:1 })
	      .style("stroke-width", 
	      function(link) {  
	      		return (typeof link.focus === "undefined")?1:(link.source.focus && link.target.focus)?2.5:1; 
	      		});
	  
	      
	  node.append("title").text(function(d) { return d.tag; });
	      
	  force.on("tick", function(e) {
	    
	    
	    var ck = 0.22*e.alpha;
		json.nodes.forEach(function(d){
		  if (limits && d.show) {
			center_x = (limits[2] + limits[0])/2;
			center_y = (limits[3] + limits[1])/2;
			min_x = limits[0];
			max_x = limits[2];
                        min_y = limits[1];
                        max_y = limits[3];
		  } else {
			center_x = width/2;
                        center_y = height/2;
                        min_x = padding;
                        max_x = width - padding;
                        min_y = padding
                        max_y = height- padding;
                  }
		  if (!limits && (d.x - center_x)*(d.x - center_x) + (center_y - d.y)*(center_y - d.y) >
                      Math.pow( Math.max(max_x-center_x, max_y-center_y), 2) ){
	                  d.x += (center_x - d.x) * ck;
	                  d.y += (center_y - d.y) * ck;
                  } else if (limits && (d.x - center_x)*(d.x - center_x) + (center_y - d.y)*(center_y - d.y) >
		      Math.pow( Math.max(max_x-center_x, max_y-center_y)/2, 2) ){
			  d.x += (center_x - d.x) * ck;
                          d.y += (center_y - d.y) * ck;
		  }
                });
	  
	  
      link.attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { return d.target.x; })
	        .attr("y2", function(d) { return d.target.y; });
	        
	    node.attr("x", function(d) { return d.x; })
	        .attr("y", function(d) { return d.y; })
              .select("circle")
		.attr("cx", function(d) { return d.x;}).attr("cy", function(d) { return d.y;});
            node
              .select("text").attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
;
            

//	    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	  });
       
       var fisheye = d3.fisheye.circular()
                                   .radius(120);
       mousemove();

       function mousemove (){
           vis.on("mousemove", function() {
                force.stop();
                d3.event.preventDefault();
                fisheye.focus(d3.mouse(this));

                node.each(function(d) { d.fisheye = fisheye(d); })
                    .attr("x", function(d) { return d.fisheye.x; })
                    .attr("y", function(d) { return d.fisheye.y; })
                  .select("circle")
		    .attr("cx", function(d) { return d.fisheye.x;}).attr("cy", function(d) { return d.fisheye.y;})
                    .attr("r", function(d) { return d.fisheye.z * d.count; });

                node.each(function(d) { d.fisheye = fisheye(d); })
	          .select("text")
                    .attr("x", function(d) { return d.fisheye.x; })
                    .attr("y", function(d) { return d.fisheye.y; });

                link.attr("x1", function(d) { return d.source.fisheye.x; })
                    .attr("y1", function(d) { return d.source.fisheye.y; })
                    .attr("x2", function(d) { return d.target.fisheye.x; })
                    .attr("y2", function(d) { return d.target.fisheye.y; });
                //setTimeout(force.resume, 5000);
                mouseresume();
           });
       }
       var fired = false;
       function mouseresume(){
	  if (!fired){
              setTimeout(fire, 3000);
              fired = true; 
	  }
       }
       function fire(){
          force.resume();
          fired = false;
       }
    
  });
  





  
}



graphEngine('foci.json', d3properties);
