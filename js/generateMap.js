/**
 * @module  Map-Objects_Generator
 * 
 */


var styledMapType;
var map;
var marker;
var markershape;
var markershapeFiltered;
var center;
var infoWindows = [];
var markers = [];
var old_feature;
var old_infowindow;

var location_markers = {};

var user_input_marker;

var marker_to_change;
var event_choose_loc_feature;
var info_window_dialect_change = false;
var info_window_answer_change = false;
var current_infowindow;

var change_input = ['Ändern','Modifier','Modificare','Spremeni'];   
var delete_input = ['Löschen','Effacer','Cancellare','Izbriši']; 

var change_dialect = ['Dialekt ändern','Modifier dialecte','Modificare dialetto','Narečje Spremeni']; // dummy, still need real translation of Dialeckt aendern 

var change_answer = [
"Ihre Antwort ändern",
"Modifier votre réponse",
"Modificare la vostra risposta",
"Spremeni Vaš odgovor"
];

var  question_marker = ['Wie Sagt man bei Ihnen?', 'Comment est-ce qu´on dit chez vous?' , 'Come si dice da voi?', 'Kako se pri vas reče?'];
var crowder = ['anonymer User','Utilisateur anonyme','Utente anonimo','Anonimen uporabnik'];

jQuery(document).ready(function($) {
  initMap();

  jQuery.ajax({
    dataType: "json",
    url: url.plugins_Url+"js/json/mapstyle_dark_minimal.json",
    success: function(data){
      styledMapType = data;
      map.setOptions({styles: styledMapType});
    }
  });  




});

/**
 * Initialize the Google Map - Options, Styles and Markers
 * 
 */
