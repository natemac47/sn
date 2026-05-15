var AjaxCreateRelatedEntityFromDemand = Class.create();
AjaxCreateRelatedEntityFromDemand.prototype =
    Object.extendsObject(AbstractAjaxProcessor, {
        createProject: function(sys_id, resultAsObject) {
            sys_id = sys_id || this.getParameter('sysparm_sys_id');
            var result = (new DemandToProjectCreationHelper()).createProject(sys_id);
 
            if (new GlidePluginManager().isActive('com.snc.investment_planning_pmo')) {
                var invst = new InvstDemandConversion(this._getDemand(sys_id), this._getRecord('pm_project', result.sys_id));
                invst.updateExsistingInvestMentWhenDemandIsConverted();
            }
 
            return this._inExpectedFormat(result, resultAsObject);
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
            demandEntityDetails.sys_id = demand.getValue('sys_id');
            demandEntityDetails.short_description = demand.getValue('short_description');
            demandEntityDetails.type = demand.getValue('type');
            demandEntityDetails.label = demand.getDisplayValue('type');
            response = this._JSONEncode(demandEntityDetails);
            return response;
        },
 
        isAgileActive: function() {
            var isAgileActive = GlidePluginManager.isActive('com.snc.sdlc.scrum.pp') || GlidePluginManager.isActive('com.snc.sdlc.agile.2.0');
 
            return isAgileActive;
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
            result.setAttribute('status', 'success');
            var assessmentExists = this.checkOpenAssessments();
            result.setAttribute('assessmentExists', assessmentExists);
 
            var fiscalYearConcat = this.getProjectFundsSelectedForExecution();
            result.setAttribute('fiscalYearConcat', fiscalYearConcat);
 
            var resourcePlanStatus = this.getresourcePlanStatus();
            result.setAttribute('resourcePlanStatus', resourcePlanStatus);
 
        },
 
 
        resetToDraft: function() {
 
            var sys_id = this.getParameter('sysparm_sys_id');
            var moveResoucePlantoPlanning = this.getParameter('sysparm_move_resource_plan');
            var gr = new GlideRecord('dmn_demand');
            gr.addQuery('sys_id', sys_id);
            gr.query();
            if (gr.next()) {
                gs.getSession().putClientData("moveResoucePlantoPlanning", moveResoucePlantoPlanning);
                new Workflow().cancel(gr);
                var wfContexts = new GlideRecord('wf_context');
                wfContexts.addQuery('name', 'Demand');
                wfContexts.addQuery('id', sys_id);
                wfContexts.addQuery('state', 'finished');
                wfContexts.query();
                while (wfContexts.next()) {
                    //gs.log('####SCBD: delete wf record for ' + wfContexts.id.getDisplayValue());
                    wfContexts.deleteRecord();
                }
               
               
                var approvals = new GlideRecord('sysapproval_approver');
                approvals.addQuery('sysapproval', sys_id);
                approvals.query();
                while(approvals.next()){
                    approvals.state = 'cancelled';
                    approvals.update();                  
                }
            }
 
            return true;
        },
 
        type: 'AjaxCreateRelatedEntityFromDemand'
    });
