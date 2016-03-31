angular.module('eventbee.controller.tickets', [])
.controller('tickets', ['$scope', '$http', '$location', '$timeout', '$rootScope', '$window','$sce','$filter','$interval',
    function($scope, $http, $location, $timeout, $rootScope, $window,$sce,$filter,$interval) {
    $scope.data = "";
    $scope.currency = '';
    $scope.loadingMetadata = true;
    $scope.displayBtn=false;

     if ($location.search().eid && !isNaN($location.search().eid)){
        $http.get( $rootScope.baseUrl + 'getEventMetaData.jsp?api_key=123&event_id=' + $rootScope.eid)
        .success(function(data, status, headers, config) {
            $scope.data = data;
            $rootScope.isSeatingEvent = data.has_seating;
            $scope.loadingMetadata = false;
             if (!$scope.data.is_recurring)
                loadTicketsData($rootScope.baseUrl + 'getEventTickets.jsp?api_key=123&seating_enable='+$rootScope.isSeatingEvent+'&event_id=' + $location.search().eid + ($location.search().tid ? '&transaction_id=' + $location.search().tid : ''));
                
        })
        .error(function(data, status, headers, config) {
            alert('Unknown error occured. Please try reloading the page.');
        });
     }else{
        $scope.loadingMetadata = false;
        $scope.data.message = 'Event unavailable';
     }

     var loadTicketsData =  function(url){
        $scope.loadingMetadata = true;
        $http.get(url)
        .success(function(data,status,headers,config){
            $scope.tickets = data;
            $scope.data.currency = data.currency;
            $scope.loadingMetadata = false;
            $scope.displayBtn = true;
        })
        .error(function(data,status,headers,config){

        });
     }
    
    $scope.displayTickets = function() {
        $scope.loadingMetadata = true;
        var get_tickets = $http.get($rootScope.baseUrl + 'getEventTickets.jsp?api_key=123&event_id=' + $rootScope.eid + '&event_date=' + encodeURIComponent($scope.date_selected));
        get_tickets.success(function(data, status, headers, config) {
            $scope.tickets = data;
            $scope.data.currency = data.currency;
            $scope.loadingMetadata = false;
            $scope.displayBtn = true;
        });
        get_tickets.error(function(data, status, headers, config) {
            alert('Unknown error occured. Please try reloading the page.');
        });
    };
    
    $scope.total = function() {
        var total = 0;
        $scope.tickt=$scope.tickets;
        angular.forEach($scope.tickets.items, function(item, index) {
            if (item.is_donation == 'n') {
                total += (parseFloat(item.charging_price) + parseFloat(item.charging_fee)) * parseFloat(item.ticket_selected);
            } else if (item.is_donation == 'y') {
                if (item.donation_amount) total += parseFloat(item.donation_amount);
            }
        });
       
        return total;
    };
    
}])
.filter('range', function() {
    return function(input, max, min) {
        max = parseInt(max);
        min = parseInt(min);
        for (var i = min; i <= max; i++) {
            input.push(i);
        }
        return input;
    };
    var ticketsSelected = 0;
    angular.forEach($scope.data.items, function(item, index) {
        if (item.type == 'ticket') {
            if (item.is_donation == 'n')
                if (item.ticket_selected > 0) ticketsSelected++;
        }
    });
    return ticketsSelected > 0;
});