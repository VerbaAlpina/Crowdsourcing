<?php
/*
 * Process Ajax calls
* Save Words in the test DB
* */

/*save word in the db*/

add_action('wp_ajax_nopriv_getUserID', 'getUserID');
add_action('wp_ajax_getUserID', 'getUserID');
function getUserID(){
	global $va_xxx;

	$user_id =  $va_xxx->get_results("SELECT Nummer FROM informanten WHERE Nummer LIKE 'anonymousCrowder_%' AND CHAR_LENGTH(Nummer) <> 30 ORDER BY CONVERT( SUBSTR(Nummer, 18) ,UNSIGNED INTEGER)  DESC");

	$id = get_object_vars($user_id[0])['Nummer'];

	$last_num =  intval(str_replace("anonymousCrowder_", "", $id)) + 1;

	$name = 'anonymousCrowder' . '_' . $last_num;

	echo json_encode($name);

	wp_die();

}

add_action('wp_ajax_nopriv_saveWord', 'saveWord');
add_action('wp_ajax_saveWord', 'saveWord');
function saveWord(){

	global $va_xxx;
	global $wpdb;

	$konzept_id  = $_REQUEST['konzept_Id'];
	$konzept  = $_REQUEST['konzept'];
	$bezeichnung = stripslashes($_REQUEST['bezeichnung']);
	$gemeinde = $_REQUEST['gemeinde'];
	$gemeinde_id = $_REQUEST['gemeinde_id'];
	$current_user = ($_REQUEST['current_user']);
	$current_language = $_REQUEST['current_language'];
	$current_dialect = stripslashes($_REQUEST['current_dialect']);
	$current_user_age = $_REQUEST['current_user_age'];

	$dialect_id_q = $va_xxx->get_results(
			$va_xxx->prepare("SELECT Id_dialect FROM dialects WHERE Name = %s", $current_dialect)
			);

	$dialect_id = get_object_vars($dialect_id_q[0])["Id_dialect"];

	if($current_language != null){
		switch ($current_language) {
			case 0:
				$choosenLanguage = 'deu';
				break;
			case 1:
				$choosenLanguage = 'fra';
				break;
			case 2:
				$choosenLanguage = 'ita';
				break;
			case 3:
				$choosenLanguage = 'slv';
				break;
			default:
				$choosenLanguage = 'deu';
				break;
		}

		$lang = $choosenLanguage;
	}else{
		$choosenLanguage = 'deu';
		$lang = $choosenLanguage;
	}

	if(is_user_logged_in()){
		$user = wp_get_current_user();
		$current_user = $user->display_name;
	}

	$informant_check_for_aeusserung = $va_xxx->get_results(
			$va_xxx->prepare("SELECT * FROM informanten WHERE Nummer = %s AND Id_Gemeinde = %d", $current_user , intval($gemeinde_id))
			);

	if($informant_check_for_aeusserung != null){

		$aeusserungCheck = $va_xxx->get_results(
				$va_xxx->prepare("SELECT * FROM aeusserungen WHERE Aeusserung = %s AND Id_Informant =  %d ",$bezeichnung, $informant_check_for_aeusserung[0]->Id_Informant)
				);

		if($aeusserungCheck != null){

			$verbindung_check = $va_xxx->get_results(
					$va_xxx->prepare("SELECT * FROM vtbl_aeusserung_konzept WHERE Id_Aeusserung = %d AND Id_Konzept =  %d ",$aeusserungCheck[0]->Id_Aeusserung, $konzept_id)
					);

			if($verbindung_check != null){
				exit();
				wp_die();
			}

		}

	}

	/**
	 * Geodata of the Informant, Center of Location.
	 *
	 */
	$geoData = $va_xxx->get_results(
			$va_xxx->prepare("SELECT Centroid(Geodaten), Alpenkonvention FROM Orte WHERE Id_Ort = %d",  intval($gemeinde_id))
			);

	$arrayG = get_object_vars($geoData[0]);

	if(is_user_logged_in()){
		/**
		 * Case when user is logged in.
		 * Still need to check for the id_informant of the user in the current location.
		 */

		$currentUser = wp_get_current_user();
		$id_informant = null;


		$informantCheck = $va_xxx->get_results(
				$va_xxx->prepare("SELECT * FROM informanten WHERE Nummer = %s AND Id_Gemeinde = %d LIMIT 1", $currentUser->display_name , intval($gemeinde_id))
				);

		if($informantCheck == null){

			/**
			 * create new informant for the current location, when no information about informant is found
			 * 
			 */
			
			$arrayInformant = array(
					'Erhebung' => 'Crowd',
					'Nummer' => $currentUser->display_name, // Name der Informant
					'Ortsname' => $gemeinde,
					'Id_Gemeinde' => intval($gemeinde_id),
					'Georeferenz' =>$arrayG["Centroid(Geodaten)"],
					'Alpenkonvention' => $arrayG["Alpenkonvention"],
					'Alter_Informant' => $current_user_age
			);
			$va_xxx->insert(
					'informanten',
					$arrayInformant
					);

			$id_informant = $va_xxx->insert_id;

		}elseif (intval($gemeinde_id) != intval(array_values($informantCheck)[0]->Id_Gemeinde)) {

			/**
			 * Creates new informant for the new location, when user exists as informant but for a different location.
			 * 
			 */
			
			$arrayInformant = array(
					'Erhebung' => 'Crowd',
					'Nummer' => $currentUser->display_name, // Name der Informant
					'Ortsname' => $gemeinde,
					'Id_Gemeinde' => intval($gemeinde_id),
					'Georeferenz' =>$arrayG["Centroid(Geodaten)"],
					'Alpenkonvention' => $arrayG["Alpenkonvention"],
					'Alter_Informant' => $current_user_age
			);

			$va_xxx->insert(
					'informanten',
					$arrayInformant
					);

			$id_informant = $va_xxx->insert_id;

		}else{
			/**
			 * Gets id when informant exists for the current location.
			 * 
			 */
			
			$id_informant = array_values($informantCheck)[0]->Id_Informant;
		}

		/**
		 * Checks if stimulus {konzept_lang} and Stimulus Term match and returns ID_Stimulus.
		 * If stimulus is not found a new one is created and its id is returned.
		 * @var string
		 */
		$current_stimulus_id = check_stimuli($konzept_id,$choosenLanguage,$konzept)['current_stimulus_id'];

		//Tabelle aeusserungen
		$arrayAeusserung = array(
				'Id_Stimulus' => $current_stimulus_id,
				'Id_Informant' => $id_informant,
				'Aeusserung' => $bezeichnung,
				'Bemerkung' => '',
				'Erfasst_Von' => $currentUser->display_name,
				'Portalsprache' => $lang,
				'Id_dialekt' => $dialect_id
		);

		$va_xxx->insert(
					'aeusserungen',
					$arrayAeusserung
				);
		//END Tabelle aeusserungen

		$id_auesserung = $va_xxx->insert_id;

		//Tabelle  vtbl_aeusserung_konzept
		$arrayVerknuepfung = array(
				'Id_Aeusserung' => $va_xxx->insert_id,
				'Id_Konzept' => intval($konzept_id)
			);

		$va_xxx->insert(
					'vtbl_aeusserung_konzept',
					$arrayVerknuepfung
				);
	}else{
		/**
		 * Case when user is not logged in.
		 * Still need to check for the id_informant of the not logged in, anonimous, user in the current location.
		 */
		
		$anonymousCrowder_name =  $current_user;

		/**
	 	* Checks if stimulus {konzept_lang} and Stimulus Term match and returns ID_Stimulus.
	 	* If stimulus is not found a new one is created and its id is returned.
	 	* @var string
	 	*/
		$current_stimulus_id = check_stimuli($konzept_id,$choosenLanguage,$konzept)['current_stimulus_id'];


		$informantCheck = $va_xxx->get_results(
	 		$va_xxx->prepare("SELECT * FROM informanten WHERE Nummer = %s AND  Id_Gemeinde = %d LIMIT 1", $anonymousCrowder_name , intval($gemeinde_id) )
	 		);

		if($informantCheck == null){
		 	
		 	/**
		 	 * Case Anonymous user is not an informant.
		 	 * Need to create new Informant.
		 	 */
		 	
			$arrayInformant = array(
					'Erhebung' => 'Crowd',
					'Nummer' => $current_user, // Name der Informant 'anonymousCrowder' . '_' .
					'Ortsname' => $gemeinde,
					'Id_Gemeinde' => intval($gemeinde_id),
					'Georeferenz' =>$arrayG["Centroid(Geodaten)"],
					'Alpenkonvention'=>$arrayG["Alpenkonvention"],
					'Alter_Informant' => $current_user_age
			);
			$va_xxx->insert(
					'informanten',
					$arrayInformant
					);

			//Aeusserung
			$arrayAeusserung = array(
					'Id_Stimulus' => $current_stimulus_id,
					'Id_Informant' => $va_xxx->insert_id,
					'Aeusserung' => $bezeichnung,
					'Bemerkung' => '',
					'Erfasst_Von' => $current_user,
					'Portalsprache' => $lang,
		 			'Id_dialekt' => $dialect_id
			);

			$va_xxx->insert(
					'aeusserungen',
					$arrayAeusserung
					);

			//Verknuepfung
			$id_auesserung = $va_xxx->insert_id;
			$arrayVerknuepfung = array(
					'Id_Aeusserung' => $va_xxx->insert_id,
					'Id_Konzept' => intval($konzept_id)
			);

			$va_xxx->insert(
					'vtbl_aeusserung_konzept',
					$arrayVerknuepfung
					);
		 }else{

		 	/**
		 	 * Anonymous crowder is a informant -> use existing id of the anonymous crowder.
		 	 * Informant Exists, using his existing Id_Informant.
		 	 */
		 	
		 	$id_informant = array_values($informantCheck)[0]->Id_Informant;

		 	//Aeusserung
		 	$arrayAeusserung = array(
		 			'Id_Stimulus' => $current_stimulus_id,
		 			'Id_Informant' => $id_informant,
		 			'Aeusserung' => $bezeichnung,
		 			'Bemerkung' => '',
		 			'Erfasst_Von' => $anonymousCrowder_name,
		 			'Portalsprache' => $lang,
		 			'Id_dialekt' => $dialect_id
				);

		 	$va_xxx->insert(
		 			'aeusserungen',
		 			$arrayAeusserung
		 			);

		 	//Verknuepfung
		 	$id_auesserung = $va_xxx->insert_id;
		 	$arrayVerknuepfung = array(
		 			'Id_Aeusserung' => $va_xxx->insert_id,
		 			'Id_Konzept' => intval($konzept_id)
		 	);

		 	$va_xxx->insert(
		 			'vtbl_aeusserung_konzept',
		 			$arrayVerknuepfung
		 			);

		 }
	}


	echo json_encode($id_auesserung);

	wp_die();
}

