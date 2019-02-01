import requests
import json
actions = requests.get("https://uc.ccsource.org/operate")
actions = actions.content
actions = json.loads(actions)
data = actions["input"]
actions = actions["output"]
from vpython import *
scene = canvas(background=color.cyan)
carBody1 = box(size=vector(0.8,0.5,0.5),pos=vector(0,0,0))
carBody2 = box(size=vector(0.2,0.5,0.5),pos=carBody1.pos+vector(0.5,0,0),color=vector(0,0,255))
carBody = compound([carBody1,carBody2])
carWheel1 = cylinder(radius=0.1,axis=vector(0,0,0.1),pos=carBody.pos+vector(0.35,-0.2,0.2),color=vector(0,0,0))
carWheel2 = cylinder(radius=0.1,axis=vector(0,0,0.1),pos=carBody.pos+vector(0.35,-0.2,-0.28),color=vector(0,0,0))
carWheel3 = cylinder(radius=0.1,axis=vector(0,0,0.1),pos=carBody.pos+vector(-0.35,-0.2,0.2),color=vector(0,0,0))
carWheel4 = cylinder(radius=0.1,axis=vector(0,0,0.1),pos=carBody.pos+vector(-0.35,-0.2,-0.28),color=vector(0,0,0))
car = compound([carBody,carWheel1,carWheel2,carWheel3,carWheel4])
car.visible = False
cars = []
def createCar(posi,pointDir,goingDir):
    pointDir = 90+(pointDir*90)
    goingDir = 270+(goingDir*90)
    cars.append(car.clone(pos=posi))
    id = len(cars)-1
    cars[id].rotate(angle=radians(pointDir),axis=vector(0,1,0))
    carDirection = shapes.triangle(length=0.37,rotate=radians(goingDir-pointDir))
    extrusion(path=[cars[id].pos+vector(0,0.25,0), cars[id].pos+vector(0,0.3,0)],shape=carDirection,color=vector(255,0,0))
    return id
