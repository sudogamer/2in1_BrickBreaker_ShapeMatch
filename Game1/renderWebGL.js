
var main=function() {
  if(!game.level1 && !game.level2 && !game.level3 && !game.level4)
  {
    game.gameOn = true;
    game.level1 = true;
    game.timer = true;
    game.draggable = true;
  }

  var THETA=0,
      PHI=0;
  var CANVAS=document.getElementById("your_canvas");

  CANVAS.width=window.innerWidth ;
  CANVAS.height=window.innerHeight ;

      /*========================= MATRIX ========================= */
  var PROJMATRIX=LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
  var MOVEMATRIX_TRIANGLE=LIBS.get_I4();
  var MOVEMATRIX_QUAD=LIBS.get_I4();
  var MOVEMATRIX_RECTANGLE=LIBS.get_I4();
  var MOVEMATRIX_RIGHT_TRIANGLE=LIBS.get_I4();

  var MOVEMATRIX_RIGHT_TRIANGLE_WIREFRAME=LIBS.get_I4();
  var MOVEMATRIX_QUAD_WIREFRAME=LIBS.get_I4();
  var MOVEMATRIX_TRIANGLE_WIREFRAME=LIBS.get_I4();
  var MOVEMATRIX_RECTANGLE_WIREFRAME=LIBS.get_I4();
  var VIEWMATRIX=LIBS.get_I4();

  var TEMP =LIBS.get_I4();


  /*========================= CAPTURE MOUSE EVENTS ========================= */
 var AMORTIZATION=0.10;
 var drag_quad=false;
 var drag_triangle = false;
 var drag_right_triangle = false;
 var drag_rectangle = false;

var pageYoffset = CANVAS.height/3;

 var old_x, old_y;

 var dX=0, dY=0;
 var mouseDown=function(e) {

    if(e.pageX >= 5  && e.pageX <=220
    &&e.pageY >= 0 && e.pageY <= pageYoffset - 100 && game.draggable)
    {
      drag_quad=true;
    }

    if(e.pageX >= 5  && e.pageX <=220
    &&e.pageY >= pageYoffset-50 && e.pageY <= pageYoffset + pageYoffset - 180)
    {
      drag_triangle=true;
    }

    if(e.pageX >= 5  && e.pageX <=220
    &&e.pageY >= pageYoffset + pageYoffset -150 && e.pageY <= CANVAS.height -250)
    {
      drag_right_triangle=true;
    }

	if(e.pageX >= 5  && e.pageX <=220
    &&e.pageY >= pageYoffset + pageYoffset +60 && e.pageY <= CANVAS.height -60)
    {
      drag_rectangle=true;
    }

   old_x=e.pageX, old_y=e.pageY;
   e.preventDefault();
   return false;
 };


 var mouseUp=function(e){

   if(e.pageX >=800 && e.pageX <=1350
   && e.pageY >=150 && e.pageY<=900)
   {
     if(drag_right_triangle && game.level1)
     {
       drag_right_triangle = false;
       game.level1Complete = true;
       game.timer = false;
       game.score +=100 * game.timeActual;
    }
    if(drag_rectangle && game.level2)
    {
      drag_rectangle = false;
      game.level2Complete = true;
      game.timer = false;
      game.score +=100 * game.timeActual;
   }
   if(drag_triangle && game.level3)
   {
     drag_triangle = false;
     game.level3Complete = true;
     game.timer = false;
     game.score +=100 * game.timeActual;
   }
   if(drag_quad && game.level4)
   {
     drag_quad = false;
     game.level4Complete = true;
     game.timer = false;
     game.score +=100 * game.timeActual;
   }
 }
   drag_quad=false;
   drag_triangle = false;
   drag_right_triangle = false;
   drag_rectangle = false;
   LIBS.set_I4(MOVEMATRIX_QUAD);
   LIBS.set_I4(MOVEMATRIX_RIGHT_TRIANGLE);
   LIBS.set_I4(MOVEMATRIX_TRIANGLE);
   LIBS.set_I4(MOVEMATRIX_RECTANGLE);
   THETA = PHI = 0
 };

 var mouseMove=function(e) {
   if (!drag_quad && !drag_triangle && !drag_right_triangle && !drag_rectangle) return false;
   dX=(e.pageX-old_x)*2*Math.PI/CANVAS.width,
     dY=(e.pageY-old_y)*2*Math.PI/CANVAS.height;
   THETA+=dX;
   PHI+=dY;
   old_x=e.pageX, old_y=e.pageY;
   e.preventDefault();
 };

 CANVAS.addEventListener("mousedown", mouseDown, false);
 CANVAS.addEventListener("mouseup", mouseUp, false);
 CANVAS.addEventListener("mouseout", mouseUp, false);
 CANVAS.addEventListener("mousemove", mouseMove, false);

  /*========================= GET WEBGL CONTEXT ========================= */
  var GL;
  try {
    GL = CANVAS.getContext("experimental-webgl", {antialias: true});
  } catch (e) {
    alert("You are not webgl compatible :(") ;
    return false;
  }

  var shader_vertex_source="\n\
 attribute vec3 position;\n\
 uniform mat4 Pmatrix;\n\
 uniform mat4 Vmatrix;\n\
 uniform mat4 Mmatrix;\n\
 attribute vec3 color; //the color of the point\n\
 varying vec3 vColor;\n\
 void main(void) { //pre-built function\n\
 gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);\n\
 vColor=color;\n\
 }";

   var shader_fragment_source="\n\
 precision mediump float;\n\
 varying vec3 vColor;\n\
 void main(void) {\n\
 gl_FragColor = vec4(vColor, 1.);\n\
 }";

   var get_shader=function(source, type, typeString) {
     var shader = GL.createShader(type);
     GL.shaderSource(shader, source);
     GL.compileShader(shader);
     if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
       alert("ERROR IN "+typeString+ " SHADER : " + GL.getShaderInfoLog(shader));
       return false;
     }
     return shader;
   };

   var shader_vertex=get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
   var shader_fragment=get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

   var SHADER_PROGRAM=GL.createProgram();
   GL.attachShader(SHADER_PROGRAM, shader_vertex);
   GL.attachShader(SHADER_PROGRAM, shader_fragment);

   GL.linkProgram(SHADER_PROGRAM);

   var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
   var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
   var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

   var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
   var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

   GL.enableVertexAttribArray(_color);
   GL.enableVertexAttribArray(_position);

   GL.useProgram(SHADER_PROGRAM);


  /*========================= THE TRIANGLE ========================= */
  //POINTS :
  var triangle_vertex=[
    -3.5,0.2,1, //first summit -> bottom left of the viewport
    0,0,1,
    -2.7,0.2,1, //bottom right of the viewport
    1,1,0,
    -3.1,0.9,1,  //top right of the viewport
    1,0,0
  ];

  var right_triangle_vertex=[
    -3.5,-0.7,1, //first summit -> bottom left of the viewport
    0,0,1,
    -2.7,-0.7,1, //bottom right of the viewport
    1,1,0,
    -3.5,0.1,1,  //top right of the viewport
    1,0,0
  ];

  var right_triangle_vertex_wireframe=[
    0,-0.5,1, //first summit -> bottom left of the viewport
    0,0,1,
    0.8,-0.5,1, //bottom right of the viewport
    1,1,0,
    0,0.3,1,  //top right of the viewport
    1,0,0
  ];

  var quad_vertex=[
    -3.5,1,1, //first summit -> bottom left of the viewport
    0,0,1,
    -2.7,1,1, //bottom right of the viewport
    1,1,0,
    -3.5,1.7,1,  //top right of the viewport
    1,0,0,
    -2.7,1.7,1,
    1,1,1
  ];

  var rectangle_vertex=[
    -3.5,-1.5,1, //first summit -> bottom left of the viewport
    0,0,1,
    -2.6,-1.5,1, //bottom right of the viewport
    1,1,0,
    -3.5,-0.9,1,  //top right of the viewport
    1,0,0,
    -2.6,-0.9,1,
    1,1,1
  ];

  var RECTANGLE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, RECTANGLE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(rectangle_vertex),
  GL.STATIC_DRAW);


  var TRIANGLE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(triangle_vertex),
  GL.STATIC_DRAW);

  var RIGHT_TRIANGLE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, RIGHT_TRIANGLE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(right_triangle_vertex),
    GL.STATIC_DRAW);

  var RIGHT_TRIANGLE_VERTEX_WIREFRAME= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, RIGHT_TRIANGLE_VERTEX_WIREFRAME);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(right_triangle_vertex_wireframe),
    GL.STATIC_DRAW);

  var QUAD_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, QUAD_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(quad_vertex),
    GL.STATIC_DRAW);

  //FACES :
  var triangle_faces = [0,1,2];
  var TRIANGLE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(triangle_faces), GL.STATIC_DRAW);

  var right_triangle_faces = [0,1,2];
  var RIGHT_TRIANGLE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RIGHT_TRIANGLE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(right_triangle_faces), GL.STATIC_DRAW);

  var quad_faces = [0,1,2,3,2,1];
  var QUAD_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, QUAD_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(quad_faces),GL.STATIC_DRAW);

  var rectangle_faces = [0,1,2,3,2,1];
  var RECTANGLE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(rectangle_faces),GL.STATIC_DRAW);

  var rectangle_wireframe_faces = [2,0,1,3,1,2];
  var RECTANGLE_WIREFRAME_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_WIREFRAME_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(rectangle_wireframe_faces),GL.STATIC_DRAW);

  LIBS.translateZ(VIEWMATRIX, -6);
  /*========================= DRAWING ========================= */
  //GL.enable(GL.DEPTH_TEST);
  //GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.0, 0.0, 0.0, 0.0);
  //GL.clearDepth(1.0);

  var dom_Score=document.getElementById("Score");
  var dom_Timer=document.getElementById("Timer");
  var dom_TimeOUT=document.getElementById("TimeOUT");

  var dom_message=document.getElementById("Message");

  //var dom_retryButton = document.getElementById("retry");


  var animate=function(time) {
    if (!drag_quad && !drag_triangle && !drag_right_triangle)
    {
      dX*=AMORTIZATION, dY*=AMORTIZATION;
      THETA+=dX, PHI+=dY;
    }

    if(game.timer)
    {
     game.timeOut -= 1;
    }
    if(game.timeOut <= 0 && game.timeActual != 0)
    {
      game.timeOut = 60;
      game.timeActual -= 1;
      if(game.timeActual == 0)
      {
        dom_TimeOUT.innerHTML="<h1>TIME OUT</h1>";
      }
    }
    dom_Timer.innerHTML="<h1>Time :" + game.timeActual;
    dom_Score.innerHTML="<h1>Score :" + game.score ;

	//dom_retryButton.innerHTML="<h2>RETRY";



    if(drag_quad){
      LIBS.set_I4(MOVEMATRIX_QUAD);
      LIBS.translateX(MOVEMATRIX_QUAD, THETA);
      LIBS.translateY(MOVEMATRIX_QUAD, -PHI);
    }
    if(drag_triangle)
    {
      LIBS.set_I4(MOVEMATRIX_TRIANGLE);
      LIBS.translateX(MOVEMATRIX_TRIANGLE, THETA);
      LIBS.translateY(MOVEMATRIX_TRIANGLE, -PHI);
    }
    if(drag_right_triangle)
    {
      LIBS.set_I4(MOVEMATRIX_RIGHT_TRIANGLE);
      LIBS.translateX(MOVEMATRIX_RIGHT_TRIANGLE, THETA);
      LIBS.translateY(MOVEMATRIX_RIGHT_TRIANGLE, -PHI);
    }
	 if(drag_rectangle)
    {
      LIBS.set_I4(MOVEMATRIX_RECTANGLE);
      LIBS.translateX(MOVEMATRIX_RECTANGLE, THETA);
      LIBS.translateY(MOVEMATRIX_RECTANGLE, -PHI);
    }



    GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_QUAD);
    GL.bindBuffer(GL.ARRAY_BUFFER, QUAD_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(6),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(6),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, QUAD_FACES);
    if(!game.level4Complete || !game.gameOn)
    {
    GL.drawElements(GL.TRIANGLE_STRIP, 4, GL.UNSIGNED_SHORT, 0);
    }

    if(game.level4 && game.gameOn)
    {
      LIBS.set_I4(MOVEMATRIX_QUAD_WIREFRAME);
      LIBS.translateX(MOVEMATRIX_QUAD_WIREFRAME, 3.1);
      LIBS.translateY(MOVEMATRIX_QUAD_WIREFRAME, -1.3);
      GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_QUAD_WIREFRAME);
      GL.bindBuffer(GL.ARRAY_BUFFER, QUAD_VERTEX);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(6),0) ;
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(6),3*4) ;
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_WIREFRAME_FACES);
      if(game.level4Complete)
      {
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_FACES);
        GL.drawElements(GL.TRIANGLE_STRIP, 4, GL.UNSIGNED_SHORT, 0);
      }
      else
      {
        GL.drawElements(GL.LINE_LOOP, 4, GL.UNSIGNED_SHORT, 0);
      }
    }

	  GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RECTANGLE);
    GL.bindBuffer(GL.ARRAY_BUFFER, RECTANGLE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(6),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(6),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_FACES);
    if(!game.level2Complete || game.level3 || game.level4)
    {
     GL.drawElements(GL.TRIANGLE_STRIP, 4, GL.UNSIGNED_SHORT, 0);
    }

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_TRIANGLE);
    GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(6),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(6),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
    if(!game.level3Complete ||game.level4 )
    {
      GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);
    }

    if(game.level3 && game.gameOn)
    {
      LIBS.set_I4(MOVEMATRIX_TRIANGLE_WIREFRAME);
      LIBS.translateX(MOVEMATRIX_TRIANGLE_WIREFRAME, 3.1);
      LIBS.translateY(MOVEMATRIX_TRIANGLE_WIREFRAME, -0.5);
      GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_TRIANGLE_WIREFRAME);
      GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(6),0) ;
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(6),3*4) ;
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
      if(game.level3Complete && !game.level4)
      {
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_FACES);
        GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);
      }
      else
      {
        if(!game.level4)
        {
        GL.drawElements(GL.LINE_LOOP, 3, GL.UNSIGNED_SHORT, 0);
        }
      }
    }

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RIGHT_TRIANGLE);
    GL.bindBuffer(GL.ARRAY_BUFFER, RIGHT_TRIANGLE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(6),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(6),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RIGHT_TRIANGLE_FACES);
    if(!game.level1Complete || game.level2 || game.level3 || game.level4 )
    {
     GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);
    }

    if(game.level2 && game.gameOn)
    {
      LIBS.set_I4(MOVEMATRIX_RECTANGLE_WIREFRAME);
      LIBS.translateX(MOVEMATRIX_RECTANGLE_WIREFRAME, 3.1);
      LIBS.translateY(MOVEMATRIX_RECTANGLE_WIREFRAME, 1.2);
      GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RECTANGLE_WIREFRAME);
      GL.bindBuffer(GL.ARRAY_BUFFER, RECTANGLE_VERTEX);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(6),0) ;
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(6),3*4) ;
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_WIREFRAME_FACES);
      if(game.level2Complete && !game.level3)
      {
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_FACES);
        GL.drawElements(GL.TRIANGLE_STRIP, 4, GL.UNSIGNED_SHORT, 0);
      }
      else
      {
        if(!game.level3)
        {
        GL.drawElements(GL.LINE_LOOP, 4, GL.UNSIGNED_SHORT, 0);
        }
      }
    }

    if(game.level1 && game.gameOn)
    {
      GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RIGHT_TRIANGLE_WIREFRAME);
      GL.bindBuffer(GL.ARRAY_BUFFER, RIGHT_TRIANGLE_VERTEX_WIREFRAME);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(6),0) ;
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(6),3*4) ;
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RIGHT_TRIANGLE_FACES);
      if(game.level1Complete && !game.level2)
      {
        GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);
      }
      else
      {
        if(!game.level2)
        {
        GL.drawElements(GL.LINE_LOOP, 3, GL.UNSIGNED_SHORT, 0);
        }
      }
    }
    GL.flush();
    window.requestAnimationFrame(animate);
  };
    animate();
  //
};

var myFunction = function ()
{
	window.close();
}
