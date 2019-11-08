function Particle(yPos, type, launcherNum) {
    this.x = width;
    this.y = yPos;

    this.type = type; // used for shape
    this.launcherNum = launcherNum; // used for positioning

    this.size = height / 12;
    this.rate = 4;

    this.alive = true;

    this.old_width = width; // used for resize

    this.update = function() {
        if (this.x < -10) {this.alive = false;}
        this.update_x();
    }

    this.show = function() {
        this.draw_me();
    }

    this.update_x = function() {
        this.x -= this.rate;
    }

    this.update_y = function(new_y) {
        this.y = new_y;
    }

    this.draw_me = function() {
        if (this.type == 's') {
            strokeWeight(2);
            stroke(51);
            fill(255);
            ellipse(this.x, this.y, this.size, this.size);
        }
        else {
            push();
            strokeWeight(2);
            stroke(51);
            translate(-this.size/2, -this.size/2);
            line(this.x, this.y, this.x+this.size, this.y+this.size);
            line(this.x+this.size, this.y, this.x, this.y+this.size);
            pop();
        }
    }

    this.resize = function() {
        this.size = height / 12;
        this.x = map(this.x, 0, this.old_width, 0, width);
        this.old_width = width;
    }
}

function Particles() {
    this.particles = [];

    this.update = function(active=true) {
        if (active) {
            for (let p of this.particles) {
                if (p.alive) {p.update();}
            }
        }
    }

    this.show = function() {
        for (let p of this.particles) {
            if (p.alive) {p.show();}
        }
    }

    this.addParticle = function(position, type, launcherNum) {
        let newParticle = new Particle(position, type, launcherNum);
        this.particles.push(newParticle);
    }

    this.clear = function() {
        this.particles = [];
    }

    this.resize = function(launcherPositions) {
        for (let p of this.particles) {
            p.update_y(launcherPositions[p.launcherNum]);
            p.resize();
        }
    }

}
