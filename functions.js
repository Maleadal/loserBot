const axios = require("axios");
let lists = {};

lists.convert = function(seconds) {
    seconds = Math.floor(seconds);
    let result = "";

    if (seconds >= 3600) {
        const hours = Math.floor(seconds / 3600);
        result += `${hours} hour${hours > 1 ? "s" : ""}`;
    }

    if (seconds >= 60) {
        const minutes = Math.floor((seconds % 3600) / 60);

        result +=
            `${seconds >= 3600 ? " and " : ""}` +
            `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }

    if (seconds >= 3600) {
        return result;
    } else {
        return (
            result +
            `${seconds >= 60 ? " and " : ""}` +
            `${seconds % 60} second${seconds >= 60 ? "s" : ""}`
        );
    }
};

lists.mysqlConnect = function(connection){
    connect = connection.connect(function(error){if (error){console.log(error)}});
    if(connect){
        console.log("Mysql server was not connected");
        return true;
    } else if (!connect){
        console.log("Mysql has been connected successfully");
        return false;
    }
};

lists.checkChannel = function(channel1, channel2){
    if (channel1 == channel2){
        return true;
    }
    return false;
};

lists.verifyUser = async function(id, apikey){
    let response = await axios.get(`https://api.torn.com/user/${id}?selections=&key=${apikey}`);
    let result = response.data.error.code;
    return result;
}

lists.getUserName = async function (id, apiKey){
    linkToUser = await axios.get(`https://api.torn.com/user/${id}?selections=&key=${apiKey}`);
    result = linkToUser.data.name;
    return result;
}

lists.getCooldowns = async function(userid, apiKey){
    let link = `https://api.torn.com/user/${userid}?selections=cooldowns&key=${apiKey}`;
    let get = await axios.get(link);
    let result = get.data.cooldowns;
    return result;
};

lists.getCooldownType = function(args, author, result){
    cd = result;
    switch(args){
        case 'drug':
            cd = lists.convert(result.drug);
            if(cd !== "0 second"){
                return `${author} can take another drug in ${cd}`;
            }else if (cd === "0 second"){
                return `${author} can take a drug RIGHT NOW!`;
            }
        case 'boost':
            cd = lists.convert(result.booster);
            if(cd === "0 second"){
                return `${author} does not have a booster cooldown, drink a beer! Your wasting precious time!`;
            } else if(cd !== "0 second"){
                return `${author} can take a booster RIGHT NOW, but he has a cooldown of ${cd}`;
            }
        case 'med':
            cd = lists.convert(result.medical);
            if(cd === "0 second"){
                return `${author} does not have a medical cooldown, start LOSING! Your wasting precious time!`;
            } else if(cd !== "0 second"){
                return `${author} can use a medical item RIGHT NOW, but he has a cooldown of ${cd}`;
            }
    }
}

lists.errorCodes = function (code){
    switch(code){ 
        case 1:
            return "You provided an empty key";
        case 2:
            return "Please Provide the Correct Information `.register <TORN ID> <API KEY>`";
        case 3:
            return "I honestly don't know this error - Maleadal";
        case 4:
            return "This should not occur! what did you do?! (4)";
        case 5:
            return 'You requested too many keys in 1 min, please try again later';
        case 6:
            return "You provided an invalid user ID ";
        case 7:
            return "You provided a user ID that does not belong to the API KEY";   
        case 8:
            return "The IP is blocked because of abuse: Contact Maleadal";
        case 9:
            return "Torn's API is currently disabled, please try again later";
        case 10:
            return "The API KEY's owner is fedded!";
        case 11:
            return "You can only change your api key once every 60 seconds!";
        case 12:
            return "Error reading Key from database";
    }
}


// Command feedback
lists.helpCommand = function(message){
    message.channel.send(`
Commands:
    \`!ver\` - Displays current version and information of the bot
    \`!help\` - Shows all the available commands
    \`!register <TORN ID> <API KEY>\` - Verifies your Identity and registers you as an official LOSER
Torn Related Commands  
    \`!cd <type>\` - shows your medical/booster/drug cooldown
Vacation Commands
    \`!vacation\` - take a vacation!
    \`!done\` - go back from vacation
`);

}

lists.verCommmands = function(message){
    message.channel.send(`
Bot Information:
    Version: Beta
    Creator: Maleadal#7540
    Language: JavaScript
    Libraries: discordjs, mysql, axios, promise    
    `);
}

exports.data = lists;