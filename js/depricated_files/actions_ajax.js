/**
 * Difines and performes Ajax Calls to the server for - loading data from the database, building global javascript arrays with that data and saving user's input.
 * @module Ajax_Calls
 *
 *
 */

/**
 * Array of all municipalities
 * @var
 * @type {Array}
 *  */
var locations;

/**
 * Array of all concepts in the user's language.
 * @var
 * @type {Array}
 *  */
var concepts;

/**
 * Array of all links to the images.
 * @var
 * @type {Array}
 *  */
var images;

/**
 * Array of all answers submitted by the user.
 * @var
 * @type {Array}
 *  */
var submitedAnswers = [];

/**
 * Indexed Array of all answers submitted by the user.
 * @var
 * @type {Array}
 *  */
var submitedAnswers_indexed = new Object();

/**
 * Array containing all location ids, where the user has entered an answer.
 * @var
 * @type {Array}
 */
var existingLocations = new Array();

/**
 * Improves UI, used for state check, when the user submits an answer.
 * @type {Boolean}
 */
var submit_button_clicked = false;

/**
 * Array of all submitted answers by the user.
 * @type {Array}
 */
var aeusserungen;

/**
 * not used
 * @deprecated
 */
var id_auesserung_current_input;

/**
 * Number of importain concepts - used to mark the concepts in the concepts data table.
 * @type {Integer}
 */
var important_concepts_count;

/**
 * not used
 * @deprecated
 * @type {Array}
 */
var indexed_locations_aeusserungen_array = [];

/**
 * Checks if user has already choosen a language from the modal menue. Defaults to false if user is not logged in.
 * @type {Boolean}
 */
var language_is_set;

/**
 * Variable to check if the user has logged in.
 * @type {Boolean}
 */
var userLoggedIn;

/**
 * Variable to check if the user is anonymous.
 * @type {Boolean}
 */
var anonymousCrowder;

/**
 * Name of the user. May be name of the logged in user or the anonymous_{unique number}.
 * @type {String}
 */
var current_user;

/**
 * Language Number choosen by logged in users.
 * @type {String}
 */
var crowder_lang;

/**
 * Email Adress of the logged in user.
 * @type {String}
 */
var user_email;
/*var is_admin;*/

/**
 * Users' Age
 * @type {String}
 */
var current_user_age;


/**
 * Initializes Ajax calls when document is loaded.
 * @function starts the initial ajax calls when the site has loaded.
 * @async
 */
// jQuery(document).on('ready', function() {

//   jQuery('#custom_backdrop').show();

//   /**
//    * Gets All translation Strings from va_xxx.uebersetzungen
//    * Initialize translation Strings in global variables
//    * @async 
//    * @function get_translations
//    */
//   jQuery.ajax({
//     url: ajax_object.ajax_url,
//     type: 'POST',
//     data: {
//       action: 'get_translations',
//     },
//     success: function(response) {

//       translations = JSON.parse(response)

//       init_translations(translations)

//       /**
//        * Initiating the async calls to server.
//        * @async
//        * @function request_user_data
//        */
//       jQuery.ajax({
//         url: ajax_object.ajax_url,
//         type: 'POST',
//         data: {
//           action: 'request_user_data',
//         },
//         success: function(response) {

//           declare_user_data(JSON.parse(response));

//           /**
//            * Get number of importain concepts. 
//            * Gets information about the importaint concepts
//            * @async
//            * @function getConceptCount
//            */
//           jQuery.ajax({
//             url: ajax_object.ajax_url,
//             type: 'POST',
//             data: {
//               action: 'getConceptCount',
//             },
//             success: function(response) {
//               important_concepts_count = JSON.parse(response);

//               /**
//                * Get and display AlpenKonventione Polygon
//                * Initialize the crowdsourcing tool
//                * @namespace Ajaxs Calls
//                * @async
//                * @function getBordersGeoData
//                */
//               jQuery.ajax({
//                 url: ajax_object.ajax_url,
//                 type: 'POST',
//                 data: {
//                   action: 'getBordersGeoData',
//                   geoData: 'alpenKonvention'
//                 },
//                 success: function(response) {
//                   var response = JSON.parse(response);

//                   coords = response.polygon;
//                   center = response.center;
//                   addGeometryAlps(coords, center);
//                   initTool();

//                 }
//               });

//             }
//           });
//         }
//       });
//     }
//   })


// }); //document ready

/**
 * Gets values from all answer-input fields and performs an ajax call with the user's answer to be saved in the database. 
 * Performs all checks if all fields are filled correctly. And places a marker when the input is saved in the database.
 * @function saveWord
 */
