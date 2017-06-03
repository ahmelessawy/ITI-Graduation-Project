﻿import { Offer, Restaurant } from "../Classes";
import { Collection } from "../Mongodb";
import { objectId, Id } from "../Types";
module.exports = {
    Collection: () => Collection("Offers"),
    Read(object: Id, callback: any) {
        Collection("Offers").findOne(objectId(object._id), (err, row: Offer) => {
            if (row) return callback({ success: true, data: row });
            else return callback({ success: false, data: object });
        });
    },
    ReadAll(callback: any) {
        Collection("Offers").find().toArray((err, row: Offer[]) => {
            if (row) return callback({ success: true, data: row });
            else return callback({ success: false });
        });
    },
    ReadOffers(callback: any) {
        Collection("Offers").find().toArray((err, row: any[]) => {
            if (row) {
                const restaurants = async function () {
                    const offers = Array<Offer>();
                    for (let i = 0; i < row.length; i++) {
                        await new Promise(resolve => {
                            Collection("Restaurants").findOne(objectId(row[i].provider), (err, datarow: Restaurant) => {
                                row[i]["restName"] = datarow.name;
                                resolve(row[i]);
                            });
                        }).then(offer => offers.push(offer as Offer));
                    }
                    return offers;
                };
                restaurants().then(offers => callback({ success: true, data: offers }));
            } else return callback({ success: false });
        });
    },
    Delete(object: Id, callback: any) {
        Collection("Offers").removeOne({ "_id": objectId(object._id) }, (err, resp) => {
            if (resp.result.ok) return callback({ success: true, data: resp.result });
            else return callback({ success: false, data: object });
        });
    },
    Create(object: Offer, callback: any) {
        Collection("Offers").insertOne(object, (err, row: Offer) => {
            if (row) return callback({ success: true, data: row });
            else return callback({ success: false });
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