const google = window.google;

const googleAPIKey = "AIzaSyBl3efYiJYIr2sYmV99VSlGfQNLr8EK5FM";

let googleMapsPromise;

const getGoogleMaps = () => {
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise(resolve => {
      window.resolveGoogleMapsPromise = () => {
        resolve(google);
        delete window.resolveGoogleMapsPromise;
      };
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleAPIKey}&callback=resolveGoogleMapsPromise`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    });
  }
  return googleMapsPromise;
};

export { getGoogleMaps };
