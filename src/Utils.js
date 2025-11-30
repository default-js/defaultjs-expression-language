export const stringToHashcode = (aString) => {
    let hash = 0;
    if (aString.length == 0) return hash;
    const length = aString.length;
    for (let i = 0; i < length; i++) {
      const char = aString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };