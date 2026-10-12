import { _decorator, Component, Node, size, Size, Vec2,math,Vec3,tween,easing,assert,Tween } from 'cc';

import { UIMgr,UICtrl } from '../Mgr/UIMgr';
import { SymbolMgr } from '../Mgr/SymbolMgr';
import { LevelConfig,ReelTableConfig,ReelUnitConfig } from '../InterFace/LevelConfig';
import { BaseReelTable } from './BaseReelTable';
import { BaseSymbolUnit } from "./BaseSymbolUnit";
import { BaseMutilReelUnit } from './BaseMutilReelUnit';
import { SymbolType,SymbolViewType } from '../InterFace/LevelConfig';
import { LevelMgr } from '../Mgr/LevelMgr';

const { ccclass, property } = _decorator;

export enum RollStatus {
    Idle        = 0, // -- 静止状态 
    SpeedUp     = 1, // -- 加速
    MoveUniform = 2, // -- 匀速移动   
    SlowDown    = 3  // -- 减速
};

class RollMeta {
    id: number = -1;
    pos: number = -1;
};

@ccclass('BaseReelUnit')
export class BaseReelUnit extends UICtrl {

    protected initView(): void {

    }

    public m_rollDoneTween:Tween<Node> | null = null;

    public m_levelConfig:LevelConfig = null;
    public m_reelUnitConfig:ReelUnitConfig = null;
    public m_reelTableConfig:ReelTableConfig = null;
    public m_reelUnitIndex:number = 0;
    public m_reelTableCompent:BaseReelTable | BaseMutilReelUnit = null;

    public m_reelTableIndex:number = 0;
    public m_viewRow:number = -1;//-- 此滚轴在轮盘上行的坐标 (滚轴组的标记)
    public m_bigSize:number = 0;
    public m_viewCount:number = 0;
    public m_unitSize:Size = new Size(0,0);
    public m_unitTotalCount:number = 0;

    public m_topCreatePosY:number = 0;
    public m_topFirstPosY:number = 0;
    public m_stopPosY:number = 0;
    public m_posX:number = 0;
    public m_firstViewPosY:number = 0;
    public m_firstBottomPosY:number = 0;

    public m_minSpeed:number = 0;
    public m_speed:number = 0;
    public m_maxSpeed:number = 0;
    public m_quickSpeed:number = 0;
    public m_quickStopSpeed:number = 0;

    public m_allowRoll:boolean = true; // 滚轴是否允许滚动

    public m_rollStatus:RollStatus = RollStatus.Idle;
    public m_rollDataPointer:number = 0; // -- 当前数据的索引指针

    public m_viewSymbolWorldPos:Vec3[] = [];//-- 可视区域的世界坐标

    public m_rollData:RollMeta[] = null;
    public m_rootNode:Node = null;

    public m_canRollMark:boolean = false; // 可以滚动的标志

    public m_destUnitNode:Node = null; // 停止信号块的指针
    public m_isQuickStop:boolean = false; // 是否快滚
    public m_stopMark:boolean = false;// 设置停止的标志

    public m_destSymbolData:any[] = [];// 盘面数据
    public m_destPointer:number = 0; // 轮盘的数据指针


    start() {
        
    }

    update(deltaTime: number) {
        if (!this.node || !this.node.isValid) return;
        if (this.m_canRollMark == false){
            return;
        }
        // 进行滚动
        // -- 更新运动状态  --
        this.updateMotionStatus( deltaTime );
        // -- 更新信号块位置  --
        this.updateSymbolUnit( deltaTime );
    }

    public updateMotionStatus( deltaTime: number ){
        if( this.m_rollStatus == RollStatus.Idle ){
            // 进入加速
            this.changeRollStatus( RollStatus.SpeedUp );
        }
        else if( this.m_rollStatus == RollStatus.SpeedUp ){
            // 加速
            this.speedUpAction( deltaTime );
        }
        else if( this.m_rollStatus == RollStatus.MoveUniform ){
            // nothing to do here!!
        }
        else if( this.m_rollStatus == RollStatus.SlowDown ){
            // 减速
            this.slowDownAction( deltaTime );
        }
    }

