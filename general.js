var main = require('./index')

class GeneralCommands
{
  static CalculateStatsSum(pair, sp)
  {
    let sum = 0;
    for (let i = 0; i < sp; i++)
    {
      sum += pair[0] + i * pair[1];
    }
    return Math.ceil(sum);
  }

  static RandomCommand(message, main)
  {
    //1, 2 - диапазон рандома, 3 - количество, 4 и 5 - диапазон успеха, 6 - показать или скрыть вывод результата
    if (!main.randomEnable) return;
    if (message.$match[3] == undefined)
      message.send(main.Random(Number(message.$match[1]), Number(message.$match[2])));
    else
    {
      var k = Number(message.$match[3]), counter = 0, fin = "";
      if (k > maxRandomsPerRequest) return;
      for (var i = 0; i < k; i++)
      {
        if (fin.length > 4050)
        {
          message.send("Не удаётся отправить настолько большое сообщение");
          return;
              }
        let tmp = main.Random(Number(message.$match[1]), Number(message.$match[2]));
        if (message.$match[6] == '+' || message.$match[4] == undefined)
          fin += tmp + ' ';
        if (tmp <= message.$match[5] && tmp >= message.$match[4])
          counter++;
      }
        message.send(`${message.$match[6] == '+' || message.$match[4] == undefined ? `Выпавшие числа: ${fin}.` : ""}\n${message.$match[4] != undefined ? `Количество успешных исходов: ${counter}` : ""}`);
    }
  }

  static ExperienceCalculator(message)
  {
    //1 - уровень игрока, 2 - уровень моба, 3 - количество мобов
    if (Number(message.$match[1]) < 1 || Number(message.$match[2]) < 1)
    {
      message.send("Уровень игрока и моба не может быть нулевым");
      return;
    }
    if (Math.abs(Number(message.$match[1]) - Number(message.$match[2])) > 30)
    {
      message.send("Не безопасно подсчитывать опыт с такой высокой разницей в уровнях. Сделайте это вручную.");
      return;
      }
    var plv = Number(message.$match[1]), mlv = Number(message.$match[2]), k;
    if (message.$match[3] != undefined)
      k = Number(message.$match[3]);
    else
      k = 1;
    var fin = 0;
    for (var i = 0; i < k; i++)
      fin += Math.ceil((mlv * 1.5) + plv * Math.pow(2, mlv - plv));
    message.send(fin);
  }

  static DodgeCalculator(message)
  {
  	let lv = Number(message.$match[1]), lovk = message.$match[2], stat = 0;
  	if (lovk === undefined)
  		lovk = 0;
    for (let i = 1; i <= lv; i++)
  		{
  			stat += 15 * (1 + 0.2 * i);
  		}
    stat = Math.floor(stat - GeneralCommands.CalculateStatsSum([0.9, 0.1], lovk));
    stat = Math.max(stat, 0);
  		message.send(`Тебе понадобится ${stat} выносливости для уклона`);    
  }

  static MobStatsCalculator(message)
  {
  	//1 - уровень существа
  	//2 - (1 - моб, 2 - элитник, 3 - босс)
  	let lv = Number(message.$match[1]), type = Number(message.$match[2]), stat = 0;
  	if (type < 1 || type > 3) {
  			message.send(`Первый аргумент это уровень, а второй - тип.
Типы:
1) моб
2) элитник
3) босс`);
  			return;
  		}
  		for (let i = 0; i <= lv; i++)
  		{
  			stat += 450 * type * i;
  		}
  	message.send(`Всего выйдет ${stat} суммарных характеристик`);    
  }

  static LvCalculator(message)
  {
  	let lv = Number(message.$match[2]), old_lv =  Number(message.$match[1]), exp = 50, add_exp = 50, exp_sum = 0;
    if (message.$match[1] == undefined || old_lv == lv)
      old_lv = lv - 1;
    if (old_lv > lv)
    {
      let tmp = old_lv;
      old_lv = lv;
      lv = tmp;
    }
    if (lv < 2 || old_lv < 1){
      message.send("!ур [текущий ур](необязательно) [новый ур]");
      return;
    }
    for (let k = old_lv; k <= lv; k++)
      {
        if (k < 2)
          continue;
        for (let i = 3; i <= k; i++)
        {
          if ((i - 1) % 5 == 0)
            add_exp *= 2;
          exp += add_exp;
        }
        exp_sum += exp;
        exp = 50;
        add_exp = 50;
      }
    message.send(`Для перехода с ${old_lv} до ${lv} уровня тебе нужно ${exp_sum} опыта`);    
  }

  static StatsCalculator(message)
  {
    let sum = 0,
      numbers = [[30, 10, "здоровья"], [5, 3, "урона"],
                [10, 2, "выносливости"],
                 [1, 0.5, "регенерации выносливости"],
                 [0.9, 0.1, "скидку на уворот"]];
    let sp = Number(message.$match[numbers.length + 1]),
      id = 0;
    for (let i = 0; i < numbers.length; i++)
    {
      if (message.$match[i + 1] != undefined)
      {
        id = i;
        break;
      }
    }
    sum = GeneralCommands.CalculateStatsSum(numbers[id], sp);
    message.send(`Твои ${sp} SP в сумме дадут ${sum} ${numbers[id][2]}`);
  }
}

module.exports = GeneralCommands;