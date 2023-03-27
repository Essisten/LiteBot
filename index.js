const general = require('./general');
const shopping = require('./shopping');
const help = require('./help');
const fract = require('./fraction');
const inv = require('./inventory');

const {VK} = require('vk-io');
const vk = new VK({
		token: process.env['token'],
    apiMode: 'parallel',
    pollingGroupId: Number(process.env['group_id'])
});
const { updates } = vk;
const { HearManager } = require('@vk-io/hear');
const fs = require('fs');
const express = require('express');
const app = express();
const hearManager = new HearManager();

require("http").createServer((_, res) => res.end("Alive!")).listen(8080);


class MainStuff
{
    constructor()
    {
      this.main = this;
      this.Gods = [559144282, 334913416];	//Боги
      this.randomEnable = true;
      this.maxRandomsPerRequest = 99999999;	//Максимальное число бросков рандома для игрока
      this.ShopItems = require("./Data/ShopItems.json");
      this.Players = require("./Data/Players.json");
      this.loadConfigs();
    }
    
    Random(min, max)
    {
      if (min == max)
        return min;
    	return Math.round(min - 0.5 + Math.random() * (max - min + 1));
    }
    
    isGod(id)
    {
    	return this.Gods.includes(id);
    }
    
    saveConfigs()
    {
    	let conf =
      {
    		maxRandomsPerRequest: maxRandomsPerRequest,
    		randomEnable: randomEnable
      }
      let json = JSON.stringify(conf, null, "\t");
    	fs.writeFileSync('./Data/configs.json', json);
    }
    
    loadConfigs()
    {
    	let file = JSON.parse(fs.readFileSync('./Data/configs.json'));
    	this.maxRandomsPerRequest = file.maxRandomsPerRequest;
    	this.randomEnable = file.randomEnable;
    }
    
    SaveShop()
    {
      let json = JSON.stringify(this.ShopItems, null, "\t");
    	fs.writeFileSync("./Data/ShopItems.json", json);
    }

    SavePlayers()
    {
      let json = JSON.stringify(this.Players, null, "\t");
      fs.writeFileSync("./Data/Players.json", json);
    }
}
var main = new MainStuff();

 //Обработчик сообщений:
updates.on('message', hearManager.middleware);


hearManager.hear(/^!(?:(хелп)|(help))(?: (\d+))?$/i, async (message) => help.GetHelp(message));

//Общиещие
hearManager.hear(/^!Моб (\d+) (\d+)$/i, async (message) => general.MobStatsCalculator(message));

hearManager.hear(/^!укл (\d+)(?: (\d+))?$/i, async (message) => general.DodgeCalculator(message));

hearManager.hear(/^!(?:(хп|телосложение)|(урон)|(вын|выносливость)|(реген выносливости|рег вын)|(ловк|ловкость)) (\d{1,3})$/i, async (message) =>general.StatsCalculator(message));

hearManager.hear(/^!ур (?:(\d{1,2}) )?(\d{1,2})$/i, async (message) => general.LvCalculator(message));


hearManager.hear(/^!(?:(?:Р)|(?:R)) (?:(\d+)-(\d+))(?: (\d+))?(?: (\d+)-(\d+)(?: (\+)?)?)?$/i, async (message) => general.RandomCommand(message, main));

hearManager.hear(/^!(?:(?:Опыт)|(?:Exp)) (\d{1,4}) (\d{1,4})(?: (\d+))?$/i, async (message) => general.ExperienceCalculator(message));

//Админские команды:
hearManager.hear(/^!рандом макс (\d+)$/i, async (message) => {
	if (!main.isGod(message.senderId)) return;
	maxRandomsPerRequest = Number(message.$match[1]);
	message.send("Теперь лимит на число бросков за раз = " + maxRandomsPerRequest);
});

hearManager.hear(/^!рандом (?:(?:вкл)|(?:выкл))$/i, async (message) => {
	if (!main.isGod(message.senderId)) return;
	randomEnable = !randomEnable;
	message.send("Рандом теперь " + (randomEnable ? "включён": "выключен"));
});

hearManager.hear(/^!сохр$/i, async (message) => {
	if (!main.isGod(message.senderId)) return;
	main.saveConfigs();
	message.send("Настройки сохранены");
});

hearManager.hear(/^!загр$/i, async (message) => {
	if (!main.isGod(message.senderId)) return;
	fs.exists('.configs.json', (e) => {
		if (!e) {
			message.send("Не найден файл с сохранёнными настройками");
			return;
		}
		else {
			main.loadConfigs();
			message.send("Настройки загружены");
        }
	});
});

//Продавщица
hearManager.hear(/^\!Добавить предмет(?: (\d+))? (\D.*)\n(.+)$/im, async (message) => shopping.AddItem(message, main));

hearManager.hear(/^!Удалить предмет (\d+)( (\d+))?$/i, async (message) => shopping.DeleteItem(message, main));

hearManager.hear(/^!Магазин( (\d+))?$/i, async (message) => shopping.ShowShop(message, main));

hearManager.hear(/^!Продавец (\d+) \[id(\d+)\|(.*)\]$/i, async (message) => shopping.ChangeTrader(message, main));

hearManager.hear(/^!Предмет (\d+)(?: (\d+))?$/i, async (message) => shopping.ShowItem(message, main));

hearManager.hear(/^!Очистить магазин( (\d+))?$/im, async (message) => shopping.CleanupShop(message, main));

//Фракции
hearManager.hear(/^!Фракции$/i, async (message) => fract.ShowFractList(message, main));

hearManager.hear(/^!Добавить фракцию (.+)$/i, async (message) => fract.AddFract(message, main));

hearManager.hear(/^!Удалить фракцию (\d+)$/i, async (message) => fract.DeleteFract(message, main));

hearManager.hear(/^!Добавить (\d+) \[id(\d+)\|(.*)\]$/i, async (message) => fract.AddMember(message, main));

hearManager.hear(/^!Удалить (\d+) \[id(\d+)\|(.*)\]$/i, async (message) => fract.DeleteMember(message, main));

hearManager.hear(/^!Участники(?: (\d+))?$/i, async (message) => fract.ShowMemberList(message, main));

//Инвентарь
hearManager.hear(/^!Инвентарь(?: \[id(\d+)\|(.*)\])?$/i, async (message) => inv.ShowInventory(message, main));

hearManager.hear(/^!Прах(?: \[id(\d+)\|(.*)\])?$/i, async (message) => inv.ShowDust(message, main));

//Авторизация бота.
updates.start().catch(console.error);
console.log("Started");