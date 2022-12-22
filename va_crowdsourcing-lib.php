<?php
/*
 * Initializing Database Connection
 * Enques Scripts
 **/

/**
 * The data base connection from the VerbaAlpina plugin is used
 */
global $va_xxx; 
global $template_name_cs_crowd;
$template_name_cs_crowd = 'template_plugin_frontend.php';

/**
 * Localhost Testing
 */
// global $va_xxx; 
// $va_xxx = new wpdb("root", "", "va_xxx", "localhost:3311");
// global $template_name_cs_crowd;
// $template_name_cs_crowd = 'template_plugin_frontend_cs.php';


global $cookies_enabled;
$cookies_enabled = false;

add_filter('show_admin_bar', 'crowdsourcing_admin_bar');
function crowdsourcing_admin_bar ($default) {
	global $template_name_cs_crowd; 
	if (is_page_template($template_name_cs_crowd)){ 
		return current_user_can('administrator') || is_admin();
	} 
	return $default;

}


/**
 * adding favicon
 * @return [type] [description]
 */
function vp_crowd_add_favicon(){ ?>
    
    <link rel="shortcut icon" href="<?php echo plugins_url('/plugin_va-crowd/assets/images');?>/favicon.ico"/>
    <!-- <link rel="apple-touch-icon" href="<?php echo get_stylesheet_directory_uri(); ?>/apple-touch-icon.png"> -->
    <?php }
add_action('wp_head','vp_crowd_add_favicon');

function get_language_crowder(){
	switch(get_locale()){
			case 'fr_FR':
				return 'F';
			case 'it_IT':
				return 'I';
			case 'de_DE';
				return 'D';
			case 'sl_SI';
				return 'S';
			case 'rg_CH';
				return 'R';
			case 'en_UK':
				return 'E';
			case 'en_GB':
				return 'E';
			case 'en_US':
				return 'E';
			default:
				return 'D'; 
	}
}

/**
 * Adds all enqued scripts to the documents head
 */
