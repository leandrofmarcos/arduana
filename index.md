- [ ] criar um ER Diagram do relacionamento das entidades para entender tudo
- [ ] tentar entender as tabelas, id, foreing keys e normalização
- [ ] usar as entidades/models e repositorio para gerar essa informação
- [ ] criar um dashboard que olha para o todo, um dashboard que fica acompanhando a aduana
- [ ] com um oraçmento é possível o cliente enviar diretamente para a aplicação, ela deve gerar um link com código enviado para o cliente, onde ele pode subir o packlist e isso inicia um orçamento de forma dinamica
- [ ] um template packlist pode ser criado durante a fase de cadastro do oraçmento abrindo o mesmo assistente do packlist cadastrando e associando ao cliente como um assistente
- [ ] todas as fases podem ser fijnalizadas sem mexer em nada.
- [ ] Aplicar mudança de linguagem, usar boa pratica de mapeamento de texto e pdoendo mudar a linguagem
- [ ] associar e trabalhar com portos nos relacionamentos
- [ ] criar na api um simples endpoint de healfcheck, colocar no front pra se comunicar com esse endpoint
- [ ] fazer embbed do angular na api
- [ ] deployment 
Compress-Archive -Path release\* -DestinationPath release.zip -Force

az webapp deployment source config-zip --resource-group pocs --name sistemaaduaneiro --src release.zip


agora seguindo pardrão microsoft, quero desenvolver tanto api quando client em um projeto, como tinha nos projetos de template do visual studio o angular + webapoi, assim quando eu fizer a inicialização ou deploy num ambiente azure isso seja capa de sburi minha api e meu angualr dentro do porjeto, faça essas alterações para que isso aconteça, não troque endpoint nada do client, apenas garantir que seja um projeto capaz de iniciar juntos e seja capaz no deploy de garntir o angular dentro do webapi para usar o web



= Orçamento 
    => Cliente
    => Packlist
    => Custo
    => Venda
    => Aduana


Clientes
Despachantes
Portos
Aliquotas
TemplatesPacklist
Orcamentos
Packlists
Custos
Vendas
Aduanas
Numerarios

- [ ] ver os relacionamentos
- [ ] TemplatesPacklist para essa feature no momento faça uma implementação para guardar os arquivos numa pasta no moemento isso será nosso storage no proprio temp do so numa pasta chamada /import-costs-storagem/{estrutura-de-arquivos}

Agora seguindo o padrão de criação de feature Feature/
├── {Ação}/
│   ├── {Ação}Controller.cs    # Endpoint HTTP
│   ├── {Ação}Handler.cs        # Lógica de negócio
│   ├── {Ação}Validator.cs      # Validações (se necessário)
│   └── {Ação}Dto.cs            # Contratos (se necessário)
└── {Feature}Repository.cs      # Acesso a dados vamos começar a desenvolver feature por feature, pode fazer a feature Numerarios, seguindo a documentação operacional C:\dev\prototipos-html\docs\OPERACIONAL.md e C:\dev\prototipos-html\docs\DATABASE_DESIGN.md com swagger agrupado pelo primeiro segimento após /api. 
Se atentar ao relacionamento com orçamento, isso precisa ser garantido 


Agora faça a revisão da api e confronte a regra de negócio na documentação C:\dev\prototipos-html\docs\OPERACIONAL.md para entender os relacionamentos C:\dev\prototipos-html\docs\DATABASE_DESIGN.md com orçamento quando criado tendo toda a hierarquia e relacionamentos mapeados prq ele é centra.


arrumar o commit, pois atualamente o git foi criado dentro da pasta import-costs e ta fazendo commit só dessa pasta. Altere para que o git leia da raiz ou seja, do prototipos-html, fazendo com que os projetos e arquivos gerem commits, cria uma nova branch feat-consolidacao e faça o push remoto disso 

arrumar o commit, pois atualamente o git foi criado dentro da pasta import-costs e ta fazendo commit só dessa pasta. Altere para que o git leia da raiz ou seja, do prototipos-html, fazendo com que os projetos e arquivos gerem commits, cria uma nova branch feat-consolidacao e faça o push remoto disso 