    public updateSymbolUnit( deltaTime: number ){
        let pixStep = Math.floor( this.m_speed * deltaTime );
        // 如果是快停
        if ( this.m_isQuickStop ){
            // pixStep = this.m_unitSize.height / 2;
        }

        // -- 最大的滚动速度最多只允许一个格子 不然有大信号块会出现盘面会滚出空信号块的问题<要解决这个问题 需要补齐 很麻烦>
        if ( pixStep >= this.m_unitSize.height ){
            pixStep = this.m_unitSize.height;
        }
        // 如果有停止的node 再次设置一下速度 <重要>
        if ( this.m_destUnitNode != null ){
            let posyCur:Vec3 = this.m_destUnitNode.position;
            assert( posyCur != null," !! 出错了 this.m_destUnitNode 是野指针了!! ");
            let posyAfter = posyCur.y - pixStep;
            if ( posyAfter < this.m_stopPosY ){
                pixStep = posyCur.y - this.m_stopPosY;
            }
        }
        // -- 再次纠正一下速度 (会存在 pixStep = 0 的情况导致滚动中断)
        if ( pixStep < 1 ){
            pixStep = 1;
        }

        // -- 向下滚动
        let allSymbolUnits = this.m_rootNode.children;
        // 遍历所有子节点
        allSymbolUnits.forEach((child, index) => {
            const pos = child.position;
            let nowPosy = pos.y - pixStep;
            child.setPosition( pos.x,nowPosy,pos.z );
        });
        // 按照y轴排序
        allSymbolUnits.sort((a: Node, b: Node) => {
            return a.position.y - b.position.y; // 升序，降序改为 b.position.y - a.position.y
        });

        let createTopPos = null;
        let bottomPos = null;
        let topNode = null;
        let bottomNode = null;
        let length = allSymbolUnits.length;
        // 最高点
        const topPos = allSymbolUnits[length - 1].position;
        createTopPos = topPos.y;
        topNode = allSymbolUnits[length - 1];
        // 最低点
        const bottomPosition = allSymbolUnits[0].position;
        bottomPos = bottomPosition.y;
        bottomNode = allSymbolUnits[0];

        // -- 1:首先进行移除超出显示区域的信号块
        let bottomCompent = bottomNode.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
        let bottomSymbolId = bottomCompent.getSymbolId();
        
        let bottomSizeType = this.getSymbolSize( bottomSymbolId );
        if ( bottomSizeType == 1 ){
            if ( bottomPos <= this.m_firstBottomPosY ){
                // 归还信号块
                this.removeSymbolNode( bottomNode );
            }
        }
        else {
            let cData = bottomCompent.getData();
            let pos = cData.pos;
            let removePos = -((bottomSizeType - pos + 1.5) * this.m_unitSize.height);
            if ( bottomPos <= removePos ){
                // 归还信号块
                this.removeSymbolNode( bottomNode );
            }
        }

        // -- 2:此时不需要创建
        if ( createTopPos >= this.m_topCreatePosY ){
            return;
        }

        // -- 从滚轴拿取数据 <这是假滚>
        let posY = createTopPos + this.m_unitSize.height;
        if ( this.m_stopMark == false ){
            // -- 改变假滚的数据指针
            this.addPointerIndex();
            // -- 使用假滚的数据创建信号快
            let pos:Vec3 = new Vec3(this.m_posX,posY,0);
            this.createSymbolNode( this.m_rollData[this.m_rollDataPointer],pos );
            return
        }

        // 针对有停止标志的逻辑 
        // 1: -- 判断是否是大信号块
        let topNodeCompent = topNode.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
        let topSymbolData = topNodeCompent.getData();
        assert( topSymbolData != null," topSymbolData 不能为null " );
        let topSizeType:number = this.getSymbolSize( topSymbolData.id );
        // -- 针对大信号的情况 < this.m_destPointer == 0 表示还没有从服务器结果中取数据 >
        if ( topSymbolData.pos < topSizeType && this.m_destPointer == 0 ){
            // -- 改变假滚的数据指针
            this.addPointerIndex();
            // -- 此时是大信号块 继续从假滚中拿数据
            let pos:Vec3 = new Vec3(this.m_posX,posY,0);
            this.createSymbolNode( this.m_rollData[this.m_rollDataPointer],pos );
            return;
        }

        // 从服务器拿数据   
        let pos:Vec3 = new Vec3(this.m_posX,posY,0);
        let symbolNode = this.createSymbolByServer( pos );
        if ( symbolNode != null ){
            let compent = symbolNode.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
            let data = compent.getData();
            if ( data.posType == SymbolViewType.View && data.row == 0 ){
                if ( this.m_destUnitNode == null ){
                    this.m_destUnitNode = symbolNode;
                }
            }
        }

        // -- 没有停止信号块
        if ( this.m_destUnitNode == null ){
            return;
        }

        let destPosY = this.m_destUnitNode.position.y;
        if ( destPosY <= this.m_stopPosY ){
            // 停止滚动
            this.m_canRollMark = false;
            // -- 矫正位置
            let dissPosY = this.m_stopPosY - destPosY;
            let newTopPos = 0;
            // allSymbolUnits = this.m_rootNode.children;
            const childrenCopy = [...this.m_rootNode.children];// 复制一遍

            for (let i = 0; i < childrenCopy.length; i++) {
                const symbolNode = childrenCopy[i];
                let nowPosY = symbolNode.position.y;
                let newPosY = nowPosY + dissPosY;
                let newPos = new Vec3( symbolNode.position.x,newPosY,0 );
                symbolNode.position = newPos;// -- 矫正位置

                let compent = symbolNode.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
                let vData = compent.getData();
                if (vData.posType == SymbolViewType.View){
                    // -- 如果是滚轴组
                    if ( this.m_viewRow != -1 ){
                        let symbolConfig = LevelMgr.Instance.getSymbolConfig( vData.id );
                        if( symbolConfig.type == SymbolType.BONUS ){
                            // 不允许滚动
                            this.setAllowRoll( false );
                        }
                    }
                }
                if ( newPosY > newTopPos ){
                    newTopPos = newPosY;
                }
            }

            // -- 不是快停 就播放停止音效 (是快停的话 就在轮盘上调用 只播放一次)
            if ( this.m_isQuickStop == false ){
                this.m_reelTableCompent.playReelStopDoneSounds();
            }

            // 回弹
            const anims: Array<ReturnType<typeof tween>> = [];
            let dis = this.m_unitSize.height * 0.15;
            anims.push(
                tween(this.m_rootNode).by(0.1,{ position: new Vec3(0, -dis, 0) }, { easing:"sineOut" })
            );
            anims.push(
                tween(this.m_rootNode).by(0.2,{ position: new Vec3(0, dis, 0) })
            );
            anims.push(
                tween(this.m_rootNode).call(()=>{
                    // -- 落地音效和动画
                    for (let i = 0; i < childrenCopy.length; i++) {
                        const symbolNode = childrenCopy[i];
                        let compent = symbolNode.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
                        let vData = compent.getData();
                        if ( vData.posType == SymbolViewType.View ){
                            // 针对需要放入feature层的信号块
                            compent.toFeatureShow();
                            // -- 播放落地停止动画
                            compent.playStopItAction();
                        }
                    }

                    // -- 当前滚轴停止
                    this.m_reelTableCompent.oneReelUnitStopDone( this.m_reelUnitIndex );

                    // -- 创建补齐的信号块
                    let count = this.m_destSymbolData.length - this.m_destPointer + 1;
                    for( let i = 0;i < count; i++ ){
                        let posY = newTopPos + this.m_unitSize.height * ( i + 1 );
                        let pos:Vec3 = new Vec3(this.m_posX,posY,0);
                        this.createSymbolByServer( pos );
                    }

                    // -- 清除状态
                    this.clearState();
                })
            );
            this.m_rollDoneTween = tween(this.m_rootNode).sequence(...anims).start();
        }
    }

