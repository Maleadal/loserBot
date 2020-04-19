let functions = require("./functions.js").data;
const prefix = "!";
const mysql = require('mysql');
const Discord = require("discord.js");
const bot = new Discord.Client();
const token = "Njk1ODA4MTY1MjYxODY5MTQ4.XofoWA.M3WcWPHjYuLxD4Ml_L-k6hLnJt4";
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'loser_list'
});
let connect = functions.mysqlConnect(conn);
let commands = {
    help: prefix + "help",
    ver: prefix + "ver",
    vacation: prefix + "vacation",
    done: prefix + "done",
    register: prefix + "register",
    cd: prefix + "cd"
}

// CREATE TABLE loser_list

// ready the connection
bot.on("ready", () => {
    console.log("The bot is online");
});

bot.on("message", async message =>{
    // Variables
    member = message.member;
    role = message.guild.roles.cache.find(role => role.name === "Vacation").id;
    args = message.content.split(" ");
    channel = bot.channels.cache.find(channel => channel.name === "commands").id;
    channelSent = message.channel.id;
    commandsChannel = message.guild.channels.cache.find(channel => channel.name === "commands").toString();
    errorMessage = "Please Limit all commands in " + commandsChannel + " Channel";
    checkChannel = functions.checkChannel(channelSent, channel);
    vacationChannel = bot.channels.cache.find(channel => channel.name === "tourists");
    author = message.author.username;

    
    switch(args[0]){
        case commands.cd:
            if(!checkChannel){
                message.channel.bulkDelete(1);
                message.channel.send(errorMessage);
                break;
            }
            query = "SELECT * FROM losers where discordName = ?";
            conn.query(query, [message.author.username], function(error, result, fields){
                if (error){
                    console.log(error);
                    message.channel.send("An error has occured. Please Contact an Administrator");
                }
                else if (result.length > 0){
                    if(args[1] != undefined){
                        id = result[0].id;
                        apikey = result[0].api_key;
                        cooldowns = functions.getCooldowns(id, apikey);
                        Promise.resolve(cooldowns)
                            .then(value => {
                                message.channel.bulkDelete(1);
                                message.channel.send(functions.getCooldownType(args[1], author, value))
                                .catch(error => {
                                    console.log(error);
                                    message.channel.bulkDelete(1);
                                    message.channel.send("'You did not provide a valid type (drug/med/boost) \n Example: `!cd drug`'");
                                });
                            })
                            .catch(error => {
                                message.channel.send("Some bla bal esrrro");
                                console.log(error);
                            });
                    } else{
                        message.channel.send("Please Provide a type of cooldown \n format: `!cd <type>` - type can be drug/med/boost");
                    }
                } else if (result.length == 0){
                    message.channel.send("Please `!register` before doing this command");
                }
            });
            break;
        case commands.register:
            query = "SELECT * FROM losers where name = ?";
            var userName;
            if(!checkChannel){
                message.channel.bulkDelete(1);
                message.channel.send(errorMessage);
                break;
            }
            Promise.resolve(functions.getUserName(args[1], args[2]))
                .then(value => {
                    if(!connect){
                        conn.query(query, [value], function(error, result, fields){
                            if (error){
                                message.channel.send("An error occured. Please Contact an administrator!");
                                console.log(error);
                            }else if(result.length > 0){
                                message.channel.send("You have already registered!");
                            } else if(result.length <= 0){
                                if(args[1] == undefined){
                                    message.channel.bulkDelete(1);
                                    console.log(result);
                                    console.log(message.author.username);
                                    message.channel.send("Please Specify Your ID");
                                } else if (args[2] == undefined){
                                    message.channel.bulkDelete(1);
                                    message.channel.send("Please Specify Your API KEY");
                                } else{
                                    Promise.resolve(functions.verifyUser(args[1], args[2]))
                                        .then(value => {
                                            message.channel.send(functions.errorCodes(value));
                                        }).catch(error => {
                                            Promise.resolve(functions.getUserName(args[1], args[2]))
                                                .then(value => {
                                                    query = "INSERT INTO losers(name, id, api_key, discordName) VALUES(?, ?, ?, ?);";
                                                        conn.query(query, [value, args[1], args[2], message.author.username], function(error, result, fields){
                                                            if(error){
                                                                console.log(error);
                                                                message.channel.send("An Unexpected error has occured with the sql statement");
                                                            }else{
                                                                message.channel.bulkDelete(1);
                                                                message.channel.send(`Congratulations ${value} [${args[1]}], you are now a certified LOSER!`);
                                                                message.member.setNickname(`${value} [${args[1]}]`)
                                                                    .catch(error => {
                                                                        console.log(error);
                                                                        message.channel.send(`I could not change your nickname ${message.author.username}, you are either a Server Owner, or I do not have enough permissions, you're gonna have to set it yourself.`);
                                                                    });
                                                            }
                                                        });
                                                })
                                                .catch(error => {console.log(error)});
                                        });
                                }
                            }
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                });
            
            //2433923 G1lLrCM3Z18BXpbQ
            break;
        case commands.done:
            if(!checkChannel){
                message.channel.send(errorMessage);
                break;
            }
            if(message.member.roles.cache.find(role => role.name === "Vacation")){
                message.member.roles.remove(role);
                message.channel.send("Welcome back " + message.author.username + ", you can now get contracts!");
                break;
            }
            message.channel.send("You are not even on a vacation! ");
            break;
        case commands.vacation:
            if(!checkChannel){
                message.channel.send(errorMessage);
                break;
            }
            if(args.length === 1){
                message.channel.send("Please provide a reason so that I can let everyone know");
                break;
            }else {
                if (message.member.roles.cache.find(role => role.name === "Vacation")){
                    message.channel.send("You are already on a vacation!");
                    break;
                }
                member.roles.add(role);
                message.channel.send(`Have fun on your vacation ${message.author}!`);
                message.channel.send("Please take note that you will not be able to take a commitment during this period, please input `!done` to be able to gain that ability back");
                vacationChannel.send(`${message.author}'s going on a vacation! \n Reason/s: ${args.slice(1).join(" ")}`);
                break;
            }
        case commands.ver:
            if(!checkChannel){
                message.channel.send(errorMessage);
                break;
            }
            functions.verCommmands(message);
            break;
        case commands.help:
            if(!checkChannel){
                message.channel.send(errorMessage);
                break;
            }
            functions.helpCommand(message);
            break;
    }
});



bot.login(token);
