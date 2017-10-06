
// 2017 Stepan Stepanov
// Feel free to use according to the GPL license

( function($) {
 
    $.fn.handyAjax = function(options) {
         // Default options
        var settings = $.extend({
            initiator: null,
            event: "click",
            type: "POST",
            url: window.location.href,
            timeout: 20000,
            async: true,

            ajaxSpinner: function() { return null; },
            ajaxStatus: function() { return null; },
            beforeRequest: function() { },
            afterRequest: function() { },
            hideInitiator: true,
            restoreInitiator: true,
            textButtonRetry: "Retry",

            data: function() { return {}; },
            success: function() { },
            error: function() { },

            textErrorAjax: "Error occured: ",
            textErrorTimeout: "timeout (server did not respond)",
            textErrorUndefined: "unspecified error"
        }, options);

        exec = function(event) {
            var obj;

            if ( isset(event) ) {
                event.preventDefault();

                obj = $(event.currentTarget);
            } else {
                obj = document;
            }

            var ajaxSpinnerObj = settings.ajaxSpinner(obj);
            var ajaxStatusObj  = settings.ajaxStatus(obj);

            if ( isset(event) ) {
                // Ignore if this button already was pressed
                if ( obj.hasClass("button-pressed") ) {
                    return false;
                }

                obj.removeClass("button").addClass("button-pressed");
            }

            if (ajaxStatusObj) {
                ajaxStatusObj.fadeOut(200);
            }

            settings.beforeRequest(obj);

            if (isset(event) && settings.hideInitiator) {
                obj.fadeOut(200, function() {
                    // Enabling ajax indication

                    if (ajaxStatusObj) {
                        ajaxStatusObj.html('');
                    }

                    if (ajaxSpinnerObj) {
                        ajaxSpinnerObj.fadeIn(200);
                    }
                });

            } else {
                if (ajaxStatusObj) {
                    ajaxStatusObj.html('');
                }

                if (ajaxSpinnerObj) {
                    ajaxSpinnerObj.fadeIn(200);
                }
            }

            // Sending an ajax request
            $.ajax({
                type: settings.type,
                url:  settings.url,
                data: settings.data(obj),
                dataType: "json",
                timeout: settings.timeout,
                success: function(data) {
                    // Disabling ajax indication
                    if (ajaxSpinnerObj) {
                        ajaxSpinnerObj.stop().hide();
                    }

                    try {
                        // Request went smoothly
                        if (data.result && data.result.toUpperCase() === "OK") {
                            settings.success(obj, data);

                            if ( isset(event) ) {
                                // Restoring previous title, if needed
                                var previousHtml = obj.data("previous-html");

                                if ( isset(previousHtml) ) {
                                    obj.html(previousHtml);
                                    obj.data("previous-html", null);
                                }
                            }

                        // An error occured
                        } else if (data.error) {
                            throw new Error(data.error);

                        } else {
                            throw new Error(settings.textErrorUndefined);
                        }

                    } catch (err) {
                        // Showing the error message

                        if (ajaxStatusObj) {
                            ajaxStatusObj.html(err.message).fadeIn(200);
                        }

                        if ( isset(event) ) {
                            if ( !isset( obj.data("previous-html") ) ) {
                                obj.data( "previous-html", obj.html() );
                            }

                            obj.html("Retry");
                        }

                        settings.error(obj, err.message);
                    }
                },
                error: function(xhr, status, error) {
                    if (status === "timeout") {
                        errorToDisplay = settings.textErrorAjax + settings.textErrorTimeout;
                    } else {
                        errorToDisplay = settings.textErrorAjax + xhr.status + " " + error;
                    }

                    // Disabling ajax indication
                    if (ajaxStatusObj) {
                        ajaxStatusObj.html(errorToDisplay).fadeIn(200);
                    }

                    if ( isset(event) ) {
                        obj.html("Retry");
                    }

                    settings.error(obj, errorToDisplay);
                },
                complete: function() {
                    // Disabling ajax indication
                    if (ajaxSpinnerObj) { ajaxSpinnerObj.stop().hide(); }

                    if ( isset(event) && settings.restoreInitiator) {
                        obj.removeClass("button-pressed").addClass("button").stop().fadeIn(200);
                    }

                    settings.afterRequest(obj);
                },
                async: settings.async
            });

            if ( isset(event) ) {
                return false;
            }
        };

        if ( isset(settings.initiator) ) {
            return this.each( function() {
                $(this).on(settings.event, settings.initiator, exec);
            });

        } else {
            exec(null);
        }
     };
 
}(jQuery) );