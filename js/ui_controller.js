/**
 * UIController
 */

class UIController {
	constructor() {
		/**
		 * Image Upload Logic
		 * @type {ImageUpload}
		 */
		this.image_uploader = new ImageUpload()

		/**
		 * URL
		 */
		this.url

		/**
		 * [offsetHeight description]
		 * @type {Number}
		 */
		this.offsetHeight = 0;

		/**
		 * [old_doc_width description]
		 * @type {Number}
		 */
		this.old_doc_width = 0;

		/**
		 * States and Variables
		 */
		
		/**
		 * Current State Value
		 * @type {Number}
		 */
		this.stage = 1

		/**
		 * [prevent_backdrop description]
		 * @type {Boolean}
		 */
		this.prevent_backdrop = false

				/**
		 * [prevent_backdrop description]
		 * @type {Boolean}
		 */
		this.prevent_concept_hint = false

		/**
		 * [do_image_modal description]
		 * @type {Boolean}
		 */
		this.do_image_modal = false

		/**
		 * [tutorial_running description]
		 * @type {Boolean}
		 */
		this.tutorial_running = false

		/**
		 * [location_selected description]
		 * @type {Boolean}
		 */
		this.location_selected = false

		/**
		 * [concept_selected description]
		 * @type {Boolean}
		 */
		this.concept_selected = false

		/**
		 * [word_entered description]
		 * @type {Boolean}
		 */
		this.word_entered = false

		/**
		 * [process_restarted description]
		 * @type {Boolean}
		 */
		this.process_restarted = false

		/**
		 * [break_cycle description]
		 * @type {Boolean}
		 */
		this.break_cycle = false

		/**
		 * [uploading description]
		 * @type {Boolean}
		 */
		this.uploading = false

		/**
		 * [choosing_location_mode description]
		 * @type {Boolean}
		 */
		this.choosing_location_mode = false

		/**
		 * [location_listener_added description]
		 * @type {Boolean}
		 */
		this.location_listener_added = false

		/**
		 * [inside_location_listener_added description]
		 * @type {Boolean}
		 */
		this.inside_location_listener_added = false


		this.prevent_randomclick

		this.current_top_list_table

		this.sendingFeedback = false;
	}

	
	/**
	 * Initializes UI elements according to the browser. Sets the map in the center of the browser.
	 * @return {void} [description]
	 */
	initTool() {


		jQuery( window ).resize(function() {
	    	app.ui.setDynamicContent("no_source") // DO NOT REMOVE: IMPORTANT BECAUSE OF TOOLTIPS!!! (paramter not important here);
		});

		jQuery('body').addClass('crowdBody');

		this.url = new URL(window.location.href);
		app.manager.url_concept_id = this.url.searchParams.get("concept");
		var current_language = 0;

		if (this.url.searchParams.get("dcluster")) {
			app.manager.url_dialect_cluster = this.url.searchParams.get("dcluster");
		} else {
			app.manager.url_dialect_cluster = "";
		}

		if (this.url.searchParams.get("dialect")) {
			app.manager.url_dialect = this.url.searchParams.get("dialect");
		} else {
			app.manager.url_dialect = "";
		}

		if (app.manager.url_concept_id) jQuery('body').addClass('bavaria_version');

		app.map.calculateCenter();

		var offsetHeight = jQuery('#left_menu').outerHeight();

		if (!app.manager.dialect_modal_initialized) {
			app.loader.get_dialects();
		}

		this.addModalListeners();

		if (app.manager.user_data.language_is_set && app.manager.user_data.crowder_dialect) {
			// console.log("Lang and Dialect Selected");

			this.setRandomTitelImage(function() {
				jQuery('#welcomeback_modal').addClass("fade");

				if (app.manager.url_concept_id) {
					jQuery('#welcomeback_modal').find('#modal_welcomeback').html("Willkommen!");
				} else {
					jQuery('#welcomeback_modal').find('#modal_welcomeback').html(app.manager.getTranslation("welcomeback_texts"));
				}

				setTimeout(function() {
					jQuery('#welcomeback_modal').modal({
						keyboard: false
					})
				}, 250);

			}, ".welcome_modal");

			jQuery('#welcomeback_modal').hide()


		} else if (app.manager.user_data.language_is_set && !app.manager.user_data.crowder_dialect) {
			// console.log("Lang selected, Dialect Not");

			current_language = parseInt(app.manager.user_data.crowder_lang);
			app.manager.current_language = current_language

			this.initWelcomeModal();

			var clone_1 = jQuery("#modal_welcome").clone().attr('id', 'modal_welcome_c');
			var clone_2 = jQuery("#slogan_id").clone().attr('id', 'slogan_id_c');
			jQuery("#modal_welcome").replaceWith(clone_1);
			jQuery("#slogan_id").replaceWith(clone_2);

			jQuery("#language_select").remove();

			jQuery('.outerselect-container').removeAttr('style');

			jQuery(".switch_page_icon").css({

				'height': '44px',
				'width': '148px',
				'border': '1px solid white',
				'display': 'inline-block',
				'border-radius': '5px',
				'margin-left': -'5px'
			});

			this.setRandomTitelImage(function() {

				jQuery('#welcome_modal').modal({
					backdrop: 'static',
					keyboard: false
				})

			}, ".welcome_modal");

			setTimeout(function() {
				var index_carousel = jQuery('.findicators');

				if (jQuery('*[data-slide-to="0"]').hasClass('active')) {
					jQuery('#first_slider').carousel('next');
				}

			}, 1500);

		} else {
			// console.log("Lang And Dialect NOT Selected");

			current_language = -1;
			app.manager.current_language = current_language
			this.initWelcomeModal();

			this.setRandomTitelImage(function() {

				jQuery('#welcome_modal').modal({
					backdrop: 'static',
					keyboard: false
				})

			}, ".welcome_modal");
		}


	}


