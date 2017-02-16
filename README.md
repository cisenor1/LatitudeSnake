# Latitude Bounty Snake
This is our top-secret bounty snake.

### Running the AI locally

Install [Docker](https://www.docker.com/)

```
docker run -d -p 4000:4000 noelbk/battle_snake_server
```



### Deploying to Heroku

We're using Heroku's github integration. When you push changes to Master, first Travis will build and ensure the build succeeded, then Heroku will build and deploy auto-magically. 