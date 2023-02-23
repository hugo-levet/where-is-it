function getCompas(orientation) {
    const svg = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '   <g id="compas">' +
        '       <circle id="circle" cx="20" cy="20" r="19" stroke="black" stroke-width="2"/>' +
        '       <g id="needle" transform="rotate(' + (orientation) + ' 20 20)">' +
        '           <path id="red" d="M20.5083 17.6584L29.9536 20.0332L20.502 22.4089L20.5083 17.6584Z" fill="#FF0000" stroke="#FF0000" stroke-linejoin="round"/>' +
        '           <path id="black" d="M19.5008 22.4416L10.0555 20.0667L19.5071 17.6911L19.5008 22.4416Z" stroke="black" stroke-linejoin="round"/>' +
        '       </g>' +
        '       <path id="W" d="M1 19H4C4.55228 19 5 19.4477 5 20V20C5 20.5523 4.55228 21 4 21H1V19Z" fill="black"/>' +
        '       <path id="N" d="M21 1V4C21 4.55228 20.5523 5 20 5V5C19.4477 5 19 4.55228 19 4V1L21 1Z" fill="black"/>' +
        '       <path id="E" d="M39 21H36C35.4477 21 35 20.5523 35 20V20C35 19.4477 35.4477 19 36 19H39V21Z" fill="black"/>' +
        '       <path id="S" d="M19 39V36C19 35.4477 19.4477 35 20 35V35C20.5523 35 21 35.4477 21 36V39H19Z" fill="black"/>' +
        '   </g>' +
        '</svg>';

    return svg;
}

function getCardinal(orientation) {
    const directions = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
    const index = Math.round(orientation / (360 / directions.length));
    return directions[index];
}

let lastApiCall = 0;

function userWin(tryId, locationName) {
    // display win message
    const result = document.createElement("div");
    result.classList.add("result");
    result.classList.add("win");
    result.innerHTML = '<span class="trophy">🏆</span><p class="info">You win ! You found the location of this picture: <span class="name">' + locationName + '</span></p>';
    document.getElementById("results-container").prepend(result);
    result.scrollIntoView();

    // add score to local storage
    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push({
        id: tryId,
        name: locationName,
        date: new Date(),
        numberTry: document.querySelectorAll(".result").length
    });
    localStorage.setItem("scores", JSON.stringify(scores));

    // display all scores in a modal
    const average = scores.reduce((acc, score) => acc + score.numberTry, 0) / scores.length;
    const numberGame = scores.length;
    const modal = document.getElementById("modal");
    const modalContent = modal.getElementsByClassName("content")[0];
    modalContent.innerHTML = `<h2>Statistics</h2>
    <div class="stats">
        <div class="stat">
            <span class="label">Games played</span>
            <span class="number">${numberGame}</span>
        </div>
        <div class="stat">
            <span class="label">Average tries</span>
            <span class="number">${average.toFixed(1)}</span>
        </div>
    </div>
    <h3>Games by number of tries</h3>
    <div class="chart-container">
        <canvas id="stat-chart"></canvas>
    </div>`;
    modal.classList.remove("hidden");

    // initialize chart
    // labels is number of tries, from min to max number of tries
    const labels = [];
    for (let i = 1; i <= scores.reduce((acc, score) => Math.max(acc, score.numberTry), 0); i++) {
        labels.push(i);
    }
    // data is number of games with this number of tries
    const dataValues = [];
    for (let i = 0; i < labels.length; i++) {
        dataValues.push(scores.filter(score => score.numberTry === labels[i]).length);
    }
    const data = {
        labels: labels,
        datasets: [{
            label: 'My First Dataset',
            data: dataValues,
            backgroundColor: 'black',
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    display: false
                }
            }
        },
    };

    const ctx = document.getElementById('stat-chart');

    new Chart(ctx, config);

    // add class showScore to body for custom style
    document.body.classList.add("showScore");
}

function startNewGame() {
    // remove modal
    const modal = document.getElementById("modal");
    modal.classList.add("hidden");

    // remove class showScore to body for custom style
    document.body.classList.remove("showScore");

    // remove all results
    const results = document.querySelectorAll(".result");
    results.forEach(result => result.remove());

    // load new image
    loadNewImage();
}

function loadNewImage() {
    const image = document.getElementById("image");
    const author = document.querySelector("#credit .author");
    const source = document.querySelector("#credit .source");

    // get image by Unsplash rest API
    fetch("./api/image/get.php")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            image.src = data.urls.regular;
            author.textContent = data.user.name;
            author.href = data.user.links.html;
            source.href = data.links.html;
            image.dataset.id = data.id;

            document.getElementsByClassName('image-container')[0].classList.remove('loading');
        });

}

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const image = document.getElementById("image");
        const location = document.getElementById("location");

        // load an image
        loadNewImage();

        // listen new location proposition
        document.getElementById("new-location").addEventListener("submit", function (event) {
            event.preventDefault();
            fetch("./api/image/test_location.php?id=" + image.dataset.id + "&location=" + location.value)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    if (data.isWin === true) {
                        userWin(data.id, data.name);
                    } else if (data.error) {
                        alert(data.error);
                    } else {
                        const result = document.createElement("div");
                        result.classList.add("result");
                        const city = data.name.split(",")[0];
                        const distance = (data.distance / 1000).toFixed(0);
                        result.innerHTML = '<div class="orientation">' + getCompas(data.orientation) + '</div><p class="info">' + distance + ' km from ' + city + ' at ' + getCardinal(data.orientation) + '</p>';
                        document.getElementById("results-container").prepend(result);

                        // empty location input and focus on it
                        document.getElementById("location").value = "";
                        document.getElementById("location").focus();

                        // scroll to result recently displayed
                        result.scrollIntoView();
                    }
                });
        });
    });
})();