const Discord = require('discord.js')
const fs = require('fs')
const client = new Discord.Client({intents: 37379})
const ms = require('ms')
const config = require('./config.json')
const JSONdb = require('simple-json-db')
const moment = require('moment')
const { inspect } = require('util')
const db = new JSONdb('./Databases/db.sqlite')
const snippetdb = new JSONdb('./Databases/snippets.sqlite')
client.on('ready', () => {
  client.guilds.cache.get(config.mainguildid).members.fetch().then(() => console.log(`Succesfully cached all members`))
    console.log(`Logged in as ${client.user.tag}`)

})
const prefix = config.prefix;








client.on('guildMemberRemove', member => {

  if(client.channels.cache.find(c => c.topic === member.id)){
    client.channels.cache.find(c => c.topic === member.id).send({embeds: [new Discord.MessageEmbed().setDescription('User has left the server')]})
  }
})






client.on('message', async message => {
  function checkDays(date) {
    let now = new Date();
    let diff = now.getTime() - date.getTime();
    let days = Math.floor(diff / 86400000);
    return days + (days == 1 ? " day" : " days") + " ago";
};
    const args = message.content.split(" ").slice(1);
if(message.author.bot) return;
if(config.inboxguildid === undefined) return console.error('CONFIG ERROR: Inbox Guild ID has not been setup')
if(config.prefix === undefined) return console.error('CONFIG ERROR: Prefix has not been setup')
	if(message.channel.type === "dm"){
    const blocked = db.get('blocked')
		if(!client.guilds.cache.get(config.inboxguildid).channels.cache.find(c => c.topic === `${message.author.id}`)){
      if(blocked.includes(message.author.id)) return;
		  client.guilds.cache.get(config.inboxguildid).channels.create(`${message.author.username}#${message.author.discriminator}`, { type: 'text'}).then(channel => {
			channel.setParent(config.maincategoryid)
			channel.setTopic(message.author.id)
      if(config.pinguponopen){
        channel.send({content: '@here'})
      }
        channel.send({embeds: [new Discord.MessageEmbed().setDescription(`**${message.author.tag}**(${message.author.id}) was created ${checkDays(message.author.createdAt)}, joined ${checkDays(client.guilds.cache.get(config.mainguildid).members.cache.get(message.author.id).joinedAt)}\n\n**Roles**:\n${client.guilds.cache.get(config.mainguildid).members.cache.get(message.author.id).roles.cache.map(c => `\`\`${c.name}\`\``).join('  ┊  ')}`).setColor(config.embedcolour)]})
		  channel.send({embeds: [new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.displayAvatarURL()).setDescription(message.content).setFooter(`Message ID: ${message.id}`).setTimestamp().setColor(config.embedcolour)]})
		  const threadmake = new Discord.MessageEmbed()
		  .setDescription('**Thank your for your message.** A member of our staff team will be with you __shortly__. Until then, feel free to explain your `query`, `issue` or anything else we can help with today. Your patience is __appreciated__.').setColor(config.embedcolour)
	message.author.send({embeds: [threadmake]})
  db.set(message.author.id, {"Alert": [], "Sub": []})
  db.set(`${message.author.id}-messages`, [])
		  })

	
		} else {
      const alerts = db.get(message.author.id)["Alert"]
      let alert
      if(alerts.length === 0){
        alert = ""
      } else {
        alert = `<@${db.get(message.author.id)["Alert"].join('> <@')}>`
      }

      const subs = db.get(message.author.id)["Sub"]
      let sub
      if(subs.length === 0){
        sub = ""
      } else {
        sub = `<@${db.get(message.author.id)["Sub"].join('> <@')}>`
      }
      if(blocked.includes(message.author.id)) return message.react('❎')
			const channel = client.guilds.cache.get(config.inboxguildid).channels.cache.find(c => c.topic === `${message.author.id}`)
      var Attachments = (message.attachments).array()
      if(message.attachments.size > 0){
        channel.send(alert + sub, new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.displayAvatarURL()).setDescription(message.content).setImage(Attachments[0].url).setFooter(`Message ID: ${message.id}`).setTimestamp().setColor(config.embedcolour))
      } else {
        channel.send(alert + sub, new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.displayAvatarURL()).setDescription(message.content).setFooter(`Message ID: ${message.id}`).setTimestamp().setColor(config.embedcolour))

      }
      message.react('✅')
      db.set(message.author.id, {"Alert": [], "Sub": subs})
		}
		
	
	}else if(message.content.toLowerCase() === prefix + "help"){
   const embed = new Discord.MessageEmbed()
   .setAuthor('Modmail')
   .setDescription('Required: <>\nOptional: ()')
   .addField('Snippets', `Displays, Lists, Adds and Removes snippets. Use ${prefix}snippets <view | add | remove | list | edit>`)
   .addField('Block/Unblock', `Blocks user from creating/sending messages in modmail. To block or unblock a user, use ${prefix}<block | unblock>`) 
   .addField('Move', `Moves thread to another category. To move a modmail thread, use ${prefix}<move <keyword setup in config | channel_id`)
   .addField('Newthread', `Creates a thread for a specified user. To Create a thread for a user, use ${prefix}newthread <user_id> `)
   .addField('Reply', `Sends a message back to the User. To reply to a thread, use ${prefix}<ar | r | reply> <message>`)
    .addField('Close', `Closes thread and sends log to specified logging channel. To close a thread, use ${prefix}close`)
    .addField('ID', `Displays User's Client ID. To display a User's ID, use ${prefix}id`)
    .addField('Raw', `Will display content of embed in a codeblock for copying. To get the raw output of an embed, use ${prefix}raw <message_id>`)
    .addField('Alert/Sub', `Will ping user on message. Alert pings for next message; Sub pings for all messages until they unsub. To get alerted or sub to a channel, use ${prefix}alert, ${prefix}sub or ${prefix}unsub`)
    .setColor(config.embedcolour)
    message.channel.send({embeds: [embed]})
    
    
  } 
  
  
  
  
  
  
  
  else if(message.content.toLowerCase() === prefix + "alert"){
    const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;

const notifs = db.get(message.channel.topic)
notifs["Alert"].push(message.author.id)
message.channel.send({content: 'You will be alerted on the next message'})
    
    
  }else if(message.content.toLowerCase() === prefix + "sub"){
    const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;

const notifs = db.get(message.channel.topic)
notifs["Sub"].push(message.author.id)
message.channel.send({content: 'You will be alerted for every message'})
    
    
  }else if(message.content.toLowerCase() === prefix + "unsub"){
    const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;

const subs = db.get(message.channel.topic)["Sub"]
const index = subs.indexOf(message.author.id);
      if (index > -1) {
        subs.splice(index, 1);
      }
      const alerts = db.get(message.channel.topic)["Alert"]
      db.set(message.author.id, {"Alert": alerts, "Sub": subs})
      
message.channel.send({content: 'You will no longer be alerted'})
    
    
  }else if(message.content.toLowerCase().startsWith(prefix + "raw")){
    if(!args[0]) return message.channel.send({content: 'Missing Arguments'})
    const messages = message.channel.messages.cache.get(args[0])
    if(!messages) return message.channel.send({content: 'Unable to find message'})
    if(messages.embeds.length === 0) return message.channel.send({content: 'Message you specified does not contain an embed'})
    messages.embeds.forEach(embed => {
      message.channel.send({content: `\`\`\`\n${embed.description}\n\`\`\``})
    })
    
  }else if(message.content.toLowerCase().startsWith(prefix + 'ar') || message.content.toLowerCase().startsWith(prefix + 'r') || message.content.toLowerCase().startsWith(prefix + 'reply')){
    const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;
    const punctuationless = member.username.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
    const finalname = punctuationless.replace(/\s{2,}/g," ");
    if(message.channel.name.includes(finalname.toLowerCase()) === false && message.channel.name.includes(member.discriminator) === false) return;    	
    const reply = args.join(" ")
		if(!reply) return message.channel.send({content: 'Argument is missing'})
    
		const sentMessage = await client.users.cache.get(message.channel.topic).send({embeds: [new Discord.MessageEmbed().setAuthor(message.member.roles.highest.name, client.user.displayAvatarURL()).setDescription(reply).setFooter(`Anonymous Reply`).setColor(config.embedcolour)]})


		message.delete()
		const ourmessage = await message.channel.send({embeds: [new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.displayAvatarURL()).setDescription(reply).setFooter(`Anonymous Reply`).setTimestamp().setColor(config.embedcolour)]})

    if(!db.get(`${message.channel.topic}-messages`)){
      db.set(`${message.channel.topic}-messages`, [{[ourmessage.id]: sentMessage.id}])
} else {
  const messages = db.get(`${message.channel.topic}-messages`)
  messages.push({[ourmessage.id]: sentMessage.id})
  db.set(`${message.author.id}-messages`, messages)
}
	}else if(message.content.toLowerCase().startsWith(prefix + "delete")){
    const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;
    const punctuationless = member.username.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
    const finalname = punctuationless.replace(/\s{2,}/g," ");
    if(message.channel.name.includes(finalname.toLowerCase()) === false && message.channel.name.includes(member.discriminator) === false) return; 
    if(!args[0]) return message.channel.send({content: 'Please Supply Message ID'})
    const messages = db.get(`${message.channel.topic}-messages`)
    let Successful;
    for(i = 0; i < messages.length; i++){
      const messageID = Object.keys(messages[i]).toString()
      if(messageID === args[0]){
        client.users.fetch(message.channel.topic)
client.users.cache.get(message.channel.topic).dmChannel.messages.fetch(messages[i][messageID]).then(m => m.delete());
message.react('✅')
Successful = true;
      } else {
        continue;
      }
    }
    if(Successful === true){
      return;
    } else {
      message.react('❎')
    }
    

  }
    else if(message.content.toLowerCase().startsWith(prefix + "close")){
    const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;
const punctuationless = member.username.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
const finalname = punctuationless.replace(/\s{2,}/g," ");
if(message.channel.name.includes(finalname.toLowerCase()) === false && message.channel.name.includes(member.discriminator) === false) return;
    function makeid(length) {
      var result           = '';  
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
   }
   
   const id = makeid(15)
   
	   if(!args[0]){
       const messageArray = []
         messageArray.push(`Opened ${moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}`)
    for ([ ,message ] of message.channel.messages.cache){
        message.embeds.forEach(embed => {
          if(embed.footer === null) return;
         if(embed.footer.text === "Anonymous Reply"){
           
                     messageArray.push(`[Staff] ${embed.author.name} => ${embed.description}`)

         } else if(embed.footer.text.includes('Message ID')){
                     messageArray.push(`[Client] ${embed.author.name} => ${embed.description}`)

         } else {
        
      
        messageArray.push(message.content)
         }
        
    })

   
    }
    const content = messageArray.join('\r\n')
     fs.writeFile(`./Saves/${message.channel.name}.txt`, content, (err) => {})
     if(config.logchannelid !== undefined){
    message.guild.channels.cache.get(config.logchannelid).send({ files: [`./Saves/${message.channel.name}.txt`] });
     }
		   message.channel.delete()
       db.delete(message.channel.topic)
       db.delete(`${message.channel.topic}-messages`)
      
	   } else {
		  const sentMessage = await message.channel.send({embeds: [new Discord.MessageEmbed().setDescription(`Closing in ${args[0]}`).setColor(config.embedcolour)]})
		   setTimeout(() => {
			   sentMessage.edit(new Discord.MessageEmbed().setDescription(`Closing...`).setColor(config.embedcolour))
		   }, ms(args[0]) - 1000)

		   setTimeout(() => {
         const messageArray = []
         messageArray.push(`Opened ${moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}`)
    for ([ ,message ] of message.channel.messages.cache){
        message.embeds.forEach(embed => {
          if(embed.footer === null) return;
         if(embed.footer.text === "Anonymous Reply"){
           
                     messageArray.push(`[Staff] ${embed.author.name} => ${embed.description}`)

         } else if(embed.footer.text.includes('Message ID')){
                     messageArray.push(`[Client] ${embed.author.name} => ${embed.description}`)

         } else {
        
      
        messageArray.push(message.content)
         }
        
    })

   
    }
    const content = messageArray.join('\r\n')
     fs.writeFile(`./Saves/${message.channel.name}.txt`, content, (err) => {})
     if(config.logchannelid !== undefined){
    message.guild.channels.cache.get(config.logchannelid).send({ files: [`./Saves/${message.channel.name}.txt`] });
     }
			   message.channel.delete()
         db.delete(message.channel.topic)
         db.delete(`${message.channel.topic}-messages`)
		   }, ms(args[0]))
	   }

	}else if(message.content.toLowerCase() === prefix + "id"){
    const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;
    const punctuationless = member.username.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
const finalname = punctuationless.replace(/\s{2,}/g," ");
if(message.channel.name.includes(finalname.toLowerCase()) === false && message.channel.name.includes(member.discriminator) === false) return;     
message.channel.send({embeds: [new Discord.MessageEmbed().setDescription(`User ID: ${message.channel.topic}`).setColor(config.embedcolour)]})
  }
  else if(message.content.toLowerCase().startsWith(prefix + 'move')){
    const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;
  const punctuationless = member.username.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
const finalname = punctuationless.replace(/\s{2,}/g," ");
if(message.channel.name.includes(finalname.toLowerCase()) === false && message.channel.name.includes(member.discriminator) === false) return;   
          if(!args[0]) return message.channel.send({content: 'Missing arguments'})
    const category = config[args[0].toLowerCase()] || client.channels.cache.get(args[0])
    if(!category) return message.channel.send({content: 'Category not found'})
    message.channel.setParent(category)
    message.react('✅')


  }

    
else if(message.content.toLowerCase().startsWith(prefix + 'newthread')){
  if(message.member.roles.cache.has(config.moderatorroleid) || message.member.permissions.has('ADMINISTRATOR')){ 
  const member = client.users.cache.get(args[0])
if(!member) return message.channel.send({embeds: [new Discord.MessageEmbed().setDescription(prefix + 'newthread <member_id>').setColor(config.embedcolour)]}) 
 if(!client.guilds.cache.get(config.inboxguildid).channels.cache.find(c => c.topic === member.id)){
client.guilds.cache.get(config.inboxguildid).channels.create(`${member.username.toLowerCase()}#${member.discriminator}`).then(channel => {
    channel.setParent(config.maincategoryid)
    channel.setTopic(member.id)
    channel.send({embeds: [new Discord.MessageEmbed().setDescription(`**${member.tag}**(${member.id}) was created ${checkDays(member.createdAt)}, joined ${checkDays(client.guilds.cache.get(config.mainguildid).members.cache.get(member.id).joinedAt)}\n\n**Roles**:\n${client.guilds.cache.get(config.mainguildid).members.cache.get(member.id).roles.cache.map(c => `\`\`${c.name}\`\``).join('  ┊  ')}`).setColor(config.embedcolour)]})
    channel.send({embeds: [new Discord.MessageEmbed().setDescription(`Opened by ${message.author.tag}`).setColor(config.embedcolour)]})
          db.set(member.id, {"Alert": [], "Sub": []})
          message.react('✅')
          message.reply({embeds: [new Discord.MessageEmbed().setDescription(`Created thread: <#${channel.id}>`).setColor(config.embedcolour)]})

})

} else {
  return message.channel.send({content: `There is already a thread open for ${member.tag}`})
}

  } else {
    return;
  }
}else if(message.content.toLowerCase() === prefix + "block"){
  const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;
  const punctuationless = member.username.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
const finalname = punctuationless.replace(/\s{2,}/g," ");
if(message.channel.name.includes(finalname.toLowerCase()) === false && message.channel.name.includes(member.discriminator) === false) return;
 const blocked = db.get('blocked')
 if(args[0]){
  const blocked = db.get('blocked')
  if(blocked.includes(args[0])) return message.react('❎')
  blocked.push(args[0])
  db.set('blocked', blocked)
  return message.react('✅')
 } else {
 if(blocked.includes(message.channel.topic)) return message.react('❎')
 blocked.push(message.channel.topic)
 db.set('blocked', blocked)
 message.react('✅')
 }
}else if(message.content.toLowerCase() === prefix + "unblock"){
  const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;
  const punctuationless = member.username.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
const finalname = punctuationless.replace(/\s{2,}/g," ");
if(message.channel.name.includes(finalname.toLowerCase()) === false && message.channel.name.includes(member.discriminator) === false) return;
 const blocked = db.get('blocked')
 if(!blocked.includes(message.channel.topic)) return message.react('❎')
 const index = blocked.indexOf(message.channel.topic);
 if (index > -1) {
  blocked.splice(index, 1);
 }
 db.set('blocked', blocked)
 message.react('✅')
  
}else if(message.content.toLowerCase().startsWith(prefix + "snippets")){
  if(!args[0]) return message.channel.send({content: 'View | Add | Remove | List | Edit | Raw'})
  if(args[0] === "view" || args[0] === "View"){
    if(!args[1]) return message.channel.send({content: 'Supply a snippet name'})
    if(snippetdb.get(args[1]) === undefined) return message.channel.send({content: 'Snippet not found'})
    const embed = new Discord.MessageEmbed()
  .setTitle(`Snippet - '${args[1]}':`)
  .setDescription(snippetdb.get(args[1]))
  .setColor(config.embedcolour)
  message.channel.send({embeds: [embed]})
  } else if(args[0] === "add" || args[0] === "Add"){
    if(!message.member.roles.cache.has(config['moderatorroleid'])) return;
    const content = message.content.split(" ").splice(3).join(" ")
    if(args[1] === undefined || content === undefined) return message.channel.send({content: `${prefix}snippet add <trigger> <content>`})
    snippetdb.set(args[1], content)
    const snippets = snippetdb.get('snippets')
    if(snippets.includes(args[1])) return message.channel.send({content: 'Snippet already exists'})
    snippets.push(args[1])
    snippetdb.set('snippets', snippets)
    message.channel.send({content: `Snippet ${args[1]} added.`})
  } else if(args[0] === "remove" || args[0] === "Remove"){
    if(!message.member.roles.cache.has(config['moderatorroleid'])) return;
      if(args[1] === undefined) return message.channel.send({content: `${prefix}snippet remove <trigger>`})
      snippetdb.delete(args[1])
      const snippets = snippetdb.get('snippets')
      if(!snippets.includes(args[1])) return message.channel.send({content: 'Snippet does not exist'})
      const index = snippets.indexOf(args[1]);
      if (index > -1) {
        snippets.splice(index, 1);
      }
      db.set('snippets', snippets)
      message.channel.send({content: `Snippet ${args[1]} removed.`})
    
  } else if(args[0] === "list" || args[0] === "List"){
    const embed = new Discord.MessageEmbed()
    .setAuthor('List of snippets')
    .setDescription(snippetdb.get('snippets').join('\n'))
    message.channel.send({embeds: [embed]})

  } else if(args[0] === "edit"   || args[0] === "Edit"){
    if(!message.member.roles.cache.has(config['moderatorroleid'])) return;
    const content = message.content.split(" ").splice(3).join(" ")
if(args[1] === undefined || content === undefined) return message.channel.send({content: `${prefix}snippets edit <trigger> <content>`})
if(snippetdb.get(args[1]) === undefined) return message.channel.send({content: 'Snippet does not exist'})
snippetdb.set(args[1], content)
message.channel.send({content: `Snippet ${args[1]} edited.`})
  } else if(args[0] === "raw" || args[0] === "Raw"){
    if(!message.member.roles.cache.has(config['moderatorroleid'])) return;
    const content = message.content.split(" ").splice(3).join(" ")
    if(args[1] === undefined || content === undefined) return message.channel.send({content: `${prefix}snippets raw <trigger>`})
    if(snippetdb.get(args[1]) === undefined) return message.channel.send({content: 'Snippet does not exist'})
message.channel.send({content: `\`\`\`\n${snippetdb.get(args[1])}\n\`\`\``})
  }
  
  
  }






 
  


else if(message.content.toLowerCase().startsWith(prefix)){
  const member = await client.users.cache.get(message.channel.topic)
    if(!member) return;
  const punctuationless = member.username.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
const finalname = punctuationless.replace(/\s{2,}/g," ");
if(message.channel.name.includes(finalname.toLowerCase()) === false && message.channel.name.includes(member.discriminator) === false) return; 
  if(message.content.toLowerCase().substring(prefix.length) === undefined) return;
  if(snippetdb.get(message.content.toLowerCase().substring(prefix.length)) === undefined) return;
 
 const sentMessage = await client.users.cache.get(message.channel.topic).send({embeds: [new Discord.MessageEmbed().setAuthor(message.member.roles.highest.name, client.user.displayAvatarURL()).setDescription(snippetdb.get(message.content.toLowerCase().substring(prefix.length))).setFooter(`Anonymous Reply`).setColor(config.embedcolour)]})
	message.delete()
	const ourmessage = await message.channel.send({embeds: [new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.displayAvatarURL()).setDescription(snippetdb.get(message.content.toLowerCase().substring(1))).setFooter(`Anonymous Reply`).setTimestamp().setColor(config.embedcolour)]})
  if(!db.get(`${message.channel.topic}-messages`)){
    db.set(`${message.channel.topic}-messages`, [{[ourmessage.id]: sentMessage.id}])
} else {
const messages = db.get(`${message.channel.topic}-messages`)
messages.push({[ourmessage.id]: sentMessage.id})
db.set(`${message.author.id}-messages`, messages)
}

}
    
  


   
})

client.login(config.token)


