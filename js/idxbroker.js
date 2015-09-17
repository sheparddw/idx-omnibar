(function() {	jQuery(document).ready(function(){	    jQuery('#web_services_error').css('display','block');	    // ajax loading gif		var ajax_load = "<span class='ajax'></span>";		//path to the admin ajax file	    // url of the blog	    var blogUrl = jQuery('#blogUrl').attr('ajax');	    //initialize select2 on appropriate selects	    jQuery('.select2').select2({	    	maximumSelectionLength: 10,	    	placeholder: 'Select Up to Ten Fields'	    });	    // when the save changes button is clicked	    jQuery('#save_changes').click(function(event){	    	jQuery('#action_mode').val('');	        // prevent the default action as we need to save the links to the db first.	        event.preventDefault();	        if(typeof document.querySelectorAll('#idx_broker_apikey')[0] !== 'undefined'){	        	var submit = apikey_check();	        } else {	        	var submit = true;	        }	        if(submit === true) {	        	var status = jQuery('.status');	            // give the user a pseudo status console so they know something is happening	            status.fadeIn('fast').html(ajax_load+'Saving');	            // update ccz, custom fields, and get-locations.php for omnibar	            update_omnibar_current_ccz();	        }            else {            	status.fadeIn('slow').html(ajax_load+'Saving Options...');            	jQuery('#idx_broker_options').submit();            }	    });	    jQuery('#api_update').click(function(event) {	    	var apikey = jQuery('#idx_broker_apikey').val();	        var submit = apikey_check();	    	if(submit === true) {		    	event.preventDefault();		    	jQuery('[name=action]').val('idx_refresh_api');		    	jQuery('#action_mode').val('refresh_mode');		    	var status = jQuery('.refresh_status');		    	var params = jQuery('#idx_broker_apikey').serialize();		    	status.fadeIn('fast').html(ajax_load+'Refreshing API...');		    	save_form_options(params, function() {		    		status.fadeIn('fast').html(ajax_load+'Refreshing Links...');		    		setTimeout(window.location.reload(), 1000);		    	});		    	//get cczs for omnibar		    	jQuery.post(				ajaxurl, {				'action': 'idx_get_locations'			})	    	}	    });		if(jQuery('#idx_broker_dynamic_wrapper_page_name').val() !== '' && typeof document.querySelectorAll('#page_link')[0] !== 'undefined') {			var linkData = jQuery('#page_link').val().split('//');			var protocol= linkData[0];			var link = linkData[1];			jQuery('#protocol').text(protocol+'//');			jQuery('#page_link').val(link);		}	  	jQuery('#idx_broker_create_wrapper_page').click(function(event) {		    event.preventDefault();		    var post_title = jQuery('#idx_broker_dynamic_wrapper_page_name').val();		    var wrapper_page_id = jQuery('#idx_broker_dynamic_wrapper_page_id').val();		    jQuery('#idx_broker_dynamic_wrapper_page_name').removeClass('error');		    jQuery('#dynamic_page > p.error').hide();		    if ( post_title === '') {		    	jQuery('#idx_broker_dynamic_wrapper_page_name').addClass('error');		    	jQuery('#dynamic_page > p.error').show();		    	return;		    }		    jQuery.post(				ajaxurl, {				'action': 'create_dynamic_page',				'post_title': post_title,				'wrapper_page_id': wrapper_page_id,				'idx_broker_admin_page_tab': jQuery('#tabs li.active a').attr('href')			}).done(function(response){				setTimeout(window.location.reload(), 1000);			});		});	    jQuery('#idx_broker_delete_wrapper_page').click(function () {	    	var wrapper_page_id = jQuery('#idx_broker_dynamic_wrapper_page_id').val();		    jQuery.post(				ajaxurl, {					'action': 'delete_dynamic_page',					'wrapper_page_id': wrapper_page_id,					'idx_broker_admin_page_tab': jQuery('#tabs li.active a').attr('href')				}).done(function(){					// save form					var status = jQuery('.wrapper_status');					status.fadeIn('fast').html(ajax_load+'Deleting IDX Wrapper Page...');					save_form_options('', function() {						status.fadeIn('fast').html(ajax_load+' Refreshing Page...');						setTimeout(window.location.reload(), 1000);					});				});	    });			});	/**	 *	return true or false for form submission	 */	function apikey_check () {		var apikey = jQuery('#idx_broker_apikey').val();		if (apikey === '') {			jQuery('#idx_broker_apikey').focus();			jQuery('#idx_broker_apikey').parent('div').css('background', '#FDB7B7');		   	jQuery('#idx_broker_apikey_error').show();			return false;		} else {		   jQuery('#idx_broker_apikey').parents('div').css('background', 'none');		   jQuery('#idx_broker_apikey_error').hide();		   return true;		}	}	function save_form_options (params, callback) {		var curentTab = jQuery('#tabs li.active a').attr('href');		jQuery('#currentTab').val(curentTab);		params = params || jQuery('#idx_broker_options').serialize();		params += '&' + jQuery('#currentTab').serialize();		params += '&' + jQuery('[name=action]').serialize();		return jQuery.ajax({	  		type: "POST",	   		url: ajaxurl,	   		data: params,	   		success: function(data) {    			jQuery('[name=action]').val('update');				callback();		  	} 		});	}		function update_omnibar_current_ccz(){		if(typeof document.querySelectorAll('.city-list')[0] === 'undefined'){			return;		}		var city = jQuery('.city-list select').val();		var county = jQuery('.county-list select').val();		var zipcode = jQuery('.zipcode-list select').val();		 jQuery.post(				ajaxurl, {				'action': 'idx_update_omnibar_current_ccz',				'city-list': city,				'county-list': county,				'zipcode-list': zipcode		}, function(){update_omnibar_custom_fields();});	}	function update_omnibar_custom_fields(){		var customField = document.querySelectorAll('.omnibar-additional-custom-field')[0];		if(customField === undefined){			return;		}		var customFieldValues = [];		for (var i = 0; i < customField.options.length; i++) {			if(customField.options[i].selected){				var idxID = customField.options[i].parentNode.classList[0];				var value = customField.options[i].value;				var fieldName = customField.options[i].label;				var mlsPtID = customField.options[i].getAttribute('data-mlsptid');				var fieldObject = {'idxID': idxID, 'value': value, 'mlsPtID': mlsPtID, 'name': fieldName};				customFieldValues.push(fieldObject);			}		};		var mlsPtID = document.querySelectorAll('.omnibar-mlsPtID');		var mlsPtIDs = [];		for (var i = 0; i < mlsPtID[i].length; i++) {				var idxID = mlsPtID[i].name;				var value = mlsPtID[i].value;				var mlsPtObject = {'idxID': idxID, 'mlsPtID': value};				mlsPtIDs.push(mlsPtObject);		};		var placeholder = document.querySelectorAll('.omnibar-placeholder')[0].value;		 jQuery.post(				ajaxurl, {				'action': 'idx_update_omnibar_custom_fields',				'fields': customFieldValues,				'mlsPtIDs': mlsPtIDs,				'placeholder': placeholder		}, function(){window.location.reload();});	}	(function preloadCczView(){		if(typeof loadCczView !== 'undefined'){			jQuery.post(				ajaxurl, {				'action': 'idx_preload_ccz_view'				}, function(){window.location.reload();}			);		}	})();})(window, undefined);