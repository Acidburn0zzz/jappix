/*

Jappix - An open social platform
These are the popup JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Popup = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


	// Creates a popup code
	function createPopup(id, content) {
		// Popup exists?
		if(exists('#' + id))
			return false;
		
		// Popop on top of another one?
		var top_of = exists('div.lock:has(div.popup)');
		
		// Append the popup code
		$('body').append(
			'<div id="' + id + '" class="lock removable">' + 
				'<div class="popup">' + 
					content + 
				'</div>' + 
			'</div>'
		);
		
		// Avoids darker popup background (if on top of another popup)
		if(top_of)
			$('#' + id).css('background', 'transparent');
		
		// Attach popup events
		launchPopup(id);
		
		return true;
	}

	// Destroys a popup code
	function destroyPopup(id) {
		// Stop the popup timers
		$('#' + id + ' *').stopTime();
		
		// Remove the popup
		$('#' + id).remove();
		
		// Manage input focus
		inputFocus();
	}

	// Attaches popup events
	function launchPopup(id) {
		// Click events
		$('#' + id).click(function(evt) {
			// Click on lock background?
			if($(evt.target).is('.lock:not(.unavoidable)')) {
				// Destroy the popup
				destroyPopup(id);
				
				return false;
			}
		});
	}







	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();