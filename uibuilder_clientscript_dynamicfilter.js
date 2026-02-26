function handler({ api, event, helpers, imports }) {

    function transformOptions(rawData) {
        var rows = (rawData && rawData.output && rawData.output.result) || [];

        return rows.map(function(row) {
            var group = (row.groupBy && row.groupBy[0]) || {};
            return {
                label: group.displayValue || group.value || '',
                value: group.value || ''
            };
        }).filter(function(opt) { return opt.value !== ''; });
    }

    function clearIfStale(cspName, options) {
        var current = api.state[cspName];
        if (current) {
            var stillValid = options.some(function(o) { return o.value === current; });
            if (!stillValid) {
                api.setState(cspName, '');
            }
        }
    }

    if (event.type === 'ASSIGNMENT_GROUP_CHANGED') {
        api.setState('cspAssignmentGroup', event.payload.value || '');

    } else if (event.type === 'ASSIGNMENT_GROUP_CLEARED') {
        api.setState('cspAssignmentGroup', '');

    } else if (event.type === 'CALLER_DEPT_CHANGED') {
        api.setState('cspCallerDept', event.payload.value || '');

    } else if (event.type === 'CALLER_DEPT_CLEARED') {
        api.setState('cspCallerDept', '');

    } else if (event.type === 'CALLER_CHANGED') {
        api.setState('cspCaller', event.payload.value || '');

    } else if (event.type === 'CALLER_CLEARED') {
        api.setState('cspCaller', '');

    } else if (event.type === 'ASSIGNMENT_GROUP_DS_CHANGED') {
        var agOptions = transformOptions(api.data.assignment_group_aggregation);
        api.setState('cspAssignmentGroupOptions', agOptions);
        clearIfStale('cspAssignmentGroup', agOptions);

    } else if (event.type === 'CALLER_DEPT_DS_CHANGED') {
        var deptOptions = transformOptions(api.data.caller_dept_aggregation);
        api.setState('cspCallerDeptOptions', deptOptions);
        clearIfStale('cspCallerDept', deptOptions);

    } else if (event.type === 'CALLER_DS_CHANGED') {
        var callerOptions = transformOptions(api.data.caller_aggregation);
        api.setState('cspCallerOptions', callerOptions);
        clearIfStale('cspCaller', callerOptions);

    } else if (event.type === 'COMPONENT_CONNECTED') {
        var initialAG = transformOptions(api.data.assignment_group_aggregation);
        var initialDept = transformOptions(api.data.caller_dept_aggregation);
        var initialCaller = transformOptions(api.data.caller_aggregation);

        api.setState('cspAssignmentGroupOptions', initialAG);
        api.setState('cspCallerDeptOptions', initialDept);
        api.setState('cspCallerOptions', initialCaller);
    }
}
