const sqlite3 = require("sqlite3").verbose();
const dotenv = require("dotenv");
dotenv.config();
const db = new sqlite3.Database(process.env.DB_FILE || "./maindb.sqlite");
const TelegramBot = require("node-telegram-bot-api");
const botPasswordSettingKey = "bot_password";

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT, position INTEGER, level INTEGER, color TEXT, lookup TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT, price INTEGER, position INTEGER, article TEXT, manufacturer TEXT, description TEXT, amount TEXT, in_stock BOOLEAN, has_promo BOOLEAN, lookup TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS promos (id INTEGER PRIMARY KEY, name TEXT, description TEXT, position INTEGER)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS partners (id INTEGER PRIMARY KEY, name TEXT, position INTEGER, country TEXT, description TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS admins (login TEXT, password TEXT, super BOOLEAN, UNIQUE(login))"
  );
  if (process.env.ADMIN_LOGIN && process.env.ADMIN_PASSWORD) {
    db.run(
      "INSERT OR IGNORE INTO admins (login, password, super) VALUES(?,?,?)",
      [process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD, 1]
    );
  }
  db.run(
    "CREATE TABLE IF NOT EXISTS settings (key TEXT, value TEXT, UNIQUE(key))"
  );
  if (process.env.BOT_PASSWORD) {
    db.run("INSERT OR IGNORE INTO settings (key, value) VALUES(?, ?)", [
      botPasswordSettingKey,
      process.env.BOT_PASSWORD,
    ]);
  }
  db.run(
    "CREATE TABLE IF NOT EXISTS operators (chat INTEGER, username TEXT, UNIQUE(chat))"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS cat_to_cat (parent_id INTEGER, child_id INTEGER)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS cat_to_items (cat_id INTEGER, item_id INTEGER)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS attr_of_item (item_id INTEGER, name TEXT, value TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS promo_images (promo_id INTEGER, position INTEGER, data TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS item_images (item_id INTEGER, position INTEGER, data TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS partner_images (partner_id INTEGER, position INTEGER, data TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS recomended_items (parent_id INTEGER, child_id INTEGER)"
  );
});

async function getAsync(sql, params) {
  return new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    })
  );
}

async function getAllAsync(sql, params) {
  return new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      }
      // console.log({ sql, params, rows });
      resolve(rows);
    })
  );
}

function authorize(login, password, checkSuper) {
  let sql = "select login from admins where login = ? and password = ?";
  if (checkSuper) {
    sql += " and super = 1";
  }
  return getAllAsync(sql, [login, password])
    .then((rows) => rows.length > 0)
    .catch((err) => {
      console.log("Authorize sql error", err);
      return false;
    });
}

const checkAuth = (req, res, next, checkSuper) => {
  try {
    let auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Basic")) {
      res.statusCode = 401;
      res.send(wrapResponse(undefined, "Not authorized"));
      return;
    }
    auth = auth.substring("basic ".length);
    let [login, password] = Buffer.from(auth, "base64")
      .toString("utf-8")
      .split(":");

    authorize(login, password, checkSuper)
      .then((authorized) => {
        if (authorized) {
          next();
        } else {
          return Promise.reject();
        }
      })
      .catch(() => {
        res.statusCode = 403;
        res.send(wrapResponse(undefined, "Not authorized"));
      });
  } catch (reason) {
    console.error(reason);
    res.statusCode = 500;
    res.send(wrapResponse(undefined, reason));
    return;
  }
};

async function insertRow(sql, params) {
  return new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      }
      resolve(this.lastID);
    })
  );
}

