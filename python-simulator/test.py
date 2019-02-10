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
cars = {}
def createCar(id,posi,pointDir,goingDir):
    pointDir = 90+(pointDir*90)
    goingDir = 270+(goingDir*90)
    locCar = car.clone(pos=posi)
    locCar.rotate(angle=radians(pointDir),axis=vector(0,1,0))
    carDirection2D = shapes.triangle(length=0.37,rotate=radians(goingDir-pointDir))
    carDirection = extrusion(path=[locCar.pos+vector(0,0.25,0), locCar.pos+vector(0,0.3,0)],shape=carDirection2D,color=vector(255,0,0))
    cars[id] = compound([locCar,carDirection])



def createIns():
    rtd = []
    waitZone=shapes.rectangle(width=1,height=WZLength)
    waitZoneR=shapes.rectangle(width=1,height=WZLength,rotate=radians(90))
    runningZone=shapes.rectangle(width=lanes*2+deceperateLineWidth*3,height=lanes*2+deceperateLineWidth*3)
    extrusion(path=[vector(0,-0.35,0),vector(0,-0.26,0)],shape=runningZone,color=color.yellow)
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
        rtd.append(eachLanePosi)
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

def leftTurn(id, loc,SCA,lanes):
    mvX = 0
    mvZ = 0
    rX = 0
    rZ = 0
    if(loc%2==1): 
        mvX = -0.01
        mvZ = 0
        rX = -0.002
        rZ = 0.005
    else: 
        mvX = 0
        mvZ = -0.01
    if(loc==0):
        rX = -1*rX
        rZ = -1*rZ
    if(loc==3): 
        mvX = -1*mvX
        rZ = -1*rZ
    if(loc==2): 
        mvZ = -1*mvZ
        rX = -1*rX


    for x in range(300):
        cars[id].pos+=vector(mvX,0,mvZ)
        sleep(0.00001)
    for x in range(200):
        cars[id].pos+=vector(rX,0,rZ)
        cars[id].rotate(radians(0.45), vector(0,1,0))
        sleep(0.00001)
    cars[id].visible=False
    del cars[id]
    createCar(id,vector(SCA-1-deceperateLineWidth*3,0,lanes+0.7),2,1)

WZLength = 6
lanes = 2
deceperateLineWidth = 0.1
StartCordArr = createIns()
createCar("hi",vector(lanes+0.7,0,StartCordArr[0]+1),1,0)
leftTurn("hi", 1,StartCordArr[0],lanes)
createCar("hi2",vector(lanes+0.7,0,StartCordArr[0]*-1-1),3,0)
leftTurn("hi2", 3, StartCordArr[0],lanes)