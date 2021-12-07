<?php

add_shortcode('initMenu', 'initMenu');
function initMenu(){
?>
<style>
#content{
	height: 100%;
    width: 100%;
    left: 0;
    position: absolute;
    top: 0;  
}

</style>
<!--<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css" />-->

<span class="highscoreicon fa-stack" id="showhighscore">
<i style="opacity: 0.8; color: #2b2b2b;font-size: 41px;" class="fa fa-circle  fa-stack-1x" aria-hidden="true"></i>
<i style="font-size: 44px;" class="fa fa-circle-thin fa-stack-1x" aria-hidden="true"></i>
<i style="font-size: 23px; padding-left:5px;padding-top: 4px;" class="fa fa-trophy fa-stack-2x" aria-hidden="true"></i>
</span>

<span class="highscoreicon fa-stack" id="shareicon">
<i style="opacity: 0; color: #2b2b2b;font-size: 41px;" class="fa fa-circle  fa-stack-1x" aria-hidden="true"></i>
<i style="font-size: 44px;" class="fa fa-circle-thin fa-stack-1x" aria-hidden="true"></i>
<i style="font-size: 23px; padding-left:3px;padding-top: 3px;" class="tb_icon fa fa-share-alt" aria-hidden="true"></i>
</span>


<span class="highscoreicon fa-stack" id="helpicon">
<i style="opacity: 0; color: #2b2b2b;font-size: 41px;" class="fa fa-circle  fa-stack-1x" aria-hidden="true"></i>
<i style="font-size: 44px;" class="fa fa-circle-thin fa-stack-1x" aria-hidden="true"></i>
<i style="font-size: 23px; padding-left:5px;padding-top: 3px;" class="tb_icon fa fa-question" aria-hidden="true"></i>
</span>

<div id="custom_backdrop"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i></div>

<div id="map"></div>
<div id="swipe-up-div"></div>
<div id="fake_arrow" class="arrow"></div>
<!-- <div id="testdiv"></div> -->
<div style="position:absolute;top:0;right:0" id="top_right">
 <?php echo do_shortcode("[lwa profile_link=\"0\" ]"); ?> <!--Register And Login/out !!!!!!!!!!!!!!!!!!!!!!!!!!! -->
</div>

<!--DIALECT-->
<!-- <div id="user_dialect_container">
<div id="user_dialect"></div>
</div> -->

<!--END DIALECT-->

<div id="left_menu" class="question_div arrow">

<div id="user_dialect_container">
<i id="choose_dialect-icon" class="fa fa-chevron-down" aria-hidden="true"></i> <div id="user_dialect"></div>
</div>


<!-- 
<div  id="log_in_div"></div>
<div style="display:inline-block;"> -->
<?php //echo wp_get_current_user()->display_name;?>
<!-- </div> -->



</div>

	<?php global $va_xxx;
		$questions = $va_xxx->get_row('SELECT Begriff_D, Begriff_I, Begriff_F, Begriff_S FROM uebersetzungen WHERE Schluessel = "CS_EINGABE"', ARRAY_A);
		$pls = $va_xxx->get_row('SELECT Begriff_D, Begriff_I, Begriff_F, Begriff_S FROM uebersetzungen WHERE Schluessel = "CS_PLACEHOLDER"', ARRAY_A);
	
		foreach (['D' => 'ger', 'F' => 'fr','I' => 'ita', 'S' => 'slo'] as $lang => $lang_str){
			$question = $questions['Begriff_' . $lang];
			
			$start1 = mb_strpos($question, '$');
			$end1 = mb_strpos($question, ' ', $start1);
			$start2 = mb_strpos($question, '$', $end1);
			
			?>
			  <div id="left_menu_content_<?php echo $lang_str;?>" style="display: none">
				<div class="row_1">
					<span><?php echo mb_substr($question, 0, $start1); ?></span><span id="word_span" class="questionselect"><?php echo mb_substr($question, $start1 + 1, $end1 - $start1 - 1); ?></span>
					<div class="l_row"><?php echo mb_substr($question, $end1, $start2 - $end1); ?><span id="in_q_span"><span id="location_span" class="questionselect"><?php echo mb_substr($question, $start2 + 1, -1); ?></span> ?</span></div>
				</div>
				<div class="row_2">
					<div class="user_input_container"><span><input type="text" id="user_input" placeholder="<?php echo $pls['Begriff_' . $lang]; ?>"></input><i id="submitanswer" class="fa fa-chevron-right" aria-hidden="true"></i></span></div>
				</div>
			  </div>
			<?php
		}
	?>



