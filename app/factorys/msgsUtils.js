(function(){
    app.factory('msgs', ['toastr', function(toastr){

        function addMsg(msgs, titulo, metodo){
            if(msgs instanceof Array){
                msgs.forEach(msg => {
                    toastr[metodo](msg, titulo);
                });
            }else{
                toastr[metodo](msgs, titulo);
            }
        };
        
        function msgSuccess(msg){
            addMsg(msg, 'Sucesso', 'success');
        };

        function msgError(msg){
            addMsg(msg, 'Erro', 'error');
        };

        function msgWarning(msg){
            addMsg(msg, 'Atenção', 'warning');
        };

        function msgInfo(msg){
            addMsg(msg, 'Informação', 'info');
        };

        return { msgSuccess, msgError, msgWarning, msgInfo };
        
    }]);
})();