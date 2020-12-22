/**
 * Handles Main Logic and Events
 * @module Content_Interactions
 * 
 * 
 *
 */

var leftmenu_contents = [
  "#left_menu_content_ger",
  "#left_menu_content_fr",
  "#left_menu_content_ita",
  "#left_menu_content_slo"
];


var break_cycle = false;

/**
 * Saves the language choosen by the user from the modal. 0 - German, 1 - French, 2 - Italian, 3 - Slovenian
 * @type {Number}
 */
var current_language = 0;
var va_phase = 1;
var active_va_phases = [1, 2, 3];

var selectbox;

/**
 * Array of all concepts and their ids in the current language choosen.
 * @type {Array}
 */
var concepts_cur_lang;

var filtered_data_phases = [];

// var filtered_data_phase1;
// var filtered_data_phase2;
var filtered_concept_cur_lang1;
var filtered_concept_cur_lang2;
var filtered_concept_cur_lang3;

var filtered_location_submited_data_phases = [];
var filtered_location_submited_data_phase1;
var filtered_location_submited_data_phase2;
var filtered_location_submited_data_phase3;
/**
 * An indexed array containing concept name and the concept id as the array index.
 */
var concepts_index_by_id = [];

/**
 * Index array of user entered answers. Index - Concept Id, Number of user Input of the assosiated concept.
 */
var num_of_answers_by_id;

/**
 * Array with all data for the locations data table.
 * @type {Array}
 */
var location_data;

var dialect_data;
var selected_dialect = "";

var allow_select = false;

var offsetHeight = 0;
var old_doc_width = 0;

var modals_initialized = false;
var locations_modal_modals_initialized = false;
var concepts_modal_initialized = false;
var dialect_modal_initialized = false;

var do_image_modal;
var uploading = false;

var location_listener_added = false;
var inside_location_listener_added = false;

var tutorial_running = false;
var location_selected = false;
var concept_selected = false;
var word_entered = false;
var stage = 0;
var process_restarted = false;

var centerCoordinates_locations = [];


var saved_location_index = -1;
var saved_location_name;
// var current_concept_index = [-1,-1,-1];
var current_concept_index = -1;
var current_dialect_index = -1;


var geo_data;
var aeusserungen_test;
var count_aeusserung_per_location;
var indexed_location_aeusserungen_array;
var aeusserungen_by_locationindex;
var unanswered_concepts;
var current_location_list_table_data;
var current_location_list_table;
var current_location_list_object;
var prevent_randomclick = false;

var datatable_locations;
var datatable_concepts;
var datatable_dialects;

/**
 * Number of currently submitted answers.
 * Used to prop user to register, after he has submitted some answers.
 * @type {Number}
 */
var session_answer_count = 0;

var top_locations;
var top_concepts;
var top_users;
var current_highscoredata;
var current_top_list_table;
var prevent_backdrop = false;

var choosing_location_mode = false;

var event_choose_loc;

var url_choosen_concept;
var url_concept_id;

var wavesurfer;

/**
 * Initializes UI elements according to the browser. Sets the map in the center of the browser.
 *
 */
function initTool() {


  var url = new URL(window.location.href);
  url_concept_id = url.searchParams.get("concept");
  url_dialect_cluster = url.searchParams.get("dcluster");
  url_dialect = url.searchParams.get("dialect");

  if (url_concept_id) jQuery('body').addClass('bavaria_version');



  calculateCenter();

  offsetHeight = jQuery('#left_menu').outerHeight();

  if (!dialect_modal_initialized) {
    get_dialects();
  }


  addModalListeners();

  if (language_is_set && selected_dialect) {
    current_language = parseInt(crowder_lang);


    setRandomTitelImage(function() {
      jQuery('#welcomeback_modal').addClass("fade");

      if (url_concept_id) {

        jQuery('#welcomeback_modal').find('#modal_welcome').html("Willkommen!");
      } else {
        jQuery('#welcomeback_modal').find('#modal_welcome').html(welcomeback_texts[current_language]);
      }

      setTimeout(function() {
        jQuery('#welcomeback_modal').modal({
          keyboard: false
        })
      }, 250);

    }, ".welcome_modal");


  } else if (language_is_set && !selected_dialect) {
    console.log("Lang selected, Dialect Not");

    current_language = parseInt(crowder_lang);


    initWelcomeModal();

    clone_1 = jQuery("#modal_welcome").clone().attr('id', 'modal_welcome_c');
    clone_2 = jQuery("#slogan_id").clone().attr('id', 'slogan_id_c');
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


    setRandomTitelImage(function() {

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
    console.log("Lang And Dialect NOT Selected");
    current_language = -1;
    initWelcomeModal();

    setRandomTitelImage(function() {

      jQuery('#welcome_modal').modal({
        backdrop: 'static',
        keyboard: false
      })

    }, ".welcome_modal");
  }


}

/**
 * Ajusts HTML-Elemets size according to the browser.
 *
 */
function setDynamicContent(source) {


  var doc_width = jQuery(document).width();
  var doc_height = jQuery(document).height();

  offsetHeight = jQuery('#left_menu').outerHeight(); //update height for leftmenu

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

    jQuery('#image_modal').find('.i_fake_body').height('65vh');

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



    for (var i = 0; i < tooltips.length; i++) {
      jQuery(tooltips[i].name).popover('dispose');
    }

    addToolTips(tooltips);

    if (jQuery('.login_popover').parent().parent().hasClass('in')) {

      jQuery('#icon_login').popover('dispose');
      addLoginToolTip();
      showLoginPopUp();

    }


    if (jQuery('.list_modal').hasClass('in')) {

      displayTooltips(false);
      if (modals_initialized) {
        reMeasureDatatables();
      }
    }


    if (doc_width < 485) {

      var offsetstring = "0 0";

      if (current_language == 0) {

        if (doc_width < 338 && doc_width > 329) { offsetstring = "0 -10"; }
        if (doc_width < 323) offsetstring = "0 20";
        if (doc_width < 307) { offsetstring = "0 -25"; }

      }

      if (current_language == 1) {
        if (doc_width < 451) offsetstring = "0 -20";
      }

      if (current_language == 2) {
        if (doc_width < 315) offsetstring = "0 10";
        if (doc_width < 302) offsetstring = "0 -20";
      }



      jQuery('#location_span').popover('dispose');

      jQuery('#location_span').popover({
        trigger: "manual",
        placement: "top",
        container: "body",
        html: true,
        content: '<div class="pop_location_span custom_popover_content">' + location_select_texts_with_br[current_language] + '</div>',
        offset: offsetstring,
        animation: true

      });

      if (stage == 1) {

        jQuery('#location_span').popover('show');

        jQuery('.pop_location_span').parent().on('click', function() {
          handleLocationSpanClick();
        }).addClass('c_hover');

      }


    } else {

      jQuery('#location_span').popover('dispose');
      addToolTip('#location_span', location_select_texts);

    }

    if (stage == 4) {
      jQuery('#submitanswer').popover('show');

      jQuery('.pop_submitanswer').parent().on('click', function() {

        if (!submit_button_clicked) {
          saveWord();
          submit_button_clicked = true;
          setTimeout(function() { submit_button_clicked = false; /*console.log('submit button: After saveword() ' + submit_button_clicked);*/ }, 1000);
        }

      }).addClass('c_hover');

    }


    if (source != "list") showPopUp();

  }

  if (old_doc_width > 575 && doc_width < 575) {

    reMeasureDatatables();
  } else if (old_doc_width < 575 && doc_width > 575) {
    reMeasureDatatables();
  }

  if (doc_width < 452) {
    jQuery('#register_modal .custom-modal-footer button').css('font-size', "10px");
    jQuery('#register_modal .modal-body').css('padding-right', "2px");
  } else {
    jQuery('#register_modal .custom-modal-footer button').css('font-size', "14px");
    jQuery('#register_modal .modal-body').css('padding-right', "10px");
  }


  old_doc_width = doc_width;

}
/**
 * Initializes the CS-Tool. Performes Ajax Calls to fetch data(locations, user entries) from the server. The gathered data is then stored in global variables.
 */
function startMainTool() {

  create_cookie(current_language);

  var menu_content = jQuery(leftmenu_contents[current_language]);

  jQuery('#left_menu').append(menu_content);
  menu_content.show();

  //audio data visualization
  wavesurfer = add_wavesurfer();

  //translating text in register modal
  if (!userLoggedIn) {
    console.log(current_language)
    add_translation_register_modal();
  }

  if (selected_dialect !== "") {
    display_dialect();
  }

  if (!language_is_set) showCustomBackdrop();

  jQuery('#submitanswer').on('click', function() {
    console.log('submit button: Before saveword() ' + submit_button_clicked);

    if (!submit_button_clicked) {
      saveWord();
      submit_button_clicked = true;
      setTimeout(function() {
        submit_button_clicked = false; /*console.log('submit button: After saveword() ' + submit_button_clicked);*/
      }, 1000);


    }

  })

  /*set user language -> to be saved as current_language in the wp_db*/
  if (!language_is_set) { // (crowder_lang/*.localeCompare("") == 0*/ || current_language != crowder_lang || /*crowder_lang.localeCompare("-1") ||*/ crowder_lang == -1 ) && userLoggedIn

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

  /*ajax call to get all locations in the choosen language*/
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
      images = JSON.parse(response);
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
      locations = JSON.parse(response);

      location_data = getTableData(locations, "location");
      initLocationsModal();
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
      concept_data = JSON.parse(response);
      concepts_cur_lang = concept_data;

      //init image upload form
      init_image_upload_form();

      //init concept data with all concept data
      concept_data = getTableData(concepts_cur_lang, "concept");

      va_phase = 0;

      initConceptModal();

      allow_select = true;

      concepts_index_by_id = createConceptIndexList(concepts_cur_lang);



      get_submited_answers(function() {
        setDynamicContent();
        jQuery('#left_menu').css('opacity', '0');
        jQuery('#left_menu').show();
        offsetHeight = document.getElementById('left_menu').offsetHeight;
        jQuery('#left_menu').css('bottom', -offsetHeight);

        jQuery('#left_menu').css('opacity', '1');
        jQuery('#left_menu').animate({
          bottom: '+=' + offsetHeight
        }, 400, 'swing', function() {
          setTimeout(function() {
            menu_is_up();
          }, 500); // set timeout to display toolpits after menu is up and everything else is displayed
        });
      });

      get_submited_answers_current_user(function() {
        unanswered_concepts = createUnansweredIndex();
      });


      /*
      AUDIO FUNCTION
      */

      //add_audio_html();


      jQuery('#left_menu').hammer().bind("swipedown", function() {
        if (jQuery(this).is(':visible')) {
          jQuery(this).animate({
            bottom: '-=' + offsetHeight
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
            bottom: '-=' + offsetHeight
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
            bottom: '+=' + offsetHeight
          }, 400, 'swing', function() {
            jQuery('.popover').show();
          });
          jQuery('#fake_arrow').hide();
        }
      });

      jQuery('#fake_arrow').hammer().bind("swipeup", function() {
        if (jQuery('#left_menu').is(':hidden')) {
          jQuery('#left_menu').show().animate({
            bottom: '+=' + offsetHeight
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

        handleWordSpanClick();
      });

      jQuery('#location_span').on('click', function() {

        handleLocationSpanClick();

      })


      jQuery('#user_input').on('keyup', function() {

        if (process_restarted) {
          closeAllInfoWindows();
          process_restarted = false;
        }

        if (concept_selected && location_selected && stage == 3) {
          word_entered = true;

          setTimeout(function() {

            showPopUp();
          }, 100);

        }



      })



    } //success

  });



}


/**
 * Initializes the Modal at the start of the CS-Tool, when the user has not yet choosen a language, has not yet registred.
 *
 */
function initWelcomeModal() {

  jQuery('#welcome_modal').on('show.bs.modal', function(e) {

    showCustomModalBackdrop();


    selectbox = jQuery('#language_select', this).selectBoxIt({
      theme: "bootstrap",
      defaultText: "Sprache ...",
      showFirstOption: false
    });
    jQuery(".infotext_container").mCustomScrollbar({
      scrollButtons: {
        enable: true
      }
    });

    cycleText(jQuery("#modal_welcome"), welcome_texts, 0, function(i) {

      i -= 1;
      jQuery("#language_selectSelectBoxItText").text(language_texts[i]);
      jQuery("#language_selectSelectBoxItText").attr('data-val', language_texts[i]);

      // jQuery("#navigation_languages").text(navigation_languages[i]);
    });

    cycleText(jQuery("#slogan_id"), slogan_texts, 0);

    cycleText(jQuery("#navigation_languages"), navigation_languages, 0);


    selectbox.on('open', function() {
      if (jQuery('#welcome_modal').find('.modal-content').height() < 340)
        jQuery('.findicators').hide();
    });

    selectbox.on('close', function() {
      jQuery('.findicators').show();
    });

    selectbox.on('change', function() {

      // var select_index =  jQuery('#language_selectSelectBoxItOptions').find(".active").attr('data-id');
      var current_lang;
      var idx = jQuery(this).val();

      console.log("current language index")
      console.log(idx)

      jQuery('#testdiv').hide();

      var select_index = 0;
      select_index = languages.indexOf(idx);


      current_language = select_index;

      var clone_1;
      var clone_2;
      var clone_3;

      if (!break_cycle) {

        current_lang = jQuery("#modal_welcome").attr('lang_id');
        if (current_lang == 4) current_lang = 0;

        clone_1 = jQuery("#modal_welcome").clone().attr('id', 'modal_welcome_c');
        clone_2 = jQuery("#slogan_id").clone().attr('id', 'slogan_id_c');
        clone_3 = jQuery("#navigation_languages").clone().attr('id', 'navigation_languages_c');

        jQuery("#modal_welcome").replaceWith(clone_1);
        jQuery("#slogan_id").replaceWith(clone_2);
        jQuery("#navigation_languages").replaceWith(clone_3);



        break_cycle = true;

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

          clone_1.text(welcome_texts[select_index]);
          clone_2.text(slogan_texts[select_index]);
          clone_3.text(navigation_languages[select_index]);

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
        clone_1.text(welcome_texts[select_index]);
        clone_2.text(slogan_texts[select_index]);
        clone_3.text(navigation_languages[select_index]);
      }

      clone_1.attr('lang_id', select_index);
      clone_2.attr('lang_id', select_index);
      clone_3.attr('lang_id', select_index);

    });

  });

  jQuery('#welcome_modal').hammer().bind("swipeleft", function(e) {

    if (jQuery(".active", e.target).index() == 1 && selected_dialect) {
      jQuery('#welcome_modal').modal('hide');

    } else {
      if (current_language != -1) {
        jQuery('#first_slider').carousel('next');
      } else {
        openLanguageModal();
      }
    }

  });

  jQuery('#welcome_modal').hammer().bind("swiperight", function() {
    if (current_language != -1) {
      jQuery('#first_slider').carousel('prev');
    } else {
      openLanguageModal();
    }

  });


  jQuery('.switch_page_icon').on('click', function() {
    if (current_language != -1) {
      jQuery('#first_slider').carousel('next');
    } else {
      openLanguageModal();
    }
  })

  jQuery('.c-back-button').on('click', function() {
    jQuery('#first_slider').carousel('prev');
  })

  jQuery('#first_slider').on('slide.bs.carousel', function(e) {


    if (jQuery(".active", e.target).index() == 0) {

      jQuery('.c-back-button').fadeIn('slow');
      jQuery('.infotext_head').text(instruction_heads[current_language]);
      jQuery(".text-left-span").text(instruction_texts[current_language]);
      jQuery("#dialekt_span").text(lang_dialect_abbreviation[current_language]);
      jQuery("#go_span").text(go_texts[current_language]);
      jQuery("#suggest_dialect_span").text(suggest_dialect_texts[current_language])

      jQuery("#data_remark").text(data_remark[current_language]);

      jQuery('#remark_link').attr('href', remark_link[current_language]);

    } else {
      jQuery('.c-back-button').fadeOut('fast');
    }
  })


  /*jQuery('#first_slider').on('slid.bs.carousel', function (e) {
        if(jQuery(".active", e.target).index()==1){
          if(!dialect_modal_initialized) {
          get_dialects();
          }
        }
  })*/



  jQuery('#start_tool').on('click', function() {
    if (selected_dialect !== "") {
      jQuery('#welcome_modal').modal('hide');

    } else {
      jQuery('#dialect_not_selected_modal').modal('show');
    }
  })

  jQuery('#dialect_btn').on('click', function() {
    openDialectModal();
  })

  jQuery('#welcome_modal').on('hidden.bs.modal', function() {

    jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() });

    if (selected_dialect !== "") {
      startMainTool();
      //showCustomBackdrop();
    } else {
      jQuery('#dialect_not_selected_modal').modal('show');
    }
  })


}

