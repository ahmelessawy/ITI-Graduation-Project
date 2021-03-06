﻿import { Offer, Restaurant } from "../Classes";
import { Collection } from "../Mongodb";
import { objectId, Id } from "../Types";
module.exports = {
    Collection: () => Collection("Offers"),
    Read(object: Id, callback: any) {
        Collection("Offers").findOne(objectId(object._id), (err, row: Offer) => {
            if (err) return callback({ success: false, msg: "Error !!" });
            if (row) return callback({ success: true, data: row });
            else return callback({ success: false, data: object });
        });
    },
    ReadFull(object: Id, callback: any) {
        Collection("Offers").findOne(objectId(object._id), (err, row: Offer) => {
            if (err) return callback({ success: false, msg: "Error !!" });
            if (row) {
                new Promise((resolve, reject) => {
                    Collection("Restaurants").findOne(objectId(row.provider), (err, datarow: Restaurant) => {
                        if (err) return callback({ success: false, msg: "Error !!" });
                        if (datarow) {
                            row["restName"] = datarow.name;
                            row["oldPrice"] = datarow.meals.find(meal => meal._id.toString() === row.meal.toString()).price;
                            resolve(row);
                        }
                        reject();
                    });
                }).then(offer => callback({ success: true, data: offer })).catch(() => { });
            } else return callback({ success: false, data: object });
        });
    },
    ReadAll(callback: any) {
        Collection("Offers").find().toArray((err, row: Offer[]) => {
            if (err) return callback({ success: false, msg: "Error !!" });
            if (row) return callback({ success: true, data: row });
            else return callback({ success: false });
        });
    },
    ReadOffers(callback: any) {
        Collection("Offers").find().toArray((err, row: any[]) => {
            if (err) return callback({ success: false, msg: "Error !!" });
            if (row) {
                const restaurants = async function () {
                    const offers = Array<Offer>();
                    for (let i = 0; i < row.length; i++) {
                        await new Promise((resolve, reject) => {
                            Collection("Restaurants").findOne(objectId(row[i].provider),
                                (err, datarow: Restaurant) => {
                                    if (err) return callback({ success: false, msg: "Error !!" });
                                    if (datarow) {
                                        row[i]["restName"] = datarow.name;
                                        row[i]["oldPrice"] = datarow.meals.find(meal => meal._id.toString() === row[i].meal.toString()).price;
                                        resolve(row[i]);
                                    }
                                    reject();
                                });
                        }).then(offer => offers.push(offer as Offer)).catch(() => { });
                    }
                    return offers;
                };
                restaurants().then(offers => callback({ success: true, data: offers }));
            } else return callback({ success: false });
        });
    },
    Delete(object: Id, callback: any) {
        Collection("Offers").removeOne({ "_id": objectId(object._id) }, (err, resp) => {
            if (err) return callback({ success: false, msg: "Error !!" });
            if (resp.result.ok) return callback({ success: true, data: resp.result });
            else return callback({ success: false, data: object });
        });
    },
    Create(object: Offer, callback: any) {
        object.provider = objectId(object.provider);
        object.meal = objectId(object.meal);
        Collection("Offers").update({ "description": object.description }, { $setOnInsert: object }, { upsert: true }, (err, resp1) => {
            if (err) return callback({ success: false, msg: "Error !!" });
            if (resp1.result.upserted) {
                Collection("Restaurants").update({ "_id": object.provider }, { $addToSet: { "offers": objectId(resp1.result.upserted[0]._id) } }, (err, resp2) => {
                    if (err) return callback({ success: false, msg: "Error !!" });
                    if (resp2.result.ok) return callback({ success: true, data: resp1.result, data1: resp2.result });
                    else return callback({ success: false });
                });
            } else return callback({ success: false });
        });
    },
    Update(object: Offer, callback: any) {
        object._id = objectId(object._id);
        Collection("Offers").updateOne({ _id: object._id }, { $set: object }, (err, row: Offer) => {
            if (row) return callback({ success: true, data: row });
            else return callback({ success: false });
        });
    }
};