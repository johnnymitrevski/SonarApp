'use strict';

/**
 * Controller for all the Sonar API service calls
 *
 * @param $scope Scope variable
 * @param SonarApiService The Sonar Web API service
 * @param $location container of the URL
 * @constructor
 */
function SonarAppController($scope, SonarApiService, $location)
{
    // $scope container for the information we wish to present in the view
    $scope.sonarApp = {};

    // Container for the information of each project
    $scope.sonarApp.projects = [];

    // Define the metrics we wish to track
    $scope.sonarApp.metricsDefinition = [];

    $scope.sonarApp.metricsDefinition.push({name:"Lines of Code", id:"ncloc"});
    $scope.sonarApp.metricsDefinition.push({name:"Unit Test Coverage %", id:"coverage", red: 10, orange: 60, green: 100, positiveTrend: true});
    $scope.sonarApp.metricsDefinition.push({name:"Complexity/Method %", id:"function_complexity", red: 100, orange: 20, green: 5, positiveTrend: false});
    $scope.sonarApp.metricsDefinition.push({name:"Complexity/Class %", id:"class_complexity", red: 100, orange: 20, green: 5, positiveTrend: false});
    $scope.sonarApp.metricsDefinition.push({name:"Duplicated Lines %", id:"duplicated_lines_density", red: 100, orange: 15, green: 5, positiveTrend: false});
    $scope.sonarApp.metricsDefinition.push({name:"Rules Compliance %", id:"violations_density", red: 60, orange: 90, green: 100, positiveTrend: true});

    var sonarApplication = new SonarApplicationData("http://identitybuildbox.wg.dir.telstra.com:8080/ProxyServer/?url=http://identitybuildbox.wg.dir.telstra.com:9000");

    var jenkinsApplicationData = new JenkinsApplicationData("http://identitybuildbox.wg.dir.telstra.com:8080/ProxyServer/?url=http://identitybuildbox.wg.dir.telstra.com:8090");

    /**
     * Call SonarApiService web API to obtain information on all projects
     */
    $scope.loadData = function () {

        $scope.sonarApp.projects = sonarApplication.getProjects();

        SonarApiService.getProjects(sonarApplication.getUrl())
            .then(function(data) {
                handleGetProjectsCallback(data);
            })
            .then(function() {
                getMetricsAndTrendForEachProject();
            })
            .then(function() {
                getBuildStatusForEachProject();
            });

        /**
         * Resolve the callback from the call to getProjects()
         * @param sonarProjects array of ProjectData() objects returned from service call
         */
        function handleGetProjectsCallback(sonarProjects) {
            angular.forEach(sonarProjects, function (project) {
                sonarApplication.addProject(project);
            });
        }

        /**
         * Call Sonar API to get metrics and trend data on all projects
         */
        function getMetricsAndTrendForEachProject() {
            angular.forEach(sonarApplication.getProjects(), function (project) {
                SonarApiService.getMetricsAndTrend(sonarApplication.getUrl(), project.getId(), $scope.sonarApp.metricsDefinition)
                    .then(function (data) {
                        handleGetMetricsAndTrendCallback(data, project.getId());
                    });
            })
        }

        /**
         * Call Jenkins API to get build status on all projects
         */
        function getBuildStatusForEachProject() {
            angular.forEach(sonarApplication.getProjects(), function(project) {
                SonarApiService.getBuildStatus(jenkinsApplicationData.getUrl(), project.getName())
                    .then(function(data){
                        handleBuildStatusCallback(data, project.getId());
                });
            })
        }

        /**
         * Resolve the promise that was deferred from the call to SonarApiService.getMetricsAndTrend()
         * @param projectMetricsData array of MetricData() objects returned from service call
         * @param projectId the id of the project the metrics were retrieved for
         */
        function handleGetMetricsAndTrendCallback(projectMetricsData, projectId) {

            angular.forEach(sonarApplication.getProjects(), function(project){
                if(project.getId() == projectId) {
                    angular.forEach(projectMetricsData, function(metric){
                        project.addMetric(metric);
                    });
                }
            });
        }

        function handleBuildStatusCallback(buildStatusData, projectId)
        {
            angular.forEach(sonarApplication.getProjects(), function(project){
                if(project.getId() == projectId) {
                    project.setBuildStatus(buildStatusData);
                }
            });
        }
    };

    /**
     *  Logic used to populate the metrics cell with colours etc.
     */
    $scope.populateMetricCell = function(metricData){
        for(var i = 0; i < $scope.sonarApp.metricsDefinition.length; i++) {
            if(metricData.getMetricName() == $scope.sonarApp.metricsDefinition[i].id) {
                if($scope.sonarApp.metricsDefinition[i].positiveTrend) {
                    if(metricData.getMetricCurrentValue() < $scope.sonarApp.metricsDefinition[i].red) {
                        return "red";
                    }
                    else if(metricData.getMetricCurrentValue() < $scope.sonarApp.metricsDefinition[i].orange) {
                        return "orange";
                    }
                    else if(metricData.getMetricCurrentValue() < 100) {
                        return "green";
                    }
                }
                else {
                    if(metricData.getMetricCurrentValue() < $scope.sonarApp.metricsDefinition[i].green) {
                        return "green";
                    }
                    else if(metricData.getMetricCurrentValue() < $scope.sonarApp.metricsDefinition[i].orange)
                    {
                        return "orange";
                    }
                    else if(metricData.getMetricCurrentValue() < 100)
                    {
                        return "red";
                    }
                }
            }
        }

        return "black";
    };

    /**
     *  Logic used to populate the metrics trend image
     */
    $scope.populateMetricImage = function(metricData){
        for(var i = 0; i < $scope.sonarApp.metricsDefinition.length; i++) {
            if((metricData.getMetricName() == $scope.sonarApp.metricsDefinition[i].id) && (metricData.getMetricName() != "ncloc")) {
                if($scope.sonarApp.metricsDefinition[i].positiveTrend) {
                    if(metricData.getMetricTrend() > 0) {
                        return "images/green_up.png";
                    }
                    else if(metricData.getMetricTrend() < 0) {
                        return "images/red_down.png";
                    }
                    else {
                        return "images/constant.png";
                    }
                }
                else {
                    if(metricData.getMetricTrend() > 0) {
                        return "images/red_up.png";
                    }
                    else if(metricData.getMetricTrend() < 0) {
                        return "images/green_down.png";
                    }
                    else {
                        return "images/constant.png";
                    }
                }
            }
        }

        return "images/constant.png";
    };

    /**
     *  Logic used to populate the metrics cell with colours etc.
     */
    $scope.populateBuildStatusCell = function(project){

        var status = project.getBuildStatus();

        if(status == "failed")
        {
            return "redSmall";
        }
        else if( status == "success")
        {
            return "greenSmall";
        }

        return "greySmall";
    };
}