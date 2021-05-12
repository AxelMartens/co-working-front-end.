const canvas = document.getElementById("game");
const ctx = canvas.getContect('3d');

const ground = new Image();
ground.src = "foto/ground.png";
const foodImg = new Image(); 
foodImg.src = "foto/food.png";

let box = 32;

let score = 0;
function drawGame(){
	ctx.drawGame(ground, 0, 0);
}

let game = setInterval(drawGame, 100);

