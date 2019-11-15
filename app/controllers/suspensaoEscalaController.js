(function(){
    app.controller('SuspensaoEscalaCtrl', ['$http', 'urls', 'msgs', 'tabsFactory', 'bcUtils', '$rootScope', function($http, urls, msgs, tabsFactory, bcUtils, $rootScope){
        const self = this;
        
        //Inicializações
        self.motivos = bcUtils.getMotivoSuspensaoEscala();
        self.diasSemana = bcUtils.getDiasSemana();

        self.sendMail = function(atendimento){
            console.log('Atendimento...', atendimento);
            console.log('Preparando e-mail...');
            //msgs.msgInfo('Preparando e-mail...');
            try {
                if(atendimento.paciente.email){
                    let dtAtendimento = new Date(atendimento.dtAtendimento);
                    let conteudo = "";
                    let diaSemana = self.diasSemana[dtAtendimento.getDay()].nome;

                    conteudo = `<b>Olá, ${atendimento.paciente.nome}!</b><br><p><i>Este é um e-mail de envio automático, não é necessário respondê-lo.</i></p>  
                    <p>Informamos que sua consulta agendadada para ${diaSemana}, ${dtAtendimento.getDate()}/${dtAtendimento.getMonth() + 1}/${dtAtendimento.getFullYear()} - ${atendimento.horaAtendimento.substr(0, 2)}:${atendimento.horaAtendimento.substr(2, 2)} hora(s),
                    com o profissional ${atendimento.profissional.nome} - ${atendimento.ocupacao.nome}, foi <strong>CANCELADA</strong>.</p>
                    <p>Att,</p>
                    <p>Equipe Body Clinic</p>`;
                    
                    let mailInfo = {from: '"Body Clinic" bodyclinichealth@gmail.com', 
                                    to: atendimento.paciente.email,
                                    cc: $rootScope.usuarioLogado.email, 
                                    subject: 'Body Clinic',
                                    html: conteudo};
                
                    $http.post(urls.email, mailInfo).then(function(response){
                        //msgs.msgSuccess('E-mail enviado com sucesso!');
                        console.log('E-mail enviado com sucesso!');
                    }).catch(function(error){
                        //msgs.msgError('Não foi possível enviar e-mail!');
                        console.error('Falha ao enviar e-mail:', error);
                    });
                }else{
                    console.log(`Não foi possível enviar pois o(a) paciente ${atendimento.paciente.nome} não possui e-mail cadastrado.`);
                }
            }
            catch(err) {
                console.error('Falha ao enviar e-mail:', err);
                //msgs.msgError('Falha ao enviar e-mail!');
            }
            
        };

        self.getAtendimentoAgendandoByProfissional = function(suspensao){
            console.log('ChangeHander Data termino:', suspensao);
            self.atendimentoAgendado = {};
            $http.get(urls.atendimentos+'/?estado=AGENDADO&profissional='+suspensao.profissional._id).then(function(response){
                // Filtro pelo período da suspensão
                self.atendimentoAgendado = response.data.filter(function(atendimento){                      
                    return new Date(atendimento.dtAtendimento) >= new Date(suspensao.dtInicio) && new Date(atendimento.dtAtendimento) <= new Date(suspensao.dtTermino);
                }, Object.create(null));

                console.log('Atendimentos na data da suspensão:', self.atendimentoAgendado);
            }, function(response){
                console.error('Erro ao buscar atendimentos agendados no período da suspensão: ',  response.data.errors);
            });

        };

        self.saveSuspensao = function(){
            // Validações
            if(Object.keys(self.suspensao).length > 0){
                
                let dtInicio = new Date(self.suspensao.dtInicio);
                let dtTermino = new Date(self.suspensao.dtTermino);
                
                //data de término ser maior que data de início
                if(dtTermino < dtInicio){
                    msgs.msgError('Data de término anterior a Data de Início.');
                    return;
                }

                //Data retroativa
                if(dtInicio < new Date().setHours(0, 0, 0, 0)){
                    msgs.msgError('Impossível criar suspensão de escala com data retroativa.');
                    return;
                }

                //suspensão para o mesmo período e mesmo profissional
                for(let i = 0; i < self.suspensoes.length; i++){
                    let dtInicioAux = new Date(self.suspensoes[i].dtInicio);
                    let dtTerminoAux = new Date(self.suspensoes[i].dtTermino);
                    if(self.suspensao.profissional._id === self.suspensoes[i].profissional._id){
                        if(dtInicio >= dtInicioAux && dtInicio <= dtTerminoAux){
                            msgs.msgError(`O profissional ${self.suspensoes[i].profissional.nome} já possui uma suspensão de escala por motivo de ${self.suspensoes[i].motivo} para o período informado.`);
                            return;
                        }
                    }
                }

                self.getAtendimentoAgendandoByProfissional(self.suspensao);
            }
                
            $http.post(urls.suspensoes, self.suspensao).then(function(response){
                //Checa o tipo do dado da resposta e marca o(s) atendimento(s) como cancelado e exclui o(s) agendamento(s)
                console.log('Atendimentos na data da suspensão no método post:', self.atendimentoAgendado);
                if(self.atendimentoAgendado){
                    if(self.atendimentoAgendado instanceof Array){
                        for(let i = 0; i < self.atendimentoAgendado.length; i++){
                            self.atendimentoAgendado[i].estado = 'CANCELADO';
                            self.atendimentoAgendado[i].dtCancelamento = new Date();
                            self.atendimentoAgendado[i].descMotivoCancelamento = 'Supensão de escala do profissional';
    
                            $http.put(urls.atendimentos+'/'+self.atendimentoAgendado[i]._id, self.atendimentoAgendado[i]).then(function(response){
                                console.log('Atendimento ' + self.atendimentoAgendado[i]._id + ' cancelado com sucesso após suspensão de escala!');
                                
                                $http.delete(urls.escalas+'/'+self.atendimentoAgendado[i].escalaAtendimento).then(function(response){
                                    console.log('Agenda excluída com sucesso após suspensão de escala');                
                                }, function(response){
                                    console.error('Erro ao excluir agenda após suspensão de escala: ', response.data);
                                }); 
                            }, function(response){
                                console.error('Erro ao cancelar atendimento: ', response.data);
                            });
                        }
                    }else{
                        self.atendimentoAgendado.estado = 'CANCELADO';
                        self.atendimentoAgendado.dtCancelamento = new Date();
                        self.atendimentoAgendado.descMotivoCancelamento = 'Supensão de escala do profissional';
    
                        $http.put(urls.atendimentos+'/'+self.atendimentoAgendado._id, self.atendimentoAgendado).then(function(response){
                            console.log('Atendimento ' + self.atendimentoAgendado._id + ' cancelado com sucesso após suspensão de escala!');
                            self.sendMail(self.atendimentoAgendado.paciente, self.atendimentoAgendado.profissional, self.atendimentoAgendado.ocupacao, self.atendimentoAgendado.dtAtendimento, self.atendimentoAgendado.horaAtendimento);
                            $http.delete(urls.escalas+'/'+self.atendimentoAgendado.escalaAtendimento).then(function(response){
                                console.log('Agenda excluída com sucesso após suspensão de escala');                
                            }, function(response){
                                console.error('Erro ao excluir agenda após suspensão de escala: ', response.data);
                            });     
                        }, function(response){
                            console.error('Erro ao cancelar atendimento: ', response.data);
                        });
                    }
                       
                }             
                self.getSuspensoes();
                msgs.msgSuccess('Suspensão de Escala salva com sucesso!');
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao salvar suspensão de escala: ', response.data);
            });
        };

        self.getSuspensoes = function(){
            //self.atendimentoAgendado = undefined;
            $http.get(urls.suspensoes+'?sort=dtInicio').then(function(response){
                console.log('Atualizando lista de suspensões de escala...');
                self.suspensao = {};
                let suspensoesAux = response.data; 
                for(let i = 0; i < suspensoesAux.length; i++){
                    $http.get(urls.profissionais + '/' + suspensoesAux[i].profissional).then(function(response){
                        for(let j = 0; j < suspensoesAux.length; j++){
                            if(response.data._id === suspensoesAux[j].profissional)
                                suspensoesAux[j].profissional = response.data;
                        }
                    }, function(response){
                        console.error('Falha ao recuperar profissional: ', response.data);
                    });
                }
                self.suspensoes = suspensoesAux;
                tabsFactory.showTabs(self, {tabList: true, tabCreate: true});
                console.log('Suspensões de escala retornadas : ' + self.suspensoes.length);
                self.getProfissionais();
            }, function(response){
                console.error('Erro ao buscar suspensões de escala: ',  response.data.errors);
            });
        };

        self.showUpdate = function(suspensao){
            self.suspensao = suspensao;
            self.setFieldsSuspensao(suspensao);
            tabsFactory.showTabs(self, {tabUpdate: true});
        };

        self.showRemove = function(suspensao){
            self.suspensao = suspensao;
            console.log('Suspensão a ser excluída: ', self.suspensao);
            self.setFieldsSuspensao(suspensao);
            tabsFactory.showTabs(self, {tabDelete: true});
        };

        self.setSuspensao = function(){
            const urlUpdate = `${urls.suspensoes}/${self.suspensao._id}`;
            $http.put(urlUpdate, self.suspensao).then(function(response){
                self.getSuspensoes();
                msgs.msgSuccess('Suspensão de Escala alterada com sucesso!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao alterar suspensao de escala: ', response.data);
            });
        };

        self.deleteSuspensao = function(){
            const urlDelete = `${urls.suspensoes}/${self.suspensao._id}`;
            $http.delete(urlDelete, self.suspensao).then(function(response){
                self.getSuspensoes();
                msgs.msgSuccess('Suspensão de escala excluída com sucesso!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao excluir suspensão de escala: ', response.data);
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
                console.log('Profissionais retornados para suspensão de escala : ' + self.profissionais.length);
            }, function(response){
                console.log('Erro ao buscar profissionais: ',  response.data.errors);
            });
        };

        self.setFieldsSuspensao = function(suspensao){
            if(suspensao){
                self.suspensao.dtInicio = new Date(self.suspensao.dtInicio);
                self.suspensao.dtTermino = new Date(self.suspensao.dtTermino);

                self.getProfissionalById(suspensao);
                
            }
        };

        // Busca profissional por _id
        self.getProfissionalById = function(suspensao){
            if(suspensao){
                $http.get(urls.profissionais + '/' + suspensao.profissional._id).then(function(response){
                    self.suspensao.profissional = response.data;
                    self.profissional = response.data;
                }, function(response){
                    console.error('Falha ao recuperar profissional: ', response.data);
                });
            }
        };

        // Busca profissional por _id
        self.getProfissionalByIdEmail = function(atendimento){
            if(atendimento){
                $http.get(urls.profissionais + '/' + atendimento.profissional).then(function(response){
                    self.atendimentoAgendado.profissional = response.data;
                }, function(response){
                    console.error('Falha ao recuperar profissional para envio do e-mail: ', response.data);
                });
            }
        };

        // Busca paciente por _id
        self.getPacienteByIdEmail = function(atendimento){
            if(atendimento){
                $http.get(urls.pacientes + '/' + atendimento.paciente).then(function(response){
                    self.atendimentoAgendado.paciente = response.data;
                }, function(response){
                    console.error('Falha ao recuperar paciente para envio de e-mail: ', response.data);
                });
            }
        };

        self.getSuspensoes();
    }]);
})()