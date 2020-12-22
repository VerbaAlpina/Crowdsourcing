/**
 * AppManager
 */

class AppManager {
	constructor() {
		/**
		 * Loading Data, Ajax Calls
		 * @type {DataLoader}
		 */
		this.loader = new DataLoader()

		/**
		 * Data Logic, Variable Storage and Management
		 * @type {DataManager}
		 */
		this.manager = new DataManager()

		/**
		 * UI Elements, Event Listeners/Handlers
		 * @type {UIController}
		 */
		this.ui = new UIController()

		/**
		 * Map Logic
		 * @type {MapController}
		 */
		this.map = new MapController()

		/**
		 * App State
		 * @type {Object}
		 */
		this.state = new Object()
	}

	/**
	 * First Ajax calls, loading initial data.
	 * @return {void} [description]
	 */
	init_app() {
		// console.log("App Running")

		var success_get_translations = function(response) {
			// console.log("SUCCESS 1")
			// app.manager.addData("translations", JSON.parse(response))
			app.manager.translations = JSON.parse(response)
			app.manager.init_translations(app.manager.translations)
		}

		var success_request_user_data = function(response) {
			// console.log("SUCCESS 2")
			app.manager.declare_user_data(JSON.parse(response));
		}

		var success_getConceptCount = function(response) {
			// console.log("SUCCESS 3 ")
			app.manager.addData("important_concepts_count", JSON.parse(response))
		}

		var success_getBordersGeoData = function(response) {
			// console.log("SUCCESS 4")

			var response = JSON.parse(response);
			var coords = response.polygon;
			var center = response.center;

			// init image upload form
			app.ui.image_uploader.init_image_upload_form();

			app.map.addGeometryAlps(coords, center);
			app.ui.initTool();


		}

		var on_error = function(jqXHR, exception) {
			if (jqXHR.status === 401) {
				alert('HTTP Error 401 Unauthorized.');
			} else {
				alert('Uncaught Error.\n' + jqXHR.responseText);
			}
		}

		let ajax_get_translations = this.loader.init_ajax_call("POST", { action: "get_translations" }, success_get_translations, on_error, false)
		let ajax_request_user_data = this.loader.init_ajax_call("POST", { action: "request_user_data" }, success_request_user_data, on_error, false)
		let ajax_getConceptCount = this.loader.init_ajax_call("POST", { action: "getConceptCount" }, success_getConceptCount, on_error, false)
		let ajax_getBordersGeoData = this.loader.init_ajax_call("POST", { action: "getBordersGeoData", geoData: 'alpenKonvention' }, success_getBordersGeoData, on_error, false)

		ajax_get_translations.execute()
			.then(function() { ajax_request_user_data.execute() })
			.then(function() { ajax_getConceptCount.execute() })
			.then(function() { ajax_getBordersGeoData.execute() })

	}

	
	/**
	 * Initializes the CS-Tool. Performes Ajax Calls to fetch data(locations, user entries) from the server. The gathered data is then stored in global variables.
	 * @return {void} [description]
	 */
	startMainTool() {

		// console.log("START MAIN TOOL")
		var current_language = app.manager.current_language

		app.loader.create_cookie(current_language);

		var menu_content = jQuery(app.manager.getTranslation("leftmenu_contents"));

		jQuery('#left_menu').append(menu_content);
		menu_content.show();

		//audio data visualization
		// wavesurfer = add_wavesurfer();

		//translating text in register modal
		if (!app.manager.user_data.userLoggedIn) {
			app.ui.add_translation_register_modal();
		}

		if (app.manager.selected_dialect !== "") {
			app.ui.display_dialect();
		}

		if (!app.manager.user_data.language_is_set) app.ui.showCustomBackdrop();

		jQuery('#submitanswer').on('click', function() {
			// console.log('submit button: Before saveword() ' + app.ui.submit_button_clicked);

			if (!app.ui.submit_button_clicked) {
				app.loader.saveWord();
				app.ui.submit_button_clicked = true;
				setTimeout(function() {
					app.ui.submit_button_clicked = false; /*console.log('submit button: After saveword() ' + app.ui.submit_button_clicked);*/
				}, 1000);


			}

		})

		/**
		 * set user language -> to be saved as current_language in the wp_db
		 */
		if (!app.manager.user_data.language_is_set) {
			jQuery.ajax({
				url: ajax_object.ajax_url,
				type: 'POST',
				data: {
					action: 'save_lang_for_user',
					lang: current_language
				},
				success: function(response) {
					/*console.log("language saved");
					console.log("Saved language: " + JSON.parse(response));*/
				}
			});
		}

		/**
		 * Get all images links from server.
		 * @async
		 * @function gets image links
		 * @return {Array} images
		 */
		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'getImage',
			},
			success: function(response) {
				var images = JSON.parse(response);
				app.manager.addData("images", images)
			}
		});

		/**
		 * Get locations in current language
		 * @async
		 * @function getTableData
		 */
		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'getlocations',
				lang: current_language
			},
			success: function(response) {
				var locations = JSON.parse(response);
				app.manager.addData("locations", locations)

				var location_data = app.manager.getTableData(locations, "location");
				app.manager.addData("location_data", location_data)
				app.manager.initLocationsModal();
			}
		});


		/*ajax call for all the concepts in the choosen language*/
		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'getKonzepte',
				lang: current_language
			},
			success: function(response) {

				app.manager.addData("concepts_cur_lang", JSON.parse(response));
				let concepts_cur_lang = app.manager.getData("concepts_cur_lang");

				//init concept data with all concept data
				let concept_data = app.manager.getTableData(concepts_cur_lang.data_value, "concept");
				app.manager.addData("concept_data", concept_data);

				app.manager.va_phase = 0;

				app.manager.initConceptModal();

				app.ui.allow_select = true;

				let concepts_index_by_id = app.manager.createConceptIndexList(concepts_cur_lang.data_value);
				app.manager.addData("concepts_index_by_id", concepts_index_by_id)

				app.loader.get_submited_answers(function() {
					app.ui.setDynamicContent();
					jQuery('#left_menu').css('opacity', '0');
					jQuery('#left_menu').show();
					app.ui.offsetHeight = document.getElementById('left_menu').offsetHeight;
					jQuery('#left_menu').css('bottom', -app.ui.offsetHeight);

					jQuery('#left_menu').css('opacity', '1');
					jQuery('#left_menu').animate({
						bottom: '+=' + app.ui.offsetHeight
					}, 400, 'swing', function() {
						setTimeout(function() {
							app.ui.menu_is_up();
						}, 500); // set timeout to display toolpits after menu is up and everything else is displayed
					});
				});

				app.loader.get_submited_answers_current_user(function() {
					var unanswered_concepts = app.manager.createUnansweredIndex();
					app.manager.unanswered_concepts = unanswered_concepts
				});


				/**
				 * AUDIO Recording FUNCTION
				 */
				//add_audio_html();


				jQuery('#left_menu').hammer().bind("swipedown", function() {
					if (jQuery(this).is(':visible')) {
						jQuery(this).animate({
							bottom: '-=' + app.ui.offsetHeight
						}, 400, 'swing', function() {
							jQuery(this).hide();
							jQuery('#fake_arrow').show();
						});
						jQuery('.popover').hide();
					}
				});

				jQuery('#swipe-up-div').hammer().bind("swipedown", function() {
					if (jQuery('#left_menu').is(':visible')) {
						jQuery('#left_menu').animate({
							bottom: '-=' + app.ui.offsetHeight
						}, 400, 'swing', function() {
							jQuery('#left_menu').hide();
							jQuery('#fake_arrow').show();
						});
						jQuery('.popover').hide();
					}
				});


				jQuery('#swipe-up-div').hammer().bind("swipeup", function() {
					if (jQuery('#left_menu').is(':hidden')) {
						jQuery('#left_menu').show().animate({
							bottom: '+=' + app.ui.offsetHeight
						}, 400, 'swing', function() {
							jQuery('.popover').show();
						});
						jQuery('#fake_arrow').hide();
					}
				});

				jQuery('#fake_arrow').hammer().bind("swipeup", function() {
					if (jQuery('#left_menu').is(':hidden')) {
						jQuery('#left_menu').show().animate({
							bottom: '+=' + app.ui.offsetHeight
						}, 400, 'swing', function() {
							jQuery('.popover').show();
						});
						jQuery('#fake_arrow').hide();

					}
				});


				jQuery('#left_menu').data("hammer").get('swipe').set({
					direction: Hammer.DIRECTION_ALL
				});
				jQuery('#swipe-up-div').data("hammer").get('swipe').set({
					direction: Hammer.DIRECTION_ALL
				});
				jQuery('#fake_arrow').data("hammer").get('swipe').set({
					direction: Hammer.DIRECTION_ALL
				});



				jQuery('#word_span').on('click', function() {
					app.ui.handleWordSpanClick();
				});

				jQuery('#location_span').on('click', function() {
					app.ui.handleLocationSpanClick();
				})


				jQuery('#user_input').on('keyup', function() {

					if (app.ui.process_restarted) {
						app.map.closeAllInfoWindows();
						app.ui.process_restarted = false;
					}

					if (app.ui.concept_selected && app.ui.location_selected && app.ui.stage == 3) {
						app.ui.word_entered = true;

						setTimeout(function() {

							app.ui.showPopUp();
						}, 100);

					}

				})


			} //success

		});

		console.log("MAIN TOOL STARTED")


	}

}

/**
 * Initialize the CS Tool
 * Creates an instance of AppManager, when the document is fully loaded.
 * @param  {AppManager} ) {	app        [description]
 * @return {void}       [description]
 */
jQuery(document).on('ready', function() {
	app = new AppManager()

	app.map.initMap(function(){

		app.init_app()

	})
})