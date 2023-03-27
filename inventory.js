class InventoryCommands
{
  static ShowInventory(message, main)
  {
    let player = main.Players[message.senderId],
        isAdmin = main.isGod(message.senderId) && message.$match[1] != undefined;
    if (isAdmin)
      player = main.Players[message.$match[1]];
    if (player == undefined)
    {
      if (isAdmin)
        return message.send('Его не существует');
      player = new Player();
      main.Players[message.senderId] = player;
      main.SavePlayers();
    }
    if (player.items.length == 0)
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
    let player = main.Players[message.senderId],
        isAdmin = main.isGod(message.senderId) && message.$match[1] != undefined;
    if (isAdmin)
      player = main.Players[message.$match[1]];
    if (player == undefined)
    {
      if (isAdmin)
        return message.send('Его не существует');
      player = new Player();
      main.Players[message.senderId] = player;
      main.SavePlayers();
    }
    let fin = `Твои запасы праха...

Белый: ${player.dust.White}
Красный: ${player.dust.Red}
Жёлтый: ${player.dust.Yellow}
Синий: ${player.dust.Blue}
Фиолетовый: ${player.dust.Purple}
Чёрный: ${player.dust.Black}`
    message.send(fin);
  }
}

class Dust
{
  constructor()
  {
    this.Red = 0;
    this.Yellow = 0;
    this.Blue = 0;
    this.Purple = 0;
    this.White = 0;
    this.Black = 0;
  }
}

class Item
{
  constructor(name, desc, type)
  {
    this.name = name;
    this.description = desc;
    this.type = type;
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
}

module.exports = InventoryCommands;