/**
 * [handleWordSpanClick description]
 *
 */
function handleWordSpanClick() {

  if (allow_select) {


    if (!jQuery('#concepts_modal').hasClass('fade')) {
      jQuery('#concepts_modal').css('opacity', "1");
      jQuery('#concepts_modal').addClass('fade');
    }

    jQuery('#concepts_modal').modal({
      keyboard: false
    });

    if (jQuery('#custom_modal_backdrop').length < 1) showCustomModalBackdrop();

  }

}

/**
 * [handleLocationSpanClick description]
 *
 */
function handleLocationSpanClick() {

  if (allow_select) {

    if (!jQuery('#locations_modal').hasClass('fade')) {
      jQuery('#locations_modal').css('opacity', "1");
      jQuery('#locations_modal').addClass('fade');
    }

    jQuery('#locations_modal').modal({
      keyboard: false
    });

    if (jQuery('#custom_modal_backdrop').length < 1) showCustomModalBackdrop();
  }

}

/**
 * [menu_is_up description]
 *
 */
function menu_is_up() {
  startTutorial();
  jQuery('#showhighscore').on('click', function() {
    buildHighScoreSelect();
  })
  jQuery('#shareicon').on('click', function() {
    openShareModal();
  })
}




/**
 * Creates and returns a indexed array of all concepts in the user's language.
 * @param  {Array} concepts_cur_lang Array with all concepts in the language of the user.
 * @return {Object}                   Indexed Array containing concept id and the concept in the current language.
 */
function createConceptIndexList(concepts_cur_lang, concept_va_phase) {
  var result = {};

  // for (var y = 0; y < concepts_cur_lang.length; y++) {
  //   result[parseInt(concepts_cur_lang[y].id)] = { index: y, name: concepts_cur_lang[y].name, va_phase: concept_va_phase };
  // }

  for (var y = 0; y < concepts_cur_lang.length; y++) {
    result[parseInt(concepts_cur_lang[y].id)] = { index: y, name: concepts_cur_lang[y].name, va_phase: concepts_cur_lang[y].va_phase };
  }

  return result;
}

/**
 * Builds an indexed array containing the number of entries for concepts that the user has entered and the concept's id.
 * @param  {Object} submitedAnswersIndexed indexed array containing all submited entries by the current user.
 * @return {Object}                        contains concept id and number of entries for the associated concept.
 */
function createAnswersToEntryNumbers(submitedAnswersIndexed) {
  var result = {};


  for (var key in submitedAnswersIndexed) {

    var entry = result[parseInt(submitedAnswersIndexed[key].concept_id)];
    if (entry == null) result[parseInt(submitedAnswersIndexed[key].concept_id)] = 1;
    else result[parseInt(submitedAnswersIndexed[key].concept_id)] += 1;

  }

  // for(var i=0;i<submitedAnswers.length;i++){

  //   var entry = result[parseInt(submitedAnswers[i].concept_id)];

  //   if(entry==null) result[parseInt(submitedAnswers[i].concept_id)] = 1;
  //   else result[parseInt(submitedAnswers[i].concept_id)] +=1;

  // }

  return result;

}



/**
 * Initializes the Popover Tutorials.
 *
 */
function startTutorial() {

  tutorial_running = true;
  stage = 1;
  jQuery('#location_span').popover('show');


  jQuery('.pop_location_span').parent().on('click', function() {
    handleLocationSpanClick();
  }).addClass('c_hover');



}

/**
 * Opens Language Modal for the user to choose prefered language.
 *
 */
function openLanguageModal() {

  // jQuery('.message_modal_content').text("Bitte wählen Sie eine Sprache aus!");
  jQuery('#language_modal').modal({
    keyboard: true
  });

}

function openDialectModal() {
  jQuery('#dialect_modal').modal({
    keyboard: true
  });

  //if(jQuery('#custom_modal_backdrop').length<1)showCustomModalBackdrop();
  //jQuery('#custom_modal_backdrop').fadeOut();
}


/**
 * Builds Arrays containg the data for each row that will be displayed in the data tables.
 * @param  {Array} in_data Can be Concepts or Locations Arrays.
 * @param  {String} origin  concept or location
 * @return {Array}         Contains the html elements with the data for the data tables.
 */
function getTableData(in_data, origin) {

  var data = [];

  var wikidata_img_url = url.plugins_Url + '/assets/images/wikidata.png';

  var wikidata_img = "<img class='wikidata_image' src='" + wikidata_img_url + "'/>"


  for (var i = 0; i < in_data.length; i++) {

    if (origin == 'dialect') {
      var res = { name: in_data[i].name, id: in_data[i].id_dialect, column1: {} };
    } else if (origin == 'concept') {
      var res = { va_phase: in_data[i].va_phase, column1: {}, concept_id: in_data[i].id, concept_name: in_data[i].name, qid: in_data[i].qid };
      if (in_data[i].qid != 0 && in_data[i].qid != null) {
        var wikidata_url = "https://www.wikidata.org/wiki/Q" + in_data[i].qid;

        // var wiki_el = '<div class="wiki_info"><div class="wikidata_container"><i title="Wikidata" class="fa fa-wikipedia-w wikidata_icon" href=" ' + wikidata_url + ' " aria-hidden="true">' + wikidata_img + '</i></div></div>';
        var wiki_el = '<div class="wiki_info"><div class="wikidata_container"><i class="wikidata_icon"  title="Wikidata" href=" ' + wikidata_url + ' " aria-hidden="true">' + wikidata_img + '</i></div></div>';

      } else {
        var wiki_el = "";
      }

    } else {
      var res = { column1: {} };
    }

    var name = in_data[i].name;
    var filtered_name = replaceSpecialChars(name);

    if (filtered_name != name) {
      filtered_name += " " + name;
    } else {
      filtered_name = name;
    }

    if (origin == 'concept' && i < important_concepts_count) {
      res.column1.html = '<div class="va_phase_hidden">' + filtered_name + ' va_phase=' + in_data[i].va_phase + ' </div><div  title="' + name + '" class="dataparent"><span class="dataspan"><i title="' + important_concepts_texts[current_language] + '" class="fa fa-exclamation-triangle" aria-hidden="true"></i>' + in_data[i].name + '</span>' + wiki_el + '</div>';
    } else if (origin == 'concept') {
      res.column1.html = '<div class="va_phase_hidden"> ' + filtered_name + ' va_phase=' + in_data[i].va_phase + ' </div><div title="' + name + '" class="dataparent"><span class="dataspan">' + name + '</span>' + wiki_el + '</div>';
    } else if (origin == 'dialect') {
      res.column1.html = '<div title="' + name + '" class="dataparent"><span class="dataspan">' + name + '</span></div>';
    } else {
      res.column1.html = '<div class="dataparent"><span title="' + name + '" class="dataspan">' + name + '</span></div>';
    }

    res.column1.filtered_name = filtered_name;
    data.push(res);
  }



  return data;

}


/**
 * Adds event listeners to all modals.
 */
