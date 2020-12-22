/**
 * Map Controller
 */

class MapController {
	constructor() {
		/**
		 * [options description]
		 * @type {Object}
		 */
		this.options = {
			doubleClickZoom: false,
			zoomControl: false
		}

		/**
		 * [map_object description]
		 * @type {Map}
		 */
		this.map_object = new Map(this.options)

		/**
		 * [map description]
		 * @type {var}
		 */
		this.map = this.map_object.map


		this.geo_manager
		this.styledMapType;
		this.pixioverlay;
		this.marker;
		this.markershape;
		this.markershapeFiltered;
		this.center;
		this.infoWindows = [];
		this.markers = [];
		this.old_feature;
		this.old_infowindow;

		this.location_markers = {};

		this.user_input_marker;

		this.marker_to_change;
		this.event_choose_loc_feature;
		this.info_window_dialect_change = false;
		this.info_window_answer_change = false;
		this.current_infowindow;

		this.centerCoordinates_locations = []

		this.IMGeoType = {
			Point: 0,
			Polygon: 1,
			MultiPolygon: 2,
			LineString: 3,
			MultiLineString: 4
		};
	}

	/**
	 * [initMap description]
	 * @param  {Function} callback [description]
	 * @return {void}            [description]
	 */
	initMap(callback) {

		app.map.geo_manager = new GeoManager();

		var options = {
			doubleClickZoom: false,
			zoomControl: false
		}

		var base_map_1 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
		});

		var base_map_2 = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
		});

		var base_map_3 = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
			subdomains: 'abcd',
			maxZoom: 19
		}).addTo(this.map);

		var base_map_4 = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
			maxZoom: 17,
			attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
		});

		var base_map_5 = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 18,
			ext: 'png'
		});

		var currentbasemap = ("Stamen : Terrain");

		var base_map_6 = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png'
		});


		var Stamen_Labels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-labels/{z}/{x}/{y}{r}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png',
			opacity: 0.9
		});

		var overlays = {
			"Stamen Labels": Stamen_Labels
		};

		var base_maps = {
			"Stamen : Terrain": base_map_5,
			"OSM    : Open Street Map": base_map_1,
			"OpenTopo : OpenTopoMap": base_map_4,
			"Stamen  : Toner Light": base_map_6,
			"CartoDB  : Carto Light": base_map_2,
			"CartoDB  : Carto Dark": base_map_3,


		};



		// L.control.layers(base_maps,overlays,{position: 'topright'}).addTo(map);

		// map.attributionControl.setPosition('bottomleft');
		// map.zoomControl.setPosition('bottomright');


		this.pixioverlay = new LeafletPixiOverlay(this.map, true, true,function(){
			if(callback)callback();
		});
		this.pixioverlay.external_scale = 0.5;
		this.pixioverlay.LpixiOverlay.addTo(this.map);

	}


	/**
	 * Adds Alpine convention Polygon
	 * @param {String} geoData Geodata - Polygon
	 */
	addGeometryAlps(geoData, center) {

		var polygon = app.map.geo_manager.parseGeoDataFormated(geoData);
		var center_map = app.map.geo_manager.parseGeoDataFormated(center);
		var type = app.map.getKeyByValue(IMGeoType, polygon.getType());

		var url = new URL(window.location.href);
		var poly = url.searchParams.get("poly");

		app.map.addPixiPolygon(polygon, type, "0x0000ff", null, null);
	}



	/**
	 * [addPixiPolygon description]
	 * @param {Object} polygon      [description]
	 * @param {String} type         [description]
	 * @param {var} stroke_color [description]
	 * @param {var} fill_color   [description]
	 * @param {var} fill_alpha   [description]
	 */
	addPixiPolygon(polygon, type, stroke_color, fill_color, fill_alpha) {

		var geo = {};
		geo['type'] = type;
		geo['coordinates'] = polygon['geoData'];
		geo['idx'] = 0;

		// var polygon_settings = polygonSettingsBoth(color);

		if (type == "MultiPolygon" || type == "Polygon") {

			geo['boundingBox'] = polygon.getBoundingBox();

			var shape = new this.pixioverlay.gLPolygon({
				geo: geo,
				center: [42, 20],
				line_width: 2.0,
				fill_color: fill_color,
				fill_alpha: fill_alpha,
				stroke_color: stroke_color,
				stroke_alpha: 1.0,
				interactive: true,
				hover_line_width: null,
				hover_fill_color: null,
				hover_fill_alpha: fill_alpha,
				hover_stroke_color: null,
				hover_stroke_alpha: null,
				//  clickListener: that.shapeClickFunction.bind(mapShape),
				//  map_shape: mapShape 
			});

		}

		shape.originalPolygon = polygon;
		shape.originalType = type;

		return shape;

	}


	/**
	 * [add_location_search_listener description]
	 */
	add_location_search_listener() {

		this.map.on('click', function(event) {

			if (app.ui.choosing_location_mode) {

				app.map.closeAllInfoWindows();
				var latitude = event.latlng.lat;
				var longitude = event.latlng.lng;
				app.loader.get_location_and_display(latitude, longitude);
			}
		});

	}

	/**
	 * [remove_location_search_listener description]
	 * @return {void} [description]
	 */
	remove_location_search_listener() {

		L.DomUtil.removeClass(this.map._container, 'crosshair-cursor-enabled');
		app.ui.choosing_location_mode = false;
	}

	/**
	 * Adds location polygon
	 * @param {String} geoData Geo data
	 * @param {Object} data    Object containing data for the polygon
	 */
	addGeometry(geoData, data) {

		var location_name = data.name;
		location_name = location_name.replace(/\\/g, "");

		var polygon = app.map.geo_manager.parseGeoDataFormated(geoData);
		var center = app.map.geo_manager.parseGeoDataFormated(data.centerCoordinates).geoData;
		var type = app.map.getKeyByValue(IMGeoType, polygon.getType());

		if (this.old_feature != null) {
			this.pixioverlay.removePolygonOrLine(this.old_feature);
		}

		if (this.old_infowindow != null) {
			this.old_infowindow.close();
			this.old_infowindow = null;
		}

		app.map.closeAllInfoWindows();

		var featureSelected;

		var feature_selected = app.manager.check_user_aesserungen_in_location(location_name);

		if (!feature_selected) featureSelected = app.map.addPixiPolygon(polygon, type, "0x0000ff", "0x0000ff", 0.1);
		else featureSelected = app.map.addPixiPolygon(polygon, type, "0x009900", "0x009900", 0.1);

		featureSelected['selected'] = true;
		featureSelected['selected'] = app.manager.check_user_aesserungen_in_location(location_name);
		featureSelected['location'] = location_name;

		var infoWindowContent = [
			"<div id='inputWrapper'>",
			location_name,
			"</div>"
		].join("");


		var popup = L.popup()
			.setLatLng([center.lat, center.lng])
			.setContent(infoWindowContent)
			.openOn(this.map);

		this.old_feature = featureSelected;

		this.pixioverlay.completeDraw();


		jQuery('#custom_backdrop i').css('top', '0px');
		jQuery('#custom_backdrop').hide().css('background', '');

	}

	/**
	 * Displays Marker For one location
	 * @param  {Object} element  Contains location information(name, id), number of answers in that location and if the current author has answers in it.
	 * @param  {Boolean} can_edit Checks if the user can edit the input.
	 * 
	 */
	display_location_markers(element, can_edit) {

		var polygon = app.map.geo_manager.parseGeoDataFormated(element.geo);

		var location_coordinates = app.map.geo_manager.parseGeoDataFormated(element.geo);
		var count_aeusserung_per_location = element.count.toString();
		var location_id = element.location_id.toString();
		var location_name = element.location_name;
		var userMarker = element.userCheck;
		var is_admin = can_edit;


		if (is_admin) userMarker = true;

		var marker_color;

		if (userMarker == 0) {
			marker_color = "blue";
		} else {
			marker_color = "green";
		}

		var marker = app.map.addCircleMarker(location_coordinates.geoData, count_aeusserung_per_location, marker_color);

		marker.location_id = location_id; /*Property Location_ID fuer Marker*/
		marker.location_name = location_name;
		marker.aeusserungen_count = count_aeusserung_per_location;

		if (userMarker == 0) {
			marker.user_marker = false;
		} else {
			marker.user_marker = true;
		}

		//location_markers[element.geo_data.location_id] = marker; // stable
		app.map.location_markers[element.location_id] = marker; // testing
	}

	/**
	 * Adds a marker when user enters an answer for a new location.
	 * @param {Object} obj           Data
	 * @param {Number} aeusserung_id Submited Answer Id
	 */
	add_user_marker(obj, aeusserung_id) {

		var coordinates = app.map.geo_manager.parseGeoDataFormated(obj.centerCoordinates).geoData;
		var infoWindowOrtsname = obj.name;
		var concept = obj.concept;
		var concept_id = obj.concept_id;
		var bezeichnung = obj.bezeichnung;
		var aeusserung_id = aeusserung_id;
		var location_id = obj.location_id;


		var greenIcon = new L.Icon({
			iconUrl: url.plugins_Url + "assets/images/marker-icon-2x-green.png",
			shadowUrl: url.plugins_Url + "assets/images/marker-shadow.png",
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		var markerSelected = L.marker([coordinates.lat, coordinates.lng], { icon: greenIcon }).bounce(2);

		markerSelected.addTo(this.map);

		markerSelected.location_id = location_id;
		markerSelected.location_name = infoWindowOrtsname;

		/*close all other infowindows*/
		app.map.closeAllInfoWindows();

		this.user_input_marker = markerSelected; /*global user_input_marker*/

		var infoWindowContent = [
			"<div class='inputWrapper'>",
			"" + this.translateInfoWindowText(infoWindowOrtsname, concept, bezeichnung, app.manager.user_data.current_user) + "<br>",
			"<div id='dialect_wrapper'><span id='i_span_2' style='display:inline-block'>" + app.manager.getTranslation("the_word_dialect") + ":&nbsp;" + "</span>" + "<div id='dialect_infowindow' data-submited-answer=" + aeusserung_id + " style='display:inline-block'>" + app.manager.selected_dialect + "</div></div>",
			"<div class='infbtnwrapper'>",
			"<button style='display:inline-block;margin-right:5px;' id='edit_input' type='button' class='ifw_change_dialect btn btn-primary btn-sm'>" + app.manager.getTranslation("change_answer") + " " + "</button>",
			"<button style='display:inline-block;' id='change_dialect' type='button' class='ifw_change_dialect btn btn-primary btn-sm'>" + app.manager.getTranslation("change_dialect") + "</button>",
			"</div>"
		].join("");

		var contentNode = jQuery(infoWindowContent)[0];

		var popup = L.popup().setContent(contentNode);


		markerSelected.on('popupopen', function() {

			var content = jQuery(popup.getContent());

			content.find('#change_dialect').on('click', function() {
				app.manager.info_window_dialect_change = true;
				app.map.current_infowindow = popup;
				app.loader.get_dialects(function() { app.ui.openDialectModal(); });
			});

			content.find('#edit_input').off('click').on('click', function() {
				//editInputA(infoWindowOrtsname,concept,bezeichnung,aeusserung_id/*,concept_id,infowindow,true,location_id*/);
				app.map.info_window_answer_change = true;
				app.ui.editInputA(aeusserung_id, concept_id, location_id, concept);
				app.map.marker_to_change = markerSelected;
			});

		});

		markerSelected.on('popupclose', function() {
			markerSelected.remove();
		});


		setTimeout(function() { markerSelected.bindPopup(popup).openPopup(); }, 500);

	}


	/**
	 * After Choosing a locations from the location data tables. Get the location's polygon and display it. When location is choosen show polygon will check if this location's polygon exists else it will get it from the database
	 * @param  {String} g_location    [description]
	 * @param  {Number} g_location_id [description]
	 * @param  {Number} index         [description]
	 *
	 */
	showPolygon(g_location, g_location_id, zoom_active) {
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
						displayTooltips(true);
					}, 2000);
				}

			}
		}); //ajax end

	}


	/**
	 * [chooseGemiendeOutsideOfAlpineConvention description]
	 * @return {void} [description]
	 */
	chooseGemiendeOutsideOfAlpineConvention() {

	  // map.setOptions({ draggableCursor: 'crosshair' });
	  jQuery('#location_span').attr('data-content', app.manager.getTranslation("click_on_location")); // click_on_location 'Click your location on the map.'

	  if (app.ui.choosing_location_mode) {


	    L.DomUtil.addClass(this.map._container, 'crosshair-cursor-enabled');
	    // event_choose_loc = map.on("click", function(event) {

	    if (!app.ui.inside_location_listener_added) {

	      this.map.on("click", function(event) {

	        if (app.ui.choosing_location_mode) {
	          var latitude = event.latlng.lat;
	          var longitude = event.latlng.lng;
	          app.loader.get_location_and_display(latitude, longitude);
	          app.ui.inside_location_listener_added = true;
	        }

	      });
	    }
	  }
	}


	/**
	 * [closeAllInfoWindows description]
	 * @param  {var} location_infoWindow_only [description]
	 * @return {void}                          [description]
	 */
	closeAllInfoWindows(location_infoWindow_only) {
		this.map.closePopup();
	}


	/**
	 * [translateInfoWindowText description]
	 * @param  {String} ort         [description]
	 * @param  {String} concept     [description]
	 * @param  {String} bezeichnung [description]
	 * @param  {String} author      [description]
	 * @return {String}             [description]
	 */
	translateInfoWindowText(ort, concept, bezeichnung, author) {
		var text = '';

		if (app.manager.user_data.current_user.localeCompare(author) != 0) {

			var string = author;
			var substring = "anonymousCrowder_";

			if (string.indexOf(substring) == 0) {
				author = crowder[current_language];

			}

			switch (app.manager.current_language) {
				case 0:
					text = "In " + ort + " sagt " + author + " zu<br> <span id='i_span_2'>" + concept + ": </span>" + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
					break;
				case 1:
					text = "À " + ort + ", pour <span id='i_span_2'>" + concept + "</span> " + author + " dit:<br> " + " " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
					break;
				case 2:
					text = "A " + ort + ", per  <span id='i_span_2'>" + concept + "</span> " + author + " dice:<br> " + " " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
					break;
				case 3:
					text = "V " + ort + " " + author + " reče za<br> <span id='i_span_2'>" + concept + ": </span>" + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
					break;
			}
		} else {

			switch (app.manager.current_language) {
				case 0:
					text = "Ihre Antwort:<br>" + "In " + ort + " sagt man zu <br><span id='i_span_2'>" + concept + ": </span>" + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
					break;
				case 1:
					text = "Votre réponse:<br>" + "À " + ort + ", pour <br><span id='i_span_2'>" + concept + ": </span> on dit " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
					break;
				case 2:
					text = "La vostra risposta: <br>" + "A " + ort + ", per <br><span id='i_span_2'>" + concept + ": </span> si dice " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
					break;
				case 3:
					text = "Vaš odgovor:<br>" + "V " + ort + " se reče za <br><span id='i_span_2'>" + concept + ": </span> " + "<span id='i_span_1'>\"" + bezeichnung + "\"</span>";
					break;
			}
		}
		return text;
	}


	/**
	 * [addCircleMarker description]
	 * @param {Object} position [description]
	 * @param {String} label    [description]
	 * @param {String} color    [description]
	 */
	addCircleMarker(position, label, color) {

		var image = app.map.create_marker_image(label, color);

		var zIndex = 1 - parseInt(label);

		var texture = PIXI.Texture.from(image, { width: image.width / 2, height: image.height / 2 });


		var marker = new this.pixioverlay.pixiMarker({
			latlng: [position.lat, position.lng],
			zIndex: zIndex,
			texture: texture,
			interactive: true,
			alpha: 1.0,
			clickListener: function() {
				app.map.closeAllInfoWindows();
				app.manager.checkDataBeforeListModal(marker);
			}
		});

		return marker;
	}


	/**
	 * [change_marker description]
	 * @param  {Object} marker [description]
	 * @param  {Number} number [description]
	 * @param  {String} color  [description]
	 * @return {void}        [description]
	 */
	change_marker(marker, number, color) {

		var label = (parseInt(marker.aeusserungen_count) + (number)).toString();
		var color;
		var position = { lat: marker.latlng[0], lng: marker.latlng[1] };

		marker.aeusserungen_count = label;

		var num_entries = app.manager.check_for_entries(marker.location_id);
		var cur_user_entries = app.manager.check_for_current_user_entries(marker.location_id);

		this.pixioverlay.removeMarker(marker);

		if (num_entries <= 0) {
			delete app.map.location_markers[marker.location_id];

		} else if (cur_user_entries <= 0) {
			color = "blue";

			var new_marker = app.map.addCircleMarker(position, label, color);
			new_marker.location_id = marker.location_id;
			new_marker.aeusserungen_count = marker.aeusserungen_count;
			new_marker.location_name = marker.location_name;
			new_marker.user_marker = false;
			app.map.location_markers[marker.location_id] = new_marker;

		} else if (cur_user_entries > 0) {

			color = "green";

			var new_marker = app.map.addCircleMarker(position, label, color);
			new_marker.location_id = marker.location_id;
			new_marker.aeusserungen_count = marker.aeusserungen_count;
			new_marker.location_name = marker.location_name;
			new_marker.user_marker = true;
			app.map.location_markers[marker.location_id] = new_marker;

		}

		this.pixioverlay.completeDraw();
	}


	/**
	 * [create_marker_image description]
	 * @param  {String} label [description]
	 * @param  {String} color [description]
	 * @return {var}       [description]
	 */
	create_marker_image(label, color) {

		var size;

		if (label.length == 1) size = 24;
		else if (label.length == 2) size = 32;
		else size = 40;

		//sizes will be doubled and then scaled down again by gmap 

		var number = parseInt(label);
		var add = Math.floor(number / 4);
		size += add;

		if (size > 50) size = 50; //max size = 50px;
		size *= 2; //multiply size for double size image for better quality

		var canvas = document.createElement('canvas');
		var context = canvas.getContext("2d");

		canvas.width = size;
		canvas.height = size;
		var centerX = canvas.width / 2;
		var centerY = canvas.height / 2;
		var radius = (size / 2) - 2; //-2 for half stroke width

		var fillcolor = "rgba(0,0,139,0.88)";
		var strokecolor = "#3366ff"

		if (color == "green") {
			fillcolor = "rgba(0,100,0,0.88)";
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

		var y = (size / 2);

		if (color == "blue") {
			context.fillStyle = '#7396ff';
		} else {
			context.fillStyle = '#2BBF17';
		}

		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(label, centerX, y);

		return canvas;
	}


	/**
	 * [change_feature_style description]
	 * @param  {var}  current_feature [description]
	 * @param  {Boolean} has_aesserungen [description]
	 * @return {void}                  [description]
	 */
	change_feature_style(current_feature, has_aesserungen) {

		this.pixioverlay.removePolygonOrLine(current_feature);
		if (has_aesserungen) {
			this.old_feature = app.map.addPixiPolygon(current_feature.originalPolygon, current_feature.originalType, "0x009900", "0x009900", 0.1);
			this.old_feature['selected'] = current_feature['selected'];
			this.old_feature['location'] = current_feature['location'];
		} else {
			this.old_feature = app.map.addPixiPolygon(current_feature.originalPolygon, current_feature.originalType, "0x0000ff", "0x0000ff", 0.1);
			this.old_feature['selected'] = current_feature['selected'];
			this.old_feature['location'] = current_feature['location'];
		}
		this.pixioverlay.completeDraw();
	}


	/**
	 * [isMobile description]
	 * @return {Boolean} [description]
	 */
	isMobile() {
		var isMobile = false; //initiate as false
		// device detection
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
			isMobile = true;
		}
		return isMobile;
	}

	/**
	 * [getKeyByValue description]
	 * @param  {Object} object [description]
	 * @param  {var} value  [description]
	 * @return {Object}        [description]
	 */
	getKeyByValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}


	/**
	 * [calculateCenter description]
	 *
	 */
	calculateCenter() {
		this.center = this.map.getCenter();
	}


}

class Map {
	constructor(options) {
		this.map = L.map('map', options).setView([45.483678, 11.410439], 6);

	}


}