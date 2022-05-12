require('dotenv').config();
const { Client, Intents, MessageButton, MessageActionRow, MessageAttachment } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MEMBERS] });
const token = process.env.token;
const startSend = process.env.startSend;
const view_id1 = process.env.view_id1;
const view_id2 = process.env.view_id2;
const view_id3 = process.env.view_id3;
const view_id4 = process.env.view_id4;


client.on("ready", async () => {
  client.channels.cache.get(startSend).send({
    embeds: [{
      title: '面接Botが起動しました',
      color: "RANDOM",
      timestamp: new Date()
    }]
  })
});

client.on("guildMemberAdd", async member => {
  member.guild.channels.cache.get(startSend).send({
    embeds: [{
      title : "面接Botログ", 
      description : `<@${member.user.id}> さんが参加しました`,
      color: "RANDOM",
      timestamp: new Date()
    }]
  })
});

client.on('guildMemberRemove', async member => {
  member.guild.channels.cache.get(startSend).send({
    embeds: [{
      title : "面接Botログ", 
      description : `<@${member.user.id}> さんが退出しました`,
      color: "RANDOM",
      timestamp: new Date()
    }]
  })
});

client.on('messageCreate', async message => {
  if (message.content.startsWith("help")) {
    const role = message.guild.roles.cache.find(roles => roles.name === 'アジ鯖運営')
    if (!message.member.roles.cache.has(role.id)) return
    const button = new MessageButton()
      .setCustomId("contact")
      .setStyle("PRIMARY")
      .setLabel("🎫面接用チャンネルを作成する🎫")
    await message.channel.send({
      components: [new MessageActionRow().addComponents(button)]
    });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.customId === "contact") {
    await interaction.reply({
      content: "ボタンが押されました。",
      ephemeral: true
    });
    let l = 8;
    let c = "0123456789";
    let cl = c.length;
    let random = "";
    for(let i=0; i<l; i++){
      random += c[Math.floor(Math.random() * cl)];
    }
    const channels = interaction.guild.channels;
    const createdChannel = await channels.create("面接ID - " + random, { 
      parent: interaction.channel.parent,
      permissionOverwrites: [
        {
          id: view_id1,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id : view_id2,
          allow: ['VIEW_CHANNEL'],
        },
        {
          id : view_id3,
          allow: ['VIEW_CHANNEL'],
        },
        {
          id : view_id4,
          allow: ['VIEW_CHANNEL'],
        },
      ],
    });
    random = 0;
    const button = new MessageButton()
      .setCustomId("admin")
      .setStyle("PRIMARY")
      .setLabel("🎫")
    await createdChannel.send({
      embeds: [{
        title : "面接Bot", 
        description : "運営のみ : ログファイルを作成するには🎫をクリック\n\n面接担当者は面接日と時間の記入を行ってください",
        color: "RANDOM",
        timestamp: new Date()
      }],
      components: [new MessageActionRow().addComponents(button)]
    });
  }

  if (interaction.customId === "admin") {
    await interaction.reply({
      content: "ボタンが押されました。",
      ephemeral: true
    });
    const role = interaction.guild.roles.cache.find(roles => roles.name === 'アジ鯖運営')
    if (!interaction.member.roles.cache.has(role.id)) return
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    client.channels.cache.get(startSend).send({
      embeds: [{
        title : "面接Botログ", 
        description : interaction.channel.name + " ログファイルが作成されました",
        color: "RANDOM",
        timestamp: new Date()
      }],
      files: [
        new MessageAttachment(Buffer.from(`${messages.map(m => m.content).join('\n')}`, 'utf-8'), year + '-' + month + '-' + day +'.txt'),
      ],
    });
  }
});

client.login(token);
