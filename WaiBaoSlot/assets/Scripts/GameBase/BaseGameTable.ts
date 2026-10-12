import { _decorator, Component, Node,instantiate,Prefab,assert,Vec3 } from 'cc';
import { UIMgr,UICtrl } from '../Mgr/UIMgr';
import { ResMgr } from '../Mgr/ResMgr';
import { EventName } from '../Mgr/EventName';
import { GlEventMgr } from '../Mgr/GlEventMgr';
import { BaseReelTable } from './BaseReelTable';
import { LevelConfig,GameTableConfig, ActionType } from '../InterFace/LevelConfig';
import { LevelMgr } from '../Mgr/LevelMgr';
import { SoundMgr } from '../Mgr/SoundMgr';
import { BaseGameMain } from './BaseGameMain';
import { BigWin_P_Ctrl } from '../Views/BigWin_P_Ctrl';
import { UILayer } from '../Mgr/UIMgr';
import { Utils } from '../Util/Utils';

const { ccclass, property } = _decorator;

@ccclass('BaseGameTable')
export class BaseGameTable extends UICtrl {
    public m_bigWinMark:boolean = false; // 是否正在显示大赢
    public m_abName:string = "";
    public m_levelConfig:LevelConfig = null;
    public m_gameTableConfig:GameTableConfig = null;
    public m_reelTableCount:number = 0; //l轮盘的数量
    public m_stopDoneNum:number = 0;
    public m_gameMainCompent:BaseGameMain = null; // GameMain的组件指针

    // 定义函数队列：数组存储待执行的函数（无参/有参通用，推荐传参用对象）
    public m_ListFunc: Array<(params?: any) => void> = [];
    public m_executeListFunc: Array<(params?: any) => void> = [];

    public m_reelTableNodes:Array<Node> = []; //轮盘组的节点指针
    public m_reelTableCompent:BaseReelTable[] = [];// 轮盘组件的指针

    public m_startRollMark:boolean = false;
    public m_stopRollMark:boolean = false;

    protected initView(): void {
        // 收到消息 执行函数队列
        GlEventMgr.Instance.on(EventName.ExcuteSlotFunction, this.excuteListFunc, this);
    }

    start() {
    }

    update(deltaTime: number) {
        
    }

    // -------------- 子类可能需要重写的接口 -------------------- //
    // 子类从写 函数队列
    public initLogicFunc():void{

    }

    // 子类从写 创建轮盘的其他Node
    public createOtherUI():void{

    }

    // wild信号快的飞行动画
    public wildFlyAction( col:number,row:number ):void {

    }

    // bonus的飞行动画
    public bonusFlyAction( col:number,row:number ){
       
    }

    // -------------- 子类可能需要重写的接口 -------------------- //

    public initUI( levelConfig:LevelConfig,gameTableConfig:GameTableConfig,gameMainCompent:BaseGameMain ):void{
        this.m_levelConfig = levelConfig;
        this.m_gameTableConfig = gameTableConfig;
        this.m_abName = this.m_levelConfig.BundleName
        this.m_reelTableCount = gameTableConfig.ReelTables.length;
        this.m_stopDoneNum = 0;
        this.m_gameMainCompent = gameMainCompent; // GameMain的组件指针
        this.m_reelTableCompent = [];// 轮盘组件的指针

        this.initLogicFunc(); //这是子类需要重写 重新定义 self.m_ListFunc

        // 创建轮盘组
        this.createReelTables()
        // 创建轮盘的其他Node
        this.createOtherUI()
    }

    public getReelTableCompent( reelTableIndex:number ):BaseReelTable {
        assert( reelTableIndex != null," !! reelTableIndex is null !! ");
        assert( this.m_reelTableCompent[reelTableIndex] != null," !! 轮盘组件为null !! ");
        return this.m_reelTableCompent[reelTableIndex];
    }

    // 创建轮盘组
    public createReelTables():void{
        for (let i = 0; i < this.m_reelTableCount; i++) {
            // 创建轮盘的预制体
            let reelTableName = this.m_gameTableConfig.ReelTables[i];
            let reelTableConfig = this.m_levelConfig.ReelTable[reelTableName];
            let prefab = ResMgr.Instance.getAsset(this.m_abName,reelTableConfig.Prefabs,Prefab);
            if(prefab){
                let reel_table_ui = instantiate(prefab);
                this.view["NodeReelTable"+i].addChild(reel_table_ui);
                const compent:BaseReelTable = reel_table_ui.addComponent( reelTableConfig.Compent ) as BaseReelTable;
                this.m_reelTableNodes[i] = reel_table_ui;
                // 初始化组件
                compent.initUI( this.m_levelConfig,reelTableConfig,i,this );
                // 存入轮盘指针
                this.m_reelTableCompent.push( compent );
            }
        }
    }

    // 根据数据显示轮盘上的信号块
    public loadGameTableUI( viewSymbolData:any ):void{
        for (let i = 0; i < this.m_reelTableCount; i++){
            const compent = this.getReelTableCompent( i );
            compent.loadReelUnitsUI( viewSymbolData[i] );
        }
    }

