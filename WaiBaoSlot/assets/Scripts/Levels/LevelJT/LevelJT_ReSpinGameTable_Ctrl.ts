import { _decorator, Component, Node,instantiate, Prefab, tween, sp, Vec3, Skeleton } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelJT_ReSpinJackpot_Ctrl } from './LevelJT_ReSpinJackpot_Ctrl';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { UICtrl, UILayer, UIMgr } from '../../Mgr/UIMgr';
import { LevelJT_ReSpinNum_Ctrl } from './LevelJT_ReSpinNum_Ctrl';
import { LevelJT_ReSpinWinNum_Ctrl } from './LevelJT_ReSpinWinNum_Ctrl';
import { BigWin_P_Ctrl } from '../../Views/BigWin_P_Ctrl';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelJT_ReSpinWinCtrl } from './LevelJT_ReSpinWinCtrl';
import { LevelJT_MainUI_Ctrl } from './LevelJT_MainUI_Ctrl';
import { BaseMutilReelUnit } from '../../GameBase/BaseMutilReelUnit';
import { LevelJT_ReSpinReelTable_Ctrl } from './LevelJT_ReSpinReelTable_Ctrl';
import { LevelJT_Symbol_Ctrl } from './LevelJT_Symbol_Ctrl';

@ccclass('LevelJT_ReSpinGameTable_Ctrl')
export class LevelJT_ReSpinGameTable_Ctrl extends BaseGameTable {

    public m_respinNumCtrl:LevelJT_ReSpinNum_Ctrl = null;
    public m_reSpinNumNode:Node = null;
    public m_reSpinWinNumCtrl:LevelJT_ReSpinWinNum_Ctrl = null;
    public m_reSpinJackpot:LevelJT_ReSpinJackpot_Ctrl = null;
    public m_storedIcons;
    public m_gameMainCompent:LevelJT_MainUI_Ctrl = null; // GameMain的组件指针
    public m_reSpinWinCtrl:LevelJT_ReSpinWinCtrl = null;

    protected initView(): void {
        super.initView();
        this.synStoredIcons();
    }
    public synStoredIcons(){
        let storedIcons = LevelMgr.Instance.getLevelModel().getStoredIcons();
        this.m_storedIcons = storedIcons[0];
    }

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public createOtherUI():void{
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/ReSpinJockpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelJT_ReSpinJackpot_Ctrl = jackpot.addComponent( LevelJT_ReSpinJackpot_Ctrl ) as LevelJT_ReSpinJackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
            this.m_reSpinJackpot = compent
        }

