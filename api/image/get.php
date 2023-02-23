<?php
require_once(__DIR__ . '/../config.php');

header('Content-Type: application/json');
// for moment just return the image without call api
$keywords = [
    'city',
    'landscape',
    'nature',
    'travel',
    'architecture'
];

// get image from unsplash
$url = 'https://api.unsplash.com/photos/random';
$data = array(
    'client_id' => UNSPLASH_CLIENT_ID,
    'query' => $keywords[random_int(0, count($keywords) - 1)]
);
$url = sprintf("%s?%s", $url, http_build_query($data));
$curl = curl_init($url);
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$headers = array(
    "Authorization: Client-ID " . UNSPLASH_CLIENT_ID,
);
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

$dataImage = json_decode(curl_exec($curl), true);
curl_close($curl);

if ($dataImage !== null && ($dataImage['location']['name'] === null || $dataImage['location']['position']['latitude'] === null || $dataImage['location']['position']['longitude'] === null)) {
    $dataImage = null;
}

if ($dataImage === null) {
    // get image already saved
    $files = scandir(__DIR__ . '/../../data_from_api/');
    $file = __DIR__ . '/../../data_from_api/' . $files[random_int(2, count($files) - 1)];
    $dataImage = json_decode(file_get_contents($file), true);
}



// add data in json file
$data = [
    'id' => $dataImage['id'],
    'urls' => $dataImage['urls'],
    'location' => $dataImage['location'],
    'user' => $dataImage['user'],
    'links' => $dataImage['links'],
];

$file = __DIR__ . '/../../data_from_api/' . $dataImage['id'] . '.json';
file_put_contents($file, json_encode($data));

// remove location from data returned
unset($data['location']);
echo json_encode($data);