<div class="modal welcome_modal" id="welcome_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="cover_body"></div>
     <div class="modal-body">
 
         <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>

         <div id="first_slider" class="carousel slide" data-ride="carousel" data-interval="false">

          <ol class="carousel-indicators findicators">
            <li data-target="#first_slider" data-slide-to="0" class="active"></li>
            <li data-target="#first_slider" data-slide-to="1"></li>
          </ol>

          <div class="carousel-inner" role="listbox">
            <div class="carousel-item active">
             <!--  <img src="./assets/images/Alps.jpg" alt="First slide"> -->
             <div class ="c_fake_body"></div>
               <div class="carousel-caption first-info">
              <h1 class="h1_smaller" id="modal_welcome" lang_id="0">Willkommen.</h1>
              <p id="slogan_id"  lang_id="0">Sprich die Sprache der Alpen!</p>

                <div id="navigation_languages">Navigationssprache</div>
                
                <div class="outerselect-container">
                <select id="language_select" class="customselect">
                  <option  class="customoption"> ...</option>
                  <option  class="customoption"> Deutsch</option>
                  <option  class="customoption"> Français </option>
                  <option  class="customoption"> Italiano</option>
                  <option  class="customoption"> Slovenščina</option>
                </select>
                <span class="switch_page_icon">
                <i class="fa fa-chevron-right" aria-hidden="true"></i>
                </span>
                </div>

            </div>
            </div>
            <div class="carousel-item">
            <div class="c-back-button"><i class="fa fa-chevron-left" aria-hidden="true"></i></div>
              <!-- <img src="./assets/images/Alps.jpg" alt="Second slide"> -->
                <div class ="c_fake_body"></div>
                 <div class="carousel-caption  c-caption-top">
                <div class="infotext_container">
                  <h3 class="infotext_head">Anleitung</h3>
                  <div class="text-left-span">
                  </div>
                 </div>

                    <div class="startbutton_container">
                      <div class="inner_startbutton_container">
                        <button type="button" class="startbutton" id="dialect_btn" ><span id="dialekt_span">Dialekt</span><div class="starticoncontainer"><i class="fa fa-chevron-down starticon" aria-hidden="true"></i></div></button>

                        <button type="button" id="start_tool" class="startbutton"><span id="go_span">Los geht's</span><div class="starticoncontainer"><i class="fa  fa-chevron-right starticon" aria-hidden="true"></i></div></button>
                      </div>
                    </div>
            </div>


            <a id="remark_link" href=""><div id="data_remark"> Datenschutz</div></a> 
            </div>
          </div>
  <!--        <a class="left carousel-control" href="#first_slider" role="button" data-slide="prev">
            <span class="icon-prev" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
          </a>
          <a class="right carousel-control" href="#first_slider" role="button" data-slide="next">
            <span class="icon-next" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
          </a> -->
        </div>

      </div><!-- /.modal-body -->
      <div class="modal-footer customfooter"></div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  

<!--The Dialect Modal-->
<div class="modal fade list_modal" id="dialect_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
      <div class="modal-body">

       <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>

          <div class = "listbody"> 

            <table id="dialect_modal_table" class="display nowrap" cellspacing="0" width="100%">
              <thead>
                  <tr>
                      <th>Name</th>
                  </tr>
              </thead>
          </table>


      </div>
        </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->