function saveWord() {



  var input_word = jQuery("#user_input").val();
  var location = jQuery('#location_span').html();
  var location_id = jQuery('#location_span').attr('data-id_location');
  var concept = jQuery('#word_span').html();
  var concept_id = jQuery('#word_span').attr('data-id_concept');

  if (!current_user_age) {
    current_user_age = "";
  }

  //error handling, if user changes the va_phase after choosing a concept form a certain va_phase
  if (get_table_index_by_va_phase(concept_id)) {
    var concept_index = get_table_index_by_va_phase(concept_id);
  } else {
    if (va_phase == 1) {
      va_phase = 2;
    } else {
      va_phase = 1;
    }
    var concept_index = get_table_index_by_va_phase(concept_id);
  }




  /*Check if fields for Konzept and Region are filled*/
  if (input_word.localeCompare("") != 0 && location_id != null && concept_selected == true) {

    stage = 5;
    jQuery('#submitanswer').popover('hide');

    var answer = {
      concept: concept,
      user_input: input_word,
      location: location,
      location_id: location_id
    };

    if (!isDuplicate_indexed(answer)) {

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

          if (current_user == null) current_user = JSON.parse(response);

          createCookie("crowder_id", current_user);
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
              current_user: current_user,
              current_language: current_language,
              current_dialect: selected_dialect,
              current_user_age: current_user_age

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
                  if (include(locations, ob) !== true) {
                    locations.push(ob);
                  }

                  session_answer_count++;
                  if (!userLoggedIn) checkLoginPopUp();

                  var answer = {
                    concept: concept,
                    user_input: input_word,
                    location: location,
                    id_auesserung: id_aeusserung,
                    concept_id: concept_id,
                    concept_index: concept_index
                  };

                  submitedAnswers.push(answer);
                  submitedAnswers_indexed[id_aeusserung] = answer;
                  delete unanswered_concepts[concept_index];

                  var entry = {};
                  entry[id_aeusserung] = {
                    author: current_user,
                    id_aeusserung: id_aeusserung.toString(),
                    id_concept: concept_id,
                    id_geo: location_id,
                    konzept: concept,
                    ortsname: location,
                    word: input_word,
                    tokenisiert: "0"
                  };

                  if (aeusserungen_by_locationindex[location_id] == null) {
                    aeusserungen_by_locationindex[location_id] = entry;
                  } else {
                    aeusserungen_by_locationindex[location_id][id_aeusserung] = {
                      author: current_user,
                      id_aeusserung: id_aeusserung.toString(),
                      id_concept: concept_id,
                      id_geo: location_id,
                      konzept: concept,
                      ortsname: location,
                      word: input_word,
                      tokenisiert: "0"
                    };
                  }

                  remove_location_search_listener();
                  add_user_marker(JSON.parse(response), id_aeusserung);
                  change_feature_style(old_feature, check_user_aesserungen_in_location(location));

                  setTimeout(function() {

                    if (location_markers[location_id]) {
                      change_marker(location_markers[location_id], 1, "green");
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

                      display_location_markers(element);
                      pixioverlay.completeDraw();
                    }

                  }, 300);

                  //prompt user to register/send data anonimously
                  if (Object.keys(submitedAnswers_indexed).length == 1) {
                    setTimeout(function() {
                      openRegisterOrAnonymousModal();
                    }, 1000);
                  }

                  jQuery('#word_span').data("id_concept", null);

                  jQuery('.row_1').fadeOut().fadeIn();
                  jQuery('.row_2').fadeOut(function() {
                    jQuery('#submitanswer').popover('hide');

                    jQuery('#user_input').val("");
                    jQuery('#word_span').text(the_word_concept[current_language]);
                    setTimeout(function() {

                      jQuery('#word_span').popover('show');

                      jQuery('.pop_word_span').parent().on('click', function() {
                        handleWordSpanClick();
                      }).addClass('c_hover');
                    }, 1000);
                    process_restarted = true;

                  }).fadeIn();

                  concept_selected = false;
                  word_entered = false;
                  stage = 3;

                  deSelectTableEntry(concept_index);

                  var entry = num_of_answers_by_id[parseInt(concept_id)];
                  if (entry == null) num_of_answers_by_id[parseInt(concept_id)] = 1;
                  else num_of_answers_by_id[parseInt(concept_id)] += 1;

                  checkTableEntry(concept_id);


                  var row = jQuery(datatable_concepts.row(concept_index).node());
                  if (row.find('.num_of_answers').length == 0) {
                    row.find('.dataparent').append(jQuery('<div class="num_of_answers">1</div>'));
                    if (row.find(".wiki_info").length == 1) row.find('.num_of_answers').addClass("answers_with_wiki");
                  } else {
                    row.find('.num_of_answers').text(num_of_answers_by_id[parseInt(concept_id)]);
                    if (row.find(".wiki_info").length == 1) row.find('.num_of_answers').addClass("answers_with_wiki");
                  }

                  current_concept_index = -1;

                  var ua = navigator.userAgent.toLowerCase();
                  var isAndroid = ua.indexOf("android") > -1;
                  if (isAndroid) {
                    map.panTo(location_markers[location_id].getPosition());
                  }

                }
              });

            }
          });

        }
      });
    } else {

      for (var key in submitedAnswers_indexed) {
        if (submitedAnswers_indexed.hasOwnProperty(key)) {
          if (input_word.localeCompare(submitedAnswers_indexed[key].user_input) == 0 && concept.localeCompare(submitedAnswers_indexed[key].concept) == 0) {
            var id_auesserung = submitedAnswers_indexed[key].id_auesserung;
            var concept_id = submitedAnswers_indexed[key].concept_id;
            break;
          }
        }
      }


      editInputA(id_auesserung, concept_id, location_id, concept, false);




    }
  } else {
    jQuery('.message_modal_content').text(user_input_not_full[current_language]);
    jQuery('#message_modal').modal({
      backdrop: 'static',
      keyboard: false
    });
  }



}
/**
 * Used in saveWord(), checks if an location object allready exists in the locations array
 * @param  {Array} arr Array of Objects
 * @param  {Object} obj Single Object
 * @return {Boolean}     True if object is in the array
 */
