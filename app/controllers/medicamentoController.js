(function(){
    app.controller('MedicamentoCtrl', ['$http', 'urls', 'msgs', 'tabsFactory', 'bcUtils', function($http, urls, msgs, tabsFactory, bcUtils){
        const self = this;

        //Inicializações

        self.saveMedicamento = function(){
            $http.post(urls.medicamentos, self.medicamento).then(function(response){
                self.getMedicamentos();
                msgs.msgSuccess('Medicamento salvo com sucesso!');
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao salvar medicamento: ', response.data);
            });
        };

        self.getMedicamentos = function(){
            $http.get(urls.medicamentos).then(function(response){
                console.log('Atualizando lista de medicamentos...');
                self.medicamento = {};
                self.medicamentos = response.data;
                tabsFactory.showTabs(self, {tabList: true, tabCreate: true});
                console.log('Medicamentos retornados : ' + self.medicamentos.length);
            }, function(response){
                console.log('Erro ao buscar medicamentos: ',  response.data.errors);
            });
        };

        self.showUpdate = function(medicamento){
            self.medicamento = medicamento;
            tabsFactory.showTabs(self, {tabUpdate: true});
        };

        self.showRemove = function(medicamento){
            self.medicamento = medicamento;
            tabsFactory.showTabs(self, {tabDelete: true});
        }

        self.setMedicamento = function(){
            const urlUpdate = `${urls.medicamentos}/${self.medicamento._id}`;
            $http.put(urlUpdate, self.medicamento).then(function(response){
                self.getMedicamentos();
                msgs.msgSuccess('Medicamento alterado com sucesso!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao alterar medicamento: ', response.data);
            });
        };

        self.deleteMedicamento = function(){
            const urlDelete = `${urls.medicamentos}/${self.medicamento._id}`;
            $http.delete(urlDelete, self.medicamento).then(function(response){
                self.getMedicamentos();
                msgs.msgSuccess('Medicamento excluído com sucesso!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao excluir medicamento: ', response.data);
            });
        };

        self.getMedicamentos();
    }]);
})()