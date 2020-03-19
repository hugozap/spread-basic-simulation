
const PEOPLE = 1200;
const INITIALLY_INFECTED = 3;
const DANGER_DISTANCE = 10;
const CHANCE_OF_INFECTION_WHEN_CLOSE = 0.01;
const WALK_SPEED = 0.3;
const NUMBER_OF_CONTAINERS = 50;
window.CARE_FACTOR = 0.6;


const BUILDING_WALL_WIDTH = 6

let users = []
let buildings = []

function randomPos(){
  return {
    x: Math.random()*400,
    y: Math.random()*400,
  }
}


function moveTowardsTarget(u, speed){
  //If user cares about quarantine check bounds
  const f = Math.random();
  
  const userDoesntCare = !u.disciplined;
  
 
    if(u.position.x < u.target.x){
      let collision = buildingCollisionRight(u) ;
      if(!collision || ( collision === u.building && userDoesntCare))
        u.position.x += speed;
      else
        u.target.x -= Math.random()*200;
    }else if(u.position.x > u.target.x) {
      let collision = buildingCollisionLeft(u) ;
      if(!collision || ( collision === u.building  && userDoesntCare))
        u.position.x -=speed;
      else
        u.target.x += Math.random()*200;
    }
  
  if(u.position.y > u.target.y){
      let collision = buildingCollisionUp(u) ;
      if(!collision || ( collision === u.building  && userDoesntCare))
        u.position.y -= speed;
       else
        u.target.y += Math.random()*200;
    }else if(u.position.y < u.target.y) {
      let collision = buildingCollisionDown(u) ;
      if(!collision || ( collision === u.building  && userDoesntCare))
        u.position.y +=speed;
      else
        u.target.y -= Math.random()*200;

    }
  
  //If really close to target pick another random one
  if(Math.abs(u.position.y -  u.target.y) < 5 &&
     Math.abs(u.position.x -  u.target.x) < 5){
      u.target = randomPos();
  }
  
  //Set zone for performance collision comparison
  //Zones are 50 x 50
  setUserZone(u);
}

function buildingCollisionUp(u){

  for(let i = 0 ; i<buildings.length ; i++){
    const w = buildings[i];
      
    if(u.position.x < w.x || u.position.x > w.right)
      continue;
      
    if(u.position.y > w.y && u.position.y - WALK_SPEED <= w.y + BUILDING_WALL_WIDTH){
        return w;
    }
    
    if(u.position.y > w.bottom && u.position.y - WALK_SPEED <= w.bottom + BUILDING_WALL_WIDTH)      {
        return w;
    }
  }
  return null;
}

function buildingCollisionDown(u){

  for(let i = 0 ; i<buildings.length ; i++){
    const w = buildings[i];
    
      
    if(u.position.x < w.x || u.position.x > w.right)
      continue;
      
    if(u.position.y < w.y && u.position.y  + WALK_SPEED >= w.y - BUILDING_WALL_WIDTH){
        return w;
    }
    
    if(u.position.y < w.bottom && u.position.y + WALK_SPEED >= w.bottom- BUILDING_WALL_WIDTH)      {
        return w;
    }
  }
  return null;
}

function buildingCollisionLeft(u){

  for(let i = 0 ; i<buildings.length ; i++){
    const w = buildings[i];
    
    
      
      
     if(u.position.y < w.y || u.position.y > w.bottom)
        continue;
      
      
    if(u.position.x > w.x && u.position.x - WALK_SPEED <= w.x + BUILDING_WALL_WIDTH){
        return w;
    }
    
    if(u.position.x > w.right && u.position.x - WALK_SPEED <= w.right + BUILDING_WALL_WIDTH)       {
        return w;
    }
  }
  return null;
}

function buildingCollisionRight(u){

  for(let i = 0 ; i<buildings.length ; i++){
    const w = buildings[i];
    
    
      
    if(u.position.y < w.y || u.position.y > w.bottom)
        continue;
        
    if(u.position.x < w.right && u.position.x + WALK_SPEED >= w.right - BUILDING_WALL_WIDTH){
        return w;
    }
    
    if(u.position.x < w.x && u.position.x + WALK_SPEED >= w.x - BUILDING_WALL_WIDTH)       {
        return w;
    }
  }
  return null;
}