<div class="modal list_modal" id="locations_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
      <div class="modal-body">

       <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>

          <div class = "listbody"> 

            <table id="location_modal_table" class="display nowrap" cellspacing="0" width="100%">
              <thead>
                  <tr>
                      <th>Name</th>
                  </tr>
              </thead>
          </table>


      </div>
        </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->


<div class="modal list_modal" id="concepts_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
      <div class="modal-body">

       <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>

          <div class = "listbody"> 

            <table id="concept_modal_table" class="display nowrap" cellspacing="0" width="100%">
              <thead>
                  <tr>
                      <th>Name</th>
                  </tr>
              </thead>
          </table>


      </div>
        </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->


<div class="modal list_modal fade" id="location_list_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
      <div class="modal-body">

       <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>

          <div class = "listbody"> 

            <table id="location_list_table" class="display nowrap" cellspacing="0" width="100%">
              <thead>
                  <tr>
                      <th>Name</th> <th>Word</th> <th>Author</th> <!-- <th>Hidden</th> -->
                  </tr>
              </thead>
          </table>

          </div>

        </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->





<div class="modal fade" id="image_modal" data-backdrop="false">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">

      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
       
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  


<div class="modal fade" id="message_modal" data-backdrop="false">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">
      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
       <p class="message_modal_content">TEXT AUSTAUSCHEN</p>
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  


<div class="modal fade" id="language_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">
      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
       <div class="language_modal_content">
        
        <div>Bitte wählen Sie eine Sprache aus!</div> 
         <div>Sélectionnez une langue, s´il vous plaît!</div> 
          <div>Scegliete una lingua, per favore!</div> 
           <div>Prosimo, izberite jezik!</div> 

       </div>
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  

<div class="modal fade" id="dialect_not_selected_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">
      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
       <div class="dialect_not_selected_modal_content">
        
        <div>Bitte wählen Sie einen Dialekt aus!</div> 

       </div>
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  

<div class="modal fade" style="z-index: 10000" id="no_anoymous_user_data">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">
      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
       <div class="no_anoymous_user_data_content">
        
        <div id="no_anoymous_user_data_text" style="padding-top:8px">Bitte tragen Sie zuerst Daten auf der Karte ein!</div> 

       </div>
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  


<div class="modal fade" id="input_modal">
  <div class="modal-dialog modal-sm" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">
      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
       <div class="input_modal_content">
        
        <!--<div>Eingabefeld ist leer, bitte  tragen sie Ihre Änderungen ein!</div> -->
        

       </div>
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  


<div class="modal welcome_modal fade" id="welcomeback_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="cover_body"></div>
     <div class="modal-body">
 
         <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>

             <div class ="c_fake_body"></div>
               <div class="carousel-caption welcomeback_container">
              <h1 class="h1_smaller" id="modal_welcomeback" lang_id="0">Willkommen <br> zurück.</h1>
              <i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
            </div>
   

      </div><!-- /.modal-body -->
      <div class="modal-footer customfooter"></div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  


<div class="modal fade" id="highscore_select_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="cover_body"></div>
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">

      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
      <div style ="position: relative;z-index: 3;">
        <div class="select_score_container">
              <div class="select_score_button_container">
                <div id="best_user" class="select_score_list"> Button_1 </div>
                <div id="best_location" class="select_score_list"> Button_2</div>
                <div id="best_concept" class="select_score_list"> Button_3</div>
           </div>
        </div>
      </div>
       
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  


