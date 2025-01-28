const elementListCctv  = document.getElementById('list-cctv');
const elementContainer = document.getElementById('container');
const elementInputLocation = document.getElementById('search-location');
const elementCountLocation = document.getElementById('count-location');
const modalInfo = document.getElementById('modal-info');
const buttonInfo = document.getElementById('button-info');
const buttonCloseModal = document.getElementById('button-close-modal');
const body = document.getElementsByTagName('body')[0];
const basePath = (window.location.hostname === 'yudapratama25.github.io') ? 'https://yudapratama25.github.io/cctv-viewer/' : '/';
let videoURL = '';

let widthDevice = screen.width;

let apis = [];

let listCctv = [];

let selectedLocations = [];

let isIOS = false;

var isForbidden = false;

const checkIOS = () => {
    if (typeof window === `undefined` || typeof navigator === `undefined`) return false;

    return /iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || (window.opera && opera.toString() === `[object Opera]`));
};

const buildShortName = (locationName) => {
    let newLocationName = locationName.toLowerCase();

    if (newLocationName.includes("cctv")) {
        newLocationName = newLocationName.replace('cctv', '');
    }

    if (newLocationName.includes("simpang")) {
        newLocationName = newLocationName.replace('simpang', 'simp.');
    }

    return newLocationName.trim().toUpperCase();
}

const buildVideoURL = async (metadata) => {
    const reqSession = await fetch(`./cctvSamarindaSession.txt`);

    const session = await reqSession.text();

    const { url, ...params } = metadata;

    videoURL += `${url}?session=${session}&`;

    for (const [key, value] of Object.entries(params)) {
        videoURL += `${key}=${value}&`;
    }
}

const buildListCctv = () => {
    let html = ``;

    elementCountLocation.innerText = listCctv.length;

    listCctv.map((data, index) => {
        html += `<li class="px-2 py-1 text-sm rounded-lg shadow inline-flex items-center justify-items-center">`
                    +`<input type="checkbox" id="location-${data.cameraId}" class="me-1" onchange="selectCctv(${index},'${data.cameraId}')"${selectedLocations.includes(data.cameraId.toString()) ? ' checked' : ''}/>`
                    +`<label for="location-${data.cameraId}" class="text-white overflow-hidden text-nowrap text-ellipsis" title="${data.location}">${buildShortName(data.location)}</label>`
                +`</li>`;
    });

    if (widthDevice > 640) {
        if (listCctv.length < 15) {
            elementListCctv.style.gridTemplateRows = 'repeat(3, auto)'
        } else if (listCctv.length < 25) {
            elementListCctv.style.gridTemplateRows = 'repeat(5, auto)'
        } else {
            elementListCctv.style.gridTemplateRows = 'repeat(10, auto)'
        }
    } else {
        elementListCctv.style.gridTemplateRows = 'repeat(5, auto)'
    }

    elementListCctv.innerHTML = html;
}

const adjustVideoPlayerSize = () => {
    let numberOfSelectedLocation = selectedLocations.length

    const videoPlayers = document.getElementsByClassName('video-player')

    if (widthDevice > 768) {
        if (numberOfSelectedLocation == 1) {
            elementContainer.classList.add('h-screen')
        } else {
            elementContainer.classList.remove('h-screen')
        }
    }

    for (let index = 0; index < videoPlayers.length; index++) {
        if (numberOfSelectedLocation == 1) {
            videoPlayers[index].classList.add('h-full')
            videoPlayers[index].classList.add('w-full')
        } else {
            videoPlayers[index].classList.remove('h-full')
            videoPlayers[index].classList.remove('w-full')
        }
    }
}

