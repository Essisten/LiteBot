var main = require('./index')

class ShoppingCommands
{
  static AddItem(message, main)
  {
    //1 - номер фракции
    let  f;
    if (main.isGod(message.senderId) && message.$match[1] != undefined)
    {
      if (Number(message.$match[1]) <= Object.keys(main.ShopItems).length)
        f = Object.keys(main.ShopItems)[Number(message.$match[1]) - 1];
    }
    if (f == undefined)
    {
      for (let i of Object.keys(main.ShopItems))
      {
        if (main.ShopItems[i].Trader == message.senderId)
        {
          f = i;
          break;
        }
      }
      if (f == undefined)
      {
        let phrases = ["Ты кто?", "Тебе нельзя", "Не подглядывать!", "Не дам", "Ты не состоишь в этой фракции", "Только админы могут подглядывать"];
        message.send(phrases[main.Random(0, phrases.length - 1)]);
        return;
      }
    }
    if (main.ShopItems[f] == undefined)
    {
      message.send("Фракция не существует...");
      return;
    }
    main.ShopItems[f].Items.push(
      {
        Name: message.$match[2].trim(),
        Description: message.text.replace(/^(.+)\n/i, '')
      }
    );
    main.SaveShop();
    message.send(`Предмет "${message.$match[2]}" добавлен в магазин, принадлежащий ${f}.`);
    return main;
  }

  static DeleteItem(message, main)
  {
    //1 - номер предмета, 2 - номер фракции
  	let  item = Number(message.$match[2]) - 1, f;
  	if (main.isGod(message.senderId) && message.$match[1] != undefined)
  	{
  		if (Number(message.$match[1]) <= Object.keys(main.ShopItems).length)
  			f = Object.keys(main.ShopItems)[Number(message.$match[1]) - 1];
  	}
  	if (f == undefined)
  	{
  		for (let i of Object.keys(main.ShopItems))
  		{
  			if (main.ShopItems[i].Trader == message.senderId)
  			{
  				f = i;
  				break;
  			}
  		}
  		if (f == undefined)
  		{
  			let phrases = ["Ты кто?", "Тебе нельзя", "Не подглядывать!", "Не дам", "Ты не состоишь в этой фракции", "Только админы могут подглядывать"];
  			message.send(phrases[main.Random(0, phrases.length - 1)]);
  			return;
  		}
  	}
  	if (main.ShopItems[f] == undefined)
  	{
  		message.send("Фракция не существует...");
  		return;
  	}
  	if (main.ShopItems[f].Items[item] == undefined)
  	{
  		message.send("Не могу найти такой предмет...");
  		return;
  	}
  	message.send(`Предмет ${main.ShopItems[f].Items[item].Name} убран из магазина, принадлежащего ${f}.`);
  	main.ShopItems[f].Items.splice(item, 1);
  	main.SaveShop();
  }

  static ShowShop(message, main)
  {
    let f;
    if (main.isGod(message.senderId) && message.$match[1] != undefined)
    {
      if (Number(message.$match[2]) <= Object.keys(main.ShopItems).length)
        f = Object.keys(main.ShopItems)[Number(message.$match[2]) - 1];
    }
    if (f == undefined)
    {
      for (let i of Object.keys(main.ShopItems))
      {
        if (main.ShopItems[i].Members.includes(message.senderId))
        {
          f = i;
          break;
        }
      }
      if (f == undefined)
      {
        message.send("Фиг тебе");
        return;
      }
    }
    if (main.ShopItems[f] == undefined)
    {
      message.send("Фракция не существует...");
      return;
    }
    if (main.ShopItems[f].Items.length == 0) {
      let phrases = ["Кто-то всё спиздил из магазина!", "В настоящее время магазин пуст...", "А нет тут ничего", "Магазин закрыт"];
      message.send(phrases[main.Random(0, phrases.length - 1)]);
      return;
    }
    let FinalMessage = "Ассортимент магазина:";
    for (let i = 1; i <= main.ShopItems[f].Items.length; i++)
      FinalMessage += `\n${i}) ` + main.ShopItems[f].Items[i - 1].Name;
    message.send(FinalMessage);
  }

