YUI.add('moodle-course-dialogupdate', function (Y, NAME) {

/**
 * The activity setting up and update dialogue for courses.
 *
 * @module moodle-course-dialogupdate
 */

var CSS = {
    PANELCONTENT : '#panelContentUpdate',
    FORMOPPONENT : '#mform1',
    FORMCONTAINER : '#panelContentUpdate #mform1',
    SUBMITBUTTON2: '#panelContentUpdate .hidden  #id_submitbutton2',
    SUBMITBUTTON: '#panelContentUpdate .hidden  #id_submitbutton',
    CANCELBUTTON: '#panelContentUpdate .hidden  #id_cancel',
    CANCELBUTTON2: '#panelContentUpdate .yui3-widget-hd .yui3-button.yui3-button-close',
    COURSEVIEW : '#page-course-view-weeks',
    FORM : 'mform1',
    INITBUTTON : 'a.editing_update.menu-action.cm-edit-action',
    DUPLICATEBUTTON : 'a.editing_duplicate.menu-action.cm-edit-action',
    JSVALIDATE: 'head script[src="http://localhost/moodle/course/moduvjs.js"]',
    JSFORM: 'head script[src="http://localhost/moodle/course/modujs.js"]'
};

var DIALOGNAME = 'course-dialogupdate';

/**
 * The activity setting up and update dialogue for courses.
 *
 * @constructor
 * @class M.course.modchooser
 * @extends Y.Base
 */
var DIALOG = function() {
    DIALOG.superclass.constructor.apply(this, arguments);
};
Y.extend(DIALOG, Y.Base, {
    /**
     * Update reaction on "Save and return to course"
     *
     * @method change_submit
     */
    change_submit: function() {
        Y.on('domready', function() {
            Y.one(CSS.SUBMITBUTTON2).on('click', this.submit_click,this);
        },this);
    },
    /**
     * Reaction on click "Save and return to course",
     * validate form and update course if it's posible
     *
     * @method submit_click
     * @param {event} e event object
     */
    submit_click: function (e) {
        e.preventDefault();
        // Disable submit buttons to say moodle, what action we do.
        Y.one(CSS.CANCELBUTTON).set('disabled', 'disabled');
        if (Y.one(CSS.SUBMITBUTTON) !== null) {
        Y.one(CSS.SUBMITBUTTON).set('disabled', 'disabled');
    }
        // AJAX post form request to server side.
        var cfg = {
            method: "post",
            on: {
                success: this.post_success
            },
            arguments: this,
            form: { id:CSS.FORM}
        };
        Y.io(M.cfg.wwwroot + "/course/modedit.php?isformajax=2", cfg);
    },
    /**
     * Helper function, it handle response of submit form.",
     * if no errors, update course view, else show form with errors.
     *
     * @method post_success
     * @param {Int} id identification number of current transaction
     * @param {object} o response object
     * @param {object} self dialog object
     */
    post_success : function (id, o, self) {
        if(o.responseText.indexOf(CSS.FORM) === -1) {
            var url = document.URL;
            var query = {};
            var a = url.substr(url.search("id")).split('&');
            for (var i in a) {
                var b = a[i].split('=');
                query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
            }
            var cfg = {
                on: {
                    success: self.update_course
                }
            };
            Y.io(M.cfg.wwwroot + "/course/view.php?id=" + query.id, cfg);
        } else {
            self.show_form(id,o);
        }
    },
     /**
     * Helper function, update course view, else show form with errors.
     *
     * @method update_course
     * @param {Int} id identification number of current transaction
     * @param {object} o response object
     */
    update_course : function (id, o) {
        // Update course view
        document.open();
        document.write(o.responseText);
        document.close();
    },
    /**
     * Show form for setting up and update dialogue for courses.
     *
     * @method show_form
     * @param {Int} id identification number of current transaction
     * @param {object} o response object
     */
    show_form: function (x, o) {
        // Remove old panel if it exist
        if (Y.one(CSS.PANELCONTENT) !== null) {
            Y.one(CSS.PANELCONTENT).remove();
        }
        var opponents = Y.all(CSS.FORMOPPONENT);
        for (var i = 0; i < opponents.size(); i++) {
            opponents.item(i).remove();
        }
        if (Y.one(CSS.JSVALIDATE) !== null) {
            Y.one(CSS.JSVALIDATE).remove();
            Y.one(CSS.JSFORM).remove();
        }
        // Create panel and append it to page
        panelContent = Y.Node.create('<div>');
        panelContent.set('id','panelContentUpdate');
        Y.one(CSS.COURSEVIEW).appendChild(panelContent);
        panelContent.setContent(o.responseText);
        Y.one(CSS.FORMCONTAINER).setStyle("height","500");
        Y.one(CSS.FORMCONTAINER).setStyle("overflow","auto");

        // Load addition js libraryes.
        Y.Get.js(M.cfg.wwwroot + "/lib/javascript-static.js");
        Y.Get.js(M.cfg.wwwroot + "/course/moduvjs.js");
        Y.Get.js(M.cfg.wwwroot + "/course/modujs.js");

        // Create panel object
        var panel = new Y.Panel({
            srcNode      : CSS.PANELCONTENT,
            headerContent: 'Edit',
            width        : 1000,
            zIndex       : 5,
            centered     : true,
            modal        : true,
            visible      : false,
            render       : true,
            plugins      : []
        });
        // Move panel down, if it partially visible
        if (Y.one(CSS.PANELCONTENT).getY() < 50) {
            Y.one(CSS.PANELCONTENT).setY(50);
        }
        //Show panel
        panel.show();
        // Set reaction on "Cancel"
        Y.fire('domready');
        Y.one(CSS.CANCELBUTTON).on('click', function (e1) {
            e1.preventDefault();
            panel.hide();
        });
	Y.one(CSS.CANCELBUTTON2).on('click', function (e1) {
            e1.preventDefault();
            panel.hide();
        });
    },
    /**
     * Reaction on click "Save and return to course",
     * validate form and update course if it's posible
     *
     * @method submit_click
     * @param {event} e event object
     * @param {object} self dialogue object
     */
    on_click: function (e,self) {
        e.preventDefault();
        // AJAX request to get information to form
        var url = this.get('href') + '&isformajax=2';
        var cfg = {
            on: {
                success: self.show_form
            },
            arguments: self
        };
        Y.io(url, cfg);
    },
    /**
     * Set up the activity form.
     *
     * @method init
     */
    init : function(){
        M.course.coursebase.register_module(this);
    },
    /**
     * Set up dialog.
     *
     * @method setupDialog
     */
    setupDialog: function(e,c) {
        if(typeof(e) !== 'undefined' && c == Y.all(CSS.INITBUTTON).size()) {
            Y.later(500,this,this.setupDialog,[e,c]);
        }
        else {
            var nodelist = Y.all(CSS.INITBUTTON);
            for (var i = 0; i < nodelist.size(); i++) {
                nodelist.item(i).detach('click');
                nodelist.item(i).on('click',this.on_click,nodelist.item(i),this);
            }
            this.setupDuplicate();
        }
    },
    /**
     * Set up duplicate menu item
     *
     * @method setupDuplicate
     */
    setupDuplicate: function() {
        var nodelist = Y.all(CSS.DUPLICATEBUTTON);
        var count = Y.all(CSS.INITBUTTON).size();
        for (var i = 0; i < nodelist.size(); i++) {
            nodelist.item(i).once('click',this.setupDialog,this,count);
        }
    }
},
{
    NAME : DIALOGNAME,
    ATTRS : {
        /**
         * The maximum height (in pixels) of the activity chooser.
         *
         * @attribute maxheight

         * @type Number
         * @default 800
         */
        maxheight : {
            value : 800
        }
    }
});
M.course = M.course || {};
M.course.dialogupdate = function(config) {
    return new DIALOG(config);
};


}, '@VERSION@', {"requires": ["io-base", "io-form"]});
