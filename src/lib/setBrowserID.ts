export const getBrowserID = () => {
  const newID = Date.now().toString();
  if (typeof window === "undefined") {
    return newID;
  }

  const id = window.localStorage.getItem("browserID");
  if (id === null) {
    window.localStorage.setItem("browserID", newID);
  }
  return id || newID;
};