function check_stimuli($concept_id, $lang, $cur_concept_name){
	global $va_xxx;

	$karte = $concept_id . "_" . $lang;

	$cur_stimuli_check = $va_xxx->get_results(
	 		$va_xxx->prepare("SELECT * FROM `stimuli` WHERE Erhebung = 'CROWD' AND Karte = %s AND Stimulus = %s", $karte, $cur_concept_name )
	 		);

	if(count($cur_stimuli_check) > 0){
		$cur_stimulus = get_object_vars($cur_stimuli_check[0]);	
	}else{
		$cur_stimulus = null;
	}
	

	// check if stimulis with same concept, language and concept_title exists
	if($cur_stimulus != null){
		$stimulus_exists = true;
		$current_stimulus_id = $cur_stimulus['ID_Stimulus'];
	}else{
		// if no stimulus exists check for existing stimuli with concept_lang
		$stimulus_exists = false;
		
		$stimuli_check = $va_xxx->get_results(
	 		$va_xxx->prepare("SELECT * FROM `stimuli` WHERE Erhebung = 'CROWD' AND Karte = %s", $karte )
	 		);

		$current_number = 0;
		$stimuli = [];
		$create_new_stimuli = false;
	
		foreach ($stimuli_check as $stimulus) {
			if($current_number < $stimulus->Nummer){
				$current_number = $stimulus->Nummer;
			}
		}
		
		
		$array_inseting_stimulus = array(
	 			'Erhebung' => 'CROWD',
	 			'Nummer' => $current_number + 1,
	 			'Karte' => $karte,
	 			'Stimulus' => $cur_concept_name
	 	);

	 	$va_xxx->insert(
	 			'stimuli',
	 			$array_inseting_stimulus
	 			);

	 	$current_stimulus_id = $va_xxx->insert_id;
	
		
	}

	$stimuli_data = array(
							"stimulus_exists" => $stimulus_exists,
							"current_stimulus_id" => $current_stimulus_id
								);


	return $stimuli_data;
}


add_action('wp_ajax_nopriv_updateAuesserung', 'updateAuesserung');
add_action('wp_ajax_updateAuesserung', 'updateAuesserung');
function updateAuesserung(){
	global $va_xxx;

	$id_aeusserung = intval(stripslashes($_REQUEST['id_auesserung']));
	$new_auesserung = stripslashes($_REQUEST['new_auesserung']);

	$va_xxx->update('aeusserungen',array('Aeusserung' => $new_auesserung ), array('Id_Aeusserung' =>$id_aeusserung ) );

	echo json_encode("Updated Aeusserung!");
	echo json_encode($id_aeusserung);
	echo json_encode($new_auesserung);


	wp_die();
}

add_action('wp_ajax_nopriv_upate_dialect_submited_answer', 'upate_dialect_submited_answer');
add_action('wp_ajax_upate_dialect_submited_answer', 'upate_dialect_submited_answer');
function upate_dialect_submited_answer(){
	global $va_xxx;

	$id_aeusserung = intval($_REQUEST['id_aeusserung']);
	$new_dialect = intval($_REQUEST['dialect']);
    $new_dialect_id = intval($_REQUEST['id_dialect']);

	/*$dialect_id_q = $va_xxx->get_results(
			$va_xxx->prepare("SELECT Id_dialect FROM dialects WHERE Name = %s", $new_dialect)
			);

	$new_dialect_id = get_object_vars($dialect_id_q[0])["Id_dialect"];*/

	$va_xxx->update('aeusserungen',array('Id_dialekt' => $new_dialect_id), array('Id_Aeusserung' =>$id_aeusserung ));

	echo json_encode("Updated Aeusserung! New Dialect");
	wp_die();
}

/*function updateMissingInformation(){
 global $va_xxx;

 $informantenCheck = $va_xxx->get_results("SELECT * FROM informanten Where Erhebung = 'Crowd' ");

 foreach ($informantenCheck as $value) {
 $id_gemeinde = $value->Id_Gemeinde;
 $id_informant = $value->Id_Informant;
 $ortsname = $value->Ortsname;

 if($id_gemeinde == null){
 $id_geo_row = $va_xxx->get_row("SELECT Id_Geo FROM z_geo Where Name = '$ortsname' AND Id_Category = 62 AND Alpine_Convention = 1 LIMIT 1");
 $id_geo = $id_geo_row->Id_Geo;
 $va_xxx->update('informanten',array('Id_Gemeinde' => $id_geo ), array('Id_Informant' =>$id_informant, 'Erhebung' => 'Crowd') );
 }

 }
 }*/

add_action('wp_ajax_nopriv_deleteAuesserung', 'deleteAuesserung');
add_action('wp_ajax_deleteAuesserung', 'deleteAuesserung');
function deleteAuesserung(){

	global $va_xxx;
	global $cookies_enabled;

	$id_aeusserung = intval(stripslashes($_REQUEST['id_auesserung']));
	$gemeinde_id = intval(stripslashes( $_REQUEST['gemeinde_id'] ));
	$current_user = $_REQUEST['current_user'];
	//$va_xxx -> show_errors();

	$informant_deleted = false;

	/*if(isset($_COOKIE["crowder_id"])){
		$crowder_id = $_COOKIE["crowder_id"];
		}*/



	if(is_user_logged_in()){
		$author = wp_get_current_user()->display_name;
	}else if(isset($_COOKIE["crowder_id"])){
		$author = $_COOKIE["crowder_id"];
	}else{
		$author = $current_user;
	}

	$id_informant_q =  $va_xxx->get_results($va_xxx->prepare("SELECT * FROM aeusserungen WHERE Id_Aeusserung = %d",$id_aeusserung));
	$id_informant = $id_informant_q[0]->Id_Informant;

	//$va_xxx->get_results("SELECT Id_Informant FROM aeusserungen WHERE Id_Aeusserung = $id_aeusserung");

	$va_xxx->delete('vtbl_aeusserung_konzept',array('Id_Aeusserung' => $id_aeusserung ));

	$va_xxx->delete('aeusserungen',array('Id_Aeusserung' => $id_aeusserung ));


	if(!empty($author) || is_user_logged_in() ){

		//if( !(current_user_can('administrator') || is_admin())){
		//$informantCheck = $va_xxx->get_results("SELECT * FROM informanten WHERE Nummer = '$author' AND Id_Gemeinde = $gemeinde_id");
		//$va_xxx -> print_error();

		//$informantCheck = $va_xxx->get_results($va_xxx->prepare("SELECT * FROM informanten WHERE Nummer = %s AND Id_Gemeinde = %d ",$author,$gemeinde_id));

		//$va_xxx -> print_error();

		//$informant_id_obj = get_object_vars($informantCheck[0]);
		//$informant_id =  $informant_id_obj['Id_Informant'];

		$aeusserungen_q = $va_xxx->get_results("SELECT Id_Aeusserung FROM aeusserungen WHERE Id_Informant = $id_informant");

		if(empty(array_filter($aeusserungen_q))){
			$va_xxx->delete('informanten',array('Id_Informant' => $id_informant));
			$informant_deleted = true;
		}
		//}

	}
	//$va_xxx -> print_error();
	echo json_encode($informant_deleted);

	wp_die();
}








add_action('wp_ajax_nopriv_getChoosenGemeinde', 'returnGeoDatenChoosenGemeinde');
add_action('wp_ajax_getChoosenGemeinde', 'returnGeoDatenChoosenGemeinde');
function returnGeoDatenChoosenGemeinde(){
	global $va_xxx;
	$name = $_REQUEST['searchedGemeinde'];
	$concept =  $_REQUEST['concept'];
	$bezeichnung =  $_REQUEST['bezeichnung'];
	$location_id = $_REQUEST['location_id'];
	$concept_id = $_REQUEST['concept_id'];

	$geoData = $va_xxx->get_results(
			$va_xxx->prepare("SELECT Name, AsText(Geodaten) , ST_AsText(ST_Centroid(Geodaten)) FROM Orte WHERE id_ort=%d LIMIT 1", $location_id)
			);

	$object = get_object_vars($geoData[0]);

	$array = array(
			"type" => "choosenRegion",
			"name" =>$name, //$object['Name'],
			"polygonCoordinates" => $object['AsText(Geodaten)'] ,
		 "centerCoordinates" => $object['ST_AsText(ST_Centroid(Geodaten))'],
		 "concept" => $concept,
		 "concept_id" => $concept_id,
		 "bezeichnung" => $bezeichnung,
		 "location_id" => $location_id
	);
	//echo "check";
	//echo $object['AsText(Geo_Data)'];
	echo json_encode($array);
	wp_die();
}

/*choosing gemeinde get polygon*/
add_action('wp_ajax_nopriv_getPolygonGemeinde', 'returnPolygonGemeinde');
add_action('wp_ajax_getPolygonGemeinde', 'returnPolygonGemeinde');
function returnPolygonGemeinde(){
	global $va_xxx;
	$name = $_REQUEST['searchedGemeinde'];

	$location_id = $_REQUEST['location_id'];

	/*$geoData = $va_xxx->get_results(
			$va_xxx->prepare("SELECT Name, AsText(Geodaten) , ST_AsText(ST_Centroid(Geodaten)) FROM Orte WHERE id_ort=%d LIMIT 1", $location_id)
			);*/

	/*Get simplified gemeinde polygon*/
	$geoData = $va_xxx->get_results(
				$va_xxx->prepare("SELECT  AsText(Geodaten) , ST_AsText(ST_Centroid(Geodaten)) as center  FROM polygone_vereinfacht WHERE id_ort=%d AND epsilon=0.0006 LIMIT 1", $location_id)
				); // AsText(ST_Centroid(ST_GeometryN((Geodaten),1)))        ST_AsText(ST_Centroid(Geodaten))   if(AsText(Geodaten) LIKE 'Poly%', AsText(ST_Centroid(Geodaten)) ,AsText(ST_Centroid(ST_GeometryN((Geodaten),1))) )

	$object = get_object_vars($geoData[0]);

	$array = array(
			"type" => "gemeinde_coordinates",
			"name" =>$name, //$object['Name'],
			"polygonCoordinates" => $object['AsText(Geodaten)'],
		 "centerCoordinates" => $object['center'],
		 "location_id" => $location_id
	);


	echo json_encode($array);
	wp_die();
}


add_action('wp_ajax_nopriv_getBordersGeoData', 'returnGeoData');
add_action('wp_ajax_getBordersGeoData', 'returnGeoData');
function returnGeoData(){
	global $va_xxx;

	//add_query_arg( 'poly', 'lang','dialect');

	$query_params = parse_url($_SERVER['HTTP_REFERER']);
	$params =  $query_params['query'];
	$arr = [];
	$arr_params = parse_str($params,$arr);

	//$geo = $va_xxx->get_results("SELECT AsText(Geodaten) FROM Orte WHERE Id_Ort = 1 LIMIT 1");
	if (isset($arr['poly'])) {
	    $poly_id =  $arr['poly'];

	    $geo = $va_xxx->get_results($va_xxx->prepare("SELECT AsText(Geodaten) , ST_AsText(ST_Centroid(Geodaten)) as center FROM polygone_vereinfacht WHERE Id_Ort = %d LIMIT 1" ,  $poly_id));
	    if(!$geo){
	    	$geo = $va_xxx->get_results($va_xxx->prepare("SELECT AsText(Geodaten) , ST_AsText(ST_Centroid(Geodaten)) as center FROM orte WHERE Id_Ort = %d LIMIT 1" ,  $poly_id));
	    }
	    // $geo = $va_xxx->get_results($va_xxx->prepare("SELECT AsText(Geodaten) , ST_AsText(ST_Centroid(Geodaten)) as center FROM orte WHERE Id_Ort = %d LIMIT 1" ,  $poly_id));
	} else {
	     $poly_id = 1;
	     $geo = $va_xxx->get_results($va_xxx->prepare("SELECT AsText(Geodaten) , ST_AsText(ST_Centroid(Geodaten)) as center FROM polygone_vereinfacht WHERE Id_Ort = %d AND Epsilon LIKE 0.0060 LIMIT 1" ,  $poly_id));
	}

	//$geo = $va_xxx->get_results($va_xxx->prepare("SELECT AsText(Geodaten) FROM polygone_vereinfacht WHERE Id_Ort = %d AND Epsilon LIKE 0.0060 LIMIT 1" ,  $poly_id));

	$object = get_object_vars($geo[0]);

	echo json_encode(array("polygon" => $object['AsText(Geodaten)'], "center" => $object['center'] ));

	wp_die();
}


