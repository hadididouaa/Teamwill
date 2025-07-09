export const setLocalStorage = (name, items) => {
   localStorage.setItem(name, JSON.stringify(items));
};

export const getLocalStorage = (name) => {
   if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(name);
      if (data) {
         return JSON.parse(data);
      }
   }
   return [];
};