function addModalListeners() {

  //allow modals without backdrop to be closed when clicked in area beside modal
  jQuery('body').on('click', function(e) {
    if (jQuery(e.target).attr('id') == 'upload_image_modal' && uploading == false) jQuery('#upload_image_modal').modal('hide');
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

  jQuery('#register_modal .customclose').on('click', function() {
    jQuery('#register_modal').modal('hide');
    console.log("custom close");
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

  jQuery('#toplistmodal .customclose').on('click', function() {
    jQuery('#toplistmodal').modal('hide');
  })

  jQuery('#why_register_modal .customclose').on('click', function() {
    prevent_backdrop = false;
    jQuery('#why_register_modal').modal('hide');
  })

  jQuery('#dialect_modal .customclose').on('click', function() {
    jQuery('#dialect_modal').modal('hide');
  })

  jQuery('#no_anoymous_user_data .customclose').on('click', function() {
    jQuery('#no_anoymous_user_data').modal('hide');
  })

  jQuery('#upload_image_modal .customclose').on('click', function() {
    if (!uploading) jQuery('#upload_image_modal').modal('hide');
  })


  jQuery("#icon_login").on('click', function() {
    display_all_register_login_elements();
    setRandomTitelImage(function() {
      jQuery('#register_modal').modal();
    }, '#register_modal')
  })

  /* jQuery('#open_login_modal').on('click',function(){
       jQuery('register_modal').modal();
   })  */

  bindShowListeners_Modal();


}

/**
 * [bindShowListeners_Modal description]
 *
 */
function bindShowListeners_Modal() {


  jQuery('#dialect_not_selected_modal').on('show.bs.modal', function() {
    jQuery(this).find('.dialect_not_selected_modal_content').text(dialect_not_selected_texts[current_language]);
  })


  jQuery('#dialect_modal').on('show.bs.modal', function() {
    if (!jQuery('body').hasClass('modal_init')) {
      jQuery('#custom_modal_backdrop').css('z-index', '1051');
    }
  })

  jQuery('#dialect_modal').on('shown.bs.modal', function() {

    if (dialect_modal_initialized) {

      if (datatable_dialects && (current_dialect_index != -1)) {
        datatable_dialects.row(current_dialect_index).scrollTo();
      }

    }
  })


  jQuery('#locations_modal').on('shown.bs.modal', function(e) {
    if (modals_initialized) {
      datatable_locations.scroller.measure();
      setTimeout(function() {
        datatable_locations.scroller.measure();

      }, 10);

      displayTooltips(false);
      if (process_restarted) {
        closeAllInfoWindows();
        process_restarted = false;
      }
      setTimeout(function() {
        document.getElementById("focusinput").focus();
      }, 0);

      if (saved_location_index != -1) {
        datatable_locations.row(saved_location_index).scrollTo();
      }

    }

  })


  jQuery('#concepts_modal').on('shown.bs.modal', function(e) {

    if (modals_initialized) {
      datatable_concepts.scroller.measure();
      setTimeout(function() {
        datatable_concepts.scroller.measure();
      }, 10);
      displayTooltips(false);
      if (process_restarted) {
        closeAllInfoWindows();
        process_restarted = false;
      }
      do_image_modal = false;


      if (current_concept_index != -1 && jQuery('#va_phase_wrapper_concept_list').find('.va_phase_' + va_phase).hasClass("active")) {
        datatable_concepts.row(current_concept_index).scrollTo();
        selectTableEntry(current_concept_index);
      }
    }

    jQuery(".wikidata_icon").off("click");
    jQuery(".wikidata_icon").on('click', function(e) {
      e.stopPropagation();
      window.open(jQuery(this).attr('href'), '_blank');
    });

  })

  jQuery('#concepts_modal').on('show.bs.modal', function(e) {

    switch (current_language) {
      case 0:
        jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('german_va');
        break;
      case 1:
        jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('french_va');
        break;
      case 2:
        jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('italian_va');
        break;
      case 3:
        jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('slovenian_va');
        break;
    }

  })

  jQuery('#image_modal').on('shown.bs.modal', function(e) {

    setTimeout(function() {

      jQuery('#image_modal').find('#image_slider').carousel({
        interval: 3500
      })

      setDynamicContent('image');
    }, 10);
  })

  jQuery('#locations_modal').on('hidden.bs.modal', function() {

    setTimeout(function() { displayTooltips(true); }, 200);
    if (tutorial_running) showPopUp();
    jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
  })


  jQuery('#concepts_modal').on('hidden.bs.modal', function() {

    if (do_image_modal) jQuery('#image_modal').modal({});

    if (!prevent_backdrop) {
      setTimeout(function() { displayTooltips(true); }, 200);
      if (tutorial_running) showPopUp();
      jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
    }

  })


  jQuery('#message_modal').on('shown.bs.modal', function(e) {
    jQuery('#userAuesserungInput').focus();
    displayTooltips(false);
  })

  jQuery('#message_modal').on('hidden.bs.modal', function(e) {
    jQuery('#userAuesserungInput').focus();
    displayTooltips(true);
  })



  jQuery('#register_modal').on('shown.bs.modal', function(e) {

    prevent_backdrop = false;
    jQuery(this).find('.custom-modal-footer button').on('click', function() {

      jQuery('#register_modal').find('.custom-modal-footer button').removeClass('active_tab');
      jQuery(this).addClass('active_tab');

    })

    //add_anonymous_data_popover();
    register_login_modal_events();

  })

  jQuery('#register_modal').on('show.bs.modal', function(e) {
    if (!prevent_backdrop) {
      displayTooltips(false);
      showCustomModalBackdrop();
    }
  })


  jQuery('#register_modal').on('hidden.bs.modal', function(e) {
    jQuery('.send_anonymous_btn').popover('dispose');
    displayTooltips(true);
    jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
    jQuery('#anonymous_data_slide').removeClass('active');
  })

  jQuery('#input_modal').on('shown.bs.modal', function(e) {
    if (!jQuery('#location_list_modal').hasClass('in')) displayTooltips(false);
  })

  jQuery('#input_modal').on('show.bs.modal', function(e) {
    jQuery('#custom_modal_backdrop').css('z-index', '10000');
  })


  jQuery('#input_modal').on('hidden.bs.modal', function(e) {
    if (!jQuery('#location_list_modal').hasClass('in')) { displayTooltips(true); }
    jQuery('#custom_modal_backdrop').css('z-index', '1049');
  })

  jQuery('#welcomeback_modal').on('shown.bs.modal', function(e) {



    setTimeout(function() {
      // jQuery('#custom_backdrop i').css('top','-150px');
      startMainTool();
    }, 200);


  })

  jQuery('#welcome_modal').on('shown.bs.modal', function(e) {
    jQuery('#custom_backdrop').fadeOut('slow', function() { jQuery(this).remove(); });

  })


  jQuery('#location_list_modal').on('show.bs.modal', function(e) {
    current_location_list_table = createLocationListTable(current_location_list_table_data);


    switch (current_language) {
      case 0:
        jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('german_va');
        break;
      case 1:
        jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('french_va');
        break;
      case 2:
        jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('italian_va');
        break;
      case 3:
        jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('slovenian_va');
        break;
    }

    do_image_modal = false;
  })

  jQuery('#location_list_modal').on('shown.bs.modal', function(e) {
    displayTooltips(false);
    current_location_list_table.scroller.measure();
    current_location_list_table.columns.adjust();


  })


  jQuery('#location_list_modal').on('hidden.bs.modal', function() {

    setTimeout(function() { displayTooltips(true); }, 200);
    if (tutorial_running) showPopUp();
    jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
    if (do_image_modal) jQuery('#image_modal').modal({});
  })


  jQuery('#toplistmodal').on('show.bs.modal', function(e) {
    current_top_list_table = createTopListTable(current_highscoredata);
  })

  jQuery('#toplistmodal').on('shown.bs.modal', function(e) {
    prevent_backdrop = false;
    current_top_list_table.columns.adjust();
  })

  jQuery('#toplistmodal').on('hidden.bs.modal', function(e) {
    jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
    displayTooltips(true);
  })

  jQuery('#highscore_select_modal').on('hidden.bs.modal', function(e) {
    if (!prevent_backdrop) {
      jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
      displayTooltips(true);
    }
  })

  jQuery('#share_modal').on('hidden.bs.modal', function(e) {
    if (!prevent_backdrop) {
      jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
      displayTooltips(true);
    }
  })

  jQuery('#highscore_select_modal').on('show.bs.modal', function(e) {
    displayTooltips(false);
  })

  jQuery('#share_modal').on('show.bs.modal', function(e) {
    displayTooltips(false);
  })


  jQuery('#why_register_modal').on('show.bs.modal', function(e) {
    if (!prevent_backdrop) {
      showCustomModalBackdrop();
      displayTooltips(false);
    }
  })


  jQuery('#why_register_modal').on('hidden.bs.modal', function(e) {
    if (!prevent_backdrop) {
      displayTooltips(true);
      jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
    }
  })

  jQuery('#dialect_modal').on('hidden.bs.modal', function(e) {
    if (!prevent_backdrop && !jQuery("#welcome_modal").hasClass('in')) {
      displayTooltips(true);
      jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
    }
    jQuery('#custom_modal_backdrop').css('z-index', "");
  })

  jQuery('#why_register_modal').on('shown.bs.modal', function(e) {
    if (prevent_backdrop) prevent_backdrop = false;
  })



}



function buildTable(list) {

  var result = jQuery('<tbody>');

  for (var i = 0; i < list.length; i++) {
    var tr = jQuery('<tr></tr>');
    tr.attr('ref_id', list[i]['id']);
    tr.append(jQuery('<td>' + list[i]['name'] + '</td>'));
    result.append(tr);
  }

  return result;

}

/**
 * [createLocationListModal description]
 * @param  {HTML} modal  [description]
 * @param  {Array} data   [description]
 * @param  {String} origin [description]
 *
 */
function createLocationListModal(modal, data, origin) {
  // used only for locations modal list


  var id;
  var scrollY;
  var emptyTable;


  id = "#location_modal_table";
  scrollY = "76vh";
  emptyTable = search_for_location[current_language];



  var table = modal.find(id).DataTable({

    data: data,
    columns: [{
      data: {
        _: "column1.html",
        filter: "column1.filtered_name"
      }
    }, ],

    deferRender: false, //otherwise .node() won't always work
    scrollY: scrollY,
    scrollX: false,
    scrollCollapse: true,
    info: false,
    ordering: false,

    scroller: {
      displayBuffer: 2,
    },
    language: {
      zeroRecords: emptyTable
    },
    retrieve: true,
    destroy: true,


    fnInitComplete: function(settings) {





      var input = modal.find('input');
      if (origin == 'location') {
        input.attr('autofocus', "");
        input.attr('id', 'focusinput');
      } //id for js call in bind show listeners
      input.attr('autocomplete', "off");

      var buttonparent;

      if (!modals_initialized && origin == "location") {

        buttonparent = jQuery('<div class="list_modal_button_parent"></div>');
        jQuery('#location_modal_table_filter').after(buttonparent);

        var search_location_button = jQuery('<div class="list_modal_button_in_search"><i class="fa fa-map-marker" aria-hidden="true"></i> ' + search_map_location[current_language] + '</div>');
        buttonparent.append(search_location_button);


        search_location_button.on('click', function() {
          init_location_search_mode(modal);
        });

      }



      modal.find('tbody').on('click', 'tr', function() {
        /*prevents error if user clicks on an empty data table*/
        if (table.page.info().recordsDisplay !== 0) {

          var index = table.row(this).index()



          if (origin == "concept") {

          } else {
            location_selected = true;
            if (url_concept_id) {
              concept_selected = true;
            }

            var name = locations[index].name;
            var id = locations[index].id;

            if (saved_location_index != index) {

              var row = table.row(index).node();
              jQuery(row).addClass('green_row');
              var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
              jQuery(row).find('.dataspan').prepend(icon);

            }

            //for unsetting green on pervious selection

            if (saved_location_index != -1 && saved_location_index != index) {

              var row = table.row(saved_location_index).node();
              jQuery(row).removeClass('green_row');
              jQuery(row).find('.fa-check').remove();
            }

            saved_location_index = index;
            saved_location_name = name;


            jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() });
            jQuery('#location_span').text(name);
            jQuery('#location_span').attr("data-id_location", id);
            setDynamicContent('list'); // for offset since hight of left menu could change

            /*Show Gemeinde Grenzen*/

            jQuery('#image_modal').modal('hide');
            var g_location = name;
            var g_location_id = id;

            var index = contains.call(existingLocations, g_location_id);

            showPolygon(g_location, g_location_id, true);
            remove_location_search_listener();
            /*END*/
          }

          setTimeout(function() { modal.modal('hide'); }, 220); //delay to show select effect
        } else if (origin == "location" /*&& !choosing_location_mode*/ ) { /*when the location dataTable is empty - let user choose a Gemeinde*/
          init_location_search_mode(modal);

        }

      });
      if (!modals_initialized) {



        setTimeout(function() { modal.modal('hide'); }, 1); //for closing modal on init

        locations_modal_modals_initialized = true;


        if (locations_modal_modals_initialized && concepts_modal_initialized) {
          modals_initialized = true;

          if (language_is_set) jQuery('#welcomeback_modal').modal('hide');
        }

      }

    }
  });


  if (origin != "concept") {

    table.on('draw.dt', function() {


      if (jQuery('#locations_modal .dataTables_empty').length > 0) {

        jQuery('#locations_modal .dataTables_empty').css('white-space', 'normal');
        jQuery('#locations_modal .dataTables_scrollBody').css('overflow', 'hidden');
        jQuery('#locations_modal .dataTables_scrollBody').css('min-height', '88px');

      } else {
        jQuery('#locations_modal .dataTables_empty').css('white-space', '');
        jQuery('#locations_modal .dataTables_scrollBody').css('overflow', '');
        jQuery('#locations_modal .dataTables_scrollBody').css('min-height', '');

      }

    });

  }

  return table;

}

function createConceptsListModal(modal, data, origin) {

  var id;
  var scrollY;
  var emptyTable;

  if (origin == "concept") {
    id = "#concept_modal_table";
    scrollY = "76vh";
    emptyTable = no_results_data_table[current_language];
  }

  var table = modal.find(id).DataTable({

    data: data,
    columns: [{
      data: {
        _: "column1.html",
        filter: "column1.html",

      }
    }],

    deferRender: false, //otherwise .node() won't always work
    scrollY: scrollY,
    scrollX: false,
    scrollCollapse: true,
    info: false,
    ordering: false,
    scroller: {
      displayBuffer: 16,
    },
    language: {
      zeroRecords: emptyTable
    },


    fnInitComplete: function(settings) {

      var input = modal.find('input');
      if (origin == 'location') {
        input.attr('autofocus', "");
        input.attr('id', 'focusinput');
      } //id for js call in bind show listeners
      input.attr('autocomplete', "off");

      var buttonparent;

      if (!modals_initialized && origin == "concept") {

        buttonparent = jQuery('<div class="list_modal_button_parent"></div>');
        jQuery('#concept_modal_table_filter').after(buttonparent);

        var random_button = jQuery('<div class="list_modal_button_in_search"><i class="fa fa-random" aria-hidden="true"></i> ' + random_texts[current_language] + '</div>');
        buttonparent.append(random_button);

        /*button for choosing random concept*/
        random_button.on('click', function() {

          if (!prevent_randomclick) {
            do_image_modal = false;
            prevent_randomclick = true;
            if (jQuery('#concepts_modal').find('input').val() != "") datatable_concepts.search('').columns().search('').draw();
            var rnd_idx = getRandomUnAnsweredConceptIndex();

            if (rnd_idx > 0) {

              datatable_concepts.row(rnd_idx).scrollTo();
              // deSelectTableEntry(current_concept_index[va_phase]);
              deSelectTableEntry(current_concept_index);
              selectTableEntry(rnd_idx);
              // current_concept_index[va_phase] = rnd_idx;
              current_concept_index = rnd_idx;

              var name = concepts_cur_lang[rnd_idx].name;
              concept_selected = true;
              var id = concepts_cur_lang[rnd_idx].id;

              jQuery('#word_span').text(name);
              jQuery('#word_span').attr("data-id_concept", id);
              jQuery('#word_span').attr("data-id_concept_index", rnd_idx);
              setDynamicContent('list');
              if (!jQuery('#why_register_modal').hasClass('in')) checkImageModal(id, name);

              setTimeout(function() {
                prevent_randomclick = false
              }, 500);

            } else {

              setTimeout(function() {
                prevent_randomclick = false
              }, 500);
              alert("No unanswered concept found for active phases.");
            }

          }
        })

        /*button for suggesting new concepts*/
        var suggest_button = jQuery('<div class="list_modal_button_in_search"><i class="fa fa-plus" aria-hidden="true"></i> ' + suggest_texts[current_language] + '</div>');
        buttonparent.append(suggest_button);
        if (!userLoggedIn) suggest_button.addClass('disabled_feature');

        suggest_button.on('click', function() {
          if (!userLoggedIn) {
            prevent_backdrop = true;
            jQuery('#concepts_modal').modal('hide');
            openWhyRegisterModal();
          } else {
            jQuery('.input_modal_content').empty();
            var suggest_headline = jQuery('<div class="suggest_headline">' + suggest_texts[current_language] + ':</div>');
            var suggest_field = jQuery('<input class="suggest_field"></input>');
            var suggest_button_submit = jQuery('<div class="suggest_button_submit suggest_btn">' + submit_texts[current_language] + '</div>');
            var feedback_div = jQuery('<div class="feedback_suggest">' + feedback_texts[current_language] + '</div>');
            jQuery('.input_modal_content').append(suggest_headline).append(suggest_field).append(suggest_button_submit);

            jQuery('#input_modal').modal();

            suggest_button_submit.off().on('click', function() {
              if (suggest_field.val() == "") {
                markInputRed(suggest_field);
              } else {
                sendSuggestEmail(suggest_field.val(), function() {
                  suggest_button_submit.fadeOut('fast', function() {
                    jQuery('.input_modal_content').append(feedback_div);
                    feedback_div.fadeIn('fast');

                    setTimeout(function() {
                      jQuery('#input_modal').modal('hide');
                      jQuery('.input_modal_content').empty();
                    }, 1500);

                  })
                })
              }
            })
          }
        })

        /*change va_phase concepte*/
        var alm = jQuery('<div class="list_modal_button_va_phase va_phase_1 active noselect" data-va_phase = "1"><i class="far fa-check-square"></i>' + alpine_agriculture[current_language] + '</div>'); // 'Almwirtschaft'
        var natur = jQuery('<div class="list_modal_button_va_phase va_phase_2 active noselect" data-va_phase = "2"><i class="far fa-check-square"></i>' + alpine_nature[current_language] + '</div>'); // 'Natur'
        var modern = jQuery('<div class="list_modal_button_va_phase va_phase_3 active noselect" data-va_phase = "3"><i class="far fa-check-square"></i>' + alpine_modern[current_language] + '</div>'); // 'Modern'

        jQuery("#va_phase_wrapper_concept_list").remove();
        var va_phase_wrapper = jQuery('<div id="va_phase_wrapper_concept_list" class="va_phase_wrapper"></div>');

        va_phase_wrapper.append(alm);
        va_phase_wrapper.append(natur);
        va_phase_wrapper.append(modern);
        //jQuery('#concepts_modal').children().prepend(va_phase_wrapper);

        jQuery('#concepts_modal').children().find('.modal-content').append(va_phase_wrapper);

        jQuery("#va_phase_wrapper_concept_list").find('.list_modal_button_va_phase').on('click', function() {
          var selected_va_phase = jQuery(this).data('va_phase');



          //ALTERNATIVE VA PHASE SWITCH (CHECKBOX STYLE)
          switch (selected_va_phase) {
            case 1:
              current_concept_index = -1;
              if (jQuery("#va_phase_wrapper_concept_list").find('.va_phase_1').hasClass('active')) {
                jQuery("#va_phase_wrapper_concept_list").find('.va_phase_1').removeClass('active');
                jQuery(".list_modal_button_va_phase.va_phase_1").find('i').removeClass('fa-check-square').addClass('fa-square');
              } else {
                jQuery("#va_phase_wrapper_concept_list").find('.va_phase_1').addClass('active');
                jQuery(".list_modal_button_va_phase.va_phase_1").find('i').removeClass('fa-square').addClass('fa-check-square');
                va_phase = 1;
              }
              break;
            case 2:
              current_concept_index = -1;
              if (jQuery("#va_phase_wrapper_concept_list").find('.va_phase_2').hasClass('active')) {
                jQuery("#va_phase_wrapper_concept_list").find('.va_phase_2').removeClass('active');
                jQuery(".list_modal_button_va_phase.va_phase_2").find('i').removeClass('fa-check-square').addClass('fa-square');
              } else {
                jQuery("#va_phase_wrapper_concept_list").find('.va_phase_2').addClass('active');
                jQuery(".list_modal_button_va_phase.va_phase_2").find('i').removeClass('fa-square').addClass('fa-check-square');
                va_phase = 2;
              }
              break;
            case 3:
              current_concept_index = -1;
              if (jQuery("#va_phase_wrapper_concept_list").find('.va_phase_3').hasClass('active')) {
                jQuery("#va_phase_wrapper_concept_list").find('.va_phase_3').removeClass('active');
                jQuery(".list_modal_button_va_phase.va_phase_3").find('i').removeClass('fa-check-square').addClass('fa-square');
              } else {
                jQuery("#va_phase_wrapper_concept_list").find('.va_phase_3').addClass('active');
                jQuery(".list_modal_button_va_phase.va_phase_3").find('i').removeClass('fa-square').addClass('fa-check-square');
                va_phase = 3;
              }
              break;
          }



          active_va_phases = check_active_concepts(jQuery('#va_phase_wrapper_concept_list').find('.active'));

          /**
           * filter displayed concepts using hiddenhtml elment in the rows for the va_phase
           */
          if (active_va_phases.length > 0) {
            var regexFromMyArray = '.*va_phase=(' + active_va_phases.join("|") + ').*'

          } else {
            var regexFromMyArray = '.*va_phase=(0).*'

          }

          table.columns().search(regexFromMyArray, true).draw();


          if (current_concept_index != -1 && jQuery('#va_phase_wrapper_concept_list').find('.va_phase_' + va_phase).hasClass("active")) {
            datatable_concepts.row(current_concept_index).scrollTo();
            selectTableEntry(current_concept_index);
          }

          jQuery(".wikidata_icon").off("click");
          jQuery(".wikidata_icon").on('click', function(e) {
            e.stopPropagation();
            window.open(jQuery(this).attr('href'), '_blank');
          });


        }) //click

      }

      jQuery(".wikidata_icon").off("click");
      jQuery(".wikidata_icon").on('click', function(e) {
        e.stopPropagation();
        window.open(jQuery(this).attr('href'), '_blank');
      });

      modal.find('tbody').on('click', 'tr', function() {

        /*prevents error if user clicks on an empty data table*/
        if (table.page.info().recordsDisplay !== 0) {

          var index = table.row(this).index();


          var row_data = table.row(this).data();
          if (origin == "concept") {


            var name = row_data.concept_name; //concepts_cur_lang[index].name;

            concept_selected = true;
            var id = row_data.concept_id; //concepts_cur_lang[index].id;

            // if (current_concept_index[va_phase] != -1) deSelectTableEntry(current_concept_index[va_phase]);
            if (current_concept_index != -1) deSelectTableEntry(current_concept_index);

            selectTableEntry(index);


            // current_concept_index[va_phase] = index;
            current_concept_index = index;


            jQuery('#image_modal').modal('hide');

            jQuery('#word_span').text(name);
            jQuery('#word_span').attr("data-id_concept", id);
            jQuery('#word_span').attr("data-id_concept_index", index);
            setDynamicContent('list'); // for offset since hight of left menu could change

            checkImageModal(id, name);
            jQuery('#custom_modal_backdrop').fadeOut(function() {
              jQuery(this).remove()
            });

            /*END*/
            remove_location_search_listener();
          }


          setTimeout(function() {
            modal.modal('hide');
          }, 220); //delay to show select effect
        }
      });




      if (!modals_initialized) {

        setTimeout(function() {
          modal.modal('hide');
        }, 1); //for closing modal on init

        concepts_modal_initialized = true;

        if (locations_modal_modals_initialized && concepts_modal_initialized) {
          modals_initialized = true;

          if (language_is_set) jQuery('#welcomeback_modal').modal('hide');
        }

      }

    }
  });



  return table;

}

function check_active_concepts(dom_elements) {
  var active_phases = [];

  dom_elements.each(function() {
    active_phases.push(jQuery(this).data('va_phase'));
    //console.log(jQuery(this).data('va_phase') - 1);
  })

  return active_phases
}


/*begin: for dialect list modal*/
function create_dialect_list_modal(modal, data) {

  jQuery('body').addClass('modal_init');

  jQuery('#dialect_modal').removeClass('fade');

  var bavaria_version = false;
  if (jQuery('body').hasClass('bavaria_version')) bavaria_version = true;

  var id;
  var scrollY;
  var emptyTable;


  id = "#dialect_modal_table";
  scrollY = "76vh";
  emptyTable = no_results_data_table[current_language];


  var table = modal.find(id).DataTable({

    data: data,
    columns: [{
      data: {
        _: "column1.html",
        filter: "column1.filtered_name"
      }
    }, ],

    deferRender: false, //otherwise .node() won't always work
    scrollY: scrollY,
    scrollX: false,
    scrollCollapse: true,
    info: false,
    ordering: false,
    paging: false,
    searching: !bavaria_version,
    language: {
      zeroRecords: emptyTable
    },
    retrieve: true,



    fnInitComplete: function(settings) {


      if (!bavaria_version) {

        var input = modal.find('input');

        input.attr('autocomplete', "off");

        buttonparent = jQuery('<div class="list_modal_button_parent"></div>');
        jQuery('#dialect_modal_table_filter').after(buttonparent);

        var buttonparent;

        var suggest_button = jQuery('<div class="list_modal_button_in_search suggest_dialect"><i class="fa fa-plus" aria-hidden="true"></i> <span id="suggest_dialect_span">' + suggest_dialect_texts[current_language] + '</span></div>');
        buttonparent.append(suggest_button);


        suggest_button.on('click', function() {

          jQuery('.input_modal_content').empty();
          var suggest_headline = jQuery('<div class="suggest_headline">' + suggest_dialect_texts[current_language] + ':</div>');
          var suggest_field = jQuery('<input class="suggest_field"></input>');
          var suggest_button_submit = jQuery('<div id="suggest_dialect" class="suggest_button_submit suggest_btn">' + submit_texts[current_language] + '</div>');
          var feedback_div = jQuery('<div class="feedback_suggest">' + feedback_texts[current_language] + '</div>');
          jQuery('.input_modal_content').append(suggest_headline).append(suggest_field).append(suggest_button_submit);

          jQuery('#input_modal').modal();

          suggest_button_submit.on('click', function() {
            var choosen_dialect = suggest_field.val();

            if (choosen_dialect == "") {
              markInputRed(suggest_field);
            } else {

              /*are you sure???*/
              jQuery('#input_modal').modal('hide');
              jQuery('.input_modal_content').empty();



              setTimeout(function() {
                var suggest_headline = jQuery('<div class="suggest_headline dont-break-out">' + selected_dialect_texts[current_language] + ": <em>" + choosen_dialect + '</em></div>');
                var suggest_button_submit = jQuery('<div id="choose_dialect" class="suggest_button_submit suggest_btn green_button"><i class="fa fa-check" aria-hidden="true"></i> ' + submit_dialect_texts[current_language] + '</div><div id= "regect_btn" class="suggest_button_submit suggest_btn red_button"><i class="fa fa-times" aria-hidden="true"></i> ' + abort_dialect_texts[current_language] + '</div>');
                var feedback_div = jQuery('<div class="feedback_suggest">' + feedback_texts[current_language] + '</div>');
                jQuery('.input_modal_content').append(suggest_headline).append(suggest_button_submit);

                /*not sure*/
                jQuery("#regect_btn").on('click', function() {
                  jQuery('.input_modal_content').empty();
                  jQuery('#input_modal').modal('hide');
                })
                jQuery('#input_modal').modal();

                /*yes, sure*/
                jQuery("#choose_dialect").one('click', function() {

                  /*handle suggest dialect ajax call*/
                  jQuery.ajax({
                    url: ajax_object.ajax_url,
                    type: 'POST',
                    data: {
                      action: 'suggest_dialect',
                      dialect: choosen_dialect
                    },
                    success: function(response) {
                      var new_dialect = JSON.parse(response);
                      var new_dialect_name = new_dialect.dialect;
                      var new_dialect_id = new_dialect.id;

                      setTimeout(function() {



                        /*remove choosen marker for previous selected dialect */
                        if (current_dialect_index != -1) {
                          var row = table.row(current_dialect_index).node();
                          jQuery(row).removeClass('green_row');
                          jQuery(row).find('.fa-check').remove();
                        }


                        selected_dialect = choosen_dialect;

                        jQuery("#user_dialect").text(selected_dialect);
                        jQuery('#input_modal').modal('hide');
                        jQuery('.input_modal_content').empty();

                        var data_to_add = '<div title="' + selected_dialect + '" class="dataparent"><span title="' + selected_dialect + '" class="dataspan">' + selected_dialect + '</span></div>';
                        table.row.add({ name: selected_dialect, id: new_dialect_id, column1: { filtered_name: selected_dialect, html: data_to_add } }).draw();
                        dialect_array.push({ id_dialect: new_dialect_id, name: new_dialect_name });


                        if (info_window_dialect_change) {

                          jQuery("#dialect_infowindow").text(selected_dialect);
                          var id_submited_answer = jQuery("#dialect_infowindow").data("submited-answer");


                          /*TODO ajax call here for dialect changing of an answer*/
                          jQuery.ajax({
                            url: ajax_object.ajax_url,
                            type: 'POST',
                            data: {
                              action: 'update_dialect_for_submited_answer',
                              id_aeusserung: id_submited_answer,
                              dialect: selected_dialect,
                              id_dialect: new_dialect_id
                            },
                            success: function(response) {

                            }

                          });

                          info_window_dialect_change = false;



                          setTimeout(function() {
                            modal.modal('hide');
                            jQuery("custom_modal_backdrop").hide();
                          }, 220);

                        } else {

                          selected_dialect = choosen_dialect;

                          jQuery("#dialekt_span").text(lang_dialect_abbreviation[current_language] + " : " + selected_dialect);
                          jQuery('#input_modal').modal('hide');
                          jQuery('.input_modal_content').empty();

                          setTimeout(function() { modal.modal('hide'); }, 220);


                        }
                        /*mark new dialect as selected*/
                        current_dialect_index = get_dialect_index(selected_dialect, table); //datatable_dialects.rows().data().length - 1;
                        var row = table.row(current_dialect_index).node();
                        jQuery(row).addClass('green_row');
                        var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
                        jQuery(row).find('.dataspan').prepend(icon);


                      }, 500);
                    }
                  });
                });

              }, 500)




            }
          })
        })

        /*end handle suggest button click*/

      } //end if not bavaria version
      else {
        jQuery('#dialect_modal .modal-body').css('padding-top', '38px');
      }

      modal.find('tbody').on('click', 'tr', function() {
        /*prevents error if user clicks on an empty data table*/
        if (table.page.info().recordsDisplay !== 0) {


          var index = table.row(this).index();
          var name = table.row(this).data().name;


          /*mark selected dialect green*/
          if (current_dialect_index != index) {

            var row = table.row(index).node();
            jQuery(row).addClass('green_row');
            var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
            jQuery(row).find('.dataspan').prepend(icon);

          }

          //for unsetting green on pervious selection

          if (current_dialect_index != -1 && current_dialect_index != index) {

            var row = table.row(current_dialect_index).node();
            jQuery(row).removeClass('green_row');
            jQuery(row).find('.fa-check').remove();
          }

          current_dialect_index = index;

          jQuery("#dialekt_span").text(lang_dialect_abbreviation[current_language] + " : " + name);
          selected_dialect = name;
          //console.log(jQuery("#welcome_modal").data('bs.modal')._isShown);

          if (userLoggedIn) {
            save_user_dialect(current_user);
          }

          if (info_window_dialect_change) {

            jQuery("#dialect_infowindow").text(selected_dialect);
            var id_submited_answer = jQuery("#dialect_infowindow").data("submited-answer");


            /*TODO ajax call here for dialect changing of an answer*/
            jQuery.ajax({
              url: ajax_object.ajax_url,
              type: 'POST',
              data: {
                action: 'upate_dialect_submited_answer',
                id_aeusserung: id_submited_answer,
                dialect: selected_dialect,
                id_dialect: table.row(this).data().id
              },
              success: function(response) {

              }

            });

            info_window_dialect_change = false;
          }

          jQuery("#user_dialect").text(selected_dialect);

          setTimeout(function() {
            modal.modal('hide');
            jQuery("custom_modal_backdrop").hide();
          }, 220); //delay to show select effect
        }

      });
      dialect_modal_initialized = true;

      jQuery('#dialect_modal').modal({});

      jQuery('#dialect_modal').modal('hide');
      jQuery('body').removeClass('modal_init');
      jQuery('#dialect_modal').addClass('fade');

    }
  });




  table.on('draw.dt', function() {

    // console.log("DRAW");

    if (jQuery('#dialect_modal .dataTables_empty').length > 0) {

      jQuery('#locations_modal .dataTables_empty').css('white-space', 'normal');
      jQuery('#locations_modal .dataTables_scrollBody').css('overflow', 'hidden');
      jQuery('#locations_modal .dataTables_scrollBody').css('min-height', '88px');

    } else {
      jQuery('#locations_modal .dataTables_empty').css('white-space', '');
      jQuery('#locations_modal .dataTables_scrollBody').css('overflow', '');
      jQuery('#locations_modal .dataTables_scrollBody').css('min-height', '');

    }

  });


  /*mark dialect as selected in the data table*/
  if (selected_dialect) {
    current_dialect_index = get_dialect_index(selected_dialect, table);

    var row = table.row(current_dialect_index).node();
    jQuery(row).addClass('green_row');
    var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
    jQuery(row).find('.dataspan').prepend(icon);
  }



  return table;

}

/*END: for dialect list modal*/


function init_location_search_mode(modal) {
  choosing_location_mode = true;

  if (!location_listener_added) add_location_search_listener();
  location_listener_added = true;

  jQuery('#image_modal').modal('hide');
  if (location_selected) {
    jQuery('#location_span').text(the_word_location[current_language]);
    jQuery('#user_input').val('');
    setDynamicContent('list');
    //stage = 1;
    location_selected = false;
    word_entered = false;
    jQuery('.pop_submitanswer').popover('hide');
    jQuery('#submitanswer').popover('hide');

    // console.log("selected");
  }



  setTimeout(function() {
    modal.modal('hide');
    chooseGemiendeOutsideOfAlpineConvention();
  }, 100);
  //console.log("print state");
  // printState();

}

function printState() {
  console.log("stage");
  console.log(stage);
  console.log("location selected");
  console.log(location_selected);
  console.log("concept_selected");
  console.log(concept_selected);
  console.log("word_entered");
  console.log(word_entered);
}

function chooseGemiendeOutsideOfAlpineConvention() {

  // map.setOptions({ draggableCursor: 'crosshair' });
  jQuery('#location_span').attr('data-content', click_on_location[current_language]); // click_on_location 'Click your location on the map.'

  if (choosing_location_mode) {


    L.DomUtil.addClass(map._container, 'crosshair-cursor-enabled');
    // event_choose_loc = map.on("click", function(event) {

    if (!inside_location_listener_added) {

      map.on("click", function(event) {

        if (choosing_location_mode) {
          var latitude = event.latlng.lat;
          var longitude = event.latlng.lng;
          get_location_and_display(latitude, longitude);
          inside_location_listener_added = true;
        }

      });
    }
  }
}

function get_location_and_display(lat, lng) {
  /*concept selected when in url:*/


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
      //console.log(data);
      var loc_name = data.name;
      var loc_id = data.id;
      //console.log(loc_name, loc_id);

      if (loc_name != null) {
        jQuery('#location_span').text(loc_name);
        jQuery('#location_span').attr("data-id_location", loc_id);
        //jQuery('#submitanswer').popover('hide');
        //stage = 5;
        location_selected = true;
        if (concept_selected !== true) {
          if (url_concept_id) {
            concept_selected = true;
          } else {
            concept_selected = false;
          }
        }
        word_entered = false;
        tutorial_running = true;

        setDynamicContent('list');
        displayTooltips(true);
        showPopUp();


        showPolygon(loc_name, loc_id, false);
        // jQuery('#custom_backdrop').hide().css('background','');
      } else {
        jQuery('#custom_backdrop').hide().css('background', '');
        console.log("Nothing found");
        jQuery('.message_modal_content').text(nothing_found[current_language]);
        jQuery('#message_modal').modal({
          backdrop: 'static',
          keyboard: false
        });
      }

    }
  });


}


