
let latitude=coordinates[1];
let longitude=coordinates[0]
const map = L.map('map').setView([latitude, longitude], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:"WanderLust"
        }).addTo(map);
    
    let marker=L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup("<b>Exact location will be provided after booking</b>").openPopup();
    

    