add_action('wp_enqueue_scripts', 'plugIntextdomain'); 
add_action( 'wp_head', 'enqueue_scripts' );
function enqueue_scripts() {
	global $template_name_cs_crowd; 

	//adding wordpress js media libs
	wp_enqueue_media();

	/*custom js and styles load when on specified page template*/
	if(is_page_template($template_name_cs_crowd)){

	 if(!is_admin() ){ //&& is_page('Mitmachen')
	 	prefix_enqueue();
		}
		
		$dependencies = ['jquery'];
		wp_register_script('leaflet', IM_PLUGIN_URL . 'lib/js/svn/pixi_webgl/js/leaflet.js');
		$dependencies[] = 'leaflet';

		wp_register_style('mapTypeStyle', IM_PLUGIN_URL . 'lib/js/svn/pixi_webgl/css/leaflet.css');

		wp_register_script('pixi', IM_PLUGIN_URL . 'lib/js/svn/pixi_webgl/js/pixi.min.js');
		$dependencies[] = 'pixi';

		wp_register_script('im_pixi_overlay', IM_PLUGIN_URL . 'lib/js/svn/pixi_webgl/js/L.PixiOverlay.js');
		$dependencies[] = 'im_pixi_overlay';

		wp_register_script('leafletbounce', IM_PLUGIN_URL . 'lib/js/svn/pixi_webgl/js/leaflet.smoothmarkerbouncing.js');
		$dependencies[] = 'leafletbounce';

	    wp_register_script('leafletcolormarkers', IM_PLUGIN_URL . 'lib/js/svn/pixi_webgl/js/leaflet-color-markers.js');
		$dependencies[] = 'leafletcolormarkers';

		wp_register_script('im_pixi', IM_PLUGIN_URL . 'lib/js/svn/pixi_webgl/js/leafletPixi.js');
		$dependencies[] = 'im_pixi';


		wp_register_script('im_earcut', IM_PLUGIN_URL . 'lib/js/svn/pixi_webgl/js/earcut.js');
		$dependencies[] = 'im_earcut';


		wp_register_script('im_interactive_map', IM_PLUGIN_URL . 'src/js/core/geo.js');
		$dependencies[] = 'im_interactive_map';


		wp_register_script('typedefs', IM_PLUGIN_URL . 'src/js/typedefs.js');
		$dependencies[] = 'typedefs';

		wp_register_style('webgl_css', IM_PLUGIN_URL . 'lib/js/svn/pixi_webgl/css/webgloverlay.css');
		
	
		wp_register_script( 'datatable_js', plugins_url('/plugin_va-crowd/assets/js/jquery.dataTables.min.js'),array( 'jquery' ), '1.0.0', true);
		wp_register_script( 'datatable_scroller_js', plugins_url('/plugin_va-crowd/assets/js/dataTables.scroller.min.js'),array( 'jquery' ), '1.0.0', true);
		wp_register_style( 'scrollbar', plugins_url( '/assets/css/jquery.mCustomScrollbar.min.css', __FILE__ ));
		wp_register_style( 'selectboxit', plugins_url( '/assets/css/jquery.selectBoxIt.css', __FILE__ ));	
		wp_register_style( 'font-awesome', plugins_url( '/assets/css/font-awesome.min.css', __FILE__ ));
		wp_register_style( 'datatable_style', plugins_url('/assets/css/jquery.dataTables.min.css', __FILE__ ));
		wp_register_style( 'datatable_scroller_style', plugins_url('/assets/css/scroller.dataTables.min.css', __FILE__ ));
	    wp_register_style( 'style', plugins_url( '/style.css', __FILE__ ));
   	    wp_register_style( 'dropzone_css', plugins_url('/assets/css/dropzone.min.css', __FILE__ ));


		wp_register_script( 'actions_ajax', plugins_url( '/plugin_va-crowd/js/actions_ajax.js'),array( 'jquery' ), '1.0.0', true );
		wp_register_script( 'content_interactions', plugins_url( '/plugin_va-crowd/js/content_interactions.js'),array( 'jquery' ), '1.0.0', true );
		wp_register_script( 'generateMap', plugins_url( '/plugin_va-crowd/js/generateMap.js'),$dependencies, '1.0.0', true );
		wp_register_script( 'audio_controller', plugins_url( '/plugin_va-crowd/js/audio_controller.js'));
		wp_register_script( 'image_upload_controller', plugins_url( '/plugin_va-crowd/js/image_upload_controller.js'));

		wp_register_script('app_manager', plugins_url( '/plugin_va-crowd/js/app_manager.js'),array( 'jquery' ), '1.0.0', true );
		wp_register_script('data_manager', plugins_url( '/plugin_va-crowd/js/data_manager.js'),array( 'jquery' ), '1.0.0', true );
		wp_register_script('data_loader', plugins_url( '/plugin_va-crowd/js/data_loader.js'),array( 'jquery' ), '1.0.0', true );
		wp_register_script('ui_controller', plugins_url( '/plugin_va-crowd/js/ui_controller.js'),array( 'jquery' ), '1.0.0', true );
		wp_register_script('map_controller', plugins_url( '/plugin_va-crowd/js/map_controller.js'), $dependencies, '1.0.0', true );

		wp_register_script( 'dropzone_js', plugins_url('/assets/js/dropzone.min.js', __FILE__ ));
		wp_register_script( 'jquery_ui', plugins_url( '/plugin_va-crowd/assets/js/jquery-ui.min.js'),array( 'jquery' ), '1.0.0', true);
		wp_register_script( 'hammer', plugins_url( '/plugin_va-crowd/assets/js/hammer.min.js'));
		wp_register_script( 'hammer_jq', plugins_url( '/plugin_va-crowd/assets/js/jquery.hammer.js'),array( 'jquery' ), '1.0.0', true);	
		wp_register_script( 'scrollbar_js', plugins_url( '/plugin_va-crowd/assets/js/jquery.mCustomScrollbar.concat.min.js'),array( 'jquery' ), '1.0.0', true);
		wp_register_script( 'selectboxit_js', plugins_url( '/plugin_va-crowd/assets/js/jquery.selectBoxIt.min.js'),array( 'jquery' ), '1.0.0', true);

		

		// wp_enqueue_script('actions_ajax');
		// wp_enqueue_script('content_interactions');
		// wp_enqueue_script('generateMap');
		// wp_localize_script('generateMap','url',array('plugins_Url'=>plugin_dir_url(__FILE__)));
		// wp_enqueue_script('audio_controller');
		// wp_enqueue_script('image_upload_controller');

		wp_enqueue_script('app_manager');
		wp_enqueue_script('data_manager');
		wp_enqueue_script('data_loader');
		wp_enqueue_script('ui_controller');
		wp_enqueue_script('map_controller');
		
		wp_enqueue_script('datatable_js');
	    wp_enqueue_script('datatable_scroller_js');
		wp_enqueue_script('jquery_ui');
		wp_enqueue_script('hammer');
		wp_enqueue_script('hammer_jq');
		wp_enqueue_script('scrollbar_js');
	    wp_enqueue_script('selectboxit_js');
	    wp_enqueue_script('dropzone_js');

		wp_enqueue_style( 'style' );
		wp_enqueue_style( 'scrollbar' );
		wp_enqueue_style( 'selectboxit' );
		wp_enqueue_style( 'font-awesome' );
		wp_enqueue_style( 'datatable_style' );
		wp_enqueue_style( 'datatable_scroller_style' );

		wp_enqueue_style( 'dropzone_css' );

		wp_enqueue_style( 'mapTypeStyle' );
		wp_enqueue_style('webgl_css');	

		wp_localize_script( 'actions_ajax', 'ajax_object',array( 'ajax_url' => admin_url( 'admin-ajax.php' )));
		wp_localize_script( 'data_loader', 'ajax_object',array( 'ajax_url' => admin_url( 'admin-ajax.php' )));
		wp_localize_script('ui_controller','url',array('plugins_Url'=>plugin_dir_url(__FILE__)));
	

	}

}

