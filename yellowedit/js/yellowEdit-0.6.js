/*
 * yellowEdit - flowCharts
 * Depends on Raphaeljs, jQuery, jsPlumb and Bootstrap 
 * All rights reserved
 * Creator: Anders Gimmestad Gule / Gule Interaktiv
 * 
 * */


var yellowEdit = {
				
	jsPlumbLoaded 	: false,
	viewMode		: false,
	jsPlumbDefaults	: {
		Connector		: ["Flowchart",{stub: 15} ],
		MaxConnections	: 5,
		PaintStyle 		: {
			lineWidth		: 2,
			strokeStyle		: '#111111',
			outlineColor	: '#FFFFFF',
			outlineWidth	: 2
		},
		DragOptions 	: { cursor: "crosshair" }
		
	},
	snap			: {
		current	: 1,
		intervals : {
			snap1	: 1,
			snap2	: 10,
			snap3	: 20
		}
	},
	editorOptions	: {},
	
	init	: function(options, dataModel){
		jsPlumb.setRenderMode(jsPlumb.SVG);
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
		
		// listeners
		this.editor.menu.deleteContainerListener();
		this.editor.menu.duplicateContainerListener();
		this.editor.menu.reorderElementListener();
		
		return this;
	},			
	
	dataModel	: {
		containers 	: [],
		connectors 	: [],
		updateContainer : function(){},
		reloadConnections : function(){
			yellowEdit.dataModel.connectors = [];
			var connections = jsPlumb.getAllConnections().jsPlumb_DefaultScope;
			if(connections.length){
				$.each(connections, function(index, value){
					yellowEdit.dataModel.connectors.push(value);
				});
			}
		}	
	},
	
	editor		: {
		init		: function(scope){
			$.each(scope.editorOptions.elements.shapesElement.children(), function(){
				$(this).draggable({
					revert : true
				});
			});
			
			scope.editorOptions.elements.canvasElement.droppable({
				hoverClass: "canvas-highlight",
				drop: function( event, ui ) {
					var shapeType = ui.draggable.attr('id');
					
					var container =	new yellowEdit.container(shapeType, {
				 		options:{
					 		position : {
					 			top		: ui.offset.top,
					 			left	: ui.offset.left
					 		}
				 		}
				 	});
					yellowEdit.editor.selecterContainers = []; 		
					yellowEdit.editor.selectedContainers.push(container);
					if(shapeType == 'htmlbox'){
						container.elements.html.trigger('focus');
					}else{
						container.trigger('click');
					}
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
					//event.stopPropagation();
					 
			});
			/*jsPlumb.bind("connectionDrag", function(connection) {
				console.log("connection " + connection.id + " is being dragged");
			});*/		
			
			jsPlumb.bind("connectionDragStop", function(connection) {
				yellowEdit.dataModel.reloadConnections();
			});
						
			$('html').click(function(){
				//yellowEdit.editorOptions.elements.inspectorElement.hide();
			});
			
			//Global events
			yellowEdit.editorOptions.globalListeners.snapToggler(yellowEdit.snap.intervals);
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
		    		
		    		//$('#htmlContent').val(element.elements.t.attr('text'));
		    		$('#htmlContent').val(element.texts.text);
		    		if(element.elements.c.attr('title') == 'Raphael'){
		    			$('#containerLink').val('');
		    		}else{
		    			$('#containerLink').val(element.elements.c.attr('title'));
		    		}
		    		
		    		$('#colorPickerValue').val(element.elements.c.attr('fill'));
		    		$('#textColorValue').val(element.texts.color);
		    		if(element.texts.size !== undefined){
		    			$('.textSizePicker').removeClass('activesize');
		    			$('#skriftz'+element.texts.size).addClass('activesize');
		    		}
		    		$('#textSizeValue').val(element.texts.size);
		    		$('#yecolor').css('background-color',element.elements.c.attr('fill'));
		    		
					/*var html = '';
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
		    		html += '</div>';*/
		    	}
				
				//yellowEdit.editorOptions.elements.inspectorElement.find('#inspectorFormat').html(html);

				// call element-defined toolbar functions
				yellowEdit.editorOptions.elements.inspector.instantColorPicker(element);
				yellowEdit.editorOptions.elements.inspector.textColorPicker(element);
				yellowEdit.editorOptions.elements.inspector.textSizePicker(element);
				
				
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
									//container.elements.t = container.paper.text(container.width()/2, container.height()/2, value);
									
									container.elements.t.paper.top.attr({'text': value});
									container.elements.t.paper.top.attr({
										'y': container.height()/container.elements.t.textOffset.y,
										'x': container.width()/container.elements.t.textOffset.x});
									
									container.texts.text = value;
									yellowEdit.wrapText(container);
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
								case 'textColor':
									container.texts.color = value;
								break;
								case 'textSize':
									container.texts.size = value;
									break;
							}
						});
						
						$.each(yellowEdit.dataModel.containers, function(index, candidate){
							if(candidate.identity == container.identity){
								candidate = container;
							}
						});
					});
					//$('.saveContainer').prop('disabled', true);
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
						
						
						/*var data = [];
						data.push(yellowEdit.dataModel.containers);
						data.push(yellowEdit.dataModel.connectors);
						*/
						
						//console.log(posts);
						
						jQuery.ajax({
							url 	: yellowEdit.editorOptions.save.url,
							data	: posts,
							dataType: 'json',
							type	: 'POST',
							success : function(data){
								yellowEdit.editorOptions.save.success(data);
							}
						});
						
					break;
					case 'autoSave':
						var data = this.build();
						var posts = {};
						posts.data =  data;
						
						$.ajax({
						url 	: yellowEdit.editorOptions.save.autoSaveUrl,
							data	: posts,
							dataType: 'json',
							type	: 'POST',
							success : function(data){
								yellowEdit.editorOptions.save.autoSaveSuccess(data);
							}
						});
					break;
				}
			},
			deleteContainerListener : function(){
				//$(yellowEdit.editorOptions.elements.inspector.deleteContainer).unbind();
				$(yellowEdit.editorOptions.elements.inspector.deleteContainer).click(function(){
					var element = yellowEdit.editor.selectedContainers[0];
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
						
						/*$.each(yellowEdit.dataModel.connectors, function(index, connector){
							console.log(connector);
						});*/
						// remove from DOM
						element.remove();
						$('#inspectorFormat').hide();
						yellowEdit.dataModel.reloadConnections();
					}
				});
			},
			duplicateContainerListener : function(){
				$(yellowEdit.editorOptions.elements.inspector.duplicateContainer).click(function(){
					var element = yellowEdit.editor.selectedContainers[0];
					if(element !== undefined){
						var container = new yellowEdit.container(element.options.shape, element, true);
						yellowEdit.editor.selecterContainers = []; 		
						yellowEdit.editor.selectedContainers.push(container);
						container.trigger('click');
					}
				});
			},
			reorderElementListener : function(){
				
				$(yellowEdit.editorOptions.elements.inspector.containerToBottom).click(function(){
					var element = yellowEdit.editor.selectedContainers[0];
					if(element !== undefined){
						yellowEdit.editor.menu.reorderElement(element.attr('id'), 'bottom');
					}
				});
				$(yellowEdit.editorOptions.elements.inspector.containerToTop).click(function(){
					var element = yellowEdit.editor.selectedContainers[0];
					if(element !== undefined){
						yellowEdit.editor.menu.reorderElement(element.attr('id'), 'top');
					}
				});
			},
			reorderElement : function (elementId, order){
				var elements = $('#canvas').children();
				$.each(elements, function(index, value){
					if($(value).attr('id') == elementId){
						switch(order){
							case 'top':
								/*var conns = jsPlumb.getConnections({target: elementId});
								$.merge(conns, jsPlumb.getConnections({source: elementId}));*/
								
								var elementGroup = $(value);
								$.merge(elementGroup, $(value).nextUntil('._jsPlumb_connector').slice(0,4));
								elementGroup.detach().appendTo($('#canvas'));
								
								$.each(yellowEdit.dataModel.containers, function(index, value){
									if(value.attr('id') == elementId){
										var el = yellowEdit.dataModel.containers.splice(index,1);
										yellowEdit.dataModel.containers.push(el[0]);
										
										return false;
									}
								});									
							break;
							case 'bottom':
								var elementGroup = $(value);
								$.merge(elementGroup, $(value).nextUntil('._jsPlumb_connector').slice(0,4));
								elementGroup.detach().prependTo($('#canvas'));
								
								$.each(yellowEdit.dataModel.containers, function(index, value){
									if(value.attr('id') == elementId){
										var el = yellowEdit.dataModel.containers.splice(index,1);
										yellowEdit.dataModel.containers.unshift(el[0]);
										
										return false;
									}
								});									

							break;
						}
					}
				});
			},
			build		: function(){
				
				var connections = [];
				
				$.each(yellowEdit.dataModel.connectors, function(index, value){
					var connector = {};
					
					connector.sourceId = value.sourceId;
					connector.targetId = value.targetId;
					
					connector.endpoint = {};
					
					$.each(value.endpoints, function(index, endpoint){
						var direction = '';
						
						if((endpoint.anchor.x == 0) && (endpoint.anchor.y == 0.5)){
							direction = "LeftMiddle";
						}else if((endpoint.anchor.x == 0.5) && (endpoint.anchor.y == 0)){
							direction = "TopCenter";
						}else if((endpoint.anchor.x == 1) && (endpoint.anchor.y == 0.5)){
							direction = "RightMiddle";
						}else if((endpoint.anchor.x == 0.5) && (endpoint.anchor.y == 1)){
							direction = "BottomCenter";
						}
						
						if(index == 0){
							connector.endpoint.start = direction;
						}else if(index == 1){
							connector.endpoint.stop = direction;
						}
						
					});
					
					connections.push(connector);
				});
				
				var seen = [];
				var replacer = function(key, val) {
					if (typeof val === 'object' && val !== null){
						if (seen.indexOf(val) !== -1) {
				            // Circular reference found, discard key
				            return undefined;
				        }
				        // Store value in our collection
				        seen.push(val);
				    }
				    return val;
				};
				var structure = JSON.stringify(JSON.decycle({containers : yellowEdit.dataModel.containers, connectors : connections}), replacer);
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
					
					jsPlumb.connect({
						source	: value.sourceId, 
						target	: value.targetId,
						anchors	: [value.endpoint.start, value.endpoint.stop],
						endpoint: ["Blank", "Blank"],
						overlays: [[ "PlainArrow", yellowEdit.editorOptions.overlay ]]
					});
					yellowEdit.dataModel.reloadConnections();
				});
				
				// etter ferdig lasta
			
				
				//reorder('jsPlumb_1_134', 'bottom');
				
				
				
				
				
				
			},
			hide : function(){
				yellowEdit.editorOptions.elements.menu.hide();
			}
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
			       		// if no predefined scaling - use 1
			       		params.container.elements.s.scaleX = 1;
			       		params.container.elements.s.scaleY = 1;
			       		
			       		if(params.noResize){
			       			params.container.elements.s.hide();
			       		}
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
						if((typeof params.initParams.texts.color !== undefined) && (params.initParams.texts.color != '')){
							textColor = params.initParams.texts.color;
							
						}else{
							textColor = 'rgb(0,0,0)';
						}
						if((typeof params.initParams.texts.size !== undefined) && (params.initParams.texts.size != '')){
							textSize = params.initParams.texts.size;
							
						}else{
							textSize = 'rgb(0,0,0)';
						}
					}else{
						textColor = 'rgb(0,0,0)';
						textSize = 10;
					}
					
					if(params.type == 'htmlNode'){
						var htmlContent = '';
						
						if((params.initParams.elements !== undefined) && (params.initParams.elements.html !== undefined)){
							htmlContent = params.initParams.elements.html; 
						}
						var htmlContainerId = params.container.attr('id')+'_tiny';
						
						if(!yellowEdit.viewMode){
							var htmlNode = $('<div id="'+htmlContainerId+'" contentEditable="true" class="htmlContent">'+htmlContent+'</div>');
						}else{
							var htmlNode = $('<div class="htmlContent">'+htmlContent+'</div>');
						}
						params.container.elements.html = htmlNode;
						params.container.append(htmlNode);
						
						//set shape transparent
						params.container.elements.c.attr({fill:'rgba(0,0,0,0)', stroke : 'rgba(0,0,0,0)', 'stroke-width': 10});
						params.container.elements.html.css({
			        		'width' 	: params.initParams.options.htmlNodeWidth+'px',
			        		'height' 	: params.initParams.options.htmlNodeHeight+'px'});
						
						function fixWord(str) {
							str = str.replace(/MsoNormal/gi,"");
							str = str.replace(/<\/?meta[^>]*>/gi,"");
							str = str.replace(/<\/?xml[^>]*>/gi,"");
							str = str.replace(/<\?xml[^>]*\/>/gi,"");
							str = str.replace(/<!--(.*)-->/gi, "");
							str = str.replace(/<!--(.*)>/gi, "");
							str = str.replace(/<!(.*)-->/gi, "");
							str = str.replace(/<w:[^>]*>(.*)<\/w:[^>]*>/gi,'');
							str = str.replace(/<w:[^>]*\/>/gi,'');
							str = str.replace(/<\/?w:[^>]*>/gi,"");
							str = str.replace(/<m:[^>]*\/>/gi,'');
							str = str.replace(/<m:[^>]>(.*)<\/m:[^>]*>/gi,'');
							str = str.replace(/<o:[^>]*>(.*)<\/o:[^>]*>/gi,'');
							str = str.replace(/<o:[^>]*\/>/gi,'');
							str = str.replace(/<\/?m:[^>]*>/gi,"");
							str = str.replace(/style=\"([^>]*)\"/gi,"");
							str = str.replace(/style=\'([^>]*)\'/gi,"");
							str = str.replace(/class=\"(.*)\"/gi,"");
							str = str.replace(/class=\'(.*)\'/gi,"");
							str = str.replace(/<b[^>]*>/gi,'<strong>');
							str = str.replace(/<\/b[^>]*>/gi,'<\/strong>');
							str = str.replace(/<p[^>]*>/gi,'<p>');
							str = str.replace(/<\/p[^>]*>/gi,'<\/p>');
							str = str.replace(/<span[^>]*>/gi,'');
							str = str.replace(/<\/span[^>]*>/gi,'');
							str = str.replace(/<st1:[^>]*>/gi,'');
							str = str.replace(/<\/st1:[^>]*>/gi,'');
							str = str.replace(/<font[^>]*>/gi,'');
							str = str.replace(/<\/font[^>]*>/gi,'');
							str = str.replace('  ','');
							str = str.replace(/<strong><\/strong>/gi,'');
							str = str.replace(/<p><\/p>/gi,'');
							str = str.replace(/\/\*(.*)\*\//gi,'');
							str = str.replace(/<!--/gi, "");
							str = str.replace(/-->/gi, "");
							str = str.replace(/<style[^>]*>[^<]*<\/style[^>]*>/gi,'');
							function trim(str, chars) {return ltrim(rtrim(str, chars), chars);}
							function ltrim(str, chars) {chars = chars || "\\s";return str.replace(new RegExp("^[" + chars + "]+", "g"), "");}
							function rtrim(str, chars) {chars = chars || "\\s";return str.replace(new RegExp("[" + chars + "]+$", "g"), "");}

							return str;
						}
						
						
						htmlNode.bind('paste', function(){
							
							var scope = $(this).empty();
							setTimeout(function () {
								scope.text(fixWord(scope.html()));
							  }, 200);
							
						});
						
						// save htmlContent
						htmlNode.focus(function(){
							$(this).addClass('edit');
							
							$(this).text($(this).html());
							
						}).focusout(function(){
							$(this).html($(this).text());
							$(this).removeClass('edit');
							var htmlContent = $(this).html();
							//params.initParams.htmlContent = 
							$.each(yellowEdit.editor.selectedContainers, function(index, container) {
								container.elements.html = htmlContent;
							});
						});
						
					}
					
					var textOffset = {
						'x' : '2',
						'y' : '2'
					};
					
					if(typeof params.textOffset == 'object'){
						//textOffset = params.textOffset;
						$.extend(textOffset, params.textOffset);
					}
					
					params.container.elements.t = paper.text(params.container.width()/textOffset.x, params.container.height()/textOffset.y, text);
					params.container.elements.t.textOffset = textOffset;
					params.container.elements.t.attr({fill:textColor});
					params.container.elements.t.attr({"font-size":textSize});
					params.container.paper = paper;

					if(typeof params.misc == 'function'){
						params.misc(params);
					}
					
		       		return params.container;
				}
			}
		} 
	},
	container 	: function(shape, element, copy){
		var options = element.options;

		// add it to DOM
		var container = jQuery('<div>',{
		//	"id"		: yellowEdit.dataModel.containers.length+1,
			"class" 	: yellowEdit.editor.shapes.container.defaultClass,
			"css" 		: yellowEdit.editor.shapes.container.defaultCSS
		});
		
		var containerOffset = 0;
		
		if(options == undefined){
			container.attr({'id' : yellowEdit.dataModel.containers.length+1});
		}else{
			if(copy){
				container.attr({'id' : options.identity+(yellowEdit.dataModel.containers.length+1)});
				containerOffset = 30;
			}else{
				container.attr({'id' : options.identity});
			}
		}

		container.appendTo(yellowEdit.editorOptions.elements.canvasElement).css({
			'left' : (parseInt(options.position.left)+containerOffset)+'px',
			'top' : (parseInt(options.position.top)+containerOffset)+'px'
		});
		
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
				[ "PlainArrow", yellowEdit.editorOptions.overlay ]/*, 
				[ "Label", { label:"Trykk for å slette", id:"label" } ]*/]
		}; 
		
		var currentAnchors = [];
		currentAnchors.push(jsPlumb.addEndpoint(container, {anchor:['LeftMiddle']},  endpointOptions ));  
		currentAnchors.push(jsPlumb.addEndpoint(container, {anchor:['RightMiddle']}, endpointOptions ));  
		currentAnchors.push(jsPlumb.addEndpoint(container, {anchor:['TopCenter']},	 endpointOptions ));  
		currentAnchors.push(jsPlumb.addEndpoint(container, {anchor:['BottomCenter']},endpointOptions ));  
		
		if(shape == 'swimlane'){
			$.each(currentAnchors, function(index, value){
				value.setVisible(false);
			});
		}
		
		container.elements = {};
		
		if(element.elements !== undefined){
			var attrs = element.elements.c.attrs;
		}else{
			var attrs = {
	       		fill			: "#FDFDFD",
	            stroke			: "#111111",
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
					path		: 'M100.912,26.729c0,4.343-3.441,7.863-7.688,7.863H8.6c-4.247,0.001-7.688-3.52-7.688-7.863V8.455c0-4.343,3.441-7.863,7.688-7.863h84.623c4.247,0,7.688,3.521,7.688,7.863V26.729L100.912,26.729z',
					attrs		: attrs,
					width		: 102,
					height		: 36,
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
			case 'man':
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M33.625,31.649c0.542,0.724,2.641,12.901,3.435,15.367c0.794,2.465,7.169,2.212,6.508-1.446c-0.662-3.658-6.003-24.018-9.039-24.949c-2.707-0.83-6.525-1.771-7.321-1.966c2.265-1.523,3.797-4.425,3.797-7.759C31.005,5.983,27.681,2,23.579,2c-4.1,0-7.425,3.983-7.425,8.896c0,3.308,1.51,6.187,3.745,7.721H18.42c0,0-5.442,0.191-7.322,2.092S2.751,43.703,2.731,45.812C2.71,47.92,7.985,49.33,9.325,47.088c1.34-2.242,3.281-17.909,4.414-16.524c1.132,1.384,0.723,8.316,0.723,13.017c0,4.701-7.378,36.945-6.763,39.625s7.404,4.127,8.368,0c0.965-4.128,5.807-28.958,7.073-28.054c1.265,0.903,8.982,25.297,10.185,29.1c1.204,3.803,10.47,1.652,8.368-2.877c-2.102-4.53-10.167-34.579-10.468-38C30.925,39.954,33.082,30.926,33.625,31.649z',
					attrs		: attrs,
					width		: 48,
					height		: 120,
					textOffset	: {
						'y'	: '1.2' 	
				    },
					initParams	: element
				});
			break;
			case 'htmlbox':
				var htmlNode = jQuery('div',{
					//"id"		: yellowEdit.dataModel.containers.length+1,
					"class" 	: yellowEdit.editor.shapes.container.defaultHTMLClass,
					"css" 		: yellowEdit.editor.shapes.container.defaultCSS
				});
				
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					type		: 'htmlNode',
					path		: 'M1,1h108.861l0.001,59.284c0,0-49.578,0-108.861,0C1,1,1,1,1,1z',
					attrs		: attrs,
					width		: 112,
					height		: 63,
					initParams	: element
				});				
			break;
			case 'swimlane':
				
				$.extend(attrs, {'stroke-opacity': '0.1', 'stroke-width': 5, fill: '#000000'});
				
				container = yellowEdit.editor.shapes.container.create({
					container 	: container,
					path		: 'M2916.799,5.771c-4.369,0-2828.529,0-2828.529,0H55.164c0,0-37.258-0.01-44.143,0c-6.886,0.01-6.201-2.604,0-2.604c6.2,0,10.089,0,10.089,0s2889.805,0.011,2895.689,0C2922.678,3.156,2921.163,5.771,2916.799,5.771z',
					//path		: 'M2916.799,17.771c-4.369,0-2828.529,0-2828.529,0H55.164c0,0-37.258-0.01-44.143,0c-6.886,0.01-6.201-2.604,0-2.604c6.2,0,10.089,0,10.089,0s2889.805,0.011,2895.689,0C2922.678,15.156,2921.163,17.771,2916.799,17.771z',
					//path		: 'M8,11C8,11,498.72,11,1000,11',
					attrs		: attrs,
					width		: 700,
					height		: 24,
					textOffset	: {
						'x'	: '70', 	
						'y'	: '1.5' 	
				    },
					noResize	: true,
					initParams	: element,
					misc		: function(params){
						params.container.css({'left': '0px'}).addClass('swimlane');
						params.container.elements.t.attr({'text-anchor':'start'});
						//console.log(params.container.elements.c);
						//params.container.elements.c.paper.top.attr({'y':'20px'});
						
						
					}
				});			
				break;
			
		}
		
		//var boundingBox = container.elements.c.getBBox();

	    // start, move, and up are the drag functions
	    start = function () {
	        this.ox = container.offset().left;
	        this.oy = container.offset().top;
	        
	        //this.sizer.ox = this.sizer.attr("x"); /* for the ability to move the the text */
	        //this.sizer.oy = this.sizer.attr("y"); /* for the ability to move the the text */
	        //this.sizer.attr({opacity: 1});		/* for the ability to move the the text */
	    },
	    move = function (dx, dy) {
	    	
	    	var snapInterval = yellowEdit.snap.current;
	    	
	    	if(container.options.shape == 'swimlane'){
	    		container.offset({left : 0, top : this.oy + dy});
	    	}else{
	    		container.css({left : Math.round((this.ox + dx)/snapInterval)*snapInterval, top : Math.round((this.oy + dy)/snapInterval)*snapInterval});
	    	}
	        jsPlumb.repaint(container);
	    },
	    up = function (dx, dy) {
	    	
	    	jsPlumb.repaint(container);
	        // restoring state
	        //this.sizer.attr({opacity: .5}); /* for the ability to move the the text */
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
	        
	        container.elements.t.paper.top.attr({
	    		'x': container.width()/container.elements.t.textOffset.x,
	    		'y': (container.height()/container.elements.t.textOffset.y)
    		});
	        //if((this.ocw +dx) > 100){
	        var tWidth = this.ocw+dx;
	        //container.elements.c.attr({fill: value});
	        //console.log(container.elements);
	        //container.elements.t.attr({width: tWidth+'px'});
	        container.css({'width' : this.ocw + dx+'px', 'height' : this.och + dy+'px'});
	        container.paper.setSize(this.ocw + dx, this.och + dy);
	        
	        if(container.elements.html !== undefined){
	        	$(container).find('.htmlContent').css({
	        		'width' 	: (this.ocw + dx)-30+'px',
	        		'height' 	: (this.och + dy)-30+'px'});
	        }
	        //}
	        jsPlumb.repaint(container);
	        
	    },
	    rstop = function () {
			this.scaleX *= container.width() / this.ocw;
    		this.scaleY *= container.height() / this.och;
	    	
	    	var transformString = yellowEdit.getTransformString(this.scaleX, this.scaleY);
			container.options.transformString = transformString;				    	 
			
			container.options.scaleX = this.scaleX;				    	 
			container.options.scaleY = this.scaleY;
			
			if(container.elements.html !== undefined){
				container.options.htmlNodeWidth = container.width()-30;
				container.options.htmlNodeHeight = container.height()-30;
			}
							    	 
	    	//container.t.transform('S'+this.scaleX+','+this.scaleX+',0,0')
	    	this.box.transform(transformString);
	    	if(container.texts.text != ''){
	    		yellowEdit.wrapText(container);
	    	}
	    	jsPlumb.repaint(container);
	    };
	    
	    
        jsPlumb.repaint(container);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  				  
		// add to datamodel
		container.identity 					= container.attr('id');
		container.options 					= new Object;
		container.options.shape 			= shape;
		
		// initial scaleparams
		container.options.scaleY 			= options.scaleY;
		container.options.scaleX 			= options.scaleX;
		container.options.htmlNodeWidth		= options.htmlNodeWidth;
		container.options.htmlNodeHeight	= options.htmlNodeHeight;
		
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
		if(typeof element.texts === 'object'){
			container.texts.text				= element.texts.text;
			container.texts.title				= element.texts.title;
			container.texts.color				= element.texts.color;
			container.texts.size				= element.texts.size;
			if(typeof container.texts.text !== 'undefined'){
				yellowEdit.wrapText(container);
			}
		}
		
		if(element.elements	 !== undefined){
			container.elements.html = element.elements.html;
		}
		
		yellowEdit.dataModel.containers.push(container);
		if(!yellowEdit.viewMode){
	    	
	    	// rstart and rmove are the resize functions;
	    	container.elements.c.drag(move, start, up);
	    	container.elements.t.drag(move, start, up);
	    	
	    	//container.elements.t.drag(move, start, up);
		    container.elements.c.sizer = container.elements.s;
		    container.elements.s.drag(rmove, rstart, rstop);
		    container.elements.s.box = container.elements.c;
		    
		    container.click(function(){
				yellowEdit.editor.selectedContainers.push(container);
				yellowEdit.editor.inspector.draw(container);

				$.each($('.nodeContainer'), function(index, container){
					$(container).removeClass('selected');
				});
				
				container.addClass('selected');
				
				container.options.path = container.elements.c.attrs.path.toString();
				container.options.formatting.rawFormatting = container.attr('style');
				container.options.formatting.height = container.css('height');
				container.options.formatting.width = container.css('width');
				container.options.position.left = container.css('left');
				container.options.position.top 	= container.css('top');
				
				jsPlumb.setDraggable(container, false);
				yellowEdit.editorOptions.elements.inspectorElement.show();
			});
		    
	    }else{
	    	// hide endpoints
	    	jsPlumb.hide(container, true);
	    	container.click(function(){
	    		
	    		//var url = 'http://'+window.location.host+'/'+container.elements.c.attr('title');
	    		if((container.elements.c.attr('title') != 'Raphael') && (container.elements.c.attr('title') != '')){
	    			var url = container.elements.c.attr('title');
	    			if(confirm('Vil du gå til '+ url +'?'))
            			window.location = url;
        		}
	    	});
	    	
	    }
		return container; 
	},
	wrapText : function(container){
		if(typeof container.texts.text !== 'undefined'){ 
	        //if(container.width() < container.elements.t.getBBox().width){
	    	var words = container.texts.text.split(" ");
	   
	    	var sentence = [];
	    	var i = 0;
	    	
	    	$('#placeholder').empty();
	    	
	    	var padding = 10;
	    	
	    	if(container.elements.t.attr('font-size') == 12){
	    		padding += 20;
	    	}else if(container.elements.t.attr('font-size') == 14){
	    		padding += 50;
	    	}
	    	
	    	$.each(words, function(index, value){
	    		$('#placeholder').append(value+' ');
	    		
	    		if($('#placeholder').width()+padding > container.width()){
	    			if(i > 0){
	    				sentence.push('\n');
	    				sentence.push(value);
	    				
	    				$('#placeholder').empty();
	    			}
	    		}else{
	    			sentence.push(value);
	    		}
	    		i++;
	    	});
	    	
	    	var text = sentence.join(' ');
	    	container.elements.t.attr({'text': text})
		}
    	
    /*}else if(container.width() > container.elements.t.getBBox().width){
    	var words = container.elements.t.paper.top.attr('text').split("\n");
    }*/
	},
	getTransformString : function(scaleX, scaleY){
		return 'S'+scaleX+','+scaleY+',0,0';
	},
	
	connector 	: {
		create : function(){},
		remove : function(){}
	}
	
};
