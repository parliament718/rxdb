const {
    createRxDatabase,
    addRxPlugin
    
} = require('rxdb');

const { 
    addPouchPlugin,
    getRxStoragePouch
} = require('rxdb/plugins/pouchdb');

addRxPlugin(require('rxdb/plugins/dev-mode').RxDBDevModePlugin);
addRxPlugin(require('rxdb/plugins/query-builder').RxDBQueryBuilderPlugin);
addPouchPlugin(require('pouchdb-adapter-http'));
addPouchPlugin(require('pouchdb-adapter-leveldb'));
const leveldown = require('leveldown');

const heroSchema = {
    title: 'hero schema',
    description: 'describes a simple hero',
    version: 0,
    type: 'object',
    primaryKey: 'id',
    properties: {
        id: {
            type: 'string',
            primary: true,
            maxLength: 20
        },
        name: {
            type: 'string',
        },
        color: {
            type: 'string'
        }
    },
    required: ['id', 'name', 'color']
};

let _getDatabase; // cached
function getDatabase(name, adapter) {
    if (!_getDatabase) _getDatabase = createDatabase(name, adapter);
    return _getDatabase;
}

async function createDatabase(name, adapter) {
    const db = await createRxDatabase({
        name,
        storage: getRxStoragePouch(leveldown)
    });

    console.log('creating hero-collection..');
    await db.addCollections({
        heroes: {
            schema: heroSchema
        }
    });

    return db;
}
module.exports = {
    getDatabase
};
