// กำหนด type ให้ google maps เพื่อให้ TS ไม่ฟ้อง
declare global {
    interface Window {
      google?: any;
    }
  }
  
  export function loadGoogleMaps(apiKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // ถ้าโหลดแล้ว ไม่ต้องโหลดซ้ำ
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
        return;
      }
  
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
  
      script.onload = () => {
        if (window.google && window.google.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error("Google Maps failed to load"));
        }
      };
  
      script.onerror = () =>
        reject(new Error("Failed to load Google Maps script"));
  
      document.head.appendChild(script);
    });
  }
  