/**
 * Adds audio script, currently not used
 */
// add_action('wp_head','add_wavesurfer_lib');
// function add_wavesurfer_lib(){
	// 
	// <script src="https://unpkg.com/wavesurfer.js"></script>
	// 
// }

/**
 * A possible way, but currentlynot used for internationalization.
 * @return [type] [description]
 */
function plugIntextdomain() {
	global $template_name_cs_crowd; 
	if(is_page_template($template_name_cs_crowd)){ 
		load_plugin_textdomain( 'plugin_va-crowd', false, dirname( plugin_basename(__FILE__) ) . '/languages' );
		getJavascriptTranslations();
	} 
}

function getJavascriptTranslations(){
	?>

	<script>
	var speichern =  <?php echo json_encode (__('Save','plugin_va-crowd')) ;?>;
	var gewaehlteKonzept = <?php echo json_encode  (__('Für: ','plugin_va-crowd')) ;?> ;
	var bezeichnungGeben = <?php echo json_encode  (__('Sagt man: ','plugin_va-crowd')) ;?> ;
	var gewaehlteRegion  = <?php echo json_encode  (__('Choosen Region: ','plugin_va-crowd')) ;?> ;
	var gemeindeGeben  = <?php echo json_encode  (__('In: ','plugin_va-crowd')) ;?> ;
	var sucheAndereRegione = <?php echo json_encode ( __('Search through other Reagions','plugin_va-crowd')) ;?> ;
	var search = <?php echo json_encode  (__('Search..','plugin_va-crowd')) ;?> ;
	var top20 = <?php echo json_encode  (__('Top 20 Concecpts: ','plugin_va-crowd')) ;?> ;
	var zeigeTop20 = <?php echo json_encode  (__('Show the Top 20 Concepts','plugin_va-crowd')) ;?> ;
	</script>


	<?php

}


function prefix_enqueue(){   

	wp_register_script( 'tether', plugins_url( '/plugin_va-crowd/assets/js/tether.min.js'),array( 'jquery' ), '1.0.0', true);
    wp_enqueue_script('tether');

    // JS
    wp_register_script('prefix_bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/js/bootstrap.min.js', array( 'jquery' ), '1.0', true );
    wp_enqueue_script('prefix_bootstrap');

    // CSS
    wp_register_style('prefix_bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css');
    wp_enqueue_style('prefix_bootstrap');

}


