@echo off
set SNAKE_URL="192.168.0.19:9001"
set SNAKES_PER_GAME=2
set ROOT=$(realpath $(dirname $(realpath $0))/..)
set CREATE_REQUEST="ruby $ROOT/scripts/create_request.rb"
set RUBY_VERSION="ruby 2.3"
set CHRUBY=/usr/local/share/chruby/chruby.sh 
set data="{game_form:{width:100,max_food:10,height:100,delay:100,game_mode:multiplayer,snakes:[{url:http://192.168.0.19:9001/21e1e041-aa22-4c9e-be66-31d04ce3f033}]}"
 
FOR /L %%i IN (1,1,5) DO (
        curl -X POST "localhost:4000/api/game_forms" -H "Content-Type: application/json" --data %data% | jq '.game_id' > temp.txt
 
)

REM for i in {1..50}
REM do
REM     curl -X POST "localhost:3000/api/game_forms" \
REM          -H "Content-Type: application/json" \
REM          --data $($CREATE_REQUEST --url=$SNAKE_URL -n $SNAKES_PER_GAME) | \
REM         jq '.game_id' | \
REM         read game_id

REM     curl -X POST "localhost:3000/api/game_servers" \
REM          -H "Content-Type: application/json" \
REM          --data "{\"id\":$game_id}" | \
REM         cat

REM     sleep 1
REM done