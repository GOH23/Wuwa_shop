import { Markup, Telegraf } from 'telegraf'
import { User } from './db_connection/user.entity/user';
import { MysqlDataSource, RegisterUser, UserRepository } from './db_connection/database';
import { TypeProduct, TypeProductController } from './db_connection/type.entity/type.entity';
import { Product, ProductController } from './db_connection/product.entity/product';
import { message } from 'telegraf/filters';
import { AiClass } from './config/ai_class';
import { config } from 'dotenv';
config()
const bot = new Telegraf(process.env.TG_TOKEN!)
const sendMainMessage = async (ctx: any) => {
    ctx.sendPhoto({ url: "https://skargames.ru/wp-content/uploads/2024/01/wuthering-waves-android-ios-pc_result-870x400.webp" }, {
        caption: `Привет,  ✋ \n🥶 Магазин - лучший и самый дешевый магазин, где продают аккаунты и оказывают услуги в разных играх!`,
        reply_markup: {
            inline_keyboard: [
                [{ text: "👥 | Наша группа в телеграмме", url: "https://t.me/wuwa_shop" }]
            ]
        }
    })
}

const getInvoice = (product: Product) => {
    const invoice = {
        provider_token: process.env.PROVIDER_TOKEN!, // токен выданный через бот
        start_parameter: 'test', //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
        title: product.name, // Название продукта, 1-32 символа
        description: product.description, // Описание продукта, 1-255 знаков
        currency: 'RUB', // Трехбуквенный код валюты ISO 4217
        prices: [{ label: product.name, amount: 100*product.price }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
        photo_url: "https://cdn.shazoo.ru/c1400x625/681239_C3eBRcJ_wuthering-waves.jpg", // URL фотографии товара для счета-фактуры. Это может быть фотография товара или рекламное изображение услуги. Людям больше нравится, когда они видят, за что платят.
        photo_width: 500, // Ширина фото
        photo_height: 281, // Длина фото
        payload: product.ProductId
    }

    return invoice
}
const createMainMenu = () => {
    return Markup.keyboard([
        [Markup.button.callback("💵 | Купить услугу или товар", "send_tovars")],
        [Markup.button.callback("👤 | Профиль", "profile"), Markup.button.callback("🆘 | Помощь", "help_request")]
    ]).resize(true)

};

//bot.hears('pay', (ctx) => { // это обработчик конкретного текста, данном случае это - "pay"
//  return ctx.replyWithInvoice(getInvoice()) //  метод replyWithInvoice для выставления счета  
//})

bot.action(/type_\d+/, async (ctx) => {
    ctx.deleteMessage()
    const [action, index] = ctx.match[0].split('_');
    let Products: Product[] = await ProductController.GetAllByTypeID(MysqlDataSource.manager, index)
    ctx.sendPhoto({ url: "https://cdn.shazoo.ru/c1400x625/681239_C3eBRcJ_wuthering-waves.jpg" }, {
        caption: `Все товары в категории `,
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [...Products.map((el) => [{ text: el.name, callback_data: `p_${el.ProductId}_${index}` }]), [{ text: "Назад", callback_data: "go_back" }]]
        }
    });
})

bot.start(async (ctx) => {
    let GettedUser: User | null = await UserRepository.findOneBy({ Userid: ctx.chat.id })
    if (!GettedUser) await RegisterUser(ctx)
    ctx.deleteMessage()
    ctx.reply("Меню бота", createMainMenu())
    await sendMainMessage(ctx)

});
bot.action("go_back_main", async ctx => {
    ctx.deleteMessage()
    ctx.reply("Меню бота", createMainMenu())
    await sendMainMessage(ctx)
});

