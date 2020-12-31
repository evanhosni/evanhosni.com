var scale = 20; // gives the scale of number of pixels that a single unit takes up on the screen

// HELPER FUNCTION TO CREATE AN ELEMENT IN THE DOM AND GIVE IT A CLASS
function elt(name, className) {
  var elt = document.createElement(name); // creates the element
  if (className) elt.className = className; // sets the class to className if you gave it an argument
  return elt;
}

// FUNCTION CONSTRUCTOR FOR A DISPLAY BY GIVING IT A PARENT TO APPEND ITSELF TO AND A LEVEL OBJECT TO DISPLAY
function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(elt("div", "game")); // create a div and give it the class called game and store it as wrapper because appendChild returns that element
  this.level = level; // the level object of the display object

  this.wrap.appendChild(this.drawBackground()); //drawBackground() has not been created yet but you will append it to the wrap or the element that holds all of this which is the immediate child of the parent given - this will draw the background and is only done once
  this.actorLayer = null; // is going to to be used to keep track of the actors so that they can be easily removed and replaced and used by drawFrame() //
  this.drawFrame(); //
}

DOMDisplay.prototype.drawBackground = function() {
  var table = elt("table", "background"); // create a table element with a class of background
  table.style.width = this.level.width * scale + "px"; // create the width of the background to scale

  this.level.grid.forEach(function(row) { // goes over each row of the built out grid of the level which is a bunch of words like lava and wall
    var rowElt = table.appendChild(elt("tr")); // create a table row to append to the parent table for each row
    rowElt.style.height = scale + "px"; // adjust the height of each row to the scale... i.e 20X20px means 20 px height
    row.forEach(function(type) { // go over each cell of the row
      rowElt.appendChild(elt("td", type)); // create a new element with a class of type in the table
    });
  });
  return table; // return the created background
};

DOMDisplay.prototype.drawActors = function() {
  var wrap = elt("div")  // create a div and add them to the wrapper for drawActors
  this.level.actors.forEach(function(actor) { // go over each actor
    var rect = wrap.appendChild(elt("div", "actor " + actor.type)); // create a div with the class of actor and the type that that the actor is
    rect.style.width = actor.size.x * scale + "px"; // the width of the actor is its vector's x property multiplied by scale
    rect.style.height = actor.size.y * scale + "px"; // same for height but by y
    rect.style.left = actor.pos.x * scale + "px"; // the position of the actor from the side of the screen
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap; // returns the wrap with all the actors in it
};

DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer) { // if an actorLayer exists, remove it
    this.wrap.removeChild(this.actorLayer);
  }
  this.actorLayer = this.wrap.appendChild(this.drawActors()); // add the actor layer to the wrap
  this.wrap.className = "game " + (this.level.status || ""); // add the class game to the wrap and the status if there is one --- by adding this class we can change the style of the player when there is a status on the wrapper
  this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;
  var margin = width / 3;

  var left = this.wrap.scrollLeft, right = left + width;
  var top = this.wrap.scrollTop, bottom = top + height;

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(.5)).times(scale); // multiply by scale because we need it in pixels and not level coordinates

  if (center.x < left + margin) {
    this.wrap.scrollLeft = center.x - margin;
  } else if (center.x > right - margin) {
    this.wrap.scrollLeft = center.x + margin - width;
  }
  if (center.y < top + margin) {
    this.wrap.scrollTop = center.y - margin;
  } else if (center.y > bottom - margin) {
    this.wrap.scrollTop = center.y + margin - height;
  }
};

DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};







