(function(){
    app.controller('UsuarioCtrl', ['$http', 'urls', 'msgs', 'tabsFactory', 'bcUtils', '$rootScope', function($http, urls, msgs, tabsFactory, bcUtils, $rootScope){
        const self = this;

        //Inicializações
        self.perfil = bcUtils.getPerfil();

        self.saveUser = function(){
            $http.post(urls.usuarios, self.usuario).then(function(response){
                self.getUsers();
                msgs.msgSuccess('Usuário salvo com sucesso!');
            }, function(response){
                if(response.data.code === 11000){
                    if(response.data.errmsg.includes('cpf'))
                        msgs.msgError('O CPF informado já existe para um usuário cadastrado!');
                    if(response.data.errmsg.includes('email'))
                        msgs.msgError('O e-mail informado já existe para um usuário cadastrado!');
                }else{
                    msgs.msgError(response.data.errors);
                }
                console.error('Erro ao salvar usuário: ', response.data);
            });
        };

        self.getUsers = function(){
            $http.get(urls.usuarios).then(function(response){
                console.log('Atualizando lista de usuários...');
                self.usuario = {};
                self.usuarios = response.data;
                tabsFactory.showTabs(self, {tabList: true, tabCreate: true});
                console.log('Usuarios retornados : ' + self.usuarios.length);
            }, function(response){
                console.log('Erro ao buscar usuários: ',  response.data.errors);
            });
        };

        self.showUpdate = function(usuario){
            self.usuario = usuario;
            tabsFactory.showTabs(self, {tabUpdate: true});
        };

        self.showRemove = function(usuario){
            self.usuario = usuario;
            //msgs.msgInfo('Por favor, verifique os dados e clique no botão EXCLUIR caso queira realmente remover o usuário ou clique em CANCELAR para retornar.');
            tabsFactory.showTabs(self, {tabDelete: true});
        }

        self.setUser = function(){
            const urlUpdate = `${urls.usuarios}/${self.usuario._id}`;
            $http.put(urlUpdate, self.usuario).then(function(response){
                self.getUsers();
                msgs.msgSuccess('Usuário alterado com sucesso!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao alterar usuário: ', response.data);
            });
        };

        self.deleteUser = function(){
            const urlDelete = `${urls.usuarios}/${self.usuario._id}`;
            $http.delete(urlDelete, self.usuario).then(function(response){
                self.getUsers();
                msgs.msgSuccess('Usuário excluído com sucesso!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao excluir usuário: ', response.data);
            });
        };

        self.getUsers();
    }]);
})()