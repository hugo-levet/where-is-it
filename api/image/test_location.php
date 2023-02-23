<?php
header('Content-Type: application/json');

// check data received
if (empty($_GET['id']) || empty($_GET['location'])) {
    echo json_encode(['error' => 'missing data']);
    exit;
}

$id = $_GET['id'];
$location = $_GET['location'];
$name = $location;

// get lon and lat from location
$curl = curl_init();
$url = 'http://api.positionstack.com/v1/forward';
$data = array(
    'use_https' => 0,
    'access_key' => POSITION_STACK_ACCESS_KEY,
    'query' => $name
);
$url = sprintf("%s?%s", $url, http_build_query($data));
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

$locationData = json_decode(curl_exec($curl), true);

curl_close($curl);
if (count($locationData['data']) == 0) {
    echo json_encode(['error' => 'location not found']);
    exit;
}

$lat = $locationData['data'][0]['latitude'];
$lon = $locationData['data'][0]['longitude'];
$name = $locationData['data'][0]['name'];

// get data from id received
$file = __DIR__ . '/../../data_from_api/' . $id . '.json';
if (!file_exists($file)) {
    echo json_encode(['error' => 'id not found']);
    exit;
}

$data = json_decode(file_get_contents($file), true);

$imageLocations = $data['location'];

// get distance between image location and user location
function distance($lat1, $lon1, $lat2, $lon2)
{
    $theta = $lon1 - $lon2;
    $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
    $dist = acos($dist);
    $dist = rad2deg($dist);
    $miles = $dist * 60 * 1.1515;
    $feet = $miles * 5280;
    $yards = $feet / 3;
    $kilometers = $miles * 1.609344;
    $meters = $kilometers * 1000;
    return $meters;
}

$distance = distance($lat, $lon, $imageLocations['position']['latitude'], $imageLocations['position']['longitude']);

// get orientation between image location and user location
function orientation($lat1, $lon1, $lat2, $lon2)
{
    $lat1 = deg2rad($lat1);
    $lat2 = deg2rad($lat2);
    $lon1 = deg2rad($lon1);
    $lon2 = deg2rad($lon2);
    $dLon = $lon2 - $lon1;
    $y = sin($dLon) * cos($lat2);
    $x = cos($lat1) * sin($lat2) - sin($lat1) * cos($lat2) * cos($dLon);
    $brng = rad2deg(atan2($y, $x));
    $brng = (round($brng) + 360) % 360;
    $brng = 360 - $brng; // count degrees counter-clockwise - remove to make clockwise
    return $brng;
}

$orientation = orientation($lat, $lon, $imageLocations['position']['latitude'], $imageLocations['position']['longitude']);

$isWin = false;
if ($distance < 1500 || strtolower($name) == strtolower($imageLocations['name']) || strtolower($name) == strtolower($imageLocations['city'])) {
    $isWin = true;
}

$result = [
    'id' => $id,
    'name' => $name,
    'distance' => $distance,
    'orientation' => $orientation,
    'isWin' => $isWin,
];

echo json_encode($result);
