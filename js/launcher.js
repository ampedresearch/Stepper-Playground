function Launcher(yPosition) {
    this.sizeRange = {
        stable:(height / 12),
        large:(height / 6)
    };
    this.size = this.sizeRange.stable;

    this.thickness = 4;
    this.stretchX = 0;
    this.strokeColor = 20

    this.x = width - this.thickness + 1;
    this.y = yPosition;

    this.update = function() {
        if (this.x != (width - this.thickness + 1)) {
            this.x = lerp(this.x, (width - this.thickness + 1), 0.05);
        }
        this.size = lerp(this.size, this.sizeRange.stable, 0.1);
    }

    this.show = function() {
        push();
        strokeWeight(this.thickness);
        stroke(this.strokeColor);
        triangle(this.x, this.y - this.size/2,
            this.x, this.y + this.size/2,
            this.x - this.stretchX, this.y);
        pop();
    }

    this.bump = function() {
        this.size = this.sizeRange.large;
    }

    this.pushOffscreen = function() {
        this.x = width + 40;
    }

    // Should mapping occur here, or within the broader function?
    // Or, maybe the input range could be optional?
    this.stretch = function(input, inputRange) {
        let stretchRange = {min: this.size/2, max: this.size * 2};
        this.stretchX = map(input, inputRange.min, inputRange.max, stretchRange.min, stretchRange.max);
    }

    this.setColor = function(input, inputRange) {
        let colorRange = {min: 20, max: 150};
        this.strokeColor = map(input, inputRange.min, inputRange.max, colorRange.min, colorRange.max);
    }

    this.resize = function() {
        this.sizeRange = {
            stable:(height / 12),
            large:(height / 6)
        };
        this.size = this.sizeRange.stable;
    }

    this.getPosition = function() {
        return this.y;
    }
}

function Launchers(numberOfLaunchers) {
    this.launchers = [];
    this.numberOfLaunchers = numberOfLaunchers;

    this.update = function() {
        for (l of this.launchers) {
            l.update();
        }
    }

    this.show = function() {
        for (l of this.launchers) {
            l.show();
        }
    }

    this.bump = function(whichOne) {
        this.launchers[whichOne].bump();
    }

    this.pushOffscreen = function() {
        for (l of this.launchers) {
            l.pushOffscreen();
        }
    }

    this.stretch = function(input, inputRange) {
        for (l of this.launchers) {
            l.stretch(input, inputRange);
        }
    }

    this.setColor = function(input, inputRange) {
        for (l of this.launchers) {
            l.setColor(input, inputRange);
        }
    }

    this.updatePositions = function(numberOfLaunchers) {
        this.numberOfLaunchers = int(numberOfLaunchers);
        this.launchers = [];
        let positionVal = height / (this.numberOfLaunchers + 1);
        let accumulator = positionVal;

        for (let i = 0; i < this.numberOfLaunchers; i++) {
            let l = new Launcher(accumulator);
            this.launchers.push(l);
            accumulator += positionVal;
        }
    }

    this.resize = function() {
        for (l of this.launchers) {
            l.resize();
        }
        this.updatePositions(this.numberOfLaunchers);
    }

    this.getPosition = function(number) {
        return this.launchers[number].getPosition();
    }

    this.getPositions = function() {
        let positions = [];
        let positionVal = height / (this.numberOfLaunchers + 1);
        let accumulator = positionVal;

        for (let i = 0; i < this.numberOfLaunchers; i++) {
            positions.push(accumulator);
            accumulator += positionVal;
        }

        return positions;
    }
}
