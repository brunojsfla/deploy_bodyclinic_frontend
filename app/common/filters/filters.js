(function(){
    app.filter('cpf', function(){
        return function(cpf){
            return cpf.substr(0, 3) + '.' + cpf.substr(3, 3) + '.' + cpf.substr(6, 3) + '-' + cpf.substr(9,2);
        };
    });
    app.filter('telCelular', function(){
        return function(value){
            return '(' + value.substr(0, 2) + ')' + value.substr(2, 5) + '-' + value.substr(7, 4);
        }
    });
    app.filter('telFixo', function(){
        return function(value){
            return '(' + value.substr(0, 2) + ')' + value.substr(2, 4) + '-' + value.substr(6, 4);
        }
    });
    app.filter('hora', function(){
        return function(value){
            if(value < 10)
                return '0'+ value + ':00';
            else
                return value + ':00';
        }
    });
    app.filter('horaAtendimento', function(){
        return function(value){
            return value.substr(0, 2) + ':' + value.substr(2, 3);
            
        }
    });
})();