var simpleLevelPlan = [[ // initial input for Level
  "x                   x                                                                          x",
  "                                                                                                ",
  "                                                                                                ",
  "                                                                                                ",
  "                                                                                                ",
  "                                                                                                ",
  "                                                                                                ",
  "                                                                                                ",
  "                                     =                                        o                 ",
  "                                                                                                ",
  "                    xxx                                                   xxx x x x x x xxxxxxxx",
  "                                                xxxx                                            ",
  "                               xxxxx                          xxxx                              ",
  "                      xxxxx         xxxx                                        =               ",
  "        @           x     x!!!!!!!!!!!!x                                                        ",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
],
[
  "                                       x",
  "                                       x",
  "       o         =        o             ",
  "                                        ",
  "xxx                xxxxxxxxxxxxxxxxxxxxx",
  "  xx        o o x  x                    ",
  "  x @      xxxxx   x                    ",
  "  xxxxx            x                    ",
  "      x!!!!!!!!!!!!x                    ",
  "      xxxxxxxxxxxxxx                    ",
],
[
  "                      ",
  "                      ",
  "                      ",
  "                      ",
  "                      ",
  "                      ",
  "                      ",
  "                      ",
  "                      ",
  "                      ",
  "                      ",
  "  x             o    x",
  "  x @           xx   x",
  "  xxxxx    xx    =   x",
  "      xxx!!!!!!!!!!xxx",
  "      xxxxx!!!!xxxxxxx",
  "                      "
]];

var actorChars = { // key for actor characters
  "@" : Player,
  "o" : Coin,
  "=" : Lava, "|" : Lava, "v" : Lava
};



// PLAYER CONSTRUCTOR
function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5)); // establish current position is half a square higher because it's 1.5 squares high and pos it top left corner of actor
  this.size  = new Vector(.8, 1.5); // it is .8 wide and 1.5 tall as a vector
  this.speed = new Vector(0, 0); // stationary starting speed
}

Player.prototype.type = "player";

var playerXSpeed = 7;
Player.prototype.moveX = function(step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
  } else {
    this.pos = newPos;
  }
};

var gravity = 10;
var jumpSpeed = 7;
Player.prototype.moveY = function(step, level, keys) {
  this.speed.y += step * gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if(keys.up && this.speed.y > 0) {
      this.speed.y = -jumpSpeed;
    } else {
      this.speed.y = 0;
    }
  } else {
    this.pos = newPos;
  }
};

Player.prototype.act = function(step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor) {
    level.playerTouched(otherActor.type, otherActor);
  }
  if (level.status === "lost") { // losing animation
    this.pos.y += step;
    this.size.y -= step;
  }
};




// LAVA CONSTRUCTOR
function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1); // takes up 1X1
  if (ch === "=") {
    this.speed = new Vector(2, 0); // sideways lava
  } else if (ch === "|") {
    this.speed = new Vector(0, 2); // speed in terms of vector, up & down
  } else if (ch === "v") {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos; // the original starting position to later repeat to
  }
}

Lava.prototype.type = "lava";

Lava.prototype.act = function(step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if(!level.obstacleAt(newPos, this.size)) {
    this.pos = newPos;
  } else if (this.repeatPos) {
    this.pos = this.repeatPos;
  } else {
    this.speed = this.speed.times(-1);
  }
};






var wobbleSpeed = 8, wobbleDist = .07;
// COIN CONSTRUCTOR
function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(.2, .1)); // move it inward a little bit and track the original position
  this.size = new Vector(.6, .6); // .6X.6 in size
  this.wobble = Math.random() * Math.PI * 2; //  something to do with where it goes on the wave of a sin curve
}

Coin.prototype.type = "coin";

Coin.prototype.act = function(step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
}




//  VECTOR CONSTRUCTOR
function Vector(x, y) { // constructor for the function object with an x and y coordinate as an input
  this.x = x;
  this.y = y;
}

Vector.prototype.plus = function(other) { // takes another vector as an argument
  return new Vector(this.x + other.x, this.y + other.y) // creates a new Vector object from the current one and the argument and returns it
}

Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor); // returns a new vector multiplied by the argument which will be useful when given a time interval to get the distance traveled
}








var maxStep = .05;

