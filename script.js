let map, marker, geocoder;

function switchMode(mode) {
	document.getElementById("gpsContainer").style.display = (mode === 'gps') ? 'block' : 'none';
	document.getElementById("ipInputContainer").style.display = (mode === 'ip') ? 'block' : 'none';
}

function initMap() {
	const container = document.getElementById('map');
	const options = {
		center: new kakao.maps.LatLng(37.5665, 126.9780),
		level: 3
	};
	map = new kakao.maps.Map(container, options);
	marker = new kakao.maps.Marker({ map: map });
	geocoder = new kakao.maps.services.Geocoder();
}

function showMyLocation() {
	const loading = document.getElementById("loading");
	const info = document.getElementById("locationInfo");
	const time = document.getElementById("update");

	if (!navigator.geolocation) {
		alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
		return;
	}

	loading.style.display = "block";

	navigator.geolocation.getCurrentPosition(
		(position) => {
			loading.style.display = "none";

			const lat = position.coords.latitude;
			const lon = position.coords.longitude;
			const loc = new kakao.maps.LatLng(lat, lon);

			map.setCenter(loc);
			marker.setPosition(loc);

			time.textContent = `업데이트 시간: ${new Date().toLocaleString()}`;

			geocoder.coord2Address(lon, lat, function(result, status) {
				if (status === kakao.maps.services.Status.OK && result.length > 0) {
					const address = result[0].address.address_name;
					info.textContent = `현재 위치: ${address}`;
				} else {
					info.textContent = `현재 위치: 주소를 가져올 수 없습니다.`;
				}
			});
		},
		(err) => {
			loading.style.display = "none";
			switch (err.code) {
				case 1: alert("위치 권한이 거부되었습니다."); break;
				case 2: alert("위치를 사용할 수 없습니다."); break;
				case 3: alert("위치 요청 시간이 초과되었습니다."); break;
				default: alert("알 수 없는 오류 발생."); break;
			}
		}
	);
}

function showIPLocation() {
	const ipInput = document.getElementById("ipInput").value.trim();
	const ipLocationInfo = document.getElementById("ipLocationInfo");

	if (!ipInput) {
		alert("ip 주소를 입력하세요.");
		return;
	}

	ipLocationInfo.textContent = "위치 정보를 불러오는 중입니다...";

	const apiKey = "2156b26eb0f6fd1522d9ae84ad1fd3cf5b958ad698a4baba6bfe5e59";

	fetch(`https://api.ipdata.co/${ipInput}?api-key=${apiKey}`)
		.then(response => {
			if (!response.ok) {
				throw new Error("네트워크 응답에 문제가 있습니다.");
			}
			return response.json();
		})
		.then(data => {
			if (data.latitude && data.longitude) {
				const loc = new kakao.maps.LatLng(data.latitude, data.longitude);

				map.setCenter(loc);
				marker.setPosition(loc);

				const address = `${data.city}, ${data.region}, ${data.country_name}`;
				ipLocationInfo.textContent = `IP 위치: ${address}`;
			} else {
				ipLocationInfo.textContent = "IP 위치 정보를 가져올 수 없습니다.";
			}
		})
		.catch(err => {
			ipLocationInfo.textContent = "IP 위치 정보를 불러오는데 실패했습니다.";
			console.log(err);
		});
}

initMap();
