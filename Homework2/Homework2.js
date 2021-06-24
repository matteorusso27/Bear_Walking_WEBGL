"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )

];

//Scene Indices
var torsoId = 0;
var torso2Id=14;
var torso3Id=15
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var tailId = 11;

var trunkId = 12;
var leavesId = 13;

//Scene Object's parameters
//Torso
var torsoHeight = 6.5;
var torsoWidth = 3.5;
// Arms
var upperArmHeight = 3.3;
var lowerArmHeight = 1.5;
var upperArmWidth  = 1.4;
var lowerArmWidth  = 0.7;
//Legs
var upperLegWidth  = 1.5;
var lowerLegWidth  = 0.9;
var lowerLegHeight = 1.5;
var upperLegHeight = 3;
//Head
var headHeight = 1.8;
var headWidth = 2.3;
//Tail
var tailHeight=2.1;
var tailWidth = 0.8;
//Trunk
var trunkWidth = 4.8;
var trunkHeight = 22.0;
//Leaves
var leavesWidth =13.2;
var leavesHeight = 8.3;

var numNodes = 14;
var numAngles = 11;
var angle = 0;

var theta = [70, 0, 80, 50, 50, 50, 80, 40, 50, 40, 0, -30, -30, 20, 0, 0];

var theta_backup = [70, 0, 80, 50, 50, 50, 80, 40, 50, 40, 0, -30, -30, 20, 0, 0];

//translation matrix for the bear
var bear_position = [-16.0, -15, 0.0];

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//This parameter is used when running the code on Opera browser
//Since Opera has a different refresh rate than Chrome or Firefox, some bear
//parameters dealing with the animation must be changed
var isOpera=false;


//Texture Stuff

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var texCoordsArray=[];

var image1,image2,image3,image4;

var isBodyTexture_active=true;

var isHeadTexture_active=false;

var isWoodTexture_active=false;

var isLeavesTexture_active=false;

var texture1,texture2,texture3,texture4;

function configureTexture() {

  texture1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  texture2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  texture3 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture3);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image3);
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,gl.RGBA, gl.UNSIGNED_BYTE, image3);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  texture4 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture4);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image4);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


}

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}

function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:
    case torso2Id:
    case torso3Id:

      m = translate(bear_position[0],bear_position[1],bear_position[2]);
      m = mult(m,rotate(theta[torsoId], vec3(1, 0, 0) ));
      m = mult(m,rotate(theta[torsoId], vec3(0, 0, 1) ));
      m = mult(m,rotate(theta[torso2Id], vec3(0,0,1)  ));
      m=mult(m,rotate(theta[torso3Id], vec3(1,0,0)));

    figure[torsoId] = createNode( m, torso, null, headId );

    break;

    case headId:
    case head1Id:
    case head2Id:

    m = translate(0.0, 4.0, 0.0);
	  m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
	  m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;


    case leftUpperArmId:

    m = translate(-(1.0 +upperArmWidth), 3.0, 0.0);
	  m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightUpperArmId:

    m = translate(1.0+upperArmWidth,3.0, 0.0);
	  m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftUpperLegId:

    m = translate(-(1.0+upperLegWidth), -3.0, 0.0);
	  m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightUpperLegId:

    m = translate(1.0+upperLegWidth, -3.0, 0.0);
	  m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

    case tailId:

    m = translate(0.0, -4.0, 0.0);
	  m = mult(m, rotate(theta[tailId], vec3(1, 0, 0)));
    figure[tailId] = createNode( m, tail, null, null);
    break;

    case trunkId:

    m = translate(12.5, -17.5, -1.0);
	  m = mult(m, rotate(theta[trunkId], vec3(1, 0, 0)));
    m=mult(m,rotate(theta[trunkId],vec3(0,1,0)));
    figure[trunkId] = createNode( m, trunk, null, leavesId);
    break;

    case leavesId:

    m = translate(5.0, 2.5, 0.0);
	  m = mult(m, rotate(theta[leavesId], vec3(0, 1, 0)));
    figure[leavesId] = createNode( m, leaves, null, null);
    break;

    }

}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

