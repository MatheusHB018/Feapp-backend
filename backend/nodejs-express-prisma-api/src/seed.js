const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Association = require('./models/Association');
const Event = require('./models/Event');
const Partner = require('./models/Partner');
const logger = require('./utils/logger');

const nestedEnvPath = path.resolve(__dirname, '..', '.env');
const rootEnvPath = path.resolve(__dirname, '..', '..', '.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: nestedEnvPath });

const defaultCategories = [
    'Crianças',
    'Idosos',
    'Saúde',
    'Educação',
    'Alimentação',
    'Meio Ambiente',
];

const canonicalAssociations = [
    { name: 'Lar Santa Filomena', activityTypes: ['Crianças', 'Educação'] },
    { name: 'Lar dos Meninos', activityTypes: ['Crianças', 'Educação'] },
    { name: 'Fundação Mirim de Presidente Prudente', activityTypes: ['Jovens', 'Formação Profissional'] },
    { name: 'Casa do Aprendiz Cidadão (Pequeno Trabalhador)', activityTypes: ['Jovens', 'Formação Profissional'] },
    { name: 'Casa da Criança e Centro Social São José', activityTypes: ['Crianças', 'Apoio Social'] },
    { name: 'Projeto Aquarela', activityTypes: ['Crianças', 'Educação'] },
    { name: 'Associação Betesda', activityTypes: ['Crianças', 'Esporte'] },
    { name: 'Centro Adventista de Desenvolvimento (CADECA)', activityTypes: ['Crianças', 'Educação'] },
    { name: 'Creche Anita Ferreira Braga de Oliveira', activityTypes: ['Crianças', 'Educação Infantil'] },

    { name: 'Associação Lúmen Et Fides', activityTypes: ['Saúde', 'Reabilitação'] },
    { name: 'Associação Filantrópica de Proteção aos Cegos', activityTypes: ['Saúde', 'Reabilitação'] },
    { name: 'Unipode', activityTypes: ['Saúde', 'Inclusão'] },
    { name: 'Núcleo Ttere de Trabalho', activityTypes: ['Inclusão', 'Geração de Renda'] },
    { name: 'Associação de Peregrinação do Rosário', activityTypes: ['Saúde', 'Idosos'] },
    { name: 'AFIPP', activityTypes: ['Saúde', 'Reabilitação'] },
    { name: 'APPA', activityTypes: ['Saúde', 'Apoio Social'] },
    { name: 'Rede Feminina de Combate ao Câncer', activityTypes: ['Saúde'] },
    { name: 'APAE Presidente Prudente', activityTypes: ['Saúde', 'Educação'] },

    { name: 'Lar São Rafael', activityTypes: ['Idosos'] },
    { name: 'Vila da Fraternidade (Recanto dos Velhinhos)', activityTypes: ['Idosos'] },
    { name: 'Associação de Atenção ao Idoso', activityTypes: ['Idosos'] },

    { name: 'Associação Bethel (Projeto Mão Amiga)', activityTypes: ['Apoio Social'] },
    { name: 'Legião da Boa Vontade (LBV)', activityTypes: ['Apoio Social', 'Alimentação'] },
    { name: 'Sociedade São Vicente de Paulo (Vicentinos)', activityTypes: ['Apoio Social'] },
    { name: 'Casa da Sopa Francisco de Assis', activityTypes: ['Alimentação', 'Apoio Social'] },
    { name: 'Serviço de Obras Sociais (SOS Criança)', activityTypes: ['Crianças', 'Apoio Social'] },

    { name: 'Esquadrão da Vida', activityTypes: ['Recuperação', 'Saúde'] },
    { name: 'APREV (Assoc. Prudente Recuperando Vidas)', activityTypes: ['Recuperação', 'Saúde'] },
    { name: 'Associação Antialcoólica', activityTypes: ['Recuperação', 'Apoio Social'] },
    { name: 'Centro Social Santa Rita de Cássia', activityTypes: ['Apoio Social'] },
    { name: 'Centro Social Nossa Senhora Aparecida', activityTypes: ['Apoio Social'] },
    { name: 'Associação Beneficente Cristã', activityTypes: ['Apoio Social'] },
    { name: 'Grupo de Auxílio Fraterno', activityTypes: ['Apoio Social'] },
];

const now = new Date();
const currentYear = now.getFullYear();

const flagshipEvents = [
    {
        name: 'Vila Julina',
        date: new Date(currentYear, 6, 15, 19, 0, 0),
        location: 'Praça do Centenário (Parque do Povo)',
        description: 'A FEAPP é conhecida por transformar mobilização cultural e festas populares em grandes fontes de arrecadação. Vila Julina é o evento carro-chefe: um arraiá solidário gigante onde cada entidade assume uma barraca de alimentação típica. O evento conta com shows, bingo e atrai milhares de pessoas.',
        status: 'active',
    },
    {
        name: 'Praça de Alimentação da Expo Prudente',
        date: new Date(currentYear, 8, 10, 19, 0, 0),
        location: 'Expo Prudente',
        description: 'Durante a maior feira agropecuária da cidade, a FEAPP e suas entidades parceiras assumem a gestão gastronômica. Todo o lucro obtido com a alimentação do público é revertido para as causas sociais.',
        status: 'active',
    },
    {
        name: 'Vila Natal',
        date: new Date(currentYear, 11, 10, 19, 0, 0),
        location: 'Centro de Presidente Prudente',
        description: 'Evento focado no encerramento do ano, trazendo a magia do Natal com decorações, chegada do Papai Noel, apresentações de coral e praça de alimentação. Momento forte para campanhas de apadrinhamento e doações de fim de ano.',
        status: 'active',
    },
];

const partnersSeed = [
    {
        name: 'Sicoob Paulista',
        website: '',
        description: 'Forte parceiro financeiro, patrocinador principal de eventos de fim de ano como a Vila Natal.',
        sectors: ['Patrocínio', 'Financeiro'],
    },
    {
        name: 'Energisa',
        website: '',
        description: 'Patrocinadora master, apoia infraestrutura e iluminação em eventos.',
        sectors: ['Patrocínio', 'Energia'],
    },
    {
        name: 'Bebidas Funada',
        website: '',
        description: 'Parceira em eventos gastronômicos e realizadora do Festival da Tubaína Funada.',
        sectors: ['Alimentação', 'Eventos'],
    },
    {
        name: 'ACIPP',
        website: '',
        description: 'Associação Comercial e Empresarial — co-realizadora de eventos como a Vila Natal Centro.',
        sectors: ['Institucional', 'Comércio'],
    },
    {
        name: 'Sincomércio',
        website: '',
        description: 'Sindicato do Comércio Varejista — apoia campanhas de final de ano.',
        sectors: ['Institucional', 'Comércio'],
    },
    {
        name: 'Sebrae',
        website: '',
        description: 'Apoio em estruturação de feiras e capacitação de gestão.',
        sectors: ['Apoio Técnico', 'Capacitação'],
    },
    {
        name: 'Prefeitura Municipal de Presidente Prudente',
        website: '',
        description: 'Cede espaços públicos e infraestrutura através de Secult e Setur.',
        sectors: ['Institucional', 'Governo'],
    },
    {
        name: 'Unoeste',
        website: '',
        description: 'Universidade parceira que fornece voluntários e equipes de saúde para atendimentos gratuitos.',
        sectors: ['Educação', 'Saúde'],
    },
    {
        name: 'Jornal O Imparcial',
        website: '',
        description: 'Parceiro de divulgação e cobertura jornalística.',
        sectors: ['Mídia', 'Comunicação'],
    },
    {
        name: 'Grupo Bandeirantes (Band Multi)',
        website: '',
        description: 'Apoio na cobertura televisiva e divulgação.',
        sectors: ['Mídia', 'Comunicação'],
    },
];

const runSeed = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@feapp.netlify.app';
        const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';

        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
            });
            logger.info('Super Admin criado com sucesso');
        } else {
            logger.info('Super Admin já existente, seed não duplicado');
        }

        for (const name of defaultCategories) {
            await Category.findOneAndUpdate(
                { name },
                { name },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        logger.info('Categorias padrão aplicadas com sucesso');

        for (let index = 0; index < canonicalAssociations.length; index += 1) {
            const association = canonicalAssociations[index];
            const cnpjSuffix = String(index + 1).padStart(2, '0');
            const cnpj = `99.000.000/0001-${cnpjSuffix}`;

            await Association.findOneAndUpdate(
                { name: association.name },
                {
                    name: association.name,
                    cnpj,
                    activityTypes: association.activityTypes,
                    status: 'active',
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                }
            );
        }

        logger.info('Associações oficiais aplicadas com sucesso', {
            total: canonicalAssociations.length,
        });

        for (const event of flagshipEvents) {
            await Event.findOneAndUpdate(
                { name: event.name },
                {
                    name: event.name,
                    date: event.date,
                    location: event.location,
                    description: event.description,
                    status: event.status,
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                }
            );
        }

        for (const partner of partnersSeed) {
            await Partner.findOneAndUpdate(
                { name: partner.name },
                { ...partner, logoUrl: partner.logoUrl || '', contactName: partner.contactName || '', contactEmail: partner.contactEmail || '', contactPhone: partner.contactPhone || '', status: 'active' },
                { upsert: true, new: true, setDefaultsOnInsert: true },
            );
        }

        logger.info('Parceiros aplicados com sucesso', {
            total: partnersSeed.length,
        });
        logger.info('Grandes eventos FEAPP aplicados com sucesso', {
            total: flagshipEvents.length,
        });
        process.exit(0);
    } catch (error) {
        logger.error('Erro ao executar seed', { message: error.message, stack: error.stack });
        process.exit(1);
    }
};

runSeed();