// LEVEL CONSTRUCTOR
function Level(plan) {
  this.width = plan[0].length; // how many characters in the string
  this.height = plan.length; // how many rows is how tall the game is
  this.grid = []; // this is the environment of empty space, walls, and lava
  this.actors = []; // array of actors

  for (var y = 0; y < this.height; y++) { // iterate over each string in the plan array
    var line = plan[y]; // the current string in the index of the input, the row of the game
    var gridLine = []; // the line to be built of environment
    for (var x = 0; x < this.width; x++) { // iterate over each character
      var ch = line[x]; // the current character of the current line which is the current string
      var fieldType = null; // checking to see if it's an actor or an emtpy space, if not it's a wall or stationary lava
      var Actor = actorChars[ch]; // haven't seen actorChars yet but this looks into that and declares Actor

      if (Actor) { // if it is an actor as defined above which will be either undefined or an actor
        this.actors.push(new Actor(new Vector(x, y), ch)); // this will push into the actors array a new object that has the name of the class i.e. "Player" and the position as a vector object and nowhere else
      } else if (ch === "x") {
        fieldType = "wall"; // set the variable fieldType to "wall"
      } else if (ch === "!") {
        fieldType = "lava"; // set the variable fieldType to "lava"
      }
      gridLine.push(fieldType); // pushes null into the grid line if it is an actor or empty space
    }
    this.grid.push(gridLine); // pushes the newly built environment line into the grid, these are all words!!!
  }

  this.player = this.actors.filter(function(actor) { //searches for the player and returns the first instance found with [0]
    return actor.type === "player"; // searches the actors one by one and matches an object with type player
  })[0];
  this.status = this.finishDelay = null; // sets the finishDelay and the status to null, the game is neither won nor lost
}

Level.prototype.isFinished = function() { // checks to see if a game is finished by seeing if there is a finishDelay and the status of the level is not null
  return this.status != null && this.finishDelay < 0;
};

Level.prototype.obstacleAt = function(pos, size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  if (xStart < 0 || xEnd > this.width || yStart < 0) {
    return "wall";
  }
  if (yEnd > this.height) {
    return "lava";
  }
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};

Level.prototype.actorAt = function(actor) {
  for (var i = 0; i < this.actors.length; i++) {
    var other = this.actors[i];
    if (other != actor &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.y + actor.size.y > other.pos.y &&
        actor.pos.y < other.pos.y + other.size.y) {
      return other;
    }
  }
};

Level.prototype.animate = function(step, keys) {
  if (this.status != null) {
    this.finishDelay -= step;
  }

  while (step > 0) {
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function(actor) {
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

Level.prototype.playerTouched = function(type, actor) {
  if (type == "lava" && this.status == null) {
    this.status = "lost";
    this.finishDelay = 1;
  } else if (type === "coin") {
    this.actors = this.actors.filter(function(other) {
      return other !== actor; // filter out the coin that you grabbed
    });
    if (!this.actors.some(function(actor) {
      return actor.type === "coin";
    })) {
      this.status = "won";
      this.finishDelay = 1;
    }
  }
};





var arrowCodes = {
  37: "left",
  38: "up",
  39: "right"
};
function trackKeys(codes) {
  var pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop) {
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
}

function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);
  runAnimation(function(step) {
    level.animate(step, arrows);
    display.drawFrame(step);
    if (level.isFinished()) {
      display.clear();
      if (andThen) {
        andThen(level.status);
      }
      return false;
    }
  });
}

function runGame(plans, Display) {
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display, function(status) {
      if (status == "lost") {
        startLevel(n);
      } else if (n < plans.length - 1) {
        startLevel(n + 1);
      } else {
        console.log("you win!");
        desktop.mail( new URI( "mailto:javaexamplecenter@gmail.com?subject=Test%20message" ) );
      }
    });
  }
  startLevel(0);
}

var arrows = trackKeys(arrowCodes);
var simpleLevel = new Level(simpleLevelPlan);
runGame(simpleLevelPlan, DOMDisplay);
