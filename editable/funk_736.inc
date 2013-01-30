<? function getflow($id){
				  $data=rsql("SELECT * FROM doc10 WHERE ID=". intval($_GET["id"]));

echo $data["flowchart"];

		} ?>