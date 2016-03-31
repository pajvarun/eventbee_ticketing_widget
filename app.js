var eventbee = angular.module('eventbee', ['ngMaterial']);
eventbee.controller('ticket', ['$scope', '$http', function($scope, $http) {
    $scope.data = "";
    $scope.dates = [];
    var get_dates = $http.get('http://192.168.1.85/tktwidget/registration/getEventMetaData.jsp?api_key=123&event_id=112500213');
    get_dates.success(function(data, status, headers, config) {
        $scope.data = data;
    });
    get_dates.error(function(data, status, headers, config) {
        alert('Unknown error occured. Please try reloading the page.');
    });
    $scope.displayTickets = function() {
        var get_tickets = $http.get('http://192.168.1.85/tktwidget/registration/getEventTickets.jsp?api_key=123&event_id=112500213&event_date=' + encodeURIComponent($scope.date_selected));
        get_tickets.success(function(data, status, headers, config) {
            $scope.tickets = data;
        });
        get_tickets.error(function(data, status, headers, config) {
            alert('Unknown error occured. Please try reloading the page.');
        });
    };
}]);
eventbee.filter('range', function() {
    return function(input, max, min) {
        max = parseInt(max);
        min = parseInt(min);
        for (var i = min; i < max; i++) {
            input.push(i);
        }
        return input;
    };
});