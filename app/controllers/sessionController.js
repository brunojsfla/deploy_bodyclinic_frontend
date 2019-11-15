(function(){
    app.controller('SessionController', ['$window', 'msgs', 'authFactory', '$location', 'urls', function($window, msgs, authFactory, $location, urls){
        
        const self = this;
                        
        self.login = function(){
            authFactory.login(self.user, err => err ? msgs.msgError(err) :  window.location.pathname = '/');
        };

        self.logout = function(){
            authFactory.logout(() => window.location.href = '/login.html');
        };

        self.getUser = () => authFactory.getUser();

    }]);

})()