    // 轮盘滚动
    public startRoll():void{
        if (this.m_startRollMark){
            assert(false,"error 不知道从哪里点击过来了");
            return;
        }
        this.m_startRollMark = true;
        // 清空赢钱金币
        let action = LevelMgr.Instance.getLevelModel().getAction();
        if ( action == ActionType.NORMAL ){
            GlEventMgr.Instance.emit(EventName.ClearWinAmount);
        }
        for (let i = 0; i < this.m_reelTableCount; i++){
            const compent:BaseReelTable = this.getReelTableCompent( i );
            compent.startRoll();
        }
    }

    // 轮盘停止滚动
    public stopRoll( isQuickStop:boolean ):void{
        if ( this.m_stopRollMark ){
            assert(false,"error 不知道从哪里点击过来了");
            return;
        }
        this.m_stopRollMark = true;
        let reelsData = LevelMgr.Instance.getLevelModel().getSpinReelData();
        
        assert( reelsData != null ," !! reelsData is nil !! " );
        assert( reelsData.length == this.m_reelTableCount," !! 服务器返回的数据与当前轮盘个数对应不上 !! " );
        for (let i = 0; i < this.m_reelTableCount; i++){
            const compent:BaseReelTable = this.getReelTableCompent( i );
            compent.stopRoll( reelsData[i],isQuickStop );
        }
    }
    
    // 某个轮盘停止完毕
    public oneReelTableStopDone():void{
        this.m_stopDoneNum = this.m_stopDoneNum + 1;
        if ( this.m_stopDoneNum >= this.m_reelTableCount ) {
            // -- 当前所有轮盘停止完毕 
            this.m_startRollMark = false;
            this.m_stopDoneNum = 0;
            this.m_stopRollMark = false;
            // -- 所有轮盘停止完毕 子类重写
            this.allReelTableStopDone()
        }
    }

    // 所有轮盘停止完 开始执行逻辑队列
    public allReelTableStopDone():void{
        this.m_executeListFunc = Array.from( this.m_ListFunc );
        // 开始执行函数队列
        this.excuteListFunc();
    }

    // 执行 函数队列
    public excuteListFunc():void{
        if ( this.m_executeListFunc.length == 0 ){
            return;
        }
        const currentFn = this.m_executeListFunc.shift();
        // 执行
        currentFn && currentFn();
    }

    // -- 播放当前所有轮盘的连线动画
    public playGameTableLineAction():void {
        let lines = LevelMgr.Instance.getLevelModel().getLines();
        if ( lines != null && lines.length > 0 ) {
            // 播放音效
            let length = this.m_levelConfig.SoundsLineFile.length;
            let index = Utils.randomInt(1,length) - 1;
            let soundFile = this.m_levelConfig.SoundsLineFile[index];
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );

            // 播放每个轮盘的连线
            for( let i = 0; i < lines.length; i++ ){
                const compent:BaseReelTable = this.getReelTableCompent( i );
                compent.playLineAction( lines[i] );
            }
        }
    }

    // 停止播放动画
    public stopGameTableLineAction():void{
        for( let i = 0; i < this.m_reelTableCount; i++ ){
            const compent:BaseReelTable = this.getReelTableCompent( i );
            compent.stopSymbolLineAction();
        }
    }

    // 播放轮盘上信号块的动画
    public playSymbolAction():void{

    }

    // 获取信号块的世界坐标
    public getSymbolWorldPos( reelTableIndex:number,col:number,row:number ):Vec3{
        const compent:BaseReelTable = this.getReelTableCompent( reelTableIndex );
        return compent.getSymbolWorldPos( col,row );
    }

    // 获取bonus信号快的坐标
    public getBonusSymbolWorldPos( reelTableIndex:number ):Vec3[]{
        let posList:Vec3[] = [];
        let storeIcons = LevelMgr.Instance.getLevelModel().getStoredIcons();
        let storeData = storeIcons[reelTableIndex];
        for( const value of storeData ){
            let pos:Vec3 = this.getSymbolWorldPos( reelTableIndex,value.col,value.row );
            posList.push(pos);
        }
        return posList
    }

    // 从新设置一下信号块的世界坐标
    public resetViewSymbolWorldPos():void{

    }

    // 显示bigWin
    public showBigOrMagaWin( time:number,callBack:Function|null ):void{
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        const bet = LevelMgr.Instance.getLevelModel().getBet();
        let multiple = winNum / bet;
        if ( multiple >= 80 )
        {
            // 显示大赢
            let compent = UIMgr.Instance.showUi("GameMain","Prefabs/BigWin_P","BigWin_P_Ctrl",UILayer.Normal) as BigWin_P_Ctrl;
            compent.initUI();
            Utils.performWithDelay(this.node,()=>{
                UIMgr.Instance.closeUi("BigWin_P_Ctrl");
                if( callBack ){
                    callBack()
                }
            },3)
        }
        else 
        {
            if( callBack ){
                callBack()
            }
        }
    }

    onDisable() {
        super.onDisable();
    }

    onDestroy() {
        super.onDestroy();
    }
}


