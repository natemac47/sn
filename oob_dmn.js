var AjaxCreateRelatedEntityFromDemand = Class.create();
AjaxCreateRelatedEntityFromDemand.prototype =
    Object.extendsObject(AbstractAjaxProcessor, {
 
        createProject: function(sys_id, resultAsObject) {
            sys_id = sys_id || this.getParameter('sysparm_sys_id');
            var projName = this.getParameter('sysparm_projName') || 'pm_project';
            var result = (new DemandToProjectCreationHelper()).createProject(sys_id, projName);
            return this._inExpectedFormat(result, resultAsObject);
        },
 
        getProjectTableList: function() {
            var className = this.getParameter('sys_className');
            var response = this._JSONEncode(this._getDemandToProjectList(className));
            return response;
        },
 
        createProjectAjax: function() {
            var sys_id = this.getParameter('sysparm_sys_id');
            var tablename = this.getParameter('sysparm_table_name');
            var projectTable = this.getParameter('sysparm_projName') || 'pm_project';
            var formSource = this.getParameter('sysparm_form_source');
            var result = (new DemandToProjectCreationHelper()).createProject(sys_id, projectTable);
           
            //if(GlidePluginManager.isActive('com.snc.project_management_v3'))
            //  projectTable = SNC.PPMConfig.getProjectTable(tablename);
            var link;
            if (formSource === 'workspace') {
                link =' <a href ="/now/workspace/project/home/sub/record/' + projectTable + '/' + result.sys_id+'">' +result.number +'</a>';
            } else {
                link = ' <a href ="/' + projectTable + '.do?sysparm_query=number%3D' + result.number + '">' + result.number + '</a>';
            }
            var prjGr = new GlideRecord(projectTable);
            var messageObj = {};
            if (result.sys_id && prjGr.get(result.sys_id)) {
                messageObj = {
                    message : gs.getMessage("{0} {1} has been created.", [result.label, link]),
                    level : 'info'
                };
            } else {
                messageObj = {
                    message : gs.getMessage("Error creating {0}", result.label),
                    level : 'error'
               };
            }
            return JSON.stringify(messageObj);
        },
 
        createEnhancement: function(demand_id, resultAsObject) {
            var demand;
            var enhancement;
            var enhancementId;
            var enhancementNumber;
            var tableDisplayName;
 
            if (!GlidePluginManager.isActive("com.snc.sdlc.scrum")) {
                gs.log("Error creating Enhancement : SDLC - SCRUM plugin is not active");
                return;
            }
 
            demand = this._getDemand(demand_id || this.getParameter('sysparm_sys_id'));
            if (!demand) {
                gs.log("Error creating demand");
                return;
            }
 
            enhancement = new GlideRecord('rm_enhancement');
            enhancement.initialize();
            enhancement.setValue("short_description", demand.short_description);
            //enhancement.setValue("parent", demand.sys_id);
            enhancement.setValue('sys_domain', demand.sys_domain);
 
            //passing application model and software model from demand to enhancement
            if (JSUtil.notNil(demand.getValue('model_id')))
                enhancement.model_id = demand.model_id;
            if (JSUtil.notNil(demand.getValue('software_model')))
                enhancement.software_model = demand.software_model;
 
            enhancementId = enhancement.insert();
            enhancementNumber = enhancement.getValue('number');
            tableDisplayName = enhancement.getClassDisplayValue();
 
            //update demand with enhancement details
            if (JSUtil.nil(demand.related_records))
                demand.related_records = enhancementId;
            else
                demand.related_records = demand.related_records + "," + enhancementId;
 
            demand.enhancement = enhancementId;
            demand.state = '8';
            demand.stage = 'enhancement';
            demand.update();
 
            if (new GlidePluginManager().isActive('com.snc.investment_planning_pmo')) {
                var invst = new InvstDemandConversion(demand, enhancement);
                invst.updateExsistingInvestMentWhenDemandIsConverted();
            }
 
            return this._inExpectedFormat({
                'sys_id': enhancementId,
                'number': enhancementNumber,
                'label': tableDisplayName
            }, resultAsObject);
        },
 
        createChange: function(demand_id, resultAsObject) {
            var demand;
            var change;
            var changeId;
            var changeNumber;
            var tableDisplayName;
 
            demand = this._getDemand(demand_id || this.getParameter('sysparm_sys_id'));
            if (!demand) {
                gs.log("Error creating demand");
                return;
            }
 
            change = new GlideRecord('change_request');
            change.initialize();
            change.setValue("short_description", demand.short_description);
            change.setValue("parent", demand.sys_id);
            change.setValue('sys_domain', demand.sys_domain);
            changeId = change.insert();
            changeNumber = change.getValue('number');
            tableDisplayName = change.getClassDisplayValue();
 
            //update demand with change details
            if (JSUtil.nil(demand.related_records))
                demand.related_records = changeId;
            else
                demand.related_records = demand.related_records + "," + changeId;
 
            demand.change = changeId;
            demand.state = '8';
            demand.stage = 'change';
            demand.update();
 
            if (new GlidePluginManager().isActive('com.snc.investment_planning_pmo')) {
                var invst = new InvstDemandConversion(demand, change);
                invst.updateExsistingInvestMentWhenDemandIsConverted();
            }
 
            return this._inExpectedFormat({
                'sys_id': changeId,
                'number': changeNumber,
                'label': tableDisplayName
            }, resultAsObject);
        },
 
        createDefect: function(demand_id, resultAsObject) {
            var demand;
            var defect;
            var defectId;
            var defectNumber;
            var tableDisplayName;
 
            if (!GlidePluginManager.isActive("com.snc.sdlc.scrum")) {
                gs.log("Error creating Defect : SDLC - SCRUM plugin is not active");
                return;
            }
 
            demand = this._getDemand(demand_id || this.getParameter('sysparm_sys_id'));
            if (!demand) {
                gs.log("Error creating demand");
                return;
            }
 
            defect = new GlideRecord('rm_defect');
            defect.initialize();
            defect.setValue("short_description", demand.short_description);
            defect.setValue("parent", demand.sys_id);
            defect.setValue('sys_domain', demand.sys_domain);
 
            if (JSUtil.notNil(demand.getValue('model_id')))
                defect.model_id = demand.model_id;
            if (JSUtil.notNil(demand.getValue('software_model')))
                defect.software_model = demand.software_model;
 
            defectId = defect.insert();
            defectNumber = defect.getValue('number');
            tableDisplayName = defect.getClassDisplayValue();
 
            //update demand with defect details
            if (JSUtil.nil(demand.related_records))
                demand.related_records = defectId;
            else
                demand.related_records = demand.related_records + "," + defectId;
 
            demand.defect = defectId;
            demand.state = '8';
            demand.stage = 'defect';
            demand.update();
 
            if (new GlidePluginManager().isActive('com.snc.investment_planning_pmo')) {
                var invst = new InvstDemandConversion(demand, defect);
                invst.updateExsistingInvestMentWhenDemandIsConverted();
            }
 
            return this._inExpectedFormat({
                'sys_id': defectId,
                'number': defectNumber,
                'label': tableDisplayName
            }, resultAsObject);
        },
 
        createAgileOrSafeEntity: function(demand_id, resultAsObject) {
            var entityId;
            var entityNumber;
            var tableDisplayName;
            var demand = this._getDemand(demand_id || this.getParameter('sysparm_sys_id'));
            var preFields = this.getParameter('sysparam_preFields');
            if (preFields) {
                preFields = JSON.parse(preFields);
            }
 
            if (!demand) {
                gs.log("Error creating demand");
                return;
            }
            var destinationType = demand.getValue("type");
            var isScrumEntity = (destinationType == "scrum_epic" || destinationType == "scrum_story");
            var isSafeEntity = (destinationType == "safe_epic" || destinationType == "safe_feature" || destinationType == "safe_story");
            if (!GlidePluginManager.isActive("com.snc.sdlc.agile.2.0") && isScrumEntity) {
                gs.log("Error: Agile Development 2.0 plugin is not active");
                return;
            }
 
            if (!GlidePluginManager.isActive("com.snc.sdlc.safe") && isSafeEntity) {
                gs.log("Error: Agile - Scaled Agile Framework - Essential SAFe plugin is not active");
                return;
            }
            var conversionUtil;
            if (isScrumEntity)
                conversionUtil = new AgileDemandConversion();
            else
                conversionUtil = new SafeDemandConversion();
            var mapId = conversionUtil.map[destinationType]["mapId"];
            var targetTable = conversionUtil.map[destinationType]["tableName"];
            var targetField = conversionUtil.map[destinationType]["fieldName"];
            var viewName = conversionUtil.map[destinationType]["viewName"];
            var demandFieldValue = {
                "fieldName": "demand",
                "fieldValue": demand.getValue("sys_id")
            };
 
            if (JSUtil.nil(preFields))
                preFields = [demandFieldValue];
            else
                preFields.push(demandFieldValue);
 
            var response = conversionUtil.convertDemand(demand.getTableName(), demand.getValue('sys_id'), mapId, preFields);
            if (JSUtil.nil(response)) {
                gs.log("Error in conversion");
                return;
            }
 
            demand.setValue(targetField, response.id);
            demand.setValue('stage', destinationType);
            demand.setValue('state', '8');
            demand.update();
            entityNumber = response.number;
            entityId = response.id;
            tableDisplayName = response.label;
 
            return this._inExpectedFormat({
                'sys_id': entityId,
                'number': entityNumber,
                'label': tableDisplayName
            }, resultAsObject);
        },
 
        fetchDemandEntityDetails: function() {
            var demand = this._getDemand(this.getParameter('sysparm_sys_id'));
            var demandEntityDetails = {};
            var choiceGr;
            var entityType;
            var response;
            if (!demand) {
                gs.log("Error fetching demand with sys_id:" + sys_id);
                return;
            }
            choiceGr = new GlideRecord('sys_choice');
            choiceGr.addQuery('name', 'dmn_demand');
            choiceGr.addQuery('element', 'type');
            choiceGr.query();
            while (choiceGr.next()) {
                entityType = choiceGr.getValue('value');
                demandEntityDetails[entityType] = demand.getValue(entityType);
            }
            entityType = demand.getValue('type');
            demandEntityDetails.sys_id = demand.getValue('sys_id');
            demandEntityDetails.short_description = demand.getValue('short_description');
            demandEntityDetails.type = demand.getValue('type');
            demandEntityDetails.label = demand.getDisplayValue('type');
            if (JSUtil.nil(demandEntityDetails[entityType])) {
                if (entityType === "project" || entityType === "defect" || entityType === "change" || entityType === "enhancement")
                    demandEntityDetails.create_access = gs.getUser().hasRole("demand_manager");
                else {
                    var sysColumnGr = new GlideRecord("sys_dictionary");
                    sysColumnGr.addQuery("name", "dmn_demand");
                    sysColumnGr.addQuery("element", entityType);
                    sysColumnGr.query();
                    if (sysColumnGr.next() && !JSUtil.nil(sysColumnGr.getValue("reference"))) {
                        demandEntityDetails.create_access = new GlideRecord(sysColumnGr.getValue("reference")).canCreate();
                    }
                }
            }
            if (demandEntityDetails.type == 'project') {
                var projectClassName = SNC.PPMConfig.getProjectTable(demand.getValue('sys_class_name'));
                var projTableList = this._getDemandToProjectList(projectClassName);
                if (projTableList) {
                    demandEntityDetails.projClassName = projTableList[0].value;
                }
 
                demandEntityDetails.isMultipleProjectClassExists = (projTableList && projTableList.length > 1) ? true : false;
            }
 
            demandEntityDetails.is_multi_currency_enabled = GlidePluginManager.isActive('com.snc.ppm_multicurrency');
            if (demandEntityDetails.is_multi_currency_enabled) {
                demandEntityDetails.project_currency = demand.getDisplayValue('project_currency');
            }
            response = this._JSONEncode(demandEntityDetails);
            return response;
        },
 
 
 
        isAgileActive: function() {
            var isAgileActive = GlidePluginManager.isActive('com.snc.sdlc.scrum.pp') || GlidePluginManager.isActive('com.snc.sdlc.agile.2.0');
 
            return isAgileActive;
        },
 
        isMultiCurrencyEnabled: function() {
            var isMultiCurrencyEnabled = GlidePluginManager.isActive('com.snc.ppm_multicurrency');
 
            return isMultiCurrencyEnabled;
        },
 
        checkPmoUpgrade: function() {
            var isUpgrading = false;
            var dmnTable = this.getParameter('sysparm_source_table');
            var projTable = SNC.PPMConfig.getProjectTable(dmnTable);
            var projTableList = this._getDemandToProjectList(projTable);
            var defaultProjectTable = (projTableList) ? projTableList[0].value : defaultProjectTable;
            var multipleProjectsExist = (projTableList && projTableList.length > 1) ? true : false;
            var result = this.newItem("result");
            var glidePluginManager = new GlidePluginManager();
            if (glidePluginManager.isActive('com.snc.financial_planning_pmo')) {
                if (new ITFMBudgetPlanner().isPMOFinancialPlanningUpgradeJobRunning()) {
                    isUpgrading = true;
                    action.setRedirectURL(current);
                }
            }
            result.setAttribute("isUpgrading", isUpgrading);
            result.setAttribute("isProjectCurrencyEnabled", glidePluginManager.isActive('com.snc.ppm_multicurrency'));
            result.setAttribute("isMultipleProjectClassExists", multipleProjectsExist);
            result.setAttribute("defaultProjectTable", defaultProjectTable);
        },
 
        _getDemandToProjectList: function(className) {
            return new PPMConfigHelper().getDemandToProjectTableList(className);
        },
 
        _getRecord: function(table, sys_id) {
            var gr = new GlideRecord(table);
            if (gr.get(sys_id))
                return gr;
            return null;
        },
 
        _getDemand: function(sys_id) {
            var demand = new GlideRecord('dmn_demand');
            if (demand.get(sys_id))
                return demand;
 
            return null;
        },
 
        _inExpectedFormat: function(obj, resultAsObject) {
            return (resultAsObject) ? obj : this._JSONEncode(obj);
        },
 
        _JSONEncode: function(obj) {
            return (new JSON()).encode(obj);
        },
 
        checkOpenAssessments: function() {
            var sys_id = this.getParameter('sysparm_sys_id');
            var assinstgr = new GlideRecord('asmt_assessment_instance');
            assinstgr.addQuery('metric_type', '0556fa9a8f12110040f82ab2f0f923f8');
            var assinstgrOr = assinstgr.addQuery('state', 'wip');
            assinstgrOr.addOrCondition('state', 'ready');
            var assquestiongr = assinstgr.addJoinQuery('asmt_assessment_instance_question', 'sys_id', 'instance');
            assquestiongr.addCondition('source_table', 'dmn_demand');
            assquestiongr.addCondition('source_id', sys_id);
            assinstgr.query();
            if (assinstgr.next()) {
                return true;
            }
 
            return false;
        },
 
        getProjectFundsSelectedForExecution: function() {
            var sys_id = this.getParameter('sysparm_sys_id');
            var fiscalYearConcat = "";
            var projectFundGr = new GlideRecord('project_funding');
            projectFundGr.addQuery('planned', true);
            projectFundGr.addQuery('task', sys_id);
            projectFundGr.query();
            while (projectFundGr.next()) {
                if (fiscalYearConcat == "")
                    fiscalYearConcat = projectFundGr.getDisplayValue('fiscal_period');
                else
                    fiscalYearConcat = fiscalYearConcat + "," + projectFundGr.getDisplayValue('fiscal_period');
            }
            return fiscalYearConcat;
        },
 
        getresourcePlanStatus: function() {
            var sys_id = this.getParameter('sysparm_sys_id');
            var resourcePlanStatusGr = new GlideRecord('resource_plan');
            resourcePlanStatusGr.addQuery('task', sys_id);
            resourcePlanStatusGr.addQuery('state', '!=', 1);
            resourcePlanStatusGr.addQuery('actual_hours', 0);
            resourcePlanStatusGr.query();
            if (resourcePlanStatusGr.next()) {
                return 'resourcePlanwithoutactualexist';
            } else
                return 'resourcePlanWithActualDoesnotexist';
 
        },
 
        checkRelatedEntities: function() {
            var result = this.newItem('result');
            var sys_id = this.getParameter('sysparm_sys_id');
            result.setAttribute('sysparm_sys_id', sys_id);
            result.setAttribute('status', 'success');
            var assessmentExists = this.checkOpenAssessments();
            result.setAttribute('assessmentExists', assessmentExists);
 
            var fiscalYearConcat = this.getProjectFundsSelectedForExecution();
            result.setAttribute('fiscalYearConcat', fiscalYearConcat);
 
            var resourcePlanStatus = this.getresourcePlanStatus();
            result.setAttribute('resourcePlanStatus', resourcePlanStatus);
 
            if(GlidePluginManager.isActive('com.sn_plng_att_core'))
            {
                var resourceAssignmentsExists = RMUtil.checkResourceAssignmentsExists(sys_id);
                result.setAttribute('resourceAssignmentsExists', resourceAssignmentsExists);    
            }
        },
 
 
        resetToDraft: function() {
 
            var sys_id = this.getParameter('sysparm_sys_id');
            var moveResoucePlantoPlanning = this.getParameter('sysparm_move_resource_plan');
            var gr = new GlideRecord('dmn_demand');
            gr.addQuery('sys_id', sys_id);
            gr.query();
            if (gr.next()) {
                gs.getSession().putClientData("moveResoucePlantoPlanning", moveResoucePlantoPlanning);
            }
 
            return true;
        },
 
 
        type: 'AjaxCreateRelatedEntityFromDemand'
    });
