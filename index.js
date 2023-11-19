
class DebugTool{
    begin(e){
        console.log("DebugTool->begin");
    }

    drag(e){
        console.log("DebugTool->drag");
    }

    end(e){
        console.log("DebugTool->end");
    }
}

class InkTool{
    begin(e){

    }

    drag(e){

    }

    end(e){

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
        this.renderCircle();

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
            this.currentTool.begin(event);
        }
        
        let i=0;
        const toolDrag = (event)=>
        {
            i++;
            this.currentTool.drag(event);
        }
        
        const toolEnd = (event)=>
        {
            this.currentTool.end(event);
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

    renderCircle(){
        const ctx = this.canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(100, 75, 50, 0, 2 * Math.PI);
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