add_action('wp_ajax_nopriv_getConceptCount', 'returnConceptCount');
add_action('wp_ajax_getConceptCount', 'returnConceptCount');
function returnConceptCount(){
	global $va_xxx;

	$numberBasiskonzept = $va_xxx->get_results("SELECT COUNT(Id_Konzept) FROM konzepte WHERE Basiskonzept = 1 AND Relevanz = 1");

	echo json_encode(intval(get_object_vars($numberBasiskonzept[0])['COUNT(Id_Konzept)']));
	wp_die();
}



add_action('wp_ajax_nopriv_getKonzepte', 'returnKonzepte');
add_action('wp_ajax_getKonzepte', 'returnKonzepte');
function returnKonzepte(){
	global $va_xxx;

	$lang = get_language_crowder();
	$cur_lang = $_REQUEST['lang'];

	if($cur_lang != null){
		switch ($cur_lang) {
			case 0:
				$choosenLanguage = 'D';
				break;
			case 1:
				$choosenLanguage = 'F';
				break;
			case 2:
				$choosenLanguage = 'I';
				break;
			case 3:
				$choosenLanguage = 'S';
				break;
			default:
				$choosenLanguage = 'D';
				break;
		}

		$lang = $choosenLanguage;
	}

	$beschreibung_konzept = 'Beschreibung_' . $lang;
	$name_konzept = 'Name_' . $lang;


	$arrayConcepts = [];
	$arrayConceptsNature = [];

	/*$numberBasiskonzept = $va_xxx->get_results("SELECT COUNT(Id_Konzept) FROM konzepte WHERE Basiskonzept = 1 AND Relevanz = 1");*/
	/*$konzepte = $va_xxx->get_results("SELECT Id_Konzept,$name_konzept, $beschreibung_konzept FROM konzepte WHERE Relevanz = 1 ORDER BY Basiskonzept DESC");*/
	//$konzepte = $va_xxx->get_results("SELECT Id_Konzept,$name_konzept, $beschreibung_konzept FROM konzepte");
	/*	$konzepte = $va_xxx->get_results("SELECT Id_Konzept, IF($name_konzept = '', $beschreibung_konzept, $name_konzept) AS Konzept
	 FROM Konzepte LEFT JOIN a_konzept_tiefen a USING (Id_Konzept)
	 WHERE Relevanz
	 ORDER BY Basiskonzept DESC, IF(Basiskonzept, Konzept, IF(Tiefe IS NULL, 99, Tiefe)) ASC, Konzept ASC");*/

	/*$konzepte = $va_xxx->get_results("SELECT Id_Konzept, IF($name_konzept = '', $beschreibung_konzept, $name_konzept) AS Konzept
			FROM Konzepte LEFT JOIN a_konzept_tiefen a USING (Id_Konzept)
			WHERE (Relevanz ) AND $beschreibung_konzept > ' '
			ORDER BY Basiskonzept DESC, IF(Basiskonzept, Konzept, IF(Tiefe IS NULL, 99, Tiefe)) ASC, Konzept ASC");*/

//Select Id_Konzept,IF(Name_D = '', Beschreibung_D, Name_D) AS Konzept from konzepte LEFT JOIN a_konzept_tiefen a USING (Id_Konzept) where exists (select vtbl_aeusserung_konzept.Id_Aeusserung from vtbl_aeusserung_konzept where konzepte.Id_Konzept = vtbl_aeusserung_konzept.Id_Konzept) OR Relevanz  AND Beschreibung_D > ' ' ORDER BY Basiskonzept DESC, IF(Basiskonzept, Konzept, IF(Tiefe IS NULL, 99, Tiefe)) ASC, Konzept ASC
$konzepte = $va_xxx->get_results("Select Id_Konzept,IF($name_konzept = '', $beschreibung_konzept, $name_konzept) AS Konzept, va_phase, QID from konzepte LEFT JOIN a_konzept_tiefen a USING (Id_Konzept) where exists (select vtbl_aeusserung_konzept.Id_Aeusserung from vtbl_aeusserung_konzept where konzepte.Id_Konzept = vtbl_aeusserung_konzept.Id_Konzept AND ( $beschreibung_konzept != '' OR $name_konzept != '') ) OR Relevanz  AND ( $beschreibung_konzept != '' OR $name_konzept != '') ORDER BY Basiskonzept DESC, IF(Basiskonzept, Konzept, IF(Tiefe IS NULL, 99, Tiefe)) ASC, Konzept ASC");

	foreach ($konzepte as $value) {

		$name = $value->Konzept;

		if($value->va_phase == ""){
			$va_phase = 1;
		}else{
			$va_phase = $value->va_phase;
		}

		$id_name_konzept = array(
				"id" => $value->Id_Konzept,
				"name" => $name,
				"va_phase" => $va_phase,
				"qid" => $value->QID
				/*"description" => $beschreibung*/
		);
		array_push($arrayConcepts,$id_name_konzept);
	}

	/*$konzepte_nature = $va_xxx->get_results("Select Id_Konzept,IF($name_konzept = '', $beschreibung_konzept, $name_konzept) AS Konzept from konzepte LEFT JOIN a_konzept_tiefen a USING (Id_Konzept) where exists (select vtbl_aeusserung_konzept.Id_Aeusserung from vtbl_aeusserung_konzept where konzepte.Id_Konzept = vtbl_aeusserung_konzept.Id_Konzept) OR Relevanz  AND $beschreibung_konzept > ' ' ORDER BY Basiskonzept DESC, IF(Basiskonzept, Konzept, IF(Tiefe IS NULL, 99, Tiefe)) DESC, Konzept DESC");

	foreach ($konzepte_nature as $value) {

		$name = $value->Konzept;

		$id_name_konzept = array(
				"id" => $value->Id_Konzept,
				"name" => $name,
				"va_phase" => 2

		);
		array_push($arrayConcepts,$id_name_konzept);
	}*/


	echo  json_encode($arrayConcepts); // ['alm' => $arrayConcepts, 'nature' => $arrayConceptsNature]
	wp_die();
}

