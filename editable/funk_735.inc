<? 
	function yellowcustom($stage){
		if($stage==1){
			if($_GET["edityellow"]>0){  
				return "false";
			}else{
 				return "true";
			}
		}
		
		if($stage==2){ ?>
			<span id="yeparams" style="display:none;">     
				<span>
					<strong><?=xpr(1045)?>:</strong> 
					<textarea id="htmlContent" name="htmlContent" class="expandtxta" title="<?=xpr(1473)?> ></textarea>
					
					<span id="ywbwsel">
						<input name="textColor" type="hidden" id="textColorValue" value=""/>
						<?
						$txtcolors=array("000","999","FFF");  
						foreach($txtcolors as $tc){               
							?><a class="textColorPicker" title="<?=xpr(1051)?>" style="background-color:#<?=$tc?>"></a><?
						}?>
					</span>
				
<?
//ADDED : 18. dec 2012
?>					
				<span id="ytzsel">
					<input name="textSize" type="hidden" id="textSizeValue" value=""/><?
					$txtsizes=array("10","12","14");  ?>

					<script type="text/javascript">
						function txtzeindicator(setactive){
							<?
							foreach($txtsizes as $size){ ?>
								document.getElementById("skriftz<?=$size?>").className='';<?
							}?>

							document.getElementById("skriftz"+ setactive).className='activesize';
						}
					</script>
				<?               
					foreach($txtsizes as $size){               
  						?><a href="javascript:txtzeindicator(<?=$size?>);" class="textSizePicker<?
							if($size == 10){ echo ' activesize'; }  //Default value
						?>" title="<?=xpr(1467)?>" id="skriftz<?=$size?>" val="<?=$size?>"></a><?
					}
				?></span> 

<?
//END ADDED : 18. dec 2012
?>	

				</span>	

					<span>
						<strong><?=xpr(1046)?>:</strong> 
						<input id="containerLink" type="text" title="<?=xpr(1052)?> name="hyperlink"  />
						<a href="javascript:ajaxget('linkbrowser','containerLink','edit','adoc');" id="ye_browse" title="<?=xpr(1052)?>"></a>
					</span>
					<span>
						<a href="javascript:sh('yepalette');" id="yecolor" style="background-color:#609;" title="<?=xpr(1050)?>"><?=xpr(1047)?></a>
						<input id="colorPickerValue" type="hidden" name="colorpicker" value="" />
						<span id="yepalette" style="display:none"><?
				
						//1stLine: Bright, 2ndLine: solid, 3rd: Transparent
              					$colors=array(
				                "FFFFFF","e9dada","dae3e8","e2d7e3","e9e8da","e9e1da","d4dfd7", "break",
              					"000000","f20000","00a0fc", "c500d7", "fff600", "ff7800","00b92c","'transparent'");
                
          					foreach($colors as $c){
	    						if($c=="break"){
					        	}else{ ?><a <?
      					       			//Case: transparent
      					 			if($c=="'transparent'"){
            				  			      echo ' id="ye_transcolor"  title="Gjennomsiktig" ';
	               						}
              						 	else{ ?> title="<?=xpr(1042)?>" <?  
             					     		}
                						?> class="instantColorPicker" style="background-color:#<?=$c?>"></a><?
                					  }   
						}  ?>	
						</span>
					</span>
				  
				  
				<input type="button" id="ye_saveboxc" class="saveContainer" title="<?=xpr(1468)?>" value="<?=xpr(1048)?>" />
				  
				<span class="deleteContainer trash" title="<?=xpr(1049)?>"></span>  
			</span><?  
		}
	} 
	
?>