<div class="modal fade" id="share_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <!-- <div class="cover_body"></div> -->  
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">

      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
        <h1 id="share_titel_modal" class="addModalTitel">Share</h1>
        <div style ="position: relative;z-index: 3;">
          <textarea id="share_link" class="addModalTextarea"></textarea>
        </div>
        <div id="social_media">
          <a id="share_facebook" href="https://www.facebook.com/sharer/sharer.php?u=">  <div><i class="fab fa fa-facebook" aria-hidden="true"></i></div></a> <!-- <span> Share on Facebook</span>-->
          <a id="share_twitter" href="https://twitter.com/home?status=">                <div><i class="fab fa fa-twitter"  aria-hidden="true"></i></div></a>   <!-- <span> Share on Twitter</span>   -->
       <!--    <a id="share_googleplus" href="https://plus.google.com/share?url=">           <div><i class="fab fa fa-google-plus" aria-hidden="true"></i></div></a>  -->  <!-- <span> Share on Google+</span>  --> 
          <a id="share_instagram" href="https://www.instagram.com/verba.alpina/">                <div><i class="fab fa-instagram"  aria-hidden="true"></i></div></a>  
          <a id="share_mail" href="mailto:verbaalpina@itg.uni-muenchen.de">               <div><i class="fal fa fa-envelope" aria-hidden="true"></i></div></a>  <!-- <span> Send Email</span>-->
        </div>
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  



<div class="modal fade" id="help_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="help_cover"></div>
    <!-- <div class="cover_body"></div> -->  
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">

      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>

        <h1 id="help_titel_modal" style ="position: relative;" class="addModalTitel">Help <div class="help_modal_show_intro"><i class="fa fa-question" aria-hidden="true"></i><span>Anleitung</span></div></h1>
        <div style ="position: relative;z-index: 3;">

          <div id="help_intro" class="helpanswer"></div>

            <div class="modal_subhead" style="margin-top: 10px;" id="faqs">Frequently Asked Questions</div>

          <ul class="helpanswer"> 
            <li id="faq1"></li>
            <li id="faq2"></li>
            <li id="faq3"></li>
            <li id="faq4"></li>
          </ul>

            <div class="modal_subhead" style="margin-top: 10px;" id="questions_feedback"></div>

          <textarea disabled="true" id="help_text" class="addModalTextarea"></textarea>

             <div class="registerbutton" id="feedbackbutton" style="margin-top: 12px"></div>

        </div>
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  

<div class="modal fade" id="faqAnswerModal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">
      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
       <div class="dialect_not_selected_modal_content">
        
        <div id="currentFAQAnswer">FAQ Antwort</div> 

       </div>
      </div>
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  



<div class="modal list_modal fade" id="toplistmodal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
      <div class="modal-body">

       <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>
       <div class = "highscoreheadline"><i class="fa fa-pagelines leaf_icon_l" aria-hidden="true"></i><span class="highscoreheadlinespan"></span><i class="fa fa-pagelines leaf_icon_r" aria-hidden="true"></i></div>

          <div class = "listbody"> 

            <table id="top_list_table" class="nowrap stripe row-border" cellspacing="0" width="100%">
              <thead>
                  <tr>
                    <th>Rank</th> <th>Name</th> <th>Entry</th>
                  </tr>
              </thead>
          </table>


      </div>
        </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->


<div class="modal fade" id="why_register_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="cover_body"></div>
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">
      <div class = "custom_header"><img src="<?php echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>

    <div style ="position: relative;z-index: 3;">
               <div class=why_register_headline></div>
                <div class=why_register_body></div>
        

      <div class="registerbutton_container"><div class="registerbutton reg_yes"></div><div class="registerbutton reg_no"></div></div>
       
      </div>
        
    </div>   
  
      <div class="modal-footer customfooter">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->  