    public setQuickSpeed(){
        this.m_speed = this.m_quickSpeed;
    }

    public clearState():void{
        this.m_stopMark = false;
        // -- 设置为静止状态
        this.changeRollStatus( RollStatus.Idle );
        // -- 清空目标node
        this.m_destUnitNode = null;
        // -- 重置速度
        this.m_speed = this.m_minSpeed;
        // -- 重置快滚
        this.m_isQuickStop = false;
        if (this.m_rollDoneTween) {
            this.m_rollDoneTween.stop();
            this.m_rollDoneTween = null;
        }
    }

    // 从服务器数据中创建信号块
    public createSymbolByServer( position:Vec3 ):Node|null {
        assert( position != null ," !! position is nil !! " );
        if ( this.m_destPointer < this.m_destSymbolData.length ){
            let rollData = this.m_destSymbolData[this.m_destPointer];
            let symbolNode = this.createSymbolNode( rollData,position );
            this.m_destPointer = this.m_destPointer + 1;
            return symbolNode;
        }
        //assert( false ," !! 从服务器创建信号块失败 m_destPointer = " + this.m_destPointer + "!! " );
    }

    // -- 改变数据的索引指针 假滚的数据指针
    public addPointerIndex():void {
        this.m_rollDataPointer = this.m_rollDataPointer + 1;
        if (this.m_rollDataPointer >= this.m_rollData.length ){
            this.m_rollDataPointer = 0;
        }
    }