let bot = undefined;
if (process.env.BOT_TOKEN) {
  console.log("starting bot");
  bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
  let botPassword = undefined;

  getAsync("select * from settings where key = ?", [
    botPasswordSettingKey,
  ]).then((row) => (botPassword = row?.value ?? undefined));

  bot.on("message", (msg) => {
    if (!msg.text) {
      return;
    }
    const lines = msg.text.split(" ");
    if (lines[0] === botPassword) {
      if (lines.length === 2) {
        const newPassword = lines[1];
        botPassword = newPassword;
        db.run("update settings set value = ? where key = ?", [
          newPassword,
          botPasswordSettingKey,
        ]);
      } else {
        getAllAsync("select * from operators where chat = ?", [
          msg.chat.id,
        ]).then((rows) => {
          if (rows?.length) {
            db.run(
              "delete from operators where chat = ?",
              [msg.chat.id],
              (err) => {
                if (!err) {
                  bot.sendMessage(
                    msg.chat.id,
                    "Вы больше не получаете уведомления!"
                  );
                } else {
                  console.error("Error while deleting operator", err);
                }
              }
            );
          } else {
            db.run(
              "insert into operators(chat, username) values(?, ?)",
              [msg.chat.id, msg.from?.username ?? ""],
              (err) => {
                if (!err) {
                  bot.sendMessage(
                    msg.chat.id,
                    "Вы будете получать новые уведомления!"
                  );
                } else {
                  console.error("Error while inserting operator", err);
                }
              }
            );
          }
        });
      }
    }
  });
}

async function loadParentCategories(category) {
  if (category.level <= 1) {
    return Promise.resolve([]);
  }
  return getAllAsync("select parent_id from cat_to_cat where child_id = ?", [
    category.id,
  ]).then((rows) => rows.map((row) => row.parent_id));
}

async function loadChildCategories(category) {
  if (category.level >= 3) {
    return Promise.resolve([]);
  }
  return getAllAsync("select child_id from cat_to_cat where parent_id = ?", [
    category.id,
  ]).then((rows) => rows.map((row) => row.child_id));
}

async function loadItems(category) {
  return getAllAsync("select item_id from cat_to_items where cat_id = ?", [
    category.id,
  ]).then((rows) => rows.map((row) => row.item_id));
}

async function loadItemImageIds(itemId) {
  return getAllAsync(
    "select ROWID as id from item_images where item_id = ? order by position ASC",
    [itemId]
  ).then((rows) => rows.map((row) => row.id));
}

async function loadAttributes(item) {
  return getAllAsync("select name, value from attr_of_item where item_id = ?", [
    item.id,
  ]);
}

async function loadItemCategories(item) {
  return getAllAsync("select cat_id from cat_to_items where item_id = ?", [
    item.id,
  ]).then((rows) => rows.map((row) => row.cat_id));
}

async function loadPromoImages(promo) {
  return getAllAsync(
    "select ROWID as id from promo_images where promo_id = ? order by position ASC",
    [promo.id]
  ).then((rows) => rows.map((row) => row.id));
}

async function loadPartnerImages(partner) {
  return getAllAsync(
    "select ROWID as id from partner_images where partner_id = ? order by position ASC",
    [partner.id]
  ).then((rows) => rows.map((row) => row.id));
}

function wrapResponse(data, error) {
  return JSON.stringify({ data, error });
}

function translateBoolean(row, keys) {
  for (const key of keys) {
    if (row[key] === 1) {
      row[key] = true;
    } else if (row[key] === 0) {
      row[key] = false;
    }
  }
}

