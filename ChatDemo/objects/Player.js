// A "player" for the 2D chat example
class Player extends TObject{
    radius = 35 ;
    speed = 500 ;
    name = "";
    x = 0;
    y = 0;
    tx = 0 ;
    ty = 0 ;
    moving = false;
    ai = false; // if this is an artifical intelligence fish, then auto swim around the pond

    constructor(){
        super();
    }

    // Serialize this object to a string
    serialize(){
        let s = {radius: this.radius, speed: this.speed, name:this.name, x:this.x, y:this.y, tx:this.tx, ty:this.ty, moving:this.moving};
        return JSON.stringify(s);
    }

    // Set this object to a serialized string created with serialize.
    set(serialized){
        let s = JSON.parse(serialized);
        this.name = s.name;
        this.x = s.x;
        this.y = s.y ;
        this.tx = s.tx;
        this.ty = s.ty ;
        this.moving = s.moving;
        this.radius = s.radius;
        this.speed = s.speed;
    }

    interpolateFrom(last_observed, last_time, this_time){
        if(!last_observed){
            return this ;
        }
        let distance = Math.sqrt((this.x-last_observed.x)*(this.x-last_observed.x)+(this.y-last_observed.y)*(this.y-last_observed.y));
        let dt = this_time-last_time ;
        if(distance/dt < this.speed *1.1){
            return this ;
        }else{
            let ip = new Player();
            let b = ip.speed *1.1*dt/distance ;

            let a = 1-b;
            ip.x = a*last_observed.x + b* this.x ;
            ip.y = a*last_observed.y + b* this.y ;
            ip.tx = a*last_observed.tx + b* this.tx ;
            ip.ty = a*last_observed.ty + b* this.ty ;
            return ip ;
        }
    }
}