function include(arr, obj) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id == obj.id) return true;
  }
}

/**
 * Loops through all submitted answers and performs fill_answers() on each of them.
 * @param  {Array} array_submitted_answers An array containg submited answers by the user.
 *
 */
function fill_submitted_answers(array_submitted_answers) {
  for (var i = 0; i < array_submitted_answers.length; i++) {
    var obj = array_submitted_answers[i];
    fill_answers(obj);
  }
}

/**
 * Adds an object, containing - Concept(and id), submited answer(and id), location and author of the submitted answer, to submitedAnswers(global array).
 * @param  {Object} obj Contains a single concept-submitted entry, that the user has previously created.
 *
 */
function fill_answers(obj) {
  var concept_id = obj.id_concept;
  var concept = obj.konzept;
  var word_inputed = obj.word;
  var location_name = obj.ortsname;
  var id_auesserung = obj.id_aeusserung;
  var author = obj.author;
  if (author.localeCompare(current_user) == 0 && author.localeCompare("anonymousCrowder_90322") != 0) {

    var concept_idx = get_table_index_by_va_phase(concept_id); //concepts_index_by_id[va_phase][parseInt(concept_id)].index;

    var answer = { concept: concept, user_input: word_inputed, location: location_name, id_auesserung: id_auesserung, concept_id: concept_id, concept_index: concept_idx };
    submitedAnswers.push(answer);
  }
}

/**
 * Creates a indexed array.
 * @param arrayA  {Array}    Input Array
 * @param  can_edit {Boolean}  Checks if the user can edit this entry.
 * @return      {Array}          indexed Array
 */
function create_submited_answers_index_array(arrayA, can_edit) {

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

    if ((author.localeCompare(current_user) == 0 && author.localeCompare("anonymousCrowder_90322") != 0) || is_admin) {

      var concept_idx = get_table_index_by_va_phase(concept_id); //concepts_index_by_id[va_phase][parseInt(concept_id)].index;

      var answer = { concept: concept, user_input: word_inputed, location: location_name, id_auesserung: id_auesserung, concept_id: concept_id, concept_index: concept_idx };
      result[parseInt(id_auesserung)] = answer;
    }

  }

  return result;
}

/**
 * Display markers for each location and the corresponding number of answers in each one.
 * @param  {Array} arrayA   Indexed array(index: location id) of each location(name, center point).
 * @param  {Boolean} can_edit Checks if the user can edit the answers(Only for admins).
 *
 */
function get_aeussetungen_locations_curLang(arrayA, can_edit, callback) {
  for (var key in arrayA) {
    if (arrayA.hasOwnProperty(key)) {
      if (arrayA[key].count != null) display_location_markers(arrayA[key], can_edit);
    }
  }

  pixioverlay.completeDraw(); //inital DRAW


  setTimeout(function() {

    jQuery('#custom_backdrop').fadeOut('slow', function() {
      jQuery(this).remove();
    });
    console.log("ALL POLYGONS LOADED");
    callback();

    //jQuery('#custom_backdrop').fadeOut(200,function(){jQuery(this).remove(); console.log("hide custom_backdrop");});
    //jQuery('#custom_backdrop').remove();
    //console.log(jQuery('#custom_backdrop'));
  }, 300);
}


/**
 * Build an indexed array(index location id), containing all answers(type: aeusserung, id_aeusserung, author, ortsname(location), word) submitted by the users.
 * @param  {Array} aeusserungen Array with all answers by users.
 * @return {Array}              Indexed array(location id: [answers])
 */
function build_indexed_aeusserungen_array(aeusserungen) {
  var result = {};

  for (var i = 0; i < aeusserungen.length; i++) {

    var entry = {};
    entry[aeusserungen[i].id_aeusserung] = aeusserungen[i];

    if (result[parseInt(aeusserungen[i].id_geo)] == null) {

      result[parseInt(aeusserungen[i].id_geo)] = entry;
    } else {
      result[parseInt(aeusserungen[i].id_geo)][aeusserungen[i].id_aeusserung] = aeusserungen[i];
    }
  }

  return result;

}

/**
 * created html element, which will be used in editInput()
 * @see editInput() in content_interaction.js
 * @return {String} HTML
 */
