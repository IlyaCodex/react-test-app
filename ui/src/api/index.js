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
  login: (auth) => {
    return fetch(`/api/admin/login/`, {
      headers: getHeaders(auth),
    }).then((response) => response.json());
  },
};