/**
 * Build Image Slider
 * @param  {Array} _images  [description]
 * @param  {Array} _caption [description]
 * @return {String}          Div-element, containg images and their captions.
 */
function buildCarousel(_images, _caption) {

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
 * [calculateCenter description]
 *
 */
function calculateCenter() {
  center = map.getCenter();
}


function displayCoordinates(pnt) {

  var lat = pnt.lat();
  lat = lat.toFixed(4);
  var lng = pnt.lng();
  lng = lng.toFixed(4);
  console.log("Latitude: " + lat + "  Longitude: " + lng);
}


/**
 * Change the language displayed. Used for Welcome Modal.
 * @param  {String}   element  [description]
 * @param  {Array}   textlist [description]
 * @param  {Int}   i        [description]
 * @param  {Function} callback [description]
 *
 */
function cycleText(element, textlist, i, callback) {

  if (!break_cycle) {

    i++;
    setTimeout(function() {
      element.attr('lang_id', i);
      element.animate({ opacity: 0 }, 800, function() {
        element.text(textlist[i]);
        element.animate({ opacity: 1 }, 500, function() {
          requestAnimationFrame(function() { cycleText(element, textlist, i, callback) });
        });

      });


      if (i == textlist.length) i = 0;

    }, 1300);

    if (typeof callback == "function")
      callback(i);

  }

}

/**
 * Adjusts Visial Elements, solves problem with wordpress visialization.
 *
 */
function moveElements() {
  if (userLoggedIn) {
    var loginout = jQuery(document).find('#wp-logout').detach();
    loginout.addClass("btn btn-primary btn-lg");
    jQuery('#log_in_div').append(loginout);

    jQuery('.lwa').remove();
  } else {
    /*
    var loginout_notlogged = jQuery(document).find('.lwa-links-modal').detach();
    loginout_notlogged.addClass("btn btn-primary btn-lg");
    jQuery('#log_in_div').append(loginout_notlogged);
    */
  }
}

/**
 * [initConceptModal description]
 */
function initConceptModal() {

  jQuery('body').addClass('modal_init');

  jQuery('#concepts_modal').removeClass('fade');
  jQuery('#concepts_modal').modal({});

  va_phase = 1;
  //datatable_concepts = createListModal(jQuery('#concepts_modal'),filtered_data_phase1,"concept"); //  concept_data
  datatable_concepts = createConceptsListModal(jQuery('#concepts_modal'), concept_data, "concept");
  //bugfix for scrollerplugin (resize not working properly)
  var modal = jQuery(this);
  var oldheight = modal.find('.dataTables_scroll').height();

  modal.find('input').on('input', function() {
    var height = modal.find('.dataTables_scroll').height()
    if (oldheight != height) {
      datatable_concepts.scroller.measure();
      oldheight = height;
    }
  })

  jQuery('#concepts_modal').modal('hide');
  jQuery('body').removeClass('modal_init');
  jQuery('#concepts_modal').addClass('fade');
}

/**
 * [initLocationsModal description]
 */
function initLocationsModal() {

  jQuery('body').addClass('modal_init');

  jQuery('#locations_modal').removeClass('fade');
  jQuery('#locations_modal').modal({});

  datatable_locations = createLocationListModal(jQuery('#locations_modal'), location_data, "location");

  jQuery('[data-toggle="tooltip"]').tooltip();
  //bugfix for scrollerplugin (resize not working properly)

  var modal = jQuery(this);
  var oldheight = modal.find('.dataTables_scroll').height();
  modal.find('input').on('input', function() {
    var height = modal.find('.dataTables_scroll').height()
    if (oldheight != height) {
      datatable_locations.scroller.measure();
      oldheight = height;
    }
  })

  jQuery('#locations_modal').modal('hide');
  jQuery('body').removeClass('modal_init');
  jQuery('#locations_modal').addClass('fade');

}


/**
 * [showCustomBackdrop description]
 *
 */
function showCustomBackdrop() {

  var custom_backdrop = jQuery('<div id="custom_backdrop"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw""></i></div>');
  jQuery('body').append(custom_backdrop);
  jQuery('#custom_backdrop').fadeIn();

}

/**
 * [showCustomModalBackdrop description]
 *
 */
function showCustomModalBackdrop() {

  jQuery('#custom_modal_backdrop').remove();
  var custom_backdrop = jQuery('<div id="custom_modal_backdrop"></div>');
  jQuery('body').append(custom_backdrop);
  jQuery('#custom_modal_backdrop').fadeIn('fast');

}


function addToolTips(elements) {

  for (var i = 0; i < elements.length; i++) {

    addToolTip(elements[i].name, elements[i].array);

  }

}

function addToolTip(element, title_array) {

  var class_string = element.replace("#", "");
  class_string = "pop_" + class_string;

  var offsetstring = "0 0";
  if (class_string == "pop_submitanswer") offsetstring = "5 9";

  jQuery(element).popover({
    trigger: "manual",
    placement: "top",
    container: "body",
    content: '<div class="' + class_string + ' custom_popover_content">' + title_array[current_language] + '</div>',
    html: true,
    animation: true,
    offset: offsetstring


  });

}

function addLoginToolTip() {

  jQuery('#icon_login').popover({
    trigger: "manual",
    placement: "left",
    container: "body",
    content: '<div class="login_popover custom_popover_content">' + register_texts[current_language] + '</div>',
    html: true,
    animation: true,
    offset: "0 0"
  });

  jQuery('#icon_login').popover('hide');

}


function showLoginPopUp() {


  jQuery('#icon_login').popover('show');
  jQuery('.login_popover').parent().on('click', function() {
    setRandomTitelImage(function() {
      display_all_register_login_elements();
      jQuery('#register_modal').modal();
    }, '#register_modal');
  }).addClass('c_hover');


}

function display_all_register_login_elements() {
  jQuery('#login_slide').addClass('active');
  jQuery('#register_slide').removeClass('active');
  jQuery('.custom-modal-footer').show();

  jQuery('.login_slider').show();
  jQuery('.forgot_pass_slider').show();
  jQuery('.reset_slider').show();
  jQuery('.new_acc_slider').show();
}


function showPopUp() {

  if (tutorial_running && location_selected && !concept_selected) {
    jQuery('#location_span').popover('hide');
    jQuery('#word_span').popover('show');
    stage = 2;

    jQuery('.pop_word_span').parent().on('click', function() {
      handleWordSpanClick();
    }).addClass('c_hover');

  } else if (tutorial_running && !location_selected && !concept_selected) {
    stage = 1;
    jQuery('#location_span').popover('show');

    jQuery('.pop_location_span').parent().on('click', function() {
      handleLocationSpanClick();
    }).addClass('c_hover');

  } else if (tutorial_running && !location_selected && concept_selected) {
    jQuery('#word_span').popover('hide');
    jQuery('#location_span').popover('show');
    stage = 1;

    jQuery('.pop_location_span').parent().on('click', function() {
      handleLocationSpanClick();
    }).addClass('c_hover');
  }

  // else if (tutorial_running && location_selected && concept_selected) {

  //       jQuery('#location_span').popover('hide');
  //       options = {
  //         trigger: "manual",
  //         placement: "top",
  //         container: "body",
  //         html: true,
  //         content: '<div class="pop_word_span custom_popover_content">' + upload_image_text[current_language] + '</div>'
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
  else if (tutorial_running && location_selected & concept_selected && !word_entered) {
    jQuery('#word_span').popover('hide');
    jQuery('#location_span').popover('hide');
    jQuery('#user_input').popover('show');
    jQuery('#user_input').val("");
    stage = 3;
    jQuery('.pop_user_input').parent().parent().css('top', "5px");

    jQuery('.pop_user_input').parent().on('click', function() {
      jQuery('#user_input').focus();
      if (process_restarted) {
        closeAllInfoWindows();
        process_restarted = false;
      }
    }).addClass('c_hover');

  }

  if (word_entered && stage < 4 && location_selected && concept_selected) {

    if (stage != 4) {
      jQuery('#user_input').popover('hide');
      jQuery('#submitanswer').popover('show');
      jQuery('.pop_submitanswer').parent().on('click', function() {

        if (!submit_button_clicked) {
          saveWord();
          submit_button_clicked = true;
          setTimeout(function() {
            submit_button_clicked = false; /*console.log('submit button: After saveword() ' + submit_button_clicked);*/
          }, 1000);
        }

      }).addClass('c_hover');

    }
    stage = 4;
  }

  if (stage == 6) {

    jQuery('#word_span').popover('hide');
    tutorial_running = false;
  }


}


function displayTooltips(show) {

  if (show) jQuery('.popover').css('opacity', '1');
  else jQuery('.popover').css('opacity', '0');


}



/*jQuery(function () {
   jQuery('#register_modal').modal('toggle');
});*/

/*jQuery('#register_modal').on('shown.bs.modal', function () {
  jQuery('#lwa_user_login').focus()
})

jQuery('#login_slider').bind('slid.bs.carousel', function (e) {
       console.log('after slide');
       jQuery('#login_slider').data('ride', "");
      jQuery('#login_slider').carousel('pause');
});*/

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
      add_anonymous_data_popover();
      break;
    case "anonymous_data_slide":
      jQuery('.active').removeClass('active');
      jQuery('#anonymous_data_slide').addClass('active');
      break;
  }
}

