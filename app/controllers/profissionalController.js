(function(){
    app.controller('ProfissionalCtrl', ['$http', 'urls', 'msgs', 'tabsFactory', 'bcUtils', function($http, urls, msgs, tabsFactory, bcUtils){
        const self = this;
        
        //Inicializações
        self.sexo = bcUtils.getSexo();

        self.saveProfissional = function(){
            $http.post(urls.profissionais, self.profissional).then(function(response){
                self.getProfissionais();
                msgs.msgSuccess('Profissional salvo com sucesso!');
            }, function(response){
                if(response.data.code === 11000){
                    if(response.data.errmsg.includes('cpf_1_ocupacao_1'))
                        msgs.msgError('A ocupação selecionada já existe para o profissional!');
                }else{
                    msgs.msgError(response.data.errors);
                }
                msgs.msgError(response.data.errors);
                console.error('Erro ao salvar profissional: ', response.data);
            });
        };

        self.getProfissionais = function(){
            $http.get(urls.profissionais+'?sort=dtAdmissao').then(function(response){
                console.log('Atualizando lista de profissionais...');
                self.profissional = {};
                let profissionaisAux = response.data; 
                for(let i = 0; i < profissionaisAux.length; i++){
                    $http.get(urls.ocupacoes + '/' + profissionaisAux[i].ocupacao).then(function(response){
                        for(let j = 0; j < profissionaisAux.length; j++){
                            if(response.data._id === profissionaisAux[j].ocupacao)
                                profissionaisAux[j].ocupacao = response.data;
                        }
                    }, function(response){
                        console.error('Falha ao recuperar ocupação para lista de profissionais: ', response.data);
                    });
                }
                self.profissionais = profissionaisAux;
                tabsFactory.showTabs(self, {tabList: true, tabCreate: true});
                console.log('Profissionais retornados : ' + self.profissionais.length);
                self.getOcupacoes();
            }, function(response){
                console.log('Erro ao buscar profissionais: ',  response.data.errors);
            });
        };

        self.showUpdate = function(profissional){
            self.profissional = profissional;
            self.setFieldsProfissional(profissional);
            tabsFactory.showTabs(self, {tabUpdate: true});
        };

        self.showRemove = function(profissional){
            self.profissional = profissional;
            self.setFieldsProfissional(profissional);
            tabsFactory.showTabs(self, {tabDelete: true});
        };

        self.setProfissional = function(){
            const urlUpdate = `${urls.profissionais}/${self.profissional._id}`;
            self.profissional.dtAlt = new Date();
            $http.put(urlUpdate, self.profissional).then(function(response){
                self.getProfissionais();
                msgs.msgSuccess('Profissional alterado com sucesso!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao alterar profissional: ', response.data);
            });
        };

        self.deleteProfissional = function(){
            const urlDelete = `${urls.profissionais}/${self.profissional._id}`;
            $http.delete(urlDelete, self.profissional).then(function(response){
                self.getProfissionais();
                msgs.msgSuccess('Profissional excluído com sucesso!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao excluir profissional: ', response.data);
            });
        };

        self.getOcupacoes = function(){
            $http.get(urls.ocupacoes+'?sort=nome').then(function(response){
                console.log('Atualizando lista de ocupações...');
                self.ocupacoes = {};
                self.ocupacoes = response.data;
                console.log('Ocupacões retornadas : ' + self.ocupacoes.length);
            }, function(response){
                console.log('Erro ao buscar ocupacoes: ',  response.data.errors);
            });
        };

        self.setFieldsProfissional = function(profissional){
            if(profissional){
                self.profissional.dtNasc = new Date(self.profissional.dtNasc);
                self.profissional.dtAdmissao = new Date(self.profissional.dtAdmissao);
                if(profissional.dtDemissao)
                    self.profissional.dtDemissao = new Date(self.profissional.dtDemissao);

                $http.get(urls.ocupacoes + '/' + profissional.ocupacao._id).then(function(response){
                    self.profissional.ocupacao = response.data;
                }, function(response){
                    console.error('Falha ao recuperar ocupação: ', response.data);
                });
                
            }
        };

        self.autoInsertProfissional = function(cpf){
            if(cpf < 11)
                return;
            
            $http.get(urls.profissionais+'/?cpf='+cpf).then(function(response){                
                console.log('Auto Complete profissional: ', response.data);
                self.profissional.cnsProfissional = response.data[0].cnsProfissional;
                self.profissional.nome = response.data[0].nome;
                self.profissional.dtNasc = new Date(response.data[0].dtNasc);
                self.profissional.sexo = response.data[0].sexo;
                self.profissional.crm = response.data[0].crm;
                self.profissional.telefone = response.data[0].telefone;
                self.profissional.email = response.data[0].email;
            }, function(response){
                console.error('Falha ao recuperar profissional: ', response.data);
            });   

        };

        self.getProfissionais();
    }]);
})()