const electron = require('electron');
const database = require('./database');
// const renderTest = require('./test/render.test.js');

require('babel-polyfill');

const heroesList = document.querySelector('#heroes-list');

const syncURL = 'http://localhost:10102/db/heroes';

const {
    addRxPlugin
} = require('rxdb');

// addRxPlugin(require('rxdb/plugins/dev-mode').RxDBDevModePlugin);
addRxPlugin(require('rxdb/plugins/leader-election').RxDBLeaderElectionPlugin);
addRxPlugin(require('rxdb/plugins/replication-couchdb').RxDBReplicationCouchDBPlugin);

async function run() {
    /**
     * to check if rxdb works correctly, we run some integration-tests here
     * if you want to use this electron-example as boilerplate, remove this line
     */
    // await renderTest();

    const currentWindow = electron.remote.getCurrentWindow();
    const db = await database.getDatabase(
        'database/heroesdb' + currentWindow.custom.dbSuffix, // we add a random timestamp in dev-mode to reset the database on each start
    );
    console.log('starting sync with ' + syncURL);
    const syncState = await db.heroes.syncCouchDB({
        remote: syncURL,
        direction: {
            pull: true,
            push: true
        }
    });
    console.dir(syncState);

    /**
     * map the result of the find-query to the heroes-list in the dom
     */
    db.heroes.find()
        .sort({
            id: 'asc'
        })
        .$.subscribe(function (heroes) {
            if (!heroes) {
                heroesList.innerHTML = 'Loading..';
                return;
            }
            console.log('observable fired');
            console.dir(heroes);

            heroesList.innerHTML = heroes
                .map(hero => {
                    return '<li>' +
                        '<div class="color-box" style="background:' + hero.color + '"></div>' +
                        '<div class="name" name="' + hero.name + '">' + hero.name + '</div>' +
                        '</li>';
                })
                .reduce((pre, cur) => pre += cur, '');
        });

    window.addHero = async function () {
        const name = document.querySelector('input[name="name"]').value;
        const color = document.querySelector('input[name="color"]').value;
        const obj = {
            id: new Date().getTime().toString(),
            name: name,
            color: color
        };
        console.log('inserting hero:');
        console.dir(obj);
        db.heroes.insert(obj);
    };
}
run();
