const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
// warning message just in case I fuck things up  
// console.log(`You're about to update the command list for every server the bot is currently in. \n Are you sure this is what you want to do (y/n)`)
let areWeGoodBro;
readline.question(`[WARNING] You're about to update the command list for every server the bot is currently in. \n Are you sure this is what you want to do (y/n)`, input => {
    areWeGoodBro = input; 
    readline.close();
});


if(!(areWeGoodBro == 'y')) {
    console.log('Global deploy cancelled.')
}else{
// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in EVERY
		const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
}

