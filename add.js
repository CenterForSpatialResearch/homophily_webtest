var svg = d3.select("#chart1").append("svg")
    .attr("width",window.innerWidth)
    .attr("height",window.innerHeight)
var width = +svg.attr("width")
var height = +svg.attr("height")

var distance = 10
var strength = -10
    
var size = 100

var thresholdStart = .5
var threshold = .9
    
var groups = 2
var friends = 2
    
var newFriendships =1000
    
var interval = 200
 
d3.select("#setup").html("SETUP<br>size: "+size+"<br>friends each: "+friends+"<br>"+"start tolerance: "+thresholdStart
    +"<br>tolerance: "+threshold)
  
var groupColor = {
    _0:"#bf9441",
    _1:"#000000",
    _2:"#fff"
}
var nodeRadius = 4
var strokeColor = "#aaa"
var strokeWidth = 1



    var nodes = []
    for(var i = 0; i<size; i++){
        var groupNumber ="_"+Math.round(Math.random()*(groups-1))    
        nodes.push({id:"node_"+i,group:groupNumber})
    }

    var links = []
    for(var n in nodes){
        for(var f = 0; f<friends; f++){
            var source = nodes[n]
            var randomIndex = Math.round(Math.random()*(nodes.length-1))
            var target = nodes[randomIndex]
            if(Math.random()<thresholdStart){
                while(target.group == source.group){
                    target = nodes[Math.round(Math.random()*(nodes.length-1))]
                }
            }else{
                while(target.group != source.group){
                    target = nodes[Math.round(Math.random()*(nodes.length-1))]
                }
            }        
            var link = {source:source, target:target}
            links.push(link)
        }
    }
 
    
    
//
//    download(JSON.stringify(nodes), "nodes.txt", 'text/plain');
//    download(JSON.stringify(links), "links.txt", 'text/plain');


function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
function ticked() {
    
  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })

  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
} 

var className = "A"

var simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(strength))
    .force("link", d3.forceLink(links).distance(distance))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .alphaTarget(1)
    .on("tick", ticked);

    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    var link = g.append("g").attr("stroke", strokeColor).attr("stroke-width", strokeWidth).attr("class","link"+className).selectAll(".link"+className)
    var node = g.append("g")
        .attr("stroke", strokeColor).attr("stroke-width", strokeWidth).attr("stroke-opacity",.2)
        .attr("class","node"+className).selectAll(".node"+className);

    restart();
    var sources
    var sourcesMap
    var targets
    var targetsMap
    updateLinks()

    function updateLinks(){
        sources = d3.nest()
                    .key(function(d){
                        return d.source.id
                    })
                    .entries(links)
        sourcesMap = d3.map(sources,function(d){return d.key})

        targets = d3.nest()
                    .key(function(d){return d.target.id})
                    .entries(links)
        targetsMap = d3.map(targets,function(d){return d.key})
    }


    for(var i =1; i<=newFriendships; i++){
        
          addFriend(2000+i*interval,i)                
    }       
    
    
    function addFriend(time,count){
        var allTime = time
        //https://bl.ocks.org/mbostock/aba1a8d1a484f5c5f294eebd353842da
   //     distance +=.5
        strength -=.2
        
        simulation.force("charge", d3.forceManyBody().strength(strength))
        .force("link", d3.forceLink(links).distance(distance))
        
        
        d3.timeout(function(){
            d3.select("#friendCount").html("new friends: "+ count)
            document.title = "th_"+threshold+"_friends_"+count
            
            var randomSource = nodes[Math.round(Math.random()*(nodes.length-1))]
            var target = nodes[Math.round(Math.random()*(nodes.length-1))]
            
            
            var existingTargets = getNeighbors(randomSource.id)
            while(randomSource==target && existingTargets.indexOf(target)>-1){
                    target = nodes[Math.round(Math.random()*(nodes.length-1))]
            }
            
            if(Math.random()<threshold){
                while(target.group == randomSource.group ){
                    target = nodes[Math.round(Math.random()*(nodes.length-1))]
                }
            }else{
                while(target.group != randomSource.group){
                    target = nodes[Math.round(Math.random()*(nodes.length-1))]
                }
            }
            links.push({source: randomSource, target: target})
            
            restart()
            
          //  d3.select("."+randomSource.id+"_"+target.id)
          //              .attr("opacity",1).attr("stroke","red").attr("stroke-width",2)
          //              .transition().delay(interval)
          //              .attr("stroke","#000000").attr("stroke-width",1).attr("stroke-opacity",.2)
            relationshipTable(links,count)
            //if(count%250==0){
            //    console.log(threshold+"_"+count)
            //
            //    download(JSON.stringify(nodes), "nodes"+threshold+"_"+count+".txt", 'text/plain');
            //    download(JSON.stringify(links), "links"+threshold+"_"+count+".txt", 'text/plain');
            //}
        },time)
    }
    function relationshipTable(links,count){
        var table = {}
        var tally = {}
        tally["homophily"]=0
        tally["heterophily"]=0
        
        for(var l in links){
            var link = links[l]
            var sg = link.source.group
            var tg = link.target.group
            var key = sg+"x"+tg
            
            if(Object.keys(table).indexOf(sg)>-1){
                if(Object.keys(table[sg]).indexOf(tg)>-1){
                    table[sg][tg]+=1
                }else{
                    table[sg][tg]=1
                }
            }else{
                table[sg]={}
                if(Object.keys(table[sg]).indexOf(tg)>-1){
                    table[sg][tg]+=1
                }else{
                    table[sg][tg]=1
                }
            }
            
            if(sg ==tg){
                tally["homophily"]+=1
            }else{
                tally["heterophily"]+=1
            }
        }
        var total = tally["heterophily"]+tally["homophily"]
        
        var tableString = ""
                
        d3.selectAll(".setup").remove()
        d3.selectAll(".tally").remove()
        d3.selectAll(".friendshipTable").remove()
        var padding =20
        
        
        var setupSvg = d3.select("#chart1 svg").append("g").attr("class","setup")
        .attr("transform","translate(20,460)")
        
        setupSvg.append("rect").attr("width",200).attr("height",1).attr("x",padding/2).attr("y",1)
        setupSvg.append("text").text("Tolerance: "+Math.round(threshold*100)/100).attr("x",padding).attr("y",padding*2)
        setupSvg.append("rect").attr("width",200).attr("height",1).attr("x",padding/2).attr("y",padding*3)
        setupSvg.append("text").text("Links Added: "+count).attr("x",padding).attr("y",padding*5)
        
        var tableSvg= d3.select("#chart1 svg").append("g").attr("class","friendshipTable")
        .attr("transform","translate(20,580)")
        
        
        tableSvg.append("rect").attr("width",200).attr("height",1).attr("x",padding/2).attr("y",1)
        tableSvg.append("text").text("Links Formed").attr("x",padding).attr("y",30)
        var row = 1
        for(var t in table){
            for(var c in table[t]){
                row+=1
                tableSvg.append("rect").attr("height",strokeWidth).attr("width",padding*2).attr("x",padding*2)
                .attr("y",row*30-nodeRadius-1).attr("fill",strokeColor)
                tableSvg.append("circle").attr("r",nodeRadius).attr("fill",groupColor[t]).attr("cx",padding*2).attr("cy",row*30-nodeRadius)
                .attr("stroke",strokeColor).attr("stroke-width",strokeWidth)
                tableSvg.append("circle").attr("r",nodeRadius).attr("fill",groupColor[c]).attr("cx",padding*4).attr("cy",row*30-nodeRadius)
                .attr("stroke",strokeColor).attr("stroke-width",strokeWidth)
                tableSvg.append("text").text(table[t][c]).attr("x",padding*5).attr("y",row*30+2)
            }
        }



        var tallySvg= d3.select("#chart1 svg").append("g").attr("class","tally")
        .attr("transform","translate(20,750)")
        
        tallySvg.append("rect").attr("width",200).attr("height",1).attr("x",padding/2).attr("y",1)
        
        tallySvg.append("text")
        .text("Homophily: ")
        .attr("x",padding).attr("y",padding*2)
        tallySvg.append("text")
        .text(Math.round(tally["homophily"]/total*100)+"%")
        .attr("x",padding*7).attr("y",padding*2)
        tallySvg.append("text")
        .text(tally["homophily"])
        .attr("x",padding*7).attr("y",padding*3)
        .attr("fill","#888")
        
        tallySvg.append("text")
        .text("Heterophily: ")
        .attr("x",padding).attr("y",padding*5)
        tallySvg.append("text")
        .text(Math.round(tally["heterophily"]/total*100)+"%")
        .attr("x",padding*7).attr("y",padding*5)
        tallySvg.append("text")
        .text(tally["heterophily"])
        .attr("x",padding*7).attr("y",padding*6)
        .attr("fill","#888")
        
        d3.selectAll(".setup").style("font-family","helvetica").style("font-size",20)
        d3.selectAll(".friendshipTable").style("font-family","helvetica").style("font-size",20)
        d3.selectAll(".tally").style("font-family","helvetica").style("font-size",20)
        
    }

   

    //https://bl.ocks.org/emeeks/9915de8989e2a5c34652

    function getNeighbors(id){
        var linkedNodes = []
        if(targetsMap.get(id)!=undefined){
            for(var t in targetsMap.get(id).values){
                var nid = targetsMap.get(id).values[t].source//.id
               // d3.select("."+nid).attr("fill","blue")
                //d3.select("."+nid+"_"+id).attr("stroke","orange")
                linkedNodes.push(nid)
            }
        }
    
        if(sourcesMap.get(id)!=undefined){
            for(var t in sourcesMap.get(id).values){
                var nid = sourcesMap.get(id).values[t].target//.id
              //  d3.select("."+nid).attr("fill","blue")
             //   d3.select("."+id+"_"+nid).attr("stroke","orange")
                linkedNodes.push(nid)
            }
        }   
    
        return linkedNodes
    }

    function restart() {

      // Apply the general update pattern to the nodes.
      node = node.data(nodes, function(d) { return d.id;});
      node.exit().remove();
      node = node.enter()
          .append("circle")
          .attr("fill",function(d){
              return groupColor[d.group]
              return "green"
          })
          .attr("class",function(d){return d.id})
          .attr("r", nodeRadius)
          .merge(node)
        

      // Apply the general update pattern to the links.
      link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
      link.exit().remove();
      link = link.enter()
      .append("line")
      .attr("class",function(d){
          return d.source.id + "_" + d.target.id;
      })
      .attr("stroke", strokeColor).attr("stroke-width",strokeWidth).attr("opacity",.2)
      .merge(link);
      // Update and restart the simulation.
      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart();
    }