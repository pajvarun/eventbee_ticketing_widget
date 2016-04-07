var eventbee = angular.module('eventbee', 
	['ngMaterial', 'ngRoute', 'ngAnimate', 'ngSanitize', 'eventbee.controller.tickets', 'eventbee.services','eventbee.controller.profile',
	'eventbee.filters']);
// GLOBAL CONFIGURATIONS
eventbee.config(['$routeProvider', '$locationProvider', '$sceDelegateProvider', '$provide', function($routeProvider, $locationProvider, $sceDelegateProvider, $provide) {
    $provide.decorator('$sniffer', ['$delegate', function($delegate) {
        $delegate.history = false;
        return $delegate;
    }]);
    $sceDelegateProvider.resourceUrlWhitelist(['self', '**']);
    //enable html5 mode
    $locationProvider.html5Mode(false);
    $routeProvider.when('/event', {
            templateUrl: 'tickets.html',
            //controller: 'tickets',
            reloadOnSearch: false
        })
        .when('/event/profile', {
            templateUrl: 'profile.html',
            controller: 'profile',
            reloadOnSearch: false
        })
                    /*.when('/event/payment', {
                        templateUrl: '/tktwidget/public/payment.html',
                        controller: 'payment',
                        reloadOnSearch: false
                    })
                    .when('/event/confirmation', {
                        templateUrl: '/tktwidget/public/confirmation.html',
                        controller: 'confirmation',
                        reloadOnSearch: false
                    })*/
        .otherwise({
            redirectTo: '/event'
        });
}]);
// ROOT SCOPE
eventbee.run(['$rootScope', '$location', '$window', '$document', '$http', function($rootScope, $location, $window, $document, $http) {
    $rootScope.back = function() {
        //alert($rootScope.pageLocation);
        if ($rootScope.pageLocation == 'Profiles') $location.path('/event');
        else if ($rootScope.pageLocation == 'Payments') {
            $location.search('tid', $rootScope.transactionId);
            $location.path('/event/profile/');
        } else if ($rootScope.pageLocation == 'Confirmation') $location.path('/event/payment/');
        else $location.path('/event');
    };
    $rootScope.baseUrl = 'http://www.citypartytix.com/tktwidget/registration/';
        $rootScope.serverAddress = 'http://www.citypartytix.com/';
    $rootScope.eid = $location.search().eid;
    $rootScope.pageLocation = 'Tickets';
    $rootScope.isSeatingEvent = false;
    $rootScope.selectDate = '';
    $rootScope.date_select='';
    $rootScope.showTimeoutBar = false;
	$rootScope.timeOutBg=false;
	$rootScope.backLinkWording = 'Back To Tickets Page';
	$rootScope.tryAgain = function(){
    	 $http.get($rootScope.serverAddress+'embedded_reg/seating/delete_temp_locked_tickets.jsp', {
             params: {
                 eid: $rootScope.eid,
                 tid: $rootScope.transactionId
             }
         }).success(function(data,status,headers,config){
        	  $window.location.href='http://localhost:8181/material/#/event?eid='+$rootScope.eid;
         	 $rootScope.timeOutBg = false;
         });
    };
	$rootScope.cancelTimeOut = function(){
    	$window.location.href='http://localhost:8181/material/#/event?eid='+$rootScope.eid;
    	$rootScope.timeOutBg = false;
    };
}]);