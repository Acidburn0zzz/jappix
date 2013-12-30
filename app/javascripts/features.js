/*

Jappix - An open social platform
This is the server features JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Bundle
var Features = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


	/**
     * Gets the features of a server
     * @public
     * @return {undefined}
     */
    self.get = function() {

        /* REF: http://xmpp.org/extensions/xep-0030.html */

        try {
            // Get the main values
            var to = Utils.getServer();
            var caps = con.server_caps;
            var xml = null;
            
            // Try to get the stored data
            if(caps)
                xml = Common.XMLFromString(
                    DataStore.getPersistent('global', 'caps', caps)
                );
            
            // Any stored data?
            if(xml) {
                self.handle(xml);
                
                Console.log('Read server CAPS from cache.');
            }
            
            // Not stored (or no CAPS)!
            else {
                var iq = new JSJaCIQ();
                
                iq.setTo(to);
                iq.setType('get');
                iq.setQuery(NS_DISCO_INFO);
                
                con.send(iq, Caps.handleDiscoInfos);
                
                Console.log('Read server CAPS from network.');
            }
        } catch(e) {
            Console.error('Features.get', e);
        }

    };


    /**
     * Handles the features of a server
     * @public
     * @param {string} xml
     * @return {boolean}
     */
    self.handle = function(xml) {

        try {
            // Selector
            var selector = $(xml);
            
            // Functions
            var check_feature_fn = function(namespace) {
                return selector.find('feature[var="' + namespace + '"]').size() > 0 ? true : false;
            };

            // Markers
            var namespaces = [NS_PUBSUB, NS_PUBSUB_CN, NS_URN_MAM, NS_COMMANDS, NS_URN_CARBONS];

            var cur_feature;
            var features = {
                'pep': (selector.find('identity[category="pubsub"][type="pep"]').size() && true)
            };

            $.each(namespaces, function(n, namespace) {
                features[namespace] = check_feature_fn(namespace);

                if(features[namespace] === true) {
                    self.enable(namespace);
                }
            });
            
            // Enable the pep elements if available
            if(features.pep === true) {
                // Update our database
                self.enable('pep');
                
                // Get the PEP nodes to initiate
                Microblog.getInit();
                PEP.getInitGeoloc();
                
                // Get the notifications
                Notification.get();
                
                // Geolocate the user
                PEP.geolocate();
                
                // Enable microblogging send tools
                Microblog.wait('sync');
                $('.postit.attach').css('display', 'block');
                
                Console.info('XMPP server supports PEP.');
            } else {
                Microblog.wait('unsync');
                
                Console.warn('XMPP server does not support PEP.');
            }

            // Hide the private life fieldset if nothing to show
            if(features.pep === false && features[NS_URN_MAM] === false) {
                $('#options fieldset.privacy').hide();
            }
            
            // Apply the features
            self.apply('talk');
            
            // Process the buddy-list height
            if(features.pep === true) {
                Roster.adapt();
            }

            // Enable Message Carbons?
            if(features[NS_URN_CARBONS] === true) {
                Carbons.enable();
            }
        } catch(e) {
            Console.error('Features.handle', e);
        } finally {
            return false;
        }

    };


    /**
     * The function to apply the features to an element
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.apply = function(id) {

        try {
            // Path to the elements
            var path = '#' + id + ' .';
            
            // PEP features
            if(self.enabledPEP()) {
                $(path + 'pep-hidable').show();
            }
            
            // PubSub features
            if(self.enabledPubSub()) {
                $(path + 'pubsub-hidable').show();
            }

            // PubSub Config-Node features
            if(self.enabledPubSubCN()) {
                $(path + 'pubsub-hidable-cn').show();
            }
            
            // MAM features
            if(self.enabledMAM()) {
                $(path + 'mam-hidable').show();
                $(path + 'mam-showable').hide();
            }
            
            // Commands features
            if(self.enabledCommands()) {
                $(path + 'commands-hidable').show();
            }
            
            // XMPP links (browser feature)
            if(navigator.registerProtocolHandler) {
                $(path + 'xmpplinks-hidable').show();
            }
        } catch(e) {
            Console.error('Features.apply', e);
        }

    };


    /**
     * Enables a feature
     * @public
     * @param {string} feature
     * @return {undefined}
     */
    self.enable = function(feature) {

        try {
            DataStore.setDB(Connection.desktop_hash, 'feature', feature, 'true');
        } catch(e) {
            Console.error('Features.enable', e);
        }

    };


    /**
     * Checks if a feature is enabled
     * @public
     * @param {string} feature
     * @return {boolean}
     */
    self.isEnabled = function(feature) {

        try {
            return DataStore.getDB(Connection.desktop_hash, 'feature', feature) === 'true';
        } catch(e) {
            Console.error('Features.isEnabled', e);
        }

    };


	/**
     * Returns the XMPP server PEP support
     * @public
     * @return {boolean}
     */
    self.enabledPEP = function() {

        try {
            return self.isEnabled('pep');
        } catch(e) {
            Console.error('Features.enabledPEP', e);
        }

    };


    /**
     * Returns the XMPP server PubSub support
     * @public
     * @return {boolean}
     */
    self.enabledPubSub = function() {

        try {
            return self.isEnabled(NS_PUBSUB);
        } catch(e) {
            Console.error('Features.enabledPubSub', e);
        }

    };


    /**
     * Returns the XMPP server PubSub Config-Node support
     * @public
     * @return {boolean}
     */
    self.enabledPubSubCN = function() {

        try {
            return self.isEnabled(NS_PUBSUB_CN);
        } catch(e) {
            Console.error('Features.enabledPubSubCN', e);
        }

    };


    /**
     * Returns the XMPP server MAM support
     * @public
     * @return {boolean}
     */
    self.enabledMAM = function() {

        try {
            return self.isEnabled(NS_URN_MAM);
        } catch(e) {
            Console.error('Features.enabledMAM', e);
        }

    };


    /**
     * Returns the XMPP server Carbons support
     * @public
     * @return {boolean}
     */
    self.enabledCarbons = function() {

        try {
            return self.isEnabled(NS_URN_CARBONS);
        } catch(e) {
            Console.error('Features.enabledCarbons', e);
        }

    };


    /**
     * Returns the XMPP server commands support
     * @public
     * @return {boolean}
     */
    self.enabledCommands = function() {

        try {
            return self.isEnabled(NS_COMMANDS);
        } catch(e) {
            Console.error('Features.enabledCommands', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();