def createIns(WZLength,lanes):
    rtd = []
    deceperateLineWidth = 0.1
    waitZone=shapes.rectangle(width=1,height=WZLength)
    waitZoneR=shapes.rectangle(width=1,height=WZLength,rotate=radians(90))
    runningZone=shapes.rectangle(width=lanes*2+deceperateLineWidth,height=lanes*2+deceperateLineWidth)
    extrusion(path=[vector(0,-0.35,0),vector(0,-0.27,0)],shape=runningZone,color=color.black)
    #deceperate line
    deceperateLine = shapes.rectangle(width=deceperateLineWidth,height=WZLength)
    deceperateLineR = shapes.rectangle(width=deceperateLineWidth,height=WZLength,rotate=radians(90))
    #double deceperate line
    for k in range(1,4):
        eachDLPosi = (k-2)*deceperateLineWidth
        #橫向
        extrusion(path=[vector((WZLength/2+lanes),-0.35,eachDLPosi*1),vector((WZLength/2+lanes),-0.27,eachDLPosi*1)],shape=deceperateLine,color=vector(255*(k%2),255*(k%2),255*(k%2)))
        extrusion(path=[vector((WZLength/2+lanes)*-1,-0.35,eachDLPosi*1),vector((WZLength/2+lanes)*-1,-0.27,eachDLPosi*1)],shape=deceperateLine,color=vector(255*(k%2),255*(k%2),255*(k%2)))
        #直向
        extrusion(path=[vector(eachDLPosi*1,-0.35,(WZLength/2+lanes)),vector(eachDLPosi*1,-0.27,(WZLength/2+lanes))],shape=deceperateLineR,color=vector(255*(k%2),255*(k%2),255*(k%2)))
        extrusion(path=[vector(eachDLPosi*1,-0.35,(WZLength/2+lanes)*-1),vector(eachDLPosi*1,-0.27,(WZLength/2+lanes)*-1)],shape=deceperateLineR,color=vector(255*(k%2),255*(k%2),255*(k%2)))
    for i in range(lanes):
        eachLanePosi = i+1/2+deceperateLineWidth*1.5
        rtp.append(eachLanePosi)
        #橫向
        extrusion(path=[vector((WZLength/2+lanes),-0.35,eachLanePosi*1),vector((WZLength/2+lanes),-0.27,eachLanePosi*1)],shape=waitZone,color=color.black)
        extrusion(path=[vector((WZLength/2+lanes)*-1,-0.35,eachLanePosi*1),vector((WZLength/2+lanes)*-1,-0.27,eachLanePosi*1)],shape=waitZone,color=color.black)
        extrusion(path=[vector((WZLength/2+lanes),-0.35,eachLanePosi*-1),vector((WZLength/2+lanes),-0.27,eachLanePosi*-1)],shape=waitZone,color=color.black)
        extrusion(path=[vector((WZLength/2+lanes)*-1,-0.35,eachLanePosi*-1),vector((WZLength/2+lanes)*-1,-0.27,eachLanePosi*-1)],shape=waitZone,color=color.black)
        #直向
        extrusion(path=[vector(eachLanePosi*1,-0.35,(WZLength/2+lanes)),vector(eachLanePosi*1,-0.27,(WZLength/2+lanes))],shape=waitZoneR,color=color.black)
        extrusion(path=[vector(eachLanePosi*1,-0.35,(WZLength/2+lanes)*-1),vector(eachLanePosi*1,-0.27,(WZLength/2+lanes)*-1)],shape=waitZoneR,color=color.black)
        extrusion(path=[vector(eachLanePosi*-1,-0.35,(WZLength/2+lanes)),vector(eachLanePosi*-1,-0.27,(WZLength/2+lanes))],shape=waitZoneR,color=color.black)
        extrusion(path=[vector(eachLanePosi*-1,-0.35,(WZLength/2+lanes)*-1),vector(eachLanePosi*-1,-0.27,(WZLength/2+lanes)*-1)],shape=waitZoneR,color=color.black)

        if(i!=lanes-1):
            eachDLPosi = eachLanePosi+0.5
            #橫向
            extrusion(path=[vector((WZLength/2+lanes),-0.35,eachDLPosi*1),vector((WZLength/2+lanes),-0.26,eachDLPosi*1)],shape=deceperateLine,color=vector(255*(k%2),255*(k%2),255*(k%2)))
            extrusion(path=[vector((WZLength/2+lanes)*-1,-0.35,eachDLPosi*1),vector((WZLength/2+lanes)*-1,-0.26,eachDLPosi*1)],shape=deceperateLine,color=vector(255*(k%2),255*(k%2),255*(k%2)))
            extrusion(path=[vector((WZLength/2+lanes),-0.35,eachDLPosi*-1),vector((WZLength/2+lanes),-0.26,eachDLPosi*-1)],shape=deceperateLine,color=vector(255*(k%2),255*(k%2),255*(k%2)))
            extrusion(path=[vector((WZLength/2+lanes)*-1,-0.35,eachDLPosi*-1),vector((WZLength/2+lanes)*-1,-0.26,eachDLPosi*-1)],shape=deceperateLine,color=vector(255*(k%2),255*(k%2),255*(k%2)))
            #直向
            extrusion(path=[vector(eachDLPosi*1,-0.35,(WZLength/2+lanes)),vector(eachDLPosi*1,-0.26,(WZLength/2+lanes))],shape=deceperateLineR,color=vector(255*(k%2),255*(k%2),255*(k%2)))
            extrusion(path=[vector(eachDLPosi*1,-0.35,(WZLength/2+lanes)*-1),vector(eachDLPosi*1,-0.26,(WZLength/2+lanes)*-1)],shape=deceperateLineR,color=vector(255*(k%2),255*(k%2),255*(k%2)))
            extrusion(path=[vector(eachDLPosi*-1,-0.35,(WZLength/2+lanes)),vector(eachDLPosi*-1,-0.26,(WZLength/2+lanes))],shape=deceperateLineR,color=vector(255*(k%2),255*(k%2),255*(k%2)))
            extrusion(path=[vector(eachDLPosi*-1,-0.35,(WZLength/2+lanes)*-1),vector(eachDLPosi*-1,-0.26,(WZLength/2+lanes)*-1)],shape=deceperateLineR,color=vector(255*(k%2),255*(k%2),255*(k%2)))
    return rtd
startCordArr = createIns(data["refIns"]["waitZoneLength"],data["refIns"]["lanes"])
data["refIns"] = "" # delete refIns
for i in data: # bottom, right, top, left
    for j in i: # left, straight, right
        locAmount = j["amount"]
        k=0
        startCord = 
        while(k<locAmount):
            k+=1