function enrichServerWithApiRoutes(app) {
  app.get("/api/{*path}", (req, res, next) => {
    next();
  });
  app.put("/api/{*path}", checkAuth);
  app.delete("/api/{*path}", checkAuth);
  app.all("/api/admins/{*path}", (req, res, next) =>
    checkAuth(req, res, next, true)
  );
  app.get("/api/admins/", (req, res) => {
    getAllAsync("select login, super from admins where super = 0")
      .then((rows) => {
        rows.forEach((row) => translateBoolean(row, ["super"]));
        res.send(wrapResponse(rows));
      })
      .catch((reason) => {
        res.statusCode = 500;
        res.send(wrapResponse(undefined, reason));
      });
  });

  app.put("/api/admins/", (req, res) => {
    const newAdmin = req.body;
    insertRow(
      "insert or replace into admins (login, password, super) values (?, ?, 0)",
      [newAdmin.login, newAdmin.password]
    )
      .then((id) => {
        res.send(wrapResponse(id));
      })
      .catch((reason) => {
        res.statusCode = 500;
        res.send(wrapResponse(undefined, reason));
      });
  });

  app.delete("/api/admins/:login", (req, res) => {
    db.run("delete from admins where login = ?", [req.params.login], (err) => {
      if (!err) {
        res.send(wrapResponse("Success"));
      } else {
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      }
    });
  });

  app.post("/api/checkout/", async (req, res) => {
    try {
      if (!bot) {
        throw "Service unavailable";
      }
      const operators = await getAllAsync("select * from operators");
      if (!operators.length) {
        throw "Service unavailable";
      }
      const { checkoutData, cartItems } = req.body;
      for (const operator of operators) {
        bot.sendMessage(
          operator.chat,
          `Новый заказ:
ФИО: ${checkoutData.fullName}
Телефон: ${checkoutData.phone}
Email: ${checkoutData.email}
Адрес: ${checkoutData.delivaryAddress}
Самовывоз: ${checkoutData.selfPickup ? "Да" : "Нет"}
Название клиники: ${checkoutData.clinicName}
Сумма при оформлении: ${checkoutData.totalPrice}

Корзина: 
${cartItems
  .map(
    (item) => `Название: ${item.name}
Артикул: ${item.article}
Кол-во: ${item.count}
Цена: ${item.price}`
  )
  .join("\n\n")}`
        );
      }
    } catch (error) {
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
      return;
    }
  });

  app.get("/api/admin/login/", (req, res) => {
    checkAuth(req, res, () => res.send(wrapResponse("Success")));
  });

  app.get("/api/categories/", (req, res) => {
    const level = req.query.level;
    const full = req.query.full;
    getAllAsync("select * from categories where level = ?", [level])
      .then((rows) =>
        (full
          ? Promise.all([
              ...rows.map((row) =>
                loadChildCategories(row).then((arr) => (row.children = arr))
              ),
              ...rows.map((row) =>
                loadParentCategories(row).then((arr) => (row.parents = arr))
              ),
              ...rows.map((row) =>
                loadItems(row).then((arr) => (row.items = arr))
              ),
            ])
          : Promise.resolve()
        ).then(() => res.send(wrapResponse(rows)))
      )
      .catch((err) => {
        console.error(err);
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      });
  });

  app.get("/api/categories/:id", (req, res) => {
    getAsync("select * from categories where id = ?", [req.params.id])
      .then((row) => {
        if (!row) {
          res.send(wrapResponse(undefined));
          return;
        }
        Promise.all([
          loadChildCategories(row).then((arr) => (row.children = arr)),
          loadParentCategories(row).then((arr) => (row.parents = arr)),
          loadItems(row).then((arr) => (row.items = arr)),
        ]).then(() => res.send(wrapResponse(row)));
      })
      .catch((err) => {
        console.error(err);
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      });
  });

  app.delete("/api/categories/:id", (req, res) => {
    try {
      const id = req.params.id;
      db.run("delete from categories where id = ?", id);
      db.run(
        "delete from cat_to_cat where parent_id = ? or child_id = ?",
        id,
        id
      );
      db.run("delete from cat_to_items where cat_id = ?", id);
      res.send(wrapResponse("Success"));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });

  app.put("/api/categories/", (req, res) => {
    try {
      const category = req.body;
      if (category.id) {
        db.run(
          "update categories set name=?, description=?, position=?, color=? where id=?",
          category.name,
          category.description,
          category.position,
          category.color,
          category.id
        );

        getAllAsync("select parent_id from cat_to_cat where child_id = ?", [
          category.id,
        ]).then((parents) => {
          parents = parents.map((row) => row.parent_id);

          const newParents = category.parents.filter(
            (parent) => !parents.includes(parent)
          );
          const deletedParents = parents.filter(
            (parent) => !category.parents.includes(parent)
          );
          for (const newParent of newParents) {
            db.run(
              "insert into cat_to_cat (parent_id, child_id) values (?, ?)",
              [newParent, category.id]
            );
          }
          for (const deleted of deletedParents) {
            db.run(
              "delete from cat_to_cat where parent_id = ? and child_id = ?",
              [deleted, category.id]
            );
          }
        });

        getAllAsync("select child_id from cat_to_cat where parent_id = ?", [
          category.id,
        ]).then((children) => {
          children = children.map((row) => row.child_id);

          const newChildren = category.children.filter(
            (child) => !children.includes(child)
          );
          const deletedChildren = children.filter(
            (child) => !category.children.includes(child)
          );
          for (const newChild of newChildren) {
            db.run(
              "insert into cat_to_cat (parent_id, child_id) values (?, ?)",
              [category.id, newChild]
            );
          }
          for (const deleted of deletedChildren) {
            db.run(
              "delete from cat_to_cat where parent_id = ? and child_id = ?",
              [category.id, deleted]
            );
          }
        });

        getAllAsync("select item_id from cat_to_items where cat_id = ?", [
          category.id,
        ]).then((items) => {
          items = items.map((row) => row.item_id);

          const newitems = category.items.filter(
            (item) => !items.includes(item)
          );
          const deleteditems = items.filter(
            (item) => !category.items.includes(item)
          );
          for (const newItem of newitems) {
            db.run("insert into cat_to_items (cat_id, item_id) values (?, ?)", [
              category.id,
              newItem,
            ]);
          }
          for (const deleted of deleteditems) {
            db.run(
              "delete from cat_to_items where cat_id = ? and item_id = ?",
              [category.id, deleted]
            );
          }
        });
      } else {
        insertRow(
          "insert into categories (name, description, position, level, color) values (?, ?, ?, ?, ?)",
          [
            category.name,
            category.description,
            category.position,
            category.level,
            category.color,
          ]
        ).then((id) => {
          if (category.level > 1) {
            for (const parentId of category.parents) {
              db.run(
                "insert into cat_to_cat(parent_id, child_id) values (?, ?)",
                [parentId, id]
              );
            }
          }

          if (category.level < 3) {
            for (const childId of category.children) {
              db.run(
                "insert into cat_to_cat(parent_id, child_id) values (?, ?)",
                [id, childId]
              );
            }
          }

          for (const itemId of category.items) {
            db.run("insert into cat_to_items(cat_id, item_id) values(?, ?)", [
              id,
              itemId,
            ]);
          }
        });
      }

      res.send(wrapResponse("Success"));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });

  app.get("/api/items/search/", async (req, res) => {
    let query = req.query.query;
    if (!query) {
      res.send(wrapResponse([]));
      return;
    }
    query = query.toLowerCase();
    const queryWithWildcards = `%${query}%`;
    try {
      const result = { categories: [], items: [] };
      const categories1 = await getAllAsync(
        "select id, name, level from categories where level = 1"
      );
      for (const cat of categories1) {
        if (result.categories.length >= 5) {
          break;
        }
        if (cat.name.toLowerCase().includes(query)) {
          result.categories.push({ ...cat });
        }
      }
      const categories2 = await getAllAsync(
        "select c.id, c.name, c.level, cc.parent_id from categories c join cat_to_cat cc on c.id = cc.child_id where level = 2"
      );
      for (const cat of categories2) {
        if (cat.parent_id !== null && cat.parent_id !== undefined) {
          cat.parent =
            categories1.find((p) => p.id === cat.parent_id) ?? undefined;
        }
        if (result.categories.length >= 5) {
          break;
        }
        if (cat.name.toLowerCase().includes(query)) {
          result.categories.push({ ...cat });
        }
      }
      const categories3 = await getAllAsync(
        "select c.id, c.name, c.level, cc.parent_id from categories c join cat_to_cat cc on c.id = cc.child_id where level = 3"
      );
      for (const cat of categories3) {
        if (cat.parent_id !== null && cat.parent_id !== undefined) {
          cat.parent =
            categories2.find((p) => p.id === cat.parent_id) ?? undefined;
        }
        if (result.categories.length >= 5) {
          break;
        }
        if (cat.name.toLowerCase().includes(query)) {
          result.categories.push({ ...cat });
        }
      }

      const items = await getAllAsync(
        "select * from items where lookup like ? limit 5",
        [queryWithWildcards]
      ).then((rows) => {
        return Promise.all(
          rows.map((row) =>
            loadItemImageIds(row.id).then((imageIds) => (row.images = imageIds))
          )
        ).then(() => rows);
      });
      result.items.push(...items);

      res.send(wrapResponse(result));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });

  app.get("/api/items/images/:id", (req, res) => {
    const imageId = req.params.id;
    getAsync(
      "select ROWID as id, position, data from item_images where ROWID = ?",
      [imageId]
    ).then((image) => res.send(wrapResponse(image)));
  });

  app.get("/api/items/", (req, res) => {
    getAllAsync("select * from items")
      .then((rows) => {
        if (!rows) {
          res.send(wrapResponse(undefined));
          return;
        }
        rows.forEach((row) => translateBoolean(row, ["hasPromo", "inStock"]));
        return Promise.all([
          ...rows.map((row) =>
            loadAttributes(row).then((arr) => (row.attributes = arr))
          ),
          ...rows.map((row) =>
            loadItemImageIds(row.id).then((arr) => (row.images = arr))
          ),
          ...rows.map((row) =>
            loadItemCategories(row).then((arr) => (row.categories = arr))
          ),
        ]).then(() => res.send(wrapResponse(rows)));
      })
      .catch((err) => {
        console.error(err);
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      });
  });

  app.get("/api/items/:id", (req, res) => {
    getAsync("select * from items where id = ?", [req.params.id])
      .then((row) => {
        if (!row) {
          res.send(wrapResponse(undefined));
          return;
        }
        translateBoolean(row, ["has_promo", "in_stock"]);
        return Promise.all([
          loadAttributes(row).then((arr) => (row.attributes = arr)),
          loadItemImageIds(row.id).then((arr) => (row.images = arr)),
          loadItemCategories(row).then((arr) => (row.categories = arr)),
        ]).then(() => res.send(wrapResponse(row)));
      })
      .catch((err) => {
        console.error(err);
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      });
  });

  app.get("/api/items/:id/recomended", (req, res) => {
    getAllAsync(
      "select i.* from recomended_items ri join items i on ri.child_id = i.id where ri.parent_id = ?",
      [req.params.id]
    )
      .then((rows) => {
        Promise.all([
          ...rows.map((row) =>
            loadItemImageIds(row.id).then((imageIds) => (row.images = imageIds))
          ),
          ...rows.map((row) =>
            loadAttributes(row.id).then(
              (attributes) => (row.attributes = attributes)
            )
          ),
        ]).then(() => res.send(wrapResponse(rows)));
      })
      .catch((err) => {
        console.error(err);
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      });
  });

  app.delete("/api/items/:id", (req, res) => {
    try {
      const id = req.params.id;
      db.run("delete from items where id = ?", id);
      db.run("delete from cat_to_items where item_id = ?", id);
      db.run("delete from item_images where item_id = ?", id);
      db.run("delete from attr_of_item where item_id = ?", id);
      res.send(wrapResponse("Success"));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });
  //id INTEGER PRIMARY KEY, name TEXT, position INTEGER, article TEXT, manufacturer TEXT, description TEXT, amount TEXT, in_stock BOOLEAN, has_promo BOOLEAN

  app.put("/api/items/", (req, res) => {
    try {
      const item = req.body;
      if (item.id) {
        db.run(
          "update items set name=?, price=?, position=?, article=?, manufacturer=?, description=?, amount=?, in_stock=?, has_promo=?, lookup=? where id=?",
          item.name,
          item.price,
          item.position,
          item.article,
          item.manufacturer,
          item.description,
          item.amount,
          item.inStock,
          item.hasPromo,
          `${item.name} ${item.article}`.toLowerCase(),
          item.id
        );
        getAllAsync(
          "select child_id from recomended_items where parent_id = ?",
          [item.id]
        ).then((recomended) => {
          recomended = recomended.map((row) => row.child_id);
          const newRecs = item.recomended.filter(
            (id) => !recomended.includes(id)
          );
          const deletedRecs = recomended.filter(
            (id) => !item.recomended.includes(id)
          );
          for (const newEl of newRecs) {
            db.run(
              "insert into recomended_items (parent_id, child_id) values (?, ?)",
              [item.id, newEl]
            );
          }
          for (const deleted of deletedRecs) {
            db.run(
              "delete from recomended_items where child_id = ? and parent_id = ?",
              [deleted, item.id]
            );
          }
        });
        getAllAsync("select cat_id from cat_to_items where item_id = ?", [
          item.id,
        ]).then((categories) => {
          categories = categories.map((row) => row.cat_id);
          const newCats = item.categories.filter(
            (cat) => !categories.includes(cat)
          );
          const deletedCats = categories.filter(
            (cat) => !item.categories.includes(cat)
          );
          for (const newEl of newCats) {
            db.run("insert into cat_to_items (cat_id, item_id) values (?, ?)", [
              newEl,
              item.id,
            ]);
          }
          for (const deleted of deletedCats) {
            db.run(
              "delete from cat_to_items where cat_id = ? and item_id = ?",
              [deleted, item.id]
            );
          }
        });
        getAllAsync(
          "select position, data from item_images where item_id = ?",
          [item.id]
        ).then((images) => {
          const newImages = item.images.filter(
            (image) => !images.some((i) => i.data === image.data)
          );
          const deletedImages = images.filter(
            (image) => !item.images.some((i) => i.data === image.data)
          );
          const updatedImages = images.filter((image) => {
            const updated = item.images.find((i) => i.data === image.data);
            if (updated && updated.position !== image.position) {
              return true;
            }
            return false;
          });
          for (const newEl of newImages) {
            db.run(
              "insert into item_images (item_id, position, data) values (?, ?, ?)",
              [item.id, newEl.position, newEl.data]
            );
          }
          for (const deleted of deletedImages) {
            db.run("delete from item_images where data = ? and item_id = ?", [
              deleted.data,
              item.id,
            ]);
          }
          for (const updated of updatedImages) {
            db.run(
              "update item_images set position = ? where data = ? and item_id = ?",
              [updated.position, updated.data, item.id]
            );
          }
        });
        getAllAsync("select name, value from attr_of_item where item_id = ?", [
          item.id,
        ]).then((attributes) => {
          const newElements = item.attributes.filter(
            (att) =>
              !attributes.some((attribute) => attribute.name === att.name)
          );
          const deletedElements = attributes.filter(
            (att) =>
              !item.attributes.some((attribute) => attribute.name === att.name)
          );
          const updatedElemets = item.attributes.filter((att) =>
            attributes.some(
              (attr) => attr.name === att.name && attr.value !== att.value
            )
          );
          for (const newEl of newElements) {
            db.run(
              "insert into attr_of_item (item_id, name, value) values (?, ?, ?)",
              [item.id, newEl.name, newEl.value]
            );
          }
          for (const deleted of deletedElements) {
            db.run("delete from attr_of_item where item_id = ? and name = ?", [
              item.id,
              deleted.name,
            ]);
          }
          for (const newEl of updatedElemets) {
            db.run(
              "update attr_of_item set value = ? where item_id = ? and name = ?",
              [newEl.value, item.id, newEl.name]
            );
          }
        });
      } else {
        insertRow(
          "insert into items (name, price, position, article, manufacturer, description, amount, in_stock, has_promo, lookup) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            item.name,
            item.price,
            item.position,
            item.article,
            item.manufacturer,
            item.description,
            item.amount,
            item.inStock,
            item.hasPromo,
            `${item.name} ${item.article}`.toLowerCase(),
          ]
        ).then((id) => {
          for (const image of item.images) {
            db.run(
              "insert into item_images(item_id, position, data) values (?, ?, ?)",
              [id, image.position, image.data]
            );
          }

          for (const attr of item.attributes) {
            db.run(
              "insert into attr_of_item(item_id, name, value) values (?, ?, ?)",
              [id, attr.name, attr.value]
            );
          }

          for (const categoryId of item.categories) {
            db.run("insert into cat_to_items(cat_id, item_id) values (?, ?)", [
              categoryId,
              id,
            ]);
          }

          for (const recomended of item.recomended) {
            db.run(
              "insert into recomended_items(parent_id, child_id) values (?, ?)",
              [id, recomended]
            );
          }
        });
      }

      res.send(wrapResponse("Success"));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });

  //    PROMOS API                                                                            PROMOS API

  app.get("/api/promos/images/:id", (req, res) => {
    const imageId = req.params.id;
    getAsync(
      "select ROWID as id, position, data from promo_images where ROWID = ?",
      [imageId]
    ).then((image) => res.send(wrapResponse(image)));
  });

  app.get("/api/promos/", (req, res) => {
    getAllAsync("select * from promos")
      .then((rows) =>
        Promise.all([
          ...rows.map((row) =>
            loadPromoImages(row).then((arr) => (row.images = arr))
          ),
        ]).then(() => res.send(wrapResponse(rows)))
      )
      .catch((err) => {
        console.error("Error while fetching promos: " + JSON.stringify(err));
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      });
  });

  app.get("/api/promos/:id", (req, res) => {
    getAsync("select * from promos where id = ?", [req.params.id])
      .then((row) => {
        if (!row) {
          res.send(wrapResponse(undefined));
          return;
        }
        return loadPromoImages(row)
          .then((arr) => (row.images = arr))
          .then(() => res.send(wrapResponse(row)));
      })
      .catch((err) => {
        console.error(err);
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      });
  });

  app.delete("/api/promos/:id", (req, res) => {
    try {
      const id = req.params.id;
      db.run("delete from promos where id = ?", id);
      db.run("delete from promo_images where promo_id = ?", id);
      res.send(wrapResponse("Success"));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });

  app.put("/api/promos/", (req, res) => {
    try {
      const promo = req.body;
      if (promo.id) {
        db.run(
          "update promos set name=?, position=?, description=? where id=?",
          promo.name,
          promo.position,
          promo.description,
          promo.id
        );

        getAllAsync(
          "select position, data from promo_images where promo_id = ?",
          [promo.id]
        ).then((images) => {
          const newImages = promo.images.filter(
            (image) => !images.some((i) => i.data === image.data)
          );
          const deletedImages = images.filter(
            (image) => !promo.images.some((i) => i.data === image.data)
          );
          const updatedImages = images.filter((image) => {
            const updated = promo.images.find((i) => i.data === image.data);
            if (updated && updated.position !== image.position) {
              return true;
            }
            return false;
          });
          for (const newEl of newImages) {
            db.run(
              "insert into promo_images (promo_id, position, data) values (?, ?, ?)",
              [promo.id, newEl.position, newEl.data]
            );
          }
          for (const deleted of deletedImages) {
            db.run("delete from promo_images where promo_id = ? and data = ?", [
              promo.id,
              deleted.data,
            ]);
          }
          for (const updated of updatedImages) {
            db.run(
              "update promo_images set position = ? where data = ? and promo_id = ?",
              [updated.position, updated.data, promo.id]
            );
          }
        });
      } else {
        insertRow(
          "insert into promos (name, position, description) values (?, ?, ?)",
          [promo.name, promo.position, promo.description]
        )
          .then((id) => {
            for (const image of promo.images) {
              db.run(
                "insert into promo_images(promo_id, position, data) values(?, ?, ?)",
                [id, image.position, image.data],
                (err) => {
                  if (err)
                    console.error(
                      "error on insert image: " + JSON.stringify(err)
                    );
                }
              );
            }
          })
          .catch((error) => console.error("error on put promo"));
      }

      res.send(wrapResponse("Success"));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });

  //    PARTNERS API                                                                            PARTNERS API

  app.get("/api/partners/images/:id", (req, res) => {
    const imageId = req.params.id;
    getAsync(
      "select ROWID as id, position, data from partner_images where ROWID = ?",
      [imageId]
    ).then((image) => res.send(wrapResponse(image)));
  });

  app.get("/api/partners/", (req, res) => {
    getAllAsync("select * from partners")
      .then((rows) =>
        Promise.all([
          ...rows.map((row) =>
            loadPartnerImages(row).then((arr) => (row.images = arr))
          ),
        ]).then(() => res.send(wrapResponse(rows)))
      )
      .catch((err) => {
        console.error(err);
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      });
  });

  app.get("/api/partners/:id", (req, res) => {
    getAsync("select * from partners where id = ?", [req.params.id])
      .then((row) => {
        if (!row) {
          res.send(wrapResponse(undefined));
          return;
        }
        return loadPartnerImages(row)
          .then((arr) => (row.images = arr))
          .then(() => res.send(wrapResponse(row)));
      })
      .catch((err) => {
        console.error(err);
        res.statusCode = 500;
        res.send(wrapResponse(undefined, err));
      });
  });

  app.delete("/api/partners/:id", (req, res) => {
    try {
      const id = req.params.id;
      db.run("delete from partners where id = ?", id);
      db.run("delete from partner_images where partner_id = ?", id);
      res.send(wrapResponse("Success"));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });

  app.put("/api/partners/", (req, res) => {
    try {
      const partner = req.body;
      if (partner.id) {
        db.run(
          "update partners set name=?, position=?, country=?, description=? where id=?",
          partner.name,
          partner.position,
          partner.country,
          partner.description,
          partner.id
        );

        getAllAsync(
          "select position, data from partner_images where partner_id = ?",
          [partner.id]
        ).then((images) => {
          const newImages = partner.images.filter(
            (image) => !images.some((i) => i.data === image.data)
          );
          const deletedImages = images.filter(
            (image) => !partner.images.some((i) => i.data === image.data)
          );
          const updatedImages = images.filter((image) => {
            const updated = partner.images.find((i) => i.data === image.data);
            if (updated && updated.position !== image.position) {
              return true;
            }
            return false;
          });

          for (const newEl of newImages) {
            db.run(
              "insert into partner_images (partner_id, position, data) values (?, ?, ?)",
              [partner.id, newEl.position, newEl.data]
            );
          }
          for (const deleted of deletedImages) {
            db.run(
              "delete from partner_images where data = ? and partner_id = ?",
              [deleted.data, partner.id]
            );
          }
          for (const updated of updatedImages) {
            db.run(
              "update partner_images set position = ? where data = ? and partner_id = ?",
              [updated.position, updated.data, partner.id]
            );
          }
        });
      } else {
        insertRow(
          "insert into partners (name, position, country, description) values (?, ?, ?, ?)",
          [partner.name, partner.position, partner.country, partner.description]
        ).then((id) => {
          for (const image of partner.images) {
            db.run(
              "insert into partner_images(partner_id, position, data) values (?, ?, ?)",
              [id, image.position, image.data]
            );
          }
        });
      }

      res.send(wrapResponse("Success"));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });
}

module.exports = enrichServerWithApiRoutes;
