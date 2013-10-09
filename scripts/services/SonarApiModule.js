'use strict';
/**
 * Sonar Web Service API Module.
 *
 * Handles all the calls to the Sonar Web Service and transforms the incoming data into the /model objects required to be
 * used by the application
 *
 * @type {module}
 */

var sonarApiModule = angular.module('SonarApiModule',[],null);

sonarApiModule.config(['$httpProvider', function($http){

    //Allow CORS (cross-site) communication. Otherwise you will get an 'Access-Control-Allow-Origin' error
    $http.defaults.useXDomain = true;

    //Remove this header so the server doesn't reject the incoming request
    delete $http.defaults.headers.common['X-Requested-With'];
}]);

sonarApiModule.factory('SonarApiService', function($http, $q){

    var sonarApiService = {};

    /**
     * Call the Sonar Web Service API to retrieve all project descriptions
     * @param url the URL of the Sonar web server
     * @returns $q deferred response to allow non-blocking requests
     */
    sonarApiService.getProjects = function(url) {

        var deferred = $q.defer();

        $http.get(url + '/api/projects', {params: {format:"json"}})
            .success(function(data){
                var sonarProjects = [];
                angular.forEach(data, function (project) {
                    sonarProjects.push(new ProjectData(project.id, project.nm));
                });

                deferred.resolve(sonarProjects);
            })
            .error(function(){
                deferred.reject("Could not retrieve data from the server.");
            });

        return deferred.promise;
    };

    /**
     * Call the Sonar Web Service API to retrieve metrics for a specific project
     *
     * @param url the URL of the Sonar web server
     * @param projectId the sonar id of the project to obtain metrics for
     * @param metricsDefinition the definition container of the metrics to be obtained
     * @returns $q deferred response to allow non-blocking requests
     */
    sonarApiService.getMetricsAndTrend = function(url, projectId, metricsDefinition){

        var deferred = $q.defer();
        var sonarApiMetricToObtainString = '';
        angular.forEach(metricsDefinition, function(metric){
            sonarApiMetricToObtainString = sonarApiMetricToObtainString + "," + metric.id;
        })

        $http.get(url + '/api/timemachine?resource=' + projectId, {params: {format:"json",metrics:sonarApiMetricToObtainString}})
            .success(function(data){

                var metrics = [];

                for ( var i = 0; i < data[0].cols.length; i++)
                {
                    var metricName = data[0].cols[i].metric;
                    var metricCurrentValue = data[0].cells[data[0].cells.length-1].v[i];
                    var trendElement = Math.floor(data[0].cells.length * 0.5); //The trend is calculated from the last 50% of checkins.
                    var metricTrendValue = data[0].cells[trendElement].v[i];
                    var metricTrend = metricCurrentValue - metricTrendValue;
                    metrics.push(new MetricData(metricName, metricCurrentValue,metricTrend));
                }

                deferred.resolve(metrics);
            })
            .error(function(){
                deferred.reject("Could not retrieve data from the server.");
            });

        return deferred.promise;
    };

    /**
     * Obtain the build status from Jenkins. The is requires Jenkins and Sonar projects to have the same name.
     * @param url The URL of Jenkins
     * @param projectName The projectName Note: Sonar and Jenkins must have the same build name.
     */
    sonarApiService.getBuildStatus = function(url, projectName){

        var encodedURL = encodeURI(url + '/job/' + projectName + "/api/json");

        var deferred = $q.defer();

        $http.get(encodedURL)
            .success(function(data)
            {
                if(data.color == "blue")
                {
                    deferred.resolve("success");
                }
                else
                {
                    deferred.resolve("failed");
                }

            })
            .error(function(){
                deferred.resolve("unknown");
            });

        return deferred.promise;
    };

    return sonarApiService;
});