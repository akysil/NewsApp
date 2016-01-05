
/* App Module */

var app = angular.module('app', ['ngRoute', 'ngAnimate']);

/* App Config */

app.config(['$routeProvider', function($routeProvider) {
    
    var routeConfig = {
        controller: 'mainCtrl',
        templateUrl: 'main.html'
    };

    $routeProvider
        .when('/', routeConfig)
        .when('/:id', routeConfig)
        .otherwise({
            redirectTo: '/'
        });
}]);

/* App Run */

app.run(['$rootScope', 'Source', function($rootScope, Source) {

    $rootScope.news = [];
    $rootScope.defaultImg = 'img/default.gif';
    
    Source
        .success(function (data, status, headers, config) {
            $rootScope.news = data.stories.splice(0,10);

            // to simulate 404 on image link
            $rootScope.news[1].thumbnail += '0';
        })
        .error(function (error, status, headers, config) {
            $rootScope.$broadcast('json_error', error, status);
        });
}]);

/* App Controllers */

app.controller('mainCtrl', ['$scope', '$routeParams', 'Go', function($scope, $routeParams, Go) {

    $scope.$watch('news', function(newVal, oldVal) {
        
        if(newVal.length) {
            
            $scope.item = {};
            var currentId = $routeParams.id || $scope.news[0].published;

            for (var i = 0; i < $scope.news.length; i++) {
                if($scope.news[i].published === +currentId) {
                    $scope.item = $scope.news[i];
                    $scope.item.i = i;
                    $scope.item.go = Go(i, $scope);
                    break;
                }
            }

            // when news is not found
            $scope.item.title = $scope.item.title || 'No such news';

            document.title = $scope.item.title;

        }
    });

    $scope.$on('json_error', function (event, error, status) {
        $scope.item = {
            title: status,
            description: error
        };
    });

}]);

/* App Directives */

// image placeholder
app.directive('realSrc', function () {
    return {
        link: function postLink(scope, element, attrs) {
            attrs.$observe('realSrc', function(newVal, oldVal) {
                if(newVal !== undefined) {
                    var img = new Image();
                    img.src = attrs.realSrc;
                    angular.element(img).bind('load', function () {
                        element.attr("src", attrs.realSrc);
                    });
                }
            });
        }
    };
});

/* App Services */

// feed getter
app.factory('Source', ['$http', function($http) {

    var httpConfig = {
        method: 'GET',
        url: 'https://gist.githubusercontent.com/scruffyfox/559a1cb1ce49fff6abb4/raw/608c02cdb8cb7c53f69401cce5b9179f9afff403/api.json'
    };

    return $http(httpConfig);

}]);


// buttons action
app.factory('Go', ['$location', function($location) {

    return function(i, $scope) {
        return function (step) {
            return $location.path('/' + $scope.news[i + step].published);
        };
    };

}]);