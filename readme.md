# Where is it ? Find location of a photo

## Description
This is a small project to find the location of a photo using the [Unsplash API](https://unsplash.com/developers) and the [Position Stack API](https://positionstack.com/).

### Why?
This game has been made for the [contest #4](https://www.youtube.com/watch?v=9tSYNQJn6c8) of [Le Designer du Web](https://www.youtube.com/@LeDesignerduWeb).  The goal was to create a game using a REST API in a web creation.

### How?
The game is made with HTML, CSS and JavaScript. Api calls are made with curl in PHP.

Unsplash API free plan allows 50 requests per hour. So if the quota is reached, game recovers a random photo from images previously downloaded from users.

### The future?
I would like to add a map to show the attempts and improve the distance calculation system.  

I thinks it would be nice to can try to find only one photo each day. All users will have the same photo to find and the game will be more challenging.

If you have any idea, feel free to open an issue.

## Installation
Create a config php file in api folder like this:
```php
<?php
define('UNSPLASH_CLIENT_ID', '{your unsplash client id}');
define('POSITION_STACK_ACCESS_KEY', '{your position stack access key}');
```
Start the server with `php -S localhost:8000` and open the index.html file in your browser.