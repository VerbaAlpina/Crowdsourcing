Wordpress crowdsourcing plugin.

As part of the VerbaAlpina version control concept all of its modules are archived in periodic intervals. To get an older executable version of the software please pull the commit marked with the respective version number.

The current version is 22/2.

## Crowdcourcing Tool for  [VerbaAlpina](https://www.verba-alpina.gwi.uni-muenchen.de/)

### Installation Instructions:

1. Copy Plugin Folder in the "plugins" Directory of your Wordpress Installation.
2. Specify the Database connection in va_crowdsourcing-lib.php
2. Activate Plugin From the Admin Page
3. Add template_plugin_frontend.php to your active Theme Folder
3. Create a Page, on with the CS Tool will be displayed
4. Add shortcode to the page: "[initMenu]"
5. Set the Page Template to "Plugin Fullscreen Template CS" and Save the Page


### Plugin Structure:
#### Backend
##### va_crowdsourcing.php :
 Initialization of Plugin - Loading Scripts
##### va_crowdsourcing-lib.php :
 Manages Frontend Scripts and Styles Register/Enques, Establishes Database Connection
##### handle_ajax.php :
 Handles main logic, Registers and Handles all Action And Filter Hooks

#### Frontend
##### app_manager.js: 
App Instance, containing and initializing each App Element
##### data_loader.js: 
Handles all AJAX calls
##### data_manager.js: 
Contains Main Logic and Data Handling
##### ui_controller.js: 
UI/UX and Image Uploading Logic
##### map_controller.css:
All map-related logic, visualization