	/**
	 * Initializes FAQ Modal.
	 * @return {void} [description]
	 */
	initFAQModal(){
		jQuery('.helpanswer li').on('click',function(){
			var index=jQuery(this).index()+1;
			jQuery('#currentFAQAnswer').text(app.manager.getTranslation("CS_FAQ_ANSWER"+index))
			jQuery('#faqAnswerModal').modal({keyboard:true});
			jQuery('.help_cover').fadeIn();
		})

		jQuery('.help_modal_show_intro').on('click',function(){
					jQuery('#currentFAQAnswer').text(app.manager.getTranslation("instruction_texts"))
						jQuery('#faqAnswerModal').modal({keyboard:true});
						jQuery('.help_cover').fadeIn();
		})

		jQuery('#faqAnswerModal').on('hidden.bs.modal',function(){
				jQuery('.help_cover').fadeOut();
		})

		jQuery('.help_modal_show_intro span').text(app.manager.getTranslation("instruction_heads"));
		jQuery('#feedbackbutton').text(app.manager.getTranslation("submit_texts"));
		jQuery('#help_intro').text(app.manager.getTranslation("CS_HELP_INTRO"));
		jQuery('#questions_feedback').text(app.manager.getTranslation("CS_HELP_QUESTION_FEEDBACK"));

		var numberOfQuestions = 4; //change according to number of FAQ Questions in database or TODO query how many.

		for(var i=1;i<numberOfQuestions+1;i++){
			jQuery('#faq'+i).text(app.manager.getTranslation("CS_FAQ"+i));
		}
		
			
		if(app.manager.user_data.userLoggedIn){
			jQuery('#help_text').prop('disabled',false);

			jQuery('#feedbackbutton').on('click',function(){
			 if(app.ui.sendingFeedback) return;
			 app.ui.sendingFeedback = true;		
			var textboxlength = jQuery("#help_text").val().length;
			if(textboxlength>100){

	          app.loader.sendFeedbackEmail(jQuery('#help_text').val(), function() {

                    jQuery('#feedbackbutton').fadeOut('fast', function() {
            	      var feedback_div = jQuery('<div style="background: #0000008a;" class="feedback_suggest">' + app.manager.getTranslation("CS_FAQ_ANSWER_SENT") + '</div>');
                      feedback_div.insertAfter("#help_text" );
                      feedback_div.fadeIn('fast');

                      setTimeout(function() {
                        jQuery('#help_modal').modal('hide');
                    	jQuery('#help_text').val("");
                    	feedback_div.remove();
                    	jQuery('#feedbackbutton').fadeIn();
        		 	     app.ui.sendingFeedback = false;		
                    },1500)

                  })
			}) 

	      }

	      else{
	      	jQuery('#help_text').css('border-color','red');
	      	jQuery('#help_text').css('color','red');
			jQuery('#help_text').val(app.manager.getTranslation("CS_FAQ_WARNING"))
	    
	      	 setTimeout(function() {
	      	 	jQuery('#help_text').css('border-color','rgb(204, 204, 204)');
	      	 	jQuery('#help_text').css('color','black');
	      	 	jQuery('#help_text').val("");
      	 	    app.ui.sendingFeedback = false;		
	      	 }, 1000);
	      }

	     })     
		}
		else{
			jQuery('#feedbackbutton').on('click',function(){
				jQuery('#help_modal').modal('hide');
				jQuery('#help_modal').one('hidden.bs.modal',function(){
					app.ui.openWhyRegisterModal();
				})
			})
		}

	}

	
	/**
	 * Initializes the Modal at the start of the CS-Tool, when the user has not yet choosen a language, has not yet registred.
	 * @return {void} [description]
	 */
	initWelcomeModal() {

		jQuery('#welcome_modal').on('show.bs.modal', function(e) {

			app.ui.showCustomModalBackdrop();

			var selectbox = jQuery('#language_select', this).selectBoxIt({
				theme: "bootstrap",
				defaultText: "Sprache ...",
				showFirstOption: false
			});
			jQuery(".infotext_container").mCustomScrollbar({
				scrollButtons: {
					enable: true
				}
			});

			app.ui.cycleText(jQuery("#modal_welcome"), app.manager.getTranslation("welcome_texts", false, true), 0, function(i) {

				i -= 1;
				// jQuery("#language_selectSelectBoxItText").text(app.manager.getTranslation("language_texts", i));
				// jQuery("#language_selectSelectBoxItText").attr('data-val', app.manager.getTranslation("language_texts", i));
				// console.log(app.manager.getTranslation("language_texts", false, false, i))
				// console.log(app.manager.getTranslation("language_texts", false, false, i))
				jQuery("#language_selectSelectBoxItText").text(app.manager.getTranslation("language_texts", false, false, i));
				jQuery("#language_selectSelectBoxItText").attr('data-val', app.manager.getTranslation("language_texts", false, false, i));

				// jQuery("#navigation_languages").text(navigation_languages[i]);
			});

			app.ui.cycleText(jQuery("#slogan_id"), app.manager.getTranslation("slogan_texts", false, true), 0);
			app.ui.cycleText(jQuery("#navigation_languages"), app.manager.getTranslation("navigation_languages", false, true), 0);


			selectbox.on('open', function() {
				if (jQuery('#welcome_modal').find('.modal-content').height() < 340)
					jQuery('.findicators').hide();
			});

			selectbox.on('close', function() {
				jQuery('.findicators').show();
			});

			selectbox.on('change', function() {

				var current_lang;
				var idx = jQuery(this).val();

				jQuery('#testdiv').hide();

				var select_index = 0;
				select_index = app.manager.getTranslation("languages", false, true).indexOf(idx);


				var current_language = select_index;
				app.manager.current_language = current_language

				var clone_1;
				var clone_2;
				var clone_3;

				if (!app.ui.break_cycle) {

					current_lang = jQuery("#modal_welcome").attr('lang_id');
					if (current_lang == 4) current_lang = 0;

					clone_1 = jQuery("#modal_welcome").clone().attr('id', 'modal_welcome_c');
					clone_2 = jQuery("#slogan_id").clone().attr('id', 'slogan_id_c');
					clone_3 = jQuery("#navigation_languages").clone().attr('id', 'navigation_languages_c');

					jQuery("#modal_welcome").replaceWith(clone_1);
					jQuery("#slogan_id").replaceWith(clone_2);
					jQuery("#navigation_languages").replaceWith(clone_3);

					app.ui.break_cycle = true;

				} else {

					clone_1 = jQuery('#modal_welcome_c');
					clone_2 = jQuery('#slogan_id_c');
					clone_3 = jQuery('#navigation_languages_c');
					current_lang = clone_1.attr('lang_id');

				}


				if (select_index != current_lang) {
					clone_1.animate({
						opacity: 0
					}, 801);
					clone_3.animate({
						opacity: 0
					}, 801);
					clone_2.animate({
						opacity: 0
					}, 801, function() {

						clone_1.text(app.manager.getTranslation("welcome_texts", select_index)) // [select_index]);
						clone_2.text(app.manager.getTranslation("slogan_texts", select_index)) //[select_index]);
						clone_3.text(app.manager.getTranslation("navigation_languages", select_index)) //[select_index]);

						clone_1.animate({
							opacity: 1
						}, 501);
						clone_2.animate({
							opacity: 1
						}, 501);
						clone_3.animate({
							opacity: 1
						}, 501);

					});

				} else {
					clone_1.css('opacity', '1');
					clone_2.css('opacity', '1');
					clone_3.css('opacity', '1');
					clone_1.text(app.manager.getTranslation("welcome_texts"));
					clone_2.text(app.manager.getTranslation("slogan_texts"));
					clone_3.text(app.manager.getTranslation("navigation_languages"));
				}

				clone_1.attr('lang_id', select_index);
				clone_2.attr('lang_id', select_index);
				clone_3.attr('lang_id', select_index);

			});

		});

		jQuery('#welcome_modal').hammer().bind("swipeleft", function(e) {

			if (jQuery(".active", e.target).index() == 1 && app.manager.selected_dialect) {
				jQuery('#welcome_modal').modal('hide');

			} else {
				if (app.manager.current_language != -1) {
					jQuery('#first_slider').carousel('next');
				} else {
					app.ui.openLanguageModal();
				}
			}

		});

		jQuery('#welcome_modal').hammer().bind("swiperight", function() {
			if (app.manager.current_language != -1) {
				jQuery('#first_slider').carousel('prev');
			} else {
				app.ui.openLanguageModal();
			}

		});


		jQuery('.switch_page_icon').on('click', function() {
			if (app.manager.current_language != -1) {
				jQuery('#first_slider').carousel('next');
			} else {
				app.ui.openLanguageModal();
			}
		})

		jQuery('.c-back-button').on('click', function() {
			jQuery('#first_slider').carousel('prev');
		})

		jQuery('#first_slider').on('slide.bs.carousel', function(e) {


			if (jQuery(".active", e.target).index() == 0) {

				jQuery('.c-back-button').fadeIn('slow');
				jQuery('.infotext_head').text(app.manager.getTranslation("instruction_heads"));
    	
				jQuery(".text-left-span").text(app.manager.getTranslation("instruction_texts"));
				jQuery("#dialekt_span").text(app.manager.getTranslation("lang_dialect_abbreviation"));
				jQuery("#go_span").text(app.manager.getTranslation("go_texts"));
				jQuery("#suggest_dialect_span").text(app.manager.getTranslation("suggest_dialect_texts"))
				jQuery("#show_all_dialects_span").text(app.manager.getTranslation("all_dialects_texts"))

				jQuery("#data_remark").text(app.manager.getTranslation("data_remark"));

				jQuery('#remark_link').attr('href', app.manager.getTranslation("remark_link"));

			} else {
				jQuery('.c-back-button').fadeOut('fast');
			}
		})


		jQuery('#start_tool').on('click', function() {
			if (app.manager.selected_dialect !== "") {
				jQuery('#welcome_modal').modal('hide');

			} else {
				jQuery('#dialect_not_selected_modal').modal({backdrop:true});
			}
		})

		jQuery('#dialect_btn').on('click', function() {
			app.ui.openDialectModal();
		})

		jQuery('#welcome_modal').on('hidden.bs.modal', function() {

			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() });

			if (app.manager.selected_dialect !== "") {
				app.startMainTool();
				//showCustomBackdrop();
			} else {
				jQuery('#dialect_not_selected_modal').modal({keyboard:true});
			}
		})


	}



	/**
	 * Ajusts HTML-Elemets size according to the browser.
	 * @param {String} source [description]
	 */
	setDynamicContent(source) {

		

		var doc_width = jQuery(document).width();
		var doc_height = jQuery(document).height();

		var offsetHeight = jQuery('#left_menu').outerHeight(); //update height for leftmenu

		if (doc_width <= 330) {
			jQuery('#left_menu').css('padding-left', "9px").css('padding-right', "0px");
			jQuery('.row_2').css('text-align', 'center');
		} else {
			jQuery('#left_menu').css('padding-left', "20px").css('padding-right', "20px");
			jQuery('.row_2').css('text-align', 'right');
		}


		if (doc_width < 576) {
			jQuery('.row_1').css('font-size', "17px");
			jQuery('.row_2').css('font-size', "17px").css('margin-left', "0px");
		}

		if (doc_width > 1400) {
			jQuery('.row_1').css('font-size', "48px");
			jQuery('.row_2').css('font-size', "48px");
		} else if (doc_width < 1200 && doc_width > 576) {
			jQuery('.row_1').css('font-size', "3vw");
			jQuery('.row_2').css('font-size', "3vw");
		}


		if (jQuery('#image_modal').hasClass('in')) {

			jQuery('#image_modal').find('.i_fake_body').height(window.innerHeight - jQuery('#left_menu').height()-150);

			var modal_margin = 30;
			if (doc_width < 576) modal_margin = 10;

			var modal_height = jQuery('#image_modal').find('.i_fake_body').height() + 23 + modal_margin; //23 = footer, 30 = margin top
			var offsetHeight_l = document.getElementById('left_menu').offsetHeight + 20; //20 = before;

			var margin = 15;

			if ((modal_height + offsetHeight_l) > doc_height) {

				var dif = doc_height - (modal_height + offsetHeight_l);
				var current_height = jQuery('#image_modal').find('.i_fake_body').height();
				var new_height = current_height + dif - margin;
				jQuery('#image_modal').find('.i_fake_body').height(new_height);

			}

		}

		if (source != 'image') {

			var tooltips = app.manager.getTranslation("tooltips", false, true)
			for (var i = 0; i < tooltips.length; i++) {
				jQuery(tooltips[i].name).popover('dispose');
			}

			app.ui.addToolTips(app.manager.getTranslation("tooltips", false, true));

			if (jQuery('.login_popover').parent().parent().hasClass('in')) {
				jQuery('#icon_login').popover('dispose');
				app.ui.addLoginToolTip();
				app.ui.showLoginPopUp();
			}


			if (jQuery('.list_modal').hasClass('in')) {
				app.ui.displayTooltips(false);
				if (app.manager.modals_initialized) {
					app.manager.reMeasureDatatables();
				}
			}


			if (doc_width < 485) {

				var offsetstring = "0 0";

				if (app.manager.current_language == 0) {
					if (doc_width < 338 && doc_width > 329) { offsetstring = "0 -10"; }
					if (doc_width < 323) offsetstring = "0 20";
					if (doc_width < 307) { offsetstring = "0 -25"; }
				}

				if (app.manager.current_language == 1) {
					if (doc_width < 451) offsetstring = "0 -20";
				}

				if (app.manager.current_language == 2) {
					if (doc_width < 315) offsetstring = "0 10";
					if (doc_width < 302) offsetstring = "0 -20";
				}


				jQuery('#location_span').popover('dispose');

				jQuery('#location_span').popover({
					trigger: "manual",
					placement: "top",
					container: "body",
					html: true,
					content: '<div class="pop_location_span custom_popover_content">' + app.manager.getTranslation("location_select_texts_with_br") + '</div>',
					offset: offsetstring,
					animation: true

				});

				if (app.ui.stage == 1) {

					jQuery('#location_span').popover('show');

					jQuery('.pop_location_span').parent().on('click', function() {
						app.ui.handleLocationSpanClick();
					}).addClass('c_hover');

				}


			} else {

				jQuery('#location_span').popover('dispose');
				app.ui.addToolTip('#location_span', app.manager.getTranslation("location_select_texts_with_br", false, true));

			}

			if (app.ui.stage == 4) {
				jQuery('#submitanswer').popover('show');

				jQuery('.pop_submitanswer').parent().on('click', function() {

					if (!app.ui.submit_button_clicked) {
						app.loader.saveWord();
						app.ui.submit_button_clicked = true;
						setTimeout(function() { app.ui.submit_button_clicked = false; /*console.log('submit button: After saveword() ' + app.ui.submit_button_clicked);*/ }, 1000);
					}

				}).addClass('c_hover');

			}


			if (source != "list") app.ui.showPopUp();

		}

		if (app.ui.old_doc_width > 575 && doc_width < 575) {

			app.manager.reMeasureDatatables();
		} else if (app.ui.old_doc_width < 575 && doc_width > 575) {
			app.manager.reMeasureDatatables();
		}

		if (doc_width < 452) {
			jQuery('#register_modal .custom-modal-footer button').css('font-size', "10px");
			jQuery('#register_modal .modal-body').css('padding-right', "2px");
		} else {
			jQuery('#register_modal .custom-modal-footer button').css('font-size', "14px");
			jQuery('#register_modal .modal-body').css('padding-right', "10px");
		}

		jQuery('.popover:not(.login_popover_p)').addClass('bounce-6');

		app.ui.old_doc_width = doc_width;

	}


	/**
	 * TOOLTIPS FUNCTIONS
	 */

	/**
	 * [addToolTips description]
	 * @param {Object} elements [description]
	 */
	addToolTips(elements) {
		for (var i = 0; i < elements.length; i++) {
			app.ui.addToolTip(elements[i].name, elements[i].array);
		}
	}

	/**
	 * [addToolTip description]
	 * @param {String} element     [description]
	 * @param {String} title_array [description]
	 */
	addToolTip(element, title_array) {
		var class_string = element.replace("#", "");
		class_string = "pop_" + class_string;

		var offsetstring = "0 0";
		if (class_string == "pop_submitanswer") offsetstring = "5 9";

		title_array = title_array[app.manager.current_language]

		var pop = jQuery(element).popover({
			trigger: "manual",
			placement: "top",
			container: "html",
			content: '<div class="' + class_string + ' custom_popover_content">' + title_array + '</div>',
			html: true,
			animation: true,
			offset: offsetstring
		});


	}


	/**
	 * [displayTooltips description]
	 * @param  {Boolean} show [description]
	 * @return {void}      [description]
	 */
	displayTooltips(show) {
		if(!jQuery('.popover:not(.login_popover_p)').hasClass('bounce-6')){
		jQuery('.popover').addClass('bounce-6');
		}
		if (show) jQuery('.popover').css('opacity', '1');
		else jQuery('.popover').css('opacity', '0');
	}

	/**
	 * [showPopUp description]
	 * @return {void} [description]
	 */
	showPopUp() {



		if (app.ui.tutorial_running && app.ui.location_selected && !app.ui.concept_selected) {
			jQuery('#location_span').popover('hide');
			jQuery('#word_span').popover('show');
			app.ui.stage = 2;

			jQuery('.pop_word_span').parent().on('click', function() {
				app.ui.handleWordSpanClick();
			}).addClass('c_hover');

		} else if (app.ui.tutorial_running && !app.ui.location_selected && !app.ui.concept_selected) {
			app.ui.stage = 1;
			jQuery('#location_span').popover('show');

			jQuery('.pop_location_span').parent().on('click', function() {
				app.ui.handleLocationSpanClick();
			}).addClass('c_hover');

		} else if (app.ui.tutorial_running && !app.ui.location_selected && app.ui.concept_selected) {
			jQuery('#word_span').popover('hide');
			jQuery('#location_span').popover('show');
			app.ui.stage = 1;

			jQuery('.pop_location_span').parent().on('click', function() {
				app.ui.handleLocationSpanClick();
			}).addClass('c_hover');
		}

		// else if (app.ui.tutorial_running && app.ui.location_selected && app.ui.concept_selected) {

		//       jQuery('#location_span').popover('hide');
		//       options = {
		//         trigger: "manual",
		//         placement: "top",
		//         container: "body",
		//         html: true,
		//         content: '<div class="pop_word_span custom_popover_content">' + app.manager.getTranslation("upload_image_text") + '</div>'
		//       }

		//       jQuery('#word_span').popover('dispose');
		//       jQuery('#word_span').popover(options);
		//       jQuery('#word_span').popover("show");
		//       jQuery('.pop_word_span').parent().on('click', function() {
		//         console.log("CLICKED POPOVER")
		//         open_upload_image_modal()
		//       }).addClass('c_hover');
		//       console.log("UPLOAD MODAL OPEN")

		// } 
		else if (app.ui.tutorial_running && app.ui.location_selected & app.ui.concept_selected && !app.ui.word_entered) {
			jQuery('#word_span').popover('hide');
			jQuery('#location_span').popover('hide');
			jQuery('#user_input').popover('show');
			jQuery('#user_input').val("");
			app.ui.stage = 3;
			jQuery('.pop_user_input').parent().parent().css('top', "5px");

			jQuery('.pop_user_input').parent().on('click', function() {
				jQuery('#user_input').focus();
				if (app.ui.process_restarted) {
					app.map.closeAllInfoWindows();
					app.ui.process_restarted = false;
				}
			}).addClass('c_hover');

		}

		if (app.ui.word_entered && app.ui.stage < 4 && app.ui.location_selected && app.ui.concept_selected) {

			if (app.ui.stage != 4) {
				jQuery('#user_input').popover('hide');
				jQuery('#submitanswer').popover('show');
				jQuery('.pop_submitanswer').parent().on('click', function() {

					if (!app.ui.submit_button_clicked) {
						app.loader.saveWord();
						app.ui.submit_button_clicked = true;
						setTimeout(function() {
							app.ui.submit_button_clicked = false; /*console.log('submit button: After saveword() ' + app.ui.submit_button_clicked);*/
						}, 1000);
					}

				}).addClass('c_hover');

			}
			app.ui.stage = 4;
		}

		if (app.ui.stage == 6) {

			jQuery('#word_span').popover('hide');
			app.ui.tutorial_running = false;
		}


	}


	/**
	 * MODALS FUNCTIONS
	 */


	/**
	 * Adds event listeners to all modals.
	 */
	addModalListeners() {

		//allow modals without backdrop to be closed when clicked in area beside modal
		jQuery('body').on('click', function(e) {
			if (jQuery(e.target).attr('id') == 'upload_image_modal' && app.ui.uploading == false) jQuery('#upload_image_modal').modal('hide');
			if (jQuery(e.target).attr('id') == 'image_modal') jQuery('#image_modal').modal('hide');
		})

		jQuery('#locations_modal .customclose').on('click', function() {
			jQuery('#locations_modal').modal('hide');
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
		})

		jQuery('#concepts_modal .customclose').on('click', function() {
			jQuery('#concepts_modal').modal('hide');
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
		})

		jQuery('#image_modal .customclose').on('click', function() {
			jQuery('#image_modal').modal('hide');
		})

		jQuery('#message_modal .customclose').on('click', function() {
			jQuery('#message_modal').modal('hide');
		})

		jQuery('#language_modal .customclose').on('click', function() {
			jQuery('#language_modal').modal('hide');
		})

		jQuery('#faqAnswerModal .customclose').on('click', function() {
			jQuery('#faqAnswerModal').modal('hide');
		})


		jQuery('#tutorial_modal .customclose').on('click', function() {
			jQuery('#tutorial_modal').modal('hide');
		})

		jQuery('#dialect_not_selected_modal .customclose').on('click', function() {
			jQuery('#dialect_not_selected_modal').modal('hide');
		})

		jQuery('#register_modal .customclose').on('click', function() {
			jQuery('#register_modal').modal('hide');
		})

		jQuery('#location_list_modal .customclose').on('click', function() {
			jQuery('#location_list_modal').modal('hide');
		})

		jQuery('#input_modal .customclose').on('click', function() {
			jQuery('#input_modal').modal('hide');
		})

		jQuery('#editInput_modal .customclose').on('click', function() {
			jQuery('#editInput_modal').modal('hide');
		})

		jQuery('#image_modal').hammer().bind("swipeleft", function(e) {
			jQuery('#image_slider').carousel('next');
		});

		jQuery('#image_modal').hammer().bind("swiperight", function(e) {
			jQuery('#image_slider').carousel('prev');
		});

		jQuery('#highscore_select_modal .customclose').on('click', function() {
			jQuery('#highscore_select_modal').modal('hide');
		})

		jQuery('#share_modal .customclose').on('click', function() {
			jQuery('#share_modal').modal('hide');
		})

		jQuery('#help_modal .customclose').on('click', function() {
			jQuery('#help_modal').modal('hide');
		})

		jQuery('#toplistmodal .customclose').on('click', function() {
			jQuery('#toplistmodal').modal('hide');
		})

		jQuery('#why_register_modal .customclose').on('click', function() {
			app.ui.prevent_backdrop = false;
			jQuery('#why_register_modal').modal('hide');
		})

		jQuery('#dialect_modal .customclose').on('click', function() {
			jQuery('#dialect_modal').modal('hide');
		})

		jQuery('#no_anoymous_user_data .customclose').on('click', function() {
			jQuery('#no_anoymous_user_data').modal('hide');
		})

		jQuery('#upload_image_modal .customclose').on('click', function() {
			if (!app.ui.uploading) jQuery('#upload_image_modal').modal('hide');
		})


		jQuery("#icon_login").on('click', function() {
			app.ui.display_all_register_login_elements();
			app.ui.setRandomTitelImage(function() {
				jQuery('#register_modal').modal();
			}, '#register_modal')
		})

		/* jQuery('#open_login_modal').on('click',function(){
		     jQuery('register_modal').modal();
		 })  */

		this.bindShowListeners_Modal();


	}


	/**
	 * [bindShowListeners_Modal description]
	 * @return {void} [description]
	 */
	bindShowListeners_Modal() {


		jQuery('#tutorial_modal').on('hidden.bs.modal',function(){
				jQuery('body').removeClass('dark_bg');
		})

		jQuery('#tutorial_modal').on('shown.bs.modal',function(){


			jQuery('#tuto_1 .carousel-caption').text(app.manager.getTranslation("CS_GIF_TUTORIAL_1"));
			jQuery('#tuto_2 .carousel-caption').text(app.manager.getTranslation("CS_GIF_TUTORIAL_2"));
			jQuery('#tuto_3 .carousel-caption').text(app.manager.getTranslation("CS_GIF_TUTORIAL_3"));

			var cyclestopped = false;
			 jQuery('.tutorial li').on('click',function(){
			 		cyclestopped = true;
			 		console.log(cyclestopped)
			 });

			 jQuery('.carousel-inner .carousel-item').removeClass('active');
			 jQuery('.carousel-inner .carousel-item:first-child').addClass('active');
			 jQuery('.tutorial.carousel-indicators li').removeClass('active');
			 jQuery('.tutorial.carousel-indicators li:first-child').addClass('active');

/*
			 var image =  jQuery('#tutorial_slider .carousel-item.active img');
 			 jQuery('#tutorial_slider .carousel-item.active img').remove();
			 jQuery('#tutorial_slider .carousel-item.active').append(image);*/

		 	 jQuery('.carousel-inner .cc_control').on('click',function(){
			 		cyclestopped = true;
			 			 		console.log(cyclestopped)
			 });

/*			 jQuery('#tutorial_slider').off('slide.bs.carousel').on('slide.bs.carousel',function(e){	 

			 

				 setTimeout(function() {
				 var active = jQuery('#tutorial_slider .carousel-item.active').attr('id').split('_')[1]%3;
				 active+=1;

	

				 if(active==1 && !cyclestopped){
			 		 	 setTimeout(function() {
				      jQuery('#tutorial_slider').carousel("next");
			       }, 12500);
					 }

					 else if (active==2 && !cyclestopped){
				 		 setTimeout(function() {
				      jQuery('#tutorial_slider').carousel("next");
			       }, 13500);
					 }

					 else if (active==3 && !cyclestopped){
					 		 setTimeout(function() {
				      jQuery('#tutorial_slider').carousel("next");
			       }, 9000);

				 }

			 	}, 10);

			 })*/
		

/*	   	 setTimeout(function() {
	   	 	 if (cyclestopped) return;
				  jQuery('#tutorial_slider').carousel("next");
		   }, 12500);*/


		})

		jQuery('#dialect_not_selected_modal').on('show.bs.modal', function() {
			jQuery(this).find('.dialect_not_selected_modal_content').text(app.manager.getTranslation("dialect_not_selected_texts"));
		})


		jQuery('#dialect_modal').on('show.bs.modal', function() {
			if (!jQuery('body').hasClass('modal_init')) {
				jQuery('#custom_modal_backdrop').css('z-index', '1051');
			}
		})

		jQuery('#dialect_modal').on('shown.bs.modal', function() {

			if (app.manager.dialect_modal_initialized) {

				if (app.manager.getData("datatable_dialects").data_value && (app.manager.current_dialect_index != -1)) {
					app.manager.getData("datatable_dialects").data_value.row(app.manager.current_dialect_index).scrollTo();
				}

			}
		})


		jQuery('#locations_modal').on('shown.bs.modal', function(e) {
			if (app.manager.modals_initialized) {
				app.manager.getDataTable("datatable_locations").scroller.measure();
				setTimeout(function() {
					app.manager.getDataTable("datatable_locations").scroller.measure();

				}, 10);

				app.ui.displayTooltips(false);
				if (app.ui.process_restarted) {
					app.map.closeAllInfoWindows();
					app.ui.process_restarted = false;
				}
				setTimeout(function() {
					document.getElementById("focusinput").focus();
				}, 0);

				if (app.manager.saved_location_index != -1) {
					app.manager.getDataTable("datatable_locations").row(app.manager.saved_location_index).scrollTo();
				}

			}

		})


 jQuery('#concepts_modal').on('shown.bs.modal', function(e) {

			if (app.manager.modals_initialized) {
				app.manager.getDataTable("datatable_concepts").scroller.measure();
				setTimeout(function() {
					app.manager.getDataTable("datatable_concepts").scroller.measure();
				}, 10);
				app.ui.displayTooltips(false);
				if (app.ui.process_restarted) {
					app.map.closeAllInfoWindows();
					app.ui.process_restarted = false;
				}
				app.ui.do_image_modal = false;


				if (app.manager.current_concept_index != -1 && jQuery('#va_phase_wrapper_concept_list').find('.va_phase_' + app.manager.va_phase).hasClass("active")) {
					app.manager.getDataTable("datatable_concepts").row(app.manager.current_concept_index).scrollTo();
					app.ui.selectTableEntry(app.manager.current_concept_index);
				}
			}

			jQuery(".wikidata_icon").off("click");
			jQuery(".wikidata_icon").on('click', function(e) {
				e.stopPropagation();
				window.open(jQuery(this).attr('href'), '_blank');
			});

		})

		jQuery('#concepts_modal').on('show.bs.modal', function(e) {

			if(app.manager.current_language==0)jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('german_va');
			else if (app.manager.current_language==1) jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('french_va');
			else if (app.manager.current_language==2) jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('italian_va');
			else if (app.manager.current_language==3) jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('slovenian_va');

		 jQuery('.concept_hint .hint_text').text(app.manager.getTranslation("CS_CONCEPT_DOMAIN_OVERLAY"));

		 if(!app.ui.prevent_concept_hint && app.manager.modals_initialized){

		 	if(app.manager.current_language==1) jQuery('.concept_hint .hint_text').css('font-size','25px');
		 	
		 		jQuery('#concepts_modal .concept_hint').show();
		 			jQuery('#concepts_modal .concept_hint .hintclose').off().on('click',function(){
		 			  		jQuery('.concept_hint').fadeOut('fast');
		 			});	

		 			jQuery('#concepts_modal .concept_hint').off().on('click',function(){	
		 				    jQuery('.concept_hint').fadeOut('fast');
		 			});	

		 			setTimeout(function() {
		 			 	   jQuery('.concept_hint').fadeOut('slow');
		 			}, 5000);

		 			app.ui.prevent_concept_hint = true;
		 }

		})

		jQuery('#image_modal').on('shown.bs.modal', function(e) {

			setTimeout(function() {

				jQuery('#image_modal').find('#image_slider').carousel({
					interval: 3500
				})
				jQuery('#upload_image_modal').modal('hide');
				app.ui.setDynamicContent('image');
			}, 10);
		})

		jQuery('#locations_modal').on('hidden.bs.modal', function() {

			setTimeout(function() { app.ui.displayTooltips(true); }, 200);
			if (app.ui.tutorial_running) app.ui.showPopUp();
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
		})


		jQuery('#concepts_modal').on('hidden.bs.modal', function() {

			if (app.ui.do_image_modal) jQuery('#image_modal').modal({});

			if (!app.ui.prevent_backdrop) {
				setTimeout(function() { app.ui.displayTooltips(true); }, 200);
				if (app.ui.tutorial_running) app.ui.showPopUp();
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			}

		})

		jQuery('#message_modal').on('shown.bs.modal', function(e) {
			jQuery('#userAuesserungInput').focus();
			app.ui.displayTooltips(false);
		})

		jQuery('#message_modal').on('hidden.bs.modal', function(e) {
			jQuery('#userAuesserungInput').focus();
			app.ui.displayTooltips(true);
		})


		jQuery('#register_modal').on('shown.bs.modal', function(e) {

			app.ui.prevent_backdrop = false;
			jQuery(this).find('.custom-modal-footer button').on('click', function() {

				jQuery('#register_modal').find('.custom-modal-footer button').removeClass('active_tab');
				jQuery(this).addClass('active_tab');

			})

			//add_anonymous_data_popover();
			app.ui.register_login_modal_events();

		})

		jQuery('#register_modal').on('show.bs.modal', function(e) {
			if (!app.ui.prevent_backdrop) {
				app.ui.displayTooltips(false);
				app.ui.showCustomModalBackdrop();
			}
		})


		jQuery('#register_modal').on('hidden.bs.modal', function(e) {
			jQuery('.send_anonymous_btn').popover('dispose');
			app.ui.displayTooltips(true);
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			jQuery('#anonymous_data_slide').removeClass('active');
		})

		jQuery('#input_modal').on('shown.bs.modal', function(e) {
			if (!jQuery('#location_list_modal').hasClass('in')) app.ui.displayTooltips(false);
		})

		jQuery('#input_modal').on('show.bs.modal', function(e) {
			jQuery('#custom_modal_backdrop').css('z-index', '10000');
		})


		jQuery('#input_modal').on('hidden.bs.modal', function(e) {
			if (!jQuery('#location_list_modal').hasClass('in')) { app.ui.displayTooltips(true); }
			jQuery('#custom_modal_backdrop').css('z-index', '1049');
		})

		jQuery('#welcomeback_modal').on('shown.bs.modal', function(e) {



			setTimeout(function() {
				// jQuery('#custom_backdrop i').css('top','-150px');
				app.startMainTool();
			}, 200);


		})

		jQuery('#welcome_modal').on('shown.bs.modal', function(e) {
			jQuery('#custom_backdrop').fadeOut('slow', function() { jQuery(this).remove(); });

		})


		jQuery('#location_list_modal').on('show.bs.modal', function(e) {
			var current_location_list_table = app.manager.createLocationListTable(app.manager.getData("current_location_list_table_data").data_value);
			app.manager.addDataTable("current_location_list_table", current_location_list_table)

				if(app.manager.current_language==0)			jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('german_va');
				else if (app.manager.current_language==1) 	jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('french_va');
				else if (app.manager.current_language==2) 	jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('italian_va');
				else if (app.manager.current_language==3) 	jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('slovenian_va');


			app.ui.do_image_modal = false;
		})

		jQuery('#location_list_modal').on('shown.bs.modal', function(e) {
			app.ui.displayTooltips(false);
			app.manager.getDataTable("current_location_list_table").scroller.measure();
			app.manager.getDataTable("current_location_list_table").columns.adjust();


		})


		jQuery('#location_list_modal').on('hidden.bs.modal', function() {

			setTimeout(function() { app.ui.displayTooltips(true); }, 200);
			if (app.ui.tutorial_running) app.ui.showPopUp();
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			if (app.ui.do_image_modal) jQuery('#image_modal').modal({});
		})


		jQuery('#toplistmodal').on('show.bs.modal', function(e) {
			app.ui.current_top_list_table = app.ui.createTopListTable(app.manager.getData("current_highscoredata").data_value);
		})

		jQuery('#toplistmodal').on('shown.bs.modal', function(e) {
			app.ui.prevent_backdrop = false;
			app.ui.current_top_list_table.columns.adjust();
		})

		jQuery('#toplistmodal').on('hidden.bs.modal', function(e) {
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			app.ui.displayTooltips(true);
		})

		jQuery('#highscore_select_modal').on('hidden.bs.modal', function(e) {
			if (!app.ui.prevent_backdrop) {
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
				app.ui.displayTooltips(true);
			}
		})

		jQuery('#share_modal').on('hidden.bs.modal', function(e) {
			if (!app.ui.prevent_backdrop) {
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
				app.ui.displayTooltips(true);
			}
		})

		jQuery('#help_modal').on('hidden.bs.modal', function(e) {
			if (!app.ui.prevent_backdrop) {
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
				app.ui.displayTooltips(true);
			}
		})

		jQuery('#tutorial_modal').on('hidden.bs.modal', function(e) {
			if (!app.ui.prevent_backdrop) {
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
				app.ui.displayTooltips(true);
			}
		})

		jQuery('#highscore_select_modal').on('show.bs.modal', function(e) {
			app.ui.displayTooltips(false);
		})

		jQuery('#share_modal').on('show.bs.modal', function(e) {
			app.ui.displayTooltips(false);
		})


		jQuery('#why_register_modal').on('show.bs.modal', function(e) {
			if (!app.ui.prevent_backdrop) {
				app.ui.showCustomModalBackdrop();
				app.ui.displayTooltips(false);
			}
		})

		jQuery('#help_modal').on('show.bs.modal', function(e) {
			if (!app.ui.prevent_backdrop) {
				app.ui.showCustomModalBackdrop();
				app.ui.displayTooltips(false);
			}
		})

		jQuery('#why_register_modal').on('hidden.bs.modal', function(e) {
			if (!app.ui.prevent_backdrop) {
				app.ui.displayTooltips(true);
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			}
		})

		jQuery('#dialect_modal').on('hidden.bs.modal', function(e) {
			if (!app.ui.prevent_backdrop && !jQuery("#welcome_modal").hasClass('in')) {
				app.ui.displayTooltips(true);
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			}
			jQuery('#custom_modal_backdrop').css('z-index', "");
		})

		jQuery('#why_register_modal').on('shown.bs.modal', function(e) {
			if (app.ui.prevent_backdrop) app.ui.prevent_backdrop = false;
		})


	}


	/**
	 * Sets a random image as background for the different modals.
	 * @param {Function} callback [description]
	 * @param {Number}   modal_id [description]
	 */
	setRandomTitelImage(callback, modal_id) {

		var number = Math.floor(Math.random() * 7) + 1;
		var jpg = "titel_" + number.toString() + ".jpg";
		var img_url = url.plugins_Url + '/assets/images/' + jpg;

		jQuery('<img/>').attr('src', img_url).load(function() {
			jQuery(this).remove();

			jQuery(modal_id).find('.modal-body').css('background', 'url(' + img_url + ')');
			jQuery(modal_id).find('.modal-body').css('background-repeat', 'no-repeat');
			jQuery(modal_id).find('.modal-body').css('background-size', 'cover');

			if (typeof callback == "function") {
				callback();
			}

		});

	}


	/**
	 * [openWhyRegisterModal description]
	 * @return {void} [description]
	 */
	openWhyRegisterModal() {

		app.ui.setRandomTitelImage(function() {

			jQuery('.why_register_headline').html(app.manager.getTranslation("register_head_texts"));
			jQuery('.why_register_body').html(app.manager.getTranslation("register_body_texts"));
			jQuery('.reg_yes').text(app.manager.getTranslation("register_yes_texts"));
			jQuery('.reg_no').text(app.manager.getTranslation("register_no_texts"));

			jQuery('.reg_yes').off().on('click', function() {
				app.ui.prevent_backdrop = true;
				jQuery('#why_register_modal').modal('hide');
				app.ui.setRandomTitelImage(function() {
					jQuery('#register_modal').modal();
				}, '#register_modal');
			})

			jQuery('.reg_no').off().on('click', function() {
				app.ui.prevent_backdrop = false;
				jQuery('#why_register_modal').modal('hide');
			})


			jQuery('#why_register_modal').modal();

		}, "#why_register_modal"); //IMAGE CALLBACK

	}

	/**
	 * [add_translation_register_modal description]
	 */
	add_translation_register_modal() {
		var white_space = " ";

		jQuery('.label_username').text(app.manager.getTranslation("user_name"));
		jQuery('.label_password').text(app.manager.getTranslation("password_text"));

		jQuery('#lwa_user_remember').val(app.manager.getTranslation("enter_username_or_email"));

		jQuery('.slides_reg_register').text(app.manager.getTranslation("new_acc_text_detail"));
		jQuery('.slides_reg_login').text(app.manager.getTranslation("new_acc_text_detail"));
		jQuery('.slides_reg_forgot').text(app.manager.getTranslation("forgot_password_text"));


		jQuery('#user_login').val(app.manager.getTranslation("user_name"));
		jQuery('#user_email').val('E-Mail');
		jQuery('#user_age').val(app.manager.getTranslation("birth_year"));
		jQuery('#user_age').val(app.manager.getTranslation("birth_year"));
		//jQuery('#lwa_user_remember').val("Please type the characters you see in the picture above.");

		try {
			jQuery('#login_btn').contents().last()[0].textContent = white_space + app.manager.getTranslation("login_btn");
			jQuery('.login_slider').contents().last()[0].textContent = white_space + app.manager.getTranslation("login_btn");
			jQuery('.register_btn').contents().last()[0].textContent = white_space + app.manager.getTranslation("register");
			jQuery('.send_anonymous_btn').contents().last()[0].textContent = white_space + app.manager.getTranslation("send_anonymous_data_text");
			jQuery('.dont_send_btn').contents().last()[0].textContent = white_space + app.manager.getTranslation("continue_text");
			jQuery('.forgot_pass_slider').contents().last()[0].textContent = white_space + app.manager.getTranslation("forgot_password_text");
			jQuery('.get_new_password').contents().last()[0].textContent = white_space + app.manager.getTranslation("get_new_password");
			jQuery('.new_acc_slider').contents().last()[0].textContent = white_space + app.manager.getTranslation("new_acc_text");
			jQuery('.reset_slider').contents().last()[0].textContent = white_space + app.manager.getTranslation("reset_btn_text");

		} catch (e) {
			console.log(e)
		}
		jQuery('#user_login').on('focus', function() { if (jQuery(this).val() == app.manager.getTranslation("user_name")) { jQuery(this).val(''); } })
		jQuery('#user_login').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val(app.manager.getTranslation("user_name")); } })

		jQuery('#user_email').on('focus', function() { if (jQuery(this).val() == 'E-Mail') { jQuery(this).val(''); } })
		jQuery('#user_email').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val('E-Mail'); } })

		jQuery('#user_age').on('focus', function() { if (jQuery(this).val() == app.manager.getTranslation("birth_year")) { jQuery(this).val(''); } })
		jQuery('#user_age').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val(app.manager.getTranslation("birth_year")); } })
			
		// jQuery('#captcha').on('focus', function() { if (jQuery(this).val() == "Please type the characters you see in the picture above.") { jQuery(this).val(''); } })
		// jQuery('#captcha').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val("Please type the characters you see in the picture above."); } })

		jQuery('#lwa_user_remember').on('focus', function() { if (jQuery(this).val() == app.manager.getTranslation("enter_username_or_email")) { jQuery(this).val(''); } })
		jQuery('#lwa_user_remember').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val(app.manager.getTranslation("enter_username_or_email")); } })

		var additional_info = jQuery('.slides_reg_register').after('<div id="additional_info">');
		jQuery('#additional_info').text(app.manager.getTranslation("details_why_register_send_anonymous_data"));
	}


	/**
	 * [display_dialect description]
	 * @return {void} [description]
	 */
	display_dialect() {

		jQuery("#user_dialect").text(app.manager.selected_dialect);

		var parent_div = jQuery(".arrow");
		parent_div.before(jQuery("user_dialect_container"));
		//jQuery("#user_dialect_container").css("padding-bottom", "10px");

		jQuery("#user_dialect_container").on('click', function() {

			if (app.manager.dialect_modal_initialized) {
				if (!jQuery("#welcome_modal").hasClass("in")) {
					app.ui.showCustomModalBackdrop();
				}

				app.ui.openDialectModal();
			} else {
				app.loader.get_dialects(function() { app.ui.openDialectModal(); });

			}
		})


	}

	
	/**
	 * [handleWordSpanClick description]
	 * @return {void} [description]
	 */
	handleWordSpanClick() {

		if (app.ui.allow_select) {

			if (!jQuery('#concepts_modal').hasClass('fade')) {
				jQuery('#concepts_modal').css('opacity', "1");
				jQuery('#concepts_modal').addClass('fade');
			}

			jQuery('#concepts_modal').modal({
				keyboard: false
			});

			if (jQuery('#custom_modal_backdrop').length < 1) app.ui.showCustomModalBackdrop();

		}

	}

	/**
	 * [setQ description]
	 * @param {String} con [description]
	 * @param {Number} id  [description]
	 */
	setQ(con, id) {

		app.map.closeAllInfoWindows();

		jQuery('#word_span').text(con);
		jQuery('#word_span').attr("data-id_concept", id);

		var index = app.manager.getData("concepts_index_by_id").data_value[parseInt(id)].index;

		//if(app.manager.current_concept_index[va_phase]!=-1)deSelectTableEntry(app.manager.current_concept_index[va_phase]);
		// not sure what this is

		app.ui.selectTableEntry(index);

		// app.manager.current_concept_index[va_phase] = index; LAST VERSION, but ERROR
		app.manager.current_concept_index = index;
		app.ui.concept_selected = true;

		app.ui.checkImageModal(id, con);

	}

	
	/**
	 * [handleLocationSpanClick description]
	 * @return {void} [description]
	 */
	handleLocationSpanClick() {

		if (app.ui.allow_select) {

			if (!jQuery('#locations_modal').hasClass('fade')) {
				jQuery('#locations_modal').css('opacity', "1");
				jQuery('#locations_modal').addClass('fade');
			}

			jQuery('#locations_modal').modal({
				keyboard: false
			});

			if (jQuery('#custom_modal_backdrop').length < 1) app.ui.showCustomModalBackdrop();
		}

	}


	/**
	 * [menu_is_up description]
	 * @return {void} [description]
	 */
	menu_is_up() {
		this.startTutorial();
		jQuery('#showhighscore').on('click', function() {
			app.ui.buildHighScoreSelect();
		})
		jQuery('#shareicon').on('click', function() {
			app.ui.openShareModal();
		})

		jQuery('#helpicon').on('click', function() {
			app.ui.openHelpModal();
		})

		jQuery('#tutorialicon').on('click', function() {
			app.ui.openTutorialModal();
		})


		jQuery('.popover').addClass('bounce-6');

	}


	/**
	 * [startTutorial description]
	 * @return {void} [description]
	 */
	startTutorial() {

		app.ui.tutorial_running = true;
		app.ui.stage = 1;
		jQuery('#location_span').popover('show');


		jQuery('.pop_location_span').parent().on('click', function() {
			app.ui.handleLocationSpanClick();
		}).addClass('c_hover');



	}

	/**
	 * Change the language displayed. Used for Welcome Modal.
	 * @param  {String}   element  [description]
	 * @param  {Array}   textlist [description]
	 * @param  {Number}   i        [description]
	 * @param  {Function} callback [description]
	 *
	 */
	cycleText(element, textlist, i, callback) {
		if (!app.ui.break_cycle) {

			i++;
			setTimeout(function() {
				element.attr('lang_id', i);
				element.animate({ opacity: 0 }, 800, function() {
					element.text(textlist[i]);
					element.animate({ opacity: 1 }, 500, function() {
						requestAnimationFrame(function() { app.ui.cycleText(element, textlist, i, callback) });
					});

				});


				if (i == textlist.length) i = 0;

			}, 1300);

			if (typeof callback == "function")
				callback(i);

		}

	}


	
	/**
	 * [addLoginToolTip description]
	 */
	addLoginToolTip() {

		jQuery('#icon_login').popover({
			trigger: "manual",
			placement: "left",
			container: "body",
			content: '<div class="login_popover custom_popover_content">' + app.manager.getTranslation("register_texts") + '</div>',
			html: true,
			animation: true,
			offset: "0 0"
		});

		jQuery('#icon_login').popover('hide');

	}

	/**
	 * [showLoginPopUp description]
	 * @return {void} [description]
	 */
	showLoginPopUp() {

		jQuery('#icon_login').popover('show');
	  jQuery('.login_popover').parent().parent().addClass('login_popover_p');

		jQuery('.login_popover').parent().on('click', function() {
			app.ui.setRandomTitelImage(function() {
				app.ui.display_all_register_login_elements();
				jQuery('#register_modal').modal();
			}, '#register_modal');
		}).addClass('c_hover');

	}

	/**
	 * [display_all_register_login_elements description]
	 * @return {void} [description]
	 */
	display_all_register_login_elements() {
		jQuery('#login_slide').addClass('active');
		jQuery('#register_slide').removeClass('active');
		jQuery('.custom-modal-footer').show();

		jQuery('.login_slider').show();
		jQuery('.forgot_pass_slider').show();
		jQuery('.reset_slider').show();
		jQuery('.new_acc_slider').show();
	}


	/**
	 * Marks a row in the concept datatable according to a table index
	 * @param  {Number} table_index index of the selected entry in the data table
	 *
	 */
	selectTableEntry(table_index) {

		var row = app.manager.getDataTable("datatable_concepts").row(table_index).node();

		jQuery(row).addClass('concept-list-select-tr');
		jQuery(row).find('.dataparent').addClass('list_selected_concept');

		if (table_index >= app.manager.getData("important_concepts_count").data_value) {
			var icon = jQuery('<i class="fa fa-arrow-right list-select-arrow" aria-hidden="true"></i>');
			if (jQuery(row).find('.fa-arrow-right').length == 0) {
				jQuery(row).find('.dataspan').prepend(icon);
			}
		}

	}

	/**
	 * Ummarks a row in the concept datatable according to a table index
	 * @param  {Number} table_index index of the selected entry in the data table to be unmarked
	 *
	 */
	deSelectTableEntry(table_index) {

		var row = app.manager.getDataTable("datatable_concepts").row(table_index).node();

		jQuery(row).removeClass('concept-list-select-tr');
		jQuery(row).find('.list_selected_concept').removeClass('list_selected_concept');

		if (table_index >= app.manager.getData("important_concepts_count").data_value) {
			jQuery(row).find('.list-select-arrow').remove();
		}

	}

	/**
	 * [populate_concept_span description]
	 * @return {void} [description]
	 */
	populate_concept_span() {
		var url = new URL(window.location.href);
		app.manager.url_concept_id = url.searchParams.get("concept");
		if (app.manager.url_concept_id) {
			var already_submited = false;
			for (var key in app.manager.submitedAnswers_indexed) {
				var obj = app.manager.submitedAnswers_indexed[key];

				if (obj['concept_id'] == app.manager.url_concept_id) {
					already_submited = true;
					app.ui.concept_selected = false;
					app.manager.url_concept_id = null;
					break;
				}
			}

			if (!already_submited) {
				url_choosen_concept = app.manager.getData("concepts_index_by_id").data_value[app.manager.va_phase][app.manager.url_concept_id];
				jQuery('#word_span').text(url_choosen_concept.name);
				jQuery('#word_span').attr("data-id_concept", app.manager.url_concept_id);
				jQuery('#word_span').attr("data-id_concept_index", url_choosen_concept.index);
				setDynamicContent('list');
			} else {}

		}

	}

	/**
	 * Sets a timer, after which a login/register pop up will show up.
	 *
	 */
	startLoginTimer() {

		if (!jQuery('.login_popover').parent().parent().hasClass('in') && !jQuery('#register_modal').hasClass('in')) {

			setTimeout(function() {
				if (!jQuery('.modal').hasClass('in')) { app.ui.showLoginPopUp(); } else {
					jQuery('.modal').one('hidden.bs.modal', function() {
						app.ui.showLoginPopUp();
					})
				}

			}, 3000);
		}

	}

	/**
	 * [buildHighScoreSelect description]
	 * @return {void} [description]
	 */
	buildHighScoreSelect() {

		app.ui.setRandomTitelImage(function() {
			app.ui.showCustomModalBackdrop();


			app.loader.getHighScoresFromDB(function() {


				jQuery('#best_user').one('click', function() {
					app.ui.openHighScoreModal(app.manager.top_users);
					jQuery('.highscoreheadlinespan').text(app.manager.getTranslation("active_user_texts"));
					app.ui.prevent_backdrop = true;
				}).text(app.manager.getTranslation("active_user_texts"))
				jQuery('#best_location').one('click', function() {
					app.ui.openHighScoreModal(app.manager.top_locations);
					jQuery('.highscoreheadlinespan').text(app.manager.getTranslation("active_location_texts"));
					app.ui.prevent_backdrop = true;
				}).text(app.manager.getTranslation("active_location_texts"))
				jQuery('#best_concept').one('click', function() {
					app.ui.openHighScoreModal(app.manager.top_concepts);
					jQuery('.highscoreheadlinespan').text(app.manager.getTranslation("active_concept_texts"));
					app.ui.prevent_backdrop = true;
				}).text(app.manager.getTranslation("active_concept_texts"))

				var icon = jQuery('<i class="fa fa-pagelines leaf_icon_l" aria-hidden="true"></i>');
				var icon_r = jQuery('<i class="fa fa-pagelines leaf_icon_r" aria-hidden="true"></i>');
				jQuery('.select_score_list').prepend(icon);
				jQuery('.select_score_list').append(icon_r);

				jQuery('#highscore_select_modal').modal({});
			}) //DB CALLBACK

		}, "#highscore_select_modal"); //IMAGE CALLBACK
	}

	/**
	 * [openHighScoreModal description]
	 * @param  {Array} array [description]
	 * @return {void}       [description]
	 */
	openHighScoreModal(array) {

		if (app.ui.current_top_list_table != null) app.ui.current_top_list_table.destroy();

		var table_data = [];

		var i = 0;
		for (var key in array) {
			i++;
			var arr = array[key];

			if (arr[3]) {
				table_data.push(['<div class="highscorenumber">' + i + '.</div>', '<div class="concept_data" id="' + arr[3] + '">' + arr[0] + '</div>', arr[1]])
			} else if (arr[2]) {
				table_data.push(['<div class="highscorenumber">' + i + '.</div>', '<div class="obj_data" id="' + arr[2] + '">' + arr[0] + '</div>', arr[1]])
			} else {
				table_data.push(['<div class="highscorenumber">' + i + '.</div>', arr[0], arr[1]])
			}

		}

		var current_highscoredata = table_data;
		app.manager.addData("current_highscoredata", current_highscoredata)
		jQuery('#highscore_select_modal').modal('hide');
		jQuery('#toplistmodal').modal();


		jQuery('#toplistmodal .obj_data').on('click', function() {
			jQuery('#toplistmodal').modal('hide');
			var g_location_id = jQuery(this).attr('id');
			var g_location = jQuery(this).text();
			app.map.showPolygon(g_location, g_location_id, true);
		})

		jQuery('#toplistmodal .concept_data').on('click', function() {

			var id = parseInt(jQuery(this).attr('id'));
			var name = jQuery(this).text();
			app.ui.setQ(name, id);
			jQuery('#toplistmodal').modal('hide');
			app.ui.setDynamicContent();
		})

	}

	/**
	 * [openShareModal description]
	 * @return {void} [description]
	 */
	openShareModal() {
		app.ui.setRandomTitelImage(function() {
			app.ui.showCustomModalBackdrop();
			var cur_location_href = document.location.href;
			jQuery('#share_modal').modal({});

			jQuery('#share_link').text(cur_location_href);

			jQuery('#share_facebook').attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + cur_location_href);
			jQuery('#share_twitter').attr("href", "https://twitter.com/home?status=" + cur_location_href);
			jQuery('#share_googleplus').attr("href", "https://plus.google.com/share?url=" + cur_location_href);
			jQuery('#share_mail').attr("href", "mailto:" + 'verbaalpina@itg.uni-muenchen.de');

		}, "#share_modal");
	}

		/**
	 * [openHelpModal description]
	 * @return {void} [description]
	 */
	openHelpModal() {
		app.ui.setRandomTitelImage(function() {
			app.ui.showCustomModalBackdrop();
			jQuery('#help_modal').modal({});

		}, "#help_modal");
	}


		/**
	 * [openHelpModal description]
	 * @return {void} [description]
	 */
	openTutorialModal() {
		  jQuery('body').addClass('dark_bg');
			app.ui.showCustomModalBackdrop();
			jQuery('#tutorial_modal').modal({});
	}


	/**
	 * [createTopListTable description]
	 * @return {void} [description]
	 */
	createTopListTable() {


		var table = jQuery('#toplistmodal').find('#top_list_table').DataTable({

			data: app.manager.getData("current_highscoredata").data_value,
			deferRender: false, //otherwise .node() won't always work
			scrollY: "75vh",
			scrollX: false,
			scrollCollapse: true,
			info: false,
			ordering: false,
			searching: false,
			responsive: true,

			columns: [
				{ "width": "20%" },
				{ "width": "60%" },
				{ "width": "20%" },
			],

			scroller: {
				displayBuffer: 15,
			},

			fnInitComplete: function(settings) {}

		})

		return table;
	}


	/**
	 * [checkImageModal description]
	 * @param  {Number} id   [description]
	 * @param  {String} name [description]
	 * @return {void}      [description]
	 */
	checkImageModal(id, name) {
		var myimages = [];
		myimages = app.manager.getData("images").data_value[id];

		if (myimages && myimages.length > 0) {
			app.ui.do_image_modal = true;
		}

		if (app.ui.do_image_modal) {
			var c = app.ui.buildCarousel(myimages, name);
			jQuery('#image_modal').find('.modal-body').append(c);

			if (jQuery("#suggest_image_upload").length) {

			} else {
				var upload_button = jQuery("<div id='suggest_image_upload'></div>").text(app.manager.getTranslation("upload_own_image_button_text"));

				jQuery('#image_modal').find('.customfooter').append(upload_button);
				jQuery('#image_modal').find('.customfooter').css("height", "30px");

				upload_button.on("click", function() {
					app.ui.image_uploader.open_upload_image_modal()
				})
			}


		} else {
			app.ui.image_uploader.open_upload_image_modal()
		}

	}

	/**
	 * Opens Language Modal for the user to choose prefered language.
	 *
	 */
	openLanguageModal() {

		// jQuery('.message_modal_content').text("Bitte wählen Sie eine Sprache aus!");
		jQuery('#language_modal').modal({
			keyboard: true
		});

	}

	/**
	 * [openDialectModal description]
	 * @return {void} [description]
	 */
	openDialectModal() {
		jQuery('#dialect_modal').modal({
			keyboard: true
		});

		//if(jQuery('#custom_modal_backdrop').length<1)showCustomModalBackdrop();
		//jQuery('#custom_modal_backdrop').fadeOut();
	}

	/**
	 * [showCustomBackdrop description]
	 *
	 */
	showCustomBackdrop() {

		var custom_backdrop = jQuery('<div id="custom_backdrop"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw""></i></div>');
		jQuery('body').append(custom_backdrop);
		jQuery('#custom_backdrop').fadeIn();

	}

	/**
	 * [showCustomModalBackdrop description]
	 *
	 */
	showCustomModalBackdrop() {

		jQuery('#custom_modal_backdrop').remove();
		var custom_backdrop = jQuery('<div id="custom_modal_backdrop"></div>');
		jQuery('body').append(custom_backdrop);
		jQuery('#custom_modal_backdrop').fadeIn('fast');

	}

	/**
	 * [check_free_space_few_elements description]
	 * @param  {Number} num_elements [description]
	 * @param  {var} few_elements [description]
	 * @return {void}              [description]
	 */
	check_free_space_few_elements(num_elements, few_elements) {

		if (num_elements < 8) {
			jQuery('#location_list_modal').find('.few_elements').show();
			if (num_elements == 0) num_elements = 1;

			jQuery('#location_list_modal').find('.modal-content').css('min-height', '400px');
			jQuery('#location_list_modal').find('.modal-content').append(few_elements);
			var margin_top = 80 / num_elements;
			few_elements.css('padding', margin_top + 'px'); // margin-top
		} else {
			jQuery('#location_list_modal').find('.few_elements').hide();
		}
	}

	/**
	 * [add_few_elements_click_listener description]
	 * @param {Object} location_object [description]
	 */
	add_few_elements_click_listener(location_object) {
		jQuery('#location_list_modal').find('.few_elements').unbind();
		jQuery('#location_list_modal').find('.few_elements').on('click', function() {
			var current_location_id = location_object.id_geo;
			var current_location_name = location_object.ortsname;



			if (app.map.map.getZoom() < 9) {
				var zoom_to_location = true;
			} else {
				var zoom_to_location = false;
			}

			app.map.showPolygon(current_location_name, current_location_id, zoom_to_location);

			jQuery('#location_span').text(current_location_name);
			jQuery('#location_span').attr("data-id_location", current_location_id);
			app.ui.location_selected = true;

			jQuery('#location_list_modal').modal('hide');
		})
	}

	/**
	 * [check_active_concepts description]
	 * @param  {var} dom_elements [description]
	 * @return {Array}              [description]
	 */
	check_active_concepts(dom_elements) {
		var active_phases = [];

		dom_elements.each(function() {
			active_phases.push(jQuery(this).data('va_phase'));
			//console.log(jQuery(this).data('va_phase') - 1);
		})

		return active_phases
	}

	/**
	 * Build Image Slider
	 * @param  {Array} _images  [description]
	 * @param  {Array} _caption [description]
	 * @return {String}          Div-element, containg images and their captions.
	 */
	buildCarousel(_images, _caption) {

		jQuery('#image_modal').find('#image_slider').remove();

		var result = jQuery('<div id="image_slider" class="carousel slide" data-ride="carousel">');

		if (_images.length > 1) {

			var ol = jQuery('<ol class="carousel-indicators findicators"></ol>');

			for (var i = 0; i < _images.length; i++) {

				var li = jQuery('<li data-target="#image_slider" data-slide-to="' + i + '"></li>')
				if (i == 0) li.addClass('active');
				ol.append(li);
			}

			result.append(ol);

		}

		var inner = jQuery('<div class="carousel-inner" role="listbox">');

		for (var i = 0; i < _images.length; i++) {

			var item = jQuery('<div class="carousel-item">');
			if (i == 0) item.addClass('active');
			var body = jQuery('<div class ="i_fake_body"></div>');
			var image_overlay = jQuery('<div class ="i_overlay"></div>');
			var caption = jQuery('<div class="carousel-caption first-info">' + _caption + '</div>');

			if (_images[i].image_scource.indexOf("wikipedia/commons") >= 0) {
				var source = jQuery('<div>' + "Wikipedia Commons" + '</div>'); //
				source.css({
					'background-color': 'rgba(255, 255, 255, 0.5)',
					'font-size': 10,
					'float': 'right'

				});
				item.append(source);
			}

			body.append(image_overlay);

			item.append(caption);
			item.append(body);
			item.append(source);
			inner.append(item);

			body.css({
				'background': 'url(' + _images[i].image_name + ')',
				'background-repeat': 'no-repeat',
				'background-size': "cover"
			});

		}

		result.append(inner);
		if (_images.length > 1) result.append(jQuery('<a class="left carousel-control" href="#image_slider" role="button" data-slide="prev"><span class="icon-prev" aria-hidden="true"></span><span class="sr-only">Previous</span></a><a class="right carousel-control" href="#image_slider" role="button" data-slide="next"><span class="icon-next" aria-hidden="true"></span><span class="sr-only">Next</span></a>'));

		return result;
	}

	/**
	 * [init_location_search_mode description]
	 * @param  {var} modal [description]
	 * @return {void}       [description]
	 */
	init_location_search_mode(modal) {
		app.ui.choosing_location_mode = true;

		if (!app.ui.location_listener_added) app.map.add_location_search_listener();
		app.ui.location_listener_added = true;

		jQuery('#image_modal').modal('hide');
		if (app.ui.location_selected) {
			jQuery('#location_span').text(app.manager.getTranslation("the_word_location"));
			jQuery('#user_input').val('');
			app.ui.setDynamicContent('list');
			//stage = 1;
			app.ui.location_selected = false;
			app.ui.word_entered = false;
			jQuery('.pop_submitanswer').popover('hide');
			jQuery('#submitanswer').popover('hide');

			// console.log("selected");
		}

		setTimeout(function() {
			modal.modal('hide');
			app.map.chooseGemiendeOutsideOfAlpineConvention();
		}, 100);

	}

	/**
	 * When user changes his entry the data is then been processed and updated to the server.
	 * @param  {Int} id_auesserung [description]
	 * @param  {Int} id_concept    [description]
	 * @param  {Int} location_id   [description]
	 * @param  {String} concept       [description]
	 * @param  {Int} row_to_update [description]
	 * @return {String}               [description]
	 */
	editInputA(id_auesserung, id_concept, location_id, concept, row_to_update) {

		jQuery('.input_modal_content').html(
			app.ui.returnChangeInput()

		);

		jQuery('#input_modal').modal({
			backdrop: 'static',
			keyboard: false
		});

		jQuery('#input_modal').one('shown.bs.modal', function(e) {
			jQuery(this).find('button').on('click', function() {

				app.ui.updateInput(concept, id_auesserung, id_concept, location_id, row_to_update);

			});
		})

	}


	/**
	 * created html element, which will be used in editInput()
	 * @see editInput() in content_interaction.js
	 * @return {String} HTML
	 */
	returnChangeInput() {
		var output = [
			"<div id='inputWrapper'>",
			/*"Sie haben gesagt:  In " + ort + " sagt man zu " + concept + " " +  auesserung ,*/
			/* "" + translateInfoWindowText(ort, concept,auesserung, current_user) + "", */
			"" + "<div style='display:inline-block;margin-right:10px;margin-bottom:5px;'>" + app.manager.getTranslation("change_question") + "</div>",
			"<div style='display:inline-block;width:100%'><input style='width:100%; margin-right:10px;display:inline-block;' id='userAuesserungInput' type='text'/></div>",
			"<div style='display:block;margin-top:10px;'><button style='display:inline-block;margin-right:10px;padding:5px;' class='btn btn-primary' id='updateAuesserung' type='button'>" + app.manager.getTranslation("change_input") + "</button>",
			"</div>", /*"<button style='display:inline-block;padding:5px;' class='btn btn-primary ' data-concept_id=\"" + id_concept + "\" data-todelete=\"" + id_auesserung + "\"  data-ort= \"" + ort + "\" type='button' id='deleteAuesserung' type='button' onclick='deleteInput()'>" + delete_input[current_language] + "</button>*/

			"</div>"
		].join("");


		// onclick='updateInput()'

		return output;
	}


	/**
	 * Updated user's answer(Used by editInputA()).
	 * @see editInputA() in map_controller.js
	 * @param  {String} concept       Concept name
	 * @param  {Number} id_auesserung Id of the submited answer
	 * @param  {Number} concept_id    Concept Id
	 * @param  {Number} id_location   Location Id
	 * @param  {Number} row_to_update The row number from the data table that will be updated
	 *
	 */
	updateInput(concept, id_auesserung, concept_id, id_location, row_to_update) {

		var new_auesserung = jQuery('#userAuesserungInput').val();

		var stop = false;

		for (var key in app.manager.submitedAnswers_indexed) {
			var oldanswer = app.manager.submitedAnswers_indexed[key].user_input;
			if (oldanswer == new_auesserung) stop = true;

		}


		if (new_auesserung.localeCompare("") != 0 && !stop) {

			if (row_to_update) {
				row_to_update.find('td:nth-child(2)').first().text("\"" + new_auesserung + "\"");
			}

			app.manager.updateAnswers_indexed(id_auesserung, new_auesserung, id_location);

			jQuery.ajax({
				url: ajax_object.ajax_url,
				type: 'POST',
				data: {
					action: 'updateAuesserung',
					id_auesserung: id_auesserung,
					new_auesserung: new_auesserung
				},
				success: function(response) {

					if (app.map.info_window_answer_change) {
						jQuery("#i_span_1").text('"' + new_auesserung + '"');
					}
					app.map.info_window_answer_change = false;
				}
			});

			jQuery('#input_modal').modal('hide');

		} else {
			app.ui.markInputRed(jQuery('#userAuesserungInput'));
		}
	}

	/**
	 * Sends an Ajax call to delete answer from the server.
	 * @param  {Number} id_auesserung Submited answer Id
	 * @param  {String} ort           Location name
	 * @param  {Number} concept_id    Concept Id
	 * @param  {Number} location_id   Location Id
	 *
	 */
	deleteInput(id_auesserung, ort, concept_id, location_id) {

		app.manager.deleteFromAnswers_indexed(id_auesserung, location_id);
		app.map.change_marker(app.map.location_markers[location_id], -1, "green");

		app.manager.getData("num_of_answers_by_id").data_value[concept_id]--;
		if (app.manager.getData("num_of_answers_by_id").data_value[concept_id] == 0) {
			app.manager.deleteFromConceptTable(concept_id);
		} else {
			app.manager.checkTableEntry(concept_id);
		}

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'deleteAuesserung',
				id_auesserung: id_auesserung,
				ort: ort,
				gemeinde_id: location_id,
				current_user: app.manager.user_data.current_user
			},
			success: function(response) {
				/*If informant was deleted from db and has no other submited answers, delete cookie and current_user*/
				var user_deleted = JSON.parse(response);
				if (user_deleted && app.manager.isEmpty(app.manager.submitedAnswers_indexed) && !app.manager.user_data.userLoggedIn) {
					app.loader.eraseCookie("crowder_id");
					app.manager.user_data.current_user = null;
				}
			}
		});

		if (app.map.old_feature != null && ort.localeCompare(app.map.old_feature['location']) == 0) {
			app.map.change_feature_style(app.map.old_feature, app.manager.check_user_aesserungen_in_location(ort));
		}
	}

	/**
	 * Marks the input field red if user tries to submit the same answer or an empty field, when changing his answer.
	 * @param  {String} input [description]
	 *
	 */
	markInputRed(input) {
		/*input field turns red for 1 sec*/
		input.css('border-color', 'red'); //.addClass( "myClass yourClass" );
		input.css('background-color', 'rgb(224, 143, 143)');
		setTimeout(function() {
			input.css('border-color', 'white');
			input.css('background-color', 'white');
		}, 1000);
		/*   jQuery('#editInput_modal').modal({
		                 keyboard: true
		    });
		  jQuery('.editInput_modal_content').html("<div>" + field_not_full[current_language] + "</div>");*/

	}

	/**
	 * [checkLoginPopUp description]
	 * @return {void} [description]
	 */
	checkLoginPopUp() {
		if (app.manager.session_answer_count == 3) {
			if (!jQuery('.login_popover').parent().parent().hasClass('in')) app.ui.showLoginPopUp();
		}
	}

	/**
	 * [openRegisterOrAnonymousModal description]
	 * @return {void} [description]
	 */
	openRegisterOrAnonymousModal() {
		this.setRandomTitelImage(function() {
			jQuery('#register_modal').modal();

			jQuery('#login_slide').removeClass('active');
			jQuery('#register_slide').addClass('active');

			jQuery('.custom-modal-footer').show();

			jQuery('.login_slider').hide();
			jQuery('.forgot_pass_slider').hide();
			jQuery('.reset_slider').hide();
			jQuery('.new_acc_slider').hide();

			app.ui.add_anonymous_data_popover();
		}, '#register_modal');
	}

	/**
	 * [add_anonymous_data_popover description]
	 */
	add_anonymous_data_popover() {
		jQuery('.send_anonymous_btn').popover('dispose');

		jQuery('#no_anoymous_user_data_text').text("Please enter Data on the map first.");

		jQuery('.send_anonymous_btn').popover({
			trigger: "hover",
			placement: "top",
			container: "#register_slide",
			html: true,
			content: '<div class="custom_popover_content">' + app.manager.getTranslation("send_anonymous_data_modal_text") + '</div>',
			animation: true
		});

		jQuery('.send_anonymous_btn').popover('show');
		jQuery('.send_anonymous_btn').popover('hide');

		var popover_id_anonym = '#' + jQuery('.send_anonymous_btn').attr('aria-describedby');

		jQuery(popover_id_anonym).each(function() {
			this.style.setProperty('z-index', '10000', 'important');
		});

		// jQuery('body').on('click', function (e) {
		//     //did not click a popover toggle or popover
		//     if (jQuery(e.target).data('toggle') !== 'popover'
		//         && jQuery(e.target).parents('.popover.in').length === 0) {
		//         jQuery('[data-toggle="popover"]').popover('hide');
		//         jQuery('body').unbind();
		//     }
		// });

		//highlight anonymous data(age input field)
		jQuery('.send_anonymous_btn').hover(function() {
			jQuery('#user_login').css('opacity', '0.3');
			jQuery('#user_email').css('opacity', '0.3');
			jQuery('.send_anonymous_btn').popover('show');
			console.log("Popover show");
		}, function() {
			jQuery('#user_login').css('opacity', '1');
			jQuery('#user_email').css('opacity', '1');
			jQuery('.send_anonymous_btn').popover('hide');
			console.log("Popover hide");
		});

	}

	/**
	 * [register_login_modal_events description]
	 * @return {void} [description]
	 */
	register_login_modal_events() {
		jQuery(".register_btn").css("opacity", "0.5");

		var initial_login = jQuery('#user_login').val();
		var initial_age = jQuery('#user_age').val();
		var initial_email = jQuery('#user_email').val();
		//console.log(initial_login + initial_age + initial_email);

		jQuery('.form-control').keypress(function() {
			if (jQuery('#user_login').val() != initial_login || jQuery('#user_email').val() != initial_email) {
				jQuery(".register_btn").css("opacity", "1");
			} else {
				jQuery(".register_btn").css("opacity", "0.5");
			}
		});

		console.log(jQuery("#user_login").val());
	}

}



