'use strict';

/**
 * Model defining the data associated with the Jenkins instance we are using
 *
 * @param url URL of Jenkins
 * @constructor
 */
function JenkinsApplicationData(url) {

    var url = url;

    this.getUrl = function() {
        return url;
    }
}