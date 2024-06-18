const { Telegraf } = require("telegraf")
const bot = new Telegraf(process.env.BOT_TOKEN)

async function interact(ctx, chatID, request) {

    const response = await axios({
        method: "POST",
        url: `https://general-runtime.voiceflow.com/state/user/${chatID}/interact`,
        headers: {
            Authorization: process.env.VOICEFLOW_API_KEY
        },
        data: {
            request
        }
    });
    for (const trace of response.data) {
        switch (trace.type) {
            case "text":
            case "speak":
                {
                    await ctx.reply(trace.payload.message);
                    break;
                }
            case "visual":
                {
                    await ctx.replyWithPhoto(trace.payload.image);
                    break;
                }
            case "end":
                {
                    await ctx.reply("Conversation is over")
                    break;
                }
        }
    }
};

bot.start(async (ctx) => {
    let chatID = ctx.message.chat.id;
    await interact(ctx, chatID, {type: "launch"});
});

const ANY_WORD_REGEX = new RegExp(/(.+)/i);
bot.hears(ANY_WORD_REGEX, async (ctx) => {
    let chatID = ctx.message.chat.id;
  	await interact(ctx, chatID, {
        type: "text",
        payload: ctx.message.text
    });
});

// AWS event handler syntax (https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html)
exports.handler = async event => {
    try {
      await bot.handleUpdate(JSON.parse(event.body))
      return { statusCode: 200, body: "" }
    } catch (e) {
      console.error("error in handler:", e)
      return { statusCode: 400, body: "This endpoint is meant for bot and telegram communication" }
    }
}