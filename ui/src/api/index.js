function getHeaders(auth) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (auth) {
    headers.authorization = `Basic ${auth}`;
  }
  return headers;
}

const imageCache = {};

export const api = {
  getAdmins: (auth) => {
    return fetch("/api/admins/", {
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },
  saveAdmin: (auth, admin) => {
    return fetch(`/api/admins/`, {
      method: "put",
      headers: getHeaders(auth),
      body: JSON.stringify(admin),
    });
  },
  deleteAdmin: (auth, login) => {
    return fetch(`/api/admins/${login}`, {
      method: "delete",
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },
  getCategoryById: (id) => {
    return fetch(`/api/categories/${id}`).then((response) => response.json());
  },
  getCategoriesByLevel: (level, full) => {
    return fetch(`/api/categories/?level=${level}&full=${!!full}`).then(
      (response) => response.json()
    );
  },
  saveCategory: (auth, category) => {
    return fetch(`/api/categories/`, {
      method: "put",
      headers: getHeaders(auth),
      body: JSON.stringify(category),
    });
  },
  deleteCategory: (auth, id) => {
    return fetch(`/api/categories/${id}`, {
      method: "delete",
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },
  searchItems: (query) => {
    const queryString = new URLSearchParams({ query }).toString();
    return fetch(`/api/items/search?${queryString}`).then((response) =>
      response.json()
    );
  },
  getItemById: (id) => {
    return fetch(`/api/items/${id}`).then((response) => response.json());
  },
  getItems: () => {
    return fetch(`/api/items/`).then((response) => response.json());
  },
  getRecomendedItems: (id) => {
    return fetch(`/api/items/${id}/recomended`).then((response) =>
      response.json()
    );
  },
  getItemImage: (id) => {
    const cacheHit = imageCache[id];
    if (cacheHit) {
      return Promise.resolve(cacheHit);
    }
    return fetch(`/api/items/images/${id}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.data) {
          imageCache[id] = json;
        }
        return json;
      });
  },
  saveItem: (auth, item) => {
    return fetch(`/api/items/`, {
      method: "put",
      headers: getHeaders(auth),
      body: JSON.stringify(item),
    });
  },
  deleteItem: (auth, id) => {
    return fetch(`/api/items/${id}`, {
      method: "delete",
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },

  getPartnerById: (id) => {
    return fetch(`/api/partners/${id}`).then((response) => response.json());
  },
  getPartners: () => {
    return fetch(`/api/partners/`).then((response) => response.json());
  },
  getPartnerImage: (id) => {
    return fetch(`/api/partners/images/${id}`).then((response) =>
      response.json()
    );
  },
  savePartner: (auth, item) => {
    return fetch(`/api/partners/`, {
      method: "put",
      headers: getHeaders(auth),
      body: JSON.stringify(item),
    });
  },
  deletePartner: (auth, id) => {
    return fetch(`/api/partners/${id}`, {
      method: "delete",
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },

  getPromoById: (id) => {
    return fetch(`/api/promos/${id}`).then((response) => response.json());
  },
  getPromos: () => {
    return fetch(`/api/promos/`).then((response) => response.json());
  },
  getPromoImage: (id) => {
    return fetch(`/api/promos/images/${id}`).then((response) =>
      response.json()
    );
  },
  savePromo: (auth, item) => {
    return fetch(`/api/promos/`, {
      method: "put",
      headers: getHeaders(auth),
      body: JSON.stringify(item),
    });
  },
  deletePromo: (auth, id) => {
    return fetch(`/api/promos/${id}`, {
      method: "delete",
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },

  login: (auth) => {
    console.log(auth);
    return fetch(`/api/admin/login/`, {
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },

  checkout: (checkoutData, cartItems) => {
    return fetch("/api/checkout/", {
      headers: getHeaders(),
      method: "post",
      body: JSON.stringify({ checkoutData, cartItems }),
    }).then((response) => response.json());
  },
};
