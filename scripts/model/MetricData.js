/**
 * Model defining a metric for a project
 *
 * @param metricName Name of the metric
 * @param metricCurrentValue The current value of the metric
 * @param metricTrend The trend of the metric
 * @constructor
 */
function MetricData(metricName, metricCurrentValue, metricTrend) {

    var metricName = metricName;
    var metricCurrentValue = metricCurrentValue;
    var metricTrend = metricTrend;

    this.getMetricName = function() {
        return metricName;
    }

    this.getMetricCurrentValue = function() {
        return metricCurrentValue;
    }

    this.getMetricTrend = function() {
        return metricTrend;
    }
}