    public changeRollStatus( state:RollStatus ){
        this.m_rollStatus = state;
    }

    public speedUpAction( deltaTime: number ){
        // // -- -- 去掉 暂时不加速
        // this.m_speed = this.m_speed + 20 * deltaTime
        // if (this.m_speed >= this.m_maxSpeed){
        //     this.m_speed = this.m_maxSpeed;
        //     // 进入匀速状态
        //     this.changeRollStatus( RollStatus.MoveUniform )
        // }

        // 直接进入匀速
        this.changeRollStatus( RollStatus.MoveUniform )
    }

    public slowDownAction( deltaTime: number ){
        // // 去掉 暂时不减速
        // this.m_speed = this.m_speed - 20 * deltaTime;
        // if ( this.m_speed <= this.m_minSpeed ){
        //     this.m_speed = this.m_minSpeed;
        // }
    }


    // 设置滚轴组的行(Respoin模式)
    public setViewRow( row:number ){
        this.m_viewRow = row;
    }

    // 针对一些特殊情况 从新设置滚轴数据
    public resetRollData( rollData:number[] ){
        this.m_rollData = this.convertRollList( rollData );
    }


    public initUI( levelConfig:LevelConfig,
        reelUnitConfig:ReelUnitConfig,
        reelUnitIndex:number,
        reelTableCompent:BaseReelTable | BaseMutilReelUnit,
        reelTableIndex:number):void
    {
        
        this.m_levelConfig = levelConfig;
        this.m_reelUnitConfig = reelUnitConfig;
        this.m_reelUnitIndex = reelUnitIndex;
        this.m_reelTableCompent = reelTableCompent;
        this.m_reelTableIndex = reelTableIndex;
        this.m_reelTableConfig = reelTableCompent.m_reelTableConfig

        this.m_bigSize = this.m_reelUnitConfig.BigSize; // 如果大于1 则bigSize跟可视区域的数值必须一样
        this.m_viewCount = this.m_reelUnitConfig.ViewCount;

        this.m_unitSize.width = this.m_reelUnitConfig.Width;
        this.m_unitSize.height = this.m_reelUnitConfig.Height
        this.m_unitTotalCount = this.m_bigSize + this.m_viewCount + this.m_bigSize  // 当前roll能容纳的单元格
        this.m_topCreatePosY = Math.floor(this.m_unitSize.height * (this.m_viewCount - 0.5)) //-- 这个是用于比较是否创建信号块的坐标 也是可是区域最高处信号块的位置
        this.m_topFirstPosY = this.m_unitSize.height * (this.m_viewCount + 0.5) //-- 这是顶部区域第一个信号块的坐标
        this.m_stopPosY = Math.floor(this.m_unitSize.height * 0.5) // -- 信号快的停止位置
        this.m_posX = this.m_unitSize.width / 2 // -- 信号块创建的x的位置

        this.m_firstViewPosY = this.m_unitSize.height / 2 //-- 第一个可视区域信号块的坐标
        this.m_firstBottomPosY = -( this.m_unitSize.height + this.m_unitSize.height / 2) //-- 可视区域下面第二个信号块的位置

        // -- 速度
        this.m_minSpeed = this.m_reelUnitConfig.Speed                       // -- 初始速度
        this.m_speed = this.m_reelUnitConfig.Speed                          // -- 当前速度 可能会有变动
        this.m_maxSpeed = this.m_reelUnitConfig.Speed                       // -- 进入匀速滚动的最大速度
        this.m_quickSpeed = this.m_reelUnitConfig.QuickSpeed                // -- 快滚的速度 (要比匀速的大)
        this.m_quickStopSpeed = this.m_reelUnitConfig.QuickStopSpeed        // -- 快停的速度

        // -- 滚轴是否允许滚动
        this.m_allowRoll = true;
        // -- 初始化静止状态
        this.m_rollStatus = RollStatus.Idle;
        // -- 滚轴数据
        this.m_rollDataPointer = 0 // -- 当前数据的索引指针

        // 注意 不在这里初始化了
        //this.m_rollData = this.convertRollList( this.m_reelTableConfig.RollData[this.m_reelUnitIndex] );

        // -- 初始化裁剪区域  --
        this.addClipNode();
    }