jQuery(".btn").mouseup(function() {
  jQuery(this).blur();
})

/*
jQuery(function () {
  jQuery('[data-toggle="popover"]').popover()
  jQuery('#login_div').popover('show');
})
*/

// jQuery('#icon_login').hover( function(){
//   jQuery(this).removeClass('fa-user-circle-o');
//    jQuery(this).addClass('fa-user-circle');
// },function(){
//    jQuery(this).removeClass('fa-user-circle');
//    jQuery(this).addClass('fa-user-circle-o');
// })

var enableSubmit = function(ele) {
  jQuery(ele).removeAttr("disabled");
  jQuery(ele).attr('enable', true);
  console.log("enable");
}



/*
jQuery('.fa-sign-out').on('mouseover', function(){
   jQuery(this).css('fa-2x');
})*/

/**
 * When user changes his entry the data is then been processed and updated to the server.
 * @param  {Int} id_auesserung [description]
 * @param  {Int} id_concept    [description]
 * @param  {Int} location_id   [description]
 * @param  {String} concept       [description]
 * @param  {Int} row_to_update [description]
 * @return {String}               [description]
 */
function editInputA(id_auesserung, id_concept, location_id, concept, row_to_update) {

  jQuery('.input_modal_content').html(
    returnChangeInput()

  );

  jQuery('#input_modal').modal({
    backdrop: 'static',
    keyboard: false
  });

  jQuery('#input_modal').one('shown.bs.modal', function(e) {
    jQuery(this).find('button').on('click', function() {

      updateInput(concept, id_auesserung, id_concept, location_id, row_to_update);

    });
  })

}