class ImageUpload {
	constructor() {
		this.fd
		this.allowed_image_types = ["image/png", "image/jpeg", "image/tiff"];
	}

	/**
	 * Image Upload Controller, Funtionalities enabling the frontend import of images
	 *
	 * @module Image Uploader
	 */
	open_upload_image_modal() {
		if(window.innerWidth>768 && app.manager.user_data.userLoggedIn){

			setTimeout(function() {
				jQuery("#image_modal").modal('hide')
				jQuery('#upload_image_modal').modal('show')
			}, 2000);
		}
	}



	/**
	 * Initialize Form for Image Upload
	 * Adding event Listeners for drag, drop, ect Events to prevent default 
	 *
	 */
	init_image_upload_form() {


		app.ui.image_uploader.fd = new FormData(jQuery('#image_upload_form')[0]);

		let dropArea = document.getElementById('drop-area')
		let gallery = document.getElementById('gallery')

		let events = ['dragenter', 'dragover', 'dragleave', 'drop']
		let events_enter_over = ['dragenter', 'dragover']
		let events_leave_drop = ['dragleave', 'drop']

		/**
		 * Event handling for image drag and drop
		 */
		events.map(eventName => {
			dropArea.addEventListener(eventName, app.ui.image_uploader.preventDefaults, false)
		})

		events_enter_over.map(eventName => {
			dropArea.addEventListener(eventName, app.ui.image_uploader.highlight, false)
			gallery.addEventListener(eventName, app.ui.image_uploader.highlight, false)
		})

		events_leave_drop.map(eventName => {
			dropArea.addEventListener(eventName, app.ui.image_uploader.unhighlight, false)
			gallery.addEventListener(eventName, app.ui.image_uploader.unhighlight, false)
		})


		dropArea.addEventListener('drop', app.ui.image_uploader.handleDrop, false)

		jQuery("#fileElem").change(function() {
			console.log("Image selected")
		});

		jQuery("#upload_images").on("click", function() {
			var selected_concept_id = jQuery("#word_span").attr("data-id_concept")

			/**
			 * check if user accepts terms and has selected images for upload
			 */
			if (jQuery("#accept_req_image_upload").is(":checked") && app.ui.image_uploader.fd.getAll('image_data[]').length > 0) {
				app.ui.image_uploader.upload_images(selected_concept_id);
				jQuery('#drop-area-overlay').css('display', 'flex');

			} else if (app.ui.image_uploader.fd.getAll('image_data[]').length == 0) {

				jQuery('.message_modal_content').text(app.manager.getTranslation("select_image_alert"));
				jQuery('#message_modal').modal({
					keyboard: true,
					backdrop: "dynamic"
				});
			} else if (jQuery("#accept_req_image_upload").is(":not(:checked)")) {

				jQuery('.message_modal_content').text(app.manager.getTranslation("accept_upload_terms_alert"));
				jQuery('#message_modal').modal({
					keyboard: true,
					backdrop: "dynamic"
				});
			}

		})

		jQuery("#upload_image_modal").on('hidden.bs.modal', function() {
			// reset all input		
			var file_input = jQuery("#fileElem");
			app.ui.image_uploader.reset_input(file_input)
		})

		jQuery("#upload_image_modal").on('show.bs.modal', function() {
			// update title for image upload modal
			var selected_concept_id = jQuery("#word_span").attr("data-id_concept")
			var concept_name = "<b>" + app.manager.getData("concepts_index_by_id").data_value[selected_concept_id].name + "</b>"
			var task_text = app.manager.getTranslation("upload_task_text").split("{Konzept}")
			task_text = task_text[0] + " " + concept_name + " " + task_text[1]
			jQuery(this).find(".image-upload-modal-title").html(task_text) // "Zum " + "<b>" + concepts_index_by_id[selected_concept_id].name + "</b>" + " fehlen uns noch Bilder. Hier können Sie Ihre eigene Bilde hochladen und zum Projekt beitragen." 
			
			jQuery(".button_select_files").text(app.manager.getTranslation("upload_text"))
			var accept_terms = app.manager.getTranslation("upload_terms_text").replace('CC BY SA 4.0', '<a target="_blank" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY SA 4.0</a>');
			jQuery("#accept_terms_label").html(accept_terms);

			jQuery("#upload_images").text(app.manager.getTranslation("upload_image_text"))
			jQuery("#close_modal").text(app.manager.getTranslation("close_modal_text"))
		})


		jQuery(".button_select_files").text(app.manager.getTranslation("upload_text"))
		var accept_terms = app.manager.getTranslation("upload_terms_text").replace('CC BY SA 4.0', '<a target="_blank" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY SA 4.0</a>');
		jQuery("#accept_terms_label").html(accept_terms);

		jQuery("#upload_images").text(app.manager.getTranslation("upload_image_text"))
		jQuery("#close_modal").text(app.manager.getTranslation("close_modal_text"))
	}

