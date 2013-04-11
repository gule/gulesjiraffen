<?
if($rad["flowchart"]==""){
	$dataModel = '""';
}else{
	$dataModel = $rad["flowchart"];
}
?>
<script type="text/javascript">

	jQuery(document).ready(function(){
		var dataModel = <?=$dataModel?>;
		
	
		$.getJSON('ajaxget.php?modul=adoc&type=getflow&id=<?=$rad["ID"]?>', function(dataModel){
		//$.getJSON(dataModel, function(data){
				yellowEdit.init({
				elements : {
					canvasElement 	: $('#canvas'),
					shapesElement	: $('#shapes'),
					inspectorSave	: $('#ye_main'),
					inspectorElement: $('#yeparams'),
					toolBoxElement	: $('#toolBoxContainer'),
					menu			: $('.navBar'),
					inspector		: {
						
						deleteContainer		: '.deleteContainer',
						duplicateContainer	: '#yeduplo',
						containerToTop		: '#ye_moveup',
						containerToBottom	: '#ye_movedown',
						duplicateContainer	: '#yeduplo',
						instantColorPicker	: function(element){
							$('.instantColorPicker').unbind();
							$('.instantColorPicker').click(function(e){
								e.preventDefault();
								var color = $(this).css('background-color');
								element.elements.c.attr({fill: color});
								$('#yecolor').css('background-color', color);
								$('#colorPickerValue').val(color);
							});
						},
						textColorPicker		: function(element){
							$('.textColorPicker').unbind();
							$('.textColorPicker').click(function(e){
								e.preventDefault();
								var color = $(this).css('background-color');
								element.texts.color = color;
								element.elements.t.attr({fill: color});
								$('#textColorValue').val(color);
							});
						},
						textSizePicker		: function(element){
							$('.textSizePicker').unbind();
							$('.textSizePicker').click(function(e){
							$('.textSizePicker').removeClass('activesize');	
								e.preventDefault();
								var size = $(this).attr('val');

								if(size >= 10){
									element.texts.size = size;
									element.elements.t.attr({'font-size': size});
									$('#textSizeValue').val(size);

									
					    			$(this).addClass('activesize');
								} 
							});
						}
					}
				},
				globalListeners	: {
					snapToggler			: function(intervals){
						$('.snap1, .snap2, .snap3').click(function() {   
							this.className = {
						       snap3 : 'snap1', snap1: 'snap2', snap2: 'snap3'
						    }[this.className];

						    yellowEdit.snap.current = intervals[this.className];
						});
					}
						
				},
				viewMode : <?=yellowcustom(1)?>
				
				, // default
				save	 : {
					autoSaveTimeout	: 3000,
					autoSaveUrl		: 'ajaxsave.php?modul=adoc&doc=<?=intval($_GET["doc"])?>&id=<?=intval($_GET["id"])?>&type=saveflow',
					autoSaveSuccess	: function(response){
						console.log('hoho');		
					},			
					url				: 'ajaxsave.php?modul=adoc&doc=<?=intval($_GET["doc"])?>&id=<?=intval($_GET["id"])?>&type=saveflow',
					success			: function(response){
						if(response=='LAGRA'){
					     	//alert('OK!');
							window.top.location='?modul=adoc&item=<?=$_GET["doc"]?>&acopy=<?=$_GET["id"]?>';
						}else{
							alert ('Ein feil oppstod');	
						}
					}
				},
	
 				/*
				 * define specific code for current implementation
				 * Always runs before load of dataModel
				 */
				misc	: function() {
					var scope = this;
					if(!this.viewMode){
						this.elements.canvasElement.css({height:(window.innerHeight-97)+'px'});
						
						$(window).resize(function() {											  
							scope.elements.canvasElement.css({height : (window.innerHeight-97)+'px'}); 
						});
					}
					else if(typeof printme!= 'undefined' && printme==true){
					   //Positioning should not be done in print.
					}
					else{
						$('#content10').css({left: $('#versioncomment').position().left});
						$('#content10').css({top: $('#versioncomment').position().top+$('#versioncomment').height()+15});
						$('#content10').css({display: 'block'}); //Added 7jan 2013 by LJ
						$(window).resize(function() {											  
							scope.elements.canvasElement.css({height : (window.innerHeight-90)+'px'});					
							$('#content10').css({left: $('#versioncomment').position().left}); 
						});
					}

					$('#yeparams').live('change', function(){
						$('.saveContainer').prop('disabled', false);	
					});
					//$(document)[0].oncontextmenu = function() {return false;}  
				},
				
				//displayOptions
				endpoint : {
					radius	 			: 3,
					fill				: '#84adc2',
					cssClass			: 'endpointLos',
					hoverOutlineWidth	: 1,							
					hoverOutlineColor	: "#FFFF",							
					hoverClass 			: 'endpointHover',
					hoverFill			: '#00a8ff'
				},
				connector : {
					lineWidth			: 1,
					strokeStyle			: '#666',
					outlineColor		: '#FFFFFF',
					outlineWidth		: 1
				},
				overlay	  : {
					width				: 7,
					length				: 7,
					location			: 1,
					id					: "arrow"
				}
				
				
			}, dataModel );
			
		});
				
		$('a#saveWorkflow').click(function(e){
			e.preventDefault();
			yellowEdit.editor.menu.save('db');
		});


		/*
		$('#autosave').change(function(){
			 					
			if($(this).is(':checked')){
				function save(){
					yellowEdit.editor.menu.save('autoSave');
				}

				yellowEdit.editorOptions.save.interval = setInterval(save, yellowEdit.editorOptions.save.autoSaveTimeout);
			}else{
				console.log(yellowEdit.editorOptions.save.interval);
				clearInterval(yellowEdit.editorOptions.save.interval);
			}
			
		});
		*/
		
		
		$('#downloadProject').click(function(e){
			e.preventDefault();
			$('#saveFileModal').modal({
		    	keyboard: false,
		    	backdrop: false
		    })
		    
		    $('#projectName').live('change',function(){
		    	 $('#downloadify').downloadify({
					swf				: 	'www/media/downloadify.swf',
					downloadImage 	: 	'www/img/saveProject.png',
					width			: 	73,
					height 			: 	28,
					filename 		: 	$('#projectName').val()+'.los',
					data 			: 	function(){
						return yellowEdit.editor.menu.build();
					},
					
					onError : function(){
					}
				});
			    
		    });
		    
		    $('#downloadProjectAction').click(function(e){
		    	e.preventDefault();
		    	yellowEdit.editor.menu.save('file');
		    });
		});
	});
