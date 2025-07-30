const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(process.env.DB_FILE || "./maindb.sqlite");
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT, position INTEGER, level INTEGER)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT, position INTEGER, article TEXT, manufacturer TEXT, description TEXT, amount TEXT, in_stock BOOLEAN, has_promo BOOLEAN)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS promos (id INTEGER PRIMARY KEY, name TEXT, position INTEGER)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS partners (id INTEGER PRIMARY KEY, name TEXT, position INTEGER, country TEXT, description TEXT, image BLOB)"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS cat_to_cat (parent_id INTEGER, child_id INTEGER)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS cat_to_items (cat_id INTEGER, item_id INTEGER)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS attr_of_item (item_id INTEGER, name TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS promo_images (promo_id INTEGER, data BLOB)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS item_images (item_id INTEGER, position INTEGER, data BLOB)"
  );
});

function authorize(login, password) {
  return login === "admin" && password === "admin";
}

const checkAuth = (req, res, next) => {
  try {
    let auth = req.headers.authorization;
    console.log(auth);
    if (!auth || !auth.startsWith("Basic")) {
      res.statusCode = 401;
      res.send(wrapResponse(undefined, "Not authorized"));
      return;
    }
    auth = auth.substring("basic ".length);
    let [login, password] = Buffer.from(auth, "base64")
      .toString("utf-8")
      .split(":");

    if (authorize(login, password)) {
      next();
    } else {
      res.statusCode = 403;
      res.send(wrapResponse(undefined, "Not authorized"));
    }
  } catch (reason) {
    console.error(reason);
    res.statusCode = 500;
    res.send(wrapResponse(undefined, reason));
    return;
  }
};

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

//                                                                                                          TODO: remove children/parents

async function getAllAsync(sql, params) {
  return new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    })
  );
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
  return getAllAsync(
    "select item_id from cat_to_items where cat_id = ?",
    category.id
  );
}

function wrapResponse(data, error) {
  return JSON.stringify({ data, error });
}

function enrichServerWithApiRoutes(app) {
  app.get("/api/{*path}", (req, res, next) => {
    next();
  });
  app.put("/api/{*path}", checkAuth);
  app.delete("/api/{*path}", checkAuth);

  app.get("/api/admin/login/", (req, res) => {
    checkAuth(req, res, () => res.send(wrapResponse("Success")));
  });

  app.get("/api/category/", (req, res) => {
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

  app.get("/api/category/:id", (req, res) => {
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

  app.delete("/api/category/:id", (req, res) => {
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

  app.put("/api/category/", (req, res) => {
    try {
      const category = req.body;
      if (category.id) {
        db.run(
          "update categories set name=?, position=? where id=?",
          category.name,
          category.position,
          category.id
        );
      } else {
        db.run(
          "insert into categories (name, position, level) values (?, ?, ?)",
          [category.name, category.position, category.level],
          function (err) {
            if (err) {
              console.error(err);
              return;
            }
            category.id = this.lastID;
          }
        );
      }

      if (category.level > 1) {
        for (const parentId of category.parents) {
          db.run(
            "insert or ignore into cat_to_cat(parent_id, child_id) select ?, ? where not exists (select 1 from cat_to_cat where parent_id = ? and child_id = ?)",
            [parentId, category.id, parentId, category.id]
          );
        }
      }

      if (category.level < 3) {
        for (const childId of category.children) {
          db.run(
            "insert or ignore into cat_to_cat(parent_id, child_id) select ?, ? where not exists (select 1 from cat_to_cat where parent_id = ? and child_id = ?)",
            [category.id, childId, category.id, childId]
          );
        }
      }

      for (const itemId of category.items) {
        db.run(
          "insert or ignore into cat_to_items(cat_id, item_id) select ?, ? where not exists (select 1 from cat_to_items where cat_id = ? and item_id = ?)",
          [category.id, itemId, category.id, itemId]
        );
      }

      res.send(wrapResponse("Success"));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.send(wrapResponse(undefined, error));
    }
  });
  app.delete("/api/item/:id", (req, res) => {
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

  app.put("/api/item/", (req, res) => {
    try {
      const item = req.body;
      if (item.id) {
        db.run(
          "update item set name=?, position=?, article=?, manufacturer=?, description=?, amount=?, in_stock=?, has_promo=? where id=?",
          item.name,
          item.position,
          item.article,
          item.manufacturer,
          item.description,
          item.amount,
          item.in_stock,
          item.has_promo
        );
      } else {
        db.run(
          "insert into item (name, position, article, manufacturer, description, amount, in_stock, has_promo) values (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            item.name,
            item.position,
            item.article,
            item.manufacturer,
            item.description,
            item.amount,
            item.in_stock,
            item.has_promo,
          ],
          function (err) {
            if (err) {
              console.error(err);
              return;
            }
            item.id = this.lastID;
          }
        );
      }

      for (const image of item.images) {
        db.run(
          "insert or ignore into item_images(item_id, position, data) select ?, ?, ? where not exists (select 1 from item_images where item_id = ? and data = ?)",
          [item.id, image.position, image.data, item.id, image.data]
        );
      }

      for (const attr of item.attributes) {
        db.run(
          "insert or ignore into attr_of_item(item_id, name) select ?, ? where not exists (select 1 from attr_of_item where item_id = ? and name = ?)",
          [item.id, attr]
        );
      }

      for (const categoryId of item.categories) {
        db.run(
          "insert or ignore into cat_to_items(cat_id, item_id) select ?, ? where not exists (select 1 from cat_to_items where cat_id = ? and item_id = ?)",
          [categoryId, item.id, categoryId, item.id]
        );
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
