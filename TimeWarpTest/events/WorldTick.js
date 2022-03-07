// An event for a player to check in to show it is still connected
class WorldTick extends TEvent{
    run(timeline){

        let world = timeline.get(World.ID);
        if(! (world instanceof World) ){
            console.log("Not a world!");
            console.log(world);
            return ;
        }
        //console.log("World Tick:" + this.time);
        // Resolve collisions
        //TODO resolution should be moved to another event and optimized to not rerun if event hash is same and inputs unchanged
        let player_ids = Object.keys(world.heartbeat);
        let IDs = timeline.getAllIDs() ;
        for(let k=0;k<player_ids.length;k++){
            let player1 = timeline.get(player_ids[k]);
            if(!player1){
                continue;
            }

            // allow players to push each other around
            for(let j=0;j<k;j++){
                let player2 = timeline.get(player_ids[j]);
                if(!player2){
                    continue;
                }
                let p1top2 = [player2.x -player1.x, player2.y - player1.y];
                let l = Math.sqrt(p1top2[0]*p1top2[0] + p1top2[1]*p1top2[1]);
                if( l> 0 && l < Player.radius*2){ //collision
                    //console.log(this.time + " = " + timeline.current_time);
                    let n = (2*Player.radius - l)/ (2*l);
                    player2.x += p1top2[0] * n;
                    player2.y += p1top2[1] * n;
                    player1.x -= p1top2[0] * n;
                    player1.y -= p1top2[1] * n;
                }
            }

            /// make bullets collide with players
            for(let b_id of IDs){
                let bullet = timeline.get(b_id);
                if(!bullet || !(bullet instanceof Bullet)){
                    continue;
                }
                if(bullet.shooter_id != player_ids[k] && bullet.birth_time+Bullet.lifetime > this.time){ // player can't shoot self and bullet can't be dead
                    let p1tob = [bullet.x -player1.x, bullet.y - player1.y];
                    let l = Math.sqrt(p1tob[0]*p1tob[0] + p1tob[1]*p1tob[1]);
                    if( l < Player.radius+Bullet.radius){ //collision
                        //console.log("Bullet " + b_id +" hit player " + player_ids[k]);
                        player1.times_hit++;
                        timeline.get(bullet.shooter_id).hits++;
                        bullet.birth_time = 0 ; // age out bullet and let movebullet clean it up
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
        

        timeline.addEvent(new WorldTick({interval:this.parameters.interval}, this.time+this.parameters.interval));
    }
}