	preventDefaults(e) {
		e.preventDefault()
		e.stopPropagation()
	}

	highlight(e) {
		let dropArea = document.getElementById('drop-area')
		dropArea.classList.add('highlight')
		jQuery(".button_select_files").text(app.manager.getTranslation("drop_file_text"))
	}

	unhighlight(e) {
		let dropArea = document.getElementById('drop-area')
		dropArea.classList.remove('highlight')
		jQuery(".button_select_files").text(app.manager.getTranslation("upload_text"))
	}

	handleDrop(e) {
		var dt = e.dataTransfer
		var files = dt.files

		jQuery("#loading_images").css("display", "block")
		app.ui.image_uploader.handleFiles(files)
	}

	/**
	 * @param  {Files} files Input Images
	 */
	handleFiles(files) {
		var form_input = jQuery("#fileElem")

		files = [...files]
		// only add valid files that are images
		files = files.filter(this.check_image)

		files.forEach(function(file) {
			app.ui.image_uploader.fd.append('image_data[]', file);
		})

		files.forEach(this.previewFile)

		if (jQuery("#erase_upload_images").length == 0) {
			var del_button = jQuery("<button id='erase_upload_images'  class='btn-sm btn-outline-danger'></button").text(app.manager.getTranslation("clear_images"));

			del_button.on("click", function() {
				app.ui.image_uploader.reset_input(jQuery("#fileElem"))
			})

			del_button.insertAfter(jQuery("#gallery"))

		}
		jQuery("#loading_images").css("display", "none")

	}