    private addClipNode():void{
        this.m_rootNode = new Node("RootNode");
        this.node.addChild( this.m_rootNode )
    }

    // -- 初始化轮盘 (根据传入的轮盘数据显示)
    public loadSymbolUnitUI( viewSymbolData:number[] ):void{
        let finalData:any = this.convertViewSymbolData(viewSymbolData);
        let bottomData:any = finalData.bottomData;
        let viewData:any = finalData.viewData;
        let topData:any = finalData.topData;
        // -- 创建底部区域的信号块
        let xPos = this.m_posX;
        if(bottomData.length > 0){
            let yPosStart = -(this.m_unitSize.height * (bottomData.length - 0.5))
            for( let i = 0;i < bottomData.length; i++ ){
                let pos:Vec3 = new Vec3(xPos,yPosStart + (i) *  this.m_unitSize.height,0);
                this.createSymbolNode( bottomData[i],pos );
            }
        }
        // 可视区域
        let yPosStart = this.m_firstViewPosY
        for( let i = 0;i < viewData.length; i++ ){
            let pos:Vec3 = new Vec3(xPos,yPosStart + (i) *  this.m_unitSize.height,0);
            let symbol_node = this.createSymbolNode( viewData[i],pos );

            // 存储可视区域的世界坐标
            let worldPos = new Vec3();
            symbol_node.getWorldPosition( worldPos );
            this.m_viewSymbolWorldPos.push( worldPos );
        }
        // 顶部区域
        if(topData.length > 0){
            let yPosStart = this.m_topFirstPosY;
            for( let i = 0;i < topData.length; i++ ){
                let pos:Vec3 = new Vec3(xPos,yPosStart + (i) *  this.m_unitSize.height,0);
                this.createSymbolNode( topData[i],pos );
            }
        }
    }

    // -- 从新设置一下信号块的世界坐标
    public resetViewSymbolWorldPos():void {
        this.m_viewSymbolWorldPos = [];
        let allSymbolUnits = this.m_rootNode.children;
        // 按照y轴排序
        allSymbolUnits.sort((a: Node, b: Node) => {
            return a.position.y - b.position.y; // 升序，降序改为 b.position.y - a.position.y
        });
        // 遍历所有子节点
        allSymbolUnits.forEach((child, index) => {
            let compent = child.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
            let data = compent.getData();
            if ( data.posType == SymbolViewType.View ){
                let worldPos = new Vec3();
                child.getWorldPosition( worldPos );
                this.m_viewSymbolWorldPos.push( worldPos );
            }
        });
    }

    // 获取行的世界坐标 索引 从0开始
    public getSymbolWorldPos( row:number ):Vec3{
        return this.m_viewSymbolWorldPos[row];
    }

    // 将节点放回当前的滚轴
    public putSymbolToMyReelUnit( symbolNode:Node ):void {
        let worldPos = symbolNode.worldPosition;
        let localPos = new Vec3();
        // 将世界坐标转化为局部坐标
        this.m_rootNode.inverseTransformPoint(localPos,worldPos);
        symbolNode.parent = this.m_rootNode;
        symbolNode.setPosition( localPos );
        // TODO 需要停止动画
    }

