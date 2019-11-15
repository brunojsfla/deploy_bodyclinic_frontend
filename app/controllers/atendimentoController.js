(function(){
    app.controller('AtendimentoCtrl', ['$http', 'urls', 'msgs', 'tabsFactory', 'bcUtils', '$rootScope', function($http, urls, msgs, tabsFactory, bcUtils, $rootScope){
        const self = this;

        //Inicializações
        self.questaoBinaria = bcUtils.getQuestaoBinaria();
        self.resultado = bcUtils.getTipoResultadoExame();
        self.estadosAtendimento = bcUtils.getEstadoAtendimento();
        self.filter = {};
        self.filter.dtInicio = new Date();
        self.filter.dtFinal = new Date();

        self.sendMail = function(atendimento, type){
            console.log('Atendimento via e-mail...', atendimento);
            console.log('Preparando e-mail...');
            msgs.msgInfo(`Preparando e-mail...`);
            try {
                if(atendimento.paciente.email){
                    let dtAtendimento = new Date(atendimento.dtAtendimento);
                    let conteudo = "";
                    let anexo = {};
                    let exames = "";
                    let medicamentos = "";
                    if(type === 'receituario'){
                        for(let i = 0; i < atendimento.receituario.length; i++){
                            medicamentos += '- ' + atendimento.receituario[i].medicamento.nomeGenerico + ' | Intruções: ' + atendimento.receituario[i].instrucoes + '\n'; 
                        }
                        conteudo = `<b>Olá, ${atendimento.paciente.nome}!</b><br><p><i>Este é um e-mail de envio automático, não é necessário respondê-lo.</i></p>
                        <p>Foi emitido um receituário no seu atendimento de ID ${atendimento._id} em ${dtAtendimento.getDate()}/${dtAtendimento.getMonth() + 1}/${dtAtendimento.getFullYear()}.
                        O mesmo segue anexo para download. Em caso de dúvidas, entre em contato com o profissional responsável, que segue em cópia neste e-mail.</p>
                        <p>Att,</p>
                        <p>Equipe Body Clinic</p>`;
    
                        anexo = {   
                            filename: 'Receituario.txt',
                            content: `                                             RECEITUÁRIO
                            Paciente: ${atendimento.paciente.nome}
                            
                            ${medicamentos}
                            
                                ------------------------------------------
                            ${atendimento.profissional.nome} - ${atendimento.ocupacao.nome}/ CRM: ${atendimento.profissional.crm}`
                        };
                    }
                    if(type === 'avaliacao'){
                        for(let i = 0; i < atendimento.examesAvaliados.length; i++){
                            exames += '- ' + atendimento.examesAvaliados[i].procedimento.nome + ' | Data de Avaliação: ' + atendimento.examesAvaliados[i].dtResultado.getDate() +'/'+ (atendimento.examesAvaliados[i].dtResultado.getMonth() + 1) + '/' + atendimento.examesAvaliados[i].dtResultado.getFullYear() + ' | Resultado: ' + atendimento.examesAvaliados[i].resultado + '\n'; 
                        }
                        conteudo = `<b>Olá, ${atendimento.paciente.nome}!</b><br><p><i>Este é um e-mail de envio automático, não é necessário respondê-lo.</i></p>
                        <p>Foi emitida uma avaliação de exame(s) no seu atendimento de ID ${atendimento._id} em ${dtAtendimento.getDate()}/${dtAtendimento.getMonth() + 1}/${dtAtendimento.getFullYear()}.
                        A mesma segue anexa para download. Em caso de dúvidas, entre em contato com o profissional responsável, que segue em cópia neste e-mail.</p>
                        <p>Att,</p>
                        <p>Equipe Body Clinic</p>`;
    
                        anexo = {   
                            filename: 'ExamesAvaliados.txt',
                            content: `                                             AVALIAÇÃO DE EXAMES
                            Paciente: ${atendimento.paciente.nome}
                            
                            ${exames}
                            
                                ------------------------------------------
                            ${atendimento.profissional.nome} - ${atendimento.ocupacao.nome}/ CRM: ${atendimento.profissional.crm}`
                        };
                    }
                    
                    let mailInfo = {from: '"Body Clinic" bodyclinichealth@gmail.com', 
                                    to: atendimento.paciente.email,
                                    cc: $rootScope.usuarioLogado.email, 
                                    subject: 'Body Clinic',
                                    //text: `Olá, ${atendimento.paciente.nome}! Segue abaixo seu receituário `,
                                    html: conteudo,
                                    attachments: [anexo]
                    };
                
                    $http.post(urls.email, mailInfo).then(function(response){
                        msgs.msgSuccess('E-mail enviado com sucesso!');
                        console.log('E-mail enviado com sucesso!');
                    }).catch(function(error){
                        msgs.msgError('Não foi possível enviar e-mail!');
                        console.error('Falha ao enviar e-mail:', error);
                    });
                }else{
                    msgs.msgError(`Não foi possível enviar pois o(a) paciente ${atendimento.paciente.nome} não possui e-mail cadastrado.`);
                }
            }
            catch(err) {
                console.error('Falha ao enviar e-mail:', err);
                msgs.msgError('Falha ao enviar e-mail!');
            }
            
        };

        self.clearFilters = function(){
            self.filter.dtInicio = new Date();
            self.filter.dtFinal = new Date();
            self.filter.estado = undefined;
            self.filter.paciente = undefined;
            if($rootScope.usuarioLogado.perfil !== 'PROFISSIONAL'){
                self.filter.profissional = undefined;
                self.getAtendimentos();
            }else{
                self.getAtendimentosByProfissional();
            }
        };

        self.saveAtendimento = function(){
            if(self.atendimento.estado = 'AGENDADO'){
                self.atendimento.estado = 'CONCLUÍDO';
                $http.put(urls.atendimentos+'/'+self.atendimento._id, self.atendimento).then(function(response){
                    if($rootScope.usuarioLogado.perfil !== 'PROFISSIONAL'){
                        self.getAtendimentos();
                    }else{
                        self.getAtendimentosByProfissional();
                    }
                    msgs.msgSuccess('Atendimento salvo com sucesso!');
                }, function(response){
                    msgs.msgError(response.data.errors);
                    console.error('Erro ao salvar atendimento: ', response.data);
                });
            }else{
                self.atendimento.estado = 'CONCLUÍDO';
                $http.post(urls.atendimentos, self.atendimento).then(function(response){
                    if(!$rootScope.usuarioLogado.perfil !== 'PROFISSIONAL'){
                        self.getAtendimentos();
                    }else{
                        self.getAtendimentosByProfissional();
                    };
                    msgs.msgSuccess('Atendimento salvo com sucesso!');
                }, function(response){
                    msgs.msgError(response.data.errors);
                    console.error('Erro ao salvar atendimento: ', response.data);
                });
            }            
        };

        self.getAtendimentosByProfissional = function(obj){
            $http.get(urls.profissionais+'?cpf='+$rootScope.usuarioLogado.cpf).then(function(response){
                console.log('Atualizando profissional logado...');
                self.profissionalLogado = {};
                
                if(response.data instanceof Array){
                    self.profissionalLogado = response.data[0];
                }else{
                    self.profissionalLogado = response.data;
                }
                $http.get(urls.atendimentos+'?sort=dtAtendimento&profissional='+self.profissionalLogado._id).then(function(response){
                    console.log('Atualizando lista de atendimentos...');
                    
                    self.atendimento = {examesAvaliados: [{}], examesSolicitados: [{}], receituario: [{}]};
                    let atendimentoAux = response.data; 
                    for(let i = 0; i < atendimentoAux.length; i++){
                        //Paciente
                        $http.get(urls.pacientes + '/' + atendimentoAux[i].paciente).then(function(response){
                            for(let j = 0; j < atendimentoAux.length; j++){
                                if(response.data._id === atendimentoAux[j].paciente)
                                    atendimentoAux[j].paciente = response.data;
                            }
                        }, function(response){
                            console.error('Falha ao recuperar paciente para lista de atendimento: ', response.data);
                        });
    
                        //Profissional
                        $http.get(urls.profissionais + '/' + atendimentoAux[i].profissional).then(function(response){
                            for(let j = 0; j < atendimentoAux.length; j++){
                                if(response.data._id === atendimentoAux[j].profissional)
                                    atendimentoAux[j].profissional = response.data;
                            }
                        }, function(response){
                            console.error('Falha ao recuperar profissional para lista de atendimento: ', response.data);
                        });
    
                        //Ocupação
                        $http.get(urls.ocupacoes + '/' + atendimentoAux[i].ocupacao).then(function(response){
                            for(let j = 0; j < atendimentoAux.length; j++){
                                if(response.data._id === atendimentoAux[j].ocupacao)
                                    atendimentoAux[j].ocupacao = response.data;
                            }
                        }, function(response){
                            console.error('Falha ao recuperar ocupação para lista de atendimento: ', response.data);
                        });
                    }
    
                    console.log('Aplicando filtros para pesquisa...');
                    console.log('Filtros...', obj);
                    if(obj){
                        atendimentoAux = response.data.filter(function(atendimento){
                            let isDtInicio = (obj.dtInicio ? true : false);
                            let isDtFinal = (obj.dtFinal ? true : false);
                            let isEstado = (obj.estado ? true : false);
                            let isPaciente = (obj.paciente ? true : false);                           
    
                            return (isDtInicio&&isDtFinal ? new Date(atendimento.dtAtendimento) >= new Date(obj.dtInicio).setHours(0, 0) && new Date(atendimento.dtAtendimento) <= new Date(obj.dtFinal).setHours(23, 59) : atendimento)
                                && (isEstado ? atendimento.estado === obj.estado.nome : atendimento) 
                                && (isPaciente ? atendimento.paciente === obj.paciente._id : atendimento);
                                //&& (atendimento.profissional === self.profissionalLogado._id);
                        }, Object.create(null));
    
                    }
    
                    if(obj && atendimentoAux.length < 1){
                        msgs.msgInfo('A pesquisa não encontrou resultados com  base nos paramêtros informados.');
                    }
    
                    self.atendimentos = atendimentoAux;
                    tabsFactory.showTabs(self, {tabList: true});
                    self.atendimento.dtAtendimento = new Date();
                    //Inicalização dos objetos necessários
                    self.getProfissionais();
                    self.getPacientes();
                    self.getMedicamentos();
                    self.getProcedimentos();
                    console.log('Atendimentos retornados : ' + self.atendimentos.length);
                }, function(response){
                    console.log('Erro ao buscar atendimentos: ',  response.data.errors);
                });
                
                console.log('Profissional logado: ' + self.profissionalLogado);
            }, function(response){
                console.log('Erro ao buscar profissional logado: ',  response.data.errors);
            });            
        };

        self.getAtendimentos = function(obj){
            $http.get(urls.atendimentos+'?sort=dtAtendimento').then(function(response){
                console.log('Atualizando lista de atendimentos...');
                
                self.atendimento = {examesAvaliados: [{}], examesSolicitados: [{}], receituario: [{}]};
                let atendimentoAux = response.data; 
                for(let i = 0; i < atendimentoAux.length; i++){
                    //Paciente
                    $http.get(urls.pacientes + '/' + atendimentoAux[i].paciente).then(function(response){
                        for(let j = 0; j < atendimentoAux.length; j++){
                            if(response.data._id === atendimentoAux[j].paciente)
                                atendimentoAux[j].paciente = response.data;
                        }
                    }, function(response){
                        console.error('Falha ao recuperar paciente para lista de atendimento: ', response.data);
                    });

                    //Profissional
                    $http.get(urls.profissionais + '/' + atendimentoAux[i].profissional).then(function(response){
                        for(let j = 0; j < atendimentoAux.length; j++){
                            if(response.data._id === atendimentoAux[j].profissional)
                                atendimentoAux[j].profissional = response.data;
                        }
                    }, function(response){
                        console.error('Falha ao recuperar profissional para lista de atendimento: ', response.data);
                    });

                    //Ocupação
                    $http.get(urls.ocupacoes + '/' + atendimentoAux[i].ocupacao).then(function(response){
                        for(let j = 0; j < atendimentoAux.length; j++){
                            if(response.data._id === atendimentoAux[j].ocupacao)
                                atendimentoAux[j].ocupacao = response.data;
                        }
                    }, function(response){
                        console.error('Falha ao recuperar ocupação para lista de atendimento: ', response.data);
                    });
                }

                console.log('Aplicando filtros para pesquisa...');
                console.log('Filtros...', obj);
                if(obj){
                    atendimentoAux = response.data.filter(function(atendimento){
                        let isDtInicio = (obj.dtInicio ? true : false);
                        let isDtFinal = (obj.dtFinal ? true : false);
                        let isEstado = (obj.estado ? true : false);
                        let isProfissional = (obj.profissional ? true : false);
                        let isPaciente = (obj.paciente ? true : false);                           

                        return (isDtInicio&&isDtFinal ? new Date(atendimento.dtAtendimento) >= new Date(obj.dtInicio).setHours(0, 0) && new Date(atendimento.dtAtendimento) <= new Date(obj.dtFinal).setHours(23, 59) : atendimento)
                            && (isEstado ? atendimento.estado === obj.estado.nome : atendimento) 
                            && (isProfissional ? atendimento.profissional == obj.profissional._id : atendimento) 
                            && (isPaciente ? atendimento.paciente == obj.paciente._id : atendimento);
                    }, Object.create(null));

                }

                if(obj && atendimentoAux.length < 1){
                    msgs.msgInfo('A pesquisa não encontrou resultados com  base nos paramêtros informados.');
                }

                self.atendimentos = atendimentoAux;
                tabsFactory.showTabs(self, {tabList: true});
                self.atendimento.dtAtendimento = new Date();
                //Inicalização dos objetos necessários
                self.getProfissionais();
                self.getPacientes();
                self.getMedicamentos();
                self.getProcedimentos();
                console.log('Atendimentos retornados : ' + self.atendimentos.length);
            }, function(response){
                console.log('Erro ao buscar atendimentos: ',  response.data.errors);
            });
        };

        self.showEdit = function(atendimento){
            if((new Date() < new Date(atendimento.dtAtendimento))){
                msgs.msgWarning('Data do atendimento superior a data atual');
                return;
            }

            if((new Date().getFullYear() == new Date(atendimento.dtAtendimento).getFullYear() &&
                new Date().getMonth() == new Date(atendimento.dtAtendimento).getMonth() &&
                new Date().getDate() == new Date(atendimento.dtAtendimento).getDate()) &&
                (new Date().getHours() < parseInt(atendimento.horaAtendimento.substr(0, 2)))){
                
                msgs.msgWarning('Hora de atendimento superior a hora atual');
                return;
            }
            self.atendimento = atendimento;
            self.setFieldsAtendimento(atendimento);
            tabsFactory.showTabs(self, {tabCreate: true});
        };

        self.showView = function(atendimento){
            self.atendimento = atendimento;
            self.setFieldsAtendimento(atendimento);
            console.log('Atendimento...', atendimento);
            tabsFactory.showTabs(self, {tabUpdate: true});
        };

        self.showCancel = function(atendimento){
            self.atendimento = atendimento;
            self.setFieldsAtendimento(atendimento);
            tabsFactory.showTabs(self, {tabDelete: true});
        }

        self.setFieldsAtendimento = function(atendimento){
            if(atendimento){
                // Seta Datas
                self.atendimento.dtAtendimento = new Date(atendimento.dtAtendimento);
                self.atendimento.paciente.dtNasc = new Date(atendimento.paciente.dtNasc);
                if(atendimento.dtCancelamento)
                    self.atendimento.dtCancelamento = new Date(atendimento.dtCancelamento);
                self.atendimento.dtSaida = new Date(atendimento.dtSaida);
                if(atendimento.dtRetorno)
                    self.atendimento.dtRetorno = new Date(atendimento.dtRetorno);
                // Seta Objetos
                self.getProfissionalById(atendimento);
                self.getOcupacaoById(atendimento);
                self.getPacienteById(atendimento);
                self.calcImc(atendimento.peso, atendimento.altura);
                self.getExameAvaliadoById(atendimento);
                self.getExameSolicitadoById(atendimento);
                self.getMedicamentoById(atendimento);
                
            }else{
                console.log('Nenhum atendimento selecionado');
            }
        };

        self.cancelAtendimento = function(){
            if(!self.atendimento.dtCancelamento || !self.atendimento.descMotivoCancelamento){
                msgs.msgError('Por favor, informe a data e o motivo do cancelamento.');
                return;
            }
            self.atendimento.estado = 'CANCELADO';
            const urlUpdate = `${urls.atendimentos}/${self.atendimento._id}`;
            $http.put(urlUpdate, self.atendimento).then(function(response){
                if($rootScope.usuarioLogado.perfil !== 'PROFISSIONAL'){
                    self.getAtendimentos();
                }else{
                    self.getAtendimentosByProfissional();
                }
                msgs.msgSuccess('Atendimento cancelado com sucesso!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao cancelar atendimento: ', response.data);
            });
        };

        self.getProfissionais = function(){
            $http.get(urls.profissionais+'?sort=nome').then(function(response){
                console.log('Atualizando lista de profissionais ativos...');
                self.profissionais = {};
                // Filtro para profissionais somente com vínculo ativo
                let profissionaisAtivos = response.data.filter(function(profissional){
                    return !profissional.dtDemissao;
                }, Object.create(null));
                // Remove profissionais ativos e com mais de um vínculo 
                self.profissionais = profissionaisAtivos.filter(function(profissional){
                    console.log('Stringify: ', JSON.stringify(profissional));
                    return !this[JSON.stringify(profissional.cpf)] && (this[JSON.stringify(profissional.cpf)] = true) && !profissional.dtDemissao;
                }, Object.create(null));

                /*if($rootScope.usuarioLogado.perfil === 'PROFISSIONAL'){
                    self.profissionais = self.profissionais.filter(function(profissional){
                        return profissional.cpf === $rootScope.usuarioLogado.cpf;
                    }, Object.create(null));

                }*/
                console.log('Profissionais retornados para atendimento: ' + self.profissionais.length);
            }, function(response){
                console.log('Erro ao buscar profissionais: ',  response.data.errors);
            });
        };

        self.getOcupacoesByProfissional = function(profissional){
            if(profissional){
                $http.get(urls.ocupacoes + `/?_id=${profissional.ocupacao}&sort=nome`).then(function(response){
                    self.ocupacoes = {};
                    self.ocupacoes = response.data;
                    console.log('Ocupações retornadas: ', self.ocupacoes.length);
                    }, function(response){
                    console.error('Falha ao localizar OCUPAÇÕES DO PROFISSIONAL: ', response.data);
                    });
            }else{
                console.log('Nenhum profissional selecionado');
            }
        };

        // Busca profissional por _id
        self.getProfissionalById = function(atendimento){
            if(atendimento){
                $http.get(urls.profissionais + '/' + atendimento.profissional._id).then(function(response){
                    self.atendimento.profissional = response.data;
                }, function(response){
                    console.error('Falha ao recuperar profissional para visualização e cancelamento: ', response.data);
                });
            }
        };

        // Busca ocupação por _id
        self.getOcupacaoById = function(atendimento){
            if(atendimento){
                $http.get(urls.ocupacoes + '/' + atendimento.ocupacao._id).then(function(response){
                    self.getOcupacoesByProfissional(self.atendimento.profissional);
                    self.atendimento.ocupacao = response.data;
                }, function(response){
                    console.error('Falha ao recuperar ocupação para visulização e cancelamento: ', response.data);
                });
            }
        };

        // Busca paciente por _id
        self.getPacienteById = function(atendimento){
            if(atendimento){
                $http.get(urls.pacientes + '/' + atendimento.paciente._id).then(function(response){
                    self.atendimento.paciente = response.data;
                    self.getFieldsByPaciente(self.atendimento.paciente);
                }, function(response){
                    console.error('Falha ao recuperar profissional para visualização e cancelamento: ', response.data);
                });
            }
        };

        // Busca medicamento por _id
        self.getMedicamentoById = function(atendimento){
            if(atendimento){
                for(let i = 0;  i < atendimento.receituario.length; i++){
                    if(atendimento.receituario[i].medicamento){
                        $http.get(urls.medicamentos + '/' + atendimento.receituario[i].medicamento).then(function(response){
                            self.atendimento.receituario[i].medicamento = response.data;
                        }, function(response){
                            console.error('Falha ao recuperar medicamento para visualização e cancelamento: ', response.data);
                        });
                    }
                }
            }
        };

        // Busca exames solicitados por _id
        self.getExameSolicitadoById = function(atendimento){
            if(atendimento){
                for(let i = 0;  i < atendimento.examesSolicitados.length; i++){
                    if(atendimento.examesSolicitados[i].procedimento){
                        $http.get(urls.procedimentos + '/' + atendimento.examesSolicitados[i].procedimento).then(function(response){
                            self.atendimento.examesSolicitados[i].procedimento = response.data;
                        }, function(response){
                            console.error('Falha ao recuperar exame solicitado para visualização e cancelamento: ', response.data);
                        });
                    }
                }
            }
        };

         // Busca exames avaliados por _id
         self.getExameAvaliadoById = function(atendimento){
            if(atendimento){
                for(let i = 0;  i < atendimento.examesAvaliados.length; i++){
                    if(atendimento.examesAvaliados[i].procedimento){
                        self.atendimento.examesAvaliados[i].dtResultado = new Date(atendimento.examesAvaliados[i].dtResultado);
                        $http.get(urls.procedimentos + '/' + atendimento.examesAvaliados[i].procedimento).then(function(response){
                            self.atendimento.examesAvaliados[i].procedimento = response.data;
                        }, function(response){
                            console.error('Falha ao recuperar exame avaliado para visualização e cancelamento: ', response.data);
                        });
                    }
                }
            }
        };

        // Retorna pacientes
        self.getPacientes = function(){
            $http.get(urls.pacientes).then(function(response){
                console.log('Atualizando lista de pacientes...', response);
                self.pacientes = {};
                self.pacientes = response.data;
                console.log('Pacientes retornados para atendimento: ' + self.pacientes.length);
            }, function(response){
                console.log('Erro ao buscar pacientes: ',  response.data.errors);
            });
        };

        // Seta dados do paciente
        self.getFieldsByPaciente = function(paciente){
            if(paciente){    
                self.atendimento.paciente.dtNasc = new Date(paciente.dtNasc);
                self.atendimento.paciente.sexo = paciente.sexo;
            }
        };

        // Retorna medicamentos
        self.getMedicamentos = function(){
            $http.get(urls.medicamentos).then(function(response){
                console.log('Atualizando lista de medicamentos...', response);
                self.medicamentos = {};
                self.medicamentos = response.data;
                console.log('Medicamentos retornados: ' + self.medicamentos.length);
            }, function(response){
                console.log('Erro ao buscar medicamentos: ',  response.data.errors);
            });
        };

        self.removeDuplicateMedicamento = function(index, receituario){
            if(self.atendimento.receituario.length > 1){
                for(var i = 0; i < index; i++){
                    if(self.atendimento.receituario[i].medicamento._id === receituario.medicamento._id){
                        msgs.msgError('O medicamento informado já consta no receituário!');
                        self.atendimento.receituario.splice(index, 1);
                        return;
                    }
                }
            }
        };

        self.calcImc = function(peso, altura){
            if(peso && altura){
                console.log('Calculando IMC...');
                let pesoAux = parseFloat(peso);
                let alturaAux = parseFloat(altura) / 100;
                let aux = pesoAux / (alturaAux * alturaAux);
                aux = aux.toFixed(2);
                if(aux < 18.5)
                    self.imc = aux + ' - Magreza';
                else
                    if(aux >= 18.5 && aux < 25)
                        self.imc = aux + ' - Normal';
                    else
                        if(aux >= 25 && aux < 30)
                            self.imc = aux + ' - Sobrepeso';
                        else
                            if(aux >= 30 && aux < 40)
                                self.imc = aux + ' - Obesidade';
                            else
                                if(aux > 40)
                                    self.imc = aux + ' - Obesidade Grave';
                console.log('IMC calculado com sucesso!', self.imc);
            }else
                self.imc = 0;
        };

        // Retorna procedimentos
        self.getProcedimentos = function(){
            $http.get(urls.procedimentos+'?sort=nome').then(function(response){
                console.log('Atualizando lista de procedimentos...', response);
                self.procedimentos = {};
                self.procedimentos = response.data;
                console.log('Procedimentos retornados: ' + self.procedimentos.length);
            }, function(response){
                console.log('Erro ao buscar procedimentos: ',  response.data.errors);
            });
        };

        self.removeDuplicateExameSolicitado = function(index, exame){
            if(self.atendimento.examesSolicitados.length > 1){
                for(var i = 0; i < index; i++){
                    if(self.atendimento.examesSolicitados[i].procedimento._id === exame.procedimento._id){
                        msgs.msgError('O exame informado já consta para solicitação!');
                        self.atendimento.examesSolicitados.splice(index, 1);
                        return;
                    }
                }
            }
        };

         self.removeDuplicateObjects = function(index, obj, item){
            switch(obj){
                case 'receituario':
                    if(self.atendimento.receituario.length > 1){
                        for(var i = 0; i < index; i++){
                            if(self.atendimento.receituario[i].medicamento._id === item.medicamento._id){
                                msgs.msgError('O medicamento informado já consta no receituário!');
                                self.atendimento.receituario.splice(index, 1);
                                return;
                            }
                        }
                    }
                    break;
                case 'exameSol':
                    if(self.atendimento.examesSolicitados.length > 1){
                        for(var i = 0; i < index; i++){
                            if(self.atendimento.examesSolicitados[i].procedimento._id === item.procedimento._id){
                                msgs.msgError('O exame informado já consta para solicitação!');
                                self.atendimento.examesSolicitados.splice(index, 1);
                                return;
                            }
                        }
                    }
                    break;
                case 'exameAval':
                    if(self.atendimento.examesAvaliados.length > 1){
                        for(var i = 0; i < index; i++){
                            if(self.atendimento.examesAvaliados[i].procedimento._id === item.procedimento._id){
                                msgs.msgError('O exame informado já consta para avaliação!');
                                self.atendimento.examesAvaliados.splice(index, 1);
                                return;
                            }
                        }
                    }
                    break;
                default:
                    return;
            }
            
            
        };

        self.addObject = function(index, obj){
            switch(obj){
                case 'receituario':
                    self.atendimento.receituario.splice(index + 1, 0, {});
                    break;
                case 'exameSol':
                    self.atendimento.examesSolicitados.splice(index + 1, 0, {});
                    break;
                case 'exameAval':
                    self.atendimento.examesAvaliados.splice(index + 1, 0, {});
                    break;
                default:
                    return;
            }
            
        };

        self.removeObject = function(index, obj){
            switch(obj){
                case 'receituario':
                    if(self.atendimento.receituario.length > 1)
                        self.atendimento.receituario.splice(index, 1);
                    break;
                case 'exameSol':
                    if(self.atendimento.examesSolicitados.length > 1)
                        self.atendimento.examesSolicitados.splice(index, 1);
                    break;
                case 'exameAval':
                    if(self.atendimento.examesAvaliados.length > 1)
                        self.atendimento.examesAvaliados.splice(index, 1);
                    break;
                default:
                    return;
            }
            
        };

        self.clearObjects = function(obj){
            switch(obj){
                case 'receituario':
                    self.atendimento.receituario = [{}];
                    break;
                case 'exameSol':
                    self.atendimento.examesSolicitados = [{}];
                    break;
                case 'exameAval':
                    self.atendimento.examesAvaliados = [{}];
                    break;
                default:
                    return;
            }
        
        };
        if($rootScope.usuarioLogado.perfil === 'PROFISSIONAL'){
            self.getAtendimentosByProfissional();
        }else{
            self.getAtendimentos();
        }
    }]);
})()