	/**
	 * [check_image description]
	 * @param  {File} file [description]
	 * @return {Boolean}      [description]
	 */
	check_image(file) {
		return app.ui.image_uploader.allowed_image_types.includes(file.type);
	}

	/**
	 * Display a preview of images selected for upload.
	 * @param  {File} file Image to be dispayed
	 */
	previewFile(file) {
		var reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onloadend = function() {
			var img = document.createElement('img')
			img.src = reader.result
			document.getElementById('gallery').appendChild(img)
		}
	}

	/**
	 * Send Ajax call with image data form - to upload image to server.
	 * @param  {Number} selected_concept_id [description]
	 */
	upload_images(selected_concept_id) {

		app.ui.image_uploader.fd.set('action', "upload_image");
		app.ui.image_uploader.fd.set('selected_concept_id', selected_concept_id);
		app.ui.uploading = true;
		jQuery.ajax({
			type: 'POST',
			url: ajax_object.ajax_url,
			data: app.ui.image_uploader.fd,
			processData: false,
			contentType: false,
			success: function(data) {

				app.ui.image_uploader.reset_input(jQuery("#fileElem"))

				jQuery("#gallery").empty()
				var thanks_div = jQuery('<div class="successful_upload"></div>').text(app.manager.getTranslation("upload_complete"))
				jQuery("#gallery").append(thanks_div);
				jQuery('#drop-area-overlay').fadeOut('slow');
				app.ui.uploading = false;
				setTimeout(function() {
					thanks_div.fadeOut(
						function() {
							jQuery('#upload_image_modal').modal('hide');
							jQuery(this).remove();
						});
				}, 1000);
			},
			error: function(data) {

				app.ui.uploading = false;
				app.ui.image_uploader.reset_input(jQuery("#fileElem"))

				jQuery("#gallery").empty()
				var thanks_div = jQuery('<div class="fail_upload"></div>').text(app.manager.getTranslation("upload_failed"))
				jQuery("#gallery").append(thanks_div)
			}
		});

	}