bot.action("go_back", async (ctx) => {
    ctx.deleteMessage()
    let TovarsTypes: TypeProduct[] = await TypeProductController.GetAll(MysqlDataSource.manager)
    //
    ctx.sendPhoto({ url: "https://cdn.shazoo.ru/c1400x625/681239_C3eBRcJ_wuthering-waves.jpg" }, {
        caption: `Наши товары и услуги`,
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: TovarsTypes.map((el) => [{ text: el.TypeName, callback_data: `type_${el.Typeid}` }])
        }
    });
})
bot.hears("🆘 | Помощь", async (ctx) => {
    ctx.replyWithAnimation("https://pixelbox.ru/wp-content/uploads/2021/10/gif-anime-steam-pixelbox.ru-4.gif", {
        parse_mode: 'HTML',
        caption: `<b>Правила нашего интернет-магазина:</b>\n<b>Покупки</b>\n<blockquote>1.Неработоспособность товара необходимо сообщать агенту техподдержки в течение 10 минут.</blockquote>\n<blockquote>2.Товар должен быть использован/активирован максимально быстро после получения, не более 10 минут.</blockquote>\n<b>Замена</b>\n<blockquote>1.Для получения замены неработоспособного товара на момент покупки, необходимо предоставить полную видеозапись процесса покупки до момента выявления результата. В случае отсутствия видео агент поддержки вправе отказать в замене.</blockquote>\n<blockquote>Возврат денежных средств осуществляется исключительно на баланс бота.</blockquote>\n<b>Замена/Возрат. Как отправить в тп</b><blockquote>1.Перешлите это сообщение\n2.Напишите свое сообщение,отправив при этом видео покупки и использования товара</blockquote>`,
    })
})
bot.hears("💵 | Купить услугу или товар", async (ctx) => {
    ctx.deleteMessage()
    let TovarsTypes: TypeProduct[] = await TypeProductController.GetAll(MysqlDataSource.manager)
    //
    ctx.sendPhoto({ url: "https://cdn.shazoo.ru/c1400x625/681239_C3eBRcJ_wuthering-waves.jpg" }, {
        caption: `Наши товары и услуги`,
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [...TovarsTypes.map((el) => [{ text: el.TypeName, callback_data: `type_${el.Typeid}` }]), [{ text: "Назад", callback_data: "go_back_main" }]]
        }
    });
});
bot.hears("👤 | Профиль", async ctx => {
    ctx.deleteMessage()
    
    let GettedUser: User | null = await UserRepository.findOneBy({ Userid: ctx.chat?.id })
    ctx.sendPhoto({ url: 'https://asumetech.com/wp-content/uploads/2023/05/Solo-Leveling.jpg' },
        {
            caption: `Ваш профиль ${GettedUser!.first_name}:
                \n Ваш баланс(скоро): ${GettedUser!.Balance} руб
                \n Ваш баланс токенов(скоро): ${GettedUser!.TokenBalance}T`,
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: [
                    [
                        { text: "💵| Пополнить(скоро)", callback_data: "add_money" },
                        { text: "Назад", callback_data: "go_back_main" }
                    ],
                ]
            }
        }
    )
})
bot.action(/p_\d+_\d+/, async ctx => {
    const [action, ProductIndex, TypeIndex] = ctx.match[0].split('_');
    let Product: Product | null = await ProductController.GetAllByProductId(MysqlDataSource.manager, ProductIndex)
    ctx.deleteMessage()
    ctx.sendPhoto({ url: "https://cdn.shazoo.ru/c1400x625/681239_C3eBRcJ_wuthering-waves.jpg" }, {
        parse_mode: 'HTML',
        caption: `
            <b>🔰 | Название: </b> ${Product?.name}\n<b>🔰 | Описание: </b> ${Product?.description}\n<b>💰 | Цена товара: </b> ${Product?.price} руб\n${Product?.imgurGallery && `📂 |<a href="${Product?.imgurGallery}"> Посмотреть галерею</a>`}
        `,
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [{ text: "Купить", callback_data: `buy_${Product?.ProductId}` }],
                [{ text: "Назад", callback_data: `type_${TypeIndex}` }]
            ]
        }
    })
})
bot.action(/buy_\d+/, async ctx => {
    const [action, ProductIndex] = ctx.match[0].split('_');
    let Product: Product | null = await ProductController.GetAllByProductId(MysqlDataSource.manager, ProductIndex)
    ctx.deleteMessage()
    ctx.replyWithInvoice(getInvoice(Product!))
})
bot.on('pre_checkout_query',async (ctx) => {
    await ctx.answerPreCheckoutQuery(true)
}) // ответ на предварительный запрос по оплат)
bot.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
    let PaymentId = ctx.message.successful_payment.invoice_payload;
    let PProduct : Product = (await ProductController.SetProductBuyedAndGetData(MysqlDataSource.manager,PaymentId))!
    if(PProduct.file == ""){
        await ctx.replyWithAnimation("https://i.yapx.cc/GuFa4.gif",{
            caption: `Успешная оплата товара: ${ctx.message.successful_payment.invoice_payload}\n\t<b>Email:</b><code> ${PProduct.email}</code>\n\t<b>Password:</b><code> ${PProduct.password}</code>`,
            parse_mode: 'HTML',
        })
    }
    else{
        await ctx.replyWithDocument({source: PProduct.file},{
            caption: `Успешная оплата товара: ${ctx.message.successful_payment.invoice_payload}`,
            parse_mode: 'HTML',
        })
    }
})
bot.on(message("reply_to_message"), async (ctx: any) => {
    //При пересылке сообщения "🆘 | Помощь" сообщение пользователя пересылает бот менеджеру по айди чата
    if (bot.botInfo?.id != ctx.message.from.id) {
        if (ctx.message.reply_to_message?.caption_entities.length == 9) {
            ctx.forwardMessage('id', { protect_content: true })
        }
    }
})

MysqlDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
        bot.launch({
            allowedUpdates: ['message', 'callback_query', 'chat_member', 'my_chat_member', 'chat_join_request', 'chosen_inline_result','pre_checkout_query']

        })
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
