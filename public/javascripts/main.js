/**
 * @author Roman Morozov <sublimeye.ua@gmail.com>
 * @created on 28/01/15
 */
var app = angular.module('app', ['ui.router', 'ngWebSocket']);

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/home");

    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: "templates/home.html"
        })
        .state('chat', {
            url: "/chat",
            templateUrl: "templates/chat.html",
            controller: chatController
        });
});

app.filter('fromNow', function () {
    return function (input) {
        console.log(input);
        return moment(input).fromNow(true);
    }
});

app.service('data', function ($websocket, $rootScope) {
    var dataStream = $websocket('ws://localhost:8080');
    var collection;

    dataStream.onMessage(function (message) {
        collection.push(JSON.parse(message.data));
        $rootScope.$emit('ws:message');
    });

    return {
        init: function (data) {
            collection = data;
        },

        get: function () {
            return collection;
        },
        post: function (message) {
            dataStream.send(JSON.stringify(message));
        }
    };
});

function chatController($scope, $http, data, $rootScope) {
    $scope.message = '';
    $scope.messages = '';
    $scope.username = 'John' + (Math.random() * 100).toFixed();

    $rootScope.$on('ws:message', function () {
        $scope.messages = data.get();
    });

    $http.get('/messages').then(function (response) {
        data.init(response.data);
        $scope.messages = response.data;
    });

    $scope.sendMessage = function () {
        var message = {
            from: $scope.username,
            text: $scope.message,
            time: new Date()
        };

        data.post(message);
        $scope.message = '';
    }
}