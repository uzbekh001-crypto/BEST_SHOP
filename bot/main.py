import os



from dotenv import load\_dotenv

from telegram import (

Update,

KeyboardButton,

ReplyKeyboardMarkup,

WebAppInfo,

)

from telegram.ext import (

Application,

CommandHandler,

ContextTypes,

)



load\_dotenv()



BOT\_TOKEN = os.getenv("BOT\_TOKEN")

WEBAPP\_URL = os.getenv("WEBAPP\_URL")



async def start(update: Update, context: ContextTypes.DEFAULT\_TYPE):

keyboard = [

[

KeyboardButton(

text="📱 BEST SHOP",

web\_app=WebAppInfo(url=WEBAPP\_URL),

)

]

]



```

reply_markup = ReplyKeyboardMarkup(

    keyboard,

    resize_keyboard=True,

)



await update.message.reply_text(

    "👋 Assalomu alaykum!\n\n"

    "BEST SHOP xizmatlaridan foydalanish uchun "

    "quyidagi tugmani bosing 👇",

    reply_markup=reply_markup,

)

```



def main():

if not BOT\_TOKEN:

raise ValueError("BOT\_TOKEN .env faylda topilmadi!")



```

if not WEBAPP_URL:

    raise ValueError("WEBAPP_URL .env faylda topilmadi!")



app = Application.builder().token(BOT_TOKEN).build()



app.add_handler(CommandHandler("start", start))



print("BEST SHOP bot ishga tushdi...")



app.run_polling()

```



if **name** == "**main**":

main()