function initMap(){

  var myOptions = {
      center: {lat: 45.483678, lng: 11.410439},
          zoom:6,
          disableDefaultUI: true,
          styles:  styledMapType
  };

  var styledMapType = new google.maps.StyledMapType ([
  {
    "featureType": "road",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
]);

  map = new google.maps.Map(document.getElementById('map'), myOptions);

  map.setOptions({styles : styledMapType});

  markershapeFiltered = {
    path: "m 96,63.999986 q 0,-13.24998 -9.37497,-22.62502 -9.375032,-9.37496 -22.625027,-9.37496 -13.250004,0 -22.625007,9.37496 -9.37499,9.37504 -9.37499,22.62502 0,13.25 9.37499,22.625 9.375003,9.375 22.625007,9.375 13.249995,0 22.625027,-9.375 Q 96,77.249986 96,63.999986 z m 32,0 q 0,13.625 -4.125,22.375 L 78.375005,183.12501 q -1.999996,4.125 -5.937511,6.49998 Q 68.500043,192 64.000003,192 q -4.499987,0 -8.437497,-2.37501 -3.937505,-2.37498 -5.812493,-6.49998 L 4.1249985,86.374986 Q 0,77.624986 0,63.999986 0,37.499946 18.750001,18.750006 37.500011,6e-6 64.000003,6e-6 90.500008,6e-6 109.25,18.749996 128,37.499946 128,63.999986 z",
    fillColor: '#939393',
    fillOpacity: 0.8,
    scale: 0.22,
    strokeColor: '#7e7e7e',
    strokeWeight: 1,
    anchor: new google.maps.Point(64, 192)
  };

  markershape = {
    path: "m 96,63.999986 q 0,-13.24998 -9.37497,-22.62502 -9.375032,-9.37496 -22.625027,-9.37496 -13.250004,0 -22.625007,9.37496 -9.37499,9.37504 -9.37499,22.62502 0,13.25 9.37499,22.625 9.375003,9.375 22.625007,9.375 13.249995,0 22.625027,-9.375 Q 96,77.249986 96,63.999986 z m 32,0 q 0,13.625 -4.125,22.375 L 78.375005,183.12501 q -1.999996,4.125 -5.937511,6.49998 Q 68.500043,192 64.000003,192 q -4.499987,0 -8.437497,-2.37501 -3.937505,-2.37498 -5.812493,-6.49998 L 4.1249985,86.374986 Q 0,77.624986 0,63.999986 0,37.499946 18.750001,18.750006 37.500011,6e-6 64.000003,6e-6 90.500008,6e-6 109.25,18.749996 128,37.499946 128,63.999986 z",
    fillColor: 'blue',
    fillOpacity: 0.8,
    scale: 0.22,
    strokeColor: '#000080',
    strokeWeight: 1,
    anchor: new google.maps.Point(64, 192)
  };

    markershapeChoosen = {
    path: "m 96,63.999986 q 0,-13.24998 -9.37497,-22.62502 -9.375032,-9.37496 -22.625027,-9.37496 -13.250004,0 -22.625007,9.37496 -9.37499,9.37504 -9.37499,22.62502 0,13.25 9.37499,22.625 9.375003,9.375 22.625007,9.375 13.249995,0 22.625027,-9.375 Q 96,77.249986 96,63.999986 z m 32,0 q 0,13.625 -4.125,22.375 L 78.375005,183.12501 q -1.999996,4.125 -5.937511,6.49998 Q 68.500043,192 64.000003,192 q -4.499987,0 -8.437497,-2.37501 -3.937505,-2.37498 -5.812493,-6.49998 L 4.1249985,86.374986 Q 0,77.624986 0,63.999986 0,37.499946 18.750001,18.750006 37.500011,6e-6 64.000003,6e-6 90.500008,6e-6 109.25,18.749996 128,37.499946 128,63.999986 z",
    fillColor: 'green',
    fillOpacity: 0.9,
    scale: 0.22,
    strokeColor: '#004600',
    strokeWeight: 1,
    anchor: new google.maps.Point(64, 192)
  };

/*
    marker = new google.maps.Marker({
    map: map,
    draggable: false,
    animation: google.maps.Animation.DROP,
    position: {lat: 48.1520, lng: 11.5535},
    icon: markershape
 
  });
*/
}

/**
 * Adds Alpine convention Polygon
 * @param {String} geoData Geodata - Polygon
 */
function addGeometryAlps(geoData,center){
  var polygon = parseGeoData(geoData);
  var center_map = parseGeoData(center);

  var /** Object */ options = {"geometry" : polygon};
  var feature = new google.maps.Data.Feature(options);

  var url = new URL(window.location.href);
  var poly = url.searchParams.get("poly");


  map.data.add(feature);

  feature.setProperty('selected', false);



 

      map.data.setStyle(function(feature) {
        var color = 'blue';
        var opacity = 0;
        /*if (feature.getProperty('selected')) {
          color = 'green';
          opacity = 0.4;

        }*/

        return /** @type {google.maps.Data.StyleOptions} */({
          fillOpacity:opacity,
          fillColor: color,
          strokeColor: color,
          strokeWeight: 2,
          clickable:false
        });
      });


if(poly){
  

  if(isMobile()){
    map.setZoom(7);
  }else{
    map.setZoom(7);
  }




  map.panTo(center_map.get());



}


add_location_search_listener();
/*
 event_choose_loc_feature =  map.data.addListener('click', function(event) {
    if(choosing_location_mode){
      closeAllInfoWindows();
      var latitude = event.latLng.lat();
      var longitude = event.latLng.lng();

  
  
    get_location_and_display(latitude,longitude);

    map.setOptions({draggableCursor:''});
    google.maps.event.removeListener(event_choose_loc);
    google.maps.event.removeListener(event_choose_loc_feature);
    choosing_location_mode = false;
   
    }
  });

*/


 }




 function add_location_search_listener(){
   event_choose_loc_feature =  map.data.addListener('click', function(event) {
    if(choosing_location_mode){
      
      closeAllInfoWindows();
      var latitude = event.latLng.lat();
      var longitude = event.latLng.lng();

      get_location_and_display(latitude,longitude);

    }
  });
 }

 function remove_location_search_listener(){
    
  //  console.log("asdasd");
    google.maps.event.removeListener(event_choose_loc);
    google.maps.event.removeListener(event_choose_loc_feature);
    map.setOptions({draggableCursor:''});
    choosing_location_mode = false;
 }

/**
 * Adds location polygon
 * @param {String} geoData Geo data
 * @param {Object} data    Object containing data for the polygon
 */
function addGeometry(geoData,data){

  var location_name = data.name;
  location_name = location_name.replace(/\\/g, "");
  var center = parseGeoData(data.centerCoordinates);  
  var lat_g = parseGeoData(data.centerCoordinates).get().lat();
  var lng_g = parseGeoData(data.centerCoordinates).get().lng();

  if(old_feature != null){
    map.data.remove(old_feature);
    //console.log('removeThat Thing');
    //map.data.remove(old_infowindow);  
  }  
  
  if(old_infowindow != null){
    old_infowindow.close();
    old_infowindow = null;
  }
  closeAllInfoWindows();

  var polygon = parseGeoData(geoData);


  var /** Object */ options = {"geometry" : polygon};
  var featureSelected = new google.maps.Data.Feature(options);

 // featureSelected.setProperty('selected', true);
  featureSelected.setProperty('selected', check_user_aesserungen_in_location(location_name));
  featureSelected.setProperty('location', location_name);

 var infoWindowContent = [
        "<div id='inputWrapper'>",
        location_name ,
        "</div>"

    ].join("");
  var infowindow = new google.maps.InfoWindow();
  var infowindow = new google.maps.InfoWindow({
        content:infoWindowContent,
        position: {lat: lat_g, lng:lng_g }
  });

  infoWindows.push(infowindow);

  old_feature = featureSelected;
  old_infowindow = infowindow;

  map.data.add(featureSelected);
  



  map.data.setStyle(function(featureSelected) {
    var color = 'blue';
    var fillColor = '#2068b5';
    var opacity = 0;
    if (featureSelected.getProperty('selected')) {
      color = '#009900';
      fillColor = '#009900';
      opacity = 0.1;
      //fillOpacity = 0.1;
    }
    return /** @type {google.maps.Data.StyleOptions} */({
      fillOpacity:opacity,
      fillColor: fillColor,
      strokeColor: color,
      strokeWeight: 2,
      clickable:false
    });
  });
    
  change_feature_style(featureSelected,check_user_aesserungen_in_location(location_name));
  infowindow.open(map);
 
/*  map.data.addListener('click', function(event) {  
        var feature = event.feature;
       	feature.setProperty('choosen', true);
  });

  if(featureSelected.getProperty('choosen')){
  	  infowindow.open(map);
  }*/
  jQuery('#custom_backdrop i').css('top','0px'); 
  jQuery('#custom_backdrop').hide().css('background','');
 }

/**
 * Displays Marker For one location
 * @param  {Object} element  Contains location information(name, id), number of answers in that location and if the current author has answers in it.
 * @param  {Boolean} can_edit Checks if the user can edit the input.
 * 
 */
function display_location_markers(element,can_edit){
/*
  var location_coordinates = parseGeoData(element.geo_data.geo); stable
  var count_aeusserung_per_location = element.count.toString();
  var location_id = element.geo_data.location_id.toString();
  var userMarker = element.geo_data.userCheck;
  var is_admin = can_edit;*/

  var location_coordinates = parseGeoData(element.geo);              // testing
  var count_aeusserung_per_location = element.count.toString();     //
  var location_id = element.location_id.toString();                //
  var location_name = element.location_name;                      //
  var userMarker = element.userCheck;                            //
  var is_admin = can_edit;                                      //


  if(is_admin)userMarker=true;

  var marker_color;

  if(userMarker == 0){
    marker_color = "blue";

  }else{
    marker_color = "green";

  }


  var marker = addCircleMarker(location_coordinates.get(),count_aeusserung_per_location,marker_color);

  marker.location_id = location_id; /*Property Location_ID fuer Marker*/
  marker.location_name = location_name;
  marker.aeusserungen_count = count_aeusserung_per_location;

   if(userMarker == 0){
      marker.user_marker = false;
  }
  else{
    marker.user_marker = true;
  }


  //location_markers[element.geo_data.location_id] = marker; // stable
  location_markers[element.location_id] = marker;  // testing
}

/**
 * Adds a marker when user enters an answer for a new location.
 * @param {Object} obj           Data
 * @param {Int} aeusserung_id Submited Answer Id
 */
function add_user_marker(obj,aeusserung_id){

  //console.log(obj);
  var coordinates = parseGeoData(obj.centerCoordinates);
  var infoWindowOrtsname = obj.name;
  var concept = obj.concept;
  var concept_id = obj.concept_id;
  var bezeichnung = obj.bezeichnung;
  var aeusserung_id = aeusserung_id;
  var location_id = obj.location_id;


  //  var green_marker = {
  //   url: url.plugins_Url+"assets/images/green_marker.png",
  //   size: new google.maps.Size(30,45),
  //   // origin: new google.maps.Point(0, 0),
  //   // anchor: new google.maps.Point(0, 32)
  // };

   markerSelected = new google.maps.Marker({
          map: map,
          draggable: false,
          animation: google.maps.Animation.DROP,
          position:{lat:coordinates.get().lat(), lng:coordinates.get().lng()}/*{lat:coordinates.get().lat(), lng:coordinates.get().lng()}*/,
          icon:  url.plugins_Url+"assets/images/green_marker.png",
          zIndex: 20001    
        });
       
markerSelected.location_id = location_id;
markerSelected.location_name = infoWindowOrtsname;
markerSelected.addListener('click', function() {
          closeAllInfoWindows();
          //openLocationListModal(marker);
          checkDataBeforeListModal(markerSelected);
        });



 /*close all other infowindows*/
 closeAllInfoWindows();


 user_input_marker = markerSelected; /*global user_input_marker*/

//Info window
  /*     var infoWindowContent = [
        "<div class='inputWrapper'>",
        "" + translateInfoWindowText(infoWindowOrtsname, concept,bezeichnung, current_user) + "", 
        "<div class='infbtnwrapper'><button style='display:inline-block;' id='edit_input' type='button' class='btn btn-primary btn-sm'>" + change_input[current_language] + "</button>",
        "<button style='display:inline-block;margin-left: 5px;padding: 4px; font-size: 14px;' class='btn btn-primary ' data-concept_id=\"" + concept_id + "\" data-todelete=\"" + aeusserung_id + "\"  data-ort= \"" + infoWindowOrtsname + "\" type='button' id='deleteAuesserung' type='button'>" + delete_input[current_language] + "</button></div>",
        "</div>"

    ].join("");


    var contentNode = jQuery(infoWindowContent)[0]; 

    var infowindow = new google.maps.InfoWindow({
        content: contentNode
    });

     infowindow.addListener('domready', function() {


     jQuery(this.getContent()).find('#deleteAuesserung').off('click').on('click',function(){


      infowindow.close();
      markerSelected.setMap(null);

      for(var i = 0; i < markers.length; i++){
        if(markers[i].marker===markerSelected)markers.splice(i,1);
      }

      deleteInput(aeusserung_id,infoWindowOrtsname,concept_id,location_id);

     });

    jQuery(this.getContent()).find('#edit_input').off('click').on('click',function(){
      editInputA(infoWindowOrtsname,concept,bezeichnung,aeusserung_id,concept_id,infowindow,true,location_id);
      marker_to_change = markerSelected;
    });

    });*/
// end info window Info window
// 
     var infoWindowContent = [
        "<div class='inputWrapper'>",
        "" + translateInfoWindowText(infoWindowOrtsname, concept,bezeichnung, current_user) + "<br>",
        "<div id='dialect_wrapper'><span id='i_span_2' style='display:inline-block'>" + the_word_dialect[current_language]+":&nbsp;" +"</span>" + "<div id='dialect_infowindow' data-submited-answer="+ aeusserung_id  +" style='display:inline-block'>" +selected_dialect + "</div></div>", 
        "<div class='infbtnwrapper'>",
        "<button style='display:inline-block;margin-right:5px;' id='edit_input' type='button' class='ifw_change_dialect btn btn-primary btn-sm'>" + change_answer[current_language] + " " + change_input[current_language] + "</button>",
        "<button style='display:inline-block;' id='change_dialect' type='button' class='ifw_change_dialect btn btn-primary btn-sm'>" + change_dialect[current_language] + "</button>",
        "</div>"

    ].join("");


    var contentNode = jQuery(infoWindowContent)[0]; 

    var infowindow = new google.maps.InfoWindow({
        content: contentNode
    });

     infowindow.addListener('domready', function() {

      //jQuery here
      jQuery('#change_dialect').on('click', function(){
        info_window_dialect_change = true;
        current_infowindow = infowindow;
        get_dialects(function(){openDialectModal();});
      })


      jQuery(this.getContent()).find('#edit_input').off('click').on('click',function(){
        //editInputA(infoWindowOrtsname,concept,bezeichnung,aeusserung_id/*,concept_id,infowindow,true,location_id*/);
         info_window_answer_change = true;
        editInputA(aeusserung_id,concept_id,location_id,concept);
        marker_to_change = markerSelected;
      });

      google.maps.event.addListener(infowindow,'closeclick',function(){
         markerSelected.setMap(null); 
      });

    });





    
    //setTimeout(function(){user_input_marker.setMap(null)}, 1100);

    infoWindows.push(infowindow);

    
    //infowindow.open(map, markerSelected);
    setTimeout(function(){infowindow.open(map, markerSelected)}, 500);
     
}






function closeAllInfoWindows(location_infoWindow_only){

  for(var i = 0; i < infoWindows.length; i++){
              infoWindows[i].close();
  }


  
    if(user_input_marker){
     user_input_marker.setMap(null);
    }
  
}

function smoothZoom (map, max, cnt) {
  //var mapObject = new google.maps.Map(document.getElementById("map"), myOptions);

    if (cnt >= max) {
        return;
    }else {
        z = google.maps.event.addListener(map, 'zoom_changed', function(event){
            google.maps.event.removeListener(z);
            smoothZoom(map, max, cnt + 1);
        });
        setTimeout(function(){map.setZoom(cnt)}, 80); 
    }
}


jQuery(".userAuesserung").focus(function(){
  jQuery(this).attr('id', 'currentInput');
});

function setQ(con, id){

  closeAllInfoWindows();


  jQuery('#word_span').text(con);
  jQuery('#word_span').attr("data-id_concept",id);

  
   var index = concepts_index_by_id[va_phase][parseInt(id)].index;

   if(current_concept_index[va_phase]!=-1)deSelectTableEntry(current_concept_index[va_phase]);
   selectTableEntry(index);
  
   current_concept_index[va_phase] = index;
   concept_selected = true;

   checkImageModal(id,con);    

}



function translateInfoWindowText(ort,concept,bezeichnung,author){
 var text = '';
 

 if(current_user.localeCompare(author) != 0){
 
  var string = author;
  var substring = "anonymousCrowder_";

  if(string.indexOf(substring) == 0){
        author = crowder[current_language];

  }

    switch(current_language){
      case 0: 
      text = "In " + ort + " sagt " + author +  " zu<br> <span id='i_span_2'>" + concept + ": </span>" + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
      break;
      case 1: 
      text = "À " + ort + ", pour <span id='i_span_2'>" + concept + "</span> " + author +  " dit:<br> "  + " " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
      break;
      case 2: 
      text = "A " + ort + ", per  <span id='i_span_2'>" + concept + "</span> " + author +  " dice:<br> "  + " " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
      break;
      case 3: 
      text = "V " + ort + " " + author +  " reče za<br> <span id='i_span_2'>" + concept + ": </span>" + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
      break;
    }
  }else{

     switch(current_language){
      case 0: 
      text = "Ihre Antwort:<br>" + "In " +  ort + " sagt man zu <br><span id='i_span_2'>" + concept + ": </span>" + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
      break;
      case 1: 
      text = "Votre réponse:<br>" + "À " +  ort + ", pour <br><span id='i_span_2'>" + concept + ": </span> on dit " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
      break;
      case 2: 
      text = "La vostra risposta: <br>" + "A " +  ort + ", per <br><span id='i_span_2'>" + concept + ": </span> si dice " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
      break;
      case 3: 
      text = "Vaš odgovor:<br>" + "V " +  ort + " se reče za <br><span id='i_span_2'>" + concept + ": </span> " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
      break;
    }
  }
  return text;
}





function addCircleMarker(position,label,color){

        var image = create_marker_image(label,color);
        // the clickable region of the icon.
        // var shape = {
        //     coords: [1, 1, 1, 104, 80, 104, 80 , 1],
        //     type: 'poly'
        // };

        var z_index = 20000-parseInt(label);

        var marker = new google.maps.Marker({
            position: position,
            map: map,
            icon: image,
            // shape: shape,
            zIndex: z_index
        });

        marker.addListener('click', function() {
          closeAllInfoWindows();
          //openLocationListModal(marker);
          checkDataBeforeListModal(marker);
        });


      
        return marker;
    
}

function change_marker(marker,number,color){


  var label = (parseInt(marker.aeusserungen_count)+(number)).toString();
  var color;

  marker.aeusserungen_count = label;

  var num_entries = check_for_entries(marker.location_id);
  var cur_user_entries = check_for_current_user_entries(marker.location_id);

  if(num_entries<=0){
    marker.setMap(null);
    delete location_markers[marker.location_id];
  }else if(cur_user_entries <= 0){
    color = "blue";
    location_markers[marker.location_id].user_marker = false;
  }else if(cur_user_entries > 0){
    color = "green";
    location_markers[marker.location_id].user_marker = true;
  }

  var image = create_marker_image(label,color);

  marker.setIcon(image);

}

function check_for_entries(location_id){
  var array_to_check = aeusserungen_by_locationindex[location_id];
  var entered_aeusserungen = 0;

  for (var key in array_to_check) {
    if (array_to_check.hasOwnProperty(key)) {
      entered_aeusserungen++;    
    }
  }


  return entered_aeusserungen;
}

function check_for_current_user_entries(location_id){
  var array_to_check = aeusserungen_by_locationindex[location_id];
  var user_entered_aeusserungen = 0;

  for (var key in array_to_check) {
    if (array_to_check.hasOwnProperty(key)) {
      if(current_user.localeCompare(array_to_check[key].author) == 0){
        user_entered_aeusserungen++;
      }
    }
  }

  return user_entered_aeusserungen;
}



function create_marker_image(label,color){

var size;


if(label.length==1)size=24;
else if(label.length==2)size=32;
else  size=40;  

//sizes will be doubled and then scaled down again by gmap 

 var number = parseInt(label);
 var add = Math.floor(number/4);
 size += add;

 if(size>50)size=50; //max size = 50px;
 size*=2; //multiply size for double size image for better quality

    var canvas = document.createElement('canvas');
    var context = canvas.getContext("2d");

    
     // context.imageSmoothingQuality('high');


      canvas.width = size;
      canvas.height = size;
      var centerX = canvas.width / 2;
      var centerY = canvas.height / 2;
      var radius = (size/2)-2; //-2 for half stroke width

      var fillcolor = "rgba(0,0,139,0.88)";
      var strokecolor = "#3366ff"

      if(color=="green"){
        fillcolor="rgba(0,100,0,0.88)";
        strokecolor = "#00af00"
      }

      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      context.fillStyle = fillcolor;
      context.fill();
      context.lineWidth = 4;
      context.strokeStyle = strokecolor;
      context.stroke();

      context.font = "25px Arial";

      var y = (size/2);

        if(color=="blue"){
            context.fillStyle = '#7396ff';
        }
        else{
            context.fillStyle = '#2BBF17';
        } 

        context.textAlign="center"; 
        context.textBaseline="middle"; 
        context.fillText(label, centerX, y);
      
      

        var image = {
            url: canvas.toDataURL(),
            scaledSize: new google.maps.Size(size/2, size/2),
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(size/4, size/4)
        };

        return image;
}

function change_feature_style(current_feature,has_aesserungen){

  if(has_aesserungen){
      map.data.overrideStyle(current_feature, {color : '#009900',fillColor : '#009900',strokeColor: '#009900',fillOpacity:0.2});
    }else{
      map.data.overrideStyle(current_feature, {color : 'blue',fillColor : '#2068b5',fillOpacity:0.2,strokeColor: 'blue'});
  }

   
}


 function isMobile(){
  var isMobile = false; //initiate as false
// device detection
  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
      isMobile = true;
  }
  return isMobile;
 }