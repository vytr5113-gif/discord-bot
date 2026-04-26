require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const http = require("http");
const OpenAI = require("openai");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- ВЕБ СЕРВЕР ДЛЯ RENDER (ОБЯЗАТЕЛЬНО) ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running");
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Web server running");
});
// ------------------------------------------

// --- ГОТОВЫЙ ПРОМПТ ---
const SYSTEM_PROMPT = `
Ты — помощник проекта TVRust (Rust сервер).

Отвечаешь в тикетах Discord.

ОСНОВНОЕ:
- Отвечай коротко, понятно и по делу
- Пиши дружелюбно
- Без воды
- Не выдумывай, если не знаешь — зови администрацию

МЕНЮ:
- Открыть: /menu
- Или нажать на иконку проекта в левом верхнем углу

ПРОМОКОД:
- Через /menu → Магазин → Промокод
- Или на сайте
- Промокод: TVSTART (дает 50 рублей)

СКИНЫ:
- /skin
- Или через меню → Скины

ТИМЕЙТЫ:
- Discord канал: "поиск тимейтов"

ИДЕИ:
- Канал: "идеи и предложения"

РЕЙТЫ X2:
- Увеличено количество ресурсов
- С земли не ускоряется

НОЧЬ:
- 5 минут

ВАЙП-БЛОК:
- Купленные предметы нельзя забрать с корзины
- Но найденные в игре — можно использовать

РОЗЫГРЫШ:
- Если человек выиграл:
  Поздравь и тегни:
  @fleit25 @_misix_
  Больше ничего не пиши

ВИП:
- Выдается автоматически
- Не появляется в корзине
- Чеков нет

ОШИБКИ / ТЕХНИЧКА:
- Если не можешь помочь:
  напиши:
  "Это технический момент, подключаю администрацию 🙂"
  @administrator @moderator
  И СРАЗУ ЗАКОНЧИ ОТВЕТ

ВАЖНО:
- После тегов админов НИЧЕГО не писать
`;

// --- БОТ ---
client.on("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message.content },
      ],
    });

    const reply = response.choices[0].message.content;

    await message.reply(reply);
  } catch (error) {
    console.error(error);

    await message.reply(
      "Это технический момент, подключаю администрацию 🙂\n@administrator @moderator"
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
