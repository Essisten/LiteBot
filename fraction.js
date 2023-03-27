class FractCommands
{
  static ShowFractList(message, main)
  {
    let f = Object.keys(main.ShopItems), phrases = ["Все сдохли", "А где?", "Отвали", "Фракций нет", "Я захватил мир", "Список фракций пуст"];
  	if (f.length == 0)
  		return message.send(phrases[main.Random(0, phrases.length - 1)]);
    let fin = "Список фракций:";
    for (let i = 1; i <= f.length; i++)
      fin += `\n${i}) ${f[i - 1]}.`;
    message.send(fin);
  }

  static AddFract(message, main)
  {
    if (!main.isGod(message.senderId)) return;
  	let f = message.$match[1];
  	if (main.ShopItems[f] != undefined)
  		return message.send("Такая фракция уже существует...");
  	main.ShopItems[f] = {
  		Trader: null,
  		Members: [],
  		Items: []
  	};
  	main.SaveShop();
  	message.send(`Появилась фракция "${f}". Не забудь назначить ей продавца и добавить предметов в магазин!`);
  }

  static DeleteFract(message, main)
  {
    if (!main.isGod(message.senderId)) return;
  	if (Number(message.$match[1]) > Object.keys(main.ShopItems).length)
  		return message.send("Фракция не существует...");
  	let	f = Object.keys(main.ShopItems)[Number(message.$match[1]) - 1];
  	delete main.ShopItems[f];
  	main.SaveShop();
  	message.send(`Фракция "${f}" была расформирована. Теперь у её участников будет больше свободного времени!`);
  }

  static AddMember(message, main)
  {
    if (!main.isGod(message.senderId)) return;
  	if (Number(message.$match[1]) > Object.keys(main.ShopItems).length)
  		return message.send("Фракция не существует...");
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
  }

  static DeleteMember(message, main)
  {
    if (!main.isGod(message.senderId)) return;
  	if (Number(message.$match[1]) > Object.keys(main.ShopItems).length)
  		return message.send("Фракция не существует...");
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
  }

  static ShowMemberList(message, main)
  {
    let f = 0, phrases = ["Данной фракции не существует", "Неправильно", "Проверь список командой !Фракции", "Заткнись, шизоид"],
      names = ["Персона", "Игрок", "Человек", "Гений", "АВОВА", "Кокодриле", "Амогус", "Хз кто это"];
  	if (message.$match[1] != undefined && main.isGod(message.senderId))
  	{
  		f = Number(message.$match[1]) - 1;
  		if (Object.keys(main.ShopItems).length <= f)
        return message.send(phrases[main.Random(0, phrases.length - 1)]);
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
  			return message.send(phrases[main.Random(0, phrases.length - 1)]);
  	}
  	let fract_name = Object.keys(main.ShopItems)[f],
        member_count = main.ShopItems[fract_name].Members.length,
        final_message = `Участники фракции ${fract_name}:`;
    if (member_count == 0)
      return message.send('Все сбежали');
  	for (let i = 0; i < member_count; i++)
  	{
  		final_message += `\n${i}) [id${main.ShopItems[fract_name].Members[i]}|${names[main.Random(0, names.length - 1)]}]`;
  	}
  	message.send(final_message);
  }
}

module.exports = FractCommands;