function returnChangeInput() {
  var output = [
    "<div id='inputWrapper'>",
    /*"Sie haben gesagt:  In " + ort + " sagt man zu " + concept + " " +  auesserung ,*/
    /* "" + translateInfoWindowText(ort, concept,auesserung, current_user) + "", */
    "" + "<div style='display:inline-block;margin-right:10px;margin-bottom:5px;'>" + change_question[current_language] + "</div>",
    "<div style='display:inline-block;width:100%'><input style='width:100%; margin-right:10px;display:inline-block;' id='userAuesserungInput' type='text'/></div>",
    "<div style='display:block;margin-top:10px;'><button style='display:inline-block;margin-right:10px;padding:5px;' class='btn btn-primary' id='updateAuesserung' type='button'>" + change_input[current_language] + "</button>",
    "</div>", /*"<button style='display:inline-block;padding:5px;' class='btn btn-primary ' data-concept_id=\"" + id_concept + "\" data-todelete=\"" + id_auesserung + "\"  data-ort= \"" + ort + "\" type='button' id='deleteAuesserung' type='button' onclick='deleteInput()'>" + delete_input[current_language] + "</button>*/

    "</div>"
  ].join("");


  // onclick='updateInput()'

  return output;
}


/**
 * Updated user's answer(Used by editInputA()).
 * @see editInputA() in generateMap.js
 * @param  {String} concept       Concept name
 * @param  {Integer} id_auesserung Id of the submited answer
 * @param  {Integer} concept_id    Concept Id
 * @param  {Integer} id_location   Location Id
 * @param  {Integer} row_to_update The row number from the data table that will be updated
 *
 */
function updateInput(concept, id_auesserung, concept_id, id_location, row_to_update) {

  var new_auesserung = jQuery('#userAuesserungInput').val();

  var stop = false;

  for (var key in submitedAnswers_indexed) {
    var oldanswer = submitedAnswers_indexed[key].user_input;
    if (oldanswer == new_auesserung) stop = true;

  }


  if (new_auesserung.localeCompare("") != 0 && !stop) {

    if (row_to_update) {
      row_to_update.find('td:nth-child(2)').first().text("\"" + new_auesserung + "\"");
    }

    updateAnswers_indexed(id_auesserung, new_auesserung, id_location);

    jQuery.ajax({
      url: ajax_object.ajax_url,
      type: 'POST',
      data: {
        action: 'updateAuesserung',
        id_auesserung: id_auesserung,
        new_auesserung: new_auesserung
      },
      success: function(response) {

        if (info_window_answer_change) {
          jQuery("#i_span_1").text('"' + new_auesserung + '"');
        }
        info_window_answer_change = false;
      }
    });

    jQuery('#input_modal').modal('hide');

  } else {
    markInputRed(jQuery('#userAuesserungInput'));
  }
}

/**
 * Sends an Ajax call to delete answer from the server.
 * @param  {Integer} id_auesserung Submited answer Id
 * @param  {String} ort           Location name
 * @param  {Integer} concept_id    Concept Id
 * @param  {Integer} location_id   Location Id
 *
 */
function deleteInput(id_auesserung, ort, concept_id, location_id) {

  deleteFromAnswers_indexed(id_auesserung, location_id);
  change_marker(location_markers[location_id], -1, "green");

  num_of_answers_by_id[concept_id]--;
  if (num_of_answers_by_id[concept_id] == 0) {
    deleteFromConceptTable(concept_id);
  } else {
    checkTableEntry(concept_id);
  }

  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'deleteAuesserung',
      id_auesserung: id_auesserung,
      ort: ort,
      gemeinde_id: location_id,
      current_user: current_user
    },
    success: function(response) {
      /*If informant was deleted from db and has no other submited answers, delete cookie and current_user*/
      var user_deleted = JSON.parse(response);
      if (user_deleted && isEmpty(submitedAnswers_indexed) && !userLoggedIn) {
        eraseCookie("crowder_id");
        current_user = null;
      }
    }
  });

  if (old_feature != null && ort.localeCompare(old_feature['location']) == 0) {
    change_feature_style(old_feature, check_user_aesserungen_in_location(ort));
  }
}




/**
 * Delete user's answer from submitedAnswers_indexed and aeusserungen_by_locationindex.
 * @param  {Int} id_auesserung Submited answer Id
 * @param  {Int} id_location   Location Id
 *
 */
function deleteFromAnswers_indexed(id_auesserung, id_location) {

  delete submitedAnswers_indexed[id_auesserung];

  delete aeusserungen_by_locationindex[id_location][id_auesserung];
}



/**
 * Update user's answer in submitedAnswers_indexed and aeusserungen_by_locationindex.
 * @param  {Int} id_auesserung Submited answer Id
 * @param  {String} input         User's Input
 * @param  {Int} id_location   Location Id
 *
 */
function updateAnswers_indexed(id_auesserung, input, id_location) {
  submitedAnswers_indexed[id_auesserung].user_input = input;
  aeusserungen_by_locationindex[id_location][id_auesserung].word = input;
}


// function updateSuccess(id_auesserung,new_auesserung,concept,marker){

