'use strict';

/**
 * Model defining the data associated with the Sonar instance we are using
 *
 * @param url URL of Sonar
 * @constructor
 */
function SonarApplicationData(url) {

    var projects = [];
    var url = url;

    this.addProject = function(project) {
        if(!(project instanceof ProjectData))
        {
            console.log("Object project: " + project + "not of type ProjectData");
        }

        projects.push(project);
    };

    this.getProjects = function() {
        return projects;
    };

    this.getUrl = function() {
        return url;
    }
}