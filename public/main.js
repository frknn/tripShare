var elements = document.querySelectorAll("li.aclass");
var btn = document.getElementById("disableEL");
var elements2 = document.getElementsByClassName("col-xl-1");

function getRandomColor()
{
    this.style.background = '#'+Math.random().toString(16).substr(-6);
    this.style.color=this.style.background;
}


for(var i = 0; i<elements.length; i++)
{
    elements[i].addEventListener("mouseover",getRandomColor);
}

function elRemover()
{
    for(var i = 0; i<elements.length; i++)
    {
        elements[i].removeEventListener("mouseover",getRandomColor);
    }   
}


for(var i = 0; elements2.length;i++)
{
    elements2[i].addEventListener("mouseover",getRandomColor);
}

btn.addEventListener("click",elRemover);


