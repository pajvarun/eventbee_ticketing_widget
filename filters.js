angular.module('eventbee.filters', [])
    .filter('timeRemainingFormatter', function($rootScope) {
        return function(input) {
            if (input < 0) return '00:00';
            var zeroPad = function(number, length) {
                var result = number.toString(),
                    pad = length - result.length;
                while (pad > 0) {
                    result = '0' + result;
                    pad--;
                }
                return result;
            }
            var hours = Math.floor(input / 36e5),
                minutes = Math.floor((input % 36e5) / 6e4),
                seconds = Math.floor((input % 6e4) / 1000);
            if (hours > 0)
                return zeroPad(hours, 2) + ':' + zeroPad(minutes, 2) + ':' + zeroPad(seconds, 2);
            return zeroPad(minutes, 2) + ':' + zeroPad(seconds, 2);
        }
    })