//When drawing the cubes, we also want to say what texCoordinate attach to them,
//this function encapsulates this concept by sending the boolean parameters to the
//fragment shader. Then, the shader will use the right textcoordinates for each face of the cube
function flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                              isLeavesTexture_active){
    gl.uniform1f(gl.getUniformLocation(program, "uIsBodyTexture_active"), isBodyTexture_active);
    gl.uniform1f(gl.getUniformLocation(program, "uIsHeadTexture_active"), isHeadTexture_active);

    gl.uniform1f(gl.getUniformLocation(program, "uIsWoodTexture_active"), isWoodTexture_active);
    gl.uniform1f(gl.getUniformLocation(program, "uIsLeavesTexture_active"), isLeavesTexture_active);
}
function torso() {
    //Specify the desired texture
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);

    instanceMatrix = mult(modelViewMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    //Specify the desired texture, the head has a separate texture
    isBodyTexture_active=false;
    isHeadTexture_active=true;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {
    isBodyTexture_active=true;
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {
    isBodyTexture_active=true;
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {
    isBodyTexture_active=true;
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {
    isBodyTexture_active=true;
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {
    isBodyTexture_active=true;
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    isBodyTexture_active=true;
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    isBodyTexture_active=true;
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	  instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {
    isBodyTexture_active=true;
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	  instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail(){
    isBodyTexture_active=true;
    isHeadTexture_active=false;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

}

function trunk(){
    isBodyTexture_active=false;
    isHeadTexture_active=false;
    isWoodTexture_active=true;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(5.0, 0.5 * trunkHeight, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale(trunkWidth, trunkHeight, trunkWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leaves(){
    isBodyTexture_active=false;
    isHeadTexture_active=false;
    isWoodTexture_active=false;
    isLeavesTexture_active=true;
    flagsToFragmentShader(isBodyTexture_active, isHeadTexture_active,isWoodTexture_active,
                                  isLeavesTexture_active);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5+trunkHeight, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale(leavesWidth, leavesHeight, leavesWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     texCoordsArray.push(texCoord[0]);
     pointsArray.push(vertices[b]);
     texCoordsArray.push(texCoord[1]);
     pointsArray.push(vertices[c]);
     texCoordsArray.push(texCoord[2]);
     pointsArray.push(vertices[d]);
     texCoordsArray.push(texCoord[3]);
}

function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 3, 7, 6, 2 );
    quad( 3, 0, 4, 7 );
    quad( 2, 6, 5, 1 );
    quad( 5, 4, 7, 6 );
    quad( 5, 4, 0, 1 );
}

//Control parameters when dealing with the movement of the bear
//The Booleans control the different steps of the animation
var start = false;
var startScratching=false;
var over = false;

var rotation = 1.5;
var speed = 0.1;
var turn_speed=1.5;
var time = 8.5;
var up_down_bear = 0.02;
var leg_stretching=0.4;

//This
var start_counting;

var y = 0.75;

var get_back = 0.023;
var get_up_speed = 1;
var scratching_speed = 0.01;
var tail_movement = 0.3;

function startAnimation() {
    //The bear keeps walking until it gets close to the tree
    if(bear_position[0] < 8.5)
        bear_position[0]+=speed;
    else{
      //It then turns around
      if (theta[torso2Id] < 180){
          theta[torso2Id]+=turn_speed;
          bear_position[0]+=get_back;
      }else{
        start=false;
        startScratching=true;
      }
    }
        //Walking Parameters
        theta[leftUpperArmId]-=rotation;
        theta[leftLowerArmId]+=rotation;
        theta[rightUpperArmId]+=rotation;
        theta[leftUpperLegId]-=rotation;
        theta[rightUpperLegId]+=rotation;
        theta[tailId]+= tail_movement;
        if (theta[leftUpperArmId] < 40 || theta[rightUpperArmId] < 35) {
          rotation = -rotation;
          tail_movement=-tail_movement;
        }

      //Refresh each node
      initNodes(leftUpperArmId);
      initNodes(rightUpperArmId);
      initNodes(rightUpperLegId);
      initNodes(leftUpperLegId);
      initNodes(tailId);
      initNodes(torso2Id);
      initNodes(torsoId);
}

function Scratching(){
      //The over boolean checks if enough time is passed from the
      //animation of Scratching
      if(!over){

        //The bear gets up
        if (theta[torso3Id] > -87){
          theta[torso3Id]-=get_up_speed;
          theta[leftUpperArmId]-=0.02;
          theta[rightUpperArmId]+=0.5;
          theta[leftUpperLegId]-=0.125;
          theta[rightUpperLegId]+=0.125;
          theta[headId]-=0.2;
          bear_position[0]+=0.02;
          bear_position[1]+=scratching_speed;
          //When the bear will be in the right position, we start
          //counting
          start_counting = new Date().getTime();
        }
        else {
          //Start animation of Scratching
          bear_position[1]+=up_down_bear;
          theta[leftUpperArmId]+=leg_stretching;
          theta[leftUpperLegId]+=leg_stretching;
          theta[rightUpperLegId]+=leg_stretching;
          theta[rightUpperArmId]+=leg_stretching;
          theta[leftLowerArmId]+=leg_stretching;
          theta[rightLowerArmId]+=leg_stretching;
          theta[leftLowerLegId]+=leg_stretching;
          theta[rightLowerLegId]+=leg_stretching;

          if ( bear_position[1] > -13.6 || bear_position[1] < -14.2 ){
            leg_stretching=-leg_stretching;
            up_down_bear=-up_down_bear;
          }
          var end_moment = new Date().getTime();
          var distance = end_moment - start_counting;
          var seconds = Math.floor((distance % (1000 * 60)) / 1000);
          //If enough time has passed, the bear will stop scratching
          if (seconds >time){
            over =true;
          }
        }
      }
      else{
        //The Bear stops scratching and it gets on its legs
        if (theta[torso3Id] < 0) {
          theta[torso3Id]+=0.75;
          bear_position[0]-=0.04;
          if (theta[rightUpperArmId] > theta_backup[rightUpperArmId]){

            //Here, the parameters are different due to the browser refresh rate
            if(isOpera){
              theta[leftUpperArmId]-=y-0.6;
              theta[leftLowerArmId]+=0.15;
              theta[rightUpperArmId]-=y;
              theta[rightLowerArmId]-=y-0.5;

              theta[leftUpperLegId]+=0.35;
              theta[leftLowerLegId]-=1.0;
              theta[rightUpperLegId]+=0.6;
              theta[rightLowerLegId]-=1.0;

              theta[headId]+=0.2;
              bear_position[1]-=0.01;
            }
            else{
              theta[leftUpperArmId]-=y-0.6;
              theta[leftLowerArmId]+=0.15;
              theta[rightUpperArmId]-=y;
              theta[rightLowerArmId]+=0.2;

              theta[leftUpperLegId]+=0.05;
              theta[leftLowerLegId]+=0.01;
              theta[rightUpperLegId]-=0.1;
              theta[rightLowerLegId]-=0.05;

              theta[headId]+=0.2;
              bear_position[1]-=0.01;
            }
          }
          else{
            //The bear will the return on its feet with the same parameters
            // it had when start walking at the beginning of the animation
            theta[leftUpperArmId]= theta_backup[leftUpperArmId];
            theta[rightUpperArmId]=theta_backup[rightUpperArmId];
            theta[leftLowerArmId]=theta_backup[leftLowerArmId];
            theta[rightLowerArmId]=theta_backup[rightLowerArmId];

            theta[rightUpperLegId]=theta_backup[rightUpperLegId];
            theta[leftUpperLegId]=theta_backup[leftUpperLegId];
            theta[rightLowerLegId]=theta_backup[rightLowerLegId];
            theta[leftLowerLegId]=theta_backup[leftLowerLegId];
          }
        }
        else{
          // And then it will go away
          if (bear_position[0] > -30){
              bear_position[0]-=speed;

              theta[leftUpperArmId]+=rotation;
              theta[leftLowerArmId]-=rotation;
              theta[rightUpperArmId]-=rotation;
              theta[leftUpperLegId]+=rotation;
              theta[rightUpperLegId]-=rotation;
              if (theta[leftUpperArmId] > 90 || theta[rightUpperArmId] > 75) rotation = -rotation;
        } else {
              startScratching=false;
          }
        }
      }
      //Refresh the nodes
      initNodes(torso3Id);
      initNodes(leftUpperArmId);
      initNodes(rightUpperArmId);
      initNodes(leftLowerArmId);
      initNodes(rightLowerArmId);

      initNodes(leftUpperLegId);
      initNodes(rightUpperLegId);
      initNodes(leftLowerLegId);
      initNodes(rightLowerLegId);

      initNodes(headId);
}

function detect_browser() {
  if((navigator.userAgent.indexOf("Opera")!=-1 || navigator.userAgent.indexOf('OPR')) != -1 ){
      isOpera=true;
  }
  else{
      speed = speed/2;
      turn_speed = turn_speed/2;
      rotation = rotation/2;
      get_back= get_back/4;
      get_up_speed = get_up_speed/2;
      scratching_speed=scratching_speed/2;
  }
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    document.getElementById("gl-canvas").style.background = "url('forest.jpg')";
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-25.0,25.0,-25.0, 25.0,-25.0,25.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);


    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    //Get the images loaded in the html file
    image1=document.getElementById("body_tex");
    image2=document.getElementById("head_tex");
    image3=document.getElementById("wood_tex");
    image4=document.getElementById("leaves_tex");

    configureTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(gl.getUniformLocation(program, "ubodyTexmap"), 0);

  	gl.activeTexture(gl.TEXTURE1);
  	gl.bindTexture(gl.TEXTURE_2D, texture2);
  	gl.uniform1i(gl.getUniformLocation(program, "uheadTexmap"), 1);

    gl.activeTexture(gl.TEXTURE2);
  	gl.bindTexture(gl.TEXTURE_2D, texture3);
  	gl.uniform1i(gl.getUniformLocation(program, "uwoodTexmap"), 2);

    gl.activeTexture(gl.TEXTURE3);
  	gl.bindTexture(gl.TEXTURE_2D, texture4);
  	gl.uniform1i(gl.getUniformLocation(program, "uleavesTexmap"), 3);

    //When the button is clicked, the anmation start
    //It is also possible to stop the animation at any time
    document.getElementById("animation_button").onclick = function() {

      if(!start && !startScratching){
        document.getElementById("animation_button").innerText= 'Stop Animation';
        if(!over)
          start=true;
        else{
          startScratching = true;
        }
      }
      else {
        document.getElementById("animation_button").innerText= 'Restart Animation';
        start=false;
        startScratching=false;
      }
    }

    detect_browser();

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}


var render = function() {
        if(start) startAnimation();
        else if (startScratching) {
          Scratching();
        }
        gl.clear( gl.COLOR_BUFFER_BIT );
        traverse(torsoId);
        traverse(trunkId);
        //By default, we want the body texture always active, since the
        //bear body parts are predominant in the scene
        isBodyTexture_active=true;
        requestAnimationFrame(render);
}