  static ChangeTrader(message, main)
  {
    if (!main.isGod(message.senderId)) return;
    let shop_id = Number(message.$match[1]) - 1,
        user_id = Number(message.$match[2]);
    if (shop_id + 1 >= Object.keys(main.ShopItems).length)
    {
      message.send("Фракция не существует...");
      return;
    }
    let f = Object.keys(main.ShopItems)[shop_id];
    let name = message.$match[3], phrases = ["Пользователь", "Юзер", "Существо", "Кто-то", "Игрок", "Я", "Ты", "[ДАННЫЕ УДАЛЕНЫ]"];
    if (name == undefined)
      name = phrases[main.Random(0, phrases.length - 1)];
    if (main.ShopItems[f].Trader == user_id)
    {
      main.ShopItems[f].Trader = null;
      message.send(`${name} уволен`);
    }
    else
    {
      main.ShopItems[f].Trader = user_id;
      message.send(`${name} теперь владелец магазина`);
    }
    main.SaveShop();
  }

  static ShowItem(message, main)
  {
    //1 - номер предмета, 2 - номер фракции
  	let  item = Number(message.$match[1]) - 1, f;
    if (item == -1)
    {
      let ph = ["Да ты заебёшь...", "Хватит", "Не издевайся надо мной", "Я сейчас в тебе эти предметы хранить буду", "Тебе не покажу", "Ты что, программист?"];
      message.send(ph[main.Random(0, ph.length - 1)]);
      return;
    }
  	if (main.isGod(message.senderId) && message.$match[2] != undefined)
  	{
  		if (Number(message.$match[2]) <= Object.keys(main.ShopItems).length)
  			f = Object.keys(main.ShopItems)[Number(message.$match[2]) - 1];
  	}
  	if (f == undefined)
  	{
  		for (let i of Object.keys(main.ShopItems))
  		{
  			if (main.ShopItems[i].Members.includes(message.senderId))
  			{
  				f = i;
  				break;
  			}
  		}
  		if (f == undefined)
  		{
  			let phrases = ["Ты кто?", "Тебе нельзя", "Не подглядывать!", "Не дам", "Ты не состоишь в этой фракции", "Только админы могут подглядывать"];
  			message.send(phrases[main.Random(0, phrases.length - 1)]);
  			return;
  		}
  	}
  	if (main.ShopItems[f] == undefined)
  	{
  		message.send("Фракция не существует...");
  		return;
  	}
  	if (main.ShopItems[f].Items[item] == undefined)
  	{
  		message.send("Не могу найти такой предмет...");
  		return;
  	}
  	let realItem = main.ShopItems[f].Items[item];
  	message.send(`[${realItem.Name}]\n${realItem.Description}`);
  }

  static CleanupShop(message, main)
  {
    let f;	//номер фракции
  	if (message.$match[1] != undefined && main.isGod(message.senderId))
  	{
  		if (Number(message.$match[1]) > Object.keys(main.ShopItems).length)
  		{
  			message.send("Фракция не существует...");
  			return;
  		}
  		f = Object.keys(main.ShopItems)[Number(message.$match[1]) - 1];
  	}
  	else
  	{
  		for (let i of Object.keys(main.ShopItems))
  		{
  			if (main.ShopItems[i].Trader == message.senderId)
  			{
  				f = i;
  				break;
  			}
  		}
  		if (f == undefined)
  		{
  			message.send("Нет");
  			return;
  		}
  	}
  	let phrases = ["Магазин очищен", "* звук взрыва *", "РАЗДАЧА НА СПАВНЕ", "Все вещи были отданы бездомным олигархам", "Спасибо за шмот"]
  	main.ShopItems[f].Items = [];
  	main.SaveShop();
  	message.send(phrases[main.Random(0, phrases.length - 1)]);
  }
}

module.exports = ShoppingCommands;