<div class="modal fade" id="upload_image_modal" data-backdrop="false">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
          <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
      <!--   <button type="button" class="close" data-dismiss="modal" aria-label="Close"> 
          <span aria-hidden="true">&times;</span> -->
        </button>
        <div class="modal-title">Image Upload</div>
        
      </div>
      <div class="modal-body" id="upload_image_body">

        <div id="drop-area">
          <div id="drop-area-overlay"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i></div>
        <form id="image_upload_form"> 
          <input type="file" name="images_input[]" id="fileElem" multiple="multiple" accept="image/*" onchange="app.ui.image_uploader.handleFiles(this.files)">
          <label class="button_select_files" for="fileElem">Click Here to Select Images, or drag and drop them in the box.</label>
          <?php
            wp_nonce_field( "upload_image", "upload_image_wpnonce" );
          ?>  
        </form>
        
        <div id="gallery">
        </div>

        <div>
          <input id="accept_req_image_upload" type="checkbox" name="accept_req_image_upload" value="Check Licensing"> 
          <label for="accept_req_image_upload" id="accept_terms_label" style="display: contents;">Der Nutzer muss vor dem Upload zustimmen, dass er die Rechte an den Bildern hat und sie unter CC BY SA 4.0 zur Verfügung stellt</label>
        </div>

      </div>

      <div>



      </div>

      <div class="modal-footer">
        <button type="button" id="close_modal" class="btn btn-secondary" data-dismiss="modal">Schließen</button>
        <button id="upload_images" type="button" class="btn btn-primary" >Bild Hochladen</button>
      </div>
    </div>
  </div>
</div>

<!-- <div class="image_upload_thumbnail">
  
</div> -->



<!-- <div class="modal fade" id="register_or_anonymous_modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="cover_body"></div>
    <div class="customclose"><i class="fa fa-times" aria-hidden="true"></i></div>
     <div class="modal-body">
      <div class = "custom_header"><img src="<?php //echo plugins_url('assets/images/',__FILE__)?>favicon_bw.png"></img>Verba Alpina </div>

        <div style ="position: relative;z-index: 3;">
         <div class=register_or_anonymous_headline></div>
         <div class=register_or_anonymous_body>
               
          
          <div class="lwa-register" style="display:block;">
          <i class="fa fa-plus" aria-hidden="true" style="color: white;"></i><strong class="slides_reg"> New Account<?php //esc_html_e('Register For This Site','login-with-ajax') ?></strong> 
          <form name="lwa-register"  action="<?php //echo esc_attr(LoginWithAjax::$url_register); ?>" method="post">
                <span class="lwa-status"></span>
            <table class="table-sm">
                      <tr>
                          <td>
                             
                          </td>
                      </tr>
                      <tr class="lwa-username">
                          <td>  
                            <div>
                              <?php //$msg = __('Username','login-with-ajax');//'Username'; ?>
                              <input type="text" class="form-control" name="user_login" id="user_login"  value="<?php //echo esc_attr($msg); ?>" onfocus="if(this.value == '<?php //echo esc_attr($msg); ?>'){this.value = '';}" onblur="if(this.value == ''){this.value = '<?php //echo esc_attr($msg); ?>'}" />
                              </div> 
                          </td>

                      </tr>
                      <tr class="lwa-email">
                          <td>
                            <div>
                              <?php //$msg = __('E-mail','login-with-ajax') ?>
                              <input type="text" class="form-control" name="user_email" id="user_email"  value="<?php //echo esc_attr($msg); ?>" onfocus="if(this.value == '<?php //echo esc_attr($msg); ?>'){this.value = '';}" onblur="if(this.value == ''){this.value = '<?php //echo esc_attr($msg); ?>'}"/>
                              </div>
                          </td>

                      </tr>
                      <tr>
          
                        <td>
                            <button class="register_btn btn" type="submit" value="<?php //esc_attr_e('Register','login-with-ajax'); ?>" tabindex="100" /><i class="fa fa-check" aria-hidden="true"></i> Register</button>
                            <input type="hidden" name="login-with-ajax" value="register" />

                            <button class="send_anonymous_btn btn"  tabindex="100" /><i class="fa fa-check" aria-hidden="true"></i> Anonyme Daten schicken</button>
                          </td>
                      </tr>
                  </table>
          </form>
        </div>

         </div>
        </div>
            
        </div>   
  
      <div class="modal-footer customfooter">
      </div>
    </div>
  </div>
</div>
 -->


<?php
}