//    for(var i = 0; i < markers.length; i++){
//      if(marker === markers[i].marker){


//        var auesserung_id = marker.id_auesserung;
//        var ort = marker.location;
//        var concept = marker.concept;
//        var point = marker.getPosition();
//        var concept_id =  marker.concept_id;

//      }
//    }

//    jQuery('#input_modal').modal('hide');

// }


/**
 * [deleteFromConceptTable description]
 * @param  {Int} _concept_id [description]
 *
 */
function deleteFromConceptTable(_concept_id) {

  var table_index_t = get_table_index_by_va_phase(_concept_id); //concepts_index_by_id[va_phase][parseInt(_concept_id)].index;
  //var name  = concepts_index_by_id[va_phase][parseInt(_concept_id)].name;
  var row = datatable_concepts.row(table_index_t).node();

  jQuery(row).removeClass('green_row');
  jQuery(row).find('.num_of_answers').remove();
  jQuery(row).find('.dataspan').find('.fa-check').remove();

  if (table_index_t < important_concepts_count) {

    var icon = jQuery('<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>');
    jQuery(row).find('.dataspan').prepend(icon);
  }
  unanswered_concepts[table_index_t] = concepts_cur_lang[table_index_t]; //add concept back to unanswered list;

}


/**
 * Adjust the Concept Datatables depending on Submited Answers to concepts 
 * @param  {Int} _concept_id Concept ID
 *
 */
function checkTableEntry(_concept_id) {

  var table_index_t = get_table_index_by_va_phase(_concept_id);



  var row = datatable_concepts.row(table_index_t).node();
  jQuery(row).addClass('green_row');

  var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');

  if (jQuery(row).find('.fa-check').length == 0) {
    jQuery(row).find('.dataspan').prepend(icon);
  }


  jQuery(row).find('.fa-exclamation-triangle').remove();

  if (jQuery(row).find('.num_of_answers').length == 0) {
    jQuery(row).find('.dataparent').append(jQuery('<div class="num_of_answers">1</div>'));
    if (jQuery(row).find(".wiki_info").length == 1) jQuery(row).find('.num_of_answers').addClass("answers_with_wiki");
  } else {
    jQuery(row).find('.num_of_answers').text(num_of_answers_by_id[parseInt(_concept_id)]);
    if (jQuery(row).find(".wiki_info").length == 1) jQuery(row).find('.num_of_answers').addClass("answers_with_wiki");
  }

}

/**
 * Marks a row in the concept datatable according to a table index
 * @param  {Int} table_index index of the selected entry in the data table
 *
 */
function selectTableEntry(table_index) {

  var row = datatable_concepts.row(table_index).node();

  jQuery(row).addClass('concept-list-select-tr');
  jQuery(row).find('.dataparent').addClass('list_selected_concept');

  if (table_index >= important_concepts_count) {
    var icon = jQuery('<i class="fa fa-arrow-right list-select-arrow" aria-hidden="true"></i>');
    if (jQuery(row).find('.fa-arrow-right').length == 0) {
      jQuery(row).find('.dataspan').prepend(icon);
    }
  }

}

/**
 * Ummarks a row in the concept datatable according to a table index
 * @param  {Int} table_index index of the selected entry in the data table to be unmarked
 *
 */
function deSelectTableEntry(table_index) {

  var row = datatable_concepts.row(table_index).node();

  jQuery(row).removeClass('concept-list-select-tr');
  jQuery(row).find('.list_selected_concept').removeClass('list_selected_concept');

  if (table_index >= important_concepts_count) {
    jQuery(row).find('.list-select-arrow').remove();
  }

}





function checkEnteredConcepts() {
  for (var i = 0; i < submitedAnswers.length; i++) {
    checkTableEntry(submitedAnswers[i].concept_id);
  }

}

/**
 * [checkEnteredConcepts_indexed description]
 *
 */
function checkEnteredConcepts_indexed() {
  for (var key in submitedAnswers_indexed) {
    if (submitedAnswers_indexed.hasOwnProperty(key)) {
      checkTableEntry(submitedAnswers_indexed[key].concept_id);
    }
  }
}


/**
 * Marks the input field red if user tries to submit the same answer or an empty field, when changing his answer.
 * @param  {String} input [description]
 *
 */