function enqueue_select(){
    wp_register_style( 'select_css', 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.11.2/css/bootstrap-select.min.css', false, '1.0', 'all' );
    wp_register_script( 'select', 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.11.2/js/bootstrap-select.min.js', array( 'jquery' ), '1.0', true );
    wp_enqueue_style( 'select_css' );
    wp_enqueue_script( 'select' );
}


//add_action('wp_head','userLoggedIn');
/**
 * Depricated funtion
 * @return [type] [description]
 */
function userLoggedIn(){

	global $va_xxx;
	global $wpdb;

 	/*Check if cookies are acivated*/
    if(isset($_COOKIE["wordpress_test_cookie"]) || isset($_COOKIE["language_crowder"])){
    		$cookies_enabled = true;
	?>
	   	<script>
			var cookies_enabled = true;
		</script>
	<?php 
    }else{
    	$cookies_enabled = false;
	?>
    	<script>
			var cookies_enabled = false;
		</script>
 	<?php
    }
    
    //Create a unique id if cookies are activated, declare a unique id for user
	/*if($cookies_enabled){							

    	if(isset($_COOKIE["crowder_id"])){
			$unique_id = $_COOKIE["crowder_id"]; //crowder unique id
		}else{
			$crowder_id = uniqid();
			$unique_id = $crowder_id;
    		setcookie("crowder_id", $crowder_id); //setting crowder unique id as cookie
		}

	}*/

	/*Set javascript global vars if user is logged in*/
    if(is_user_logged_in()){ 

    	$user_id = 	wp_get_current_user()->ID;
    	$user_info = get_userdata($user_id);
    	$user_email = $user_info->user_email;
    	$language_user = get_user_meta(get_current_user_id(), 'current_language', true);

	
	/*if(isset($_COOKIE["language_crowder"])){
		$language_is_set = true;
		$language_user = $_COOKIE["language_crowder"];
	}else{
		$language_is_set = false;
	}*/


	if($language_user==""){// && strcmp($language_user, " ") !== 0
		$language_is_set = false;
	}else{
		$language_is_set = true;
	}


    ?>



	<script>
		var language_is_set = <?php echo json_encode($language_is_set); ?> ;
		var userLoggedIn = true;
		var anonymousCrowder = false;
		var current_user = <?php echo json_encode(wp_get_current_user()->display_name); ?> ;
		var crowder_lang =  <?php echo json_encode($language_user); ?> ; 
		var user_email = <?php echo json_encode($user_email); ?> ;
	</script>

<?php
    }else{ /*Set javascript global vars if user is not logged in*/

		if(isset($_COOKIE["crowder_id"])){
    		$current_user = $_COOKIE["crowder_id"];
    	}else{
    		$current_user = null;
    	}
    
    	$language_is_set = false;

    	?>

    	<script>
    	 var language_is_set = <?php echo json_encode($language_is_set); ?> ;
		 var userLoggedIn = false;
		 var anonymousCrowder = true;
		 var current_user = <?php echo json_encode($current_user); ?> ;
		 var crowder_lang =  null ;

		</script>

		<?php
    }


    /*Check if user is admin*/
    
    if(current_user_can('administrator') || is_admin()){
    	?>

    	<script type="text/javascript">
    		is_admin = true;
    	</script>

    <?php
   }else{
    	?>
    	<script type="text/javascript">
    		is_admin = false;
    	</script>

    	<?php
    }
    
}


/**
 * After newly registered user resets his password, redirect to cs tool using new login data
 */
add_action( 'after_password_reset', 'redirectToPlugIn',10,2); 
function redirectToPlugIn($user_info, $newpass){

	$creds = array();
	$creds['user_login'] = $user_info->display_name;
	$creds['user_password'] = $newpass;
	$creds['remember'] = true;
	$user = wp_signon( $creds, false );

	
	switch_to_blog(8); 
	$link = get_page_link(1741);//369
	restore_current_blog();
	

	wp_redirect($link);

	if ( is_wp_error($user) )
		echo $user->get_error_message();
	
	exit;
}


function custom_action_on_registerr( $user_id ) {
    $user    = get_userdata( $user_id );
    $email   = $user->user_email;
    $message = $email . ' has registered to your website.';
    wp_mail( '$email', 'New User registration', $message );
}
add_action('user_register', 'custom_action_on_registerr');