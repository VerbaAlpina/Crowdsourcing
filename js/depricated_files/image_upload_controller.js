/**
 * Image Upload Controller, Funtionalities enabling the frontend import of images
 *
 * @module Image Uploader
 */


function open_upload_image_modal() {
	jQuery("#image_modal").modal('hide')
	jQuery('#upload_image_modal').modal('show')


}

/**
 * Global Object for the FormData
 */
var fd

/**
 * Initialize Form for Image Upload
 * Adding event Listeners for drag, drop, ect Events to prevent default 
 *
 */
function init_image_upload_form() {
	fd = new FormData(jQuery('#image_upload_form')[0]);

	dropArea = document.getElementById('drop-area')
	gallery = document.getElementById('gallery')

	events = ['dragenter', 'dragover', 'dragleave', 'drop']
	events_enter_over = ['dragenter', 'dragover']
	events_leave_drop = ['dragleave', 'drop']

	/**
	 * Event handling for image drag and drop
	 */
	events.map(eventName => {
		dropArea.addEventListener(eventName, preventDefaults, false)
	})

	events_enter_over.map(eventName => {
		dropArea.addEventListener(eventName, highlight, false)
		gallery.addEventListener(eventName, highlight, false)
	})

	events_leave_drop.map(eventName => {
		dropArea.addEventListener(eventName, unhighlight, false)
		gallery.addEventListener(eventName, unhighlight, false)
	})


	dropArea.addEventListener('drop', handleDrop, false)

	jQuery("#fileElem").change(function() {
		console.log("Image selected")
	});

	jQuery("#upload_images").on("click", function() {
		var selected_concept_id = jQuery("#word_span").attr("data-id_concept")

		/**
		 * check if user accepts terms and has selected images for upload
		 */
		if (jQuery("#accept_req_image_upload").is(":checked") && fd.getAll('image_data[]').length > 0) {
			upload_images(selected_concept_id);
			jQuery('#drop-area-overlay').css('display','flex');

		} else if(fd.getAll('image_data[]').length == 0){

			jQuery('.message_modal_content').text(select_image_alert[current_language]);
			jQuery('#message_modal').modal({
				keyboard:true,
				backdrop:"dynamic"
			});
		} else if (jQuery("#accept_req_image_upload").is(":not(:checked)")) {

			jQuery('.message_modal_content').text(accept_upload_terms_alert[current_language]);
			jQuery('#message_modal').modal({
				keyboard:true,
				backdrop:"dynamic"
			});
		}

	})

	jQuery("#upload_image_modal").on('hidden.bs.modal', function() {
		// reset all input		
		var file_input = jQuery("#fileElem");
		reset_input(file_input)
	})

	jQuery("#upload_image_modal").on('show.bs.modal', function(){
		// update title for image upload modal
		selected_concept_id = jQuery("#word_span").attr("data-id_concept")
		concept_name = "<b>" + concepts_index_by_id[selected_concept_id].name + "</b>"
		task_text = upload_task_text[current_language].split("{Konzept}")
		task_text = task_text[0] + " " + concept_name + " " + task_text[1]
		jQuery(this).find(".modal-title").html(task_text) // "Zum " + "<b>" + concepts_index_by_id[selected_concept_id].name + "</b>" + " fehlen uns noch Bilder. Hier können Sie Ihre eigene Bilde hochladen und zum Projekt beitragen." 
	})


	jQuery(".button_select_files").text(upload_text[current_language])

	var accept_terms = upload_terms_text[current_language].replace('CC BY SA 4.0', '<a target="_blank" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY SA 4.0</a>');
	jQuery("#accept_terms_label").html(accept_terms);

	jQuery("#upload_images").text(upload_image_text[current_language])
	jQuery("#close_modal").text(close_modal_text[current_language])
}

function preventDefaults(e) {
	e.preventDefault()
	e.stopPropagation()
}

function highlight(e) {
	dropArea.classList.add('highlight')
	jQuery(".button_select_files").text(drop_file_text[current_language])
}

function unhighlight(e) {
	dropArea.classList.remove('highlight')
	jQuery(".button_select_files").text(upload_text[current_language])

}

function handleDrop(e) {
	var dt = e.dataTransfer
	var files = dt.files

	jQuery("#loading_images").css("display", "block")
	handleFiles(files)
}

/**
 * @param  {Files} files Input Images
 */
function handleFiles(files) {
	form_input = jQuery("#fileElem")

	files = [...files]
	// only add valid files that are images
	files = files.filter(check_image)

	files.forEach(function(file) {
		fd.append('image_data[]', file);
	})

	files.forEach(previewFile)

	if(jQuery("#erase_upload_images").length == 0){
		var del_button = jQuery("<button id='erase_upload_images'  class='btn-sm btn-outline-danger'></button").text(clear_images[current_language]);

		del_button.on("click", function(){
			reset_input(jQuery("#fileElem"))
		})

		del_button.insertAfter(jQuery("#gallery"))

	}
	jQuery("#loading_images").css("display", "none")

}

var allowed_image_types = ["image/png", "image/jpeg", "image/tiff"];

function check_image(file) {
	return allowed_image_types.includes(file.type);
}

/**
 * Display a preview of images selected for upload.
 * @param  {File} file Image to be dispayed
 */
function previewFile(file) {
	var reader = new FileReader()
	reader.readAsDataURL(file)
	reader.onloadend = function() {
		img = document.createElement('img')
		img.src = reader.result
		document.getElementById('gallery').appendChild(img)
	}
}

/**
 * Send Ajax call with image data form - to upload image to server.
 * @param  {Int} selected_concept_id [description]
 */
function upload_images(selected_concept_id) {

	fd.set('action', "upload_image");
	fd.set('selected_concept_id', selected_concept_id);
	uploading = true;
	jQuery.ajax({
		type: 'POST',
		url: ajax_object.ajax_url,
		data: fd,
		processData: false,
		contentType: false,
		success: function(data) {
			
			reset_input(jQuery("#fileElem"))

			jQuery("#gallery").empty()
			var thanks_div = jQuery('<div class="successful_upload"></div>').text(upload_complete[current_language])
			jQuery("#gallery").append(thanks_div);
			jQuery('#drop-area-overlay').fadeOut('slow');
			uploading = false;
			setTimeout(function() {thanks_div.fadeOut(
												function(){
													jQuery('#upload_image_modal').modal('hide');
													jQuery(this).remove();
												});
										}, 1000);
		},
		error: function(data){
			
			uploading = false;
			reset_input(jQuery("#fileElem"))

			jQuery("#gallery").empty()
			var thanks_div = jQuery('<div class="fail_upload"></div>').text(upload_failed[current_language])
			jQuery("#gallery").append(thanks_div)
		}
	});

}

/**
 * Reset the form, clear any existing values.
 * @param  {Node} element HTML Element
 */
function reset_input(element) {
	fd.delete("image_data[]");

	element.wrap('<form>').closest('form').get(0).reset();
	element.unwrap();

	element.replaceWith(element.val('').clone(true));
	fd = new FormData(jQuery('#image_upload_form')[0]);
	jQuery("#gallery").empty()

	if(jQuery("#erase_upload_images").length != 0){
		jQuery("#erase_upload_images").remove()
	}
}