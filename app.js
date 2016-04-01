var eventbee = angular.module('eventbee', [
    'ngMaterial',
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'eventbee.controller.tickets',
    'eventbee.services']);
// GLOBAL CONFIGURATIONS
eventbee.config(['$routeProvider', '$locationProvider', '$sceDelegateProvider','$provide', function($routeProvider, $locationProvider, $sceDelegateProvider,$provide){
    $provide.decorator('$sniffer', ['$delegate', function ($delegate) {
        $delegate.history = false;
        return $delegate;
        }]);
    
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            '**'
    ]);
        //enable html5 mode
        $locationProvider.html5Mode(false);

        $routeProvider
            .when('/event', {
                templateUrl: 'tickets.html',
                //controller: 'tickets',
                reloadOnSearch: false
            })/*
            .when('/event/profile', {
                templateUrl: '/tktwidget/public/profile.html',
                controller: 'profile',
                reloadOnSearch: false
            })
            .when('/event/payment', {
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
eventbee.run(['$rootScope','$location','$window','$document','$http', function($rootScope,$location,$window,$document,$http){
    $rootScope.back = function() {
        //alert($rootScope.pageLocation);
        if($rootScope.pageLocation == 'Profiles')
            $location.path('/event');
        else if($rootScope.pageLocation == 'Payments'){
            $location.search('tid',$rootScope.transactionId);
            $location.path('/event/profile/');
        }else if($rootScope.pageLocation == 'Confirmation')
            $location.path('/event/payment/');
        else
            $location.path('/event');
        };

        $rootScope.baseUrl = 'http://192.168.1.85/tktwidget/registration/';
        $rootScope.serverAddress = 'http://192.168.1.85/';
        $rootScope.eid = $location.search().eid;
        $rootScope.pageLocation = 'Tickets';
        $rootScope.isSeatingEvent = false;
        $rootScope.selectDate = '';
}]);