/**
 * @deprecated
 */
function editInput(location, concept, input_word) {

  jQuery('.message_modal_content').text("Sie haben diese Auesserungen schon gespeichert!");
  jQuery('.message_modal_content').html(returnChangeInput(location, concept, input_word));
  jQuery('#message_modal').modal({
    backdrop: 'static',
    keyboard: false
  });


}
/*When location is choosen show polygon will check if this location's polygon exists else it will get it from the database*/
/**
 * After Choosing a locations from the location data tables. Get the location's polygon and display it.
 * @param  {String} g_location    [description]
 * @param  {Int} g_location_id [description]
 * @param  {Int} index         [description]
 *
 */
function showPolygon(g_location, g_location_id, zoom_active) {

  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'getPolygonGemeinde',
      location_id: g_location_id,
      searchedGemeinde: g_location,
    },
    success: function(response) {

      existingLocations.push(JSON.parse(response).location_id);
      addGeometry(JSON.parse(response).polygonCoordinates, JSON.parse(response));


      if (zoom_active) {
        if (map.getZoom() > 6) {
          map.setZoom(6);
        }
      }


      var lat = geo_manager.parseGeoDataFormated(JSON.parse(response).centerCoordinates).geoData.lat;
      var lng = geo_manager.parseGeoDataFormated(JSON.parse(response).centerCoordinates).geoData.lng;

      centerCoordinates_locations.push({
        'id': JSON.parse(response).location_id,
        'lat': lat,
        'lng': lng
      });

      if (zoom_active) {
        map.flyTo([lat, lng], 10, { animate: true, duration: 0.5 });

        // map.panTo({
        //   lat: lat_g,
        //   lng: lng_g
        // });
        // setTimeout(function() {
        //   smoothZoom(map, 11, map.getZoom());
        // }, 200);
      }
      if (stage == 5) {
        stage = 6;

        setTimeout(function() {
          jQuery('#word_span').popover('show');
          displayTooltips(true);
        }, 2000);
      }

    }
  }); //ajax end

}


/*Filter Auesserungen Markers for the choosen Concept*/
/**
 * @deprecated
 */
function filterMarkers(id) {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i].concept_id.localeCompare(id) == 0) {
      console.log('this concept');
      if (markers[i].type.localeCompare('userInput') != 0) {
        markers[i].marker.setIcon(markershape);
      }
      if (markers[i].userMarker) {
        markers[i].marker.setIcon(markershapeChoosen);
      }
    } else {
      if (markers[i].type.localeCompare('userInput') != 0) {
        markers[i].marker.setIcon(markershapeFiltered);
      }

      if (markers[i].userMarker) {
        markers[i].marker.setIcon(markershapeChoosen);
      }

    }
  }
}

/**
 * Replace special characters(from different languages) to siplify the search.
 * Used to simplify searching for concept or location that have spacial characters in different languages.
 * @param  {String} _in [description]
 * @return {String}     [description]
 */
function replaceSpecialChars(_in) {


  var res = _in.replace(/[äÄáÁàÀâÂãÃåÅæÆ]/g, 'a')
    .replace(/[çÇčČ]/g, 'c')
    .replace(/[éÉèÈêÊëË]/g, 'e')
    .replace(/[íÍìÌîÎïÏîĩĨĬĭ]/g, 'i')
    .replace(/[ñÑ]/g, 'n')
    .replace(/[öÖóÓòÒôÔœŒ]/g, 'o')
    .replace(/[ßšŠ]/g, 's')
    .replace(/[úÚùÙûÛ]/g, 'u')
    .replace(/[ýÝŷŶŸÿ]/g, 'n')
    .replace(/[áÁàÀâÂãÃåÅæÆ]/g, 'a')
    .replace(/[çÇ]/g, 'c')
    .replace(/[éÉèÈêÊëË]/g, 'e')
    .replace(/[íÍìÌîÎïÏîĩĨĬĭ]/g, 'i')
    .replace(/[ñÑ]/g, 'n')
    .replace(/[óÓòÒôÔœŒ]/g, 'o')
    .replace(/[ß]/g, 's')
    .replace(/[üÜúÚùÙûÛ]/g, 'u')
    .replace(/[ýÝŷŶŸÿ]/g, 'n')
    .replace(/[Žž]/g, 'z');

  return res;

}

/**
 * Sets a random image as background for the different modals.
 * @param {Function} callback [description]
 * @param {Int}   modal_id [description]
 */
