import {Vertex, Stroke} from "./stroke.js"


class DebugTool{
    begin(props){
        console.log("DebugTool->begin", props.x, props.y);
    }

    drag(props){
        console.log("DebugTool->drag", props.x, props.y);
        props.paper.renderCircle(props.x, props.y)
    }

    end(props){
        console.log("DebugTool->end", props.x, props.y);
    }
}

class InkTool{
    begin(args)
    {
        const x = args.x;
        const y = args.y;
        this.current_stroke = new Stroke([{x, y, t:Date.now(), d: 0}]);

    }

    drag(args){
        const x = args.x;
        const y = args.y;
        this.current_stroke.add(x, y, Date.now());

    }

    end(args){
        const x = args.x;
        const y = args.y;
        this.render(args.paper, 0, 1);
    }

    render(paper, start=0.0, stop=1.0)
    {
        // calculate stroke length
        // const length = calc_stroke_length(stroke);
        const ctx = paper.canvas.getContext("2d");
        const stroke = this.current_stroke;
        console.log(stroke);
        if(stroke.vertices.length<3){
            return;
        }
        const count = stroke.vertices.length;
        const start_idx = Math.floor( (count-1)*start );
        const end_idx = Math.floor( (count-1)*stop );
        const segment_length = stroke.vertices[end_idx].l-stroke.vertices[start_idx].l;

        const resolution=1.0;
        console.log(segment_length)

        //const spline = stroke;
        const spline=stroke.interpolated(segment_length*resolution, start, stop);

        for(let i=1;i<spline.vertices.length;i++){
            const P0 = spline.vertices[i-1];
            const P1 = spline.vertices[i];
            const l = Math.sqrt( (P0.x-P1.x)**2 + (P0.y-P1.y)**2 );
            if(l>0){
                const dt = P1.t/P0.t;
                const lineWidth=dt/(l+1)
                ctx.lineWidth = Math.pow(lineWidth,0.6)*3+0.0;
                ctx.lineCap = "butt";
                ctx.beginPath();

                ctx.moveTo(P0.x, P0.y);
                ctx.lineTo(P1.x, P1.y);
                ctx.stroke();
            }
        }
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

        // create drawing canvas element
        this.canvas = document.createElement("canvas");
        this.canvas.style.border = "1px solid red";
        this.page.appendChild(this.canvas)
        this.resize_canvas(2480*0.25, 3508*0.25)
        this.renderCircle(100, 100);

        this.canvas.style.width="100%";
        this.canvas.style.height="100%";

        // handle tool
        this.currentTool = new InkTool();
        this.initToolHandlers();
    }

    initToolHandlers(){
        // Handle current tool
        let xBegin = undefined;
        let yBegin = undefined;
        const toolBegin = (event)=>
        {
            this.page.addEventListener("pointermove", toolDrag, { passive: true });
            this.page.addEventListener("pointerleave ", toolEnd, { passive: true })
            this.page.addEventListener("pointerup", toolEnd, { passive: true });
            const {x,y} = this.mapMousePosToPaper(event);
            xBegin = x;
            xBegin = y;
            this.currentTool.begin({
                x: x,
                y: y,
                xBegin: xBegin,
                yBegin: yBegin,
                paper: this
            });
        }
        
        let i=0;
        const toolDrag = (event)=>
        {
            const {x,y} = this.mapMousePosToPaper(event);
            this.currentTool.drag({
                x: x,
                y: y,
                xBegin: xBegin,
                yBegin: yBegin,
                paper: this
            });
        }
        
        const toolEnd = (event)=>
        {
            this.page.removeEventListener("pointermove", toolDrag);
            this.page.removeEventListener("pointerleave", toolEnd);
            this.page.removeEventListener("pointerup", toolEnd);

            const {x,y} = this.mapMousePosToPaper(event);
            this.currentTool.end({
                x: x,
                y: y,
                xBegin: xBegin,
                yBegin: yBegin,
                paper: this,
            });


        }
        
        this.page.addEventListener("pointerdown", (e)=>{
            toolBegin(e);
            // e.preventDefault();
        }, { passive: true })
    }

    mapMousePosToPaper(event){
        const x = event.offsetX / this.canvas.clientWidth * this.canvas.width;
        const y = event.offsetY / this.canvas.clientHeight * this.canvas.height;
        return {x:x,y:y}
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