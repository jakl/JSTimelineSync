// An event for a player to check in to show it is still connected
class WorldTick extends TEvent{
    run(timeline){
        let world = timeline.get(World.ID);
        if(! (world instanceof World) ){
            console.log("Not a world!");
            console.log(world);
            return ;
        }
        // Resolve collisions
        //TODO resolution should be moved to another event and optimized to not rerun if event hash is same and inputs unchanged
        let player_ids = Object.keys(world.heartbeat);

        for(let k=1;k<player_ids.length;k++){
            let player1 = timeline.get(player_ids[k]);
            if(!player1){
                continue;
            }
            for(let j=0;j<k;j++){
                let player2 = timeline.get(player_ids[j]);
                if(!player2){
                    continue;
                }
                let p1top2 = [player2.x -player1.x, player2.y - player1.y];
                let l = Math.sqrt(p1top2[0]*p1top2[0] + p1top2[1]*p1top2[1]);
                if( l> 0 && l < player1.radius + player2.radius){ //collision
                    //console.log(this.time + " = " + timeline.current_time);
                    if (player1.radius > player2.radius) {
                        eat(player1, player2)
                    } else {
                        eat(player2, player1)
                    }
                }
            }
        }

        // Remove timed out players
        let to_remove = [] ;
        for(let id in world.heartbeat){
            if(world.heartbeat[id] < this.time - World.player_timeout){
                //console.log(id +" timed out " + world.heartbeat[id] + " < " + (this.time - World.player_timeout));
                to_remove.push(id);
                timeline.deleteObject(id, this.time + this.parameters.interval*to_remove.length/1000.0);
            }
        }
        for(let k=0;k<to_remove.length;k++){
            delete world.heartbeat[to_remove[k]];
        }


        timeline.addEvent(new WorldTick({ interval: this.parameters.interval }, this.time + this.parameters.interval));

        function eat(biggerFish, smallerFish) {
            biggerFish.radius += Math.sqrt(smallerFish.radius)
            smallerFish.x = Math.random() * 1000
            smallerFish.y = Math.random() * 1000
            smallerFish.radius = 20
        }
    }
}