function markInputRed(input) {
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

function showElement(n) {
  var images = document.getElementsByClassName('images');
  images[n].style.display = 'block';
}

/**
 * @depricated
 */
function isDuplicate(answer) {
  //var answer = {concept: concept, user_input : input_word , location: location};
  var exists = false;

  for (var i = 0; i < submitedAnswers.length; i++) {
    var cnt = submitedAnswers[i].concept;
    var input = submitedAnswers[i].user_input;
    var lct = submitedAnswers[i].location;

    if (input.localeCompare(answer.user_input) == 0 && lct.localeCompare(answer.location) == 0 && cnt.localeCompare(answer.concept) == 0) {
      exists = true;
      break;
    }
  }

  return exists;

}

/**
 * Checks if the user's answer is a dublicate(he has already entered the same answer for the same concept in that location).
 * @param  {Array}  answer [description]
 * @return {Boolean}        [description]
 */
function isDuplicate_indexed(answer) {
  //var answer = {concept: concept, user_input : input_word , location: location};
  var exists = false;

  for (var key in submitedAnswers_indexed) {
    if (submitedAnswers_indexed.hasOwnProperty(key)) {
      var cnt = submitedAnswers_indexed[key].concept;
      var input = submitedAnswers_indexed[key].user_input;
      var lct = submitedAnswers_indexed[key].location;
      var lct_id = submitedAnswers_indexed[key].location_id;

      if (input.localeCompare(answer.user_input) == 0 && lct.localeCompare(answer.location) == 0 && cnt.localeCompare(answer.concept) == 0) {
        exists = true;
        break;
      }
    }
  }

  return exists;

}


/**
 * check if string contains a substring
 * @param  {String} needle [description]
 *
 */
var contains = function(needle) {
  // Per spec, the way to identify NaN is that it is not equal to itself
  var findNaN = needle !== needle;
  var indexOf;

  if (!findNaN && typeof Array.prototype.indexOf === 'function') {
    indexOf = Array.prototype.indexOf;
  } else {
    indexOf = function(needle) {
      var i = -1,
        index = -1;

      for (i = 0; i < this.length; i++) {
        var item = this[i];

        if ((findNaN && item !== item) || item === needle) {
          index = i;
          break;
        }
      }

      return index;
    };
  }

  return indexOf.call(this, needle) > -1;
};

/**
 * Creates a cookie with name, value and exp. date
 * @param  {String} name  [description]
 * @param  {String} value [description]
 * @param  {Int} days  [description]
 *
 */
function createCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "; expires=" + date.toGMTString();
  } else var expires = "";
  document.cookie = name + "=" + value + expires + "; path=/";
}

/**
 * Read value of a cookie by name.
 * @param  {String} name [description]
 * @return {String}      [description]
 */
function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Delete cookie.
 * @param  {String} name [description]
 *
 */
function eraseCookie(name) {
  createCookie(name, "", -1);
}

/**
 * Check if an object is empty.
 * @param  {Object}  obj [description]
 * @return {Boolean}     [description]
 */
function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
  }

  return true;
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
      user_lang: current_language,
      anonymous_id: current_user,
      user_name: user_name,
      user_dialect: selected_dialect,
      user_age: user_age,
      anonymous_data: anonymous_data
    },
    success: function(response) {
      console.log({
        action: 'save_user_language',
        user_lang: current_language,
        anonymous_id: current_user,
        user_name: user_name,
        user_dialect: selected_dialect,
        user_age: user_age,
        anonymous_data: anonymous_data
      });

      console.log("Language Added");
      console.log(JSON.parse(response));
    }
  });
}

function save_user_dialect(user_name) {

  var parsed_name = user_name.replace(/\s/g, ".");
  console.log(parsed_name.toLowerCase());
  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'save_user_dialect',
      user_name: parsed_name.toLowerCase(),
      user_dialect: selected_dialect
    },
    success: function(response) {
      console.log("Dialect Added");
      console.log(JSON.parse(response));
    }
  });
}


/**
 * Saves user data in global variables.
 * @param  {Object} obj [description]
 *
 */
function declare_user_data(obj) {
  userLoggedIn = obj.userLoggedIn;
  if (userLoggedIn) {
    language_is_set = obj.language_is_set;
    anonymousCrowder = false;
    current_user = obj.current_user;
    crowder_lang = obj.crowder_lang;
    user_email = obj.user_email;
    selected_dialect = obj.crowder_dialect;
    current_user_age = obj.crowder_age;
  } else {
    language_is_set = obj.language_is_set;
    anonymousCrowder = true;
    current_user = obj.current_user;
    crowder_lang = obj.crowder_lang; //null;
    selected_dialect = obj.crowder_dialect;
  }
  //console.log(obj);
}

/**
 * Check if user(only for not logged in users) has submited answers and delete crowder_id cookie if he has no answers.
 *
 */
function check_user_aeusserungen() {
  if (isEmpty(submitedAnswers_indexed) && !userLoggedIn) {
    eraseCookie("crowder_id");
    current_user = null;
  }
}

/**
 * Checks if the user has any answers in the current location. This is used for changing the color of the location marker: blue - user has not entered a answer in the location, green - user has entered an answer in that location.
 * @param  {String} location [description]
 *
 */
function check_user_aesserungen_in_location(location) {
  var has_aeusserungen = false;

  for (var key in submitedAnswers_indexed) {
    if (submitedAnswers_indexed.hasOwnProperty(key)) {
      if (location.localeCompare(submitedAnswers_indexed[key].location) == 0) {
        has_aeusserungen = true;
        break;
      }
    }
  }
  return has_aeusserungen;
}


///Ajax Calls

