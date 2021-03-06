(function() {
    "use strict";

    var module = angular.module('bgDirectives', []);

    module.directive('bgSplitter', function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                orientation: '@'
            },
            template: '<div class="split-panes {{orientation}}" ng-transclude></div>',
            controller: function ($scope, $element) {
                $scope.panes = [];
                
                this.addPane = function(pane){
                    if ($scope.panes.length > 1) 
                        throw 'splitters can only have two panes';
                    $scope.panes.push(pane);
                    return $scope.panes.length;
                };

                $scope.getSize = function(index){
                    var pane = $scope.panes[index - 1];
                    var vertical = $scope.orientation == 'vertical';
                    return vertical ? pane.elem.css("height") : pane.elem.css("width");
                }

                $scope.setSize = function(pane, size){
                    var pane1 = $scope.panes[0];
                    var pane2 = $scope.panes[1];
                    var pane1size = 0;
                    if (pane==1){
                        if (vertical){
                            var parheight = pane1.elem[0].parentNode.offsetHeight;
                            pane1size = parheight-size;
                        }
                        else{
                            pane1size = size;
                        }
                    }
                    if (pane==2) {
                        if (vertical){
                            pane1size = size;
                        }
                        else{
                            var parwidth = pane1.elem[0].parentNode.offsetWidth;
                            pane1size = parwidth-size;
                        }
                    }
                    var handler = $scope.handler;
                    var vertical = $scope.orientation == 'vertical';
                    if (vertical) {
                        initLOrT = 'bottom';
                        initWOrH = 'height';
                        handler.css(initLOrT, pane1size + 'px');
                        pane1.elem.css(initLOrT, pane1size + 'px');
                        pane2.elem.css(initWOrH, pane1size + 'px');
                    } else {
                        initLOrT = 'left';
                        initWOrH = 'width';
                        handler.css(initLOrT, pane1size + 'px');
                        pane1.elem.css(initWOrH, pane1size + 'px');
                        pane2.elem.css(initLOrT, pane1size + 'px');
                    }
                };
            },
            link: function(scope, element, attrs) {
                var handler = angular.element('<div class="split-handler"></div>');
                scope.handler = handler;
                var pane1 = scope.panes[0];
                var pane2 = scope.panes[1];
                var vertical = scope.orientation == 'vertical';
                var pane1Min = pane1.minSize || 0;
                var pane2Min = pane2.minSize || 0;
                var drag = false;
                
                pane1.elem.after(handler);
     
                var initPane1 = (!isNaN(pane1.initSize));
                var initPane2 = (!isNaN(pane2.initSize));
                var initLOrT;
                var initWOrH;
                
                if (vertical) {
                    if (initPane1) {
                        var pane1Height = pane1.elem[0].parentNode.offsetHeight + bottom;
                        var pane2Height = pane2.elem[0].parentNode.offsetHeight + bottom;
                        var bottom = pane1.initSize;
                        var height = pane2Height + (pane1Height - bottom);
                        handler.css("bottom", bottom + 'px');
                        pane1.elem.css("bottom", bottom + 'px');
                        pane2.elem.css("height", pane2.initSize);
                    }
                    else if (initPane2) {
                        var pane1Height = pane1.elem[0].parentNode.offsetHeight + bottom;
                        var pane2Height = pane2.elem[0].parentNode.offsetHeight + bottom;
                        var height = pane2.initSize;
                        var bottom = pane1Height + (pane2Height - height);
                        handler.css("bottom", bottom + 'px');
                        pane1.elem.css("bottom", bottom + 'px');
                        pane2.elem.css("height", pane2.initSize);
                    }
                } else {
                    // TODO
                    if (initPane2) {
                        var parwidth = pane1.elem[0].parentNode.offsetWidth;
                        pane1initsize = parwidth-pane2.initSize;
                        handler.css("left", pane1initsize + 'px');
                        pane1.elem.css("width", pane1initsize + 'px');
                        pane2.elem.css("left", pane1initsize + 'px');
                    }
                }
                element.bind('mousemove', function (ev) {
                    if (!drag) return;
                    
                    var bounds = element[0].getBoundingClientRect();
                    var pos = 0;
                    
                    if (vertical) {
                        var height = bounds.bottom - bounds.top;
                        pos = ev.clientY - bounds.top;

                        if (pos < pane1Min) return;
                        if (height - pos < pane2Min) return;

                        handler.css('top', pos + 'px');
                        pane1.elem.css('height', pos + 'px');
                        pane2.elem.css('top', pos + 'px');
                        pane2.elem.css('height', (height - pos) + 'px');
            
                    } else {

                        var width = bounds.right - bounds.left;
                        pos = ev.clientX - bounds.left;

                        if (pos < pane1Min) return;
                        if (width - pos < pane2Min) return;

                        handler.css('left', pos + 'px');
                        pane1.elem.css('width', pos + 'px');
                        pane2.elem.css('left', pos + 'px');
                    }
                });
        
                handler.bind('mousedown', function (ev) { 
                    ev.preventDefault();
                    drag = true; 
                });
        
                angular.element(document).bind('mouseup', function (ev) {
                    drag = false;
                });
            }
        };
    });

    module.directive('bgPane', function() {
        return {
            restrict: 'E',
            require: '^bgSplitter',
            replace: true,
            transclude: true,
            scope: {
                minSize: '=',
                initSize: '=',
                setSize: '='
            },
            template: '<div class="split-pane{{index}}" ng-transclude></div>',
            link: function(scope, element, attrs, bgSplitterCtrl) {
                scope.elem = element;
                scope.index = bgSplitterCtrl.addPane(scope);
            }
        };
    });
})();
