(function(){
    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

            $stateProvider.state('home', {
                url: "/home",
                templateUrl: "pages/home.html"
            }).state('paciente', {
                url: "/paciente",
                templateUrl: "pages/paciente.html"
            }).state('profissional', {
                url: "/profissional",
                templateUrl: "pages/profissional.html"
            }).state('atendimento', {
                url: "/atendimento",
                templateUrl: "pages/atendimento.html"
            }).state('escalaAtendimento', {
                url: "/escalaatendimento",
                templateUrl: "pages/escalaAtendimento.html"
            }).state('suspensaoEscala', {
                url: "/suspensaoescala",
                templateUrl: "pages/suspensaoEscala.html"
            }).state('agendamento', {
                url: "/agendamento",
                templateUrl: "pages/agendamento.html"
            }).state('usuario', {
                url: "/usuario",
                templateUrl: "pages/usuario.html"
            }).state('medicamento', {
                url: "/medicamento",
                templateUrl: "pages/medicamento.html"
            });

            $urlRouterProvider.otherwise('/home');
        }]).run(['$rootScope', 'authFactory', '$window', function ($rootScope, authFactory, $window) {

                const isLoginPage = window.location.pathname === '/login.html';
                const getCurrentUser = authFactory.getUser();
                console.log('Página de Login:', isLoginPage);
                console.log('Usuário corrente:', getCurrentUser);

                if(!getCurrentUser && !isLoginPage){
                    $window.location.href = '/login.html';
                }
            }
        ]);
})();