'use strict';

/**
 * Model defining the project specific data
 *
 * @param id Id of the project
 * @param name Name of the project
 * @constructor
 */
function ProjectData(id, name) {

    var id = id;
    var name = name;
    var metrics = [];
    var buildStatus = false;

    this.getId = function() {
        return id;
    };

    this.getName = function() {
        return name;
    };

    this.getMetrics = function() {
        return metrics;
    };

    this.addMetric = function(metricData) {
        if(!(metricData instanceof MetricData))
        {
            console.log("Object metricData: " + metricData + "not of type MetricData");
        }

        metrics.push(metricData);
    };

    this.getBuildStatus = function() {
        return buildStatus;
    };

    this.setBuildStatus = function(buildStatusData) {
        buildStatus = buildStatusData;
    }
}