        let prefab1 = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/ReSpinNum",Prefab);
        if(prefab1){
            let reSpinNum = instantiate(prefab1);
            this.view["NodeReNum"].addChild(reSpinNum);
            const compent:LevelJT_ReSpinNum_Ctrl = reSpinNum.addComponent( LevelJT_ReSpinNum_Ctrl ) as LevelJT_ReSpinNum_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
            this.m_respinNumCtrl = compent;
            this.m_reSpinNumNode = reSpinNum;
        }else {
            console.error("====== > 没有找到预制资源：",this.m_abName,"Prefabs/ReSpinNum");
        }
    }

    public startRoll():void{
        super.startRoll();
        // this.m_respinNumCtrl.startRollSetNumScale();
        this.m_respinNumCtrl.subNum();
    }
    public stopRoll( isQuickStop:boolean ):void{
        super.stopRoll(isQuickStop);
        if (this.m_reSpinJackpot){
            this.m_reSpinJackpot.resetJackpotTitle();
        }
    }

    public initLogicFunc() {
        this.m_ListFunc.push( this.addCollectNum.bind(this) ); // -- 增加收集数
        this.m_ListFunc.push( this.resetCollectNum.bind(this) ); // -- 重置收集数量
        this.m_ListFunc.push( this.checkCollectJinOrGreen.bind(this) ); // -- 金色绿色收集表现
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示所有bonus
        this.m_ListFunc.push( this.showReSpinOverLayer.bind(this) );  // -- 显示结算界面
        this.m_ListFunc.push( this.showBigWin.bind(this) );     // -- 显示大赢
        this.m_ListFunc.push( this.enterOtherGame.bind(this) );     // -- 触发normal
    }
    public addCollectNum(){
        let reelData = LevelMgr.Instance.getLevelModel().getSpinReelData();
        let bonusIndex:number = 0;
        let flagShow = false
        let showAddSymbol = false;
        for (let i = 0; i < reelData.length; i++){
            let table = reelData[i]
            for (let j = 0;j < table.length; j++){
                let reel = table[j]
                for (let k = 0;k < reel.length; k++){
                    if (reel[k] == 100){
                        showAddSymbol = true;
                        // 增加次数
                        let symble = this.getSymbolNode(0,j,k);
                        let compent = symble.getComponent(LevelJT_Symbol_Ctrl);
                        compent.playSymbolAction("Game4-spin",false,()=>{
                            if (!flagShow){
                                flagShow = true;
                                // this.m_respinNumCtrl.addNum(1);
                                this.m_respinNumCtrl.showReSpinNum();
                                this.excuteListFunc();
                            }
                        })
                        let soundFile = this.m_levelConfig.SoundsFile["ReSpinAddNum"];
                        if (soundFile){
                            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                        }
                    }
                }
            }
        }
        if (!showAddSymbol){
            this.excuteListFunc();
        }
    }
    public resetCollectNum(){
        this.resetJackpotTitle()
        this.excuteListFunc();
    }
    public resetJackpotTitle(){
        if (this.m_reSpinJackpot){
            this.m_reSpinJackpot.resetJackpotTitle();
        }
    }

    public checkCollectJinOrGreen(){
        let action = LevelMgr.Instance.getLevelModel().getAction();
        if (action != 'RESPIN'){
            // 下一步
            this.excuteListFunc();
            return
        }
        let storedIcons = LevelMgr.Instance.getLevelModel().getStoredIcons();
        let newJinBonusData = []; // 新的金bonus
        let newGreenBounsData = []; // 新的绿bonus
        for (let i = 0; i < storedIcons[0].length; i++){
            let storedIcon = storedIcons[0][i];
            let has = false;
            for (let j = 0;j < this.m_storedIcons.length; j++){
                if( storedIcon.row == this.m_storedIcons[j].row && storedIcon.col == this.m_storedIcons[j].col){
                    has = true;
                }
            }
            if (!has){
                let symbolId = LevelMgr.Instance.getLevelModel().getSymbolId( 0,storedIcon.col,storedIcon.row);
                if (symbolId == 95){
                    newJinBonusData.push(storedIcon)
                }else if (symbolId == 96){
                    newGreenBounsData.push(storedIcon)
                }
            }
        }
        // 收集金bonus
        this.collectJinOrGreenBonus(0,newJinBonusData,0,()=>{
            // 收集绿bonus
            this.synStoredIcons();
            this.resetGoldenCollectLb();
            this.collectJinOrGreenBonus(0,newGreenBounsData,0,()=>{
                this.excuteListFunc();
                this.resetGreenCollectLb();
            },"green")
        },"gold")

        // this.excuteListFunc();
    }
    public collectJinOrGreenBonus(newIndex:number, newData:any[],index:number, callBack:Function,color:string = "gold"){
        if (newIndex >= newData.length){
            if (callBack){
                callBack()
            }
            return;
        }
        let data = newData[newIndex];
        let oriData = this.m_storedIcons[index];
        index++;
        if (index >= this.m_storedIcons.length){
            newIndex++;
        }
        this.m_gameMainCompent.reSpinBonusFlyAction(oriData.Multiple,oriData.col,oriData.row,data.col,data.row,()=>{
            this.collectJinOrGreenBonus(newIndex,newData,index,callBack)
        },index,color)
    }

    // 显示连线
    public slotLineAction() {
        // 显示ReSpin次数
        this.m_respinNumCtrl.showReSpinNum();

        this.excuteListFunc();
    }

    // 显示赢钱和大赢
    public showAmountWin() {
        // 针对respin 这个方法播放收集动画
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.RESPIN && nextAction == ActionType.NORMAL) {
            // 移除显示respin次数的节点
            this.m_reSpinNumNode.destroy();

            // 执行动画
            const anims: Array<ReturnType<typeof tween>> = [];
            
            anims.push(
                tween(this.node).call(()=>{
                    let storeIcons = LevelMgr.Instance.getLevelModel().getStoredIcons();
                    let storeData = storeIcons[0];
                    for( const value of storeData ){
                        let symbolNode = this.getSymbolNode(0,value.col,value.row);
                        if (symbolNode){
                            let startSymbolId = LevelMgr.Instance.getLevelModel().getSymbolId( 0,value.col,value.row);
                            let stopActionName = this.m_levelConfig.SymbolStopAction[startSymbolId.toString()];
                            symbolNode.getComponent(LevelJT_Symbol_Ctrl).playSymbolAction(stopActionName,false,null);
                        }
                    }
                })
            );
            anims.push(
                tween(this.node).delay(1)
            );
            anims.push(
                tween(this.node).call(()=>{
                    this.excuteListFunc();
                })
            );
            tween(this.node).sequence(...anims).start();
        }
        else {
            this.excuteListFunc();
        }
    }
    public showReSpinOverLayer() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.RESPIN && nextAction == ActionType.NORMAL) {
            // 显示freespin结束的界面
            const anims: Array<ReturnType<typeof tween>> = [];
            
            anims.push(
                tween(this.node).delay(0.5)
            );
            anims.push(
                tween(this.node).call(()=>{
                    // -- 音效
                    let winCount = LevelMgr.Instance.getLevelModel().getWinAmount();
                    let soundFile = this.m_levelConfig.SoundsFile["Congrats"];
                    if (soundFile && winCount > 0){
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    }
                    // 显示freespin界面
                    // this.m_reSpinWinCtrl = UIMgr.Instance.showUi("LevelJT","Prefabs/ReSpinWinView","LevelJT_ReSpinWinCtrl",UILayer.Normal) as LevelJT_ReSpinWinCtrl;
                    // this.m_reSpinWinCtrl.initUI(this.m_levelConfig);

                    let prefab = ResMgr.Instance.getAsset("LevelJT","Prefabs/ReSpinWinView",Prefab);
                    if(prefab){
                        let freeWinNode = instantiate(prefab);
                        this.node.addChild(freeWinNode);
                        this.m_reSpinWinCtrl = freeWinNode.addComponent( LevelJT_ReSpinWinCtrl ) as LevelJT_ReSpinWinCtrl;
                        // 初始化组件
                        this.m_reSpinWinCtrl.initUI( this.m_levelConfig );
                    }
                })
            );
            anims.push(
                tween(this.node).delay(2)
            );
            anims.push(
                tween(this.node).call(()=>{
                    // // 关闭freespin界面
                    // UIMgr.Instance.closeUi("LevelJT_ReSpinWinCtrl");
                    // // 播放音效
                    // let soundFile = this.m_levelConfig.SoundsFile["FreeSpinOver"];
                    // if (soundFile){
                    //     SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    // }
                    this.excuteListFunc();
                })
            );
            tween(this.node).sequence(...anims).start();
        }else {
            this.excuteListFunc();
        }
    }

    public liZiFlyAction( startWorldPos:Vec3,multiple:number ){
        // 播放音效
        let soundFile = this.m_levelConfig.SoundsFile["LiziFly"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
        // 目标点位置
        let destPos:Vec3 = this.view["NodeReWinNode"].position;
        let startPos = new Vec3();
        this.node.inverseTransformPoint(startPos,startWorldPos);
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/TuoWeiLiZi",Prefab);
        if(prefab){
            let liziNode = instantiate(prefab);
            this.node.addChild( liziNode );
            liziNode.position = startPos;
            tween(liziNode)
                .to(1,{ position:destPos })
                .call(()=>{
                    this.m_reSpinWinNumCtrl.setWinNum( multiple );
                    liziNode.destroy()
                })
                .start()
        }
    }

    // 显示大赢
    public showBigWin() {
        // -- 发送消息 bottom显示赢钱
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        const bet = LevelMgr.Instance.getLevelModel().getBet();
        let diffNum = winNum
        let multiple = diffNum / bet;
        // 设置
        if ( multiple >= 20 ){
            // 显示大赢
            this.showBigOrMagaWin( diffNum );
        }else {
            // -- 发送消息 bottom显示赢钱
            GlEventMgr.Instance.emit(EventName.ShowAmount);
            this.excuteListFunc();
        }
    }

    // 重写基类 显示bigWin
    public showBigOrMagaWin(diffNum: number):void{
        // 播放音效
        // 音效
        let soundFile = this.m_levelConfig.SoundsFile["FreeSpinWin"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
        // 播放动画
        // this.view["SpOverMoney"].active = true;
        // 发送消息 金币滚动
        GlEventMgr.Instance.emit( EventName.StartAmountScroll,0,diffNum,15 );
        // 发送消息增长进度条
        GlEventMgr.Instance.emit( EventName.StartProgressBarAnim, 0, 1, 15,"ExeListFunc" );

        // 执行 this.excuteListFunc(); 的下一步 需要等待点击btn_stop按钮
        this.m_bigWinMark = true;
    }
    

    public enterOtherGame() {
        if (this.m_reSpinWinCtrl && this.m_reSpinWinCtrl.node){
            this.m_reSpinWinCtrl.node.removeFromParent();
            this.m_reSpinWinCtrl.node.destroy();
            this.m_reSpinWinCtrl = null;
        }
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.RESPIN && nextAction == ActionType.NORMAL) {
            // GlEventMgr.Instance.emit(EventName.ShowAmount);
            GlEventMgr.Instance.emit(EventName.StopProgressBarAnim);
            // 发送消息 有些轮盘需要停止大赢动画
            GlEventMgr.Instance.emit(EventName.StopBigWinAction);

            this.m_gameMainCompent.enterNormal();
        }else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        }
    }

    public getSymbolNode(tableNum: number, endCol: number, endRow: number) {
        let tableCompent = this.m_reelTableCompent[tableNum]
        let reelUnitCompent = tableCompent.getReelUnitCompent( endCol )
        if (reelUnitCompent instanceof BaseMutilReelUnit){
            let symbolNode = reelUnitCompent.getReelUnitCompent(endRow).getSymbolNode( 0 )
            return symbolNode
        }
        return null
    }

    // bonus的信号块播放数字动画
    public playBonusNumAction( addMult:number,col:number,row:number,id:number ):void{
        (this.getReelTableCompent(0) as LevelJT_ReSpinReelTable_Ctrl).playBonusNumAction(addMult,col,row,id);
    }

    public resetGoldenCollectLb(){
        this.m_reSpinJackpot.resetGoldenCollectLb();
    }
    public resetGreenCollectLb(){
        this.m_reSpinJackpot.resetGreenCollectLb();
    }

}


