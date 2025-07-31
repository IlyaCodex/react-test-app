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
    "CREATE TABLE IF NOT EXISTS promos (id INTEGER PRIMARY KEY, name TEXT, description TEXT, position INTEGER)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS partners (id INTEGER PRIMARY KEY, name TEXT, position INTEGER, country TEXT, description TEXT, image TEXT)"
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
    "CREATE TABLE IF NOT EXISTS promo_images (promo_id INTEGER, position INTEGER, data TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS item_images (item_id INTEGER, position INTEGER, data TEXT)"
  );
});

function authorize(login, password) {
  return login === "admin" && password === "admin";
}

const checkAuth = (req, res, next) => {
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
  return getAllAsync("select item_id from cat_to_items where cat_id = ?", [
    category.id,
  ]).then((rows) => rows.map((row) => row.item_id));
}

async function loadImages(item) {
  return getAllAsync(
    "select position, data from item_images where item_id = ?",
    [item.id]
  );
}

async function loadAttributes(item) {
  return getAllAsync("select name from attr_of_item where item_id = ?", [
    item.id,
  ]).then((rows) => rows.map((row) => row.name));
}

async function loadItemCategories(item) {
  return getAllAsync("select cat_id from cat_to_item where item_id = ?", [
    item.id,
  ]).then((rows) => rows.map((row) => row.cat_id));
}

async function loadPromoImages(promo) {
  return getAllAsync(
    "select position, data from promo_images where promo_id = ?",
    [promo.id]
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
          "update categories set name=?, position=? where id=?",
          category.name,
          category.position,
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
          "insert into categories (name, position, level) values (?, ?, ?)",
          [category.name, category.position, category.level]
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

  app.get("/api/items/", (req, res) => {
    getAllAsync("select * from items")
      .then((rows) => {
        if (!rows) {
          res.send(wrapResponse(undefined));
          return;
        }
        Promise.all([
          ...rows.map((row) =>
            loadAttributes(row).then((arr) => (row.attributes = arr))
          ),
          ...rows.map((row) =>
            loadImages(row).then((arr) => (row.images = arr))
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
        Promise.all([
          loadAttributes(row).then((arr) => (row.attributes = arr)),
          loadImages(row).then((arr) => (row.images = arr)),
          loadItemCategories(row).then((arr) => (row.categories = arr)),
        ]).then(() => res.send(wrapResponse(row)));
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
            if (
              deletedImages.includes(image) ||
              newImages.some((i) => i.data === image.data)
            ) {
              return false;
            }
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
              "update cat_to_items set position = ? where data = ? and item_id = ?",
              [updated.position, updated.data, item.id]
            );
          }
        });
        getAllAsync("select name from attr_of_item where item_id = ?", [
          item.id,
        ]).then((attributes) => {
          attributes = attributes.map((row) => row.name);
          const newElements = item.attributes.filter(
            (att) => !attributes.includes(att)
          );
          const deletedElements = attributes.filter(
            (att) => !item.attributes.includes(att)
          );
          for (const newEl of newElements) {
            db.run("insert into attr_of_item (item_id, name) values (?, ?)", [
              item.id,
              newEl,
            ]);
          }
          for (const deleted of deletedElements) {
            db.run("delete from attr_of_item where item_id = ? and name = ?", [
              item.id,
              deleted,
            ]);
          }
        });
      } else {
        insertRow(
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
          ]
        ).then((id) => {
          for (const image of item.images) {
            db.run(
              "insert into item_images(item_id, position, data) values (?, ?, ?)",
              [id, image.position, image.data]
            );
          }

          for (const attr of item.attributes) {
            db.run("insert into attr_of_item(item_id, name) values (?, ?)", [
              id,
              attr,
            ]);
          }

          for (const categoryId of item.categories) {
            db.run("insert into cat_to_items(cat_id, item_id) values (?, ?)", [
              categoryId,
              id,
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

  //    PROMOS API                                                                            PROMOS API

  app.get("/api/promos/", (req, res) => {
    getAllAsync("select * from promos")
      .then((rows) => {
        Promise.all([
          ...rows.map((row) =>
            loadPromoImages(row).then((arr) => (row.images = arr))
          ),
        ]).then(() => res.send(wrapResponse(rows)));
      })
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
        loadPromoImages(row)
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
            console.log(id);
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

  //(id INTEGER PRIMARY KEY, name TEXT, position INTEGER, country TEXT, description TEXT, image TEXT)

  app.get("/api/partners/", (req, res) => {
    getAllAsync("select * from partners")
      .then((rows) => res.send(wrapResponse(rows)))
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
        res.send(wrapResponse(row));
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
          "update partners set name=?, position=?, country=?, description=?, image=? where id=?",
          partner.name,
          partner.position,
          partner.country,
          partner.description,
          partner.image,
          partner.id
        );
      } else {
        db.run(
          "insert into partners (name, position, country, description, image) values (?, ?, ?, ?, ?)",
          [
            partner.name,
            partner.position,
            partner.country,
            partner.description,
            partner.image,
          ],
          function (err) {
            if (err) {
              console.error(err);
              return;
            }
          }
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
