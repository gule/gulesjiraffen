<? function saveflow(){
				  //echo "->".print_r($_POST,1) ."<-";
//$data = json_decode($_POST["data"]);
//echo "-".print_r($data,1) ."-";

//echo "->". $_POST["data"] ."<-";
//$data=$_POST["data"];
//print_r($_POST['data']);

//print_r($data);
//echo mysql_real_escape_string(json_encode($data));


	

sql("UPDATE doc10 SET flowchart='". mysql_real_escape_string($_POST['data']) ."' WHERE ID=". intval($_GET["id"]));
echo json_encode("LAGRA");

		} ?>