(function(){
    app.factory('bcUtils', [function(){

        function getSexo(){
            let sexo = [];

            sexo.push({valor: 0, nome: 'MASCULINO'});
            sexo.push({valor: 1, nome: 'FEMININO'});

            return sexo;
        };

        function getPerfil(){
            let perfil = [];

            perfil.push({valor: 0, nome: 'ADMINISTRADOR'});
            perfil.push({valor: 1, nome: 'PROFISSIONAL'});
            perfil.push({valor: 2, nome:'AUXILIAR'});

            return perfil;
        };

        function getTipoLogradouro(){
            let tipoLogradouro = [];

            tipoLogradouro.push('VILA'); 
            tipoLogradouro.push('LARGO');
            tipoLogradouro.push('TRAVESSA');
            tipoLogradouro.push('VIELA'); 
            tipoLogradouro.push('LOTEAMENTO'); 
            tipoLogradouro.push('PÁTIO'); 
            tipoLogradouro.push('VIADUTO'); 
            tipoLogradouro.push('AREA');  
            tipoLogradouro.push('VIA'); 
            tipoLogradouro.push('AEROPORTO'); 
            tipoLogradouro.push('VEREDA'); 
            tipoLogradouro.push('DISTRITO'); 
            tipoLogradouro.push('VALE'); 
            tipoLogradouro.push('NÚCLEO'); 
            tipoLogradouro.push('TREVO'); 
            tipoLogradouro.push('FAZENDA');                    
            tipoLogradouro.push('TRECHO'); 
            tipoLogradouro.push('ESTRADA'); 
            tipoLogradouro.push('SÍTIO'); 
            tipoLogradouro.push('FEIRA'); 
            tipoLogradouro.push('SETOR'); 
            tipoLogradouro.push('MORRO'); 
            tipoLogradouro.push('RUA'); 
            tipoLogradouro.push('CHÁCARA'); 
            tipoLogradouro.push('RODOVIA');   
            tipoLogradouro.push('RESIDENCIAL'); 
            tipoLogradouro.push('AVENIDA'); 
            tipoLogradouro.push('COLÔNIA'); 
            tipoLogradouro.push('RECANTO'); 
            tipoLogradouro.push('QUADRA'); 
            tipoLogradouro.push('PRAÇA'); 
            tipoLogradouro.push('CONDOMÍNIO');
            tipoLogradouro.push('PASSARELA'); 
            tipoLogradouro.push('PARQUE'); 
            tipoLogradouro.push('ESPLANADA'); 
            tipoLogradouro.push('LAGOA'); 
            tipoLogradouro.push('FAVELA'); 
            tipoLogradouro.push('LADEIRA'); 
            tipoLogradouro.push('LAGO'); 
            tipoLogradouro.push('CONJUNTO'); 
            tipoLogradouro.push('JARDIM'); 
            tipoLogradouro.push('ESTAÇÃO'); 
            tipoLogradouro.push('CAMPO'); 
            tipoLogradouro.push('ALAMEDA');

            tipoLogradouro.sort();

            return tipoLogradouro;

        };

        function getMotivoSuspensaoEscala(){
            let motivo = [];

            motivo.push({valor: 0, nome: 'FÉRIAS'});
            motivo.push({valor: 1, nome: 'FOLGA'});
            motivo.push({valor: 3, nome:'LUTO'});
            motivo.push({valor: 4, nome:'CONGRESSO'});
            motivo.push({valor: 5, nome:'CONDIÇÃO DE SAÚDE'});
            motivo.push({valor: 6, nome:'CONDIÇÃO DE TRABALHO'});
            motivo.push({valor: 7, nome:'DETERMINAÇÃO LEGAL'});
            motivo.push({valor: 8, nome:'OUTRO'});

            return motivo;
        };

        function getDiasSemana(){
            let diasSemana = [];

            diasSemana.push({valor: 0, nome: 'DOMINGO'});
            diasSemana.push({valor: 1, nome: 'SEGUNDA-FEIRA'});
            diasSemana.push({valor: 2, nome: 'TERÇA-FEIRA'});
            diasSemana.push({valor: 3, nome: 'QUARTA-FEIRA'});
            diasSemana.push({valor: 4, nome: 'QUINTA-FEIRA'});
            diasSemana.push({valor: 5, nome: 'SEXTA-FEIRA'});
            diasSemana.push({valor: 6, nome: 'SÁBADO'});

            return diasSemana;
        };

        function getQuestaoBinaria(){
            let sexo = [];

            sexo.push({valor: 0, nome: 'SIM'});
            sexo.push({valor: 1, nome: 'NÃO'});

            return sexo;
        };

        function getTipoResultadoExame(){
            let resultado = [];

            resultado.push({valor: 0, nome: 'NORMAL'});
            resultado.push({valor: 1, nome: 'ALTERADO'});

            return resultado;
        };

        function getEstadoAtendimento(){
            let resultado = [];

            resultado.push({valor: 0, nome: 'AGENDADO'});
            resultado.push({valor: 1, nome: 'CONCLUÍDO'});
            resultado.push({valor: 2, nome: 'CANCELADO'});

            return resultado;
        };

        function getHorariosAgenda(){
            let horarios = [];

            for(let i = 0; i < 24; i++)
                horarios.push({hora: i, paciente: 'Horário disponível', idAgendamento: 'Nenhum'});

            return horarios;
        };

        return { getSexo, getPerfil, getTipoLogradouro, getMotivoSuspensaoEscala, getDiasSemana, getQuestaoBinaria, getTipoResultadoExame, getEstadoAtendimento, getHorariosAgenda };
    }]);
})();