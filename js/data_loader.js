/**
 * DataLoader
 * Main Logic and Functions for all Ajax Calls and Handlers.
 */
class DataLoader {
	constructor() {

	}

	/**
	 * [init_ajax_call description]
	 * @param  {String}  type             [description]
	 * @param  {String}  ajax_data        [description]
	 * @param  {Funtion}  success_callback [description]
	 * @param  {Funtion}  error_callback   [description]
	 * @param  {Boolean} async            [description]
	 * @return {AjaxCaller}                   [description]
	 */
	init_ajax_call(type, ajax_data, success_callback, error_callback, async = false) {
		let ajax_call = new AjaxCaller(type, ajax_data, success_callback, error_callback, async).prepareAjax()
		return ajax_call
	}

	/**
	 * [get_dialects description]
	 * @param  {Function} callbackOpenModal [description]
	 * @return {void}                   [description]
	 */
	get_dialects(callbackOpenModal) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'get_dialects'
			},
			success: function(response) {

				app.manager.addData("dialect_array", JSON.parse(response));

				var dialect_array = app.manager.getData("dialect_array").data_value
				var dialect_data = app.manager.getTableData(dialect_array, "dialect");

				if (!app.manager.dialect_modal_initialized) {
					let datatable_dialects = app.manager.create_dialect_list_modal(jQuery("#dialect_modal"), dialect_data);
					app.manager.addData("datatable_dialects", datatable_dialects)
					app.manager.dialect_modal_initialized = true;
				}

				if (!jQuery("#welcome_modal").hasClass("in")) {
					app.ui.showCustomModalBackdrop();
					if (callbackOpenModal) {
						callbackOpenModal();
					}
				}
			}

		});

	}

	/**
	 * [get_submited_answers description]
	 * @param  {Function} callback [description]
	 * @return {void}            [description]
	 */
	get_submited_answers(callback) {

		if (!app.manager.user_data.userLoggedIn) {
			app.ui.addLoginToolTip();
			app.ui.startLoginTimer();
		}

		app.manager.check_user_aeusserungen();

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'send_location_submited_asnswers_count',
				lang: app.manager.current_language
			},
			success: function(response) {
				var data = JSON.parse(response);
				var location_data_count = data.data_count;
				var is_admin = data.can_edit;

				app.loader.get_aeussetungen_locations_curLang(location_data_count, is_admin, callback);

				var aeusserungen_by_locationindex = new Object();
				app.manager.addData("aeusserungen_by_locationindex", aeusserungen_by_locationindex);
			}
		});


	}

	/**
	 * [get_submited_answers_current_location description]
	 * @param  {Number} location_id [description]
	 * @param  {var} marker      [description]
	 * @return {void}             [description]
	 */
	get_submited_answers_current_location(location_id, marker) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'get_submited_answers_current_location',
				lang: app.manager.current_language,
				location_id: location_id
			},
			success: function(response) {

				var data = JSON.parse(response);
				var submited_anwerts_current_location = data.submited_data;
				var is_admin = data.can_edit;
				app.manager.getData("aeusserungen_by_locationindex").data_value[location_id] = submited_anwerts_current_location;

				jQuery('#custom_backdrop').fadeOut('slow');
				app.manager.openLocationListModal(marker);

			}
		});

	}


	/**
	 * [getHighScoresFromDB description]
	 * @param  {Function} callback [description]
	 * @return {void}            [description]
	 */
	getHighScoresFromDB(callback) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'getHighScores',
				lang: app.manager.current_language,
				num: 10
			},
			success: function(response) {

				var result = JSON.parse(response);
				app.manager.top_concepts = result["top_concepts"];
				app.manager.top_users = result["top_users"];
				app.manager.top_locations = result["top_locations"];

				if (typeof callback == "function") callback();

			}

		});
	}

	/**
	 * Display markers for each location and the corresponding number of answers in each one.
	 * @param  {Array} arrayA   Indexed array(index: location id) of each location(name, center point).
	 * @param  {Boolean} can_edit Checks if the user can edit the answers(Only for admins).
	 *
	 */
	get_aeussetungen_locations_curLang(arrayA, can_edit, callback) {
		for (var key in arrayA) {
			if (arrayA.hasOwnProperty(key)) {
				if (arrayA[key].count != null) app.map.display_location_markers(arrayA[key], can_edit);
			}
		}

		app.map.pixioverlay.completeDraw(); //inital DRAW

		setTimeout(function() {

			jQuery('#custom_backdrop').fadeOut('slow', function() {
				jQuery(this).remove();
			});

			jQuery('#custom_backdrop').remove();
			jQuery('#custom_backdrop').remove();
			jQuery("#welcomeback_modal").hide()
			callback();

		}, 300);
	}

	/**
	 * [get_submited_answers_current_user description]
	 * @param  {Function} callback [description]
	 * @return {void}            [description]
	 */
	get_submited_answers_current_user(callback) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'get_submited_answers_current_user',
				lang: app.manager.current_language
			},
			success: function(response) {
				var data = JSON.parse(response);
				var submited_answers_current_user = data.submited_answers_current_user;
				var is_admin = data.can_edit;

				app.loader.add_submited_answers_to_index_submitedAnswers_array(submited_answers_current_user, is_admin);

				var num_of_answers_by_id = app.manager.createAnswersToEntryNumbers(app.manager.submitedAnswers_indexed);
				app.manager.addData("num_of_answers_by_id", num_of_answers_by_id)
				app.manager.checkEnteredConcepts_indexed();

				app.ui.populate_concept_span(function() {
					console.log("test running")
				});
				callback();
			}

		});
	}

	/**
	 * Gets values from all answer-input fields and performs an ajax call with the user's answer to be saved in the database. 
	 * Performs all checks if all fields are filled correctly. And places a marker when the input is saved in the database.
	 * @function saveWord
	 */
	saveWord() {

		var input_word = jQuery("#user_input").val();
		var location = jQuery('#location_span').html();
		var location_id = jQuery('#location_span').attr('data-id_location');
		var concept = jQuery('#word_span').html();
		var concept_id = jQuery('#word_span').attr('data-id_concept');

		if (!app.manager.user_data.current_user_age) {
			app.manager.user_data.current_user_age = "";
		}

		//error handling, if user changes the va_phase after choosing a concept form a certain va_phase
		if (app.loader.get_table_index_by_va_phase(concept_id)) {
			var concept_index = app.loader.get_table_index_by_va_phase(concept_id);
		} else {
			if (app.manager.va_phase == 1) {
				app.manager.va_phase = 2;
			} else {
				app.manager.va_phase = 1;
			}
			var concept_index = app.loader.get_table_index_by_va_phase(concept_id);
		}

		/*Check if fields for conzept and region are filled*/
		if (input_word.localeCompare("") != 0 && location_id != null && app.ui.concept_selected == true) {

			app.ui.stage = 5;
			jQuery('#submitanswer').popover('hide');

			var answer = {
				concept: concept,
				user_input: input_word,
				location: location,
				location_id: location_id
			};

			if (!app.manager.isDuplicate_indexed(answer)) {

				/**
				 * Gets user's ID. Used to generate a unique crowder_id cookie, when the user submits an answer.
				 * @async
				 * @function getUserID
				 */
				jQuery.ajax({
					url: ajax_object.ajax_url,
					type: 'POST',
					data: {
						action: 'getUserID',
					},
					success: function(response) {

						if (app.manager.user_data.current_user == null) {
							app.manager.user_data.current_user = JSON.parse(response);
						}

						app.loader.createCookie("crowder_id", app.manager.user_data.current_user);

						/**
						 * Send all data(location, location id, concept, concept id, user answer and current user id(not logged in users) or user name(logged in users)) to server.
						 * @function save_word_async
						 * @async
						 */
						jQuery.ajax({
							url: ajax_object.ajax_url,
							type: 'POST',
							data: {
								action: 'saveWord',
								gemeinde: location,
								gemeinde_id: location_id,
								konzept: concept,
								konzept_Id: concept_id,
								bezeichnung: input_word,
								current_user: app.manager.user_data.current_user,
								current_language: app.manager.current_language,
								current_dialect: app.manager.selected_dialect,
								current_user_age: app.manager.user_data.current_user_age

							},
							beforeSend: function() {

							},
							success: function(response) {

								var id_aeusserung = JSON.parse(response);

								if (id_aeusserung == null) return;

								jQuery('#image_modal').modal('hide');

								/**
								 * Load the location's polygon to be displayed on the map, when user's answer is successfully saved to the database.
								 * @function load_location_polygon
								 * @async
								 */
								jQuery.ajax({
									url: ajax_object.ajax_url,
									type: 'POST',
									data: {
										action: 'getChoosenGemeinde',
										location_id: location_id,
										searchedGemeinde: location,
										concept: concept,
										concept_id: concept_id,
										bezeichnung: input_word
									},
									success: function(response) {
										//add the location and it's id, it they do not exist in the data tables.
										var ob = {
											id: location_id,
											name: location
										};
										if (app.loader.include(app.manager.getData("locations").data_value, ob) !== true) {
											app.manager.getData("locations").data_value.push(ob);
										}

										app.manager.session_answer_count++;
										if (!app.manager.user_data.userLoggedIn) app.ui.checkLoginPopUp();

										var answer = {
											concept: concept,
											user_input: input_word,
											location: location,
											id_auesserung: id_aeusserung,
											concept_id: concept_id,
											concept_index: concept_index
										};

										if (!app.manager.getData("submitedAnswers")) app.manager.addData("submitedAnswers", [])
										app.manager.getData("submitedAnswers").data_value.push(answer);
										app.manager.submitedAnswers_indexed[id_aeusserung] = answer;
										delete app.manager.unanswered_concepts[concept_index];

										var entry = {};
										entry[id_aeusserung] = {
											author: app.manager.user_data.current_user,
											id_aeusserung: id_aeusserung.toString(),
											id_concept: concept_id,
											id_geo: location_id,
											konzept: concept,
											ortsname: location,
											word: input_word,
											tokenisiert: "0"
										};

										if (app.manager.getData("aeusserungen_by_locationindex").data_value[location_id] == null) {
											app.manager.getData("aeusserungen_by_locationindex").data_value[location_id] = entry;
										} else {
											app.manager.getData("aeusserungen_by_locationindex").data_value[location_id][id_aeusserung] = {
												author: app.manager.user_data.current_user,
												id_aeusserung: id_aeusserung.toString(),
												id_concept: concept_id,
												id_geo: location_id,
												konzept: concept,
												ortsname: location,
												word: input_word,
												tokenisiert: "0"
											};
										}

										app.map.remove_location_search_listener();
										app.map.add_user_marker(JSON.parse(response), id_aeusserung);
										app.map.change_feature_style(app.map.old_feature, app.manager.check_user_aesserungen_in_location(location));

										setTimeout(function() {

											if (app.map.location_markers[location_id]) {
												app.map.change_marker(app.map.location_markers[location_id], 1, "green");
											} else {
												var obj = JSON.parse(response);
												var element = {
													count: "1",
													geo_data: {
														geo: obj.centerCoordinates,
														location_id: obj.location_id,
														userCheck: true
													},
													geo: obj.centerCoordinates,
													location_id: obj.location_id,
													userCheck: true,
													location_name: location
												};

												app.map.display_location_markers(element);
												app.map.pixioverlay.completeDraw();
											}

										}, 300);

										//prompt user to register/send data anonimously
										if (Object.keys(app.manager.submitedAnswers_indexed).length == 1) {
											setTimeout(function() {
												app.ui.openRegisterOrAnonymousModal();
											}, 1000);
										}

										jQuery('#word_span').data("id_concept", null);

										jQuery('.row_1').fadeOut().fadeIn();
										jQuery('.row_2').fadeOut(function() {
											jQuery('#submitanswer').popover('hide');

											jQuery('#user_input').val("");
											jQuery('#word_span').text(app.manager.getTranslation("the_word_concept"));
											setTimeout(function() {

												jQuery('#word_span').popover('show');

												jQuery('.pop_word_span').parent().on('click', function() {
													app.ui.handleWordSpanClick();
												}).addClass('c_hover');
											}, 1000);
											app.ui.process_restarted = true;

										}).fadeIn();

										app.ui.concept_selected = false;
										app.ui.word_entered = false;
										app.ui.stage = 3;

										app.ui.deSelectTableEntry(concept_index);

										var entry = app.manager.getData("num_of_answers_by_id").data_value[parseInt(concept_id)];

										if (entry == null) {
											app.manager.getData("num_of_answers_by_id").data_value[parseInt(concept_id)] = 1;
										} else {
											app.manager.getData("num_of_answers_by_id").data_value[parseInt(concept_id)] += 1;
										}

										app.manager.checkTableEntry(concept_id);

										var row = jQuery(app.manager.getDataTable("datatable_concepts").row(concept_index).node());
										if (row.find('.num_of_answers').length == 0) {
											row.find('.dataparent').append(jQuery('<div class="num_of_answers">1</div>'));
											if (row.find(".wiki_info").length == 1) row.find('.num_of_answers').addClass("answers_with_wiki");
										} else {
											row.find('.num_of_answers').text(app.manager.getData("num_of_answers_by_id").data_value[parseInt(concept_id)]);
											if (row.find(".wiki_info").length == 1) row.find('.num_of_answers').addClass("answers_with_wiki");
										}

										app.manager.current_concept_index = -1;

										var ua = navigator.userAgent.toLowerCase();
										var isAndroid = ua.indexOf("android") > -1;
										if (isAndroid) {
											app.map.map.panTo(app.map.location_markers[location_id].getPosition());
										}

									}
								});

							}
						});

					}
				});
			} else {

				for (var key in app.manager.submitedAnswers_indexed) {
					if (app.manager.submitedAnswers_indexed.hasOwnProperty(key)) {
						if (input_word.localeCompare(app.manager.submitedAnswers_indexed[key].user_input) == 0 && concept.localeCompare(app.manager.submitedAnswers_indexed[key].concept) == 0) {
							var id_auesserung = app.manager.submitedAnswers_indexed[key].id_auesserung;
							var concept_id = app.manager.submitedAnswers_indexed[key].concept_id;
							break;
						}
					}
				}


				app.ui.editInputA(id_auesserung, concept_id, location_id, concept, false);




			}
		} else {
			jQuery('.message_modal_content').text(app.manager.getTranslation("user_input_not_full"));
			jQuery('#message_modal').modal({
				backdrop: 'static',
				keyboard: false
			});
		}


	}

	/**
	 * [save_user_dialect description]
	 * @param  {String} user_name [description]
	 * @return {void}           [description]
	 */
	save_user_dialect(user_name) {

		var parsed_name = user_name.replace(/\s/g, ".");

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'save_user_dialect',
				user_name: parsed_name.toLowerCase(),
				user_dialect: app.manager.selected_dialect
			},
			success: function(response) {
				console.log("Dialect Added");
				console.log(JSON.parse(response));
			}
		});
	}

	/**
	 * After Choosing a locations from the location data tables. Get the location's polygon and display it.
	 * When location is choosen show polygon will check if this location's polygon exists else it will get it from the database
	 * @param  {String} g_location    [description]
	 * @param  {Number} g_location_id [description]
	 * @param  {Number} index         [description]
	 *
	 */
	get_display_polygon(g_location, g_location_id, zoom_active) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'getPolygonGemeinde',
				location_id: g_location_id,
				searchedGemeinde: g_location,
			},
			success: function(response) {
				if (!app.manager.getData("existingLocations").data_value) app.manager.addData("existingLocations", [])
				app.manager.getData("existingLocations").data_value.push(JSON.parse(response).location_id);
				app.map.addGeometry(JSON.parse(response).polygonCoordinates, JSON.parse(response));

				if (zoom_active) {
					if (app.map.map.getZoom() > 6) {
						app.map.map.setZoom(6);
					}
				}

				var lat = app.map.geo_manager.parseGeoDataFormated(JSON.parse(response).centerCoordinates).geoData.lat;
				var lng = app.map.geo_manager.parseGeoDataFormated(JSON.parse(response).centerCoordinates).geoData.lng;

				app.map.centerCoordinates_locations.push({
					'id': JSON.parse(response).location_id,
					'lat': lat,
					'lng': lng
				});

				if (zoom_active) {
					app.map.map.flyTo([lat, lng], 10, { animate: true, duration: 0.5 });
				}

				if (app.ui.stage == 5) {
					app.ui.stage = 6;

					setTimeout(function() {
						jQuery('#word_span').popover('show');
						app.ui.displayTooltips(true);
					}, 2000);
				}

			}
		}); //ajax end

	}

	/**
	 * [create_cookie description]
	 * @param  {Number} lang [description]
	 * @return {void}      [description]
	 */
	create_cookie(lang) {
		app.loader.createCookie("language_crowder", lang);
	}


	/**
	 * Delete cookie.
	 * @param  {String} name [description]
	 *
	 */
	eraseCookie(name) {
		this.createCookie(name, "", -1);
	}

	/**
	 * Creates a cookie with name, value and exp. date
	 * @param  {String} name  [description]
	 * @param  {String} value [description]
	 * @param  {Number} days  [description]
	 *
	 */
	createCookie(name, value, days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
		} else var expires = "";
		document.cookie = name + "=" + value + expires + "; path=/";
	}

	/**
	 * [add_submited_answers_to_index_submitedAnswers_array description]
	 * @param {Array} arrayA   [description]
	 * @param {Boolean} can_edit [description]
	 */
	add_submited_answers_to_index_submitedAnswers_array(arrayA, can_edit) {
		var result = {};
		var is_admin = can_edit;


		for (var i = 0; i < arrayA.length; i++) {
			var obj = arrayA[i];

			var concept_id = obj.id_concept;
			var concept = obj.konzept;
			var word_inputed = obj.word;
			var location_name = obj.ortsname;
			var id_auesserung = obj.id_aeusserung;
			var author = obj.author;

			if ((author.localeCompare(app.manager.user_data.current_user) == 0 && author.localeCompare("anonymousCrowder_90322") != 0) || is_admin) {
				var concept_idx = app.loader.get_table_index_by_va_phase(parseInt(concept_id));

				var answer = { concept: concept, user_input: word_inputed, location: location_name, id_auesserung: id_auesserung, concept_id: concept_id, concept_index: concept_idx };
				app.manager.submitedAnswers_indexed[parseInt(id_auesserung)] = answer;
			}

		}

	}

	/**
	 * [get_table_index_by_va_phase description]
	 * @param  {Number} _concept_id [description]
	 * @return {NUmber}             [description]
	 */
	get_table_index_by_va_phase(_concept_id) {

		var index;

		if (app.manager.getData("concepts_index_by_id").data_value[parseInt(_concept_id)]) {
			index = app.manager.getData("concepts_index_by_id").data_value[parseInt(_concept_id)].index;
		}

		return index;
	}


	/**
	 * [get_location_and_display description]
	 * @param  {Number} lat [description]
	 * @param  {Number} lng [description]
	 * @return {void}     [description]
	 */
	get_location_and_display(lat, lng) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'searchLocation',
				lat: lat,
				lng: lng,
			},
			success: function(response) {

				var data = JSON.parse(response);
				var loc_name = data.name;
				var loc_id = data.id;

				if (loc_name != null) {
					jQuery('#location_span').text(loc_name);
					jQuery('#location_span').attr("data-id_location", loc_id);

					app.ui.location_selected = true;
					if (app.ui.concept_selected !== true) {
						if (app.manager.url_concept_id) {
							app.ui.concept_selected = true;
						} else {
							app.ui.concept_selected = false;
						}
					}
					app.ui.word_entered = false;
					app.ui.tutorial_running = true;

					app.ui.setDynamicContent('list');
					app.ui.displayTooltips(true);
					app.ui.showPopUp();


					app.map.showPolygon(loc_name, loc_id, false);
				} else {
					jQuery('#custom_backdrop').hide().css('background', '');
					console.log("Nothing found");
					jQuery('.message_modal_content').text(app.manager.getTranslation("nothing_found"));
					jQuery('#message_modal').modal({
						backdrop: 'static',
						keyboard: false
					});
				}

			}
		});

	}

	/**
	 * Used in saveWord(), checks if an location object allready exists in the locations array
	 * @param  {Array} arr Array of Objects
	 * @param  {Object} obj Single Object
	 * @return {Boolean}     True if object is in the array
	 */
	include(arr, obj) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].id == obj.id) return true;
		}
	}


	/**
	 * [sendSuggestEmail description]
	 * @param  {String}   entry    [description]
	 * @param  {Function} callback [description]
	 * @return {void}            [description]
	 */
	sendSuggestEmail(entry, callback) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'sendSuggestEmail',
				entry: entry,
				user: app.manager.user_data.current_user,
				email: app.manager.user_data.user_email,
			},
			success: function(response) {

				callback();
			}

		});

	}

}


/**
 * Construct an Ajax Call.
 */
class AjaxCaller {
	constructor(type, ajax_data, success_callback, error_callback, async) {
		this.type = type
		this.ajax_data = ajax_data
		this.success_callback = success_callback
		this.error_callback = error_callback
		this.async = async
	}

	get_results() {
		return jQuery.ajax({
			url: ajax_object.ajax_url,
			type: this.type,
			async: this.async,
			data: this.ajax_data,
			success: this.success_callback,
			error: this.error_callback
		});
	}


	prepareAjax() {
		var properties = {
			url: ajax_object.ajax_url,
			type: this.type,
			async: this.async,
			data: this.ajax_data,
			success: this.success_callback,
			error: this.error_callback
		}

		var defer = jQuery.Deferred();

		var promise = defer.promise();

		return jQuery.extend(promise, {
			execute: function() {
				return jQuery.ajax(properties).then(defer.resolve.bind(defer), defer.reject.bind(defer));
			}
		});
	}
}