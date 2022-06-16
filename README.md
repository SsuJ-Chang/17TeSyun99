# [17TeSyun99 (17特訓99)](https://17tesyun99.rj728web.fun/)
It's a project of remaking single player game "特訓99" and supporting multiple players online.
![1799index](https://user-images.githubusercontent.com/52148950/173866710-7f7c1654-2df8-49ae-b114-a5b9823e0c34.gif)

Welcome to try this game!

Website URL: https://17tesyun99.rj728web.fun/
|Account|Password|
|---|---|
|test@test|test|

## Catalog
* [What is TeSyun99](#what-is-tesyun99)
* [Core Features](#core-features)
* [Tech Stack](#tech-stack)
* [Backend Architecture](#backend-architecture)
* [How to Implement Gameplay Mechanics](#how-to-implement-gameplay-mechanics)
* [Application Server Auto Scaling](#application-server-auto-scaling)
* [Contact](#contact)

## What is 特訓99
* A classic game in which the player controls a spaceship and needs to dodge bullets coming from all directions. 
![99](https://user-images.githubusercontent.com/52148950/174002906-50432d08-3da6-4d2a-9c49-daee2bd885de.gif)
* In 17TeSyun99, the player should dodge other players' ball-ships and dodge bullets flying around the screen.
![TS02](https://user-images.githubusercontent.com/52148950/173041574-525636a7-e460-4c6a-8f31-957206fd2ee5.JPG)

## Core Features
* Multiple Player Online Game
* Chatroom

## Tech Stack
### Frontend
* JavaScript
* HTML5 Canvas API
### Backend
* Node.js
* Express.js
* Socket.IO
* Docker
* AWS EC2, Load Balancing, CloudWatch, Auto Scaling
* JSON Web Token(JWT)
* Nginx
* MongoDB

## Backend Architecture
![17TS99架構圖](https://user-images.githubusercontent.com/52148950/174003165-9769f02c-f7e4-46c8-a96a-ed1ee5620e77.png)

## How to Implement Gameplay Mechanics 
### Client Side
* Transporting player data by **Socket.IO** client
* Rendering game view by **HTML5 Canvas API**
  * Background images
  * Player's ball-ship (controller)
  * All other player's ball-ships (enemies)
  * All bullets 
* Implementing 60 FPS by **JavaScript `setInterval()`** without 3rd party lirbraries or engines
> Client will render player's ball-ship according to the latest player data in client for ***making sure player's ball-ship moving smoothly***. 

![client_moving](https://user-images.githubusercontent.com/52148950/173869033-508bc3ac-2780-4239-b5a4-c18ac708bbb2.gif)

### Server Side
* Transporting game data by **Socket.IO** server
  * Players data
  * Leaderboard
  * Bullets data
* Implementing fixed server updating frequency by **JavaScript `setInterval()`**

> In order to decrease unnecessary packets transporting, the game data will broadcast after the ***`isPlayersInfoChanged` flag*** becoming ***true***. 

![game_sync](https://user-images.githubusercontent.com/52148950/173422891-aa073f7b-2d68-49d3-86b5-0aa1507e8902.png)

## Application Server Auto Scaling
* Monitoring metrics from instances and auto scaling group by **AWS Cloudwatch**
* Horizontal scaling by **AWS Auto Scaling** based on **AWS Cloudwatch Alarms**
  * Adding 1 instance when CPU Utilization approachs to specified metrics of the original instance
  ![add](https://user-images.githubusercontent.com/52148950/173033486-d9eb81cc-6acc-4ed2-a238-c9d2549da0ce.JPG)
  * Removing 1 instance when CPU Utilization approachs to specified metrics of an addtional instance scaled by auto scaling group

## Contact
👨🏻‍💻 章思傑 Anfer Chang

📬 Email: loch0728@gmail.com