const selectCctv = (indexData, cctvId) => {
    const isSelected = unselectCctv(cctvId);

    if (isSelected) {
        return false;
    }

    if (selectedLocations.length == 6) {
        document.getElementById(`location-${cctvId}`).checked = false
        alert('Maksimal hanya dapat menampilkan 6 lokasi.')
        return false;
    }

    const dataCctv = listCctv[indexData];

    const padding = (widthDevice < 640) ? '' : ' p-3';

    const infoCctv = (widthDevice < 640) ? 'bottom-0 left-0' : 'bottom-3 left-3'

    const refreshButton = (widthDevice < 640) ? 'bottom-0 right-0' : 'bottom-3 right-3';

    const deleteButton = (widthDevice < 640) ? 'bottom-12 right-0' : 'bottom-12 right-3';

    const fullHeight = (!isIOS) ? ' h-full' : '';

    const sourceVideo = `${videoURL}cameraId=${cctvId}`;

    let html = `<div id="container-video-player-${cctvId}" class="video-player relative${padding}">
                    <video
                        id="video-player-${cctvId}" 
                        class="block rounded-lg${fullHeight}" 
                        name="media" 
                        autoplay="" 
                        muted="" 
                        playsinline="" 
                        poster="${basePath}assets/images/loading.jpg"
                        src="${sourceVideo}"
                        type="video/fmp4">
                    </video>
                    <span class="absolute ${infoCctv} px-1 bg-slate-800 text-white text-sm rounded-tr rounded-bl-lg">${buildShortName(dataCctv.location)}</span>
                    <div class="absolute ${refreshButton} px-1 bg-slate-800/30 text-white text-sm rounded-tl rounded-br-lg rounded-tr-none backdrop-opacity-10 hover:cursor-pointer hover:bg-slate-400/30" onclick="refreshVideo('${cctvId}')">
                        <img src="${basePath}assets/images/ic-refresh.png" class="w-7"/>
                    </div>
                    <div class="absolute ${deleteButton} px-2 py-1 bg-slate-800/30 text-white text-sm rounded-s backdrop-opacity-10 hover:cursor-pointer hover:bg-slate-400/30" onclick="unselectCctv('${cctvId}')">
                        <img src="${basePath}assets/images/ic-delete.png" class="w-5"/>
                    </div>
                </div>`;

    elementContainer.insertAdjacentHTML('afterbegin', html);

    selectedLocations.push(cctvId);

    setTimeout(() => {
        adjustVideoPlayerSize()
    }, 600);
}

const unselectCctv = (cctvId) => {
    if (selectedLocations.includes(cctvId)) { // unselect location
        selectedLocations = selectedLocations.filter((id) => id !== cctvId);

        let videoElement = document.getElementById(`video-player-${cctvId}`);
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
        videoElement.remove();

        document.getElementById(`container-video-player-${cctvId}`).remove();

        document.getElementById(`location-${cctvId}`).checked = false;

        setTimeout(() => {
            adjustVideoPlayerSize()
        }, 600);

        return true;
    }

    return false;
}

const fetchDataApi = async () => {
    const response = await fetch('./cctvSamarinda.json');

    if (!response.ok) {
        alert('Terjadi kesalahan saat memuat data.');
        return false;
    }

    const data = await response.json();

    apis = data.locations.filter(item => item.cameraId !== null);
    listCctv = apis;

    return data;
}

const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    }
}

const searchLocation = (e) => {
    let keyword = e.target.value.toLowerCase().trim()
    
    if (keyword === '') {
        listCctv = apis
    } else {
        listCctv = apis.filter(data => data.location.toLowerCase().includes(keyword))
    }

    buildListCctv()
}

const refreshVideo = (id) => {
    let videoPlayer = document.getElementById(`video-player-${id}`)
    let src = videoPlayer.getAttribute('src')
    videoPlayer.setAttribute('src', '')
    
    setTimeout(() => {
        videoPlayer.setAttribute('src', src)
    }, 500);
}

const saveVisitor = async () => {
    const isLocal = false;
    if (window.location.hostname === 'yudapratama25.github.io' || isLocal) {
        const getIp = await fetch('https://api.ipify.org?format=json');

        if (getIp.ok) {
            const dataIp = await getIp.json();
            const api = (isLocal) ? 'http://localhost:3001/api/cctv-viewer/visitor' : 'https://aduy-be.vercel.app/api/cctv-viewer/visitor';
            const options = {
                method: 'POST',
                body: JSON.stringify({ip: dataIp.ip}),
                headers: {
                    "Content-Type": "application/json"
                }
            };

            fetch(api, options)
            .then(response => response.json())
        }
    }
}

(async function() {
    isIOS = checkIOS()

    fetchDataApi().then(response => {
        if (response !== false) {
            buildVideoURL(response.metadata).then(() => {
                buildListCctv();
            });
        }
    });

    elementInputLocation.addEventListener('keyup', debounce(searchLocation, 300));

    buttonInfo.onclick = function () {
        modalInfo.style.display = 'block'
        body.style.overflow = 'hidden'
    }

    buttonCloseModal.onclick = function () {
        modalInfo.style.display = 'none'
        body.style.overflow = 'auto'
    }

    window.onclick = function (event) {
        if (event.target == modalInfo) {
            modalInfo.style.display = 'none'
            body.style.overflow = 'auto'
        }
    }
    
    setTimeout(() => {
        saveVisitor();
    }, 2300);
})();