function get_submited_answers(callback) {

  if (!userLoggedIn) {
    addLoginToolTip();
    startLoginTimer();
  }

  check_user_aeusserungen();

  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'send_location_submited_asnswers_count',
      lang: current_language
    },
    success: function(response) {
      var data = JSON.parse(response);
      var location_data_count = data.data_count;
      var is_admin = data.can_edit;

      get_aeussetungen_locations_curLang(location_data_count, is_admin, callback);

      aeusserungen_by_locationindex = new Object();
    }
  });


}

function get_submited_answers_current_location(location_id, marker) {

  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'get_submited_answers_current_location',
      lang: current_language,
      location_id: location_id
    },
    success: function(response) {

      var data = JSON.parse(response);
      var submited_anwerts_current_location = data.submited_data;
      var is_admin = data.can_edit;
      aeusserungen_by_locationindex[location_id] = submited_anwerts_current_location;

      //jQuery('#custom_backdrop i').css('top','0px');
      //jQuery('#custom_backdrop').hide().css('background','');
      jQuery('#custom_backdrop').fadeOut('slow');
      openLocationListModal(marker);

    }
  });

}


function get_submited_answers_current_user(callback){

  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'get_submited_answers_current_user',
      lang: current_language
    },
    success: function(response) {
      var data = JSON.parse(response);
      var submited_answers_current_user = data.submited_answers_current_user;
      var is_admin = data.can_edit;

      add_submited_answers_to_index_submitedAnswers_array(submited_answers_current_user, is_admin);

      num_of_answers_by_id = createAnswersToEntryNumbers(submitedAnswers_indexed);
      checkEnteredConcepts_indexed();

      populate_concept_span(function() {
        console.log("test running")
      });
      callback();
      //init_left_menu();
    }

  });
}



function add_submited_answers_to_index_submitedAnswers_array(arrayA, can_edit) {
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

    if ((author.localeCompare(current_user) == 0 && author.localeCompare("anonymousCrowder_90322") != 0) || is_admin) {


      var concept_idx = get_table_index_by_va_phase(parseInt(concept_id));


      var answer = { concept: concept, user_input: word_inputed, location: location_name, id_auesserung: id_auesserung, concept_id: concept_id, concept_index: concept_idx };
      submitedAnswers_indexed[parseInt(id_auesserung)] = answer;
    }

  }


}

function get_table_index_by_va_phase(_concept_id) {

  // if (concepts_index_by_id[va_phase][parseInt(_concept_id)]) {
  //   var index = concepts_index_by_id[va_phase][parseInt(_concept_id)].index;
  // } else {
  //
  //   if (va_phase == 1) {
  //     var v = 2;
  //   } else {
  //     var v = 1;
  //   }
  //
  //
  //   var index = concepts_index_by_id[v][parseInt(_concept_id)].index;
  //
  // }

  var index;

  // for (var i = 0; i < active_va_phases.length; i++) {
  //   if(active_va_phases.length == 2){
  //     cur_va_phases = 0;
  //   }else{
  //     cur_va_phases = active_va_phases[i];
  //   }

  //   if (concepts_index_by_id[cur_va_phases][parseInt(_concept_id)]) {
  //     index = concepts_index_by_id[cur_va_phases][parseInt(_concept_id)].index;
  //   }


  // }

  if (concepts_index_by_id[parseInt(_concept_id)]) {
    index = concepts_index_by_id[parseInt(_concept_id)].index;
  }

  return index;
}


function get_dialects(callbackOpenModal) {

  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'get_dialects'
    },
    success: function(response) {


      dialect_array = JSON.parse(response);
      dialect_data = getTableData(dialect_array, "dialect");

      if (!dialect_modal_initialized) {
        datatable_dialects = create_dialect_list_modal(jQuery("#dialect_modal"), dialect_data);
      }

      if (!jQuery("#welcome_modal").hasClass("in")) {
        showCustomModalBackdrop();
        if (callbackOpenModal) {
          callbackOpenModal();
        }
      }
    }

  });


}

/**
 * Initialize all translation strings as global variables to be easily accessed
 * @param  {Array} translations Array Data fetched from server
 */
