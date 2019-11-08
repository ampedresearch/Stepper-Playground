function Column() {
    this.x = width;
    this.y = height;

    this.alive = true;

    this.rate = 4;

    this.old_width = width; // used for resizing

    this.update = function() {
        if (this.x < -10) { this.alive = false; }
        this.x -= this.rate;
    }

    this.show = function() {
        strokeWeight(2);
        stroke(100);
        line(this.x, 0, this.x, this.y);
    }

    this.resize = function() {
        this.y = height;
        this.x = map(this.x, 0, this.old_width, 0, width);
        this.old_width = width;
    }
}

function Columns() {
    this.columns = [];

    this.update = function(active=true) {
        if (active) {
            for (let c of this.columns) {
                if (c.alive) { c.update(); }
            }
        }
    }

    this.show = function() {
        for (let c of this.columns) {
            if (c.alive) { c.show(); }
        }
    }

    this.addColumn = function() {
        let newColumn = new Column();
        this.columns.push(newColumn);
    }

    this.clear = function() {
        this.columns = [];
    }

    this.resize = function() {
        for (let c of this.columns) {
            c.resize();
        }
    }
}