function setRandomTitelImage(callback, modal_id) {

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

function checkDataBeforeListModal(marker) {
  //console.log(marker);
  if (aeusserungen_by_locationindex[marker.location_id] != null && !check_user_aesserungen_in_location(marker.location_name)) {
    openLocationListModal(marker);

  } else {
    // jQuery('#custom_backdrop i').css('top','-150px');
    jQuery('#custom_backdrop').show().css('background', 'rgba(0, 0, 0, 0.8)');


    get_submited_answers_current_location(marker.location_id, marker);
  }
}
/**
 * Open location's data table.
 * @param  {Object} marker Location's marker.
 */
function openLocationListModal(marker) {

  if (jQuery('#custom_modal_backdrop').length < 1) {
    showCustomModalBackdrop();
  }

  current_location_list_object = aeusserungen_by_locationindex[marker.location_id];

  // find the right object from the array
  function rightOne(obj) {
    return obj.id == marker.location_id;
  }

  //the correct translation of the location
  var c_location_name = locations[locations.findIndex(rightOne)].name;
  current_location_list_object[Object.keys(current_location_list_object)[0]].ortsname = c_location_name;
  current_location_list_object[Object.keys(current_location_list_object)[0]].usergen = marker.user_marker;

  filtered_location_submited_data_phase1 = getLocationListTableData(filter_array(current_location_list_object, 1));
  filtered_location_submited_data_phase2 = getLocationListTableData(filter_array(current_location_list_object, 2));
  filtered_location_submited_data_phase3 = getLocationListTableData(filter_array(current_location_list_object, 3));


  // FUTURE CHECK BOX FUNCTIONALITY
  filtered_location_submited_data_phases = [];
  filtered_location_submited_data_phases.push(filtered_location_submited_data_phase1);
  filtered_location_submited_data_phases.push(filtered_location_submited_data_phase2);
  filtered_location_submited_data_phases.push(filtered_location_submited_data_phase3);

  current_location_list_table_data = [].concat.apply([], filtered_location_submited_data_phases);

  jQuery('#location_list_table').DataTable().destroy();
  jQuery('#location_list_modal').find('.location_header_parent').remove();
  jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').remove();
  jQuery('#location_list_modal').find('.few_elements').remove();
  jQuery('#location_list_modal').modal();
}



function filter_array(array_data, va_phase_cur) {

  var arr = [];
  for (var key in array_data) {
    if (array_data.hasOwnProperty(key)) {
      var answer_concept_id = array_data[key].id_concept;

      if (concepts_index_by_id[answer_concept_id].va_phase == va_phase_cur) {
        if (concepts_index_by_id.hasOwnProperty(answer_concept_id)) {
          arr[key] = array_data[key];
        }
      }

    }
  }
  return arr;
}


/**
 * Build locations data for the data table.
 * @param  {Array} in_data [description]
 * @return {Array}         [description]
 */
function getLocationListTableData(in_data) {

  var data = [];
  var i = 0;

  for (var key in in_data) {

    var cur_data = in_data[key];
    var user_data = false;
    var aeusserung_id = cur_data.id_aeusserung;

    if (submitedAnswers_indexed[aeusserung_id] != null) {
      user_data = true;
    }

    var concept_name = cur_data.konzept;
    var author = cur_data.author;
    var word = cur_data.word;
    var concept_idx = get_table_index_by_va_phase(cur_data.id_concept);
    var token = cur_data.tokenisiert;

    if (author.indexOf("anonymous") != -1) {
      author = anonymous_texts[current_language];
    }

    data[i] = [];

    if (concept_idx < important_concepts_count) {
      data[i].push('<div ae_id="' + aeusserung_id + '" con_id="' + cur_data.id_concept + '" user_data="' + user_data +
        '" class="dataparent" title="' + concept_name +
        '" token="' + token + '"><span class="dataspan"><i title="' + important_concepts_texts[current_language] +
        '" class="fa fa-exclamation-triangle" aria-hidden="true"></i>' + concept_name + '</span></div>');
    } else {
      data[i].push('<div ae_id="' + aeusserung_id + '" con_id="' + cur_data.id_concept + '" user_data="' + user_data +
        '" class="dataparent" title="' + concept_name + '" token="' + token +
        '"><span class="dataspan">' + concept_name + '</span></div>');
    }

    data[i].push('<span class="c_answer_span dataspan"  title="' + word + '">\"' + word + '\"</span>');
    data[i].push('<span class="authorspan dataspan"  title="' + author + '">(' + author + ')</span>');

    i++;
  }

  return data;
}


function createLocationListTable(table_data) {


  va_phase = 1;
  var searching = false;
  if (table_data.length > 10) searching = true;

  var emptyTable = no_results_data_table[current_language];

  var table = jQuery('#location_list_modal').find('#location_list_table').DataTable({

    data: table_data,
    deferRender: false,
    scrollY: "75vh",
    scrollX: false,
    scrollCollapse: true,
    info: false,
    ordering: false,
    searching: searching,
    responsive: true,
    columns: [{
        "width": "45%"
      },
      {
        "width": "30%"
      },
      {
        "width": "25%"
      }
    ],
    scroller: {
      displayBuffer: 15,
    },
    language: {
      zeroRecords: emptyTable
    },
    fnInitComplete: function(settings) {

      var name = current_location_list_object[Object.keys(current_location_list_object)[0]].ortsname;
      var num = table_data.length; //Object.keys(current_location_list_object).length;
      var usergen = current_location_list_object[Object.keys(current_location_list_object)[0]].usergen;
      var tokenisiert = current_location_list_object[Object.keys(current_location_list_object)[0]].tokenisiert;

      var head = jQuery('<div class="location_header_parent"><div class="location_header_num">' + num + '</div><span class ="location_header">' + name + '</span></div>');

      var few_elements = jQuery('<div>').text(too_few_elements[current_language]).addClass('few_elements');

      if (usergen) {
        head.find('.location_header_num').addClass('user_generated_m');
      }


      if (searching) {
        jQuery('#location_list_modal').find('#location_list_table_filter').prepend(head);
        head.css('display', 'inline-block');
        jQuery('#location_list_modal').find('#location_list_table_filter').find('input').css('min-width', 'initial');
        jQuery('#location_list_modal').find('#location_list_table_filter').find('label').css('width', 'initial').css('float', 'right').css('margin-top', '-8px');
      } else {
        jQuery('#location_list_modal').find('.custom_header').after(head);
      }

      check_free_space_few_elements(num, few_elements);
      add_few_elements_click_listener(current_location_list_object[Object.keys(current_location_list_object)[0]]);

      var animating = false;

      jQuery('#location_list_modal').find('tbody').off().on('click', 'tr', function() {

        if (!animating) {
          animating = true;

          if (jQuery(this).find('.dataparent').attr('user_data') == "true") {

            /*display element depending if the Aeusserung is tokenisiert*/
            var token = jQuery(this).find('.dataparent').attr('token');
            if (token == "0") {
              var element_to_animate = ".location_list_controls";
            } else {
              var element_to_animate = ".tokenisiert";
            }

            if (jQuery(this).find(element_to_animate).css('right') == "-170px") {
              jQuery(this).find(element_to_animate).show().animate({
                right: ["0", "swing"]
              }, 450, function() {
                jQuery(this).css('right', '0px');
                animating = false;
              });
            } else {
              jQuery(this).find(element_to_animate).animate({
                right: ["-170", "swing"]
              }, 450, function() {
                jQuery(this).hide().css('right', '-170px');
                animating = false;
              });
            }

            var clicked_index = table.row(this).index();


            table.rows().eq(0).each(function(index) {
              var row = table.row(index);
              var jrow = jQuery(row.node());
              if (clicked_index != index && (jrow.find(element_to_animate).css('right') == "0px")) {

                jrow.find(element_to_animate).animate({
                  right: ["-170", "swing"]
                }, 450, function() {
                  jrow.find(element_to_animate).hide().css('right', '-170px');
                });
              }
            });
          } else {
            var id = parseInt(jQuery(this).find('.dataparent').attr('con_id'));
            var name = jQuery(this).find('.dataparent').attr('title');
            setQ(name, id);
            jQuery('#location_list_modal').modal('hide');
          }
        }
      })

      /*add Buttons Alm/Nature Submited Answers*/
      /*location_aeusserungen*/
      var buttonparent = jQuery('.location_header_parent');
      var alm = jQuery('<div class="list_modal_button_va_phase va_phase_1 active noselect"  data-va_phase = "1"><i class="far fa-check-square"></i>' + alpine_agriculture[current_language] + '</div>'); //width:50%; 'Almwirtschaft'
      var natur = jQuery('<div class="list_modal_button_va_phase va_phase_2 active noselect"   data-va_phase = "2"><i class="far fa-check-square"></i>' + alpine_nature[current_language] + '</div>'); //width:50%; 'Natur'
      var modern = jQuery('<div class="list_modal_button_va_phase va_phase_3 active noselect"   data-va_phase = "3"><i class="far fa-check-square"></i>' + alpine_modern[current_language] + '</div>'); //width:50%; 'Modern'

      jQuery("#va_phase_wrapper_location_list").remove();
      var va_phase_wrapper = jQuery('<div id="va_phase_wrapper_location_list" class="va_phase_wrapper"></div>');

      va_phase_wrapper.append(alm);
      va_phase_wrapper.append(natur);
      va_phase_wrapper.append(modern);

      jQuery('#location_list_modal').children().find('.modal-content').append(va_phase_wrapper);

      //jQuery('.va_phase_1').css('opacity', 1.0);

      jQuery("#va_phase_wrapper_location_list").find('.list_modal_button_va_phase').on('click', function() {

        var selected_va_phase = jQuery(this).data('va_phase');

        //CHECKBOX-like functionality
        switch (selected_va_phase) {
          case 1:
            if (jQuery("#va_phase_wrapper_location_list").find('.va_phase_1').hasClass('active')) {
              jQuery("#va_phase_wrapper_location_list").find('.va_phase_1').removeClass('active');
              jQuery("#va_phase_wrapper_location_list").find(".va_phase_1").find('i').removeClass('fa-check-square').addClass('fa-square');

            } else {
              jQuery("#va_phase_wrapper_location_list").find('.va_phase_1').addClass('active');
              jQuery("#va_phase_wrapper_location_list").find(".va_phase_1").find('i').removeClass('fa-square').addClass('fa-check-square');

            }

            break;
          case 2:
            if (jQuery("#va_phase_wrapper_location_list").find('.va_phase_2').hasClass('active')) {
              jQuery("#va_phase_wrapper_location_list").find('.va_phase_2').removeClass('active');
              jQuery("#va_phase_wrapper_location_list").find(".va_phase_2").find('i').removeClass('fa-check-square').addClass('fa-square');

            } else {
              jQuery("#va_phase_wrapper_location_list").find('.va_phase_2').addClass('active');
              jQuery("#va_phase_wrapper_location_list").find(".va_phase_2").find('i').removeClass('fa-square').addClass('fa-check-square');

            }
            break;
          case 3:
            if (jQuery("#va_phase_wrapper_location_list").find('.va_phase_3').hasClass('active')) {
              jQuery("#va_phase_wrapper_location_list").find('.va_phase_3').removeClass('active');
              jQuery("#va_phase_wrapper_location_list").find(".va_phase_3").find('i').removeClass('fa-check-square').addClass('fa-square');

            } else {
              jQuery("#va_phase_wrapper_location_list").find('.va_phase_3').addClass('active');
              jQuery("#va_phase_wrapper_location_list").find(".va_phase_3").find('i').removeClass('fa-square').addClass('fa-check-square');

            }
            break;
        }

        table.clear().draw();

        var active_location_data = check_active_concepts(jQuery('#va_phase_wrapper_location_list').find('.active'));
        var list_elements = [];

        if (active_location_data.length > 0) {
          for (var i = 0; i < active_location_data.length; i++) {
            table.rows.add(filtered_location_submited_data_phases[active_location_data[i] - 1]);
            filtered_location_submited_data_phases[active_location_data[i] - 1].map(function(el) {
              list_elements.push(el);
            })
          }
        } else {
          // list_elements = [].concat.apply([], filtered_location_submited_data_phases);
          // table.rows.add(list_elements);
          list_elements = [];
          table.rows.add(list_elements);
        }

        table.columns.adjust().draw(); // Redraw the DataTable

        jQuery('.location_header_num').text(list_elements.length);
        check_free_space_few_elements(list_elements.length, few_elements);
        add_few_elements_click_listener(current_location_list_object[Object.keys(current_location_list_object)[0]]);

      });

    },
    createdRow: function(row, data, index) {

      if (jQuery(row).find('.dataparent').attr('user_data') == "false") {
        jQuery(row).addClass('other_user_row');
      } else {
        jQuery(row).addClass('this_user_row');
        jQuery(row).append(jQuery('<div class="location_list_controls"><div class="change_button_in_list rowbutton"><i class="fa fa-pencil" aria-hidden="true"></i> ' +
          change_input[current_language] + '</div><div class="delete_button_in_list rowbutton"><i class="fa fa-trash-o" aria-hidden="true"></i> ' +
          delete_input[current_language] + '</div></div>'));
        /*tokeniriest*/
        jQuery(row).append(jQuery('<div class="tokenisiert"><i class="fa fa-check-square-o" aria-hidden="true"></i>  ' + permanently_saved[current_language] + '</div>'));

        jQuery(row).find('.change_button_in_list').on('click', function() {
          var aeusserung_id = jQuery(row).find('.dataparent').attr('ae_id');
          var cur_obj = current_location_list_object[aeusserung_id];
          var row_to_update = jQuery(row);

          editInputA(aeusserung_id, cur_obj.id_concept, cur_obj.id_geo, cur_obj.konzept, row_to_update);
        })

        jQuery(row).find('.delete_button_in_list').on('click', function() {
          table.row(jQuery(this).parents('tr')).remove().draw();
          table.scroller.measure();

          var aeusserung_id = jQuery(row).find('.dataparent').attr('ae_id');
          var cur_obj = current_location_list_object[aeusserung_id];

          deleteInput(aeusserung_id, cur_obj.ortsname, cur_obj.id_concept, cur_obj.id_geo);

          var remaining_num = Object.keys(aeusserungen_by_locationindex[cur_obj.id_geo]).length
          jQuery('#location_list_modal').find('.location_header_num').text(remaining_num);

          if (check_for_current_user_entries(cur_obj.id_geo) <= 0) {
            jQuery('#location_list_modal').find('.location_header_num').removeClass('user_generated_m');
          }

          if (remaining_num == 0) {
            jQuery('#location_list_modal').modal('hide')
          }
        })

      }
    }
  })

  return table;

}

function check_free_space_few_elements(num_elements, few_elements) {

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


function add_few_elements_click_listener(location_object) {
  jQuery('#location_list_modal').find('.few_elements').unbind();
  jQuery('#location_list_modal').find('.few_elements').on('click', function() {
    var current_location_id = location_object.id_geo;
    var current_location_name = location_object.ortsname;



    if (map.getZoom() < 9) {
      var zoom_to_location = true;
    } else {
      var zoom_to_location = false;
    }

    showPolygon(current_location_name, current_location_id, zoom_to_location);

    jQuery('#location_span').text(current_location_name);
    jQuery('#location_span').attr("data-id_location", current_location_id);
    location_selected = true;

    jQuery('#location_list_modal').modal('hide');
  })
}

function checkImageModal(id, name) {
  var myimages = [];
  myimages = images[id];

  if (myimages.length > 0) {
    do_image_modal = true;
  }

  if (do_image_modal) {
    var c = buildCarousel(myimages, name);
    jQuery('#image_modal').find('.modal-body').append(c);

    if (jQuery("#suggest_image_upload").length) {

    } else {
      var upload_button = jQuery("<div id='suggest_image_upload'></div>").text(upload_own_image_button_text[current_language]);

      jQuery('#image_modal').find('.customfooter').append(upload_button);
      jQuery('#image_modal').find('.customfooter').css("height", "30px");

      upload_button.on("click", function() {
        open_upload_image_modal()
      })
    }


  } else {
    open_upload_image_modal()
  }

}


function create_cookie(lang) {
  createCookie("language_crowder", lang);
}

/**
 * @deprecated
 */
function refresh_page() { /*Choose another language*/
  eraseCookie("language_crowder");
  console.log(document.cookie);
  location.reload();
}

/**
 * [reMeasureDatatables description]
 *
 */
function reMeasureDatatables() {

  if (current_location_list_table != null) {
    current_location_list_table.scroller.measure();
  }

  if (datatable_locations != null) {
    datatable_locations.scroller.measure();
  }

  if (datatable_concepts != null) {
    datatable_concepts.scroller.measure();
  }

  if (current_top_list_table != null) {
    current_top_list_table.scroller.measure();
  }
}

/**
 * Sets a timer, after which a login/register pop up will show up.
 *
 */
function startLoginTimer() {

  if (!jQuery('.login_popover').parent().parent().hasClass('in') && !jQuery('#register_modal').hasClass('in')) {

    setTimeout(function() {
      if (!jQuery('.modal').hasClass('in')) { showLoginPopUp(); } else {
        jQuery('.modal').one('hidden.bs.modal', function() {
          showLoginPopUp();
        })
      }

    }, 3000);
  }

  // setTimeout(function() {
  //  if(!jQuery('#register_modal').hasClass('in')){
  //    hideAllOpenModals();
  //    setTimeout(function() {
  //     openWhyRegisterModal();
  //    }, 1000);
  //  }
  // }, 2000);

}

/**
 * @deprecated
 */
function checkLoginPopUp() {

  if (session_answer_count == 3) {
    if (!jQuery('.login_popover').parent().parent().hasClass('in')) showLoginPopUp();
  }

}

/**
 * [hideAllOpenModals description]
 */
function hideAllOpenModals() {
  jQuery('.modal').each(function() {

    if (jQuery(this).hasClass('in')) jQuery(this).modal('hide');
  })
}


function createUnansweredIndex() {


  var c_phase1_idx = [];
  var c_phase2_idx = [];
  var c_phase3_idx = [];

  var answers_by_concept_index = {};

  for (var key in submitedAnswers_indexed) {
    var sub = submitedAnswers_indexed[key];
    answers_by_concept_index[sub.concept_id] = sub;
  };


  for (var key in concepts_cur_lang) {
    var concept = concepts_cur_lang[key];
    if (concept.va_phase == 1 && answers_by_concept_index[concept['id']] == null) c_phase1_idx.push(concepts_index_by_id[concept['id']]);
    else if (concept.va_phase == 2 && answers_by_concept_index[concept['id']] == null) c_phase2_idx.push(concepts_index_by_id[concept['id']]);
    else if (concept.va_phase == 3 && answers_by_concept_index[concept['id']] == null) c_phase3_idx.push(concepts_index_by_id[concept['id']]);
  }

  return [c_phase1_idx, c_phase2_idx, c_phase3_idx];

}


function getRandomUnAnsweredConceptIndex() {


  var active_concepts = [];

  for (var i = 0; i < active_va_phases.length; i++) {
    var active_phase = active_va_phases[i];
    active_concepts = active_concepts.concat(unanswered_concepts[active_phase - 1]);
  }

  var length = active_concepts.length;
  var result;

  if (length > 0) {

    var idx = Math.floor((Math.random() * length));

    var random_concept = active_concepts[idx];
    var result = random_concept['index'];


  } else result = -1;
  return result;

}


function openHighScoreModal(array) {

  if (current_top_list_table != null) current_top_list_table.destroy();

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

  current_highscoredata = table_data;
  jQuery('#highscore_select_modal').modal('hide');
  jQuery('#toplistmodal').modal();


  jQuery('#toplistmodal .obj_data').on('click', function() {
    jQuery('#toplistmodal').modal('hide');
    var g_location_id = jQuery(this).attr('id');
    var g_location = jQuery(this).text();
    showPolygon(g_location, g_location_id, true);
    //console.log("CLICKED!!!");
  })

  jQuery('#toplistmodal .concept_data').on('click', function() {

    var id = parseInt(jQuery(this).attr('id'));
    var name = jQuery(this).text();
    setQ(name, id);
    jQuery('#toplistmodal').modal('hide');
    setDynamicContent();
  })

}

function buildHighScoreSelect() {

  setRandomTitelImage(function() {
    showCustomModalBackdrop();


    getHighScoresFromDB(function() {


      jQuery('#best_user').one('click', function() {
        openHighScoreModal(top_users);
        jQuery('.highscoreheadlinespan').text(active_user_texts[current_language]);
        prevent_backdrop = true;
      }).text(active_user_texts[current_language])
      jQuery('#best_location').one('click', function() {
        jQuery('.highscoreheadlinespan').text(active_location_texts[current_language]);
        openHighScoreModal(top_locations);
        prevent_backdrop = true;
      }).text(active_location_texts[current_language])
      jQuery('#best_concept').one('click', function() {
        openHighScoreModal(top_concepts);
        jQuery('.highscoreheadlinespan').text(active_concept_texts[current_language]);
        prevent_backdrop = true;
      }).text(active_concept_texts[current_language])

      var icon = jQuery('<i class="fa fa-pagelines leaf_icon_l" aria-hidden="true"></i>');
      var icon_r = jQuery('<i class="fa fa-pagelines leaf_icon_r" aria-hidden="true"></i>');
      jQuery('.select_score_list').prepend(icon);
      jQuery('.select_score_list').append(icon_r);

      jQuery('#highscore_select_modal').modal({});
    }) //DB CALLBACK

  }, "#highscore_select_modal"); //IMAGE CALLBACK
}

function openShareModal() {
  setRandomTitelImage(function() {
    showCustomModalBackdrop();
    var cur_location_href = document.location.href;
    jQuery('#share_modal').modal({});

    jQuery('#share_link').text(cur_location_href);

    jQuery('#share_facebook').attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + cur_location_href);
    jQuery('#share_twitter').attr("href", "https://twitter.com/home?status=" + cur_location_href);
    jQuery('#share_googleplus').attr("href", "https://plus.google.com/share?url=" + cur_location_href);
    jQuery('#share_mail').attr("href", "mailto:" + 'verbaalpina@itg.uni-muenchen.de');

  }, "#share_modal");
}

function createTopListTable() {


  var table = jQuery('#toplistmodal').find('#top_list_table').DataTable({

    data: current_highscoredata,
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

function getHighScoresFromDB(callback) {

  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'getHighScores',
      lang: current_language,
      num: 10
    },
    success: function(response) {

      var result = JSON.parse(response);
      top_concepts = result["top_concepts"];
      top_users = result["top_users"];
      top_locations = result["top_locations"];

      if (typeof callback == "function")
        callback();

    }

  });
}

function openWhyRegisterModal() {

  setRandomTitelImage(function() {

    jQuery('.why_register_headline').html(register_head_texts[current_language]);
    jQuery('.why_register_body').html(register_body_texts[current_language]);
    jQuery('.reg_yes').text(register_yes_texts[current_language]);
    jQuery('.reg_no').text(register_no_texts[current_language]);

    jQuery('.reg_yes').off().on('click', function() {
      prevent_backdrop = true;
      jQuery('#why_register_modal').modal('hide');
      setRandomTitelImage(function() {
        jQuery('#register_modal').modal();
      }, '#register_modal');
    })

    jQuery('.reg_no').off().on('click', function() {
      prevent_backdrop = false;
      jQuery('#why_register_modal').modal('hide');
    })


    jQuery('#why_register_modal').modal();

  }, "#why_register_modal"); //IMAGE CALLBACK

}

function openRegisterOrAnonymousModal() {
  setRandomTitelImage(function() {
    jQuery('#register_modal').modal();

    jQuery('#login_slide').removeClass('active');
    jQuery('#register_slide').addClass('active');

    jQuery('.custom-modal-footer').show();

    jQuery('.login_slider').hide();
    jQuery('.forgot_pass_slider').hide();
    jQuery('.reset_slider').hide();
    jQuery('.new_acc_slider').hide();

    add_anonymous_data_popover();
  }, '#register_modal');
}

function send_anonymous_data() {
  var anonymous_age = jQuery('#user_age').val();
  // anonymous_age = (new Date()).getFullYear() - anonymous_age;
  console.log(anonymous_age);
  if (current_user != "" && current_user != null) {
    if (!isNaN(anonymous_age)) {
      userRegisterDone(current_user, anonymous_age, true);
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


function add_translation_register_modal() {
  var white_space = " ";

  jQuery('.label_username').text(user_name[current_language]);
  jQuery('.label_password').text(password_text[current_language]);

  jQuery('#lwa_user_remember').val(enter_username_or_email[current_language]);

  jQuery('.slides_reg_register').text(new_acc_text_detail[current_language]);
  jQuery('.slides_reg_login').text(new_acc_text_detail[current_language]);
  jQuery('.slides_reg_forgot').text(forgot_password_text[current_language]);


  jQuery('#user_login').val(user_name[current_language]);
  jQuery('#user_email').val('E-Mail');
  jQuery('#user_age').val(birth_year[current_language]);
  jQuery('#lwa_user_remember').val(enter_username_or_email[current_language]);

  try {

    jQuery('#login_btn').contents().last()[0].textContent = white_space + login_btn[current_language];
    jQuery('.login_slider').contents().last()[0].textContent = white_space + login_btn[current_language];
    jQuery('.register_btn').contents().last()[0].textContent = white_space + register[current_language];
    jQuery('.send_anonymous_btn').contents().last()[0].textContent = white_space + send_anonymous_data_text[current_language];
    jQuery('.forgot_pass_slider').contents().last()[0].textContent = white_space + forgot_password_text[current_language];
    jQuery('.get_new_password').contents().last()[0].textContent = white_space + get_new_password[current_language];
    jQuery('.new_acc_slider').contents().last()[0].textContent = white_space + new_acc_text[current_language];
    jQuery('.reset_slider').contents().last()[0].textContent = white_space + reset_btn_text[current_language];

  } catch (e) {
    console.log(e)
  }
  jQuery('#user_login').on('focus', function() { if (jQuery(this).val() == user_name[current_language]) { jQuery(this).val(''); } })
  jQuery('#user_login').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val(user_name[current_language]); } })

  jQuery('#user_email').on('focus', function() { if (jQuery(this).val() == 'E-Mail') { jQuery(this).val(''); } })
  jQuery('#user_email').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val('E-Mail'); } })

  jQuery('#user_age').on('focus', function() { if (jQuery(this).val() == birth_year[current_language]) { jQuery(this).val(''); } })
  jQuery('#user_age').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val(birth_year[current_language]); } })

  jQuery('#lwa_user_remember').on('focus', function() { if (jQuery(this).val() == enter_username_or_email[current_language]) { jQuery(this).val(''); } })
  jQuery('#lwa_user_remember').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val(enter_username_or_email[current_language]); } })

  var additional_info = jQuery('.slides_reg_register').after('<div id="additional_info">');
  jQuery('#additional_info').text(details_why_register_send_anonymous_data[current_language]);
}