function init_translations(translations) {

  welcomeback_texts = translations['CS_WELCOME_BACK']

  register_texts = translations['CS_REGISTER']

  random_texts = translations['CS_RANDOM_CONCEPT']

  suggest_texts = translations['CS_NEW_CONCEPT']

  active_user_texts = translations['CS_BESTENLISTE_1']

  active_location_texts = translations['CS_BESTENLISTE_2']

  active_concept_texts = translations['CS_BESTENLISTE_3']

  register_head_texts = translations['CS_WHY_REGISTER']

  register_body_texts = translations['CS_TOOLTIP_REGISTRIERUNG_BODY']

  register_yes_texts = translations['CS_REGISTER_NOW']

  register_no_texts = translations['REGISTER_NO_THANKS']

  feedback_texts = translations['CS_TOOLTIP_NEW_CONCEPT']

  permanently_saved = translations['CS_PERMANENTLY_SAVED'];

  click_on_location = translations['CS_CLICK_ON_LOCATION'];

  no_results_data_table = translations['CS_NO_RECORDS_FOUND'];

  search_for_location = translations['CS_LOCATION_PER_CLICK'];

  search_map_location = translations['CS_LOCATION_SEARCH'];

  nothing_found = translations['CS_no_location_found'];

  suggest_dialect_texts = translations['suggest_dialect_texts'];

  selected_dialect_texts = translations['selected_dialect_texts'];

  submit_dialect_texts = translations['submit_dialect_texts'];

  abort_dialect_texts = translations['abort_dialect_texts'];

  the_word_dialect = translations['the_word_dialect'];

  dialect_not_selected_texts = translations['PLEASE_SELECT_DIALECT']

  alpine_agriculture = translations['CS_Almwirtschaft'];

  alpine_nature = translations['CS_Natur'];

  alpine_modern = translations['CS_Modern'];

  too_few_elements = translations['CS_HELP_FILL'];

  user_input_not_full = translations['CS_EINGABEFELDER'];
  field_not_full = translations['CS_field_not_full'];
  // change_question = ['Ändern in: ','Modifier: ','Modificare: ','Spremeni v: ']; //change_question[current_language]

  change_question = translations['CS_DUPLIKAT'];

  welcome_texts = translations['CS_WELCOME'];

  slogan_texts = translations['CS_SLOGAN'];

  navigation_languages = translations['CS_NAVIGATION_LANGUAGE']

  language_texts = translations['CS_LANGUAGE'];

  languages = translations['CS_LANGUAGES_NAMES'];

  instruction_texts = translations['CS_ANLEITUNG']

  instruction_heads = translations['CS_INSTRUCTIONS']

  go_texts = translations['CS_AUFFORDERUNG']

  the_word_concept = translations['CS_WORD_CONCEPT']

  the_word_location = translations['CS_LOCATION_TERM']

  concept_select_texts = translations['CS_TUTORIAL_2']

  data_remark = translations['CS_COPYWRITE']

  remark_link = [
    "https://www.verba-alpina.gwi.uni-muenchen.de/?page_id=226&noredirect=de_DE",
    "https://www.verba-alpina.gwi.uni-muenchen.de/fr/?page_id=22&noredirect=fr_FR",
    "https://www.verba-alpina.gwi.uni-muenchen.de/it/?page_id=33&noredirect=it_IT",
    "https://www.verba-alpina.gwi.uni-muenchen.de/si/?page_id=4&noredirect=sl_SI"
  ]

  input_select_texts = translations['CS_TUTORIAL_3'];


  location_select_texts = translations['CS_TUTORIAL_1'];

  location_select_texts_with_br = translations['CS_TUTORIAL_5'];

  submit_texts = translations['CS_TUTORIAL_4'];


  anonymous_texts = translations['CS_ANONYMOUS']

  important_concepts_texts = translations['CS_IMPORTANT_CONCEPT']

  upload_image_text = translations["CS_upload_image"]

  tooltips = [
    { name: "#word_span", array: concept_select_texts },
    { name: "#location_span", array: location_select_texts },
    { name: "#user_input", array: input_select_texts },
    { name: "#submitanswer", array: submit_texts },
    { name: "#upload_image", array: upload_image_text },

  ];

  lang_dialect_abbreviation = translations['CS_DIALECT_LANG']


  user_name = translations['CS_user_name'];
  birth_year = translations['CS_birth_year'];
  register = translations['CS_register'];
  send_anonymous_data_text = translations['CS_send_anonymous_data_text'];
  send_anonymous_data_modal_text = translations['CS_send_anonymous_data_modal_text'];
  details_why_register_send_anonymous_data = translations['CS_details_why_register_send_anonymous_data'];


  forgot_password_text = translations['CS_forgot_password_text'];
  enter_username_or_email = translations['CS_enter_username_or_email']
  password_text = translations['CS_password_text']
  new_acc_text = translations['CS_NEW_ACCOUNT']
  new_acc_text_detail = translations['CS_CREATE_ACC']
  get_new_password = translations['CS_get_new_password']
  login_btn = translations['CS_login_btn'];
  reset_btn_text = translations['CS_reset_btn_text'];

  change_input = translations['CS_change_input'];
  delete_input = translations['CS_delete_input'];

  change_dialect = translations['CS_change_dialect'];

  change_answer = translations['CS_change_answer'];

  question_marker = translations['CS_question_marker'];
  crowder = translations['CS_crowder'];

  upload_own_image_button_text = translations["CS_upload_own_images"]

  upload_task_text = translations["CS_upload_task_text"]

  close_modal_text = translations["CS_close_modal"]

  upload_terms_text = translations["CS_image_upload_terms"]

  upload_text = translations["CS_click_or_drop_text"]

  drop_file_text = translations["CS_drop_files_here"]

  select_image_alert = translations["CS_select_image_alert"]
  accept_upload_terms_alert = translations["CS_accept_upload_terms_alert"]

  upload_complete = translations["CS_upload_complete"]
  upload_failed = translations["CS_upload_failed"]
  clear_images = translations["CS_clear_images"]
}