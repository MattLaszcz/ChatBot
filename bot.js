//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the ada bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');
const fs  = require('fs');

const contents = fs.readFileSync("./resume.json");
const jsonContent = JSON.parse(contents);

/*const resumeData = fs.readFile('./resume.json', (err, data) => {
    if (err) throw err;
    let student = JSON.parse(data);
    console.log(student);
});*/



// Import a platform-specific adapter for web.

const { WebAdapter } = require('botbuilder-adapter-web');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url : process.env.MONGO_URI,
    });
}


const adapter = new WebAdapter({});


const controller = new Botkit({
    webhook_uri: '/api/messages',

    adapter: adapter,

    storage
});

if (process.env.CMS_URI) {
    controller.usePlugin(new BotkitCMSHelper({
        uri: process.env.CMS_URI,
        token: process.env.CMS_TOKEN,
    }));
}

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {

    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');

    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);

            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }

    controller.hears(("college","school"),'message',async(bot, message) => {
        // do something!
        
        await bot.reply(message, ("I attended" + ' ' + jsonContent.education[0].institution))
    });


    controller.hears("name",'message',async(bot, message) => {
        // do something!
       
        await bot.reply(message, ("Hi I'm" + ' ' + jsonContent.basics.name))
    });

    controller.hears("study",'message',async(bot, message) => {
        // do something!
       
        await bot.reply(message, ("I am currently studying" + ' ' + jsonContent.education[0].area))
    });

});