add_action('wp_ajax_nopriv_getlocations', 'returnOrte');
add_action('wp_ajax_getlocations', 'returnOrte');
function returnOrte(){
	global $va_xxx;


	$query_params = parse_url($_SERVER['HTTP_REFERER']);
	$params =  $query_params['query'];
	$arr = [];
	$arr_params = parse_str($params,$arr);

	$lang = get_language_crowder();
	$cur_lang =  $_REQUEST['lang'];

	if($cur_lang != null){
		switch ($cur_lang) {
			case 0:
				$choosenLanguage = 'D';
				break;
			case 1:
				$choosenLanguage = 'F';
				break;
			case 2:
				$choosenLanguage = 'I';
				break;
			case 3:
				$choosenLanguage = 'S';
				break;
			default:
				$choosenLanguage = 'D';
				break;
		}

		$lang = $choosenLanguage;
	}

	/*$orte_right_names = $va_xxx->get_results("select * from
	 (
	 select b.Id_Ort, b.Name from orte a join orte b on a.Name like 'Bolzano' and a.Beschreibung like 'provincia' and st_within(b.Mittelpunkt, a.Geodaten)
	 ) sq1
	 left join
	 orte_uebersetzungen sq2 on sq1.id_ort = sq2.Id_Ort");*/

	$arrayOrte = array();

	/*$orte = $va_xxx->get_results("

			SELECT z.Id_Ort, IFNULL(ub.Name, z.Name) AS Name , ub.Sprache FROM Orte z left join orte_uebersetzungen ub ON ub.Id_Ort = z.Id_Ort AND ub.Sprache = '$lang' WHERE z.Id_Kategorie = 62 AND z.Alpenkonvention AND z.Beschreibung != 'Water Body' AND z.Name !='' ORDER BY IFNULL(ub.Name, z.Name) ASC
			");*/
	if (isset($arr['poly'])) {
		$orte = $va_xxx->get_results($va_xxx->prepare("
			SELECT z.Id_Ort, IFNULL(ub.Name, z.Name) AS Name , ub.Sprache FROM Orte z 
			JOIN A_Orte_Hierarchien_Erweitert USING (Id_Ort) 
			left join orte_uebersetzungen ub ON ub.Id_Ort = z.Id_Ort AND ub.Sprache = %s 
			WHERE z.Id_Kategorie = 62 
			AND id_ueberort = %d 
			AND z.Beschreibung != 'Water Body' 
			AND z.Name !='' 
			ORDER BY Name ASC
			",$lang,$arr['poly']));
	}else{

	/*Fills the array with the locations from the alpine convention AND the location outside of the alpine convention, that the users have entered answers*/
		$orte = $va_xxx->get_results("
			SELECT z.Id_Ort, IFNULL(ub.Name, z.Name) AS Name , ub.Sprache FROM Orte z 
			left join orte_uebersetzungen ub ON ub.Id_Ort = z.Id_Ort AND ub.Sprache = 'D' 
			WHERE z.Id_Kategorie = 62 AND z.Alpenkonvention AND z.Beschreibung != 'Water Body' AND z.Name !='' 
			ORDER BY Name ASC
			
		/*	UNION SELECT Distinct z.Id_Ort, IFNULL(ub.Name, z.Name) AS Name , ub.Sprache FROM informanten i 
			left join aeusserungen a on i.Id_Informant = a.Id_Informant 
			left join orte z on z.Id_Ort = i.Id_Gemeinde 
			left join orte_uebersetzungen ub ON ub.Id_Ort = z.Id_Ort AND ub.Sprache = '$lang'
			left join stimuli s on a.Id_Stimulus = s.ID_Stimulus WHERE s.Erhebung = 'CROWD'
			AND z.Id_Kategorie = 62 AND z.Beschreibung != 'Water Body' AND z.Name !='' ORDER BY Name ASC*/

			");
	}


	foreach ($orte as $ort) {
		$name = $ort->Name;
		$id_geo = $ort->Id_Ort;

		$array_name_id = array(
				"id" => $id_geo,
				"name" => $name/*,
				"lang" => $lang*/
		);
		array_push($arrayOrte,$array_name_id);
	}

	echo json_encode($arrayOrte);

	wp_die();
}


add_action('wp_ajax_nopriv_getHighScores', 'returnHighScores');
add_action('wp_ajax_getHighScores', 'returnHighScores');

function returnHighScores(){

	$query_params = parse_url($_SERVER['HTTP_REFERER']);
	$params =  $query_params['query'];
	$arr = [];
	$arr_params = parse_str($params,$arr);

	$lang = get_language_crowder();
	$cur_lang = $_REQUEST['lang'];
	$num_of_items = $_REQUEST['num'];

	if($cur_lang != null){
		switch ($cur_lang) {
			case 0:
				$choosenLanguage = 'D';
				break;
			case 1:
				$choosenLanguage = 'F';
				break;
			case 2:
				$choosenLanguage = 'I';
				break;
			case 3:
				$choosenLanguage = 'S';
				break;
			default:
				$choosenLanguage = 'D';
				break;
		}

		$lang = $choosenLanguage;
	}

	$beschreibung_konzept = 'Beschreibung_' . $lang;
	$name_konzept = 'Name_' . $lang;

	global $va_xxx;


	if(isset($arr['poly'])){
	$top_users = $va_xxx->get_results($va_xxx->prepare(
			"SELECT Informanten.Nummer as Nummer, count(*)
			FROM Informanten  Join a_orte_hierarchien_erweitert erw on informanten.Id_Gemeinde = erw.id_ort 
			JOIN Aeusserungen USING (Id_Informant)
			left join stimuli s on Aeusserungen.Id_Stimulus = s.ID_Stimulus 
            WHERE s.Erhebung = 'CROWD' AND Informanten.Nummer NOT LIKE 'anonymousCrowder%' AND erw.id_ueberort = %d
			GROUP BY Informanten.Nummer
			ORDER BY count(*) DESC
			LIMIT $num_of_items;",$arr['poly']),ARRAY_N
			);
	}else{
		$top_users = $va_xxx->get_results(
			"SELECT Informanten.Nummer as Nummer, count(*)
			FROM Informanten JOIN Aeusserungen USING (Id_Informant)
			left join stimuli s on Aeusserungen.Id_Stimulus = s.ID_Stimulus 
            WHERE s.Erhebung = 'CROWD' AND Informanten.Nummer NOT LIKE 'anonymousCrowder%'
			GROUP BY Informanten.Nummer
			ORDER BY count(*) DESC
			LIMIT $num_of_items;",ARRAY_N
			);
	}

	if(isset($arr['poly'])){
		$top_concepts = $va_xxx->get_results($va_xxx->prepare(
			"SELECT IF($name_konzept != '', $name_konzept, $beschreibung_konzept), count(*),Aeusserungen.Id_Stimulus, Id_Konzept
			FROM Konzepte JOIN VTBL_Aeusserung_Konzept USING (Id_Konzept) JOIN
			Aeusserungen USING (Id_Aeusserung)
			JOIN informanten USING (Id_Informant)
            JOIN a_orte_hierarchien_erweitert erw ON informanten.Id_Gemeinde = erw.id_ort
            left join stimuli s on Aeusserungen.Id_Stimulus = s.ID_Stimulus 
            WHERE s.Erhebung = 'CROWD' AND erw.id_ueberort = %d
			GROUP BY Id_Konzept
			ORDER BY count(*) DESC
			LIMIT $num_of_items;
			",$arr['poly']),ARRAY_N
			);
	}else{
		$top_concepts = $va_xxx->get_results(
			"SELECT IF($name_konzept != '', $name_konzept, $beschreibung_konzept), count(*),Aeusserungen.Id_Stimulus, Id_Konzept
			FROM Konzepte JOIN VTBL_Aeusserung_Konzept USING (Id_Konzept) JOIN
			Aeusserungen USING (Id_Aeusserung)
			left join stimuli s on Aeusserungen.Id_Stimulus = s.ID_Stimulus 
            WHERE s.Erhebung = 'CROWD'
			GROUP BY Id_Konzept
			ORDER BY count(*) DESC
			LIMIT $num_of_items;
			",ARRAY_N
			);
	}

	if(isset($arr['poly'])){


$top_locations = $va_xxx->get_results($va_xxx->prepare(

			"SELECT Ortsname, count(Id_Gemeinde), Id_Gemeinde
			FROM Informanten JOIN a_orte_hierarchien_erweitert erw ON informanten.Id_Gemeinde = erw.id_ort JOIN Aeusserungen USING (Id_Informant)
			left join stimuli s on Aeusserungen.Id_Stimulus = s.ID_Stimulus 
            WHERE s.Erhebung = 'CROWD' AND erw.id_ueberort = %d
			GROUP BY Id_Gemeinde
			ORDER BY count(Id_Gemeinde) DESC
			LIMIT $num_of_items;",$arr['poly']),ARRAY_N

			);
	}else{

		$top_locations = $va_xxx->get_results(

			"SELECT Ortsname, count(Id_Gemeinde), Id_Gemeinde
			FROM Informanten JOIN Aeusserungen USING (Id_Informant)
			left join stimuli s on Aeusserungen.Id_Stimulus = s.ID_Stimulus 
            WHERE s.Erhebung = 'CROWD'
			GROUP BY Id_Gemeinde
			ORDER BY count(Id_Gemeinde) DESC
			LIMIT $num_of_items;",ARRAY_N

			);
	}


	$result = array();
	$result['top_concepts'] = $top_concepts;
	$result['top_users'] = $top_users;
	$result['top_locations'] = $top_locations;

	echo json_encode($result);
	wp_die();
}


add_action('wp_ajax_nopriv_getAuesserungen_geoData', 'returnAuesserungenGeoData');
add_action('wp_ajax_getAuesserungen_geoData', 'returnAuesserungenGeoData');
function returnAuesserungenGeoData(){
	global $va_xxx;

	if(is_user_logged_in()){

		$crowder_name = wp_get_current_user()->display_name;

	}else{

		if(isset($_COOKIE["crowder_id"])){
			/*HIER IF*/
			if(substr_compare('anonymousCrowder',$_COOKIE["crowder_id"],0,15) == 0){
				$crowder_id = $_COOKIE["crowder_id"];
			}else{
				$crowder_id = null;
				setcookie("crowder_id", "", time()-3600);
			}
			//$crowder_id = $_COOKIE["crowder_id"];
		}else{
			$crowder_id = "";
		}

		$crowder_name = $crowder_id;
	}

	$cur_lang = $_REQUEST['lang'];

	if($cur_lang != null){
		switch ($cur_lang) {
			case 0:
				$choosenLanguage = 'D';
				break;
			case 1:
				$choosenLanguage = 'F';
				break;
			case 2:
				$choosenLanguage = 'I';
				break;
			case 3:
				$choosenLanguage = 'S';
				break;
			default:
				$choosenLanguage = 'D';
				break;
		}

		$lang = $choosenLanguage;
	}

	$beschreibung_konzept = 'Beschreibung_' . $lang;
	$name_konzept = 'Name_' . $lang;

	$aeusserungenLocations = $va_xxx->get_results("SELECT  AsText(Georeferenz),  i.Id_Gemeinde, IF(i.Nummer = '$crowder_name', true, false) As userCheck FROM aeusserungen a
			inner join informanten i on i.Id_Informant = a.Id_Informant
			where i.Erhebung = 'Crowd' ORDER BY userCheck ASC") ;  /* */

	foreach ($aeusserungenLocations as $value) {

		$id_location = $value->Id_Gemeinde;
		$geo_point = get_object_vars($value)["AsText(Georeferenz)"];
		$userCheck = $value->userCheck;

		$arrayUserCheck = array(
				'location_id' => $id_location,
				'geo' => $geo_point,
				'userCheck' => $userCheck
		);

		$array_locationID_point_pair[$id_location] = $arrayUserCheck;
	}


	$aeusserungen_daten = array();
	$count_data = array();

	$aeusserungen = $va_xxx->get_results("SELECT a.Id_Aeusserung,  a.Aeusserung , IF($name_konzept = '', $beschreibung_konzept, $name_konzept) AS Konzept , k.Id_Konzept, i.Id_Gemeinde, Erfasst_Von, Ortsname, Gesperrt	FROM aeusserungen a
			left join informanten i on i.Id_Informant = a.Id_Informant
			left join vtbl_aeusserung_konzept v on v.Id_Aeusserung = a.Id_Aeusserung
			left join konzepte k on k.Id_Konzept = v.Id_Konzept
			where i.Erhebung = 'Crowd' AND  $beschreibung_konzept > ' ' ") ;

	foreach ($aeusserungen as $value) {
		$author = $value->Erfasst_Von;
		$id_aeusserung = $value->Id_Aeusserung;
		$name = $value->Aeusserung;
		$id_geo = $value->Id_Gemeinde;
		$ortsname = $value->Ortsname;
		$konzept = $value->Konzept;
		$id_concept = $value->Id_Konzept;
		$tokenisiert = $value->Gesperrt;

		$aeusserung_daten = array(
				"type" => "auesserungen",
				"id_aeusserung" => $id_aeusserung,
				"author" => $author,
				"ortsname" => $ortsname,
				"word" => $name,
				"konzept" => $konzept,
				"id_concept" => $id_concept,
				"id_geo" => $id_geo,
				"tokenisiert" => $tokenisiert
		);


		array_push($aeusserungen_daten,$aeusserung_daten);
		array_push($count_data, $id_geo);
	}

	$counted_data = array_count_values($count_data);
	$result = array();

	foreach($array_locationID_point_pair as $key=>$val){ // Loop though one array
		$val2 = $counted_data[$key]; // Get the values from the other array
		$result[$key] = array('geo_data' => $val, 'count' => $val2); // $val + $val2; // combine 'em
	}

	$arrays_aeusserungen_geo = array(
			'aeusserungen' => $aeusserungen_daten,
			'locations_aeusserungen_count' => $result
	);
	echo json_encode($arrays_aeusserungen_geo);
	wp_die();
}


/*OLD GETAEUSSERUNGEN  ---> STILL IN USE!!!*/
/*
add_action('wp_ajax_nopriv_getAuesserungen', 'returnAuesserungen');
add_action('wp_ajax_getAuesserungen', 'returnAuesserungen');
function returnAuesserungen(){
	global $va_xxx;


	$cur_lang = $_REQUEST['lang'];

	if($cur_lang != null){
		switch ($cur_lang) {
			case 0:
				$choosenLanguage = 'D';
				break;
			case 1:
				$choosenLanguage = 'F';
				break;
			case 2:
				$choosenLanguage = 'I';
				break;
			case 3:
				$choosenLanguage = 'S';
				break;
			default:
				$choosenLanguage = 'D';
				break;
		}

		$lang = $choosenLanguage;
	}

	$beschreibung_konzept = 'Beschreibung_' . $lang;
	$name_konzept = 'Name_' . $lang;

	$aeusserungenDaten = [];


	$aeusserungen = $va_xxx->get_results("SELECT a.Id_Aeusserung,  AsText(Georeferenz), Ortsname, Id_Ort, a.Aeusserung , $name_konzept, $beschreibung_konzept, IF($name_konzept = '', $beschreibung_konzept, $name_konzept) AS Konzept , k.Id_Konzept, AsText(Geodaten), Erfasst_Von
			FROM aeusserungen a
			left join informanten i on i.Id_Informant = a.Id_Informant
			left join vtbl_aeusserung_konzept v on v.Id_Aeusserung = a.Id_Aeusserung
			left join konzepte k on k.Id_Konzept = v.Id_Konzept AND ( $beschreibung_konzept <> '' OR $beschreibung_konzept IS NOT NULL)
			left join  orte z on (z.Name = i.Ortsname OR z.Id_Ort = i.Id_Gemeinde) AND AsText(Geodaten) NOT LIKE 'POINT%'
			where i.Erhebung = 'Crowd'  ") ;

	foreach ($aeusserungen as $value) {
		$author = $value->Erfasst_Von;
		$id_aeusserung = $value->Id_Aeusserung;
		$name = $value->Aeusserung;
		$geo = get_object_vars($value)["AsText(Georeferenz)"];
		$id_geo = $value->Id_Ort;
		$ortsname = $value->Ortsname;
		$konzept = $value->Konzept;
		$beschreibung = $value->$beschreibung_konzept;
		$id_concept = $value->Id_Konzept;
		$polygonData = get_object_vars($value)["AsText(Geodaten)"];


		$aeusserung = array(
				"type" => "auesserungen",
				"id_aeusserung" => $id_aeusserung,
				"author" => $author,
				"geo" => $geo,
				"ortsname" => $ortsname,
				"word" => $name,
				"konzept" => $konzept,
				"beschreibung" => $beschreibung,
				"id_concept" => $id_concept,
				"polygon_data" => $polygonData,
				"id_geo" => $id_geo
		);


		array_push($aeusserungenDaten,$aeusserung);
	}



	echo json_encode($aeusserungenDaten);
	wp_die();
}
*/
/**/





/*new*/

add_action('wp_ajax_nopriv_getImage', 'getImage');
add_action('wp_ajax_getImage', 'getImage');
function getImage(){
	global $va_xxx;
	$array_id_medium_pair = array();
	$array_konzeptId_medium = array();

	$konzepte = $va_xxx->get_results("SELECT Id_Konzept FROM konzepte");

	foreach ($konzepte as $konzept) {

		$mediumID = $va_xxx->get_results("SELECT Id_Medium FROM vtbl_medium_konzept WHERE Id_Konzept = $konzept->Id_Konzept AND NOT Konzeptillustration");
		$arrayImageSrc = array();
		if($mediumID != null){

			foreach ($mediumID as $medium) {

				$imageSrc = $va_xxx->get_results("SELECT Dateiname, Ursprung FROM medien WHERE ID_Medium = $medium->Id_Medium");


				if($imageSrc!=null){
					foreach ($imageSrc as $img) {
						array_push($arrayImageSrc, array('image_name' => $img->Dateiname, 'image_scource' => $img->Ursprung) );
					}
				}
			}
		}//else{
		//array_push($arrayImageSrc, null);
		//}

		//$array_konzept_Medien = array(
		//			"id" => $konzept->Id_Konzept,
		//			"img_src_array" => //$arrayImageSrc
		//			);

		//array_push($array_konzeptId_medium,$array_konzept_Medien);
		// $array_key_value = array(
		// 		$konzept->Id_Konzept => $arrayImageSrc//$array_konzept_Medien
		// );
		//array_push($array_id_medium_pair,$array_key_value);

		if(!empty($arrayImageSrc)) $array_id_medium_pair[$konzept->Id_Konzept] = $arrayImageSrc;
	}


		// print_r($array_id_medium_pair);

	//echo json_encode($array_konzeptId_medium);
	//echo json_encode($array_id_medium_pair);
	echo json_encode($array_id_medium_pair);
	wp_die();
}



//add_action( 'register_new_user', 'update_anonymous_cur_user',1000,1);

function update_anonymous_cur_user( $user_id ) {

	global $va_xxx;
	$va_xxx -> show_errors();

	if(isset($_COOKIE["crowder_id"])){
		$crowder_id = $_COOKIE["crowder_id"];
	}else{
		$crowder_id = "xxx";
	}

	$anonymous_name = $crowder_id;

	$user = get_user_by( 'ID', $user_id);
	$va_xxx -> print_error();

	$user_name = $user->display_name;
	$va_xxx -> print_error();

	$va_xxx->update('informanten',array('Nummer' => $user_name), array('Nummer' => $anonymous_name ));
	$va_xxx -> print_error();

	$va_xxx->update('aeusserungen',array('Erfasst_Von' => $user_name), array('Erfasst_Von' => $anonymous_name ));
	$va_xxx -> print_error();

	wp_die();
}


/*
 add_action( 'register_user', 'update_anonymous_cur_user',999,3);
 function update_anonymous_cur_user($user_name,$email,$error) {
 global $va_xxx;
 $va_xxx -> show_errors();

 if(isset($_COOKIE["crowder_id"])){
 $crowder_id = $_COOKIE["crowder_id"];
 }else{
 $crowder_id = "xxx";
 }

 $anonymous_name = 'anonymousCrowder' . '_' . $crowder_id;

 $va_xxx -> print_error();

 $va_xxx->update('informanten',array('Nummer' => $user_name), array('Nummer' => $anonymous_name ));
 $va_xxx->update('aeusserungen',array('Erfasst_Von' => $user_name), array('Erfasst_Von' => $anonymous_name ));

 $va_xxx -> print_error();

 wp_die();
 }
 */



add_action('wp_ajax_nopriv_save_lang_for_user', 'saveLanguageCrowder');
add_action('wp_ajax_save_lang_for_user', 'saveLanguageCrowder');
function saveLanguageCrowder(){
	$lang = $_REQUEST['lang'];
	$user_id = 	wp_get_current_user()->ID;
	$checkUserMeta = get_user_meta($user_id, 'current_language', true);

	add_user_meta($user_id, 'current_language', $lang);

	echo json_encode($lang);
	wp_die();
}




add_action('wp_ajax_nopriv_save_user_language', 'save_user_language');
add_action('wp_ajax_save_user_language', 'save_user_language');
function save_user_language(){
	$lang = $_REQUEST['user_lang'];
	$dialect = $_REQUEST['user_dialect'];
	$user_name = $_REQUEST['user_name'];
	$user_age =  $_REQUEST['user_age'];
	$anonymous_name =  $_REQUEST['anonymous_id'];
	$user_age =  $_REQUEST['user_age'];
	$anonymous_data =  (bool) $_REQUEST['anonymous_data'];
	//$user_id = 	wp_get_current_user()->ID;

	global $wpdb;
	global $va_xxx;

	//$last_user_id_q = $wpdb->get_results("SELECT ID, user_registered from $wpdb->users Order by user_registered DESC Limit 1");
	//$user_id = get_object_vars($last_user_id_q[0]);

	if(!$anonymous_data){ //registering user
		$user = get_user_by( 'login', $user_name);
		$user_id = $user->ID;

		add_user_meta($user_id, 'current_language', $lang);
		add_user_meta($user_id, 'current_dialect', $dialect);
		add_user_meta($user_id, 'current_age', $user_age);


		$va_xxx->update('informanten',array('Nummer' => $user_name, 'Alter_Informant' => $user_age), array('Nummer' => $anonymous_name ));
		$va_xxx->update('aeusserungen',array('Erfasst_Von' => $user_name), array('Erfasst_Von' => $anonymous_name ));
	}else{ // anonymous data
		$va_xxx->update('informanten',array('Nummer' => $user_name, 'Alter_Informant' => $user_age), array('Nummer' => $anonymous_name ));
		$va_xxx->update('aeusserungen',array('Erfasst_Von' => $user_name), array('Erfasst_Von' => $anonymous_name ));
	}
	// $user = get_user_by( 'login', $user_name);
	// $user_id = $user->ID;

	// add_user_meta($user_id, 'current_language', $lang);
	// add_user_meta($user_id, 'current_dialect', $dialect);
	// add_user_meta($user_id, 'current_age', $user_age);

	// $va_xxx->update('informanten',array('Nummer' => $user_name, 'Alter_Informant' => $user_age), array('Nummer' => $anonymous_name ));
	// $va_xxx->update('aeusserungen',array('Erfasst_Von' => $user_name), array('Erfasst_Von' => $anonymous_name ));

	echo json_encode($lang);
	wp_die();
}

add_action('wp_ajax_nopriv_save_user_dialect', 'save_user_dialect');
add_action('wp_ajax_save_user_dialect', 'save_user_dialect');
function save_user_dialect(){

	$dialect = $_REQUEST['user_dialect'];
	$user_name = $_REQUEST['user_name'];

	$user = get_user_by( 'login', $user_name);
	$user_id = $user->ID;

	$check_cur_dialect = get_user_meta($user_id, 'current_dialect');

	if($check_cur_dialect){
		update_user_meta( $user_id, 'current_dialect', $dialect);
		$status = "updated";
	}else{
		add_user_meta($user_id, 'current_dialect', $dialect);
		$status = "new";
	}


	echo json_encode($dialect . " " . $status);
	wp_die();
}


add_action('wp_ajax_nopriv_sendSuggestEmail', 'sendSuggestEmail');
add_action('wp_ajax_sendSuggestEmail', 'sendSuggestEmail');

function sendSuggestEmail(){

	$concept_suggest = $_REQUEST['entry'];
	$sending_user = $_REQUEST['user'];
	$sending_user_mail = $_REQUEST['email'];
	$about = $sending_user." suggests a new concept";

	$from_user = "=?UTF-8?B?".base64_encode($sending_user)."?=";
	$subject = "=?UTF-8?B?".base64_encode($about)."?=";

	$headers = "From: $from_user <$sending_user_mail >\r\n".
			"MIME-Version: 1.0" . "\r\n" .
			"Content-type: text/html; charset=UTF-8" . "\r\n";



	$message = "Crowdsourcing user ".$sending_user. " suggests the new concept: "."\"".$concept_suggest."\".";
	$message = wordwrap($message, 70);

	mail('verbaalpina@itg.uni-muenchen.de', $about, $message,$headers);

	echo ("Email sent.");


	wp_die();
}


add_action('wp_ajax_nopriv_sendFeedbackEmail', 'sendFeedbackEmail');
add_action('wp_ajax_sendFeedbackEmail', 'sendFeedbackEmail');

function sendFeedbackEmail(){

	$feedback = $_REQUEST['entry'];
	$sending_user = $_REQUEST['user'];
	$sending_user_mail = $_REQUEST['email'];
	$about = $sending_user." sends feedback";

	$from_user = "=?UTF-8?B?".base64_encode($sending_user)."?=";
	$subject = "=?UTF-8?B?".base64_encode($about)."?=";

	$headers = "From: $from_user <$sending_user_mail >\r\n".
			"MIME-Version: 1.0" . "\r\n" .
			"Content-type: text/html; charset=UTF-8" . "\r\n";


	$message = "Crowdsourcing user ".$sending_user. " sends feedback: "."\"".$feedback."\".";
	$message = wordwrap($message, 70);

	mail('verbaalpina@itg.uni-muenchen.de', $about, $message,$headers);

	echo ("Email sent.");


	wp_die();
}




add_action('wp_ajax_nopriv_request_user_data', 'send_user_data');
add_action('wp_ajax_request_user_data', 'send_user_data');
function send_user_data(){

	global $va_xxx;
	global $wp;
	global $_GET;



	$user_data = array();

	if(isset($_COOKIE["wordpress_test_cookie"]) || isset($_COOKIE["language_crowder"])){ /*Check if cookies are acivated*/
		$cookies_enabled = true;
	}else{
		$cookies_enabled = false;
	}


	if(is_user_logged_in()){ /*user is logged in*/

		$user_id = 	wp_get_current_user()->ID;
		$user_info = get_userdata($user_id);
		$user_email = $user_info->user_email;
		$language_user = get_user_meta(get_current_user_id(), 'current_language', true);
		$dialect_user = get_user_meta(get_current_user_id(), 'current_dialect', true);
		$age_user = get_user_meta(get_current_user_id(), 'current_age', true);

		if($language_user==""){// && strcmp($language_user, " ") !== 0
			$language_is_set = false;
		}else{
			$language_is_set = true;
		}

		if(current_user_can('administrator') || is_admin()){
			$is_admin = true;
		}else{
			$is_admin = false;
		}

		$user_data = array(
				'current_user' => wp_get_current_user()->display_name,
				'crowder_lang' => $language_user,
				'language_is_set' => $language_is_set,
				'user_email' => $user_email,
				'userLoggedIn' => true,
				'anonymousCrowder' => false,
				'cookies_enabled' => $cookies_enabled,
				'can_edit' => $is_admin,
				'crowder_dialect' => $dialect_user,
				'crowder_age' => $age_user
		);


	}else{/*user is not logged in*/

		if(isset($_COOKIE["crowder_id"])){
			if(substr_compare('anonymousCrowder',$_COOKIE["crowder_id"],0,15) == 0){
				$current_user = $_COOKIE["crowder_id"];
			}else{
				$current_user = null;
				setcookie("crowder_id", "", time()-3600);
			}
			//$current_user = $_COOKIE["crowder_id"];
		}else{

			$current_user = null;

		}



		$language_is_set = false;

		/*for processing url query*/
		$query_params = parse_url($_SERVER['HTTP_REFERER']);
		$params =  $query_params['query'];
		$arr = [];
		$arr_params = parse_str($params,$arr);

		if (isset($arr['dialect'])) {
		    $dialect_id =  $arr['dialect'];
		    $dialect = $va_xxx->get_results($va_xxx->prepare("SELECT Name FROM dialects WHERE Id_dialect LIKE %d" , $dialect_id));
		    if($dialect){
		    	$dialect = get_object_vars($dialect[0])['Name'];
			}else{
				$dialect = "";
			}
		} else {
		   $dialect = "";// Fallback behaviour goes here
		}

		if (isset($arr['lang'])) {
		    $language_is_set = true;
		    $crowder_lang = $arr['lang'];//$_GET['lang'];
		    switch($arr['lang']){
		    	case 'deu':
		    	 $crowder_lang = "0";
		    	 break;
		    	case 'fr':
		    	 $crowder_lang = "1";
		    	 break;
		    	case 'it':
		    	 $crowder_lang = "2";
		    	 break;
		    	case 'sl':
		    	 $crowder_lang = "3";
		    	 break;
		    	default:
		    	 $crowder_lang = "0";
		    }
		} else {
		     $crowder_lang = "0";
		}




		$user_data = array(
				'current_user' => $current_user,
				'crowder_lang' => $crowder_lang,
				'language_is_set' => $language_is_set,
				'userLoggedIn' => false,
				'anonymousCrowder' => true,
				'cookies_enabled' => $cookies_enabled,
				'crowder_dialect' => $dialect
		);

	}



	echo json_encode($user_data);
	wp_die();
}

add_action('wp_ajax_nopriv_get_submited_answers_current_user', 'get_submited_answers_current_user');
add_action('wp_ajax_get_submited_answers_current_user', 'get_submited_answers_current_user');
function get_submited_answers_current_user(){
	global $va_xxx;

	if(is_user_logged_in()){
		$user_name = wp_get_current_user()->display_name;
	}else{
		if(isset($_COOKIE["crowder_id"])){
			if(substr_compare('anonymousCrowder',$_COOKIE["crowder_id"],0,15) == 0){
				$user_name = $_COOKIE["crowder_id"];
			}else{
				$user_name = null;
				setcookie("crowder_id", "", time()-3600);
			}
			//$current_user = $_COOKIE["crowder_id"];
		}else{
			$user_name = null;
		}
	}

	if(current_user_can('va_change_cs_data')){   //|| is_admin()
		$is_admin = true;
	}else{
		$is_admin = false;
	}

	$cur_lang = $_REQUEST['lang'];


	if($cur_lang != null){
		switch ($cur_lang) {
			case 0:
				$choosenLanguage = 'D';
				break;
			case 1:
				$choosenLanguage = 'F';
				break;
			case 2:
				$choosenLanguage = 'I';
				break;
			case 3:
				$choosenLanguage = 'S';
				break;
			default:
				$choosenLanguage = 'D';
				break;
		}

		$lang = $choosenLanguage;
	}

	$beschreibung_konzept = 'Beschreibung_' . $lang;
	$name_konzept = 'Name_' . $lang;



    $submited_answers_data = [];

	if($user_name != null && !$is_admin){
		$submited_answers_q = $va_xxx->get_results(
				$va_xxx->prepare("SELECT a.Id_Aeusserung,  a.Aeusserung , IF($name_konzept = '', $beschreibung_konzept, $name_konzept) AS Konzept , k.Id_Konzept, i.Id_Gemeinde, Erfasst_Von, Ortsname, Gesperrt	 FROM `aeusserungen` a left join informanten i on i.Id_Informant = a.Id_Informant left join vtbl_aeusserung_konzept vtbl on a.Id_Aeusserung = vtbl.Id_Aeusserung left join konzepte k on vtbl.Id_Konzept = k.Id_Konzept  WHERE `Erfasst_Von` = %s",  $user_name)
				);



	}else if($user_name != null && $is_admin){
		$submited_answers_q = $va_xxx->get_results("SELECT a.Id_Aeusserung,  a.Aeusserung , IF($name_konzept = '', $beschreibung_konzept, $name_konzept) AS Konzept , k.Id_Konzept, i.Id_Gemeinde, Erfasst_Von, Ortsname, Gesperrt	 FROM `aeusserungen` a left join informanten i on i.Id_Informant = a.Id_Informant left join vtbl_aeusserung_konzept vtbl on a.Id_Aeusserung = vtbl.Id_Aeusserung left join konzepte k on vtbl.Id_Konzept = k.Id_Konzept left join stimuli s on a.Id_Stimulus = s.ID_Stimulus WHERE s.Erhebung = 'CROWD' ");

	}else{
		echo json_encode(array("submited_answers_current_user" => [], "can_edit" => false));
		wp_die();
		exit();
	}

	foreach ($submited_answers_q as $value) {
		$author = $value->Erfasst_Von;
		$id_aeusserung = $value->Id_Aeusserung;
		$name = $value->Aeusserung;
		$id_geo = $value->Id_Gemeinde;
		$ortsname = $value->Ortsname;
		$konzept = $value->Konzept;
		$id_concept = $value->Id_Konzept;
		$tokenisiert = $value->Gesperrt;

		$aeusserung_daten = array(
				"type" => "auesserungen",
				"id_aeusserung" => $id_aeusserung,
				"author" => $author,
				"ortsname" => $ortsname,
				"word" => $name,
				"konzept" => $konzept,
				"id_concept" => $id_concept,
				"id_geo" => $id_geo,
				"tokenisiert" => $tokenisiert
		);

		array_push($submited_answers_data, $aeusserung_daten);
	}

	echo json_encode(array("submited_answers_current_user" => $submited_answers_data, "can_edit" => $is_admin ));
	wp_die();
}


add_action('wp_ajax_nopriv_check_user_status', 'send_user_status');
add_action('wp_ajax_check_user_status', 'send_user_status');
function send_user_status(){

	$user_status = false;

	if(current_user_can('va_change_cs_data')){   //|| is_admin()
		$user_status = array('can_edit' => true);
	}else{
		$user_status = array('can_edit' => false);
	}

	// $user = wp_get_current_user();
	// if ( in_array( 'administrator', (array) $user->roles ) ) {
	//     //The user has the "author" role
	//     $user_status = array('can_edit' => true);
	// }else{
	// 	$user_status = array('can_edit' => false);
	// }

	//$user_status['can_edit'] = (bool)$user_status['can_edit'];

	echo json_encode($user_status);

	wp_die();
}




add_action('wp_ajax_nopriv_searchLocation', 'searchLocation');
add_action('wp_ajax_searchLocation', 'searchLocation');
function searchLocation(){
	$lat = $_REQUEST['lat'];
	$lng = $_REQUEST['lng'];
	$array = [];

	global $va_xxx;

	$loc_data = $va_xxx->get_results(
				$va_xxx->prepare("Select Id_Ort, Name from orte where ST_Contains(Geodaten,ST_GeomFromText('POINT(%f %f)') ) AND Id_Kategorie = 62", $lng, $lat)
				);


	$object = get_object_vars($loc_data[0]);

	$array = array(
		"name" => $object['Name'],
		 "id" => $object['Id_Ort']
	);

	echo json_encode($array);
	//echo json_encode([$lat,$lng]);

	wp_die();
}



add_action('wp_ajax_nopriv_send_location_submited_asnswers_count', 'send_location_submited_asnswers_count');
add_action('wp_ajax_send_location_submited_asnswers_count', 'send_location_submited_asnswers_count');
function send_location_submited_asnswers_count(){
	global $va_xxx;


	$query_params = parse_url($_SERVER['HTTP_REFERER']);
	$params =  $query_params['query'];
	$arr = [];
	$arr_params = parse_str($params,$arr);

	$user_status = false;

	if(current_user_can('va_change_cs_data')){   //|| is_admin()
		$user_status = true;
	}else{
		$user_status = false;
	}


	if(is_user_logged_in()){

		$crowder_name = wp_get_current_user()->display_name;

	}else{

		if(isset($_COOKIE["crowder_id"])){
			/*HIER IF*/
			if(substr_compare('anonymousCrowder',$_COOKIE["crowder_id"],0,15) == 0){
				$crowder_id = $_COOKIE["crowder_id"];
			}else{
				$crowder_id = null;
				setcookie("crowder_id", "", time()-3600);
			}
			//$crowder_id = $_COOKIE["crowder_id"];
		}else{
			$crowder_id = "";
		}

		$crowder_name = $crowder_id;
	}


	$cur_lang = $_REQUEST['lang'];

	if($cur_lang != null){
		switch ($cur_lang) {
			case 0:
				$choosenLanguage = 'D';
				break;
			case 1:
				$choosenLanguage = 'F';
				break;
			case 2:
				$choosenLanguage = 'I';
				break;
			case 3:
				$choosenLanguage = 'S';
				break;
			default:
				$choosenLanguage = 'D';
				break;
		}

		$lang = $choosenLanguage;
	}

	$beschreibung_konzept = 'Beschreibung_' . $lang;
	$name_konzept = 'Name_' . $lang;

	/*check if user has submited answer in location*/
	$aeusserungen_user_check = $va_xxx->get_results("SELECT  i.Id_Gemeinde, IF(i.Nummer = '$crowder_name', true, false) As userCheck FROM aeusserungen a
			inner join informanten i on i.Id_Informant = a.Id_Informant
			where i.Erhebung = 'Crowd' ORDER BY userCheck ASC") ;  /* */

	foreach ($aeusserungen_user_check as $value) {
		$id_location = $value->Id_Gemeinde;
		$user_check = $value->userCheck;

		$array_locationID_point_pair[$id_location] = $user_check;
	}


	if (isset($arr['poly'])) {

	$loc_data_count = $va_xxx->get_results($va_xxx->prepare("SELECT count(a.Id_Aeusserung) as count, i.Id_Gemeinde as id , AsText(i.Georeferenz) as geo_data, i.Ortsname as location_name, o.Alpenkonvention as alpconvention FROM aeusserungen a
									left join informanten i on i.Id_Informant = a.Id_Informant
									join A_Orte_Hierarchien_Erweitert erw on erw.Id_Ort = i.Id_Gemeinde
									left join vtbl_aeusserung_konzept v on v.Id_Aeusserung = a.Id_Aeusserung
									left join konzepte k on k.Id_Konzept = v.Id_Konzept
									left join orte o on o.Id_Ort = i.Id_Gemeinde

									where i.Erhebung = 'Crowd' AND %s > ' ' AND erw.id_ueberort = %d

									group by i.Id_Gemeinde",$beschreibung_konzept,$arr['poly']));

	}else{
		/*get count of submited answers in locations*/
		$loc_data_count = $va_xxx->get_results("SELECT count(a.Id_Aeusserung) as count, i.Id_Gemeinde as id , AsText(i.Georeferenz) as geo_data, i.Ortsname as location_name, o.Alpenkonvention as alpconvention FROM aeusserungen a
									left join informanten i on i.Id_Informant = a.Id_Informant
									left join vtbl_aeusserung_konzept v on v.Id_Aeusserung = a.Id_Aeusserung
									left join konzepte k on k.Id_Konzept = v.Id_Konzept
									left join orte o on o.Id_Ort = i.Id_Gemeinde

									where i.Erhebung = 'Crowd' AND $beschreibung_konzept > ' ' AND o.Alpenkonvention = 1

									group by i.Id_Gemeinde");
	}

	$indexed_array = array();

	foreach ($loc_data_count as $value) {

			$id_location = $value->id;
			$geo_point = $value->geo_data;
			$submited_answers_count = $value->count;
			$loc_name = $value->location_name;
			$alpconvention = $value->alpconvention;

			$array_location_data = array(
					'geo' => $geo_point,
					'count' => $submited_answers_count,
					'userCheck' => $array_locationID_point_pair[$id_location],
					'location_id' => $id_location,
					'location_name' => $loc_name,
					'alpconvention' => $alpconvention
			);

			$indexed_array[$id_location] = $array_location_data;
	}


	echo json_encode(array('data_count' => $indexed_array,'can_edit'=>$user_status));

	wp_die();
}

add_action('wp_ajax_nopriv_get_submited_answers_current_location', 'get_submited_answers_current_location');
add_action('wp_ajax_get_submited_answers_current_location', 'get_submited_answers_current_location');
function get_submited_answers_current_location(){
	global $va_xxx;

	$user_status = false;

	if(current_user_can('va_change_cs_data')){   //|| is_admin()
		$user_status =  true;
	}else{
		$user_status = false;
	}


	$cur_lang = $_REQUEST['lang'];
	$location_id = $_REQUEST['location_id'];

	if($cur_lang != null){
		switch ($cur_lang) {
			case 0:
				$choosenLanguage = 'D';
				break;
			case 1:
				$choosenLanguage = 'F';
				break;
			case 2:
				$choosenLanguage = 'I';
				break;
			case 3:
				$choosenLanguage = 'S';
				break;
			default:
				$choosenLanguage = 'D';
				break;
		}

		$lang = $choosenLanguage;
	}

	$beschreibung_konzept = 'Beschreibung_' . $lang;
	$name_konzept = 'Name_' . $lang;

	$submited_answers_array = $va_xxx->get_results(
				$va_xxx->prepare("SELECT a.Id_Aeusserung,  a.Aeusserung , IF($name_konzept = '', $beschreibung_konzept, $name_konzept) AS Konzept , k.Id_Konzept, i.Id_Gemeinde, Erfasst_Von, Ortsname, Gesperrt	FROM aeusserungen a
			left join informanten i on i.Id_Informant = a.Id_Informant
			left join vtbl_aeusserung_konzept v on v.Id_Aeusserung = a.Id_Aeusserung
			left join konzepte k on k.Id_Konzept = v.Id_Konzept
			where i.Erhebung = 'Crowd' AND  $beschreibung_konzept > ' ' AND i.Id_Gemeinde = %d", $location_id));

	$submited_answers_current_location = array();

	foreach ($submited_answers_array as $value) {
		$author = $value->Erfasst_Von;
		$id_aeusserung = $value->Id_Aeusserung;
		$name = $value->Aeusserung;
		$id_geo = $value->Id_Gemeinde;
		$ortsname = $value->Ortsname;
		$konzept = $value->Konzept;
		$id_concept = $value->Id_Konzept;
		$tokenisiert = $value->Gesperrt;

		$aeusserung_daten = array(
				"type" => "auesserungen",
				"id_aeusserung" => $id_aeusserung,
				"author" => $author,
				"ortsname" => $ortsname,
				"word" => $name,
				"konzept" => $konzept,
				"id_concept" => $id_concept,
				"id_geo" => $id_geo,
				"tokenisiert" => $tokenisiert
		);

		$submited_answers_current_location[$id_aeusserung] = $aeusserung_daten;
		//array_push($submited_answers_current_location,$aeusserung_daten);
	}

	echo json_encode(array("submited_data" => $submited_answers_current_location, "can_edit" => $user_status) );

	wp_die();
}



add_action('wp_ajax_nopriv_get_submited_answers_current_location', 'get_submited_answers_current_location');
add_action('wp_ajax_get_submited_answers_current_location', 'get_submited_answers_current_location');
function get_user_answers(){
	global $va_xxx;

	$user_submited_answers = [];

	echo json_encode($user_submited_answers);

	wp_die();
}


add_action('wp_ajax_nopriv_get_dialects', 'get_dialects');
add_action('wp_ajax_get_dialects', 'get_dialects');
function get_dialects(){
	global $va_xxx;

	$query_params = parse_url($_SERVER['HTTP_REFERER']);
	$params =  $query_params['query'];
	$arr = [];
	$arr_params = parse_str($params,$arr);

	if(isset($arr['dcluster'])){
		$dcluster = $arr['dcluster'];
	}else{
		$dcluster = 'ak';
	}

	$dialect_query_full = $va_xxx->get_results($va_xxx->prepare("SELECT Id_dialect, Name FROM dialects WHERE Id_dialect != 0 ORDER BY Name ASC"));

	$dialect_query = $va_xxx->get_results($va_xxx->prepare("SELECT Id_dialect, Name FROM dialects JOIN dialect_clusters USING (Id_Dialect) WHERE Id_dialect != 0 AND Cluster = %s ORDER BY Name ASC",$dcluster));

	$alp_dialects = array();
	$all_dialects = array();

	foreach ($dialect_query as $value) {

		$id_dialect = $value->Id_dialect;
		$dialect_name = $value->Name;

		$alp_dialect = array(

				"id_dialect" => $id_dialect,
				"name" => $dialect_name,

		);
		array_push($alp_dialects, $alp_dialect);
		//array_push($submited_answers_current_location,$aeusserung_daten);
	}

	foreach ($dialect_query_full as $value) {

		$id_dialect = $value->Id_dialect;
		$dialect_name = $value->Name;

		$dialect = array(

				"id_dialect" => $id_dialect,
				"name" => $dialect_name,

		);
		array_push($all_dialects, $dialect);
	}

	echo json_encode(
		array("all_dialects" => $all_dialects, "alp_dialects" => $alp_dialects)
	);

	wp_die();
}



//TODO IMAGE UPLOAD LOGIC
//

/**
 * Action Hook, handle Form submission with Images for Upload
 */
add_action('wp_ajax_nopriv_upload_image', 'upload_image');
add_action('wp_ajax_upload_image', 'upload_image');
function upload_image() {
	
    $files = $_FILES["image_data"];
    $selected_concept_id = $_REQUEST["selected_concept_id"];
    
    $array_files = reArrayFiles($files);

    


    $nonce = $_REQUEST['upload_image_wpnonce'];

	if ( ! wp_verify_nonce( $nonce, 'upload_image' ) ) {
		echo json_encode("Upload Error");
	    die( 'Security check' ); 

	} else {

	    if(count($array_files) > 0){

		    for($i = 0; $i < count($array_files); $i++){
				upload_single_cs_image($array_files[$i], $selected_concept_id);
			}
			
		    echo json_encode('Uploaded');

	    }else{
	    	echo json_encode("No FILES SELECTED");
	    }
    }

	wp_die();
}

/**
 * Uploads single Image to the media library and attaches the image to newly created Attachment
 * Sets the Category of the Attachment to "CS Image"
 */
function upload_single_cs_image($file, $concept_id) {
	require_once( ABSPATH . 'wp-admin/includes/image.php' );
    require_once( ABSPATH . 'wp-admin/includes/file.php' );
    require_once( ABSPATH . 'wp-admin/includes/media.php' );

    // error_log(print_r($file, true));

    /**
	 * saving image to upload directory
	 */
	$upload_overrides = array( 'test_form' => false );
	
	$file["name"] = "cs" . "-" . $concept_id . "-" . $file["name"];

	// check if file is an image
	if(is_array(getimagesize($file["tmp_name"]))){

		if(is_multisite()){

			switch_to_blog(1);

			$movefile = wp_handle_upload($file, $upload_overrides);

			restore_current_blog();

		}else{
			$movefile = wp_handle_upload($file, $upload_overrides);
		}


		/**
		 * Get Id of category 'CS Upload'
		 */
		$cat_id = category_exists('CS Image');
		if($cat_id){
			// error_log("EXISTS");
			// error_log($cat_id);
		}else{
			$cat_id = wp_create_category( 'CS Image', 0 );
			wp_create_category( 'CS Approved Image', 0 );
			// error_log("CREATED");
			// error_log($cat_id);
		}


		/**
		 * Adding Image in Media Library, attaching it to a post
		 */
		if( isset( $movefile["file"] )) {
			$file_name_and_location = $movefile["file"];
			$file_title_for_media_library = $file["name"];
			
			//"cs" . "-" .  $concept_id . "-" .
			$attachment = array(
				"post_mime_type" => $file["type"],
				"post_title" =>  addslashes( $file_title_for_media_library ),
				"post_content" => "",
				"post_status" => "inherit",
				'taxonomies'  => array('CS Image', 'category' )
			);
			
			if(is_multisite()){

				switch_to_blog(1);

				// $cat_id = category_exists('CS Image');
				// if($cat_id){
				// 	error_log("EXISTS");
				// 	error_log($cat_id);
				// }else{
				// 	$cat_id = wp_create_category( 'CS Image', 0 );
				// 	wp_create_category( 'CS Approved Image', 0 );
				// 	error_log("CREATED");
				// 	error_log($cat_id);
				// }


				$id = wp_insert_attachment( $attachment, $file_name_and_location );
	
				// $category_test = wp_set_post_categories($id, 72, true);
				// error_log(print_r($category_test,true));
				
				wp_set_object_terms($id, array(72), 'media_category', true );

				require_once( ABSPATH."wp-admin/includes/image.php" );
			
				$attach_data = wp_generate_attachment_metadata( $id, $file_name_and_location );
				wp_update_attachment_metadata( $id, $attach_data );

				restore_current_blog();

			}else{
				$id = wp_insert_attachment( $attachment, $file_name_and_location );

				wp_set_post_categories($id, $cat_id, true);
			
				require_once( ABSPATH."wp-admin/includes/image.php" );
			
				$attach_data = wp_generate_attachment_metadata( $id, $file_name_and_location );
				wp_update_attachment_metadata( $id, $attach_data );
			}

		}

	}
}

/**
 * Hook when an attachment is being updated
 * Check if attachment in Category 'CS Image' and if 'CS Approved Image' has be selected
 * If 'CS Approved Image' has be selected add image to va_xxx.medien and va_xxx.vtbl_medium_konzept
 * If 'CS Approved Image' is not selected delete data of the image if existant va_xxx.medien and va_xxx.vtbl_medium_konzept
 */
add_action("attachment_updated", "process_image_update_cs", 10, 3);
function process_image_update_cs($image_id, $post, $update){

	if(is_multisite()){

		switch_to_blog(1);

		$cs_upload_cat_id = 'CS Image';
		$cs_approved_cat_id = 'CS Approved Image';

		$categories = [];//wp_get_post_categories($image_id);


		$media_categories = [];
		$media_categories = get_the_terms( $image_id, 'media_category' );

		foreach ($media_categories as $value) {
			array_push($categories,get_object_vars($value)["name"]);
		}


		restore_current_blog();

	}else{
		$cs_upload_cat_id = category_exists('CS Image');
		$cs_approved_cat_id = category_exists('CS Approved Image');

		$categories = wp_get_post_categories($image_id);
	}





	

	if(in_array($cs_upload_cat_id, $categories)){
		if(in_array($cs_approved_cat_id, $categories)){
			add_cs_image_to_concept($image_id);
		}else{
			delete_cs_image_to_concept($image_id);
		}
	}

}

function add_cs_image_to_concept($image_id){
	global $va_xxx;

	if(is_multisite()){

		switch_to_blog(1);
		
		$title_name = get_the_title($image_id);
		$split_title = explode( "/", $title_name);
		$split_title = explode("-", end($split_title));
		$concept_id = $split_title[1];

		$image_name = explode(".", $split_title[2])[0];

		$url = wp_get_attachment_url( $image_id );

		restore_current_blog();

	}else{
		$title_name = get_the_title($image_id);
		$split_title = explode( "/", $title_name);
		$split_title = explode("-", end($split_title));
		$concept_id = $split_title[1];

		$image_name = explode(".", $split_title[2])[0];

		$url = wp_get_attachment_url( $image_id );
	}


	/**
	 * check if image already saved in va_xxx.medien
	 */
	$exists = $va_xxx->get_results($va_xxx->prepare("SELECT * FROM `medien` WHERE Dateiname = %s" ,$url ));

	if(empty($exists)){

		/**
		 * Insert Image Attachment to va_xxx.medien
		 * 
		 */
		$image_data = array(
		 			'Dateiname' => $url,
		 			'Ursprung' => "CS Tool",
		 			'Lizenz' => "CC BY-SA 4.0"
		 			);

		$va_xxx->insert(
		 			'medien',
		 			$image_data
		 			);

		$inserted_media = $va_xxx->insert_id;


		/**
		 * Connect Inserted Media to concept in vtbl_medium_konzept
		 */
		
		$medium_concept = array(
		 			'Id_Medium' => $inserted_media,
		 			'Id_Konzept' => $concept_id
		 			);

		$va_xxx->insert(
		 			'vtbl_medium_konzept',
		 			$medium_concept
		 			);

		if($va_xxx->last_error !== '') :
		    $va_xxx->print_error();
		endif;


	}else{
		$media_id = get_object_vars($exists[0])["ID_Medium"];

		$exists_connection = $va_xxx->get_results($va_xxx->prepare("SELECT * FROM `vtbl_medium_konzept` WHERE Id_Medium = %s AND Id_Konzept = %s" ,$media_id, $concept_id));

		$va_xxx->update('medien', array('Lizenz' => "CC BY-SA 4.0", 'Ursprung' => "CS Tool" ), array('ID_Medium' => $media_id ) );

		if(empty($exists_connection)){

			$medium_concept = array(
		 			'Id_Medium' => $media_id,
		 			'Id_Konzept' => $concept_id
		 			);

			$va_xxx->insert(
			 			'vtbl_medium_konzept',
			 			$medium_concept
			 			);

			if($va_xxx->last_error !== '') :
			    $va_xxx->print_error();
			endif;

		}
	}

}

function delete_cs_image_to_concept($image_id){
	global $va_xxx;



	if(is_multisite()){

		switch_to_blog(1);
		$title_name = get_the_title($image_id);
		$split_title = explode( "/", $title_name);
		$split_title = explode("-", end($split_title));
		$concept_id = $split_title[1];

		$image_name = explode(".", $split_title[2])[0];

		$url = wp_get_attachment_url( $image_id );


		restore_current_blog();

	}else{
		$title_name = get_the_title($image_id);
		$split_title = explode( "/", $title_name);
		$split_title = explode("-", end($split_title));
		$concept_id = $split_title[1];

		$image_name = explode(".", $split_title[2])[0];

		$url = wp_get_attachment_url( $image_id );
	}


	/**
	 * check if image has a medien and a vtbl_medium entry
	 * If entry exists, delete them
	 */
	$exists_media = $va_xxx->get_results($va_xxx->prepare("SELECT * FROM `medien` WHERE Dateiname = %s" ,$url ));

	if(!empty($exists_media)){
		$id_media = get_object_vars($exists_media[0])["ID_Medium"];
		
		$va_xxx->delete('vtbl_medium_konzept',array('Id_Medium' => $id_media ));

		if($va_xxx->last_error !== '') :
		    $va_xxx->print_error();
		endif;
		
	}

}



function reArrayFiles(&$file_post) {
    $file_ary = array();
    $file_count = count($file_post['name']);
    $file_keys = array_keys($file_post);

    for ($i=0; $i<$file_count; $i++) {
        foreach ($file_keys as $key) {
            $file_ary[$i][$key] = $file_post[$key][$i];
        }
    }

    return $file_ary;
}


//END IMAGE UPLOAD 

add_action('wp_ajax_nopriv_save_audio', 'save_audio');
add_action('wp_ajax_save_audio', 'save_audio');
function save_audio(){
	global $va_xxx;

	// $audio_data = $_REQUEST['audio_data'];
	$audio_id = $_REQUEST['submitted_answer_id'];

	$uploads = wp_upload_dir();




	if(isset($_FILES['file']) and !$_FILES['file']['error']){
	    $fname = $audio_id . ".mp3";
		$path = ($uploads['basedir']) . "/audio_recordings/";


		$uploaded_file = move_uploaded_file($_FILES['file']['tmp_name'], $path . $fname);

		//$path = wp_basename($uploads['basedir']) . "/audio_recordings/" . $audio_id . ".mp3";
		//$uploaded_file = file_put_contents($path, $_FILES['file']);

		$uploaded_file = array(
			'path' => $path,
			'file' => $_FILES['file'],
			'uploaded_file' => $uploaded_file,
			'file_arr' => $_FILES
		);
		//'test_call' => file_put_contents($path, $_FILES['file'])

	}else{
		$uploaded_file = $path;
		$uploaded_file = array(
			'path' => $path,
			'test' => 'string_test'
		);
	}

	echo json_encode($uploaded_file);

	wp_die();
}


/*
$arrayInformant = array(
	 			'Erhebung' => 'Crowd',
	 			'Nummer' => $currentUser->display_name, // Name der Informant
	 			'Ortsname' => $gemeinde,
	 			'Id_Gemeinde' => intval($gemeinde_id),
	 			'Georeferenz' =>$arrayG["Centroid(Geodaten)"],
	 			'Alpenkonvention' => 1
	 	);
	 	$va_xxx->insert(
	 			'informanten',
	 			$arrayInformant
	 			);


 */

add_action('wp_ajax_nopriv_suggest_dialect', 'suggest_dialect');
add_action('wp_ajax_suggest_dialect', 'suggest_dialect');
function suggest_dialect(){
	global $va_xxx;

	$dialect_name  = $_REQUEST['dialect'];
	$cluster  = $_REQUEST['dialect_cluster'];

	$exists_dialect = $va_xxx->get_results($va_xxx->prepare("SELECT * FROM `dialects` WHERE Name LIKE %s" ,$dialect_name ));

	if(empty($exists_dialect)){

		if (!$cluster){
			$cluster = "ak";
		}

		$dialect_to_save = array(
		 			'Name' => $dialect_name,
		 			);

		$va_xxx->insert(
		 			'dialects',
		 			$dialect_to_save
		 			);


		$inserted_id = $va_xxx->insert_id;

		$dialect_cluster_to_save = array(
			'Id_dialect' => $inserted_id,
			'Cluster' => $cluster
		);

		$va_xxx->insert(
		 			'dialect_clusters',
		 			$dialect_cluster_to_save
		 			);

		echo json_encode(array('dialect' => $dialect_name , 'id' => $inserted_id, 'new_dialect' => true));
	}else{
		$dialect_name = get_object_vars($exists_dialect[0])["Name"];
		$dialect_id = get_object_vars($exists_dialect[0])["Id_dialect"];
		echo json_encode(array('dialect' => $dialect_name , 'id' => $dialect_id,  'new_dialect' => false));
	}

	wp_die();
}


add_action('wp_ajax_nopriv_get_translations', 'get_translations');
add_action('wp_ajax_get_translations', 'get_translations');
function get_translations(){
	global $va_xxx;

	$translations = $va_xxx->get_results("SELECT * FROM `uebersetzungen` WHERE `Seite` LIKE 'CS' ORDER BY `Seite` DESC");

	
	$translations_array = array();

	foreach ($translations as $translation) {

		$key = $translation->Schluessel;
		$ger = $translation->Begriff_D;
		$fr = $translation->Begriff_F;
		$it = $translation->Begriff_I;
		$sl = $translation->Begriff_S;

		$translations_array[$key] = [$ger, $fr, $it, $sl];
	}

	echo json_encode($translations_array);

	wp_die();
}


// add_filter( 'wp_mail', 'my_wp_mail_filter' );
// function my_wp_mail_filter( $args ) {
//     // Check the message subject for a known string in the notification email.

// 	error_log(print_r("EMAIL FILTER", true));
// 	error_log(print_r($args, true));

// 	// $message = $args["message"];
// 	// $about = $args["about"];

// 	// $from_user = "=?UTF-8?B?".base64_encode($sending_user)."?=";
// 	// $subject = "=?UTF-8?B?".base64_encode($about)."?=";

// 	// $headers = "From: $from_user <$sending_user_mail >\r\n".
// 	// 		"MIME-Version: 1.0" . "\r\n" .
// 	// 		"Content-type: text/html; charset=UTF-8" . "\r\n";



//     return $args;
// }

// add_filter( 'wp_mail_from', 'testing_email' );
// function testing_email($string){
// 	error_log(print_r("EMAIL: ", true));
// 	error_log(print_r($string, true));

//     return $string;
// }