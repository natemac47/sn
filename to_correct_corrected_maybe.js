function onChange(control, oldValue, newValue, isLoading) {

    // Created by - A701449, Story - SNKP-68534, Purpose - To set the Help text for options of selected field above

    if (isLoading || newValue == '') {
        return;
    }

    var form = typeof g_sc_form != 'undefined' ? g_sc_form : g_form;

    if (!form) return;

    form.setLabelOf('select_type_of_service_needed_options', '');
    form.clearValue('select_type_of_service_needed_help_text');

    var catItemSysId;
    if (typeof g_sc_form != 'undefined') {
        catItemSysId = form.getUniqueValue();
    } else {
        var catItemField = form.getValue('cat_item');
        catItemSysId = catItemField ? catItemField : form.getUniqueValue();
    }

    if (!catItemSysId) return;

    var typeOfNetwork = form.getValue('select_the_type_of_network_related_to_your_request');

    var table = 'u_kp_sc_menu_items';
    var query = 'u_catalog_item=' + catItemSysId +
        '^u_menu_type=type_of_service_needed' +
        '^u_menu_value_1=' + typeOfNetwork +
        '^u_menu_value_2=' + newValue;

    var ga = new GlideAjax('global.FPSCHelperClient');
    ga.addParam('sysparm_name', 'fetchRecordFieldsGeneric');
    ga.addParam('sysparm_table', table);
    ga.addParam('sysparm_query', query);

    ga.getXMLAnswer(function(response) {
        var answer = JSON.parse(response);
        var instructionHelpTxt = answer.u_instrunctions;
        var descriptionHelpTxt = answer.u_description;

        form.setValue('select_type_of_service_needed_help_text', descriptionHelpTxt);
        form.setLabelOf('select_type_of_service_needed_options', instructionHelpTxt);
    });
}
