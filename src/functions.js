
export function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined" ) {
      stroke = true;
    }
    if (typeof radius === "undefined") {
      radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.strokeStyle='black';
      ctx.stroke();
    }
    if (fill) {
      ctx.fill();
    }        
  }
export function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function weed(){
    console.log("weed");console.log("weed");console.log("weed");
    console.log("weed");console.log("weed");console.log("weed");
    console.log("weed");console.log("weed");console.log("weed");
    console.log("weed");console.log("weed");console.log("weed");
    console.log("weed");console.log("weed");console.log("weed");
}