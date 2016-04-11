angular.module('eventbee.controller.profile', []).controller('profile', ['$scope', '$http', '$location', '$timeout', '$rootScope', '$window', '$sce', '$filter', '$interval',
    function($scope, $http, $location, $timeout, $rootScope, $window, $sce, $filter, $interval) {
        try {
            $rootScope.timeWatcher();
        } catch (err) {}
        $rootScope.showTimeoutBar = false;
        $rootScope.globalTimer = $interval(function() {
            $rootScope.timeRemaining = $rootScope.millis - (+new Date);
        }, 500);
        $scope.promotions = true;
        $scope.loadingQuestions = true;
        $scope.loadingSubmit = false;
        $rootScope.pageLocation = 'Profiles';
        if ($location.search().eid) $rootScope.eid = $location.search().eid;
        else $location.url('/event');
        if ($location.search().tid) $rootScope.transactionId = $location.search().tid;
        else $location.url('/event?eid=' + $rootScope.eid);
        /* API Call */
        $http.get($rootScope.baseUrl + 'getProfileJSON.jsp', {
            params: {
                api_key: '123',
                event_id: $rootScope.eid,
                transaction_id: $rootScope.transactionId
            }
        }).success(function(data, status, headers, config) {
            $scope.profileQuestions = data;
            $rootScope.showProcess=false;
           // console.log(data);
            $scope.loadingQuestions = false;
            $rootScope.totalMinutes = Number(data.timediffrence);
            $rootScope.secondsRemaining = Number(data.secdiffrence);
            $rootScope.timeRemaining = ($rootScope.totalMinutes * 60000) + ($rootScope.secondsRemaining * 1000);
            $rootScope.millis = (+new Date) + ($rootScope.totalMinutes * 60 * 1000) + ($rootScope.secondsRemaining * 1000);
            $rootScope.showTimeoutBar = true;
            $rootScope.backLinkWording = data.backbutton;
            if (data.enablepromotion == 'false' && $scope.fromPage == 'payments') $scope.promotions = false;
            $rootScope.timeWatcher = $rootScope.$watch('timeRemaining', function(newVal, oldVal) {
                if (newVal < 0) {
                    $interval.cancel($rootScope.globalTimer);
                    $rootScope.timeWatcher();
                    $rootScope.timeOutBg = true;
                    // $window.location.href=$rootScope.serverAddress+'tktwidget/public/#/event?eid='+$rootScope.eid;
                }
            });
        }).error(function(data, status, headers, config) {
            alert('Unknown error occured. Please try reloading the page.');
        });



        $scope.allProfiles = function() {
            var allProfiles = [];
            allProfiles.push({
                ticketid: '',
                profileid: 'Buyer Information',
                copyFrom: 'buyerinfo'
            });
            angular.forEach($scope.profileQuestions.attendee_questions, function(item, index) {
                for (i = 0; i < item.profiles.length; i++) allProfiles.push({
                    ticketname: item.ticket_name,
                    ticketid: item.ticket_id,
                    profileid: 'Profile #' + (i + 1),
                    response: item.profiles[i].response
                });
            });
            return allProfiles;
        };
        
    }
])