function setUserZone(u){
  u.zone = {};
  u.zone.x = Math.round(map(u.position.x, 0, 400, 0, 20));
  u.zone.y = Math.round(map(u.position.y, 0, 400, 0, 20));
  
}

function infectSomeUsers(){
  for(var i=0;i<INITIALLY_INFECTED;i++){
    users[i].infected = true;
  }
}

function closeEnough(u1,u2){

  return Math.abs(u1.position.x-u2.position.x) < DANGER_DISTANCE && Math.abs(
    u1.position.y - u2.position.y) < DANGER_DISTANCE
}


function getUsersInSameZone(u){
  return users.filter(u2 => u2.zone.x === u.zone.x && u2.zone.y === u.zone.y);
}

function checkForCollisions(){
  users.forEach(u => {
      const usersInZone = getUsersInSameZone(u);
      usersInZone.forEach(u2 => {
          if(u != u2){
            if(closeEnough(u, u2) && Math.random() < CHANCE_OF_INFECTION_WHEN_CLOSE){
              
              u.infected = u.infected || u2.infected
              u2.infected = u.infected
            }
          }
      });
  });
}

function setup() {
  createCanvas(400, 400);
  init();
  //changeTargetEveryFewSeconds();
  document.querySelector('#careSlider').addEventListener('change',(ev)=>{
    window.CARE_FACTOR = Number(ev.target.value)/10.;
    console.log('CARE_FACTOR', window.CARE_FACTOR);
    //reset;
    init();
  })
}


function init(){
  buildings = [];
  users = [];
  
  
  createContainers();
  console.log(window.CARE_FACTOR);

  for(i=0;i<PEOPLE;i++){
    
    let posInBuilding = randomPosInBuilding();

    const u = {
      infected:false,
      position:posInBuilding,
      building: posInBuilding.building,
      target: randomPos(),
      disciplined: Math.random() < (window.CARE_FACTOR)
    }
    setUserZone(u);
    users.push(u);
  }
  
  infectSomeUsers();
}




function randomPosInBuilding(){
  
  const ix = Math.floor(Math.random()* buildings.length);
  const w = buildings[ix];
  
  return {
    x: w.x + Math.random()*w.width,
    y: w.y + Math.random()*w.height,
    building: w
  }
}



function createContainers(){
  
  
  const points = [];
  for(let i = 0 ;i< NUMBER_OF_CONTAINERS ; i++){
    //Add random buildings
    const p = [
      Math.random()*400,
      Math.random()*400,
    ]
    points.push(p);
    
  }
  
 const d = d3.Delaunay.from(points);
 const polys = d.trianglePolygons();
  //Lets use the delunay triangle points to create our container buildings
  
 for(let p of polys){
   const wall = getContainerInPolygon(p);
   buildings.push(wall);
 }

}

function getContainerInPolygon(p) {
  const centroid = d3.polygonCentroid(p);
  const l = d3.polygonLength(p);
  
  const minX = p.reduce((prev,cur)=>{
    return Math.min(prev, cur[0])
  },p[0][0]);
  
  const minY = p.reduce((prev,cur)=>{
    return Math.min(prev, cur[1])
  },p[0][1]);
  
  
  const maxX = p.reduce((prev,cur)=>{
    return Math.max(prev, cur[0])
  },p[0][0]);
  
   const maxY = p.reduce((prev,cur)=>{
    return Math.max(prev, cur[1])
  },p[0][1]);

  const w = Math.max((maxX - minX) / 2.5, 10);
  const h = Math.max((maxY - minY) / 2.5, 10);
    
  const x = centroid[0] - w/2
  const y = centroid[1] - h/2
  
  return {
    x: x ,
    y: y,
    width: w,
    height: h,
    right: x + w,
    bottom: y + h
  }
  
  
}



function draw() {
  background('lightgrey');

  
  
  fill(255,240,100,255);
  stroke('black');
  strokeWeight(2);
    buildings.forEach(w => {
    
    rect(w.x, w.y, w.width, w.height);
  });
  
  strokeWeight(2);
  
  users.forEach(u => {
     fill(u.infected ? 'red' :'fff');
     stroke(u.infected ? 'red' :'blue'); 
     rect(u.position.x, u.position.y, 1,1);
     //Avanzar hacia target
     moveTowardsTarget(u, WALK_SPEED);

  });
  checkForCollisions();
}