angular.module('eventbee.controller.tickets', []).controller('tickets', ['$scope', '$http', '$location', '$timeout', '$rootScope', '$window', '$sce', '$filter', '$interval', '$anchorScroll',
        function($scope, $http, $location, $timeout, $rootScope, $window, $sce, $filter, $interval, $anchorScroll) {
            $scope.data = "";
            $scope.currency = '';
            $scope.loadingMetadata = true;
            $scope.displayBtn = false;
            $scope.eventDate = '';
            $scope.loadSeating = false;
            $scope.allSectionObj = {};
            $scope.venuePath = '';
            $scope.venueName = '';
            $scope.feecolrequeired = 'Y';
            $scope.showDesc = '';
            $scope.showGroupDesc = '';
            $scope.allTickets = [];
            $scope.availabelTickets = [];
            $scope.tickets = {
                items: []
            };
            if ($location.search().eid && !isNaN($location.search().eid)) {
                $http.get($rootScope.baseUrl + 'getEventMetaData.jsp?api_key=123&event_id=' + $rootScope.eid).success(function(data, status, headers, config) {
                    $scope.data = data;
                    $rootScope.isSeatingEvent = data.has_seating;
                    $scope.venueid = data.venueid;
                    $scope.loadingMetadata = false;
                    if (!$scope.data.is_recurring) loadTicketsData($rootScope.temUrl + 'getEventTickets.jsp?api_key=123&seating_enable=' + $rootScope.isSeatingEvent + '&event_id=' + $location.search().eid + ($location.search().tid ? '&transaction_id=' + $location.search().tid : ''));
                    else {
                        $scope.$watch('date_selected', function(newVal, oldVal) {
                            if (newVal == null) {
                                $scope.tickets = {
                                    items: []
                                };
                            }
                            $scope.seatingdata = {
                                allsections: []
                            };
                            $scope.seats = {};
                            $scope.noofcols = '';
                            $scope.noofrows = '';
                            $scope.backgroundCSS = {};
                            if (newVal) {
                                $scope.eventDate = newVal;
                                $rootScope.selectDate = newVal;
                                if ($location.search().evtDate == newVal) loadTicketsData($rootScope.temUrl + 'getEventTickets.jsp?api_key=123&seating_enable=' + $rootScope.isSeatingEvent + '&event_id=' + $location.search().eid + '&event_date=' + encodeURIComponent(newVal) + ($location.search().tid ? '&transaction_id=' + $location.search().tid : ''));
                                else loadTicketsData($rootScope.temUrl + 'getEventTickets.jsp?api_key=123&seating_enable=' + $rootScope.isSeatingEvent + '&event_id=' + $location.search().eid);
                            }
                        });
                    }
                }).error(function(data, status, headers, config) {
                    alert('Unknown error occured. Please try reloading the page.');
                });
            } else {
                $scope.loadingMetadata = false;
                $scope.data.message = 'Event unavailable';
            }
            $scope.discountAppliedFromURL = false;
            $scope.ticketGroups = {};
            $scope.$watch('tickets', function(newval) {
                angular.forEach(newval.items, function(item) {
                    if (item.type == 'group') {
                        angular.forEach(item.tickets, function(grouptkt) {
                            $scope.ticketGroups[grouptkt.id] = item.name;
                        });
                    }
                });
            });
            var loadTicketsData = function(url) {
                $scope.loadingMetadata = true;
                $http.get(url).success(function(data, status, headers, config) {
                    $scope.tickets = data;
                    $scope.data.currency = data.currency;
                    $scope.loadingMetadata = false;
                    $scope.showDesc = $scope.tickets.ticket_desc_mode != 'collapse';
                    $scope.showGroupDesc = $scope.tickets.ticket_group_desc_mode != 'collapse';
                    if ($scope.tickets.items.length == 0) $scope.displayBtn = false;
                    else $scope.displayBtn = true;
                    $scope.feecolrequeired = data.feecolrequeired;
                    //discount 
                    if (!$scope.discountAppliedFromURL && $location.search().discountCode) {
                        $scope.discountCode = $location.search().discountCode;
                        $timeout(function() {
                            $scope.applyDiscount();
                        });
                        $scope.discountAppliedFromURL = true;
                    }
                    var temp = $scope.discountsData;
                    $timeout(function() {
                        $scope.discountsData = {};
                    });
                    $timeout(function() {
                        $scope.discountsData = temp;
                    });
                    // seating
                    if ($rootScope.isSeatingEvent) {
                        $scope.loadSeating = true;
                        $http.get('http://192.168.1.85/tktwidget/registration/getSeatingInfo.jsp?&timestamp=' + new Date().getTime(), {
                            params: {
                                eid: $rootScope.eid,
                                tid: $location.search().tid,
                                venueid: $scope.venueid,
                                evtdate: $scope.eventDate
                            }
                        }).success(function(seatingdata, seatingstatus, seatingheaders, seatingconfig) {
                            $scope.loadSeating = false;
                            $scope.seatingdata = seatingdata;
                            $scope.allSections = seatingdata.allsectionid;
                            $scope.seatSectionId = seatingdata.allsectionid[0];
                            $scope.sectionId = seatingdata.allsectionid[0];
                            $scope.venuePath = seatingdata.venuepath;
                            $scope.venueName = seatingdata.venuelinklabel;
                            $scope.allSectionObj = seatingdata.allsectionidnames;
                            $scope.seats = seatingdata.allsections[0];
                            $scope.backgroundCSS = {
                                    'background-image': 'url(' + $scope.seats.background_image + ')'
                                },
                                $scope.noofcols = seatingdata.allsections[0].noofcols;
                            $scope.noofrows = seatingdata.allsections[0].noofrows;
                        })
                    }
                }).error(function(data, status, headers, config) {});
            }
            $scope.gotoSeatingsection = function() {
                $('html, body').animate({
                    scrollTop: $('#seatingsection').offset().top
                }, 700);
            };
            $scope.getQtyOptions = function(min, max, tktSelected) {
                var options = [0];
                try {
                    var tempMin = parseInt(min);
                    var tempMax = parseInt(max);
                    if (tempMin == 0 && tempMax == 0 && parseInt(tktSelected) > 0) {
                        for (var j = 1; j <= parseInt(tktSelected); j++) options.push(parseInt(j));
                        return options;
                    }
                    for (var i = tempMin; i <= tempMax && tempMax != 0; i++) options.push(parseInt(i));
                } catch (err) {}
                return options;
            };
            $scope.total = function() {
                var total = 0;
                angular.forEach($scope.tickets.items, function(item, index) {
                    if (item.type == 'ticket') {
                        if (item.is_donation == 'n') {
                            total += (parseFloat(item.charging_price) + parseFloat(item.charging_fee)) * parseFloat(item.ticket_selected);
                        } else if (item.is_donation == 'y') {
                            if (item.donation_amount) total += parseFloat(item.donation_amount);
                        }
                    } else if (item.type == 'group') {
                        angular.forEach(item.tickets, function(item, index) {
                            if (item.is_donation == 'n') {
                                total += (parseFloat(item.charging_price) + parseFloat(item.charging_fee)) * parseFloat(item.ticket_selected);
                            } else if (item.is_donation == 'y') {
                                if (item.donation_amount) total += parseFloat(item.donation_amount);
                            }
                        });
                    }
                });
                return total;
            };
            $scope.isEmpty = function(obj) {
                return angular.equals({}, obj);
            };
            $scope.parseFloat = function(value) {
                return parseFloat(value);
            };
            // discounts
            $scope.discountsData = {};
            $scope.loadingDiscount = false;
            $scope.applyDiscount = function() {
                if (!$scope.discountCode) {
                    $scope.discountsData = {};
                    return;
                }
                $scope.loadingDiscount = true;
                var trasactionid = '';
                if ($location.search().tid) trasactionid = $location.search().tid;
                $http.get($rootScope.baseUrl + 'applyDiscount.jsp', {
                    params: {
                        api_key: '123',
                        event_id: $location.search().eid,
                        code: $scope.discountCode,
                        tid: trasactionid,
                        evtdate: $scope.eventDate
                    }
                }).success(function(data, status, headers, config) {
                    //alert("the data is::"+JSON.stringify(data));
                    $scope.discountsData = data;
                    $scope.loadingDiscount = false;
                    if (data.status == 'fail') $scope.discountApplied = false;
                    else $scope.discountApplied = true;
                }).error(function(data, status, headers, config) {});
            };
            $scope.$watch('discountsData', function(newValue, oldValue) {
                angular.forEach($scope.tickets.items, function(ticketItem, index) {
                    if (ticketItem.type == "ticket") {
                        ticketItem.charging_price = ticketItem.actual_price;
                        ticketItem.charging_fee = ticketItem.actual_fee;
                    }
                    if (ticketItem.type == "group") {
                        angular.forEach(ticketItem.tickets, function(ticketItem, index) {
                            ticketItem.charging_price = ticketItem.actual_price;
                            ticketItem.charging_fee = ticketItem.actual_fee;
                        });
                    }
                });
                angular.forEach(newValue.disc_details, function(discount, index) {
                    angular.forEach($scope.tickets.items, function(ticketItem, index) {
                        if (ticketItem.type == "ticket") {
                            if (ticketItem.id == discount.ticketid) ticketItem.charging_price = discount.final_price;
                            if (parseFloat(ticketItem.charging_price) == 0) ticketItem.charging_fee = "0.00";
                        }
                        if (ticketItem.type == "group") {
                            angular.forEach(ticketItem.tickets, function(ticketItem, index) {
                                if (ticketItem.id == discount.ticketid) ticketItem.charging_price = discount.final_price;
                                if (parseFloat(ticketItem.charging_price) == 0) ticketItem.charging_fee = "0.00";
                            });
                        }
                    });
                });
            });
            //seating
            $scope.hideSeatDetails = function() {
                $scope.showPopup = false;
            };
            $scope.getSectionsLength = function() {
                return Object.keys($scope.allSectionObj).length;
            };
            $scope.getColSize = function() {
                var colTemp = [];
                var i = Number($scope.noofcols);
                var tempi = i + 1;
                for (i = 1; i < tempi; i++) {
                    colTemp.push(i);
                }
                return colTemp;
            };
            $scope.getRowSize = function() {
                var rowTemp = [];
                var i = Number($scope.noofrows);
                var tempi = i + 1;
                for (i = 1; i < tempi; i++) {
                    rowTemp.push(i);
                }
                return rowTemp;
            };

            function isTicketExists(seat) {
                var isexits = false;
                for (var i = 0; i < seat.ticketids.length; i++) {
                    if ($scope.allTickets.indexOf(seat.ticketids[i]) > -1) {
                        isexits = true;
                        break;
                    }
                }
                return isexits;
            }
            $scope.pushTickets = function(tktId, availabilityMsg) {
                $scope.allTickets.push(tktId);
                if (availabilityMsg == '') {
                    $scope.availabelTickets.push(tktId);
                }
            };
            var getAvaiTickets = function(seat) {
                var applicableTids = seat.ticketids;
                var temp = '<ul>';
                for (var tktid in applicableTids) {
                    if ($scope.allTickets.indexOf(applicableTids[tktid]) > -1 && getTicketMsg(applicableTids[tktid])) {
                        var groupName = $scope.ticketGroups[applicableTids[tktid]] == undefined ? "" : " (" + $scope.ticketGroups[applicableTids[tktid]] + ")";
                        temp = temp + '<li>' + $scope.seats.completeseats.ticketnameids[applicableTids[tktid]] + '' + groupName + '</li>';
                    }
                }
                temp = temp + '</ul>';
                return temp;
            };

            function isTicketAvailable(seat) {
                var isexits = false;
                for (var i = 0; i < seat.ticketids.length; i++)
                    if ($scope.availabelTickets.indexOf(seat.ticketids[i]) > -1) return true;
                return isexits;
            }

            function getTicketMsg(tktid) {
                var isMsg = false;
                if ($scope.availabelTickets.indexOf(tktid) > -1) isMsg = true;
                return isMsg;
            }
            $scope.getSeatImage = function(seat) {
                if (seat) {
                    if (seat.type) {
                        if (seat.type == 'NA') {
                            return $rootScope.serverAddress + '/main/images/seatingimages/lightgray_blank.png';
                        } else {
                            if (seat.type.indexOf('SO') > -1) {
                                return $rootScope.serverAddress + '/main/images/seatingimages/lightgray_sold.png';
                            } else {
                                if (seat.type.indexOf('Hold') > -1) return $rootScope.serverAddress + '/main/images/seatingimages/lightgray_exclaimation.png';
                                var found = isTicketExists(seat);
                                if (found) return $rootScope.serverAddress + '/main/images/seatingimages/' + seat.type + '.png';
                                else return $rootScope.serverAddress + '/main/images/seatingimages/lightgray_blank.png';
                            }
                        }
                    } else {
                        return $rootScope.serverAddress + '/main/images/seatingimages/lightgray_blank.png';
                    }
                }
            };
            $scope.clickSeat = function(seat, seatIndex) {
                if (seat && seat.type && !(seat.type.indexOf('SO') > -1) && !(seat.type.indexOf('Hold') > -1) && !(seat.type.indexOf('NA') > -1) && seat.ticketids && isTicketAvailable(seat)) {
                    var tktids = removeNotAvailableTickets(seat.ticketids);
                    if (tktids.length > 1) {
                        var topPos = $window.pageYOffset + 140;
                        if (seat.seatSelected) {
                            seat.seatSelected = false;
                            var radio = "<p style='text-align:left;'>&nbsp;&nbsp;This seat is assigned to multiple Ticket Types, &nbsp;select one</p><a id='imgclose'><img src='/home/images/images/close.png' class='imgclosefortkt'></a>";
                            radio = radio + "<table>";
                            for (var i = 0; i < tktids.length; i++) {
                                var tktID = tktids[i];
                                var groupName = $scope.ticketGroups[tktID] == undefined ? "" : " (" + $scope.ticketGroups[tktID] + ")";
                                radio = radio + "<tr><td valign='top' align='left'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type='radio' name='selticketid' id='selticketid' value='" + tktID + "'></td><td valign='top' align='left'> " + $scope.seats.completeseats.ticketnameids[tktID] + " " + groupName + "</td></tr>";
                            }
                            radio = radio + "</table>";
                            radio = radio + "<br/><center><input type='button' value='Select Ticket' id='accept'>&nbsp;&nbsp;<input type='button' value='Cancel' id='reject' ></center><br/>";
                            document.getElementById('attendeeloginpopup').innerHTML = radio;
                            if (document.getElementById("backgroundPopup")) {
                                document.getElementById("backgroundPopup").style.display = "block";
                                var body = document.body,
                                    html = document.documentElement;
                                var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                                document.getElementById("backgroundPopup").style.height = height + 'px';
                            }
                            document.getElementById('attendeeloginpopup').style.display = "block";
                            document.getElementById('attendeeloginpopup').style.width = '336px';
                            document.getElementById('attendeeloginpopup').style.height = 'auto';
                            document.getElementById('attendeeloginpopup').style.top = topPos + 'px';
                            document.getElementById('attendeeloginpopup').style.left = '30%';
                            document.getElementById('attendeeloginpopup').style.padding = 0;
                            document.getElementById('reject').onclick = rejectclose;
                            document.getElementById('imgclose').onclick = rejectclose;
                            document.getElementById('accept').addEventListener("click", function() {
                                acceptclose(seat, seatIndex);
                            }, false);
                            document.getElementById('attendeeloginpopup').style.backgroundColor = '#FFFFFF';
                            document.getElementById('attendeeloginpopup').style.display = "block";
                        } else {
                            $scope.getSelectedTicketid(seat.selectedTkt, 'removeseat', seat, seatIndex);
                        }
                    } else {
                        if (seat.seatSelected) {
                            $scope.getSelectedTicketid(tktids[0], 'addseat', seat, seatIndex);
                        } else {
                            $scope.getSelectedTicketid(tktids[0], 'removeseat', seat, seatIndex);
                        }
                    }
                }
            };

            function removeNotAvailableTickets(seattkts) {
                var tktIDs = [];
                for (var i = seattkts.length - 1; i >= 0; i--)
                    if ($scope.availabelTickets.indexOf(seattkts[i]) > -1) tktIDs.push(seattkts[i]);
                return tktIDs;
            }
            $scope.getSelectedTicketid = function(selectedId, type, seat, seatIndex) {
                angular.forEach($scope.tickets.items, function(eachItem, index) {
                    if (eachItem.type == 'ticket') {
                        if (selectedId == eachItem.id) {
                            if (type == 'addseat') {
                                if (eachItem.ticket_selected < eachItem.max) {
                                    eachItem.ticket_selected = eachItem.ticket_selected + 1;
                                    seat.selectedTkt = selectedId;
                                    if (eachItem.seatIndexes) eachItem.seatIndexes.push(seatIndex);
                                    else {
                                        eachItem.seatIndexes = [];
                                        eachItem.seatIndexes.push(seatIndex);
                                    }
                                    if (eachItem.min > eachItem.ticket_selected) alert("for \"" + eachItem.name + "\", you need to select minimum of " + eachItem.min + " seats");
                                } else {
                                    alert("maximum quantity reached for \"" + eachItem.name + "\" ticket type ");
                                    seat.seatSelected = false;
                                    seat.selectedTkt = '';
                                }
                            } else {
                                eachItem.ticket_selected = eachItem.ticket_selected - 1;
                                eachItem.ticket_selected = eachItem.ticket_selected <= 0 ? 0 : eachItem.ticket_selected;
                                seat.selectedTkt = '';
                                eachItem.seatIndexes.splice(eachItem.seatIndexes.indexOf(seatIndex), 1);
                                if (eachItem.min > 1 && eachItem.min > eachItem.ticket_selected) alert("you need to select mininmum of " + eachItem.min + " for \"" + eachItem.name + "\" ticket type");
                            }
                        }
                    } else {
                        angular.forEach(eachItem.tickets, function(eachTktInGroup, grpIndex) {
                            if (eachTktInGroup.id == selectedId) {
                                if (type == 'addseat') {
                                    if (eachTktInGroup.ticket_selected < eachTktInGroup.max) {
                                        eachTktInGroup.ticket_selected = eachTktInGroup.ticket_selected + 1;
                                        seat.selectedTkt = selectedId;
                                        if (eachTktInGroup.seatIndexes) eachTktInGroup.seatIndexes.push(seatIndex);
                                        else {
                                            eachTktInGroup.seatIndexes = [];
                                            eachTktInGroup.seatIndexes.push(seatIndex);
                                        }
                                        if (eachTktInGroup.min > eachTktInGroup.ticket_selected) alert("for \"" + eachTktInGroup.name + "\", you need to select minimum of " + eachTktInGroup.min + " seats");
                                    } else {
                                        alert("maximum quantity reached for \"" + eachTktInGroup.name + "\" ticket type ");
                                        seat.seatSelected = false;
                                        seat.selectedTkt = '';
                                    }
                                } else {
                                    eachTktInGroup.ticket_selected = eachTktInGroup.ticket_selected - 1;
                                    eachTktInGroup.ticket_selected = eachTktInGroup.ticket_selected <= 0 ? 0 : eachTktInGroup.ticket_selected;
                                    seat.selectedTkt = '';
                                    eachTktInGroup.seatIndexes.splice(eachTktInGroup.seatIndexes.indexOf(seatIndex), 1);
                                    if (eachTktInGroup.min > 1 && eachTktInGroup.min > eachTktInGroup.ticket_selected) alert("you need to select mininmum of " + eachTktInGroup.min + " for \"" + eachTktInGroup.name + "\" ticket type");
                                }
                            }
                        });
                    }
                });
                $timeout(function() {});
            };
            $scope.showSeatDetails = function(seat, mouseevent) {
                $scope.showPopup = true;
                if (seat) {
                    $scope.popupStyle = {
                        position: 'absolute',
                        left: (mouseevent.pageX + 5) + 'px',
                        top: (mouseevent.pageY + 5) + 'px'
                    };
                    if (seat.type && isTicketExists(seat) && isTicketAvailable(seat)) {
                        if (seat.type.indexOf('SO') > -1) {
                            $scope.tooltipHtml = '&nbsp;Seat Number : ' + seat.seatcode + '&nbsp;<br/><font color=#FF0000><b>&nbsp;Sold Out</b></font>';
                        } else if (seat.type.indexOf('Hold') > -1) {
                            $scope.tooltipHtml = '&nbsp;Seat Number : ' + seat.seatcode + '&nbsp;<br/><font color=#FF0000><b>&nbsp;This seat is currently on hold</b></font>';
                        } else if (seat.type == 'NA') {
                            $scope.tooltipHtml = '&nbsp;Seat Number : ' + seat.seatcode + '&nbsp;<br/><font color=#FF0000><b>&nbsp;Not Available</b></font>';
                        } else {
                            var currentlyselectedTkt = '';
                            if (seat.selectedTkt && seat.selectedTkt != '') {
                                var groupName = $scope.ticketGroups[seat.selectedTkt] == undefined ? "" : " (" + $scope.ticketGroups[seat.selectedTkt] + ")";
                                var tktname = $scope.seats.completeseats.ticketnameids[seat.selectedTkt];
                                currentlyselectedTkt = '<b>&nbsp;<u><br/>&nbsp;Current Selection:</u></b><br/><ul><li>' + tktname + '' + groupName + '</li></ul></br>';
                            }
                            $scope.tooltipHtml = '&nbsp;Seat Number : ' + seat.seatcode + '&nbsp;' + currentlyselectedTkt + '<br/><b>&nbsp;<u>Available for Tickets:</u></b>&nbsp;' + getAvaiTickets(seat);
                        }
                    } else {
                        if (seat.type && seat.type.indexOf('SO') > -1) $scope.tooltipHtml = '&nbsp;Seat Number : ' + seat.seatcode + '&nbsp;<br/><font color=#FF0000><b>&nbsp;Sold Out</b></font>';
                        else $scope.tooltipHtml = '&nbsp;Seat Number : ' + seat.seatcode + '&nbsp;<br/><font color=#FF0000><b>&nbsp;Not Available</b></font>';
                    }
                } else $scope.showPopup = false;
            };
            $scope.getImageCss = function(seat) {
                if (seat.type && isTicketExists(seat) && isTicketAvailable(seat)) {
                    if (seat.type.indexOf('SO') > -1 || seat.type.indexOf('Hold') > -1 || seat.type == 'NA') return false;
                    else return true;
                } else return false;
            };

            function rejectclose(seat) {
                if (document.getElementById("backgroundPopup")) document.getElementById("backgroundPopup").style.display = 'none';
                document.getElementById('attendeeloginpopup').style.display = "none";
            }

            function acceptclose(seat, seatIndex) {
                var selectedtktid = '';
                var selticktemp = document.getElementsByName('selticketid');
                if (document.getElementById("backgroundPopup")) document.getElementById("backgroundPopup").style.display = 'none';
                document.getElementById('attendeeloginpopup').style.display = "none";
                for (var i = 0; i < selticktemp.length; i++) {
                    if (selticktemp[i].checked) {
                        selectedtktid = selticktemp[i].value;
                    }
                }
                if (selectedtktid != '') {
                    seat.seatSelected = true;
                    $scope.getSelectedTicketid(selectedtktid, 'addseat', seat, seatIndex);
                }
            }
        }
    ])
    /*.filter('range', function() {
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
    })*/
;