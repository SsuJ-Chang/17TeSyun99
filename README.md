# [17TeSyun99 (17特訓99)](https://17tesyun99.rj728web.fun/)
It's a project of remaking single player game "TeSyun99" and supporting multiple players online.
![17特訓99](https://user-images.githubusercontent.com/52148950/172580670-cd6a5277-5ef2-420a-8747-f3a1f4c1014c.JPG)

## What is TeSyun99
* A classic litte game which player controls a flight dodging all direction random moving bullets.
* Player will get a rating when game over.  
![tr](https://user-images.githubusercontent.com/52148950/172999958-b80e4cb7-7578-4679-a613-57476bdd33e6.png)
* **In 17TeSyun99, player should dodge other player's flight and random moving bullets.**
![TS02](https://user-images.githubusercontent.com/52148950/173041574-525636a7-e460-4c6a-8f31-957206fd2ee5.JPG)

## Core Features
* Multiple Playes Online Game
* Chatroom

## Language
* Front-End: Javascript
* Back-End: Node.js & Express.js

## How to implement gameplay mechanics 
### Client Side
* Transporting player data by **Socket.IO** client
* Rendering game view by **HTML5 Canvas API**
  * Background images
  * Player's flight(controller)
  * All other player's flights (enemies)
  * All bullets 
* Implementing 60 FPS by **JavaScript `setInterval()`**

> Client will render player's flight according to the latest player data in client for ***making sure player's flight moving smoothly***. 

### Server Side
* Transporting game data by **Socket.IO** server
  * Players data
  * Leaderboard 
  * Bullets data
* Implementing fixed server updating frequency by **JavaScript `setInterval()`**

> In order to decrease unnecessary packets transporting, the game data will broadcast after the ***`isPlayersInfoChanged` flag*** becoming ***true***. 

## Back-End Architecture
![17TS99](https://user-images.githubusercontent.com/52148950/172580967-f7db2244-6051-4983-b928-38ab9e5e3db8.png)

### About Back-End
* Monitoring metrics from instances and auto scaling group by **AWS Cloudwatch**
* Horizontal scailing by **AWS Auto Scaling** based on AWS Cloudwatch alarms
  * Adding 1 instance when CPU Utilization approachs to specified metrics of the original instance
  ![add](https://user-images.githubusercontent.com/52148950/173033486-d9eb81cc-6acc-4ed2-a238-c9d2549da0ce.JPG)
  * Removing 1 instance when CPU Utilization approachs to specified metrics of an addtional instance scaled by auto scaling group
* Deploying application server by **Docker**
* Storing member data by **MongoDB**
* Listening 80 & 443 for reverse proxy by **Nginx**
* Authenticating member state by **JWT**
* Improving application availability and responsiveness by **AWS Load Balancer**
