//console.log(getCounts(links2,"table2",linksLine2))
//console.log(getCounts(links,"table1",linksLine1))

var svgH = 170
var svgW = 300
var padding = 20
d3.select("#friendshipGrowth1").append("svg").attr("width",svgW).attr("height",svgH)
d3.select("#friendshipGrowth2").append("svg").attr("width",svgW).attr("height",svgH)
//drawLine(getCounts(links,"table1"),"friendshipGrowth1")
//growthChart("friendshipGrowth1",linksLine1)

function growthChart(className,data){
    
    var inGroupPairs = ["_0__0","_1__1","_2__2"]
    for(var i in data){
        if(inGroupPairs.indexOf(i)>-1){
            drawLine(className,data[i],i,"red")
        }else{
            drawLine(className,data[i],i,"black")
        }
    }
}


function drawLine(div,linksLine,className,color,svg){

    var svg = d3.select("#"+div+" svg")
    
   //The scales for x and y
    var yScale = d3.scaleLinear()
        .domain([0,newFriendships])
        .range([svgH-20,20])
    var xScale = d3.scaleLinear()
        .domain([0,newFriendships])
        .range([0,svgW])
    //x uses the index value to place the dots evenly across
    //can of course be ordinal using band
 
    //define the line
    var line = d3.line()
        .x(function(d,i){
            return xScale(i)
        })
        .y(function(d,i){
            return yScale(d)
        })

        if(linksLine.length<=1){
            svg.append("path")
                .data([linksLine])
                .attr("d",line)
                .attr('class',className+div)
                .attr("fill", "none")//styles the line with attr
                .attr("stroke", color)//styles the line with attr
        }else{
            d3.select("."+className+div)
                .data([linksLine])
                .attr("d",line)
                .attr('class',className+div)
                .attr("fill", "none")//styles the line with attr
                .attr("stroke", color)//styles the line with attr
        }
   
    
}

function getCounts(linkData,div,linksLine){
    
    var groupNames= ["_0","_1","_2"]
    
    //get data by source group
    var linksBySG = d3.nest().key(function(d){
                    return d.source.group
                })
                .entries(linkData)
                
   
                
    
    var linksBySGDict = {}
    var linksSubgroupCount = {}
    
    for(var i =0;i<linksBySG.length; i++){      
          var ck = linksBySG[i].key
        
        //get sourcegroup data by target group
        linksBySGDict[ck]= d3.nest().key(function(d){
                    return d.target.group
                })
                .entries(linksBySG[i].values)
                
                
        linksSubgroupCount[linksBySG[i].key]={}
        
        //iterate through target group
        for(var j in linksBySGDict[ck]){
            
            var jk = linksBySGDict[ck][j].key
            var jv = linksBySGDict[ck][j].values
            
            linksSubgroupCount[ck][jk]=jv.length
        }
    }
    var display = "<table><tr><th>  </th>"
    for(var hg in groupNames){
        display+="<th><span style=\"font-size:18px; color:"+groupColor[groupNames[hg]]+"\">"+groupNames[hg].replace("_","")+"</span></th>"
    }
    display+="</tr>"
    
    var sums = {}
    
    for(var fg in groupNames){
        var fgroup = groupNames[fg]
        
        display+="<tr><td><span style=\"font-size:18px; color:"+groupColor[fgroup]+"\">"+fgroup.replace("_","")+"</span></td>"
        sums[fg]=0
        
        for(var g in groupNames){
            var group = groupNames[g]
            
            if(group == fgroup){
                display+="<td><span style=\"font-size:14px; color:#000000\">"+linksSubgroupCount[group][fgroup]+"</span></td>"
            }else{
                display+="<td><span style=\"font-size:14px; color:#aaaaaa\">"+linksSubgroupCount[group][fgroup]+"</span></td>"
            }
          //  console.log(group, fgroup, linksSubgroupCount[group][fgroup])
            
            sums[fg]+=linksSubgroupCount[fgroup][group]
            linksLine[group+"_"+fgroup].push(linksSubgroupCount[group][fgroup])
            //console.log(group,fgroup,linksSubgroupCount[group][fgroup])
        }
        
         display+="</tr>"
    } 
    display+="</div>"

    d3.select("#"+div).html(display)
   // console.log(div)
   // console.log(sums)
    relationshipTotals(linksSubgroupCount,div)
    return linksSubgroupCount
}
function relationshipTotals(countData,div){
    var ho = countData["_0"]["_0"]+countData["_1"]["_1"]+countData["_2"]["_2"]
    var total = size*(inGroup+outGroup)+newFriendships
    var hoP = Math.round(ho/total*100)+"%"
    var he = total -ho
    var heP = Math.round(he/total*100)+"%"
    d3.select("#"+div+"total").html("Homophilous:<br/><br/><span style=\"font-size:24px; color:#000000\">"
    +ho+", "+hoP+"</span><br/><br/><br/> Heterophilous:<br/><br/><span style=\"font-size:24px; color:#aaaaaa\">"+he+", "+heP+"</span><br/>")
    
}