var yellowEdit = {
				
	jsPlumbLoaded 	: false,
	viewMode		: false,
	jsPlumbDefaults	: {
		Connector		: "Flowchart",
		MaxConnections	: 5,
		PaintStyle 		: {
			lineWidth		: 2,
			strokeStyle		: '#111111',
			outlineColor	: '#FFFFFF',
			outlineWidth	: 2
		},
		DragOptions 	: { cursor: "crosshair" }
		
	},
	
	editorOptions	: {},
	
	init	: function(options, dataModel){
		// initialize user settings
		this.editorOptions	= options;
		this.viewMode		= options.viewMode;
		
		// Load jsPlumb defaultStyles
		if(!$.isEmptyObject(options.connector)){
			this.jsPlumbDefaults.PaintStyle = options.connector;
		}
		jsPlumb.importDefaults(this.jsPlumbDefaults);
		
		// Override default Styles
		
		// load editor
		if(!yellowEdit.viewMode){
			this.editor.init(this);
			this.editor.inspector.store();
		}else{
			this.editor.inspector.hide();
			this.editor.shapes.hide();
			this.editor.menu.hide();
		}
		
		options.misc();
		
		if(!$.isEmptyObject(dataModel)){
			yellowEdit.editor.menu.loadDataModel(dataModel);
		}
		
		return this;
	},			
	
	dataModel	: {
		containers 	: [],
		connectors 	: [],
		updateContainer : function(){},
		reloadConnections : function(){
			yellowEdit.dataModel.connectors = [];
			$.each(jsPlumb.getAllConnections().jsPlumb_DefaultScope, function(index, value){
				yellowEdit.dataModel.connectors.push(value);
			});
		}	
	},
	
	editor		: {
		init		: function(scope){
			$.each(scope.editorOptions.elements.shapesElement.children(), function(){
				$(this).draggable({
					revert:"valid"
				});
			});
			
			scope.editorOptions.elements.canvasElement.droppable({
				hoverClass: "canvas-highlight",
				drop: function( event, ui ) {
					
					var shapeType = ui.draggable.attr('id');
					 
				 	new yellowEdit.container(shapeType, {
				 		options:{
					 		position : {
					 			top		: ui.position.top,
					 			left	: ui.position.left
					 		}
				 		}
				 	});
				}
			});

			//prevent inspector-form from submitting 
			yellowEdit.editorOptions.elements.inspectorElement.find('form').submit(function(e){
				e.preventDefault();
			});

			// bind events
			jsPlumb.bind("click", function(conn, originalEvent) {
				if (confirm("Vil du slette koplinga?"))
					jsPlumb.detach(conn);
					yellowEdit.dataModel.reloadConnections();
					
					yellowEdit.editor.inspector.draw(conn);
					 
			});
			jsPlumb.bind("connectionDrag", function(connection) {
				console.log("connection " + connection.id + " is being dragged");
			});		
			
			jsPlumb.bind("connectionDragStop", function(connection) {
				yellowEdit.dataModel.reloadConnections();
			});
						

		},
		selectedContainers : [],
		inspector		 : {
			draw		 : function(element){
				yellowEdit.editor.selectedContainers = [];
				yellowEdit.editor.selectedContainers.push(element);
				// is connection
				if(element.idPrefix == '_jsplumb_c_'){
					var html = '';
					html += '<div class="well well-small">';
		    			html += '<a href="#" rel="tooltip" title="Definér tekst">Tekst</a>';
						html += '<input class="connText" name="connText" type="text" class="input-medium" placeholder="koplingstekst" value="'+element.getLabel()+'"/>';
		    		html += '</div>';
		    		html += '<div class="well well-small">';
		    			html += '<a href="#" rel="tooltip" title="Aktiverast ved trykk på elementet.">Link</a>';
						//html += '<input class="hyperlink" name="hyperlink" type="text" class="input-medium" placeholder="http://www.kvalitetslosen.no" value="'+element.elements.c.attr('title')+'"/>';
		    		html += '</div>';
		    		html += '<div class="well well-small">';
		    			html += '<div id="colorPickerContainer"></div>';
		    			//html += '<a href="#" rel="tooltip" title="Aktiverast ved trykk på elementet.">Link</a>';
						//html += '<input class="hyperlink" name="hyperlink" type="text" class="input-medium" placeholder="http://www.kvalitetslosen.no" value="'+element.elements.c.attr('title')+'"/>';
		    		html += '</div>';
				// else container
		    	}else{
					var html = '';
					html += '<div class="well well-small">';
		    			html += '<a href="#" rel="tooltip" title="Definér tekst-innhald">Tekst</a>';
						html += '<textarea class="htmlContent" name="htmlContent" rows="4">'+element.elements.t.attr('text')+'</textarea>';
		    		html += '</div>';
		    		html += '<div class="well well-small">';
		    			html += '<a href="#" rel="tooltip" title="Aktiverast ved trykk på elementet.">Link</a>';
						html += '<input class="hyperlink" name="hyperlink" type="text" class="input-medium" placeholder="http://www.kvalitetslosen.no" value="'+element.elements.c.attr('title')+'"/>';
		    		html += '</div>';
		    		html += '<div class="well well-small">';
		    			html += '<a href="#" rel="tooltip" title="Bakgrunnsfarge">Farge</a><br/>';
		    			html += '<input name="colorpicker" class="hyperlink input-large" type="text" value="'+element.elements.s.attr('fill')+'" id="colorPickerContainer"/>';
		    		html += '</div>';
		    		html += '<div class="well well-small">';
		    			html += '<button class="btn btn-success saveContainer">Lagre</button>';
		    			html += '<button class="btn btn-danger deleteContainer">Fjern Element</button>';
		    		html += '</div>';
		    	}
				
				yellowEdit.editorOptions.elements.inspectorElement.find('#inspectorFormat').html(html);
				
				$('#colorPickerContainer').ColorPicker({
					color: '#0000ff',
					onShow: function (colpkr) {
						$(this).ColorPickerSetColor(this.value);
						$(colpkr).fadeIn(500);
						return false;
					},
					onHide: function (colpkr) {
						$(colpkr).fadeOut(500);
						return false;
					},
					onChange: function (hsb, hex, rgb) {
						element.elements.c.attr({fill: '#'+hex});
						$('#colorPickerContainer').val('#'+hex);
						$('#colorSelector div').css('backgroundColor', '#' + hex);
					},
					onSubmit: function(hsb, hex, rgb, el) {
						element.elements.c.attr({fill: '#'+hex});
						$(el).val('#'+hex);
						$(el).ColorPickerHide();
					}
				}).bind('keyup', function(){
					$(this).ColorPickerSetColor(this.value);
				});
				
				$('.deleteContainer').click(function(){
					if (confirm("Er du sikker? Du kan ikkje angre denne handlinga.")){
						jsPlumb.detachAllConnections(element);
						jsPlumb.removeAllEndpoints(element);
						
						// remove from dataModel
						$.each(yellowEdit.dataModel.containers, function(index, candidate){
							if(candidate){
								if(candidate.identity == element.identity){
									yellowEdit.dataModel.containers.splice(index,1);
								}
							}
						});
						
						// remove from DOM
						element.remove();
						$('#inspectorFormat').empty();
					}
				});
			},
			hide			 : function(){
				yellowEdit.editorOptions.elements.inspectorElement.hide();
			},
			store			 : function(){
				
				$('.saveContainer').live('click', function(){
					var objects = yellowEdit.editorOptions.elements.inspectorElement.find('input, textarea');

					$.each(yellowEdit.editor.selectedContainers, function(index, container) {
						$.each(objects, function(index, candidate){
							object = $(candidate);
							var value = object.val();
							switch (object.attr('name')){
								case 'htmlContent':
									container.elements.t.attr({'text': value});
									container.texts.text = value;
								break;
								case 'hyperlink':
									container.elements.c.attr({'title': value});
									container.texts.title = value;
								break;
								case 'connText':
									container.setLabel(value);
									container.texts.connText = value;
								break;
								case 'colorpicker':
									container.elements.c.attr({fill: value});
								break;
							}
						});
						
						$.each(yellowEdit.dataModel.containers, function(index, candidate){
							if(candidate.identity == container.identity){
								candidate = container;
							}
						});
					});
					
				});
			}
		},
		menu		: {
			save		: function(type){
				switch(type){
					case 'db':
						var data = this.build();
						var posts = {};
						posts.data =  data;
						
						$.ajax({
						url 	: yellowEdit.editorOptions.save.url,
							data	: posts,
							dataType: 'json',
							type	: 'POST',
							success : function(data){
								yellowEdit.editorOptions.save.success(data);
							}
						});
						
					break;
					case 'screendump':
						
					break;
				}
			},
			build		: function(){
				//var structure = JSON.stringify(yellowEdit.dataModel);
				var seen = [];
				var structure = JSON.stringify(yellowEdit.dataModel, function(key, val) {
				   if (typeof val == "object") {
				        if (seen.indexOf(val) >= 0)
				            return undefined
				        seen.push(val)
				    }
				    return val;
				});
				
				return structure;
			},
			loadDataModel : function(data){
				
				// loop containers
				$.each(data.containers, function(index, value){
					yellowEdit.container(value.options.shape, value);
				});
				
				// loop connections							
				$.each(data.connectors, function(index, value){
									
					var start 	= '';
					var stop	= '';

					// resolve connection direction
					$.each(value.endpoints, function(index, endpoint){
						
						var direction = '';
						
						if((endpoint.anchor.x == 1) && (endpoint.anchor.y == 0.5)){
							direction = "LeftCenter";
						}else if((endpoint.anchor.x == 0.5) && (endpoint.anchor.y == 0)){
							direction = "TopCenter";
						}else if((endpoint.anchor.x == 1) && (endpoint.anchor.y == 0.5)){
							direction = "RightCenter";
						}else if((endpoint.anchor.x == 0.5) && (endpoint.anchor.y == 1)){
							direction = "BottomCenter";
						}
						
						if(index == 0){
							start = direction;
						}else if(index == 1){
							stop = direction;
						}
					});
					
					jsPlumb.connect({
						source	: value.sourceId, 
						target	: value.targetId,
						anchors	: [start, stop],
						endpoint: ["Blank", "Blank"],
						
						overlays:[ [ "Arrow", yellowEdit.editorOptions.overlay ]]
					});
					
					yellowEdit.dataModel.connectors.push(value);
					
				});
				

			},
			hide : function(){
				yellowEdit.editorOptions.elements.menu.hide();
			}
			
				
		},
		toolbox		: {
			resize		: {}
		},
		shapes 		: {
			hide	: function(){
				yellowEdit.editorOptions.elements.toolBoxElement.hide();
			},
			container		: {
				defaultClass			: 'nodeContainer',
				defaultHTMLClass		: 'htmlContent',
				position	: {
					x 					: 200,
					y					: 200
				},
				defaultCSS	: {
				    'color'				: '#000000',
				    'line-height'		: '5em',
				    'position'			: 'absolute',
				    'text-align'		: 'center',
				    'z-index'			: '0'
				},
				create : function(params){
					if(params.initParams.options.formatting !== undefined){
						height 	= parseInt(params.initParams.options.formatting.height);
						width 	= parseInt(params.initParams.options.formatting.width);	
					}else{
						height 	= params.height;
						width	= params.width;
					}
				
					var paper = Raphael(params.container.attr('id'), width, height);
					
			       	params.container.elements.c = paper.path(params.path).attr(params.attrs);
			       	
			       	if(!yellowEdit.viewMode){
				       	params.container.elements.s = paper.rect(width-13, height-13, 12, 12).attr({
			           		fill: "#FDFDFD",
			           		cursor: "se-resize"
			       		});
			       		
			       		params.container.elements.s.scaleX = 1;
			       		params.container.elements.s.scaleY = 1;
		       		}
		       		if(params.initParams.options.transformString !== undefined){
		       			params.container.elements.c.transform(params.initParams.options.transformString);
		       			if(!yellowEdit.viewMode){
		       				params.container.elements.s.scaleX = params.initParams.options.scaleX;
		       				params.container.elements.s.scaleY = params.initParams.options.scaleY;
		       			}
		       		}
		       		
		       		var text = '';
					if((params.initParams.texts !== undefined) && (params.initParams.texts.text !== undefined)){
						text = params.initParams.texts.text;
					}
					params.container.elements.t = paper.text(params.container.width()/2,params.container.height()/2, text);
					params.container.paper = paper;
					
		       		return params.container;
				}
			}
		} 
	},
	connector	: function(connector){
		
	},
	container 	: function(shape, element){
		var options = element.options;

		// add it to DOM
		var container = jQuery('<div>',{
		//	"id"		: yellowEdit.dataModel.containers.length+1,
			"class" 	: yellowEdit.editor.shapes.container.defaultClass,
			"css" 		: yellowEdit.editor.shapes.container.defaultCSS
		});
		
		if(options == undefined){
			container.attr({'id' : yellowEdit.dataModel.containers.length+1});
		}else{
			container.attr({'id' : options.identity});
		}
		
		container.appendTo(yellowEdit.editorOptions.elements.canvasElement).css({
			'left' : options.position.left+'px',
			'top' : options.position.top+'px'
		});
		
		container.css({'left': options.position.left, 'top': options.position.top});
		
		// make draggable
		if(options.defaultShape == true) jsPlumb.draggable(container);
		
		// make connectable -> create endpoints
		var endpointOptions = { 
			isSource		:true, 
			isTarget		:true,
			endpoint		: [
    		   "Dot",
    		   { 
    			   radius		: yellowEdit.editorOptions.endpoint.radius,
    			   cssClass		: yellowEdit.editorOptions.endpoint.cssClass,
    			   hoverClass	: yellowEdit.editorOptions.endpoint.hoverClass
				}
		    ],
		    paintStyle		: {
		    	fillStyle	: yellowEdit.editorOptions.endpoint.fill,
		    	lineWidth	: yellowEdit.editorOptions.endpoint.hoverOutlineWidth
		    },
			hoverPaintStyle : {
				fillStyle 		: yellowEdit.editorOptions.endpoint.hoverFill,
				outlineColor	: yellowEdit.editorOptions.endpoint.hoverOutlineColor,
				outlineWidth	: yellowEdit.editorOptions.endpoint.hoverOutlineWidth
			},
			connectorOverlays:[ 
				[ "Arrow", yellowEdit.editorOptions.overlay ]/*, 
				[ "Label", { label:"Trykk for å slette", id:"label" } ]*/]
		}; 
		jsPlumb.addEndpoint(container, {anchor:['LeftMiddle']},  endpointOptions );  
		jsPlumb.addEndpoint(container, {anchor:['RightMiddle']}, endpointOptions );  
		jsPlumb.addEndpoint(container, {anchor:['TopCenter']},	 endpointOptions );  
		jsPlumb.addEndpoint(container, {anchor:['BottomCenter']},endpointOptions );  
		
		container.elements = {};
		
		if(element.elements !== undefined){
			var attrs = element.elements.c.attrs;
		}else{
			var attrs = {
		       		fill			: "#FDFDFD",
		            stroke			: "#666666",
		            "stroke-width"	: 1,
		            opacity			: 1,
		            cursor			: "move"
		       };
			}
		
		switch (shape) {

			case 'rect':
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M1,1h108.861l0.001,59.284c0,0-49.578,0-108.861,0C1,1,1,1,1,1z',
					attrs		: attrs,
					width		: 111,
					height		: 62,
					initParams	: element
				});
				
			break;
			case 'circuit':
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M89.266,46.633c0,7.019-5.723,12.708-12.781,12.708H13.516c-7.059,0-12.782-5.689-12.782-12.708V13.371c0-7.019,5.723-12.708,12.782-12.708h62.968c7.059,0,12.781,5.689,12.781,12.708V46.633z',
					attrs		: attrs,
					width		: 90,
					height		: 60,
					initParams	: element
				});
			break;
			case 'rectvariant_1':
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M1.14,29.092c0,0,5.167-11.981,11.5-28.092c12.5,0,63.5,0.111,70.5,0c2.064,5.587,10.75,29.092,10.75,29.092l-10,27.092H12.64L1.14,29.092z',
					attrs		: attrs,
					width		: 95,
					height		: 58,
					initParams	: element
				});
			break;
			case 'rectvariant_2':
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M106.91,61.184c0,0-9.291-7-27.872-7s-34.927,12-48.025,12c-13.098,0-30.013-11-30.013-11s0,0,0-54.184c1.474,0,105.91,0,105.91,0V61.184z',
					attrs		: attrs,
					width		: 109,
					height		: 68,
					initParams	: element
				});
			break;
			case 'db':
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M0.767,7.326V52.67c0,3.713,19.804,6.721,44.233,6.721c24.43,0,44.233-3.008,44.233-6.721c0,0,0-41.798,0-43.035c0-1.157,0-2.309,0-2.309c0-3.709-19.803-6.717-44.233-6.717C20.571,0.609,0.767,3.617,0.767,7.326c0,3.71,19.804,6.717,44.233,6.717c21.119,0,38.78-2.248,43.178-5.253c0,0,0.957-0.548,1.055-1.464',
					attrs		: attrs,
					width		: 90,
					height		: 60,
					initParams	: element
				});
			break;
			case 'cylinder':
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M102.401,1H6.987C3.68,1,1,13.133,1,28.101c0,14.967,2.68,27.101,5.986,27.101c0,0,92.255,0,93.356,0c1.031,0,2.058,0,2.058,0c3.306,0,5.986-12.134,5.986-27.101C108.387,13.133,105.707,1,102.401,1c-3.307,0-5.987,12.133-5.987,27.101c0,12.938,2.003,23.758,4.682,26.453c0,0,0.489,0.588,1.305,0.647',
					attrs		: attrs,
					width		: 111,
					height		: 56,
					initParams	: element
				});
			break;
			case 'diamond':
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M42.92,1l41.92,41.92L42.92,84.841c0,0,0,0-41.92-41.92C42.92,1,42.92,1,42.92,1z',
					attrs		: attrs,
					width		: 86,
					height		: 86,
					initParams	: element
				});
			break;
		//ELEMENT added 20. dec 2012
			case 'man':
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M33.625,31.649c0.542,0.724,2.641,12.901,3.435,15.367c0.794,2.465,7.169,2.212,6.508-1.446c-0.662-3.658-6.003-24.018-9.039-24.949c-2.707-0.83-6.525-1.771-7.321-1.966c2.265-1.523,3.797-4.425,3.797-7.759C31.005,5.983,27.681,2,23.579,2c-4.1,0-7.425,3.983-7.425,8.896c0,3.308,1.51,6.187,3.745,7.721H18.42c0,0-5.442,0.191-7.322,2.092S2.751,43.703,2.731,45.812C2.71,47.92,7.985,49.33,9.325,47.088c1.34-2.242,3.281-17.909,4.414-16.524c1.132,1.384,0.723,8.316,0.723,13.017c0,4.701-7.378,36.945-6.763,39.625s7.404,4.127,8.368,0c0.965-4.128,5.807-28.958,7.073-28.054c1.265,0.903,8.982,25.297,10.185,29.1c1.204,3.803,10.47,1.652,8.368-2.877c-2.102-4.53-10.167-34.579-10.468-38C30.925,39.954,33.082,30.926,33.625,31.649z',
					attrs		: attrs,
					width		: 86,
					height		: 86,
					initParams	: element
				});
			break;
			//End element
			case 'htmlBox':
				var htmlContent = jQuery('div',{
					//"id"		: yellowEdit.dataModel.containers.length+1,
					"class" 	: yellowEdit.editor.shapes.container.defaultHTMLClass,
					"css" 		: yellowEdit.editor.shapes.container.defaultCSS
				});
		
				container.append('<div class="htmlContent">ingenting</div>');
			break;
		}
		//var boundingBox = container.elements.c.getBBox();

	    // start, move, and up are the drag functions
	    start = function () {
	        this.ox = container.offset().left;
	        this.oy = container.offset().top;
	        
	        this.sizer.ox = this.sizer.attr("x");
	        this.sizer.oy = this.sizer.attr("y");
	        this.sizer.attr({opacity: 1});
	    },
	    move = function (dx, dy) {
	        container.offset({left : this.ox + dx, top : this.oy + dy});
	        jsPlumb.repaint(container);
	    },
	    up = function () {
	        // restoring state
	        this.sizer.attr({opacity: .5});
	    },
	    rstart = function () {
	        // storing original coordinates
	        this.ox = this.attr("x");
	        this.oy = this.attr("y");
	        
	        this.och = container.height();        
	        this.ocw = container.width();

        	this.box.ow = this.box.attr("width");
    		this.box.oh = this.box.attr("height");
    		
	    },
	    rmove = function (dx, dy) {
	        // move will be called with dx and dy
	        this.attr({x: this.ox + dx, y: this.oy + dy});
	        
	        //paths and boxes behave differently
	        if(this.box.type != 'path'){
	        	this.box.attr({width: this.box.ow + dx, height: this.box.oh + dy});
	        }
	        
	        container.elements.t.attr({
	    		'x': container.width()/2+'px',
	    		'y': container.height()/2+'px'
    		});
	        
	        container.css({'width' : this.ocw + dx+'px', 'height' : this.och + dy+'px'});
	        container.paper.setSize(this.ocw + dx, this.och + dy);
	        jsPlumb.repaint(container);
	        
	    },
	    rstop = function () {
			this.scaleX *= container.width() / this.ocw;
    		this.scaleY *= container.height() / this.och;
	    	
	    	var transformString = yellowEdit.getTransformString(this.scaleX, this.scaleY);
			container.options.transformString = transformString;				    	 
			
			container.options.scaleX = this.scaleX;				    	 
			container.options.scaleY = this.scaleY;
							    	 
	    	//container.t.transform('S'+this.scaleX+','+this.scaleX+',0,0')
	    	this.box.transform(transformString);
	    };
	    
        jsPlumb.repaint(container);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  				  
		// add to datamodel
		container.identity 					= container.attr('id');
		container.options 					= new Object;
		container.options.shape 			= shape;
		
		// initial scaleparams
		container.options.scaleY 			= options.scaleY;
		container.options.scaleX 			= options.scaleX;
		
		container.options.identity 			= container.attr('id');
		container.options.transformString	= options.transformString;
		container.options.formatting 		= new Object;
		container.options.formatting.rawFormatting = container.attr('style');
		container.options.formatting.height = container.css('height');
		container.options.formatting.width	= container.css('width');
		container.options.position 			= new Object;
		container.options.position.left 	= container.css('left');
		container.options.position.top 		= container.css('top');
		container.texts 					= new Object;
		
		yellowEdit.dataModel.containers.push(container);
		
		  
	    if(!yellowEdit.viewMode){
	    	
	    	// rstart and rmove are the resize functions;
	    	container.elements.c.drag(move, start, up);
		    container.elements.c.sizer = container.elements.s;
		    container.elements.s.drag(rmove, rstart, rstop);
		    container.elements.s.box = container.elements.c;
		    
		    container.click(function(){
				yellowEdit.editor.selectedContainers.push(container);
				yellowEdit.editor.inspector.draw(container);

				container.options.path = container.elements.c.attrs.path.toString();
				container.options.formatting.rawFormatting = container.attr('style');
				container.options.formatting.height = container.css('height');
				container.options.formatting.width = container.css('width');
				container.options.position.left = container.css('left');
				container.options.position.top 	= container.css('top');
				
				jsPlumb.setDraggable(container, false);
			});
		    
	    }else{
	    	// hide endpoints
	    	jsPlumb.hide(container, true);
	    	container.click(function(){
	    		
	    		//var url = 'http://'+window.location.host+'/'+container.elements.c.attr('title');
	    		if(container.elements.c.attr('title') != 'Raphael'){
	    			var url = container.elements.c.attr('title');
	    			if(confirm('Vil du gå til '+ url +'?'))
            			window.location = url;
        		}
	    	});
	    	
	    }
		
		return container; 
	},
	getTransformString : function(scaleX, scaleY){
		return 'S'+scaleX+','+scaleY+',0,0';
	},
	
	connector 	: {
		create : function(){},
		remove : function(){}
	}
	
};