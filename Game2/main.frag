#ifdef GL_ES
precision mediump float;
#endif

#define MAX_BALLS 1
#define MAX_BRICKS 21

struct Player {
  vec2 position;
  vec2 dimension;
  int count;
  int xDirection;
  float lastTouch;
};

struct Ball {
  vec2 center;
  float radius;
  vec2 velocity;
  float creationTime;
};

struct Brick{
  vec2 position;
  vec2 dimension;
  int alive;
};

uniform vec2 resolution;
uniform float time;
uniform float lastBallFail;

uniform Ball balls[MAX_BALLS];
uniform int ballsLength;

uniform Player player;
uniform Brick bricks[MAX_BRICKS];
uniform int bricksLength;

bool inCircle (vec2 p, vec2 center, float radius) {
  vec2 ratio = resolution/resolution.x;
  return distance(p*ratio, center*ratio) < radius;
}

bool inPlayer (vec2 position, Player player) {
  return all(lessThan(2.*abs(position-(player.position)), player.dimension));
}

bool inBall (vec2 position, Ball ball) {
  return inCircle(position, ball.center, ball.radius);
}

bool inBrick (vec2 position, Brick brick) {
  return all(lessThan(2.*abs(position-(brick.position)), brick.dimension));
}


void main (void) {
  vec2 p = ( gl_FragCoord.xy / resolution.xy );
  vec2 ratio = resolution/resolution.x;

  
  vec3 c = vec3(1.0, 1.0, 0.5)*(0.5+0.5*distance(p.x, 0.0));

  for (int i=0; i<MAX_BALLS; ++i) 
  { 
	if (i>=ballsLength) break;
    Ball ball = balls[i];
   
    float dist = distance(p*ratio, (ball.center)*ratio);
    if (dist < ball.radius) {
      float d = smoothstep(1.0, 0.6, dist/ball.radius);
      c -= d* vec3(1,1,0);
    }
  }
  
  
  if (inPlayer(p, player)) {
    c = vec3(0.3, 0.3, 0.3) * 0.6;
   }
   
  for (int i=0; i<MAX_BRICKS; ++i) 
  { 
  	if (i>=bricksLength) break;
    Brick br = bricks[i];
    
	if (inBrick(p, br)) 
	{
	 c *= vec3(0.6,0,0);
    }  
  }
    
  gl_FragColor = vec4(c, 1.0);
}
