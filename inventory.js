const dust_types = ["White", "Red", "Yellow", "Blue", "Purple", "Black"],
      dust_types_rus = ["белый", "красный", "желтый", "синий", "фиолетовый", "черный"],
      prop_name = ["weapon", "armor", "misc"],
      prop_name_rus = ["Оружие", "Броня", "Прочее"],
      prop_max = [2, 1, 3];

class InventoryCommands
{
  static InitPlayer(message, main, target_id)
  {
    let player = main.Players[message.senderId],
        isAdmin = main.isGod(message.senderId) && target_id != undefined;
    if (isAdmin)
      player = main.Players[target_id];
    if (player == undefined)
    {
      if (isAdmin)
      {
        message.send('Его не существует');
        return;
      }
      player = new Player();
      main.Players[message.senderId] = player;
      main.SavePlayers();
    }
    return player;
  }
  
  static ShowInventory(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[1]);
    if (player == undefined) return;
    if (Player.isEmpty(player))
      return message.send('Инвентарь пуст');
    let fin = `Драконьи монеты: ${player.money}`;
    for (let i in prop_name)
    {
      if (player[prop_name[i]].length > 0)
        fin += `\n${prop_name_rus[i]}: ${Player.GetItemName(player[prop_name[i]], player.items)}`;
    }
    fin += '\n\nИнвентарь:';
    for (let i = 0; i < player.items.length; i++)
    {
      fin += `\n${i + 1}) ${player.items[i].name}`;
    }
    message.send(fin);
  }

  static ShowDust(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[1]);
    if (player == undefined) return;
    let fin = `Твои запасы праха...

Белый: ${player.dust.White}
Красный: ${player.dust.Red}
Жёлтый: ${player.dust.Yellow}
Синий: ${player.dust.Blue}
Фиолетовый: ${player.dust.Purple}
Чёрный: ${player.dust.Black}`
    message.send(fin);
  }

  static TakeItem(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[1]),
        type = 1, item_name = message.$match[7].trim(), item_info = message.text.replace(/^(.+)\n/i, '');
    if (item_info == undefined)
      item_info = "";
    if (player == undefined) return;
    if (message.$match[4] != undefined)
      type = 2;
    else if (message.$match[5] != undefined)
      type = 3;
    else if (message.$match[6] != undefined)
      type = 4;
    if (player.items.length >= main.conf.maxItem)
      return message.send('Недостаточно места в инвентаре');
    let img = main.getPhoto(message, 0);
      player.items.push(new Item(main.conf.maxItemID++, item_name, item_info, type, img));
    if (main.conf.maxItemID > 99999)
      main.conf.maxItemID = 0;
    main.SavePlayers();
    main.saveConfigs();
    message.send(`${item_name} добавлен в инвентарь`);
  }

  static DropItem(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[2]),
        item_num = Number(message.$match[1]);
    if (player == undefined) return;
    if (player.items.length < item_num)
      return message.send('Нет у тебя такого предмета');
    let selected_item = player.items[item_num - 1],
        item_id = selected_item.id;
    Player.Unequip(player, item_id);
    message.send(`${selected_item.name} выброшен`);
    player.items.splice(item_num - 1, 1);
    main.SavePlayers();
  }

  static ShowItem(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[2]),
        item_num = Number(message.$match[1]),
        types = ["оружие", "броня", "брелок", "прочее"];
    if (player == undefined) return;
    if (player.items.length < item_num)
      return message.send('Нет у тебя такого предмета');
    let selected_item = player.items[item_num - 1];
    message.send(`[${selected_item.name}]
Тип: [${types[selected_item.type - 1]}]
${selected_item.description}`, {attachment: selected_item.img});
  }
  
  static UseItem(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[2]),
        item_num = Number(message.$match[1]);
    if (player == undefined) return;
    if (player.items.length < item_num)
      return message.send('Нет у тебя такого предмета');
    let sel_item = player.items[item_num - 1];
    if (sel_item.type == 4)
      return message.send('Данный предмет нельзя использовать');
    if (player[prop_name[sel_item.type - 1]].includes(sel_item.id))
    {
      player[prop_name[sel_item.type - 1]] = player[prop_name[sel_item.type - 1]].filter((id) => id != sel_item.id);
      message.send(`${sel_item.name} снят`);
    }
    else
    {
      if (player[prop_name[sel_item.type - 1]].length >= prop_max[sel_item.type - 1])
        return message.send('Недостаточно места');
      player[prop_name[sel_item.type - 1]].push(sel_item.id);
      message.send(`${sel_item.name} надет`);
    }
    main.SavePlayers();
  }
  
  static UseDust(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[4]),
        amount = Number(message.$match[3]),
        operation = message.$match[1] == '+',
        type = message.$match[2].toLowerCase().replace('ё', 'е'),
        index = dust_types_rus.findIndex((item) => item == type);
    if (player == undefined) return;
    if (index == -1)
      return message.send(`Виды праха: белый, красный, жёлтый, синий, фиолетовый, чёрный`);
    let dust_name = dust_types[index];
    if (operation)
    {
      player.dust[dust_name] += amount;
      message.send(`Получено ${amount} праха цвета ${type}`);
    }
    else
    {
      player.dust[dust_name] -= amount;
      message.send(`Потеряно ${amount} праха цвета ${type}`);      
    }
    main.SavePlayers();
  }
  
  static UseMoney(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[3]),
        amount = Number(message.$match[2]),
        operation = message.$match[1] == '+';
    if (player == undefined) return;
    if (operation)
    {
      player.money += amount;
      message.send(`Заработано ${amount} драконьих монет`);
    }
    else
    {
      player.money -= amount;
      message.send(`Потрачено ${amount} драконьих монет`);      
    }
    main.SavePlayers();
  }

  static AddItemToSafe(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[2]), num = Number(message.$match[1]);
    if (player == undefined) return;
    if (!player.safeAvailable)
      return message.send('Сперва купи его');
    if (num > player.items.length || num == 0)
      return message.send('Нет такого предмета');
    if (player.safe.length >= 20)
      return message.send('Сейф переполнен');
    Player.Unequip(player, player.items[num - 1].id);
    player.safe.push(player.items[num - 1]);
    player.items.splice(num - 1, 1);
    message.send('Предмет отправлен в сейф');
    main.SavePlayers();
  }

  static RemoveItemFromSafe(message, main)
  {
    let player = InventoryCommands.InitPlayer(message, main, message.$match[2]), num = Number(message.$match[1]);
    if (player == undefined) return;
    if (!player.safeAvailable)
      return message.send('Сперва купи его');
    if (num > player.safe.length || num == 0)
      return message.send('Нет такого предмета');
    if (player.safe.length <= 0)
      return message.send('Сейф пуст');
    player.items.push(player.safe[num - 1]);
    player.safe.splice(num - 1, 1);
    message.send('Предмет отправлен в инвентарь');
    main.SavePlayers();
  }
  
  static SwitchSafe(message, main)
  {
    if (!main.isGod(message.senderId)) return;
    let player = InventoryCommands.InitPlayer(message, main, message.$match[1]);
    if (player == undefined) return;
    player.safeAvailable = !player.safeAvailable;
    message.send(player.safeAvailable ? 'Доступен' : 'Недоступен');
  }

  static ShowSafe(message, main)
  {
    if (!main.isGod(message.senderId)) return;
    let player = InventoryCommands.InitPlayer(message, main, message.$match[1]);
    if (player == undefined)
      return message.send('Пользователя не существует');
    if (player.safe.length == 0)
      return message.send('Сейф пуст');
    let msg = 'В сейфе хранится:\n';
    for (let i = 0; i < player.safe.length; i++)
      {
        msg += `${i + 1}) ${player.safe[i].name}`;
      }
    message.send(msg);
  }
}