function add_anonymous_data_popover() {
  jQuery('.send_anonymous_btn').popover('dispose');

  jQuery('#no_anoymous_user_data_text').text("Please enter Data on the map first.");

  jQuery('.send_anonymous_btn').popover({
    trigger: "hover",
    placement: "top",
    container: "#register_slide",
    html: true,
    content: '<div class="custom_popover_content">' + send_anonymous_data_modal_text[current_language] + '</div>',
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

function register_login_modal_events() {
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

function sendSuggestEmail(entry, callback) {

  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'sendSuggestEmail',
      entry: entry,
      user: current_user,
      email: user_email,
    },
    success: function(response) {

      callback();
    }

  });

}


function display_dialect() {
  jQuery("#user_dialect").text(selected_dialect);

  var parent_div = jQuery(".arrow");
  parent_div.before(jQuery("user_dialect_container"));
  //jQuery("#user_dialect_container").css("padding-bottom", "10px");

  jQuery("#user_dialect_container").on('click', function() {



    if (dialect_modal_initialized) {
      if (!jQuery("#welcome_modal").hasClass("in")) {
        showCustomModalBackdrop();
      }

      openDialectModal();
    } else {
      get_dialects(function() { openDialectModal(); });

    }
  })


}

function get_dialect_index(dialect, datatable) {
  var index_dalect;
  var arr = Array.from(datatable.rows().data());
  var index = arr.findIndex(function(element) {
    var dialect_name = element.name;
    if (dialect_name.localeCompare(dialect) == 0) return index_dalect = arr.indexOf(element);
  });
  return index_dalect;
}

function populate_concept_span() {
  var url = new URL(window.location.href);
  url_concept_id = url.searchParams.get("concept");
  if (url_concept_id) {
    var already_submited = false;
    //console.log(submitedAnswers_indexed);
    for (var key in submitedAnswers_indexed) {
      var obj = submitedAnswers_indexed[key];

      //console.log(obj['concept_id']);
      //console.log(url_concept_id);

      if (obj['concept_id'] == url_concept_id) {
        already_submited = true;
        concept_selected = false;
        url_concept_id = null;
        break;
      }
    }

    if (!already_submited) {
      //console.log("populate span");
      url_choosen_concept = concepts_index_by_id[va_phase][url_concept_id];
      jQuery('#word_span').text(url_choosen_concept.name);
      jQuery('#word_span').attr("data-id_concept", url_concept_id);
      jQuery('#word_span').attr("data-id_concept_index", url_choosen_concept.index);
      setDynamicContent('list');
    } else {
      //console.log("don't populate span");
    }

  }

}

function init_left_menu() {
  console.log("Init Swing Menu");
  jQuery('#custom_backdrop').fadeOut('slow', function() { jQuery(this).remove(); });
  setDynamicContent();
  jQuery('#left_menu').css('opacity', '0');
  jQuery('#left_menu').show();
  offsetHeight = document.getElementById('left_menu').offsetHeight;
  jQuery('#left_menu').css('bottom', -offsetHeight);

  jQuery('#left_menu').css('opacity', '1');
  jQuery('#left_menu').animate({ bottom: '+=' + offsetHeight }, 400, 'swing', function() {

    menu_is_up();


  });
}