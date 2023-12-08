
if (!Glsl.supported()) alert("WebGL is not supported.");
Loader.text("main.frag", 
  function (mainFrag) {
    var hasTouch = ('ontouchstart' in window);
    var now = 0;

    var canvas = document.getElementById("viewport");
    var canvasHeight = canvas.getBoundingClientRect().height;
	var canvasWidth = canvas.getBoundingClientRect().width;

    var positionWithE = !hasTouch ? function (e) {
        return new Vec2(e.clientX, e.clientY);
      } : function (e) {
        var touch = e.touches[0];
        return new Vec2(touch.pageX, touch.pageY);
      };  
	
	var direction = 1;
	
    function Vec2(x, y) {
      this.x = x;
      this.y = y;
    }

    Vec2.prototype = {
      clone: function () {
        return new Vec2(this.x, this.y);
      },
      add: function (v) {
        this.x += v.x;
        this.y += v.y;
      },
      multiply: function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
      }
    };

    function Player (position, dimension, xDirection) {
      this.position = position;
      this.dimension = dimension;
      this.score = 0;
      this.countSucc = 0;
      this.lastTouch = -99999;
      this.xDirection = xDirection;
      this.balls = [];
	  
    }
	
	function Brick (position, dimension, alive)
	{
	 this.position = position;
	 this.dimension = dimension;
	 this.alive = alive;
	}
	
	Brick.prototype={
	  pushBallBrick : function (ball)
	  {
        var dx = ball.center.x - this.position.x;
        ball.velocity.x += 0.003*dx; 
		ball.velocity.y = ball.velocity.y * -1; 
	  }
	};

    Player.prototype = {
      update: function () {
        //this.dimension.y = 0.2 + Math.min(0.2, this.countSucc/40);

        if (this.hasBall()) {
          for (var i=0; i<this.balls.length; ++i) {
            var ball = this.balls[i];
            ball.center.y = this.position.y + 0.04;
            ball.center.x = this.position.x;//+ 0.02;//+this.xDirection*0.04 + 0.01*Math.sin((now-this.takeBallTime)/100);
          }
		}
      },
	  
      hasBall: function () {
        return this.balls.length>0;
      },
	  
      sendBall: function () {
        var ball = this.balls.pop();
        if (ball===undefined) return;
        ball.velocity.x = 0;
        ball.velocity.y = this.xDirection*(0.001+0.0001*Math.random());
      },
	  
      obtainBall: function (ball) {
        this.balls.push(ball);
        ball.velocity.x = 0;
        ball.velocity.y = 0;
        ball.center.x = this.position.x+0.03*this.xDirection;
        ball.center.y = this.position.y;
        this.takeBallTime = now;
      },
	  
      pushBall: function (ball) {
		
        this.lastTouch = now;
        
        var dx = ball.center.x - this.position.x;
        ball.velocity.x += 0.003*dx;
		ball.velocity.y = Math.abs(ball.velocity.y);
      },
	  
      setX: function (x) {
        this.position.x = Math.max(this.dimension.x/2, Math.min(x, 1-this.dimension.x/2));
      }
    };

    function Ball (center, radius) {
      this.center = center;
      this.radius = radius;
      this.velocity = new Vec2(0, 0);
      this.creationTime = now;
    }

    Ball.prototype = {
      hitWall: function (touchTop) {
        this.velocity.y = touchTop * Math.abs(this.velocity.y);
      },
	  
	  hitSides: function (touchSide) {
        this.velocity.x = touchSide * Math.abs(this.velocity.x);
      },
	  
      update: function (delta) {
        /*if (this.center.y < this.radius)
          this.hitWall(1);*/
        
		if (this.center.y > 1-this.radius)
          this.hitWall(-1);
	    
		if(this.center.x > 1- this.radius)
			this.hitSides(-1);
		
		if(this.center.x < this.radius)
			this.hitSides(1);
	  
        var v = this.velocity.clone();
        v.multiply(delta);
        this.center.add(v);
      },
	  
      isColliding: function (player) {
			  
        return player.position.x - player.dimension.x/2 <= this.center.x + this.radius &&
		
          this.center.x - this.radius <= player.position.x+player.dimension.x/2 &&
        
		player.position.y-player.dimension.y/2 <= this.center.y+this.radius &&

		this.center.y-this.radius <= player.position.y+player.dimension.y/2;
      }
    };

    // Game states

    var player = new Player(new Vec2(0.5, 0.05), new Vec2(0.1, 0.02), 1);
    var balls = [];
	var bricks= [];

    function addBall () {
      var b = new Ball(new Vec2(0,0), 0.012);
      balls.push(b);
      return b;
    }
	
	function loadLevel1()
	{
		var TotalBricks = 14;
		var xOffset = 0.12;
		var yOffset = 0.07;
	
		var count = 0;	
		
		var changeY = false;
		
		var lastX = 0.0;
		var lastY = 0.9;
		var nextX = 0.0;
		var nextY = 0.0;
		var alreadyChangedOnce = false;
		var alreadyChangedTwice = false;
		
		for(var i = 0; i < 14; ++i)
		{	
			if(count > 13 && !alreadyChangedTwice )
			{
				changeY = true;
				alreadyChangedTwice = true;
			}
			if(count > 6 && !alreadyChangedOnce)
			{
				changeY = true;
				alreadyChangedOnce = true;
			}
			
			if(changeY)
			{
				nextX = 0.0 + xOffset;
				nextY = lastY - yOffset;
				changeY = false;
			}
			else{
			nextX = lastX + xOffset;
			nextY = lastY;
			}
			var curr_brick = new Brick(new Vec2(nextX, nextY), new Vec2(0.08, 0.05), 1);
			count +=1;
			bricks.push(curr_brick);
			lastX = nextX;
			lastY = nextY;
		}
	}
	
	function loadLevel2()
	{
		var TotalBricks = 21;
		var xOffset = 0.12;
		var yOffset = 0.07;
	
		var count = 0;	
		
		var changeY = false;
		
		var lastX = 0.0;
		var lastY = 0.9;
		var nextX = 0.0;
		var nextY = 0.0;
		var alreadyChangedOnce = false;
		var alreadyChangedTwice = false;
		
		for(var i = 0; i < TotalBricks; ++i)
		{	
			if(count > 13 && !alreadyChangedTwice )
			{
				changeY = true;
				alreadyChangedTwice = true;
			}
			if(count > 6 && !alreadyChangedOnce)
			{
				changeY = true;
				alreadyChangedOnce = true;
			}
			
			if(changeY)
			{
				nextX = 0.0 + xOffset;
				nextY = lastY - yOffset;
				changeY = false;
			}
			else{
			nextX = lastX + xOffset;
			nextY = lastY;
			}
			var curr_brick = new Brick(new Vec2(nextX, nextY), new Vec2(0.08, 0.05), 1);
			count +=1;
			bricks.push(curr_brick);
			lastX = nextX;
			lastY = nextY;
		}
	}
    function removeBall (ball) {
      var i = balls.indexOf(ball);
      i!=-1 && balls.splice(i, 1);
    }
	
	function removeBrick(brick)
	{
	 var i = bricks.indexOf(brick);
      i!=-1 && bricks.splice(i, 1); 
	}
	

    var mouseP = new Vec2(0, 0.5);

    if (!hasTouch) {
      canvas.addEventListener("mousemove", function (e) {
        mouseP = positionWithE(e);
      }, false);
      canvas.addEventListener("click", function (e) {
        player.sendBall();
      });
    }
    else {
      canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();
        mouseP = positionWithE(e);
      }, false);
      canvas.addEventListener("touchstart", function (e) {
        e.preventDefault();
        mouseP = positionWithE(e);
        player.sendBall();
      });
    }

    var MAX_BALLS;
	var MAX_BRICKS;
	var level1 = false;
	var level2 = false;
	var level3 = false;
	var levelComplete = false;
	
	var dom_Score=document.getElementById("Score");

    var glsl = Glsl({
      canvas: canvas,
      fragment: mainFrag,
      variables: {
        player: player,
		bricks: bricks,
		bricksLength: bricks.length,
        balls: balls,
        ballsLength: balls.length,
        lastBallFail: -99999,
        time: 0
      },
      init: function () {
        MAX_BALLS  = this.defines.MAX_BALLS;
		MAX_BRICKS = this.defines.MAX_BRICKS;
        player.obtainBall(addBall());
		loadLevel1();
      },
        update: function (t, delta) {
        this.set("time", t);
        now = t;
		
		if(bricks.length <=0)
		{
		for(var i = 0; i<balls.length;i++)
		{
			var currball = balls[i];
			removeBall(balls[i]); 
		}
		 	
		 levelComplete = true;
		 player.obtainBall(addBall());
		}
		
        if(levelComplete)
		{
			if(!level1)level1 = true;
			else if(!level2)
			{
			 level2 = true;
			 loadLevel2();
			}
			else if(!level3)
			{
			 level3 = true;
			 loadLevel3();
			}
			levelComplete = false;
		}
        player.setX(mouseP.x / canvasWidth);
		dom_Score.innerHTML="<h1>SCORE :" + player.score ;

        for (var i=0; i<1; i++) {
          var ball = balls[i];
          if (ball.isColliding(player)) {
            player.pushBall(ball);
          }
		  for(var j = 0; j < bricks.length; j++)
		  {
			  var bri = bricks[j];
			  if (ball.isColliding(bri)) 
			  {
				bri.pushBallBrick(ball);
				player.score += 10;
				removeBrick(bri);
			  }
		  }
          if (ball.center.y < 0.0) {
            removeBall(ball);
            player.obtainBall(addBall());
			player.score -= 20;
          }
        }
		ball.update(delta);
		player.update(delta);
        this.set("ballsLength", balls.length);
		this.set("bricksLength", bricks.length);
		
        this.sync("player", "bricks", "balls");
      }
    }).start();

  });