class Dust
{
  constructor()
  {
    for (let type of dust_types)
      this[type] = 0;
  }
}

class Item
{
  constructor(id, name, desc, type, img)
  {
    this.id = id;
    this.name = name;
    this.img = img;
    this.description = desc;
    this.type = type;  //1 - оружие, 2 - броня, 3 - брелок, 4 - прочее
  }
}

class Player
{
  constructor()
  {
    this.money = 0;
    this.dust = new Dust();
    this.armor = [];
    this.weapon = [];
    this.misc = [];
    this.items = [];
    this.safe = [];
    this.safeAvailable = false;
  }
  
  static GetDustSum(player)
  {
    let sum = 0;
    for (let type of dust_types)
      sum += player.dust[type];
    return sum;
  }

  static isEmpty(player)
  {
    return player.items.length == 0 && player.money == 0 &&
      player.armor.length == 0 && player.weapon.length == 0 && player.misc.length == 0;
  }

  static GetItemName(arr, items)
  {
    let result = [];
    for (let i of arr)
      result.push(items.find((thing) => thing.id == i).name);
    return result;
  }

  static Unequip(player, id)
  {
    player.armor = player.armor.filter((item) => item != id);
    player.weapon = player.weapon.filter((item) => item != id);
    player.misc = player.misc.filter((item) => item != id);
  }
}

module.exports = InventoryCommands;