</script>
		
	<? 
	if($_GET["edityellow"]>0 and $rad["ID"]>0){		
		if($_GET["splitter"]=="test"){
			require("editable/splitter.php");	
		}
	
		?>
		<a id="limitwidth" title="Visningsbredde KSS" onClick="alert('Denne streken indikerer bredden i dokumentet i KSS.Tegner du til høyre for denne vil det kunne bli scroll i skjermbildet');"></a>
		<div id="ye_top">
			<span id="ye_main">
				<a id="saveWorkflow" href="#"><?=xpr(1043)?></a>
				<!--  <input type="hidden" id="autosave" checked="checked" /> <span title="<?=xpr(1053)?>"><?=xpr(1044)?></span>-->
			</span>
			<? yellowcustom(2); ?>
		</div>
        
		<a id="snapper" class="snap1" href="#" title="Magnetisme"></a>	
		<a id="yeduplo" href="#" title="Kopier element"></a>			
		
		<span id="ye_updown">
			<a href="#" id="ye_moveup" title="Flytt øverst"></a>
			<a href="#" id="ye_movedown" title="Flytt nederst"></a>
		</span>	
        	
		<div class="toolBoxContainer shapes">
			<ul id="shapes">
				<li id="rect"><span class="hidden">Firkant</span></li>
				<!--<li id="circle"><span class="hidden">Sirkel</span></li>-->
				<li id="circuit"><span class="hidden">Bane</span></li>
				<li id="cylinder"><span class="hidden">Sylinder</span></li>
				<li id="db"><span class="hidden">database</span></li>
				<li id="rectvariant_1"><span class="hidden">firkantvariant</span></li>
				<li id="rectvariant_2"><span class="hidden">firkantvariant</span></li>
				<li id="diamond"><span class="hidden">diamant</span></li>
		        <li id="htmlbox"><span class="hidden">htmlboks</span></li>
		        <li id="man"><span class="hidden">man</span></li>
		        <li id="swimlane"><span class="hidden">swimlane</span></li>
			</ul>
			<ul id="tools">
				
			</ul>
		</div>	
			
	<?}?>
<div id="canvas"></div>

	
<script type="text/javascript">
	$('#inspector').tooltip({
		selector: "a[rel=tooltip]"
	}) 
</script>
<div id="placeholder" style="display:none;"></div>
