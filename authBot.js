//      Discord Auth Bot
//          Made By
//     Twitter: @washedjs
//     Discord: Jimm¥#9999


const Discord = require("discord.js");
const fs = require('fs');
const sql = require("sqlite");
const moment = require("moment");
const schedule = require("node-schedule");
const colors = require("colors");
const client = new Discord.Client();
var embed = new Discord.RichEmbed();

//Reading from config file
fs.readFile('./config.json', function read(err, data) {
    if (err) {
        console.log('Error Occured, could not find a config.json file');
        process.exit(1);
    }
    try {
        let config = JSON.parse(data);
        init(config);
    } catch (e) {
        console.log(e);
        console.log('Error Occured, your config.json file contains invalid JSON syntax.');
        process.exit(1);
    }
});

function init(config){
client.login(config.botKey)
setupDb()
checkToken()

client.on('ready', () => {
    console.log(colors.grey(`Logged in as ${client.user.tag}`));
    client.user.setPresence({
        'game':{
            'name': 'Messing with authentication',
            'type': 'Playing'
        }
    })
})

client.on('disconnect', () => {
    console.error("An error has occured. Please check you special keys in your config.json file and try again.");
    process.exit(1);
})

client.on('message', async message => {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (message.author.bot) return;
    //Command Ping
    if (command == 'ping'){
        message.channel.send(client.ping)
    }
    
    //Command Activate
    if (command == 'activate' && message.channel.type == 'dm'){
        
        if (message.content.split(' ').length == 2){
            
            let token = message.content.split(' ')[1]
            
            fs.readFile('./tokens.txt', 'utf8', async function (err, data) {
                if (err) throw err;
                tokens = data.split('\n')

                if ((tokens.indexOf(token)) > -1)  {

                    tmp = await message.author.send('**Verifying...**')

                    let startDate = moment().format('LLL'); 
                    let endDate = moment().add(30, 'days').format('LLL');

                    await sql.get('SELECT * FROM users WHERE token = ?', [token]).then(row => {
                        if (!row) {
                            try {
                                sql.run("INSERT INTO users (userId, token, startDate, endDate) VALUES (?, ?, ?, ?)", [message.author.id, token, startDate, endDate]);
                                
                                var role = client.guilds.get(config.serverId).roles.find(role => role.name === config.roleName);
                                client.guilds.get(config.serverId).members.get(message.author.id).addRole(role); 
                                
                                tmp.edit('**Verified!** :white_check_mark:')
                                console.log(colors.green(`NEW User Verified: ${message.author.tag} with Token: ${token}`))
                                
                            } catch (error) {
                                console.log(error)
                            }
                        } else {
                            tmp.edit(`**Token already used. Please contact an admin** :handshake:`)
                            console.log(colors.red(`${message.author.tag} - Tried to use an expired token. - Token: ${token}`))
                        }
                    })
                } else {
                    message.channel.send('**Invalid token.** :weary:')
                    console.log(colors.yellow(`${message.author.tag} - Used an invalid token. - Token: ${token}`))
                }
            });
        }
    } else if (command != 'activate' && message.channel.type == 'dm') {
        message.author.send('**In order to activate your account type the following:** _!activate YOURTOKEN_')
    } else {
        return
    }
})
}

async function setupDb(){
    try {
        await sql.open("./users.sqlite", { Promise });
        await sql.run("CREATE TABLE IF NOT EXISTS users (userId TEXT, token TEXT UNIQUE, startDate TEXT, endDate TEXT)");
        
    } catch (error) {
        console.log(error)
    }
}

// TO DO NOT WORKING ATM
async function checkToken(){
    schedule.scheduleJob({hour: 20, minute: 06}, async () => {
        token = []

        //token.push(sql.get('SELECT token FROM users'))
        
        //console.log(token)
        await sql.get('SELECT token, endDate FROM users').then(function(res) { token = res });
        //token = token.split(' ')[1]
        console.log(token)
        await sql.get('SELECT endDate FROM users WHERE token = ?', [token]).then(function (err, dates) {
            if (err) throw err;

            console.log(dates);

            if (dates <  moment().format('LLL')) {
                console.log("token scaduto")
            }
        })
        
    })

                //var role = client.guilds.get(config.serverId).roles.find(role => role.name === config.roleName);
                //client.guilds.get(config.serverId).members.get(message.author.id).removeRole(role);
            //}
        //})           
    //});
}
