(function(){
    app.controller('EscalaAtendimentoCtrl', ['$scope', '$timeout', '$http', 'urls', 'msgs', 'tabsFactory', 'bcUtils', '$rootScope', function($scope, $timeout, $http, urls, msgs, tabsFactory, bcUtils, $rootScope){
        const self = this;
        
        //Inicializações
        self.escala = {};
        self.filter = {};
        self.horarios = [];
        self.horaAtual = new Date().getHours();
        self.dateNow = new Date();
        self.atendimento = {};
        self.diasSemana = bcUtils.getDiasSemana();

        self.sendMail = function(escala, type){
            console.log('Escala via e-mail...', escala);
            console.log('Preparando e-mail...');
            //msgs.msgInfo('Preparando e-mail...');
            try {
                if(escala.paciente.email){
                    let dtAtendimento = new Date(escala.dtAtendimento);
                    let conteudo = "";
                    let diaSemana = self.diasSemana[dtAtendimento.getDay()].nome;

                    if(type === 'agendamento'){
                        conteudo = `<b>Olá, ${escala.paciente.nome}!</b><br><p><i>Este é um e-mail de envio automático, não é necessário respondê-lo.</i></p>
                        <p>Sua consulta foi agendada com sucesso. Seguem os dados da mesma:</p>  
                        <p><b>Data da consulta:</b> ${diaSemana}, ${dtAtendimento.getDate()}/${dtAtendimento.getMonth() + 1}/${dtAtendimento.getFullYear()} - ${escala.horaInicio.substr(0, 2)}:${escala.horaInicio.substr(2, 2)} hora(s).</p>
                        <p><b>Profissional:</b> ${escala.profissional.nome} - <b>Especialidade:</b> ${escala.ocupacao.nome}.</p>
                        <p>Em caso de desistência, favor avisar com 24 horas de antecedência.</p>
                        <p>Att,</p>
                        <p>Equipe Body Clinic</p>`;
                    } 
                    
                    if(type === 'cancelamento'){
                        conteudo = `<b>Olá, ${escala.paciente.nome}!</b><br><p><i>Este é um e-mail de envio automático, não é necessário respondê-lo.</i></p>  
                        <p>Informamos que sua consulta agendadada para ${diaSemana}, ${dtAtendimento.getDate()}/${dtAtendimento.getMonth() + 1}/${dtAtendimento.getFullYear()} - ${escala.horaInicio.substr(0, 2)}:${escala.horaInicio.substr(2, 2)} hora(s),
                        com o profissional ${escala.profissional.nome} - ${escala.ocupacao.nome}, foi <strong>CANCELADA</strong>.</p>
                        <p>Att,</p>
                        <p>Equipe Body Clinic</p>`;
                    }
                    
                    let mailInfo = {from: '"Body Clinic" bodyclinichealth@gmail.com', 
                                    to: escala.paciente.email,
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
                    console.log(`Não foi possível enviar pois o(a) paciente ${escala.paciente.nome} não possui e-mail cadastrado.`);
                }
            }
            catch(err) {
                console.error('Falha ao enviar e-mail:', err);
                //msgs.msgError('Falha ao enviar e-mail!');
            }
            
        };

        //Gera vetor de horários
        self.geraHorarios = function(){
            //Verifica se existe suspensão de escala do profissional selecionado 
            self.getSuspensaoEscala(self.filter);
            
            //Varifica se a data de atendimento é inferior a data atual
            /*if(new Date(self.filter.dtAtendimento) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)){
                msgs.msgWarning('Data para agendamento fora da validade!');
                self.clearFilters();
                return;
                
            }*/

            //Verifica se o profissional foi informado
            if(!self.filter.profissional && self.filter.dtAtendimento){
                msgs.msgWarning('Por favor, selecione o profissional!');
                //self.clearFilters();
                return;
                
            }
            self.horarios = bcUtils.getHorariosAgenda();
            for(let i = 0; i < self.horarios.length; i++){
                self.getPacienteAgendado(self.filter.profissional._id, self.filter.dtAtendimento, self.horarios[i]);
            }
            
        };

        //Limpa os filtros
        self.clearFilters = function(){
            self.filter = {};
            self.horarios = [];
        };

        //Valida Horário vencido
        self.isHorarioVencido = function(horario){
            if(((horario < new Date().getHours()) 
                && (new Date().getFullYear() == new Date(self.filter.dtAtendimento).getFullYear())
                && (new Date().getMonth() == new Date(self.filter.dtAtendimento).getMonth())
                && (new Date().getDate() == new Date(self.filter.dtAtendimento).getDate()))
                ||(new Date(self.filter.dtAtendimento) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)))
                return true;
            
            return false;
        };

        //Valida Horario agendado
        self.isHorarioAgendado = function(horario){
            if(!horario.paciente.includes('Horário'))
                return true;
            
            return false;
        };

        //Valida Suspensão de Escala
        self.getSuspensaoEscala = function(filter){
            if(filter.profissional){
                console.log('Buscando suspensões de escala...');
                $http.get(urls.suspensoes+'/?profissional='+filter.profissional._id).then(function(response){
                    if(response.data.length > 0){
                        let suspensoes = [];                    
                        suspensoes = response.data;
                        for(let i = 0; i < suspensoes.length; i++){
                            if(new Date(filter.dtAtendimento) >= new Date(suspensoes[i].dtInicio) &&
                                    new Date(filter.dtAtendimento) <= new Date(suspensoes[i].dtTermino)){
                                msgs.msgInfo('Existe uma SUSPENSÃO DE ESCALA do profissional na data informada por motivo de '+ suspensoes[i].motivo);
                                self.horarios = [];
                                break;
                            }
                        }
                    }else
                        console.log('Nenhuma suspensão de escala encontrada para o profissional ' + filter.profissional.nome);
                }, function(response){
                    console.error('Erro ao buscar suspensões de escala: ',  response.data.errors);
                });
            }
        };

        //Salva a escala
        self.saveEscala = function(){
            console.log()                
            $http.post(urls.escalas, self.escala).then(function(response){
                self.start();
                self.geraHorarios();
                msgs.msgSuccess('Escala de Atendimento salva com sucesso!');
                self.sendMail(self.escala, 'agendamento');
                
                //Agenda o atendimento
                self.atendimento.escalaAtendimento = response.data._id;
                self.atendimento.estado = 'AGENDADO';
                self.atendimento.dtAtendimento = new Date(response.data.dtAtendimento);
                self.atendimento.dtSaida = new Date(response.data.dtAtendimento);
                self.atendimento.horaAtendimento = response.data.horaInicio;
                self.atendimento.profissional = response.data.profissional;
                self.atendimento.ocupacao = response.data.ocupacao;
                self.atendimento.paciente = response.data.paciente;
                self.atendimento.descQueixa = 'Queixa: ';
                self.atendimento.descDiagnostico = 'Diagnóstico: ';
                self.atendimento.receituario = [{}];
                self.atendimento.examesSolicitados = [{}];
                self.atendimento.examesAvaliados = [{}];

                $http.post(urls.atendimentos, self.atendimento).then(function(response){
                    console.log('Atendimento agendado com sucesso!');
                    msgs.msgSuccess('Atendimento agendado com sucesso!');
                }, function(response){
                    msgs.msgError(response.data.errors);
                    console.error('Erro ao criar atendimento atendimento agendado: ', response.data);
                });
            }, function(response){
                msgs.msgError('Erro ao salvar escala de atendimento: ' + response.data.errors);
                console.error('Erro ao salvar escala de atendimento: ', response.data);
            });
        };

        self.getPacienteAgendado = function(profissional, dtAtendimento, hora){         
            let dtAt = dtAtendimento.getFullYear()+'-'+(dtAtendimento.getMonth() + 1)+'-'+(dtAtendimento.getDate() < 10 ? '0'+dtAtendimento.getDate() : dtAtendimento.getDate())+'T03:00:00.000Z';
            let horaAt;
            if(hora.hora < 10)
                horaAt = '0'+hora.hora.toString()+'00';
            else
                horaAt = hora.hora.toString()+'00';
        
            $http.get(urls.escalas+'/?profissional='+profissional+'&dtAtendimento='+dtAt+'&horaInicio='+horaAt).then(function(response){
                self.escalaAux = {};
                self.escalaAux = response.data;
                console.log('Agendamento encontrado : ' + (self.escalaAux.length > 0 ? JSON.stringify(self.escalaAux) : 'Nenhum'));
                if(self.escalaAux.length > 0){
                    self.setPacienteById(self.escalaAux[0], hora);
                }
            }, function(response){
                console.error('Erro ao buscar escalas de atendimento: ',  response.data.errors);
            });
        };

        // Busca paciente por _id
        self.setPacienteById = function(id, hora){
            if(id){
                $http.get(urls.pacientes+'/'+id.paciente).then(function(response){
                    self.paciente = response.data;
                    self.horarios[hora.hora].paciente = self.paciente.nome + ' | CNS: ' + self.paciente.cns + ' | Sexo: ' + self.paciente.sexo;
                    self.horarios[hora.hora].idAgendamento = id._id;
                        
                }, function(response){
                    console.error('Falha ao recuperar paciente: ', response.data);
                });
            }
        };

        //Inicia dados
        self.start = function(){
            tabsFactory.showTabs(self, {tabList: true});
            self.getProfissionais();
            self.getPacientes();
        };

        self.showInclude = function(horario){
            console.log('Reservando horário para atendimento...', horario);
            self.escala = {};
            self.atendimento = {};
            //Verifica hora vencida
            if(self.isHorarioVencido(horario)){
                msgs.msgWarning('Escala de atendimento vencida!');
                return;
            }
            //Verifica hora reservada
            if(!horario.paciente.includes('Horário')){
                msgs.msgWarning('Horário de atendimento já reservado!');
                return;
            }            
            tabsFactory.showTabs(self, {tabCreate: true});
            console.log('Filtros para escala...', self.filter);
            self.setFieldsEscala(self.filter, horario);
        };

        self.showRemove = function(horario){
            //Valida se o horário possui paciente agendado e não pode ser liberado
            if(horario.paciente.includes('Horário')){
                msgs.msgWarning('O horário não possui paciente agendado!');
                return;
            }
            console.log('Agendamento para exclusão:', horario.idAgendamento);
            $http.get(urls.escalas+'/'+horario.idAgendamento).then(function(response){
                self.escala = {};
                self.escala = response.data;
                if(self.escala){
                    self.setFieldsEscalaDelete(self.escala, horario);
                }
            }, function(response){
                console.error('Erro ao buscar escalas de atendimento para exclusão: ',  response.data.errors);
            });
            tabsFactory.showTabs(self, {tabDelete: true});
        };

        self.setFieldsEscalaDelete = function(escala, horario){
            if(escala){
                self.getProfissionalById(escala);
                self.getOcupacaoById(escala);
                self.getPacienteById(escala);
                self.escala.dtAtendimento = new Date(escala.dtAtendimento);
                if(horario.hora < 10)
                    self.escala.horaInicio = '0'+horario.hora.toString()+'00';
                else
                    self.escala.horaInicio = horario.hora.toString()+'00';
            }
        };

        self.deleteEscala = function(){
            const urlDelete = `${urls.escalas}/${self.escala._id}`;
            $http.delete(urlDelete, self.escala).then(function(response){
                self.geraHorarios();
                self.sendMail(self.escala, 'cancelamento');
                //Cancela atendimento agendado              
                $http.get(urls.atendimentos+'/?escalaAtendimento='+self.escala._id).then(function(response){
                    self.atendimento = response.data[0];
                    console.log('Atendimento localizado:', self.atendimento);

                    self.atendimento.estado = 'CANCELADO';
                    self.atendimento.dtCancelamento = new Date();
                    self.atendimento.descMotivoCancelamento = 'Agendamento cancelado';

                    $http.put(urls.atendimentos+'/'+self.atendimento._id, self.atendimento).then(function(response){
                        console.log('Atendimento cancelado com sucesso!');    
                    }, function(response){
                        msgs.msgError('Erro ao cancelar atendimento: ' + response.data.errors);
                        console.error('Erro ao cancelar atendimento: ', response.data);
                    });                    
                }, function(response){
                    msgs.msgError(response.data.errors);
                    console.error('Erro ao localizar atendimento agendado: ', response.data);
                });
                tabsFactory.showTabs(self, {tabList: true});
                self.escala = {};
                msgs.msgSuccess('Escala de Atendimento excluída com sucesso e horário liberado para novo agendamento!');    
            }, function(response){
                msgs.msgError(response.data.errors);
                console.error('Erro ao excluir escala de atendimento: ', response.data);
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
                console.log('Profissionais retornados: ' + self.profissionais.length);
            }, function(response){
                console.log('Erro ao buscar profissionais: ',  response.data.errors);
            });
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

        self.getOcupacoesByProfissional = function(filter){
            if(filter){
                console.log('FILTER', filter);
                $http.get(urls.ocupacoes + `/?_id=${filter.ocupacao}&sort=nome`).then(function(response){
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

        self.setFieldsEscala = function(filter, horario){
            if(filter){
                console.log('Horário: ', typeof horario);
                self.getProfissionalById(filter);
                self.getOcupacoesByProfissional(filter.profissional);
                self.escala.dtAtendimento = new Date(filter.dtAtendimento);
                if(horario.hora < 10)
                    self.escala.horaInicio = '0'+horario.hora.toString()+'00';
                else
                    self.escala.horaInicio = horario.hora.toString()+'00';
            }
        };

        // Busca profissional por _id
        self.getProfissionalById = function(escala){
            if(escala){
                $http.get(urls.profissionais + '/' + (escala.profissional._id ? escala.profissional._id : escala.profissional)).then(function(response){
                    //self.getOcupacoesByProfissional(escala);
                    self.escala.profissional = response.data;
                }, function(response){
                    console.error('Falha ao recuperar profissional para exclusão: ', response.data);
                });
            }
        };

        // Busca ocupação por _id
        self.getOcupacaoById = function(escala){
            if(!escala.ocupacao._id){
                $http.get(urls.ocupacoes + '/' + (escala.ocupacao._id ? escala.ocupacao._id : escala.ocupacao)).then(function(response){
                    console.log('Teve retorno', response.data);
                    self.getOcupacoesByProfissional(escala.profissional);
                    self.escala.ocupacao = response.data;
                }, function(response){
                    console.error('Falha ao recuperar ocupação para exclusão: ', response.data);
                });
            }
        };

        // Busca paciente por _id
        self.getPacienteById = function(escala){
            if(escala){
                $http.get(urls.pacientes + '/' + escala.paciente).then(function(response){
                    self.escala.paciente = response.data;
                }, function(response){
                    console.error('Falha ao recuperar profissional para exclusão: ', response.data);
                });
            }
        };

        self.start();
    }]);
})()