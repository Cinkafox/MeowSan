import fs from "node:fs";
import Logger from "./Logger.js";
const path = "ignore.json";

/**
 * 
 * @returns {{users:[string],channels:[string]}}
 */
function ReadIgnore(){
    if(fs.existsSync(path)){
        return JSON.parse(fs.readFileSync(path).toString());
    }
    return {"users":[],"channels":[]};
}

function WriteIgnore(obj){
    fs.writeFileSync(path,JSON.stringify(obj));
}

function ReadUsers(){
    return ReadIgnore().users;
}

function ReadChannesl(){
    return ReadIgnore().channels;
}

function WriteUser(user){
    let obj = ReadIgnore();
    if(obj.users.includes(user)) return obj;
    obj.users.push(user);
    WriteIgnore(obj);
    Logger.debug("IGNORING:",user)
    return obj;
}

function WriteChannel(channel){
    let obj = ReadIgnore();
    if(obj.channels.includes(channel)) return obj;
    obj.channels.push(channel);
    WriteIgnore(obj);
    Logger.debug("IGNORING CHANNEL:",channel)
    return obj;
}

function RemoveUser(user){
    let obj = ReadIgnore();
    const index = obj.users.indexOf(user);
    if(index === -1) return obj;
    obj.users.splice(index,1);
    WriteIgnore(obj);
    Logger.debug("NOT IGNORING:",user)
    return obj;
}

function RemoveChannel(channel){
    let obj = ReadIgnore();
    const index = obj.channels.indexOf(channel);
    if(index === -1) return obj;
    obj.channels.splice(index,1);
    WriteIgnore(obj);
    Logger.debug("NOT IGNORING CHANNEL:",channel)
    return obj;
}

export {WriteChannel,WriteUser,RemoveChannel,RemoveUser,ReadUsers,ReadChannesl}