    // 播放信号块动画
    public playSymbolAction( row:number,actionName:string,isLoop:boolean,isLineAction:boolean = false,callBack:Function|null = null,timeScale:number = 1 ){
        let allSymbolUnits = this.m_rootNode.children;
        let symbolNode = null;
        let symbolCompent = null;
        for( let child of allSymbolUnits ){
            let compent = child.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
            let data = compent.getData();
            if ( data.posType == SymbolViewType.View && data.row == row ){
                symbolNode = child;
                symbolCompent = compent
                break;
            }
        }
        assert( symbolNode != null," !! error 没有找到这个 symbolNode !! " );
        let data = symbolCompent.getData();
        if ( data.pos > 1 ){
            // -- 表示这是一个大信号块的占位node 需要找到显示的那个node
            // -- 需要排序一下 从下向上找
            // 按照y轴排序
            allSymbolUnits.sort((a: Node, b: Node) => {
                return a.position.y - b.position.y; // 升序，降序改为 b.position.y - a.position.y
            });
            for( let child of allSymbolUnits ){
                let compent = child.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
                let vData = compent.getData();
                if ( vData.id == data.id && vData.pos == 1 ) {
                    compent.playSymbolAction( actionName,isLoop,callBack,isLineAction,timeScale );
                    break;
                }
            }
        }else {
            symbolCompent.playSymbolAction( actionName,isLoop,callBack,isLineAction,timeScale );
        }
    }

    public getSymbolNode( row:number ):Node{
        let allSymbolUnits = this.m_rootNode.children;
        let symbolNode = null;
        let symbolCompent = null;
        for( let child of allSymbolUnits ){
            console.log("---------> getSymbolNode 11111111 ");
            let compent = child.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
            let data = compent.getData();
            console.log("---------> getSymbolNode 22222222 data = ",data);
        }
        for( let child of allSymbolUnits ){
            let compent = child.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
            let data = compent.getData();
            if ( data.posType == SymbolViewType.View && data.row == row ){
                symbolNode = child;
                symbolCompent = compent
                break;
            }
        }
        return symbolNode;
    }

    /*
        --[[
            创建信号块
            data:{ id = 1,pos = 1 }
            position:坐标
        ]]
    */

    private createSymbolNode( data:any,position:Vec3 ):Node|null {
        assert( data != null," !! createSymbolNode data 不能为null !! " );
        assert( position != null," !! createSymbolNode position 不能为null !! " );

        const symbol_node = new Node();
        this.m_rootNode.addChild( symbol_node );
        // 添加组件
        let compent = symbol_node.addComponent(this.m_levelConfig.BundleName +"_Symbol_Ctrl") as BaseSymbolUnit;
        // 设置坐标
        symbol_node.position = position;
        // 初始化
        compent.initUI( data,this );

        return symbol_node
    }

    // 归还信号块
    private removeSymbolNode( symbolNode:Node ) {
        assert( symbolNode != null," !! symbolNode 不能为null !! " );

        let compent = symbolNode.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as BaseSymbolUnit;
        let meta = compent.getMetaData();
        // 放回缓存池
        if ( meta != null ){
            SymbolMgr.Instance.resetSymbolNodeUnUsed( meta );
        }

        symbolNode.removeFromParent();
        symbolNode.destroy();
    }

