function getHeaders(auth) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (auth) {
    headers.authorization = `Basic ${auth}`;
  }
  return headers;
}

export const api = {
  getCategoryById: (id) => {
    return fetch(`/api/category/${id}`).then((response) => response.json());
  },
  getCategoriesByLevel: (level, full) => {
    return fetch(`/api/category/?level=${level}&full=${!!full}`).then(
      (response) => response.json()
    );
  },
  saveCategory: (auth, category) => {
    return fetch(`/api/category/`, {
      method: "put",
      headers: getHeaders(auth),
      body: JSON.stringify(category),
    });
  },
  deleteCategory: (auth, id) => {
    return fetch(`/api/category/${id}`, {
      method: "delete",
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },
  login: (auth) => {
    return fetch(`/api/admin/login/`, {
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },
};
