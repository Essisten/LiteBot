const dust_types = ["Red", "Yellow", "Blue", "Purple", "White", "Black"];

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
    let fin = `Драконьи монеты: ${player.money}\n\nИнвентарь:`;
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
        type = 1, item_name = message.$match[7], item_info = message.$match[8];
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
    player.items.push(new Item(main.conf.maxItemID++, item_name, item_info, type));
    if (main.conf.maxItemID > 99999)
      main.conf.maxItemID = 0;
    main.SavePlayers();
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
    player.armor = player.armor.filter((item) => item.id != item_id);
    player.weapon = player.weapon.filter((item) => item.id != item_id);
    player.misc = player.misc.filter((item) => item.id != item_id);
    message.send(`${selected_item.name} выброшен`);
    player.items.splice(item_num - 1);
    main.SavePlayers();
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
  constructor(id, name, desc, type)
  {
    this.id = id;
    this.name = name;
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
}

module.exports = InventoryCommands;