	/**
	 * Reset the form, clear any existing values.
	 * @param  {Node} element HTML Element
	 */
	reset_input(element) {
		app.ui.image_uploader.fd.delete("image_data[]");

		element.wrap('<form>').closest('form').get(0).reset();
		element.unwrap();

		element.replaceWith(element.val('').clone(true));
		app.ui.image_uploader.fd = new FormData(jQuery('#image_upload_form')[0]);
		jQuery("#gallery").empty()

		if (jQuery("#erase_upload_images").length != 0) {
			jQuery("#erase_upload_images").remove()
		}
	}
}



/**
 * not used
 */
class Modal {
	constructor(modal_id) {
		this.modal_id = modal_id
	}
}

/**
 * not used
 */
class UIElement {
	constructor() {

	}
}

/**
 * not used
 */
class EventManager {
	constructor() {
		this.element_id = ""
		this.element_class = ""
		this.element = ""
		this.element_events = Object()
	}
}


/**
 * Funtions for the Login/Register Modal.
 * Need to be difectly callable. Used in The Child Theme LoginWithAjax Files.
 */

function showSlide(x) {
	jQuery('.send_anonymous_btn').popover('dispose');

	switch (x) {
		case "login":
			jQuery('.active').removeClass('active');
			jQuery('#login_slide').addClass('active');
			break;
		case "remember":
			jQuery('.active').removeClass('active');
			jQuery('#remember_slide').addClass('active');
			break;
		case "register":
			jQuery('.active').removeClass('active');
			jQuery('#register_slide').addClass('active');
			app.ui.add_anonymous_data_popover();
			break;
		case "anonymous_data_slide":
			jQuery('.active').removeClass('active');
			jQuery('#anonymous_data_slide').addClass('active');
			break;
	}
}

