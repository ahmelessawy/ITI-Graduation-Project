﻿import { Address, User, Meal, Ingredient } from "../Classes";
import { validate, Validator, IsEmail, IsUrl } from "class-validator";
const valid = new Validator();
{
    const users = require("express").Router(), db = require("../Mongodb");
    users
        .get("/", (req: any, res: any) => db.Users.ReadAll(response => res.json(response)))
        .get("/:id", (req, res) => db.Users.Read({ _id: req.params.id }, response => res.json(response)))
        .delete("/:id", (req, res) => db.Users.Delete({ _id: req.params.id }, response => res.json(response)))
        .post("/", (req, res) => {
            if (req.body.firstName && req.body.lastName && req.body.email && req.body.username && req.body
                .password) {
                let tempAddress = new Address();
                if (req.body.address) tempAddress = new Address(req.body.address.street && req.body.address.city && req.body.address.country);
                const tempUser = new User(db.objectId(), req.body.firstName, req.body.lastName, req.body.email, req.body.username, req.body.phones, tempAddress, req.body.image);
                validate(tempAddress).then(errs1 => {
                    if (errs1.length > 0) {
                        const errors = Array<string>();
                        errs1.forEach(a => errors.push(a.constraints[Object.keys(a.constraints)[0]]));
                        res.status(400).json({ success: false, msg: errors });
                    } else {
                        validate(tempUser).then(errs2 => {
                            if (errs2.length > 0) {
                                const errors = Array<string>();
                                errs2.forEach(a => errors.push(a.constraints[Object.keys(a.constraints)[0]]));
                                res.status(400).json({ success: false, msg: errors });
                            } else db.Users.Create(tempUser, req.body.password, response => res.json(response));
                        });
                    }
                });
            } else res.status(400).json({ success: false, msg: "Invalid Data" });
        })
        .put("/", (req, res) => {
            if (req.body._id) {
                db.Users.Read({ _id: req.body._id },
                    response => {
                        if (response.success) {
                            const tempUser: User = response.data;
                            if (req.body.firstName) tempUser.firstName = req.body.firstName;
                            if (req.body.lastName) tempUser.lastName = req.body.lastName;
                            if (valid.isEmail(req.body.email)) tempUser.email = req.body.email;
                            if (req.body.username) tempUser.username = req.body.username;
                            if (Array.isArray(req.body.phones)) tempUser.phones = req.body.phones;
                            if (req.body.address) {
                                if (req.body.address.street) tempUser.address.street = req.body.address.street;
                                if (req.body.address.city) tempUser.address.city = req.body.address.city;
                                if (req.body.address
                                    .country) tempUser.address.country = req.body.address.country;
                            }
                            if (req.body.image) tempUser.image = req.body.image;
                            db.Users.Update(tempUser, response => res.json(response));
                        } else res.status(404).json({ success: false, msg: "Data Not Found" });
                    });
            } else res.status(400).json({ success: false, msg: "Invalid Data" });
        })
        .post("/Favorites", (req, res) => {
            if (req.body.user && req.body.meal && valid.isArray(req.body.meal.ingredients)) {
                const tempMeal = new Meal(req.body.meal._id, req.body.meal.name, req.body.meal.image, req.body.meal.category, req.body.meal.price);
                tempMeal.addIngredients(req.body.meal.ingredients);
                db.Users.AddFavorite(tempMeal, { userId: req.body.user, restId: req.body.meal.restId }, response => res.json(response));
            } else res.status(400).json({ success: false, msg: "Invalid Data" });
        })
        .delete("/Favorites/:id", (req, res) => db.Users.DeleteFavorite({ _id: req.params.id }, response => res.json(response)));
    module.exports = users;
}