    // -- 根据盘面数据生成 bottom View top 这三份数据
    private convertViewSymbolData( viewSymbolData:number[] ):any{
        // -- 构造要创建信号块的数据 <有大信号块需要补齐>
        let bottomList:number[] = this.buildBottomSymbol(viewSymbolData);
        let viewList:number[] = viewSymbolData;
        let topList:number[] = this.buildTopSymbol( viewSymbolData );

        let resultList:number[] = [];
        if (bottomList.length > 0){
            for( const v of bottomList){
                resultList.push( v );
            }
        }

        for( const v of viewList){
            resultList.push( v );
        }

        if (topList.length > 0){
            for( const v of topList){
                resultList.push( v );
            }
        }

        let resultData = this.convertRollList( resultList )

        let bottomData:any[] = [];
        let curIndex = 0;
        for( let i = 0;i < bottomList.length; i++ ){
            let meta:any = {};
            meta.id = resultData[i].id;
            meta.pos = resultData[i].pos;
            meta.col = this.m_reelUnitIndex;
            meta.row = i;
            meta.posType = SymbolViewType.Bottom;
            bottomData.push( meta );
            curIndex = curIndex + 1;
        }

        let viewData:any[] = [];
        let startIndex = curIndex;
        for( let i = 0;i < this.m_viewCount; i++ ){
            let meta:any = {};
            meta.id = resultData[ startIndex + i ].id;
            meta.pos = resultData[startIndex + i ].pos;
            meta.col = this.m_reelUnitIndex;
            meta.row = i;
            meta.posType = SymbolViewType.View;
            viewData.push( meta );
            curIndex = curIndex + 1
        }

        let topData:any[] = [];
        startIndex = curIndex;
        for( let i = 0;i < topList.length; i++ ){
            let meta:any = {};
            meta.id = resultData[ startIndex + i ].id;
            meta.pos = resultData[startIndex + i ].pos;
            meta.col = this.m_reelUnitIndex;
            meta.row = i;
            meta.posType = SymbolViewType.Top;
            topData.push( meta );
            curIndex = curIndex + 1
        }

        let finalData:any = {};
        finalData.bottomData = bottomData;
        finalData.viewData = viewData;
        finalData.topData = topData;
        return finalData
    }

    // 根据现实区域的信号快补齐底部
    private buildBottomSymbol( viewSymbolData:number[] ):number[]{
        let bottomList:number[] = [];
        let viewSize = this.m_bigSize;
        let firstSymbolId = viewSymbolData[0];
        let sizeType = this.getSymbolSize(firstSymbolId);
        if (sizeType == 1){
            // 这种情况不需要补齐
            return bottomList
        }else {
            // -- 大信好块
            // -- 根据显示区域的个数来补齐 注意必须是连续
            let posCount = 0;
            for (let i = 0; i < viewSize; i++) {
                if (viewSymbolData[i] == firstSymbolId){
                    posCount = posCount + 1;
                }else {
                    break;
                }
            }
            if( posCount >= sizeType ){
                // -- 这种情况不需要补齐
                return bottomList
            }else {
                // -- 补充为当前的大信号块
                let needCount = sizeType - posCount;
                for(let i = 0;i < needCount;i++){
                    bottomList.push(firstSymbolId);
                }
            }
        }
        return bottomList
    }

    // 根据现实区域的信号快补齐顶部
    private buildTopSymbol( viewSymbolData:number[] ):number[]{
        let topList:number[] = [];
        let viewSize = this.m_bigSize;
        let firstSymbolId = viewSymbolData[viewSize-1];
        let sizeType = this.getSymbolSize(firstSymbolId);
        if (sizeType == 1){
            // -- 这种情况随机获得一个信号块来补齐
            let id = this.getBuQiSymbolId();
            let buQiSizeType = this.getSymbolSize(id);
            for (let i = 0; i < buQiSizeType; i++) {
                topList.push( id );
            }
            return topList;
        }else{
            // -- 大信号块
            // -- 根据显示区域的个数来补齐 注意必须是连续
            let posCount = 0;
            for (let i = viewSize - 1; i >= 0; i--) {
                if( viewSymbolData[i] == firstSymbolId ){
                    posCount = posCount + 1;
                }else{
                    break;
                }
            }
            if (posCount >= sizeType){
                // -- 这种情况随机获得一个信号块来补齐
                let id = this.getBuQiSymbolId();
                let buQiSizeType = this.getSymbolSize(id);
                for (let i = 0; i < buQiSizeType; i++) {
                    topList.push( id );
                }
            }else{
                // -- 补充为当前的大信号块
                let needCount = sizeType - posCount
                for (let i = 0; i < needCount; i++) {
                    topList.push( firstSymbolId );
                }
            }
        }
        return topList;
    }

    // -- 随机获得一个信号块来补齐
    private getBuQiSymbolId():number{
        let index = Math.floor(math.randomRange(0,this.m_rollData.length));
        let symbolId = this.m_rollData[index].id;
        return symbolId;
    }

