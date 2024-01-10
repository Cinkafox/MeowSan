import GPTProvider from "./AIProvider/GPTProvider.js";
import Bot from "./Bot.js";
import express from "express";
import Logger from "./Utils/Logger.js";
import fs from "fs";
import LocalProvider from "./AIProvider/LocalProvider.js";
import History from "./Data/History.js";
import Prompt from "./Data/Prompt.js";

const app = express();
const port = 3000;

const provider = new GPTProvider();
const bot = new Bot(provider,"kravchenko.nsfw")

app.get('/', (req, res) => {
    res.setHeader("Content-Type","text/html").send(fs.readFileSync("Page/index.html"));
});

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {*} next 
 */
const auth = function(req, res, next) {
    if(req.query.key !== process.env.BOT_PASS){
        res.setHeader("Content-Type","application/json")
        .status(401)
        .send({
            "status":"error",
            "error":"WHERE IS A KEY BITCH???"
        })
        return;
    }
    Logger.info("USER WITH TOKEN",req.query.key,"EXECUTED",req.originalUrl);
    next();
};

app.get("/status",auth,(req,res)=>{
    res.setHeader("Content-Type","application/json").send({
        "status":"done",
        "currentProfile":bot.name,
        "ignoringUsers":bot.ignoringUsers,
        "ignoringChannels":bot.ignoringChannels
    })
});

app.get('/discordUsers',auth,(req,res)=>{
    const whe = res.setHeader("Content-Type","application/json");
    const arr = [];
    for(let [id,user] of bot.client.users.cache){
        arr.push(user.username);
    }
    whe.send({
        "status":"done",
        "users":arr
    });
});


app.get('/profile', auth, (req, res) => {
    const whe = res.setHeader("Content-Type","application/json");

    if(req.query.set !== undefined && req.query.set !== ""){
        try {
            bot.LoadProfile(req.query.set);
            whe.send({
                "status":"done",
                "curprofile":bot.name
            });
        } catch (error) {
            whe.send({
                "status":"error",
                "error":error.message
            });
        }
        return;
    }

    const files = [];

    for(let file of fs.readdirSync("BotProfiles")){
        files.push(file.split(".")[0])
    }

    whe.send({
        "status":"done",
        "profiles":files
    });
});

//МММ СПАГЕТТИ УЛЯЛЯ!
app.get("/ignore/:type", auth, (req, res) => {
    const whe = res.setHeader("Content-Type","application/json");

    const type = req.params.type;

    if(req.query.add !== undefined && req.query.add !== ""){
        if(type == "user")
            bot.AddUserIgnore(req.query.add);
        else if (type == "channel")
            bot.AddChannelIgnore(req.query.add);
        else{
            whe.send({"status":"error","error":"unknow type " + type}); 
            return;
        }
        whe.send({"status":"done"});
        return;
    }
    if(req.query.remove !== undefined && req.query.remove !== ""){
        if(type == "user")
            bot.RemoveUserIgnore(req.query.remove);
        else if (type == "channel")
            bot.RemoveChannelIgnore(req.query.remove)
        else{
            whe.send({"status":"error","error":"unknow type " + type});
            return;
        }
        whe.send({"status":"done"});  
        return;
    }
    if(type == "user")
        whe.send({"status":"done","ignoredUsers":bot.ignoringUsers});
    else if (type == "channel")
        whe.send({"status":"done","ignoredChannels":bot.ignoringChannels});
    else
        whe.send({"status":"error","error":"unknow type " + type})   ;
});

const history = new History();

app.get("/prompt/:text",auth,async (req,res)=>{
    const whe = res.setHeader("Content-Type","application/json");
    const text = req.params.text;
    const out = await provider.prompt("user",text,history);
    whe.send({"text":out});
})

app.listen(port, () => {
    Logger.info(`сервер пашет на порту ${port}`);
});