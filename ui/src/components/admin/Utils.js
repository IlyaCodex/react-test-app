export const convertFiles = async (files) => {
  const result = [];
  for (const file of files) {
    result.push(
      await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = () => reject("Error while converting file");

        reader.readAsDataURL(file);
      })
    );
  }
  return result;
};


export const isNull = (obj) => {
  return obj === null || obj === undefined;
}

export const nonNull = obj => !isNull(obj);

export const chooseImage = (item) => item.images?.[0];

export const byPosition = (item1, item2) => item1.position - item2.position;