    /*
    -- 校验滚动列表数据  --
    --[[
        tRollList 数据为策划同学填表 类型为  { 1,2,3,4,5,6,1000,1000,1000,1}
        经过分析后  转换为程序使用的表格 类型为 { {1,1},{2,1},{3,1},{4,1},{5,1},{6,1},{1000,1},{1000,2},{1000,3},{1,1} }
        第一个是id 第二个是位置 大于1的不显示 (大于1表示大信号快)
    ]]*/
    private convertRollList( tRollList:number[] ):RollMeta[]{
        assert( tRollList !== null," !! tRollList is null !! " );
        assert( tRollList.length > 0," !! tRollList is null !! " );
        let symbolList:RollMeta[] = [];
        let nCurSymbol = -1
        let nPreSymbol = -1
        let nSameIndex = 1
        for (let i = 0; i < tRollList.length; i++) {
            nCurSymbol = tRollList[i];
            let nSymSize = this.getSymbolSize(nCurSymbol);
            // -- 小块不做处理  --
            if (nSymSize == 1){
                nSameIndex = 1
            }
            else{
                // -- 校验信号块  --
                if( nCurSymbol !== nPreSymbol ){
                    nSameIndex = 1;
                }
                else {
                    nSameIndex = nSameIndex + 1;
                    // -- 判断占位块  --
                    if( nSameIndex > nSymSize ){
                        nSameIndex = 1;
                    }
                }
            }
            //-- 赋值  --
            let meta:RollMeta = new RollMeta();
            meta.id = nCurSymbol;
            meta.pos = nSameIndex;
            symbolList.push( meta );
            nPreSymbol = nCurSymbol;
        }
        return symbolList
    }

    // -- 判断大图标  --
    private getSymbolSize(symbolID:number):number {
        let sizeType = this.m_levelConfig.SymbolSize[symbolID.toString()]
        assert( sizeType != null," !! error 这个id在表里没有配置 sizeType !! id = " + symbolID );
        return sizeType
    }

    public setAllowRoll( value:boolean ):void{
        this.m_allowRoll = value
    }

    // 开始滚动
    public startRoll():void {
        // 禁止状态 不能滚动
        if( this.m_allowRoll == false ){
            return
        }
        // 判断状态
        if ( this.m_rollStatus != RollStatus.Idle ){
            return
        }
        // 设置标志 开始滚动
        this.m_canRollMark = true;
    }

    // 停止滚动
    public stopRoll( viewSymbolData:number[],isQuickStop:boolean ){
        assert( viewSymbolData != null ," !! viewSymbolData is null !! " );
        assert( viewSymbolData.length == this.m_viewCount," !! 滚轴的信号块数量不对 !! " );
        // -- 禁止状态 不处理
        if ( this.m_allowRoll == false ){
            this.m_reelTableCompent.oneReelUnitStopDone( this.m_reelUnitIndex )
            return;
        }

        if ( this.onRolling() == false ){
            return;
        }

        // -- 轮盘数据的数据指针
        this.m_destPointer = 0;
        // 快停的标志
        this.m_isQuickStop = isQuickStop;
        // 设置停止的标志
        this.m_stopMark = true;

        // -- 根据盘面数据重新格式化数据
        let finalData:any = this.convertViewSymbolData(viewSymbolData);
        let bottomData:any = finalData.bottomData;
        let viewData:any = finalData.viewData;
        let topData:any = finalData.topData;

        this.m_destSymbolData = [];  //-- 构造最终盘面停止的数据
        // bottom
        if ( bottomData.length > 0 ){
            for( const meta of bottomData ){
                this.m_destSymbolData.push( meta );
            }
        }
        // view 
        for( const meta of viewData ){
            this.m_destSymbolData.push( meta );
        }
        // top 
        if ( topData.length > 0 ){
            for( const meta of topData ){
                this.m_destSymbolData.push( meta );
            }
        }
    }

    public onRolling():boolean {
        return this.m_rollStatus != RollStatus.Idle 
    }

    onDisable() {
        // 移除信号块
        let allSymbolUnits = this.m_rootNode.children;
        for (let i = 0; i < allSymbolUnits.length; i++) {
            const symbolNode = allSymbolUnits[i];
            this.removeSymbolNode( symbolNode );
        }

        this.clearState();
        super.onDisable();
    }

    onDestroy(){
        this.clearState();
        super.onDestroy();
    }
    
}


