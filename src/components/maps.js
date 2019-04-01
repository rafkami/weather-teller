const google = window.google;

let googleMapsPromise;

const getGoogleMaps = () => {
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise(resolve => {
      window.resolveGoogleMapsPromise = () => {
        resolve(google);
        delete window.resolveGoogleMapsPromise;
      };
      const script = document.createElement("script");
      script.src = `//maps.googleapis.com/maps/api/js?key=${
        process.env.REACT_APP_googleAPIKey
      }&callback=resolveGoogleMapsPromise`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    });
  }
  return googleMapsPromise;
};

export { getGoogleMaps };
