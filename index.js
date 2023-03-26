const general = require('./general');
const shopping = require('./shopping');
const help = require('./help.json');

const {VK} = require('vk-io');
const vk = new VK({
		token: '4fbefb4a179218709d292d7c67be4267365db1985d4826f7686dfd0bebff8cc1d3aba581ff6eb3a603bf8',
    apiMode: 'parallel',
    pollingGroupId: 198913394
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
      this.ShopItems = require("./ShopItems.json");
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
    	fs.writeFileSync('.configs.json', json);
    }
    
    loadConfigs()
    {
    	let file = JSON.parse(fs.readFileSync('.configs.json'));
    	this.maxRandomsPerRequest = file.maxRandomsPerRequest;
    	this.randomEnable = file.randomEnable;
    }
    
    SaveShop()
    {
      let json = JSON.stringify(this.ShopItems, null, "\t");
    	fs.writeFileSync("./ShopItems.json", json);
    }
}

 //Обработчик сообщений:
updates.on('message', hearManager.middleware);

var main = new MainStuff();

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

//Продавщица:

hearManager.hear(/^\!Добавить предмет(?: (\d+))? (\D.*)\n(.+)$/im, async (message) => shopping.AddItem(message, main));

hearManager.hear(/^!Удалить предмет (\d+)( (\d+))?$/i, async (message) => shopping.DeleteItem(message, main));

hearManager.hear(/^!Магазин( (\d+))?$/i, async (message) => shopping.ShowShop(message, main));

hearManager.hear(/^!Продавец (\d+) \[id(\d+)\|(.*)\]$/i, async (message) => shopping.ChangeTrader(message, main));

hearManager.hear(/^!Предмет (\d+)(?: (\d+))?$/i, async (message) => shopping.ShowItem(message, main));

hearManager.hear(/^!Очистить магазин( (\d+))?$/im, async (message) => shopping.CleanupShop(message, main));

hearManager.hear(/^!Фракции$/i, async (message) => {
	let f = Object.keys(main.ShopItems), phrases = ["Все сдохли", "А где?", "Отвали", "Фракций нет", "Я захватил мир", "Список фракций пуст"];
	if (f.length == 0)
		message.send(phrases[main.Random(0, phrases.length - 1)]);
	else
	{
		let fin = "Список фракций:";
		for (let i = 1; i <= f.length; i++)
			fin += `\n${i}) ${f[i - 1]}.`;
		message.send(fin);
	}
});

hearManager.hear(/^!Добавить фракцию (.+)$/i, async (message) => {
	if (!main.isGod(message.senderId)) return;
	let f = message.$match[1];
	if (main.ShopItems[f] != undefined)
	{
		message.send("Такая фракция уже существует...");
		return;
	}
	main.ShopItems[f] = {
		Trader: null,
		Members: [],
		Items: []
	};
	main.SaveShop();
	message.send(`Появилась фракция "${f}". Не забудь назначить ей продавца и добавить предметов в магазин!`);
});

hearManager.hear(/^!Удалить фракцию (\d+)$/i, async (message) => {
	if (!main.isGod(message.senderId)) return;
	if (Number(message.$match[1]) > Object.keys(main.ShopItems).length)
	{
		message.send("Фракция не существует...");
		return;
	}
	let	f = Object.keys(main.ShopItems)[Number(message.$match[1]) - 1];
	delete main.ShopItems[f];
	main.SaveShop();
	message.send(`Фракция "${f}" была расформирована. Теперь у её участников будет больше свободного времени!`);
});

hearManager.hear(/^!Добавить (\d+) \[id(\d+)\|(.*)\]$/i, async (message) => {
	if (!main.isGod(message.senderId)) return;
	if (Number(message.$match[1]) > Object.keys(main.ShopItems).length)
	{
		message.send("Фракция не существует...");
		return;
	}
	let	f = Object.keys(main.ShopItems)[Number(message.$match[1]) - 1];
	if (main.ShopItems[f].Members.includes(Number(message.$match[2])))
	{
		let phrases = ["Уже в гачи-клубе", "Уже состоит во фракции", "Пусть выйдет и зайдёт нормально", "Обед, уютненько"];
		message.send(phrases[main.Random(0, phrases.length - 1)]);
		return;
	}
	main.ShopItems[f].Members.push(Number(message.$match[2]));
	main.SaveShop();
	message.send("Пользователь приглашён в " + f);
});

hearManager.hear(/^!Удалить (\d+) \[id(\d+)\|(.*)\]$/i, async (message) => {
	if (!main.isGod(message.senderId)) return;
	if (Number(message.$match[1]) > Object.keys(main.ShopItems).length)
	{
		message.send("Фракция не существует...");
		return;
	}
	let	f = Object.keys(main.ShopItems)[Number(message.$match[1]) - 1];
	if (!main.ShopItems[f].Members.includes(Number(message.$match[2])))
	{
		let phrases = ["Ты бредишь?", "Не состоит в данной фракции", "Пусть выйдет и зайдёт нормально", "БАН"];
		message.send(phrases[main.Random(0, phrases.length - 1)]);
		return;
	}
	main.ShopItems[f].Members.splice(main.ShopItems[f].Members.indexOf(Number(message.$match[2])), 1);
	main.SaveShop();
	message.send("Пользователь исключён из " + f);
});

hearManager.hear(/^!Участники(?: (\d+))?$/i, async (message) => {
	let f = 0, phrases = ["Данной фракции не существует", "Неправильно", "Проверь список командой !Фракции", "Заткнись, шизоид"], names = ["Персона", "Игрок", "Человек", "Гений", "АВОВА", "Кокодриле", "Амогус", "Хз кто это"];
	if (message.$match[1] != undefined && main.isGod(message.senderId))
	{
		f = Number(message.$match[1]) - 1;
		if (Object.keys(main.ShopItems).length <= f)
		{
      message.send(phrases[main.Random(0, phrases.length - 1)]);
			return;
		}
	}
	else
	{
		for (let i = 0; i < Object.keys(main.ShopItems).length; i++)
		{
			f = main.ShopItems[Object.keys(main.ShopItems)[i]].Members.find(_ => _ == message.senderId);
			if (f != undefined)
				break;
		}
		if (f == undefined)
		{
			message.send(phrases[main.Random(0, phrases.length - 1)]);
			return;
		}
	}
	let final_message = "Участники фракции " + Object.keys(main.ShopItems)[f];
	for (let i = 0; i < main.ShopItems[Object.keys(main.ShopItems)[f]].Members.length; i++)
	{
		final_message += `\n${i}) [id${main.ShopItems[Object.keys(main.ShopItems)[f]].Members[i]}|${names[main.Random(0, names.length - 1)]}]`;
	}
	message.send(final_message);
});

hearManager.hear(/^!(?:(хелп)|(help))(?: (\d+))?$/i, async (message) =>
{
  let page = Number(message.$match[3]);
  if (message.$match[3] == undefined || (page == 4 && !main.isGod(message.senderId)))
   page = 0;
	let msg;
  switch (page)
    {
      case 1:
        msg = `Список команд:
!р [a-b] [количество] [c-d] [+] - рандом.
[a и b] - границы диапазона рандома,
[количество] - количество рандомов(необязательно),
[c и d] - границы диапазона рандома для определения успешный ли он(необязательно),
[+] - если поставить в конце, будут выведены результаты рандомов при заданном диапазоне успеха(необязательно).

!опыт [ур игрока] [ур убитого] [количество](необязательно) - подсчёт опыта по формуле.

!укл [ур игрока] [ловкость игрока в sp] - подсчет стоимости гарантированного уклонения от прямой атаки по формуле

!моб [ур] [тип] - подсчёт суммарных характеристик

!ур [текущий ур](необязательно) [новый ур] - подсчёт необходимого количества опыта для перехода с одного уровня на указанный

![характеристика] [суммарное к-во SP] - подсчёт суммы характеристик, которые дают вложенные SP.
Доступны следующие характеристики:
[хп] или [телосложение]
[урон]
[вын] или [выносливость]
[рег вын] или [реген выносливости]
[ловк] или [ловкость]`;
        break;
      case 2:
        msg = `!Магазин [номер фракции](опционально) - отображение доступных товаров

!Предмет [порядковый номер предмета] [номер фракции](опционально) - описание определённого предмета`;
        break;
      case 3:
        msg = `!Фракции - список существующих сторон
        
!Дом [уровень] [количество](опционально) - подсчёт дохода в ход от жилого здания Альянса`
      break;
      case 4:
        msg = `!Добавить предмет [номер фракции](для админа) [название] [описание предмета] - добавление предмета. Название не должно начинаться с цифры;

!Удалить предмет [номер фракции](для админа) [порядковый номер в магазине] - удаление предмета, доступно админам и продавцам;

!Очистить магазин [порядковый номер фракции] - очищает магазин от всего, что в нём записано;

!рандом макс [число] - изменение ограничителя количества рандомов за раз;

!рандом [вкл/выкл] - включение и отключение возможности рандомить;

!сохр - сохранить настройки;

!загр - загрузить настройки;

!добавить [номер фракции] [id пользователя] - добавляет пользователя во фракцию;

!удалить [номер фракции] [id пользователя] - удаляет пользователя из фракции;

!участники [номер фракции] - просмотр списка участников фракции;

!добавить фракцию [название] - создание новой фракции;

!удалить фракцию [номер фракции] - удаление фракции и всего содержимого её магазина;

!продавец [номер фракции] [id пользователя] - назначает ответственного за магазин определённой фракции. Тот может использовать админские команды для магазина. При повторном использовании команды снимает эту привилегию с пользователя`;
        break;
      default:
        msg = `!хелп [номер страницы] - выводит список доступных команд.
1 - самые полезные, для подсчёта сложных цифорок;
2 - магазин;
3 - для участников фракций;
4 - админские.`;
        break;
    }
  message.send(msg);
});

//Авторизация бота.
updates.start().catch(console.error);
console.log("Started");