/**
 * [refresh_page description]
 * @return {void} [description]
 */
function refresh_page() { /*Choose another language*/
	eraseCookie("language_crowder");
	console.log(document.cookie);
	location.reload();
}

/**
 * Saves the choosen language of the user in the database.
 * @param  {String} user_name [description]
 *
 */
function userRegisterDone(user_name, user_age, anonymous_data) {

	if (anonymous_data) { anonymous_data = "1" } else { anonymous_data = "0" };

	user_age = (new Date()).getFullYear() - user_age;
	if (isNaN(user_age) || user_age < 0) {
		user_age = '';
	}
	jQuery.ajax({
		url: ajax_object.ajax_url,
		type: 'POST',
		data: {
			action: 'save_user_language',
			user_lang: app.manager.current_language,
			anonymous_id: app.manager.user_data.current_user,
			user_name: user_name,
			user_dialect: app.manager.selected_dialect,
			user_age: user_age,
			anonymous_data: anonymous_data
		},
		success: function(response) {
			console.log({
				action: 'save_user_language',
				user_lang: app.manager.current_language,
				anonymous_id: app.manager.user_data.current_user,
				user_name: user_name,
				user_dialect: app.manager.selected_dialect,
				user_age: user_age,
				anonymous_data: anonymous_data
			});

			console.log("Language Added");
			console.log(JSON.parse(response));
		}
	});
}

/**
 * [send_anonymous_data description]
 * @return {void} [description]
 */
function send_anonymous_data() {
	var anonymous_age = jQuery('#user_age').val();
	// anonymous_age = (new Date()).getFullYear() - anonymous_age;
	console.log(anonymous_age);
	if (app.manager.user_data.current_user != "" && app.manager.user_data.current_user != null) {
		if (!isNaN(anonymous_age)) {
			userRegisterDone(app.manager.user_data.current_user, anonymous_age, true);
			current_user_age = anonymous_age;
			jQuery('#register_modal').modal('hide');
		} else {
			jQuery('#no_anoymous_user_data').modal('show');
			jQuery('#no_anoymous_user_data_text').text("Please enter a valid number!");
		}

	} else {
		console.log("no user to register");
		jQuery('#no_anoymous_user_data').modal('show');
	}

}

jQuery(".btn").mouseup(function() {
	jQuery(this).blur();
})