<? 
function yellowinclude($what='start'){
	$folder="yellowedit/";


	if($what=="start"){
	  
		//Added 2012 11 14
		echo '<script src="'. $folder .'js/yellowEdit-0.6.js"></script>';
		
		
		//<script type="text/javascript" src="<your installation path>/tiny_mce/tiny_mce.js"></script>
		//echo '<script src="http://yellowedit.guleinteraktiv.com/www/js/yellowEdit-0.4.js"></script>';
		
		//KSS2 defaults
		echo '<script type="text/javascript" src="js_ajax.php?time='. time() .'&modul='. $_GET["modul"] .'"></script>
		<script type="text/javascript" src="js/jsfuncs.js?time='. time() .'"></script>';
		  
		  
		echo '<script src="js/jquery-1.8.0.min.js"></script>';
		echo '<script src="js/jquery-ui-1.8.23.custom.min.js"></script>';
		echo '<script src="'. $folder .'js/raphael-2.1.0.min.js"></script>';
		echo '<script src="'. $folder .'js/jsPlumb-1.3.12-all.js"></script>';
		echo '<script src="'. $folder .'js/bootstrap.min.js"></script>';
		//echo '<script src="'. $folder .'js/jsonStringify.js"></script>';
		echo '<script src="'. $folder .'js/cycle.js"></script>';
		echo '<script src="'. $folder .'js/json2.js"></script>';
		
		echo '<script type="text/javascript" src="'. $folder .'js/swfobject.js"></script>';
		echo '<script type="text/javascript" src="'. $folder .'js/downloadify.min.js"></script>';
		echo '<script type="text/javascript" src="'. $folder .'js/colorpicker/colorpicker.js"></script>';
		echo '<script type="text/javascript" src="js/jsfuncs.js?time='. time() .'"></script>';
		
		
	}else if($what=="css"){
		echo '<link rel="stylesheet" href="'. $folder .'css/yellowEditViewer.css" />';
		//	echo '<link rel="stylesheet" media="screen" type="text/css" href="'. $folder .'css/colorpicker.css" />';
	}else if($what=="bootstrap"){
		
		echo '<link rel="stylesheet" href="sjiraff.css?when=okt2012" type="text/css" media="all" />';  
		echo '<link rel="stylesheet" href="'. $folder .'css/bootstrap.css" />';
		echo '<link rel="stylesheet" href="'. $folder .'css/bootstrap-responsive.css" />';
		echo '<link rel="stylesheet" href="'. $folder .'css/yellowEdit.css" />';
		echo '<link rel="stylesheet" media="screen" type="text/css" href="'. $folder .'css/colorpicker.css" />';  
	  
	}

} ?>