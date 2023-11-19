
class DebugTool{
    begin(props){
        console.log("DebugTool->begin", props.x, props.y);
    }

    drag(props){
        console.log("DebugTool->drag", props.x, props.y);
        const ctx = props.canvas.getContext("2D");
        props.paper.renderCircle(props.x, props.y)
    }

    end(props){
        console.log("DebugTool->end", props.x, props.y);
    }
}

class InkTool{
    begin(x,y,element){

    }

    drag(x,y,element){

    }

    end(x,y,element){

    }
}

class Paper{
    constructor(element){
        this.element = element;
        this.element.classList.add("paper-viewport")

        // set viewport style
        this.element.style.display="flex";
        this.element.style.alignItems="center";
        this.element.style.justifyContent="center";
        this.element.style.backgroundColor="rgb(224, 224, 224)";

        // create page element
        this.page = document.createElement("div");
        this.page.classList.add("paper-page")
        this.page.style.display = "block"
        this.page.style.flexGrow = 1;
        this.page.style.maxHeight = "100%"
        this.page.style.aspectRatio = "210 / 297";
        this.page.style.margin="100px";
        this.page.style.backgroundColor = "white";
        this.element.appendChild(this.page)

        // create drawing canvas
        this.canvas = document.createElement("canvas");
        this.canvas.style.border = "1px solid red";
        this.page.appendChild(this.canvas)
        this.resize_canvas(2480, 3508)
        this.renderCircle(100, 100);

        this.canvas.style.width="100%";
        this.canvas.style.height="100%";

        // handle tool
        this.currentTool = new DebugTool();
        this.initToolHandlers();
    }

    initToolHandlers(){
        // Handle current tool
        let downOffsetX = undefined;
        let downOffsetY = undefined;
        const toolBegin = (event)=>
        {
            downOffsetX = event.offsetX;
            downOffsetY = event.offsetY;
            this.currentTool.begin({
                x: event.offsetX,
                y: event.offsetY,
                xBegin: downOffsetX,
                yBegin: downOffsetY,
                canvas: this.canvas,
                paper: this
            });
        }
        
        let i=0;
        const toolDrag = (event)=>
        {
            i++;
            this.currentTool.drag({
                x: event.offsetX,
                y: event.offsetY,
                xBegin: downOffsetX,
                yBegin: downOffsetY,
                canvas: this.canvas,
                paper: this
            });
        }
        
        const toolEnd = (event)=>
        {
            this.currentTool.end({
                x: event.offsetX,
                y: event.offsetY,
                xBegin: downOffsetX,
                yBegin: downOffsetY,
                paper: this,
                canvas: this.canvas
            });
            this.page.removeEventListener("pointermove", toolDrag);
            this.page.removeEventListener("pointerup", toolEnd);
        }
        
        this.page.addEventListener("pointerdown", (e)=>{
            console.log("dasdadas")
            toolBegin(e);
            this.page.addEventListener("pointermove", toolDrag, { passive: true });
            this.page.addEventListener("pointerup", toolEnd, { passive: true });
            // e.preventDefault();
        }, { passive: true })
    }

    renderCircle(x, y){
        const ctx = this.canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(x, y, 50, 0, 2 * Math.PI);
        ctx.stroke();
    }

    resize_canvas(w, h){
        this.canvas.width=w;
        this.canvas.height=h;
    }
}

window.onload = ()=>{
    new Paper(document.getElementById("paper"))
}